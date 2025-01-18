import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { NavigationMixin } from "lightning/navigation";
import getCreditCardTypes from "@salesforce/apex/checkoutTabController.getCreditCardTypes";
import getCreditCardInformation from "@salesforce/apex/checkoutTabController.getCreditCardInformation";
import sendPCISMS from "@salesforce/apex/CreditCheckTabController.sendPCISMS";
import sendCreditCheckPciEmail from "@salesforce/apex/CreditCheckTabController.sendCreditCheckPciEmail";

import PHONE_DISCLAIMER from "@salesforce/label/c.POE_phone_disclaimer";
import PHONE_DISCLAIMER2 from "@salesforce/label/c.POE_phone_disclaimer2";
import SMS_VERBIAGE from "@salesforce/label/c.POE_sms_verbiage";
import SELF_SERVICE_VALIDATE_LEAVING_MESSAGE from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import SELF_SERVICE_VALIDATE_LEAVING_TITLE from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import PCI_LINK_OPTION_LABEL from "@salesforce/label/c.PCI_Link_Option_Label";
import MANUAL_PCI_OPTION_LABEL from "@salesforce/label/c.Manual_PCI_Option_Label";
import EMAIL_OPTION_LABEL from "@salesforce/label/c.Email_Option_Label";
import SMS_OPTION_LABEL from "@salesforce/label/c.SMS_Option_Label";
import YES_OPTION_LABEL from "@salesforce/label/c.Yes_Option_Label";
import NO_OPTION_LABEL from "@salesforce/label/c.No_Option_Label";
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
import BILLING_TITLE from "@salesforce/label/c.Billing_Title";
import TOTAL_DUE_TODAY_TITLE from "@salesforce/label/c.Total_Due_Today_Title";
import AUTOPAY_HEADER from "@salesforce/label/c.Windstream_AutoPay_Header";
import AUTOPAY_CONSENT_FIELD_LABEL from "@salesforce/label/c.AutoPay_Consent_Field_Label";
import PAPERLESS_BILLING_HEADER from "@salesforce/label/c.Paperless_Billing_Header";
import PAPERLESS_BILLING_CONSENT_FIELD_LABEL from "@salesforce/label/c.Paperless_Billing_Consent_Field_Label";
import PAYMENT_INPUT_METHOD_FIELD_LABEL from "@salesforce/label/c.Payment_Input_Method_Field_Label";
import PCI_OPTIONS_FIELD_LABEL from "@salesforce/label/c.PCI_Options_Field_Label";
import EMAIL_ADDRESS_FIELD_LABEL from "@salesforce/label/c.Email_Address_Field_Label";
import EMAIL_PCI_LINK_BUTTON_LABEL from "@salesforce/label/c.Email_PCI_Link_Button_Label";
import REFRESH_FIELDS_BUTTON_LABEL from "@salesforce/label/c.Windstream_Refresh_Fields_credit_check";
import CONTACT_PHONE_NUMBER_FIELD_LABEL from "@salesforce/label/c.Contact_Phone_Number_Field_Label";
import SMS_PCI_LINK_BUTTON_LABEL from "@salesforce/label/c.SMS_PCI_Link_Button_Label";
import CREDIT_CARD_SECTION_TITLE from "@salesforce/label/c.Credit_Card_Section_Title";
import FIRST_NAME_FIELD_LABEL from "@salesforce/label/c.First_Name_Field_Label";
import LAST_NAME_FIELD_LABEL from "@salesforce/label/c.Last_Name_Field_Label";
import CREDIT_CARD_TYPE_FIELD_LABEL from "@salesforce/label/c.Credit_Card_Type_Field_Label";
import CREDIT_CARD_NUMBER_FIELD_LABEL from "@salesforce/label/c.Credit_Card_Number_Field_Label";
import INVALID_CREDIT_CARD_NUMBER_ERROR_MESSAGE from "@salesforce/label/c.Invalid_Credit_Card_Number_Error_Message";
import EXPIRATION_MONTH_FIELD_LABEL from "@salesforce/label/c.Expiration_Month_Field_Label";
import EXPIRATION_YEAR_FIELD_LABEL from "@salesforce/label/c.Expiration_Year_Field_Label";
import CVV_FIELD_LABEL from "@salesforce/label/c.CVV_Field_Label";
import INVALID_CVV_ERROR_MESSAGE from "@salesforce/label/c.Invalid_CVV_Error_Message";
import ZIP_CODE_FIELD_LABEL from "@salesforce/label/c.Zip_Code_Field_Label";
import SHIPPING_ADDRESS_FOR_DEVICE_TITLE from "@salesforce/label/c.EarthLink_Shipping_Address_for_Device_Title";

