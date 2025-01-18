import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { NavigationMixin } from "lightning/navigation";
import { loadScript } from "lightning/platformResourceLoader";
import myLib from "@salesforce/resourceUrl/forge";
import DTVHighRiskCustomer from "@salesforce/label/c.DTV_High_Risk_Customer";
import SMS_VERBIAGE from "@salesforce/label/c.POE_sms_verbiage";
import PHONE_DISCLAIMER from "@salesforce/label/c.POE_phone_disclaimer";
import PHONE_DISCLAIMER2 from "@salesforce/label/c.POE_phone_disclaimer2";
import updateOpportunity from "@salesforce/apex/CreditCheckTabController.updateOpportunity";
import getAccountOnProbation from "@salesforce/apex/CreditCheckTabController.getAccountOnProbation";
import getSSNFraudRules from "@salesforce/apex/CreditCheckTabController.getSSNFraudRules";
import saveCreditFreeze from "@salesforce/apex/CreditCheckTabController.saveCreditFreeze";
import getIPStackSettings from "@salesforce/apex/InfoTabController.getIPStackSettings";
import saveFlagIP from "@salesforce/apex/CreditCheckTabController.saveFlagIP";
import getOppSensitiveData from "@salesforce/apex/CreditCheckTabController.getOppSensitiveData";
import saveACICreditCheck from "@salesforce/apex/CreditCheckTabController.saveACICreditCheck";
import IPSaveOrderDTV from "@salesforce/apex/CreditCheckTabController.IPSaveOrderDTV";
import sendPCISMS from "@salesforce/apex/CreditCheckTabController.sendPCISMS";
import sendCreditCheckPciEmail from "@salesforce/apex/CreditCheckTabController.sendCreditCheckPciEmail";
import customerReachedCap from "@salesforce/apex/CreditCheckTabController.customerReachedCap";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import setSSNAgreement from "@salesforce/apex/CreditCheckTabController.setSSNAgreement";
import getDTVAddressRegExApex from "@salesforce/apex/InfoTabController.getDTVAddressRegEx";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import capReachedError from "@salesforce/label/c.Order_Cap_Reached_Body";
import POE_DTV_Address_Regex_ErrorMessage from "@salesforce/label/c.POE_DTV_Address_Regex_ErrorMessage";
import POE_DTV_Address_Partial_Match_Modal_Message from "@salesforce/label/c.POE_DTV_Address_Partial_Match_Modal_Message";
import POE_DTV_Address_Partial_Match_Code_Description from "@salesforce/label/c.POE_DTV_Address_Partial_Match_Code_Description";
import CONSENT_DISCLAIMER from "@salesforce/label/c.Chuzo_Consent_Text";
import DTV_CONSENT_DISCLAIMER from "@salesforce/label/c.DTV_Consent_Text";
import DTV_CONSENT_SHOW from "@salesforce/label/c.DTV_Consent_Show";
import updateConsent from "@salesforce/apex/POE_TermsAndConditionsController.updateCommunicationConsent";

var stateNames = [
    { name: "Alabama", abbrev: "AL" },
    { name: "Alaska", abbrev: "AK" },
    { name: "Arizona", abbrev: "AZ" },
    { name: "Arkansas", abbrev: "AR" },
    { name: "California", abbrev: "CA" },
    { name: "Colorado", abbrev: "CO" },
    { name: "Connecticut", abbrev: "CT" },
    { name: "Delaware", abbrev: "DE" },
    { name: "District of Columbia", abbrev: "DC" },
    { name: "Florida", abbrev: "FL" },
    { name: "Georgia", abbrev: "GA" },
    { name: "Hawaii", abbrev: "HI" },
    { name: "Idaho", abbrev: "ID" },
    { name: "Illinois", abbrev: "IL" },
    { name: "Indiana", abbrev: "IN" },
    { name: "Iowa", abbrev: "IA" },
    { name: "Kansas", abbrev: "KS" },
    { name: "Kentucky", abbrev: "KY" },
    { name: "Louisiana", abbrev: "LA" },
    { name: "Maine", abbrev: "ME" },
    { name: "Maryland", abbrev: "MD" },
    { name: "Massachusetts", abbrev: "MA" },
    { name: "Michigan", abbrev: "MI" },
    { name: "Minnesota", abbrev: "MN" },
    { name: "Mississippi", abbrev: "MS" },
    { name: "Missouri", abbrev: "MO" },
    { name: "Montana", abbrev: "MT" },
    { name: "Nebraska", abbrev: "NE" },
    { name: "Nevada", abbrev: "NV" },
    { name: "New Hampshire", abbrev: "NH" },
    { name: "New Jersey", abbrev: "NJ" },
    { name: "New Mexico", abbrev: "NM" },
    { name: "New York", abbrev: "NY" },
    { name: "North Carolina", abbrev: "NC" },
    { name: "North Dakota", abbrev: "ND" },
    { name: "Ohio", abbrev: "OH" },
    { name: "Oklahoma", abbrev: "OK" },
    { name: "Oregon", abbrev: "OR" },
    { name: "Pennsylvania", abbrev: "PA" },
    { name: "Rhode Island", abbrev: "RI" },
    { name: "South Carolina", abbrev: "SC" },
    { name: "South Dakota", abbrev: "SD" },
    { name: "Tennessee", abbrev: "TN" },
    { name: "Texas", abbrev: "TX" },
    { name: "Utah", abbrev: "UT" },
    { name: "Vermont", abbrev: "VT" },
    { name: "Virginia", abbrev: "VA" },
    { name: "Washington", abbrev: "WA" },
    { name: "West Virginia", abbrev: "WV" },
    { name: "Wisconsin", abbrev: "WI" },
    { name: "Wyoming", abbrev: "WY" }
];

const INTERNAL_ERROR = "Internal Error";

