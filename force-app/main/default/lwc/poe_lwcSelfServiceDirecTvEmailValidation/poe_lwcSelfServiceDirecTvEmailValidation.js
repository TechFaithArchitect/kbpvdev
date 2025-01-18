import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";
import ToastContainer from "lightning/toastContainer";

export default class Poe_lwcSelfServiceDirecTvEmailValidation extends LightningElement {
    @api email;
    @api verifiedEmail;
    @api verbiages;
    @api callInformation;
    @api origin;
    @api stream;
    @api isGuestUser;
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
        return !this.isD2DorEvent && !this.isGuestUser;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get pinNotValidated() {
        return !this.pinValidated;
    }

    get iconFormPassword() {
        return chuzoSiteResources + "/images/icon-security.svg";
    }

    connectedCallback() {
        console.log("VERBIAGES", this.verbiages);
        console.log("Call information", this.callInformation);
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
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
            emailre.test(this.confirmEmail) &&
            emailre.test(this.email)
        ) {
            this.noEmail = false;
            this.noEqualEmail = false;
        } else {
            this.noEmail = true;
            this.noEqualEmail = this.email !== this.confirmEmail && this.email && this.confirmEmail;
        }
        const button = this.template.querySelector('[data-id="next"]');
        const reSendButton = this.template.querySelector('[data-id="resend"]');
        if (this.noEmail) {
            if (reSendButton !== null) {
                reSendButton.classList.add("btn-disabled");
            }
            if (button !== null) {
                button.classList.add("btn-disabled");
            }
        } else {
            if (reSendButton !== null) {
                reSendButton.classList.remove("btn-disabled");
            }
            if (button !== null) {
                button.classList.remove("btn-disabled");
            }
        }
    }

    handlePINInput(event) {
        const pinRegex = /[0-9]{6}/;
        this.pin = pinRegex.test(event.target.value) ? event.target.value : undefined;
        this.cantValidatePin = !this.pin;
        const button = this.template.querySelector('[data-id="validate"]');
        if (this.cantValidatePin) {
            button.classList.add("btn-disabled");
        } else {
            button.classList.remove("btn-disabled");
        }
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