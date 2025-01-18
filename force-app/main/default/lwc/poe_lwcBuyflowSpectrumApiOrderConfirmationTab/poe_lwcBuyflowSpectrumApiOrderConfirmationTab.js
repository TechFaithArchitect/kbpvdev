import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { NavigationMixin } from "lightning/navigation";
import saveOpportunityStage from "@salesforce/apex/InfoTabController.saveOpportunityStage";
import saveCartDTV from "@salesforce/apex/OrderConfirmationTabController.saveCart";
import saveConfigurationsDTV from "@salesforce/apex/OrderConfirmationTabController.saveConfigurations";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getCharterInformation from "@salesforce/apex/InfoTabController.getCharterInformation";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import spectrumAutomationErrors from "@salesforce/label/c.spectrumAutomationErrors";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import CHARTER from "@salesforce/label/c.charter";
import CUSTOMER_INFORMATION from "@salesforce/label/c.Customer_Information";
import ORDER_REVIEW from "@salesforce/label/c.Order_Review_Tab_Name";
import CUSTOMER_NAME_ADDRESS from "@salesforce/label/c.Spectrum_Customer_Name_Address_Title";
import PRIMARY_PHONE from "@salesforce/label/c.Spectrum_Primary_Phone_Field";
import EMAIL from "@salesforce/label/c.Spectrum_Email_Field";
import SERVICES_ORDERED from "@salesforce/label/c.Spectrum_Services_Ordered_Title";
import PACKAGE_OPTION from "@salesforce/label/c.Spectrum_Package_Option_Field";
import SESSION_ID from "@salesforce/label/c.Spectrum_Session_Id_Field";
import WORK_ORDER_NUMBER from "@salesforce/label/c.Spectrum_Work_Order_Number_Field";
import ACCOUNTNUMBER from "@salesforce/label/c.Spectrum_AccountNumber_Field";
import INSTALLATION_OPTION from "@salesforce/label/c.Spectrum_Installation_Option_Field";
import MOBILE_SALE_BUTTON_LABEL from "@salesforce/label/c.Spectrum_Mobile_Sale_Button_Label";
import SPINNER_ALT_TEXT from "@salesforce/label/c.Spinner_Alternative_Text";
import AUTOMATION_SUCCESS_MESSAGE from "@salesforce/label/c.Spectrum_Automation_Success_Message";
import ORDER_COULD_NOT_BE_SUBMITTED from "@salesforce/label/c.Spectrum_Order_Could_Not_Be_Submitted_Error";
import SALES_ID from "@salesforce/label/c.Spectrum_Sales_Id_Field_Label";
import ERROR_VARIANT from "@salesforce/label/c.error_variant";
import STICKY_MODE from "@salesforce/label/c.sticky_mode";
import GENERIC_ERROR from "@salesforce/label/c.Toast_Generic_Error_Title";
import API_ERROR from "@salesforce/label/c.API_Error";
import GENERIC_ERROR_LOG from "@salesforce/label/c.Generic_Error_Log";
import RETAIL from "@salesforce/label/c.retail";
import PHONESALES from "@salesforce/label/c.phonesales";
import EVENT from "@salesforce/label/c.event";
import SERVER_ERROR from "@salesforce/label/c.Server_Error_Toast_Title";
import OPPORTUNITY_OBJ_NAME from "@salesforce/label/c.Opportunity_Object_Name";
import ORDER_ACTIVATION_ERROR from "@salesforce/label/c.Windstream_the_order_can_not_be_activated";
import ORDER_CONFIGURATION_ERROR from "@salesforce/label/c.Windstream_the_order_configuration_could_not_be_saved";
import ESTIMATED_DELIVERY_DATE from "@salesforce/label/c.Spectrum_Estimated_Delivery_Date_Label";
import INSTALLATION_DATE from "@salesforce/label/c.Spectrum_Installation_Date_Label";
import SERVICE_UNREACHABLE from "@salesforce/label/c.Service_unreachable";
import SUBMIT_ORDER_ERROR from "@salesforce/label/c.Spectrum_Submit_Order_Error";
import NONE_LOWERCASE from "@salesforce/label/c.none_lowercase";
import MOBILE_FLOW from "@salesforce/label/c.Spectrum_Mobile_Flow_Title";
import ORDER_SUBMITTED_MESSAGE from "@salesforce/label/c.Spectrum_Order_Submitted_Message";
import ORDER_SUPPORT_PHONE from "@salesforce/label/c.Spectrum_Order_Support_Phone";
import SALES_SUPPORT_PHONE from "@salesforce/label/c.Spectrum_Sales_Support_Phone";
import NA from "@salesforce/label/c.NA";
import PRODUCT_ENRICHMENT_MESSAGE from "@salesforce/label/c.Spectrum_Product_Enrichment_Generic_Error_Message";
import ORDER_CONFIRMATION from "@salesforce/label/c.Order_Confirmation_Tab_Name_Label";

