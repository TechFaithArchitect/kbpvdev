import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";

import getCreditCardTypes from "@salesforce/apex/checkoutTabController.getCreditCardTypes";
import getCreditCardInformation from "@salesforce/apex/checkoutTabController.getCreditCardInformation";
import updateOrderAndAccountBillingAddress from "@salesforce/apex/checkoutTabController.updateOrderAndAccountBillingAddress";
import sendPCISMS from "@salesforce/apex/CreditCheckTabController.sendPCISMS";
import sendCreditCheckPciEmail from "@salesforce/apex/CreditCheckTabController.sendCreditCheckPciEmail";

import PHONE_DISCLAIMER from "@salesforce/label/c.POE_phone_disclaimer";
import PHONE_DISCLAIMER2 from "@salesforce/label/c.POE_phone_disclaimer2";
import SMS_VERBIAGE from "@salesforce/label/c.POE_sms_verbiage";
import SELF_SERVICE_VALIDATE_LEAVING_MESSAGE from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import SELF_SERVICE_VALIDATE_LEAVING_TITLE from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import BILLING_ADDRESS_SAME_AS_SERVICE_ADDRESS_FIELD from "@salesforce/label/c.Billing_Address_Same_As_Service_Address_Field";
import PCI_LINK_OPTION_LABEL from "@salesforce/label/c.PCI_Link_Option_Label";
import MANUAL_PCI_OPTION_LABEL from "@salesforce/label/c.Manual_PCI_Option_Label";
import EMAIL_OPTION_LABEL from "@salesforce/label/c.Email_Option_Label";
import SMS_OPTION_LABEL from "@salesforce/label/c.SMS_Option_Label";
import YES_OPTION_LABEL from "@salesforce/label/c.Yes_Option_Label";
import NO_OPTION_LABEL from "@salesforce/label/c.No_Option_Label";
import BILLING_ADDRESS_FIELD_LABEL from "@salesforce/label/c.Billing_Address_Field_Label";
import CITY_FIELD_LABEL from "@salesforce/label/c.City_Field_Label";
import COUNTRY_FIELD_LABEL from "@salesforce/label/c.Country_Field_Label";
import ZIP_FIELD_LABEL from "@salesforce/label/c.Zip_Field_Label";
import STATE_FIELD_LABEL from "@salesforce/label/c.State_Field_Label";
import STREET_ADDRESS_FIELD_LABEL from "@salesforce/label/c.Street_Address_Field_Label";
import ADDRESS_LINE_2_FIELD_LABEL from "@salesforce/label/c.Address_Line_2_Field_Label";
import BILLING_ADDRESS_SECTION_TITLE from "@salesforce/label/c.Credit_Check_Billing_Address_Section_Title";
import TOAST_GENERIC_ERROR_TITLE from "@salesforce/label/c.Toast_Generic_Error_Title";
import SUCCESS_TOAST_TITLE from "@salesforce/label/c.Success_Toast_Title";
import CREDIT_CARD_EXPIRED_ERROR_MESSAGE from "@salesforce/label/c.Credit_Card_Expired_Error_Message";
import EMAIL_SENT_SUCCESSFULLY_MESSAGE from "@salesforce/label/c.Email_Sent_Successfully_Message";
import SEND_EMAIL_ERROR_MESSAGE from "@salesforce/label/c.POE_Send_Email_Error_Message";
import SMS_SENT_SUCCESSFULLY_MESSAGE from "@salesforce/label/c.SMS_Sent_Successfully_Message";
import SEND_SMS_ERROR_MESSAGE from "@salesforce/label/c.POE_Send_SMS_Error_Message";
import CUSTOMER_TERMS_AND_CONDITIONS_INSTRUCTIONS from "@salesforce/label/c.Customer_Terms_and_Conditions_Instructions";
import AGENT_TERMS_AND_CONDITIONS_INSTRUCTIONS from "@salesforce/label/c.Agent_Terms_and_Conditions_Instructions";
import BILLING_NOTIFICATION_TITLE from "@salesforce/label/c.Billing_Notification_Title";
import BILLING_SECTION_AGENT_INSTRUCTIONS from "@salesforce/label/c.Billing_Section_Agent_Instructions";

