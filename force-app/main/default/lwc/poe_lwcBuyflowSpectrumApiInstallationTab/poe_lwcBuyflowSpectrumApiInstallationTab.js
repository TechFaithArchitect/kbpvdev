import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import ToastContainer from "lightning/toastContainer";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import INSTALLATION_TAB_NAME from "@salesforce/label/c.Installation_Tab_Name_Label";
import INSTALLATION_OPTIONS_TITLE from "@salesforce/label/c.Spectrum_Installation_Options_Title";
import SELECT_ALT_INSTALL_DATE from "@salesforce/label/c.Spectrum_Select_Alternative_Installation_Date_Label";
import REFRESH_DATES_BUTTON_LABEL from "@salesforce/label/c.Refresh_Dates_Button_Label";
import SERVICE_INFO_TITLE from "@salesforce/label/c.Service_Info_Title";
import SPINNER_TEXT from "@salesforce/label/c.Spinner_Alternative_Text";
import CHARTER from "@salesforce/label/c.charter";
import SERVER_ERROR from "@salesforce/label/c.Server_Error_Toast_Title";
import OPPORTUNITY_OBJ_NAME from "@salesforce/label/c.Opportunity_Object_Name";
import API_ERROR from "@salesforce/label/c.API_Error";
import GENERIC_ERROR from "@salesforce/label/c.Toast_Generic_Error_Title";
import GENERIC_ERROR_LOG from "@salesforce/label/c.Generic_Error_Log";
import ERROR_VARIANT from "@salesforce/label/c.error_variant";
import STICKY_MODE from "@salesforce/label/c.sticky_mode";
import SERVICE_UNREACHABLE from "@salesforce/label/c.Service_unreachable";
import INSTALLATION_LABEL from "@salesforce/label/c.Spectrum_Installation_Label";
import SELECT_ALT_SHIPPING_DATE from "@salesforce/label/c.Spectrum_Select_Alternative_Shipping_Date_Label";
import GET_INSTALL_DATE_ERROR from "@salesforce/label/c.Spectrum_Get_Installation_Dates_Generic_Error";
import INCLUDED_REQUIRED_PREPAYMENT_ERROR from "@salesforce/label/c.Spectrum_Included_Required_Prepayment_Message";
import GET_INSTALL_OPTIONS_ERROR from "@salesforce/label/c.Spectrum_Get_Installation_Options_Generic_Error";
import CHANGE_INSTALL_OPTIONS_ERROR from "@salesforce/label/c.Spectrum_Change_Installation_Options_Generic_Error";
import INSTALL_DATE_SELECTION_TITLE from "@salesforce/label/c.Spectrum_Install_Date_Selection_Title";
import INSTALL_DATE_SELECTION_ERROR from "@salesforce/label/c.Spectrum_Install_Date_Selection_Error";
import NO_OPTIONS_FETCHED from "@salesforce/label/c.Spectrum_No_Options_Fetched";
import NONE from "@salesforce/label/c.None";
import NONE_LOWERCASE from "@salesforce/label/c.none_lowercase";