const INTERNAL_ERRROR = "Internal Error";

export default class poe_lwcBuyflowEarthlinkCheckoutTab extends NavigationMixin(LightningElement) {
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
    billingZip;
    pciValue = "Email";
    method = "PCI";
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
        BILLING_NOTIFICATION_TITLE,
        BILLING_SECTION_AGENT_INSTRUCTIONS,
        BILLING_TITLE,
        TOTAL_DUE_TODAY_TITLE,
        AUTOPAY_HEADER,
        AUTOPAY_CONSENT_FIELD_LABEL,
        PAPERLESS_BILLING_HEADER,
        PAPERLESS_BILLING_CONSENT_FIELD_LABEL,
        PAYMENT_INPUT_METHOD_FIELD_LABEL,
        PCI_OPTIONS_FIELD_LABEL,
        EMAIL_ADDRESS_FIELD_LABEL,
        EMAIL_PCI_LINK_BUTTON_LABEL,
        REFRESH_FIELDS_BUTTON_LABEL,
        CONTACT_PHONE_NUMBER_FIELD_LABEL,
        SMS_PCI_LINK_BUTTON_LABEL,
        CREDIT_CARD_SECTION_TITLE,
        FIRST_NAME_FIELD_LABEL,
        LAST_NAME_FIELD_LABEL,
        CREDIT_CARD_TYPE_FIELD_LABEL,
        CREDIT_CARD_NUMBER_FIELD_LABEL,
        INVALID_CREDIT_CARD_NUMBER_ERROR_MESSAGE,
        EXPIRATION_MONTH_FIELD_LABEL,
        EXPIRATION_YEAR_FIELD_LABEL,
        CVV_FIELD_LABEL,
        INVALID_CVV_ERROR_MESSAGE,
        ZIP_CODE_FIELD_LABEL,
        SHIPPING_ADDRESS_FOR_DEVICE_TITLE
    };
    showSelfServiceCancelModal = false;

    get disableSendSMSButton() {
        return this.noPhone || !this.hasOptedInSMS;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get isNotCallCenterOrigin() {
        return !this.isCallCenterOrigin;
    }

    handleNext(e) {
        if (this.ccExpired(this.year, this.month)) {
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
            if (this.isCallCenterOrigin) {
                this.handleBack();
            } else {
                this.showBillingNotification = true;
            }
        }

        this.noCompleteInformation = false;
        this.isManual = false;
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
                this.isPCI = false;
                this.originalValues(false);
                break;
            case "PCI":
                this.pciValue = "Email";
                this.isEmail = true;
                this.isManual = false;
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
        if (
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            this.type !== undefined &&
            this.ccNumber !== undefined &&
            this.month !== undefined &&
            this.year !== undefined &&
            this.cvv !== undefined &&
            this.zip !== undefined &&
            (this.checkoutDisclaimers.length == 0 || this.checkoutDisclaimers.every((item) => item.agree))
        ) {
            this.noCompleteInformation = false;
        } else {
            if (!start) {
                this.noCompleteInformation = true;
            }
        }
    }

    connectedCallback() {
        this.loaderSpinner = true;
        this.showPaymentMethods = !this.isGuestUser;
        if (this.isGuestUser) {
            this.showBillingNotification = false;
            this.isPCI = false;
            this.method = "Manual";
            this.isManual = true;
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.checkoutDisclaimers = [...this.disclaimers];
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
        this.billingZip = this.billingAddress.zipCode;
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
        for (var i = 0; i < 12; i++) {
            month = month + 1;
            let m = {
                label: month < 10 ? "0" + month.toString() : month.toString(),
                value: month < 10 ? "0" + month.toString() : month.toString()
            };
            this.months.push(m);
        }
        let myData = {
            ContextId: this.recordId
        };
        getCreditCardTypes()
            .then((response) => {
                let initialCC = [];
                let ccs = response.result.Credit_Card_Types__mdt;
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
                    type: INTERNAL_ERRROR
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
                    type: INTERNAL_ERRROR
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
                    type: INTERNAL_ERRROR
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
                    type: INTERNAL_ERRROR
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
        const passedEvent = new CustomEvent("creditcardvalidated", {
            detail: callout
        });
        this.dispatchEvent(passedEvent);
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

    handleCheckbox(event) {
        let disclosures = this.checkoutDisclaimers.map((item) => {
            if (item.key == event.target.dataset.id) {
                return { ...item, agree: event.target.checked };
            } else {
                return { ...item };
            }
        });
        this.checkoutDisclaimers = [...disclosures];
        this.disableValidations(false);
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
}