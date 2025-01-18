import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";

export default class Poe_lwcBuyflowDirecTVEmailValidation extends LightningElement {
    @api email;
    @api disclaimers;
    @api callInformation;
    @api origin;
    @api stream;
    isD2DorEvent = false;
    pin;
    confirmEmail;
    pinValidated = false;
    pinSent = false;
    noEmail = true;
    cantValidatePin = true;
    loaderSpinner = false;
    noEqualEmail = false;
    showModal = false;
    showDeclinePaperless = false;

    connectedCallback() {
        this._actionUtil = new OmniscriptActionCommonUtil();
        this.isD2DorEvent = this.origin == "maps" || this.origin == "event";
        this.showDeclinePaperless = this.isD2DorEvent && !this.stream;
    }

    handleChangeEmail(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        switch (event.target.name) {
            case "email":
                this.email = emailre.test(event.target.value) ? event.target.value : undefined;
                break;
            case "confirmemail":
                this.confirmEmail = emailre.test(event.target.value) ? event.target.value : undefined;
                break;
        }
        if (this.confirmEmail === this.email && this.confirmEmail !== undefined && this.email !== undefined) {
            this.noEmail = false;
            this.noEqualEmail = false;
        } else {
            this.noEmail = true;
            if (this.email !== this.confirmEmail && this.email !== undefined && this.confirmEmail !== undefined) {
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
        let customer = JSON.parse(JSON.stringify(this.callInformation.customer));
        let calloutInformation = {
            tab: "pin-send",
            partnerName: "directv",
            partnerOrderNumber: this.callInformation.partnerOrderNumber,
            productType: this.callInformation.productType,
            dealerCode: this.callInformation.dealerCode,
            customerType: this.callInformation.customerType,
            customer: customer,
            account: {
                contactEmail: this.email
            }
        };
        console.log(this.callInformation);
        console.log(calloutInformation);
        const options = {};
        const params = {
            input: JSON.stringify(calloutInformation),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_ProviderCallouts",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                if (
                    response.result.IPResult.hasOwnProperty("response") &&
                    response.result.IPResult.response.status === "SUCCESS"
                ) {
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message: "A PIN number was sent to the corresponding e-mail."
                    });
                    this.dispatchEvent(event);
                    this.pinSent = true;
                } else {
                    let errorMessage;
                    if (
                        response.result.IPResult.hasOwnProperty("result") &&
                        response.result.IPResult.result.hasOwnProperty("error") &&
                        response.result.IPResult.result.error.hasOwnProperty("provider") &&
                        response.result.IPResult.result.error.provider.hasOwnProperty("message")
                    ) {
                        errorMessage = response.result.IPResult.result.error.provider.message.hasOwnProperty(
                            "errorMessage"
                        )
                            ? response.result.IPResult.result.error.provider.message.errorMessage
                            : response.result.IPResult.result.error.provider.message;
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
                                : "There was a problem sending the PIN. Please try again."
                    });
                    this.dispatchEvent(event);
                }
                this.loaderSpinner = false;
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

    validatePin() {
        this.loaderSpinner = true;
        let customer = JSON.parse(JSON.stringify(this.callInformation.customer));
        let calloutInformation = {
            tab: "pin-validate",
            partnerName: "directv",
            partnerOrderNumber: this.callInformation.partnerOrderNumber,
            productType: this.callInformation.productType,
            dealerCode: this.callInformation.dealerCode,
            customerType: this.callInformation.customerType,
            customer: customer,
            account: {
                contactEmail: this.email,
                pin: this.pin
            }
        };
        const options = {};
        const params = {
            input: JSON.stringify(calloutInformation),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_ProviderCallouts",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                if (
                    response.result.IPResult.hasOwnProperty("response") &&
                    response.result.IPResult.response.status === "SUCCESS"
                ) {
                    if (this.stream) {
                        this.createUser();
                    } else {
                        let info = {
                            pinValidated: true,
                            pin: this.pin
                        };
                        const sendPinValidation = new CustomEvent("pinvalidation", {
                            detail: info
                        });
                        this.dispatchEvent(sendPinValidation);
                    }
                } else {
                    let errorMessage;
                    if (
                        response.result.IPResult.hasOwnProperty("result") &&
                        response.result.IPResult.result.hasOwnProperty("error") &&
                        response.result.IPResult.result.error.hasOwnProperty("provider") &&
                        response.result.IPResult.result.error.provider.hasOwnProperty("message")
                    ) {
                        errorMessage = response.result.IPResult.result.error.provider.message.errorMessage;
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
                                : "There was a problem validating the PIN. Please try again."
                    });
                    this.dispatchEvent(event);
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

    createUser() {
        this.loaderSpinner = true;
        let customer = JSON.parse(JSON.stringify(this.callInformation.customer));
        let calloutInformation = {
            tab: "pin-create",
            partnerName: "directv",
            partnerOrderNumber: this.callInformation.partnerOrderNumber,
            productType: this.callInformation.productType,
            dealerCode: this.callInformation.dealerCode,
            customerType: this.callInformation.customerType,
            customer: customer,
            account: {
                contactEmail: this.email,
                verifiedEmail: "Y"
            }
        };
        const options = {};
        const params = {
            input: JSON.stringify(calloutInformation),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_ProviderCallouts",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                if (
                    response.result.IPResult.hasOwnProperty("response") &&
                    response.result.IPResult.response.success === "true"
                ) {
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message: "PIN was validated."
                    });
                    this.dispatchEvent(event);
                    let info = {
                        pinValidated: true,
                        pin: this.pin
                    };
                    const sendPinValidation = new CustomEvent("pinvalidation", {
                        detail: info
                    });
                    this.dispatchEvent(sendPinValidation);
                } else {
                    let errorMessage;
                    if (
                        response.result.IPResult.hasOwnProperty("result") &&
                        response.result.IPResult.result.hasOwnProperty("error") &&
                        response.result.IPResult.result.error.hasOwnProperty("provider") &&
                        response.result.IPResult.result.error.provider.hasOwnProperty("message")
                    ) {
                        errorMessage = response.result.IPResult.result.error.provider.message.errorMessage;
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
                                : "There was a problem validating the PIN. Please try again."
                    });
                    this.dispatchEvent(event);
                }
                this.loaderSpinner = false;
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

    showDisclaimerModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    handleContinueModal() {
        this.pinValidated = true;
        this.noEmail = true;
        this.showDeclinePaperless = false;
        this.showModal = false;

        let info = {
            pinValidated: true,
            noValidation: true
        };
        const sendPinValidation = new CustomEvent("pinvalidation", {
            detail: info
        });
        this.dispatchEvent(sendPinValidation);
    }
}