export default class Poe_lwcBuyflowSpectrumApiInstallationTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api dateSelected;
    @api orderRequest;
    @api cartInfo;
    @api logo;
    @api hasPhone;
    @api hasMobile;
    @api productSelection;
    @api creditCheckPerformed;
    @api isGuestUser;
    cart = {};
    showCollateral = false;
    loaderSpinner;
    dateValue = {};
    alternativeDateValue = {};
    earliestDate = {};
    noCompleteInfo = true;
    value;
    alternativeValue;
    options = [];
    installationOptions = [];
    optionsResponse = [];
    optionsDisabled = false;
    defaultOption;
    selfInstall;
    optionSelected;
    timeOut = false;
    installWindows;
    prepayRequired;
    showInstallationDisclosure = false;
    installationRequired = true;
    showInstallationOptions = true;
    installationDisclosure;
    installationLabel = INSTALLATION_LABEL;
    deliveryDate;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        INSTALLATION_TAB_NAME,
        INSTALLATION_OPTIONS_TITLE,
        SELECT_ALT_INSTALL_DATE,
        REFRESH_DATES_BUTTON_LABEL,
        SERVICE_INFO_TITLE,
        SPINNER_TEXT,
        CHARTER
    };
    showSelfServiceCancelModal = false;
    noOptions = false;

    get showPrevious() {
        return !this.creditCheckPerformed;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        this.cart = { ...this.cartInfo };
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.callInstallationData();
    }

    handleRefresh() {
        this.timeOut = false;
        this.callInstallationData();
    }

    handleOptionSchedule(option) {
        this.selfInstall = option.type === "Self Install Option";
        this.showInstallationDisclosure = option.scheduleType === "FutureShip";
        this.installationRequired = !this.selfInstall;
        this.showInstallationOptions = option.scheduleType !== NONE;
        this.installationLabel = this.installationRequired ? INSTALLATION_LABEL : SELECT_ALT_SHIPPING_DATE;
        this.installationDisclosure = option.estimatedDeliveryText;
        if (option.estimatedDeliveryDate !== null) {
            this.deliveryDate = option.estimatedDeliveryDate;
        }
        this.noCompleteInfo = !this.selfInstall;
        this.dateValue = {};
        if (this.showInstallationOptions) {
            this.callInstallationDates();
        } else {
            this.handleCartSummary();
        }
    }

    callInstallationDates() {
        const path = "installation";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            getInstallationSlots: true
        };
        console.log("Get Installation Dates Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Get Installation Dates Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
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
                    this.handleCartSummary();
                    if (result.installWindows !== undefined && result.installWindows !== null) {
                        this.handleInstallationSchedule(result.installWindows);
                    }
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const genericErrorMessage = GET_INSTALL_DATE_ERROR;
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
                console.log(JSON.parse(JSON.stringify(error)));
            });
    }

    handleInstallationSchedule(windows) {
        const today = new Date();
        today.setDate(today.getDate() + 30);
        let installWindows = [];
        this.installWindows = [...windows];
        this.earliestDate = windows[0];
        this.installWindows.forEach((item, index) => {
            if (this.selfInstall) {
                if (Date.parse(today) >= Date.parse(item.date)) {
                    installWindows.push({
                        label: `${item.date} ${
                            item.startTime !== item.endTime ? " " + item.startTime + " - " + item.endTime : ""
                        }`,
                        value: String(index)
                    });
                }
            } else {
                installWindows.push({
                    label: `${item.date} ${
                        item.startTime !== item.endTime ? " " + item.startTime + " - " + item.endTime : ""
                    }`,
                    value: String(index)
                });
            }
        });
        this.options = [...installWindows];
    }

    callInstallationData() {
        this.loaderSpinner = true;
        const path = "finalizeShoppingCart";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId
        };
        console.log("Finalize Shopping Cart Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Finalize Shopping Cart Response", result);
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
                    this.timeOut = true;
                    this.loaderSpinner = false;
                } else {
                    const path = INSTALLATION_TAB_NAME.toLowerCase();
                    let myData = {
                        path,
                        partnerName: CHARTER,
                        offerId: this.productSelection.offerId,
                        sessionId: this.productSelection.sessionId,
                        getInstallationOptions: true
                    };
                    console.log("Get Installation Options Request", myData);
                    let apiResponse;
                    callEndpoint({ inputMap: myData })
                        .then((response) => {
                            apiResponse = response;
                            const result = JSON.parse(response);
                            console.log("Get Installation Options Response", result);
                            if (result.hasOwnProperty(ERROR_VARIANT)) {
                                let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                                    result.error.hasOwnProperty("provider")
                                        ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                            ? result.error.provider.message.technicalMessage
                                            : result.error.provider.message.hasOwnProperty("message")
                                            ? result.error.provider.message.message
                                            : result.error.provider.message
                                        : result.error.message
                                }.`;
                                const event = new ShowToastEvent({
                                    title: SERVER_ERROR,
                                    variant: ERROR_VARIANT,
                                    mode: STICKY_MODE,
                                    message: errorMessage
                                });
                                this.dispatchEvent(event);
                                let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace(
                                    "{1}",
                                    response
                                );
                                this.logError(finalErrorLog, myData, path, API_ERROR);
                                this.timeOut = true;
                                this.loaderSpinner = false;
                            } else {
                                if (result.installationOption.length > 0) {
                                    this.optionsResponse = [...result.installationOption];
                                    let options = [];
                                    result.installationOption.forEach((option, index) => {
                                        let installOption = {
                                            label: `${option.description} - ${
                                                option.pricing.hasOwnProperty("netPriceText") &&
                                                option.pricing.netPriceText !== ""
                                                    ? option.pricing.netPriceText
                                                    : option.listPriceText
                                            } ${this.prepayRequired ? INCLUDED_REQUIRED_PREPAYMENT_ERROR : ""}`,
                                            value: String(index)
                                        };
                                        options.push(installOption);
                                        if (option.selected) {
                                            this.optionSelected = String(index);
                                            this.defaultOption = option.id;
                                            this.handleOptionSchedule(option);
                                        }
                                    });
                                    if (options.length == 1) {
                                        this.optionsDisabled = true;
                                    }
                                    this.installationOptions = [...options];
                                } else {
                                    this.loaderSpinner = false;
                                    const genericErrorMessage = GET_INSTALL_OPTIONS_ERROR;
                                    const event = new ShowToastEvent({
                                        title: SERVER_ERROR,
                                        variant: "warning",
                                        mode: STICKY_MODE,
                                        message: genericErrorMessage
                                    });
                                    this.dispatchEvent(event);
                                    this.noOptions = true;
                                    this.showInstallationOptions = false;
                                    this.noCompleteInfo = false;
                                    this.handleCartSummary();
                                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", genericErrorMessage).replace(
                                        "{1}",
                                        response
                                    );
                                    this.logError(finalErrorLog, myData, path, API_ERROR);
                                }
                            }
                        })
                        .catch((error) => {
                            this.timeOut = true;
                            this.loaderSpinner = false;
                            const genericErrorMessage = GET_INSTALL_DATE_ERROR;
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
                            console.log(JSON.parse(JSON.stringify(error)));
                        });
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const genericErrorMessage = GET_INSTALL_DATE_ERROR;
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
                console.log(error);
            });
    }

    handleOption(event) {
        this.optionSelected = event.target.value;
        this.optionsResponse.forEach((option, index) => {
            option.selected = event.target.value == index;
            if (option.selected) {
                if (option.id !== this.defaultOption) {
                    this.changeInstallationOption(option);
                } else {
                    this.handleCartSummary();
                }
            }
        });
    }

    handleCartSummary() {
        this.loaderSpinner = true;
        const path = "cartSummary";
        let myData = {
            path,
            partnerName: CHARTER,
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
                    let errorMessage = `${result.message !== undefined ? result.message : ""} ${
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
                } else {
                    let internetCharges = [];
                    let phoneCharges = [];
                    let mobileCharges = [];
                    let firstBillCharges = [];
                    let hasFirstBill = true;
                    let monthlyTotal = 0;
                    let firstBillTotal = 0;
                    let monthlyTaxes = 0;
                    let firstBillTaxes = 0;
                    result.monthlyItems.items.forEach((item) => {
                        let newCharge = {
                            name: `${item.quantity > 1 ? `${item.quantity} ` : ""}${item.description}${
                                item.quantity > 1 ? "s" : ""
                            }`,
                            fee:
                                item.pricing.netPrice !== undefined
                                    ? item.quantity !== null
                                        ? Number(Number(item.pricing.netPrice) * item.quantity).toFixed(2)
                                        : Number(item.pricing.netPrice).toFixed(2)
                                    : (0.0).toFixed(2),
                            type: item.productType,
                            discount:
                                item.pricing.netPrice !== undefined
                                    ? Number(item.pricing.netPrice) * item.quantity <= 0
                                    : false,
                            included:
                                item.pricing.netPrice !== undefined && item.quantity !== null
                                    ? Number(item.pricing.netPrice) * item.quantity == 0
                                    : false
                        };
                        if (item.lineOfBusiness.toLowerCase() === "internet") {
                            internetCharges.push(newCharge);
                        } else if (item.lineOfBusiness.toLowerCase() === "mobile") {
                            mobileCharges.push(newCharge);
                        } else {
                            phoneCharges.push(newCharge);
                        }
                    });
                    let charges = [...internetCharges, ...phoneCharges, ...mobileCharges];
                    charges.forEach(
                        (charge) => (monthlyTotal = (Number(monthlyTotal) + Number(charge.fee)).toFixed(2))
                    );
                    let monthlyCharges = {
                        phone: [...phoneCharges],
                        internet: [...internetCharges],
                        mobile: [...mobileCharges]
                    };
                    if (result.hasOwnProperty("onetimeItems") && result.onetimeItems.items.length > 0) {
                        result.onetimeItems.items.forEach((item) => {
                            let newCharge = {
                                name: item.description,
                                fee:
                                    item.pricing.netPrice !== undefined
                                        ? item.quantity !== null
                                            ? Number(Number(item.pricing.netPrice) * item.quantity).toFixed(2)
                                            : Number(item.pricing.netPrice).toFixed(2)
                                        : (0.0).toFixed(2),
                                type: item.productType,
                                discount:
                                    item.pricing.netPrice !== undefined
                                        ? Number(item.pricing.netPrice) * item.quantity <= 0
                                        : false,
                                included:
                                    item.pricing.netPrice !== undefined && item.quantity !== null
                                        ? Number(item.pricing.netPrice) * item.quantity == 0
                                        : false
                            };
                            firstBillCharges.push(newCharge);
                        });
                        firstBillCharges.forEach(
                            (charge) => (firstBillTotal = (Number(firstBillTotal) + Number(charge.fee)).toFixed(2))
                        );
                    }
                    let estimatedTaxes = { ...result.estimatedTaxes };
                    if (estimatedTaxes.totalMonthlyTaxes >= 0) {
                        monthlyTaxes = Number(estimatedTaxes.totalMonthlyTaxes).toFixed(2);
                    }
                    if (estimatedTaxes.totalOneTimeTaxes >= 0) {
                        firstBillTaxes = Number(estimatedTaxes.totalOneTimeTaxes).toFixed(2);
                    }
                    monthlyTotal = (Number(monthlyTotal) + Number(monthlyTaxes)).toFixed(2);
                    firstBillTotal = (Number(monthlyTotal) + Number(firstBillTotal) + Number(firstBillTaxes)).toFixed(
                        2
                    );
                    this.cart = {
                        ...this.cart,
                        monthlyCharges,
                        monthlyTotal,
                        monthlyTaxes,
                        firstBillCharges,
                        firstBillTotal,
                        firstBillTaxes,
                        hasFirstBill
                    };
                }
                this.loaderSpinner = false;
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

    handleDate(event) {
        this.value = event.target.value;
        this.dateValue.installationDetail = this.installWindows[Number(event.target.value)];
        this.noCompleteInfo = this.installationRequired
            ? !(event.target.value !== undefined && this.alternativeValue !== undefined)
            : !(event.target.value !== undefined);
    }

    handleAlternativeDate(event) {
        this.alternativeValue = event.target.value;
        this.alternativeDateValue.installationDetail = this.installWindows[Number(event.target.value)];
        this.noCompleteInfo = this.installationRequired
            ? !(event.target.value !== undefined && this.value !== undefined)
            : !(event.target.value !== undefined);
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

    handleGoBack() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    changeInstallationOption(option) {
        this.loaderSpinner = true;
        const path = INSTALLATION_TAB_NAME.toLowerCase();
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            installationOptionId: this.optionsResponse.filter((option) => option.selected)[0].id
        };
        console.log("Change Installation Option Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Change Installation Option Response", result);
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
                    this.loaderSpinner = false;
                } else {
                    this.handleOptionSchedule(option);
                    this.defaultOption = myData.installationOptionId;
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const genericErrorMessage = CHANGE_INSTALL_OPTIONS_ERROR;
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
                console.log(error);
            });
    }

    handleGoToConfirmation() {
        if (!this.noOptions && this.value !== undefined && this.value === this.alternativeValue) {
            const event = new ShowToastEvent({
                title: INSTALL_DATE_SELECTION_TITLE,
                variant: ERROR_VARIANT,
                mode: STICKY_MODE,
                message: INSTALL_DATE_SELECTION_ERROR
            });
            this.dispatchEvent(event);
            return;
        }
        let info = {
            dateValue: this.noOptions ? "" : this.dateValue,
            alternativeDateValue: this.alternativeDateValue,
            cart: this.cart,
            installationSchedule: !((this.selfInstall && Object.keys(this.dateValue).length === 0) || this.noOptions),
            earliestDate: this.noOptions ? "" : this.earliestDate,
            installationType: this.noOptions
                ? NO_OPTIONS_FETCHED
                : this.optionsResponse.filter((option) => option.selected)[0].description,
            selfInstall: this.selfInstall,
            deliveryDate:
                this.deliveryDate !== undefined && this.value === undefined && this.showInstallationOptions
                    ? this.deliveryDate
                    : NONE_LOWERCASE
        };
        const forwardEvent = new CustomEvent("tpvnext", {
            detail: info
        });
        this.dispatchEvent(forwardEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }
    handleRefreshDates(event) {
        this.callInstallationData();
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: INSTALLATION_TAB_NAME,
            component: "poe_lwcBuyflowSpectrumApiInstallationTab",
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
            tab: INSTALLATION_TAB_NAME
        };
        this.dispatchEvent(event);
    }
}