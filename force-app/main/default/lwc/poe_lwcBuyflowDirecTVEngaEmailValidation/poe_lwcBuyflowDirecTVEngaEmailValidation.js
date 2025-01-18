import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";

export default class Poe_lwcBuyflowDirecTVEngaEmailValidation extends LightningElement {
    @api email;
    @api verifiedEmail;
    @api verbiages;
    @api callInformation;
    @api origin;
    @api stream;
    callbackToken;
    streamEmailValidationVerbiage;
    streamCreateAccountVerbiage;
    newCallInfo;
    isD2DorEvent = false;
    pin;
    confirmEmail;
    pinValidated = false;
    pinSent = false;
    noEmail = true;
    cantValidatePin = true;
    loaderSpinner = false;
    noEqualEmail = false;

    get isNotD2DorEvent() {
        return !this.isD2DorEvent;
    }

    get pinNotValidated() {
        return !this.pinValidated;
    }

    connectedCallback() {
        this.streamEmailValidationVerbiage = String(this.verbiages.streamEmailValidation);
        this.streamCreateAccountVerbiage = String(this.verbiages.streamCreateAccount);
        this.isD2DorEvent = this.origin == "maps" || this.origin == "event";
        this.newCallInfo = JSON.parse(JSON.stringify(this.callInformation));
        if (this.verifiedEmail) {
            this.confirmEmail = this.verifiedEmail;
            this.handleChangeEmail({ target: { name: "email", value: this.verifiedEmail } });
        }
    }

    handleChangeEmail(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        switch (event.target.name) {
            case "email":
                this.email = event.target.value !== undefined ? event.target.value.trim() : undefined;
                break;
            case "confirmemail":
                this.confirmEmail = event.target.value !== undefined ? event.target.value.trim() : undefined;
                break;
        }

        this.dispatchEvent(
            new CustomEvent("emailchange", {
                detail: {
                    email: this.email,
                    confirmEmail: this.confirmEmail
                }
            })
        );

        if (
            this.confirmEmail === this.email &&
            this.confirmEmail !== undefined &&
            this.email !== undefined &&
            emailre.test(this.email) &&
            emailre.test(this.confirmEmail)
        ) {
            this.noEmail = false;
            this.noEqualEmail = false;
        } else {
            this.noEmail = true;
            this.noEqualEmail = this.email !== this.confirmEmail && this.email && this.confirmEmail;
        }
    }

    handlePINInput(event) {
        this.pin = event.target.value.length == "6" ? event.target.value : undefined;
        this.cantValidatePin = this.pin !== undefined ? false : true;
    }

    sendPin() {
        this.loaderSpinner = true;
        this.newCallInfo.accountId = this.email;
        this.newCallInfo.account.contactEmail = this.email;
        const path = "sendPin";
        let myData = {
            path,
            ...this.newCallInfo
        };

        console.log("Send Pin Request :", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Send Pin Response :", responseParsed);
                if (responseParsed?.appStatusMsg == "SUCCESS") {
                    this.callbackToken = responseParsed.callbackToken;
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message: "A PIN number was sent to the corresponding e-mail."
                    });
                    this.dispatchEvent(event);
                    this.pinSent = true;
                } else {
                    let responseErrorMessage =
                        responseParsed?.error?.provider?.message?.errorDescription || responseParsed?.appStatusMsg;
                    const errorMessage =
                        responseErrorMessage !== undefined
                            ? responseErrorMessage
                            : "There was a problem sending the PIN. Please try again.";
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                }
                this.loaderSpinner = false;
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
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    validatePin() {
        this.loaderSpinner = true;
        const path = "validatePin";
        let myData = {
            path,
            securityCode: this.pin,
            callbackToken: this.callbackToken,
            ...this.newCallInfo
        };
        console.log("validatePin Request: ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("validatePin Response: ", responseParsed);
                if (responseParsed?.appStatusMsg == "SUCCESS") {
                    this.callbackToken = responseParsed.callbackToken;
                    this.createUser();
                } else {
                    let responseErrorMessage =
                        responseParsed?.error?.provider?.message?.errorDescription || responseParsed?.appStatusMsg;
                    const errorMessage =
                        responseErrorMessage !== undefined
                            ? responseErrorMessage
                            : "There was a problem validating the PIN. Please try again.";
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
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
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    createUser() {
        this.loaderSpinner = true;
        const path = "createUserId";
        let myData = {
            path,
            callbackToken: this.callbackToken,
            ...this.newCallInfo
        };
        console.log("createUserId Request :", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("createUserId response :", responseParsed);
                if (responseParsed?.accessIdResponse?.content?.status == "Success") {
                    this.pinValidated = true;
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message: "PIN was validated."
                    });
                    this.dispatchEvent(event);
                    let info = {
                        pinValidated: true,
                        callInformation: this.newCallInfo,
                        pin: this.pin
                    };
                    const sendPinValidation = new CustomEvent("pinvalidation", {
                        detail: info
                    });
                    this.dispatchEvent(sendPinValidation);
                } else {
                    let responseErrorMessage =
                        responseParsed?.error?.provider?.message?.errorDescription || responseParsed?.appStatusMsg;
                    const errorMessage =
                        responseErrorMessage !== undefined
                            ? responseErrorMessage
                            : "There was a problem validating the PIN. Please try again.";
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                }
                this.loaderSpinner = false;
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
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Options",
            component: "poe_lwcBuyflowDirecTvEngaEmailValidation",
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
            tab: "Options"
        };
        this.dispatchEvent(event);
    }
}