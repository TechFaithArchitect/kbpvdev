import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import { loadStyle } from "lightning/platformResourceLoader";
import ToastContainer from "lightning/toastContainer";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

import chuzo_modalGeneric from "c/chuzo_modalGeneric";
import suggestedAddressModal from "c/poe_lwcSelfServiceEarthlinkProductsModal";
import emailBroadbandLabelModal from "c/poe_lwcSelfServiceEarthlinkEmailLabelModal";

import getAddressInfo from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveACIPresentation from "@salesforce/apex/InfoTabController.saveACIPresentation";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import getEarthlinkPromoCodes from "@salesforce/apex/InfoTabController.getEarthlinkPromoCodes";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveProduct from "@salesforce/apex/ProductTabController.saveProduct";
import getExcludedProducts from "@salesforce/apex/ProductTabController.getEarthLinkExcludedProducts";

import WIRELESS_PRODUCT_OPTION_LABEL from "@salesforce/label/c.Wireless_Product_Option_Label";
import WIRED_PRODUCT_OPTION_LABEL from "@salesforce/label/c.Wired_Product_Option_Label";
import WIRED_PRODUCT_PRODUCT_TYPE from "@salesforce/label/c.Wired_Product_Product_Type";
import WIRELESS_PRODUCT_PRODUCT_TYPE from "@salesforce/label/c.Wireless_Product_Product_Type";
import SERVER_ERROR_TOAST_TITLE from "@salesforce/label/c.Server_Error_Toast_Title";
import GENERIC_PRODUCT_ERROR_MESSAGE from "@salesforce/label/c.Chuzo_Generic_Product_Error_Message";
import GENERIC_ERROR_MESSAGE from "@salesforce/label/c.Chuzo_Generic_Error_Message";
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
import NO_ERROR_DESCRIPTION_MESSAGE from "@salesforce/label/c.No_Error_Description_Message";
import NEXT_STEP_BUTTON_LABEL from "@salesforce/label/c.Next_Step_Button_Label";
import EQUIPMENT_LEASE_FEE_DISCLAIMER from "@salesforce/label/c.EarthLink_Equipment_Lease_Fee_Disclaimer";
import INCLUDED_IN_THIS_PLAN_LABEL from "@salesforce/label/c.Included_In_This_Plan_Label";
import PRODUCTS_LOADING_VERBIAGE from "@salesforce/label/c.Self_Service_Products_Loading_Verbiage";
import NO_PRODUCTS_FOUND_ERROR_MESSAGE from "@salesforce/label/c.No_Products_Found_Error_Message";
import PRODUCT_SPEEDS_DISCLAIMER from "@salesforce/label/c.EarthLink_Product_Speeds_Disclaimer";
import CLOSE_BUTTON_LABEL from "@salesforce/label/c.Close_Button_Label";
import PRODUCT_DESCRIPTION_MODAL_TITLE from "@salesforce/label/c.Frontier_Product_Description_Modal_Title";

const INTERNAL_ERROR = "Internal Error";
const API_ERROR = "API Error";
const VZ_PRODUCTS = ["320", "321", "322"];
const PRODUCT_CONTENT_CLASS = "price-content";
const PRODUCT_CONTENT_SELECTED_CLASS = "price-content selected";
const RESIDENTIAL_PROMO_CODE = "07957";

