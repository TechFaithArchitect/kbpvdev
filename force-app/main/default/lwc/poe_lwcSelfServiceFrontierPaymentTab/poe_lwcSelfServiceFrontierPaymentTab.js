import { LightningElement, api, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import ToastContainer from "lightning/toastContainer";
import { loadStyle } from "lightning/platformResourceLoader";

import getCreditCardTypes from "@salesforce/apex/checkoutTabController.getCreditCardTypes";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getCreditCardInformation from "@salesforce/apex/checkoutTabController.getCreditCardInformation";
import sendCreditCheckPciEmail from "@salesforce/apex/CreditCheckTabController.sendCreditCheckPciEmail";
import sendPCISMS from "@salesforce/apex/CreditCheckTabController.sendPCISMS";
import savePaymentAttempts from "@salesforce/apex/OrderConfirmationTabController.savePaymentAttempts";
import getOnlyLettersRegEx from "@salesforce/apex/POE_RegExObtainer.getOnlyLettersRegEx";

import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

import PHONE_DISCLAIMER from "@salesforce/label/c.POE_phone_disclaimer";
import PHONE_DISCLAIMER2 from "@salesforce/label/c.POE_phone_disclaimer2";
import SMS_VERBIAGE from "@salesforce/label/c.POE_sms_verbiage";

import chuzo_modalGeneric from "c/chuzo_modalGeneric";

export default class Poe_lwcSelfServiceFrontierPaymentTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api cart;
    @api origin;
    @api clientInfo;
    @api quoteId;
    @api accountId;
    @api portableNumber;
    @api reserved;
    @api autoPay;
    @api eBill;
    @api referenceNumber;
    @api paymentAttempts;
    @api frontierUserId;
    @api isGuestUser;
    @api quoteNumber;
    @api autoPayNode;
    @api autoPayDiscounts;

    @track onlyLettersRegEx;
    @wire(getOnlyLettersRegEx) onlyLettersRegExParse({ data, error }) {
        if (data) {
            this.onlyLettersRegEx = data;
        } else if (error) {
            console.error(error);
        }
    }
    get onlyLettersRegExPattern() {
        return this.onlyLettersRegEx?.result?.expression;
    }
    get onlyLettersRegExErrorMessage() {
        return this.onlyLettersRegEx?.result?.errorMessage;
    }

    backBalances;
    noCompleteInformation = true;
    methods = [
        { label: "Manual", value: "Manual" },
        { label: "PCI Link", value: "PCI" }
    ];
    pciOptions = [
        { label: "Email", value: "Email" },
        { label: "SMS", value: "SMS" }
    ];
    ccTypes = [];
    years = [];
    months = [];
    firstName;
    lastName;
    ccNumber;
    cvv;
    zip;
    year;
    month;
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
    isCallCenterOrigin;
    deposit = "0.00";
    cardName;
    preview;
    showCreditCheckQuoteAssistanceModal;
    paymentNeeded = true;
    attempts;
    feeDisclaimer;
    modalTitle = "No Credit Card Input Required";
    modalDescription = `No Credit Card registration or payment is needed. Click 'Next' button to move forward.`;
    requiresFee = false;
    creditFee;
    attemptByProgram;
    setOpportunityPaymentLimit = false;
    showNext = true;
    phoneDisclaimer = PHONE_DISCLAIMER;
    phoneDisclaimer2 = PHONE_DISCLAIMER2;
    hasOptedInSMS = false;
    labels = {};
    showSelfServiceCancelModal = false;
    autoPayDiscount = "debit";
    showAutoPayDiscounts = false;
    upfrontPaymentNeeded = true;
    showACHForm = false;
    showCreditCardForm = true;
    accountFirstName;
    accountLastName;
    bankRoutingNumber;
    bankAccountNumber;
    accountType = "CHECKING";
    accountClass = "PERSONAL";
    accountTypes = [
        { label: "Checking", value: "CHECKING" },
        { label: "Savings", value: "SAVINGS" }
    ];
    accountClasses = [
        { label: "Business", value: "BUSINESS" },
        { label: "Personal", value: "PERSONAL" }
    ];

    get isSMSPCI() {
        return !this.isEmail;
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

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconFormCreditCard() {
        return chuzoSiteResources + "/images/icon-frontier-creditcard.svg";
    }

    get pciInput() {
        return {
            type: this.isEmail ? "email" : "tel",
            value: this.isEmail ? this.email : this.phone,
            changeHandler: this.isEmail ? this.handleEmail : this.handlePhone,
            name: this.isEmail ? "email" : "phone",
            label: this.isEmail ? "PCI Email Address" : "Contact Phone Number"
        };
    }

    get cardNumberType() {
        return this.isGuestUser ? "text" : "password";
    }

    get nextBtnDesktopClass() {
        return `${this.noCompleteInformation ? "btn-disabled" : ""} btn-rounded btn-center hide-mobile`;
    }

    get nextBtnMobileClass() {
        return `${this.noCompleteInformation ? "btn-disabled" : ""} btn-rounded btn-center`;
    }

    handleSendPCI() {
        if (this.pciValue === "SMS") {
            this.sendSMS();
        } else if (this.pciValue === "Email") {
            this.sendEmail();
        }
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
                this.eraseValues();
                break;
        }
    }

    handleChange(event) {
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
                this.cvv = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "zip":
                this.zip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "cardName":
                this.cardName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "hasOptedInSMS":
                this.hasOptedInSMS = event.detail.checked;
                break;
        }
        this.disableValidations();
    }

    validateCreditCard() {
        let isValid;
        let errorMessage = "";
        switch (this.type) {
            case "AMEX":
                isValid =
                    (this.ccNumber.startsWith("34") || this.ccNumber.startsWith("37")) && this.ccNumber.length == 15;
                if (!isValid) {
                    errorMessage =
                        "American Express credit card number must start with either 34 or 37 and be 15 digits long";
                }
                break;
            case "Discover":
                isValid = this.ccNumber.startsWith("6011") && this.ccNumber.length == 16;
                if (!isValid) {
                    errorMessage = "Discover credit card number must start with 6011 and be 16 digits long";
                }
                break;
            case "Visa":
                isValid = this.ccNumber.startsWith("4") && (this.ccNumber.length == 13 || this.ccNumber.length == 16);
                if (!isValid) {
                    errorMessage = "Visa credit card number must start with 4 and be either 13 or 16 digits long";
                }
                break;
            case "MasterCard":
                isValid =
                    (this.ccNumber.startsWith("51") ||
                        this.ccNumber.startsWith("52") ||
                        this.ccNumber.startsWith("53") ||
                        this.ccNumber.startsWith("54") ||
                        this.ccNumber.startsWith("55")) &&
                    this.ccNumber.length == 16;
                if (!isValid) {
                    errorMessage =
                        "MasterCard credit card number must be 16 digits long and start with one of the following numbers: 51, 52, 53, 54, 55";
                }
                break;
        }

        if (
            isValid &&
            (this.type == "MasterCard" || this.type == "Visa" || this.type == "Discover") &&
            this.cvv.length != 3
        ) {
            isValid = !isValid;
            errorMessage = "CVV must be 3 digits long";
        } else if (isValid && this.type == "AMEX" && this.cvv.length != 4) {
            isValid = !isValid;
            errorMessage = "CVV must be 4 digits long";
        }

        if (!isValid) {
            this.loaderSpinner = false;
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: errorMessage
            });
            this.dispatchEvent(event);
        }

        return isValid;
    }

    originalValues() {
        this.firstName = this.customer.FirstName;
        this.lastName = this.customer.LastName;
        this.zip = this.customer.Zip;
        this.email = this.customer.Email;
        this.phone = this.customer.Phone;
        this.noEmail = false;
        this.noPhone = false;
        this.disableValidations();
    }

    disableValidations() {
        let ccvPattern = /^[0-9]{3,4}$/;
        let routingre = /^\d{9}$/;
        let accountre = /^\d{10,12}$/;
        let zipre = /^\d{5}$/;

        let onlyLetters = new RegExp(this.onlyLettersRegEx.result.expression);
        let nameWithOnlyLetterCharacters = onlyLetters.test(this.firstName) && onlyLetters.test(this.lastName);
        this.noCompleteInformation =
            (this.showCreditCardForm &&
                (this.firstName === undefined ||
                    this.lastName === undefined ||
                    !nameWithOnlyLetterCharacters ||
                    this.type === undefined ||
                    this.ccNumber === undefined ||
                    this.month === undefined ||
                    this.year === undefined ||
                    this.cvv === undefined ||
                    !ccvPattern.test(this.cvv) ||
                    this.zip === undefined ||
                    !zipre.test(this.zip) ||
                    this.cardName === undefined)) ||
            (this.showACHForm &&
                (this.accountClass === undefined ||
                    this.accountFirstName === undefined ||
                    this.accountLastName === undefined ||
                    this.accountType === undefined ||
                    this.bankRoutingNumber === undefined ||
                    this.bankAccountNumber === undefined ||
                    !accountre.test(this.bankAccountNumber) ||
                    !routingre.test(this.bankRoutingNumber)));
    }

    handleCartChange() {
        let hasToday = true;
        let todayCharges = [...this.cart.todayCharges];
        let todayTotal = 0;
        if (Number(this.requiredDeposit) > 0) {
            let depositRequested = {
                name: "Deposit Due",
                fee: this.requiredDeposit,
                discount: false,
                hasDescription: false,
                description: "",
                type: "deposit"
            };

            todayCharges.push(depositRequested);
        }
        if (Number(this.backBalanceSumAmount) > 0) {
            let pastBalance = {
                name: "Outstanding Balance Due",
                fee: this.backBalanceSumAmount,
                discount: false,
                hasDescription: false,
                description: "",
                type: "deposit"
            };
            todayCharges.push(pastBalance);
        }
        todayTotal = 0;
        todayCharges.forEach((charge) => {
            todayTotal = Number(todayTotal) + Number(charge.fee);
        });
        todayTotal = Number(todayTotal).toFixed(2);
        let cartToday = { ...this.cart, todayCharges, hasToday, todayTotal };
        const cartEvent = new CustomEvent("updatecart", {
            detail: cartToday
        });
        this.dispatchEvent(cartEvent);
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");

        if (this.isGuestUser) {
            this.isManual = true;
            this.isPCI = false;
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.showAutoPayDiscounts = this.autoPayDiscounts.length > 0 && this.autoPay;
        this.attemptByProgram = 0;
        this.attempts = this.paymentAttempts;
        this.loaderSpinner = true;
        if (this.origin === "phonesales") {
            this.isCallCenterOrigin = true;
        }

        this.customer = {
            FirstName: this.clientInfo.contactInfo.firstName,
            LastName: this.clientInfo.contactInfo.lastName,
            Address: this.clientInfo.address.addressLine1,
            City: this.clientInfo.address.city,
            State: this.clientInfo.address.state,
            Zip: this.clientInfo.address.zipCode,
            Email: this.clientInfo.contactInfo.email,
            Phone: this.clientInfo.contactInfo.phone
        };
        this.firstName = this.clientInfo.contactInfo.firstName;
        this.lastName = this.clientInfo.contactInfo.lastName;
        this.email = this.clientInfo.contactInfo.email;
        this.phone = this.clientInfo.contactInfo.phone;
        this.zip = this.clientInfo.address.zipCode;
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
        for (let i = 0; i < 12; i++) {
            month = month + 1;
            let m = {
                label: Number(month) < 10 ? "0" + month : month.toString(),
                value: Number(month) < 10 ? "0" + month : month.toString()
            };
            this.months.push(m);
        }
        let myData = {
            ContextId: this.recordId
        };

        getCreditCardTypes({ myData })
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
                this.type = this.ccTypes[0].value;
                const path = "deposit";
                let myData = {
                    quoteId: this.quoteId,
                    partnerName: "frapi",
                    path,
                    userId: this.frontierUserId
                };
                console.log("Deposit request: ", myData);
                let apiResponse;
                callEndpoint({ inputMap: myData })
                    .then((response) => {
                        apiResponse = response;
                        const responseParsed = JSON.parse(response);
                        console.log("Deposit response: ", responseParsed);
                        let error =
                            (responseParsed.hasOwnProperty("result") &&
                                responseParsed.result.hasOwnProperty("error") &&
                                responseParsed.result.error.hasOwnProperty("provider") &&
                                responseParsed.result.error.provider.hasOwnProperty("message")) ||
                            responseParsed.hasOwnProperty("error");
                        if (error) {
                            this.loaderSpinner = false;
                            let errorMessage = responseParsed.hasOwnProperty("error")
                                ? responseParsed.error
                                : responseParsed.result.error.provider.message;
                            const event = new ShowToastEvent({
                                title: "Error",
                                variant: "error",
                                mode: "sticky",
                                message: errorMessage
                            });
                            this.dispatchEvent(event);
                            this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                        } else {
                            this.requiredDeposit = Number(responseParsed.requiredDeposit).toFixed(2);
                            this.backBalanceSumAmount = 0;

                            this.backBalances = responseParsed.hasOwnProperty("backBalances")
                                ? [...responseParsed.backBalances]
                                : [];
                            if (this.backBalances.length > 0) {
                                this.backBalances.forEach(
                                    (item) =>
                                        (this.backBalanceSumAmount =
                                            Number(this.backBalanceSumAmount) + Number(item.amountDue))
                                );
                            }
                            if (this.backBalanceSumAmount > 0 || this.requiredDeposit > 0) {
                                this.handleCartChange();
                            }

                            this.deposit = Number(
                                Number(this.requiredDeposit) + Number(this.backBalanceSumAmount)
                            ).toFixed(2);

                            this.loaderSpinner = false;
                            if (this.requiredDeposit == 0 && !this.autoPay && !this.backBalances.length > 0) {
                                this.handleFrontierNoDepositModal();
                            } else {
                                this.paymentNeeded = true;
                            }
                            this.upfrontPaymentNeeded = this.requiredDeposit > 0 || this.backBalances.length > 0;
                        }
                    })
                    .catch((error) => {
                        this.loaderSpinner = false;
                        const genericErrorMessage = "Couldn't fetch deposit amount from the server. Please, try again.";
                        const event = new ShowToastEvent({
                            title: "Server Error",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                        console.log(error);
                        if (apiResponse) {
                            this.logError(
                                `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                                myData,
                                path,
                                "API Error"
                            );
                        } else {
                            const errMsg = error.body?.message || error.message;
                            this.logError(errMsg);
                        }
                    });
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    handleFrontierNoDepositModal() {
        let body = this.modalDescription;
        let canClose = false;
        let agreeLabel = "Next";
        if (this.requiresFee) {
            body = `${this.modalDescription} <p>Fee Amount: $${this.creditFee}</p>`;
            canClose = true;
            agreeLabel = "Submit";
        }

        chuzo_modalGeneric
            .open({
                content: {
                    title: this.modalTitle,
                    provider: "frontier",
                    body,
                    agreeLabel,
                    canClose
                }
            })
            .then((result) => {
                if (!result?.agreed) {
                    this.paymentNeeded = true;
                    return;
                }

                if (this.requiresFee) {
                    this.validatePayment();
                } else {
                    this.handleNoPayment();
                }
            });
    }

    handleAutoPayDiscount(event) {
        this.autoPayDiscount = event.target.value;
        this.showACHForm = event.target.value === "ach";
        this.showCreditCardForm = event.target.value !== "ach" || this.upfrontPaymentNeeded;
        this.updateCartWithAutoPay();
    }

    handleRefresh() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };

        getCreditCardInformation({ myData })
            .then((response) => {
                const result = response.result;
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
                this.cardName = result.hasOwnProperty("ccName") ? result.ccName : undefined;
                this.disableValidations();
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    handlePCI(event) {
        this.pciValue = event.detail.value;
        this.isEmail = this.pciValue === "Email";
    }

    handleEmail(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        this.email = event.target.value !== undefined ? event.target.value : undefined;
        this.noEmail = emailre.test(this.email) && this.email === undefined ? true : false;
    }

    handlePhone(event) {
        let phonere = /^\d{10}$/;
        this.phone = event.target.value !== "" ? event.target.value : undefined;
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

        sendPCISMS({ myData })
            .then((response) => {
                let result = response.result;
                console.log("send PCI SMS result: ", result);
                this.loaderSpinner = false;
                let tit = result.error === "OK" ? "Success" : "Error";
                let varnt = result.error === "OK" ? "success" : "error";
                let errorMessage = "The SMS could not be sent. Please, verify the telephone number and try again.";
                let mess =
                    result.error === "OK"
                        ? "The SMS was sent correctly with a link to enter the information."
                        : errorMessage;
                const event = new ShowToastEvent({
                    title: tit,
                    variant: varnt,
                    message: mess
                });
                this.dispatchEvent(event);
                if (result.error === "OK") {
                    this.logError(errorMessage);
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

    handlePayment() {
        if (this.showCreditCardForm && this.ccExpired(this.year, this.month)) {
            this.noCompleteInformation = true;
            let errorMessage = "Credit Card has expired, enter a valid Credit Card";
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: errorMessage
            });
            this.dispatchEvent(event);
            this.logError(errorMessage);
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
            let errorMessage = "Maximum number of Payment attempts reached for this customer";
            const errorEvent = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: errorMessage
            });
            this.dispatchEvent(errorEvent);
            this.logError(errorMessage);
        }
        let info = {
            setOpportunityPaymentLimit: this.setOpportunityPaymentLimit,
            attempts: this.attempts,
            ContextId: this.recordId
        };

        savePaymentAttempts({ myData: info })
            .then((response) => {
                if (Number(this.requiredDeposit) > 0) {
                    this.handleCommercialFeeCheck();
                } else {
                    this.requiresFee = false;
                    this.validatePayment();
                }
            })
            .catch((error) => {
                console.log(error);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    checkCreditCardAttempts() {
        this.attempts = this.attemptByProgram;
        this.setOpportunityPaymentLimit = true;
        this.showNext = false;
        let errorMessage = "Maximum number of Payment attempts reached for this customer";
        const errorEvent = new ShowToastEvent({
            title: "Error",
            variant: "error",
            mode: "sticky",
            message: errorMessage
        });
        this.dispatchEvent(errorEvent);
        this.logError(errorMessage);

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

    handleCommercialFeeCheck() {
        if (!this.validateCreditCard()) {
            this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
            return;
        }
        this.loaderSpinner = true;
        this.type = this.type === "AMEX" ? "AMERICAN_EXPRESS" : this.type;
        const path = "calculateCreditCardFee";
        let myData = {
            path,
            partnerName: "frapi",
            quoteId: this.quoteId,
            accountUuid: this.accountId,
            payment: {
                cards: [
                    {
                        firstName: this.firstName.toString(),
                        lastName: this.lastName.toString(),
                        cardType: this.type.toString().toUpperCase(),
                        cardNumber: this.ccNumber.toString(),
                        cardExpMonth: this.month.toString(),
                        cardExpYear: this.year.toString(),
                        cvv: this.cvv.toString(),
                        zipCode: this.zip.toString(),
                        amount: Number(this.deposit).toFixed(0).toString(),
                        nameOnCard: this.cardName.toString()
                    }
                ],
                paymentType: "ONE_TIME_PAYMENT"
            },
            userId: this.frontierUserId
        };
        console.log("Calculate Credit Card Fee request: ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Calculate Credit Card Fee response: ", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        (responseParsed.result.error.hasOwnProperty("message") ||
                            (responseParsed.result.error.hasOwnProperty("provider") &&
                                responseParsed.result.error.provider.hasOwnProperty("message")))) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage =
                        responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        responseParsed.result.error.hasOwnProperty("provider")
                            ? responseParsed.result.error.provider.message
                            : responseParsed.hasOwnProperty("error") && responseParsed.error.hasOwnProperty("message")
                            ? responseParsed.result.error.message
                            : responseParsed.error;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
                } else {
                    let fee = responseParsed.commercialCreditCardFee;
                    if (fee == 0) {
                        this.validatePayment();
                        this.requiresFee = false;
                    } else {
                        this.creditFee = Number(fee).toFixed(2);
                        this.loaderSpinner = false;
                        this.modalDescription = responseParsed.paymentFeeDisclosureText["make-a-payment"];
                        this.modalTitle = "Commercial Credit Card Fee";
                        this.requiresFee = true;
                        this.handleFrontierNoDepositModal();
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage = "Service could not be reached. Please, try again";
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    validatePayment() {
        this.paymentNeeded = true;
        if (this.requiresFee) {
            let cartToday = { ...this.cart };
            cartToday.hasToday = true;
            let depositRequested = {
                name: "Commercial Credit Fee",
                fee: this.creditFee,
                discount: false,
                hasDescription: false,
                description: "",
                type: "deposit"
            };
            cartToday.todayCharges.push(depositRequested);
            cartToday.todayTotal = 0;
            cartToday.todayCharges.forEach((charge) => {
                cartToday.todayTotal = Number(cartToday.todayTotal) + Number(charge.fee);
            });
            cartToday.todayTotal = Number(cartToday.todayTotal).toFixed(2);
            this.cart = { ...cartToday };
        }
        this.loaderSpinner = true;
        this.type = this.type === "AMEX" ? "AMERICAN_EXPRESS" : this.type;
        const path = "payments";
        let myData = {
            path,
            partnerName: "frapi",
            quoteId: this.quoteId,
            accountUuid: this.accountId,
            billPreview: "",
            acceptDisclosures: [],
            tpvTransfer: "",
            customer: {
                firstName: this.clientInfo.contactInfo.firstName,
                lastName: this.clientInfo.contactInfo.lastName,
                emailAddress: this.clientInfo.contactInfo.email,
                phoneNumber: this.clientInfo.contactInfo.phone,
                reservedTn: this.reserved
            },
            payment: {
                sequenceNumber: 0,
                depositAmount: Number(this.deposit),
                eBill: this.eBill,
                autoPay: this.autoPay
            },
            userId: this.frontierUserId
        };
        if (this.backBalances !== undefined && this.backBalances.length > 0) {
            let backs = [...JSON.parse(JSON.stringify(this.backBalances))];
            backs.forEach((item) => {
                item.accountId.phoneNumber.phoneNumber = item.accountId.phoneNumber.phoneNumber.toString();
            });
            console.log(backs);
            myData.payment.backBalances = [...backs];
        }
        if (this.autoPay) {
            myData.payment.autopaySameAsDeposit = !this.showACHForm;
            myData.autopaySetup = "create";
        }
        if (this.showACHForm) {
            myData.autopayDetail = {
                ach: {
                    firstName: this.accountFirstName,
                    lastName: this.accountLastName,
                    accountType: this.accountType,
                    accountNumber: this.bankAccountNumber,
                    routingNumber: this.bankRoutingNumber,
                    accountClass: this.accountClass
                }
            };
        }
        if (this.showCreditCardForm) {
            myData.payment.cards = [
                {
                    firstName: this.firstName.toString(),
                    lastName: this.lastName.toString(),
                    cardType: this.type.toString().toUpperCase(),
                    cardNumber: this.ccNumber.toString(),
                    cardExpMonth: this.month.toString(),
                    cardExpYear: this.year.toString(),
                    cvv: this.cvv.toString(),
                    zipCode: this.zip.toString(),
                    amount: Number(this.deposit).toFixed(0).toString(),
                    nameOnCard: this.cardName.toString()
                }
            ];
            myData.payment.paymentMethod = "ONE_TIME_CARD";
        }
        console.log("Payments Request: ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Payments Response: ", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        (responseParsed.error.hasOwnProperty("message") ||
                            (responseParsed.error.hasOwnProperty("provider") &&
                                responseParsed.error.provider.hasOwnProperty("message")))) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage =
                        responseParsed.hasOwnProperty("error") && responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message
                            : responseParsed.hasOwnProperty("error") &&
                              responseParsed.error.hasOwnProperty("provider") &&
                              responseParsed.error.provider.hasOwnProperty("message")
                            ? responseParsed.error.provider.message
                            : responseParsed.hasOwnProperty("error") && responseParsed.error.hasOwnProperty("message")
                            ? responseParsed.error.message
                            : responseParsed.error;
                    if (errorMessage !== undefined && errorMessage.includes("Declined")) {
                        errorMessage = "Credit Card not authorized. Payment was declined.";
                    }
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.removeCreditFee();
                } else {
                    this.preview = responseParsed.billPreviewHTML;
                    this.handleNext();
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.removeCreditFee();
                this.loaderSpinner = false;
                const genericErrorMessage = "Service could not be reached. Please, try again";
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    updateCartWithAutoPay() {
        let cart = { ...this.cart };
        let cartFiltered = cart.monthlyCharges.filter(
            (e) => e.name !== "Auto Pay Discount" && e.name !== "Autopay Discount"
        );
        let newCharge = {
            name: "Auto Pay Discount",
            fee: Number(this.autoPayNode[this.autoPayDiscount]).toFixed(2),
            type: "Monthly",
            discount: Number(this.autoPayNode[this.autoPayDiscount]) <= 0
        };
        if (Number(newCharge.fee) < 0) {
            cartFiltered.push(newCharge);
        }
        cart.monthlyCharges = [...cartFiltered];
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        this.cart = { ...cart };
        const cartEvent = new CustomEvent("updatecart", {
            detail: cart
        });
        this.dispatchEvent(cartEvent);
    }

    handleACH(event) {
        switch (event.target.name) {
            case "accountFirstName":
                this.accountFirstName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "accountLastName":
                this.accountLastName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "bankRoutingNumber":
                this.bankRoutingNumber = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "bankAccountNumber":
                this.bankAccountNumber = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "accountType":
                this.accountType = event.target.value;
                break;
            case "accountClass":
                this.accountClass = event.target.value;
                break;
        }
        this.disableValidations();
    }

    removeCreditFee() {
        let cartToday = { ...this.cart };
        let today = [...cartToday.todayCharges.filter((item) => item.name !== "Commercial Credit Fee")];
        cartToday.todayCharges = [...today];
        cartToday.hasToday = cartToday.todayCharges.length > 0;
        cartToday.todayTotal = 0;
        cartToday.todayCharges.forEach((charge) => {
            cartToday.todayTotal = Number(cartToday.todayTotal) + Number(charge.fee);
        });
        cartToday.todayTotal = Number(cartToday.todayTotal).toFixed(2);
        this.cart = { ...cartToday };
        const cartEvent = new CustomEvent("updatecart", {
            detail: cartToday
        });
        this.dispatchEvent(cartEvent);
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

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleNext(event) {
        let data = {
            preview: this.preview,
            reference: this.referenceNumber
        };
        const nextEvent = new CustomEvent("creditcardvalidated", {
            detail: data
        });
        this.dispatchEvent(nextEvent);
    }

    handleShowCCQuoteAssistanceModal() {
        this.showCreditCheckQuoteAssistanceModal = true;
    }

    handleCloseCCQuoteAssistanceModal() {
        this.showCreditCheckQuoteAssistanceModal = false;
    }

    handleNoPayment() {
        this.paymentNeeded = true;
        this.loaderSpinner = true;
        const path = "payments";
        let myData = {
            path,
            partnerName: "frapi",
            quoteId: this.quoteId,
            accountUuid: this.accountId,
            billPreview: "",
            acceptDisclosures: [],
            tpvTransfer: "",
            customer: {
                firstName: this.clientInfo.contactInfo.firstName,
                lastName: this.clientInfo.contactInfo.lastName,
                emailAddress: this.clientInfo.contactInfo.email,
                phoneNumber: this.clientInfo.contactInfo.phone,
                reservedTn: this.reserved
            },
            payment: {
                cards: [],
                sequenceNumber: 0,
                depositAmount: Number(Number(this.deposit).toFixed(2)),
                paymentMethod: "ONE_TIME_ACH",
                eBill: this.eBill,
                autoPay: this.autoPay
            },
            userId: this.frontierUserId
        };
        console.log("Payments request: ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Payments response: ", responseParsed);

                let error =
                    (responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        responseParsed.result.error.hasOwnProperty("provider") &&
                        responseParsed.result.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error
                        : responseParsed.result.error.provider.message;
                    if (errorMessage.includes("Declined")) {
                        errorMessage = "Credit Card not authorized. Payment was declined.";
                    }
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(error.body?.message || error.message);
                } else {
                    this.preview = responseParsed.billPreviewHTML;
                    this.handleNext();
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage = "Service could not be reached. Please, try again";
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
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
            component: "poe_lwcSelfServiceFrontierPaymentTab",
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
            tab: "Payment"
        };
        this.dispatchEvent(event);
    }
}