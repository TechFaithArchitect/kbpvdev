import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveCartDTV from "@salesforce/apex/OrderConfirmationTabController.saveCart";
import saveConfigurations from "@salesforce/apex/OrderConfirmationTabController.saveConfigurations";
import saveOpportunityStage from "@salesforce/apex/InfoTabController.saveOpportunityStage";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import updateWorkOrderId from "@salesforce/apex/OrderConfirmationTabController.updateWorkOrderId";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import Thank_you_for_your_Order from "@salesforce/label/c.Thank_you_for_your_Order";
import Self_Service_Order_Confirmation_Modal_Title from "@salesforce/label/c.Self_Service_Order_Confirmation_Modal_Title";
import Account_Number_label from "@salesforce/label/c.Account_Number_label";
import one_time_upfron_payment from "@salesforce/label/c.one_time_upfron_payment";
import Payment_Method from "@salesforce/label/c.Payment_Method";
import Credit_Card_Section_Title from "@salesforce/label/c.Credit_Card_Section_Title";
import Name_on_Card_Field_Label from "@salesforce/label/c.Name_on_Card_Field_Label"; 
import Expiration_Date from "@salesforce/label/c.Expiration_Date";
import Postal_Code from "@salesforce/label/c.Postal_Code";
import Recurring_Payment_Information from "@salesforce/label/c.Recurring_Payment_Information";
import Bank_Routing_Number from "@salesforce/label/c.Bank_Routing_Number";
import Account_Surname from "@salesforce/label/c.Account_Surname"; 
import Bank_Account_Number from "@salesforce/label/c.Bank_Account_Number";
import Customer_Information from  "@salesforce/label/c.Customer_Information";
import Credit_Check_Contact_Information_Section_Title from "@salesforce/label/c.Credit_Check_Contact_Information_Section_Title";
import Service_Address_Title from "@salesforce/label/c.Service_Address_Title"; 
import Credit_Check_Billing_Address_Section_Title from "@salesforce/label/c.Credit_Check_Billing_Address_Section_Title";
import Credit_Check_Shipping_Address_Section_Title from "@salesforce/label/c.Credit_Check_Shipping_Address_Section_Title";
import Plan_Detail from "@salesforce/label/c.Plan_Detail";
import Plus_taxes_and_surcharges from "@salesforce/label/c.Plus_taxes_and_surcharges";
import the_request_could_not_be_made_correctly from "@salesforce/label/c.the_request_could_not_be_made_correctly";
import Windstream_the_order_can_not_be_activated from "@salesforce/label/c.Windstream_the_order_can_not_be_activated";
import Windstream_the_order_configuration_could_not_be_saved from "@salesforce/label/c.Windstream_the_order_configuration_could_not_be_saved"; 

