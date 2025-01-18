import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import ToastContainer from "lightning/toastContainer";
import sendValidationEmail from "@salesforce/apex/SecurityInfoTabController.sendValidationEmail";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";

export default class Poe_lwcBuyflowDirecTvEngaSecurityInfo extends NavigationMixin(LightningElement) {
    @api logo;
    @api callInformation;
    @api cartInfo;
    @api orderInfo;
    @api clientInfo;
    @api origin;
    @api stream;
    @api returnUrl;
    @api isGuestUser;
    loaderSpinner = false;
    isEventOrD2D = false;
    confirmationEmail;
    email;
    noEmail = true;
    noEqualEmail = false;
    pin;
    receivedPin;
    pinValidated = false;
    pinSent = false;
    cantValidatePin = true;
    showEmailValidation = false;
    selectedValue = "paper";
    radioOptions = [
        {
            label: "Email",
            value: "email"
        },
        {
            label: "Paper",
            value: "paper"
        }
    ];
    data = {
        passcode: "",
        passcodeConfirmation: ""
    };
    noCompleteInfo = true;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage
    };
    showSelfServiceCancelModal = false;

    get notPinValidated() {
        return !this.pinValidated;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        this.isEventOrD2D = this.origin == "maps" || this.origin == "event";
        this.address = `${this.orderInfo.address.addressLine1}, ${this.orderInfo.address.city}, ${this.orderInfo.address.state} ${this.orderInfo.address.zipCode}`;
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
        }
        this.disableValidations();
        input.reportValidity();
    }

    disableValidations() {
        const valuesArray = Object.values(this.data);
        const samePasscode = this.data.passcode === this.data.passcodeConfirmation;
        this.noCompleteInfo = !(
            (this.pinValidated || !this.showEmailValidation) &&
            valuesArray.every((item) => item) & samePasscode
        );
    }

    handleClick() {
        this.loaderSpinner = true;
        const path = "accountSetUp";
        let myData = {
            path,
            ...this.orderInfo,
            accountSetUp: {
                id: "ACQ_1",
                passcode: btoa(this.data.passcode),
                rePasscode: btoa(this.data.passcodeConfirmation)
            }
        };
        console.log("Security Information Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                this.serviceabilityCallout = {};
                let result = JSON.parse(response);
                console.log("Security Information Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
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
                } else {
                    let billingAddress;
                    let shippingAddress;
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
                    let info = {
                        shippingAddress: shippingAddress,
                        billingAddress: billingAddress
                    };
                    const sendCartNextEvent = new CustomEvent("optionsnext", {
                        detail: info
                    });
                    this.dispatchEvent(sendCartNextEvent);
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.serviceabilityCallout = {};
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
            });
    }

    handleDataChange(event) {
        if (event.target.name == "radioGroup") {
            this.selectedValue = event.target.value;
            this.showEmailValidation = this.selectedValue == "email";
            if (this.showEmailValidation) {
                this.email = this.clientInfo.contactInfo.email;
            }
            this.disableValidations();
        } else {
            this.data[event.target.name] = event.target.value;
        }
    }

    handleEmailChange(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        switch (event.target.name) {
            case "email":
                this.email = event.target.value !== undefined ? event.target.value.trim() : undefined;
                break;
            case "confirmationEmail":
                this.confirmationEmail = event.target.value !== undefined ? event.target.value.trim() : undefined;
                break;
        }
        this.noEmail = !this.confirmationEmail;
        if (
            this.confirmationEmail === this.email &&
            this.confirmationEmail !== undefined &&
            this.email !== undefined &&
            emailre.test(this.email) &&
            emailre.test(this.confirmationEmail)
        ) {
            this.noEmail = false;
            this.noEqualEmail = false;
        } else {
            this.noEmail = true;
            if (
                this.email !== this.confirmationEmail &&
                this.email !== undefined &&
                this.confirmationEmail !== undefined
            ) {
                this.noEqualEmail = true;
            } else {
                this.noEqualEmail = false;
            }
        }
    }
    handlePINInput(event) {
        this.pin = event.target.value.length == "6" ? event.target.value : undefined;
        this.cantValidatePin = this.pin !== undefined ? false : true;
    }
    sendPin() {
        this.loaderSpinner = true;
        let myData = {
            emailAddress: this.email,
            contactName: this.clientInfo.contactInfo.firstName + " " + this.clientInfo.contactInfo.lastName
        };
        sendValidationEmail({ myData: myData })
            .then((response) => {
                console.log(response);
                const event = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    message: "A PIN number was sent to the corresponding e-mail."
                });
                this.dispatchEvent(event);
                this.pinSent = true;
                this.receivedPin = response.result.pincode;
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message:
                        error.message !== undefined
                            ? error.message
                            : "There was a problem sending the PIN. Please try again."
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    validatePin() {
        this.pinValidated = this.pin === this.receivedPin;
        this.cantValidatePin = true;
        if (this.pinValidated) {
            const event = new ShowToastEvent({
                title: "Success",
                variant: "success",
                message: "PIN was validated."
            });
            this.dispatchEvent(event);
        } else {
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                message: "Invalid PIN"
            });
            this.dispatchEvent(event);
        }
        this.disableValidations();
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
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

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Options",
            component: "poe_lwcBuyflowDirecTvEngaSecurityInfo",
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
            tab: "Options"
        };
        this.dispatchEvent(event);
    }
}