import { LightningElement, track, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveCart from "@salesforce/apex/OrderConfirmationTabController.saveCart";
import saveOpportunityStage from "@salesforce/apex/InfoTabController.saveOpportunityStage";
import saveConfigurations from "@salesforce/apex/OrderConfirmationTabController.saveConfigurations";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import Order_Confirmation_Charges_Disclaimer from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import Todays_Charges_labels from  "@salesforce/label/c.Todays_Charges_labels";
import Todays_Total_plus_taxes_and_surcharges_labels from "@salesforce/label/c.Todays_Charges_labels";
import Windstream_One_Time_Payments_Charges from "@salesforce/label/c.Windstream_One_Time_Payments_Charges";
import One_Time_Payments_Total_plus_taxes_and_surcharges_labels from "@salesforce/label/c.One_Time_Payments_Total_plus_taxes_and_surcharges_labels";
import First_Months_Estimated_Bundle_Charges_labels from "@salesforce/label/c.First_Months_Estimated_Bundle_Charges_labels";
import Windstream_no_install_date_can_be_provided from "@salesforce/label/c.Windstream_no_install_date_can_be_provided";
import Estimated_First_Months_Total_plus_taxes_and_surcharges_lables from "@salesforce/label/c.Estimated_First_Months_Total_plus_taxes_and_surcharges_lables";
import First_Months_Estimated_Adders_Charges_labels from  "@salesforce/label/c.First_Months_Estimated_Adders_Charges_labels";
import Chuzo_Generic_Error_Message from "@salesforce/label/c.Chuzo_Generic_Error_Message";
import Windstream_the_order_can_not_be_activated from "@salesforce/label/c.Windstream_the_order_can_not_be_activated";
import Windstream_the_order_configuration_could_not_be_saved from "@salesforce/label/c.Windstream_the_order_configuration_could_not_be_saved";

export default class Poe_lwcBuyflowWindstreamOrderConfirmationTab extends NavigationMixin(LightningElement) {
    @api logo;
    @api recordId;
    @api cartInfo;
    @api calloutInfo;
    @api origin;
    @api userId;
    @api sfOrder;
    @api sfOrderItem;
    @api selectedBuyFlow;
    @api isGuestUser;
    @api noInstallation;

    estimatedFirstMonthTotal = 0;
    estimatedOneTimeTotal = 0;
    loaderSpinner;
    showCollateral = false;
    offerId;
    products = [];
    adders = [];
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        Order_Confirmation_Charges_Disclaimer,
        Todays_Charges_labels,
        Todays_Total_plus_taxes_and_surcharges_labels,
        Windstream_One_Time_Payments_Charges,
        One_Time_Payments_Total_plus_taxes_and_surcharges_labels,
        First_Months_Estimated_Bundle_Charges_labels,
        Windstream_no_install_date_can_be_provided,
        Estimated_First_Months_Total_plus_taxes_and_surcharges_lables,
        First_Months_Estimated_Adders_Charges_labels,
        Chuzo_Generic_Error_Message,
        Windstream_the_order_can_not_be_activated,
        Windstream_the_order_configuration_could_not_be_saved
    };
    showSelfServiceCancelModal = false;
    noInstallMessage =
       this.labels.Windstream_no_install_date_can_be_provided;

    get isNotGuestUser() {
        return !this.isGuestUser;
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

    connectedCallback() {
        this.loaderSpinner = true;
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        let info = JSON.parse(JSON.stringify(this.calloutInfo));
        this.phone = info.customer.phoneNumber;
        this.offerId = info.offerId;
        this.loaderSpinner = false;
    }

    handleClick() {
        this.loaderSpinner = true;
        let call = JSON.parse(JSON.stringify(this.calloutInfo));
        call.path = "orders";
        call.partnerName = "windstream";
        call.customer.phoneNumber = this.phone;
        call.selectedBuyFlow = this.selectedBuyFlow;
        console.log("Orders Request", call);
        let apiResponse;
        callEndpoint({ inputMap: call })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                console.log("Orders Response: ", response);
                let statusCode = response.hasOwnProperty("info") ? response.info?.statusCode : undefined;

                if (response.error === "Read timed out") {
                    statusCode = "timeout";
                } else if (response.error?.code) {
                    statusCode = response.error.code;
                }

                if (
                    statusCode === undefined ||
                    statusCode === "201" ||
                    statusCode === "200" ||
                    (response.hasOwnProperty("confirmationNumber") &&
                        response.confirmationNumber !== null &&
                        response.confirmationNumber !== undefined &&
                        response.confirmationNumber !== "") ||
                    (response.hasOwnProperty("orderNumber") &&
                        response.orderNumber !== null &&
                        response.orderNumber !== undefined &&
                        response.orderNumber !== "")
                ) {
                    let orderId = response.orderId;
                    let serviceReference = response.serviceReference;
                    let orderNumber =
                        response.hasOwnProperty("confirmationNumber") &&
                        response.confirmationNumber !== null &&
                        response.confirmationNumber !== undefined &&
                        response.confirmationNumber !== ""
                            ? response.confirmationNumber
                            : response.orderNumber;
                    let transactionId = response.sessionId;
                    let accountNumber = response.accountNumber;
                    let installationDate =
                        response.installationDate !== undefined
                            ? response.installationDate
                            : call.installationDetails.date;
                    let myData = {
                        ContextId: this.recordId,
                        orderId: orderId,
                        orderNumber: orderNumber,
                        transactionId: transactionId,
                        accountNumber: accountNumber,
                        installationDate: installationDate,
                        earliestDate: call.earliestDate,
                        serviceReference: serviceReference
                    };
                    this.updateOrder(myData);
                } else {
                    const errorMessage =
                        statusCode === "timeout"
                            ? "Read timed out"
                            : response.hasOwnProperty("error") &&
                              response.error.hasOwnProperty("provider") &&
                              response.error.provider.hasOwnProperty("message")
                            ? response.error.provider.message
                            : "The Order could not be confirmed by the Provider.";
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, call, call.path, "API Error");
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    this.labels.Chuzo_Generic_Error_Message;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, call, call.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    updateOrder(info) {
        let cart = { ...this.cartInfo };
        let totalFee = Number(cart.todayTotal) + Number(cart.addersTotal) + Number(cart.bundlesTotal);
        let myData = {
            orderItemId: this.sfOrderItem,
            fee: totalFee
        };
        saveCart({ myData: myData })
            .then((response) => {
                console.log(response);
                this.confirmOrder(info);
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: this.labels.Windstream_the_order_can_not_be_activated
                });
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    confirmOrder(info) {
        saveOpportunityStage({ myData: info })
            .then((response) => {
                console.log("save opp stage: ", response);
                this.saveConfigurations(info);
            })
            .catch((error) => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: this.labels.Windstream_the_order_can_not_be_activated
                });
                console.log(error);
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    saveConfigurations(info) {
        let cart = { ...this.cartInfo };
        let configurations = [];
        let todayArray = [];
        let addersArray = [];
        let bundlesArray = [];
        if (cart.hasToday) {
            todayArray = [...JSON.parse(JSON.stringify(cart.todayCharges))];
            todayArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: item.fee,
                    type: "Today"
                };
                configurations.push(config);
            });
        }
        if (cart.hasAdders) {
            addersArray = [...JSON.parse(JSON.stringify(cart.addersCharges))];
            addersArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: item.fee,
                    type: "Monthly"
                };
                configurations.push(config);
            });
        }
        if (cart.hasBundles) {
            bundlesArray = [...JSON.parse(JSON.stringify(cart.bundlesCharges))];
            bundlesArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: item.fee,
                    type: "Monthly"
                };
                configurations.push(config);
            });
        }
        let myData = {
            orderId: this.sfOrder,
            Configurations: configurations
        };
        saveConfigurations({ myData: myData })
            .then((response) => {
                console.log("configurations: ", response);
                if (this.isGuestUser) {
                    this.nextTab(info);
                } else {
                    this.saveTracker(info);
                }
            })
            .catch((error) => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: this.labels.Windstream_the_order_configuration_could_not_be_saved
                });
                console.log(error);
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    saveTracker(myData) {
        let setClickerMethod;
        switch (this.origin) {
            case "retail":
                setClickerMethod = setClickerRetailTrack;
                break;
            case "event":
                setClickerMethod = setClickerEventTrack;
                break;
            case "phonesales":
                setClickerMethod = setClickerCallCenterTrack;
                break;
            default:
                return this.nextTab(myData);
        }

        const trackerData = {
            userId: this.userId,
            operation: "setTrack",
            isCount: true,
            action: "Buyflow Completed"
        };

        setClickerMethod({ myData: trackerData })
            .then((response) => {
                this.nextTab(myData);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    nextTab(myData) {
        this.loaderSpinner = false;
        const sendOrderConfirmationNextEvent = new CustomEvent("orderconfirmationnext", {
            detail: myData
        });
        this.dispatchEvent(sendOrderConfirmationNextEvent);
        this.loaderSpinner = false;
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Order Confirmation",
            component: "poe_lwcBuyflowWindstreamOrderConfirmationTab",
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
            tab: "Order Confirmation"
        };
        this.dispatchEvent(event);
    }
}