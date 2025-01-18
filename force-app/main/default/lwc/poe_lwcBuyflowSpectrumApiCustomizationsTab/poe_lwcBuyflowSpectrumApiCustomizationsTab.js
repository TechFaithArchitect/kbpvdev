import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import ToastContainer from "lightning/toastContainer";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import IN_HOME_WIFI_ID from "@salesforce/label/c.Spectrum_In_Home_Wifi_ID";
import WIFI_ACTIVATION_FEE_ID from "@salesforce/label/c.Spectrum_Wifi_Activation_Fee_ID";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import CHARTER from "@salesforce/label/c.charter";
import SPINNER_TEXT from "@salesforce/label/c.Spinner_Alternative_Text";
import PRICE_LABEL from "@salesforce/label/c.Spectrum_Customizations_Price_Label";
import SELECT_OPTION from "@salesforce/label/c.Spectrum_Select_Option_Label";
import PRICE_VARIATION_MESSAGE from "@salesforce/label/c.Spectrum_Price_Variation_Label";
import CHECK_PORTABILITY_MESSAGE from "@salesforce/label/c.Spectrum_Check_Number_Portability_Message";
import GENERIC_INVALID_PHONE_ERROR from "@salesforce/label/c.Invalid_Phone_Number_Generic_Error_Message";
import CHECK_PORTABILITY_BUTTON_LABEL from "@salesforce/label/c.Spectrum_Check_Portability_Button_Label";
import REMOVE_PRODUCT_ALT_TEXT from "@salesforce/label/c.Spectrum_Remove_Product_Alt_Text";
import ADD_PRODUCT_ALT_TEXT from "@salesforce/label/c.Spectrum_Add_Product_Alt_Text";
import PHONE_NUMBER from "@salesforce/label/c.Spectrum_Phone_Number_Field_Label";
import PHONE_PORTABILITY_TITLE from "@salesforce/label/c.Spectrum_Phone_Portability_Modal_Title";
import SERVER_ERROR from "@salesforce/label/c.Server_Error_Toast_Title";
import OPPORTUNITY_OBJ_NAME from "@salesforce/label/c.Opportunity_Object_Name";
import API_ERROR from "@salesforce/label/c.API_Error";
import GENERIC_ERROR from "@salesforce/label/c.Toast_Generic_Error_Title";
import GENERIC_ERROR_LOG from "@salesforce/label/c.Generic_Error_Log";
import ERROR_VARIANT from "@salesforce/label/c.error_variant";
import STICKY_MODE from "@salesforce/label/c.sticky_mode";
import CUSTOMIZATION_GENERIC_ERROR from "@salesforce/label/c.Spectrum_Customizations_Generic_Error_Message";
import SERVICE_UNREACHABLE from "@salesforce/label/c.Service_unreachable";
import PHONE_NOT_PORTABLE_ERROR from "@salesforce/label/c.Spectrum_Phone_Not_Portable_Error_Message";
import NO_CUSTOMIZATIONS_ERROR from "@salesforce/label/c.Spectrum_No_Customizations_Found_Message";
import MAX_SELECTION_MESSAGE from "@salesforce/label/c.Spectrum_Max_Selection_Message";
import SELECTION_NEGATIVE_ERROR from "@salesforce/label/c.Spectrum_Selection_Cant_Be_Negative_Error";
import GENERIC_REQUEST_ERROR_MESSAGE from "@salesforce/label/c.viasat_request_could_not_be_made_correctly";
import CUSTOMIZATIONS_TAB_NAME from "@salesforce/label/c.Customizations_Tab_Name_Label";

const XUMO_BOXES_ID = "1-F8VIKW";
const XUMO_EQUIPMENT_ID = "1-F8VIKU";