export default class Poe_lwcBuyflowViasatOrderConfirmationTab extends NavigationMixin(LightningElement) {
    @api logo;
    @api recordId;
    @api cartInfo;
    @api calloutInfo;
    @api origin;
    @api userId;
    @api sfOrderId;
    @api sfOrderItemId;
    @api isGuestUser;
    loaderSpinner;
    showCollateral = false;
    product = {};
    hasRecurrent;
    ccRecurringLastDigits;
    ccRecurringName;
    ccRecurringMethod;
    ccRecurringZip;
    ccRecurringExpDate;
    hasRecurrentCard;
    hasRecurrentACH;
    hasUpfront;
    ccUpfrontLastDigits;
    ccUpfrontName;
    ccUpfrontMethod;
    ccUpfrontZip;
    ccUpfrontExpDate;
    orderId;
    externalWorkOrderId;
    internalWorkOrderId;
    step = 1;
    disableNext = true;
    orderComplete;
    calloutError;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        Thank_you_for_your_Order,
        Self_Service_Order_Confirmation_Modal_Title,
        Account_Number_label,
        one_time_upfron_payment,
        Payment_Method,
        Credit_Card_Section_Title,
        Name_on_Card_Field_Label,
        Expiration_Date,
        Postal_Code,
        Recurring_Payment_Information,
        Bank_Routing_Number,
        Account_Surname,
        Bank_Account_Number,
        Customer_Information,
        Credit_Check_Contact_Information_Section_Title,
        Service_Address_Title,
        Credit_Check_Billing_Address_Section_Title,
        Credit_Check_Shipping_Address_Section_Title,
        Plan_Detail,
        Plus_taxes_and_surcharges,
        the_request_could_not_be_made_correctly,
        Windstream_the_order_can_not_be_activated,
        Windstream_the_order_configuration_could_not_be_saved
    };
    showSelfServiceCancelModal = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get orderNotComplete() {
        return !this.orderComplete;
    }

    get nextLabel() {
        return this.isGuestUser ? 'Next' : 'Complete Order';
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
        this.calloutInfo == undefined ? (this.calloutInfo = this.calloutInfoMock) : this.calloutInfo;
        this.cartInfo == undefined ? (this.cartInfo = this.cartInfoMock) : this.cartInfo;
        this.product = { ...this.calloutInfo.productSelected };
        this.hasUpfront = this.calloutInfo.payment.upfront.hasOwnProperty("cards");
        if (this.calloutInfo.payment.upfront.hasOwnProperty("cards")) {
            let data = this.calloutInfo.payment.upfront.cards[0];
            this.ccUpfrontLastDigits = data.cardNumber;
            this.ccUpfrontName = data.firstName + " " + data.lastName;
            this.ccUpfrontMethod = "Credit Card";
            this.ccUpfrontZip = data.zipCode;
            this.ccUpfrontExpDate = String(data.cardExpMonth + "/" + data.cardExpYear);
        }
        this.hasRecurrent =
            this.calloutInfo.payment.recurrent.hasOwnProperty("cards") ||
            this.calloutInfo.payment.recurrent.hasOwnProperty("ach");
        if (this.calloutInfo.payment.recurrent.hasOwnProperty("cards")) {
            this.hasRecurrentCard = true;
            let data = this.calloutInfo.payment.recurrent.cards[0];
            this.ccRecurringLastDigits = data.cardNumber;
            this.ccRecurringName = data.firstName + " " + data.lastName;
            this.ccRecurringMethod = "Credit Card";
            this.ccRecurringZip = data.zipCode;
            this.ccRecurringExpDate = String(data.cardExpMonth + "/" + data.cardExpYear);
        } else if (this.calloutInfo.payment.recurrent.hasOwnProperty("ach")) {
            this.hasRecurrentACH = true;
            this.ccRecurringName = this.calloutInfo.payment.recurrent.ach.accountSurname;
            this.ccRecurringLastDigits = this.calloutInfo.payment.recurrent.ach.bankRoutingNumber;
            this.ccRecurringExpDate = this.calloutInfo.payment.recurrent.ach.bankAccountNumber;
            this.ccRecurringMethod = "Electronic Funds Transfer";
        }
        this.finalizeShoppingCartCallout();
    }

    finalizeShoppingCartCallout() {
        this.loaderSpinner = true;
        let myData = {
            tab: "finalizeShoppingCart",
            path: "finalizeShoppingCart",
            partnerName: "viasat",
            shoppingCartId: this.calloutInfo.shoppingCartId
        };
        console.log("Finalize Shopping Cart Request", myData);
        let apiResponse;

        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Finalize Shopping Cart Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        responseParsed.result.error.hasOwnProperty("provider") &&
                        responseParsed.result.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error
                        : responseParsed.result.error.provider.message.hasOwnProperty("message")
                        ? responseParsed.result.error.provider.message.message
                        : responseParsed.result.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.loaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                } else {
                    this.step = 2;
                    this.submitOrderCallout();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    this.labels.the_request_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.step = 1;
                this.calloutError = true;
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    submitOrderCallout() {
        this.loaderSpinner = true;
        let myData = { ...this.calloutInfo };
        myData.tab = "submitOrder";
        myData.path = "submitOrder";
        myData.billingAccountId = myData.billingAccountNumber;
        console.log("Submit Order Request", myData);

        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Submit Order Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        responseParsed.result.error.hasOwnProperty("provider") &&
                        responseParsed.result.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error
                        : responseParsed.result.error.provider.message.hasOwnProperty("message")
                        ? responseParsed.result.error.provider.message.message
                        : responseParsed.result.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.loaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                } else {
                    responseParsed.hasOwnProperty("id") ? (this.orderId = responseParsed.id) : undefined;
                    let orderLineAttributes =
                        responseParsed.hasOwnProperty("order_lines") && responseParsed.order_lines.length > 0
                            ? responseParsed.order_lines[0].hasOwnProperty("attributes") &&
                              responseParsed.order_lines[0].attributes.length > 0
                                ? responseParsed.order_lines[0].attributes
                                : undefined
                            : undefined;

                    console.log("Order Line Attributes", orderLineAttributes);
                    orderLineAttributes.forEach((attribute) => {
                        if (attribute.name === "fo:ExternalWorkOrderId") {
                            this.externalWorkOrderId = attribute.value;
                        }
                    });

                    this.step = 3;
                    this.orderStatusCallout();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    this.labels.the_request_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.step = 2;
                this.dispatchEvent(event);
                this.calloutError = true;
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    orderStatusCallout() {
        this.loaderSpinner = true;
        let myData = {
            tab: "orderStatus",
            path: "orderStatus",
            partnerName: "viasat",
            orderId: this.orderId
        };
        console.log("Order Status Request", myData);

        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Order Status Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        responseParsed.result.error.hasOwnProperty("provider") &&
                        responseParsed.result.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error
                        : responseParsed.result.error.provider.message.hasOwnProperty("message")
                        ? responseParsed.result.error.provider.message.message
                        : responseParsed.result.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                } else {
                    this.step = 4;
                    this.disableNext = false;
                    this.orderComplete = true;
                    this.showTable = true;
                    const event = new ShowToastEvent({
                        title: "Order Completed",
                        variant: "success"
                    });
                    this.dispatchEvent(event);
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                   this.labels.the_request_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.step = 3;
                this.calloutError = true;
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    retryCallout() {
        switch (this.step) {
            case 1:
                this.calloutError = false;
                this.finalizeShoppingCartCallout();
                break;
            case 2:
                this.calloutError = false;
                this.submitOrderCallout();
                break;
            case 3:
                this.calloutError = false;
                this.orderStatusCallout();
                break;
        }
    }

    handleClick() {
        this.loaderSpinner = true;
        let info = {
            orderNumber: this.orderId,
            orderId: this.orderId
        };
        let cart = { ...this.cartInfo };
        let totalFee = Number(cart.monthlyTotal) + Number(cart.todayTotal);
        let myData = {
            orderItemId: this.sfOrderItemId,
            fee: totalFee
        };
        saveCartDTV({ myData })
            .then((response) => {
                console.log(response);
                this.workOrdersCallout(info);
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
                this.dispatchEvent(event);
            });
    }

    delay(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    workOrdersCallout(info) {
        this.loaderSpinner = true;
        let myData = {
            partnerName: "viasat",
            path: "workOrders",
            externalWorkOrderId: this.externalWorkOrderId
        };
        console.log("Work Orders Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Work Orders Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        responseParsed.result.error.hasOwnProperty("provider") &&
                        responseParsed.result.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error
                        : responseParsed.result.error.provider.message.hasOwnProperty("message")
                        ? responseParsed.result.error.provider.message.message
                        : responseParsed.result.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                } else {
                    if (
                        responseParsed.work_order_details[0].work_order.state === "INITIALIZED" ||
                        responseParsed.work_order_details[0].work_order.state === "ACCEPTING"
                    ) {
                        this.delay(7000).then(() => this.workOrdersCallout(info));
                    } else {
                        let workOrder =
                            responseParsed.hasOwnProperty("work_order_details") &&
                            responseParsed.work_order_details.length > 0
                                ? responseParsed.work_order_details[0] &&
                                  responseParsed.work_order_details[0].hasOwnProperty("work_order")
                                    ? responseParsed.work_order_details[0].work_order.hasOwnProperty(
                                          "internal_work_order_id"
                                      )
                                        ? responseParsed.work_order_details[0].work_order.internal_work_order_id !==
                                          null
                                        : false
                                    : false
                                : false;

                        if (workOrder) {
                            let input = {
                                orderId: this.sfOrderId,
                                internalWorkOrderId:
                                    responseParsed.work_order_details[0].work_order.internal_work_order_id
                            };
                            this.internalWorkOrderId = input.internalWorkOrderId;
                            console.log("Update Work Order Id Data", input);
                            updateWorkOrderId({ myData: input })
                                .then((response) => {
                                    console.log("Updated Work Order Id");
                                    this.confirmOrder(info);
                                })
                                .catch((internalError) => {
                                    console.error(internalError, "ERROR");
                                    const event = new ShowToastEvent({
                                        title: "Server Error",
                                        variant: "error",
                                        mode: "sticky",
                                        message:
                                            this.labels.the_request_could_not_be_made_correctly
                                    });
                                    this.dispatchEvent(event);
                                    this.loaderSpinner = false;
                                    this.logError(internalError.body?.message || internalError.message);
                                });
                        } else {
                            this.confirmOrder(info);
                        }
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    this.labels.the_request_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.step = 3;
                this.calloutError = true;
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    saveConfigurations(info) {
        this.loaderSpinner = true;
        let cart = { ...this.cartInfo };
        let configurations = [];
        let todayArray = [];
        let monthlyArray = [];
        if (cart.hasToday) {
            todayArray = JSON.parse(JSON.stringify(cart.todayCharges));
            todayArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: item.fee,
                    type: "Today"
                };
                configurations.push(config);
            });
        }
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
        console.log("Configurations Data", myData);
        saveConfigurations({ myData: myData })
            .then((response) => {
                console.log("Configurations Response", response);
                if (this.isGuestUser) {
                    const sendOrderConfirmationNextEvent = new CustomEvent("orderconfirmationnext", {
                        detail: info
                    });
                    this.dispatchEvent(sendOrderConfirmationNextEvent);
                    this.loaderSpinner = false;
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
                this.loaderSpinner = false;
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    confirmOrder(info) {
        let myData = {
            ContextId: this.recordId,
            orderId: this.internalWorkOrderId !== undefined ? this.internalWorkOrderId : this.orderId,
            orderNumber: this.orderId,
            transactionId: this.calloutInfo.shoppingCartId,
            accountNumber: this.calloutInfo.billingAccountNumber,
            installationDate: this.calloutInfo.appointment?.startTime,
            earliestDate: this.calloutInfo.earliestDate?.date,
            serviceReference: this.calloutInfo.hasOwnProperty("serviceLocationId")
                ? this.calloutInfo.serviceLocationId
                : null
        };
        console.log("Confirm Order Data", myData);
        saveOpportunityStage({ myData: myData })
            .then((response) => {
                this.saveConfigurations(info);
            })
            .catch((error) => {
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
        let trackerData = {
            userId: this.userId,
            operation: "setTrack",
            isCount: true,
            action: "Buyflow Completed"
        };
        if (this.origin === "retail") {
            setClickerRetailTrack({ myData: trackerData })
                .then((response) => {
                    const sendOrderConfirmationNextEvent = new CustomEvent("orderconfirmationnext", {
                        detail: myData
                    });
                    this.dispatchEvent(sendOrderConfirmationNextEvent);
                    this.loaderSpinner = false;
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                    this.logError(error.body?.message || error.message);
                });
        } else if (this.origin === "event") {
            setClickerEventTrack({ myData: trackerData })
                .then((response) => {
                    const sendOrderConfirmationNextEvent = new CustomEvent("orderconfirmationnext", {
                        detail: myData
                    });
                    this.dispatchEvent(sendOrderConfirmationNextEvent);
                    this.loaderSpinner = false;
                })
                .catch((error) => {
                    console.log(error);
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                    this.logError(error.body?.message || error.message);
                });
        } else if (this.origin === "phonesales") {
            setClickerCallCenterTrack({ myData: trackerData })
                .then((response) => {
                    const sendOrderConfirmationNextEvent = new CustomEvent("orderconfirmationnext", {
                        detail: myData
                    });
                    this.dispatchEvent(sendOrderConfirmationNextEvent);
                    this.loaderSpinner = false;
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                    this.logError(error.body?.message || error.message);
                });
        } else {
            this.loaderSpinner = false;
            const sendOrderConfirmationNextEvent = new CustomEvent("orderconfirmationnext", {
                detail: myData
            });
            this.dispatchEvent(sendOrderConfirmationNextEvent);
        }
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Order Confirmation",
            component: "Poe_lwcBuyflowViasatOrderConfirmationTab",
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