import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";

export default class Poe_lwcSelfServiceDirecTVOptionsTab extends NavigationMixin(LightningElement) {
    @api logo;
    @api cartInfo;
    @api orderInfo;
    @api clientInfo;
    @api recordId;
    @api origin;
    @api stream;
    @api verifiedEmail;
    @api returnUrl;
    @api verbiages;
    @api isGuestUser;

    callInformation;
    email;
    address;
    pin;
    pinValidated = false;
    addressOptions = [
        {
            label: "Yes",
            value: "true"
        },
        { label: "No", value: "false" }
    ];
    loaderSpinner;
    showCollateral;
    pinEmails;
    disableNext = true;

    get emailIsVerified() {
        return (
            this.pinValidated ||
            (this.pinEmails?.email &&
                this.pinEmails.email === this.verifiedEmail &&
                this.pinEmails.confirmEmail &&
                this.pinEmails.confirmEmail === this.verifiedEmail)
        );
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get iconFormPassword() {
        return chuzoSiteResources + "/images/icon-security.svg";
    }

    get nextBtnDesktopClass() {
        return `btn-rounded btn-center hide-mobile ${this.disableNext && "btn-disabled"}`;
    }

    get nextBtnMobileClass() {
        return `btn-rounded btn-center ${this.disableNext && "btn-disabled"}`;
    }

    handleBack() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.pinValidated = false;
        this.email = this.verifiedEmail ? this.verifiedEmail : this.clientInfo?.contactInfo.email;
        this.callInformation = {
            partnerName: this.orderInfo.partnerName,
            systemCode: this.orderInfo.systemCode,
            correlationId: this.orderInfo.correlationId,
            dealerCorpId: this.orderInfo.dealerCorpId,
            dealerId: this.orderInfo.dealerId,
            dealerAgentId: this.orderInfo.dealerAgentId,
            dealerLocation: this.orderInfo.dealerLocation,
            uuid: this.orderInfo.uuid,
            sid: this.orderInfo.sid,
            salesChannelName: "ENGA-Chuzo",
            accountId: this.email,
            customer: {
                firstName: this.clientInfo.contactInfo.firstName,
                lastName: this.clientInfo.contactInfo.lastName
            },
            account: {
                contactEmail: this.email
            }
        };

        this.address = `${this.orderInfo?.address.addressLine1}, ${this.orderInfo?.address.city}, ${this.orderInfo?.address.state} ${this.orderInfo?.address.zipCode}`;
    }

    handleNext() {
        this.loaderSpinner = true;
        this.callShippingInfo();
    }

    callShippingInfo() {
        this.loaderSpinner = true;
        const path = "shippingInfo";
        let myData = {
            path,
            ...this.callInformation
        };
        console.log("shippingInfo Request : ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("shippingInfo Response : ", responseParsed);
                let status = responseParsed?.content?.status;
                if (status?.toLowerCase() === "success") {
                    this.callShippingMethod(responseParsed);
                } else {
                    this.loaderSpinner = false;
                    let errorMessage = responseParsed?.content?.response?.shippingInfo?.errors[0]?.message;
                    const genericErrorMessage = "There was a problem with your request. Please try again.";
                    const finalErrorMessage = errorMessage || genericErrorMessage;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: finalErrorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${finalErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
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

    callShippingMethod(shippingInfoResponse) {
        this.loaderSpinner = true;
        const path = "shippingMethod";
        let myData = {
            path,
            ...this.callInformation,
            address: {
                addressLine1: this.orderInfo.address.addressLine2
                    ? this.orderInfo.address.addressLine1 + " " + this.orderInfo.address.addressLine2
                    : this.orderInfo.address.addressLine1,
                city: this.orderInfo.address.city,
                state: this.orderInfo.address.state,
                zipCode: this.orderInfo.address.zipCode
            },
            shippingInfo: {
                shippingId:
                    shippingInfoResponse?.content?.response?.shippingInfo?.content?.DTVNOW?.eligibleShippingMethods[0]
                        ?.id,
                lobType:
                    shippingInfoResponse?.content?.response?.shippingInfo?.content?.DTVNOW?.eligibleShippingMethods[0]
                        ?.lobType,
                shippingMethodType:
                    shippingInfoResponse?.content?.response?.shippingInfo?.content?.DTVNOW?.eligibleShippingMethods[0]
                        ?.shippingMethod
            }
        };
        console.log("shippingMethod Request:", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                let status = responseParsed?.content?.status;
                console.log("shippingMethod Response: ", responseParsed);
                if (status?.toLowerCase() === "success") {
                    let shippingAddress = {
                        addressLine1: this.orderInfo.address.addressLine1,
                        addressLine2: this.orderInfo.address.addressLine2,
                        city: this.orderInfo.address.city,
                        state: this.orderInfo.address.state,
                        zipCode: this.orderInfo.address.zipCode,
                        country: "USA"
                    };

                    let info = {
                        shippingAddress: shippingAddress,
                        pin: this.pin,
                        verifiedEmail:
                            this.pinEmails?.email && this.pinValidated ? this.pinEmails.email : this.verifiedEmail
                    };
                    const sendCartNextEvent = new CustomEvent("next", {
                        detail: info
                    });
                    this.loaderSpinner = false;
                    this.dispatchEvent(sendCartNextEvent);
                } else {
                    this.loaderSpinner = false;
                    let errorMessage = responseParsed?.error?.provider?.message?.errorDescription;
                    const genericErrorMessage = "There was a problem with your request. Please try again.";
                    const finalErrorMessage = errorMessage || genericErrorMessage;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: finalErrorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${finalErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
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

    handlePinValidation(event) {
        this.pinValidated = event.detail.pinValidated;
        this.callInformation = { ...event.detail.callInformation };
        this.pin = event.detail.hasOwnProperty("pin") ? event.detail.pin : undefined;
        this.disableValidations();
    }

    handleEmailChange(event) {
        this.pinEmails = event.detail;
        this.disableValidations();
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Options",
            component: "poe_lwcSelfServiceDirecTvOptionsTab",
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

    disableValidations() {
        this.disableNext = !this.emailIsVerified;
    }
}