export default class Poe_lwcBuyflowSpectrumApiCustomizationsTab extends NavigationMixin(LightningElement) {
    @api cartInfo;
    @api productSelection;
    @api logo;
    @api hasPhone;
    @api hasMobile;
    @api recordId;
    @api orderInfo;
    @api isGuestUser;
    @api storedConfigurations = {};
    showCollateral = false;
    hasOffers = false;
    linesOfBusiness = [];
    configurations = [];
    configurationProducts = [];
    loaderSpinner;
    disableNext = true;
    inputInvalid = false;
    cart = {};
    timeoutId;
    showPortableNumber;
    validationError;
    modalTitle = PHONE_PORTABILITY_TITLE;
    showModal = false;
    portableSuccess = false;
    portablePhone;
    modalBody;
    initialLoad = true;
    portableConfigurations = [];
    invalidPhone = true;
    csrRecordStatus = [];
    nativeLine;
    phoneContent;
    internetContent;
    lineId;
    disableWifiActivationFeeCheckbox = false;
    phone;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        CHARTER,
        SPINNER_TEXT,
        PRICE_LABEL,
        SELECT_OPTION,
        PRICE_VARIATION_MESSAGE,
        CHECK_PORTABILITY_MESSAGE,
        CHECK_PORTABILITY_BUTTON_LABEL,
        GENERIC_INVALID_PHONE_ERROR,
        REMOVE_PRODUCT_ALT_TEXT,
        ADD_PRODUCT_ALT_TEXT,
        PHONE_NUMBER
    };
    showSelfServiceCancelModal = false;
    mobileSelected = false;
    latestFilteredMobileResponse;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        this.loaderSpinner = true;
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        if (
            this.storedConfigurations.hasOwnProperty("filteredMobile") &&
            this.storedConfigurations.hasOwnProperty("cart") &&
            this.storedConfigurations?.productSelection.name == this.productSelection.name
        ) {
            this.restorePreviousSelection(this.storedConfigurations);
            this.loaderSpinner = false;
        } else {
            this.cart = { ...this.cartInfo };
            this.handleConfigurationCallout();
            if (this.orderInfo.customer.phoneNumber != "") {
                this.handlePhone({
                    target: { value: this.orderInfo.customer.phoneNumber }
                });
            }
        }
    }

    hideModal(event) {
        this.showModal = false;
    }

    handleModalConfirm(event) {
        this.showModal = false;
        if (this.portableConfigurations.length > 0) {
            this.portableConfigurations = [...event.detail.attributes];
        }
        this.validatePortability();
    }

    validatePortability() {
        this.loaderSpinner = true;
        let phoneConfigurations = this.linesOfBusiness.filter((line) => line.name.toLowerCase().includes("phone"))[0];
        const path = "numberPortability";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            phoneAttributes: {
                productId: phoneConfigurations.configurations.filter(
                    (configuration) => configuration.name.toLowerCase() === "level of service"
                )[0].product.masterProductId,
                lineId: this.lineId,
                phoneNumber: this.phone,
                nativeLine: this.nativeLine,
                csrRecordStatus: [...this.csrRecordStatus],
                attribute: [...this.portableConfigurations]
            }
        };
        console.log("Validate Portability Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Validate Portability Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
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
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", response);
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    this.portableSuccess = true;
                    this.portablePhone = this.phone;
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        mode: STICKY_MODE,
                        message: result.hasOwnProperty("message")
                            ? result.message
                            : "Phone attribute details submitted."
                    });
                    this.dispatchEvent(event);
                }
                this.disableValidations();
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = CUSTOMIZATION_GENERIC_ERROR;
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

    handlePhone(event) {
        this.portableSuccess = false;
        let phonere = /^\d{10}$/;
        this.phone = event.target.value;
        this.invalidPhone = !phonere.test(event.target.value);
        this.disableValidations();
    }

    handlePortability() {
        this.loaderSpinner = true;
        this.portableConfigurations = [];
        this.portablePhone = "";
        this.modalBody = "";
        this.portableSuccess = false;
        let phoneConfigurations = this.linesOfBusiness.filter((line) => line.name.toLowerCase().includes("phone"))[0];
        const path = "numberPortability";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            getPhoneAttributes: true,
            productId: phoneConfigurations.configurations.filter(
                (configuration) => configuration.name.toLowerCase() === "level of service"
            )[0].product.masterProductId,
            phoneNumber: this.phone,
            lineId: "1"
        };
        console.log("Verify Portability Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Verify Portability Response", result);
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
                    if (result.hasOwnProperty("portable") && !result.portable) {
                        let finalModalBody = PHONE_NOT_PORTABLE_ERROR.replace(
                            "{0}",
                            result.hasOwnProperty("portabilityFailReason") ? result.portabilityFailReason : "Unknown"
                        );
                        this.modalBody = finalModalBody;
                    } else if (result.hasOwnProperty("phoneAttributes")) {
                        if (
                            result.phoneAttributes.csrRecordStatus.length > 0 &&
                            result.phoneAttributes.csrRecordStatus.some((item) => item.status.toLowerCase() !== "green")
                        ) {
                            result.phoneAttributes.csrRecordStatus.forEach((item) => {
                                if (item.status.toLowerCase() !== "green") {
                                    this.modalBody = this.modalBody + item.statusDescription;
                                }
                            });
                            this.csrRecordStatus = [...result.phoneAttributes.csrRecordStatus];
                        } else {
                            result.phoneAttributes.attribute.forEach((item) => {
                                if (item.required) {
                                    this.portableConfigurations.push(item);
                                }
                            });
                            this.nativeLine = result.phoneAttributes.nativeLine;
                            this.lineId = result.phoneAttributes.lineId;
                            if (this.portableConfigurations.length == 0) {
                                this.validatePortability();
                                return;
                            }
                        }
                        this.disableValidations();
                    }
                    this.showModal = true;
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = CUSTOMIZATION_GENERIC_ERROR;
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

    handleConfigurationCallout() {
        let info = this.productSelection;
        const path = "productDetails";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: info.offerId,
            sessionId: info.sessionId
        };
        console.log("Product Details Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Product Details Response", result);
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
                    if (result.hasOwnProperty("service")) {
                        this.hasOffers = result.service.length > 0;
                        if (this.hasOffers) {
                            let filteredMobile = result.service.filter(
                                (e) => e.lineOfBusiness.toLowerCase() !== "mobile"
                            );
                            this.productDetailResponseWrapper(filteredMobile);
                            this.handleContentCallout(true);
                        } else {
                            const genericErrorMessage = NO_CUSTOMIZATIONS_ERROR;
                            const event = new ShowToastEvent({
                                title: SERVER_ERROR,
                                variant: ERROR_VARIANT,
                                mode: STICKY_MODE,
                                message: genericErrorMessage
                            });
                            this.dispatchEvent(event);
                            let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", genericErrorMessage).replace(
                                "{1}",
                                response
                            );
                            this.logError(finalErrorLog, myData, path, API_ERROR);
                            this.loaderSpinner = false;
                        }
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = CUSTOMIZATION_GENERIC_ERROR;
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

    handleContentCallout(internet) {
        this.loaderSpinner = true;
        const path = "contents";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            contentType: internet ? "internet" : "phone"
        };
        console.log(`${internet ? "Internet" : "Phone"} Content Request`, myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                const result = JSON.parse(res);
                console.log(`${internet ? "Internet" : "Phone"} Content Response`, result);
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
                    if (internet) {
                        this.internetContent = result.content.properties.elements;
                        this.linesOfBusiness = [...this.handleContent(internet)];
                        if (this.linesOfBusiness.some((item) => item.name.toLowerCase() === "phone")) {
                            this.handleContentCallout(false);
                        } else {
                            this.handleCartSummary();
                        }
                    } else {
                        this.phoneContent = result.content.properties.elements;
                        this.linesOfBusiness = [...this.handleContent(internet)];
                        this.handleCartSummary();
                    }
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

    handleContent(internet) {
        let lines = [...this.linesOfBusiness];
        let elements = internet ? { ...this.internetContent } : { ...this.phoneContent };
        let lineValue = internet ? "internet" : "phone";
        lines.forEach((item) => {
            if (item.name.toLowerCase() === lineValue) {
                item.name = internet ? elements.internet__sectionHeader.value : elements.phone__sectionHeader.value;
                if (internet) {
                    if (elements.hasOwnProperty("equipmentOption1__value")) {
                        item.configurations.forEach((element) => {
                            if (
                                element.isMultipleChoice &&
                                element.product.some((e) => e.id == elements.equipmentOption1__value.value)
                            ) {
                                element.description = `${elements.equipment__description.value}`;
                                element.name = elements.hasOwnProperty("equipment__header")
                                    ? elements.equipment__header.value
                                    : elements.equipmentOption1__title.value;
                                if (element.hasOwnProperty("radioOptions")) {
                                    let radioOptionsAux = [...element.radioOptions];
                                    radioOptionsAux[0].name = elements.equipmentOption1__title.value;
                                    radioOptionsAux[0].description = elements.equipmentOption1__description.value;
                                    if (
                                        radioOptionsAux[1].value === "1-29PI" &&
                                        elements.hasOwnProperty("equipmentOption3__title")
                                    ) {
                                        radioOptionsAux[1].name = elements.equipmentOption3__title.value;
                                        radioOptionsAux[1].description = elements.hasOwnProperty(
                                            "equipmentOption3__description"
                                        )
                                            ? elements.equipmentOption3__description.value
                                            : "";
                                    }
                                    if (radioOptionsAux.length > 2 && radioOptionsAux[2].value === "11CBRKZ") {
                                        radioOptionsAux[2].name = elements.equipmentOption2__title.value;
                                        radioOptionsAux[2].description = elements.equipmentOption2__description.value;
                                    }
                                    element.radioOptions = [...radioOptionsAux];
                                }
                                element.order = 1;
                            }
                        });
                    }
                    if (elements.hasOwnProperty("equipmentOption2__value")) {
                        item.configurations.forEach((element) => {
                            if (element.product.id == elements.equipmentOption2__value.value) {
                                element.description = elements.equipmentOption2__description.value;
                                element.name = elements.equipmentOption2__title.value;
                                element.order = 2;
                            }
                        });
                    }
                    if (elements.hasOwnProperty("equipmentOption3__value")) {
                        item.configurations.forEach((element) => {
                            if (element.product.id == elements.equipmentOption3__value.value) {
                                element.description = elements.equipmentOption3__description.value;
                                element.name = elements.equipmentOption3__title.value;
                                element.order = 3;
                            }
                        });
                    }
                    if (elements.hasOwnProperty("equipmentOption4__value")) {
                        item.configurations.forEach((element) => {
                            if (element.product.id == "11EEROY") {
                                if (elements.hasOwnProperty("equipmentOption4__details")) {
                                    element.description = elements.equipmentOption4__details.value;
                                } else {
                                    element.description = elements.equipmentOption4__description.value;
                                    element.name = elements.equipmentOption4__title.value;
                                    element.order = 4;
                                }
                            }
                        });
                    }
                    if (elements.hasOwnProperty("mobile__description")) {
                        item.configurations.forEach((element) => {
                            if (element.id == "1-8PVP6V") {
                                element.description = elements.mobile__description.value;
                                element.name = elements.mobile__header.value;
                                element.product.name = Array.isArray(elements.mobileOption1__title.value)
                                    ? elements.mobileOption1__title.value[0]
                                    : elements.mobileOption1__title.value;
                                element.order = 5;
                            }
                        });
                    }
                } else {
                    if (elements.hasOwnProperty("directoryListing__header")) {
                        item.configurations.forEach((element) => {
                            if (element.name === "Private Number Selection" && element.isMultipleChoice) {
                                element.name = elements.directoryListing__header.value;
                                element.description = elements.hasOwnProperty("directoryListing__description")
                                    ? elements.directoryListing__description.value
                                    : "";
                                element.order = 1;
                                if (element.hasOwnProperty("radioOptions")) {
                                    let radioOptionsAux = [...element.radioOptions];
                                    radioOptionsAux[0].name = elements.directoryListingOption1__title.value;
                                    if (radioOptionsAux[1].value === "5075252") {
                                        radioOptionsAux[1].name = elements.directoryListingOption2__title.value;
                                    }
                                    element.radioOptions = [...radioOptionsAux];
                                }
                            }
                        });
                    }
                    if (elements.hasOwnProperty("phoneLine__header")) {
                        item.configurations.forEach((element) => {
                            if (element.name === "Telephone Number Options" && element.isMultipleChoice) {
                                element.name = elements.phoneLine__header.value;
                                element.order = 2;
                                if (element.hasOwnProperty("radioOptions")) {
                                    let radioOptionsAux = [...element.radioOptions];
                                    radioOptionsAux[0].name = elements.phoneLineOption2__title.value;
                                    if (radioOptionsAux[1].value === "5075202") {
                                        radioOptionsAux[1].name = elements.phoneLineOption1__title.value;
                                    }
                                    element.radioOptions = [...radioOptionsAux];
                                }
                            }
                        });
                    }
                    if (elements.hasOwnProperty("addOnsOption1__value")) {
                        item.configurations.forEach((element) => {
                            if (element.product.id == elements.addOnsOption1__value.value) {
                                element.description = elements.addOnsOption1__description.value;
                                element.name =
                                    Array.isArray(elements.addOnsOption1__title.value) &&
                                    elements.addOnsOption1__title.value.length > 0
                                        ? elements.addOnsOption1__title.value[0]
                                        : elements.addOnsOption1__title.value;
                                element.order = 3;
                                element.product.name = element.name;
                            }
                        });
                    }
                    if (elements.hasOwnProperty("addOnsOption2__value")) {
                        item.configurations.forEach((element) => {
                            if (element.product.id == elements.addOnsOption2__value.value) {
                                element.description = elements.addOnsOption2__description.value;
                                element.name =
                                    Array.isArray(elements.addOnsOption1__title.value) &&
                                    elements.addOnsOption2__title.value.length > 0
                                        ? elements.addOnsOption2__title.value[0]
                                        : elements.addOnsOption2__title.value;
                                element.product.name = element.name;
                                element.order = 4;
                            }
                        });
                    }
                }
                item.configurations.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
            }
        });
        return lines;
    }

    productDetailResponseWrapper(linesOfBusiness) {
        this.configurations = [];
        this.configurationProducts = [];
        let linesOfBusinessAux = [];

        const buildProductObject = (productData, configuration) => {
            const product = {
                isRequired: configuration.isRequired,
                category: configuration.name,
                disabled:
                    configuration.disabled ||
                    (this.disableWifiActivationFeeCheckbox && productData.masterProductId === WIFI_ACTIVATION_FEE_ID),
                lineId: configuration.lineId,
                lineName: configuration.lineName.toLowerCase() === "phone" ? "phone" : "internet",
                configId: configuration.id,
                checked: productData.hasOwnProperty("value") ? Number(productData.value) > 0 : productData.selected,
                id: productData.id,
                minReached: productData.hasOwnProperty("value") ? Number(productData.value) == 0 : true,
                maxReached: productData.hasOwnProperty("value")
                    ? Number(productData.value) == Number(configuration.maxSelection)
                    : false,
                masterProductId: productData.masterProductId,
                configurationId: configuration.id,
                name: productData.name,
                type: productData.pricing?.type == "Monthly" ? "Per Month" : productData.pricing?.type,
                showPrice:
                    productData.pricing.hasOwnProperty("netPrice") && productData.pricing.netPrice > 0 ? true : false,
                hasDiscount: productData.pricing?.discountAmount > 0,
                netPriceText:
                    configuration.name.toLowerCase() === "level of service" &&
                    configuration.lineName.toLowerCase() === "internet"
                        ? `$${
                              productData.pricing.displayPrice !== null
                                  ? Number(productData.pricing.displayPrice).toFixed(2)
                                  : Number(productData.pricing.netPrice).toFixed(2)
                          } ${productData.pricing.displayPriceType}`
                        : productData.pricing?.netPriceText,
                discountTermText: productData.pricing?.discountTermText,
                listPriceText:
                    productData.pricing?.netPriceText !== null && productData.pricing?.netPriceText !== ""
                        ? productData.pricing?.netPriceText
                        : "$0.00",
                discountTerm: productData.pricing?.discountTerm,
                discountAmount: productData.pricing?.discountAmount,
                displayPriceType: productData.pricing?.displayPriceType,
                listPrice: productData.pricing?.listPrice,
                netPrice: productData.pricing?.netPrice,
                selectedQuantity: productData.hasOwnProperty("value") ? Number(productData.value) : 0,
                term: productData.pricing?.term
            };

            if (product.masterProductId === IN_HOME_WIFI_ID) {
                this.disableWifiActivationFeeCheckbox = product.checked;
            }

            return product;
        };

        linesOfBusiness.forEach((line) => {
            let configurationsAux = [];
            let configurationProductsAux = [];
            let newLine = {};
            newLine.name = line.name;
            newLine.id = line.id;
            let configurationsArray = [
                ...line.configuration.filter(
                    (c) =>
                        c.masterProductId !== XUMO_BOXES_ID &&
                        c.masterProductId !== XUMO_EQUIPMENT_ID &&
                        !c.name.toLowerCase().includes("xumo") &&
                        c.product !== null
                )
            ];
            configurationsArray.forEach((configuration) => {
                let maxSelectionMessage = MAX_SELECTION_MESSAGE.replace("{0}", configuration.max);
                let configurationAux = {
                    lineId: line.id,
                    lineName: line.name,
                    id: configuration.id,
                    masterProductId: configuration.masterProductId,
                    name: configuration.name,
                    description: configuration.description,
                    maxSelection: configuration.max,
                    maxSelectionMessage: maxSelectionMessage,
                    selectedQuantity: configuration.min === 1 ? 1 : 0,
                    isRequired: configuration.min === 1,
                    isCheckbox:
                        configuration.product.length === 1 &&
                        (configuration.max === 1 ||
                            configuration.id === "1-8PVP6V" ||
                            configuration.name === "Mobile Plans Agents"),
                    isRadio: configuration.product.length > 1 && configuration.max === 1,
                    isPortableRadio:
                        configuration.masterProductId === "1-1FO95P" ||
                        configuration.name === "Telephone Number Options",
                    isMultiSelect:
                        configuration.max > 1 &&
                        !(configuration.id === "1-8PVP6V" || configuration.name === "Mobile Plans Agents"),
                    isMultipleChoice: configuration.product.length > 1,
                    disabled:
                        configuration.name === "Level of Service" ||
                        (configuration.min === 1 &&
                            configuration.max === 1 &&
                            configuration.product.length === 1 &&
                            configuration.product[0].selected)
                };

                if (configurationAux.isRadio) {
                    configurationAux.radioOptions = configuration.product.map((product) => ({
                        name: product.name,
                        value: product.id,
                        id: product.id,
                        checked: product.selected,
                        fee: product.pricing.netPrice !== null ? Number(product.pricing.netPrice).toFixed(2) : 0.0,
                        description: "",
                        feeText:
                            product.pricing.netPrice !== null && Number(product.pricing.netPrice) > 0
                                ? `$${Number(product.pricing.netPrice).toFixed(2)}`
                                : "(No additional cost)"
                    }));
                }

                if (configurationAux.isMultipleChoice) {
                    configuration.product.forEach((configurationProduct) => {
                        let configurationProductAux = buildProductObject(configurationProduct, configurationAux);
                        configurationProductsAux.push(configurationProductAux);
                        this.configurationProducts.push(configurationProductAux);
                    });
                    configurationAux.product = configurationProductsAux;
                } else {
                    let product = buildProductObject(configuration.product[0], configurationAux);
                    configurationAux.product = product;
                    this.configurationProducts.push(product);
                }
                this.configurations.push(configurationAux);
                configurationsAux.push(configurationAux);
            });
            newLine.configurations = [...configurationsAux];
            newLine.order = newLine.name.toLowerCase().includes("internet") ? 1 : 2;
            linesOfBusinessAux.push(newLine);
        });
        linesOfBusinessAux.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
        this.linesOfBusiness = [...linesOfBusinessAux];
    }

    handleChange(event) {
        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
        }
        this.loaderSpinner = true;
        let inputType = event.currentTarget.tagName.toLowerCase();
        let data = {
            inputType,
            configId: event.currentTarget.dataset.configid,
            currentTarget: event.currentTarget,
            productId:
                inputType === "lightning-input" || inputType === "lightning-button-icon" || inputType === "input"
                    ? event.currentTarget.dataset.id
                    : event.target.value
        };
        this.timeoutId = setTimeout(() => this.handleInput(data), 500);
    }

    handleInput(data) {
        let auxArray = [...this.linesOfBusiness];
        const inputType = data.inputType;
        const configId = data.configId;
        let auxConfigurationProducts = [...this.configurationProducts.filter((item) => item.configId !== configId)];
        let productId;
        let selectedProduct;
        let inputValue;
        let inputError = false;
        if (inputType === "lightning-button-icon") {
            let buttonClicked = data.currentTarget;
            let parentContainer = buttonClicked.closest(".slds-box");
            let inputElement = parentContainer.querySelector("lightning-input");
            inputValue = Number(inputElement.value);
        }

        let selection = {
            cartOperation: "",
            quantity: "0",
            name: "",
            isRadio: false
        };
        switch (inputType) {
            case "lightning-input":
                productId = data.productId;
                auxArray.forEach((lineOfBusiness) => {
                    lineOfBusiness.configurations.forEach((config) => {
                        if (Array.isArray(config.product)) {
                            config.product.forEach((product) => {
                                if (product.id === productId) {
                                    product.checked = !product.checked;
                                    product.selectedQuantity = product.checked ? 1 : 0;
                                    selection.name = product.name;
                                    selection.cartOperation = product.checked ? "add" : "remove";
                                    selection.quantity = product.selectedQuantity;
                                    auxConfigurationProducts.push(product);
                                }
                            });
                        } else if (config.product.id === productId) {
                            if (config.isMultiSelect) {
                                if (
                                    Number(data.currentTarget.value) > Number(config.maxSelection) ||
                                    Number(data.currentTarget.value) < 0
                                ) {
                                    const toastEvent = new ShowToastEvent({
                                        title: GENERIC_ERROR,
                                        variant: ERROR_VARIANT,
                                        mode: STICKY_MODE,
                                        message:
                                            Number(data.currentTarget.value) < 0
                                                ? SELECTION_NEGATIVE_ERROR
                                                : config.maxSelectionMessage
                                    });
                                    this.dispatchEvent(toastEvent);
                                    this.loaderSpinner = false;
                                    this.inputInvalid = true;
                                    inputError = true;
                                    return;
                                } else {
                                    this.inputInvalid = false;
                                    config.product.minReached = data.currentTarget.value == 0;
                                    config.product.maxReached = data.currentTarget.value >= config.maxSelection;
                                    selection.cartOperation =
                                        data.currentTarget.value === null ||
                                        data.currentTarget.value == undefined ||
                                        data.currentTarget.value == ""
                                            ? "remove"
                                            : config.product.selectedQuantity == 0
                                            ? "add"
                                            : "change";
                                    config.product.selectedQuantity = Math.min(
                                        data.currentTarget.value,
                                        config.maxSelection
                                    );
                                    config.product.checked = config.product.selectedQuantity > 0;
                                    selection.name = config.name;
                                    selection.quantity = config.product.selectedQuantity;
                                    auxConfigurationProducts.push(config.product);
                                }
                            } else {
                                config.product.checked = !config.product.checked;
                                config.product.selectedQuantity = 1;
                                selection.name = config.product.name;
                                selection.cartOperation = config.product.checked ? "add" : "remove";
                                selection.quantity = config.product.selectedQuantity;
                                auxConfigurationProducts.push(config.product);
                            }
                        }
                    });
                });
                break;
            case "lightning-radio-group":
            case "input":
                selection.isRadio = true;
                productId = data.productId;
                auxArray.forEach((lineOfBusiness) => {
                    lineOfBusiness.configurations.forEach((config) => {
                        if (config.isRadio && config.id === configId) {
                            config.product.forEach((product) => {
                                if (product.configId === configId) {
                                    if (product.id === productId) {
                                        product.checked = true;
                                        product.selectedQuantity = 1;
                                        selection.name = product.name;
                                        selection.quantity = product.selectedQuantity;
                                        selection.cartOperation = "add";
                                        if (
                                            product.masterProductId === "5075201" ||
                                            product.masterProductId === "5075202"
                                        ) {
                                            this.showPortableNumber = product.masterProductId === "5075201";
                                        }
                                    } else {
                                        product.checked = false;
                                        product.selectedQuantity = 0;
                                    }
                                    auxConfigurationProducts.push(product);
                                }
                            });
                        }
                    });
                });
                break;
            case "lightning-button-icon":
                this.inputInvalid = false;
                productId = data.productId;
                selectedProduct = this.configurationProducts.find((prod) => prod.id === productId);
                switch (data.currentTarget.name) {
                    case "add":
                        inputValue === 0 ? (selection.cartOperation = "add") : undefined;
                        inputValue > 0 ? (selection.cartOperation = "change") : undefined;
                        inputValue += 1;
                        break;
                    case "remove":
                        inputValue !== 0 ? (selection.cartOperation = "change") : undefined;
                        inputValue === 0 ? (selection.cartOperation = "remove") : undefined;
                        inputValue -= 1;
                        break;
                }
                auxArray.forEach((lineOfBusiness) => {
                    lineOfBusiness.configurations.forEach((config) => {
                        if (config.id === configId) {
                            config.product.minReached = inputValue === 0;
                            config.product.maxReached = inputValue === config.maxSelection;
                            config.product.selectedQuantity = Math.min(inputValue, config.maxSelection);
                            config.product.checked = config.product.selectedQuantity > 0;
                            auxConfigurationProducts.push(config.product);
                        }
                    });
                });
                selection.name = selectedProduct.name;
                selection.quantity = selectedProduct.selectedQuantity;
                break;
        }
        if (!inputError) {
            this.configurationProducts = [...auxConfigurationProducts];
            this.linesOfBusiness = [...auxArray];
            this.callCartApi(productId, selection);
        }
        this.disableValidations();
    }

    callCartApi(productId, selection) {
        this.loaderSpinner = true;
        let product = this.configurationProducts.find((prod) => prod.id === productId);
        let info = this.productSelection;
        let pathName;
        switch (selection.cartOperation) {
            case "add":
                pathName = "addCart";
                break;
            case "change":
                pathName = "updateCart";
                break;
            case "remove":
                pathName = "removeCart";
                break;
        }
        let myData = {
            path: pathName,
            partnerName: CHARTER,
            offerId: info.offerId,
            sessionId: info.sessionId,
            serviceId: product.lineId,
            configuration: [
                {
                    id: product.configurationId,
                    selection: [
                        {
                            id: product.id,
                            action: selection.cartOperation,
                            quantity: selection.quantity
                        }
                    ]
                }
            ]
        };
        console.log("Cart Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Cart Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
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
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", response);
                    this.logError(finalErrorLog, myData, pathName, API_ERROR);
                    this.loaderSpinner = false;
                } else {
                    let filteredMobile = result.offers[0].service.filter(
                        (e) => e.lineOfBusiness.toLowerCase() !== "mobile"
                    );

                    this.productDetailResponseWrapper(filteredMobile);
                    this.handleCartSummary();
                    this.linesOfBusiness = [...this.handleContent(true)];
                    if (this.linesOfBusiness.some((item) => item.name.toLowerCase() === "phone")) {
                        this.linesOfBusiness = [...this.handleContent(false)];
                    }
                    this.latestFilteredMobileResponse = filteredMobile;
                    this.saveSelection(filteredMobile);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = GENERIC_REQUEST_ERROR_MESSAGE;
                const event = new ShowToastEvent({
                    title: SERVER_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", genericErrorMessage).replace("{1}", apiResponse);
                if (apiResponse) {
                    this.logError(finalErrorLog, myData, pathName, API_ERROR);
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.loaderSpinner = false;
            });
    }

    saveSelection(filteredMobile) {
        let storedConfigurations = {
            filteredMobile: filteredMobile,
            cart: this.cart,
            productSelection: this.productSelection,
            internetContent: this.internetContent,
            phoneContent: this.phoneContent
        };

        const event = new CustomEvent("storeconfigurations", {
            detail: {
                storedConfigurations: storedConfigurations
            }
        });
        this.dispatchEvent(event);
    }

    restorePreviousSelection(storedConfigurations) {
        try {
            this.productSelection = { ...storedConfigurations.productSelection };
            this.internetContent = { ...storedConfigurations?.internetContent };
            this.phoneContent = { ...storedConfigurations?.phoneContent };
            this.latestFilteredMobileResponse = storedConfigurations?.filteredMobile;

            this.productDetailResponseWrapper(this.latestFilteredMobileResponse);

            this.handleCartSummary(true);

            this.linesOfBusiness = [...this.handleContent(true)];

            if (this.linesOfBusiness.some((item) => item.name.toLowerCase() === "phone")) {
                this.linesOfBusiness = [...this.handleContent(false)];
            }

            this.cart = { ...storedConfigurations.cart };
        } catch (error) {
            this.logError(error.message);
            console.log(error.message, error);
        }
    }

    disableValidations() {
        const requiredCategories = new Set();
        this.configurationProducts.forEach((item) => {
            if (item.isRequired) {
                requiredCategories.add(item.category);
            }
        });
        this.configurationProducts.forEach((item) => {
            if (item.isRequired && item.checked) {
                requiredCategories.delete(item.category);
            }
        });
        if (
            requiredCategories.size === 0 &&
            !this.inputInvalid &&
            (!this.showPortableNumber || (this.showPortableNumber && this.portableSuccess && !this.invalidPhone))
        ) {
            this.disableNext = false;
        } else {
            this.disableNext = true;
        }
    }

    handleClick() {
        this.saveSelection(this.latestFilteredMobileResponse);
        let info = {
            cart: this.cart,
            portablePhone:
                this.portablePhone !== undefined && this.portablePhone !== "" && this.portablePhone !== null
                    ? this.portablePhone
                    : this.phone,
            mobileSelected: this.mobileSelected
        };
        let configurationsSelectionEvent = new CustomEvent("next", {
            detail: info
        });
        this.dispatchEvent(configurationsSelectionEvent);
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

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleCartSummary(previousSelection = false) {
        this.loaderSpinner = true;
        const path = "cartSummary";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            returnTaxes: false
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
                    this.mobileSelected = result.monthlyItems.items.some((e) => e.id === "1-7GOJDY");
                    let internetCharges = [];
                    let phoneCharges = [];
                    let mobileCharges = [];
                    let firstBillCharges = [];
                    let hasFirstBill = true;
                    let monthlyTotal = 0;
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
                    let firstBillTotal = monthlyTotal;
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
                    if (!previousSelection) {
                        this.cart = {
                            ...this.cart,
                            monthlyCharges,
                            monthlyTotal,
                            firstBillCharges,
                            firstBillTotal,
                            hasFirstBill
                        };
                    }
                }
                this.disableValidations();
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

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: CUSTOMIZATIONS_TAB_NAME,
            component: "poe_lwcBuyflowSpectrumApiCustomizationsTab",
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
            tab: CUSTOMIZATIONS_TAB_NAME
        };
        this.dispatchEvent(event);
    }
}