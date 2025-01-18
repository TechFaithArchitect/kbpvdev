import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { loadScript } from "lightning/platformResourceLoader";
import myLib from "@salesforce/resourceUrl/forge";
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

export default class poe_lwcBuyflowDirecTvEngaBeamPaymentTab extends NavigationMixin(LightningElement) {
    @api clientInfo;
    @api orderInfo;
    @api recordId;
    @api origin;
    @api paymentAttempts;
    @api cartInfo;
    @api logo;
    @api returnUrl;
    @api publicKey;
    @api verbiages;
    @api isGuestUser;
    noCompleteInformation = true;
    methods = [
        { label: "PCI Link", value: "PCI" },
        { label: "Manual", value: "Manual" }
    ];
    pciOptions = [
        { label: "Email", value: "Email" },
        { label: "SMS", value: "SMS" }
    ];
    pciValue = "Email";
    method = "PCI";
    ccInfo;
    phone;
    noPhone;
    phoneDisclaimer = PHONE_DISCLAIMER;
    phoneDisclaimer2 = PHONE_DISCLAIMER2;
    hasOptedInSMS = false;
    isManual = false;
    isEmail = true;
    isPCI = true;
    pciEmail;
    firstName;
    lastName;
    year;
    month;
    zip;
    cvv;
    ccNumber;
    autopayFirstName;
    autopayLastName;
    autopayZip;
    autopayCvv;
    autopayCcNumber;
    autopayMonth;
    autopayYear;
    initialAutoPayValue = false;
    agreementLabel = "I have read the above disclosures to the customer, and the customer agreed";
    paymentTClabel = this.agreementLabel + " to the Payment Authorization Terms and Conditions";
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
    showCollateral = false;
    email;
    agreementPaperlessBilling = true;
    agreementAutoPay = false;
    agreementPayment = false;
    attempts;
    declineWarning =
        "Warning - By deselecting Auto BillPay and Paperless Billing, the price will increase from the amounts previously quoted, as you are losing your discount";
    autoPay = false;
    noEmail = false;
    useSameAutopay = false;
    todayComplete;
    autopayComplete;
    loaderSpinner;
    autoPayCharge;
    total = 0;
    showSchedule = false;
    showPopup = false;
    isNonCallcenter = false;
    attemptByProgram;
    setOpportunityPaymentLimit = false;
    showNext = true;
    autopayCardName;
    cardName;
    paperlessVerbiage;
    autoPayVerbiage;
    autoPayEncrypted;
    upfrontEncrypted;
    cardType;
    cart = {};
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage
    };
    showSelfServiceCancelModal = false;

    get disableSendSMSButton() {
        return this.noPhone || !this.hasOptedInSMS;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get disableAutoPayFields() {
        return this.useSameAutopay || this.isPCI;
    }

    get nextLabel() {
        return this.isGuestUser ? "Next" : "Process Payment";
    }

    connectedCallback() {
        if (this.isGuestUser) {
            this.isManual = true;
            this.isPCI = false;
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        this.cart = { ...this.cartInfo };
        let header = "<p><strong><em>Please read the following information to the customer:</em></strong></p>";
        this.paperlessVerbiage = header + this.verbiages.paperlessBilling;
        this.autoPayVerbiage = header + this.verbiages.autoPay;
        this.attemptByProgram = 0;
        this.attempts = this.paymentAttempts;
        this.loaderSpinner = true;
        this.total = Number(this.cart.todayTotal).toFixed(2);
        this.firstName = this.clientInfo.contactInfo.firstName;
        this.lastName = this.clientInfo.contactInfo.lastName;
        this.zip = this.orderInfo.address.zipCode;
        this.isNonCallcenter = this.origin != "phonesales";
        let year = new Date().getFullYear();
        this.email = this.clientInfo.contactInfo.email;
        this.pciEmail = this.email;
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
                let cart = { ...this.cart };
                cart.monthlyCharges.forEach((charge) => {
                    if (
                        charge.discount &&
                        charge.name.includes("AutoPay") &&
                        charge.name.includes("Paperless Billing")
                    ) {
                        this.initialAutoPayValue = true;
                        this.autoPay = true;
                        this.autoPayCharge = charge;
                    }
                });
                loadScript(this, myLib)
                    .then(() => {
                        this.loaderSpinner = false;
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
    }

    handleSchedule() {
        this.showSchedule = !this.showSchedule;
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back", {
            detail: this.attempts
        });
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

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleChange(event) {
        switch (event.target.name) {
            case "firstName":
                this.firstName = event.target.value !== "" ? event.target.value : undefined;
                if (this.useSameAutopay) {
                    this.autopayFirstName = this.firstName;
                }
                break;
            case "lastName":
                this.lastName = event.target.value !== "" ? event.target.value : undefined;
                if (this.useSameAutopay) {
                    this.autopayLastName = this.lastName;
                }
                break;
            case "month":
                this.month = event.target.value !== "" ? event.target.value : undefined;
                if (this.useSameAutopay) {
                    this.autopayMonth = this.month;
                }
                break;
            case "year":
                this.year = event.target.value !== "" ? event.target.value : undefined;
                if (this.useSameAutopay) {
                    this.autopayYear = this.year;
                }
                break;
            case "cvv":
                this.cvv = event.target.value !== "" ? event.target.value : undefined;
                if (this.useSameAutopay) {
                    this.autopayCvv = this.cvv;
                }
                break;
            case "zip":
                this.zip = event.target.value !== "" ? event.target.value : undefined;
                if (this.useSameAutopay) {
                    this.autopayZip = this.zip;
                }
                break;
            case "ccNumber":
                this.ccNumber = event.target.value !== "" ? event.target.value : undefined;
                if (this.useSameAutopay) {
                    this.autopayCcNumber = this.ccNumber;
                }
                break;
            case "cardName":
                this.cardName = event.target.value !== "" ? event.target.value : undefined;
                if (this.useSameAutopay) {
                    this.autopayCardName = this.cardName;
                }
                break;
            case "autopayFirstName":

            case "autopayLastName":

            case "autopayMonth":

            case "autopayYear":

            case "autopayCvv":

            case "autopayZip":

            case "autopayCcNumber":

            case "autopayCardName":

            case "email":

            case "pciEmail":
                this[event.target.name] = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "hasOptedInSMS":
                this.hasOptedInSMS = event.detail.checked;
                break;
        }
        this.disableValidations();
    }

    disableValidations() {
        let ccvPattern = /^[0-9]{3,4}$/;
        let ccPattern = /^[0-9]{13,19}$/;
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        if (
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            this.month !== undefined &&
            this.year !== undefined &&
            this.cvv !== undefined &&
            ccvPattern.test(this.cvv) &&
            this.ccNumber !== undefined &&
            ccPattern.test(this.ccNumber) &&
            this.cardName !== undefined &&
            this.zip !== undefined &&
            (!this.isNonCallcenter || this.agreementPayment)
        ) {
            this.todayComplete = true;
        } else {
            this.todayComplete = false;
        }

        if (
            (this.useSameAutopay ||
                (this.autopayFirstName !== undefined &&
                    this.autopayLastName !== undefined &&
                    this.autopayMonth !== undefined &&
                    this.autopayYear !== undefined &&
                    this.autopayCvv !== undefined &&
                    ccvPattern.test(this.autopayCvv) &&
                    this.autopayCardName !== undefined &&
                    this.autopayCcNumber !== undefined &&
                    ccPattern.test(this.autopayCcNumber) &&
                    this.autopayZip !== undefined)) &&
            this.agreementPaperlessBilling &&
            this.agreementAutoPay
        ) {
            this.autopayComplete = true;
        } else {
            this.autopayComplete = false;
        }

        if (
            this.todayComplete &&
            this.email !== undefined &&
            emailre.test(this.email) &&
            ((this.autoPay && this.autopayComplete) || !this.autoPay)
        ) {
            this.noCompleteInformation = false;
        } else {
            this.noCompleteInformation = true;
        }
    }

    handleCostumerAutopayChange(event) {
        let cart = { ...JSON.parse(JSON.stringify(this.cart)) };
        this.autoPay = event.target.checked;
        if (!event.target.checked) {
            this.showPopup = true;
        }
        if (this.autoPay) {
            if (this.autoPayCharge !== undefined) {
                cart.monthlyCharges.push(this.autoPayCharge);
            }
        } else {
            cart.monthlyCharges.forEach(function (item, index) {
                if (item.discount && item.name.includes("AutoPay") && item.name.includes("Paperless Billing")) {
                    cart.monthlyCharges.splice(index, 1);
                }
            });
        }
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach((charge) => {
            cart.monthlyTotal = Number(cart.monthlyTotal) + Number(charge.fee);
        });
        cart.monthlyTotal = Number(cart.monthlyTotal).toFixed(2);
        this.cart = { ...cart };
        this.disableValidations();
    }

    handleSameCard(event) {
        this.useSameAutopay = event.target.checked;
        if (this.useSameAutopay) {
            this.autopayFirstName = this.firstName;
            this.autopayLastName = this.lastName;
            this.autopayZip = this.zip;
            this.autopayCvv = this.cvv;
            this.autopayCcNumber = this.ccNumber;
            this.autopayMonth = this.month;
            this.autopayYear = this.year;
            this.autopayCardName = this.cardName;
        } else {
            this.autopayFirstName = undefined;
            this.autopayLastName = undefined;
            this.autopayZip = undefined;
            this.autopayCvv = undefined;
            this.autopayCcNumber = undefined;
            this.autopayMonth = undefined;
            this.autopayYear = undefined;
            this.autopayCardName = undefined;
        }
        this.disableValidations();
    }

    handleAgreement(event) {
        switch (event.target.name) {
            case "agreementPaperlessBilling":
                this.agreementPaperlessBilling = event.target.checked;
                break;
            case "agreementAutoPay":
                this.agreementAutoPay = event.target.checked;
                break;
            case "agreementPayment":
                this.agreementPayment = event.target.checked;
        }
        this.disableValidations();
    }

    handleClick() {
        if (this.ccExpired()) {
            this.noCompleteInformation = true;
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: "Credit Card has expired, enter a valid Credit Card"
            });
            this.dispatchEvent(event);
            this.logError(error.body?.message || error.message);
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
                message: "Maximum number of Payment attempts reached for this customer"
            });
            this.dispatchEvent(errorEvent);
            this.logError(error.body?.message || error.message);
        }
        let info = {
            setOpportunityPaymentLimit: this.setOpportunityPaymentLimit,
            attempts: this.attempts,
            ContextId: this.recordId
        };
        savePaymentAttempts({ myData: info })
            .then((response) => {
                this.handleValidateCard(false);
            })
            .catch((error) => {
                console.log(error);
                this.logError(error.body?.message || error.message);
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

    async handleValidateCard(autopay) {
        let encryptedCC;
        let encryptedSecurity;
        let encryptedMonth;
        let encryptedYear;
        try {
            encryptedCC = await this.encryptionHandler(this.publicKey, autopay ? this.autopayCcNumber : this.ccNumber);
            encryptedSecurity = await this.encryptionHandler(this.publicKey, autopay ? this.autopayCvv : this.cvv);
            encryptedMonth = await this.encryptionHandler(
                this.publicKey,
                autopay
                    ? Number(this.autopayMonth) < 10
                        ? "0" + this.autopayMonth
                        : this.autopayMonth
                    : Number(this.month) < 10
                    ? "0" + this.month
                    : this.month
            );
            encryptedYear = await this.encryptionHandler(this.publicKey, autopay ? this.autopayYear : this.year);
        } catch (error) {
            const event = new ShowToastEvent({
                title: "Server Error",
                variant: "error",
                mode: "sticky",
                message: "There was an error during the encryption of the information. Please try again."
            });
            this.dispatchEvent(event);
            this.logError(error.body?.message || error.message);
            this.loaderSpinner = false;
            return;
        }
        const path = "validateCard";
        let myData = {
            path,
            ...this.orderInfo,
            cartId: this.cart.orderNumber,
            appName: this.orderInfo.NFFL ? "ENGA-CHUZO-NFF" : "ENGA-CHUZO",
            source: {
                sourceSystem: "DTV360",
                sourceLocation: "CS",
                sourceUser: "DTV-CPM"
            },
            creditCard: {
                firstName: autopay ? this.autopayFirstName : this.firstName,
                lastName: autopay ? this.autopayLastName : this.lastName,
                creditCardNumber: encryptedCC,
                creditCardExpirationDate: autopay
                    ? `${this.autopayYear.slice(-2)}${
                          Number(this.autopayMonth) < 10 ? "0" + this.autopayMonth : this.autopayMonth
                      }`
                    : `${this.year.slice(-2)}${Number(this.month) < 10 ? "0" + this.month : this.month}`,
                creditCardCustomerName: autopay ? this.autopayCardName : this.cardName,
                zipCode: autopay ? this.autopayZip : this.zip,
                security: encryptedSecurity,
                creditCardLast4Digits: autopay ? this.autopayCcNumber.slice(-4) : this.ccNumber.slice(-4),
                totalAmount: Number(this.total)
            }
        };
        console.log(`Validate ${autopay ? "AutoPay" : "Upfront"} Request`, myData);
        let apiResponse;
        if (!autopay) {
            this.upfrontEncrypted = { ...myData.creditCard, encryptedMonth, encryptedYear };
            this.autoPayEncrypted = { ...myData.creditCard, encryptedMonth, encryptedYear };
        } else {
            this.autoPayEncrypted = { ...myData.creditCard, encryptedMonth, encryptedYear };
        }
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log(`Validate ${autopay ? "AutoPay" : "Upfront"} Response`, result);
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
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
                    this.loaderSpinner = false;
                } else {
                    if (this.cardType === undefined) {
                        this.cardType = result.creditCardType;
                    }
                    if (result.approvalCode.toLowerCase() === "valid") {
                        if (!autopay && this.autoPay && !this.useSameAutopay) {
                            this.handleValidateCard(true);
                        } else {
                            this.processPayment();
                        }
                    } else {
                        const errorMessage = `${
                            autopay ? "AutoPay" : "Upfront Payment"
                        } Credit Card is not valid. Please review the information and try again.`;
                        const event = new ShowToastEvent({
                            title: "Server Error",
                            variant: "error",
                            mode: "sticky",
                            message: errorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                        this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
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
                this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
            });
    }

    processPayment() {
        const path = "payments";
        let hasPayment = false;
        let myData = {
            path,
            ...this.orderInfo,
            billPreference: [
                {
                    autoPaySelected: this.autoPay,
                    billingDeliveryPreference: this.autoPay ? "PAPERLESS" : "PAPER",
                    billingLanguagePreference: "en_US",
                    termsforpaperlessbilling: this.autoPay ? "Y" : "N"
                }
            ]
        };
        if (Number(this.total) > 0 || this.autoPay) {
            hasPayment = true;
            myData.payment = {
                termsforautopay: this.autoPay ? "Y" : "N",
                samePaymentForAutopay: Number(this.total) == 0 ? false : this.useSameAutopay,
                paymentMethod: "creditcard"
            };

            if (Number(this.total) > 0) {
                myData.payment.cards = [
                    {
                        saveMyCard: false,
                        selected: true,
                        cardType: "creditcard",
                        cardNumber: this.upfrontEncrypted.creditCardNumber,
                        cardExpMonth: this.upfrontEncrypted.encryptedMonth,
                        cardExpYear: this.upfrontEncrypted.encryptedYear,
                        cvv: this.upfrontEncrypted.security,
                        zipCode: this.upfrontEncrypted.zipCode,
                        amount: String(this.total),
                        nameOnCard: this.upfrontEncrypted.creditCardCustomerName
                    }
                ];
            }

            if (this.autoPay) {
                myData.payment.autopay = [
                    {
                        saveMyCard: false,
                        selected: this.autoPay,
                        cardType: "creditcard",
                        cardNumber: this.autoPayEncrypted.creditCardNumber,
                        cardExpMonth: this.autoPayEncrypted.encryptedMonth,
                        cardExpYear: this.autoPayEncrypted.encryptedYear,
                        cvv: this.autoPayEncrypted.security,
                        zipCode: this.autoPayEncrypted.zipCode,
                        nameOnCard: this.autoPayEncrypted.creditCardCustomerName
                    }
                ];
            }
        }

        console.log(`Process Payment Request`, myData);
        let apiResponse;
        const genericErrorMessage =
            "The Payment request could not be made correctly to the server. Please, validate the information and try again.";
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log(`Process Payment Response`, result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("content")
                                ? result.error.provider.message.content.response.payment.errors[0].message
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
                    this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
                } else {
                    if (
                        (hasPayment && result.content.response.payment.status.toLowerCase() === "success") ||
                        (!hasPayment && result.content.status.toLowerCase() === "success")
                    ) {
                        const event = new ShowToastEvent({
                            title: "Success",
                            variant: "success",
                            message: "Payment Approved"
                        });
                        this.dispatchEvent(event);
                        let info = {
                            paymentId: hasPayment ? result.content.response.payment.content.paymentRefID : "",
                            cardInfo: {
                                cardType: this.cardType,
                                firstName: this.firstName,
                                lastName: this.lastName,
                                zipCode: this.zip,
                                amount: this.total
                            },
                            cart: { ...this.cart }
                        };
                        const sendNextEvent = new CustomEvent("paymentinformationnext", {
                            detail: info
                        });
                        this.dispatchEvent(sendNextEvent);
                    } else {
                        const event = new ShowToastEvent({
                            title: "Server Error",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    }
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
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
                this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
            });
    }

    checkCreditCardAttempts() {
        this.attempts = this.attemptByProgram;
        this.setOpportunityPaymentLimit = true;
        this.showNext = false;
        const errorEvent = new ShowToastEvent({
            title: "Error",
            variant: "error",
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
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    handleEmail(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        if (event.target.name == "email") {
            this.email = event.target.value !== undefined ? event.target.value.trim() : undefined;
            this.noEmail = emailre.test(this.email) && this.email !== undefined ? false : true;
        } else {
            this.pciEmail = emailre.test(event.target.value) ? event.target.value : undefined;
        }
        this.disableValidations();
    }

    hideData() {
        this.showPopup = false;
    }

    ccExpired() {
        if (this.autoPay && !this.useSameAutopay) {
            return (
                this.checkCCExpiration(this.year, this.month) ||
                this.checkCCExpiration(this.autopayYear, this.autopayMonth)
            );
        }
        return this.checkCCExpiration(this.year, this.month);
    }
    checkCCExpiration(ccYear, ccMonth) {
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
            component: "poe_lwcBuyflowDirecTvEngaBeamPaymentInformationTab",
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
        let mailBody = index[0] + "/s/pci-checkout?c__ContextId=" + this.recordId;
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
        if (ccInfo?.hasAutopay) {
            this.autoPay = true;
            if (ccInfo?.useSameCardAsAutoPay) {
                this.useSameAutopay = true;
                this.autopayFirstName = ccInfo?.ccFirstName;
                this.autopayLastName = ccInfo?.ccLastName;
                this.autopayZip = ccInfo?.ccZipcode;
                this.autopayCvv = ccInfo?.ccCcv;
                this.autopayCcNumber = ccInfo?.ccNumber;
                this.autopayMonth = ccInfo?.ccExpirationMonth;
                this.autopayYear = ccInfo?.ccExpirationYear;
                this.autopayCardName = ccInfo?.ccName;
            } else {
                this.useSameAutopay = false;
                this.autopayFirstName = ccInfo?.autoPayFirstName;
                this.autopayLastName = ccInfo?.autoPayLastName;
                this.autopayZip = ccInfo?.autoPayZip;
                this.autopayCvv = ccInfo?.autoPayCvv;
                this.autopayCcNumber = ccInfo?.autoPayCcNumber;
                this.autopayMonth = ccInfo?.autoPayMonth;
                this.autopayYear = ccInfo?.autoPayYear;
                this.autopayCardName = ccInfo?.autoPayCcName;
            }
        } else {
            this.autoPay = false;
        }
        this.disableValidations();
    }
    originalValues() {
        this.firstName = this.clientInfo.contactInfo.firstName;
        this.lastName = this.clientInfo.contactInfo.lastName;
        this.zip = this.orderInfo.address.zipCode;
        this.email = this.clientInfo.contactInfo.email;
        this.phone = this.clientInfo.contactInfo.Phone;
        this.ccNumber = undefined;
        this.cvv = undefined;
        this.month = undefined;
        this.year = undefined;
        this.cardName = undefined;
        this.autopayFirstName = undefined;
        this.autopayLastName = undefined;
        this.autopayZip = undefined;
        this.autopayCvv = undefined;
        this.autopayCcNumber = undefined;
        this.autopayMonth = undefined;
        this.autopayYear = undefined;
        this.autopayCardName = undefined;
        this.autoPay = this.initialAutoPayValue;
        this.useSameAutopay = false;
        this.noEmail = false;
        this.noPhone = false;
        this.disableValidations();
    }
}