import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import savePaymentAttempts from "@salesforce/apex/OrderConfirmationTabController.savePaymentAttempts";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import saveOpportunityStage from "@salesforce/apex/InfoTabController.saveOpportunityStage";

import SELF_SERVICE_VALIDATE_LEAVING_MESSAGE from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import SELF_SERVICE_VALIDATE_LEAVING_TITLE from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import VZ_FOOTPRINT_VERBIAGE from "@salesforce/label/c.Earthlink_Verizon_Footprint_Verbiage";
import NEXT_BUTTON_LABEL from "@salesforce/label/c.Next_Button_Label";
import COMPLETE_ORDER_BUTTON_LABEL from "@salesforce/label/c.Complete_Order_Button_Label";
import TOAST_GENERIC_ERROR_TITLE from "@salesforce/label/c.Toast_Generic_Error_Title";
import MAX_PAYMENT_ATTEMPTS_ERROR_MESSAGE from "@salesforce/label/c.Max_Payment_Attempts_Error_Message";
import ORDER_NOT_COMPLETED_BY_PROVIDER_ERROR_MESSAGE from "@salesforce/label/c.Order_Not_Completed_By_Provider_Error_Message";
import SERVER_ERROR_TOAST_TITLE from "@salesforce/label/c.Server_Error_Toast_Title";
import CHUZO_GENERIC_ERROR_MESSAGE from "@salesforce/label/c.Chuzo_Generic_Error_Message";
import ORDER_CONFIRMATION_CHARGES_DISCLAIMER from "@salesforce/label/c.Order_Confirmation_Charges_Disclaimer";
import MONTHLY_CHARGES_CART_TITLE from "@salesforce/label/c.Monthly_Charges_Cart_Title";
import ESTIMATED_FIRST_MONTH_TOTAL_TITLE from "@salesforce/label/c.Estimated_First_Month_Total_Title";
import ONE_TIME_CHARGE_TITLE from "@salesforce/label/c.EarthLink_One_Time_Charge_Title";
import ONE_TIME_TOTAL_TITLE from "@salesforce/label/c.EarthLink_Cart_Tab_One_Time_Total_Title";
import INSTALLATION_DATE_TIME_LABEL from "@salesforce/label/c.EarthLink_Installation_Date_Time_Label";
import LANGUAGE_PREFERENCE_TITLE from "@salesforce/label/c.Language_Preference_Title";
import CUSTOMER_CARE_LANGUAGE_FIELD_LABEL from "@salesforce/label/c.EarthLink_Customer_Care_Language_Field_Label";
import ORDER_CONFIRMATION_TAB_NAME_LABEL from "@salesforce/label/c.Order_Confirmation_Tab_Name_Label";
import NOTICE_MODAL_TITLE from "@salesforce/label/c.Notice_Modal_Title";

const INTERNAL_ERRROR = "Internal Error";
const API_ERROR = "API Error";

export default class Poe_lwcBuyflowEarthlinkOrderConfirmationTab extends NavigationMixin(LightningElement) {
    @api logo;
    @api recordId;
    @api product;
    @api calloutInfo;
    @api firstFee;
    @api origin;
    @api userId;
    @api selectedServices;
    @api cartInfo;
    @api paymentAttempts;
    @api promoCode;
    @api isGuestUser;
    @api installationDatetime;
    @api skipInstallation;
    @api clientInfo;
    @api accountId;
    @api referralCodeData;

    attempts;
    estimatedFirstMonthTotal = 0;
    estimatedOneTimeTotal = 0;
    loaderSpinner;
    showCollateral = false;
    languagePrefValue = "English";
    attemptByProgram;
    setOpportunityPaymentLimit = false;
    showNext = true;
    products = [];
    activations = [];
    labels = {
        SELF_SERVICE_VALIDATE_LEAVING_TITLE,
        SELF_SERVICE_VALIDATE_LEAVING_MESSAGE,
        VZ_FOOTPRINT_VERBIAGE,
        ORDER_CONFIRMATION_CHARGES_DISCLAIMER,
        MONTHLY_CHARGES_CART_TITLE,
        ESTIMATED_FIRST_MONTH_TOTAL_TITLE,
        ONE_TIME_CHARGE_TITLE,
        ONE_TIME_TOTAL_TITLE,
        INSTALLATION_DATE_TIME_LABEL,
        LANGUAGE_PREFERENCE_TITLE,
        CUSTOMER_CARE_LANGUAGE_FIELD_LABEL,
        ORDER_CONFIRMATION_TAB_NAME_LABEL,
        NOTICE_MODAL_TITLE
    };
    showSelfServiceCancelModal = false;
    showVerizonFootPrintModal = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get nextLabel() {
        return this.isGuestUser ? NEXT_BUTTON_LABEL : COMPLETE_ORDER_BUTTON_LABEL;
    }

