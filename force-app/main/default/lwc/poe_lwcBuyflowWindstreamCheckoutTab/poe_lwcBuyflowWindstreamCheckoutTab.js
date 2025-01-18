import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import { NavigationMixin } from "lightning/navigation";
import windstreamURL from "@salesforce/label/c.windstreamUrl";
import autoPayVerbiage from "@salesforce/label/c.Windstream_AutoPay_Verbiage";
import autoPayHeader from "@salesforce/label/c.Windstream_AutoPay_Header";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import autoPaySurcharge from "@salesforce/label/c.Windstream_KineticSecure_AutoPay_Surcharge";
import getWindstreamVendorId from "@salesforce/apex/checkoutTabController.getWindstreamVendorId";
import Chuzo_Generic_Product_Error_Message from "@salesforce/label/c.Chuzo_Generic_Product_Error_Message";
import Windstream_checkout_message from "@salesforce/label/c.Windstream_checkout_message";
import Windstream_checkout_message_Billing_section from "@salesforce/label/c.Windstream_checkout_message_Billing_section";
import Message_checkout_declien_enroll_autopay from "@salesforce/label/c.Message_checkout_declien_enroll_autopay";
import Step_1_checkout_Windstream from "@salesforce/label/c.Step_1_checkout_Windstream";
import Step_2_checkout_Windstream from "@salesforce/label/c.Step_2_checkout_Windstream"; 
import windstreamSandboxURL from "@salesforce/label/c.windstreamSandboxURL"; 


