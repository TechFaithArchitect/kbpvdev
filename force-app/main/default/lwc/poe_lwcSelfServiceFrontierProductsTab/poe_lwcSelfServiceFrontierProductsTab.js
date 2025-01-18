import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { loadStyle } from "lightning/platformResourceLoader";

import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveProduct from "@salesforce/apex/ProductTabController.saveProduct";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";

import PAYMENT_DISCLAIMER from "@salesforce/label/c.Frontier_PaymentDisclaimer";
import BROADBAND_EN_URL from "@salesforce/label/c.Frontier_Consumer_Broadband_Base_URL_EN";
import BROADBAND_SP_URL from "@salesforce/label/c.Frontier_Consumer_Broadband_Base_URL_SP";
import SELF_SERVICE_VALIDATE_LEAVING_MESSAGE from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import SELF_SERVICE_VALIDATE_LEAVING_TITLE from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import FIBER_200_CONSISTENT_PRICING_INCENTIVE from "@salesforce/label/c.Frontier_Fiber_200_Consistent_Pricing_Incentive";
import FIBER_500_USAGE_INCENTIVE from "@salesforce/label/c.Frontier_Fiber_500_Usage_Incentive";
import FIBER_1_GIG_USAGE_INCENTIVE from "@salesforce/label/c.Frontier_Fiber_1_Gig_Usage_Incentive";
import FIBER_2_GIG_USAGE_INCENTIVE from "@salesforce/label/c.Frontier_Fiber_2_Gig_Usage_Incentive";
import FIBER_5_PLUS_GIG_USAGE_INCENTIVE from "@salesforce/label/c.Frontier_Fiber_5_Plus_Gig_Usage_Incentive";
import INTERNET_SPEEDS_UP_TO_VERBIAGE from "@salesforce/label/c.Internet_Speeds_Up_To_Verbiage";
import ADVANCED_ROUTER_INCLUDED_VERBIAGE from "@salesforce/label/c.Frontier_Advanced_Router_Included_Verbiage";
import REGULAR_ROUTER_INCLUDED_VERBIAGE from "@salesforce/label/c.Frontier_Regular_Router_Included_Verbiage";
import PRODUCT_DESCRIPTION_MODAL_TITLE from "@salesforce/label/c.Frontier_Product_Description_Modal_Title";
import CLOSE_BUTTON_LABEL from "@salesforce/label/c.Close_Button_Label";
import TWO_GIG_PRODUCT_ID from "@salesforce/label/c.Chuzo_Frontier_Two_Gig_ID";
import SEVEN_GIG_PRODUCT_ID from "@salesforce/label/c.Chuzo_Frontier_Seven_Gig_ID";
import TWO_HUNDRED_PRODUCT_ID from "@salesforce/label/c.Chuzo_Frontier_Two_Hundred_ID";
import FIVE_HUNDRED_PRODUCT_ID from "@salesforce/label/c.Chuzo_Frontier_Five_Hundred_ID";
import ADVANCED_ROUTER_VERBIAGE from "@salesforce/label/c.Frontier_Advance_Router_Verbiage";
import chuzo_modalGeneric from "c/chuzo_modalGeneric";

const PRODUCT_CONTENT_CLASS = "price-content";
const PRODUCT_CONTENT_SELECTED_CLASS = "price-content selected";