const stateNames = [
    { name: "Alabama", abbrev: "AL" },
    { name: "Alaska", abbrev: "AK" },
    { name: "Arizona", abbrev: "AZ" },
    { name: "Arkansas", abbrev: "AR" },
    { name: "California", abbrev: "CA" },
    { name: "Colorado", abbrev: "CO" },
    { name: "Connecticut", abbrev: "CT" },
    { name: "Delaware", abbrev: "DE" },
    { name: "District of Columbia", abbrev: "DC" },
    { name: "Florida", abbrev: "FL" },
    { name: "Georgia", abbrev: "GA" },
    { name: "Hawaii", abbrev: "HI" },
    { name: "Idaho", abbrev: "ID" },
    { name: "Illinois", abbrev: "IL" },
    { name: "Indiana", abbrev: "IN" },
    { name: "Iowa", abbrev: "IA" },
    { name: "Kansas", abbrev: "KS" },
    { name: "Kentucky", abbrev: "KY" },
    { name: "Louisiana", abbrev: "LA" },
    { name: "Maine", abbrev: "ME" },
    { name: "Maryland", abbrev: "MD" },
    { name: "Massachusetts", abbrev: "MA" },
    { name: "Michigan", abbrev: "MI" },
    { name: "Minnesota", abbrev: "MN" },
    { name: "Mississippi", abbrev: "MS" },
    { name: "Missouri", abbrev: "MO" },
    { name: "Montana", abbrev: "MT" },
    { name: "Nebraska", abbrev: "NE" },
    { name: "Nevada", abbrev: "NV" },
    { name: "New Hampshire", abbrev: "NH" },
    { name: "New Jersey", abbrev: "NJ" },
    { name: "New Mexico", abbrev: "NM" },
    { name: "New York", abbrev: "NY" },
    { name: "North Carolina", abbrev: "NC" },
    { name: "North Dakota", abbrev: "ND" },
    { name: "Ohio", abbrev: "OH" },
    { name: "Oklahoma", abbrev: "OK" },
    { name: "Oregon", abbrev: "OR" },
    { name: "Pennsylvania", abbrev: "PA" },
    { name: "Rhode Island", abbrev: "RI" },
    { name: "South Carolina", abbrev: "SC" },
    { name: "South Dakota", abbrev: "SD" },
    { name: "Tennessee", abbrev: "TN" },
    { name: "Texas", abbrev: "TX" },
    { name: "Utah", abbrev: "UT" },
    { name: "Vermont", abbrev: "VT" },
    { name: "Virginia", abbrev: "VA" },
    { name: "Washington", abbrev: "WA" },
    { name: "West Virginia", abbrev: "WV" },
    { name: "Wisconsin", abbrev: "WI" },
    { name: "Wyoming", abbrev: "WY" }
];

