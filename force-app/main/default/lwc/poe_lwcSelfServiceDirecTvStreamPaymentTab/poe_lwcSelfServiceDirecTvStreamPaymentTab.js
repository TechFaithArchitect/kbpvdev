import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { NavigationMixin } from "lightning/navigation";
import { loadScript } from "lightning/platformResourceLoader";
import forgeLib from "@salesforce/resourceUrl/forge";
import getCreditCardTypes from "@salesforce/apex/checkoutTabController.getCreditCardTypes";
import savePaymentAttempts from "@salesforce/apex/OrderConfirmationTabController.savePaymentAttempts";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import getCreditCardInformation from "@salesforce/apex/checkoutTabController.getCreditCardInformation";
import sendCreditCheckPciEmail from "@salesforce/apex/CreditCheckTabController.sendCreditCheckPciEmail";
import sendPCISMS from "@salesforce/apex/CreditCheckTabController.sendPCISMS";
import PHONE_DISCLAIMER from "@salesforce/label/c.POE_phone_disclaimer";
import PHONE_DISCLAIMER2 from "@salesforce/label/c.POE_phone_disclaimer2";
import SMS_VERBIAGE from "@salesforce/label/c.POE_sms_verbiage";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

export default class Poe_lwcSelfServiceDirecTvStreamPaymentTab extends LightningElement {
    @api publicKey;
    @api orderInfo;
    @api clientInfo;
    @api recordId;
    @api cartInfo;
    @api logo;
    @api origin;
    @api paymentAttempts;
    @api returnUrl;
    @api isGuestUrl;
    @api isGuestUser;