    get showInstallationDatetime() {
        return !this.skipInstallation;
    }

    get languagePrefOptions() {
        return [
            { label: "English", value: "English" },
            { label: "Spanish", value: "Spanish" }
        ];
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
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        } else {
            this.product?.isVZProduct
                ? (this.showVerizonFootPrintModal = true)
                : (this.showVerizonFootPrintModal = false);
        }
        this.attemptByProgram = 0;
        this.attempts = this.paymentAttempts;
    }

    checkCreditCardAttempts() {
        this.attempts = this.attemptByProgram;
        this.setOpportunityPaymentLimit = true;
        this.showNext = false;
        const errorEvent = new ShowToastEvent({
            title: TOAST_GENERIC_ERROR_TITLE,
            variant: "error",
            mode: "sticky",
            message: MAX_PAYMENT_ATTEMPTS_ERROR_MESSAGE
        });
        this.dispatchEvent(errorEvent);

        let info = {
            setOpportunityPaymentLimit: this.setOpportunityPaymentLimit,
            attempts: this.attempts,
            ContextId: this.recordId
        };
        savePaymentAttempts({ myData: info })
            .then((response) => {})
            .catch((error) => {
                console.log(error);
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERRROR
                });
                this.loaderSpinner = false;
            });
    }

    handleClick() {
        this.loaderSpinner = true;
        this.attempts = this.attempts + 1;
        if (this.attemptByProgram <= 2) {
            this.attemptByProgram = this.attemptByProgram + 1;
        } else {
            this.attempts = this.attemptByProgram;
            this.setOpportunityPaymentLimit = true;
            this.showNext = false;
            const errorEvent = new ShowToastEvent({
                title: TOAST_GENERIC_ERROR_TITLE,
                variant: "error",
                mode: "sticky",
                message: MAX_PAYMENT_ATTEMPTS_ERROR_MESSAGE
            });
            this.dispatchEvent(errorEvent);
        }
        let info = {
            setOpportunityPaymentLimit: this.setOpportunityPaymentLimit,
            attempts: this.attempts,
            ContextId: this.recordId
        };
        savePaymentAttempts({ myData: info })
            .then((response) => {
                this.confirmOrder();
            })
            .catch((error) => {
                console.log(error);
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERRROR
                });
                this.loaderSpinner = false;
            });
    }

    confirmOrder() {
        let call = JSON.parse(JSON.stringify(this.calloutInfo));
        call.path = "orders";
        call.partnerName = "earthlink";
        call.promoCode = this.promoCode;
        if (this.languagePrefValue === "Spanish") {
            call.account.languagePref = "Spanish";
        }
        let myData = call;
        console.log("Orders Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                console.log("Orders Response", response);
                let error = response.hasOwnProperty("error");
                if (
                    ((response.hasOwnProperty("confirmationNumber") &&
                        response.confirmationNumber !== null &&
                        response.confirmationNumber !== undefined &&
                        response.confirmationNumber !== "") ||
                        (response.hasOwnProperty("orderId") &&
                            response.orderId !== null &&
                            response.orderId !== undefined &&
                            response.orderId !== "")) &&
                    !error
                ) {
                    let orderId = response?.orderId;
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
                            : call.hasOwnProperty("installationDetails") &&
                              call.installationDetails.hasOwnProperty("date")
                            ? call.installationDetails.date
                            : "";
                    let earliestDate =
                        response.installationDate !== undefined
                            ? response.installationDate
                            : call.hasOwnProperty("installationDetails") &&
                              call.installationDetails.hasOwnProperty("earliestDate")
                            ? call.installationDetails.earliestDate
                            : "";
                    let myData = {
                        ContextId: this.recordId,
                        orderId: orderId,
                        orderNumber: orderNumber,
                        transactionId: transactionId,
                        accountNumber: accountNumber,
                        installationDate: installationDate,
                        earliestDate: earliestDate,
                        serviceReference: serviceReference
                    };
                    console.log("Save Opportunity Data", myData);

                    saveOpportunityStage({ myData: myData })
                        .then((response) => {
                            console.log("Save Opportunity Response", response);
                            this.saveTracker(myData);
                        })
                        .catch((error) => {
                            console.log(error);
                            this.loaderSpinner = false;
                        });
                } else {
                    let errorMsg;
                    if (
                        response.hasOwnProperty("error") &&
                        response.error.hasOwnProperty("provider") &&
                        response.error.provider.hasOwnProperty("message") &&
                        response.error.provider.message !== undefined
                    ) {
                        errorMsg = response.error.provider.message;
                    }
                    const event = new ShowToastEvent({
                        title: TOAST_GENERIC_ERROR_TITLE,
                        variant: "error",
                        mode: "sticky",
                        message: errorMsg !== undefined 
                            ? errorMsg 
                            : ORDER_NOT_COMPLETED_BY_PROVIDER_ERROR_MESSAGE
                    });
                    this.dispatchEvent(event);
                    this.handleLogError({
                        error: `${errorMsg}\nAPI Response: ${apiResponse}`,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                    this.attemptByProgram > 2 ? this.checkCreditCardAttempts() : undefined;
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: SERVER_ERROR_TOAST_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: CHUZO_GENERIC_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                const errMsg = error.body?.message || error.message;
                if (apiResponse) {
                    this.handleLogError({
                        error: `${errMsg}\nAPI Response: ${apiResponse}`,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                } else {
                    this.handleLogError({
                        error: errMsg,
                        type: INTERNAL_ERRROR
                    });
                }
                this.loaderSpinner = false;
            });
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back", {
            detail: this.attempts
        });
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    saveTracker(myData) {
        if (this.isGuestUser) {
            const sendOrderConfirmationNextEvent = new CustomEvent("orderconfirmationnext", {
                detail: myData
            });
            this.dispatchEvent(sendOrderConfirmationNextEvent);
            this.loaderSpinner = false;
        } else {
            if (this.origin === "retail") {
                let trackerData = {
                    userId: this.userId,
                    operation: "setTrack",
                    isCount: true,
                    action: "Buyflow Completed"
                };
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
                        this.handleLogError({
                            error: error.body?.message || error.message,
                            type: INTERNAL_ERRROR
                        });
                        this.loaderSpinner = false;
                    });
            } else if (this.origin === "event") {
                let trackerData = {
                    operation: "setTrack",
                    isCount: true,
                    action: "Buyflow Completed",
                    userId: this.userId
                };
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
                        this.handleLogError({
                            error: error.body?.message || error.message,
                            type: INTERNAL_ERRROR
                        });
                        this.loaderSpinner = false;
                    });
            } else if (this.origin === "phonesales") {
                let trackerData = {
                    userId: this.userId,
                    operation: "setTrack",
                    isCount: true,
                    action: "Buyflow Completed"
                };
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
                        this.handleLogError({
                            error: error.body?.message || error.message,
                            type: INTERNAL_ERRROR
                        });
                        this.loaderSpinner = false;
                    });
            } else {
                const sendOrderConfirmationNextEvent = new CustomEvent("orderconfirmationnext", {
                    detail: myData
                });
                this.dispatchEvent(sendOrderConfirmationNextEvent);
                this.loaderSpinner = false;
            }
        }
    }

    handleLanguagePrefChange(e) {
        this.languagePrefValue = e.detail.value;
    }

    handleLogError(data) {
        let errorLog = {
            type: data.type,
            provider: "Earthlink",
            tab: "Order Confirmation",
            component: "poe_lwcBuyflowEarthlinkOrderConfirmationTab",
            error: data.error,
            endpoint: data.endpoint,
            request: JSON.stringify(data.request),
            opportunity: data.opportunity
        };

        let event = new CustomEvent("logerror", {
            detail: errorLog
        });
        this.dispatchEvent(event);
    }
    hideVerizonFootPrintModal() {
        this.showVerizonFootPrintModal = false;
    }
}