export default class Poe_lwcBuyflowSpectrumApiOrderConfirmationTab extends NavigationMixin(LightningElement) {
    @api orderInfo;
    @api origin;
    @api cartInfo;
    @api recordId;
    @api productSelection;
    @api userId;
    @api sfOrderId;
    @api orderItemId;
    @api installationInfo;
    @api installationType;
    @api alternativeInstallationInfo;
    @api earliestDate;
    @api hasPhone;
    @api hasMobile;
    @api selfInstall;
    @api isGuestUser;
    @api deliveryDate;
    @api mobileSelected;
    @api affiliateId;
    @api accountId;
    @api salesId;
    cart = {};
    showCollateral;
    confirmedDate;
    loaderSpinner;
    orderSuccess = true;
    finishLoad = false;
    confirmationNumber;
    orderId;
    transactionId;
    showWorkOrderNumber = false;
    showAccountId = false;
    noCompleteInfo = true;
    showMobile = false;
    mobileURL;
    automationResultFailures = [];
    labels = {
        spectrumAutomationErrors,
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        CHARTER,
        CUSTOMER_INFORMATION,
        ORDER_REVIEW,
        CUSTOMER_NAME_ADDRESS,
        PRIMARY_PHONE,
        EMAIL,
        SERVICES_ORDERED,
        PACKAGE_OPTION,
        SESSION_ID,
        WORK_ORDER_NUMBER,
        ACCOUNTNUMBER,
        INSTALLATION_OPTION,
        MOBILE_SALE_BUTTON_LABEL,
        SPINNER_ALT_TEXT,
        AUTOMATION_SUCCESS_MESSAGE,
        ORDER_COULD_NOT_BE_SUBMITTED,
        SALES_ID
    };
    automationSuccess = true;
    automationVerbiage;
    hasInstallation = false;
    supportPhone;
    installationLabel;
    installationValue;
    showSelfServiceCancelModal = false;
    isRetail;
    autoPayVerbiage;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleMobile() {
        window.open(this.mobileURL, "_blank").focus();
        this.noCompleteInfo = false;
    }

    handleClick() {
        this.loaderSpinner = true;
        let info = {
            orderNumber: this.confirmationNumber,
            orderId: this.orderId,
            automationSuccess: this.automationSuccess
        };
        this.updateOrder(info);
    }