import NEXT_STEP_BUTTON_LABEL from "@salesforce/label/c.Next_Step_Button_Label";
import PAYMENT_INFORMATION_TITLE from "@salesforce/label/c.Payment_Information_Title";
import PAYMENT_INPUT_METHOD_FIELD_LABEL from "@salesforce/label/c.Payment_Input_Method_Field_Label";
import PCI_OPTIONS_FIELD_LABEL from "@salesforce/label/c.PCI_Options_Field_Label";
import EMAIL_ADDRESS_FIELD_LABEL from "@salesforce/label/c.Email_Address_Field_Label";
import REFRESH_FIELDS_BUTTON_LABEL from "@salesforce/label/c.Windstream_Refresh_Fields_credit_check";
import CONTACT_PHONE_NUMBER_FIELD_LABEL from "@salesforce/label/c.Contact_Phone_Number_Field_Label";
import SMS_PCI_LINK_BUTTON_LABEL from "@salesforce/label/c.SMS_PCI_Link_Button_Label";
import EMAIL_PCI_LINK_BUTTON_LABEL from "@salesforce/label/c.Email_PCI_Link_Button_Label";
import AUTOPAY_CONSENT_FIELD_LABEL from "@salesforce/label/c.AutoPay_Consent_Field_Label";
import PAPERLESS_BILLING_CONSENT_FIELD_LABEL from "@salesforce/label/c.Paperless_Billing_Consent_Field_Label";
import PAPERLESS_BILLING_HEADER from "@salesforce/label/c.Paperless_Billing_Header";
import RECURRING_PAYMENTS_FIELD_LABEL from "@salesforce/label/c.Recurring_Payments_Field_Label";

import PAYMENT_TAB_TITLE from "@salesforce/label/c.Self_Service_Payment_Tab_Title";
import AGENT_PAYMENT_TAB_TITLE from "@salesforce/label/c.Self_Service_Payment_Tab_Agent_Title";
import PAYMENT_TAB_SUBTITLE from "@salesforce/label/c.Self_Service_Payment_Tab_Subtitle";
import AGENT_PAYMENT_TAB_SUBTITLE from "@salesforce/label/c.Self_Service_Payment_Tab_Agent_Subtitle";
import TERMS_AGREEMENT_LABEL_1 from "@salesforce/label/c.Self_Service_EarthLink_Terms_Agreement_Label_1";
import TERMS_AGREEMENT_LABEL_2 from "@salesforce/label/c.Self_Service_EarthLink_Terms_Agreement_Label_2";
import TERMS_AGREEMENT_FIELD_LABEL from "@salesforce/label/c.Self_Service_EarthLink_Terms_Agreement_Field_Label";
import TERMS_AGREEMENT_AGENT_FIELD_LABEL from "@salesforce/label/c.Self_Service_EarthLink_Terms_Agreement_Agent_Field_Label";
import BILLING_ADDRESS_SAME_AS_SERVICE_ADDRESS_AGENT_FIELD from "@salesforce/label/c.Billing_Address_Same_As_Service_Address_Agent_Field";
import SELECT_YEAR_OPTION_LABEL from "@salesforce/label/c.Select_Year_Option_Label";
import SELECT_MONTH_OPTION_LABEL from "@salesforce/label/c.Select_Month_Option_Label";
import SELECT_CREDIT_CARD_TYPE_OPTION_LABEL from "@salesforce/label/c.Select_Credit_Card_Type_Option_Label";
import BILLING_ADDRESS_UPDATE_ERROR_MESSAGE from "@salesforce/label/c.Billing_Address_Update_Error_Message";
import NAME_ON_CARD_FIELD_LABEL from "@salesforce/label/c.Name_on_Card_Field_Label";
import NAME_ON_CARD_PLACEHOLDER from "@salesforce/label/c.Name_on_Card_Placeholder";
import LAST_NAME_ON_CARD_FIELD_LABEL from "@salesforce/label/c.Last_Name_on_Card_Field_Label";
import LAST_NAME_ON_CARD_PLACEHOLDER from "@salesforce/label/c.Last_Name_on_Card_Placeholder";
import NAME_MUST_MATCH_PERSON_CONTRACTING_SERVICE from "@salesforce/label/c.Name_Must_Match_Person_Contracting_Service";
import INVALID_CREDIT_CARD_NUMBER_ERROR_MESSAGE from "@salesforce/label/c.Invalid_Credit_Card_Number_Error_Message";
import CARD_NUMBER_PLACEHOLDER from "@salesforce/label/c.Card_Number_Placeholder";
import CARD_NUMBER_FIELD_LABEL from "@salesforce/label/c.Card_Number_Field_Label";
import CREDIT_CARD_TYPE_FIELD_LABEL from "@salesforce/label/c.Credit_Card_Type_Field_Label";
import CREDIT_CARD_TYPE_PLACEHOLDER from "@salesforce/label/c.Credit_Card_Type_Placeholder";
import EXPIRATION_MONTH_FIELD_LABEL from "@salesforce/label/c.Expiration_Month_Field_Label";
import EXPIRATION_YEAR_FIELD_LABEL from "@salesforce/label/c.Expiration_Year_Field_Label";
import CVV_FIELD_LABEL from "@salesforce/label/c.CVV_Field_Label";
import INVALID_CVV_ERROR_MESSAGE from "@salesforce/label/c.Invalid_CVV_Error_Message";
import CVV_PLACEHOLDER from "@salesforce/label/c.CVV_Placeholder";
import HIDE_FIELD_LABEL from "@salesforce/label/c.Hide_Field_Label";
import BILLING_STREET_ADDRESS_PLACEHOLDER from "@salesforce/label/c.Billing_Street_Address_Placeholder";
import BILLING_ADDRESS_LINE_2_PLACEHOLDER from "@salesforce/label/c.Billing_Address_Line_2_Placeholder";
import BILLING_CITY_PLACEHOLDER from "@salesforce/label/c.Billing_City_Placeholder";
import BILLING_STATE_PLACEHOLDER from "@salesforce/label/c.Billing_State_Placeholder";
import BILLING_ZIP_PLACEHOLDER from "@salesforce/label/c.Billing_Zip_Placeholder";

