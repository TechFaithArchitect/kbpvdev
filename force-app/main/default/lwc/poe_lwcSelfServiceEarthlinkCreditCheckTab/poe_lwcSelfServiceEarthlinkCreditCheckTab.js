import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import getSSNFraudRules from "@salesforce/apex/CreditCheckTabController.getSSNFraudRules";
import getPOBoxRegExApex from "@salesforce/apex/CreditCheckTabController.getPOBoxRegEx";
import getIPStackSettings from "@salesforce/apex/InfoTabController.getIPStackSettings";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getTPVSettings from "@salesforce/apex/InstallationTPVTabController.getTPVSettings";
import saveFlagIP from "@salesforce/apex/CreditCheckTabController.saveFlagIP";
import customerReachedCap from "@salesforce/apex/CreditCheckTabController.customerReachedCap";
import saveAccountInformation from "@salesforce/apex/CreditCheckTabController.saveAccountInformation";
import saveNewOrder from "@salesforce/apex/CreditCheckTabController.saveNewOrder";
import updateOpportunity from "@salesforce/apex/CreditCheckTabController.updateOpportunity";
import saveACICreditCheck from "@salesforce/apex/CreditCheckTabController.saveACICreditCheck";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

import CAP_REACHED_ERROR from "@salesforce/label/c.Order_Cap_Reached_Body";
import PO_BOX_ERROR_MESSAGE from "@salesforce/label/c.POE_Earthlink_PO_Box_Shipping_Address";
import PO_BOX_ERROR_TITLE from "@salesforce/label/c.PO_Box_Error_Title";
import CONSENT_DISCLAIMER from "@salesforce/label/c.Self_Service_Consent_Text";
import TOAST_GENERIC_ERROR_TITLE from "@salesforce/label/c.Toast_Generic_Error_Title";
import SERVER_ERROR_TOAST_TITLE from "@salesforce/label/c.Server_Error_Toast_Title";
import PHONE_FIELD_LEVEL_HELP from "@salesforce/label/c.EarthLink_CC_Phone_Field_Level_Help";
import ADDRESS_FIELD_LABEL from "@salesforce/label/c.Address_Field_Label";
import CITY_FIELD_LABEL from "@salesforce/label/c.City_Field_Label";
import COUNTRY_FIELD_LABEL from "@salesforce/label/c.Country_Field_Label";
import ZIP_CODE_FIELD_LABEL from "@salesforce/label/c.Zip_Code_Field_Label";
import STATE_FIELD_LABEL from "@salesforce/label/c.State_Field_Label";
import STREET_ADDRESS_FIELD_LABEL from "@salesforce/label/c.Street_Address_Field_Label";
import ADDRESS_LINE_2_FIELD_LABEL from "@salesforce/label/c.Address_Line_2_Field_Label";
import INSTALLATION_DATE_NOT_AVAILABLE_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_Installation_Date_Not_Available_Error_Message";
import PHONE_VALIDATION_FAILED_TOAST_ERROR_TITLE from "@salesforce/label/c.Phone_Validation_Failed_Toast_Error_Title";
import DIGITS_IN_NXX_XXXX_CANNOT_BE_THE_SAME_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_Digits_In_NXX_XXXX_Cannot_Be_The_Same_Error_Message";
import NXX_CANNOT_BEGIN_WITH_0_OR_1_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_NXX_Cannot_Begin_With_0_or_1_Error_Message";
import NPA_CANNOT_BEGIN_WITH_0_OR_1_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_NPA_Cannot_Begin_With_0_or_1_Error_Message";
import EARTHLINK_NPA_CANNOT_MATCH_FORMATS_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_NPA_Cannot_Match_Formats_Error_Message";
import EARTHLINK_NXX_CANNOT_MATCH_FORMATS_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_NXX_Cannot_Match_Formats_Error_Message";
import CREDIT_CHECK_LIMIT_ERROR_TITLE from "@salesforce/label/c.Credit_Check_Limit_Error_Title";
import CREDIT_CHECK_LIMIT_ERROR_MESSAGE from "@salesforce/label/c.Credit_Check_Limit_Error_Message";
import DUPLICATE_CUSTOMER_INFORMATION_ERROR_MESSAGE from "@salesforce/label/c.Duplicate_Customer_Information_Error_Message";
import ORDER_CREATION_GENERIC_ERROR_MESSAGE from "@salesforce/label/c.Order_Creation_Generic_Error_Message";
import DUPLICATE_EARTHLINK_ID_ERROR_MESSAGE from "@salesforce/label/c.Duplicate_EarthLink_Id_Error_Message";
import ACCOUNT_CHECK_GENERIC_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_Account_Check_Generic_Error_Message";
import ACCOUNT_CHECK_GENERIC_ERROR_TITLE from "@salesforce/label/c.EarthLink_Account_Check_Generic_Error_Title";
import INSTALLATION_REQUEST_GENERIC_ERROR_MESSAGE from "@salesforce/label/c.Installation_Request_Generic_Error_Message";
import PLEASE_TRY_AGAIN_ERROR_MESSAGE from "@salesforce/label/c.Please_Try_Again_Error_Message";
import BAD_REQUEST_ERROR_MESSAGE from "@salesforce/label/c.Bad_Request_Error_Message";
import TPV_INTERNAL_UNHANDLED_SERVER_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_TPV_Internal_Unhandled_Server_Error_Message";
import TPV_TIMEOUT_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_TPV_Timeout_Error_Message";
import UNIQUE_IDENTIFIER_DISCLAIMER from "@salesforce/label/c.EarthLink_CC_Unique_Identifier_Disclaimer";
import EMAIL_FIELD_LABEL from "@salesforce/label/c.Earthlink_Email_Broadband_Label_Modal_Email_Field_Label";
import SHIPPING_ADDRESS_SECTION_TITLE from "@salesforce/label/c.Credit_Check_Shipping_Address_Section_Title";
import SHIPPING_ADDRESS_SAME_AS_SERVICE_ADDRESS_FIELD_LABEL from "@salesforce/label/c.Shipping_Address_Same_As_Service_Address_Field_Label";
import SELECT_AVAILABLE_DATE_TIME_FIELD_LABEL from "@salesforce/label/c.Select_Available_Date_Time_Field_Label";
import REFRESH_DATES_BUTTON_LABEL from "@salesforce/label/c.Refresh_Dates_Button_Label";
import NEXT_STEP_BUTTON_LABEL from "@salesforce/label/c.Next_Step_Button_Label";
import LIMIT_REACHED_TITLE from "@salesforce/label/c.Limit_Reached_Title";
import TELL_US_ABOUT_YOU_TITLE from "@salesforce/label/c.Tell_Us_About_You_Title";
import PERSONAL_INFORMATION_TAB_NAME_LABEL from "@salesforce/label/c.Personal_Information_Tab_Name_Label";
import PERSONAL_INFORMATION_TAB_INSTRUCTIONS from "@salesforce/label/c.Personal_Information_Tab_Instructions";
import FIRST_NAME_FIELD_LABEL from "@salesforce/label/c.First_Name_Field_Label";
import LAST_NAME_FIELD_LABEL from "@salesforce/label/c.Last_Name_Field_Label";
import MIDDLE_NAME_FIELD_LABEL from "@salesforce/label/c.Middle_Name_Field_Label";
import CONTACT_PHONE_NUMBER_FIELD_LABEL from "@salesforce/label/c.Contact_Phone_Number_Field_Label";
import FIRST_NAME_FIELD_PLACEHOLDER from "@salesforce/label/c.First_Name_Field_Placeholder";
import LAST_NAME_FIELD_PLACEHOLDER from "@salesforce/label/c.Last_Name_Field_Placeholder";
import INVALID_PHONE_NUMBER_GENERIC_ERROR_MESSAGE from "@salesforce/label/c.Invalid_Phone_Number_Generic_Error_Message";
import EMAIL_FIELD_PLACEHOLDER from "@salesforce/label/c.Email_Field_Placeholder";
import INSTALLATION_PREFERENCES_TITLE from "@salesforce/label/c.Installation_Preferences_Title";