    saveTracker(info) {
        let trackerData = {
            userId: this.userId,
            operation: "setTrack",
            isCount: true,
            action: "Buyflow Completed"
        };

        let saveTrackerMethod;
        switch (this.origin) {
            case RETAIL:
                saveTrackerMethod = setClickerRetailTrack;
                break;
            case EVENT:
                saveTrackerMethod = setClickerEventTrack;
                break;
            case PHONESALES:
                saveTrackerMethod = setClickerCallCenterTrack;
                break;
        }

        if (!saveTrackerMethod) {
            const sendCartNextEvent = new CustomEvent("confirmationnext", {
                detail: info
            });
            this.dispatchEvent(sendCartNextEvent);
            this.loaderSpinner = false;
            return;
        }

        saveTrackerMethod({ myData: trackerData })
            .then((response) => {
                const sendCartNextEvent = new CustomEvent("confirmationnext", {
                    detail: info
                });
                this.dispatchEvent(sendCartNextEvent);
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: GENERIC_ERROR,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: ORDER_ACTIVATION_ERROR
                    })
                );
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    updateOrder(info) {
        let cart = { ...this.cartInfo };
        let totalFee = Number(cart.firstBillTotal) + Number(cart.monthlyTotal) + Number(cart.todayTotal);
        let myData = {
            orderItemId: this.orderItemId,
            fee: totalFee
        };
        console.log("Update Order Request", myData);

        saveCartDTV({ myData })
            .then((response) => {
                console.log("Update Order Response", response);
                this.confirmOrder(info);
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: GENERIC_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: ORDER_ACTIVATION_ERROR
                });
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    confirmOrder(info) {
        let myData = {
            ContextId: this.recordId,
            orderId: this.orderId,
            orderNumber: this.confirmationNumber,
            transactionId: this.transactionId,
            accountNumber: this.accountNumber,
            installationDate:
                Object.keys(this.installationInfo).length > 0 ? this.installationInfo.installationDetail.date : "",
            earliestDate: Object.keys(this.installationInfo).length > 0 ? this.earliestDate?.date : "",
            serviceReference: ""
        };
        console.log("Save Opportunity Request", myData);

        saveOpportunityStage({ myData })
            .then((response) => {
                console.log("Save Opportunity Response", response);
                this.saveConfigurations(info);
            })
            .catch((error) => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: GENERIC_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: ORDER_ACTIVATION_ERROR
                });
                console.log(error);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    saveConfigurations(info) {
        let cart = { ...this.cartInfo };
        let configurations = [];
        let firstArray = [];
        let monthlyArray = [];
        if (cart.hasFirstBill) {
            firstArray = JSON.parse(JSON.stringify(cart.firstBillCharges));
            firstArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: item.fee,
                    type: "First Bill"
                };
                configurations.push(config);
            });
        }
        if (cart.hasMonthly) {
            monthlyArray = [
                ...cart.monthlyCharges.internet,
                ...cart.monthlyCharges.phone,
                ...cart.monthlyCharges.mobile
            ];
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

        saveConfigurationsDTV({ myData })
            .then((response) => {
                console.log(response);
                if (this.isGuestUser) {
                    const sendCartNextEvent = new CustomEvent("confirmationnext", {
                        detail: info
                    });
                    this.dispatchEvent(sendCartNextEvent);
                    this.loaderSpinner = false;
                } else {
                    this.saveTracker(info);
                }
            })
            .catch((error) => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: GENERIC_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: ORDER_CONFIGURATION_ERROR
                });
                console.log(error);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.isRetail = this.origin === RETAIL;
        this.installationLabel = this.selfInstall ? ESTIMATED_DELIVERY_DATE : INSTALLATION_DATE;
        this.cart = { ...this.cartInfo };
        this.automationResultFailures = this.labels.spectrumAutomationErrors.split(",");
        this.loaderSpinner = true;
        let input = {
            program: "Charter"
        };
        if (this.origin !== PHONESALES) {
            this.handleCartSummary();
        } else {
            this.salesId = this.labels.agentId;
            getCharterInformation({ myData: input })
                .then((response) => {
                    this.salesId = response.result.salesId;
                    this.handleCartSummary();
                })
                .catch((error) => {
                    this.logError(error.body?.message || error.message);
                    this.showLoaderSpinner = false;
                    console.log(error);
                });
        }
    }

    handleCartSummary() {
        const path = "cartSummary";
        let myData = {
            path,
            partnerName: "charter",
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            returnTaxes: true
        };
        console.log("Cart Summary Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                const result = JSON.parse(res);
                console.log("Cart Summary Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    this.orderSuccess = false;
                    this.finishLoad = true;
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: SERVER_ERROR,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", res);
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                    this.loaderSpinner = false;
                } else {
                    this.submitOrder();
                    this.getCartSummary(result);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage = SERVICE_UNREACHABLE;
                const event = new ShowToastEvent({
                    title: GENERIC_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", genericErrorMessage).replace(
                        "{1}",
                        apiResponse
                    );
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    getCartSummary(result) {
        let estimatedTaxes = { ...result.estimatedTaxes };
        if (estimatedTaxes.totalMonthlyTaxes >= 0) {
            let monthlyCharges = [
                ...this.cart.monthlyCharges.internet,
                ...this.cart.monthlyCharges.phone,
                ...this.cart.monthlyCharges.mobile
            ];
            let monthlyTotal = 0;
            let monthlyTaxes = Number(estimatedTaxes.totalMonthlyTaxes).toFixed(2);
            monthlyCharges.forEach((charge) => {
                monthlyTotal = Number(monthlyTotal) + Number(charge.fee);
            });
            monthlyTotal = (Number(monthlyTotal) + Number(monthlyTaxes)).toFixed(2);
            this.cart = { ...this.cart, monthlyTaxes, monthlyTotal };
        }
        if (estimatedTaxes.totalOneTimeTaxes >= 0 && !this.cart.hasToday) {
            let firstBillTotal = 0;
            let firstBillTaxes = Number(estimatedTaxes.totalOneTimeTaxes).toFixed(2);
            let firstBillCharges = [...this.cart.firstBillCharges];
            firstBillCharges.forEach((charge) => {
                firstBillTotal = Number(firstBillTotal) + Number(charge.fee);
            });
            firstBillTotal = (Number(firstBillTotal) + Number(this.cart.monthlyTotal) + Number(firstBillTaxes)).toFixed(
                2
            );
            this.cart = {
                ...this.cart,
                firstBillTotal,
                hasFirstBill: true,
                firstBillTaxes
            };
        }
    }

    submitOrder() {
        this.loaderSpinner = true;
        const path = "orders";
        let myData = {
            path,
            partnerName: "charter",
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId
        };
        console.log("Order Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Order Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    this.orderSuccess = false;
                    this.finishLoad = true;
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: SERVER_ERROR,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", response);
                    this.logError(finalErrorLog, myData, path, API_ERROR);

                    this.loaderSpinner = false;
                } else {
                    if (result.automationResult === null && result.automationFalloutList.length > 0) {
                        result.automationFalloutList.forEach((item) => {
                            let finalErrorLog = SUBMIT_ORDER_ERROR.replace("{0}", item?.falloutCode)
                                .replace("{2}", item?.falloutDescription)
                                .replace("{3}", apiResponse);
                            this.logError(finalErrorLog, myData, path, API_ERROR);
                        });
                    }
                    this.orderId =
                        result.accountDetails.workOrderNumber !== null
                            ? result.accountDetails.workOrderNumber
                            : undefined;
                    this.showWorkOrderNumber = this.orderId !== undefined;
                    this.accountNumber =
                        result.accountDetails.accountId !== null ? result.accountDetails.accountId : undefined;
                    this.confirmationNumber = result.confirmationNumber;
                    this.labels.AUTOMATION_SUCCESS_MESSAGE = `${AUTOMATION_SUCCESS_MESSAGE} ${this.confirmationNumber}`;
                    this.showAccountId = this.accountNumber !== undefined;
                    this.transactionId = result.transactionId;
                    this.orderSuccess = true;
                    this.showMobile = result.hasOwnProperty("mobileTokenResponse");
                    this.hasInstallation =
                        Object.keys(this.installationInfo).length > 0 || this.deliveryDate !== NONE_LOWERCASE;
                    if (this.hasInstallation) {
                        this.installationValue = `${
                            this.deliveryDate !== NONE_LOWERCASE
                                ? result.paymentInfo.installationOption.estimatedDeliveryText !== null
                                    ? result.paymentInfo.installationOption.estimatedDeliveryText
                                    : result.paymentInfo.installationOption.estimatedDeliveryDate
                                : result.installSchedule !== null
                                ? result.installSchedule.primaryInstallWindow.installDate
                                : this.installationInfo.installationDetail.date
                        } ${
                            this.selfInstall
                                ? ""
                                : result.installSchedule !== null
                                ? result.installSchedule.primaryInstallWindow.installTimeRange
                                : `${this.installationInfo.installationDetail.startTime}-${this.installationInfo.installationDetail.endTime}`
                        }
                    `;
                    }
                    if (this.showMobile) {
                        this.mobileURL = result.mobileTokenResponse.routingURL;
                        const mobileEvent = new ShowToastEvent({
                            title: MOBILE_FLOW,
                            variant: "success",
                            mode: STICKY_MODE,
                            message: ORDER_SUBMITTED_MESSAGE
                        });
                        this.dispatchEvent(mobileEvent);
                    }
                    if (
                        this.automationResultFailures.includes(result.automationResult) ||
                        result.automationResult === null
                    ) {
                        this.automationSuccess = false;
                        this.handleContentCallout();
                    } else {
                        this.handleProductEnrichments();
                    }
                    this.finishLoad = true;
                }
                this.noCompleteInfo = !this.orderSuccess;
            })
            .catch((error) => {
                this.orderSuccess = false;
                this.finishLoad = true;
                this.noCompleteInfo = true;
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage = SERVICE_UNREACHABLE;
                const event = new ShowToastEvent({
                    title: GENERIC_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", genericErrorMessage).replace(
                        "{1}",
                        apiResponse
                    );
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    handleProductEnrichments() {
        const path = "productEnrichments";
        let myData = {
            partnerName: "charter",
            path,
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            type: "phone",
            numberType: this.automationSuccess ? "confirmationAutomated" : "confirmationNonAutomated",
            channelInformation: {
                channel: "RESI-RETAIL",
                affiliateId: this.affiliateId
            }
        };
        console.log("Product Enrichment Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Product Enrichment Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: SERVER_ERROR,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", response);
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    this.supportPhone =
                        result.hasOwnProperty("productEnrichmentsResponse") &&
                        result.productEnrichmentsResponse.hasOwnProperty("phoneNumber")
                            ? `${this.automationSuccess ? ORDER_SUPPORT_PHONE : SALES_SUPPORT_PHONE}: ${
                                  result.productEnrichmentsResponse.phoneNumber
                              }`
                            : `${this.automationSuccess ? ORDER_SUPPORT_PHONE : SALES_SUPPORT_PHONE}: ${NA}`;
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = PRODUCT_ENRICHMENT_MESSAGE;
                const event = new ShowToastEvent({
                    title: SERVER_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", genericErrorMessage).replace(
                        "{1}",
                        apiResponse
                    );
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.loaderSpinner = false;
            });
    }

    handleContentCallout() {
        this.loaderSpinner = true;
        const path = "contents";
        let myData = {
            path,
            partnerName: "charter",
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            contentType: "nonAutomatedConfirmation"
        };
        console.log("Content Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                const result = JSON.parse(res);
                console.log("Content Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    this.orderSuccess = false;
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: SERVER_ERROR,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", res);
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                    this.loaderSpinner = false;
                } else {
                    this.automationVerbiage = `${result.content.properties.elements.pageHeader.value}. ${
                        result.content.properties.elements.hasOwnProperty("lineItem")
                            ? `${result.content.properties.elements.lineItem.value}: ${this.confirmationNumber}`
                            : ""
                    }`;
                    this.autoPayVerbiage = `${
                        result.content.properties.elements.hasOwnProperty("lineDescriptionAutopay")
                            ? result.content.properties.elements.lineDescriptionAutopay.value
                            : ""
                    }`;
                    this.handleProductEnrichments();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage = SERVICE_UNREACHABLE;
                const event = new ShowToastEvent({
                    title: GENERIC_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", genericErrorMessage).replace(
                        "{1}",
                        apiResponse
                    );
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
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
                    objectApiName: OPPORTUNITY_OBJ_NAME,
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
            tab: ORDER_CONFIRMATION,
            component: "poe_lwcBuyflowSpectrumApiOrderConfirmationTab",
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
            tab: ORDER_CONFIRMATION
        };
        this.dispatchEvent(event);
    }
}