import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";

export default class Poe_lwcBuyflowDirecTvBeamPaymentInformationMock extends NavigationMixin(LightningElement) {
    @api todayCharges;
    @api orderRequest;
    @api verbiages;
    @api orderInfo;
    @api recordId;
    @api origin;
    @api paymentAttempts;
    @api cartInfo;
    @api logo;
    @api futureCharges;
    @api returnUrl;
    @api paperlessBilling = [
        {
            Id: 1,
            value: "We will use the email address that you provided to send a monthly notification that your bill, bill inserts and other notices are available for viewing on att.com."
        },
        {
            Id: 2,
            value: "You will receive an email from DIRECTV shortly, please click the verification link to confirm your email address. This will complete your enrollment and ensure that you receive any discounts for paperless billing."
        },
        {
            Id: 3,
            value: "To maintain this discount you must stay enrolled in both AutoPay and paperless billing. Credits appear on the bill within 1-2 bill cycles after completing enrollment of AutoPay & paperless billing."
        },
        {
            Id: 4,
            value: "In order to view or print your full bill and pay online, please ensure that your account is registered at att.com/managemyaccount"
        }
    ];
    @api autoPayAuthorization = [
        {
            Id: 1,
            value: "You have agreed to automatic payments, which we call AutoPay. "
        },
        {
            Id: 2,
            value: "We will automatically charge the payment method you selected today, in the amount of each monthly bill, on the date shown on the bill. Note, this amount may include early termination charges and other fees."
        },
        {
            Id: 3,
            value: "We will keep this payment method on file for AutoPay and may receive updates for the payment method from your financial institution."
        },
        {
            Id: 4,
            value: "If you selected a stored payment method, we will use a copy of that payment method on file, even if you update that payment method."
        },
        {
            Id: 5,
            value: "If you later wish to cancel AutoPay, call the Customer Care number on Your bill. Keep in mind that cancellation is not immediate, and your payment may process before it is cancelled."
        },
        {
            Id: 6,
            value: "Cancelling your account does not cancel AutoPay."
        },
        {
            Id: 7,
            value: "Please be aware, if AutoPay is cancelled, you may lose any discounts or incentives that require Autopay."
        }
    ];
    noCompleteInformation = true;
    firstName;
    lastName;
    zip;
    cvv;
    ccNumber;
    type;
    autopayFirstName;
    autopayLastName;
    autopayZip;
    autopayCvv;
    autopayCcNumber;
    autopayType;
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
    totalAmountMinusShipping;
    declineWarning =
        "Warning - By deselecting Auto BillPay and Paperless Billing, the price will increase from the amounts previously quoted, as you are losing your discount";
    autoPay = false;
    useSameShipping = false;
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
    cart = {};

