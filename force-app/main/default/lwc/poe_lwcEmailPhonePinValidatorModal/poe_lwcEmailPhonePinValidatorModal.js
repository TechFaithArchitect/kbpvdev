import { LightningElement, api } from "lwc";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";

export default class Poe_lwcEmailPhonePinValidatorModal extends LightningElement {
    @api isEmail = false;
    @api email;
    @api phoneNumber;
    @api selectedBuyFlow;
    @api offerId;
    pinSent = false;
    pinNumber;
    pinNumberAPI;
    showErrorModal = false;
    loaderSpinner = false;
    success = false;

    get inputLabel() {
        let base = this.isEmail ? "Email" : "SMS";

        return `${base} Verification Code`;
    }

    get modalBody() {
        let base = this.isEmail ? "Email" : "SMS";

        return `${base} verification code not verified. Please review, make applicable changes and resubmit.`;
    }

    get successMessage() {
        let base = this.isEmail ? "Email" : "SMS";

        return `${base} verification code match: Success`;
    }

    connectedCallback() {
        this.loaderSpinner = true;
        const path = "sendPin";
        let customerData;
        if (this.isEmail) {
            customerData = {
                emailAddress: this.email
            };
        } else {
            customerData = {
                phoneNumber: this.phoneNumber
            };
        }

        let calloutData = {
            path,
            httpMethod: "POST",
            offerId: this.offerId,
            partnerName: "windstream",
            tab: "creditcheck",
            selectedBuyFlow: this.selectedBuyFlow,
            customer: customerData
        };

        console.log("Send Pin Request", calloutData);
        let apiResponse;
        callEndpoint({ inputMap: calloutData })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                if (
                    (response.hasOwnProperty("error") &&
                        response.error.hasOwnProperty("provider") &&
                        response.error.provider.hasOwnProperty("message")) ||
                    (response.hasOwnProperty("error") && response.error.hasOwnProperty("message")) ||
                    response.hasOwnProperty("error")
                ) {
                    this.loaderSpinner = false;
                    let errorMessage;
                    if (
                        response.hasOwnProperty("error") &&
                        response.error.hasOwnProperty("provider") &&
                        response.error.provider.hasOwnProperty("message")
                    ) {
                        if (response.error.provider.message.hasOwnProperty("message")) {
                            errorMessage = response.error.provider.message.message;
                        } else {
                            errorMessage = response.error.provider.message;
                        }
                    } else if (response.hasOwnProperty("error") && response.error.hasOwnProperty("message")) {
                        errorMessage = response.error.message;
                    } else if (response.hasOwnProperty("error")) {
                        errorMessage = response.error;
                    }
                    const finalErrorMessage =
                        errorMessage !== undefined
                            ? errorMessage
                            : "The Product request could not be made correctly to the server. Please, try again.";
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: finalErrorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${finalErrorMessage}\nAPI Response: ${res}`, calloutData, path, "API Error");
                } else {
                    if (
                        response.hasOwnProperty("verificationCode") &&
                        response.verificationCode !== undefined &&
                        response.verificationCode !== null
                    ) {
                        this.loaderSpinner = false;
                        this.pinNumberAPI = response.verificationCode;
                        this.pinSent = true;
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
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    handleChange(event) {
        this.pinNumber = event.detail.value;
    }

    handleConfirm() {
        if (this.pinNumber == this.pinNumberAPI) {
            this.success = true;
            let info = {
                pinValidated: true,
                pinValue: this.pinNumber
            };
            const closeModalEvent = new CustomEvent("confirm", {
                detail: {
                    ...info
                }
            });
            this.dispatchEvent(closeModalEvent);
        } else {
            this.showErrorModal = true;
        }
    }

    handleClose() {
        const closeModalEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleCloseModal() {
        this.showErrorModal = false;
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Credit Check",
            component: "poe_lwcBuyflowFrontierCreditCheckScorePModal",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }
}