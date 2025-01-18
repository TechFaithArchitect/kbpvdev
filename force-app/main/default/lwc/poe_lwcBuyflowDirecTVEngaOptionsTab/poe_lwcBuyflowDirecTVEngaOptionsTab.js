import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";

const STATE_OPTIONS = [
    { label: "Alabama", value: "AL" },
    { label: "Alaska", value: "AK" },
    { label: "Arizona", value: "AZ" },
    { label: "Arkansas", value: "AR" },
    { label: "California", value: "CA" },
    { label: "Colorado", value: "CO" },
    { label: "Connecticut", value: "CT" },
    { label: "Delaware", value: "DE" },
    { label: "District of Columbia", value: "DC" },
    { label: "Florida", value: "FL" },
    { label: "Georgia", value: "GA" },
    { label: "Hawaii", value: "HI" },
    { label: "Idaho", value: "ID" },
    { label: "Illinois", value: "IL" },
    { label: "Indiana", value: "IN" },
    { label: "Iowa", value: "IA" },
    { label: "Kansas", value: "KS" },
    { label: "Kentucky", value: "KY" },
    { label: "Louisiana", value: "LA" },
    { label: "Maine", value: "ME" },
    { label: "Maryland", value: "MD" },
    { label: "Massachusetts", value: "MA" },
    { label: "Michigan", value: "MI" },
    { label: "Minnesota", value: "MN" },
    { label: "Mississippi", value: "MS" },
    { label: "Missouri", value: "MO" },
    { label: "Montana", value: "MT" },
    { label: "Nebraska", value: "NE" },
    { label: "Nevada", value: "NV" },
    { label: "New Hampshire", value: "NH" },
    { label: "New Jersey", value: "NJ" },
    { label: "New Mexico", value: "NM" },
    { label: "New York", value: "NY" },
    { label: "North Carolina", value: "NC" },
    { label: "North Dakota", value: "ND" },
    { label: "Ohio", value: "OH" },
    { label: "Oklahoma", value: "OK" },
    { label: "Oregon", value: "OR" },
    { label: "Pennsylvania", value: "PA" },
    { label: "Rhode Island", value: "RI" },
    { label: "South Carolina", value: "SC" },
    { label: "South Dakota", value: "SD" },
    { label: "Tennessee", value: "TN" },
    { label: "Texas", value: "TX" },
    { label: "Utah", value: "UT" },
    { label: "Vermont", value: "VT" },
    { label: "Virginia", value: "VA" },
    { label: "Washington", value: "WA" },
    { label: "West Virginia", value: "WV" },
    { label: "Wisconsin", value: "WI" },
    { label: "Wyoming", value: "WY" }
];

export default class Poe_lwcBuyflowDirecTVEngaOptionsTab extends NavigationMixin(LightningElement) {
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
    sameBilling;
    sameShipping;
    billingComplete;
    shippingComplete;
    shippingAddress;
    shippingApt;
    shippingZip;
    shippingCity;
    shippingState;
    billingAddress;
    billingApt;
    billingZip;
    billingCity;
    billingState;
    shipConfirm;
    showBilling = false;
    states = STATE_OPTIONS;
    showShipping = false;
    noCompleteInfo = true;
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
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage
    };
    showSelfServiceCancelModal = false;

    get emailIsVerified() {
        return (
            this.pinValidated ||
            (this.pinEmails?.email &&
                this.pinEmails.email === this.verifiedEmail &&
                this.pinEmails.confirmEmail &&
                this.pinEmails.confirmEmail === this.verifiedEmail)
        );
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleRadio(event) {
        if (event.target.name === "shipping") {
            this.sameShipping = event.target.value;
        } else {
            this.sameBilling = event.target.value;
        }
        this.showBilling = this.sameBilling === "false";
        this.showShipping = this.sameShipping === "false";
        this.disableValidations();
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        this.noCompleteInfo = true;
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

    handleChange(event) {
        if (event.detail.hasOwnProperty("checked")) {
            this.shipConfirm = event.detail.checked;
        } else {
            this[event.target.name] = event.detail.value !== "" ? event.detail.value : undefined;
        }

        this.shippingComplete =
            this.shippingCity !== undefined &&
            this.shippingAddress !== undefined &&
            this.shippingState !== undefined &&
            this.shippingZip !== undefined &&
            this.shipConfirm
                ? true
                : false;
        this.billingComplete =
            this.billingCity !== undefined &&
            this.billingAddress !== undefined &&
            this.billingState !== undefined &&
            this.billingZip !== undefined
                ? true
                : false;
        this.disableValidations();
    }

    disableValidations() {
        if (
            this.emailIsVerified &&
            (this.sameBilling === "true" || (this.sameBilling == "false" && this.billingComplete)) &&
            (this.sameShipping === "true" || (this.sameShipping == "false" && this.shippingComplete))
        ) {
            this.noCompleteInfo = false;
        } else {
            this.noCompleteInfo = true;
        }
    }

    handleClick() {
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
                addressLine1: !this.showShipping
                    ? this.orderInfo.address.addressLine2
                        ? this.orderInfo.address.addressLine1 + " " + this.orderInfo.address.addressLine2
                        : this.orderInfo.address.addressLine1
                    : this.shippingApt
                    ? this.shippingAddress + " " + this.shippingApt
                    : this.shippingAddress,
                city: !this.showShipping ? this.orderInfo.address.city : this.shippingCity,
                state: !this.showShipping ? this.orderInfo.address.state : this.shippingState,
                zipCode: !this.showShipping ? this.orderInfo.address.zipCode : this.shippingZip
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
                    let billingAddress;
                    let shippingAddress;
                    if (this.sameBilling === "true") {
                        billingAddress = {
                            addressLine1: this.orderInfo.address.addressLine1,
                            addressLine2: this.orderInfo.address.addressLine2,
                            city: this.orderInfo.address.city,
                            state: this.orderInfo.address.state,
                            zipCode: this.orderInfo.address.zipCode,
                            country: "USA"
                        };
                    } else {
                        billingAddress = {
                            addressLine1: this.billingAddress,
                            addressLine2: this.billingApt,
                            city: this.billingCity,
                            state: this.billingState,
                            zipCode: this.billingZip,
                            country: "USA"
                        };
                    }
                    if (this.sameShipping === "true") {
                        shippingAddress = {
                            addressLine1: this.orderInfo.address.addressLine1,
                            addressLine2: this.orderInfo.address.addressLine2,
                            city: this.orderInfo.address.city,
                            state: this.orderInfo.address.state,
                            zipCode: this.orderInfo.address.zipCode,
                            country: "USA"
                        };
                    } else {
                        shippingAddress = {
                            addressLine1: this.shippingAddress,
                            addressLine2: this.shippingApt,
                            city: this.shippingCity,
                            state: this.shippingState,
                            zipCode: this.shippingZip,
                            country: "USA"
                        };
                    }
                    let info = {
                        billingAddress: billingAddress,
                        shippingAddress: shippingAddress,
                        pin: this.pin,
                        verifiedEmail:
                            this.pinEmails?.email && this.pinValidated ? this.pinEmails.email : this.verifiedEmail
                    };
                    const sendCartNextEvent = new CustomEvent("optionsnext", {
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
            component: "poe_lwcBuyflowDirecTvEngaOptionsTab",
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