import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { loadStyle } from "lightning/platformResourceLoader";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveCart from "@salesforce/apex/OrderConfirmationTabController.saveCart";
import saveOpportunityStage from "@salesforce/apex/InfoTabController.saveOpportunityStage";
import saveConfigurations from "@salesforce/apex/OrderConfirmationTabController.saveConfigurations";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import TERMS_ERROR from "@salesforce/label/c.Frontier_Terms_Error";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import chuzo_modalGeneric from "c/chuzo_modalGeneric";
import CLOSE_BUTTON_LABEL from "@salesforce/label/c.Close_Button_Label";
import NEXT_BUTTON_LABEL from "@salesforce/label/c.Next_Button_Label";

export default class Poe_lwcSelfServiceFrontierTermsTab extends LightningElement {
    @api logo;
    @api recordId;
    @api origin;
    @api quoteId;
    @api accountId;
    @api terms;
    @api userId;
    @api cartInfo;
    @api orderItemId;
    @api sfOrderId;
    @api installationDate;
    @api earliestDate;
    @api frontierUserId;
    @api isGuestUser;
    @api customerTN;
    @api quoteNumber;

    loaderSpinner;
    showCollateral = false;
    noCompleteInformation = true;
    orderNumber;
    tpvNumber;
    tpvDisclaimer;
    orderId;
    showCreditCheckQuoteAssistanceModal;
    labels = {};
    showSelfServiceCancelModal = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get checkboxAgreementMessage() {
        return this.isGuestUser ? "I agree" : "Customer agrees";
    }

    get nextButtonClass() {
        return "btn-rounded btn-center hide-mobile";
    }

    get nextButtonClassMobile() {
        return "btn-rounded btn-center";
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

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");

        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        this.loaderSpinner = true;
        console.log(this.terms);
        this.getJson();
    }

