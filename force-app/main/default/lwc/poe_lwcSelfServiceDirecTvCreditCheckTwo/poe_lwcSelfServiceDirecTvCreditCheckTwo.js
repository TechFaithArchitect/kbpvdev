import { LightningElement, api } from "lwc";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { NavigationMixin } from "lightning/navigation";
import myLib from "@salesforce/resourceUrl/forge";
import DTVHighRiskCustomer from "@salesforce/label/c.DTV_High_Risk_Customer";
import SMS_VERBIAGE from "@salesforce/label/c.POE_sms_verbiage";
import PHONE_DISCLAIMER from "@salesforce/label/c.POE_phone_disclaimer";
import PHONE_DISCLAIMER2 from "@salesforce/label/c.POE_phone_disclaimer2";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import capReachedError from "@salesforce/label/c.Order_Cap_Reached_Body";
import POE_DTV_Address_Regex_ErrorMessage from "@salesforce/label/c.POE_DTV_Address_Regex_ErrorMessage";
import POE_DTV_Address_Partial_Match_Modal_Message from "@salesforce/label/c.POE_DTV_Address_Partial_Match_Modal_Message";
import POE_DTV_Address_Partial_Match_Code_Description from "@salesforce/label/c.POE_DTV_Address_Partial_Match_Code_Description";
import BILLING_ADDRESS_SAME_AS_SERVICE_ADDRESS_FIELD from "@salesforce/label/c.Billing_Address_Same_As_Service_Address_Field";

import getSSNFraudRules from "@salesforce/apex/CreditCheckTabController.getSSNFraudRules";
import getDTVAddressRegExApex from "@salesforce/apex/InfoTabController.getDTVAddressRegEx";
import updateOpportunity from "@salesforce/apex/CreditCheckTabController.updateOpportunity";
import getAccountOnProbation from "@salesforce/apex/CreditCheckTabController.getAccountOnProbation";
import saveCreditFreeze from "@salesforce/apex/CreditCheckTabController.saveCreditFreeze";
import getOppSensitiveData from "@salesforce/apex/CreditCheckTabController.getOppSensitiveData";
import saveACICreditCheck from "@salesforce/apex/CreditCheckTabController.saveACICreditCheck";
import IPSaveOrderDTV from "@salesforce/apex/CreditCheckTabController.IPSaveOrderDTV";
import sendPCISMS from "@salesforce/apex/CreditCheckTabController.sendPCISMS";
import sendCreditCheckPciEmail from "@salesforce/apex/CreditCheckTabController.sendCreditCheckPciEmail";
import customerReachedCap from "@salesforce/apex/CreditCheckTabController.customerReachedCap";
import setSSNAgreement from "@salesforce/apex/CreditCheckTabController.setSSNAgreement";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import chuzo_modalGeneric from "c/chuzo_modalGeneric";
import doFeeModal from "c/chuzo_modalOneTimeNonRefoundable";
import predictiveAddressModal from "c/poe_lwcBuyflowPredictiveAddressModal";

const STATE_OPTIONS = [
    { label: "Alabama", value: "AL" },
    { label: "Alaska", value: "AK" },
    { label: "Arizona", value: "AZ" },
    { label: "Arkansas", value: "AR" },
    { label: "California", value: "CA" },
    { label: "Colorado", value: "CO" },
    { label: "Connecticut", value: "CT" },
    { label: "Delaware", value: "DE" },
    { label: "District of Columbia", value: "DC" },
    { label: "Florida", value: "FL" },
    { label: "Georgia", value: "GA" },
    { label: "Hawaii", value: "HI" },
    { label: "Idaho", value: "ID" },
    { label: "Illinois", value: "IL" },
    { label: "Indiana", value: "IN" },
    { label: "Iowa", value: "IA" },
    { label: "Kansas", value: "KS" },
    { label: "Kentucky", value: "KY" },
    { label: "Louisiana", value: "LA" },
    { label: "Maine", value: "ME" },
    { label: "Maryland", value: "MD" },
    { label: "Massachusetts", value: "MA" },
    { label: "Michigan", value: "MI" },
    { label: "Minnesota", value: "MN" },
    { label: "Mississippi", value: "MS" },
    { label: "Missouri", value: "MO" },
    { label: "Montana", value: "MT" },
    { label: "Nebraska", value: "NE" },
    { label: "Nevada", value: "NV" },
    { label: "New Hampshire", value: "NH" },
    { label: "New Jersey", value: "NJ" },
    { label: "New Mexico", value: "NM" },
    { label: "New York", value: "NY" },
    { label: "North Carolina", value: "NC" },
    { label: "North Dakota", value: "ND" },
    { label: "Ohio", value: "OH" },
    { label: "Oklahoma", value: "OK" },
    { label: "Oregon", value: "OR" },
    { label: "Pennsylvania", value: "PA" },
    { label: "Rhode Island", value: "RI" },
    { label: "South Carolina", value: "SC" },
    { label: "South Dakota", value: "SD" },
    { label: "Tennessee", value: "TN" },
    { label: "Texas", value: "TX" },
    { label: "Utah", value: "UT" },
    { label: "Vermont", value: "VT" },
    { label: "Virginia", value: "VA" },
    { label: "Washington", value: "WA" },
    { label: "West Virginia", value: "WV" },
    { label: "Wisconsin", value: "WI" },
    { label: "Wyoming", value: "WY" }
];
const AGE_ERROR_MESSAGE = "Must be over 18 years old";

export default class Poe_lwcSelfServiceDirecTvCreditCheckTwo extends LightningElement {
    @api orderInfo;
    @api contactInfo;
    @api isStream;
    @api cartInfo;
    @api recordId;
    @api isGuestUser;
    @api origin;
    @api returnUrl;
    @api referralCodeData;
    @api dealerOnProbation;
    @api accountId;
    @api billingInfo;
    @api order;
    @api verbiages;

