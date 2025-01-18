import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { NavigationMixin } from "lightning/navigation";
import getCreditCardTypes from "@salesforce/apex/checkoutTabController.getCreditCardTypes";
import getCreditCardInformation from "@salesforce/apex/checkoutTabController.getCreditCardInformation";
import savePaymentAttempts from "@salesforce/apex/OrderConfirmationTabController.savePaymentAttempts";
import sendPCISMS from "@salesforce/apex/CreditCheckTabController.sendPCISMS";
import sendCreditCheckPciEmail from "@salesforce/apex/CreditCheckTabController.sendCreditCheckPciEmail";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import PHONE_DISCLAIMER from "@salesforce/label/c.POE_phone_disclaimer";
import PHONE_DISCLAIMER2 from "@salesforce/label/c.POE_phone_disclaimer2";
import AUTHORIZE_ELECTRONIC_PAYMENT from "@salesforce/label/c.Spectrum_Authorize_Electronic_Payment";
import SMS_VERBIAGE from "@salesforce/label/c.POE_sms_verbiage";
import spectrumAutoPayLabel from "@salesforce/label/c.spectrumAutoPayVerbiage";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import CHARTER from "@salesforce/label/c.charter";
import SPINNER_ALT_TEXT from "@salesforce/label/c.Spinner_Alternative_Text";
import CHECKOUT from "@salesforce/label/c.Checkout_Tab_Name_Label";
import ZERO_DOLLARS from "@salesforce/label/c.Zero_Dollars";
import AUTPAY_REGISTRATION from "@salesforce/label/c.Spectrum_AutoPay_Registration_Title";
import EMAIL_ADDRESS from "@salesforce/label/c.Email_Address_Field_Label";
import EMAIL_PCI_LINK from "@salesforce/label/c.Email_PCI_Link_Button_Label";
import REFRESH_FIELDS from "@salesforce/label/c.Windstream_Refresh_Fields_credit_check";
import CONTACT_PHONE_NUMBER from "@salesforce/label/c.Contact_Phone_Number_Field_Label";
import SMS_PCI_LINK from "@salesforce/label/c.SMS_PCI_Link_Button_Label";
import CREDIT_CARD_SECTION from "@salesforce/label/c.Credit_Card_Section_Title";
import FIRST_NAME from "@salesforce/label/c.First_Name_Field_Label";
import LAST_NAME from "@salesforce/label/c.Last_Name_Field_Label";
import CREDIT_CARD_TYPE from "@salesforce/label/c.Credit_Card_Type_Field_Label";
import INVALID_CREDIT_CARD_NUMBER_ERROR from "@salesforce/label/c.Invalid_Credit_Card_Number_Error_Message";
import CREDIT_CARD_NUMBER from "@salesforce/label/c.Credit_Card_Number_Field_Label";
import EXPIRATION_MONTH from "@salesforce/label/c.Expiration_Month_Field_Label";
import EXPIRATION_YEAR from "@salesforce/label/c.Expiration_Year_Field_Label";
import INVALID_CVV_ERROR from "@salesforce/label/c.Invalid_CVV_Error_Message";
import CVV from "@salesforce/label/c.CVV_Field_Label";
import ZIP_CODE from "@salesforce/label/c.Zip_Code_Field_Label";
import REQUIRED from "@salesforce/label/c.required_Title";
import COMPLETE_THIS_FIELD from "@salesforce/label/c.Spectrum_Complete_this_Field";
import SERVER_ERROR from "@salesforce/label/c.Server_Error_Toast_Title";
import OPPORTUNITY_OBJ_NAME from "@salesforce/label/c.Opportunity_Object_Name";
import API_ERROR from "@salesforce/label/c.API_Error";
import GENERIC_ERROR from "@salesforce/label/c.Toast_Generic_Error_Title";
import GENERIC_ERROR_LOG from "@salesforce/label/c.Generic_Error_Log";
import ERROR_VARIANT from "@salesforce/label/c.error_variant";
import STICKY_MODE from "@salesforce/label/c.sticky_mode";
import PCI_LINK_OPTION from "@salesforce/label/c.PCI_Link_Option_Label";
import MANUAL_PCI_OPTION from "@salesforce/label/c.Manual_PCI_Option_Label";
import YES_OPTION from "@salesforce/label/c.Yes_Option_Label";
import NO_OPTION from "@salesforce/label/c.No_Option_Label";
import EMAIL_OPTION from "@salesforce/label/c.Email_Option_Label";
import CREDIT_CARD_EXPIRED_ERROR from "@salesforce/label/c.Credit_Card_Expired_Error_Message";
import MAX_PAYMENT_ATTEMPTS_ERROR from "@salesforce/label/c.Max_Payment_Attempts_Error_Message";
import SERVICE_UNREACHABLE from "@salesforce/label/c.Service_unreachable";
import EMAIL_SENT_SUCCESSFULLY_MESSAGE from "@salesforce/label/c.Email_Sent_Successfully_Message";
import SEND_EMAIL_ERROR_MESSAGE from "@salesforce/label/c.POE_Send_Email_Error_Message";
import SMS_SENT_SUCCESSFULLY_MESSAGE from "@salesforce/label/c.SMS_Sent_Successfully_Message";
import SUCCESS_TITLE from "@salesforce/label/c.Success_Toast_Title";
import SEND_SMS_ERROR from "@salesforce/label/c.POE_Send_SMS_Error_Message";
import DELINQUENT_CHARGE from "@salesforce/label/c.Delinquent_Charge_Name";
import OK from "@salesforce/label/c.OK_Result";
import VISA from "@salesforce/label/c.Spectrum_VISA_Credit_Card";
import MC from "@salesforce/label/c.Spectrum_MasterCard_Credit_Card";
import AMEX from "@salesforce/label/c.Spectrum_AMEX_Credit_Card";
import DISCOVER from "@salesforce/label/c.Spectrum_Discover_Credit_Card";
import PAYMENT_APPROVED from "@salesforce/label/c.Payment_Approved_Title";
import PAYMENT_GENERIC_ERROR from "@salesforce/label/c.Spectrum_Payment_Generic_Error";
import CHECKOUT_TAB_NAME from "@salesforce/label/c.Checkout_Tab_Name_Label";