import disclaimerModal from "c/poe_lwcSelfServiceProductsDisclaimerModal";

const INTERNAL_ERROR = "Internal Error";

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

export default class Poe_lwcSelfServiceEarthlinkCheckoutTab extends LightningElement {
    @api recordId;
    @api due;
    @api logo;
    @api clientInfo;
    @api referenceNumber;
    @api origin;
    @api shippingAddress;
    @api billingAddress;
    @api cartInfo;
    @api isGuestUser;
    @api disclaimers;
    showBillingNotification = true;
    noCompleteInformation = false;
    methods = [
        { label: PCI_LINK_OPTION_LABEL, value: "PCI" },
        { label: MANUAL_PCI_OPTION_LABEL, value: "Manual" }
    ];
    pciOptions = [
        { label: EMAIL_OPTION_LABEL, value: "Email" },
        { label: SMS_OPTION_LABEL, value: "SMS" }
    ];
    dueTotal;
    ccTypes = [];
    years = [];
    months = [];
    customer = {
        FirstName: "",
        LastName: "",
        Address: "",
        City: "",
        State: "",
        Zip: "",
        Email: "",
        Phone: ""
    };
    autopayAvailable = false;
    autopayOptions = [
        { label: YES_OPTION_LABEL, value: "true" },
        { label: NO_OPTION_LABEL, value: "false" }
    ];
    autopayValue = "false";
    paperlessAvailable = false;
    paperlessOptions = [
        { label: YES_OPTION_LABEL, value: "true" },
        { label: NO_OPTION_LABEL, value: "false" }
    ];
    paperlessValue = "false";
    firstName;
    lastName;
    ccNumber;
    cvv;
    year;
    month;
    zip;
    type;
    billingStreet;
    billingApt;
    billingCity;
    billingState;
    billingStateName;
    stateOptions = [];
    billingZip;
    pciValue = "Email";
    method = "PCI";
    isNotManual = true;
    isManual = false;
    isPCI = true;
    loaderSpinner;
    isEmail = true;
    noEmail = false;
    noPhone = false;
    email;
    phone;
    showCollateral = false;
    Encrypt;
    isCallCenterOrigin;
    phoneDisclaimer = PHONE_DISCLAIMER;
    phoneDisclaimer2 = PHONE_DISCLAIMER2;
    hasOptedInSMS = false;
    showPaymentMethods;
    checkoutDisclaimers = [];
    disclosuresHeader;
    labels = {
        SELF_SERVICE_VALIDATE_LEAVING_TITLE,
        SELF_SERVICE_VALIDATE_LEAVING_MESSAGE,
        TERMS_AGREEMENT_LABEL_2,
        BILLING_ADDRESS_SECTION_TITLE,
        BILLING_NOTIFICATION_TITLE,
        BILLING_SECTION_AGENT_INSTRUCTIONS,
        NEXT_STEP_BUTTON_LABEL,
        PAYMENT_INFORMATION_TITLE,
        PAYMENT_INPUT_METHOD_FIELD_LABEL,
        PCI_OPTIONS_FIELD_LABEL,
        EMAIL_ADDRESS_FIELD_LABEL,
        EMAIL_PCI_LINK_BUTTON_LABEL,
        REFRESH_FIELDS_BUTTON_LABEL,
        CONTACT_PHONE_NUMBER_FIELD_LABEL,
        SMS_PCI_LINK_BUTTON_LABEL,
        NAME_ON_CARD_FIELD_LABEL: this.getRequiredFieldLabel(NAME_ON_CARD_FIELD_LABEL),
        NAME_ON_CARD_PLACEHOLDER,
        LAST_NAME_ON_CARD_FIELD_LABEL: this.getRequiredFieldLabel(LAST_NAME_ON_CARD_FIELD_LABEL),
        LAST_NAME_ON_CARD_PLACEHOLDER,
        NAME_MUST_MATCH_PERSON_CONTRACTING_SERVICE,
        INVALID_CREDIT_CARD_NUMBER_ERROR_MESSAGE,
        CARD_NUMBER_PLACEHOLDER,
        CARD_NUMBER_FIELD_LABEL: this.getRequiredFieldLabel(CARD_NUMBER_FIELD_LABEL),
        CREDIT_CARD_TYPE_FIELD_LABEL: this.getRequiredFieldLabel(CREDIT_CARD_TYPE_FIELD_LABEL),
        CREDIT_CARD_TYPE_PLACEHOLDER,
        EXPIRATION_MONTH_FIELD_LABEL: this.getRequiredFieldLabel(EXPIRATION_MONTH_FIELD_LABEL),
        EXPIRATION_YEAR_FIELD_LABEL: this.getRequiredFieldLabel(EXPIRATION_YEAR_FIELD_LABEL),
        CVV_FIELD_LABEL: this.getRequiredFieldLabel(CVV_FIELD_LABEL),
        INVALID_CVV_ERROR_MESSAGE,
        CVV_PLACEHOLDER,
        HIDE_FIELD_LABEL,
        STREET_ADDRESS_FIELD_LABEL: this.getRequiredFieldLabel(STREET_ADDRESS_FIELD_LABEL),
        ADDRESS_LINE_2_FIELD_LABEL: this.getRequiredFieldLabel(ADDRESS_LINE_2_FIELD_LABEL),
        CITY_FIELD_LABEL: this.getRequiredFieldLabel(CITY_FIELD_LABEL),
        STATE_FIELD_LABEL: this.getRequiredFieldLabel(STATE_FIELD_LABEL),
        ZIP_FIELD_LABEL: ZIP_FIELD_LABEL,
        BILLING_STREET_ADDRESS_PLACEHOLDER,
        BILLING_ADDRESS_LINE_2_PLACEHOLDER,
        BILLING_CITY_PLACEHOLDER,
        BILLING_STATE_PLACEHOLDER,
        BILLING_ZIP_PLACEHOLDER,
        AUTOPAY_CONSENT_FIELD_LABEL,
        PAPERLESS_BILLING_CONSENT_FIELD_LABEL,
        PAPERLESS_BILLING_HEADER,
        RECURRING_PAYMENTS_FIELD_LABEL
    };
    showSelfServiceCancelModal = false;
    providerStyle = "earthlink";
    generalDisclaimer = {
        header: "",
        shortDescription: "",
        description: "",
        cancelText: "",
        agreeText: ""
    };
    showGeneralDisclaimer = false;
    termsAgreed = false;
    useSameAddressAsBillingAddress = true;
    addressOptions = {
        addressLabel: BILLING_ADDRESS_FIELD_LABEL,
        cityLabel: CITY_FIELD_LABEL,
        cityPlaceHolder: undefined,
        countryDisabled: true,
        countryLabel: COUNTRY_FIELD_LABEL,
        countryPlaceholder: undefined,
        fieldLevelHelp: undefined,
        postalCodeLabel: ZIP_FIELD_LABEL,
        postalCodePlaceholder: undefined,
        provinceLabel: STATE_FIELD_LABEL,
        provincePlaceholder: undefined,
        required: true,
        showAddressLookup: true,
        streetLabel: STREET_ADDRESS_FIELD_LABEL,
        streetPlaceholder: undefined,
        addressLine2Label: ADDRESS_LINE_2_FIELD_LABEL,
        addressLine2Placeholder: undefined
    };