export default class Poe_lwcBuyflowWindstreamCheckoutTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api cart;
    @api clientInfo;
    @api referenceNumber;
    @api origin;
    @api offerId;
    @api hasAutoPay;
    @api adderSelection;
    @api selectedBuyFlow;
    @api disclaimers;
    @api isGuestUser;
    @api decisionChanged;
    @api forcedAutoPay;
    @api preQualified;
    showCollateral = false;
    showAutoPayModal = false;
    isCallCenterOrigin;
    paymentNotApproved = true;
    baseURL = window.location.origin;
    paymentUrl;
    autoPayDecision;
    autoPayChanged = false;
    adderChangeSelection;
    cartInfo = {};
    showDisclaimer;
    loaderSpinner;
    autoPayDisclaimer = {
        agreeText: "Accept",
        cancelText: "Decline",
        description: autoPayVerbiage,
        header: autoPayHeader
    };
    disclaimer = [];
    showDisclaimerModal = false;
    modalLabel;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        autoPaySurcharge,
        windstreamURL,
        Chuzo_Generic_Product_Error_Message,
        Windstream_checkout_message,
        Windstream_checkout_message_Billing_section,
        Message_checkout_declien_enroll_autopay,
        Step_1_checkout_Windstream,
        Step_2_checkout_Windstream,
        windstreamSandboxURL
    };
    showSelfServiceCancelModal = false;
    vendorId;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    handleNext(e) {
        let info = {
            hasAutoPay: this.autoPayDecision,
            autoPayChanged: this.autoPayChanged,
            adderSelection: { ...this.adderChangeSelection },
            cart: { ...this.cartInfo }
        };
        const passedEvent = new CustomEvent("creditcardvalidated", {
            detail: info
        });
        this.dispatchEvent(passedEvent);
    }

    handleBack() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handlePaymentTab() {
        let pageId = this.cart.hasUpfront ? "1" : "2";
        if (
            this.baseURL.includes("sandbox") ||
            this.baseURL.includes("qa") ||
            this.baseURL.includes("uat") ||
            this.baseURL.includes("trainin")
        ) {
            this.paymentUrl =
                this.labels.windstreamSandboxURL +
                this.offerId +
                "&pageid=" +
                pageId +
                "&vendor=" +
                this.vendorId;
        } else {
            this.paymentUrl =
                this.labels.windstreamURL + this.offerId + "&pageid=" + pageId + "&vendor=" + this.vendorId;
        }
        window.open(this.paymentUrl, "_blank").focus();
    }

    connectedCallback() {
        this.loaderSpinner = true;
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        if (this.origin === "phonesales") {
            this.isCallCenterOrigin = true;
        }
        this.cartInfo = { ...this.cart };
        this.autoPayDecision = this.decisionChanged ? !this.hasAutoPay : this.hasAutoPay;
        this.adderChangeSelection = { ...this.adderSelection };
        if (!this.autoPayDecision && !this.cart.hasUpfront) {
            this.paymentNotApproved = false;
            this.showDisclaimer = true;
        }
        getWindstreamVendorId({})
            .then((response) => {
                console.log("Vendor ID Response", response);
                this.vendorId = response.result["windstreamSetting"][0].Windstream_Vendor_Id__c;
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.log(error);
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: this.labels.Chuzo_Generic_Product_Error_Message
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
            });
    }

    handlePaymentVerification() {
        this.loaderSpinner = true;
        const path = "payments/getConfirmation";
        let myData = {
            tab: "checkout",
            offerId: this.offerId,
            selectedBuyFlow: this.selectedBuyFlow,
            partnerName: "windstream",
            path
        };
        let apiResponse;
        console.log("Payment Confirmation Request", myData);
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let responseParsed = JSON.parse(response);
                console.log("Payment Confirmation Response", responseParsed);
                let statusCode = responseParsed.hasOwnProperty("error") ? responseParsed.error.code : undefined;
                if (statusCode === undefined || statusCode === "201" || statusCode === "200") {
                    if (
                        !this.hasAutoPay &&
                        responseParsed.paymentConfirmationInfo.autoPayConfirmationNumber !== null &&
                        responseParsed.paymentConfirmationInfo.autoPayConfirmationNumber !== undefined &&
                        responseParsed.paymentConfirmationInfo.autoPayConfirmationNumber !== ""
                    ) {
                        this.autoPayDecision = true;
                        let cart = { ...this.cartInfo };
                        let data = { ...JSON.parse(JSON.stringify(this.adderChangeSelection)) };
                        data.autoPay.forEach((e) => {
                            if (e.Id === "1263") {
                                e.isChecked = true;
                            } else {
                                e.isChecked = false;
                            }
                        });
                        this.adderChangeSelection = { ...data };
                        let monthlyAddersArray = [
                            ...data.installationAdders,
                            ...data.extenders,
                            ...data.rewards,
                            ...data.autoPay,
                            ...data.paperless,
                            ...data.others,
                            ...data.phone
                        ];
                        let monthlyCharges = [];
                        monthlyAddersArray.forEach((item) => {
                            if (item.isChecked) {
                                let newCharge = {
                                    name: item.Name,
                                    fee: Number(item.Price).toFixed(2),
                                    discount: Number(item.Price) > 0.0 ? false : true,
                                    hasDescription: false,
                                    description: "",
                                    type: "product"
                                };
                                monthlyCharges.push(newCharge);
                            }
                        });
                        cart.hasAdders = monthlyCharges.length > 0;
                        cart.addersCharges = [...monthlyCharges];
                        cart.addersTotal = 0.0;
                        cart.addersCharges.forEach((item) => {
                            cart.addersTotal = Number(Number(cart.addersTotal) + Number(item.fee)).toFixed(2);
                        });
                        this.cartInfo = { ...cart };
                    } else if (
                        this.cart.hasUpfront &&
                        this.hasAutoPay &&
                        (responseParsed.paymentConfirmationInfo.autoPayConfirmationNumber === null ||
                            responseParsed.paymentConfirmationInfo.autoPayConfirmationNumber === undefined ||
                            responseParsed.paymentConfirmationInfo.autoPayConfirmationNumber === "")
                    ) {
                        this.autoPayDecision = false;
                        let cart = { ...this.cartInfo };
                        let data = { ...JSON.parse(JSON.stringify(this.adderChangeSelection)) };
                        data.autoPay.forEach((e) => {
                            if (e.Id === "1263") {
                                e.isChecked = false;
                            } else {
                                e.isChecked = true;
                            }
                        });
                        this.adderChangeSelection = { ...data };
                        let monthlyAddersArray = [
                            ...data.installationAdders,
                            ...data.extenders,
                            ...data.rewards,
                            ...data.autoPay,
                            ...data.paperless,
                            ...data.others,
                            ...data.phone
                        ];
                        let monthlyCharges = [];
                        monthlyAddersArray.forEach((item) => {
                            if (item.isChecked) {
                                let newCharge = {
                                    name: item.Name,
                                    fee: Number(item.Price).toFixed(2),
                                    discount: Number(item.Price) > 0.0 ? false : true,
                                    hasDescription: false,
                                    description: "",
                                    type: "product"
                                };
                                monthlyCharges.push(newCharge);
                            }
                        });
                        cart.hasAdders = monthlyCharges.length > 0;
                        cart.addersCharges = [...monthlyCharges];
                        cart.addersTotal = 0.0;
                        cart.addersCharges.forEach((item) => {
                            cart.addersTotal = Number(Number(cart.addersTotal) + Number(item.fee)).toFixed(2);
                        });
                        this.cartInfo = { ...cart };
                    }
                    this.loaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message: "Payment Approved."
                    });
                    this.dispatchEvent(event);
                    this.paymentNotApproved = false;
                } else {
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: responseParsed.error.provider.message
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                    this.logError(
                        `${responseParsed.error.provider.message}\nAPI Response: ${response}`,
                        myData,
                        path,
                        "API Error"
                    );
                    if (!this.preQualified && !this.showDisclaimer && !this.forcedAutoPay && !this.cart.hasUpfront) {
                        this.showAutoPayModal = true;
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
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
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    handleCancel() {
        if (this.isGuestUser) {
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

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Checkout",
            component: "poe_lwcBuyflowWindstreamCheckoutTab",
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
            tab: "Checkout"
        };
        this.dispatchEvent(event);
    }

    handleModalClose() {
        this.showAutoPayModal = false;
    }

    handleAutopayRemoval() {
        this.showAutoPayModal = false;
        this.modalLabel = "Customer Accepts";
        let autoPayDecline = this.adderSelection.autoPay.filter((e) => e.Id === "1283")[0];
        let disclaimer = [];
        let item = {
            name: autoPayDecline.Name,
            number: autoPayDecline.Id,
            description: this.disclaimers.filter((d) => d.Name === autoPayDecline.disclaimerNumber)[0].Disclaimer__c
        };
        item.description.replace("â", "'");
        disclaimer.push(item);
        this.disclaimer = [...disclaimer];
        this.showDisclaimerModal = true;
    }

    handleCloseDisclaimer() {
        this.showDisclaimerModal = false;
    }

    handleAcceptDisclaimer() {
        let selections = JSON.parse(JSON.stringify(this.adderSelection));
        selections.autoPay.forEach((item) => {
            if (item.Id === "1283") {
                item.isChecked = true;
            } else {
                item.isChecked = false;
            }
        });
        this.adderSelection = { ...selections };
        this.calculateCart();
        this.autoPayDecision = false;
        this.paymentNotApproved = false;
        this.showDisclaimerModal = false;
        this.autoPayChanged = true;
        this.handleNext();
    }

    calculateCart() {
        let cart = { ...this.cartInfo };
        let monthlyAddersArray = [
            ...this.adderSelection.installationAdders,
            ...this.adderSelection.extenders,
            ...this.adderSelection.rewards,
            ...this.adderSelection.autoPay,
            ...this.adderSelection.paperless,
            ...this.adderSelection.others,
            ...this.adderSelection.phone
        ];
        let monthlyCharges = [];
        monthlyAddersArray.forEach((item) => {
            if (item.isChecked) {
                let newCharge = {
                    name: item.Name,
                    fee: Number(item.Price).toFixed(2),
                    discount: Number(item.Price) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "product"
                };
                if (item.Id === "2338") {
                    todayCharges.push(newCharge);
                } else {
                    monthlyCharges.push(newCharge);
                }
            }
        });
        cart.hasAdders = monthlyCharges.length > 0;
        cart.addersCharges = [...monthlyCharges];
        cart.addersTotal = 0.0;
        cart.addersCharges.forEach((item) => {
            cart.addersTotal = Number(Number(cart.addersTotal) + Number(item.fee)).toFixed(2);
        });
        this.cartInfo = { ...cart };
    }
}