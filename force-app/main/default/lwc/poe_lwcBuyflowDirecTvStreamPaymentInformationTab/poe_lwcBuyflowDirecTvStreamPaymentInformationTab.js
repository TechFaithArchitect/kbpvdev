import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";

export default class Poe_lwcBuyflowDirecTvStreamPaymentInformationMock extends NavigationMixin(LightningElement) {
    @api todayCharges;
    @api orderInfo;
    @api recordId;
    @api cartInfo;
    @api logo;
    @api orderRequest;
    @api origin;
    @api paymentAttempts;
    @api returnUrl;
    isNonCallcenter = false;
    agreementPayment = false;
    noCompleteInformation = true;
    loaderSpinner;
    firstName;
    lastName;
    zip;
    cvv;
    ccNumber;
    type;
    attempts;
    ccTypes = [];
    years = [];
    months = [];
    showCollateral = false;
    disclosureAgreement = "I have read the above disclosures to the customer, and the customer agreed";
    paymentTClabel = this.disclosureAgreement + " to the Payment Authorization Terms and Conditions";
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

    connectedCallback() {
        this.cart = { ...this.cartInfo };
        this.attemptByProgram = 0;
        this.loaderSpinner = true;
        this.attempts = this.paymentAttempts;
        this._actionUtil = new OmniscriptActionCommonUtil();
        this.firstName = this.orderInfo.customer.firstName;
        this.lastName = this.orderInfo.customer.lastName;
        this.zip = this.orderInfo.address.zipCode;
        let year = new Date().getFullYear();
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
                        name: "DIRECTV Via Internet Sales Tax",
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

    handlePrevious() {
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
                this.firstName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "lastName":
                this.lastName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "type":
                this.type = event.target.value !== "" ? event.target.value : undefined;
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
        let callout = { ...this.orderRequest };
        callout.customer = JSON.parse(JSON.stringify(callout.customer));
        console.log(callout);
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
                    amount: this.todayCharges.totalAmount,
                    payType: ""
                }
            ]
        };
        callout.tab = "payment";
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
                    this.dispatchEvent(event);
                    let cards = callout.payment.cards[0];
                    delete callout.tab;
                    delete callout.payment;
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

    handleAgreement(event) {
        this.agreementPayment = event.target.checked;
        this.disableValidations();
    }
}