    get navBarText() {
        return this.isGuestUser ? PAYMENT_TAB_TITLE : AGENT_PAYMENT_TAB_TITLE;
    }

    get headerText() {
        return this.isGuestUser ? PAYMENT_TAB_SUBTITLE : AGENT_PAYMENT_TAB_SUBTITLE;
    }

    get termsText() {
        return TERMS_AGREEMENT_LABEL_1.replace(
            "{GUEST_OR_AGENT_TEXT}",
            this.isGuestUser ? TERMS_AGREEMENT_FIELD_LABEL : TERMS_AGREEMENT_AGENT_FIELD_LABEL
        );
    }

    get useSameAddressAsBillingAddressLabel() {
        return this.isGuestUser
            ? BILLING_ADDRESS_SAME_AS_SERVICE_ADDRESS_FIELD
            : BILLING_ADDRESS_SAME_AS_SERVICE_ADDRESS_AGENT_FIELD;
    }

    get nextButtonClass() {
        return this.noCompleteInformation
            ? "btn-rounded btn-center hide-mobile btn-disabled"
            : "btn-rounded btn-center hide-mobile";
    }

    get nextButtonClassMobile() {
        return this.noCompleteInformation ? "btn-rounded btn-center btn-disabled" : "btn-rounded btn-center";
    }