    getJson() {
        let items = [];
        let i = 0;
        let hasTPV = false;
        this.terms.forEach((term) => {
            i = i + 1;
            let t = {
                value: Object.values(term.assistedUrl)[0],
                isChecked: false,
                id: term.GUID
            };
            if (term.name !== "E911TOS" && term.name !== "TPV") {
                items.push(t);
            } else {
                hasTPV = true;
            }
        });
        if (items.length === 0) {
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: TERMS_ERROR
            });
            this.dispatchEvent(event);
            this.loaderSpinner = false;
            return;
        }
        if ((!hasTPV && items.length === this.terms.length) || (hasTPV && items.length === this.terms.length - 1)) {
            this.generateOptions(items);
        }
    }

    generateOptions(items) {
        this.termsOptions = [...items];
        this.loaderSpinner = false;
    }

    handleChange(e) {
        this.termsOptions.forEach((item) => {
            if (item.id === e.target.name) {
                item.isChecked = e.target.checked;
            }
        });
        this.noCompleteInformation = !this.termsOptions.every((item) => item.isChecked);
    }

    handleClick() {
        this.loaderSpinner = true;
        let terms = [...this.termsOptions];
        terms.forEach((term) => (term.isChecked = true));
        this.termsOptions = [...terms];
        let acceptedTerms = [];
        this.terms.forEach((item) => {
            acceptedTerms.push(JSON.parse(JSON.stringify(item)));
        });
        acceptedTerms.forEach((term) => (term.status = "ACCEPT"));
        const path = "payments";
        let myData = {
            partnerName: "frapi",
            path,
            billPreview: "done",
            acceptDisclosures: [...acceptedTerms],
            tpvTransfer: "",
            quoteId: this.quoteId,
            accountUuid: this.accountId,
            userId: this.frontierUserId
        };
        console.log("Checkout Request:", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                console.log("Checkout Response", response);
                let error =
                    (response.hasOwnProperty("error") &&
                        response.error.hasOwnProperty("provider") &&
                        response.error.provider.hasOwnProperty("message")) ||
                    response.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage =
                        response.hasOwnProperty("error") &&
                        response.error.hasOwnProperty("provider") &&
                        response.error.provider.hasOwnProperty("message")
                            ? response.error.provider.message
                            : response.error;
                    if (errorMessage.includes("Declined")) {
                        errorMessage = "Credit Card not authorized. Payment was declined.";
                    }
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${res}`, myData, path, "API Error");
                } else {
                    if (response.orderStatus === "Submitted") {
                        this.orderId = response.orderReference;
                        let data = {
                            orderId: this.orderId
                        };
                        this.updateOrder(data);
                    } else if (response.hasOwnProperty("e911-tos")) {
                        this.loaderSpinner = false;
                        this.tpvNumber = response.tpvPhoneNumber;
                        this.tpvDisclaimer = response["e911-tos"];
                        this.handleTPVModal();
                    } else {
                        this.loaderSpinner = false;
                        let errorMessage =
                            "The Order could not be submitted. Please, verify the information and try again.";
                        const event = new ShowToastEvent({
                            title: "Error",
                            variant: "error",
                            mode: "sticky",
                            message: errorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(errorMessage);
                    }
                }
            })
            .catch((error) => {
                console.log(error);
                const errMsg = error.body?.message || error.message;
                if (apiResponse) {
                    this.logError(`${errMsg}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    this.logError(errMsg);
                }
                this.loaderSpinner = false;
            });
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleTPVModal() {
        chuzo_modalGeneric
            .open({
                content: {
                    title: "TPV Validation",
                    provider: "frontier",
                    body: `<p>TPV Phone Number: ${this.tpvNumber}</p>
                       <p>${this.tpvDisclaimer}</p>
                       <p>Click on the 'Next' button after the TPV Verification is done.</p>`,
                    agreeLabel: NEXT_BUTTON_LABEL,
                    cancelLabel: CLOSE_BUTTON_LABEL,
                    canClose: true
                }
            })
            .then((result) => {
                if (!result?.agreed) {
                    return;
                }

                this.handleNextTPV();
            });
    }

    handleNextTPV() {
        this.loaderSpinner = true;
        let acceptedTerms = [];
        this.terms.forEach((item) => {
            acceptedTerms.push(JSON.parse(JSON.stringify(item)));
        });
        acceptedTerms.forEach((term) => (term.status = "ACCEPT"));
        const path = "payments";
        let myData = {
            partnerName: "frapi",
            path,
            billPreview: "done",
            acceptDisclosures: [...acceptedTerms],
            tpvTransfer: "done",
            quoteId: this.quoteId,
            accountUuid: this.accountId,
            userId: this.frontierUserId
        };
        console.log("Confirm Terms Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                console.log("Confirm Terms Response", response);
                let error =
                    (response.hasOwnProperty("result") &&
                        response.result.hasOwnProperty("error") &&
                        response.result.error.hasOwnProperty("provider") &&
                        response.result.error.provider.hasOwnProperty("message")) ||
                    response.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage = response.hasOwnProperty("error")
                        ? response.error
                        : response.result.error.provider.message;
                    if (errorMessage.includes("Declined")) {
                        errorMessage = "Credit Card not authorized. Payment was declined.";
                    }
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${res}`, myData, path, "API Error");
                } else {
                    if (response.orderStatus === "Submitted") {
                        this.orderId = response.orderReference;
                        let data = {
                            orderId: this.orderId
                        };
                        this.updateOrder(data);
                    } else if (response.hasOwnProperty("e911-tos")) {
                        this.tpvNumber = response.tpvPhoneNumber;
                        this.tpvDisclaimer = response["e911-tos"];
                        this.handleTPVModal();
                        this.loaderSpinner = false;
                    } else {
                        let errorMessage =
                            "The Order could not be submitted. Please, verify the information and try again.";
                        const event = new ShowToastEvent({
                            title: "Error",
                            variant: "error",
                            mode: "sticky",
                            message: errorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(errorMessage);
                        this.loaderSpinner = false;
                    }
                }
            })
            .catch((error) => {
                console.log(error);
                const errMsg = error.body?.message || error.message;
                if (apiResponse) {
                    this.logError(`${errMsg}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    this.logError(errMsg);
                }
                this.loaderSpinner = false;
            });
    }

    handleShowCCQuoteAssistanceModal() {
        this.showCreditCheckQuoteAssistanceModal = true;
    }

    handleCloseCCQuoteAssistanceModal() {
        this.showCreditCheckQuoteAssistanceModal = false;
    }

    updateOrder(info) {
        let cart = { ...JSON.parse(JSON.stringify(this.cartInfo)) };
        let totalFee =
            Number(cart.hasOwnProperty("firstBillTotal") ? cart.firstBillTotal : 0) +
            Number(cart.monthlyTotal) +
            Number(cart.hasOwnProperty("todayTotal") ? cart.todayTotal : 0);
        let myData = {
            orderItemId: this.orderItemId,
            fee: totalFee
        };
        console.log("Save Cart Request", myData);
        saveCart({ myData: myData })
            .then((response) => {
                console.log("Save Cart Response", response);
                this.getInstallationType(info);
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The order could not be activated. Please verify the information"
                });
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    confirmOrder(info) {
        let myData = {
            ContextId: this.recordId,
            orderId: info.quoteNumber,
            orderNumber: this.orderNumber,
            transactionId: "",
            accountNumber: info.btn,
            installationDate: this.installationDate,
            earliestDate: this.earliestDate,
            serviceReference: ""
        };
        console.log("Save Opportunity Request", myData);
        saveOpportunityStage({ myData: myData })
            .then((response) => {
                console.log("Save Opportunity Response", response);
                this.saveConfigurations(info);
            })
            .catch((error) => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The order could not be activated. Please verify the information"
                });
                console.log(error);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    saveConfigurations(info) {
        let cart = { ...JSON.parse(JSON.stringify(this.cartInfo)) };
        let configurations = [];
        let monthlyArray = [];

        if (cart.hasMonthly) {
            monthlyArray = JSON.parse(JSON.stringify(cart.monthlyCharges));
            monthlyArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: item.fee,
                    type: "Monthly"
                };
                configurations.push(config);
            });
        }
        let myData = {
            orderId: this.sfOrderId,
            Configurations: configurations
        };
        console.log("Save Configurations Request", myData);
        saveConfigurations({ myData: myData })
            .then((response) => {
                console.log("Save Configurations Response", response);
                this.saveTracker(info);
            })
            .catch((error) => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The order configurations could not be saved. Please verify the information"
                });
                console.log(error);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    saveTracker(info) {
        let trackerData = {
            userId: this.userId,
            operation: "setTrack",
            isCount: true,
            action: "Buyflow Completed"
        };
        if (this.origin === "retail") {
            setClickerRetailTrack({ myData: trackerData })
                .then((response) => {
                    const closeModalEvent = new CustomEvent("next", {
                        detail: info
                    });
                    this.dispatchEvent(closeModalEvent);
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "The order could not be activated. Please verify the information"
                    });
                    console.log(error);
                    this.logError(error.body?.message || error.message);
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "event") {
            setClickerEventTrack({ myData: trackerData })
                .then((response) => {
                    const closeModalEvent = new CustomEvent("next", {
                        detail: info
                    });
                    this.dispatchEvent(closeModalEvent);
                })
                .catch((error) => {
                    console.log(error);
                    console.error(error, "ERROR");
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "The order could not be activated. Please verify the information"
                    });
                    console.log(error);
                    this.logError(error.body?.message || error.message);
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "phonesales") {
            setClickerCallCenterTrack({ myData: trackerData })
                .then((response) => {
                    const closeModalEvent = new CustomEvent("next", {
                        detail: info
                    });
                    this.dispatchEvent(closeModalEvent);
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "The order could not be activated. Please verify the information"
                    });
                    console.log(error);
                    this.logError(error.body?.message || error.message);
                    this.loaderSpinner = false;
                });
        } else {
            const closeModalEvent = new CustomEvent("next", {
                detail: info
            });
            this.dispatchEvent(closeModalEvent);
        }
    }

    getInstallationType(info) {
        const path = "quoteStatus";
        let myData = {
            path,
            partnerName: "frapi",
            quoteId: this.quoteId,
            userId: this.frontierUserId
        };
        console.log("Get Installation Type Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                console.log("Get Installation Type Response", response);
                info.installationType = response.productSummary.installationType;
                info.quoteNumber = response.quoteNumber;
                info.btn = response.customer.customerTN;
                if (response.serviceCase.billingOrderNumber.length > 0) {
                    this.orderNumber =
                        response.serviceCase.billingOrderNumber[0].orderNumber +
                        response.serviceCase.billingOrderNumber[0].environmentCode;
                    info.orderNumber = this.orderNumber;
                    this.confirmOrder(info);
                } else {
                    setTimeout(() => {
                        this.getInstallationType(info);
                    }, 5000);
                }
            })
            .catch((error) => {
                console.log(error);
                const errMsg = error.body?.message || error.message;
                if (apiResponse) {
                    this.logError(`${errMsg}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    this.logError(errMsg);
                }
                this.loaderSpinner = false;
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "T&C",
            component: "poe_lwcBuyflowFrontierTermsTab",
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
            tab: "T&C"
        };
        this.dispatchEvent(event);
    }
}