export default class Poe_lwcBuyflowDirecTvEngaCreditCheckTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api orderInfo;
    @api cartInfo;
    @api clientInfo;
    @api logo;
    @api origin;
    @api accountId;
    @api order;
    @api returnUrl;
    @api billingInfo;
    @api fee;
    @api stream;
    @api isGuestUser;
    @api referralCodeData;
    @api addCartData;
    @api dealerOnProbation;
    loaderSpinner;
    cart = {
        orderNumber: "",
        todayCharges: [],
        hasToday: false,
        monthlyCharges: [],
        hasMonthly: false,
        monthlyTotal: 0.0,
        todayTotal: 0.0,
        firstBillTotal: (0.0).toFixed(2),
        hasFirstBill: false,
        firstBillCharges: [],
        hasSavings: false,
        savingsCharges: []
    };
    showModal = false;
    showModalFee = false;
    showModalHighRiskCustomer = false;
    noPersonalInformation = true;
    referenceNumber;
    ccShowSSN = true;
    ccSSN;
    ccDOB;
    ccDL;
    ccDLstate;
    ccDLexpDate;
    firstName;
    middleName;
    lastName;
    noAddressInformation = true;
    email;
    phone;
    billingAddress;
    billingApt;
    billingCity;
    billingState;
    billingZip;
    billingDetailsResponse;
    repeatSSN;
    sameSSN = false;
    DLstate;
    DLnumber;
    DLexpDate;
    noCompleteInfo = true;
    showSSNAgreement = true;
    agreementChecked = false;
    showBillingAddress = false;
    disclosureAgreement = false;
    isDL = false;
    SSNoptions = [
        { label: "SSN", value: "SSN" },
        { label: `Driver's License`, value: "DL" }
    ];
    SSNorDL = "SSN";
    states = [];
    method = "PCI";
    noContactInformation = true;
    validationSSNtry = 0;
    fraudLimit = 0;
    ssnValidation;
    ssnLimit = false;
    showCollateral = false;
    isCallCenterOrigin = false;
    creditFreeze = false;
    showPhoneVerbiage = false;
    showSMSVerbiage = false;
    phoneAgreement = false;
    smsAgreement = false;
    onProbation = false;
    label = {
        DTVHighRiskCustomer
    };
    clientIp;
    creditScore;
    radioOptions = [
        {
            label: "Yes",
            value: "yes"
        },
        {
            label: "No",
            value: "no"
        }
    ];
    methods = [
        {
            label: "PCI Link",
            value: "PCI"
        },
        {
            label: "Manual",
            value: "Manual"
        }
    ];
    radioOption;
    isDOBFormatted = false;
    orderId;
    orderItemId;
    isPCI = true;
    isStatementRead = true;
    paymentAttempts;
    creditCheckAttempts;
    isPreviousAddress = false;
    serviceAddress;
    preferredMethod;
    contactMethods = [
        {
            label: "Email",
            value: "EMAIL"
        },
        {
            label: "SMS",
            value: "SMS"
        },
        {
            label: "Telephone",
            value: "TELEPHONE"
        }
    ];
    encryptionKey;
    publicKey;
    verbiages = {};
    terms = [];
    treatmentCode;
    phoneDisclaimer = PHONE_DISCLAIMER;
    phoneDisclaimer2 = PHONE_DISCLAIMER2;
    hasOptedInSMS = false;
    ageError = false;
    expDateError = false;
    showPredictiveAddress = false;
    predictiveAddresses = [];
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        capReachedError,
        POE_DTV_Address_Regex_ErrorMessage,
        POE_DTV_Address_Partial_Match_Code_Description
    };
    showSelfServiceCancelModal = false;
    creditCheckModshowCapReachedModal = false;
    dtvAddressRegEx;
    partialMatchHardStop = [];
    contactConsentLabel = CONSENT_DISCLAIMER;
    dtvConsentLabel = DTV_CONSENT_DISCLAIMER;
    contactConsent = false;
    dtvConsent = false;
    showConsentRadio = DTV_CONSENT_SHOW === "show";
    creditCheckPilot = false;
    creditApplicationNumber;

    get disableSendSMSButton() {
        return !this.hasOptedInSMS;
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

    renderedCallback() {
        if (!this.isDOBFormatted && this.template.querySelector(".sensitive-input")) {
            const style = document.createElement("style");
            style.innerText = "input[name='ccDOB'] {-webkit-text-security: disc}";
            this.template.querySelector(".sensitive-input").appendChild(style);
            this.isDOBFormatted = true;
        }

        const ssnDobElement = this.template.querySelector('[data-id="ssnDOB"]');
        const dlDobElement = this.template.querySelector('[data-id="dlDOB"]');
        const dlExpDateElement = this.template.querySelector('[data-id="expDate"]');

        let ssnDobMsg = "",
            dlDobMsg = "",
            dlExpDateMsg = "";
        if (this.noCompleteInfo && this.ageError) {
            ssnDobMsg = "Must be over 18 years old";
            dlDobMsg = "Must be over 18 years old";
        } else if (this.noCompleteInfo && this.expDateError) {
            dlExpDateMsg = "Expiration date must be greater than today";
        }

        if (ssnDobElement) {
            ssnDobElement.setCustomValidity(ssnDobMsg);
            ssnDobElement.reportValidity();
        }
        if (dlDobElement) {
            dlDobElement.setCustomValidity(dlDobMsg);
            dlDobElement.reportValidity();
        }
        if (dlExpDateElement) {
            dlExpDateElement.setCustomValidity(dlExpDateMsg);
            dlExpDateElement.reportValidity();
        }
    }

    connectedCallback() {
        if (this.isGuestUser) {
            this.isPCI = false;
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.partialMatchHardStop = [...this.labels.POE_DTV_Address_Partial_Match_Code_Description.split(",")];
        this.loaderSpinner = true;
        this.creditCheckAttempts = 0;
        this.cart = { ...this.cartInfo };
        this.saveIP();
        let timeSlots = [];
        for (let i = 0; i < 24; i++) {
            let value;
            if (i < 12) {
                value = `${i.length == 1 ? "0" + i : i}:00 am to ${(i + 1).length == 1 ? "0" + i + 1 : i + 1}:00 ${
                    i === 11 ? "pm" : "am"
                }`;
            } else if (i == 12) {
                value = `12:00 pm to 01:00 pm`;
            } else {
                let pmValue = i - 12;
                value = `${pmValue.length == 1 ? "0" + pmValue : pmValue}:00 pm to ${
                    (pmValue + 1).length == 1 ? "0" + pmValue + 1 : pmValue + 1
                }:00 pm`;
            }
            let optionObject = {
                label: value,
                value
            };
            timeSlots.push(optionObject);
        }
        this.firstName = this.clientInfo.contactInfo.firstName;
        this.lastName = this.clientInfo.contactInfo.lastName;
        this.middleName = this.clientInfo.contactInfo.middleName;
        this.phone = this.clientInfo.contactInfo.phone;
        this.email = this.clientInfo.contactInfo.email;
        this.preferredMethod =
            this.clientInfo.contactInfo.method !== "" ? this.clientInfo.contactInfo.method : undefined;
        this.showMethodVerbiages(this.preferredMethod);
        this.billingCity = this.orderInfo.address.city;
        this.billingAddress = this.orderInfo.address.addressLine1;
        this.billingApt = this.orderInfo.address.hasOwnProperty("addressLine2")
            ? this.orderInfo.address.addressLine2
            : "";
        this.billingState = this.orderInfo.address.state;
        this.billingZip = this.orderInfo.address.zipCode;
        this.serviceAddress = `${this.billingAddress} ${this.billingApt}, ${this.billingCity}, ${this.billingState} ${this.billingZip}`;
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.states.push(option);
        });
        if (this.origin === "phonesales") {
            this.isCallCenterOrigin = true;
        }
        this.handlePersonalInformation();
        let myData = {
            ContextId: this.recordId,
            partner: "directv"
        };
        console.log("get SSN Fraud Rules Request", myData);
        getSSNFraudRules({ myData: myData })
            .then((response) => {
                console.log("get SSN Fraud Rules response", response);
                this.fraudLimit = response.result.limit;
                this.referenceNumber = response.result.refNum;
                this.paymentAttempts = response.result.attempts;
                this.encryptionKey = response.result.key;
                this.creditCheckPilot = response.result.pilot;
                loadScript(this, myLib)
                    .then(() => {
                        var pki = forge.pki;
                        this.publicKey = pki.publicKeyFromPem(this.encryptionKey);
                        this.handleCallCms();
                    })
                    .catch((error) => {
                        console.error(error);
                        this.logError(error.body?.message || error.message);
                    });
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
        this.getDTVAddressRegEx();
    }

    handleConsentChange(e) {
        if (e.target.name === "contactConsent") {
            this.contactConsent = e.target.checked;
        } else {
            this.dtvConsent = e.target.checked;
        }
    }

    showMethodVerbiages(value) {
        this.showSMSVerbiage = value === "SMS";
        this.showPhoneVerbiage = value === "TELEPHONE";
    }

    handleCallCms() {
        let contentDetails = [];
        let content = [
            "CREDIT_CHECK_DISCLOSURE",
            "contactInformation",
            "smsPreference",
            "TNC_AUTOPAY",
            "TNC_PAPERLESS_BILLING",
            "directvPolicy",
            "INSTALLATION_DISCLOSURE",
            "PAYMENT_DISCLOSURE",
            "TNC_RESIDENTIAL_AGREEMENT",
            "TNC_EQUIPMENT_LEASE_AGREEMENT",
            "TNC_DIRECTV_PRIVACYPOLICY",
            "TNC_NOTICE_CANCEL_AGREEMENT",
            "TNC_NOTICE_CANCEL_DISCLOSURE"
        ];
        content.forEach((item) => {
            let detail = {
                content: item,
                subChannel: this.orderInfo.subChannel,
                stateId: "ALL",
                systemId: "",
                channel: this.orderInfo.channel
            };
            contentDetails.push(detail);
        });
        const path = "cmsUrl";
        let myData = {
            path,
            systemCode: this.stream ? "ENGA-CHUZO" : this.orderInfo.systemCode,
            partnerName: "enga",
            correlationId: this.orderInfo.correlationId,
            contentDetails
        };
        console.log("CMSurl Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("CMSurl Response", result);
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
                    this.loaderSpinner = false;
                } else {
                    this.verbiages = {
                        creditCheck: result[0].cmsContent.split("<p>")[1].split("</p>")[0],
                        contactInformation: result[1].cmsContent,
                        smsPreference: result[2].cmsContent,
                        autoPay: result[3].cmsContent,
                        paperlessBilling: result[4].cmsContent,
                        directvPolicy: result[5].cmsContent,
                        serviceInstallation: result[6].cmsContent,
                        paymentDisclosure: result[7].cmsContent,
                        cancellationDisclosure: result[11].cmsContent,
                        cancellationAgreement: result[12].cmsContent
                    };
                    let terms = [
                        {
                            consentLabel: "DIRECTV Residential Customer Agreement",
                            consentText: result[8].cmsContent,
                            checked: false,
                            id: "RES-AGREEMENT"
                        },
                        {
                            consentLabel: "DIRECTV Equipment Lease Agreement",
                            consentText: result[9].cmsContent,
                            checked: false,
                            id: "LEASE-AGREEMENT"
                        },
                        {
                            consentLabel: "DIRECTV Video Apps and Device Privacy Policy",
                            consentText: result[10].cmsContent,
                            checked: false,
                            id: "VIDEO-APPS"
                        }
                    ];
                    this.terms = [...terms];
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The CMSurl request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    saveCreditFreeze() {
        let myData = {
            ContextId: this.recordId
        };
        saveCreditFreeze({ myData: myData })
            .then((response) => {
                console.log("save credit freeze response", response);
            })
            .catch((error) => {
                console.error("ERROR", error);
                const errorMessage = error.body?.message || error.message;
                this.logError(errorMessage);
            });
    }

    handleSSNValue() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId,
            value: this.agreementChecked
        };
        setSSNAgreement({ myData: myData })
            .then((response) => {
                console.log("Set SSN Agreement response", response);
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handleSSNorDL(event) {
        this.sameSSN = false;
        this.ccSSN = undefined;
        this.repeatSSN = undefined;
        this.ccDOB = undefined;
        this.ccDL = undefined;
        this.ccDLstate = undefined;
        this.ccDLexpDate = undefined;
        switch (event.target.value) {
            case "SSN":
                this.ccShowSSN = true;
                break;
            case "DL":
                this.ccShowSSN = false;
                break;
        }
        this.disableValidations();
    }

    handleSSNClick(event) {
        this.showSSNAgreement = false;
        this.disableValidations();
    }

    handlePersonalInformation() {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        let phonere = /^\d{10}$/;
        if (
            this.email !== undefined &&
            emailre.test(this.email) &&
            this.phone !== undefined &&
            phonere.test(this.phone) &&
            !this.showBillingAddress &&
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            this.preferredMethod !== undefined &&
            (!this.showPhoneVerbiage || (this.showPhoneVerbiage && this.phoneAgreement)) &&
            (!this.showSMSVerbiage || (this.showSMSVerbiage && this.smsAgreement))
        ) {
            this.noPersonalInformation = false;
        } else if (
            this.email !== undefined &&
            emailre.test(this.email) &&
            this.phone !== undefined &&
            phonere.test(this.phone) &&
            this.showBillingAddress &&
            this.billingAddress !== undefined &&
            this.billingState !== undefined &&
            this.billingZip !== undefined &&
            this.billingCity !== undefined &&
            this.validateAddressInputs() &&
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            this.preferredMethod !== undefined &&
            (!this.showPhoneVerbiage || (this.showPhoneVerbiage && this.phoneAgreement)) &&
            (!this.showSMSVerbiage || (this.showSMSVerbiage && this.smsAgreement))
        ) {
            this.noPersonalInformation = false;
        } else {
            this.noPersonalInformation = true;
        }
    }

    handleChange(event) {
        switch (event.target.name) {
            case "billingAddress":
                this.billingAddress = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "billingApt":
                this.billingApt = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "billingState":
                this.billingState = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "billingZip":
                this.billingZip = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "billingCity":
                this.billingCity = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "email":
                this.email = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "firstName":
                this.firstName = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "middleName":
                this.middleName = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "lastName":
                this.lastName = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "isPreviousAddress":
                this.isPreviousAddress = event.target.checked;
                break;
            case "preferredMethod":
                this.preferredMethod = event.target.value;
                this.showMethodVerbiages(event.target.value);
                break;
            case "phone":
                this.phone = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "phoneAgreement":
                this.phoneAgreement = event.target.checked;
                break;
            case "smsAgreement":
                this.smsAgreement = event.target.checked;
                break;
            case "hasOptedInSMS":
                this.hasOptedInSMS = event.detail.checked;
                break;
        }
        this.handlePersonalInformation();
        this.disableValidations();
    }

    disableValidations() {
        let ssnPattern = /^\d{9}$/;
        if (
            this.disclosureAgreement &&
            !this.noPersonalInformation &&
            (this.isCallCenterOrigin || (!this.isCallCenterOrigin && this.isStatementRead))
        ) {
            if (this.ccShowSSN) {
                if (!this.isPCI) {
                    this.handleSSNRepeatValidation();
                    const age = Math.floor((new Date() - new Date(this.ccDOB).getTime()) / 3.15576e10);
                    this.ageError = age < 18;

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
                    let age = Math.floor((new Date() - new Date(this.ccDOB).getTime()) / 3.15576e10);
                    this.ageError = age < 18;
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
                    if (!this.isPCI) {
                        let age = Math.floor((new Date() - new Date(this.ccDOB).getTime()) / 3.15576e10);
                        let invalidExpDate = new Date(this.ccDLexpDate) < new Date();

                        this.ageError = age < 18;
                        this.expDateError = invalidExpDate;
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
    }

    formatDOB() {
        const style = document.createElement("style");
        style.innerText = "input[name='ccDOB'] {-webkit-text-security: disc}";
        setTimeout(() => {
            this.template.querySelector(".sensitive-input").appendChild(style);
        }, 10);
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCancel() {
        if (this.returnUrl != undefined) {
            window.open(this.returnUrl, "_self");
        } else if (this.isGuestUser) {
            this.showSelfServiceCancelModal = true;
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
    hideSelfServiceModal() {
        this.showSelfServiceCancelModal = false;
    }

    selfServiceReturnToHomePage() {
        const goBackEvent = new CustomEvent("home", {
            detail: "",
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(goBackEvent);
    }

    handleBillingAddress(event) {
        this.showBillingAddress = event.target.checked;
        if (this.showBillingAddress) {
            this.billingCity = undefined;
            this.billingApt = undefined;
            this.billingAddress = undefined;
            this.billingState = undefined;
            this.billingZip = undefined;
        } else {
            this.billingCity = this.orderInfo.address.city;
            this.billingApt = this.orderInfo.address.addressLine2;
            this.billingAddress = this.orderInfo.address.addressLine1;
            this.billingState = this.orderInfo.address.state;
            this.billingZip = this.orderInfo.address.zipCode;
        }
        this.handlePersonalInformation();
        this.disableValidations();
    }

    saveIP() {
        if (this.isGuestUser) {
            return;
        }

        let myData = {};
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
                        myData = {
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

    handleApprove(event) {
        this.disclosureAgreement = event.target.value === "yes" ? true : false;
        this.disableValidations();
    }

    showWarning() {
        if (this.validationSSNtry == Number(this.fraudLimit) - 1) {
            const event = new ShowToastEvent({
                title: "Warning",
                variant: "warning",
                message:
                    "A different SSN is being run with the same name after a failed Credit Check, please verify this is a valid entry."
            });
            this.dispatchEvent(event);
        } else if (this.validationSSNtry == Number(this.fraudLimit)) {
            const event = new ShowToastEvent({
                title: "Warning",
                variant: "warning",
                message: "This is the last attempt to correctly identify the SSN, please verify this is a valid entry."
            });
            this.dispatchEvent(event);
        }
    }

    handleSSNChange(event) {
        let ssnPattern = /^\d{9}$/;
        switch (event.target.name) {
            case "SSN":
                this.ccSSN = event.target.value !== "" ? event.target.value : undefined;
                if (
                    ssnPattern.test(event.target.value) &&
                    event.target.value !== this.ssnValidation &&
                    this.firstName + this.lastName === this.nameValidation
                ) {
                    this.showWarning();
                }
                this.sameSSN = false;
                break;
            case "repeatSSN":
                this.repeatSSN = event.target.value !== "" ? event.target.value : undefined;
                this.sameSSN = false;
                break;
            case "DOB":
                this.ccDOB =
                    event.target.value !== "" && Date.parse(event.target.value) >= Date.parse("1916-01-01")
                        ? event.target.value
                        : undefined;
                break;
            case "DLstate":
                this.ccDLstate = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "DL":
                this.ccDL = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "DLexpDate":
                this.ccDLexpDate =
                    event.target.value !== "" && event.target.value !== null ? event.target.value : undefined;
                break;
        }
        this.disableValidations();
    }

    handleSSNRepeatValidation() {
        this.sameSSN = this.repeatSSN !== this.ccSSN ? true : false;
    }

    handleRefresh() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };
        getOppSensitiveData({ myData: myData })
            .then((response) => {
                let data = response.result !== undefined ? response.result : {};
                this.ccDOB = data.hasOwnProperty("ccDob") ? data.ccDob : undefined;
                this.ccSSN = !!data?.ccSSN ? data.ccSSN : undefined;
                this.ccShowSSN = !!this.ccSSN;
                if (!this.ccShowSSN) {
                    this.ccDL = data.hasOwnProperty("ccDriversLicenseNumber") ? data.ccDriversLicenseNumber : undefined;
                    this.ccDLexpDate = data.hasOwnProperty("ccDlExpirationDate") ? data.ccDlExpirationDate : undefined;
                    this.ccDLstate = data.hasOwnProperty("ccDlState") ? data.ccDlState : undefined;
                }
                this.disableValidations();
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handleSMS() {
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

    sendPCIEmail() {
        this.handleSSNValue();
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody = index[0] + "/s/pci-personal-info?c__ContextId=" + this.recordId;
        let myData = {
            pciEmail: this.email,
            body: mailBody
        };
        sendCreditCheckPciEmail({ myData: myData })
            .then((response) => {
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    message: "The email was sent correctly with a link to enter the personal information."
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
                    message: "The email could not be sent. Please, verify the email address and try again."
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    hideModal() {
        this.showModal = false;
    }

    hideModalHighRisk() {
        this.showModalHighRiskCustomer = false;
    }

    handleMethod(event) {
        this.ccSSN = undefined;
        this.repeatSSN = undefined;
        this.ccDOB = undefined;
        this.ccDL = undefined;
        this.ccDLstate = undefined;
        this.ccDLexpDate = undefined;
        if (event.target.value == "PCI") {
            this.isPCI = true;
            this.isStatementRead = true;
        } else {
            this.ccShowSSN = true;
            this.isPCI = false;
            this.isStatementRead = false;
        }
        this.disableValidations();
    }

    handleStatementRead(event) {
        this.isStatementRead = event.target.checked;
        this.disableValidations();
    }

    handleNext() {
        this.loaderSpinner = true;

        let data = {
            Email: this.email
        };

        console.log("Customer Cap Reached Request", data);
        customerReachedCap({ myData: data })
            .then((response) => {
                console.log("Customer Cap Reached response", response);
                let capReached = response.result.capReached;

                if (capReached) {
                    this.loaderSpinner = false;
                    this.showCapReachedModal = true;

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
                        this.loaderSpinner = false;
                        return;
                    }
                    if (this.stream) {
                        this.handleCreateUser();
                    } else {
                        this.callAddressValidate();
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

    handleCreateUser() {
        this.loaderSpinner = true;
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
                firstName: this.firstName,
                lastName: this.lastName,
                emailAddress: this.email,
                phoneNumber: this.phone
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
                    this.loaderSpinner = false;
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
                        this.loaderSpinner = false;
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
                this.loaderSpinner = false;
            });
    }

    callAddressValidate() {
        this.loaderSpinner = true;
        const path = "addressValidate";
        let requestInfo = { ...this.orderInfo };
        delete requestInfo.address;
        let myData = {
            path,
            address: {
                addressLine1: this.billingAddress,
                addressLine2: this.billingApt,
                city: this.billingCity,
                state: this.billingState,
                country: "US",
                zipCode: this.billingZip
            },
            addressType: "billing",
            urbanizationCode: "",
            attention: "",
            ...requestInfo,
            partnerName: this.stream ? "enga-stream" : "enga"
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
                    this.loaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    let data = this.stream ? result.payload.content : result.content;

                    if (data.matchStatus === "noMatch") {
                        const noMatchMessage = `Billing Address validation not successful: ${data.hostResponse.status.description}`;
                        const event = new ShowToastEvent({
                            title: "Address Validation",
                            variant: "error",
                            mode: "sticky",
                            message: noMatchMessage
                        });
                        this.dispatchEvent(event);
                        this.loaderSpinner = false;
                        this.logError(`${noMatchMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    } else if (data.matchStatus === "exactMatch") {
                        let address = data.matchedAddresses[0];
                        this.callAddAddress(requestInfo, address);
                    } else if (data.matchStatus === "partialMatch") {
                        let errorMessageUPS =
                            this.partialMatchHardStop.length > 0 &&
                            this.partialMatchHardStop.includes(data.hostResponse.status.code);
                        if (
                            errorMessageUPS &&
                            !(
                                data.hasOwnProperty("matchedAddresses") &&
                                data.matchedAddresses.length > 0 &&
                                data.matchedAddresses.some(
                                    (item) => item.locationDetail.postalSupplementalDetail.length > 0
                                )
                            )
                        ) {
                            const event = new ShowToastEvent({
                                title: "Address Validation",
                                variant: "error",
                                mode: "sticky",
                                message: POE_DTV_Address_Partial_Match_Modal_Message
                            });
                            this.dispatchEvent(event);
                            this.loaderSpinner = false;
                            this.logError(
                                `${POE_DTV_Address_Partial_Match_Modal_Message}\nAPI Response: ${response}`,
                                myData,
                                path,
                                "API Error"
                            );
                        } else if (
                            !errorMessageUPS ||
                            (errorMessageUPS &&
                                data.hasOwnProperty("matchedAddresses") &&
                                data.matchedAddresses.length > 0 &&
                                data.matchedAddresses.some(
                                    (item) => item.locationDetail.postalSupplementalDetail.length > 0
                                ))
                        ) {
                            let predictiveArray = [];
                            data.matchedAddresses.forEach((item) => {
                                let baseAddress = {
                                    address: {
                                        addressLine1: `${item.houseNumber} ${item.streetName}${
                                            item.hasOwnProperty("streetThoroughfare")
                                                ? ` ${item.streetThoroughfare}`
                                                : ""
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
                            this.showPredictiveAddress = true;
                            this.loaderSpinner = false;
                        }
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
                this.loaderSpinner = false;
            });
    }

    selectAddressHandler(event) {
        this.showPredictiveAddress = false;
        let addressInputs = event.detail.address;
        this.billingAddress = addressInputs.addressLine1;
        this.billingApt = addressInputs.addressLine2;
        this.billingCity = addressInputs.city;
        this.billingState = addressInputs.state;
        this.billingZip = addressInputs.zipCode;
        let requestInfo = { ...this.orderInfo };
        delete requestInfo.address;
        this.loaderSpinner = true;
        this.callAddressValidate();
    }

    hideAddressModal(event) {
        this.showPredictiveAddress = false;
    }

    callAddAddress(requestInfo, address) {
        const path = "addAddress";
        let myData = {
            path,
            ...requestInfo,
            address: {
                ...address,
                firstName: this.firstName,
                lastName: this.lastName,
                type: "billing",
                email: this.email,
                validatedIndicator: true,
                contactNumber: ""
            },
            partnerName: this.stream ? "enga-stream" : "enga"
        };
        if (this.stream) {
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
                    this.loaderSpinner = false;
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
                this.loaderSpinner = false;
            });
    }

    encryptionHandler(publicKey, bytes) {
        var encrypted = publicKey.encrypt(bytes, "RSA-OAEP", {
            md: forge.md.sha256.create(),
            mgf1: {
                md: forge.md.sha1.create()
            }
        });
        return btoa(encrypted);
    }

    getFormattedDate(data) {
        var date = new Date(data.replace(/-/g, "/").replace(/T.+/, ""));
        var year = date.getFullYear();
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : "0" + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : "0" + day;
        return month + "/" + day + "/" + year;
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
            encryptedPhone = await this.encryptionHandler(this.publicKey, this.phone);
            encryptedEmail = await this.encryptionHandler(this.publicKey, this.email);
            encryptedDOB = await this.encryptionHandler(this.publicKey, dateValue);
            encryptedDLNumber = this.ccDL !== undefined ? await this.encryptionHandler(this.publicKey, this.ccDL) : "";
            encryptedDLExpDate =
                this.ccDLexpDate !== undefined
                    ? await this.encryptionHandler(this.publicKey, this.getFormattedDate(this.ccDLexpDate))
                    : "";
            encryptedDLState =
                this.ccDLstate !== undefined ? await this.encryptionHandler(this.publicKey, this.ccDLstate) : "";
        } catch (error) {
            const event = new ShowToastEvent({
                title: "Server Error",
                variant: "error",
                mode: "sticky",
                message: "There was an error during the encryption of the information. Please try again."
            });
            this.dispatchEvent(event);
            this.loaderSpinner = false;
            this.logError(error.body?.message || error.message);
            return;
        }
        const path = "creditCheck";
        let myData = {
            path,
            systemCode: this.orderInfo.systemCode,
            correlationId: this.orderInfo.correlationId,
            dealerCorpId: this.orderInfo.dealerCorpId,
            dealerId: this.orderInfo.dealerId,
            dealerAgentId: this.orderInfo.dealerAgentId,
            dealerLocation: this.orderInfo.dealerLocation,
            uuid: this.orderInfo.uuid,
            sid: this.orderInfo.sid,
            channel: this.orderInfo.channel,
            partnerName: this.stream ? "enga-stream" : "enga",
            corpIdGroup: this.orderInfo.corpIdGroup,
            runCreditCheck: true,
            orderType: "NEW",
            creditCheckVersion: this.creditCheckPilot ? "v2" : "v1",
            customer: {
                firstName: this.firstName,
                middleName: this.middleName == null || this.middleName == undefined ? "" : this.middleName,
                lastName: this.lastName,
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
                addressLine1: this.billingAddress,
                addressLine2: this.billingApt !== undefined ? this.billingApt : "",
                city: this.billingCity,
                state: this.billingState,
                zipCode: this.billingZip
            };
        }
        if (!this.stream) {
            myData = {
                ...myData,
                dealerIdName: this.orderInfo.dealerId,
                wiringType: this.orderInfo.wiringType,
                callVuFlow: false,
                productType: "BEAM"
            };
        }
        if (this.creditCheckPilot) {
            myData.retry = !(this.creditApplicationNumber === undefined);
            if (this.creditApplicationNumber !== undefined) {
                myData.creditApplicationNumber = this.creditApplicationNumber;
            }
            myData.cartId = this.stream ? this.orderInfo.uuid : this.cart.orderNumber;
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
                    this.loaderSpinner = false;
                } else {
                    if (this.creditCheckPilot) {
                        this.handleCreditCheckPilotResponse(result, response, myData);
                    } else {
                        this.handleCreditCheckResponse(result, response, myData);
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
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    handleCreditCheckPilotResponse(result, response, myData) {
        this.creditApplicationNumber = result.creditApplicationNumber;
        if (Object.keys(result.creditResponse).length > 0) {
            if (result.hasOwnProperty("applicationStatus") && result.applicationStatus.toLowerCase() === "approved") {
                this.creditScore = result.creditResponse.creditInfo.riskClass;
                result.creditResponse.creditInfo.deals.forEach((deal) => {
                    if (!this.stream && deal.productType.toLowerCase() === "beam") {
                        this.treatmentCode = deal.treatmentCode;
                    } else if (this.stream && deal.productType.toLowerCase() === "stream") {
                        this.treatmentCode = deal.treatmentCode;
                    }
                });
                const sendNextEvent = new CustomEvent("updatetreatment", {
                    detail: this.treatmentCode
                });
                this.dispatchEvent(sendNextEvent);
                if (
                    (this.onProbation && this.creditScore == "HIGH") ||
                    ((this.creditScore == "HIGH" || this.creditScore == "UNKNOWN") &&
                        ((this.stream && this.dealerOnProbation.stream) ||
                            (!this.stream && this.dealerOnProbation.beam)))
                ) {
                    this.showModalHighRiskCustomer = true;
                    this.noCompleteInfo = true;
                    this.loaderSpinner = false;
                    return;
                }
                this.loaderSpinner = false;
                this.showModal = true;
            } else if (
                result.hasOwnProperty("applicationStatus") &&
                (result.applicationStatus.toLowerCase() === "in review" ||
                    result.applicationStatus.toLowerCase() === "new")
            ) {
                const errorMessage = `${result.creditResponse.responseInfo.message} Application Number: ${this.creditApplicationNumber}`;
                const event = new ShowToastEvent({
                    title: "Credit Check Failed",
                    variant: "error",
                    mode: "sticky",
                    message: errorMessage
                });
                this.dispatchEvent(event);
                this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, myData.path, "API Error");
                this.saveCreditFreeze();
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
                this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, myData, myData.path, "API Error");
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
            this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, myData, myData.path, "API Error");
        }
        this.loaderSpinner = false;
    }

    handleCreditCheckResponse(result, response, myData) {
        if (
            (!this.stream &&
                result.creditCheckResponse.creditInfo.dtvCreditData.treatmentMessage.toLowerCase() === "completed") ||
            (this.stream &&
                result.content.payload.cpCreditInfo.dtvCreditData.treatmentMessage.toLowerCase() === "completed")
        ) {
            if (
                (this.stream && result.content.status.toLowerCase() === "success") ||
                (!this.stream && result.creditCheckResponse.creditInfo.hasOwnProperty("creditClass"))
            ) {
                this.creditScore = this.stream
                    ? result.content.payload.creditInfo.creditClass
                    : result.creditCheckResponse.creditInfo.creditClass;
                this.treatmentCode = this.stream
                    ? result.content.payload.creditInfo.treatmentCode
                    : result.creditCheckResponse.creditInfo.dtvCreditData.treatmentCode;
                if (
                    (this.onProbation && this.creditScore == "HIGH") ||
                    ((this.creditScore == "HIGH" || this.creditScore == "UNKNOWN") &&
                        ((this.stream && this.dealerOnProbation.stream) ||
                            (!this.stream && this.dealerOnProbation.beam)))
                ) {
                    this.showModalHighRiskCustomer = true;
                    this.noCompleteInfo = true;
                    this.loaderSpinner = false;
                    return;
                }
                this.showModal = true;
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
                this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, myData, myData.path, "API Error");
                this.loaderSpinner = false;
            }
        } else {
            if (
                (this.stream &&
                    result.content.payload.creditInfo.status.toLowerCase() === "failure" &&
                    result.content.payload.cpCreditInfo.dtvCreditData.treatmentMessage !== null) ||
                (!this.stream &&
                    result.creditCheckResponse.creditInfo.dtvCreditData.treatmentMessage.toLowerCase() !== "completed")
            ) {
                const errorMessage = `${
                    this.stream
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
                this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, myData.path, "API Error");
                this.saveCreditFreeze();
                this.loaderSpinner = false;
            } else {
                const errorMessage = `${result.content.payload.creditInfo.error.message}`;
                const event = new ShowToastEvent({
                    title: "Credit Check Failed",
                    variant: "error",
                    mode: "sticky",
                    message: errorMessage
                });
                this.dispatchEvent(event);
                this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, myData.path, "API Error");
                this.loaderSpinner = false;
            }
        }
        this.loaderSpinner = false;
    }

    handleClick() {
        const path = "createUser";
        this.showModal = false;
        this.loaderSpinner = true;
        if (!this.stream) {
            let myData = {
                path,
                ...this.orderInfo,
                ccId: "NA",
                salesRepId: "NA",
                customer: {
                    firstName: this.firstName,
                    middleName: this.middleName == null || this.middleName == undefined ? "" : this.middleName,
                    lastName: this.lastName,
                    emailAddress: this.email,
                    phoneNumber: this.phone,
                    mobileAlertOptIn: true,
                    contactPhoneType: "CELL_PHONE",
                    alternateContactNumber: "",
                    alternateContactType: "",
                    preferredContactMethods: [this.preferredMethod]
                }
            };
            console.log("Create User Beam Request", myData);
            let apiResponse;
            callEndpoint({ inputMap: myData })
                .then((response) => {
                    apiResponse = response;
                    let result = JSON.parse(response);
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
                        this.loaderSpinner = false;
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
                            this.logError(
                                `${genericErrorMessage}\nAPI Response: ${response}`,
                                myData,
                                path,
                                "API Error"
                            );
                            this.loaderSpinner = false;
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
                        this.logError(
                            `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                            myData,
                            path,
                            "API Error"
                        );
                    } else {
                        const errorMessage = error.body?.message || error.message;
                        this.logError(errorMessage);
                    }
                    this.loaderSpinner = false;
                });
        } else {
            if (this.creditCheckPilot) {
                this.handleAddCart();
            } else {
                this.handleCartSummary();
            }
        }
    }

    handleAddCart() {
        const path = "addCart";
        let addCartData = { ...(this.addCartData?.body ? this.addCartData.body : this.addCartData) };
        let inputMap = {
            ...addCartData,
            path,
            selectedBaseOfferCode: this.orderInfo.componentCode,
            channelEligibility: {
                salesChannel: this.orderInfo.channel,
                salesSubChannel: this.orderInfo.subChannel,
                locationID: this.orderInfo.locationId,
                locationTypeID: this.orderInfo.locationTypeId,
                dealerCode: this.orderInfo.channelEligibility.dealerCode,
                directIntegrationPartnerName: "ENGA-CHUZO"
            }
        };
        console.log("Add Cart Stream Request", inputMap);
        let apiResponse;
        callEndpoint({ inputMap })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Add Cart Stream Response", result);
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
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, inputMap, path, "API Error");
                    this.loaderSpinner = false;
                } else {
                    if (result.content.payload.cartStatus.cartState.toLowerCase() === "complete") {
                        this.handleCartSummary();
                    } else {
                        const genericErrorMessage = "Cart couldn't be validated";
                        const event = new ShowToastEvent({
                            title: "Invalid Cart",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, inputMap, path, "API Error");
                        this.loaderSpinner = false;
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
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, inputMap, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.loaderSpinner = false;
            });
    }

    callBillingDetails() {
        this.loaderSpinner = true;
        const path = "addBillingAccount";
        let myData = {
            path,
            ...this.billingInfo.body,
            treatmentCode: this.treatmentCode,
            offerActionType: ["Acquisition"]
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
                    this.loaderSpinner = false;
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
                this.loaderSpinner = false;
            });
    }

    handleDOFee(billingDetails) {
        this.billingDetailsResponse = billingDetails;
        let feeNeeded = false;
        if (this.stream) {
            if (billingDetails.content.payload.orderPriceInfo.doFee > 0) {
                feeNeeded = true;
                this.loaderSpinner = false;
                this.fee =
                    billingDetails.content.payload.orderPriceInfo.doFeeWithTax > 0
                        ? Number(billingDetails.content.payload.orderPriceInfo.doFeeWithTax).toFixed(2)
                        : Number(billingDetails.content.payload.orderPriceInfo.doFee).toFixed(2);
                this.showModalFee = true;
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
                        this.loaderSpinner = false;
                        this.fee = Number(lineItem.price.subTotalAmount).toFixed(2);
                        this.showModalFee = true;
                        feeNeeded = true;
                    }
                }
            });
        }
        if (!feeNeeded) {
            this.saveOrder(this.accountId, billingDetails);
        }
    }

    handleCartSummary() {
        this.loaderSpinner = true;
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
                    this.loaderSpinner = false;
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
                this.loaderSpinner = false;
            });
    }

    getCustomerInfo() {
        let customer = {
            firstName: this.firstName,
            lastName: this.lastName,
            middleName: this.middleName == null || this.middleName == undefined ? "" : this.middleName,
            phone: this.phone,
            email: this.email,
            method: this.preferredMethod
        };
        return customer;
    }

    getBillingAddress() {
        let billingAddress = {
            addressLine1: this.billingAddress,
            addressLine2: this.billingApt,
            city: this.billingCity,
            state: this.billingState,
            country: "USA",
            zipCode: this.billingZip
        };
        return billingAddress;
    }

    saveOrder(accountId, billingResult) {
        if (this.order !== undefined) {
            this.loaderSpinner = true;
            let orderInfo = { ...this.orderInfo };
            orderInfo.billingAddress = { ...this.getBillingAddress };
            let info = {
                orderInfo,
                customer: { ...this.getCustomerInfo() },
                referenceNumber: this.referenceNumber,
                orderId: this.order,
                cart: this.cart,
                terms: this.terms,
                paymentAttempts: this.paymentAttempts,
                publicKey: this.publicKey,
                result: billingResult,
                treatmentCode: this.treatmentCode,
                payInFull: this.creditScore !== "LOW" && this.stream
            };
            if (this.dtvConsent) {
                this.handleSMSConsent(info);
            } else {
                this.handleMoveNext(info);
            }
        } else {
            this.loaderSpinner = true;
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
                AccountId: accountId,
                consent: this.contactConsent,
                isGuestUser: this.isGuestUser,
                ProductName: this.orderInfo.product.Name,
                family: "DirecTV",
                phone: this.phone,
                email: this.email,
                representative: repType,
                Pricebook: "Standard Price Book",
                timeStamp: new Date(),
                creditCheck: {
                    accountDetails: {
                        billingCreditCheckAddress: {
                            billingAddress: this.billingAddress,
                            billingAptNumber: this.billingApt,
                            billingCity: this.billingCity,
                            billingState: this.billingState,
                            billingZip: this.billingZip
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
            this.isGuestUser && !!this.referralCodeData ? (json.referralCodeId = this.referralCodeData?.Id) : undefined;

            console.log("Save Order Payload", json);
            IPSaveOrderDTV({ myData: json })
                .then((response) => {
                    console.log(response);
                    let orderInfo = { ...this.orderInfo };
                    orderInfo.billingAddress = { ...this.getBillingAddress() };
                    let info = {
                        orderInfo,
                        customer: { ...this.getCustomerInfo() },
                        referenceNumber: this.referenceNumber,
                        orderId: response.result.Order.Id,
                        orderItemId: response.result.OrderItem.Id,
                        cart: this.cart,
                        paymentAttempts: this.paymentAttempts,
                        publicKey: this.publicKey,
                        verbiages: this.verbiages,
                        terms: this.terms,
                        result: billingResult,
                        treatmentCode: this.treatmentCode,
                        payInFull: this.creditScore !== "LOW" && this.stream
                    };

                    if (this.isGuestUser) {
                        this.handleMoveNext(info);
                    } else {
                        const myData = {
                            ContextId: this.recordId
                        };
                        saveACICreditCheck({ myData })
                            .then((response) => {
                                if (this.dtvConsent) {
                                    this.handleSMSConsent(info);
                                } else {
                                    this.handleMoveNext(info);
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
                                this.loaderSpinner = false;
                                this.logError(error.body?.message || error.message);
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
                    this.loaderSpinner = false;
                    this.logError(error.body?.message || error.message);
                });
        }
    }

    handleSMSConsent(info) {
        const path = "updateConsent";
        let myData = {
            path,
            partnerName: this.stream ? "enga-stream" : "enga",
            systemCode: this.orderInfo.systemCode,
            correlationId: this.orderInfo.correlationId,
            uuid: this.orderInfo.uuid,
            sid: this.orderInfo.sid,
            phonenumber: this.phone,
            consents: [
                {
                    consentName: "SMSServiceCommunications",
                    transactionType: "YES"
                }
            ]
        };
        console.log("Update Consent Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Update Consent Response", result);
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
                    this.loaderSpinner = false;
                } else {
                    this.handleUpdateConsent(info);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The CMSurl request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    handleUpdateConsent(info) {
        updateConsent({ opportunityId: this.recordId })
            .then((response) => {
                this.handleMoveNext(info);
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error("ERROR", error);
            });
    }

    handleMoveNext(info) {
        const sendNextEvent = new CustomEvent("creditchecknext", {
            detail: info
        });
        this.dispatchEvent(sendNextEvent);
        this.loaderSpinner = false;
    }

    hideFeeModal(event) {
        this.showModalFee = false;
        if (event.detail.customerAgrees === true) {
            this.loaderSpinner = true;
            this.saveOrder(this.accountId, this.billingDetailsResponse);
        }
    }

    handleFeeModalModifyOrder() {
        this.showModalFee = false;
        this.handlePrevious();
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
                    this.logError(error.body?.message || error.message);
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

    getDTVAddressRegEx() {
        this.loaderSpinner = true;
        getDTVAddressRegExApex()
            .then((response) => {
                this.dtvAddressRegEx = new RegExp(response.result.dtvAddressRegEx);
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERROR
                });
                this.loaderSpinner = false;
            });
    }

    validateAddressInputs() {
        const isValidAddress =
            this.dtvAddressRegEx.test(this.billingAddress) &&
            this.dtvAddressRegEx.test(this.billingApt) &&
            this.dtvAddressRegEx.test(this.billingCity);
        if (!isValidAddress && this.showBillingAddress) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Invalid Address",
                    variant: "error",
                    mode: "sticky",
                    message: POE_DTV_Address_Regex_ErrorMessage
                })
            );
        }
        return isValidAddress;
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
            tab: "Customer Information"
        };
        this.dispatchEvent(event);
    }
}