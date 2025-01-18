import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { NavigationMixin } from "lightning/navigation";
import updateOpportunity from "@salesforce/apex/CreditCheckTabController.updateOpportunity";
import setSSNAgreement from "@salesforce/apex/CreditCheckTabController.setSSNAgreement";
import getSSNFraudRules from "@salesforce/apex/CreditCheckTabController.getSSNFraudRules";
import saveFlagIP from "@salesforce/apex/CreditCheckTabController.saveFlagIP";
import saveAccountInformation from "@salesforce/apex/CreditCheckTabController.saveAccountInformation";
import saveNewOrder from "@salesforce/apex/CreditCheckTabController.saveNewOrder";
import saveACICreditCheck from "@salesforce/apex/CreditCheckTabController.saveACICreditCheck";
import getOppSensitiveData from "@salesforce/apex/CreditCheckTabController.getOppSensitiveData";
import sendPCISMS from "@salesforce/apex/CreditCheckTabController.sendPCISMS";
import sendCreditCheckPciEmail from "@salesforce/apex/CreditCheckTabController.sendCreditCheckPciEmail";
import getIPStackSettings from "@salesforce/apex/InfoTabController.getIPStackSettings";
import getProviderPhoneNumber from "@salesforce/apex/CreditCheckTabController.getProviderPhoneNumber";
import saveCreditFreeze from "@salesforce/apex/CreditCheckTabController.saveCreditFreeze";
import customerReachedCap from "@salesforce/apex/CreditCheckTabController.customerReachedCap";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import MANUAL_REVIEW_MODAL_BODY from "@salesforce/label/c.Windstream_Manual_Review_Modal_Body";
import NATIONAL_AGENT_CHANNEL from "@salesforce/label/c.Windstream_Manual_Review_National_Agent_Channel";
import NATIONAL_RETAIL_CHANNEL from "@salesforce/label/c.Windstream_Manual_Review_National_Retail_Channel";
import DOOR_TO_DOOR_CHANNEL from "@salesforce/label/c.Windstream_Manual_Review_Door_To_Door_Channel";
import PHONE_DISCLAIMER from "@salesforce/label/c.POE_phone_disclaimer";
import PHONE_DISCLAIMER2 from "@salesforce/label/c.POE_phone_disclaimer2";
import SMS_VERBIAGE from "@salesforce/label/c.POE_sms_verbiage";
import PWRO_MESSAGE from "@salesforce/label/c.POE_Windstream_PWRO_Message";
import DEPOSIT_OR_AUTOPAY_REQUIRED_MESSAGE from "@salesforce/label/c.POE_Windstream_Deposit_Or_AutoPay_Required_Message";
import DEPOSIT_REQUIRED_MESSAGE from "@salesforce/label/c.POE_Windstream_Deposit_Required_Message";
import CREDIT_CHECK_LIMIT_MESSAGE from "@salesforce/label/c.POE_Windstream_Credit_Check_Limit_Message";
import WINDSTREAM_OPTIN_VERBIAGE from "@salesforce/label/c.POE_Windstream_OptIn_Verbiage";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import fakeSSNLimitMessage from "@salesforce/label/c.Windstream_Fake_SSN";
import capReachedError from "@salesforce/label/c.Order_Cap_Reached_Body";
import CONSENT_DISCLAIMER from "@salesforce/label/c.Self_Service_Consent_Text";
import Social_Security_Number_Request_Labels from "@salesforce/label/c.Social_Security_Number_Request_Labels";
import Windstream_customer_message_credit_check from "@salesforce/label/c.Windstream_customer_message_credit_check";
import Windstream_Customer_message_description_credit_check_label from "@salesforce/label/c.Windstream_Customer_message_description_credit_check_label";
import Credit_Check_1_Customer_Details_Title from "@salesforce/label/c.Credit_Check_1_Customer_Details_Title";
import Credit_Check_2_Account_Details_Title from "@salesforce/label/c.Credit_Check_2_Account_Details_Title";
import Windstream_Multiples_attempts from "@salesforce/label/c.Windstream_Multiples_attempts";
import Windstream_Credit_Check_3_Identification from "@salesforce/label/c.Windstream_Credit_Check_3_Identification";
import Windstream_SSN_dont_match from "@salesforce/label/c.Windstream_SSN_dont_match";
import Windstream_Send_Email_credit_check from "@salesforce/label/c.Windstream_Send_Email_credit_check";
import Windstream_Send_SMS_credit_check from "@salesforce/label/c.Windstream_Send_SMS_credit_check";
import Windstream_Refresh_Fields_credit_check from "@salesforce/label/c.Windstream_Refresh_Fields_credit_check";
import Windstream_Disclosure_credit_check from "@salesforce/label/c.Windstream_Disclosure_credit_check";
import Windstream_Determine_serviciability from "@salesforce/label/c.Windstream_Determine_serviciability";
import Windstream_must_be_over_18 from "@salesforce/label/c.Windstream_must_be_over_18";
import Windstream_Expiration_date_grater_than_today from "@salesforce/label/c.Windstream_Expiration_date_grater_than_today";
import Windstream_different_SSN from "@salesforce/label/c.Windstream_different_SSN";
import Windstream_last_attempts from "@salesforce/label/c.Windstream_last_attempts";
import Windstream_Callout_method from "@salesforce/label/c.Windstream_Callout_method";
import Windstream_Credit_Freeze from "@salesforce/label/c.Windstream_Credit_Freeze";
import Windstream_Credit_Check_could_not_be_made_correctly from "@salesforce/label/c.Windstream_Credit_Check_could_not_be_made_correctly";
import Windstream_already_exist_address_or_phone from "@salesforce/label/c.Windstream_already_exist_address_or_phone";
import Order_Creation_Generic_Error_Message from "@salesforce/label/c.Order_Creation_Generic_Error_Message";
import SMS_Sent_Successfully_Message from "@salesforce/label/c.SMS_Sent_Successfully_Message";
import POE_Send_SMS_Error_Message from "@salesforce/label/c.POE_Send_SMS_Error_Message";
import Windstream_email_sent_correctly from "@salesforce/label/c.Windstream_email_sent_correctly";
import POE_Send_Email_Error_Message from "@salesforce/label/c.POE_Send_Email_Error_Message";
import Windstream_credit_check_not_pass from "@salesforce/label/c.Windstream_credit_check_not_pass";
const stateNames = [
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

export default class Poe_lwcBuyflowWindstreamCreditCheckTab extends NavigationMixin(LightningElement) {
    @api cartInfo;
    @api cart;
    @api recordId;
    @api addressInfo;
    @api contactInfo;
    @api logo;
    @api origin;
    @api offerId;
    @api selectedProduct;
    @api addressApi;
    @api adderSelection;
    @api hasAutoPay;
    @api portabilityData;
    @api portability;
    @api selectedBuyFlow;
    @api preQualified;
    @api creditCheckLimitOfferId;
    @api isGuestUser;
    @api referralCodeData;
    @api additionalInfo;
    @api fakeSSNLimit;

    referenceNumber;
    loaderSpinner;
    cartCreditCheck;
    ccShowSSN = true;
    ccSSN;
    ccDOB;
    ccDL;
    ccDLstate;
    ccDLexpDate;
    _actionUtil;
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
    ssn;
    repeatSSN;
    sameSSN = false;
    DOB;
    DLstate;
    DLnumber;
    DLexpDate;
    noCompleteInfo = true;
    showSSNAgreement = true;
    agreementChecked = true;
    showBillingAddress = false;
    noShippingInformation = true;
    disclosureAgreement = false;
    isPCI = true;
    isDL = false;
    SSNoptions = [
        { label: "SSN", value: "SSN" },
        { label: `Driver's License`, value: "DL" }
    ];
    SSNorDL = "SSN";
    isManual;
    states = [];
    methods = [
        { label: "PCI Link", value: "PCI" },
        { label: "Manual", value: "Manual" }
    ];
    method = "PCI";
    noContactInformation = true;
    validationSSNtry = 0;
    validationAddressTry = 0;
    fraudLimit = 0;
    ssnValidation;
    addressValidation;
    nameValidation;
    nameAddressValidation;
    addressWarning = false;
    ssnLimit = false;
    recType;
    showCollateral = false;
    isCallCenterOrigin;
    addressDiscrepancy = false;
    creditFreeze = false;
    clientIp;
    skipInstallDateSelection = false;
    creditCheckResponseVerbiage;
    advanceDepositAmount;
    advancePaymentIndicator;
    showRequired;
    autoPayDecision;
    manualReview = false;
    adderChangedSelection = {};
    reviewPhoneNumber;
    shippingStateName;
    billingStateName;
    showManualReviewModal = false;
    manualReviewModalIsRichText = true;
    phoneDisclaimer = PHONE_DISCLAIMER;
    phoneDisclaimer2 = PHONE_DISCLAIMER2;
    showBuyflowHardStopModal = false;
    hardStopVerbiage;
    showCreditCheckLimitModal = false;
    creditCheckLimitVerbiage = CREDIT_CHECK_LIMIT_MESSAGE;
    hasOptedInSMS = false;
    forcedAutoPay = false;
    addAuthorizedContactValue;
    authorizedContactName;
    authorizedContactPhone;
    accountPin;
    customerNotes;
    optIn;
    optInVerbiage = WINDSTREAM_OPTIN_VERBIAGE;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        fakeSSNLimitMessage,
        capReachedError,
        Social_Security_Number_Request_Labels,
        Windstream_customer_message_credit_check,
        Windstream_Customer_message_description_credit_check_label,
        Credit_Check_1_Customer_Details_Title,
        Credit_Check_2_Account_Details_Title,
        Windstream_Multiples_attempts,
        Windstream_Credit_Check_3_Identification,
        Windstream_SSN_dont_match,
        Windstream_Send_Email_credit_check,
        Windstream_Send_SMS_credit_check,
        Windstream_Refresh_Fields_credit_check,
        Windstream_Disclosure_credit_check,
        Windstream_Determine_serviciability,
        Windstream_must_be_over_18,
        Windstream_Expiration_date_grater_than_today,
        Windstream_different_SSN,
        Windstream_last_attempts,
        Windstream_Callout_method,
        Windstream_Credit_Freeze,
        Windstream_Credit_Check_could_not_be_made_correctly,
        Windstream_already_exist_address_or_phone,
        Order_Creation_Generic_Error_Message,
        SMS_Sent_Successfully_Message,
        POE_Send_SMS_Error_Message,
        Windstream_email_sent_correctly,
        POE_Send_Email_Error_Message,
        Windstream_credit_check_not_pass
    };
    showSelfServiceCancelModal = false;
    fakeSSNCount;
    showFakeSSNModal = false;
    fakeSSNHardStop = false;
    creditCheckModshowCapReachedModal = false;
    addressOptions = {
        addressLabel: "Address",
        cityLabel: "City",
        cityPlaceHolder: undefined,
        countryDisabled: true,
        countryLabel: "Country",
        countryPlaceholder: undefined,
        fieldLevelHelp: undefined,
        postalCodeLabel: "Zip Code",
        postalCodePlaceholder: undefined,
        provinceLabel: "State",
        provincePlaceholder: undefined,
        required: true,
        showAddressLookup: true, // true
        streetLabel: "Street Address",
        streetPlaceholder: undefined,
        addressLine2Label: "Address Line 2",
        addressLine2Placeholder: undefined
    };
    showEmailPinValidatorModal = false;
    showSmsPinValidatorModal = false;
    emailValidated = false;
    phoneValidated = false;
    confirmedPins = {
        phone: "",
        email: ""
    };
    accountId;
    contactConsentLabel = CONSENT_DISCLAIMER;
    contactConsent = false;

    get disableEmailConfirmButton() {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;

        return !(this.email != undefined && emailre.test(this.email)) || this.emailValidated;
    }

    get disablePhoneConfirmButton() {
        let phonere = /^\d{10}$/;

        return !(this.phone != undefined && phonere.test(this.phone)) || this.phoneValidated;
    }

    get notPreQualified() {
        return !this.preQualified;
    }

    get agreementNotChecked() {
        return !this.agreementChecked;
    }

    get showAuthorizedContactFields() {
        return this.addAuthorizedContactValue == "yes";
    }

    get addAuthorizedContactOptions() {
        return [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" }
        ];
    }

    get optInOptions() {
        return [
            { label: "Yes", value: "Y" },
            { label: "No", value: "N" }
        ];
    }

    get disableSendSMSButton() {
        return this.noAddressInformation || !this.hasOptedInSMS;
    }

    get hasCreditCheckAttempt() {
        return this.offerId === this.creditCheckLimitOfferId && !this.preQualified;
    }

    get creditCheckData() {
        return {
            FirstName: this.firstName,
            LastName: this.lastName,
            MiddleName: this.middleName,
            FullName: this.firstName + this.lastName,
            Phone: this.phone,
            Email: this.email,
            ShippingStreet: this.shippingAddress,
            ShippingCity: this.shippingCity,
            ShippingState: this.shippingState,
            ShippingApt: this.shippingApt,
            SSN: this.isManual ? this.ssn : this.ccSSN,
            Birthdate: this.isManual ? this.DOB : this.ccDOB,
            DL: this.isManual ? this.DLnumber : this.ccDL,
            DLState: this.isManual ? this.DLstate : this.ccDLstate,
            DLExpirationDate: this.isManual ? this.DLexpDate : this.ccDLexpDate,
            BillingStreet: this.billingAddress,
            BillingCity: this.billingCity,
            BillingApt: this.billingApt,
            BillingState: this.billingState,
            ShippingZipCode: this.shippingZip,
            BillingZipCode: this.billingZip
        };
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        this.setAdditionalInfoFields();
        this.fakeSSNCount = this.fakeSSNLimit;
        this.showSSNAgreement = this.isGuestUser ? false : !this.preQualified;
        this.adderChangedSelection = { ...this.adderSelection };
        this.autoPayDecision = this.hasAutoPay;
        this.cartCreditCheck = { ...this.cart };
        this.getPhoneNumber();
        if (this.origin === "phonesales") {
            this.isCallCenterOrigin = true;
        }
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
            this.isManual = true;
            this.isPCI = false;
            this.method = "Manual";
        } else {
            this.saveIP();
        }
        this.firstName = this.contactInfo.firstName;
        this.lastName = this.contactInfo.lastName;
        this.phone = this.contactInfo.phone;
        if (this.portability && (this.phone === undefined || this.phone === null || this.phone === "")) {
            this.phone = this.portabilityData.PortinPhoneNumber;
        }
        this.email = this.contactInfo.email;
        this.shippingAddress = this.addressInfo.address;
        this.shippingApt = this.addressInfo.apt;
        this.shippingCity = this.addressInfo.city;
        this.shippingZip = this.addressInfo.zip;
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.states.push(option);
        });
        this.shippingState = this.addressInfo.state;
        this.shippingStateName =
            this.shippingState !== undefined ? stateNames.find((e) => e.abbrev == this.shippingState).name : undefined;
        this.billingAddress = this.addressInfo.address;
        this.billingApt = this.addressInfo.apt;
        this.billingCity = this.addressInfo.city;
        this.billingZip = this.addressInfo.zip;
        this.billingState = this.addressInfo.state;
        this.billingStateName =
            this.billingState !== undefined ? stateNames.find((e) => e.abbrev == this.billingState).name : undefined;
        this.getFraudRules();
        this.setAgreement();
    }

    handleConsentChange(e) {
        this.contactConsent = e.detail.checked;
    }

    setAdditionalInfoFields() {
        this.optIn = this.additionalInfo?.textMsgOptin || "Y";
        this.authorizedContactName = this.additionalInfo?.authorizedUserName || "";
        this.authorizedContactPhone = this.additionalInfo?.authorizedUserPhone || "";
        this.addAuthorizedContactValue =
            !!this.additionalInfo?.authorizedUserName && !!this.additionalInfo?.authorizedUserPhone ? "yes" : "no";
        this.accountPin = this.additionalInfo?.accountPin || "";
        this.customerNotes = this.additionalInfo?.customerRemarks || "";
    }

    getFraudRules() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId,
            partner: "windstream"
        };
        getSSNFraudRules({ myData })
            .then((response) => {
                this.fraudLimit = response.result.limit;
                this.referenceNumber = response.result.refNum;
                this.recType = response.result.recType;
                this.disableValidations();
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    setAgreement() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId,
            value: this.agreementChecked
        };
        setSSNAgreement({ myData })
            .then((response) => {
                console.log(response);
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handleSSNValue(event) {
        this.agreementChecked = event.target.checked;
    }

    handleMethod(event) {
        switch (event.target.value) {
            case "Manual":
                this.isManual = true;
                this.isPCI = false;
                break;
            case "PCI":
                this.isManual = false;
                this.isPCI = true;
                this.ccShowSSN = true;
                this.ccDOB = undefined;
                this.ccSSN = undefined;
                break;
        }
        this.disclosureAgreement = false;
    }

    handleSSNorDL(event) {
        switch (event.target.value) {
            case "SSN":
                this.isDL = false;
                this.disclosureAgreement = false;
                break;
            case "DL":
                this.isDL = true;
                this.disclosureAgreement = false;
                break;
        }
    }

    handleSSNClick(event) {
        this.showSSNAgreement = false;
        this.disableValidations();
    }

    handleChange(event) {
        switch (event.target.name) {
            case "firstName":
                this.firstName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "middleName":
                this.middleName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "lastName":
                this.lastName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "phone":
                this.phone = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "email":
                this.email = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "hasOptedInSMS":
                this.hasOptedInSMS = event.detail.checked;
                break;
            case "accountPin":
                this.accountPin =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "addAuthorizedContact":
                this.addAuthorizedContactValue = event.detail.value;
                break;
            case "authorizedContactName":
                this.authorizedContactName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "authorizedContactPhone":
                this.authorizedContactPhone =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "customerNotes":
                this.customerNotes =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "optIn":
                this.optIn = event.detail.value;
                break;
        }
        this.disableValidations();
    }

    handleAddressChange(event) {
        switch (event.target.name) {
            case "shippingAddress":
                this.shippingAddress = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "shippingApt":
                this.shippingApt = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "shippingState":
                this.shippingState = event.target.value !== "" ? event.target.value : undefined;
                this.shippingStateName =
                    this.shippingState !== undefined
                        ? stateNames.find((e) => e.abbrev == this.shippingState).label
                        : undefined;
                break;
            case "shippingZip":
                this.shippingZip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "shippingCity":
                this.shippingCity = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "billingAddress":
                this.billingAddress = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "billingApt":
                this.billingApt = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "billingState":
                this.billingState = event.target.value !== "" ? event.target.value : undefined;
                this.billingStateName =
                    this.billingState !== undefined
                        ? stateNames.find((e) => e.abbrev == this.billingState).label
                        : undefined;
                break;
            case "billingZip":
                this.billingZip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "billingCity":
                this.billingCity = event.target.value !== "" ? event.target.value : undefined;
                break;
        }
        this.disableValidations();
    }

    handleBillingAddressChange(event) {
        this.billingAddress = event.detail.street != "" ? event.detail.street : undefined;
        this.billingCity = event.detail.city != "" ? event.detail.city : undefined;
        this.billingApt = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.billingState = event.detail.province != "" ? event.detail.province : undefined;
        this.billingZip = event.detail.postalCode != "" ? event.detail.postalCode : undefined;

        this.disableValidations();
    }

    disableValidations() {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        let phonere = /^\d{10}$/;
        let pinre = /^\d{4}$/;
        const validPin = this.accountPin !== undefined && this.accountPin.length === 4 && pinre.test(this.accountPin);
        const validContactPhone =
            (this.addAuthorizedContactValue === "yes" &&
                !!this.authorizedContactPhone &&
                phonere.test(this.authorizedContactPhone)) ||
            this.addAuthorizedContactValue === "no";
        if (!this.fakeSSNHardStop) {
            if (
                this.firstName !== undefined &&
                this.lastName !== undefined &&
                this.phone !== undefined &&
                this.email !== undefined &&
                validPin &&
                phonere.test(this.phone) &&
                emailre.test(this.email) &&
                this.emailValidated &&
                this.phoneValidated
            ) {
                this.noContactInformation = false;
            } else {
                this.noContactInformation = true;
            }
            if (this.showBillingAddress == false) {
                if (
                    this.shippingAddress !== undefined &&
                    this.shippingCity !== undefined &&
                    this.shippingState !== undefined &&
                    this.shippingZip !== undefined &&
                    this.noContactInformation == false
                ) {
                    this.noAddressInformation = false;
                    this.noShippingInformation = false;
                } else {
                    this.noAddressInformation = true;
                    this.noShippingInformation = true;
                }
            } else {
                if (
                    this.shippingAddress !== undefined &&
                    this.shippingCity !== undefined &&
                    this.shippingState !== undefined &&
                    this.shippingZip !== undefined &&
                    this.billingAddress !== undefined &&
                    this.billingCity !== undefined &&
                    this.billingState !== undefined &&
                    this.billingZip !== undefined &&
                    this.noContactInformation == false
                ) {
                    this.noAddressInformation = false;
                } else {
                    this.noAddressInformation = true;
                }
                if (
                    this.shippingAddress !== undefined &&
                    this.shippingCity !== undefined &&
                    this.shippingState !== undefined &&
                    this.shippingZip !== undefined &&
                    this.noContactInformation == false
                ) {
                    this.noShippingInformation = false;
                } else {
                    this.noShippingInformation = true;
                }
            }
            if (this.preQualified) {
                this.noCompleteInfo = this.noAddressInformation || !validPin || !validContactPhone;
                return;
            }
            if (this.disclosureAgreement) {
                if (this.isManual) {
                    if (!this.isDL) {
                        if (
                            this.ssn !== undefined &&
                            this.repeatSSN !== undefined &&
                            this.DOB !== undefined &&
                            this.sameSSN == false
                        ) {
                            let age = Math.floor((new Date() - new Date(this.DOB).getTime()) / 3.15576e10);
                            if (age < 18) {
                                this.noCompleteInfo = true;
                                const event = new ShowToastEvent({
                                    title: "Error",
                                    variant: "error",
                                    mode: "sticky",
                                    message: this.labels.Windstream_must_be_over_18
                                });
                                this.dispatchEvent(event);
                            } else {
                                this.noCompleteInfo = !validPin || !validContactPhone;
                            }
                        } else {
                            this.noCompleteInfo = true;
                        }
                    } else {
                        if (
                            this.DLstate !== undefined &&
                            this.DLnumber !== undefined &&
                            this.DOB !== undefined &&
                            this.DLexpDate !== undefined
                        ) {
                            let age = Math.floor((new Date() - new Date(this.DOB).getTime()) / 3.15576e10);
                            if (age < 18) {
                                this.noCompleteInfo = true;
                                const event = new ShowToastEvent({
                                    title: "Error",
                                    variant: "error",
                                    mode: "sticky",
                                    message: this.labels.Windstream_must_be_over_18
                                });
                                this.dispatchEvent(event);
                            } else if (new Date(this.ccDLexpDate) < new Date()) {
                                this.noCompleteInfo = true;
                                const event = new ShowToastEvent({
                                    title: "Error",
                                    variant: "error",
                                    mode: "sticky",
                                    message: this.labels.Windstream_Expiration_date_grater_than_today
                                });
                                this.dispatchEvent(event);
                            } else {
                                this.noCompleteInfo = !validPin || !validContactPhone;
                            }
                        } else {
                            this.noCompleteInfo = true;
                        }
                    }
                } else {
                    if (this.ccShowSSN) {
                        if (this.ccSSN !== undefined && this.ccDOB !== undefined) {
                            this.noCompleteInfo = !validPin || !validContactPhone;
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
                            this.noCompleteInfo = !validPin || !validContactPhone;
                        } else {
                            this.noCompleteInfo = true;
                        }
                    }
                }
            } else {
                this.noCompleteInfo = true;
            }
        } else {
            this.noCompleteInfo = true;
        }
    }

    handleGoBack() {
        if (this.preQualified || this.isGuestUser) {
            this.handlePrevious();
            return;
        }
        this.showSSNAgreement = true;
        this.agreementChecked = true;
        this.showBillingAddress = false;
        this.isDL = false;
        this.SSNorDL = "SSN";
        if (this.isGuestUser) {
            this.isManual = true;
            this.isPCI = false;
            this.method = "Manual";
        } else {
            this.isPCI = true;
            this.isManual = false;
            this.method = "PCI";
        }
        this.noContactInformation = true;
        this.noAddressInformation = true;
        this.disclosureAgreement = false;
        this.sameSSN = false;
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCancel() {
        if (this.isGuestUser) {
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
        this.showBillingAddress = event.target.checked ? false : true;
        this.disableValidations();
    }

    saveIP() {
        getIPStackSettings()
            .then((response) => {
                const Http = new XMLHttpRequest();
                let url = response.result.URL__c ? response.result.URL__c : "https://api.ipstack.com/";
                url = url + "check?access_key=" + response.result.Password__c;
                Http.open("GET", url);
                Http.send();
                Http.onreadystatechange = (e) => {
                    if (!(Http.readyState == 4 && Http.status == 200)) {
                        return;
                    }
                    let data = JSON.parse(Http.responseText);
                    this.clientIp = data.ip;
                    const myData = {
                        ContextId: this.recordId,
                        IP: this.clientIp
                    };
                    saveFlagIP({ myData })
                        .then((response) => {
                            console.log("IP Saved");
                        })
                        .catch((error) => {
                            console.error(error, "ERROR");
                            this.logError(error.body?.message || error.message);
                        });
                };
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
            });
    }

    handleApprove(event) {
        this.disclosureAgreement = event.target.checked;
        this.disableValidations();
    }

    showWarning() {
        if (this.validationSSNtry == Number(this.fraudLimit) - 1) {
            const event = new ShowToastEvent({
                title: "Warning",
                variant: "warning",
                mode: "sticky",
                message: this.labels.Windstream_different_SSN
            });
            this.dispatchEvent(event);
        } else if (this.validationSSNtry == Number(this.fraudLimit)) {
            const event = new ShowToastEvent({
                title: "Warning",
                variant: "warning",
                mode: "sticky",
                message: this.labels.Windstream_last_attempts
            });
            this.dispatchEvent(event);
        }
    }

    handleSSNChange(event) {
        let ssnPattern = /^\d{9}$/;
        switch (event.target.name) {
            case "ssn":
                this.ssn = ssnPattern.test(event.target.value) ? event.target.value : undefined;
                if (
                    ssnPattern.test(event.target.value) &&
                    event.target.value !== this.ssnValidation &&
                    this.firstName + this.lastName === this.nameValidation
                ) {
                    this.showWarning();
                }
                this.sameSSN = event.target.value !== this.repeatSSN ? true : false;
                break;
            case "repeatSSN":
                this.repeatSSN = ssnPattern.test(event.target.value) ? event.target.value : undefined;
                this.sameSSN = event.target.value !== this.ssn ? true : false;
                break;
            case "DOB":
                this.DOB =
                    event.target.value !== "" && Date.parse(event.target.value) >= Date.parse("1916-01-01")
                        ? event.target.value
                        : undefined;
                break;
            case "DLstate":
                this.DLstate = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "DLnumber":
                this.DLnumber = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "DLexpDate":
                this.DLexpDate = event.target.value !== "" ? event.target.value : undefined;
                break;
        }
        this.disableValidations();
    }

    handleClick() {
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
                    this.handleCallCC();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const errMsg = error.body?.message || error.message;
                this.logError(errMsg);
            });
    }

    handleCallCC() {
        this.loaderSpinner = true;
        if (this.hasCreditCheckAttempt && (this.fakeSSNCount === 0 || this.fakeSSNCount >= 3)) {
            this.fraudLimit = this.hasCreditCheckAttempt;
            this.noCompleteInfo = true;
            this.updateOpp();
            this.loaderSpinner = false;
            this.showCreditCheckLimitModal = true;
            return;
        }

        let data = this.creditCheckData;
        if (
            this.shippingAddress !== this.addressInfo.address ||
            this.shippingApt !== this.addressInfo.apt ||
            this.shippingCity !== this.addressInfo.city ||
            this.shippingZip !== this.addressInfo.zip ||
            (this.showBillingAddress &&
                (this.billingAddress !== this.addressInfo.address ||
                    this.billingApt !== this.addressInfo.apt ||
                    this.billingCity !== this.addressInfo.city ||
                    this.billingZip !== this.addressInfo.zip))
        ) {
            this.addressDiscrepancy = true;
        }
        let orderCalloutData = {
            offerId: this.offerId,
            partnerName: "windstream",
            callLogId: "",
            tab: "creditcheck",
            serviceRef: "",
            customer: {
                firstName: data.FirstName,
                middleName: data.MiddleName,
                lastName: data.LastName,
                emailAddress: data.Email,
                phoneNumber: data.Phone
            },
            account: {
                contactEmail: "",
                customerAcceptedTC: true,
                tcSource: "",
                billingAddress: {
                    addressLine1: this.showBillingAddress ? data.BillingStreet : data.ShippingStreet,
                    addressLine2: this.showBillingAddress ? data.BillingApt : data.ShippingApt,
                    city: this.showBillingAddress ? data.BillingCity : data.ShippingCity,
                    state: this.showBillingAddress ? data.BillingState : data.ShippingState,
                    country: this.showBillingAddress ? data.BillingCountry : data.ShippingCountry,
                    county: "",
                    zipCode: this.showBillingAddress ? data.BillingZipCode : data.ShippingZipCode
                },
                ssn: data.SSN,
                pin: "",
                dob: data.Birthdate,
                drivingLicense: {
                    dlNumber: data.DL,
                    expDate: data.DLExpirationDate,
                    dlState: data.DLState
                }
            }
        };
        if (this.preQualified) {
            this.handleNext(data, orderCalloutData);
            return;
        }

        // Save offerId used in credit check
        this.dispatchEvent(
            new CustomEvent("creditcheckattempt", {
                detail: this.offerId
            })
        );

        const path = "creditCheck";
        let calloutData = {
            path,
            httpMethod: "POST",
            offerId: this.offerId,
            partnerName: "windstream",
            tab: "creditcheck",
            selectedBuyFlow: this.selectedBuyFlow,
            customer: {
                firstName: data.FirstName,
                middleName: data.MiddleName,
                lastName: data.LastName
            },
            spouse: {
                firstName: "",
                middleName: "",
                lastName: ""
            },
            account: {
                ssn: data.SSN,
                drivingLicense: {
                    dlNumber: data.DL,
                    dlState: data.DLState
                }
            }
        };
        console.log("Credit Check Request", calloutData);
        let apiResponse;
        callEndpoint({ inputMap: calloutData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Credit Check Response", responseParsed);
                if (responseParsed.hasOwnProperty("error")) {
                    let errorMessage = `${
                        responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error.message
                    }`;
                    if (
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("code") &&
                        responseParsed.error.provider.code === "1007"
                    ) {
                        this.fakeSSNCount += 1;
                    }
                    if (this.fakeSSNCount === 3) {
                        errorMessage = this.labels.fakeSSNLimitMessage;
                        this.showFakeSSNModal = true;
                        this.fakeSSNHardStop = true;
                        this.disableValidations();
                    }
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, calloutData, path, "API Error");
                    this.loaderSpinner = false;
                } else {
                    if (Object.keys(responseParsed).length === 0) {
                        const genericErrorMessage = this.labels.Windstream_Callout_method;
                        const event = new ShowToastEvent({
                            title: "Internal Server Error",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                        this.loaderSpinner = false;
                        this.logError(
                            `${genericErrorMessage}\nAPI Response: ${response}`,
                            calloutData,
                            path,
                            "API Error"
                        );
                        return;
                    }
                    let status =
                        responseParsed.hasOwnProperty("errorInfo") && responseParsed.errorInfo.errorCode !== "0000"
                            ? false
                            : true;
                    if (!status) {
                        this.creditFreeze = responseParsed.errorInfo.errorMessage.toLowerCase().includes("freeze");
                        if (this.creditFreeze) {
                            this.loaderSpinner = true;
                            const event = new ShowToastEvent({
                                title: "Credit Check Declined Response",
                                variant: "error",
                                mode: "sticky",
                                message: this.labels.Windstream_Credit_Freeze
                            });
                            this.dispatchEvent(event);
                            let myData = {
                                ContextId: this.recordId
                            };
                            saveCreditFreeze({ myData })
                                .then((response) => {
                                    this.fraudValidation(data, true);
                                    this.loaderSpinner = false;
                                })
                                .catch((error) => {
                                    this.loaderSpinner = false;
                                    this.logError(error.body?.message || error.message);
                                });
                        } else {
                            const event = new ShowToastEvent({
                                title: "Credit Check Declined Response",
                                variant: "error",
                                mode: "sticky",
                                message: responseParsed.errorInfo.errorMessage
                            });
                            this.dispatchEvent(event);
                            this.fraudValidation(data, false);
                        }
                    } else {
                        this.advanceDepositAmount = 0;
                        this.creditCheckResponseVerbiage = "";
                        const hasPriorBalance = responseParsed.priorBalance == "Y";

                        this.advancePaymentIndicator = String(responseParsed.advancePayInd);
                        const depositAmt = !!responseParsed.depositAmt ? responseParsed.depositAmt : 0;

                        if (hasPriorBalance) {
                            this.loaderSpinner = false;
                            return this.handlePriorBalance();
                        }

                        switch (this.advancePaymentIndicator) {
                            case "Y":
                                this.loaderSpinner = false;
                                this.showRequired = true;
                                this.advanceDepositAmount = parseFloat(depositAmt);
                                break;
                            case "M" || "E":
                                this.manualReview = true;
                                this.skipInstallDateSelection = true;
                                const sellerId =
                                    this.origin === "maps"
                                        ? DOOR_TO_DOOR_CHANNEL
                                        : this.origin === "retail"
                                        ? NATIONAL_RETAIL_CHANNEL
                                        : NATIONAL_AGENT_CHANNEL;
                                this.creditCheckResponseVerbiage = MANUAL_REVIEW_MODAL_BODY.replace(
                                    "{ORDER_NUMBER}",
                                    this.offerId
                                )
                                    .replace(
                                        "{CUSTOMER_NAME}",
                                        `${this.firstName}${this.middleName ? ` ${this.middleName}` : ""} ${
                                            this.lastName
                                        }`
                                    )
                                    .replace("{SELLER_ID}", sellerId);
                                this.orderCalloutData = orderCalloutData;
                                this.loaderSpinner = false;
                                this.showManualReviewModal = true;
                                break;
                            case "C":
                                this.loaderSpinner = false;
                                this.showRequired = true;
                                this.advanceDepositAmount = parseFloat(depositAmt);
                                break;
                            case "N":
                                this.handleNext(data, orderCalloutData);
                                break;
                            default:
                                this.handleNext(data, orderCalloutData);
                                break;
                        }
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = this.labels.Windstream_Credit_Check_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(
                        `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                        calloutData,
                        path,
                        "API Error"
                    );
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    handlePriorBalance() {
        this.hardStopVerbiage = PWRO_MESSAGE;
        this.showBuyflowHardStopModal = true;
    }

    handleNext(data, orderCalloutData) {
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
        let productsArray = this.selectedProduct.split(";");
        let bundle = productsArray[0];
        productsArray.shift();
        let addersArray = [];
        productsArray = productsArray.forEach((item) => {
            let adder = {
                Name: item.substring(0, 80)
            };
            addersArray.push(adder);
        });
        let json = {
            addressDiscrepancy: this.addressDiscrepancy,
            family: "Windstream",
            consent: this.contactConsent,
            representative: repType,
            timeStamp: new Date(),
            ContextId: this.recordId,
            recordTypeName: "Person Account",
            ProductName: bundle.substring(0, 80),
            Adders: addersArray,
            recordTypeId: this.recType,
            Pricebook: "Standard Price Book",
            accName: data.FirstName + " " + data.LastName,
            reviewPhoneNumber: this.reviewPhoneNumber,
            identification:
                data.SSN !== undefined && data.SSN !== null && data.SSN !== ""
                    ? "Social Security Number"
                    : `Driver's License`,
            creditCheck: {
                accountDetails: {
                    billingCreditCheckAddress: {
                        shippingSameAsBilling: this.showBillingAddress,
                        billingAddress: data.BillingStreet,
                        billingAptNumber: data.BillingApt,
                        billingCity: data.BillingCity,
                        billingState: data.BillingState,
                        billingStateName: this.billingStateName,
                        billingZip: data.BillingZipCode
                    },
                    shippingServiceAddresss: {
                        shippingAddress: data.ShippingStreet,
                        shippingAptNumber: data.ShippingApt,
                        shippingCity: data.ShippingCity,
                        shippingZip: data.ShippingZipCode,
                        shippingState: data.ShippingState,
                        shippingStateName: this.shippingStateName
                    }
                },
                identification: {
                    ssn: data.SSN,
                    ssnRepeat: data.SSN,
                    driversLicenseNumber: data.DL,
                    driversLicenseState: data.DLState,
                    driversLicenseExpirationDate: data.DLExpirationDate,
                    dateOfBirth: data.Birthdate,
                    checkApproval: this.disclosureAgreement,
                    personalInformationType:
                        data.SSN !== null && data.SSN !== undefined && data.SSN !== "" ? "ssn" : "dl"
                },
                customerDetails: {
                    contactInformation: {
                        firstName: data.FirstName,
                        middleName: data.MiddleName,
                        lastName: data.LastName,
                        email: data.Email,
                        contactPhone: data.Phone
                    }
                }
            }
        };
        let clientInfo = {
            addressInfo: {
                address: data.ShippingStreet,
                apt: data.ShippingApt,
                city: data.ShippingCity,
                number: data.ShippingApt,
                state: data.ShippingState,
                zip: data.ShippingZipCode
            },
            selectedAddressInfo: this.addressApi,
            address: {
                addressLine1: data.ShippingStreet,
                addressLine2: data.ShippingApt,
                city: data.ShippingCity,
                state: data.ShippingState,
                zipCode: data.ShippingZipCode,
                county: ""
            },
            billingAddress: {
                addressLine1: this.showBillingAddress ? data.BillingStreet : data.ShippingStreet,
                addressLine2: this.showBillingAddress ? data.BillingApt : data.ShippingApt,
                city: this.showBillingAddress ? data.BillingCity : data.ShippingCity,
                state: this.showBillingAddress ? data.BillingState : data.ShippingState,
                zipCode: this.showBillingAddress ? data.BillingZipCode : data.ShippingZipCode,
                county: ""
            },
            contactInfo: {
                firstName: data.FirstName,
                middleName: data.MiddleName,
                lastName: data.LastName,
                email: data.Email,
                phone: data.Phone
            },
            accountInfo: {
                ssn: data.SSN,
                pin: "",
                dob: data.Birthdate,
                drivingLicense: {
                    dlNumber: data.DL,
                    expDate: data.DLExpirationDate,
                    dlState: data.DLState
                }
            }
        };
        saveAccountInformation({ myData: json })
            .then((response) => {
                console.log(response);
                if (response.result.error) {
                    this.loaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: this.labels.Windstream_already_exist_address_or_phone
                    });
                    this.dispatchEvent(event);
                } else {
                    this.accountId = response.result.Account.Id;
                    json.AccountId = this.accountId;
                    json.phone = this.phone;
                    json.email = this.email;

                    this.isGuestUser && !!this.referralCodeData
                        ? (json.referralCodeId = this.referralCodeData?.Id)
                        : undefined;
                    console.log("SAVE NEW ORDER CALL", json);
                    saveNewOrder({ myData: json })
                        .then((response) => {
                            console.log(response);
                            let data = {
                                offerId: this.offerId,
                                clientInfo: clientInfo,
                                customer: orderCalloutData.customer,
                                accountId: orderCalloutData.account,
                                referenceNumber: this.referenceNumber,
                                creditCheckCallout: orderCalloutData,
                                skipInstallDateSelection: this.skipInstallDateSelection,
                                creditCheckResponseVerbiage: this.creditCheckResponseVerbiage,
                                cartInfo: this.cartInfo,
                                cart: this.cartCreditCheck,
                                orderId: response.result.Order.Id,
                                orderItemId: response.result.OrderItem.Id,
                                hasAutoPay: this.autoPayDecision,
                                adderSelection: this.adderChangedSelection,
                                manualReview: this.manualReview,
                                reviewPhoneNumber: this.reviewPhoneNumber,
                                additionalInfo: {
                                    textMsgOptin: this.optIn,
                                    authorizedUserName: this.authorizedContactName,
                                    authorizedUserPhone: this.authorizedContactPhone,
                                    accountPin: this.accountPin,
                                    customerRemarks: this.customerNotes
                                },
                                forcedAutoPay: this.forcedAutoPay,
                                fakeSSNLimit: this.fakeSSNCount,
                                pins: { ...this.confirmedPins }
                            };
                            if (this.isGuestUser) {
                                const closeModalEvent = new CustomEvent("creditcheckpassed", {
                                    detail: data
                                });
                                this.dispatchEvent(closeModalEvent);
                                this.loaderSpinner = false;
                            } else {
                                let aci = {
                                    ContextId: this.recordId
                                };
                                saveACICreditCheck({ myData: aci })
                                    .then((response) => {
                                        const closeModalEvent = new CustomEvent("creditcheckpassed", {
                                            detail: data
                                        });
                                        this.dispatchEvent(closeModalEvent);
                                    })
                                    .catch((error) => {
                                        console.error(error, "ERROR");
                                        const event = new ShowToastEvent({
                                            title: "Error",
                                            variant: "error",
                                            mode: "sticky",
                                            message: this.labels.Order_Creation_Generic_Error_Message
                                        });
                                        this.dispatchEvent(event);
                                        this.loaderSpinner = false;
                                        this.logError(error.body?.message || error.message);
                                    });
                            }
                        })
                        .catch((error) => {
                            console.error(error, "ERROR");
                            this.loaderSpinner = false;
                            this.logError(error.body?.message || error.message);
                        });
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handleRefresh() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };

        getOppSensitiveData({ myData })
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
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody = SMS_VERBIAGE + index[0] + "/s/pci-personal-info?c__ContextId=" + this.recordId;
        let myData = {
            clientPhone: "1" + this.phone,
            body: mailBody,
            opportunityId: this.recordId
        };

        sendPCISMS({ myData })
            .then((response) => {
                this.loaderSpinner = false;
                let tit = response.result.success ? "Success" : "Error";
                let varnt = response.result.success ? "success" : "error";
                let mess = response.result.success
                    ? this.labels.SMS_Sent_Successfully_Message
                    : this.labels.POE_Send_SMS_Error_Message;
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
                    message: this.labels.POE_Send_SMS_Error_Message
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    sendPCIEmail() {
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody = index[0] + "/s/pci-personal-info?c__ContextId=" + this.recordId;
        let myData = {
            pciEmail: this.email,
            body: mailBody
        };

        sendCreditCheckPciEmail({ myData })
            .then((response) => {
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    message: this.labels.Windstream_email_sent_correctly
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
                    message: this.labels.POE_Send_Email_Error_Message
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    fraudValidation(data, creditfreeze) {
        this.loaderSpinner = false;
        if (this.validationSSNtry <= this.fraudLimit && !creditfreeze) {
            const event = new ShowToastEvent({
                title: "Credit Check Declined Response",
                variant: "error",
                mode: "sticky",
                message: this.labels.Windstream_credit_check_not_pass
            });
            this.dispatchEvent(event);
        }
        if (this.validationSSNtry <= this.fraudLimit) {
            if (
                this.validationSSNtry == 0 ||
                (data.SSN !== this.ssnValidation && data.FullName === this.nameValidation)
            ) {
                this.nameValidation = data.FullName;
                this.validationSSNtry = this.validationSSNtry + 1;
                this.ssnValidation = data.SSN;
            } else if (data.FullName !== this.nameValidation) {
                this.validationSSNtry = 1;
                this.ssnValidation = data.SSN;
                this.nameValidation = data.FullName;
            }
        }
        if (this.validationSSNtry > this.fraudLimit) {
            this.ssnLimit = true;
        }
        if (
            this.validationAddressTry == 0 ||
            (data.ShippingStreet !== this.addressValidation && this.nameAddressValidation === data.FullName) ||
            (data.ShippingStreet === this.addressValidation && this.nameAddressValidation !== data.FullName)
        ) {
            this.validationAddressTry = this.validationAddressTry + 1;
            this.nameAddressValidation = data.FullName;
            this.addressValidation = data.ShippingStreet;
        } else if (data.FullName !== this.nameAddressValidation && data.ShippingStreet !== this.addressValidation) {
            this.nameAddressValidation = data.FullName;
            this.validationAddressTry = 1;
            this.addressValidation = data.ShippingStreet;
        }
        this.addressWarning = this.validationAddressTry >= this.fraudLimit ? true : false;
    }

    closeRequired(event) {
        this.showRequired = false;
    }

    nextRequired(event) {
        this.showRequired = false;
        let data = {
            FirstName: this.firstName,
            LastName: this.lastName,
            MiddleName: this.middleName,
            FullName: this.firstName + this.lastName,
            Phone: this.phone,
            Email: this.email,
            ShippingStreet: this.shippingAddress,
            ShippingCity: this.shippingCity,
            ShippingState: this.shippingState,
            ShippingApt: this.shippingApt,
            SSN: this.isManual ? this.ssn : this.ccSSN,
            Birthdate: this.isManual ? this.DOB : this.ccDOB,
            DL: this.isManual ? this.DLnumber : this.ccDL,
            DLState: this.isManual ? this.DLstate : this.ccDLstate,
            DLExpirationDate: this.isManual ? this.DLexpDate : this.ccDLexpDate,
            BillingStreet: this.billingAddress,
            BillingCity: this.billingCity,
            BillingApt: this.billingApt,
            BillingState: this.billingState,
            ShippingZipCode: this.shippingZip,
            BillingZipCode: this.billingZip
        };
        let orderCalloutData = {
            offerId: this.offerId,
            partnerName: "windstream",
            callLogId: "",
            tab: "creditcheck",
            serviceRef: "",
            customer: {
                firstName: data.FirstName,
                middleName: data.MiddleName,
                lastName: data.LastName,
                emailAddress: data.Email,
                phoneNumber: data.Phone
            },
            account: {
                contactEmail: "",
                customerAcceptedTC: true,
                tcSource: "",
                billingAddress: {
                    addressLine1: this.showBillingAddress ? data.BillingStreet : data.ShippingStreet,
                    addressLine2: this.showBillingAddress ? data.BillingApt : data.ShippingApt,
                    city: this.showBillingAddress ? data.BillingCity : data.ShippingCity,
                    state: this.showBillingAddress ? data.BillingState : data.ShippingState,
                    country: this.showBillingAddress ? data.BillingCountry : data.ShippingCountry,
                    county: "",
                    zipCode: this.showBillingAddress ? data.BillingZipCode : data.ShippingZipCode
                },
                ssn: data.SSN,
                pin: "",
                dob: data.Birthdate,
                drivingLicense: {
                    dlNumber: data.DL,
                    expDate: data.DLExpirationDate,
                    dlState: data.DLState
                }
            }
        };
        let decision = event.detail;
        this.loaderSpinner = true;
        let canContinueBuyflow = false;

        if (decision === "deposit") {
            canContinueBuyflow = this.advancePaymentIndicator === "Y" || this.advancePaymentIndicator === "C";

            let auxCart = { ...this.cartInfo };
            let auxAdders = [];
            auxCart.adders.forEach((adder) => {
                auxAdders.push(adder);
            });
            let cart = { ...this.cartCreditCheck };
            let upfrontCharges = [];
            let depositAdder = {
                Description: null,
                Family: "Windstream",
                Name: "Advance Deposit",
                UnitPrice: this.advanceDepositAmount,
                ProductCode: null,
                servRef: null,
                vasProduct: false
            };
            let newCharge = {
                name: "Required Advance Deposit",
                fee: Number(this.advanceDepositAmount).toFixed(2),
                discount: Number(this.advanceDepositAmount) > 0.0 ? false : true,
                hasDescription: false,
                description: "",
                type: "deposit"
            };
            upfrontCharges.push(newCharge);
            cart.upfrontCharges = [...upfrontCharges];
            cart.hasUpfront = true;
            cart.upfrontTotal = (0.0).toFixed(2);
            cart.upfrontCharges.forEach((item) => {
                cart.upfrontTotal = (Number(cart.upfrontTotal) + Number(item.fee)).toFixed(2);
            });
            this.cartCreditCheck = { ...cart };
            auxAdders.push(depositAdder);
            auxCart.adders = [];
            auxCart.adders = [...auxAdders];
            this.cartInfo = { ...auxCart };
        } else if (decision === "none") {
            canContinueBuyflow = this.advancePaymentIndicator === "C" && this.hasAutoPay;

            this.autoPayDecision = false;
            let cart = { ...this.cartCreditCheck };
            let upfrontCharges = [];
            cart.upfrontCharges = [...upfrontCharges];
            cart.upfrontTotal = (0.0).toFixed(2);
            cart.hasUpfront = false;
            if (this.hasAutoPay) {
                let data = { ...JSON.parse(JSON.stringify(this.adderChangedSelection)) };
                data.autoPay.forEach((e) => {
                    if (e.Id === "1263") {
                        e.isChecked = false;
                    } else {
                        e.isChecked = true;
                    }
                });
                this.adderChangedSelection = { ...data };
                let monthlyAddersArray = [
                    ...data.installationAdders,
                    ...data.extenders,
                    ...data.rewards,
                    ...data.autoPay,
                    ...data.paperless,
                    ...data.others,
                    ...data.phone
                ];
                let monthlyCharges = [];
                monthlyAddersArray.forEach((item) => {
                    if (item.isChecked) {
                        let newCharge = {
                            name: item.Name,
                            fee: Number(item.Price).toFixed(2),
                            discount: Number(item.Price) > 0.0 ? false : true,
                            hasDescription: false,
                            description: "",
                            type: "product"
                        };
                        monthlyCharges.push(newCharge);
                    }
                });
                cart.hasAdders = monthlyCharges.length > 0;
                cart.addersCharges = [...monthlyCharges];
                cart.addersTotal = 0.0;
                cart.addersCharges.forEach((item) => {
                    cart.addersTotal = Number(Number(cart.addersTotal) + Number(item.fee)).toFixed(2);
                });
            }
            this.cartCreditCheck = { ...cart };
            this.skipInstallDateSelection = true;
        } else if (decision === "autoPay") {
            canContinueBuyflow = this.advancePaymentIndicator === "C";
            this.forcedAutoPay = true;
            this.autoPayDecision = true;
            let cart = { ...this.cartCreditCheck };
            let upfrontCharges = [];
            cart.upfrontCharges = [...upfrontCharges];
            cart.upfrontTotal = (0.0).toFixed(2);
            cart.hasUpfront = false;
            if (!this.hasAutoPay) {
                let data = { ...JSON.parse(JSON.stringify(this.adderChangedSelection)) };
                data.autoPay.forEach((e) => {
                    if (e.Id === "1263") {
                        e.isChecked = true;
                    } else {
                        e.isChecked = false;
                    }
                });
                this.adderChangedSelection = { ...data };
                let monthlyAddersArray = [
                    ...data.installationAdders,
                    ...data.extenders,
                    ...data.rewards,
                    ...data.autoPay,
                    ...data.paperless,
                    ...data.others,
                    ...data.phone
                ];
                let monthlyCharges = [];
                monthlyAddersArray.forEach((item) => {
                    if (item.isChecked) {
                        let newCharge = {
                            name: item.Name,
                            fee: Number(item.Price).toFixed(2),
                            discount: Number(item.Price) > 0.0 ? false : true,
                            hasDescription: false,
                            description: "",
                            type: "product"
                        };
                        monthlyCharges.push(newCharge);
                    }
                });
                cart.hasAdders = monthlyCharges.length > 0;
                cart.addersCharges = [...monthlyCharges];
                cart.addersTotal = 0.0;
                cart.addersCharges.forEach((item) => {
                    cart.addersTotal = Number(Number(cart.addersTotal) + Number(item.fee)).toFixed(2);
                });
            }
            this.cartCreditCheck = { ...cart };
        }

        if (canContinueBuyflow) {
            return this.handleNext(data, orderCalloutData);
        }

        this.loaderSpinner = false;
        let errorMessage;
        if (this.advancePaymentIndicator === "C" && this.advanceDepositAmount > 0) {
            errorMessage = DEPOSIT_OR_AUTOPAY_REQUIRED_MESSAGE;
        } else if (this.advancePaymentIndicator === "Y" && this.advanceDepositAmount > 0) {
            errorMessage = DEPOSIT_REQUIRED_MESSAGE;
        }

        this.hardStopVerbiage = errorMessage;
        this.showBuyflowHardStopModal = true;
    }

    getPhoneNumber() {
        this.loaderSpinner = true;
        let myData = {
            provider: "Windstream",
            use: "Review"
        };
        getProviderPhoneNumber({ myData })
            .then((response) => {
                this.reviewPhoneNumber = response.result.Phone.Phone__c;
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
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

    hideManualReviewModal() {
        this.showManualReviewModal = false;
        this.loaderSpinner = true;
        this.handleNext(this.creditCheckData, this.orderCalloutData);
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Credit Check",
            component: "poe_lwcBuyflowWindstreamCreditCheckTab",
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

    hideHardStopModal() {
        this.showBuyflowHardStopModal = false;
        this.handleCancel();
    }

    handleCreditCheckLimitConfirm() {
        this.showCreditCheckLimitModal = false;
        let info = { fakeSSNLimit: this.fakeSSNCount };
        this.dispatchEvent(new CustomEvent("setproductstep", { detail: info }));
    }
    hideFakeSSNModal() {
        this.showFakeSSNModal = false;
        this.disableValidations();
    }

    handleSendEmailPin() {
        this.showEmailPinValidatorModal = true;
    }

    handleCloseEmailPinModal() {
        this.showEmailPinValidatorModal = false;
    }

    handleConfirmEmailPinModal(event) {
        let data = { ...event.detail };
        this.confirmedPins = { ...this.confirmedPins, email: data.pinValue };
        this.emailValidated = data.pinValidated;
        this.disableValidations();
    }

    handleSendPhonePin() {
        this.showSmsPinValidatorModal = true;
    }

    handleCloseSmsPinModal() {
        this.showSmsPinValidatorModal = false;
    }

    handleConfirmSmsPinModal(event) {
        let data = { ...event.detail };
        this.confirmedPins = { ...this.confirmedPins, phone: data.pinValue };
        this.phoneValidated = data.pinValidated;
        this.disableValidations();
    }
}