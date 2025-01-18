import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { NavigationMixin } from "lightning/navigation";
import savePaymentAttempts from "@salesforce/apex/OrderConfirmationTabController.savePaymentAttempts";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getCreditCardInformation from "@salesforce/apex/checkoutTabController.getCreditCardInformation";
import sendCreditCheckPciEmail from "@salesforce/apex/CreditCheckTabController.sendCreditCheckPciEmail";
import sendPCISMS from "@salesforce/apex/CreditCheckTabController.sendPCISMS";
import PHONE_DISCLAIMER from "@salesforce/label/c.POE_phone_disclaimer";
import PHONE_DISCLAIMER2 from "@salesforce/label/c.POE_phone_disclaimer2";
import SMS_VERBIAGE from "@salesforce/label/c.POE_sms_verbiage";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import AutoPay_labels from "@salesforce/label/c.AutoPay_labels";
import Paperless_Billing_Header from "@salesforce/label/c.Paperless_Billing_Header";
import Email_PCI_Link_Button_Label from "@salesforce/label/c.Email_PCI_Link_Button_Label";
import Windstream_Refresh_Fields_credit_check from "@salesforce/label/c.Windstream_Refresh_Fields_credit_check";
import SMS_PCI_Link_Button_Label from "@salesforce/label/c.SMS_PCI_Link_Button_Label";
import Upfront_Payment_Credit_Card from "@salesforce/label/c.Upfront_Payment_Credit_Card";
import Recurrent_Payment from "@salesforce/label/c.Recurrent_Payment";
import Credit_Card_Expired_Error_Message from "@salesforce/label/c.Credit_Card_Expired_Error_Message";
import Max_Payment_Attempts_Error_Message from "@salesforce/label/c.Max_Payment_Attempts_Error_Message";
import Upfront_payment_method from "@salesforce/label/c.Upfront_payment_method";
import Service_unreachable from "@salesforce/label/c.Service_unreachable";
import Email_Sent_Successfully_Message from "@salesforce/label/c.Email_Sent_Successfully_Message";
import POE_Send_Email_Error_Message from "@salesforce/label/c.POE_Send_Email_Error_Message";
import SMS_Sent_Successfully_Message from "@salesforce/label/c.SMS_Sent_Successfully_Message";
import POE_Send_SMS_Error_Message from "@salesforce/label/c.POE_Send_SMS_Error_Message";
import Recurrent_Payment_method from "@salesforce/label/c.Recurrent_Payment_method";