    get showBillingAddress() {
        return !this.useSameAddressAsBillingAddress;
    }

    get disableSendSMSButton() {
        return this.noPhone || !this.hasOptedInSMS;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get isNotCallCenterOrigin() {
        return !this.isCallCenterOrigin;
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconFormCreditCard() {
        return chuzoSiteResources + "/images/icon-earthlink-creditcard.svg";
    }

    get iconFormUser() {
        return chuzoSiteResources + "/images/icon-earthlink-user.svg";
    }

    getRequiredFieldLabel(fieldLabel) {
        return `${fieldLabel} (*)`;
    }

    handleNext(e) {
        this.loaderSpinner = true;
        if (this.ccExpired(this.year, this.month)) {
            this.loaderSpinner = false;
            this.noCompleteInformation = true;
            const event = new ShowToastEvent({
                title: TOAST_GENERIC_ERROR_TITLE,
                variant: "error",
                mode: "sticky",
                message: CREDIT_CARD_EXPIRED_ERROR_MESSAGE
            });
            this.dispatchEvent(event);
            return;
        }
        if (this.showBillingNotification) {
            this.showBillingNotification = false;
            this.noCompleteInformation = true;
            this.loaderSpinner = false;
            this.disableValidations(true);
        } else {
            this.callEncryption();
        }
    }

    callEncryption() {
        this.Encrypt = false;
        this.Encrypt = true;
    }

    handlePrevious(e) {
        if (!this.showBillingNotification) {
            if (this.isCallCenterOrigin || this.isGuestUser) {
                this.handleBack();
            } else {
                this.showBillingNotification = true;
            }
        }

        this.noCompleteInformation = false;
        this.isManual = false;
        this.isNotManual = true;
        this.isPCI = !this.isGuestUser;
        this.isEmail = true;
    }

    handleBack() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleMethod(event) {
        switch (event.target.value) {
            case "Manual":
                this.isManual = true;
                this.isNotManual = false;
                this.isPCI = false;
                this.originalValues(false);
                break;
            case "PCI":
                this.pciValue = "Email";
                this.isEmail = true;
                this.isManual = false;
                this.isNotManual = true;
                this.isPCI = true;
                this.eraseValues();
                break;
        }
    }

    handleChange(event) {
        let ccvPattern = /^[0-9]{3,4}$/;
        let ccPattern = /^[0-9]{13,19}$/;
        switch (event.target.name) {
            case "firstName":
                this.firstName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "lastName":
                this.lastName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "type":
                this.type = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "ccNumber":
                this.ccNumber = ccPattern.test(event.target.value) ? event.target.value : undefined;
                break;
            case "month":
                this.month = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "year":
                this.year = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "cvv":
                this.cvv = ccvPattern.test(event.target.value) ? event.target.value : undefined;
                break;
            case "zip":
                this.zip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "hasOptedInSMS":
                this.hasOptedInSMS = event.detail.checked;
                break;
            case "billingStreet":
                this.billingStreet =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "billingApt":
                this.billingApt =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "billingCity":
                this.billingCity =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "billingState":
                this.billingState =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                this.billingStateName =
                    this.billingState !== undefined
                        ? this.stateOptions.find((e) => e.value == this.billingState).label
                        : undefined;
                break;
            case "billingZip":
                this.billingZip =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "useSameAddressAsBillingAddress":
                this.useSameAddressAsBillingAddress = event.detail.checked;
                if (this.useSameAddressAsBillingAddress) {
                    this.billingStreet = this.billingAddress.addressLine1;
                    this.billingApt =
                        this.billingAddress?.addressLine2 === undefined ? "" : this.billingAddress?.addressLine2;
                    this.billingCity = this.billingAddress.city;
                    this.billingState = this.billingAddress.state;
                    this.billingStateName = this.stateOptions.filter(
                        (state) => this.billingAddress.state === state.value
                    )[0].label;
                    this.billingZip = this.billingAddress.zipCode;
                } else {
                    this.billingStreet = undefined;
                    this.billingApt = undefined;
                    this.billingCity = undefined;
                    this.billingState = undefined;
                    this.billingStateName = undefined;
                    this.billingZip = undefined;
                }
                break;
            case "accept-term-and-conditions-earthlink":
                this.termsAgreed = event.detail.checked;
                break;
        }
        this.disableValidations(false);
    }

    eraseValues() {
        this.lastName = undefined;
        this.firstName = undefined;
        this.cvv = undefined;
        this.month = undefined;
        this.year = undefined;
        this.ccNumber = undefined;
        this.zip = undefined;
        this.type = undefined;
        this.disableValidations(false);
    }

    originalValues(start) {
        this.firstName = this.customer.FirstName;
        this.lastName = this.customer.LastName;
        this.zip = this.customer.Zip;
        this.email = this.customer.Email;
        this.phone = this.customer.Phone;
        this.noEmail = false;
        this.noPhone = false;
        this.billingZip = this.billingAddress.zipCode;
        this.disableValidations(start);
    }

    disableValidations(start) {
        const ccValidated =
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            this.type !== undefined &&
            this.ccNumber !== undefined &&
            this.month !== undefined &&
            this.year !== undefined &&
            this.cvv !== undefined;

        const billingAddressValidated =
            this.useSameAddressAsBillingAddress ||
            (!!this.billingStreet && !!this.billingCity && !!this.billingState && !!this.billingZip);

        const additionalValidations = this.termsAgreed;
        if (ccValidated && billingAddressValidated && additionalValidations) {
            this.noCompleteInformation = false;
        } else {
            if (!start) {
                this.noCompleteInformation = true;
            }
        }
    }

    connectedCallback() {
        this.loaderSpinner = true;
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        this.showPaymentMethods = !this.isGuestUser;
        if (this.isGuestUser) {
            this.showBillingNotification = false;
            this.isPCI = false;
            this.method = "Manual";
            this.isManual = true;
            this.isNotManual = false;
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.stateOptions.push(option);
        });

        this.disclosuresHeader = this.isGuestUser
            ? CUSTOMER_TERMS_AND_CONDITIONS_INSTRUCTIONS
            : AGENT_TERMS_AND_CONDITIONS_INSTRUCTIONS;
        if (this.origin === "phonesales") {
            this.isCallCenterOrigin = true;
            this.showBillingNotification = false;
            this.noCompleteInformation = true;
            this.disableValidations(true);
        }
        this.customer = {
            FirstName: this.clientInfo.contactInfo.firstName,
            LastName: this.clientInfo.contactInfo.lastName,
            Address: `${this.shippingAddress.addressLine1} ${this.shippingAddress.addressLine2}`,
            City: this.shippingAddress.city,
            State: this.shippingAddress.state,
            Zip: this.shippingAddress.zipCode,
            Email: this.clientInfo.contactInfo.email,
            Phone: this.clientInfo.contactInfo.phone
        };
        this.dueTotal = Number(this.cartInfo.todayTotal).toFixed(2);
        this.firstName = this.customer.FirstName;
        this.lastName = this.customer.LastName;
        this.email = this.customer.Email;
        this.phone = this.customer.Phone;
        this.zip = this.customer.Zip;
        this.billingStreet = this.billingAddress.addressLine1;
        this.billingApt = this.billingAddress?.addressLine2 === undefined ? "" : this.billingAddress?.addressLine2;
        this.billingCity = this.billingAddress.city;
        this.billingState = this.billingAddress.state;
        this.billingStateName = this.stateOptions.filter((state) => this.billingAddress.state === state.value)[0].label;
        this.billingZip = this.billingAddress.zipCode;
        this.years.push({ label: SELECT_YEAR_OPTION_LABEL, value: "" });
        let year = new Date().getFullYear();
        for (let i = 0; i < 15; i++) {
            let exp = {
                label: year.toString(),
                value: year.toString()
            };
            this.years.push(exp);
            year = year + 1;
        }
        let month = 0;
        this.months.push({ label: SELECT_MONTH_OPTION_LABEL, value: "" });
        for (let i = 0; i < 12; i++) {
            month = month + 1;
            let m = {
                label: month < 10 ? "0" + month.toString() : month.toString(),
                value: month < 10 ? "0" + month.toString() : month.toString()
            };
            this.months.push(m);
        }

        getCreditCardTypes()
            .then((response) => {
                let initialCC = [];
                let ccs = response.result.Credit_Card_Types__mdt;
                initialCC.push({ label: SELECT_CREDIT_CARD_TYPE_OPTION_LABEL, value: "" });
                ccs.forEach((cc) => {
                    let credit = {
                        label: cc.Label,
                        value: cc.Label
                    };
                    initialCC.push(credit);
                });
                this.ccTypes = [...initialCC];
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

    handleRefresh() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };
        getCreditCardInformation({ myData: myData })
            .then((response) => {
                let result = response.result;
                this.cvv = result.hasOwnProperty("ccCcv") ? result.ccCcv : undefined;
                this.month = result.hasOwnProperty("ccExpirationMonth")
                    ? Number(result.ccExpirationMonth) < 10
                        ? "0" + result.ccExpirationMonth
                        : result.ccExpirationMonth
                    : undefined;
                this.ccNumber = result.hasOwnProperty("ccNumber") ? result.ccNumber : undefined;
                this.year = result.hasOwnProperty("ccExpirationYear") ? result.ccExpirationYear : undefined;
                this.firstName = result.hasOwnProperty("ccFirstName") ? result.ccFirstName : undefined;
                this.lastName = result.hasOwnProperty("ccLastName") ? result.ccLastName : undefined;
                this.type = result.hasOwnProperty("ccType") ? result.ccType : undefined;
                this.zip = result.hasOwnProperty("ccZipcode") ? result.ccZipcode : undefined;
                this.disableValidations(false);
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

    handlePCI(event) {
        this.pciValue = event.target.value;
        this.isEmail = event.target.value === "Email" ? true : false;
    }

    handleEmail(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        this.email = event.target.value != "" ? event.target.value : undefined;
        this.noEmail = !emailre.test(this.email);
    }

    handlePhone(event) {
        let phonere = /^\d{10}$/;
        this.phone = event.target.value != "" ? event.target.value : undefined;
        this.noPhone = !phonere.test(this.phone);
    }

    sendEmail() {
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody = index[0] + "/s/pci-checkout?c__ContextId=" + this.recordId;
        let myData = {
            pciEmail: this.email,
            body: mailBody
        };
        sendCreditCheckPciEmail({ myData: myData })
            .then((response) => {
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: SUCCESS_TOAST_TITLE,
                    variant: "success",
                    message: EMAIL_SENT_SUCCESSFULLY_MESSAGE
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: TOAST_GENERIC_ERROR_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: SEND_EMAIL_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERROR
                });
            });
    }

    sendSMS() {
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody = SMS_VERBIAGE + index[0] + "/s/pci-checkout?c__ContextId=" + this.recordId;
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
                let mess = result.error === "OK" ? SMS_SENT_SUCCESSFULLY_MESSAGE : SEND_SMS_ERROR_MESSAGE;
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
                    title: TOAST_GENERIC_ERROR_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: SEND_SMS_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERROR
                });
            });
    }

    callCreditCheck(event) {
        this.Encrypt = false;
        this.loaderSpinner = true;
        let myData = {
            payment: {
                firstName: this.firstName,
                lastName: this.lastName,
                cardType: this.type,
                cardExpMonth: this.month,
                cardExpYear: this.year,
                zipCode: this.zip.toString(),
                encCardNumber: event.detail.encCardNumber,
                cardNumber: event.detail.encCardNumber,
                cvv: event.detail.encCvv,
                encCvv: event.detail.encCvv,
                phase: event.detail.phase.toString(),
                keyId: event.detail.keyId,
                integrityCheck: event.detail.integrityCheck
            }
        };
        let callout = {
            payment: {
                firstName: myData.payment.firstName.toUpperCase(),
                lastName: myData.payment.lastName.toUpperCase(),
                cardType: myData.payment.cardType.toUpperCase(),
                cardNumber: myData.payment.cardNumber + "||" + myData.payment.integrityCheck,
                cardExpMonth: myData.payment.cardExpMonth,
                cardExpYear: myData.payment.cardExpYear,
                cvv: myData.payment.cvv,
                zipCode: myData.payment.zipCode
            }
        };
        if (!this.useSameAddressAsBillingAddress) {
            callout.billingAddress = {
                addressLine1: this.billingStreet,
                addressLine2: this.billingApt,
                city: this.billingCity,
                state: this.billingState,
                country: "United States",
                zipCode: this.billingZip
            };
            this.callUpdateOrderAndAccountBillingAddress(callout);
        } else {
            const passedEvent = new CustomEvent("creditcardvalidated", {
                detail: callout
            });
            this.dispatchEvent(passedEvent);
        }
    }

    callUpdateOrderAndAccountBillingAddress(callout) {
        let myData = {
            recordId: this.recordId,
            billingCheckOutAddress: {
                billingAddress: this.billingStreet,
                billingAptNumber: this.billingApt,
                billingCity: this.billingCity,
                billingState: this.billingState,
                billingStateName: this.billingStateName,
                billingCountry: "United States",
                billingZip: this.billingZip
            }
        };
        console.log("callUpdateOrderAndAccountBillingAddress :", myData);
        updateOrderAndAccountBillingAddress({ myData: myData })
            .then((response) => {
                const passedEvent = new CustomEvent("creditcardvalidated", {
                    detail: callout
                });
                this.dispatchEvent(passedEvent);
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: TOAST_GENERIC_ERROR_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: BILLING_ADDRESS_UPDATE_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERROR
                });
                this.loaderSpinner = false;
            });
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

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleEncryptionError() {
        this.Encrypt = false;
        this.loaderSpinner = false;
    }

    ccExpired(ccYear, ccMonth) {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
        const paddedMonth = String(ccMonth).padStart(2, "0");
        let currentYearMonth = `${currentYear}-${currentMonth}-1`;
        let ccExpirationDate = `${ccYear}-${paddedMonth}-1`;
        return currentYearMonth >= ccExpirationDate;
    }

    handleLogError(data) {
        let errorLog = {
            type: data.type,
            provider: "Earthlink",
            tab: "Checkout",
            component: "poe_lwcBuyflowEarthlinkCheckoutTab",
            error: data.error,
            endpoint: data.endpoint,
            request: JSON.stringify(data.request),
            opportunity: data.opportunity
        };

        let event = new CustomEvent("logerror", {
            detail: errorLog
        });
        this.dispatchEvent(event);
    }

    handleShowGeneralDisclaimer() {
        this.generalDisclaimer = {
            ...this.disclaimers[0]
        };
        disclaimerModal
            .open({
                disclaimer: this.generalDisclaimer
            })
            .then((result) => {
                if (!result?.agree) {
                    return this.handleCancelAgreement();
                }

                this.handleDisclaimerAgree();
            });
    }

    handleDisclaimerAgree() {
        this.termsAgreed = true;
        this.disableValidations(false);
    }

    handleCancelAgreement() {
        this.termsAgreed = false;
        this.disableValidations(false);
    }

    handleAddressChange(event) {
        this.billingStreet = event.detail.street != "" ? event.detail.street : undefined;
        this.billingCity = event.detail.city != "" ? event.detail.city : undefined;
        this.billingApt = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.billingState = event.detail.province != "" ? event.detail.province : undefined;
        this.billingZip = event.detail.postalCode != "" ? event.detail.postalCode : undefined;
        this.disableValidations(false);
    }
    handleChildLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "Checkout"
        };
        this.dispatchEvent(event);
    }
}