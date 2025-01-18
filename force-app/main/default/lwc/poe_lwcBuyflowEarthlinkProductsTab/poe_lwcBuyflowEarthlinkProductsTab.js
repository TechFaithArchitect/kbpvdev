import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveProduct from "@salesforce/apex/ProductTabController.saveProduct";
import getExcludedProducts from "@salesforce/apex/ProductTabController.getEarthLinkExcludedProducts";

import SELF_SERVICE_VALIDATE_LEAVING_MESSAGE from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import SELF_SERVICE_VALIDATE_LEAVING_TITLE from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import WIRELESS_PRODUCT_OPTION_LABEL from "@salesforce/label/c.Wireless_Product_Option_Label";
import WIRED_PRODUCT_OPTION_LABEL from "@salesforce/label/c.Wired_Product_Option_Label";
import WIRED_PRODUCT_PRODUCT_TYPE from "@salesforce/label/c.Wired_Product_Product_Type";
import WIRELESS_PRODUCT_PRODUCT_TYPE from "@salesforce/label/c.Wireless_Product_Product_Type";
import SERVER_ERROR_TOAST_TITLE from "@salesforce/label/c.Server_Error_Toast_Title";
import GENERIC_PRODUCT_ERROR_MESSAGE from "@salesforce/label/c.Chuzo_Generic_Product_Error_Message";
import AGENT_TERMS_AND_CONDITIONS_VERBIAGE from "@salesforce/label/c.Agent_Terms_and_Conditions_Verbiage";
import CUSTOMER_TERMS_AND_CONDITIONS_VERBIAGE from "@salesforce/label/c.Customer_Terms_and_Conditions_Verbiage";
import AGENT_DISAGREE_TERMS_AND_CONDITIONS_LABEL from "@salesforce/label/c.Agent_Disagree_Terms_and_Conditions_Label";
import CUSTOMER_DISAGREE_TERMS_AND_CONDITIONS_LABEL from "@salesforce/label/c.Customer_Disagree_Terms_and_Conditions_Label";
import TERMS_OF_SERVICE_TITLE from "@salesforce/label/c.Terms_of_Service_Title";
import CUSTOMER_TERMS_AND_CONDITIONS_INSTRUCTIONS from "@salesforce/label/c.Customer_Terms_and_Conditions_Instructions";
import AGENT_TERMS_AND_CONDITIONS_INSTRUCTIONS from "@salesforce/label/c.Agent_Terms_and_Conditions_Instructions";
import CUSTOMER_TERMS_AND_CONDITIONS_SHORT_VERBIAGE from "@salesforce/label/c.Customer_Terms_and_Conditions_Short_Verbiage";
import AGENT_TERMS_AND_CONDITIONS_SHORT_VERBIAGE from "@salesforce/label/c.Agent_Terms_and_Conditions_Short_Verbiage";
import PRODUCT_SELECTION_TITLE from "@salesforce/label/c.Product_Selection_Title";
import SALE_TYPE_SELECTION_FIELD_LABEL from "@salesforce/label/c.Sale_Type_Selection_Field_Label";
import PRODUCT_TYPE_SELECTION_FIELD_LABEL from "@salesforce/label/c.Product_Type_Selection_Field_Label";
import EMAIL_BROADBAND_LABELS_BUTTON_LABEL from "@salesforce/label/c.Email_Broadband_Labels_Button_Label";
import SEE_DETAILS_BUTTON_LABEL from "@salesforce/label/c.See_Details_Button_Label";
import PRODUCT_DESCRIPTION_LABEL from "@salesforce/label/c.EarthLink_Product_Description_Label";
import T_CHART_BUTTON_LABEL from "@salesforce/label/c.T_Chart_labels";

const INTERNAL_ERRROR = "Internal Error";
const API_ERROR = "API Error";
const VZ_PRODUCTS = ["320", "321", "322"];

export default class poe_lwcBuyflowEarthlinkProductsTab extends NavigationMixin(LightningElement) {
    products = [];
    bundles = [];
    @api recordId;
    @api logo;
    @api selected;
    @api addressInfo;
    @api origin;
    @api userId;
    @api promoCodes;
    @api isGuestUser;
    @api broadbandLabels = [];
    cart = {
        hasToday: false,
        hasMonthly: false,
        todayCharges: [],
        monthlyCharges: [],
        todayTotal: (0.0).toFixed(2),
        monthlyTotal: (0.0).toFixed(2)
    };
    showProductDescription;
    productDescription;
    productsOptions = [
        { label: WIRELESS_PRODUCT_OPTION_LABEL, value: "wireless" },
        { label: WIRED_PRODUCT_OPTION_LABEL, value: "wired" }
    ];
    selectedOptionValue = "";
    productDisclaimer = {
        header: "",
        shortDescription: "",
        description: ""
    };
    initialProducts = [];
    initialBundles = [];
    showSBS = false;
    loaderSpinner;
    showCollateral = false;
    services = [];
    wirelessServices = [];
    wiredServices = [];
    logId;
    wirelessServiceFees = [];
    wiredServiceFees = [];
    excludedProducts = [];
    canScheduleAppt;
    installationNeeded = false;
    noOptions = false;
    productType = WIRED_PRODUCT_PRODUCT_TYPE;
    wirelessProducts = [];
    wiredProducts = [];
    suggestedAddresses = [];
    showModal = false;
    wiredCallLogId;
    wiredAddress = {};
    showDisclaimer = false;
    value = "all";
    selectedItem = "0";
    selectedItemPriceMonthly = "0";
    selectedItemNameMonthly;
    selectedItemPriceOneTime = "0";
    selectedItemNameOneTime;
    selectedPromoCodeLabel = null;
    selectedTarget;
    disableNext = true;
    paymentDisclaimer;
    selectedPromoCode;
    productsResponseByPromoCode = {};
    checkoutDisclaimers = [];
    labels = {
        SELF_SERVICE_VALIDATE_LEAVING_TITLE,
        SELF_SERVICE_VALIDATE_LEAVING_MESSAGE,
        PRODUCT_SELECTION_TITLE,
        SALE_TYPE_SELECTION_FIELD_LABEL,
        PRODUCT_TYPE_SELECTION_FIELD_LABEL,
        EMAIL_BROADBAND_LABELS_BUTTON_LABEL,
        SEE_DETAILS_BUTTON_LABEL,
        PRODUCT_DESCRIPTION_LABEL,
        T_CHART_BUTTON_LABEL
    };
    showSelfServiceCancelModal = false;
    hasMultiplePromoCodes = false;
    isResidentialSale = true;
    showBroadbandModal = false;