export default class poe_lwcBuyflowViasatCheckoutTab extends NavigationMixin(LightningElement) {
    @api cartInfo;
    @api recordId;
    @api logo;
    @api referenceNumber;
    @api origin;
    @api clientInfo;
    @api customerId;
    @api paymentAttempts;
    @api isGuestUser;
    @api depositNeeded;
    @api billingDetails;
    @api cafProduct;
    noCompleteInformation = true;
    methods = [
        { label: "PCI Link", value: "PCI" },
        { label: "Manual", value: "Manual" }
    ];
    pciOptions = [
        { label: "Email", value: "Email" },
        { label: "SMS", value: "SMS" }
    ];
    dueTotal;
    years = [];
    months = [];
    month;
    year;
    customer = {
        FirstName: "",
        LastName: "",
        Address: "",
        AddressLine2: "",
        City: "",
        State: "",
        Zip: "",
        Email: "",
        Phone: ""
    };
    autopayAvailable = false;
    autopayOptions = [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" }
    ];
    autopayValue = "false";
    paperlessAvailable = false;
    paperlessOptions = [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" }
    ];
    recurrentOptions = [
        { label: "Credit Card", value: "card" },
        { label: "Electronic Funds Transfer", value: "ach" }
    ];
    ccTypes = [
        { label: "American Express", value: "American Express" },
        { label: "Discover", value: "Discover" },
        { label: "MasterCard", value: "MasterCard" },
        { label: "Visa", value: "Visa" },
        { label: "Diners Club", value: "Diners Club" },
        { label: "Visa Dankort", value: "Visa Dankort" }
    ];
    recurrentOption = "card";
    paperlessValue = "false";
    showRecurrentCard = true;
    showRecurrentACH = false;
    firstName;
    lastName;
    ccNumber;
    cvv;
    zip;
    recurrentFirstName;
    recurrentLastName;
    recurrentCcNumber;
    recurrentCvv;
    recurrentType;
    recurrentZip;
    recurrentMonth;
    recurrentYear;
    accountSurname;
    bankRoutingNumber;
    bankAccountNumber;
    pciValue = "Email";
    method = "PCI";
    isManual = false;
    isPCI = true;
    loaderSpinner;
    useSameMethod = true;
    isEmail = true;
    noEmail = false;
    noPhone = false;
    email;
    phone;
    billingAccountNumber;
    showCollateral = false;
    paymentTransactionId;
    taxJurisdiction = {
        taxCodeType: "",
        taxCodeValue: ""
    };
    upfrontPayment;
    attempts;
    attemptByProgram;
    setOpportunityPaymentLimit = false;
    showNext = true;
    phoneDisclaimer = PHONE_DISCLAIMER;
    phoneDisclaimer2 = PHONE_DISCLAIMER2;
    hasOptedInSMS = false;
    ccInfo;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        AutoPay_labels,
        Paperless_Billing_Header,
        Email_PCI_Link_Button_Label,
        Windstream_Refresh_Fields_credit_check,
        SMS_PCI_Link_Button_Label,
        Upfront_Payment_Credit_Card,
        Recurrent_Payment,
        Credit_Card_Expired_Error_Message,
        Max_Payment_Attempts_Error_Message,
        Upfront_payment_method,
        Service_unreachable,
        Email_Sent_Successfully_Message,
        POE_Send_Email_Error_Message,
        SMS_Sent_Successfully_Message,
        POE_Send_SMS_Error_Message,
        Recurrent_Payment_method
    };
    showSelfServiceCancelModal = false;

    get disableSendSMSButton() {
        return this.noPhone || !this.hasOptedInSMS;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get dontUseSameMethod() {
        return !this.useSameMethod;
    }

    handleNext(e) {
        if (this.ccExpired(this.year, this.month) || this.ccExpired(this.recurrentYear, this.recurrentMonth)) {
            this.noCompleteInformation = true;
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: this.labels.Credit_Card_Expired_Error_Message
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
                message: this.labels.Max_Payment_Attempts_Error_Message
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
                this.createTransaction(true);
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
            message: this.labels.Max_Payment_Attempts_Error_Message
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
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    createTransaction(start) {
        let callout = {
            tab: "transaction",
            path: "paymentTransactionId",
            partnerName: "viasat",
            customerId: this.customerId,
            emailAddress: this.customer.Email,
            transactionType: this.depositNeeded && start && !this.useSameMethod ? "sale" : "authorize",
            billingAccountNumber: this.billingAccountNumber,
            money: {
                value:
                    this.depositNeeded && (start || this.useSameMethod)
                        ? String(Number(this.dueTotal).toFixed(2))
                        : this.showRecurrentACH
                        ? "0.00"
                        : "60.00",
                currencyCode: "USD"
            }
        };
        console.log(`${this.depositNeeded && start ? "Upfront" : "Recurrent"} Transaction Request`, callout);
        let apiResponse;
        callEndpoint({ inputMap: callout })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                console.log("Create Transaction Response", response);
                let error =
                    (response.hasOwnProperty("result") &&
                        response.result.hasOwnProperty("error") &&
                        response.result.error.hasOwnProperty("provider") &&
                        response.result.error.provider.hasOwnProperty("message")) ||
                    response.hasOwnProperty("error");
                if (error) {
                    let errorMessage = response.hasOwnProperty("error")
                        ? response.error.hasOwnProperty("provider")
                            ? response.error.provider.message.hasOwnProperty("message")
                                ? response.error.provider.message.message
                                : response.error.provider.message
                            : response.error
                        : response.result.error.provider.message.hasOwnProperty("message")
                        ? response.result.error.provider.message.message
                        : response.result.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage !== "" ? errorMessage : "Internal Server Error"
                    });
                    this.dispatchEvent(event);
                    this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
                    this.loaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, callout, callout.path, "API Error");
                } else {
                    this.paymentTransactionId = response.paymentTransactionId;
                    if (this.depositNeeded && start && !this.useSameMethod) {
                        this.upfrontPaymentHandler();
                    } else {
                        this.recurrentPayment();
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage = this.labels.Service_unreachable;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, callout.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    upfrontPaymentHandler() {
        let callout = {
            tab: "payment",
            path: "payments",
            partnerName: "viasat",
            customerId: this.customerId,
            billingAccountNumber: this.billingAccountNumber,
            paymentTransactionId: this.paymentTransactionId,
            useForBothPayments: false,
            payment: {
                cards: [
                    {
                        firstName: this.firstName,
                        lastName: this.lastName,
                        cardExpMonth: this.month,
                        cardExpYear: this.year,
                        cardNumber: this.ccNumber,
                        cvv: this.cvv,
                        zipCode: this.zip
                    }
                ]
            }
        };
        let apiResponse;
        callEndpoint({ inputMap: callout })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                console.log("Payments response", response);
                let error =
                    (response.hasOwnProperty("result") &&
                        response.result.hasOwnProperty("error") &&
                        response.result.error.hasOwnProperty("provider") &&
                        response.result.error.provider.hasOwnProperty("message")) ||
                    response.hasOwnProperty("error");
                if (error) {
                    let errorMessage = response.hasOwnProperty("error")
                        ? response.error.hasOwnProperty("provider")
                            ? response.error.provider.message.hasOwnProperty("message")
                                ? response.error.provider.message.message
                                : response.error.provider.message
                            : response.error
                        : response.result.error.provider.message.hasOwnProperty("message")
                        ? response.result.error.provider.message.message
                        : response.result.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage !== "" ? errorMessage : "Internal Server Error"
                    });
                    this.dispatchEvent(event);
                    this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
                    this.loaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, callout, callout.path, "API Error");
                } else {
                    if ((response.status_code = "Success")) {
                        this.upfrontPayment = { ...callout.payment };
                        this.createTransaction(false);
                    } else {
                        const event = new ShowToastEvent({
                            title: "Upfront Payment Error",
                            variant: "error",
                            mode: "sticky",
                            message: this.labels.Upfront_payment_method
                        });
                        this.dispatchEvent(event);
                        this.logError(
                            `"Upfront Payment method could not be validated. Please try again.}\nAPI Response: ${apiResponse}`,
                            callout,
                            callout.path,
                            "API Error"
                        );
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage = this.labels.Service_unreachable;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, callout.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    recurrentPayment() {
        let callout = {
            tab: "payment",
            path: "payments",
            partnerName: "viasat",
            customerId: this.customerId,
            billingAccountNumber: this.billingAccountNumber,
            paymentTransactionId: this.paymentTransactionId,
            savePaymentInfo: true,
            useAsDefault: false,
            useForRecurringPayment: true,
            useForBothPayments: this.useSameMethod,
            payment: {}
        };
        let payment;
        if (this.showRecurrentACH) {
            payment = {
                ach: {
                    accountSurname: this.accountSurname,
                    bankRoutingNumber: this.bankRoutingNumber,
                    bankAccountNumber: this.bankAccountNumber
                }
            };
        } else if (this.showRecurrentCard) {
            payment = {
                cards: [
                    {
                        firstName: this.useSameMethod && this.depositNeeded ? this.firstName : this.recurrentFirstName,
                        lastName: this.useSameMethod && this.depositNeeded ? this.lastName : this.recurrentLastName,
                        cardExpMonth: this.useSameMethod && this.depositNeeded ? this.month : this.recurrentMonth,
                        cardExpYear: this.useSameMethod && this.depositNeeded ? this.year : this.recurrentYear,
                        cardNumber: this.useSameMethod && this.depositNeeded ? this.ccNumber : this.recurrentCcNumber,
                        cvv: this.useSameMethod && this.depositNeeded ? this.cvv : this.recurrentCvv,
                        zipCode: this.useSameMethod && this.depositNeeded ? this.zip : this.recurrentZip
                    }
                ]
            };
        }
        callout.payment = { ...payment };
        console.log("Recurrent Payment Request", callout);
        let apiResponse;
        callEndpoint({ inputMap: callout })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                console.log("Recurrent Payment Response", response);
                let error =
                    (response.hasOwnProperty("result") &&
                        response.result.hasOwnProperty("error") &&
                        response.result.error.hasOwnProperty("provider") &&
                        response.result.error.provider.hasOwnProperty("message")) ||
                    response.hasOwnProperty("error");
                if (error) {
                    let errorMessage = response.hasOwnProperty("error")
                        ? response.error.hasOwnProperty("provider")
                            ? response.error.provider.message.hasOwnProperty("message")
                                ? response.error.provider.message.message
                                : response.error.provider.message
                            : response.error
                        : response.result.error.provider.message.hasOwnProperty("message")
                        ? response.result.error.provider.message.message
                        : response.result.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Recurrent Payment Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage !== "" ? errorMessage : "Internal Server Error"
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, callout, callout.path, "API Error");
                } else {
                    if ((response.status_code = "Success")) {
                        let info = {
                            billingAccountNumber: this.billingAccountNumber,
                            taxJurisdiction: this.taxJurisdiction,
                            payment: {
                                upfront: this.upfrontPayment !== undefined ? { ...this.upfrontPayment } : {},
                                recurrent: { ...payment }
                            }
                        };
                        const passedEvent = new CustomEvent("creditcardvalidated", {
                            detail: info
                        });
                        this.dispatchEvent(passedEvent);
                        this.loaderSpinner = false;
                    } else {
                        const event = new ShowToastEvent({
                            title: "Error",
                            variant: "error",
                            mode: "sticky",
                            message: this.labels.Recurrent_Payment_method
                        });
                        this.dispatchEvent(event);
                        this.logError(
                            `"Recurrent Payment method could not be validated. Please try again.}\nAPI Response: ${apiResponse}`,
                            callout,
                            callout.path,
                            "API Error"
                        );
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage = this.labels.Service_unreachable;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, callout.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    handleBack() {
        const sendBackEvent = new CustomEvent("back", {
            detail: this.attempts
        });
        this.dispatchEvent(sendBackEvent);
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
            case "useSameMethod":
                this.useSameMethod = event.target.checked;
                break;
            case "recurrentOption":
                this.showRecurrentACH = event.target.value === "ach";
                this.showRecurrentCard = event.target.value === "card";
                this.recurrentOption = event.target.value;
                break;
            case "recurrentFirstName":
                this.recurrentFirstName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "recurrentLastName":
                this.recurrentLastName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "recurrentCcNumber":
                this.recurrentCcNumber = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "recurrentCvv":
                this.recurrentCvv = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "recurrentType":
                this.recurrentType = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "recurrentZip":
                this.recurrentZip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "recurrentMonth":
                this.recurrentMonth = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "recurrentYear":
                this.recurrentYear = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "accountSurname":
                this.accountSurname = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "bankRoutingNumber":
                this.bankRoutingNumber = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "bankAccountNumber":
                this.bankAccountNumber = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "hasOptedInSMS":
                this.hasOptedInSMS = event.detail.checked;
                break;
        }
        this.disableValidations();
    }

    defaultCCValues(ccInfo) {
        this.cvv = ccInfo.hasOwnProperty("ccCcv") ? ccInfo.ccCcv : undefined;
        this.month = ccInfo.hasOwnProperty("ccExpirationMonth")
            ? Number(ccInfo.ccExpirationMonth) < 10
                ? "0" + ccInfo.ccExpirationMonth
                : ccInfo.ccExpirationMonth
            : undefined;
        this.ccNumber = ccInfo.hasOwnProperty("ccNumber") ? ccInfo.ccNumber : undefined;
        this.year = ccInfo.hasOwnProperty("ccExpirationYear") ? ccInfo.ccExpirationYear : undefined;
        this.firstName = ccInfo.hasOwnProperty("ccFirstName") ? ccInfo.ccFirstName : undefined;
        this.lastName = ccInfo.hasOwnProperty("ccLastName") ? ccInfo.ccLastName : undefined;
        this.type = ccInfo.hasOwnProperty("ccType") ? ccInfo.ccType : undefined;
        if (this.type === "AMEX") {
            this.type = "American Express";
        }
        this.zip = ccInfo.hasOwnProperty("ccZipcode") ? ccInfo.ccZipcode : undefined;
        this.disableValidations();
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

    ccExpired(ccYear, ccMonth) {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
        const paddedMonth = String(ccMonth).padStart(2, "0");
        let currentYearMonth = `${currentYear}-${currentMonth}-1`;
        let ccExpirationDate = `${ccYear}-${paddedMonth}-1`;
        return currentYearMonth >= ccExpirationDate;
    }

    disableValidations() {
        let ccvPattern = /^[0-9]{3,4}$/;
        let ccPattern = /^[0-9]{13,19}$/;
        let routingre = /^\d{9}$/;
        let accountre = /^\d{10,12}$/;
        if (
            (this.firstName !== undefined &&
                this.lastName !== undefined &&
                this.type !== undefined &&
                this.ccNumber !== undefined &&
                ccPattern.test(this.ccNumber) &&
                ccvPattern.test(this.cvv) &&
                this.month !== undefined &&
                this.year !== undefined &&
                this.cvv !== undefined &&
                this.zip !== undefined &&
                (this.useSameMethod ||
                    (!this.useSameMethod &&
                        ((this.showRecurrentCard &&
                            this.recurrentFirstName !== undefined &&
                            this.recurrentLastName !== undefined &&
                            this.recurrentCcNumber !== undefined &&
                            ccPattern.test(this.recurrentCcNumber) &&
                            this.recurrentCvv !== undefined &&
                            ccvPattern.test(this.recurrentCvv) &&
                            this.recurrentMonth !== undefined &&
                            this.recurrentType !== undefined &&
                            this.recurrentYear !== undefined &&
                            this.recurrentZip !== undefined) ||
                            (this.showRecurrentACH &&
                                this.accountSurname !== undefined &&
                                accountre.test(this.bankAccountNumber) &&
                                routingre.test(this.bankRoutingNumber) &&
                                this.bankAccountNumber !== undefined &&
                                this.bankRoutingNumber !== undefined))))) ||
            (!this.depositNeeded &&
                ((this.showRecurrentCard &&
                    this.recurrentFirstName !== undefined &&
                    this.recurrentLastName !== undefined &&
                    this.recurrentCcNumber !== undefined &&
                    ccPattern.test(this.recurrentCcNumber) &&
                    this.recurrentCvv !== undefined &&
                    ccvPattern.test(this.recurrentCvv) &&
                    this.recurrentMonth !== undefined &&
                    this.recurrentType !== undefined &&
                    this.recurrentYear !== undefined &&
                    this.recurrentZip !== undefined) ||
                    (this.showRecurrentACH &&
                        this.accountSurname !== undefined &&
                        accountre.test(this.bankAccountNumber) &&
                        routingre.test(this.bankRoutingNumber) &&
                        this.bankAccountNumber !== undefined &&
                        this.bankRoutingNumber !== undefined)))
        ) {
            this.noCompleteInformation = false;
        } else {
            this.noCompleteInformation = true;
        }
    }

    setDepositNeeded() {
        if (Number(this.dueTotal) == 0) {
            this.depositNeeded = false;
            this.useSameMethod = false;
        } else {
            this.depositNeeded = true;
        }
    }

    connectedCallback() {
        if (this.isGuestUser) {
            this.isManual = true;
            this.isPCI = false;
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.attemptByProgram = 0;
        this.attempts = this.paymentAttempts;
        this.dueTotal = this.cartInfo.todayTotal;
        this.loaderSpinner = true;
        this.customer = {
            FirstName: this.clientInfo.contactInfo.firstName,
            LastName: this.clientInfo.contactInfo.lastName,
            Address: this.clientInfo.billingAddress.addressLine1,
            AddressLine2: this.clientInfo.billingAddress.addressLine2,
            City: this.clientInfo.billingAddress.city,
            State: this.clientInfo.billingAddress.state,
            Zip: this.clientInfo.billingAddress.zipCode,
            Email: this.clientInfo.contactInfo.email,
            Phone: this.clientInfo.contactInfo.phone
        };
        this.firstName = this.customer.FirstName;
        this.lastName = this.customer.LastName;
        this.recurrentFirstName = this.customer.FirstName;
        this.recurrentLastName = this.customer.LastName;
        this.accountSurname = this.customer.LastName;
        this.email = this.customer.Email;
        this.phone = this.customer.Phone;
        this.zip = this.customer.Zip;
        this.recurrentZip = this.zip;
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

        if (this.billingDetails && Object.keys(this.billingDetails).length) {
            this.taxJurisdiction.taxCodeType = this.billingDetails.taxCodeType;
            this.taxJurisdiction.taxCodeValue = this.billingDetails.taxCodeValue;
            this.dueTotal = this.billingDetails.dueTotal;
            this.billingAccountNumber = this.billingDetails.billingAccountNumber;
            this.setDepositNeeded();
            this.loaderSpinner = false;
            return;
        }

        let callout = {
            tab: "billing",
            path: "addBillingAccount",
            partnerName: "viasat",
            customerId: this.customerId,
            address: {
                addressLine1: this.customer.Address,
                addressLine2: this.customer.AddressLine2,
                city: this.customer.City,
                state: this.customer.State,
                countryCode: "US",
                zipCode: this.customer.Zip
            },
            paymentMethodType: "NoPaymentMethod",
            isLateFeeExempt: this.cafProduct,
            isTaxExempt: false,
            isRegulated: this.cafProduct
        };
        let apiResponse;
        console.log("Add Billing Account Request", callout);
        callEndpoint({ inputMap: callout })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                console.log("Add Billing Account Response", response);
                let error =
                    (response.hasOwnProperty("result") &&
                        response.result.hasOwnProperty("error") &&
                        response.result.error.hasOwnProperty("provider") &&
                        response.result.error.provider.hasOwnProperty("message")) ||
                    response.hasOwnProperty("error");
                if (error) {
                    let errorMessage = response.hasOwnProperty("error")
                        ? response.error.hasOwnProperty("provider")
                            ? response.error.provider.message.hasOwnProperty("message")
                                ? response.error.provider.message.message
                                : response.error.provider.message
                            : response.error
                        : response.result.error.provider.message.hasOwnProperty("message")
                        ? response.result.error.provider.message.message
                        : response.result.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage !== "" ? errorMessage : "Internal Server Error"
                    });
                    this.loaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, callout, callout.path, "API Error");
                } else {
                    this.taxJurisdiction.taxCodeType = response.tax_code.type;
                    this.taxJurisdiction.taxCodeValue = response.tax_code.value;
                    if (response.total_amount_past_due.value !== null) {
                        this.dueTotal = (Number(this.dueTotal) + Number(response.total_amount_past_due.value)).toFixed(
                            2
                        );
                    }
                    this.setDepositNeeded();
                    this.billingAccountNumber = response.billingAccountNumber;
                    this.loaderSpinner = false;

                    this.dispatchEvent(
                        new CustomEvent("billingsuccess", {
                            detail: {
                                taxCodeType: this.taxJurisdiction.taxCodeType,
                                taxCodeValue: this.taxJurisdiction.taxCodeValue,
                                dueTotal: this.dueTotal,
                                billingAccountNumber: this.billingAccountNumber
                            }
                        })
                    );
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage = this.labels.Service_unreachable;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, callout.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    handleRefresh() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };
        const options = {};
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

    handlePCI(event) {
        this.isEmail = event.target.value === "Email" ? true : false;
        this.pciValue = event.target.value;
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
                    title: "Success",
                    variant: "success",
                    message: this.labels.Email_Sent_Successfully_Message
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
                        ? this.labels.SMS_Sent_Successfully_Message
                        : this.labels.POE_Send_SMS_Error_Message;
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
                    message: this.labels.POE_Send_SMS_Error_Message
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
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

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Checkout",
            component: "poe_lwcBuyflowViasatCheckoutTab",
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
            tab: "Checkout"
        };
        this.dispatchEvent(event);
    }
}