const INTERNAL_ERROR = "Internal Error";
const API_ERROR = "API Error";

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

export default class Poe_lwcSelfServiceEarthlinkCreditCheckTab extends LightningElement {
    @api recordId;
    @api addressInfo;
    @api contactInfo;
    @api selectedServices;
    @api origin;
    @api contactEmail;
    @api useEarthlinkDomain;
    @api isWireless;
    @api isGuestUser;
    @api referralCodeData;
    @api selectedProduct;
    @api contact;
    @api skipInstallation = false;
    loaderSpinner;
    referenceNumber;
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
    shippingStateName;
    shippingZip;
    billingAddress;
    billingApt;
    billingCity;
    billingState;
    billingStateName;
    billingZip;
    elUser;
    domain;
    showShippingAddress = false;
    noShippingInformation = true;
    isCallCenterOrigin;
    offerId;
    noContactInformation = true;
    fraudLimit = 0;
    showCollateral = false;
    recType;

    addressDiscrepancy = false;
    clientIp;
    notValidated = true;
    phoneHelp = PHONE_FIELD_LEVEL_HELP;
    paymentAttempts;
    creditCheckAttempts;
    labels = {
        CAP_REACHED_ERROR,
        TELL_US_ABOUT_YOU_TITLE,
        PERSONAL_INFORMATION_TAB_NAME_LABEL,
        PERSONAL_INFORMATION_TAB_INSTRUCTIONS,
        FIRST_NAME_FIELD_LABEL: this.getRequiredFieldLabel(FIRST_NAME_FIELD_LABEL),
        LAST_NAME_FIELD_LABEL: this.getRequiredFieldLabel(LAST_NAME_FIELD_LABEL),
        MIDDLE_NAME_FIELD_LABEL,
        CONTACT_PHONE_NUMBER_FIELD_LABEL: this.getRequiredFieldLabel(CONTACT_PHONE_NUMBER_FIELD_LABEL),
        FIRST_NAME_FIELD_PLACEHOLDER,
        LAST_NAME_FIELD_PLACEHOLDER,
        INVALID_PHONE_NUMBER_GENERIC_ERROR_MESSAGE,
        EMAIL_FIELD_PLACEHOLDER,
        UNIQUE_IDENTIFIER_DISCLAIMER,
        EMAIL_FIELD_LABEL: this.getRequiredFieldLabel(EMAIL_FIELD_LABEL),
        SHIPPING_ADDRESS_SECTION_TITLE,
        SHIPPING_ADDRESS_SAME_AS_SERVICE_ADDRESS_FIELD_LABEL,
        INSTALLATION_PREFERENCES_TITLE,
        SELECT_AVAILABLE_DATE_TIME_FIELD_LABEL,
        REFRESH_DATES_BUTTON_LABEL,
        NEXT_STEP_BUTTON_LABEL,
        LIMIT_REACHED_TITLE
    };
    showCapReachedModal = false;
    creditCheckModshowCapReachedModal = false;
    poBoxRegEx;
    addressOptions = {
        addressLabel: ADDRESS_FIELD_LABEL,
        cityLabel: CITY_FIELD_LABEL,
        cityPlaceHolder: undefined,
        countryDisabled: true,
        countryLabel: COUNTRY_FIELD_LABEL,
        countryPlaceholder: undefined,
        fieldLevelHelp: undefined,
        postalCodeLabel: ZIP_CODE_FIELD_LABEL,
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
    TPVText;
    dateValue;
    earliestDate;
    noDate = true;
    timeOut = false;
    errorDisclaimer = INSTALLATION_DATE_NOT_AVAILABLE_ERROR_MESSAGE;
    error = false;
    availableDateTimeOptions;
    optIn = false;
    consentLabel = CONSENT_DISCLAIMER;
    useSameAddressAsShippingAddress = true;
    ccNextEventData;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get showDatePicker() {
        return !this.error && this.availableDateTimeOptions && this.availableDateTimeOptions.length > 0;
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconFormUser() {
        return chuzoSiteResources + "/images/icon-earthlink-user.svg";
    }

    get nextButtonClass() {
        return this.notValidated
            ? "btn-rounded btn-center hide-mobile btn-disabled"
            : "btn-rounded btn-center hide-mobile";
    }

    get nextButtonClassMobile() {
        return this.notValidated ? "btn-rounded btn-center btn-disabled" : "btn-rounded btn-center";
    }

    get noSkipInstallation() {
        return !this.skipInstallation;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        } else {
            this.saveIP();
        }
        this.loaderSpinner = true;
        this.creditCheckAttempts = 0;
        if (this.origin === "phonesales") {
            this.isCallCenterOrigin = true;
        }
        if (this.contactInfo) {
            this.firstName = this.contactInfo.firstName;
            this.lastName = this.contactInfo.lastName;
            this.phone = this.contactInfo.phone;
            this.email = this.contactInfo.email;
            this.elUser = this.useEarthlinkDomain
                ? this.contactEmail.split("@")[0].substring(0, 16)
                : this.contactEmail.split("@")[0];
            this.domain = this.contactEmail.split("@")[1];
        }

        this.resetAddressValues(true, true);
        let myData = {
            ContextId: this.recordId,
            partner: "earthlink"
        };

        getSSNFraudRules({ myData })
            .then((response) => {
                this.fraudLimit = response.result.limit;
                this.referenceNumber = response.result.refNum;
                this.paymentAttempts = response.result.attempts;
                this.recType = response.result.recType;
                this.offerId = "";
                this.disableValidations();
                this.getPOBoxRegEx();
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

    getRequiredFieldLabel(fieldLabel) {
        return `${fieldLabel} (*)`;
    }

    handlePhoneValidationToast(msgError) {
        const event = new ShowToastEvent({
            title: PHONE_VALIDATION_FAILED_TOAST_ERROR_TITLE,
            variant: "error",
            mode: "sticky",
            message: msgError
        });
        this.dispatchEvent(event);
    }

    handleContact(event) {
        let characterRepeat = /([0-9])\1{6}/;
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
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
            case "email":
                this.email = event.target.value !== "" ? event.target.value.trim() : undefined;
                if (this.email !== undefined && this.email !== "" && this.email !== null && emailre.test(this.email)) {
                    this.elUser = this.useEarthlinkDomain
                        ? this.email.split("@")[0].substring(0, 16)
                        : this.email.split("@")[0];
                    this.domain = this.useEarthlinkDomain ? "earthlink.net" : event.target.value.split("@")[1];
                    // this.checkNotReady = false;
                    // this.checkDisabled = false;
                } else {
                    // this.checkDisabled = true;
                    // this.checkNotReady = true;
                    this.notValidated = true;
                }
                break;
            case "phone":
                let value = event.target.value;
                if (
                    value != "" &&
                    String(value).substring(0, 3) != "*00" &&
                    String(value).substring(0, 3) != ".9." &&
                    String(value).substring(0, 3) != "888" &&
                    String(value).substring(0, 3) != "877" &&
                    String(value).substring(0, 3) != "866" &&
                    String(value).substring(0, 3) != "855" &&
                    String(value).substring(0, 3) != "900" &&
                    String(value).substring(0, 3) != "911" &&
                    String(value).substring(3, 6) !== "555" &&
                    String(value).substring(3, 6) !== "911" &&
                    !characterRepeat.test(String(value).substring(3, value.length + 1)) &&
                    String(value).charAt(0) !== "0" &&
                    String(value).charAt(0) !== "1" &&
                    String(value).charAt(3) !== "0" &&
                    String(value).charAt(3) !== "1"
                ) {
                    this.phone = value;
                } else {
                    this.phone = undefined;
                    if (value != "" && value.length == 10) {
                        let msgError = "";
                        if (characterRepeat.test(String(value).substring(3, value.length + 1))) {
                            msgError = msgError + `${DIGITS_IN_NXX_XXXX_CANNOT_BE_THE_SAME_ERROR_MESSAGE} `;
                        }
                        if (String(value).charAt(3) === "0" || String(value).charAt(3) === "1") {
                            msgError = msgError + `${NXX_CANNOT_BEGIN_WITH_0_OR_1_ERROR_MESSAGE} `;
                        }
                        if (String(value).charAt(0) === "0" || String(value).charAt(0) === "1") {
                            msgError = msgError + `${NPA_CANNOT_BEGIN_WITH_0_OR_1_ERROR_MESSAGE} `;
                        }
                        if (
                            String(value).substring(0, 3) === "*00" ||
                            String(value).substring(0, 3) === ".9." ||
                            String(value).substring(0, 3) === "888" ||
                            String(value).substring(0, 3) === "877" ||
                            String(value).substring(0, 3) === "866" ||
                            String(value).substring(0, 3) === "855" ||
                            String(value).substring(0, 3) === "900" ||
                            String(value).substring(0, 3) === "911"
                        ) {
                            msgError = msgError + `${EARTHLINK_NPA_CANNOT_MATCH_FORMATS_ERROR_MESSAGE} `;
                        }
                        if (String(value).substring(3, 6) === "555" || String(value).substring(3, 6) === "911") {
                            msgError = msgError + `${EARTHLINK_NXX_CANNOT_MATCH_FORMATS_ERROR_MESSAGE} `;
                        }
                        if (msgError !== "") {
                            this.handlePhoneValidationToast(msgError);
                        }
                    }
                }
                break;
        }
        this.disableValidations();
    }

    handlePredictiveShippingAddressChange(event) {
        this.shippingAddress = event.detail.street != "" ? event.detail.street : undefined;
        this.shippingCity = event.detail.city != "" ? event.detail.city : undefined;
        this.shippingApt = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.shippingState = event.detail.province != "" ? event.detail.province : undefined;
        this.shippingStateName =
            this.shippingState !== undefined
                ? stateNames.find((e) => e.abbrev == this.shippingState) !== undefined
                    ? stateNames.find((e) => e.abbrev == this.shippingState).name
                    : undefined
                : undefined;
        this.shippingZip = event.detail.postalCode != "" ? event.detail.postalCode : undefined;

        this.disableValidations();
    }

    disableValidations() {
        let phonere = /^\d{10}$/;
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        if (
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            phonere.test(this.phone) &&
            emailre.test(this.email)
        ) {
            this.noContactInformation = false;
        } else {
            this.noContactInformation = true;
        }

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

        if (
            !this.noContactInformation &&
            !this.noAddressInformation &&
            !this.noShippingInformation &&
            (!this.noDate || this.skipInstallation)
        ) {
            this.notValidated = false;
        } else {
            this.notValidated = true;
        }
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCancel() {
        const sendBackEvent = new CustomEvent("cancel");
        this.dispatchEvent(sendBackEvent);
    }

    handleShippingAddress(event) {
        this.showShippingAddress = !event.target.checked;
        if (event.target.checked) {
            this.resetAddressValues(true, false);
        }
        this.disableValidations();
    }

    resetAddressValues(shipping, billing) {
        if (shipping) {
            this.shippingAddress = this.addressInfo.address;
            this.shippingApt = this.addressInfo.apt;
            this.shippingCity = this.addressInfo.city;
            this.shippingZip = this.addressInfo.zip;
            stateNames.forEach((state) => {
                if (state.name === this.addressInfo.state || state.abbrev === this.addressInfo.state) {
                    this.shippingState = state.abbrev;
                    this.shippingStateName = state.name;
                }
            });
        }

        if (billing) {
            this.billingAddress = this.addressInfo.address;
            this.billingApt = this.addressInfo.apt;
            this.billingCity = this.addressInfo.city;
            this.billingZip = this.addressInfo.zip.substring(0, 5);
            stateNames.forEach((state) => {
                if (state.name === this.addressInfo.state || state.abbrev === this.addressInfo.state) {
                    this.billingState = state.abbrev;
                    this.billingStateName = state.name;
                }
            });
        }
    }

    getPOBoxRegEx() {
        this.loaderSpinner = true;

        getPOBoxRegExApex()
            .then((response) => {
                this.poBoxRegEx = new RegExp(response.result.poBoxRegEx);
                if (!this.skipInstallation) {
                    this.callTPVData();
                } else {
                    this.loaderSpinner = false;
                }
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
                            this.handleLogError({
                                error: error.body?.message || error.message,
                                type: INTERNAL_ERROR
                            });
                        });
                };
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERROR
                });
            });
    }

    handleNext() {
        this.loaderSpinner = true;
        let data = {
            Email: this.email
        };

        if (this.isInvalidShippingAddressForPOBox()) {
            this.loaderSpinner = false;
            return;
        }

        console.log("Customer Cap Reached Request", data);
        customerReachedCap({ myData: data })
            .then((response) => {
                console.log("Customer Cap Reached response", response);
                let capReached = response.result.capReached;

                if (capReached) {
                    this.loaderSpinner = false;
                    this.showCapReachedModal = true;

                    this.handleLogError({
                        error: this.labels.CAP_REACHED_ERROR,
                        type: INTERNAL_ERROR
                    });
                } else {
                    // this.handleCallCC();
                    this.handleCallELCheck();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const errMsg = error.body?.message || error.message;
                this.handleLogError({
                    error: this.labels.CAP_REACHED_ERROR,
                    type: INTERNAL_ERROR
                });
            });
    }

    handleCallCC() {
        this.loaderSpinner = true;
        if (this.creditCheckAttempts < 3) {
            this.creditCheckAttempts = this.creditCheckAttempts + 1;
        } else {
            const event = new ShowToastEvent({
                title: CREDIT_CHECK_LIMIT_ERROR_TITLE,
                variant: "error",
                mode: "sticky",
                message: CREDIT_CHECK_LIMIT_ERROR_MESSAGE
            });
            this.dispatchEvent(event);
            this.paymentAttempts = this.creditCheckAttempts;
            this.notValidated = true;
            this.updateOpp();
            this.loaderSpinner = false;
            return;
        }

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
            ShippingZipCode: this.shippingZip,
            BillingStreet: this.billingAddress,
            BillingCity: this.billingCity,
            BillingApt: this.billingApt,
            BillingState: this.billingState,
            ShippingZipCode: this.shippingZip,
            BillingZipCode: this.billingZip
        };

        if (
            this.shippingAddress !== this.addressInfo.address ||
            this.shippingApt !== this.addressInfo.apt ||
            this.shippingCity !== this.addressInfo.city ||
            this.shippingZip !== this.addressInfo.zip
        ) {
            this.addressDiscrepancy = true;
        }
        let myData = {
            offerId: this.offerId,
            customer: {
                firstName: data.FirstName,
                middleName: data.MiddleName,
                lastName: data.LastName,
                phoneNumber: data.Phone
            },
            account: {
                contactEmail: this.elUser + "@" + this.domain,
                billingAddress: {
                    addressLine1: data.ShippingStreet,
                    addressLine2: data.ShippingApt !== undefined ? data.ShippingApt : "",
                    city: data.ShippingCity,
                    state: data.ShippingState,
                    country: "United States",
                    zipCode: data.ShippingZipCode
                },
                shippingAddress: {
                    addressLine1: data.ShippingStreet,
                    addressLine2: data.ShippingApt !== undefined ? data.ShippingApt : "",
                    city: data.ShippingCity,
                    state: data.ShippingState,
                    country: "United States",
                    zipCode: data.ShippingZipCode
                },
                serviceAddress: {
                    addressLine1: this.addressInfo.address,
                    addressLine2: this.addressInfo.apt !== undefined ? this.addressInfo.apt : "",
                    city: this.addressInfo.city,
                    state: this.addressInfo.state,
                    country: "United States",
                    zipCode: this.addressInfo.zip
                }
            }
        };
        if (this.useEarthlinkDomain) {
            myData.customer.emailAddress = this.elUser + "@" + this.domain;
            myData.account.contactEmail = this.email;
        }
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

        let json = {
            family: "EarthLink",
            representative: repType,
            addressDiscrepancy: this.addressDiscrepancy,
            consent: this.optIn,
            timeStamp: new Date(),
            ContextId: this.recordId,
            recordTypeName: "Person Account",
            ProductName: this.selectedProduct.Name,
            Services: this.selectedServices,
            recordTypeId: this.recType,
            Pricebook: "Standard Price Book",
            accName: data.FirstName + " " + data.LastName,
            creditCheck: {
                accountDetails: {
                    billingCreditCheckAddress: {
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
            contactInfo: {
                firstName: data.FirstName,
                middleName: data.MiddleName,
                lastName: data.LastName,
                email: data.Email,
                phone: data.Phone
            },
            contactEmail: this.elUser + "@" + this.domain
        };

        console.log("save account information request", json);
        saveAccountInformation({ myData: json })
            .then((response) => {
                console.log("save account information response", response);
                if (response.result.error) {
                    this.loaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: TOAST_GENERIC_ERROR_TITLE,
                        variant: "error",
                        mode: "sticky",
                        message: DUPLICATE_CUSTOMER_INFORMATION_ERROR_MESSAGE
                    });
                    this.dispatchEvent(event);
                } else {
                    json.creditCheck.IPResult = response.result;
                    json.AccountId = json.creditCheck.IPResult.Account.Id;
                    json.email = this.email;
                    json.phone = this.phone;

                    if (this.isGuestUser && this.referralCodeData) {
                        json.referralCodeId = this.referralCodeData.Id || this.referralCodeData.referralCodeId;
                    }

                    console.log("save new order request", json);
                    const promiseList = [this.saveOrder(json, myData, clientInfo)];
                    Promise.all(promiseList).then(() => {
                        if (!this.ccNextEventData) {
                            return;
                        }

                        if (!this.isGuestUser) {
                            let aci = {
                                ContextId: this.recordId
                            };

                            saveACICreditCheck({ myData: aci })
                                .then(() => {
                                    this.loaderSpinner = false;
                                    const closeModalEvent = new CustomEvent("creditcheckpassed", {
                                        detail: this.ccNextEventData
                                    });
                                    this.dispatchEvent(closeModalEvent);
                                })
                                .catch((error) => {
                                    console.error(error, "ERROR");
                                    const event = new ShowToastEvent({
                                        title: TOAST_GENERIC_ERROR_TITLE,
                                        variant: "error",
                                        mode: "sticky",
                                        message: ORDER_CREATION_GENERIC_ERROR_MESSAGE
                                    });
                                    this.dispatchEvent(event);
                                    this.handleLogError({
                                        error: error.body?.message || error.message,
                                        type: INTERNAL_ERROR
                                    });
                                    this.loaderSpinner = false;
                                });
                        } else {
                            this.loaderSpinner = false;
                            const closeModalEvent = new CustomEvent("creditcheckpassed", {
                                detail: this.ccNextEventData
                            });
                            this.dispatchEvent(closeModalEvent);
                        }
                    });
                }
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

    saveOrder(json, myData, clientInfo) {
        return saveNewOrder({ myData: json })
            .then((response) => {
                console.log("Save new order response", response);
                let dateV = !this.dateValue ? "" : this.dateValue;
                let Order = response.result.OrderItem;
                let OrderItems = response.result.Order;
                json.Order = Order;
                json.OrderItems = OrderItems;
                this.ccNextEventData = {
                    clientInfo,
                    referenceNumber: this.referenceNumber,
                    creditCheckCallout: myData,
                    contactEmail: this.elUser + "@" + this.domain,
                    paymentAttempts: this.paymentAttempts,
                    orderId: response.result.Order.Id,
                    selectedDate: dateV,
                    earliestDate: this.earliestDate
                };
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

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleCallELCheck() {
        this.loaderSpinner = true;
        let myData = {
            path: "accountAvailability",
            httpMethod: "PUT",
            domain: this.domain,
            partnerName: "earthlink",
            firstName: this.firstName,
            lastName: this.lastName,
            userId: this.elUser
        };
        console.log("Account Availability Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Account Availability Response", responseParsed);
                let success = responseParsed.hasOwnProperty("requestedIsAvailable");
                if (!success) {
                    let errorMsg;
                    if (
                        responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        responseParsed.result.error.hasOwnProperty("provider") &&
                        responseParsed.result.error.provider.hasOwnProperty("message") &&
                        responseParsed.result.error.provider.message === "Request failed"
                    ) {
                        errorMsg = DUPLICATE_EARTHLINK_ID_ERROR_MESSAGE;
                    }
                    this.notValidated = true;
                    const finalErrorMessage = errorMsg !== undefined ? errorMsg : ACCOUNT_CHECK_GENERIC_ERROR_MESSAGE;
                    const event = new ShowToastEvent({
                        title: errorMsg !== undefined ? ACCOUNT_CHECK_GENERIC_ERROR_TITLE : SERVER_ERROR_TOAST_TITLE,
                        variant: "error",
                        mode: "sticky",
                        message: finalErrorMessage
                    });
                    this.dispatchEvent(event);
                    this.handleLogError({
                        error: `${finalErrorMessage}\nAPI Response: ${response}`,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                    this.loaderSpinner = false;
                } else {
                    if (responseParsed.requestedIsAvailable) {
                        this.handleCallCC();
                    } else {
                        this.notValidated = true;
                        let errormessage = DUPLICATE_EARTHLINK_ID_ERROR_MESSAGE;
                        const event = new ShowToastEvent({
                            title: ACCOUNT_CHECK_GENERIC_ERROR_TITLE,
                            variant: "error",
                            mode: "sticky",
                            message: errormessage
                        });
                        this.dispatchEvent(event);
                        this.handleLogError({
                            error: `${errormessage}\nAPI Response: ${response}`,
                            type: API_ERROR,
                            endpoint: myData.path,
                            request: myData,
                            opportunity: this.recordId
                        });
                        this.loaderSpinner = false;
                    }
                }
            })
            .catch((error) => {
                const genericErrorMessage = ACCOUNT_CHECK_GENERIC_ERROR_MESSAGE;
                const event = new ShowToastEvent({
                    title: SERVER_ERROR_TOAST_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                console.log(error);
                if (apiResponse) {
                    this.handleLogError({
                        error: `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.handleLogError({
                        error: errMsg,
                        type: INTERNAL_ERROR
                    });
                }
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
                        title: TOAST_GENERIC_ERROR_TITLE,
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
                    title: TOAST_GENERIC_ERROR_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: error
                });
                this.dispatchEvent(event);
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERROR
                });
            });
    }

    isInvalidShippingAddressForPOBox() {
        const isInvalidAddress = this.poBoxRegEx.test(this.shippingAddress);
        if (isInvalidAddress) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: PO_BOX_ERROR_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: PO_BOX_ERROR_MESSAGE
                })
            );
        }

        return isInvalidAddress;
    }

    callTPVData() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };

        console.log("get tpv setting request", myData);
        getTPVSettings({ myData })
            .then((response) => {
                console.log("get tpv setting response", response);
                this.TPVText = response.result.TPVText === "Yes";
                this.tpvCallout();
            })
            .catch((error) => {
                this.loaderSpinner = false;
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERROR
                });
                console.log(error);
            });
    }

    tpvCallout() {
        this.noDate = true;
        this.loaderSpinner = true;
        let myData = {
            partnerName: "earthlink",
            path: "installation",
            callLogId: this.selectedProduct.callLogId,
            serviceRef: this.selectedProduct.servRef
        };
        console.log("Installation Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Installation Response", responseParsed);
                let slots = responseParsed.hasOwnProperty("installWindows") ? responseParsed.installWindows : [];
                let hasError =
                    responseParsed.hasOwnProperty("error") ||
                    (responseParsed.hasOwnProperty("result") && responseParsed.result.hasOwnProperty("message"));
                let badRequest = responseParsed.hasOwnProperty("info") ? responseParsed.info.statusCode == 400 : false;
                if (hasError || badRequest) {
                    this.error = true;
                    this.noDate = false;
                    let msg;
                    if (hasError) {
                        msg =
                            responseParsed.hasOwnProperty("error") && responseParsed.error.hasOwnProperty("provider")
                                ? responseParsed.error.provider.message
                                : responseParsed.error.hasOwnProperty("message")
                                ? responseParsed.error.message
                                : responseParsed.error;
                        const event = new ShowToastEvent({
                            title: SERVER_ERROR_TOAST_TITLE,
                            variant: "error",
                            mode: "sticky",
                            message: `${INSTALLATION_REQUEST_GENERIC_ERROR_MESSAGE}: ${msg}`
                        });
                        this.dispatchEvent(event);
                        if (msg === TPV_TIMEOUT_ERROR_MESSAGE || msg === TPV_INTERNAL_UNHANDLED_SERVER_ERROR_MESSAGE) {
                            this.timeOut = true;
                        }
                    } else if (badRequest) {
                        msg = `${INSTALLATION_REQUEST_GENERIC_ERROR_MESSAGE}: ${BAD_REQUEST_ERROR_MESSAGE}`;
                        const event = new ShowToastEvent({
                            title: SERVER_ERROR_TOAST_TITLE,
                            variant: "error",
                            mode: "sticky",
                            message: msg
                        });
                        this.dispatchEvent(event);
                    }
                    this.handleLogError({
                        error: msg,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                    this.loaderSpinner = false;
                } else {
                    this.error = false;
                    this.availableDateTimeOptions = [];
                    if (slots.length > 0) {
                        slots.forEach((slot) => {
                            let startTime = Number(slot.startTime.slice(-5).replace(":00", ""));
                            let endTime = Number(slot.endTime.slice(-5).replace(":00", ""));
                            startTime =
                                startTime - 12 >= 0
                                    ? `${startTime - 12 > 0 ? String(startTime - 12) : String(startTime)}:00 PM`
                                    : `${String(startTime)}:00 AM`;
                            endTime =
                                endTime - 12 >= 0
                                    ? `${endTime - 12 > 0 ? String(endTime - 12) : String(endTime)}:00 PM`
                                    : `${String(endTime)}:00 AM`;
                            this.availableDateTimeOptions.push({
                                date: slot.date,
                                timeSlot: `${startTime} - ${endTime}`,
                                apiTimeSlot: `${slot.startTime} - ${slot.endTime}`
                            });
                        });
                        this.earliestDate = slots[0];
                    }
                    if (this.dateSelected !== null || this.dateSelected !== undefined) {
                        this.dateValue = this.dateSelected;
                        let valueFound = false;
                        for (const datetime of this.availableDateTimeOptions) {
                            valueFound = this.dateValue === `${datetime.date} ${datetime.timeSlot}`;
                            if (valueFound) {
                                break;
                            }
                        }
                        this.noDate = !valueFound;
                    }
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                this.error = true;
                this.noDate = false;
                const event = new ShowToastEvent({
                    title: SERVER_ERROR_TOAST_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: `${INSTALLATION_REQUEST_GENERIC_ERROR_MESSAGE}. ${PLEASE_TRY_AGAIN_ERROR_MESSAGE}`
                });
                this.dispatchEvent(event);
                console.log(error);
                const errMsg = error.body?.message || error.message;
                if (apiResponse) {
                    this.handleLogError({
                        error: `${errMsg}\nAPI Response: ${apiResponse}`,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                } else {
                    this.handleLogError({
                        error: errMsg,
                        type: INTERNAL_ERROR
                    });
                }
                this.loaderSpinner = false;
            });

        this.disableValidations();
    }

    handleInstallationTimeChange(event) {
        this.dateValue = `${event.detail.dateValue} ${event.detail.timeValue}`;
        this.noDate = !this.dateValue || this.dateValue.includes(String(undefined));
        this.disableValidations();
    }

    handleRefreshDates(event) {
        this.tpvCallout();
    }

    handleConsent(event) {
        this.optIn = event.target.checked;
    }

    handleChildLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "Credit Check"
        };
        this.dispatchEvent(event);
    }

    handleLogError(data) {
        let errorLog = {
            type: data.type,
            provider: "Earthlink",
            tab: "Credit Check",
            component: "poe_lwcBuyflowEarthlinkCreditCheckTab",
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
}