    get hasOptions() {
        return !this.noOptions;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.hasMultiplePromoCodes = this.promoCodes.length > 1;
        this.selectedPromoCode = this.promoCodes[0].value;
        this.selectedPromoCodeLabel = this.promoCodes[0].label;
        this.isResidentialSale = this.selectedPromoCode === "07957";
        this.loaderSpinner = true;
        getExcludedProducts({})
            .then((response) => {
                console.log("Excluded Products Response", response);
                this.excludedProducts = [
                    ...response.result["Excluded Products"][0].Excluded_Products_Earthlink__c.split(",")
                ];
                this.handleProductsCallout();
            })
            .catch((error) => {
                console.log(error);
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: SERVER_ERROR_TOAST_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: GENERIC_PRODUCT_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
            });
    }

    handleProductsCallout() {
        let address2 = this.addressInfo.apt !== undefined ? this.addressInfo.apt : "";
        let myData = {
            path: "products/earthlink",
            address: {
                addressLine1: this.addressInfo.address,
                addressLine2: address2,
                city: this.addressInfo.city,
                state: this.addressInfo.state,
                country: "US",
                zipCode: this.addressInfo.zip
            },
            promoCode: this.selectedPromoCode
        };
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Products Response", result);
                this.productsResponseByPromoCode[this.selectedPromoCode] = result;
                this.handleProductsResponse(result);
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    GENERIC_PRODUCT_ERROR_MESSAGE;
                const event = new ShowToastEvent({
                    title: SERVER_ERROR_TOAST_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.handleLogError({
                        error: `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.handleLogError({
                        error: errMsg,
                        type: INTERNAL_ERRROR
                    });
                }
                this.loaderSpinner = false;
            });
    }

    handlePriceChange(event) {
        this.value = event.target.value;
        let allproducts = this.products.concat(this.bundles);
        this.selectedItem = allproducts.findIndex((product) => product.Id === event.target.value);
        let sel = [];
        this.products.forEach((product) => {
            if (product.Id === this.value) {
                product.isChecked = true;
            } else {
                product.isChecked = false;
            }
            sel.push(product);
        });
        this.products = [];
        this.products = [...sel];
        let cart = { ...this.cart };
        cart.monthlyCharges = [];
        cart.hasMonthly = false;
        cart.monthlyTotal = 0.0;
        cart.todayCharges = [];
        cart.hasToday = false;
        cart.todayTotal = 0.0;
        if (allproducts[this.selectedItem].PriceType == "Monthly") {
            cart.hasMonthly = true;
            let newCharge = {
                name: allproducts[this.selectedItem].Name,
                fee:
                    allproducts[this.selectedItem].Price !== undefined
                        ? Number(allproducts[this.selectedItem].Price).toFixed(2)
                        : (0.0).toFixed(2),
                type: "Monthly",
                discount:
                    allproducts[this.selectedItem].Price !== undefined
                        ? Number(allproducts[this.selectedItem].Price) <= 0
                        : true,
                hasDescription: false,
                description: ""
            };
            cart.monthlyCharges.push(newCharge);
            this.selectedItemPriceMonthly = allproducts[this.selectedItem].Price;
            this.selectedItemNameMonthly = allproducts[this.selectedItem].Name;

            this.selectedItemPriceOneTime = "0";
            this.selectedItemNameOneTime = "";
        } else if (allproducts[this.selectedItem].PriceType == "One Time") {
            cart.hasToday = true;
            let newCharge = {
                name: allproducts[this.selectedItem].Name,
                fee:
                    allproducts[this.selectedItem].Price !== undefined
                        ? Number(allproducts[this.selectedItem].Price).toFixed(2)
                        : (0.0).toFixed(2),
                type: "Monthly",
                discount:
                    allproducts[this.selectedItem].Price !== undefined
                        ? Number(allproducts[this.selectedItem].Price) <= 0
                        : true,
                hasDescription: false,
                description: ""
            };
            cart.todayCharges.push(newCharge);
            this.selectedItemPriceOneTime = allproducts[this.selectedItem].Price;
            this.selectedItemNameOneTime = allproducts[this.selectedItem].Name;
            this.selectedItemPriceMonthly = "0";
            this.selectedItemNameMonthly = "";
        }
        if (
            allproducts[this.selectedItem].equipmentCost !== undefined &&
            Number(allproducts[this.selectedItem].equipmentCost) > 0
        ) {
            cart.hasMonthly = true;
            let newCharge = {
                name: "Equipment Cost",
                fee:
                    allproducts[this.selectedItem].equipmentCost !== undefined
                        ? Number(allproducts[this.selectedItem].equipmentCost).toFixed(2)
                        : (0.0).toFixed(2),
                type: "One Time",
                discount:
                    allproducts[this.selectedItem].equipmentCost !== undefined
                        ? Number(allproducts[this.selectedItem].equipmentCost) <= 0
                        : true,
                hasDescription: true,
                description: allproducts[this.selectedItem].equipmentDesc
            };
            cart.monthlyCharges.push(newCharge);
        }
        if (
            allproducts[this.selectedItem].setupCost !== undefined &&
            Number(allproducts[this.selectedItem].setupCost) > 0
        ) {
            cart.hasMonthly = true;
            let newCharge = {
                name: "Processing & Handling Fee",
                fee:
                    allproducts[this.selectedItem].setupCost !== undefined
                        ? Number(allproducts[this.selectedItem].setupCost).toFixed(2)
                        : (0.0).toFixed(2),
                type: "One Time",
                discount:
                    allproducts[this.selectedItem].setupCost !== undefined
                        ? Number(allproducts[this.selectedItem].setupCost) <= 0
                        : true,
                hasDescription: false,
                description: ""
            };
            cart.todayCharges.push(newCharge);
            cart.hasToday = true;
        }
        if (this.wirelessServiceFees.length > 0) {
            this.wirelessServiceFees.forEach((fee) => {
                if (fee.servServRef === this.value) {
                    fee.servX4Y.forEach((item) => {
                        if (
                            item.servType === "Install" &&
                            item.servX4YStart === "0" &&
                            Number(item.servX4YAmount) > 0
                        ) {
                            cart.hasToday = true;
                            let newCharge = {
                                name: "One Time Installation Fee",
                                fee:
                                    item.servX4YAmount !== undefined
                                        ? Number(item.servX4YAmount).toFixed(2)
                                        : (0.0).toFixed(2),
                                type: "One Time",
                                discount: item.servX4YAmount !== undefined ? Number(item.servX4YAmount) <= 0 : true,
                                hasDescription: false,
                                description: ""
                            };
                            cart.todayCharges.push(newCharge);
                            this.selectedItemPriceOneTime = String(Number(item.servX4YAmount).toFixed(2));
                            this.selectedItemNameOneTime = "One Time Installation Fee";
                        }
                    });
                }
            });
        }
        if (this.wiredServiceFees.length > 0) {
            this.wiredServiceFees.forEach((fee) => {
                if (fee.servServRef === this.value) {
                    fee.servX4Y.forEach((item) => {
                        if (
                            item.servType === "Install" &&
                            item.servX4YStart === "0" &&
                            Number(item.servX4YAmount) > 0
                        ) {
                            cart.hasToday = true;
                            let newCharge = {
                                name: "One Time Installation Fee",
                                fee:
                                    item.servX4YAmount !== undefined
                                        ? Number(item.servX4YAmount).toFixed(2)
                                        : (0.0).toFixed(2),
                                type: "One Time",
                                discount: item.servX4YAmount !== undefined ? Number(item.servX4YAmount) <= 0 : true,
                                hasDescription: false,
                                description: ""
                            };
                            cart.todayCharges.push(newCharge);
                            this.selectedItemPriceOneTime = String(Number(item.servX4YAmount).toFixed(2));
                            this.selectedItemNameOneTime = "One Time Installation Fee";
                        }
                    });
                }
            });
        }
        cart.todayCharges.forEach((e) => {
            cart.todayTotal = (Number(cart.todayTotal) + Number(e.fee)).toFixed(2);
        });
        cart.monthlyCharges.forEach((e) => {
            cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(e.fee)).toFixed(2);
        });
        this.cart = { ...cart };
        this.selectedTarget = allproducts[this.selectedItem].Name;
        this.disableNext = false;
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

    handleClick() {
        this.loaderSpinner = true;
        let myData = {};
        let servs = this.services.map((s) => ({ ...s, UnitPrice: parseFloat(s.Price), servRef: s.Id }));
        let disclaimers = [];
        if (this.checkoutDisclaimers.length > 0) {
            disclaimers = this.checkoutDisclaimers.map((item, index) => {
                return { ...item, key: index, agree: false };
            });
        }
        this.products.forEach((prod) => {
            if (prod.Name === this.selectedTarget) {
                myData = {
                    ContextId: this.recordId,
                    Program: "EarthLink",
                    Product: {
                        Description: prod.Description,
                        Family: prod.Family,
                        Name: this.selectedTarget,
                        UnitPrice: parseFloat(prod.Price),
                        PriceType: prod.PriceType,
                        servRef: prod.Id,
                        servCode: prod.servCode,
                        servLevel: prod.servLevel,
                        callLogId:
                            this.productType === WIRED_PRODUCT_PRODUCT_TYPE && this.wiredCallLogId !== undefined
                                ? this.wiredCallLogId
                                : this.logId,
                        vasProduct: prod.vasProduct,
                        isVZProduct: VZ_PRODUCTS.includes(prod.Id)
                    },
                    Services: servs,
                    bundles: this.bundles,
                    skipInstallation: !this.canScheduleAppt
                        ? true
                        : this.productType === WIRELESS_PRODUCT_PRODUCT_TYPE
                        ? true
                        : false,
                    isWireless: this.productType === WIRELESS_PRODUCT_PRODUCT_TYPE,
                    selectedPromoCodeLabel: this.selectedPromoCodeLabel,
                    oneTimeFee: {
                        fee: this.selectedItemPriceOneTime,
                        name: this.selectedItemNameOneTime,
                        type: "product"
                    },
                    wiredAddress: { ...this.wiredAddress },
                    cart: { ...this.cart },
                    selectedPromoCode: this.selectedPromoCode,
                    checkoutDisclaimers: [...disclaimers]
                };
            }
        });
        saveProduct({ myData: myData })
            .then((response) => {
                console.log("Save Product Response", response);
                if (this.isGuestUser) {
                    this.loaderSpinner = false;
                    const sendProductSelectionEvent = new CustomEvent("productselection", {
                        detail: myData
                    });
                    this.dispatchEvent(sendProductSelectionEvent);
                } else {
                    if (this.origin === "retail") {
                        let trackerData = {
                            userId: this.userId,
                            operation: "setTrack",
                            isCount: true,
                            action: "Product Selection"
                        };
                        setClickerRetailTrack({ myData: trackerData })
                            .then((response) => {
                                console.log("Retail Track Response", response);
                                this.loaderSpinner = false;
                                const sendProductSelectionEvent = new CustomEvent("productselection", {
                                    detail: myData
                                });
                                this.dispatchEvent(sendProductSelectionEvent);
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
                            action: "Product Selection",
                            userId: this.userId
                        };
                        setClickerEventTrack({ myData: trackerData })
                            .then((response) => {
                                console.log("Event Track Response", response);
                                this.loaderSpinner = false;
                                const sendProductSelectionEvent = new CustomEvent("productselection", {
                                    detail: myData
                                });
                                this.dispatchEvent(sendProductSelectionEvent);
                            })
                            .catch((error) => {
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
                            action: "Product Selection"
                        };
                        setClickerCallCenterTrack({ myData: trackerData })
                            .then((response) => {
                                console.log("Phone Sales Track Response", response);
                                this.loaderSpinner = false;
                                const sendProductSelectionEvent = new CustomEvent("productselection", {
                                    detail: myData
                                });
                                this.dispatchEvent(sendProductSelectionEvent);
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
                        this.loaderSpinner = false;
                        const sendProductSelectionEvent = new CustomEvent("productselection", {
                            detail: myData
                        });
                        this.dispatchEvent(sendProductSelectionEvent);
                    }
                }
            })
            .catch((error) => {
                console.log(error);
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: SERVER_ERROR_TOAST_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: GENERIC_PRODUCT_ERROR_MESSAGE
                });
                this.dispatchEvent(event);

                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERRROR
                });
                this.loaderSpinner = false;
            });
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    sbsHandler() {
        this.showSBS = true;
    }

    hideSBS() {
        this.showSBS = false;
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleChangeProductType(event) {
        this.selectedOptionValue = event.target.value;
        let products = [];
        if (this.selectedOptionValue === "wired") {
            this.showModal = true;
        } else {
            this.resetCart();
            products = [...this.wirelessProducts];
            products.forEach((item) => (item.isChecked = false));
            this.productType = WIRELESS_PRODUCT_PRODUCT_TYPE;
            this.initialProducts = [...this.wirelessProducts];
            this.products = [...products];
            this.services = [...this.wirelessServices];
        }
    }

    resetCart() {
        let cart = {
            hasToday: false,
            hasMonthly: false,
            todayCharges: [],
            monthlyCharges: [],
            todayTotal: (0.0).toFixed(2),
            monthlyTotal: (0.0).toFixed(2)
        };
        this.cart = { ...cart };
        this.selectedTarget = undefined;
        this.selectedItem = "0";
        this.selectedItemPriceMonthly = "0";
        this.selectedItemNameMonthly = undefined;
        this.selectedItemPriceOneTime = "0";
        this.selectedItemNameOneTime = undefined;
        this.disableNext = true;
    }

    hideModal(event) {
        this.showModal = false;
        let products = [];
        products = [...this.wirelessProducts];
        this.products = [...products];
        this.selectedOptionValue = "wireless";
    }

    handleWireProducts(event) {
        let data = JSON.parse(JSON.stringify(event.detail));
        this.selectedItem = "0";
        this.selectedItemPriceMonthly = "0";
        this.selectedItemNameMonthly = undefined;
        this.selectedItemPriceOneTime = "0";
        this.selectedItemNameOneTime = undefined;
        let cart = {
            hasToday: false,
            hasMonthly: false,
            todayCharges: [],
            monthlyCharges: [],
            todayTotal: (0.0).toFixed(2),
            monthlyTotal: (0.0).toFixed(2)
        };
        this.cart = { ...cart };
        this.canScheduleAppt = data.canScheduleAppt;
        this.products = [...data.wiredProducts];
        this.wiredProducts = [...data.wiredProducts];
        this.wiredServices = [...data.services];
        this.services = [...data.services];
        this.wiredServiceFees = [...data.serviceFees];
        this.bundles = [...data.bundles];
        this.wiredAddress = { ...data.wiredAddress };
        this.wiredCallLogId = data.callLogId;
        this.selectedTarget = undefined;
        this.productType = WIRED_PRODUCT_PRODUCT_TYPE;
        this.initialProducts = [...this.wiredProducts];
        this.disableNext = true;
        this.showModal = false;
    }

    handleDescription(event) {
        if (!this.showProductDescription) {
            let description = this.handleTermsFormat(event.target.dataset.terms);
            this.productDescription = description.replace("undefined", "").replace("..", ".");
        }
        this.showProductDescription = !this.showProductDescription;
    }

    handleChildLogError(e) {
        let event = new CustomEvent("logerror", {
            detail: e.detail
        });
        this.dispatchEvent(event);
    }

    handleLogError(data) {
        let errorLog = {
            type: data.type,
            provider: "Earthlink",
            tab: "Products",
            component: "poe_lwcBuyflowEarthlinkProductsTab",
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

    handleSaleTypeChange(e) {
        const promoCode = e.detail.value;
        this.resetCart();
        this.selectedPromoCode = promoCode;

        this.promoCodes.forEach((code) => {
            if (code.value === this.selectedPromoCode) {
                this.selectedPromoCodeLabel = code.label;
            }
        });

        this.isResidentialSale = this.selectedPromoCode === "07957";
        if (this.selectedOptionValue === "wired" && this.hasOptions) {
            return (this.showModal = true);
        }

        const response = this.productsResponseByPromoCode[promoCode];
        if (response) {
            return this.handleProductsResponse(response);
        }

        this.loaderSpinner = true;
        this.handleProductsCallout();
    }

    handleProductsResponse(result) {
        let wiredProducts = [];
        let wirelessProducts = [];
        let vasServices = [];
        let bundles = [];

        let normalizedAddress = {
            address: result.normalizedAddress.addressLine1,
            apt: result.normalizedAddress.addressLine2,
            city: result.normalizedAddress.city,
            state: result.normalizedAddress.state,
            zip: result.normalizedAddress.zipCode
        };
        const sendNormalizedAddress = new CustomEvent("normalizedaddress", {
            detail: { normalizedAddress }
        });
        this.dispatchEvent(sendNormalizedAddress);

        this.logId = result.hasOwnProperty("callLogId") ? result.callLogId : undefined;
        let internet = result.hasOwnProperty("products") ? result.products : undefined;
        let vasProducts = result.hasOwnProperty("vasProducts") ? result.vasProducts : undefined;
        let fixedWirelessProducts = result.hasOwnProperty("fixedWirelessProducts")
            ? result.fixedWirelessProducts
            : undefined;
        let mobile = result.hasOwnProperty("mobileProducts") ? result.mobileProducts : undefined;
        let ccBundles = result.hasOwnProperty("bundles") ? result.bundles : undefined;
        let i = 0;
        let sel = [];
        if (internet !== undefined) {
            internet.forEach((item) => {
                i = i + 1;
                let offerExists = false;
                let offerNode = [...result.serviceTerm.filter((e) => e.servServRef === item.servRef)];
                if (offerNode.length > 0) {
                    offerExists =
                        offerNode[0].hasOwnProperty("servX4Y") &&
                        offerNode[0].servX4Y.some((a) => a.servType === "Service");
                }
                let intProduct = {
                    Id: item.servRef,
                    Name: item.productName,
                    equipmentCost: item.equipmentCost,
                    setupCost: item.setupCost,
                    equipmentDesc: item.equipmentDesc,
                    hasTerms: item.termsOfSrvc !== "",
                    terms: item.termsOfSrvc !== "" ? item.termsOfSrvc : "",
                    Type: "internet",
                    Price: offerExists
                        ? [...offerNode[0].servX4Y.filter((c) => c.servType === "Service")][0].servX4YAmount
                        : item.price,
                    Family: "EarthLink",
                    PriceType: item.pricePeriod,
                    Speed: item.speed,
                    speedDisclaimer: item.hasOwnProperty("speedDisclaimer") ? item.speedDisclaimer : "",
                    installActivatePoints: item.hasOwnProperty("installActivatePoints")
                        ? item.installActivatePoints
                        : "",
                    vasProduct: false,
                    Description: item.productDescription,
                    servCode: item.servCode,
                    servLevel: item.servLevel,
                    isChecked:
                        this.selected !== undefined
                            ? this.selected.hasOwnProperty("Name")
                                ? item.productName === this.selected.Name
                                    ? true
                                    : false
                                : false
                            : false
                };
                if (intProduct.isChecked) {
                    this.disableNext = false;
                }
                if (!this.excludedProducts.includes(item.servRef)) {
                    wiredProducts.push(intProduct);
                }
            });
        }
        if (mobile !== undefined) {
            mobile.forEach((item) => {
                i = i + 1;
                let offerExists = false;
                let offerNode = [...result.serviceTerm.filter((e) => e.servServRef === item.servRef)];
                if (offerNode.length > 0) {
                    offerExists =
                        offerNode[0].hasOwnProperty("servX4Y") &&
                        offerNode[0].servX4Y.some((a) => a.servType === "Service");
                }
                let mobProduct = {
                    Id: item.servRef,
                    Name: item.productName,
                    Type: "phone",
                    equipmentCost: item.equipmentCost,
                    setupCost: item.setupCost,
                    equipmentDesc: item.equipmentDesc,
                    hasTerms: item.termsOfSrvc !== "",
                    terms: item.termsOfSrvc !== "" ? item.termsOfSrvc : "",
                    Price: offerExists
                        ? [...offerNode[0].servX4Y.filter((c) => c.servType === "Service")][0].servX4YAmount
                        : item.price,
                    Family: "EarthLink",
                    PriceType: item.pricePeriod,
                    speedDisclaimer: item.hasOwnProperty("speedDisclaimer") ? item.speedDisclaimer : "",
                    installActivatePoints: item.hasOwnProperty("installActivatePoints")
                        ? item.installActivatePoints
                        : "",
                    Speed: item.speed,
                    vasProduct: false,
                    Description: item.productDescription,
                    isChecked:
                        this.selected !== undefined
                            ? this.selected.hasOwnProperty("Name")
                                ? item.productName === this.selected.Name
                                    ? true
                                    : false
                                : false
                            : false
                };
                if (mobProduct.isChecked) {
                    this.disableNext = false;
                }
                if (!this.excludedProducts.includes(item.servRef)) {
                    wirelessProducts.push(mobProduct);
                }
            });
        }
        if (fixedWirelessProducts !== undefined) {
            fixedWirelessProducts.forEach((item) => {
                i = i + 1;
                let offerExists = false;
                let offerNode = [...result.serviceTerm.filter((e) => e.servServRef === item.servRef)];
                if (offerNode.length > 0) {
                    offerExists =
                        offerNode[0].hasOwnProperty("servX4Y") &&
                        offerNode[0].servX4Y.some((a) => a.servType === "Service");
                }
                let wireProduct = {
                    Id: item.servRef,
                    Name: item.productName,
                    Type: "wireless",
                    Price: offerExists
                        ? [...offerNode[0].servX4Y.filter((c) => c.servType === "Service")][0].servX4YAmount
                        : item.price.toString().replace("$", ""),
                    Family: "EarthLink",
                    equipmentCost: item.equipmentCost,
                    setupCost: item.setupCost,
                    hasTerms: item.termsOfSrvc !== "",
                    terms: item.termsOfSrvc !== "" ? item.termsOfSrvc : "",
                    equipmentDesc: item.equipmentDesc,
                    speedDisclaimer: item.hasOwnProperty("speedDisclaimer") ? item.speedDisclaimer : "",
                    installActivatePoints: item.hasOwnProperty("installActivatePoints")
                        ? item.installActivatePoints
                        : "",
                    vasProduct: true,
                    PriceType: item.pricePeriod,
                    Speed: item.speed,
                    Description: item.serviceDescription,
                    isChecked:
                        this.selected !== undefined
                            ? this.selected.hasOwnProperty("Name")
                                ? item.productName === this.selected.Name
                                    ? true
                                    : false
                                : false
                            : false
                };
                if (wireProduct.isChecked) {
                    this.disableNext = false;
                }
                if (!this.excludedProducts.includes(item.servRef)) {
                    wirelessProducts.push(wireProduct);
                }
            });
        }
        if (vasProducts !== undefined) {
            vasProducts.forEach((item) => {
                i = i + 1;
                let offerExists = false;
                let offerNode = [...result.serviceTerm.filter((e) => e.servServRef === item.servRef)];
                if (offerNode.length > 0) {
                    offerExists =
                        offerNode[0].hasOwnProperty("servX4Y") &&
                        offerNode[0].servX4Y.some((a) => a.servType === "Service");
                }
                let vasProduct = {
                    Id: item.servRef,
                    Name: item.productName,
                    Type: "internet",
                    equipmentCost: item.equipmentCost,
                    equipmentDesc: item.equipmentDesc,
                    setupCost: item.setupCost,
                    hasTerms: item.termsOfSrvc !== "",
                    terms: item.termsOfSrvc !== "" ? item.termsOfSrvc : "",
                    Price: offerExists
                        ? [...offerNode[0].servX4Y.filter((c) => c.servType === "Service")][0].servX4YAmount
                        : item.price,
                    Family: "EarthLink",
                    speedDisclaimer: item.hasOwnProperty("speedDisclaimer") ? item.speedDisclaimer : "",
                    installActivatePoints: item.hasOwnProperty("installActivatePoints")
                        ? item.installActivatePoints
                        : "",
                    PriceType: item.pricePeriod,
                    hasDescription: item.productDescription !== "" && item.productDescription !== null ? true : false,
                    Speed: item.speed,
                    vasProduct: true,
                    Description: item.productDescription,
                    isChecked: false,
                    isDisabled: false,
                    servCode: item.servCode,
                    servLevel: item.servLevel
                };
                if (!this.excludedProducts.includes(item.servRef)) {
                    vasServices.push(vasProduct);
                }
            });
        }
        if (ccBundles != undefined) {
            ccBundles.forEach((item) => {
                let packages = item.serviceInfo.split(",");
                let newPackages = [];
                packages.forEach((pack) => {
                    let packInfo = pack.split(":");
                    let newPack = {
                        servCode: packInfo[0],
                        servLevel: packInfo[1]
                    };
                    newPackages.push(newPack);
                });
                let bundle = {
                    id: item.servRef,
                    price: item.price,
                    name: item.serviceName,
                    packages: newPackages
                };
                if (!this.excludedProducts.includes(item.servRef)) {
                    bundles.push(bundle);
                }
            });
        }
        this.bundles = [...bundles];
        this.services = [...vasServices];
        this.productType = fixedWirelessProducts.length > 0 ? WIRELESS_PRODUCT_PRODUCT_TYPE : WIRED_PRODUCT_PRODUCT_TYPE;
        this.wirelessServices = this.productType === WIRELESS_PRODUCT_PRODUCT_TYPE ? [...vasServices] : [];
        this.wiredServices = this.productType === WIRED_PRODUCT_PRODUCT_TYPE ? [...vasServices] : [];
        this.products = this.productType === WIRED_PRODUCT_PRODUCT_TYPE ? [...wiredProducts] : [...wirelessProducts];
        if (this.productType === WIRED_PRODUCT_PRODUCT_TYPE) {
            this.wiredServiceFees = [...result.serviceTerm];
        } else {
            this.wirelessServiceFees = [...result.serviceTerm];
        }
        this.initialProducts = this.productType === WIRED_PRODUCT_PRODUCT_TYPE ? [...wiredProducts] : [...wirelessProducts];
        this.wiredProducts = [...wiredProducts];
        this.wirelessProducts = [...wirelessProducts];
        this.noOptions =
            this.productType === WIRED_PRODUCT_PRODUCT_TYPE ||
            (this.productType === WIRELESS_PRODUCT_PRODUCT_TYPE && !result.hasOwnProperty("suggestedAddresses"));
        this.suggestedAddresses = !this.noOptions ? [...result.suggestedAddresses] : [];
        this.canScheduleAppt = result.canScheduleAppt === "yes";
        this.selectedOptionValue = this.productType === WIRED_PRODUCT_PRODUCT_TYPE ? "wired" : "wireless";
        if (this.selected !== undefined && this.selected.hasOwnProperty("Name")) {
            this.products.forEach((product) => {
                if (product.isChecked) {
                    sel.push(product);
                }
            });
            let cart = {
                hasToday: false,
                hasMonthly: false,
                todayCharges: [],
                monthlyCharges: [],
                todayTotal: (0.0).toFixed(2),
                monthlyTotal: (0.0).toFixed(2)
            };
            if (sel.length > 0) {
                if (sel[0].PriceType == "Monthly") {
                    let newCharge = {
                        name: sel[0].Name,
                        fee: sel[0].Price !== undefined ? Number(sel[0].Price).toFixed(2) : (0.0).toFixed(2),
                        type: sel[0].PriceType,
                        discount: sel[0].Price !== undefined ? Number(sel[0].Price) <= 0 : true,
                        hasDescription: false,
                        description: ""
                    };
                    cart.hasMonthly = true;
                    cart.monthlyCharges.push(newCharge);
                    this.selectedItemPriceMonthly = sel[0].Price;
                    this.selectedItemNameMonthly = sel[0].Name;
                    this.selectedItemPriceOneTime = "0";
                    this.selectedItemNameOneTime = "";
                } else if (sel[0].PriceType == "One Time") {
                    let newCharge = {
                        name: sel[0].Name,
                        fee: sel[0].Price !== undefined ? Number(sel[0].Price).toFixed(2) : (0.0).toFixed(2),
                        type: sel[0].PriceType,
                        discount: sel[0].Price !== undefined ? Number(sel[0].Price) <= 0 : true,
                        hasDescription: false,
                        description: ""
                    };
                    cart.hasToday = true;
                    cart.todayCharges.push(newCharge);
                    this.selectedItemPriceOneTime = sel[0].Price;
                    this.selectedItemNameOneTime = sel[0].Name;
                    this.selectedItemPriceMonthly = "0";
                    this.selectedItemNameMonthly = "";
                }

                this.selectedTarget = sel[0].Name;
                this.disableNext = false;
            }
            if (sel.length > 0 && sel[0].equipmentCost !== undefined && Number(sel[0].equipmentCost) > 0) {
                cart.hasMonthly = true;
                let newCharge = {
                    name: "Equipment Cost",
                    fee:
                        sel[0].equipmentCost !== undefined ? Number(sel[0].equipmentCost).toFixed(2) : (0.0).toFixed(2),
                    type: "One Time",
                    discount: sel[0].equipmentCost !== undefined ? Number(sel[0].equipmentCost) <= 0 : true,
                    hasDescription: true,
                    description: sel[0].equipmentDesc
                };
                cart.monthlyCharges.push(newCharge);
            }
            if (sel.length > 0 && sel[0].setupCost !== undefined && Number(sel[0].setupCost) > 0) {
                cart.hasMonthly = true;
                let newCharge = {
                    name: "Processing & Handling Fee",
                    fee: sel[0].setupCost !== undefined ? Number(sel[0].setupCost).toFixed(2) : (0.0).toFixed(2),
                    type: "One Time",
                    discount: sel[0].setupCost !== undefined ? Number(sel[0].setupCost) <= 0 : true,
                    hasDescription: false,
                    description: ""
                };
                cart.hasToday = true;
                cart.todayCharges.push(newCharge);
            }
            if (this.wiredServiceFees.length > 0) {
                this.wiredServiceFees.forEach((fee) => {
                    if (fee.servServRef === sel[0].Id) {
                        fee.servX4Y.forEach((item) => {
                            if (
                                item.servType === "Install" &&
                                item.servX4YStart === "0" &&
                                Number(item.servX4YAmount) > 0
                            ) {
                                let newCharge = {
                                    name: "One Time Installation Fee",
                                    fee:
                                        item.servX4YAmount !== undefined
                                            ? Number(item.servX4YAmount).toFixed(2)
                                            : (0.0).toFixed(2),
                                    type: "One Time",
                                    discount: item.servX4YAmount !== undefined ? Number(item.servX4YAmount) <= 0 : true,
                                    hasDescription: false,
                                    description: ""
                                };
                                cart.hasToday = true;
                                cart.todayCharges.push(newCharge);
                                this.selectedItemPriceOneTime = String(Number(item.servX4YAmount).toFixed(2));
                                this.selectedItemNameOneTime = "One Time Installation Fee";
                            }
                        });
                    }
                });
            }
            if (this.wirelessServiceFees.length > 0) {
                this.wirelessServiceFees.forEach((fee) => {
                    if (fee.servServRef === sel[0].Id) {
                        fee.servX4Y.forEach((item) => {
                            if (
                                item.servType === "Install" &&
                                item.servX4YStart === "0" &&
                                Number(item.servX4YAmount) > 0
                            ) {
                                let newCharge = {
                                    name: "One Time Installation Fee",
                                    fee:
                                        item.servX4YAmount !== undefined
                                            ? Number(item.servX4YAmount).toFixed(2)
                                            : (0.0).toFixed(2),
                                    type: "One Time",
                                    discount: item.servX4YAmount !== undefined ? Number(item.servX4YAmount) <= 0 : true,
                                    hasDescription: false,
                                    description: ""
                                };
                                cart.hasToday = true;
                                cart.todayCharges.push(newCharge);
                                this.selectedItemPriceOneTime = String(Number(item.servX4YAmount).toFixed(2));
                                this.selectedItemNameOneTime = "One Time Installation Fee";
                            }
                        });
                    }
                });
            }
            cart.todayTotal = (0.0).toFixed(2);
            cart.todayCharges.forEach((e) => {
                cart.todayTotal = (Number(cart.todayTotal) + Number(e.fee)).toFixed(2);
            });
            cart.monthlyTotal = (0.0).toFixed(2);
            cart.monthlyCharges.forEach((e) => {
                cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(e.fee)).toFixed(2);
            });
            this.cart = { ...cart };
        }
        if (
            result.generalTerms.length > 0 &&
            this.productDisclaimer.description !== result.generalTerms[0].termsOfSrvc
        ) {
            this.generalTerms = result.generalTerms[0].termsOfSrvc;
            this.handleCheckoutDisclaimer(result.generalTerms[0]);
        }
    }

    handleCheckoutDisclaimer(result) {
        if (
            result.hasOwnProperty("paymentDisclaimer") &&
            !this.checkoutDisclaimers.some((item) => item.verbiage == result.paymentDisclaimer)
        ) {
            let disclaimer = {
                checkText: this.isGuestUser
                    ? CUSTOMER_TERMS_AND_CONDITIONS_VERBIAGE
                    : AGENT_TERMS_AND_CONDITIONS_VERBIAGE,
                verbiage: result.paymentDisclaimer
            };
            this.checkoutDisclaimers.push(disclaimer);
        }
    }

    handleTermsFormat(term) {
        let termArr = term.split(". ");
        let description;
        termArr.forEach((item, index) => {
            if (item !== "" && item != undefined) {
                if (index == 0) {
                    description += `\u2022 ${item}.`;
                } else {
                    description += `\n\u2022 ${item}.`;
                }
            }
        });
        return description;
    }

    handleShowGeneralDisclaimer(result) {
        this.products.forEach((prod) => {
            if (prod.Name === this.selectedTarget) {
                let description = this.handleTermsFormat(`${this.generalTerms} ${prod.terms} ${prod.speedDisclaimer}`);
                this.productDisclaimer.header = TERMS_OF_SERVICE_TITLE;
                this.productDisclaimer.description = description.replace("undefined", "").replace("..", ".");
                this.productDisclaimer.cancelText = this.isGuestUser 
                                    ? CUSTOMER_DISAGREE_TERMS_AND_CONDITIONS_LABEL
                                    : AGENT_DISAGREE_TERMS_AND_CONDITIONS_LABEL
            }
        });
        this.productDisclaimer.shortDescription = this.isGuestUser
            ? CUSTOMER_TERMS_AND_CONDITIONS_INSTRUCTIONS
            : AGENT_TERMS_AND_CONDITIONS_INSTRUCTIONS
        this.productDisclaimer.agreeText = this.isGuestUser 
            ? CUSTOMER_TERMS_AND_CONDITIONS_SHORT_VERBIAGE
            : AGENT_TERMS_AND_CONDITIONS_SHORT_VERBIAGE;
        this.showDisclaimer = true;
    }

    handleDisclaimerAgree() {
        this.showDisclaimer = false;
        this.handleClick();
    }

    handleCancelAgreement() {
        this.showDisclaimer = false;
    }

    handleBroadbandModal() {
        this.showBroadbandModal = !this.showBroadbandModal;
    }

    handleBroadbandUpdate(event) {
        this.broadbandLabels = event.detail;
        this.products.forEach((product) => {
            let broadbandLabel = this.broadbandLabels.find((label) => label.serviceRef === product.Id);
            if (broadbandLabel !== undefined) {
                product.broadbandLabel = broadbandLabel;
            }
        });
    }
}