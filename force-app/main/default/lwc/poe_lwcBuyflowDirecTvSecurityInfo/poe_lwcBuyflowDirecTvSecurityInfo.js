import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
import { NavigationMixin } from "lightning/navigation";

export default class Poe_lwcBuyflowDirecTvSecurityInfo extends NavigationMixin(LightningElement) {
    @api logo;
    @api callInformation;
    @api cartInfo;
    @api orderInfo;
    @api origin;
    @api stream;
    @api returnUrl;
    loaderSpinner = false;
    confirmationEmail;
    data = {
        passcode: "",
        passcodeConfirmation: "",
        securityQuestion: "",
        securityAnswer: "",
        securityAnswerConfirmation: "",
        phoneNumber: "",
        email: ""
    };
    noCompleteInfo = true;
    noEmail = true;
    pin;
    pinValidated = false;
    securityQuestionOptions = [
        {
            label: "Who is your favorite actor?",
            value: "1"
        },
        {
            label: "Who is your favorite childhood hero?",
            value: "2"
        },
        {
            label: "What is your favorite restaurant?",
            value: "3"
        },
        {
            label: "Who is your favorite singer?",
            value: "4"
        }
    ];
    showEmailValidation = false;

    connectedCallback() {
        this._actionUtil = new OmniscriptActionCommonUtil();
        this.data.email = this.callInformation.customer.emailAddress;
        this.data.phoneNumber = this.callInformation.customer.phoneNumber;
        this.address = `${this.callInformation.address.addressLine1}, ${this.callInformation.address.city}, ${this.callInformation.address.state} ${this.callInformation.address.zipCode}`;
    }

    checkInputValidity(event) {
        const inputName = event.target.name;
        const input = this.template.querySelector(`.${inputName}`);
        switch (inputName) {
            case "passcode":
                if (this.data.passcodeConfirmation) {
                    this.template.querySelector(".passcodeConfirmation").focus();
                    this.template.querySelector(".passcodeConfirmation").blur();
                }
                break;
            case "passcodeConfirmation":
                if (this.data.passcode !== this.data.passcodeConfirmation && input.checkValidity()) {
                    input.setCustomValidity("Passcodes don't match.");
                }
                if (this.data.passcode === this.data.passcodeConfirmation) {
                    input.setCustomValidity("");
                }
                break;
            case "securityAnswer":
                if (this.data.securityAnswerConfirmation) {
                    this.template.querySelector(".securityAnswerConfirmation").focus();
                    this.template.querySelector(".securityAnswerConfirmation").blur();
                }
                break;
            case "securityAnswerConfirmation":
                if (this.data.securityAnswer === this.data.securityAnswerConfirmation) {
                    input.setCustomValidity("");
                } else {
                    input.setCustomValidity("Security answers don't match.");
                }
                break;
        }
        this.disableValidations();
        input.reportValidity();
    }

    disableValidations() {
        const valuesArray = Object.values(this.data);
        const sameSecurityAnswer = this.data.securityAnswer === this.data.securityAnswerConfirmation;
        const samePasscode = this.data.passcode === this.data.passcodeConfirmation;
        this.noCompleteInfo = !(
            (this.pinValidated || !this.showEmailValidation) &&
            valuesArray.every((item) => item) &&
            sameSecurityAnswer & samePasscode
        );
    }

    handleClick() {
        let billingAddress;
        let shippingAddress;
        let securityVerification;
        billingAddress = {
            addressLine1: this.orderInfo.address.addressLine1,
            addressLine2: this.orderInfo.address.addressLine2,
            city: this.orderInfo.address.city,
            state: this.orderInfo.address.state,
            zipCode: this.orderInfo.address.zipCode,
            country: "USA"
        };
        shippingAddress = {
            addressLine1: this.orderInfo.address.addressLine1,
            addressLine2: this.orderInfo.address.addressLine2,
            city: this.orderInfo.address.city,
            state: this.orderInfo.address.state,
            zipCode: this.orderInfo.address.zipCode,
            country: "USA"
        };
        securityVerification = {
            pin: this.data.passcode,
            securityQuestion: this.securityQuestionOptions.find(
                (element) => element.value === this.data.securityQuestion
            ).label,
            securityAnswer: this.data.securityAnswer
        };
        console.log(securityVerification);
        let info = {
            shippingAddress: shippingAddress,
            billingAddress: billingAddress,
            securityVerification: securityVerification
        };
        const sendCartNextEvent = new CustomEvent("optionsnext", {
            detail: info
        });
        this.dispatchEvent(sendCartNextEvent);
    }

    handleDataChange(event) {
        this.data[event.target.name] = event.target.value;
    }

    handleEmailChange(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        switch (event.target.name) {
            case "email":
                this.data.email = emailre.test(event.target.value) ? event.target.value : undefined;
                break;
            case "confirmationEmail":
                this.confirmationEmail = emailre.test(event.target.value) ? event.target.value : undefined;
                break;
        }
        this.noEmail = !this.confirmationEmail;
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleSecurityQuestionChange(event) {
        this.data.securityQuestion = event.detail.value;
    }

    handleCancel() {
        if(this.returnUrl != undefined) {
            window.open(this.returnUrl, '_self');
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
}