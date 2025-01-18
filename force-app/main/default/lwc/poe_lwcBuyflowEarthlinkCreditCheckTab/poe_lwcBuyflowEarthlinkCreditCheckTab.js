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
import customerReachedCap from "@salesforce/apex/CreditCheckTabController.customerReachedCap";
import getPOBoxRegExApex from "@salesforce/apex/CreditCheckTabController.getPOBoxRegEx";
import getIPStackSettings from "@salesforce/apex/InfoTabController.getIPStackSettings";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";

import SELF_SERVICE_VALIDATE_LEAVING_MESSAGE from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import SELF_SERVICE_VALIDATE_LEAVING_TITLE from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import CAP_REACHED_ERROR from "@salesforce/label/c.Order_Cap_Reached_Body";
import PO_BOX_ERROR_TITLE from "@salesforce/label/c.PO_Box_Error_Title";
import PO_BOX_ERROR_MESSAGE from "@salesforce/label/c.POE_Earthlink_PO_Box_Shipping_Address";
import CONSENT_DISCLAIMER from "@salesforce/label/c.Chuzo_Consent_Text";
import ADDRESS_FIELD_LABEL from "@salesforce/label/c.Address_Field_Label";
import CITY_FIELD_LABEL from "@salesforce/label/c.City_Field_Label";
import COUNTRY_FIELD_LABEL from "@salesforce/label/c.Country_Field_Label";
import ZIP_CODE_FIELD_LABEL from "@salesforce/label/c.Zip_Code_Field_Label";
import STATE_FIELD_LABEL from "@salesforce/label/c.State_Field_Label";
import STREET_ADDRESS_FIELD_LABEL from "@salesforce/label/c.Street_Address_Field_Label";
import ADDRESS_LINE_2_FIELD_LABEL from "@salesforce/label/c.Address_Line_2_Field_Label";
import SSN_OPTION_LABEL from "@salesforce/label/c.SSN_Option_Label";
import DRIVERS_LICENSE_OPTION_LABEL from "@salesforce/label/c.Drivers_License_Option_Label";
import PCI_LINK_OPTION_LABEL from "@salesforce/label/c.PCI_Link_Option_Label";
import MANUAL_PCI_OPTION_LABEL from "@salesforce/label/c.Manual_PCI_Option_Label";
import PHONE_FIELD_LEVEL_HELP from "@salesforce/label/c.EarthLink_CC_Phone_Field_Level_Help";
import PHONE_VALIDATION_FAILED_TOAST_ERROR_TITLE from "@salesforce/label/c.Phone_Validation_Failed_Toast_Error_Title";
import DIGITS_IN_NXX_XXXX_CANNOT_BE_THE_SAME_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_Digits_In_NXX_XXXX_Cannot_Be_The_Same_Error_Message";
import NXX_CANNOT_BEGIN_WITH_0_OR_1_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_NXX_Cannot_Begin_With_0_or_1_Error_Message";
import NPA_CANNOT_BEGIN_WITH_0_OR_1_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_NPA_Cannot_Begin_With_0_or_1_Error_Message";
import EARTHLINK_NPA_CANNOT_MATCH_FORMATS_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_NPA_Cannot_Match_Formats_Error_Message";
import EARTHLINK_NXX_CANNOT_MATCH_FORMATS_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_NXX_Cannot_Match_Formats_Error_Message";
import UNIQUE_EMAIL_WITH_MAX_LENGTH_FIELD_LABEL from "@salesforce/label/c.Unique_Email_With_Max_Length_Field_Label";
import UNIQUE_EMAIL_FIELD_LABEL from "@salesforce/label/c.Unique_Email_Field_Label";
import CREDIT_CHECK_LIMIT_ERROR_TITLE from "@salesforce/label/c.Credit_Check_Limit_Error_Title";
import CREDIT_CHECK_LIMIT_ERROR_MESSAGE from "@salesforce/label/c.Credit_Check_Limit_Error_Message";
import DUPLICATE_CUSTOMER_INFORMATION_ERROR_MESSAGE from "@salesforce/label/c.Duplicate_Customer_Information_Error_Message";
import ORDER_CREATION_GENERIC_ERROR_MESSAGE from "@salesforce/label/c.Order_Creation_Generic_Error_Message";
import DUPLICATE_EARTHLINK_ID_ERROR_MESSAGE from "@salesforce/label/c.Duplicate_EarthLink_Id_Error_Message";
import ACCOUNT_CHECK_GENERIC_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_Account_Check_Generic_Error_Message";
import ACCOUNT_CHECK_GENERIC_ERROR_TITLE from "@salesforce/label/c.EarthLink_Account_Check_Generic_Error_Title";
import TOAST_GENERIC_ERROR_TITLE from "@salesforce/label/c.Toast_Generic_Error_Title";
import SERVER_ERROR_TOAST_TITLE from "@salesforce/label/c.Server_Error_Toast_Title";
import ZIP_FIELD_LABEL from "@salesforce/label/c.Zip_Field_Label";
import CC_1_CUSTOMER_DETAILS_TITLE from "@salesforce/label/c.Credit_Check_1_Customer_Details_Title";
import CONTACT_INFORMATION_SECTION_TITLE from "@salesforce/label/c.Credit_Check_Contact_Information_Section_Title";
import FIRST_NAME_FIELD_LABEL from "@salesforce/label/c.First_Name_Field_Label";
import MIDDLE_NAME_FIELD_LABEL from "@salesforce/label/c.Middle_Name_Field_Label";
import LAST_NAME_FIELD_LABEL from "@salesforce/label/c.Last_Name_Field_Label";
import CONTACT_PHONE_NUMBER_FIELD_LABEL from "@salesforce/label/c.Contact_Phone_Number_Field_Label";
import INVALID_PHONE_NUMBER_GENERIC_ERROR_MESSAGE from "@salesforce/label/c.Invalid_Phone_Number_Generic_Error_Message";
import CC_2_ACCOUNT_DETAILS_TITLE from "@salesforce/label/c.Credit_Check_2_Account_Details_Title";
import SHIPPING_ADDRESS_SECTION_TITLE from "@salesforce/label/c.Credit_Check_Shipping_Address_Section_Title";
import SHIPPING_ADDRESS_SAME_AS_SERVICE_ADDRESS_FIELD_LABEL from "@salesforce/label/c.Shipping_Address_Same_As_Service_Address_Field_Label";
import MULTIPLE_ADDRESS_ATTEMPTS_WARNING from "@salesforce/label/c.EarthLink_CC_Multiple_Address_Attempts_Warning";
import BILLING_ADDRESS_SECTION_TITLE from "@salesforce/label/c.Credit_Check_Billing_Address_Section_Title";
import BILLING_ADDRESS_SAME_AS_SERVICE_ADDRESS_FIELD_LABEL from "@salesforce/label/c.Billing_Address_Same_As_Service_Address_Field_Label";
import CC_3_EARTHLINK_ACCOUNT_TITLE from "@salesforce/label/c.Credit_Check_3_EarthLink_Account_Title";
import UNIQUE_IDENTIFIER_DISCLAIMER from "@salesforce/label/c.EarthLink_CC_Unique_Identifier_Disclaimer";
import CHECK_BUTTON_LABEL from "@salesforce/label/c.Check_Button_Label";
import INVALID_USER_ID_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_CC_Invalid_User_Id_Error_Message";
import SUGGESTED_USER_IDS_VERBIAGE from "@salesforce/label/c.EarthLink_CC_Suggested_User_Ids_Verbiage";
import USER_ID_VALIDATED_MESSAGE from "@salesforce/label/c.EarthLink_CC_User_Id_Validated_Message";

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

export default class PoeBuyflowCreditCheckTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api addressInfo;
    @api contactInfo;
    @api selectedServices;
    @api logo;
    @api origin;
    @api contactEmail;
    @api useEarthlinkDomain;
    @api isWireless;
    @api isGuestUser;
    @api referralCodeData;
    @api selectedProduct;
    @api contact;
    activeSections = ["A", "B"];
    loaderSpinner;
    referenceNumber;
    ccShowSSN;
    ccSSN;
    ccDOB;
    ccDL;
    ccDLstate;
    ccDLexpDate;
    firstName;
    lastName;
    middleName;
    noAddressInformation = true;
    email;
    phone;
    mockSSNResponse;
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
    ssn;
    checkNotReady = true;
    repeatSSN;
    sameSSN = false;
    DOB;
    DLstate;
    DLnumber;
    DLexpDate;
    elUser;
    domain;
    showSSNAgreement = false;
    agreementChecked = false;
    showBillingAddress = false;
    showShippingAddress = false;
    noShippingInformation = true;
    disclosureAgreement = false;
    isCallCenterOrigin;
    isPCI = true;
    offerId;
    isDL = false;
    SSNoptions = [
        { label: SSN_OPTION_LABEL, value: "SSN" },
        { label: DRIVERS_LICENSE_OPTION_LABEL, value: "DL" }
    ];
    SSNorDL = "SSN";
    isManual = false;
    states = [];
    methods = [
        { label: PCI_LINK_OPTION_LABEL, value: "PCI" },
        { label: MANUAL_PCI_OPTION_LABEL, value: "Manual" }
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
    showCollateral = false;
    recType;

    addressDiscrepancy = false;
    creditFreeze = false;
    clientIp;
    accountNotAccepted;
    notValidated = true;
    suggestedIds;
    validateResults = false;
    validationError = false;
    phoneHelp = PHONE_FIELD_LEVEL_HELP;
    userLength;
    userLabel;
    editBillingAddress;
    editShippingAddress;
    paymentAttempts;
    creditCheckAttempts;
    labels = {
        SELF_SERVICE_VALIDATE_LEAVING_TITLE,
        SELF_SERVICE_VALIDATE_LEAVING_MESSAGE,
        CAP_REACHED_ERROR,
        ZIP_FIELD_LABEL,
        CC_1_CUSTOMER_DETAILS_TITLE,
        CONTACT_INFORMATION_SECTION_TITLE,
        FIRST_NAME_FIELD_LABEL,
        MIDDLE_NAME_FIELD_LABEL,
        LAST_NAME_FIELD_LABEL,
        CONTACT_PHONE_NUMBER_FIELD_LABEL,
        INVALID_PHONE_NUMBER_GENERIC_ERROR_MESSAGE,
        CC_2_ACCOUNT_DETAILS_TITLE,
        SHIPPING_ADDRESS_SECTION_TITLE,
        SHIPPING_ADDRESS_SAME_AS_SERVICE_ADDRESS_FIELD_LABEL,
        MULTIPLE_ADDRESS_ATTEMPTS_WARNING,
        ADDRESS_FIELD_LABEL,
        CITY_FIELD_LABEL,
        COUNTRY_FIELD_LABEL,
        STATE_FIELD_LABEL,
        ADDRESS_LINE_2_FIELD_LABEL,
        BILLING_ADDRESS_SECTION_TITLE,
        BILLING_ADDRESS_SAME_AS_SERVICE_ADDRESS_FIELD_LABEL,
        CC_3_EARTHLINK_ACCOUNT_TITLE,
        UNIQUE_IDENTIFIER_DISCLAIMER: `${UNIQUE_IDENTIFIER_DISCLAIMER}:`,
        CHECK_BUTTON_LABEL,
        INVALID_USER_ID_ERROR_MESSAGE,
        SUGGESTED_USER_IDS_VERBIAGE,
        USER_ID_VALIDATED_MESSAGE
    };
    showSelfServiceCancelModal = false;
    checkDisabled = true;
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
    accountId;
    contactConsentLabel = CONSENT_DISCLAIMER;
    contactConsent = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get dontShowSSNAgreement() {
        return !this.showSSNAgreement;
    }

    handleSSNValue(event) {
        this.loaderSpinner = true;
        this.agreementChecked = event.target.checked;
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
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERROR
                });
                this.loaderSpinner = false;
            });
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
        this.notValidated = true;
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

    handleAddressChange(event) {
        console.log(this.showBillingAddress);
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
                        ? this.states.find((e) => e.value == this.shippingState).label
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
                        ? this.states.find((e) => e.value == this.billingState).label
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

    handlePredictiveBillingAddressChange(event) {
        this.billingAddress = event.detail.street != "" ? event.detail.street : undefined;
        this.billingCity = event.detail.city != "" ? event.detail.city : undefined;
        this.billingApt = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.billingState = event.detail.province != "" ? event.detail.province : undefined;
        this.billingZip = event.detail.postalCode != "" ? event.detail.postalCode : undefined;

        this.disableValidations();
    }

    handlePredictiveShippingAddressChange(event) {
        this.shippingAddress = event.detail.street != "" ? event.detail.street : undefined;
        this.shippingCity = event.detail.city != "" ? event.detail.city : undefined;
        this.shippingApt = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.shippingState = event.detail.province != "" ? event.detail.province : undefined;
        this.shippingZip = event.detail.postalCode != "" ? event.detail.postalCode : undefined;

        this.disableValidations();
    }

    disableValidations() {
        let phonere = /^\d{10}$/;
        if (this.firstName !== undefined && this.lastName !== undefined && phonere.test(this.phone)) {
            this.noContactInformation = false;
        } else {
            this.noContactInformation = true;
        }
        if (this.showBillingAddress === false) {
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

        if (
            !this.noContactInformation &&
            !this.noAddressInformation &&
            !this.noShippingInformation &&
            !this.accountNotAccepted &&
            !this.validationError &&
            !this.checkNotReady &&
            this.validateResults
        ) {
            this.notValidated = false;
        } else {
            this.notValidated = true;
        }

        if (!this.noContactInformation && this.showBillingAddress) {
            this.editBillingAddress = false;
        } else {
            this.editBillingAddress = true;
        }
        if (!this.noContactInformation && this.showShippingAddress) {
            this.editShippingAddress = false;
        } else {
            this.editShippingAddress = true;
        }
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
        this.showBillingAddress = !event.target.checked;
        if (event.target.checked) {
            this.resetAddressValues(false, true);
        }
        this.disableValidations();
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

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.loaderSpinner = true;
        this.creditCheckAttempts = 0;
        if (!this.isGuestUser) {
            this.saveIP();
        }
        this.userLength = this.useEarthlinkDomain ? "16" : "99";
        this.userLabel = this.useEarthlinkDomain ? UNIQUE_EMAIL_WITH_MAX_LENGTH_FIELD_LABEL : UNIQUE_EMAIL_FIELD_LABEL;
        if (this.origin === "phonesales") {
            this.isCallCenterOrigin = true;
        }
        this.firstName = this.contactInfo.firstName;
        this.lastName = this.contactInfo.lastName;
        this.phone = this.contactInfo.phone;
        this.elUser = this.useEarthlinkDomain
            ? this.contactEmail.split("@")[0].substring(0, 16)
            : this.contactEmail.split("@")[0];
        this.domain = this.contactEmail.split("@")[1];
        this.email = this.contactInfo.email;
        this.checkDisabled = this.email === undefined || this.email === null || this.email == "";
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.states.push(option);
        });
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

    getPOBoxRegEx() {
        this.loaderSpinner = true;

        getPOBoxRegExApex()
            .then((response) => {
                this.poBoxRegEx = new RegExp(response.result.poBoxRegEx);
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

    handleApprove(event) {
        this.disclosureAgreement = event.target.checked;
        this.disableValidations();
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
                    this.handleCallCC();
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
                    addressLine1: this.showBillingAddress ? data.BillingStreet : data.ShippingStreet,
                    addressLine2: this.showBillingAddress
                        ? data.BillingApt !== undefined
                            ? data.BillingApt
                            : ""
                        : data.ShippingApt !== undefined
                        ? data.ShippingApt
                        : "",
                    city: this.showBillingAddress ? data.BillingCity : data.ShippingCity,
                    state: this.showBillingAddress ? data.BillingState : data.ShippingState,
                    country: "United States",
                    zipCode: data.BillingZipCode
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
                },
                ssn: data.SSN,
                dob: data.Birthdate,
                drivingLicense: {
                    dlNumber: data.DL,
                    expDate: data.DLExpirationDate,
                    dlState: data.DLState
                }
            }
        };
        if (this.useEarthlinkDomain) {
            myData.customer.emailAddress = this.elUser + "@" + this.domain;
            myData.account.contactEmail = this.email;
        }
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
            family: "EarthLink",
            representative: repType,
            addressDiscrepancy: this.addressDiscrepancy,
            timeStamp: new Date(),
            ContextId: this.recordId,
            recordTypeName: "Person Account",
            consent: this.contactConsent,
            ProductName: this.selectedProduct,
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
        saveAccountInformation({ myData: json })
            .then((response) => {
                console.log(response);
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
                    json.phone = this.phone;
                    json.email = this.email;
                    this.accountId = json.AccountId;

                    this.isGuestUser && !!this.referralCodeData
                        ? (json.referralCodeId = this.referralCodeData?.Id)
                        : undefined;
                    saveNewOrder({ myData: json })
                        .then((response) => {
                            console.log(response);
                            let Order = response.result.OrderItem;
                            let OrderItems = response.result.Order;
                            json.Order = Order;
                            json.OrderItems = OrderItems;
                            let data = {
                                clientInfo: clientInfo,
                                referenceNumber: this.referenceNumber,
                                creditCheckCallout: myData,
                                contactEmail: this.elUser + "@" + this.domain,
                                paymentAttempts: this.paymentAttempts,
                                orderId: response.result.Order.Id
                            };
                            if (!this.isGuestUser) {
                                let aci = {
                                    ContextId: this.recordId
                                };

                                saveACICreditCheck({ myData: aci })
                                    .then((response) => {
                                        this.loaderSpinner = false;
                                        const closeModalEvent = new CustomEvent("creditcheckpassed", {
                                            detail: data
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
                                    detail: data
                                });
                                this.dispatchEvent(closeModalEvent);
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

    handleUserChange(event) {
        this.email = event.target.value;
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        if (this.email !== undefined && this.email !== "" && this.email !== null && emailre.test(this.email)) {
            this.elUser = this.useEarthlinkDomain
                ? this.email.split("@")[0].substring(0, 16)
                : this.email.split("@")[0];
            this.domain = this.useEarthlinkDomain ? "earthlink.net" : event.target.value.split("@")[1];
            this.checkNotReady = false;
            this.checkDisabled = false;
        } else {
            this.checkDisabled = true;
            this.validateResults = false;
            this.checkNotReady = true;
            this.notValidated = true;
        }
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
                    this.validateResults = false;
                    this.validationError = true;
                    this.loaderSpinner = false;
                } else {
                    if (
                        (responseParsed.hasOwnProperty("suggestedId") && responseParsed.suggestedId.length > 0) ||
                        responseParsed.requestedIsAvailable
                    ) {
                        this.validationError = false;
                        this.validateResults = true;
                        this.accountNotAccepted = !responseParsed.requestedIsAvailable;
                        if (this.accountNotAccepted) {
                            let suggesteds = "";
                            responseParsed.suggestedId.forEach((item) => {
                                if (suggesteds.length == 0) {
                                    suggesteds = suggesteds + item.userId;
                                } else {
                                    suggesteds = suggesteds + ", " + item.userId;
                                }
                            });
                            this.suggestedIds = suggesteds;
                            this.notValidated = true;
                        } else {
                            if (
                                !this.noContactInformation &&
                                !this.noAddressInformation &&
                                !this.noShippingInformation &&
                                !this.accountNotAccepted &&
                                !this.validationError
                            ) {
                                this.notValidated = false;
                            } else {
                                this.notValidated = true;
                            }
                        }
                    } else {
                        let errormessage = DUPLICATE_EARTHLINK_ID_ERROR_MESSAGE;
                        this.notValidated = true;
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
                        this.validateResults = false;
                        this.validationError = true;
                        this.loaderSpinner = false;
                        this.validateResults = false;
                        this.validationError = true;
                    }
                }
                this.loaderSpinner = false;
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

    get isEarthLinkAccDisabled() {
        return this.noContactInformation || this.noAddressInformation || this.noShippingInformation;
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

    handleConsentChange(e) {
        this.contactConsent = e.detail.checked;
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