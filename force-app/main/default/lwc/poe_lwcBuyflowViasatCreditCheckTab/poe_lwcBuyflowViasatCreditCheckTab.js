import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import getSSNFraudRules from "@salesforce/apex/CreditCheckTabController.getSSNFraudRules";
import updateOpportunity from "@salesforce/apex/CreditCheckTabController.updateOpportunity";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getOppSensitiveData from "@salesforce/apex/CreditCheckTabController.getOppSensitiveData";
import sendPCISMS from "@salesforce/apex/CreditCheckTabController.sendPCISMS";
import setSSNAgreement from "@salesforce/apex/CreditCheckTabController.setSSNAgreement";
import sendCreditCheckPciEmail from "@salesforce/apex/CreditCheckTabController.sendCreditCheckPciEmail";
import saveAccountInformation from "@salesforce/apex/CreditCheckTabController.saveAccountInformation";
import getIPStackSettings from "@salesforce/apex/InfoTabController.getIPStackSettings";
import saveFlagIP from "@salesforce/apex/CreditCheckTabController.saveFlagIP";
import customerReachedCap from "@salesforce/apex/CreditCheckTabController.customerReachedCap";
import PHONE_DISCLAIMER from "@salesforce/label/c.POE_phone_disclaimer";
import PHONE_DISCLAIMER2 from "@salesforce/label/c.POE_phone_disclaimer2";
import SMS_VERBIAGE from "@salesforce/label/c.POE_sms_verbiage";
import CREDIT_CHECK_VERBIAGE from "@salesforce/label/c.Viasat_Credit_Check_Disclosure";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import capReachedError from "@salesforce/label/c.Order_Cap_Reached_Body";
import CONSENT_DISCLAIMER from "@salesforce/label/c.Chuzo_Consent_Text";
import Client_Info from "@salesforce/label/c.Client_Info";
import Credit_Check_Billing_Address_Section_Title from "@salesforce/label/c.Credit_Check_Billing_Address_Section_Title";
import Credit_Check_Shipping_Address_Section_Title from "@salesforce/label/c.Credit_Check_Shipping_Address_Section_Title";
import Pre_Qualification_and_Credit_Check from "@salesforce/label/c.Pre_Qualification_and_Credit_Check";
import Please_read_the_following_discloure from "@salesforce/label/c.Please_read_the_following_discloure";
import Please_read_the_following_disclosure_to_the_customer from "@salesforce/label/c.Please_read_the_following_disclosure_to_the_customer";
import Windstream_Send_Email_credit_check from "@salesforce/label/c.Windstream_Send_Email_credit_check";
import Windstream_Send_SMS_credit_check from "@salesforce/label/c.Windstream_Send_SMS_credit_check";
import Windstream_Refresh_Fields_credit_check from "@salesforce/label/c.Windstream_Refresh_Fields_credit_check";
import Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message from "@salesforce/label/c.Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message";
import i_have_read_and_agreed from "@salesforce/label/c.i_have_read_and_agreed";
import SSN_values_dont_match from "@salesforce/label/c.SSN_values_dont_match";
import Windstream_must_be_over_18 from "@salesforce/label/c.Windstream_must_be_over_18";
import Credit_Check_Limit_Error_Message from "@salesforce/label/c.Credit_Check_Limit_Error_Message";
import Windstream_Callout_method from "@salesforce/label/c.Windstream_Callout_method";
import The_customer_information_request_could_not_made_correctly from "@salesforce/label/c.The_customer_information_request_could_not_made_correctly";
import The_SMS_was_sent_correctly_with_a_link from "@salesforce/label/c.The_SMS_was_sent_correctly_with_a_link";
import POE_Send_SMS_Error_Message from "@salesforce/label/c.POE_Send_SMS_Error_Message";
import Windstream_email_sent_correctly from "@salesforce/label/c.Windstream_email_sent_correctly";
import POE_Send_Email_Error_Message from "@salesforce/label/c.POE_Send_Email_Error_Message";
import Windstream_already_exist_address_or_phone from "@salesforce/label/c.Windstream_already_exist_address_or_phone";

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