    connectedCallback() {
        this.cart = { ...this.cartInfo };
        this.attemptByProgram = 0;
        this.attempts = this.paymentAttempts;
        this.loaderSpinner = true;
        this.total = Number(this.todayCharges.totalAmount);
        this.total = this.total.toFixed(2);
        this._actionUtil = new OmniscriptActionCommonUtil();
        this.firstName = this.orderInfo.customer.firstName;
        this.lastName = this.orderInfo.customer.lastName;
        this.zip = this.orderInfo.address.zipCode;
        this.isNonCallcenter = this.origin != "phonesales";
        let year = new Date().getFullYear();
        this.email = this.orderInfo.customer.emailAddress;
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
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_GetCreditCardTypes",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                let initialCC = [];
                let ccs = response.result.IPResult.Credit_Card_Types__mdt;
                ccs.forEach((cc) => {
                    let credit = {
                        label: cc.Label,
                        value: cc.Label
                    };
                    initialCC.push(credit);
                });
                this.ccTypes = [...initialCC];
                if (Number(this.todayCharges.taxAmount) > 0) {
                    let charges = [...this.cart.todayCharges];
                    let taxObject = {
                        name: "DIRECTV Sales Tax",
                        fee: Number(this.todayCharges.taxAmount).toFixed(2),
                        discount: false,
                        feeTerm: "Today",
                        hasDescription: false,
                        description: "",
                        type: "tax"
                    };
                    charges.push(taxObject);
                    let total = 0;
                    charges.forEach((charge) => {
                        total = Number(total) + Number(charge.fee);
                    });
                    total = Number(total).toFixed(2);
                    let auxCart = { todayCharges: charges, todayTotal: total };
                    this.cart = { ...this.cart, ...auxCart };
                }
                let monthlyCharges = [...this.cart.monthlyCharges];
                monthlyCharges.forEach((charge) => {
                    if (charge.name === "AutoPay/Paperless Billing") {
                        this.autoPay = true;
                        this.autoPayCharge = charge;
                    }
                });
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
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
        const options = {};
        const params = {
            input: JSON.stringify(info),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_savePaymentAttempts",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {})
            .catch((error) => {
                console.log(error);
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
    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleChange(event) {
        let ccvPattern = /^[0-9]{3,4}$/;
        let ccPattern = /^[0-9]{13,19}$/;
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        switch (event.target.name) {
            case "email":
                this.email = emailre.test(event.target.value) ? event.target.value : undefined;
                break;
            case "firstName":
                this.firstName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "lastName":
                this.lastName = event.target.value !== "" ? event.target.value : undefined;
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
            case "ccNumber":
                this.ccNumber = ccPattern.test(event.target.value) ? event.target.value : undefined;
                break;
            case "type":
                this.type = event.target.value !== "" ? event.target.value : undefined;
                break;

            case "autopayFirstName":
                this.autopayFirstName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "autopayLastName":
                this.autopayLastName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "autopayMonth":
                this.autopayMonth = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "autopayYear":
                this.autopayYear = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "autopayCvv":
                this.autopayCvv = ccvPattern.test(event.target.value) ? event.target.value : undefined;
                break;
            case "autopayZip":
                this.autopayZip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "autopayCcNumber":
                this.autopayCcNumber = ccPattern.test(event.target.value) ? event.target.value : undefined;
                break;
            case "autopayType":
                this.autopayType = event.target.value !== "" ? event.target.value : undefined;
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
            this.todayComplete = true;
        } else {
            this.todayComplete = false;
        }

        if (
            (this.useSameAutopay ||
                (this.autopayFirstName !== undefined &&
                    this.autopayLastName !== undefined &&
                    this.autopayType !== undefined &&
                    this.autopayMonth !== undefined &&
                    this.autopayYear !== undefined &&
                    this.autopayCvv !== undefined &&
                    this.autopayCcNumber !== undefined &&
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
                if (item.name === "AutoPay/Paperless Billing") {
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
        if (event.target.name === "sameCardShipping") {
            this.useSameShipping = event.target.checked;
        } else {
            this.useSameAutopay = event.target.checked;
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
        const options = {};
        const params = {
            input: JSON.stringify(info),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_savePaymentAttempts",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                this.processPayment();
            })
            .catch((error) => {
                console.log(error);
                this.loaderSpinner = false;
            });
    }

    processPayment() {
        let cardType = this.returnCardType(this.type);
        let callout = { ...this.orderRequest };
        callout.customer = JSON.parse(JSON.stringify(callout.customer));
        if (callout.customer.middleName === null) {
            callout.customer.middleName = "";
        }
        callout.payment = {
            cards: [
                {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    cardType: cardType,
                    cardNumber: this.ccNumber,
                    cardExpMonth: this.month,
                    cardExpYear: this.year,
                    cvv: this.cvv,
                    zipCode: this.zip,
                    amount: String(this.total),
                    payType: "today"
                }
            ]
        };
        callout.tab = "payment";
        if (this.autoPay) {
            let newCard;
            if (this.useSameAutopay) {
                newCard = {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    cardType: cardType,
                    cardNumber: this.ccNumber,
                    cardExpMonth: this.month,
                    cardExpYear: this.year,
                    cvv: this.cvv,
                    zipCode: this.zip,
                    amount: "0",
                    payType: "abp"
                };
            } else {
                cardType = this.returnCardType(this.autopayType);
                newCard = {
                    firstName: this.autopayFirstName,
                    lastName: this.autopayLastName,
                    cardType: cardType,
                    cardNumber: this.autopayCcNumber,
                    cardExpMonth: this.autopayMonth,
                    cardExpYear: this.autopayYear,
                    cvv: this.autopayCvv,
                    zipCode: this.autopayZip,
                    amount: "0",
                    payType: "abp"
                };
            }
            callout.payment.cards.push(newCard);
        }
        let customizations = [...JSON.parse(JSON.stringify(callout.componentCustomizations))];
        customizations.forEach((customization) => {
            if (customization.customization.properties.customizationCode === "DTV-INCLUDED-OFFERS") {
                customization.customization.choices.forEach((choice) => {
                    if (choice.choice.properties.choiceCode === "DTV-INCLUDED-OFFERS-REQUIRED") {
                        choice.choice.customizations.forEach((item) => {
                            if (item.customization.properties.customizationCode === "ATT-DTV-ABP") {
                                let filter = this.autoPay ? "ATT-DTV-ABP-YES" : "ATT-DTV-ABP-NO";
                                let newArray = [...JSON.parse(JSON.stringify(item.customization.choices))];
                                newArray.forEach((element, index) => {
                                    if (element.choice.properties.choiceCode !== filter) {
                                        newArray.splice(index, 1);
                                    }
                                });
                                item.choices = [...newArray];
                            }
                        });
                    }
                });
            }
        });
        callout.componentCustomizations = [...customizations];
        console.log(callout);
        const options = {};
        const params = {
            input: JSON.stringify(callout),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_ProviderCallouts",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                if (
                    response.result.IPResult.hasOwnProperty("paymentResponse") &&
                    response.result.IPResult.paymentResponse.message === "Success"
                ) {
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message: "Payment Approved"
                    });
                    let cards = callout.payment.cards[0];
                    delete callout.tab;
                    delete callout.payment;
                    this.dispatchEvent(event);
                    let info = {
                        cart: this.cart,
                        cardInfo: cards,
                        request: callout
                    };
                    const sendCartNextEvent = new CustomEvent("paymentinformationnext", {
                        detail: info
                    });
                    this.dispatchEvent(sendCartNextEvent);
                    this.loaderSpinner = false;
                } else {
                    let errorMessage;
                    if (
                        response.result.IPResult.hasOwnProperty("paymentResponse") &&
                        response.result.IPResult.paymentResponse.message === "Failure"
                    ) {
                        errorMessage = response.result.IPResult.paymentResponse.denialReason;
                    } else if (
                        response.result.IPResult.hasOwnProperty("result") &&
                        response.result.IPResult.result.hasOwnProperty("error") &&
                        response.result.IPResult.result.error.hasOwnProperty("provider") &&
                        response.result.IPResult.result.error.provider.hasOwnProperty("message")
                    ) {
                        errorMessage = `${response.result.IPResult.result.error.provider.message.message}. ${response.result.IPResult.result.error.provider.message.denialReason}`;
                    } else if (
                        response.result.IPResult.hasOwnProperty("result") &&
                        response.result.IPResult.result.hasOwnProperty("error") &&
                        response.result.IPResult.result.error.hasOwnProperty("message")
                    ) {
                        errorMessage = response.result.IPResult.result.error.message;
                    } else if (response.result.IPResult.hasOwnProperty("error")) {
                        errorMessage = response.result.IPResult.error;
                    }
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message:
                            errorMessage !== undefined
                                ? errorMessage
                                : "There was a problem during the Payment Process. Please try again."
                    });
                    this.dispatchEvent(event);
                    this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "Service unreachable. Please try again."
                });
                this.dispatchEvent(event);
            });
    }

    handleEmail(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        this.email = emailre.test(event.target.value) ? event.target.value : undefined;
        this.noEmail = this.email !== undefined ? false : true;
        this.autoPay = !this.noEmail;
        this.disableValidations();
    }

    returnCardType(type) {
        let cardType;
        switch (type) {
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
        return cardType;
    }

    hideData() {
        this.showPopup = false;
    }
}