    isNonCallcenter = false;
    agreementPayment = false;
    noCompleteInformation = true;
    pciInputOptions = [
        { label: "PCI Link", value: "PCI" },
        { label: "Manual", value: "Manual" }
    ];
    pciInputMethod = this.pciInputOptions[0].value;
    pciOptions = [
        { label: "Email", value: "Email" },
        { label: "SMS", value: "SMS" }
    ];
    pciValue = this.pciOptions[0].value;
    ccInfo;
    isManual = false;
    isEmail = true;
    isPCI = true;
    pciEmail;
    phone;
    noEmail = false;
    noPhone;
    hasOptedInSMS = false;
    phoneDisclaimer = PHONE_DISCLAIMER;
    phoneDisclaimer2 = PHONE_DISCLAIMER2;
    loaderSpinner;
    firstName;
    lastName;
    zip;
    cvv;
    ccNumber;
    year;
    month;
    type;
    attempts;
    ccTypes = [];
    years = [];
    months = [];
    showCollateral = false;
    disclosureAgreement = "I have read the above disclosures to the customer, and the customer agreed";
    paymentTClabel;
    title = "Payment Information";
    paymentDisclaimer = {
        Id: "pd",
        value: "You certify that you are the card owner or authorized to use this credit card. Additionally, you authorize your service provider to automatically charge the total due today, your future monthly payments, and any cancelation fees and/or installment plan balances to the card on your account. The amount could be debited as early as today."
    };
    paymentInformation = [
        {
            Id: 1,
            value: "The card you provide today will be used for the total due today (if applicable) and your future monthly payments."
        },
        {
            Id: 2,
            value: "You will see a temporary pre-authorization hold of $30 on the card you provide. It'll be released in up to 7 business days depending on your bank."
        },
        {
            Id: 3,
            value: "Your DIRECTV Via Internet monthly payments will be auto-charged monthly to your credit card, unless it’s canceled. Call this number to cancel any time: 800.531.5000"
        },
        {
            Id: 4,
            value: "The last name on the credit card being used should match the last name of the customer signing up for service."
        },
        {
            Id: 5,
            value: "Prepaid and Gift cards cannot be used. Credit Card billing zip code must match account zip code."
        }
    ];
    attemptByProgram;
    setOpportunityPaymentLimit = false;
    showNext = true;
    cart = {};
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage
    };
    showSelfServiceCancelModal = false;

    get isSMSPCI() {
        return !this.isEmail;
    }

    get pciInput() {
        return {
            type: this.isEmail ? "email" : "tel",
            value: this.isEmail ? this.pciEmail : this.phone,
            changeHandler: this.isEmail ? this.handleEmail : this.handlePhone,
            name: this.isEmail ? "pciEmail" : "phone",
            label: this.isEmail ? "PCI Email Address" : "Contact Phone Number"
        };
    }

    get sendPCIBtnClass() {
        return `${
            this.isSMSPCI && this.disableSendSMSButton ? "btn-disabled" : ""
        } btn-rounded slds-max-medium-size_1-of-1`;
    }

    get disableSendSMSButton() {
        return this.noPhone || !this.hasOptedInSMS;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get total() {
        return Number(this.cart.todayTotal).toFixed(2);
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconFormCreditCard() {
        return chuzoSiteResources + "/images/icon-creditcard.svg";
    }

    get cardNumberType() {
        return this.isGuestUser ? "text" : "password";
    }

    get nextBtnDesktopClass() {
        return `${this.noCompleteInformation && "btn-disabled"} btn-rounded btn-center hide-mobile`;
    }

    get nextBtnMobileClass() {
        return `${this.noCompleteInformation && "btn-disabled"} btn-rounded btn-center`;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            this.isManual = true;
            this.isPCI = false;
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
            this.disclosureAgreement = "I agree";
        }
        this.paymentTClabel = `${this.disclosureAgreement} to the Payment Authorization Terms and Conditions`;
        this.pciEmail = this.clientInfo?.contactInfo?.email;
        this.cart = { ...this.cartInfo };
        this.attemptByProgram = 0;
        this.loaderSpinner = true;
        this.attempts = this.paymentAttempts;
        this.firstName = this.clientInfo.contactInfo.firstName;
        this.lastName = this.clientInfo.contactInfo.lastName;
        this.zip = this.orderInfo.billingAddress.zipCode;
        const today = new Date();
        let year = today.getFullYear();
        this.isNonCallcenter = this.origin != "phonesales";
        for (let i = 0; i < 15; i++) {
            let exp = {
                label: year.toString(),
                value: year.toString()
            };
            this.years.push(exp);
            year = year + 1;
        }
        let month = 0;
        for (let i = 0; i < 12; i++) {
            month = month + 1;
            let m = {
                label: month.toString(),
                value: month.toString()
            };
            this.months.push(m);
        }

        this.month = (today.getMonth() + 1).toString();
        this.autoPayMonth = this.month;
        this.year = this.years[0].value;
        this.autoPayYear = this.year;

        let myData = {
            ContextId: this.recordId
        };
        getCreditCardTypes({ myData: myData })
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
                loadScript(this, forgeLib)
                    .then(() => {
                        this.loaderSpinner = false;
                    })
                    .catch((error) => {
                        this.loaderSpinner = false;
                        console.error(error);
                        this.logError(error.body?.message || error.message);
                    });
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    checkCreditCardAttempts() {
        this.attempts = this.attemptByProgram;
        this.setOpportunityPaymentLimit = true;
        this.showNext = false;
        const errorEvent = new ShowToastEvent({
            title: "Error",
            variant: "error",
            mode: "sticky",
            message: "Maximum number of Payment attempts reached for this customer"
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
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handleSendPCI() {
        if (this.pciValue === "SMS") {
            this.sendSMS();
        } else if (this.pciValue === "Email") {
            this.sendEmail();
        }
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

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleBack() {
        const sendBackEvent = new CustomEvent("back", {
            detail: this.attempts
        });
        this.dispatchEvent(sendBackEvent);
    }

    handleChange(event) {
        let ccvPattern = /^[0-9]{3,4}$/;
        let ccPattern = /^[0-9]{13,19}$/;
        switch (event.target.name) {
            case "firstName":

            case "lastName":

            case "type":

            case "month":

            case "year":

            case "pciEmail":

            case "zip":
                this[event.target.name] = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "cvv":
                this.cvv = ccvPattern.test(event.target.value) ? event.target.value : undefined;
                break;
            case "ccNumber":
                this.ccNumber = ccPattern.test(event.target.value) ? event.target.value : undefined;
                break;
            case "hasOptedInSMS":
                this.hasOptedInSMS = event.detail.checked;
                break;
        }
        this.disableValidations();
    }

    disableValidations() {
        if (
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            this.type !== undefined &&
            this.month !== undefined &&
            this.year !== undefined &&
            this.cvv !== undefined &&
            this.ccNumber !== undefined &&
            this.zip !== undefined &&
            (!this.isNonCallcenter || this.agreementPayment)
        ) {
            this.noCompleteInformation = false;
        } else {
            this.noCompleteInformation = true;
        }
    }

    handleNext() {
        if (this.ccExpired(this.year, this.month)) {
            this.noCompleteInformation = true;
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: "Credit Card has expired, enter a valid Credit Card"
            });
            this.dispatchEvent(event);
            return;
        }
        this.loaderSpinner = true;
        this.attempts = this.attempts + 1;
        if (this.attemptByProgram <= 2) {
            this.attemptByProgram = this.attemptByProgram + 1;
        } else {
            this.attempts = this.attemptByProgram;
            this.setOpportunityPaymentLimit = true;
            this.showNext = false;
            const errorEvent = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: "Maximum number of Payment attempts reached for this customer"
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
                this.validateCard();
            })
            .catch((error) => {
                console.log(error);
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    async validateCard() {
        let cardType;
        switch (this.type) {
            case "Visa":
                cardType = "VI";
                break;
            case "AMEX":
                cardType = "AM";
                break;
            case "MasterCard":
                cardType = "MC";
                break;
            case "Discover":
                cardType = "DI";
                break;
        }
        const path = "validateCard";
        const inputMap = {
            path,
            ...this.orderInfo,
            partnerName: "enga-stream",
            systemCode: "ENGA-CHUZO",
            payment: {
                cards: [
                    {
                        firstName: this.firstName,
                        lastName: this.lastName,
                        cardType: cardType,
                        cardNumber: await this.encrypt(this.ccNumber),
                        cvv: await this.encrypt(this.cvv),
                        cardExpMonth: await this.encrypt(Number(this.month) < 10 ? `0${this.month}` : this.month),
                        cardExpYear: await this.encrypt(this.year),
                        zipCode: this.zip,
                        amount: this.total,
                        type: "creditcard"
                    }
                ]
            }
        };

        console.log("Validate Card Request: ", inputMap);
        let apiResponse;
        callEndpoint({ inputMap: inputMap })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Validate Card Response: ", result);
                if (result.hasOwnProperty("error") || Object.keys(result).every((k) => !result[k])) {
                    let errorMessage = `${result.message ? result.message + "." : ""} ${
                        result.error?.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("content")
                                ? result.error.provider.message.content.response.payment.errors[0].message
                                : result.error.provider.message.hasOwnProperty("ServiceProviderEntity")
                                ? result.error.provider.message.ServiceProviderEntity.ServiceProviderRawError
                                      .description
                                : result.error.provider.message.hasOwnProperty("CSIApplicationException")
                                ? result.error.provider.message.CSIApplicationException.ServiceProviderEntity
                                      .ServiceProviderRawError.description
                                : result.error.provider.message
                            : result.error?.message ||
                              "The request could not be made correctly to the server. Please, validate the information and try again"
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, inputMap, path, "API Error");
                    this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
                    this.loaderSpinner = false;
                    return;
                }
                const success =
                    result.content.status === "Success" && result.content.response?.payment?.status === "Success";

                if (success) {
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message: "Credit card validated successfully."
                    });
                    this.dispatchEvent(event);
                    const cardInfo = inputMap.payment.cards[0];
                    delete inputMap.payment;
                    let info = {
                        cart: this.cart,
                        cardInfo,
                        request: inputMap
                    };
                    const sendCartNextEvent = new CustomEvent("paymentinformationnext", {
                        detail: info
                    });
                    this.dispatchEvent(sendCartNextEvent);
                    this.loaderSpinner = false;
                } else {
                    const genericErrorMessage =
                        "Credit Card is not valid. Please review the information and try again.";
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: genericErrorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, inputMap, path, "API Error");
                    this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage = "Service unreachable. Please try again.";
                const event = new ShowToastEvent({
                    title: "Error",
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
            });
    }

    encrypt(bytes) {
        const encrypted = this.publicKey.encrypt(bytes, "RSA-OAEP", {
            md: forge.md.sha256.create(),
            mgf1: {
                md: forge.md.sha1.create()
            }
        });

        return window.btoa(encrypted);
    }

    handleAgreement(event) {
        this.agreementPayment = event.target.checked;
        this.disableValidations();
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

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Payment",
            component: "poe_lwcBuyflowDirecTvEngaStreamPaymentInformationTab",
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
            tab: "Payment"
        };
        this.dispatchEvent(event);
    }

    handlePhone(event) {
        let phonere = /^\d{10}$/;
        this.phone = event.target.value != "" ? event.target.value : undefined;
        this.noPhone = !phonere.test(this.phone);
    }

    handleRefresh() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };
        getCreditCardInformation({ myData: myData })
            .then((response) => {
                this.ccInfo = response.result;
                this.defaultCCValues(this.ccInfo);
                this.disableValidations();
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }
    sendEmail() {
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody = index[0] + "/s/pci-checkout?c__ContextId=" + this.recordId + "&buyflowType=dtvStream";
        let myData = {
            pciEmail: this.pciEmail,
            body: mailBody
        };
        sendCreditCheckPciEmail({ myData: myData })
            .then((response) => {
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    message: "The email was sent correctly with a link to enter the information."
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

    sendSMS() {
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody =
            SMS_VERBIAGE + index[0] + "/s/pci-checkout?c__ContextId=" + this.recordId + "&buyflowType=dtvStream";
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
                        ? "The SMS was sent correctly with a link to enter the information."
                        : "The SMS could not be sent. Please, verify the telephone number and try again.";
                const event = new ShowToastEvent({
                    title: tit,
                    variant: varnt,
                    message: mess
                });
                this.dispatchEvent(event);
                if (result.error !== "OK") {
                    this.logError(mess);
                }
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

    handleEmail(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        this.pciEmail = emailre.test(event.target.value) ? event.target.value : undefined;
        this.disableValidations();
    }

    handlePCI(event) {
        this.isEmail = event.target.value === "Email" ? true : false;
        this.pciValue = event.target.value;
    }

    handleMethod(event) {
        switch (event.target.value) {
            case "Manual":
                this.isManual = true;
                this.isPCI = false;
                this.originalValues();
                break;
            case "PCI":
                this.isManual = false;
                this.isPCI = true;
                this.defaultCCValues(this.ccInfo);
                break;
        }
    }

    defaultCCValues(ccInfo) {
        this.firstName = ccInfo?.ccFirstName;
        this.lastName = ccInfo?.ccLastName;
        this.zip = ccInfo?.ccZipcode;
        this.ccNumber = ccInfo?.ccNumber;
        this.cvv = ccInfo?.ccCcv;
        this.month = ccInfo?.ccExpirationMonth;
        this.year = ccInfo?.ccExpirationYear;
        this.cardName = ccInfo?.ccName;
        this.type = ccInfo?.ccType;
        this.disableValidations();
    }
    originalValues() {
        this.firstName = this.clientInfo.contactInfo.firstName;
        this.lastName = this.clientInfo.contactInfo.lastName;
        this.zip = this.orderInfo.address.zipCode;
        this.phone = this.clientInfo.contactInfo.Phone;
        this.ccNumber = undefined;
        this.cvv = undefined;
        this.month = undefined;
        this.year = undefined;
        this.noEmail = false;
        this.noPhone = false;
        this.disableValidations();
    }
}