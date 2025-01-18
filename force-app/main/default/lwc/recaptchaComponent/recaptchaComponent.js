import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import verifyRecaptcha from "@salesforce/apex/RecaptchaController.validateCaptcha";

export default class RecaptchaComponent extends LightningElement {
    recaptchaResponse;
    verificationResult;
    captchaVerifiedListener;
    captchaExpiredListener;
    hasRendered = false;

    connectedCallback() {
        const toastContainer = ToastContainer.instance();
        toastContainer.maxShown = 5;
        toastContainer.toastPosition = "top-center";

        this.captchaVerifiedListener = (e) => {
            e.stopImmediatePropagation();
            this.recaptchaResponse = e.detail.response;
            this.doSubmit();
        }
        document.addEventListener("grecaptchaVerified", this.captchaVerifiedListener);

        this.captchaExpiredListener = () => {
            this.verificationResult = false;
            this.fireEvent();
        };
        document.addEventListener("grecaptchaExpired", this.captchaExpiredListener);
    }

    disconnectedCallback() {
        document.removeEventListener("grecaptchaVerified", this.captchaVerifiedListener);
        document.removeEventListener("grecaptchaExpired", this.captchaExpiredListener);
    }

    renderedCallback() {
        if (!this.hasRendered) {
            var divElement = this.template.querySelector("div.recaptchaCheckbox");
            var payload = { element: divElement, badge: "bottomright" };
            document.dispatchEvent(new CustomEvent("grecaptchaRender", { detail: payload }));
            this.hasRendered = true;    
        }
    }

    doSubmit() {
        let data = {
            recaptchaResponse: this.recaptchaResponse
        };
        let apiResponse;
        verifyRecaptcha(data)
            .then((response) => {
                apiResponse = response;
                this.verificationResult = response.success;
                if (!this.verificationResult) {
                    let message = response.hasOwnProperty("error-codes") ? response["error-codes"][0] : undefined;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: message
                    });
                    this.dispatchEvent(event);
                    this.logError(`${message}\nAPI Response: ${apiResponse}`, data, "recaptcha", "API Error");
                }
                this.fireEvent();
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
                    this.logError(
                        `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                        data,
                        "recaptcha",
                        "API Error"
                    );
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.loaderSpinner = false;
            });
    }

    fireEvent() {
        const captchaEvent = new CustomEvent("captcha", {
            detail: {
                result: this.verificationResult
            }
        });
        this.dispatchEvent(captchaEvent);
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            component: "RecaptchaComponent",
            error: errorMessage ? JSON.stringify(errorMessage) : errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }
}