    isLoading = false;
    stateOptions = STATE_OPTIONS;
    creditCheckMethodOptions = [
        { label: "SSN", value: "SSN" },
        { label: "Driver’s Licence Number", value: "DL" }
    ];
    creditCheckMethod = this.creditCheckMethodOptions[0].value;
    billingAddress = {};
    ccSSN;
    repeatSSN;
    ccDOB;
    ccDL;
    ccDLstate;
    ccDLexpDate;
    isPCI = true;
    billingAddressIsSameAsService = true;
    creditCheckAttempts = 0;
    publicKey;
    fraudLimit = 0;
    referenceNumber;
    paymentAttempts;
    encryptionKey;
    terms;
    onProbation = false;
    referralCodeData;
    creditScore;
    treatmentCode;
    validAddress = false;
    noAddressInformation = true;
    noCompleteInfo = true;
    noContactInformation = true;
    ssnValidation;
    isCallCenterOrigin = false;
    billingDetailsResponse;
    isPreviousAddress = false;
    agreementChecked = false;
    predictiveAddresses = [];
    fee;
    label = {
        DTVHighRiskCustomer
    };
    dtvAddressRegEx;
    pciInputOptions = [
        { label: "PCI Link", value: "PCI" },
        { label: "Manual", value: "Manual" }
    ];
    pciInputMethod = this.pciInputOptions[0].value;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        capReachedError,
        POE_DTV_Address_Regex_ErrorMessage,
        POE_DTV_Address_Partial_Match_Code_Description,
        BILLING_ADDRESS_SAME_AS_SERVICE_ADDRESS_FIELD
    };
    phoneDisclaimer = PHONE_DISCLAIMER;
    phoneDisclaimer2 = PHONE_DISCLAIMER2;
    hasOptedInSMS = false;
    isStatementRead = false;
    ageError = false;
    expDateError = false;
    sameSSN = false;
    partialMatchHardStop = [];

    get smsBtnClass() {
        return `${!this.hasOptedInSMS && "btn-disabled"} btn-rounded slds-max-medium-size_1-of-1`;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get isNotPCI() {
        return !this.isPCI;
    }

    get isNotCallCenterOrigin() {
        return !this.isCallCenterOrigin;
    }

    get isSSNCreditCheck() {
        return this.creditCheckMethod === "SSN";
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconFormCreditCard() {
        return chuzoSiteResources + "/images/icon-creditcard.svg";
    }

    get nextBtnDesktopClass() {
        return `${this.noCompleteInfo && "btn-disabled"} btn-rounded btn-center hide-mobile`;
    }

    get nextBtnMobileClass() {
        return `${this.noCompleteInfo && "btn-disabled"} btn-rounded btn-center`;
    }

    get displayCountry() {
        return this.billingAddressIsSameAsService ? this.billingAddress?.country || "United States" : "";
    }

    connectedCallback() {
        if (this.isGuestUser) {
            this.isPCI = false;
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.isLoading = true;
        this.partialMatchHardStop = [...this.labels.POE_DTV_Address_Partial_Match_Code_Description.split(",")];
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");

        this.isCallCenterOrigin = this.origin === "phonesales";
        if (this.billingAddressIsSameAsService) {
            this.billingAddress = { ...this.orderInfo.address };
        }

        const myData = {
            ContextId: this.recordId,
            partner: "directv"
        };
        console.log("get SSN Fraud Rules Request", myData);
        getSSNFraudRules({ myData })
            .then((response) => {
                console.log("get SSN Fraud Rules response", response);
                this.fraudLimit = response.result.limit;
                this.referenceNumber = response.result.refNum;
                this.paymentAttempts = response.result.attempts;
                this.encryptionKey = response.result.key;
                loadScript(this, myLib)
                    .then(() => {
                        const pki = forge.pki;
                        this.publicKey = pki.publicKeyFromPem(this.encryptionKey);
                    })
                    .catch((error) => {
                        console.error(error);
                        this.logError(error.body?.message || error.message);
                    });
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
                this.isLoading = false;
            });

        this.getDTVAddressRegEx();
    }

    handleBack() {
        const backEvent = new CustomEvent("back");
        this.dispatchEvent(backEvent);
    }

    handleChange(e) {
        const fieldName = e.currentTarget.dataset.fieldName;
        if (!fieldName) {
            return;
        }

        let deepestReference = this;
        fieldName.split(".").forEach((fieldNameItem, i, arr) => {
            if (i === arr.length - 1) {
                deepestReference[fieldNameItem] =
                    typeof e.detail.checked === "boolean" ? e.detail.checked : e.detail.value?.trim();
            } else {
                deepestReference = deepestReference[fieldNameItem];
            }
        });

        this.isPCI = !this.isGuestUser && this.pciInputOptions[0].value === this.pciInputMethod;

        this.handlePersonalInformation();
        this.disableValidations();
    }

    handleBillingAddressSameAsServiceChange(e) {
        this.billingAddressIsSameAsService = e.detail.checked;
        if (this.billingAddressIsSameAsService) {
            this.billingAddress = { ...this.orderInfo.address };
        } else {
            if (this.orderInfo.billingAddress) {
                this.billingAddress = { ...this.orderInfo.billingAddress };
            } else {
                this.billingAddress = {
                    addressLine1: "",
                    addressLine2: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: ""
                };
            }
        }

        this.handlePersonalInformation();
        this.disableValidations();
    }

    handleSSNRepeatValidation() {
        this.sameSSN = this.repeatSSN !== this.ccSSN;
    }

    getDTVAddressRegEx() {
        this.isLoading = true;
        getDTVAddressRegExApex()
            .then((response) => {
                this.dtvAddressRegEx = new RegExp(response.result.dtvAddressRegEx);
                this.handlePersonalInformation();
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    validateAddressInputs() {
        const zipRegex = /^\d{5}$/;
        const isValidAddress =
            this.dtvAddressRegEx.test(this.billingAddress?.addressLine1) &&
            this.dtvAddressRegEx.test(this.billingAddress?.addressLine2) &&
            this.dtvAddressRegEx.test(this.billingAddress?.city);

        const isValidZipCode =
            this.billingAddressIsSameAsService ||
            (!this.billingAddressIsSameAsService && zipRegex.test(this.billingAddress?.zipCode));
        if (!isValidAddress && !this.billingAddressIsSameAsService) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Invalid Address",
                    variant: "error",
                    mode: "sticky",
                    message: POE_DTV_Address_Regex_ErrorMessage
                })
            );
        }

        return isValidAddress && isValidZipCode;
    }

    handlePersonalInformation() {
        this.validAddress = this.validateAddressInputs();
    }

    updateOpp() {
        const myData = {
            Id: this.recordId,
            creditCheckLimitReached: true
        };

        updateOpportunity({ myData })
            .then((response) => {
                let status = response.result.status;
                if (!status) {
                    console.log(error);
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: response.result.error
                    });
                    this.dispatchEvent(event);
                    this.logError(error.body?.message || error.message);
                }
            })
            .catch((error) => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: error
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    getOnProbation() {
        if (this.isGuestUser) {
            this.onProbation = false;
            return null;
        }

        return getAccountOnProbation()
            .then((response) => {
                this.onProbation = response.result.onProbation;
            })
            .catch((error) => {
                this.isLoading = false;
                console.log(error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: error
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    saveCreditFreeze() {
        const myData = {
            ContextId: this.recordId
        };
        saveCreditFreeze({ myData })
            .then((response) => {
                console.log("save credit freeze response", response);
            })
            .catch((error) => {
                console.error("ERROR", error);
                const errorMessage = error.body?.message || error.message;
                this.logError(errorMessage);
            });
    }

    handleRefresh() {
        this.isLoading = true;
        let myData = {
            ContextId: this.recordId
        };
        getOppSensitiveData({ myData: myData })
            .then((response) => {
                let data = response.result !== undefined ? response.result : {};
                this.ccDOB = data.hasOwnProperty("ccDob") ? data.ccDob : undefined;
                this.ccSSN = data.ccSSN ? data.ccSSN : undefined;
                this.creditCheckMethod = this.creditCheckMethodOptions[0].value;
                if (!this.ccSSN) {
                    this.creditCheckMethod = this.creditCheckMethodOptions[1].value;
                    this.ccDL = data.hasOwnProperty("ccDriversLicenseNumber") ? data.ccDriversLicenseNumber : undefined;
                    this.ccDLexpDate = data.hasOwnProperty("ccDlExpirationDate") ? data.ccDlExpirationDate : undefined;
                    this.ccDLstate = data.hasOwnProperty("ccDlState") ? data.ccDlState : undefined;
                }
                this.disableValidations();
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    saveOrder(accountId, billingResult) {
        if (this.order !== undefined) {
            this.isLoading = true;
            let orderInfo = { ...this.orderInfo };
            orderInfo.billingAddress = {
                ...this.billingAddress,
                country: "USA"
            };
            let info = {
                orderInfo,
                customer: { ...this.getCustomerInfo() },
                referenceNumber: this.referenceNumber,
                orderId: this.order,
                cart: this.cartInfo,
                paymentAttempts: this.paymentAttempts,
                publicKey: this.publicKey,
                result: billingResult,
                treatmentCode: this.treatmentCode,
                payInFull: this.creditScore !== "LOW" && this.isStream
            };
            const sendBackEvent = new CustomEvent("next", {
                detail: info
            });
            this.dispatchEvent(sendBackEvent);
            this.isLoading = false;
        } else {
            this.isLoading = true;
            let repType;
            if (this.isGuestUser) {
                repType = "Self Service";
            } else {
                switch (this.origin) {
                    case "phonesales":
                        repType = "Phone Sales";
                        break;
                    case "retail":
                        repType = "Retail";
                        break;
                    case "event":
                        repType = "Event";
                        break;
                    case "maps":
                        repType = "Door To Door";
                        break;
                }
            }
            const json = {
                ContextId: this.recordId,
                AccountId: accountId,
                ProductName: this.orderInfo.product.Name,
                family: "DirecTV",
                isGuestUser: this.isGuestUser,
                consent: false,
                phone: this.contactInfo.phone,
                email: this.contactInfo.email,
                representative: repType,
                Pricebook: "Standard Price Book",
                timeStamp: new Date(),
                creditCheck: {
                    accountDetails: {
                        billingCreditCheckAddress: {
                            billingAddress: this.billingAddress.addressLine1,
                            billingAptNumber: this.billingAddress.adressLine2,
                            billingCity: this.billingAddress.city,
                            billingState: this.billingAddress.state,
                            billingZip: this.billingAddress.zipCode
                        },
                        shippingServiceAddresss: {
                            shippingAddress: this.orderInfo.address.addressLine1,
                            shippingAptNumber: this.orderInfo.address.hasOwnProperty("addressLine2")
                                ? this.orderInfo.address.addressLine2
                                : "",
                            shippingCity: this.orderInfo.address.city,
                            shippingZip: this.orderInfo.address.zipCode,
                            shippingState: this.orderInfo.address.state
                        }
                    }
                },
                creditScoreResult: this.creditScore,
                identification:
                    this.ssn !== undefined && this.ssn !== null && this.ssn !== ""
                        ? "Social Security Number"
                        : `Driver's License`
            };
            if (this.isGuestUser && this.referralCodeData) {
                json.referralCodeId = this.referralCodeData.Id || this.referralCodeData.referralCodeId;
            }
            console.log("Save Order Payload", json);
            IPSaveOrderDTV({ myData: json })
                .then((response) => {
                    console.log(response);
                    let orderInfo = { ...this.orderInfo };
                    orderInfo.billingAddress = {
                        ...this.billingAddress,
                        country: "USA"
                    };
                    let info = {
                        orderInfo,
                        customer: { ...this.getCustomerInfo() },
                        referenceNumber: this.referenceNumber,
                        orderId: response.result.Order.Id,
                        orderItemId: response.result.OrderItem.Id,
                        cart: this.cartInfo,
                        paymentAttempts: this.paymentAttempts,
                        publicKey: this.publicKey,
                        result: billingResult,
                        treatmentCode: this.treatmentCode,
                        payInFull: this.creditScore !== "LOW" && this.isStream
                    };

                    if (this.isGuestUser) {
                        const sendNextEvent = new CustomEvent("next", {
                            detail: info
                        });
                        this.dispatchEvent(sendNextEvent);
                        this.isLoading = false;
                    } else {
                        const myData = {
                            ContextId: this.recordId
                        };
                        saveACICreditCheck({ myData })
                            .then((response) => {
                                const sendNextEvent = new CustomEvent("next", {
                                    detail: info
                                });
                                this.dispatchEvent(sendNextEvent);
                            })
                            .catch((error) => {
                                console.error(error, "ERROR");
                                const event = new ShowToastEvent({
                                    title: "Error",
                                    variant: "error",
                                    mode: "sticky",
                                    message: "The order could not be created. Please try again."
                                });
                                this.dispatchEvent(event);
                                this.logError(error.body?.message || error.message);
                            })
                            .finally(() => {
                                this.isLoading = false;
                            });
                    }
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "The order could not be created. Please try again."
                    });
                    this.dispatchEvent(event);
                    this.isLoading = false;
                    this.logError(error.body?.message || error.message);
                });
        }
    }

    handleSMS() {
        if (!this.hasOptedInSMS) {
            return;
        }

        this.handleSSNValue();
        this.isLoading = true;
        const index = window.location.href.split("/s/");
        const mailBody = SMS_VERBIAGE + index[0] + "/s/pci-personal-info?c__ContextId=" + this.recordId;
        const myData = {
            clientPhone: "1" + this.contactInfo.phone,
            body: mailBody,
            opportunityId: this.recordId
        };
        sendPCISMS({ myData: myData })
            .then((response) => {
                let result = response.result;
                let tit = result.error === "OK" ? "Success" : "Error";
                let varnt = result.error === "OK" ? "success" : "error";
                let mess =
                    result.error === "OK"
                        ? "The SMS was sent correctly with a link to enter the personal information."
                        : "The SMS could not be sent. Please, verify the telephone number and try again.";
                const event = new ShowToastEvent({
                    title: tit,
                    variant: varnt,
                    message: mess
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The SMS could not be sent. Please, verify the telephone number and try again."
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleSSNValue() {
        this.isLoading = true;
        let myData = {
            ContextId: this.recordId,
            value: this.agreementChecked
        };
        setSSNAgreement({ myData: myData })
            .then((response) => {
                console.log("Set SSN Agreement response", response);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    sendPCIEmail() {
        this.handleSSNValue();
        const index = window.location.href.split("/s/");
        this.isLoading = true;
        const mailBody = index[0] + "/s/pci-personal-info?c__ContextId=" + this.recordId;
        const myData = {
            pciEmail: this.contactInfo.email,
            body: mailBody
        };
        sendCreditCheckPciEmail({ myData })
            .then(() => {
                const event = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    message: "The email was sent correctly with a link to enter the personal information."
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The email could not be sent. Please, verify the email address and try again."
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleNext() {
        this.isLoading = true;
        const data = {
            Email: this.contactInfo.email
        };

        console.log("Customer Cap Reached Request", data);
        customerReachedCap({ myData: data })
            .then((response) => {
                console.log("Customer Cap Reached response", response);
                let capReached = response.result.capReached;

                if (capReached) {
                    this.isLoading = false;
                    this.handleCapReachedModal();

                    this.logError(this.labels.capReachedError);
                } else {
                    if (this.creditCheckAttempts < 3) {
                        this.creditCheckAttempts = this.creditCheckAttempts + 1;
                    } else {
                        const event = new ShowToastEvent({
                            title: "Credit Check Limit",
                            variant: "error",
                            mode: "sticky",
                            message: "Maximum number of Credit Check attempts reached for this customer."
                        });
                        this.dispatchEvent(event);
                        this.paymentAttempts = this.creditCheckAttempts;
                        this.noCompleteInfo = true;
                        this.updateOpp();
                        this.isLoading = false;
                        return;
                    }
                    if (this.isStream) {
                        this.handleCreateUser();
                    } else {
                        this.callAddressValidate();
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.isLoading = false;
                const errMsg = error.body?.message || error.message;
                this.logError(errMsg);
            });
    }

    handleCreateUser() {
        this.isLoading = true;
        const path = "createUser";
        let myData = {
            path,
            partnerName: "enga-stream",
            systemCode: "ENGA-CHUZO",
            correlationId: this.orderInfo.correlationId,
            dealerCorpId: this.orderInfo.dealerCorpId,
            dealerId: this.orderInfo.dealerId,
            dealerAgentId: this.orderInfo.dealerAgentId,
            dealerLocation: this.orderInfo.dealerLocation,
            uuid: this.orderInfo.uuid,
            sid: this.orderInfo.sid,
            customer: {
                firstName: this.contactInfo.firstName,
                lastName: this.contactInfo.lastName,
                emailAddress: this.contactInfo.email,
                phoneNumber: this.contactInfo.phone
            }
        };
        console.log("Create User Stream Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Create User Stream Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.isLoading = false;
                } else {
                    if (result.content.status.toLowerCase() === "success") {
                        this.callAddressValidate();
                    } else {
                        const genericErrorMessage = "User couldn't be validated";
                        const event = new ShowToastEvent({
                            title: "Create User Error",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                        this.isLoading = false;
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.isLoading = false;
            });
    }

    callAddressValidate() {
        this.isLoading = true;
        const path = "addressValidate";
        let requestInfo = { ...this.orderInfo };
        delete requestInfo.address;
        const myData = {
            path,
            address: {
                addressLine1: this.billingAddress.addressLine1,
                addressLine2: this.billingAddress.adressLine2,
                city: this.billingAddress.city,
                state: this.billingAddress.state,
                country: "US",
                zipCode: this.billingAddress.zipCode
            },
            addressType: "billing",
            urbanizationCode: "",
            attention: "",
            ...requestInfo,
            partnerName: this.isStream ? "enga-stream" : "enga"
        };
        console.log("Address Validate Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Address Validate Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.isLoading = false;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    let data = this.isStream ? result.payload.content : result.content;
                    if (data.matchStatus === "noMatch") {
                        const noMatchMessage = `Billing Address validation not successful: ${data.hostResponse.status.description}`;
                        const event = new ShowToastEvent({
                            title: "Address Validation",
                            variant: "error",
                            mode: "sticky",
                            message: noMatchMessage
                        });
                        this.dispatchEvent(event);
                        this.isLoading = false;
                        this.logError(`${noMatchMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    } else if (data.matchStatus === "exactMatch") {
                        let address = data.matchedAddresses[0];
                        this.callAddAddress(requestInfo, address);
                    } else if (
                        data.matchStatus === "partialMatch" &&
                        this.partialMatchHardStop.includes(data.hostResponse.status.code)
                    ) {
                        const event = new ShowToastEvent({
                            title: "Address Validation",
                            variant: "error",
                            mode: "sticky",
                            message: POE_DTV_Address_Partial_Match_Modal_Message
                        });
                        this.dispatchEvent(event);
                        this.isLoading = false;
                        this.logError(
                            `${POE_DTV_Address_Partial_Match_Modal_Message}\nAPI Response: ${response}`,
                            myData,
                            path,
                            "API Error"
                        );
                    } else if (
                        data.matchStatus === "partialMatch" &&
                        !this.partialMatchHardStop.includes(data.hostResponse.status.code)
                    ) {
                        let predictiveArray = [];
                        data.matchedAddresses.forEach((item) => {
                            let baseAddress = {
                                address: {
                                    addressLine1: `${item.houseNumber} ${item.streetName}${
                                        item.hasOwnProperty("streetThoroughfare") ? ` ${item.streetThoroughfare}` : ""
                                    }`,
                                    addressLine2: `${item.hasOwnProperty("unitType") ? item.unitType : ""}${
                                        item.hasOwnProperty("unitValue") ? ` ${item.unitValue}` : ""
                                    }`,
                                    city: `${item.city}`,
                                    state: `${item.state}`,
                                    zipCode: `${item.zip}`
                                },
                                addressInfo: item
                            };
                            if (item.locationDetail.postalSupplementalDetail.length > 0) {
                                let numArray = [];
                                let textArray = [];
                                let numRegex = /^[\d]+$/;
                                let textRegex = /^[a-zA-Z]/;
                                item.locationDetail.postalSupplementalDetail.forEach((obj) => {
                                    if (numRegex.test(obj.unitNumberHigh) && numRegex.test(obj.unitNumberLow)) {
                                        numArray.push(Number(obj.unitNumberLow));
                                        numArray.push(Number(obj.unitNumberHigh));
                                    } else if (
                                        textRegex.test(obj.unitNumberHigh) &&
                                        textRegex.test(obj.unitNumberLow)
                                    ) {
                                        let alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");
                                        let minIndex = alphabet.indexOf(obj.unitNumberLow);
                                        let maxIndex = alphabet.indexOf(obj.unitNumberHigh);
                                        alphabet.forEach((item, index) => {
                                            if (index >= minIndex && index <= maxIndex) {
                                                textArray.push(item);
                                            }
                                        });
                                    } else {
                                        if (obj.unitNumberHigh === obj.unitNumberLow) {
                                            textArray.push(obj.unitNumberLow);
                                        } else {
                                            const [minWord, minDigits] = obj.unitNumberLow.match(/\D+|\d+/g);
                                            const [maxWord, maxDigits] = obj.unitNumberHigh.match(/\D+|\d+/g);
                                            for (let i = Number(minDigits); i <= Number(maxDigits); i++) {
                                                let unit = `${minWord}${i}`;
                                                textArray.push(unit);
                                            }
                                        }
                                        textArray.sort((a, b) =>
                                            Number(a.match(/[0-9]+/g)) > Number(b.match(/[0-9]+/g))
                                                ? 1
                                                : Number(a.match(/[0-9]+/g)) < Number(b.match(/[0-9]+/g))
                                                ? -1
                                                : 0
                                        );
                                    }
                                });
                                if (numArray.length > 0) {
                                    let min = Math.min(...numArray);
                                    let max = Math.max(...numArray);
                                    for (let i = min; i <= max; i++) {
                                        let aptObject = {
                                            address: {
                                                ...baseAddress.address,
                                                addressLine2: `${
                                                    item.locationDetail.postalSupplementalDetail[0].unitDescription
                                                } ${String(i)}`
                                            }
                                        };
                                        predictiveArray.push(aptObject);
                                    }
                                } else if (textArray.length > 0) {
                                    textArray.forEach((val) => {
                                        let aptObject = {
                                            address: {
                                                ...baseAddress.address,
                                                addressLine2: `${item.locationDetail.postalSupplementalDetail[0].unitDescription} ${val}`
                                            }
                                        };
                                        predictiveArray.push(aptObject);
                                    });
                                }
                            } else {
                                predictiveArray.push(baseAddress);
                            }
                        });
                        this.predictiveAddresses = [...predictiveArray];
                        this.handlePredictiveAddressModal();
                        this.isLoading = false;
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.isLoading = false;
            });
    }

    callAddAddress(requestInfo, address) {
        const path = "addAddress";
        const myData = {
            path,
            ...requestInfo,
            address: {
                ...address,
                firstName: this.contactInfo.firstName,
                lastName: this.contactInfo.lastName,
                type: "billing",
                email: this.contactInfo.email,
                validatedIndicator: true,
                contactNumber: ""
            },
            partnerName: this.isStream ? "enga-stream" : "enga"
        };

        if (this.isStream) {
            myData.address.locationDetail.latitude = String(myData.address.locationDetail.latitude);
            myData.address.locationDetail.longitude = String(myData.address.locationDetail.longitude);
        }

        console.log("Add Address Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Add Address Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.isLoading = false;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.callCreditCheck();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.isLoading = false;
            });
    }

    async callCreditCheck() {
        let encryptedSSN;
        let encryptedPhone;
        let encryptedEmail;
        let encryptedDOB;
        let encryptedDLNumber;
        let encryptedDLExpDate;
        let encryptedDLState;
        let dateValue = this.getFormattedDate(this.ccDOB);

        try {
            await this.getOnProbation();
            encryptedSSN = this.ccSSN !== undefined ? await this.encryptionHandler(this.publicKey, this.ccSSN) : "";
            encryptedPhone = await this.encryptionHandler(this.publicKey, this.contactInfo.phone);
            encryptedEmail = await this.encryptionHandler(this.publicKey, this.contactInfo.email);
            encryptedDOB = await this.encryptionHandler(this.publicKey, dateValue);
            encryptedDLNumber = this.ccDL !== undefined ? await this.encryptionHandler(this.publicKey, this.ccDL) : "";
            encryptedDLExpDate = this.ccDLexpDate
                ? await this.encryptionHandler(this.publicKey, this.getFormattedDate(this.ccDLexpDate))
                : "";
            encryptedDLState =
                this.ccDLstate !== undefined ? await this.encryptionHandler(this.publicKey, this.ccDLstate) : "";
        } catch (error) {
            console.error("ERROR", error);
            const event = new ShowToastEvent({
                title: "Server Error",
                variant: "error",
                mode: "sticky",
                message: "There was an error during the encryption of the information. Please try again."
            });
            this.dispatchEvent(event);
            this.isLoading = false;
            this.logError(error.body?.message || error.message);
            return;
        }

        const path = "creditCheck";
        let myData = {
            // last fix: changed this from const to let
            path,
            ...this.orderInfo,
            partnerName: this.isStream ? "enga-stream" : "enga",
            customer: {
                firstName: this.contactInfo.firstName,
                middleName: this.contactInfo.middleName || "",
                lastName: this.contactInfo.lastName,
                emailAddress: encryptedEmail,
                phoneNumber: encryptedPhone
            },
            account: {
                currentAddress: {
                    addressLine1: this.orderInfo.address.addressLine1,
                    addressLine2:
                        this.orderInfo.address.addressLine2 !== undefined ? this.orderInfo.address.addressLine2 : "",
                    city: this.orderInfo.address.city,
                    state: this.orderInfo.address.state,
                    zipCode: this.orderInfo.address.zipCode
                },
                dob: encryptedDOB
            }
        };
        if (encryptedSSN !== "") {
            myData.account.ssn = encryptedSSN;
        } else if (encryptedDLNumber !== "") {
            myData.account.drivingLicense = {
                dlNumber: encryptedDLNumber,
                expDate: encryptedDLExpDate,
                dlState: encryptedDLState
            };
        }
        if (this.isPreviousAddress) {
            myData.formerAddress = {
                addressLine1: this.billingAddress.addressLine1,
                addressLine2: this.billingAddress.adressLine2,
                city: this.billingAddress.city,
                state: this.billingAddress.state,
                zipCode: this.billingAddress.zipCode
            };
        }
        if (!this.isStream) {
            myData = {
                ...myData,
                dealerIdName: this.orderInfo.dealerId,
                corpIdGroup: this.orderInfo.corpIdGroup,
                wiringType: this.orderInfo.wiringType,
                channel: this.orderInfo.channel,
                orderType: "NEW",
                cartId: this.cartInfo.orderNumber,
                callVuFlow: false,
                productType: "BEAM",
                runCreditCheck: true
            };
        }
        console.log("Credit Check Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Credit Check Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.isLoading = false;
                } else {
                    if (
                        (!this.isStream &&
                            result.creditCheckResponse.creditInfo?.dtvCreditData?.treatmentMessage.toLowerCase() ===
                                "completed") ||
                        (this.isStream &&
                            result.content.payload.cpCreditInfo?.dtvCreditData?.treatmentMessage.toLowerCase() ===
                                "completed")
                    ) {
                        if (
                            (this.isStream && result.content.status.toLowerCase() === "success") ||
                            (!this.isStream && result.creditCheckResponse.creditInfo.hasOwnProperty("creditClass"))
                        ) {
                            this.creditScore = this.isStream
                                ? result.content.payload.creditInfo.creditClass
                                : result.creditCheckResponse.creditInfo.creditClass;
                            this.treatmentCode = this.isStream
                                ? result.content.payload.creditInfo.treatmentCode
                                : result.creditCheckResponse.creditInfo.dtvCreditData.treatmentCode;
                            if (
                                (this.onProbation && this.creditScore == "HIGH") ||
                                ((this.creditScore == "HIGH" || this.creditScore == "UNKNOWN") &&
                                    ((this.isStream && this.dealerOnProbation.stream) ||
                                        (!this.isStream && this.dealerOnProbation.beam)))
                            ) {
                                this.handleHighRiskCustomerModal();
                                this.noCompleteInfo = true;
                                this.isLoading = false;
                                return;
                            }

                            if (this.isGuestUser) {
                                this.handlePreliminaryCheckContinue();
                            } else {
                                this.isLoading = false;
                                this.handlePreliminaryCreditCheckModal();
                            }
                        } else {
                            const genericErrorMessage =
                                "No Credit Score received from the server. Please review the information and try again";
                            const event = new ShowToastEvent({
                                title: "Server Error",
                                variant: "error",
                                mode: "sticky",
                                message: genericErrorMessage
                            });
                            this.dispatchEvent(event);
                            this.logError(
                                `${genericErrorMessage}\nAPI Response: ${response}`,
                                myData,
                                path,
                                "API Error"
                            );

                            this.isLoading = false;
                        }
                    } else {
                        if (
                            (this.isStream &&
                                result.content.payload.creditInfo.status.toLowerCase() === "failure" &&
                                result.content.payload.cpCreditInfo?.dtvCreditData?.treatmentMessage !== null) ||
                            (!this.isStream &&
                                result.creditCheckResponse.creditInfo?.dtvCreditData?.treatmentMessage.toLowerCase() !==
                                    "completed")
                        ) {
                            const errorMessage = `${
                                this.isStream
                                    ? `${result.content.payload.cpCreditInfo.dtvCreditData.treatmentMessage}. Application Number:${result.content.payload.cpCreditInfo.applicationNumber}`
                                    : `${result.creditCheckResponse.creditInfo.dtvCreditData.treatmentMessage}. Application Number:${result.creditCheckResponse.creditInfo.applicationNumber}`
                            }`;
                            const event = new ShowToastEvent({
                                title: "Credit Check Failed",
                                variant: "error",
                                mode: "sticky",
                                message: errorMessage
                            });
                            this.dispatchEvent(event);
                            this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                            this.saveCreditFreeze();
                        } else {
                            const errorMessage = `${result.content.payload.creditInfo.error.message}`;
                            const event = new ShowToastEvent({
                                title: "Credit Check Failed",
                                variant: "error",
                                mode: "sticky",
                                message: errorMessage
                            });
                            this.dispatchEvent(event);
                            this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                        }

                        this.isLoading = false;
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.isLoading = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    getFormattedDate(data) {
        const date = new Date(data.replace(/-/g, "/").replace(/T.+/, ""));
        const year = date.getFullYear();
        let month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : "0" + month;
        let day = date.getDate().toString();
        day = day.length > 1 ? day : "0" + day;
        return `${month}/${day}/${year}`;
    }

    encryptionHandler(publicKey, bytes) {
        const encrypted = publicKey.encrypt(bytes, "RSA-OAEP", {
            md: forge.md.sha256.create(),
            mgf1: {
                md: forge.md.sha1.create()
            }
        });

        return window.btoa(encrypted);
    }

    handlePreliminaryCheckContinue() {
        const path = "createUser";
        this.isLoading = true;
        if (this.isStream) {
            this.handleCartSummary();
            return;
        }

        const myData = {
            path,
            ...this.orderInfo,
            ccId: "NA",
            salesRepId: "NA",
            customer: {
                firstName: this.contactInfo.firstName,
                middleName: this.contactInfo.middleName || "",
                lastName: this.contactInfo.lastName,
                emailAddress: this.contactInfo.email,
                phoneNumber: this.contactInfo.phone,
                mobileAlertOptIn: true,
                contactPhoneType: "CELL_PHONE",
                alternateContactNumber: "",
                alternateContactType: "",
                preferredContactMethods: [this.contactInfo.method],
                preferredContactTime: this.contactInfo.time
            }
        };

        console.log("Create User Beam Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Create User Beam Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.isLoading = false;
                } else {
                    if (result.content.status.toLowerCase() === "success") {
                        this.callBillingDetails();
                    } else {
                        const genericErrorMessage = "Create User callout was not successful, please try again.";
                        const event = new ShowToastEvent({
                            title: "Server Error",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                        this.isLoading = false;
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.isLoading = false;
            });
    }

    callBillingDetails() {
        this.isLoading = true;
        const path = "addBillingAccount";

        const myData = {
            path,
            ...this.billingInfo,
            partnerName: this.isStream ? "enga-stream" : "enga",
            treatmentCode: this.treatmentCode,
            offerActionType: ["Acquisition", "Closing"]
        };
        console.log("Billing Details Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Billing Details Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.isLoading = false;
                } else {
                    this.handleDOFee(result);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.isLoading = false;
            });
    }

    handleCartSummary() {
        this.isLoading = true;
        const path = "cartSummary";
        let myData = {
            path,
            partnerName: "enga-stream",
            systemCode: "ENGA-CHUZO",
            correlationId: this.orderInfo.correlationId,
            dealerCorpId: this.orderInfo.dealerCorpId,
            dealerId: this.orderInfo.dealerId,
            dealerAgentId: this.orderInfo.dealerAgentId,
            dealerLocation: this.orderInfo.dealerLocation,
            uuid: this.orderInfo.uuid,
            sid: this.orderInfo.sid
        };
        console.log("Cart Summary Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Cart Summary Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.isLoading = false;
                } else {
                    this.handleDOFee(result);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.isLoading = false;
            });
    }

    handleDOFee(billingDetails) {
        this.billingDetailsResponse = billingDetails;
        let feeNeeded = false;
        if (this.isStream) {
            if (billingDetails.content.payload.orderPriceInfo.doFee > 0) {
                feeNeeded = true;
                this.isLoading = false;
                this.fee =
                    billingDetails.content.payload.orderPriceInfo.doFeeWithTax > 0
                        ? Number(billingDetails.content.payload.orderPriceInfo.doFeeWithTax).toFixed(2)
                        : Number(billingDetails.content.payload.orderPriceInfo.doFee).toFixed(2);
                this.handleDOFeeModal();
            }
        } else {
            billingDetails.content.lineItemList.forEach((item) => {
                let lineItem = item.lineItem;
                if (
                    lineItem.lineItemIdentifier.productName === "DO Fee" &&
                    lineItem.hasOwnProperty("price") &&
                    lineItem.price.hasOwnProperty("subTotalAmount")
                ) {
                    if (lineItem.price.subTotalAmount != 0) {
                        this.isLoading = false;
                        this.fee = Number(lineItem.price.subTotalAmount).toFixed(2);
                        this.handleDOFeeModal();
                        feeNeeded = true;
                    }
                }
            });
        }

        if (!feeNeeded) {
            this.saveOrder(this.accountId, billingDetails);
        }
    }

    getCustomerInfo() {
        return {
            firstName: this.contactInfo.firstName,
            lastName: this.contactInfo.lastName,
            middleName:
                this.contactInfo.middleName == null || this.contactInfo.middleName == undefined
                    ? ""
                    : this.contactInfo.middleName,
            phone: this.contactInfo.phone,
            email: this.contactInfo.email,
            method: this.contactInfo.method,
            time: this.contactInfo.time
        };
    }

    disableValidations() {
        let ssnPattern = /^\d{9}$/;
        const hadAgeError = this.ageError;

        const age = Math.floor((new Date() - new Date(this.ccDOB).getTime()) / 3.15576e10);
        this.ageError = age < 18;

        if (this.validAddress && (this.isCallCenterOrigin || (!this.isCallCenterOrigin && this.isStatementRead))) {
            if (this.isSSNCreditCheck) {
                if (this.isNotPCI) {
                    this.handleSSNRepeatValidation();

                    if (
                        !this.sameSSN &&
                        this.ccSSN !== undefined &&
                        this.ccDOB !== undefined &&
                        ssnPattern.test(this.ccSSN) &&
                        ssnPattern.test(this.repeatSSN)
                    ) {
                        this.noCompleteInfo = this.ageError;
                    } else {
                        this.noCompleteInfo = true;
                    }
                } else if (this.ccSSN !== undefined && this.ccDOB !== undefined && ssnPattern.test(this.ccSSN)) {
                    this.noCompleteInfo = this.ageError;
                } else {
                    this.noCompleteInfo = true;
                }
            } else {
                if (
                    this.ccDL !== undefined &&
                    this.ccDOB !== undefined &&
                    this.ccDLexpDate !== undefined &&
                    this.ccDLstate !== undefined
                ) {
                    if (this.isNotPCI) {
                        this.expDateError = new Date(this.ccDLexpDate) < new Date();
                        this.noCompleteInfo = this.ageError || this.expDateError;
                    } else {
                        this.noCompleteInfo = false;
                    }
                } else {
                    this.noCompleteInfo = true;
                }
            }
        } else {
            this.noCompleteInfo = true;
        }

        const dobInput = this.template.querySelector('[data-field-name="ccDOB"]');
        if (this.ageError && this.noCompleteInfo) {
            dobInput.setCustomValidity(AGE_ERROR_MESSAGE);
            dobInput.reportValidity();
        } else if (hadAgeError && !this.ageError) {
            dobInput.setCustomValidity("");
            dobInput.reportValidity();
        }
    }

    handleCancel() {
        if (this.returnUrl != undefined) {
            window.open(this.returnUrl, "_self");
        } else if (this.isGuestUser) {
            this.handleSelfServiceCancelModal();
        } else {
            this[NavigationMixin.Navigate]({
                type: "standard__recordPage",
                attributes: {
                    recordId: this.recordId,
                    objectApiName: "Opportunity",
                    actionName: "view"
                }
            });
        }
    }

    selfServiceReturnToHomePage() {
        const goBackEvent = new CustomEvent("home", {
            detail: "",
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(goBackEvent);
    }

    selectAddressHandler(addressInputs) {
        this.billingAddress = {
            addressLine1: addressInputs.addressLine1,
            addressLine2: addressInputs.addressLine2,
            city: addressInputs.city,
            state: addressInputs.state,
            zipCode: addressInputs.zipCode
        };
        const requestInfo = { ...this.orderInfo };
        delete requestInfo.address;
        this.callAddressValidate();
    }

    handlePredictiveAddressModal() {
        predictiveAddressModal
            .open({
                addresses: this.predictiveAddresses,
                provider: "directv"
            })
            .then((result) => {
                if (!result || result.cancel) {
                    return;
                }

                this.selectAddressHandler(result.detail.address);
            });
    }

    handlePreliminaryCreditCheckModal() {
        chuzo_modalGeneric
            .open({
                content: {
                    title: "Preliminary credit results",
                    provider: "directv",
                    body: `<div>
                        <p class="slds-m-vertical_x-small">Please review the results before proceeding:</p>
                        <p class="slds-m-bottom_xx-small">Result: Success</p>
                        <p>Risk: ${this.creditScore}</p>
                      </div>`,
                    agreeLabel: "Continue",
                    canClose: false
                }
            })
            .then((result) => {
                if (!result?.agreed) {
                    return;
                }

                this.handlePreliminaryCheckContinue();
            });
    }

    handleHighRiskCustomerModal() {
        chuzo_modalGeneric
            .open({
                content: {
                    title: "High Credit Score",
                    provider: "directv",
                    body: this.label.DTVHighRiskCustomer,
                    agreeLabel: "Confirm",
                    canClose: false
                }
            })
            .then((result) => {
                this.handleSelfServiceCancelModal();
            });
    }

    handleSelfServiceCancelModal() {
        chuzo_modalGeneric
            .open({
                content: {
                    title: this.labels.selfServiceValidateLeavingTitle,
                    provider: "directv",
                    body: this.labels.selfServiceValidateLeavingMessage,
                    agreeLabel: "Confirm",
                    canClose: true
                }
            })
            .then((result) => {
                if (!result?.agreed) {
                    this.handleCapReachedModal();
                    return;
                }

                this.selfServiceReturnToHomePage();
            });
    }

    handleCapReachedModal() {
        chuzo_modalGeneric
            .open({
                content: {
                    title: "Limit Reached",
                    provider: "directv",
                    body: this.labels.capReachedError,
                    agreeLabel: "Confirm",
                    canClose: false
                }
            })
            .then((result) => {
                this.handleCancel();
            });
    }

    handleDOFeeModal() {
        doFeeModal
            .open({
                fee: this.fee
            })
            .then((result) => {
                if (!result) {
                    return;
                } else if (result.customerAgrees) {
                    this.isLoading = true;
                    this.saveOrder(this.accountId, this.billingDetailsResponse);
                } else {
                    this.dispatchEvent(new CustomEvent("gotoproducts", {}));
                }
            });
    }

    handlePredictiveShippingAddressChange(event) {
        this.billingAddress.addressLine1 = event.detail.street != "" ? event.detail.street : undefined;
        this.billingAddress.city = event.detail.city != "" ? event.detail.city : undefined;
        this.billingAddress.addressLine2 = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.billingAddress.state = event.detail.province != "" ? event.detail.province : undefined;
        this.billingAddress.zipCode = event.detail.postalCode != "" ? event.detail.postalCode : undefined;

        this.handlePersonalInformation();
        this.disableValidations();
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Customer Information",
            component: "poe_lwcBuyflowDirecTvEngaCreditCheckTab",
            error: errorMessage ? JSON.stringify(errorMessage) : errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }

    handleLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "Customer Information 2"
        };
        this.dispatchEvent(event);
    }
}