export default class Poe_lwcSelfServiceFrontierProductsTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api origin;
    @api userId;
    @api selected;
    @api clientInfo;
    @api frontierUserId;
    @api agentId;
    @api isGuestUser;

    frontierSecureProds = [];
    broadbandProds = [];
    voiceProds = [];
    addOnProds = [];
    cart = {
        hasTodayCharge: false,
        hasMonthlyCharge: false,
        todayCharges: [],
        monthlyCharges: [],
        todayTotal: (0.0).toFixed(2),
        monthlyTotal: (0.0).toFixed(2)
    };
    originalCart;
    showCollateral = false;
    initialBroadbandProds = [];
    showModal = false;
    showSBS = false;
    loaderSpinner;
    quoteId;
    accountUuid;
    selectedTarget;
    controlNumber;
    environmentCode;
    disableNext = true;
    productIds = [];
    hasPhoneNumbers = false;
    productDescription;
    showProductDescription;
    productSelected;
    acp;
    pricingOptions = [
        {
            label: "Acquisition",
            value: "regular"
        },
        {
            label: "Affordable Connectivity Program",
            value: "acp"
        }
    ];
    pricing = "regular";
    originalProducts = [];
    showACPModal;
    showScrollArrows = false;
    broadbandURLs = {
        EN: `<a href=${BROADBAND_EN_URL} target="_blank">English</a> - ${BROADBAND_EN_URL.replace("https://", "")}`,
        SP: `<a href=${BROADBAND_SP_URL} target="_blank">Spanish</a> - ${BROADBAND_SP_URL.replace("https://", "")}`
    };
    labels = {
        SELF_SERVICE_VALIDATE_LEAVING_TITLE,
        SELF_SERVICE_VALIDATE_LEAVING_MESSAGE,
        ADVANCED_ROUTER_INCLUDED_VERBIAGE,
        REGULAR_ROUTER_INCLUDED_VERBIAGE
    };
    showSelfServiceCancelModal = false;
    language = "EN";

    get loadingFinished() {
        return !this.loaderSpinner;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get languageOptions() {
        return [
            { label: "English", value: "EN" },
            { label: "Spanish", value: "SP" }
        ];
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconFormUser() {
        return chuzoSiteResources + "/images/icon-frontier-user.svg";
    }

    get nextButtonClass() {
        return this.disableNext
            ? "btn-rounded btn-center hide-mobile btn-disabled"
            : "btn-rounded btn-center hide-mobile";
    }

    get nextButtonClassMobile() {
        return this.disableNext ? "btn-rounded btn-center btn-disabled" : "btn-rounded btn-center";
    }

    get iconCheckRed() {
        return chuzoSiteResources + "/images/icon-check-red.svg";
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");

        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        let clientInfoParsed = JSON.parse(JSON.stringify(this.clientInfo));
        this.loaderSpinner = true;
        this.originalCart = { ...this.cart };
        const path = "productsByAddress";
        let myData = {
            partnerName: "frapi",
            path,
            customerType: "Residential",
            environmentCode: clientInfoParsed.address.environment,
            controlNumber: clientInfoParsed.address.controlNumber,
            userId: this.frontierUserId,
            tracking: [
                {
                    key: "selfInstallSalesJourney",
                    value: "TRUE"
                }
            ]
        };
        this.controlNumber = clientInfoParsed.address.controlNumber;
        this.environmentCode = clientInfoParsed.address.environment;
        console.log("Products By Address Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Products By Address Response", result);
                let error =
                    (result.hasOwnProperty("error") &&
                        result.error.hasOwnProperty("provider") &&
                        result.error.provider.hasOwnProperty("message")) ||
                    result.hasOwnProperty("error");
                if (error) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.loaderSpinner = false;
                } else {
                    let bnd = result.length > 0 ? result : undefined;
                    this.originalProducts = [...bnd];
                    this.calculateProducts(bnd);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The Product request could not be made correctly to the server. Please, try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
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
                this.loaderSpinner = false;
            });
    }

    calculateProducts(bnd) {
        this.loaderSpinner = true;
        this.disableNext = true;
        let frontierSecureProducts = [];
        let addOnProducts = [];
        let broadbandProducts = [];
        let voiceProducts = [];
        let i = 0;
        if (bnd !== undefined) {
            bnd.forEach((item) => {
                i = i + 1;
                let discounts = 0;
                if (
                    item.pricePlan.hasOwnProperty("priceTerm") &&
                    item.pricePlan.priceTerm[0].hasOwnProperty("discount") &&
                    item.pricePlan.priceTerm[0].discount.length > 0
                ) {
                    item.pricePlan.priceTerm[0].discount.forEach((item) => {
                        discounts = Number(discounts) + Number(item.amount);
                    });
                }
                let autopayDiscount = 0;
                if (item.hasOwnProperty("sweeteners")) {
                    item.sweeteners.forEach((element) => {
                        if (element.options[0].type === "Autopay Discount") {
                            autopayDiscount = Number(element.options[0].amount);
                        }
                    });
                }

                let intProduct = {
                    Id: item.id,
                    popular: item.id === TWO_GIG_PRODUCT_ID,
                    Name: item.name,
                    ProductId:
                        item.pricePlan !== undefined
                            ? item.pricePlan.priceTerm[0] !== undefined
                                ? item.pricePlan.priceTerm[0].productId
                                : ""
                            : "",
                    Type: "",
                    Price:
                        item.pricePlan !== undefined
                            ? item.pricePlan.priceTerm[0] !== undefined
                                ? item.pricePlan.priceTerm[0].amount
                                : ""
                            : "",
                    PromoPrice:
                        item.pricePlan !== undefined
                            ? item.pricePlan.priceTerm[0] !== undefined
                                ? discounts != 0
                                    ? (Number(item.pricePlan.priceTerm[0].amount) + discounts).toFixed(2).toString()
                                    : item.pricePlan.priceTerm[0].amount
                                : ""
                            : "",
                    AutoPayPrice:
                        item.pricePlan !== undefined
                            ? item.pricePlan.priceTerm[0] !== undefined
                                ? autopayDiscount != 0
                                    ? (Number(item.pricePlan.priceTerm[0].amount) + discounts + autopayDiscount)
                                          .toFixed(2)
                                          .toString()
                                    : (Number(item.pricePlan.priceTerm[0].amount) + discounts).toFixed(2).toString()
                                : ""
                            : "",
                    FuturePrice:
                        item.pricePlan !== undefined
                            ? item.pricePlan.priceTerm[0] !== undefined
                                ? item.pricePlan.priceTerm[0].amountR2 !== ""
                                    ? item.pricePlan.priceTerm[0].amountR2
                                    : ""
                                : ""
                            : "",
                    FuturePriceTerm:
                        item.pricePlan !== undefined
                            ? item.pricePlan.priceTerm[0] !== undefined
                                ? item.pricePlan.priceTerm[0].durationInMonthsR2
                                : ""
                            : "",
                    Family: "Frontier",
                    PriceType:
                        item.pricePlan !== undefined
                            ? item.pricePlan.priceTerm[0] !== undefined
                                ? item.pricePlan.priceTerm[0].termType
                                : ""
                            : "",
                    ServiceType: item.serviceType,
                    Duration:
                        item.pricePlan !== undefined
                            ? item.pricePlan.priceTerm[0] !== undefined
                                ? item.pricePlan.priceTerm[0].durationInMonths
                                : ""
                            : "",
                    Speed: item.dataSpeed !== undefined ? item.dataSpeed.downloadInKbps : "",
                    Description: item.description,
                    campaignDescription: item.campaignDescription,
                    disclaimerDescription: item.disclaimerDescription,
                    paymentDisclaimer: PAYMENT_DISCLAIMER,
                    download:
                        item.hasOwnProperty("dataspeed") && item.dataspeed.hasOwnProperty("downloadInKbps")
                            ? (Number(item.dataspeed.downloadInKbps) / 1000).toString() + " Mbps"
                            : "",
                    speed:
                        item.hasOwnProperty("dataspeed") && item.dataspeed.hasOwnProperty("downloadInKbps")
                            ? Number(item.dataspeed.downloadInKbps) / 1000
                            : 0,
                    upload:
                        item.hasOwnProperty("dataspeed") && item.dataspeed.hasOwnProperty("uploadInKbps")
                            ? (Number(item.dataspeed.uploadInKbps) / 1000).toString() + " Mbps"
                            : "",
                    isChecked: this.selected !== undefined ? (this.selected.includes(item.name) ? true : false) : false,
                    sweeteners: item.hasOwnProperty("sweeteners") ? item.sweeteners : [],
                    broadbandLabelId: item.labelId,
                    broadbandLabelUrl:
                        this.isGuestUser && item.labelId !== undefined
                            ? (this.language === "SP" ? BROADBAND_SP_URL : BROADBAND_EN_URL) +
                              "-label?labelId=" +
                              item.labelId
                            : "",
                    hasLimitedDiscount:
                        item.hasOwnProperty("sweeteners") &&
                        item.sweeteners.some((e) => e.options.some((o) => o.type === "Fiber Promotional Discount")),
                    hasAdvancedRouter: item.campaignDescription.includes(ADVANCED_ROUTER_VERBIAGE),
                    usageOrPricingIncentive: this.getusageOrPricingIncentiveByProduct(item),
                    show:
                        item.id !== SEVEN_GIG_PRODUCT_ID &&
                        item.id !== TWO_HUNDRED_PRODUCT_ID &&
                        item.id !== FIVE_HUNDRED_PRODUCT_ID
                };
                intProduct.speedUpToText = intProduct.download
                    ? INTERNET_SPEEDS_UP_TO_VERBIAGE.replace("{INTERNET_SPEED}", intProduct.download)
                    : "";
                intProduct.styleClass = intProduct.isChecked ? PRODUCT_CONTENT_SELECTED_CLASS : PRODUCT_CONTENT_CLASS;
                if (intProduct.popular) {
                    intProduct.styleClass = `${intProduct.styleClass} popular-product`;
                }
                intProduct.hasPromo = intProduct.AutoPayPrice !== intProduct.PromoPrice;
                if (intProduct.hasLimitedDiscount) {
                    item.sweeteners.forEach((sweet) => {
                        if (sweet.options.some((e) => e.type === "Fiber Promotional Discount")) {
                            let sweetenerOption = [
                                ...sweet.options.filter((e) => e.type === "Fiber Promotional Discount")
                            ][0];
                            intProduct.discountVerbiage = `Limited Time Offer! Savings of $${sweetenerOption.amount.replace(
                                "-",
                                ""
                            )}/mo. $${
                                intProduct.hasPromo
                                    ? (Number(intProduct.AutoPayPrice) + Number(sweetenerOption.amount)).toFixed(2)
                                    : (Number(sweetenerOption.amount) + Number(intProduct.PromoPrice)).toFixed(2)
                            } for ${sweetenerOption.requirements[0].durationInMonths} months`;
                        }
                    });
                }

                if (intProduct.isChecked) {
                    this.disableNext = false;
                }
                if (intProduct.Price !== "") {
                    if (intProduct.ServiceType == "Frontier Secure") {
                        intProduct.Type = "frontierSecure";
                        frontierSecureProducts.push(intProduct);
                    } else if (intProduct.ServiceType == "Broadband") {
                        intProduct.Type = "broadband";
                        broadbandProducts.push(intProduct);
                    } else if (intProduct.ServiceType == "Voice") {
                        intProduct.Type = "voice";
                        voiceProducts.push(intProduct);
                    } else if (intProduct.ServiceType == "Add On") {
                        intProduct.Type = "addOn";
                        addOnProducts.push(intProduct);
                    }
                }
            });
        }
        this.frontierSecureProds = [...frontierSecureProducts];
        broadbandProducts.sort((a, b) => (a.speed > b.speed ? -1 : a.speed < b.speed ? 1 : 0));
        this.broadbandProds = [...broadbandProducts];
        this.initialBroadbandProds = [...broadbandProducts];
        this.addOnProds = [...addOnProducts];
        this.voiceProds = [...voiceProducts];

        let products = [...this.broadbandProds];

        let checkedTypes = [];
        let cart = { ...this.originalCart };
        if (products.length > 0) {
            products.forEach((product) => {
                if (product.isChecked === true) {
                    let newCharge = {
                        name: product.Name,
                        fee: product.Price !== undefined ? Number(product.Price).toFixed(2) : (0.0).toFixed(2),
                        type: product.PriceType,
                        discount: product.Price !== undefined ? Number(product.Price) <= 0 : true
                    };
                    checkedTypes.push(product.ServiceType);
                    if (newCharge.type === "Monthly" || newCharge.type === undefined) {
                        cart.hasMonthly = true;
                        cart.monthlyCharges.push(newCharge);
                    } else {
                        cart.hasToday = true;
                        cart.todayCharges.push(newCharge);
                    }
                }
            });
        }
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        cart.todayCharges.forEach(
            (charge) => (cart.todayTotal = (Number(cart.todayTotal) + Number(charge.fee)).toFixed(2))
        );
        this.cart = { ...cart };

        this.dispatchEvent(
            new CustomEvent("cartupdate", {
                detail: this.cart
            })
        );

        if (checkedTypes.includes("Broadband")) {
            this.disableNext = false;
        }
        this.loaderSpinner = false;
    }

    get productsRadioOptions() {
        return this.products.map(function (obj) {
            return {
                label: obj.Name + " - Price: $" + obj.Price + " - " + obj.PriceType,
                value: obj.Id
            };
        });
    }

    get bundlesRadioOptions() {
        return this.bundles.map(function (obj) {
            return {
                label: obj.Name + " - Price: $" + obj.Price + " - " + obj.PriceType,
                value: obj.Id
            };
        });
    }

    handlePriceChange(event) {
        this.priceChangeFrontierBroadband(event);
        const products = [...this.initialBroadbandProds];
        const checkedTypes = [];
        const cart = { ...this.originalCart };
        cart.monthlyCharges = [];
        cart.todayCharges = [];
        products.forEach((product) => {
            if (product.isChecked === true) {
                let mainCharge = {
                    name: product.Name,
                    fee: product.PromoPrice !== undefined ? Number(product.PromoPrice).toFixed(2) : (0.0).toFixed(2),
                    type: product.PriceType,
                    discount: product.PromoPrice !== undefined ? Number(product.PromoPrice) <= 0 : true
                };
                checkedTypes.push(product.ServiceType);
                if (mainCharge.type === "Monthly" || mainCharge.type === undefined) {
                    cart.hasMonthly = true;
                    cart.monthlyCharges.push(mainCharge);
                } else {
                    cart.hasToday = true;
                    cart.todayCharges.push(mainCharge);
                }
            }
        });

        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        cart.todayCharges.forEach(
            (charge) => (cart.todayTotal = (Number(cart.todayTotal) + Number(charge.fee)).toFixed(2))
        );
        this.cart = { ...cart };

        this.dispatchEvent(
            new CustomEvent("cartupdate", {
                detail: this.cart
            })
        );

        if (checkedTypes.includes("Broadband")) {
            this.disableNext = false;
        }
    }

    priceChangeFrontierBroadband(event) {
        let selected;
        let value = event.currentTarget.dataset.productId;
        let index = this.broadbandProds.findIndex((broadband) => broadband.Id === value);
        if (index !== undefined && index !== -1) {
            selected = index;
        }
        if (selected !== undefined) {
            let sel = [];
            this.broadbandProds.forEach((broadband) => {
                if (broadband.Id === this.broadbandProds[selected].Id) {
                    broadband.isChecked = true;
                    broadband.styleClass = PRODUCT_CONTENT_SELECTED_CLASS;
                } else {
                    broadband.isChecked = false;
                    broadband.styleClass = PRODUCT_CONTENT_CLASS;
                }
                if (broadband.popular) {
                    broadband.styleClass = `${broadband.styleClass} popular-product`;
                }
                sel.push(broadband);
            });
            this.broadbandProds = [];
            this.broadbandProds = [...sel];
        }
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

    handleDescriptionModal(event) {
        this.broadbandProds.forEach((item) => {
            if (item.Name === event.currentTarget.dataset.id) {
                this.productDescription = item.Description;
            }
        });

        chuzo_modalGeneric
            .open({
                content: {
                    title: PRODUCT_DESCRIPTION_MODAL_TITLE,
                    provider: "frontier",
                    body: this.productDescription,
                    agreeLabel: CLOSE_BUTTON_LABEL,
                    canClose: false
                }
            })
            .then(() => {});
    }

    handleClick() {
        this.loaderSpinner = true;
        this.productIds = [];
        let selectedProducts = [];
        let products = [...this.broadbandProds];
        products.forEach((item) => {
            if (item.isChecked) {
                let product = {
                    Description: item.Description,
                    Family: item.Family,
                    Name: item.Name.substring(0, 80),
                    UnitPrice: parseFloat(item.Price),
                    PriceType: item.PriceType,
                    ProductCode: item.ProductId,
                    servRef: item.ProductId,
                    vasProduct: false
                };
                selectedProducts.push(product);
                this.productSelected = product.Name;
                this.productIds.push(item.Id);
                if (item.ServiceType === "Voice") {
                    this.hasPhoneNumbers = true;
                }
            }
        });
        let info = {
            quoteId: this.quoteId,
            accountUuid: this.accountUuid,
            cart: this.cart,
            productSelected: this.productSelected,
            customerValidationParams: {
                agentId: this.agentId,
                environmentCode: this.environmentCode,
                controlNumber: this.controlNumber
            }
        };
        let myData = {
            Program: "Frontier",
            ContextId: this.recordId,
            Adders: selectedProducts,
            iframe: false
        };
        saveProduct({ myData })
            .then((response) => {
                let trackerData = {
                    userId: this.userId,
                    operation: "setTrack",
                    isCount: true,
                    action: "Product Selection"
                };

                let saveTrackerMethod;
                switch (this.origin) {
                    case "retail":
                        saveTrackerMethod = setClickerRetailTrack;
                        break;
                    case "event":
                        saveTrackerMethod = setClickerEventTrack;
                        break;
                    case "phonesales":
                        saveTrackerMethod = setClickerCallCenterTrack;
                        break;
                }

                console.log("this.pricing", this.pricing);
                const nextEvent = new CustomEvent("productselection", { detail: info });
                this.dispatchEvent(nextEvent);
                const sendProductsEvent = new CustomEvent("configurationsendproducts", {
                    detail: {
                        secure: this.frontierSecureProds,
                        addOns: this.addOnProds,
                        voiceProducts: this.voiceProds,
                        productIds: this.productIds
                    }
                });
                console.log("sendProductsEvent.detail", sendProductsEvent.detail);
                this.dispatchEvent(sendProductsEvent);

                if (!saveTrackerMethod) {
                    this.loaderSpinner = false;
                    return;
                }

                saveTrackerMethod({ myData: trackerData })
                    .then((response) => {
                        this.loaderSpinner = false;
                    })
                    .catch((error) => {
                        console.error(error, "ERROR");
                        this.logError(error.body?.message || error.message);
                        this.loaderSpinner = false;
                    });
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The Product request could not be made correctly to the server. Please, try again."
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
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

    handleModal() {
        this.acp = false;
        this.showModal = true;
    }

    handleCloseModal() {
        if (this.acp) {
            this.pricing = "regular";
            this.calculateProducts(this.originalProducts);
        }
        this.showModal = false;
    }

    handleSaveModal(event) {
        this.showModal = false;
    }

    handleACPModal(event) {
        this.quoteId = event.detail.quoteId;
        this.accountUuid = event.detail.accountUuid;
        this.showModal = false;
        this.showACPModal = !this.showACPModal;
    }

    handleCloseACPModal(event) {
        this.showACPModal = false;
        this.pricing = "regular";
    }

    handleACPResult(event) {
        this.showACPModal = false;
        if (event.detail.result) {
            this.pricing = "acp";
            this.calculateProducts(event.detail.products);
        } else {
            this.pricing = "regular";
            this.calculateProducts(this.originalProducts);
        }
    }

    handleShowBroadbandLabels() {
        if (!this.isGuestUser) return;

        this.template.querySelectorAll("c-poe_lwc-broadband-label").forEach((broadBandLabelEl) => {
            broadBandLabelEl.open();
        });

        setTimeout(() => {
            globalThis.scrollTo({ top: 0, left: 0 });
        }, 0);
    }

    handleLanguageSelection(event) {
        if (event.target.name === "language") {
            this.language = event.target.value;
        }
        let baseUrl = this.language === "SP" ? BROADBAND_SP_URL : BROADBAND_EN_URL;
        let broadbandProds = [...this.broadbandProds];
        broadbandProds.forEach((item) => {
            item.broadbandLabelUrl = `${baseUrl}-label?labelId=${item.broadbandLabelId}`;
        });
        this.broadbandProds = [...broadbandProds];
    }

    handleShowMore(event) {
        let packages = [];
        if (event.target.checked) {
            packages = [
                ...this.broadbandProds.map((item) => {
                    if (!item.show) {
                        item.show = true;
                    }
                    return item;
                })
            ];
            this.showScrollArrows = true;
        } else {
            packages = [
                ...this.broadbandProds.map((item) => {
                    if (
                        item.Id === FIVE_HUNDRED_PRODUCT_ID ||
                        item.Id === TWO_HUNDRED_PRODUCT_ID ||
                        item.Id === SEVEN_GIG_PRODUCT_ID
                    ) {
                        item.show = false;
                        if (item.isChecked) {
                            item.isChecked = false;
                            this.disableNext = true;
                        }
                    }
                    return item;
                })
            ];
            this.showScrollArrows = false;
        }
        this.broadbandProds = [...packages];
    }

    getusageOrPricingIncentiveByProduct(product) {
        const lowerCaseProdName = product.name.toLowerCase();
        if (lowerCaseProdName.includes("fiber 200")) {
            return FIBER_200_CONSISTENT_PRICING_INCENTIVE; // Frontier_Fiber_200_Consistent_Pricing_Incentive
        } else if (lowerCaseProdName.includes("fiber 500")) {
            return FIBER_500_USAGE_INCENTIVE; // Frontier_Fiber_500_Usage_Incentive
        } else if (lowerCaseProdName.includes("fiber 1 gig")) {
            return FIBER_1_GIG_USAGE_INCENTIVE; // Frontier_Fiber_1_Gig_Usage_Incentive
        } else if (lowerCaseProdName.includes("fiber 2 gig")) {
            return FIBER_2_GIG_USAGE_INCENTIVE; // Frontier_Fiber_2_Gig_Usage_Incentive
        } else if (lowerCaseProdName.includes("fiber 5 gig") || lowerCaseProdName.includes("fiber 7 gig")) {
            return FIBER_5_PLUS_GIG_USAGE_INCENTIVE; // Frontier_Fiber_5_Plus_Gig_Usage_Incentive
        }
    }

    scrollLeft() {
        const carousel = this.template.querySelector(".carousel");
        carousel.scrollBy({
            left: -200, // Adjust this value to scroll by the width of one card
            behavior: "smooth"
        });
    }

    scrollRight() {
        const carousel = this.template.querySelector(".carousel");
        carousel.scrollBy({
            left: 200, // Adjust this value to scroll by the width of one card
            behavior: "smooth"
        });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Products",
            component: "poe_lwcBuyflowFrontierProductsTab",
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
            tab: "Products"
        };
        this.dispatchEvent(event);
    }
}