export default class Poe_lwcBuyflowViasatCreditCheckTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api origin;
    @api userId;
    @api selected;
    @api payload;
    @api customerId;
    @api userInfo;
    @api isGuestUser;
    @api referralCodeData;

    showCollateral = false;
    loaderSpinner;
    showShippingAddress = false;
    noShipping = true;
    showBillingAddress = false;
    noBilling = true;
    firstName;
    middleName;
    lastName;
    emailAddress;
    phoneNumber;
    billingAddress;
    billingApt;
    billingCity;
    billingState;
    billingStateName;
    billingZip;
    shippingAddress;
    shippingApt;
    shippingCity;
    shippingState;
    shippingStateName;
    shippingZip;
    clientInfo = {};
    referenceNumber;
    isDOBFormatted = false;
    stateOptions = [];
    DOB;
    repeatSSN;
    paymentAttempts;
    creditCheckAttempts;
    ssn;
    disableNext = true;
    isPCI = true;
    isManual = false;
    methods = [
        { label: "PCI Link", value: "PCI" },
        { label: "Manual", value: "Manual" }
    ];
    method = "PCI";
    noEmail = true;
    noPhone = true;
    noConsent = true;
    showCreditCheckOptions = false;
    sameSSN;
    phoneDisclaimer = PHONE_DISCLAIMER;
    phoneDisclaimer2 = PHONE_DISCLAIMER2;
    hasOptedInSMS = false;
    creditCheckDisclosure = CREDIT_CHECK_VERBIAGE;
    consentLabel = Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        capReachedError,
        Client_Info,
        Credit_Check_Billing_Address_Section_Title,
        Credit_Check_Shipping_Address_Section_Title,
        Pre_Qualification_and_Credit_Check,
        Please_read_the_following_discloure,
        Please_read_the_following_disclosure_to_the_customer,
        Windstream_Send_Email_credit_check,
        Windstream_Send_SMS_credit_check,
        Windstream_Refresh_Fields_credit_check,
        Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message,
        i_have_read_and_agreed,
        SSN_values_dont_match,
        Windstream_must_be_over_18,
        Credit_Check_Limit_Error_Message,
        Windstream_Callout_method,
        The_customer_information_request_could_not_made_correctly,
        The_SMS_was_sent_correctly_with_a_link,
        POE_Send_SMS_Error_Message,
        Windstream_email_sent_correctly,
        POE_Send_Email_Error_Message,
        Windstream_already_exist_address_or_phone
    };
    showSelfServiceCancelModal = false;
    showCapReachedModal = false;
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
        showAddressLookup: true,
        streetLabel: "Street Address",
        streetPlaceholder: undefined,
        addressLine2Label: "Address Line 2",
        addressLine2Placeholder: undefined
    };
    contactConsentLabel = CONSENT_DISCLAIMER;
    contactConsent = false;

    get disableSendSMSButton() {
        return this.noPhone || !this.hasOptedInSMS;
    }

    get disableSSN() {
        return this.isPCI;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        this.loaderSpinner = true;
        if (this.isGuestUser) {
            this.isManual = true;
            this.isPCI = false;
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
            this.consentLabel = this.label.i_have_read_and_agreed;
        }
        this.creditCheckAttempts = 0;
        this.userCreated = this.customerId !== undefined;
        this.disableNext = !this.userCreated;
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.stateOptions.push(option);
        });
        let myData = {
            ContextId: this.recordId,
            partner: "viasat"
        };
        getSSNFraudRules({ myData: myData })
            .then((response) => {
                this.referenceNumber = response.result.refNum;
                this.paymentAttempts = response.result.attempts;
                this.firstName = this.userInfo.firstName;
                this.emailAddress = this.userInfo.email;
                this.lastName = this.userInfo.lastName;
                this.phoneNumber = this.userInfo.phone;
                if (this.userCreated) {
                    this.middleName = this.userInfo.middleName;
                    this.showBillingAddress = this.userInfo.showBilling;
                    if (this.showBillingAddress) {
                        this.noBilling = false;
                        this.billingAddress = this.userInfo.billingAddress;
                        this.billingApt = this.userInfo.billingApt;
                        this.billingCity = this.userInfo.billingCity;
                        this.billingState = this.userInfo.billingState;
                        this.billingStateName = this.stateOptions.filter(
                            (state) => this.billingState === state.label || this.billingState === state.value
                        )[0].label;
                        this.billingZip = this.userInfo.billingZip;
                    }
                    this.showShippingAddress = this.userInfo.showShipping;
                    if (this.showShippingAddress) {
                        this.noShipping = false;
                        this.shippingAddress = this.userInfo.shippingAddress;
                        this.shippingApt = this.userInfo.shippingApt;
                        this.shippingCity = this.userInfo.shippingCity;
                        this.shippingState = this.userInfo.shippingState;
                        this.shippingStateName = this.stateOptions.filter(
                            (state) => this.shippingState === state.label || this.shippingState === state.value
                        )[0].label;
                        this.shippingZip = this.userInfo.shippingZip;
                    }
                    this.ssn = this.userInfo.ssn;
                    this.DOB = this.userInfo.dob;
                    this.creditConsent = false;
                    this.noConsent = !this.creditConsent;
                }
                if (!this.isGuestUser) {
                    this.saveIP();
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const errMsg = error.body?.message || error.message;
                this.logError(errMsg);
            });
    }

    handleConsentChange(e) {
        this.contactConsent = e.detail.checked;
    }

    handleChange(event) {
        switch (event.target.name) {
            case "firstName":
                this.firstName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "lastName":
                this.lastName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "middleName":
                this.middleName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "emailAddress":
                this.emailAddress =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "phoneNumber":
                this.phoneNumber =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;

            case "billingAddress":
                this.billingAddress =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "billingApt":
                this.billingApt =
                    billingApt.target.value !== "" && event.target.value !== null && event.target.value !== undefined
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
            case "taxPayerId":
                this.taxPayerId =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "noBilling":
                this.showBillingAddress = !this.showBillingAddress;
                this.noBilling = !this.noBilling;
                break;
            case "noShipping":
                this.showShippingAddress = !this.showShippingAddress;
                this.noShipping = !this.noShipping;
                break;
            case "shippingAddress":
                this.shippingAddress =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "shippingApt":
                this.shippingApt =
                    shippingApt.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "shippingCity":
                this.shippingCity =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "shippingState":
                this.shippingState =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                this.shippingStateName =
                    this.shippingState !== undefined
                        ? this.stateOptions.find((e) => e.value == this.shippingState).label
                        : undefined;
                break;
            case "shippingZip":
                this.shippingZip =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "creditConsent":
                this.showCreditCheckOptions = event.target.checked;
                if (event.target.checked) {
                    if (this.isGuestUser) {
                        this.isManual = true;
                        this.isPCI = false;
                    } else {
                        this.isManual = false;
                        this.isPCI = true;
                    }
                }
                this.repeatSSN = undefined;
                this.ssn = undefined;
                this.noConsent = !event.target.checked;
                break;
            case "ssn":
                this.ssn =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "DOB":
                this.DOB =
                    event.target.value !== "" &&
                    Date.parse(event.target.value) >= Date.parse("1916-01-01") &&
                    Date.parse(event.target.value) < Date.parse(new Date())
                        ? event.target.value
                        : undefined;
                break;
            case "repeatSSN":
                this.repeatSSN =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "hasOptedInSMS":
                this.hasOptedInSMS = event.detail.checked;
                break;
        }
        this.disableValidation();
    }

    handleBillingAddressChange(event) {
        this.billingAddress = event.detail.street != "" ? event.detail.street : undefined;
        this.billingCity = event.detail.city != "" ? event.detail.city : undefined;
        this.billingApt = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.billingState = event.detail.province != "" ? event.detail.province : undefined;
        this.billingZip = event.detail.postalCode != "" ? event.detail.postalCode : undefined;

        this.disableValidation();
    }

    handleShippingAddressChange(event) {
        this.shippingAddress = event.detail.street != "" ? event.detail.street : undefined;
        this.shippingCity = event.detail.city != "" ? event.detail.city : undefined;
        this.shippingApt = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.shippingState = event.detail.province != "" ? event.detail.province : undefined;
        this.shippingZip = event.detail.postalCode != "" ? event.detail.postalCode : undefined;

        this.disableValidation();
    }

    disableValidation() {
        let emailre = /^\w+([-.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        let phonere = /^\d{10}$/;
        let ssnPattern = /^\d{4}$/;
        this.ssn = this.ssn === "" || this.ssn === null ? undefined : this.ssn;
        this.repeatSSN = this.repeatSSN === "" || this.repeatSSN === null ? undefined : this.repeatSSN;

        if (this.repeatSSN !== undefined) {
            this.sameSSN = this.repeatSSN !== this.ssn ? false : true;
        }

        if (this.ssn && this.repeatSSN && this.ssn.length === 4 && this.repeatSSN.length === 4 && !this.sameSSN) {
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: this.labels.SSN_values_dont_match
            });
            this.dispatchEvent(event);
        }

        this.noEmail = this.emailAddress === undefined;
        this.noPhone = this.phoneNumber === undefined;
        this.DOB = this.DOB === "" || this.DOB === null ? undefined : this.DOB;
        let validAge = true;
        if (this.DOB !== undefined) {
            let age = Math.floor((new Date() - new Date(this.DOB).getTime()) / 3.15576e10);
            let dobElement = this.template.querySelector('[data-id="DOB"]');
            if (age < 18) {
                dobElement.setCustomValidity(this.labels.Windstream_must_be_over_18);
                dobElement.reportValidity();
                validAge = false;
            } else {
                dobElement.setCustomValidity("");
                dobElement.reportValidity();
                validAge = true;
            }
        }
        if (
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            this.emailAddress &&
            this.phoneNumber &&
            validAge &&
            this.DOB !== undefined &&
            phonere.test(this.phoneNumber) &&
            emailre.test(this.emailAddress) &&
            (!this.showBillingAddress ||
                (this.showBillingAddress &&
                    this.billingAddress !== undefined &&
                    this.billingCity !== undefined &&
                    this.billingState != undefined &&
                    this.billingZip !== undefined)) &&
            (!this.showShippingAddress ||
                (this.showShippingAddress &&
                    this.shippingAddress !== undefined &&
                    this.shippingCity !== undefined &&
                    this.shippingState != undefined &&
                    this.shippingZip !== undefined)) &&
            (this.noConsent ||
                (this.ssn !== undefined &&
                    !this.noConsent &&
                    ssnPattern.test(this.ssn) &&
                    (!this.isManual ||
                        (this.isManual &&
                            this.repeatSSN !== undefined &&
                            this.sameSSN &&
                            ssnPattern.test(this.repeatSSN)))))
        ) {
            this.disableNext = false;
        } else {
            this.disableNext = true;
        }
    }

    checkOrdersCap() {
        this.loaderSpinner = true;
        let data = {
            Email: this.emailAddress
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
                    this.handleClick();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const errMsg = error.body?.message || error.message;
                this.logError(errMsg);
            });
    }

    handleClick() {
        this.loaderSpinner = true;
        if (this.creditCheckAttempts < 3) {
            this.creditCheckAttempts = this.creditCheckAttempts + 1;
        } else {
            const event = new ShowToastEvent({
                title: "Credit Check Limit",
                variant: "error",
                mode: "sticky",
                message: this.labels.Credit_Check_Limit_Error_Message
            });
            this.dispatchEvent(event);
            this.paymentAttempts = this.creditCheckAttempts;
            this.disableNext = true;
            this.updateOpp();
            this.loaderSpinner = false;
            return;
        }
        let clientInfoParsed = JSON.parse(JSON.stringify(this.payload));
        this.clientInfo = { ...clientInfoParsed };
        let address1;
        let address2;
        let city;
        let state;
        let zipCode;
        if (!this.showBillingAddress) {
            address1 = this.clientInfo.location.address.addressLine1;
            address2 = this.clientInfo.location.address.addressLine2;
            city = this.clientInfo.location.address.city;
            state = this.clientInfo.location.address.state;
            zipCode = this.clientInfo.location.address.zipCode;
        } else {
            address1 = this.billingAddress;
            address2 = this.billingApt !== undefined ? this.billingApt : "";
            city = this.billingCity;
            state = this.billingState;
            zipCode = this.billingZip;
        }
        const path = "createUser";
        let myData = {
            path: path,
            partnerName: "viasat",
            tab: "createUser",
            customer: {
                firstName: this.firstName,
                middleName: this.middleName,
                lastName: this.lastName
            },
            contact: {
                primary: {
                    phoneNumber: "+1" + this.phoneNumber,
                    emailAddress: this.emailAddress,
                    address: {
                        addressLine1: this.clientInfo.location.address.addressLine1,
                        addressLine2: this.clientInfo.location.address.addressLine2,
                        city: this.clientInfo.location.address.city,
                        state: this.clientInfo.location.address.state,
                        countryCode: "US",
                        zipCode: this.clientInfo.location.address.zipCode
                    }
                },
                invoice: {
                    emailAddress: this.emailAddress,
                    phoneNumber: "+1" + this.phoneNumber,
                    address: {
                        addressLine1: address1,
                        addressLine2: address2,
                        city: city,
                        state: state,
                        countryCode: "US",
                        zipCode: zipCode
                    }
                },
                shipping: {
                    address: {
                        addressLine1: this.showShippingAddress
                            ? this.shippingAddress
                            : this.clientInfo.location.address.addressLine1,
                        addressLine2: this.showShippingAddress
                            ? this.shippingApt !== undefined
                                ? this.shippingApt
                                : ""
                            : this.clientInfo.location.address.addressLine2,
                        city: this.showShippingAddress ? this.shippingCity : this.clientInfo.location.address.city,
                        state: this.showShippingAddress ? this.shippingState : this.clientInfo.location.address.state,
                        countryCode: "US",
                        zipCode: this.showShippingAddress ? this.shippingZip : this.clientInfo.location.address.zipCode
                    }
                }
            }
        };
        if (this.ssn !== undefined) {
            myData.taxpayerId = this.ssn.slice(-4);
        }
        if (this.userCreated) {
            myData.customerId = this.customerId;
        }
        let apiResponse;
        console.log("CreateUser Payload :", myData);
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("CreateUser Response", responseParsed);
                let error = responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage =
                        responseParsed === ""
                            ? this.labels.Windstream_Callout_method
                            : responseParsed.hasOwnProperty("error")
                            ? responseParsed.error.hasOwnProperty("provider")
                                ? responseParsed.error.provider.message.hasOwnProperty("message")
                                    ? responseParsed.error.provider.message.message
                                    : responseParsed.error.provider.message
                                : responseParsed.error
                            : responseParsed.result.error.provider.message.hasOwnProperty("message")
                            ? responseParsed.result.error.provider.message.message
                            : responseParsed.result.error.provider.message;
                    const genericErrorMessage = errorMessage !== "" ? errorMessage : "Internal Server Error";
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: genericErrorMessage
                    });
                    this.loaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    let userInfo = {
                        lastName: this.lastName,
                        middleName: this.middleName,
                        firstName: this.firstName,
                        email: this.emailAddress,
                        consent: !this.noConsent,
                        ssn: this.ssn,
                        dob: this.DOB,
                        phone: this.phoneNumber,
                        showBilling: this.showBillingAddress,
                        billingAddress: this.billingAddress,
                        billingApt: this.billingApt,
                        billingCity: this.billingCity,
                        billingState: this.billingState,
                        billingZip: this.billingZip,
                        shippingAddress: this.shippingAddress,
                        shippingApt: this.shippingApt,
                        shippingCity: this.shippingCity,
                        shippingState: this.shippingState,
                        shippingZip: this.shippingZip,
                        showShipping: this.showShippingAddress
                    };
                    let info = {
                        customerId: undefined,
                        ssn: undefined,
                        dob: this.DOB,
                        userInfo: userInfo,
                        userCreated: false,
                        consent: this.contactConsent
                    };
                    info.customerId = responseParsed.customerId;
                    if (!this.noConsent) {
                        info.ssn = this.ssn.slice(-4);
                    }
                    this.saveAccountInfo(info);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = this.labels.The_customer_information_request_could_not_made_correctly;
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
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    renderedCallback() {
        if (!this.isDOBFormatted && this.template.querySelector(".sensitive-input")) {
            const style = document.createElement("style");
            style.innerText = "input[name='DOB'] {-webkit-text-security: disc}";
            this.template.querySelector(".sensitive-input").appendChild(style);
            this.isDOBFormatted = true;
        }
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

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleMethod(event) {
        this.ssn = undefined;
        this.repeatSSN = undefined;
        switch (event.target.value) {
            case "Manual":
                this.isCallCenter = false;
                this.isManual = true;
                this.isPCI = false;
                break;
            case "PCI":
                this.isCallCenter = false;
                this.isManual = false;
                this.isPCI = true;
                break;
        }
        this.disableValidation();
    }

    handleRefresh() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };
        getOppSensitiveData({ myData: myData })
            .then((response) => {
                console.log("Get Opp Sensitive Data", response);
                let data = response.result !== undefined ? response.result : {};
                this.DOB = data.hasOwnProperty("ccDob") ? data.ccDob : this.DOB;
                this.ssn = data.hasOwnProperty("ccSSN") ? data.ccSSN.slice(-4) : undefined;
                this.repeatSSN = data.hasOwnProperty("ccSSN") ? data.ccSSN.slice(-4) : undefined;
                this.disableValidation();

                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const errMsg = error.body?.message || error.message;
                this.logError(errMsg);
            });
    }

    handleSMS(e) {
        e.preventDefault();
        this.handleSSNValue();
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody = SMS_VERBIAGE + index[0] + "/s/pci-personal-info?c__ContextId=" + this.recordId;
        let myData = {
            clientPhone: "1" + this.phoneNumber,
            body: mailBody,
            opportunityId: this.recordId
        };
        let apiResponse;
        sendPCISMS({ myData: myData })
            .then((response) => {
                apiResponse = response;
                this.loaderSpinner = false;
                let tit = response.result.success ? "Success" : "Error";
                let varnt = response.result.success ? "success" : "error";
                let mess = response.result.success
                    ? this.labels.The_SMS_was_sent_correctly_with_a_link
                    : this.labels.POE_Send_SMS_Error_Message;
                const event = new ShowToastEvent({
                    title: tit,
                    variant: varnt,
                    message: mess
                });
                this.dispatchEvent(event);
                if (response.result.success === "error") {
                    this.logError(`${mess}\nAPI Response: ${apiResponse}`, myData, "smsCallout", "API Error");
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const genericErrorMessage = this.labels.POE_Send_SMS_Error_Message;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(
                        `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                        myData,
                        "smsCallout",
                        "API Error"
                    );
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
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
                const errMsg = error.body?.message || error.message;
                this.logError(errMsg);
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
            pciEmail: this.emailAddress,
            body: mailBody
        };

        sendCreditCheckPciEmail({ myData: myData })
            .then((response) => {
                console.log(response);
                this.loaderSpinner = false;
                const successEvent = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    message: this.labels.Windstream_email_sent_correctly
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
                    message: this.labels.POE_Send_Email_Error_Message
                });
                this.dispatchEvent(errorEvent);
                this.logError(error.body?.message || error.message);
            });
    }

    handleContact(event) {
        let ssnPattern = /^\d{4}$/;
        switch (event.target.name) {
            case "ssn":
                this.ssn = ssnPattern.test(event.target.value) ? event.target.value : undefined;
                break;
            case "DOB":
                this.DOB =
                    event.target.value !== "" &&
                    Date.parse(event.target.value) >= Date.parse("1916-01-01") &&
                    Date.parse(event.target.value) < Date.parse(new Date())
                        ? event.target.value
                        : undefined;
                if (Date.parse(event.target.value) > Date.parse(new Date())) {
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "Please verify the Date of Birth."
                    });
                    this.dispatchEvent(event);
                }
                break;
            case "repeatSSN":
                this.repeatSSN = ssnPattern.test(event.target.value) ? event.target.value : undefined;
                if (this.repeatSSN !== undefined) {
                    this.sameSSN = event.target.value !== this.ssn ? true : false;
                }
                if (this.sameSSN) {
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: this.labels.SSN_values_dont_match
                    });
                    this.dispatchEvent(event);
                }
                break;
        }
    }

    saveAccountInfo(info) {
        if (this.billingStateName === undefined && !this.noBilling) {
            this.billingStateName = this.stateOptions.find((e) => e.value == this.billingState).label;
        } else {
            this.billingStateName = this.stateOptions.find(
                (e) => e.value == this.clientInfo.location.address.state
            ).label;
        }

        if (this.shippingStateName === undefined && !this.noShipping) {
            this.shippingStateName = this.stateOptions.find((e) => e.value == this.shippingState).label;
        } else {
            this.shippingStateName = this.stateOptions.find(
                (e) => e.value == this.clientInfo.location.address.state
            ).label;
        }

        let data = {
            accName: this.firstName + " " + this.lastName,
            ContextId: this.recordId,
            recordTypeName: "Person Account",
            consent: this.contactConsent,
            creditCheck: {
                customerDetails: {
                    contactInformation: {
                        firstName: this.firstName,
                        middleName: this.middleName == null || this.middleName == undefined ? "" : this.middleName,
                        lastName: this.lastName,
                        email: this.emailAddress,
                        contactPhone: this.phoneNumber
                    }
                },
                accountDetails: {
                    billingCreditCheckAddress: {
                        billingAddress:
                            this.billingAddress !== undefined
                                ? this.billingAddress
                                : this.clientInfo.location.address.addressLine1,
                        billingAptNumber:
                            this.billingApt !== undefined
                                ? this.billingApt
                                : this.clientInfo.location.address.addressLine2,
                        billingCity:
                            this.billingCity !== undefined ? this.billingCity : this.clientInfo.location.address.city,
                        billingState:
                            this.billingState !== undefined
                                ? this.billingState
                                : this.clientInfo.location.address.state,
                        billingStateName: this.billingStateName,
                        billingZip:
                            this.billingZip !== undefined ? this.billingZip : this.clientInfo.location.address.zipCode
                    },
                    shippingServiceAddresss: {
                        shippingAddress:
                            this.shippingAddress !== undefined
                                ? this.shippingAddress
                                : this.clientInfo.location.address.addressLine1,
                        shippingAptNumber:
                            this.shippingApt !== undefined
                                ? this.shippingApt
                                : this.clientInfo.location.address.addressLine2,
                        shippingCity:
                            this.shippingCity !== undefined ? this.shippingCity : this.clientInfo.location.address.city,
                        shippingState:
                            this.shippingState !== undefined
                                ? this.shippingState
                                : this.clientInfo.location.address.state,
                        shippingStateName: this.shippingStateName,
                        shippingZip:
                            this.shippingZip !== undefined ? this.shippingZip : this.clientInfo.location.address.zipCode
                    }
                }
            }
        };
        console.log("Save Account Info Payload", data);
        saveAccountInformation({ myData: data })
            .then((response) => {
                console.log("saveAccountInformation Response", response);
                if (response.result.error) {
                    this.loaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: this.labels.Windstream_already_exist_address_or_phone
                    });
                    this.dispatchEvent(event);
                    this.logError(response.result.error);
                } else {
                    this.loaderSpinner = false;
                    info.accountId = response.result.Account.Id;
                    this.accountId = info.accountId;

                    info.billingAddress = {
                        addressLine1: data.creditCheck.accountDetails.billingCreditCheckAddress.billingAddress,
                        addressLine2: data.creditCheck.accountDetails.billingCreditCheckAddress.billingAptNumber,
                        city: data.creditCheck.accountDetails.billingCreditCheckAddress.billingCity,
                        state: data.creditCheck.accountDetails.billingCreditCheckAddress.billingState,
                        zipCode: data.creditCheck.accountDetails.billingCreditCheckAddress.billingZip,
                        countryCode: "US"
                    };
                    info.shippingAddress = {
                        addressLine1: data.creditCheck.accountDetails.shippingServiceAddresss.shippingAddress,
                        addressLine2: data.creditCheck.accountDetails.shippingServiceAddresss.shippingAptNumber,
                        city: data.creditCheck.accountDetails.shippingServiceAddresss.shippingCity,
                        state: data.creditCheck.accountDetails.shippingServiceAddresss.shippingState,
                        zipCode: data.creditCheck.accountDetails.shippingServiceAddresss.shippingZip,
                        countryCode: "US"
                    };
                    info.referenceNumber = this.referenceNumber;
                    info.paymentAttempts = this.paymentAttempts;
                    data.creditCheck.accountDetails.billingCreditCheckAddress;
                    const sendCheckServiceabilityEvent = new CustomEvent("usercreated", {
                        detail: info
                    });
                    this.dispatchEvent(sendCheckServiceabilityEvent);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
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
                    console.log(response.result);
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: response.result.error
                    });
                    this.dispatchEvent(event);
                    this.logError(response.result.body?.message || response.result.error);
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

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Credit Check",
            component: "Poe_lwcBuyflowViasatCreditCheckTab",
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