export default class Poe_lwcSelfServiceEarthlinkProductsTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api selected;
    @api origin;
    @api userId;
    @api promoCodes;
    @api isGuestUser;
    @api broadbandLabels = [];
    @api referralCodeData;
    
    products = [];
    bundles = [];
    cart = {
        hasToday: false,
        hasMonthly: false,
        todayCharges: [],
        monthlyCharges: [],
        todayTotal: (0.0).toFixed(2),
        monthlyTotal: (0.0).toFixed(2)
    };
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
    wiredCallLogId;
    wiredAddress = {};
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
    hasMultiplePromoCodes = false;
    isResidentialSale = true;
    apt;
    city;
    zip;
    stateName;
    address;
    stateOptions = [];
    serviceAvailabilityResults = [];
    providerStyle = "earthlink";
    loadingNextStep = false;
    labels = {
        PRODUCT_SELECTION_TITLE,
        SALE_TYPE_SELECTION_FIELD_LABEL,
        PRODUCT_TYPE_SELECTION_FIELD_LABEL,
        EMAIL_BROADBAND_LABELS_BUTTON_LABEL,
        SEE_DETAILS_BUTTON_LABEL,
        NEXT_STEP_BUTTON_LABEL,
        EQUIPMENT_LEASE_FEE_DISCLAIMER,
        INCLUDED_IN_THIS_PLAN_LABEL,
        PRODUCTS_LOADING_VERBIAGE,
        NO_PRODUCTS_FOUND_ERROR_MESSAGE
    };

    get hasSalesOrProductTypeOptions() {
        return this.hasOptions || this.showSalesTypeSelection;
    }

    get hasOptions() {
        return !this.noOptions;
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconCheckOrange() {
        return chuzoSiteResources + "/images/icon-check-orange.svg";
    }

    get showSalesTypeSelection() {
        return this.hasMultiplePromoCodes && !this.isGuestUser;
    }

    get nextButtonClass() {
        return this.disableNext
            ? "btn-rounded btn-center hide-mobile btn-disabled"
            : "btn-rounded btn-center hide-mobile";
    }

    get nextButtonClassMobile() {
        return this.disableNext ? "btn-rounded btn-center btn-disabled" : "btn-rounded btn-center";
    }

    get productsAvailable() {
        return Array.isArray(this.products) && this.products.length > 0;
    }

    get noProductsAvailable() {
        return !this.productsAvailable;
    }

    get loadingFinished() {
        return !this.loaderSpinner && this.productsAvailable;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get productSpeedsDisclaimer() {
        const currentYear = new Date().getFullYear().toString();
        return PRODUCT_SPEEDS_DISCLAIMER.replace("{CURRENT_YEAR}", currentYear);
    }

    connectedCallback() {
        this.loaderSpinner = true;
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
            stateNames.forEach((state) => {
                let option = {
                    label: state.name,
                    value: state.abbrev
                };
                this.stateOptions.push(option);
            });
            this.handleGetAddressInfoCallout();
        } else {
            this.getExcludedProductsCallout();
        }
    }

    handleGetAddressInfoCallout() {
        let myData = {
            Id: this.recordId,
            Program: "EarthLink"
        };
        getAddressInfo({ myData: myData })
            .then((response) => {
                let result = response.result;
                let opportunity = result.Opportunity;
                if (typeof opportunity === "object") {
                    this.city = opportunity.hasOwnProperty("Maps_City__c") ? opportunity.Maps_City__c : undefined;
                    this.address = opportunity.hasOwnProperty("Maps_Street__c")
                        ? opportunity.Maps_Street__c
                        : undefined;
                    this.apt = opportunity.hasOwnProperty("Maps_Appartment__c")
                        ? opportunity.Maps_Appartment__c
                        : undefined;
                    let stateLong = opportunity.hasOwnProperty("Maps_State__c") ? opportunity.Maps_State__c : undefined;
                    this.state =
                        stateLong !== undefined
                            ? this.stateOptions.filter(
                                  (state) => stateLong === state.label || stateLong === state.value
                              )[0].value
                            : undefined;
                    this.stateName =
                        stateLong !== undefined
                            ? this.stateOptions.filter(
                                  (state) => stateLong === state.label || stateLong === state.value
                              )[0].label
                            : undefined;
                    this.zip = opportunity.hasOwnProperty("Maps_PostalCode__c")
                        ? opportunity.Maps_PostalCode__c
                        : undefined;
                }
                let aci = {
                    ContextId: this.recordId
                };
                saveACIPresentation({ request: JSON.stringify(aci) })
                    .then((response) => {
                        this.getPromoCodes();
                    })
                    .catch((error) => {
                        console.error(error);

                        this.handleLogError({
                            error: error.body?.message || error.message,
                            type: INTERNAL_ERROR
                        });

                        this.loaderSpinner = false;
                    });
            })
            .catch((error) => {
                this.loaderSpinner = false;

                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERROR
                });

                console.log(error);
            });
    }

    getPromoCodes() {
        getEarthlinkPromoCodes()
            .then((response) => {
                this.promoCodes = this.isGuestUser
                    ? this.filterResidentialPromoCode(response.result)
                    : response.result.promoCodes;

                this.handleSaveOpportunityAddressInformation();
            })
            .catch((error) => {
                console.error(error);

                const errMsg = error.body?.message || error.message;
                this.handleLogError({
                    error: errMsg,
                    type: INTERNAL_ERROR
                });
                this.loaderSpinner = false;
            });
    }

    handleSaveOpportunityAddressInformation() {
        let name = "Self Service Opportunity";
        let info = {
            Maps_Appartment__c: this.apt !== undefined ? this.apt : null,
            Maps_City__c: this.city !== undefined ? this.city : null,
            Maps_Country__c: "United States",
            Maps_PostalCode__c: this.zip !== undefined ? this.zip : null,
            Maps_State__c: this.stateName !== undefined ? this.stateName : null,
            Maps_Street__c: this.address !== undefined ? this.address : null,
            Name: name,
            StageName: "DM",
            Program: "EarthLink",
            Id: this.recordId !== undefined ? this.recordId : null,
            referralCodeId: this.referralCodeData?.Id || this.referralCodeData?.referralCodeId
        };
        let myData = {
            opportunity: info,
            origin: this.origin,
            contact: false
        };
        saveOpportunityAddressInformation({ myData: myData })
            .then((response) => {
                console.log("saveOpportunityAddressInformation :", response);
                this.checkServiceability(info);
            })
            .catch((error) => {
                console.error(error, "ERROR");

                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERROR
                });

                this.loaderSpinner = false;
            });
    }

    addressCallout(info, promoCode) {
        let myData = {
            partnerName: "earthlink",
            path: "serviceAbilities",
            address: {
                addressLine1: info.Maps_Street__c,
                addressLine2: this.apt !== undefined ? this.apt : "",
                city: info.Maps_City__c,
                state: this.state,
                country: info.Maps_Country__c,
                zipCode: info.Maps_PostalCode__c
            },
            promoCode: promoCode.value
        };
        console.log("Address Request", myData);
        let apiResponse;
        return callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let responseParsed = JSON.parse(response);
                console.log("Address Response", responseParsed);
                let success = responseParsed.serviceAvailability;
                let msg = responseParsed.hasOwnProperty("message")
                    ? responseParsed.message
                    : responseParsed.hasOwnProperty("error")
                    ? responseParsed.error.hasOwnProperty("provider")
                        ? responseParsed.error.provider.message.hasOwnProperty("message")
                            ? responseParsed.error.provider.message.message
                            : responseParsed.error.provider.message
                        : responseParsed.error
                    : NO_ERROR_DESCRIPTION_MESSAGE;

                if (success) {
                    this.serviceAvailabilityResults.push({
                        message: msg,
                        success: true,
                        promoCode
                    });
                } else {
                    this.serviceAvailabilityResults.push({
                        message: msg,
                        success: false
                    });

                    this.handleLogError({
                        error: `${msg}\nAPI Response: ${apiResponse}`,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = GENERIC_ERROR_MESSAGE;
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
                        type: INTERNAL_ERROR
                    });
                }
            });
    }

    checkServiceability(info) {
        Promise.all(this.promoCodes.map((code) => this.addressCallout(info, code)))
            .then(() => {
                const successMessages = this.serviceAvailabilityResults.filter((msg) => msg.success);

                if (successMessages.length > 0) {
                    if (this.isNotGuestUser) {
                        const successEvent = new ShowToastEvent({
                            title: "Success",
                            variant: "success",
                            message: successMessages[0].message
                        });
                        this.dispatchEvent(successEvent);
                    }
                    const addressInfo = {
                        address: this.address,
                        apt: this.apt,
                        city: this.city,
                        state: this.state,
                        zip: this.zip
                    };

                    const successMessagesByPromoCode = {};
                    successMessages.forEach((message) => {
                        successMessagesByPromoCode[message.promoCode.value] = message;
                    });

                    const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                        detail: {
                            addressInfo,
                            promoCodes: this.promoCodes.map((code) => successMessagesByPromoCode[code.value].promoCode)
                        }
                    });
                    this.dispatchEvent(sendCheckServiceabilityEvent);
                    this.getExcludedProductsCallout();
                } else {
                    const serviceNotAvailableEvent = new ShowToastEvent({
                        title: "Service not Available",
                        variant: "error",
                        mode: "sticky",
                        message: `${
                            this.serviceAvailabilityResults[0].hasOwnProperty("message")
                                ? this.serviceAvailabilityResults[0].message
                                : this.serviceAvailabilityResults[0]
                        }. Please validate the information entered and try again.`
                    });

                    this.dispatchEvent(serviceNotAvailableEvent);
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error);

                const errMsg = error.body?.message || error.message;
                this.handleLogError({
                    error: errMsg,
                    type: INTERNAL_ERROR
                });
                this.loaderSpinner = false;
            });
    }

    getExcludedProductsCallout() {
        this.loaderSpinner = true;
        this.hasMultiplePromoCodes = this.promoCodes.length > 1;
        this.selectedPromoCode = this.isGuestUser ? RESIDENTIAL_PROMO_CODE : this.promoCodes[0].value;
        this.selectedPromoCodeLabel = this.promoCodes[0].label;
        this.isResidentialSale = this.selectedPromoCode === RESIDENTIAL_PROMO_CODE;

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
        let address2 = this.apt !== undefined ? this.apt : "";
        let myData = {
            path: "products/earthlink",
            address: {
                addressLine1: this.address,
                addressLine2: address2,
                city: this.city,
                state: this.state,
                country: "US",
                zipCode: this.zip
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
                        type: INTERNAL_ERROR
                    });
                }
                this.loaderSpinner = false;
            });
    }

    handlePriceChange(event) {
        this.value = event.currentTarget.dataset.productId;
        let allproducts = this.products.concat(this.bundles);
        this.selectedItem = allproducts.findIndex((product) => product.Id === event.currentTarget.dataset.productId);
        let sel = [];
        this.products.forEach((product) => {
            if (product.Id === this.value) {
                product.isChecked = true;
                product.styleClass = PRODUCT_CONTENT_SELECTED_CLASS;
            } else {
                product.isChecked = false;
                product.styleClass = PRODUCT_CONTENT_CLASS;
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

    selfServiceReturnToHomePage() {
        const goBackEvent = new CustomEvent("home", {
            detail: "",
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(goBackEvent);
    }

    handleClick() {
        this.loadingNextStep = true;
        let myData = {};
        let servs = this.services.map((s) => ({ ...s, UnitPrice: parseFloat(s.Price), servRef: s.Id }));
        this.handleCheckoutDisclaimer();
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
                            this.productType === "Wired Products" && this.wiredCallLogId !== undefined
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
                    productDisclaimer: this.productDisclaimer,
                    checkoutDisclaimers: this.checkoutDisclaimers
                };
            }
        });
        saveProduct({ myData: myData })
            .then((response) => {
                console.log("Save Product Response", response);
                if (this.isGuestUser) {
                    this.loadingNextStep = false;
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
                                this.loadingNextStep = false;
                                const sendProductSelectionEvent = new CustomEvent("productselection", {
                                    detail: myData
                                });
                                this.dispatchEvent(sendProductSelectionEvent);
                            })
                            .catch((error) => {
                                console.error(error, "ERROR");
                                this.handleLogError({
                                    error: error.body?.message || error.message,
                                    type: INTERNAL_ERROR
                                });
                                this.loadingNextStep = false;
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
                                this.loadingNextStep = false;
                                const sendProductSelectionEvent = new CustomEvent("productselection", {
                                    detail: myData
                                });
                                this.dispatchEvent(sendProductSelectionEvent);
                            })
                            .catch((error) => {
                                console.error(error, "ERROR");
                                this.handleLogError({
                                    error: error.body?.message || error.message,
                                    type: INTERNAL_ERROR
                                });
                                this.loadingNextStep = false;
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
                                this.loadingNextStep = false;
                                const sendProductSelectionEvent = new CustomEvent("productselection", {
                                    detail: myData
                                });
                                this.dispatchEvent(sendProductSelectionEvent);
                            })
                            .catch((error) => {
                                console.error(error, "ERROR");
                                this.handleLogError({
                                    error: error.body?.message || error.message,
                                    type: INTERNAL_ERROR
                                });
                                this.loadingNextStep = false;
                            });
                    } else {
                        this.loadingNextStep = false;
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
                    type: INTERNAL_ERROR
                });
                this.loadingNextStep = false;
            });
    }

    handlePrevious() {
        if (this.isGuestUser) {
            this.selfServiceReturnToHomePage();
        }
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
            this.handleSuggestedAddressModal();
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

    handleSuggestedAddressModal() {
        suggestedAddressModal
            .open({
                suggestedAddresses: this.suggestedAddresses,
                promoCode: this.selectedPromoCode,
                isGuestUser: this.isGuestUser,
                onlogerror: (e) => this.handleChildLogError(e)
            })
            .then((result) => {
                if (!result?.detail) {
                    return this.hideModal();
                }

                this.handleWireProducts(result);
            });
    }

    hideModal() {
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
        this.productType = "Wired Products";
        this.initialProducts = [...this.wiredProducts];
        this.disableNext = true;
    }

    handleDescription(event) {
        let description = this.handleTermsFormat(event.target.dataset.terms);
        let productDescription = description.replace("undefined", "").replace("..", ".");
        let spacedProductDescription = this.formatProductDescription(productDescription);
        chuzo_modalGeneric.open({
            content: {
                title: PRODUCT_DESCRIPTION_MODAL_TITLE,
                provider: "earthlink",
                body: spacedProductDescription,
                agreeLabel: CLOSE_BUTTON_LABEL,
                canClose: false
            }
        });
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

        this.isResidentialSale = this.selectedPromoCode === RESIDENTIAL_PROMO_CODE;
        if (this.selectedOptionValue === "wired" && this.hasOptions) {
            return this.handleSuggestedAddressModal();
        }

        const response = this.productsResponseByPromoCode[promoCode];
        if (response) {
            return this.handleProductsResponse(response);
        }

        this.loaderSpinner = true;
        return this.handleProductsCallout();
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
                let productIsChecked =
                    this.selected !== undefined
                        ? this.selected.hasOwnProperty("Name")
                            ? item.productName === this.selected.Name
                                ? true
                                : false
                            : false
                        : false;
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
                    keyFeatures: this.splitDescriptionIntoKeyFeatures(item.productDescription),
                    servCode: item.servCode,
                    servLevel: item.servLevel,
                    isChecked: productIsChecked,
                    styleClass: productIsChecked ? PRODUCT_CONTENT_SELECTED_CLASS : PRODUCT_CONTENT_CLASS
                };
                if (!this.excludedProducts.includes(item.servRef)) {
                    wiredProducts.push(intProduct);
                }
            });
        }
        if (mobile !== undefined) {
            mobile.forEach((item) => {
                let productIsChecked =
                    this.selected !== undefined
                        ? this.selected.hasOwnProperty("Name")
                            ? item.productName === this.selected.Name
                                ? true
                                : false
                            : false
                        : false;
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
                    keyFeatures: this.splitDescriptionIntoKeyFeatures(item.productDescription),
                    isChecked: productIsChecked,
                    styleClass: productIsChecked ? PRODUCT_CONTENT_SELECTED_CLASS : PRODUCT_CONTENT_CLASS
                };
                if (!this.excludedProducts.includes(item.servRef)) {
                    wirelessProducts.push(mobProduct);
                }
            });
        }
        if (fixedWirelessProducts !== undefined) {
            fixedWirelessProducts.forEach((item) => {
                i = i + 1;
                let productIsChecked =
                    this.selected !== undefined
                        ? this.selected.hasOwnProperty("Name")
                            ? item.productName === this.selected.Name
                                ? true
                                : false
                            : false
                        : false;
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
                    keyFeatures: this.splitDescriptionIntoKeyFeatures(item.serviceDescription),
                    isChecked: productIsChecked,
                    styleClass: productIsChecked ? PRODUCT_CONTENT_SELECTED_CLASS : PRODUCT_CONTENT_CLASS
                };
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
        this.productType = fixedWirelessProducts.length > 0 ? WIRELESS_PRODUCT_PRODUCT_TYPE : "Wired Products";
        this.wirelessServices = this.productType === WIRELESS_PRODUCT_PRODUCT_TYPE ? [...vasServices] : [];
        this.wiredServices = this.productType === "Wired Products" ? [...vasServices] : [];
        this.products = this.productType === "Wired Products" ? [...wiredProducts] : [...wirelessProducts];
        if (this.productType === "Wired Products") {
            this.wiredServiceFees = [...result.serviceTerm];
        } else {
            this.wirelessServiceFees = [...result.serviceTerm];
        }
        this.initialProducts = this.productType === "Wired Products" ? [...wiredProducts] : [...wirelessProducts];
        this.wiredProducts = [...wiredProducts];
        this.wirelessProducts = [...wirelessProducts];
        this.noOptions =
            this.productType === "Wired Products" ||
            (this.productType === WIRELESS_PRODUCT_PRODUCT_TYPE && !result.hasOwnProperty("suggestedAddresses"));
        this.suggestedAddresses = !this.noOptions ? [...result.suggestedAddresses] : [];
        this.canScheduleAppt = result.canScheduleAppt === "yes";
        this.selectedOptionValue = this.productType === "Wired Products" ? "wired" : "wireless";
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
            this.paymentDisclaimer = result.generalTerms[0]?.paymentDisclaimer;
        }
    }

    handleCheckoutDisclaimer() {
        let disclaimer = {
            header: TERMS_OF_SERVICE_TITLE,
            shortDescription: this.isGuestUser
                ? CUSTOMER_TERMS_AND_CONDITIONS_INSTRUCTIONS
                : AGENT_TERMS_AND_CONDITIONS_INSTRUCTIONS,
            description: "",
            cancelText: this.isGuestUser 
                        ? CUSTOMER_DISAGREE_TERMS_AND_CONDITIONS_LABEL 
                        : AGENT_DISAGREE_TERMS_AND_CONDITIONS_LABEL,
            agreeText: this.isGuestUser 
                        ? CUSTOMER_TERMS_AND_CONDITIONS_SHORT_VERBIAGE
                        : AGENT_TERMS_AND_CONDITIONS_SHORT_VERBIAGE
        };

        const selectedProduct = this.products.find((prod) => prod.Name === this.selectedTarget);
        let verbiages;
        if (
            !!this.paymentDisclaimer &&
            !this.checkoutDisclaimers.some((item) => item.verbiage == this.paymentDisclaimer)
        ) {
            verbiages = `${this.generalTerms} ${selectedProduct.terms} ${selectedProduct.speedDisclaimer} ${this.paymentDisclaimer}`;
        } else {
            verbiages = `${this.generalTerms} ${selectedProduct.terms} ${selectedProduct.speedDisclaimer}`;
        }
        disclaimer.description = this.handleTermsFormat(verbiages);
        this.checkoutDisclaimers.push(disclaimer);
    }

    handleTermsFormat(term) {
        let termArr = term.split(". ");
        let rawDescription;
        let description;
        termArr.forEach((item, index) => {
            item = item.replace("undefined", "").replace("..", ".");
            if (item !== "" && item != undefined) {
                if (index == 0) {
                    rawDescription += `\u2022 ${item}.`;
                } else {
                    rawDescription += `\n\u2022 ${item}.`;
                }
            }
        });
        description = rawDescription.replace("undefined", "").replace("..", ".");
        return description;
    }

    handleBroadbandModal() {
        emailBroadbandLabelModal
            .open({
                products: this.products,
                promoCode: this.selectedPromoCode,
                logId: this.logId,
                isGuestUser: this.isGuestUser,
                broadbandLabels: this.broadbandLabels,
                onlogerror: (e) => this.handleChildLogError(e)
            })
            .then((result) => {
                if (!result?.detail) {
                    return;
                }
                this.handleBroadbandUpdate(result);
            });
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

    splitDescriptionIntoKeyFeatures(description) {
        let newDescription = `No annual contract. ` + description;
        const potentialSentences = newDescription.split(/[.!]/);
        const keyFeaturesWithIds = potentialSentences
            .map((sentence, index) => {
                const trimmedSentence = sentence.trim();
                return {
                    id: index + 1,
                    feature: trimmedSentence.length > 1 ? trimmedSentence + "." : ""
                };
            })
            .filter((obj) => obj.feature !== "");

        const firstThreeFeatures = keyFeaturesWithIds.slice(0, 3);
        return firstThreeFeatures;
    }

    formatProductDescription(description) {
        const lines = description.split(/[.][\s\n]+/);
        const spacedLines = lines.filter((sentence) => sentence.trim() !== "");
        return spacedLines.join("<br><br>");
    }
    filterResidentialPromoCode(promoObject) {
        if (!promoObject || !promoObject.promoCodes) {
            return { promoCodes: [] };
        }

        const filteredPromoCodes = promoObject.promoCodes.filter((code) => code.label === "Residential Sale");

        return [filteredPromoCodes];
    }
}