export default class Poe_lwcBuyflowSpectrumCheckoutTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api origin;
    @api customer;
    @api address;
    @api billingAddress;
    @api sessionId;
    @api prepayment;
    @api delinquent;
    @api offerId;
    @api useServiceAddress;
    @api autoPay;
    @api cart;
    @api hasPhone;
    @api hasMobile;
    @api isGuestUser;
    @api paymentAttempts;
    @api dueToday;
    attempts;
    noCompleteInformation = true;
    methods = [
        { label: PCI_LINK_OPTION, value: "PCI" },
        { label: MANUAL_PCI_OPTION, value: MANUAL_PCI_OPTION }
    ];
    // pciOptions = [
    //     { label: "Email", value: "Email" },
    //     { label: "SMS", value: "SMS" }
    // ];
    setOpportunityPaymentLimit = false;
    attemptByProgram;
    dueTotal = ZERO_DOLLARS;
    ccTypes = [];
    years = [];
    months = [];
    autopayOptions = [
        { label: YES_OPTION, value: "true" },
        { label: NO_OPTION, value: "false" }
    ];
    autopayValue = "false";
    firstName;
    lastName;
    ccNumber;
    cvv;
    year;
    month;
    zip;
    pciValue = EMAIL_OPTION;
    method = MANUAL_PCI_OPTION;
    isManual = true;
    isPCI = false;
    loaderSpinner;
    isEmail = true;
    noEmail = false;
    noPhone = false;
    email;
    phone;
    showCollateral = false;
    Encrypt;
    paymentRequired;
    content = {
        disclaimer: "",
        description: "",
        autoPayLabel: ""
    };
    cartInfo = {};
    phoneDisclaimer = PHONE_DISCLAIMER;
    phoneDisclaimer2 = PHONE_DISCLAIMER2;
    authorizeElectronicPaymentLabel = AUTHORIZE_ELECTRONIC_PAYMENT;
    spectrumAutoPayVerbiage = spectrumAutoPayLabel;
    hasOptedInSMS = false;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        CHARTER,
        SPINNER_ALT_TEXT,
        CHECKOUT,
        ZERO_DOLLARS,
        AUTPAY_REGISTRATION,
        EMAIL_ADDRESS,
        EMAIL_PCI_LINK,
        REFRESH_FIELDS,
        CONTACT_PHONE_NUMBER,
        SMS_PCI_LINK,
        CREDIT_CARD_SECTION,
        FIRST_NAME,
        LAST_NAME,
        CREDIT_CARD_TYPE,
        INVALID_CREDIT_CARD_NUMBER_ERROR,
        CREDIT_CARD_NUMBER,
        EXPIRATION_MONTH,
        EXPIRATION_YEAR,
        INVALID_CVV_ERROR,
        CVV,
        ZIP_CODE,
        REQUIRED,
        COMPLETE_THIS_FIELD
    };
    showSelfServiceCancelModal = false;
    authorizeElectronicPayment = false;
    showCheckboxErrorContainer = false;
    showNext = true;

    get disableSendSMSButton() {
        return this.noPhone || !this.hasOptedInSMS;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    handleNext(e) {
        if (this.ccExpired(this.year, this.month)) {
            this.noCompleteInformation = true;
            const event = new ShowToastEvent({
                title: GENERIC_ERROR,
                variant: ERROR_VARIANT,
                mode: STICKY_MODE,
                message: CREDIT_CARD_EXPIRED_ERROR
            });
            this.dispatchEvent(event);
            return;
        }
        this.loaderSpinner = true;
        this.attempts = this.attempts + 1;
        let maxAttempts = false;
        if (this.attemptByProgram <= 2) {
            this.attemptByProgram = this.attemptByProgram + 1;
        } else {
            maxAttempts = true;
            this.attempts = this.attemptByProgram;
            this.setOpportunityPaymentLimit = true;
            this.showNext = false;
            const errorEvent = new ShowToastEvent({
                title: GENERIC_ERROR,
                variant: ERROR_VARIANT,
                message: MAX_PAYMENT_ATTEMPTS_ERROR
            });
            this.dispatchEvent(errorEvent);
        }
        let info = {
            setOpportunityPaymentLimit: this.setOpportunityPaymentLimit,
            attempts: this.attempts,
            ContextId: this.recordId
        };
        savePaymentAttempts({ myData: info })
            .then((response) => {
                if (maxAttempts) {
                    this.loaderSpinner = false;
                } else {
                    this.callEncryption();
                }
            })
            .catch((error) => {
                console.log(error);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    callEncryption() {
        this.Encrypt = false;
        this.Encrypt = true;
    }

    handleBack() {
        const sendBackEvent = new CustomEvent("back", {
            detail: this.attempts
        });
        this.dispatchEvent(sendBackEvent);
    }

    handleMethod(event) {
        switch (event.target.value) {
            case MANUAL_PCI_OPTION:
                this.isManual = true;
                this.isPCI = false;
                this.originalValues(false);
                break;
            case "PCI":
                this.isManual = false;
                this.isPCI = true;
                this.eraseValues();
                break;
        }
    }

    handleChange(event) {
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
                this.ccNumber = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "month":
                this.month = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "year":
                this.year = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "cvv":
                this.cvv = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "zip":
                this.zip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "hasOptedInSMS":
                this.hasOptedInSMS = event.detail.checked;
                break;
            case "authorizeElectronicPayment":
                this.authorizeElectronicPayment = event.target.checked;
                if (this.authorizeElectronicPayment == false) {
                    this.showCheckboxErrorContainer = true;
                    this.template.querySelector(".checkboxContainer").classList.add("slds-has-error");
                } else {
                    this.showCheckboxErrorContainer = false;
                    this.template.querySelector(".checkboxContainer").classList.remove("slds-has-error");
                }
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
        this.authorizeElectronicPayment = false;
        this.disableValidations(false);
    }

    originalValues(start) {
        this.firstName = this.customer.firstName;
        this.lastName = this.customer.lastName;
        this.zip = this.address.zipCode;
        this.email = this.customer.emailAddress;
        this.phone = this.customer.phoneNumber;
        this.noEmail = false;
        this.noPhone = false;
        this.authorizeElectronicPayment = false;
        this.disableValidations(start);
    }

    disableValidations(start) {
        let ccvPattern = /^[0-9]{3,4}$/;
        let ccPattern = /^[0-9]{13,19}$/;
        if (
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            this.type !== undefined &&
            this.ccNumber !== undefined &&
            ccPattern.test(this.ccNumber) &&
            this.month !== undefined &&
            this.year !== undefined &&
            this.cvv !== undefined &&
            ccvPattern.test(this.cvv) &&
            this.zip !== undefined &&
            this.authorizeElectronicPayment !== false
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
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
            this.isPCI = false;
            this.isManual = true;
            this.method = MANUAL_PCI_OPTION;
        }
        this.attemptByProgram = 0;
        this.attempts = this.paymentAttempts;
        this.cartInfo = { ...this.cart };
        this.autopayValue = this.autoPay === undefined ? "true" : String(this.autoPay);
        this.paymentRequired = this.prepayment || this.delinquent;
        this.firstName = this.customer.firstName;
        this.lastName = this.customer.lastName;
        this.zip = this.address.zipCode;
        this.email = this.customer.emailAddress;
        this.phone = this.customer.phoneNumber;
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
                this.dueTotal =
                    this.cart.monthlyCharges.mobile.length > 0
                        ? String(Number(this.dueToday).toFixed(2))
                        : String(Number(this.cart.firstBillTotal).toFixed(2));
                this.handleContentCallout();
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    handleContentCallout() {
        this.loaderSpinner = true;
        const path = "contents";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: this.offerId,
            sessionId: this.sessionId,
            contentType: "payment"
        };
        console.log("Content Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                const result = JSON.parse(res);
                console.log("Content Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    this.orderSuccess = false;
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: SERVER_ERROR,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", res);
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    this.content.disclaimer = this.spectrumAutoPayVerbiage;
                    this.content.autoPayLabel = result.content.properties.elements.autoPay.title;
                    this.content.description = result.content.properties.elements.initialPayment_description.value;
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage = SERVICE_UNREACHABLE;
                const event = new ShowToastEvent({
                    title: GENERIC_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", genericErrorMessage).replace(
                        "{1}",
                        apiResponse
                    );
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    handleRefresh() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };

        getCreditCardInformation({ myData })
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
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    handlePCI(event) {
        this.isEmail = event.target.value === EMAIL_OPTION ? true : false;
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

        sendCreditCheckPciEmail({ myData })
            .then((response) => {
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    variant: "success",
                    message: EMAIL_SENT_SUCCESSFULLY_MESSAGE
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: GENERIC_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: SEND_EMAIL_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
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

        sendPCISMS({ myData })
            .then((response) => {
                let result = response.result;
                this.loaderSpinner = false;
                let tit = result.error === OK ? SUCCESS_TITLE : GENERIC_ERROR;
                let varnt = result.error === OK ? "success" : ERROR_VARIANT;
                let mess = result.error === OK ? SMS_SENT_SUCCESSFULLY_MESSAGE : SEND_SMS_ERROR;
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
                    title: GENERIC_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: SEND_SMS_ERROR
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    validatePayment(event) {
        this.loaderSpinner = true;
        let hasDelinquent = this.cart.firstBillCharges.some((item) => item.name === DELINQUENT_CHARGE);
        let creditCardType;
        switch (this.type.toLowerCase()) {
            case "visa":
                creditCardType = VISA;
                break;
            case "mastercard":
                creditCardType = MC;
                break;
            case "amex":
                creditCardType = AMEX;
                break;
            case "discover":
                creditCardType = DISCOVER;
                break;
        }
        this.Encrypt = false;
        const path = "payments";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: this.offerId,
            sessionId: this.sessionId,
            payment: {
                cards: [
                    {
                        firstName: this.firstName,
                        lastName: this.lastName,
                        cardType: creditCardType,
                        cardNumber: event.detail.encCardNumber,
                        cardExpMonth: this.month,
                        cardExpYear: this.year,
                        encryptedCvv: event.detail.encCvv,
                        zipCode: this.zip,
                        encryptionDetails: {
                            encryptionSchemeTypeEnum: "SAFETECH",
                            integrityCheck: event.detail.integrityCheck,
                            keyId: event.detail.keyId,
                            phaseId: event.detail.phase.toString(),
                            provider: "SafetechEncryption"
                        },
                        paymentInformation: {
                            paymentAmount: this.prepayment
                                ? String(
                                      (this.cart.firstBillCharges.some((item) => item.name === DELINQUENT_CHARGE)
                                          ? Number(this.dueTotal) -
                                            Number(
                                                this.cart.firstBillCharges.filter(
                                                    (item) => item.name === DELINQUENT_CHARGE
                                                )[0].fee
                                            )
                                          : Number(this.dueTotal)
                                      ).toFixed(2)
                                  )
                                : "",
                            delinquentPaymentAmount: hasDelinquent
                                ? String(
                                      Number(
                                          this.cart.firstBillCharges.filter(
                                              (item) => item.name === DELINQUENT_CHARGE
                                          )[0].fee
                                      ).toFixed(2)
                                  )
                                : "",
                            autopay: this.autopayValue === "true",
                            delinquent: hasDelinquent,
                            initial: this.prepayment,
                            zip: this.zip
                        }
                    }
                ]
            }
        };
        console.log("Payment Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Payment Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: SERVER_ERROR,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", response);
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                    this.attemptByProgram > 2 ? this.checkPaymentAttempts() : undefined;
                } else {
                    const toastEvent = new ShowToastEvent({
                        title: SUCCESS_TITLE,
                        variant: "success",
                        message: PAYMENT_APPROVED
                    });
                    this.dispatchEvent(toastEvent);
                    let info = {
                        cart: { ...this.cart }
                    };
                    const passedEvent = new CustomEvent("paymentnext", {
                        detail: info
                    });
                    this.dispatchEvent(passedEvent);
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.log(error);
                console.error(error, "ERROR");
                const genericErrorMessage = PAYMENT_GENERIC_ERROR;
                const event = new ShowToastEvent({
                    title: SERVER_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", genericErrorMessage).replace(
                        "{1}",
                        apiResponse
                    );
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.attemptByProgram > 2 ? this.checkPaymentAttempts() : undefined;
                this.loaderSpinner = false;
            });
    }

    handleCancel() {
        if (this.isGuestUser) {
            this.showSelfServiceCancelModal = true;
        } else {
            this[NavigationMixin.Navigate]({
                type: "standard__recordPage",
                attributes: {
                    recordId: this.recordId,
                    objectApiName: OPPORTUNITY_OBJ_NAME,
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

    checkPaymentAttempts() {
        this.attempts = this.attemptByProgram;
        this.setOpportunityPaymentLimit = true;
        this.showNext = false;
        const errorEvent = new ShowToastEvent({
            title: GENERIC_ERROR,
            variant: ERROR_VARIANT,
            message: MAX_PAYMENT_ATTEMPTS_ERROR
        });
        this.dispatchEvent(errorEvent);

        let info = {
            setOpportunityPaymentLimit: this.setOpportunityPaymentLimit,
            attempts: this.attempts,
            ContextId: this.recordId
        };
        savePaymentAttempts({ myData: info })
            .then((response) => {})
            .catch((error) => {
                console.log(error);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: CHECKOUT_TAB_NAME,
            component: "poe_lwcBuyflowSpectrumCheckoutTab",
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
            tab: CHECKOUT_TAB_NAME
        };
        this.dispatchEvent(event);
    }
}