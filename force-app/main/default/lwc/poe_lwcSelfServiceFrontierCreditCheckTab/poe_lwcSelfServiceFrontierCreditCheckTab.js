import { LightningElement, api, wire, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { loadStyle } from "lightning/platformResourceLoader";

import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

import getSSNFraudRules from "@salesforce/apex/CreditCheckTabController.getSSNFraudRules";
import updateOpportunity from "@salesforce/apex/CreditCheckTabController.updateOpportunity";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getOppSensitiveData from "@salesforce/apex/CreditCheckTabController.getOppSensitiveData";
import sendPCISMS from "@salesforce/apex/CreditCheckTabController.sendPCISMS";
import setSSNAgreement from "@salesforce/apex/CreditCheckTabController.setSSNAgreement";
import sendCreditCheckPciEmail from "@salesforce/apex/CreditCheckTabController.sendCreditCheckPciEmail";
import IPSaveOrderDTV from "@salesforce/apex/CreditCheckTabController.IPSaveOrderDTV";
import getIPStackSettings from "@salesforce/apex/InfoTabController.getIPStackSettings";
import saveFlagIP from "@salesforce/apex/CreditCheckTabController.saveFlagIP";
import saveCreditFreeze from "@salesforce/apex/CreditCheckTabController.saveCreditFreeze";
import saveACICreditCheck from "@salesforce/apex/CreditCheckTabController.saveACICreditCheck";
import customerReachedCap from "@salesforce/apex/CreditCheckTabController.customerReachedCap";
import saveAccountInformation from "@salesforce/apex/CreditCheckTabController.saveAccountInformation";
import setFraudFlag from "@salesforce/apex/CreditCheckTabController.setFraudFlag";
import getOnlyLettersRegEx from "@salesforce/apex/POE_RegExObtainer.getOnlyLettersRegEx";

import PHONE_DISCLAIMER from "@salesforce/label/c.POE_phone_disclaimer";
import PHONE_DISCLAIMER2 from "@salesforce/label/c.POE_phone_disclaimer2";
import SMS_VERBIAGE from "@salesforce/label/c.POE_sms_verbiage";
import CAP_REACHED_ERROR from "@salesforce/label/c.Order_Cap_Reached_Body";
import POS_ID_MESSAGE from "@salesforce/label/c.Self_Service_Frontier_Buyflow_Credit_Score_Z_Message";
import CONSENT_DISCLAIMER from "@salesforce/label/c.Self_Service_Consent_Text";
import SERVICE_UPGRADE_PREFERENCE_DESCRIPTION from "@salesforce/label/c.Self_Service_Service_Upgrade_Preference_Description";
import EXISTING_ACTIVE_SERVICE_MESSAGE from "@salesforce/label/c.Frontier_Existing_Active_Service_Message";
import INVALID_SSN_ERROR_MESSAGE from "@salesforce/label/c.Frontier_Invalid_SSN_Error_Message";
import BILLING_ADDRESS_SAME_AS_SERVICE_ADDRESS_FIELD from "@salesforce/label/c.Billing_Address_Same_As_Service_Address_Field";
import SSN_REQUIRED_MESSAGE from "@salesforce/label/c.Frontier_SSN_Required_Message";
import SERVICE_UPGRADE_MOVING_OPTION from "@salesforce/label/c.Frontier_Service_Upgrade_Moving_Option";
import SERVICE_UPGRADE_UPGRADE_OPTION from "@salesforce/label/c.Frontier_Service_Upgrade_Upgrade_Option";
import SSN_LIMIT_ERROR_MESSAGE from "@salesforce/label/c.Frontier_SSN_Limit_Error_Message";
import EXCLUSIVE_OFFERS_EMAIL_CONSENT_DISCLAIMER from "@salesforce/label/c.Frontier_Exclusive_Offers_Email_Consent_Disclaimer";
import EXCLUSIVE_OFFERS_PHONE_CONSENT_DISCLAIMER from "@salesforce/label/c.Frontier_Exclusive_Offers_Phone_Consent_Disclaimer";

import chuzo_modalGeneric from "c/chuzo_modalGeneric";
import creditCheckScorePModal from "c/poe_lwcSelfServiceFrontierCreditCheckScorePModal";
import creditCheckPreviousAddressCheckModal from "c/poe_lwcSelfServiceFrontierCreditCheckPreviousAddressCheckModal";

const PHONE_REGEX = /^\d{10}$/;

export default class Poe_lwcSelfServiceFrontierCreditCheckTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api origin;
    @api cartInfo;
    @api paperBill;
    @api contactInfo;
    @api addressInfo;
    @api accountInfo;
    @api productSelected;
    @api frontierUserId;
    @api isGuestUser;
    @api referralCodeData;
    @api customerValidationParams;

    @api
    get accountId() {
        return this._accountId;
    }
    set accountId(value) {
        this._accountId = value;
    }

    @track onlyLettersRegEx;
    @wire(getOnlyLettersRegEx) onlyLettersRegExParse({ data, error }) {
        if (data) {
            this.onlyLettersRegEx = data;
        } else if (error) {
            console.error(error);
        }
    }
    get onlyLettersRegExPattern() {
        return this.onlyLettersRegEx?.result?.expression;
    }
    get onlyLettersRegExErrorMessage() {
        return this.onlyLettersRegEx?.result?.errorMessage;
    }

    _accountId;
    loaderSpinner;
    responseData;
    calloutData;
    frontierDisclaimer =
        "Frontier requires customers to provide their Social Security Number when submitting an order. Your decision on whether to allow us to use these records will not affect the service you currently receive. We cannot continue to process your order without this information. By placing this order, I authorize the required credit check through a credit check with a nationwide credit bureau or use of existing information on file with the service provider's family of companies.";
    referenceNumber;
    attempts;
    creditCheckAttempts;
    firstName;
    lastName;
    middleName;
    noAddressInformation = true;
    email;
    phone;
    shippingAddress;
    shippingApt;
    shippingCity;
    shippingState;
    shippingZip;
    billingAddress;
    billingApt;
    billingCity;
    billingState;
    billingZip;
    mailingAddress;
    mailingApt;
    mailingCity;
    mailingState;
    mailingZip;
    ssn;
    DOB;
    noCompleteInfo = true;
    showBillingAddress = false;
    noShippingInformation = true;
    showCreditCheckQuoteAssistanceModal = false;
    cart = {
        hasTodayCharge: false,
        hasMonthlyCharge: false,
        todayCharges: [],
        monthlyCharges: [],
        todayTotal: (0.0).toFixed(2),
        monthlyTotal: (0.0).toFixed(2)
    };
    isManual = false;
    states = [];
    paymentMethods = [
        { label: "Enroll in Auto Pay", value: "AutoPay" },
        { label: "Don't Enroll in Auto Pay", value: "NoAutoPay" }
    ];
    paymentMethod = "AutoPay";
    paymentDisclaimer =
        "I'm going to read you an authorization paragraph and will ask you to verbally acknowledge your agreement. Here is a link (URL) to our Terms and Conditions documents. https://frontier.com/payment-terms. Let me know if you would like a moment to familiarize yourself with the Terms and Conditions. By choosing debit card or ACH (echeck) as your method of payment. If applicable, you agree that a.) you have been provided a link to the full Terms and Conditions, and agree to these terms and conditions, and that this agree constitutes a 'writing signed by you' under applicable law or regulations and b.) you authorize Frontier (or its agent) to initiate one or more ACH debit entries (withdrawals) and you authorize the financial institution that holds your bank account to deduct wich payments, in the amount and frequency designed in your then-current payment plan. If choosing debit or credit card as your method of payment, you authorize Frontier (or its agent) to charge your card.";

    paperlessMethods = [];
    paperlessMethod = "Paperless";
    billingDisclaimer =
        "Customers can log into frontier.com at any time to make changes to their bill preferences. By signing up for paperless billing your first bill will be delivered electronically within three days of your services being installed. Paperless billing uses less paper and is more earth-friendly!";
    noContactInformation = true;
    validationSSNtry = 0;
    validationAddressTry = 0;
    fraudLimit = 0;
    ssnValidation;
    addressValidation;
    nameValidation;
    nameAddressValidation;
    addressWarning = false;
    recType;
    showCollateral = false;
    isCallCenterOrigin;
    addressDiscrepancy = false;
    creditFreeze = false;
    clientIp;
    autoPayPrice;
    hardStop = false;
    isPCI = true;
    methods = [
        { label: "PCI Link", value: "PCI" },
        { label: "Manual", value: "Manual" }
    ];
    method = "PCI";
    noEmail = true;
    noPhone = true;
    communicationPreferences = {
        item: [
            {
                communicationType: "BillReadyNotification_email",
                optIn: false,
                mediaType: "Email"
            },
            {
                communicationType: "AccountInformation_email",
                optIn: false,
                mediaType: "Email"
            },
            {
                communicationType: "ServiceUpdates_email",
                optIn: false,
                mediaType: "Email"
            },
            {
                communicationType: "MarketingPromotions_email",
                optIn: false,
                mediaType: "Email"
            },
            {
                communicationType: "AccountInformation_mobile",
                optIn: false,
                mediaType: "Phone"
            },
            {
                communicationType: "ServiceUpdates_mobile",
                optIn: false,
                mediaType: "Phone"
            },
            {
                communicationType: "MarketingPromotions_mobile",
                optIn: false,
                mediaType: "Phone"
            }
        ]
    };
    orderId;
    orderItemId;
    paymentProfile = {
        eBill: true,
        autoPay: true
    };
    repeatSSN;
    invalidSSN;
    skipCreditCheck = false;
    phoneDisclaimer = PHONE_DISCLAIMER;
    phoneDisclaimer2 = PHONE_DISCLAIMER2;
    hasOptedInSMS = false;
    creditScoreRating;
    showSSNCheck = false;
    labels = {
        CAP_REACHED_ERROR,
        POS_ID_MESSAGE,
        SERVICE_UPGRADE_PREFERENCE_DESCRIPTION,
        EXISTING_ACTIVE_SERVICE_MESSAGE,
        INVALID_SSN_ERROR_MESSAGE,
        BILLING_ADDRESS_SAME_AS_SERVICE_ADDRESS_FIELD,
        EXCLUSIVE_OFFERS_EMAIL_CONSENT_DISCLAIMER,
        EXCLUSIVE_OFFERS_PHONE_CONSENT_DISCLAIMER
    };
    showSelfServiceCancelModal = false;
    creditCheckModshowCapReachedModal = false;
    itemRowIdObject;
    contactConsentLabel = CONSENT_DISCLAIMER;
    contactConsent = false;
    // === Customer Validation ===
    serviceUpgradePreference;
    serviceUpgradePreferenceOptions = [
        { label: SERVICE_UPGRADE_MOVING_OPTION, value: "moving" },
        { label: SERVICE_UPGRADE_UPGRADE_OPTION, value: "upgrade" }
    ];
    quoteId;
    accountUuid;
    newCustomerSuccess;
    newCustomerError;
    showUpgradeOptions = false;
    orderBlocked = true;
    autoPayEligibility = false;
    autoPayDiscounts = [];
    autoPayDiscount;
    autoPayNode = { debit: 0.0, credit: 0.0, ach: 0.0 };
    autoPayVerbiage = "";
    // ===========================

    get disableSendSMSButton() {
        return this.noPhone || !this.hasOptedInSMS;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get iconFormUser() {
        return chuzoSiteResources + "/images/icon-frontier-user.svg";
    }

    get nextButtonClass() {
        return this.noCompleteInfo || this.orderBlocked
            ? "btn-rounded btn-center hide-mobile btn-disabled"
            : "btn-rounded btn-center hide-mobile";
    }

    get nextButtonClassMobile() {
        return this.noCompleteInfo || this.orderBlocked
            ? "btn-rounded btn-center btn-disabled"
            : "btn-rounded btn-center";
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");

        if (this.isGuestUser) {
            this.isManual = true;
            this.isPCI = false;
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        this.loaderSpinner = true;
        this.creditCheckAttempts = 0;
        this.cart = { ...this.cartInfo };
        let cartFiltered = this.cart.monthlyCharges.filter((e) => e.name === "Autopay Discount");
        if (cartFiltered.length > 0) {
            this.autoPayPrice = cartFiltered[0].fee;
        }
        let auxList = [
            { label: "Enroll in paperless - Free", value: "Paperless" },
            { label: "Printed Bill $ " + this.paperBill, value: "PrintedBill" }
        ];
        this.paperlessMethods = auxList;
        this.saveIP();
        if (this.origin === "phonesales") {
            this.isCallCenterOrigin = true;
        }

        this.firstName = this.contactInfo.firstName;
        this.lastName = this.contactInfo.lastName;
        this.DOB = this.accountInfo.dob;
        this.ssn = this.accountInfo.ssn;
        this.phone = this.contactInfo.phone;
        this.email = this.contactInfo.email;
        this.shippingAddress = this.addressInfo.address;
        this.shippingApt = this.addressInfo.apt;
        this.shippingCity = this.addressInfo.city;
        this.shippingZip = this.addressInfo.zip;
        this.shippingState = this.addressInfo.state;
        let myData = {
            ContextId: this.recordId,
            partner: "frontier"
        };

        Promise.all([
            this.customerValidationCallout(),
            getSSNFraudRules({ myData: myData })
                .then((response) => {
                    this.fraudLimit = response.result.limit;
                    this.referenceNumber = response.result.refNum;
                    this.attempts = response.result.attempts;
                    this.recType = response.result.recType;
                    this.disableValidations();
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.logError(error.body?.message || error.message);
                })
        ]).finally(() => {
            this.loaderSpinner = false;
        });
    }

    handleAutoPayEligibility() {
        this.loaderSpinner = true;
        const path = "autopayEligibility";
        let data = {
            partnerName: "frapi",
            path,
            quoteId: this.quoteId,
            userId: this.frontierUserId
        };
        console.log("AutoPay Eligibility Request", data);
        let apiResponse;
        callEndpoint({ inputMap: data })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("AutoPay Eligibility Response", responseParsed);
                this.creditScoreRating = responseParsed?.creditScore?.rating;
                let options = [
                    { label: "Debit", value: "debit" },
                    { label: "Credit", value: "credit" },
                    { label: "ACH", value: "ach" }
                ];
                let error = responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage =
                        responseParsed === ""
                            ? "Callout Method could not be found. Please contact Chuzo support."
                            : responseParsed.hasOwnProperty("error")
                            ? responseParsed.error.hasOwnProperty("provider")
                                ? responseParsed.error.provider.message.hasOwnProperty("message")
                                    ? responseParsed.error.provider.message.message
                                    : responseParsed.error.provider.message
                                : responseParsed.error
                            : responseParsed.error;
                    const finalErrorMessage = errorMessage !== "" ? errorMessage : "Internal Server Error";
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: finalErrorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${finalErrorMessage}\nAPI Response: ${response}`, data, path, "API Error");
                } else {
                    this.autoPayEligibility = responseParsed.isEligible;
                    if (this.autoPayEligibility) {
                        options = [];
                        if (responseParsed.discountAmount.debit < 0) {
                            let discountObject = {
                                label: `Debit - $${(responseParsed.discountAmount.debit * -1).toFixed(
                                    2
                                )} AutoPay discount`,
                                value: "debit"
                            };
                            options.push(discountObject);
                        }
                        if (responseParsed.discountAmount.credit < 0) {
                            let discountObject = {
                                label: `Credit - $${(responseParsed.discountAmount.credit * -1).toFixed(
                                    2
                                )} AutoPay discount`,
                                value: "credit"
                            };
                            options.push(discountObject);
                        }
                        if (responseParsed.discountAmount.ach < 0) {
                            let discountObject = {
                                label: `ACH (for Auto Pay only) - $${(responseParsed.discountAmount.ach * -1).toFixed(
                                    2
                                )} AutoPay discount`,
                                value: "ach"
                            };
                            options.push(discountObject);
                        }
                        this.autoPayNode = { ...responseParsed.discountAmount };
                        this.autoPayDiscount = "debit";
                        this.autoPayVerbiage = `Enroll in AutoPay and enjoy a $${
                            this.autoPayNode.debit.toFixed(2) * -1
                        } discount when you use a debit card, a $${
                            this.autoPayNode.ach.toFixed(2) * -1
                        } discount with ACH, or a $${
                            this.autoPayNode.credit.toFixed(2) * -1
                        } discount with a credit card.`;
                        chuzo_modalGeneric.open({
                            content: {
                                title: "AutoPay Eligibility",
                                provider: "frontier",
                                body: this.autoPayVerbiage,
                                agreeLabel: "Confirm",
                                canClose: true
                            }
                        });
                        this.updateCartWithAutoPay();
                    }
                }
                this.autoPayDiscounts = [...options];
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The Customer's Auto Pay Eligibility could not be retrieved due to a system failure. Please try again.";
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, data, path, "API Error");
                this.loaderSpinner = false;
            });
    }

    // === Customer Validation ===
    handleServiceUpgradePreferenceChange(e) {
        this.serviceUpgradePreference = e.target.value;
        if (this.serviceUpgradePreference === "upgrade") {
            this.orderBlocked = true;
            this.newCustomerError = true;
        } else {
            this.orderBlocked = false;
            this.newCustomerError = false;
        }
    }

    customerValidationCallout() {
        this.loaderSpinner = true;
        const path = "products/frapi";
        const myData = {
            partnerName: "frapi",
            path,
            agent: this.isGuestUser ? "online" : this.customerValidationParams.agentId,
            customerType: "Residential",
            assisted: true,
            environmentCode: this.customerValidationParams.environmentCode,
            activeAddressReason: "NewToAddress",
            controlNumber: this.customerValidationParams.controlNumber,
            requestingApplication: "PartnerDirect",
            userId: this.frontierUserId,
            tracking: [
                {
                    key: "selfInstallSalesJourney",
                    value: "TRUE"
                }
            ]
        };
        console.log("Customer Validation Request", myData);
        let apiResponse;
        return callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Customer Validation Response", responseParsed);
                const error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = `${responseParsed.message !== undefined ? responseParsed.message + "." : ""} ${
                        responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.orderBlocked = true;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.quoteId = responseParsed.quoteId;
                    const quoteEvent = new CustomEvent("quote", {
                        detail: this.quoteId
                    });
                    this.dispatchEvent(quoteEvent);
                    this.accountUuid = responseParsed.accountUuid;
                    let hasActiveService = responseParsed.hasActiveServiceAtAddress;
                    if (!hasActiveService) {
                        this.newCustomerSuccess = true;
                        this.orderBlocked = false;
                    } else {
                        this.orderBlocked = true;
                        this.showUpgradeOptions = true;
                    }
                    this.handleAutoPayEligibility();
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
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    newCustomerValidation() {
        this.showUpgradeOptions = false;
        const path = "products/frapi";
        const myData = {
            partnerName: "frapi",
            path,
            quoteId: this.quoteId,
            type: "New Customer",
            userId: this.frontierUserId
        };
        console.log("New Customer Validation Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("New Customer Validation Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = `${
                        responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.orderBlocked = true;
                } else {
                    this.newCustomerSuccess = true;
                    this.orderBlocked = false;
                    this.handleNext();
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
                this.orderBlocked = true;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    handleConsentChange(e) {
        this.contactConsent = e.detail.checked;
    }

    handlePaymentMethod(event) {
        this.paymentProfile.autoPay = event.detail.checked;
        const closeModalEvent = new CustomEvent("auto", {
            detail: this.paymentProfile.autoPay
        });
        this.dispatchEvent(closeModalEvent);
        this.updateCartWithAutoPay();
        this.disableValidations();
    }

    updateCartWithAutoPay() {
        let cart = { ...this.cart };
        let cartFiltered = cart.monthlyCharges.filter((e) => e.name !== "Autopay Discount");
        if (this.paymentProfile.autoPay && this.autoPayDiscount !== undefined) {
            let newCharge = {
                name: "Autopay Discount",
                fee: Number(this.autoPayNode[this.autoPayDiscount]).toFixed(2),
                type: "Monthly",
                discount: Number(this.autoPayNode[this.autoPayDiscount]) <= 0
            };
            cartFiltered.push(newCharge);
        }
        cart.monthlyCharges = [...cartFiltered];
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        this.cart = { ...cart };
        const closeModalEvent = new CustomEvent("auto", {
            detail: {
                autoPay: this.paymentProfile.autoPay,
                cart: this.cart
            }
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleAutoPayDiscount(event) {
        this.autoPayDiscount = event.target.value;
        this.updateCartWithAutoPay();
        this.disableValidations();
    }

    handleMethod(event) {
        this.ssn = undefined;
        this.DOB = undefined;
        this.repeatSSN = undefined;
        switch (event.target.value) {
            case "Manual":
                this.isManual = true;
                this.isPCI = false;
                break;
            case "PCI":
                this.isManual = false;
                this.isPCI = true;
                break;
        }
        this.disableValidations();
    }

    handleBillMethod(event) {
        this.paymentProfile.eBill = event.detail.checked;

        let cart = { ...this.cart };
        let cartFiltered = cart.monthlyCharges.filter((e) => e.name !== "Printed Bill");
        if (!this.paymentProfile.eBill) {
            let newCharge = {
                name: "Printed Bill",
                fee: Number(this.paperBill).toFixed(2),
                type: "Monthly",
                discount: Number(this.paperBill) <= 0
            };
            cartFiltered.push(newCharge);
        }
        cart.monthlyCharges = [...cartFiltered];
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        this.cart = { ...cart };
        const closeModalEvent = new CustomEvent("ebill", {
            detail: {
                eBill: this.paymentProfile.eBill,
                cart: this.cart
            }
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleRefresh(e) {
        e.preventDefault();
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };
        getOppSensitiveData({ myData: myData })
            .then((response) => {
                console.log("Get Opp Sensitive Data", response);
                let data = response.result !== undefined ? response.result : {};
                this.DOB = data.hasOwnProperty("ccDob") ? data.ccDob : undefined;
                this.ssn = data.hasOwnProperty("ccSSN") ? data.ccSSN : undefined;
                this.repeatSSN = data.hasOwnProperty("ccSSN") ? data.ccSSN : undefined;
                this.disableValidations();
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    handleChange(event) {
        switch (event.target.name) {
            case "firstName":
                this.firstName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "lastName":
                this.lastName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "ssn":
                this.ssn = event.target.value;
                break;
            case "phone":
                this.phone = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "email":
                this.email = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "repeatSSN":
                this.repeatSSN = event.target.value;
                break;
            case "otherPersonAtInstallationApt":
            case "someoneOlderWillBePresentAtInstApt":
            case "hasOptedInSMS":
                this[event.target.name] = event.detail.checked;
                break;
            case "DOB":
                this.DOB = event.detail.value;
                this.validateDOB(event.detail.value);
                break;
            case "serviceUpgradePreference":
                this.serviceUpgradePreference = event.detail.value;
                break;
            case "installationFirstName":
                this.installationFirstName = e.target.value !== "" ? e.target.value : undefined;
                break;
            case "installationLastName":
                this.installationLastName = e.target.value !== "" ? e.target.value : undefined;
                break;
            case "installationPrimaryPhoneNumber":
                this.installationPrimaryPhoneNumber = e.target.value !== "" ? e.target.value : undefined;
                break;
            case "installationSecondaryPhoneNumber":
                this.installationSecondaryPhoneNumber = PHONE_REGEX.test(e.target.value) ? e.target.value : undefined;
                break;
            case "installationDateRawValue":
                this.installationDateRawValue = event.target.value;
                break;
        }

        this.disableValidations();
    }

    validateDOB(value) {
        if (value !== "") {
            let isAdult = new Date().getFullYear() - new Date(value).getFullYear() >= 18;
            this.DOB =
                Date.parse(value) >= Date.parse("1916-01-01") && Date.parse(value) < Date.parse(new Date()) && isAdult
                    ? value
                    : undefined;

            if (Date.parse(value) > Date.parse(new Date()) || !isAdult) {
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message:
                        "The date of birth provided is invalid. Customers must be at least 18 years old, and born after 1900."
                });
                this.dispatchEvent(event);
            }
        } else {
            this.DOB = undefined;
        }
    }

    handleBillingAddress(event) {
        this.showBillingAddress = !event.target.checked;
        this.disableValidations();
    }

    handlePredictiveShippingAddressChange(event) {
        this.billingAddress = event.detail.street != "" ? event.detail.street : undefined;
        this.billingCity = event.detail.city != "" ? event.detail.city : undefined;
        this.billingApt = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.billingState = event.detail.province != "" ? event.detail.province : undefined;
        this.billingZip = event.detail.postalCode != "" ? event.detail.postalCode : undefined;

        this.disableValidations();
    }

    disableValidations() {
        const emailRegex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        const ssnPattern = /^\d{9}$/;
        const isUndefined = (value) => value === "" || value === null;
        const hasValue = (prop) => this[prop] !== undefined;
        const hasValues = (props) => props.every((prop) => hasValue(prop));

        this.ssn = isUndefined(this.ssn) ? undefined : this.ssn;
        this.DOB = isUndefined(this.DOB) ? undefined : this.DOB;
        this.noEmail = !hasValue("email") || !emailRegex.test(this.email);
        this.noPhone = !hasValue("phone") || !PHONE_REGEX.test(this.phone);
        this.invalidSSN = !ssnPattern.test(this.ssn) || !ssnPattern.test(this.repeatSSN) || this.repeatSSN !== this.ssn;

        if (this.invalidSSN && ssnPattern.test(this.ssn) && ssnPattern.test(this.repeatSSN)) {
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: "SSN/ITIN values don't match. Please verify the information"
            });
            this.dispatchEvent(event);
        }

        const contactProps = ["firstName", "lastName", "ssn", "DOB"];
        if (this.isManual) {
            contactProps.push("repeatSSN");
        }
        this.noContactInformation =
            this.noEmail ||
            this.noPhone ||
            (this.showSSNCheck
                ? !hasValues(contactProps) || this.invalidSSN
                : !hasValues(["firstName", "lastName", "DOB"]));

        const addressProps = ["shippingAddress", "shippingCity", "shippingState", "shippingZip"];
        if (this.showBillingAddress) {
            addressProps.push("billingAddress", "billingCity", "billingState", "billingZip");
        }

        this.noAddressInformation = !hasValues(addressProps) || this.noContactInformation;
        this.noShippingInformation = !hasValues(addressProps.slice(0, 4)) || this.noContactInformation;
        const hasOptIn = this.communicationPreferences.item.some((item) => item.optIn);
        let onlyLetters = new RegExp(this.onlyLettersRegEx.result.expression);
        let nameWithOnlyLetterCharacters = onlyLetters.test(this.firstName) && onlyLetters.test(this.lastName);

        this.noCompleteInfo =
            !nameWithOnlyLetterCharacters ||
            !hasOptIn ||
            this.noShippingInformation ||
            this.noAddressInformation ||
            this.noContactInformation;
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCancel() {
        const homeEvent = new CustomEvent("home", {
            detail: "",
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(homeEvent);
    }

    saveIP() {
        if (this.isGuestUser) {
            return;
        }

        getIPStackSettings()
            .then((response) => {
                const Http = new XMLHttpRequest();
                let url = response.result.URL__c ? response.result.URL__c : "https://api.ipstack.com/";
                url = url + "check?access_key=" + response.result.Password__c;
                Http.open("GET", url);
                Http.send();
                Http.onreadystatechange = (e) => {
                    if (Http.readyState == 4 && Http.status == 200) {
                        let data = JSON.parse(Http.responseText);
                        this.clientIp = data.ip;
                        const myData = {
                            ContextId: this.recordId,
                            IP: this.clientIp
                        };
                        saveFlagIP({ myData: myData })
                            .then((response) => {
                                console.log("IP Saved");
                            })
                            .catch((error) => {
                                console.error(error, "ERROR");
                                this.logError(error.body?.message || error.message);
                            });
                    }
                };
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
            });
    }

    showWarning() {
        if (this.validationSSNtry == Number(this.fraudLimit) - 1) {
            const event = new ShowToastEvent({
                title: "Warning",
                variant: "warning",
                mode: "sticky",
                message:
                    "A different SSN/ITIN is being run with the same name after a failed Credit Check, please verify this is a valid entry."
            });
            this.dispatchEvent(event);
        } else if (this.validationSSNtry == Number(this.fraudLimit)) {
            const event = new ShowToastEvent({
                title: "Warning",
                variant: "warning",
                mode: "sticky",
                message:
                    "This is the last attempt to correctly identify the SSN/ITIN, please verify this is a valid entry."
            });
            this.dispatchEvent(event);
        }
    }

    handleSMS(e) {
        e.preventDefault();
        this.handleSSNValue();
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody = SMS_VERBIAGE + index[0] + "/s/pci-personal-info?c__ContextId=" + this.recordId;
        let myData = {
            clientPhone: "1" + this.phone,
            body: mailBody,
            opportunityId: this.recordId
        };
        sendPCISMS({ myData: myData })
            .then((response) => {
                let result = response.result;
                this.loaderSpinner = false;
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
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The SMS could not be sent. Please, verify the telephone number and try again."
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    handleSSNValue() {
        let myData = {
            ContextId: this.recordId,
            value: true
        };
        setSSNAgreement({ myData: myData })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
            });
    }

    sendPCIEmail(e) {
        e.preventDefault();
        this.loaderSpinner = true;
        this.handleSSNValue();
        let url = window.location.href;
        let index = url.split("/s/");
        let mailBody = index[0] + "/s/pci-personal-info?c__ContextId=" + this.recordId;
        let myData = {
            pciEmail: this.email,
            body: mailBody
        };
        sendCreditCheckPciEmail({ myData: myData })
            .then((response) => {
                console.log(response);
                this.loaderSpinner = false;
                const successEvent = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    message: "The email was sent correctly with a link to enter the personal information."
                });
                this.dispatchEvent(successEvent);
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const errorEvent = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The email could not be sent. Please, verify the email address and try again."
                });
                this.dispatchEvent(errorEvent);
                this.logError(error.body?.message || error.message);
            });
    }

    handleNextClick() {
        this.loaderSpinner = true;

        if (this.showUpgradeOptions) {
            this.orderBlocked = true;
            this.newCustomerValidation();
        } else {
            this.handleNext();
        }
    }

    async handleNext() {
        if (this.isGuestUser) {
            await this.saveAccountInformation();
        }
        if (!this.accountId) {
            return;
        }
        this.customerReachedCapCallout();
    }

    customerReachedCapCallout() {
        const myData = {
            Email: this.email
        };
        console.log("Customer Cap Reached Request", myData);

        customerReachedCap({ myData })
            .then((response) => {
                console.log("Customer Cap Reached response", response);
                let capReached = response.result.capReached;

                if (capReached) {
                    this.loaderSpinner = false;
                    this.handleCCCapReachedModal();

                    this.logError(this.labels.CAP_REACHED_ERROR);
                } else {
                    if (this.showSSNCheck) {
                        this.handleCallCC();
                    } else {
                        this.callSoftCreditCheck();
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const errMsg = error.body?.message || error.message;
                this.logError(errMsg);
            });
    }

    handleCCCapReachedModal() {
        chuzo_modalGeneric
            .open({
                content: {
                    title: "Limit Reached",
                    provider: "frontier",
                    body: this.labels.CAP_REACHED_ERROR,
                    agreeLabel: "Confirm",
                    canClose: true
                }
            })
            .then(() => {
                this.handleCancel();
            });
    }

    callSoftCreditCheck() {
        this.loaderSpinner = true;
        const path = "creditCheck";
        let data = {
            partnerName: "frapi",
            tab: "creditcheck",
            path,
            quoteId: this.quoteId,
            accountUuid: this.accountUuid,
            cart: this.cart,
            customer: {
                accountName: this.firstName + " " + this.lastName,
                firstName: this.firstName,
                lastName: this.lastName
            },
            account: {
                billingAddress: {
                    addressLine1: this.shippingAddress,
                    addressLine2: "",
                    city: this.shippingCity,
                    state: this.shippingState,
                    zipCode: this.shippingZip
                },
                refuseSSN: true,
                dob: this.DOB
            },
            paymentProfile: this.paymentProfile,
            contacts: {
                item: [
                    {
                        primary: true,
                        fullName: this.isGuestUser
                            ? `${this.firstName} ${this.lastName}`
                            : `${this.contactInfo.firstName} ${this.contactInfo.lastName}`,
                        firstName: this.isGuestUser ? this.firstName : this.contactInfo.firstName,
                        lastName: this.isGuestUser ? this.lastName : this.contactInfo.lastName,
                        telephones: {
                            item: [
                                {
                                    phoneNumber: this.isGuestUser ? this.phone : this.contactInfo.phone,
                                    phoneType: "Mobile",
                                    isPrimary: true
                                }
                            ]
                        },
                        emailAddresses: {
                            item: [
                                {
                                    emailAddress: this.isGuestUser ? this.email : this.contactInfo.email,
                                    isPrimary: true
                                }
                            ]
                        }
                    }
                ]
            },
            communicationPreferences: this.communicationPreferences,
            userId: this.frontierUserId,
            contactInfo: {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                contactPhone: this.phone
            }
        };

        this.calloutData = data;
        console.log("Soft CC request", data);
        let apiResponse;
        callEndpoint({ inputMap: data })
            .then((response) => {
                apiResponse = response;
                let responseParsed = JSON.parse(response);
                this.responseData = responseParsed;
                console.log("Soft CC response", responseParsed);
                this.creditScoreRating = responseParsed?.creditScore?.rating;
                let error = responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage =
                        responseParsed === ""
                            ? "Callout Method could not be found. Please contact Chuzo support."
                            : responseParsed.hasOwnProperty("error")
                            ? responseParsed.error.hasOwnProperty("provider")
                                ? responseParsed.error.provider.message.hasOwnProperty("message")
                                    ? responseParsed.error.provider.message.message
                                    : responseParsed.error.provider.message
                                : responseParsed.error
                            : responseParsed.result.error.provider.message.hasOwnProperty("message")
                            ? responseParsed.result.error.provider.message.message
                            : responseParsed.result.error.provider.message;
                    const finalErrorMessage = errorMessage !== "" ? errorMessage : "Internal Server Error";
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: finalErrorMessage
                    });
                    this.loaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(`${finalErrorMessage}\nAPI Response: ${response}`, data, path, "API Error");
                } else {
                    if (this.creditScoreRating != "Z" && this.creditScoreRating != "P") {
                        if (
                            responseParsed.hasOwnProperty("redFlags") &&
                            responseParsed.redFlags !== undefined &&
                            responseParsed.redFlags !== null &&
                            responseParsed.redFlags.some((item) => item.reason.code === "03")
                        ) {
                            this.handleShowCCPreviousAddressCheckModal();
                        } else {
                            this.saveOrder();
                        }
                    } else {
                        let myData = {
                            partnerName: "frapi",
                            path: "getCustomerDataFinal",
                            userId: this.frontierUserId,
                            quoteId: this.quoteId,
                            accountUuid: this.accountUuid
                        };

                        console.log("get Customer Final Data request", myData);
                        callEndpoint({ inputMap: myData })
                            .then((response) => {
                                apiResponse = response;
                                let parsedResponse = JSON.parse(response);
                                console.log("get Customer Final Data response", parsedResponse);
                                this.rowIdObject = parsedResponse.rowidObject;
                                this.itemRowIdObject = parsedResponse.contacts?.item[0].rowidObject;
                                this.partyPersonRowidObject = parsedResponse.contacts?.item[0].PartyPerson_rowidObject;
                                this.creditPersonRowidObject =
                                    parsedResponse.contacts?.item[0].PartyPerson_CreditPerson_1_rowidObject;

                                this.handleSSNRequiredModal();
                                this.loaderSpinner = false;
                            })
                            .catch((error) => {
                                console.error(error, "ERROR");
                                const genericErrorMessage =
                                    "Your credit check could not be completed. Please try again.";
                                const event = new ShowToastEvent({
                                    title: "Credit Check Situation",
                                    variant: "error",
                                    mode: "sticky",
                                    message: genericErrorMessage
                                });
                                this.dispatchEvent(event);
                                if (apiResponse) {
                                    this.logError(
                                        `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                                        myData,
                                        "getCustomerDataFinal",
                                        "API Error"
                                    );
                                } else {
                                    const errMsg = error.body?.message || error.message;
                                    this.logError(errMsg);
                                }
                                this.loaderSpinner = false;
                            });
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = "Your credit check could not be completed. Please try again.";
                const event = new ShowToastEvent({
                    title: "Credit Check Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, data, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
                this.loaderSpinner = false;
            });
    }

    handleCallCC() {
        if (this.hardStop) {
            this.handleShowCCQuoteAssistanceModal();
            this.loaderSpinner = false;
        } else {
            this.loaderSpinner = true;
            if (this.creditCheckAttempts < 3) {
                this.creditCheckAttempts = this.creditCheckAttempts + 1;
            } else {
                const event = new ShowToastEvent({
                    title: "Credit Check Limit",
                    variant: "error",
                    mode: "sticky",
                    message: "Maximum number of Credit Check attempts reached."
                });
                this.dispatchEvent(event);
                this.attempts = this.creditCheckAttempts;
                this.noCompleteInfo = true;
                this.updateOpp();
                this.loaderSpinner = false;
                return;
            }
            if (this.skipCreditCheck) {
                this.saveOrder();
            } else if (this.skipCreditCheck === false) {
                const path = "creditCheck";
                let data = {
                    partnerName: "frapi",
                    tab: "creditcheck",
                    path,
                    quoteId: this.quoteId,
                    accountUuid: this.accountUuid,
                    cart: this.cart,
                    customer: {
                        accountName: this.firstName + " " + this.lastName,
                        firstName: this.firstName,
                        lastName: this.lastName
                    },
                    account: {
                        billingAddress: {
                            addressLine1: this.shippingAddress,
                            addressLine2: "",
                            city: this.shippingCity,
                            state: this.shippingState,
                            zipCode: this.shippingZip
                        },
                        refuseSSN: false,
                        ssn: this.ssn,
                        dob: this.DOB,
                        rowidObject: this.rowIdObject
                    },
                    paymentProfile: this.paymentProfile,
                    contacts: {
                        item: [
                            {
                                rowidObject: this.itemRowIdObject,
                                PartyPersonRowidObject: this.partyPersonRowidObject,
                                PartyPersonCreditPerson1RowidObject: this.creditPersonRowidObject,
                                primary: true,
                                fullName: this.isGuestUser
                                    ? `${this.firstName} ${this.lastName}`
                                    : `${this.contactInfo.firstName} ${this.contactInfo.lastName}`,
                                firstName: this.isGuestUser ? this.firstName : this.contactInfo.firstName,
                                lastName: this.isGuestUser ? this.lastName : this.contactInfo.lastName,
                                telephones: {
                                    item: [
                                        {
                                            phoneNumber: this.isGuestUser ? this.phone : this.contactInfo.phone,
                                            phoneType: "Mobile",
                                            isPrimary: true
                                        }
                                    ]
                                },
                                emailAddresses: {
                                    item: [
                                        {
                                            emailAddress: this.isGuestUser ? this.email : this.contactInfo.email,
                                            isPrimary: true
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    communicationPreferences: this.communicationPreferences,
                    userId: this.frontierUserId,
                    contactInfo: {
                        firstName: this.firstName,
                        lastName: this.lastName,
                        email: this.email,
                        contactPhone: this.phone
                    }
                };

                this.calloutData = data;
                console.log("CC Callout handleCallCC", data);
                let apiResponse;
                callEndpoint({ inputMap: data })
                    .then((response) => {
                        apiResponse = response;
                        const responseParsed = JSON.parse(response);
                        console.log("CC Response", responseParsed);
                        this.creditScoreRating = responseParsed?.creditScore?.rating;
                        let error = responseParsed.hasOwnProperty("error");
                        if (error) {
                            let errorMessage =
                                responseParsed === ""
                                    ? "Callout Method could not be found. Please contact Chuzo support."
                                    : responseParsed.hasOwnProperty("error")
                                    ? responseParsed.error.hasOwnProperty("provider")
                                        ? responseParsed.error.provider.message.hasOwnProperty("message")
                                            ? responseParsed.error.provider.message.message
                                            : responseParsed.error.provider.message
                                        : responseParsed.error
                                    : responseParsed.result.error.provider.message.hasOwnProperty("message")
                                    ? responseParsed.result.error.provider.message.message
                                    : responseParsed.result.error.provider.message;
                            const finalErrorMessage = errorMessage !== "" ? errorMessage : "Internal Server Error";
                            const event = new ShowToastEvent({
                                title: "Error",
                                variant: "error",
                                mode: "sticky",
                                message: finalErrorMessage
                            });
                            this.loaderSpinner = false;
                            this.dispatchEvent(event);
                            this.logError(`${finalErrorMessage}\nAPI Response: ${response}`, data, path, "API Error");
                        } else {
                            if (responseParsed.creditScore.rating == "Z") {
                                this.responseData = responseParsed;
                                this.disableValidations();
                                const event = new ShowToastEvent({
                                    title: "PosId Verification",
                                    variant: "error",
                                    mode: "sticky",
                                    message: this.labels.POS_ID_MESSAGE
                                });
                                this.dispatchEvent(event);
                                this.logError(
                                    `${this.labels.POS_ID_MESSAGE}\nAPI Response: ${response}`,
                                    data,
                                    path,
                                    "API Error"
                                );
                                let myData = {
                                    ContextId: this.recordId
                                };
                                saveCreditFreeze({ myData: myData })
                                    .then((saveCreditFreezeResponse) => {
                                        this.loaderSpinner = false;
                                        console.log("saveCreditFreeze :", saveCreditFreezeResponse);
                                        if (this.validationSSNtry <= this.fraudLimit) {
                                            if (this.validationSSNtry == 0 || this.ssn !== this.ssnValidation) {
                                                this.validationSSNtry = this.validationSSNtry + 1;
                                                this.ssnValidation = this.ssn;
                                            }
                                        }
                                        if (this.validationSSNtry > this.fraudLimit) {
                                            this.handleSSNTriesLimitModal();
                                        }
                                        this.hardStop = true;
                                        return;
                                    })
                                    .catch((error) => {
                                        console.error(error, "ERROR");
                                        this.logError(error.body?.message || error.message);
                                        this.loaderSpinner = false;
                                        return;
                                    });
                            } else if (responseParsed.creditScore.rating == "P") {
                                if (
                                    responseParsed.fraudPrevention !== undefined &&
                                    Object.keys(responseParsed.fraudPrevention).length !== 0
                                ) {
                                    if (responseParsed.fraudPrevention.securityChallengeQuestions?.length > 0) {
                                        this.loaderSpinner = false;
                                        this.responseData = responseParsed;
                                        this.handleShowCCScorePModal();
                                    }
                                } else {
                                    this.loaderSpinner = false;
                                    this.disableValidations();
                                    const event = new ShowToastEvent({
                                        title: "PosId Verification",
                                        variant: "error",
                                        mode: "sticky",
                                        message: this.labels.POS_ID_MESSAGE
                                    });
                                    this.dispatchEvent(event);
                                }
                            } else if (
                                responseParsed.hasOwnProperty("redFlags") &&
                                responseParsed.redFlags !== undefined &&
                                responseParsed.redFlags !== null &&
                                responseParsed.redFlags.some((item) => item.reason.code === "03")
                            ) {
                                this.handleShowCCPreviousAddressCheckModal();
                            } else {
                                this.saveOrder();
                            }
                        }
                    })
                    .catch((error) => {
                        console.error(error, "ERROR");
                        const genericErrorMessage = "Your credit check could not be completed. Please try again.";
                        const event = new ShowToastEvent({
                            title: "Credit Check Situation",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                        if (apiResponse) {
                            this.logError(
                                `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                                data,
                                path,
                                "API Error"
                            );
                        } else {
                            const errMsg = error.body?.message || error.message;
                            this.logError(errMsg);
                        }
                        this.loaderSpinner = false;
                    });
            }
        }
    }

    handleCreditCheckPassedEvent() {
        if (this.calloutData !== undefined) {
            this.loaderSpinner = true;
            this.saveOrder();
        } else {
            let msg = "The credit check request could not be made correctly to the server. Please, try later.";
            const event = new ShowToastEvent({
                title: "Server Error",
                variant: "error",
                mode: "sticky",
                message: msg
            });
            this.dispatchEvent(event);
            this.logError(msg);
        }
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleShowCCScorePModal() {
        creditCheckScorePModal
            .open({
                responseData: this.responseData,
                frontierUserId: this.frontierUserId,
                quoteId: this.quoteId,
                accountUuid: this.accountUuid,
                onchallengequestionsverified: () => this.handleCreditCheckPassedEvent(),
                onpreviousaddress: () => this.handleShowCCPreviousAddressCheckModal(),
                onlogerror: (event) => this.handleLogError(event)
            })
            .then(() => {});
    }

    handleCommunicationPreferences(event) {
        switch (event.target.name) {
            case "BillReadyNotification_email":
                this.communicationPreferences.item[0].optIn = event.target.checked;
                break;
            case "AccountInformation_email":
                this.communicationPreferences.item[1].optIn = event.target.checked;
                break;
            case "ServiceUpdates_email":
                this.communicationPreferences.item[2].optIn = event.target.checked;
                break;
            case "MarketingPromotions_email":
                this.communicationPreferences.item[3].optIn = event.target.checked;
                break;
            case "AccountInformation_mobile":
                this.communicationPreferences.item[4].optIn = event.target.checked;
                break;
            case "ServiceUpdates_mobile":
                this.communicationPreferences.item[5].optIn = event.target.checked;
                break;
            case "MarketingPromotions_mobile":
                this.communicationPreferences.item[6].optIn = event.target.checked;
                break;
        }
        this.disableValidations();
    }

    handleShowCCPreviousAddressCheckModal() {
        this.loaderSpinner = false;
        creditCheckPreviousAddressCheckModal
            .open({
                responseData: this.responseData,
                frontierUserId: this.frontierUserId,
                onpreviousaddressverified: () => this.saveOrder(),
                onlogerror: (event) => this.handleLogError(event)
            })
            .then(() => {});
    }

    handleShowCCQuoteAssistanceModal(event) {
        this.showCreditCheckQuoteAssistanceModal = true;
        this.pCreditScore = event?.detail.creditScore;
    }

    handleCloseCCQuoteAssistanceModal(event) {
        if (this.pCreditScore === "Z" || this.creditScoreRating === "Z") {
            this.handleCancel();
        } else {
            this.showCreditCheckQuoteAssistanceModal = false;

            switch (event.detail) {
                case "confirm":
                    this.skipCreditCheck = true;
                    this.saveOrder();
                    break;
                case "stop":
                    this.hardStop = true;
                    break;
                default:
                    this.skipCreditCheck = false;
                    break;
            }
        }
    }

    saveOrder() {
        this.loaderSpinner = true;
        if (!this.calloutData) {
            this.calloutData = this.getCalloutData();
        }

        let data = this.calloutData;
        data.cart = this.cart;
        data.autoPayNode = { ...this.autoPayNode };
        data.autoPayDiscounts = [...this.autoPayDiscounts];
        data.quoteId = this.quoteId;
        data.accountUuid = this.accountUuid;
        let repType;

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

        let json = {
            ContextId: this.recordId,
            AccountId: this.accountId,
            ProductName: this.productSelected,
            isGuestUser: this.isGuestUser,
            consent: false,
            phone: this.phone,
            email: this.email,
            family: "Frontier",
            representative: repType,
            Pricebook: "Standard Price Book",
            timeStamp: new Date(),
            creditCheck: {
                accountDetails: {
                    billingCreditCheckAddress: {
                        billingAddress: this.billingAddress !== undefined ? this.billingAddress : this.shippingAddress,
                        billingAptNumber: this.billingApt !== undefined ? this.billingApt : this.shippingApt,
                        billingCity: this.billingCity !== undefined ? this.billingCity : this.shippingCity,
                        billingState: this.billingState !== undefined ? this.billingState : this.shippingState,
                        billingZip: this.billingZip !== undefined ? this.billingZip : this.shippingState
                    },
                    shippingServiceAddresss: {
                        shippingAddress: this.shippingAddress,
                        shippingAptNumber: this.shippingApt,
                        shippingCity: this.shippingCity,
                        shippingZip: this.shippingState,
                        shippingState: this.shippingState
                    }
                }
            },
            identification: "Social Security Number"
        };

        if (this.isGuestUser && this.referralCodeData) {
            json.referralCodeId = this.referralCodeData.Id || this.referralCodeData.referralCodeId;
        }

        console.log("IPSaveOrderDTV callout: ", json);
        IPSaveOrderDTV({ myData: json })
            .then((response) => {
                console.log("IPSaveOrderDTV :", response);
                this.orderId = response.result.Order.Id;
                this.orderItemId = response.result.OrderItem.Id;
                let info = {
                    ContextId: this.recordId
                };
                if (this.isGuestUser) {
                    data.orderId = this.orderId;
                    data.orderItemId = this.orderItemId;
                    data.referenceNumber = this.referenceNumber;
                    data.paymentAttempts = this.attempts;
                    data.manualCreditCheck = this.skipCreditCheck;
                    const nextEvent = new CustomEvent("creditcheckpassed", {
                        detail: data
                    });
                    this.dispatchEvent(nextEvent);
                    this.loaderSpinner = false;
                } else {
                    saveACICreditCheck({ myData: info })
                        .then((response) => {
                            data.orderId = this.orderId;
                            data.orderItemId = this.orderItemId;
                            data.referenceNumber = this.referenceNumber;
                            data.paymentAttempts = this.attempts;
                            data.manualCreditCheck = this.skipCreditCheck;
                            const nextEvent = new CustomEvent("creditcheckpassed", {
                                detail: data
                            });
                            this.dispatchEvent(nextEvent);
                            this.loaderSpinner = false;
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
                            this.loaderSpinner = false;
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
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    updateOpp() {
        let myData = {
            Id: this.recordId,
            creditCheckLimitReached: true
        };
        updateOpportunity({ myData: myData })
            .then((response) => {
                let status = response.result.status;
                if (!status) {
                    this.loaderSpinner = false;
                    console.log(error);
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: response.result.error
                    });
                    this.dispatchEvent(event);
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
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

    getCalloutData() {
        const path = "creditCheck";
        return {
            partnerName: "frapi",
            tab: "creditcheck",
            path,
            quoteId: this.quoteId,
            accountUuid: this.accountUuid,
            cart: this.cart,
            customer: {
                accountName: this.firstName + " " + this.lastName,
                firstName: this.firstName,
                lastName: this.lastName
            },
            account: {
                billingAddress: {
                    addressLine1: this.shippingAddress,
                    addressLine2: "",
                    city: this.shippingCity,
                    state: this.shippingState,
                    zipCode: this.shippingZip
                },
                refuseSSN: true,
                dob: this.DOB
            },
            paymentProfile: this.paymentProfile,
            contacts: {
                item: [
                    {
                        primary: true,
                        fullName: this.isGuestUser
                            ? `${this.firstName} ${this.lastName}`
                            : `${this.contactInfo.firstName} ${this.contactInfo.lastName}`,
                        firstName: this.isGuestUser ? this.firstName : this.contactInfo.firstName,
                        lastName: this.isGuestUser ? this.lastName : this.contactInfo.lastName,
                        telephones: {
                            item: [
                                {
                                    phoneNumber: this.isGuestUser ? this.phone : this.contactInfo.phone,
                                    phoneType: "Mobile",
                                    isPrimary: true
                                }
                            ]
                        },
                        emailAddresses: {
                            item: [
                                {
                                    emailAddress: this.isGuestUser ? this.email : this.contactInfo.email,
                                    isPrimary: true
                                }
                            ]
                        }
                    }
                ]
            },
            communicationPreferences: this.communicationPreferences,
            userId: this.frontierUserId,
            contactInfo: {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                contactPhone: this.phone
            }
        };
    }

    handleSSNTriesLimitModal() {
        chuzo_modalGeneric
            .open({
                content: {
                    title: "Security Warning",
                    body: SSN_LIMIT_ERROR_MESSAGE,
                    provider: "frontier",
                    agreeLabel: "Continue",
                    canClose: true
                }
            })
            .then(() => {
                this.setFraudFlag();
            });
    }

    setFraudFlag() {
        const myData = {
            ContextId: this.recordId
        };

        setFraudFlag({ myData })
            .then(() => {
                this.handleCancel();
            })
            .catch((error) => {
                console.error(error, "Error flagging Opportunity");
                this.logError(error.body?.message || error.message);
            });
    }

    handleSSNRequiredModal() {
        chuzo_modalGeneric
            .open({
                content: {
                    title: "Credit Check",
                    body: SSN_REQUIRED_MESSAGE,
                    provider: "frontier",
                    agreeLabel: "Confirm",
                    canClose: true
                }
            })
            .then(() => {
                this.showSSNCheck = true;
            });
    }

    saveAccountInformation() {
        const data = {
            accName: this.firstName + " " + this.lastName,
            ContextId: this.recordId,
            recordTypeName: "Consumer",
            consent: this.contactConsent,
            creditCheck: {
                customerDetails: {
                    contactInformation: {
                        firstName: this.firstName,
                        middleName: this.middleName,
                        lastName: this.lastName,
                        email: this.email,
                        contactPhone: this.phone
                    }
                },
                accountDetails: {
                    billingCreditCheckAddress: {
                        billingAddress: this.billingAddress,
                        billingAptNumber: this.billingApt,
                        billingCity: this.billingCity,
                        billingState: this.billingState,
                        billingStateName: this.billingState, // TODO
                        billingZip: this.billingZip
                    },
                    shippingServiceAddresss: {
                        shippingAddress: this.shippingAddress,
                        shippingAptNumber: this.shippingApt,
                        shippingCity: this.shippingCity,
                        shippingZip: this.shippingZip,
                        shippingState: this.shippingState,
                        shippingStateName: this.shippingState // TODO
                    }
                }
            }
        };

        return saveAccountInformation({ myData: data })
            .then((response) => {
                if (response.result.error) {
                    console.error(response.result.errorMessage);
                    const event = new ShowToastEvent({
                        title: "Error",
                        mode: "sticky",
                        variant: "error",
                        message: "The Phone or Address information is already associated with another customer"
                    });
                    this.dispatchEvent(event);
                } else {
                    this._accountId = response.result.Account.Id;
                    // let contactInfo = data.creditCheck.customerDetails.contactInformation;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Credit Check",
            component: "poe_lwcSelfServiceFrontierCreditCheckTab",
            error: errorMessage
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
            tab: "Credit Check"
        };
        this.dispatchEvent(event);
    }
}