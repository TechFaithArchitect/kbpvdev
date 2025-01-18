import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveProduct from "@salesforce/apex/ProductTabController.saveProduct";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import PRODUCT_SELECTION_TITLE from "@salesforce/label/c.Product_Selection_Title";
import CHARTER from "@salesforce/label/c.charter";
import VIEW_ALL_BROADBANDS from "@salesforce/label/c.View_All_Broadbands_Button_Label";
import INTERNET_PHONE from "@salesforce/label/c.Internet_Phone_Tab_Label";
import INTERNET from "@salesforce/label/c.Self_Service_Program_Selection_Internet_Tab";
import PHONE from "@salesforce/label/c.Phone_Tab_Label";
import SPINNER_TEXT from "@salesforce/label/c.Spinner_Alternative_Text";
import PRODUCT_ENRICHMENT_ERROR from "@salesforce/label/c.Spectrum_Product_Enrichment_Generic_Error_Message";
import GENERIC_PRODUCT_ERROR from "@salesforce/label/c.Chuzo_Generic_Product_Error_Message";
import SPECTRUM_API from "@salesforce/label/c.Spectrum_API";
import ERROR_VARIANT from "@salesforce/label/c.error_variant";
import STICKY_MODE from "@salesforce/label/c.sticky_mode";
import EVENT from "@salesforce/label/c.event";
import RETAIL from "@salesforce/label/c.retail";
import PHONESALES from "@salesforce/label/c.phonesales";
import OPPORTUNITY_OBJ_NAME from "@salesforce/label/c.Opportunity_Object_Name";
import API_ERROR from "@salesforce/label/c.API_Error";
import SERVER_ERROR from "@salesforce/label/c.Server_Error_Toast_Title";
import BUNDLE_LABEL from "@salesforce/label/c.Spectrum_Bundle_Label";
import PRODUCTS_TAB from "@salesforce/label/c.Products_Tab_Name_Label";
import PRODUCT_SELECTION from "@salesforce/label/c.Product_Selection_Title";
import GENERIC_ERROR_LOG from "@salesforce/label/c.Generic_Error_Log";

export default class Poe_lwcBuyflowSpectrumProductsTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api origin;
    @api userId;
    @api selected;
    @api contact;
    @api productInfo;
    @api sessionId;
    @api isGuestUser;
    hasPhone;
    hasMobile;
    phoneProducts = [];
    internetProducts = [];
    internetPhoneProducts = [];
    internetMobileProducts = [];
    internetPhoneMobileProducts = [];
    products = [];
    showInternetPhone = false;
    showInternetMobile = false;
    showInternetPhoneMobile = false;
    showInternet = false;
    showPhone = false;
    cart = {
        hasTodayCharge: false,
        hasMonthlyCharge: false,
        todayCharges: [],
        monthlyCharges: {
            internet: [],
            phone: [],
            mobile: []
        },
        todayTotal: (0.0).toFixed(2),
        monthlyTotal: (0.0).toFixed(2),
        hasFirstBill: true,
        firstBillCharges: [],
        firstBillTotal: (0.0).toFixed(2),
        firstBillTaxes: (0.0).toFixed(2),
        monthlyTaxes: (0.0).toFixed(2)
    };
    originalCart;
    showCollateral = false;
    showSBS = false;
    initialProducts = [];
    showModal = false;
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
    showProductDescription = false;
    productSelected;
    originalProducts = [];
    disclaimerByOfferIdMap = new Map();
    productType;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        PRODUCT_SELECTION_TITLE,
        CHARTER,
        VIEW_ALL_BROADBANDS,
        INTERNET_PHONE,
        INTERNET,
        PHONE,
        SPINNER_TEXT
    };
    showSelfServiceCancelModal = false;
    initializing = true;
    showTabs = false;

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
        this.cart.orderNumber = this.sessionId;
        this.originalCart = { ...this.cart };
        this.handleProductEnrichments();
    }

    handleProductEnrichments() {
        const path = "productEnrichments";
        let myData = {
            partnerName: "charter",
            path,
            offerId: "",
            sessionId: this.sessionId,
            getAllContents: true,
            type: "enrichment"
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
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", apiResponse);
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                    this.loaderSpinner = false;
                } else {
                    let products = this.productInfo.length > 0 ? this.productInfo : undefined;
                    this.originalProducts = [...products];
                    this.calculateProducts(products, result.productEnrichmentsResponse);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = PRODUCT_ENRICHMENT_ERROR;
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

    calculateProducts(info, enrichments) {
        this.loaderSpinner = true;
        this.disableNext = true;
        let internetProducts = [];
        let internetPhoneMobileProducts = [];
        let internetPhoneProducts = [];
        let internetMobileProducts = [];
        let phoneProducts = [];
        let internetProductsOffers = [];
        let internetPhoneMobileProductsOffers = [];
        let internetPhoneProductsOffers = [];
        let internetMobileProductsOffers = [];
        let phoneProductsOffers = [];
        let i = 0;
        if (info !== undefined) {
            info.forEach((item) => {
                i = i + 1;
                let enrichmentObject =
                    enrichments.filter((e) => e.uexId == item.id).length > 0
                        ? enrichments.filter((e) => e.uexId == item.id)[0]
                        : {};
                let intProduct = {
                    Id: item.id,
                    Name: Object.keys(enrichmentObject).length > 0 ? enrichmentObject.offerProductName : item.name,
                    ProductId: item.masterProductId,
                    Type: "",
                    Price:
                        item.pricing !== undefined
                            ? item.pricing.listPrice !== undefined
                                ? item.pricing.listPrice
                                : ""
                            : "",
                    AutoPayPrice:
                        item.pricing !== undefined
                            ? item.pricing.netPrice !== undefined
                                ? item.pricing.netPrice
                                : ""
                            : "",
                    PromoPrice:
                        item.pricing !== undefined
                            ? item.pricing.displayPriceType === "with Auto Pay" && item.pricing.displayPrice !== null
                                ? item.pricing.displayPrice
                                : item.pricing.netPrice !== undefined
                                ? item.pricing.netPrice
                                : ""
                            : "",
                    hasAutoPayPromo: item.pricing !== undefined && item.pricing.displayPriceType === "with Auto Pay",
                    hasPromo:
                        item.pricing !== undefined &&
                        item.pricing.displayPriceType !== "with Auto Pay" &&
                        item.pricing.listPrice !== item.pricing.netPrice,
                    AutoPayDiscount:
                        item.pricing !== undefined ? (item.pricing.netPrice - item.pricing.displayPrice) * -1 : "",
                    Family: SPECTRUM_API,
                    PriceType:
                        item.product !== undefined && item.product[0] !== undefined
                            ? item.product[0].pricing.type !== undefined
                                ? item.product[0].pricing.type
                                : ""
                            : "",
                    promoTerm:
                        item.pricing.discountTerm !== undefined && item.pricing.discountTerm !== null
                            ? item.pricing.discountTerm
                            : "",
                    ServiceType: item.lineOfBusiness,
                    Speed: item.internetSpeed !== undefined ? item.internetSpeed : "",
                    Description:
                        item.product !== undefined
                            ? item.product[0] !== undefined && item.product[0].description !== undefined
                                ? item.product[0].description
                                : ""
                            : "",
                    download:
                        item.hasOwnProperty("internetSpeed") && item.internetSpeed !== "n/a"
                            ? Number(item.internetSpeed).toString() + " Mbps"
                            : "N/A",
                    speed:
                        item.hasOwnProperty("internetSpeed") && item.internetSpeed !== "n/a"
                            ? Number(item.internetSpeed)
                            : 0,
                    upload:
                        item.hasOwnProperty("internetUploadSpeed") && item.internetUploadSpeed !== "n/a"
                            ? Number(item.internetUploadSpeed).toString() + " Mbps"
                            : "N/A",
                    broadbandLabel: item.product.some(
                        (prod) => prod.lineOfBusiness.toLowerCase() === "internet" && prod.broadbandLabel.length > 0
                    )
                        ? item.product
                              .filter(
                                  (prod) =>
                                      prod.lineOfBusiness.toLowerCase() === "internet" && prod.broadbandLabel.length
                              )[0]
                              .broadbandLabel.filter(
                                  (label) => label.format === "htmlUrl" && label.language === "EN"
                              )[0].link !== undefined
                            ? (!this.isGuestUser ? "Broadband Label: " : "") +
                              item.product
                                  .filter(
                                      (prod) =>
                                          prod.lineOfBusiness.toLowerCase() === "internet" && prod.broadbandLabel.length
                                  )[0]
                                  .broadbandLabel.filter(
                                      (label) => label.format === "htmlUrl" && label.language === "EN"
                                  )[0].link
                            : ""
                        : "",
                    mobileLabel: item.product.some(
                        (prod) => prod.lineOfBusiness.toLowerCase() === "mobile" && prod.broadbandLabel.length > 0
                    )
                        ? item.product
                              .filter(
                                  (prod) => prod.lineOfBusiness.toLowerCase() === "mobile" && prod.broadbandLabel.length
                              )[0]
                              .broadbandLabel.filter(
                                  (label) => label.format === "htmlUrl" && label.language === "EN"
                              )[0].link !== undefined
                            ? (!this.isGuestUser ? "Mobile Label: " : "") +
                              item.product
                                  .filter((prod) => prod.broadbandLabel.length)[0]
                                  .broadbandLabel.filter(
                                      (label) => label.format === "htmlUrl" && label.language === "EN"
                                  )[0].link
                            : ""
                        : "",
                    isChecked: this.selected !== undefined && this.selected == item.id,
                    category: item.category,
                    productHeader:
                        Object.keys(enrichmentObject).length > 0
                            ? enrichmentObject.offerProductHeading !== null
                                ? enrichmentObject.offerProductHeading
                                : ""
                            : "",
                    productBullets:
                        Object.keys(enrichmentObject).length > 0
                            ? enrichmentObject.offerProductDetails !== null
                                ? enrichmentObject.offerProductDetails
                                : ""
                            : "",
                    internetHeader:
                        Object.keys(enrichmentObject).length > 0
                            ? enrichmentObject.offerInternetHeading !== null
                                ? enrichmentObject.offerInternetHeading
                                : ""
                            : "",
                    internetBullets:
                        Object.keys(enrichmentObject).length > 0
                            ? enrichmentObject.offerInternetBullets !== null
                                ? enrichmentObject.offerInternetBullets
                                : ""
                            : "",
                    phoneHeader:
                        Object.keys(enrichmentObject).length > 0
                            ? enrichmentObject.offerPhoneHeading !== null
                                ? enrichmentObject.offerPhoneHeading
                                : ""
                            : "",
                    phoneBullets:
                        Object.keys(enrichmentObject).length > 0
                            ? enrichmentObject.offerPhoneBullets !== null
                                ? enrichmentObject.offerPhoneBullets
                                : ""
                            : "",
                    mobileHeader:
                        Object.keys(enrichmentObject).length > 0
                            ? enrichmentObject.offerMobileHeading !== null
                                ? enrichmentObject.offerMobileHeading
                                : ""
                            : "",
                    mobileBullets:
                        Object.keys(enrichmentObject).length > 0
                            ? enrichmentObject.offerMobileBullets !== null
                                ? enrichmentObject.offerMobileBullets
                                : ""
                            : "",
                    productArray: item.product,
                    isOffer: item.overbuildGroup.length > 0
                };
                if (intProduct.isChecked) {
                    this.disableNext = false;
                }
                let allOffers = [
                    ...internetPhoneMobileProductsOffers,
                    ...internetPhoneMobileProducts,
                    ...internetPhoneProductsOffers,
                    ...internetPhoneProducts,
                    ...internetMobileProductsOffers,
                    ...internetMobileProducts,
                    ...internetProductsOffers,
                    ...internetProducts,
                    ...phoneProducts,
                    ...phoneProductsOffers
                ];
                if (
                    intProduct.Price !== "" &&
                    intProduct.category !== "Featured" &&
                    !allOffers.some((e) => e.ProductId === intProduct.ProductId)
                ) {
                    if (
                        intProduct.ServiceType.includes("Internet") &&
                        intProduct.ServiceType.includes("Phone") &&
                        intProduct.ServiceType.includes("Mobile")
                    ) {
                        intProduct.productType = "internet-phone-mobile";
                        item.isOffer
                            ? internetPhoneMobileProductsOffers.push(intProduct)
                            : internetPhoneMobileProducts.push(intProduct);
                    } else if (
                        intProduct.ServiceType.includes("Internet") &&
                        intProduct.ServiceType.includes("Phone")
                    ) {
                        intProduct.productType = "internet-phone";
                        item.isOffer
                            ? internetPhoneProductsOffers.push(intProduct)
                            : internetPhoneProducts.push(intProduct);
                    } else if (
                        intProduct.ServiceType.includes("Internet") &&
                        intProduct.ServiceType.includes("Mobile")
                    ) {
                        intProduct.productType = "internet-mobile";
                        item.isOffer
                            ? internetMobileProductsOffers.push(intProduct)
                            : internetMobileProducts.push(intProduct);
                    } else if (intProduct.ServiceType.includes("Internet")) {
                        intProduct.productType = "internet";
                        item.isOffer ? internetProductsOffers.push(intProduct) : internetProducts.push(intProduct);
                    } else if (intProduct.ServiceType.includes("Phone")) {
                        intProduct.productType = "phone";
                        item.isOffer ? phoneProductsOffers.push(intProduct) : phoneProducts.push(intProduct);
                    }
                }
            });
        }
        internetProducts.sort((a, b) => (a.speed > b.speed ? -1 : a.speed < b.speed ? 1 : 0));
        if (internetProductsOffers.length > 0) {
            internetProductsOffers.sort((a, b) => (a.speed > b.speed ? -1 : a.speed < b.speed ? 1 : 0));
        }
        if (internetPhoneMobileProducts.length > 0) {
            this.handleSortOffers(internetPhoneMobileProducts);
        }
        if (internetMobileProductsOffers.length > 0) {
            this.handleSortOffers(internetPhoneMobileProductsOffers);
        }
        if (internetMobileProducts.length > 0) {
            this.handleSortOffers(internetMobileProducts);
        }
        if (internetMobileProductsOffers.length > 0) {
            this.handleSortOffers(internetMobileProductsOffers);
        }
        if (internetPhoneProducts.length > 0) {
            this.handleSortOffers(internetPhoneProducts);
        }
        if (internetPhoneProductsOffers.length > 0) {
            this.handleSortOffers(internetPhoneProductsOffers);
        }

        this.phoneProducts = [...phoneProductsOffers, ...phoneProducts];
        this.internetProducts = [...internetProductsOffers, ...internetProducts];
        this.internetMobileProducts = [...internetMobileProducts, ...internetMobileProductsOffers];
        this.internetPhoneMobileProducts = [...internetPhoneMobileProducts, ...internetPhoneMobileProductsOffers];
        this.internetPhoneProducts = [...internetPhoneProducts, ...internetPhoneProductsOffers];
        this.showPhone = this.phoneProducts.length > 0;
        this.showInternet = this.internetProducts.length > 0;
        this.showInternetPhoneMobile = this.internetPhoneMobileProducts.length > 0;
        this.showInternetMobile = this.internetMobileProducts.length > 0;
        this.showInternetPhone = this.internetPhoneProducts.length > 0;

        if (this.selected && this.initializing) {
            const allProducts = [
                ...this.internetPhoneMobileProducts,
                ...this.internetMobileProducts,
                ...this.internetPhoneProducts,
                ...this.internetProducts,
                ...this.phoneProducts
            ];
            const foundProduct = allProducts.find((product) => product.Id === this.selected);

            this.productType = foundProduct ? foundProduct.productType : this.productType;
        } else {
            if (this.showInternetPhoneMobile) {
                this.productType = "internet-phone-mobile";
            } else if (this.showInternetMobile) {
                this.productType = "internet-mobile";
            } else if (this.showInternetPhone) {
                this.productType = "internet-phone";
            } else if (this.showInternet) {
                this.productType = "internet";
            } else if (this.showPhone) {
                this.productType = "phone";
            }
        }

        switch (this.productType) {
            case "internet-phone-mobile":
                this.products = [...this.internetPhoneMobileProducts];
                break;
            case "internet-mobile":
                this.products = [...this.internetMobileProducts];
                break;
            case "internet-phone":
                this.products = [...this.internetPhoneProducts];
                break;
            case "internet":
                this.products = [...this.internetProducts];
                break;
            case "phone":
                this.products = [...this.phoneProducts];
                break;
        }
        this.initialProducts = [...this.products];
        let checkedTypes = [];
        let cart = { ...this.originalCart };
        if (this.products.length > 0) {
            this.products.forEach((product) => {
                if (product.isChecked === true) {
                    let newCharge = {
                        name: product.Name,
                        fee: product.Price !== undefined ? Number(product.Price).toFixed(2) : (0.0).toFixed(2),
                        type: product.PriceType,
                        discount: product.Price !== undefined ? Number(product.Price) <= 0 : true,
                        included: false
                    };
                    checkedTypes = [...product.ServiceType];
                    if (newCharge.type === "Per Month" || newCharge.type === undefined) {
                        cart.hasMonthly = true;
                        cart.monthlyCharges.internet.push(newCharge);
                    } else {
                        cart.hasToday = true;
                        cart.todayCharges.push(newCharge);
                    }
                }
            });
        }
        let monthlyCharges = [
            ...cart.monthlyCharges.internet,
            ...cart.monthlyCharges.phone,
            ...cart.monthlyCharges.mobile
        ];
        monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        cart.todayCharges.forEach(
            (charge) => (cart.todayTotal = (Number(cart.todayTotal) + Number(charge.fee)).toFixed(2))
        );
        cart.hasFirstBill = true;
        cart.firstBillTotal = cart.monthlyTotal;
        this.cart = { ...cart };
        if (checkedTypes.length > 0) {
            this.disableNext = false;
        }
        this.showTabs = true;
        this.loaderSpinner = false;
    }

    handleSortOffers(list) {
        return list.sort((a, b) =>
            (a.PromoPrice > b.PromoPrice) & (a.Name == b.Name)
                ? 1
                : (a.PromoPrice > b.PromoPrice) & (a.Name != b.Name)
                ? -1
                : (a.PromoPrice < b.PromoPrice) & (a.Name == b.Name)
                ? -1
                : (a.PromoPrice < b.PromoPrice) & (a.Name != b.Name)
                ? 1
                : 0
        );
    }

    changeOptions(event) {
        if (this.selected && this.initializing) {
            this.initializing = false;
            return;
        }
        this.productType = event.target.value;
        switch (event.target.value) {
            case "internet-phone-mobile":
                this.products = [...this.internetPhoneMobileProducts];
                break;
            case "internet-mobile":
                this.products = [...this.internetMobileProducts];
                break;
            case "internet-phone":
                this.products = [...this.internetPhoneProducts];
                break;
            case "internet":
                this.products = [...this.internetProducts];
                break;
            case "phone":
                this.products = [...this.phoneProducts];
                break;
        }
        this.initialProducts = [...this.products];
        this.products.forEach((item) => {
            if (item.isChecked) {
                item.isChecked = false;
            }
        });
        this.disableNext = true;
        this.cart = { ...this.originalCart };
    }

    get productsRadioOptions() {
        return this.products.map(function (obj) {
            let productLabel = BUNDLE_LABEL.replace("{0}", obj.Name)
                .replace("{1}", obj.Price)
                .replace("{2}", obj.PriceType);
            return {
                label: productLabel,
                value: obj.Id
            };
        });
    }

    get bundlesRadioOptions() {
        return this.bundles.map(function (obj) {
            let bundleLabel = BUNDLE_LABEL.replace("{0}", obj.Name)
                .replace("{1}", obj.Price)
                .replace("{2}", obj.PriceType);
            return {
                label: bundleLabel,
                value: obj.Id
            };
        });
    }

    handlePriceChange(event) {
        this.priceChangeBroadband(event.detail);
        let products = [...this.products];
        let checkedTypes = [];
        let cart = { ...this.originalCart };
        cart.monthlyCharges.internet = [];
        cart.monthlyCharges.phone = [];
        cart.monthlyCharges.mobile = [];
        cart.todayCharges = [];
        if (products.length > 0) {
            products.forEach((product) => {
                if (product.isChecked === true) {
                    if (product.productArray.length > 0) {
                        this.hasPhone = product.productArray.some((e) => e.lineOfBusiness.toLowerCase() === "phone");
                        this.hasMobile = product.productArray.some((e) => e.lineOfBusiness.toLowerCase() === "mobile");
                        product.productArray.forEach((item) => {
                            let mainCharge = {
                                name: item.description,
                                fee:
                                    item.pricing.netPrice !== undefined
                                        ? Number(item.pricing.netPrice).toFixed(2)
                                        : (0.0).toFixed(2),
                                type: item.pricing.type,
                                discount: false
                            };
                            if (mainCharge.type === "Per Month" || mainCharge.type === undefined) {
                                cart.hasMonthly = true;
                                if (item.lineOfBusiness.toLowerCase() === "internet") {
                                    cart.monthlyCharges.internet.push(mainCharge);
                                } else if (item.lineOfBusiness.toLowerCase() === "mobile") {
                                    cart.monthlyCharges.mobile.push(mainCharge);
                                } else {
                                    cart.monthlyCharges.phone.push(mainCharge);
                                }
                            } else {
                                cart.hasToday = true;
                                cart.todayCharges.push(mainCharge);
                            }
                        });
                    } else {
                        let mainCharge = {
                            name: product.Name,
                            fee:
                                product.PromoPrice !== undefined
                                    ? Number(product.PromoPrice).toFixed(2)
                                    : (0.0).toFixed(2),
                            type: product.PriceType,
                            discount: product.PromoPrice !== undefined ? Number(product.PromoPrice) <= 0 : true
                        };
                        if (mainCharge.type === "Per Month" || mainCharge.type === undefined) {
                            cart.hasMonthly = true;
                            cart.monthlyCharges.internet.push(mainCharge);
                        } else {
                            cart.hasToday = true;
                            cart.todayCharges.push(mainCharge);
                        }
                    }
                    checkedTypes = [...product.ServiceType];
                    if (product.hasAutoPayPromo) {
                        let autoPayDiscount = {
                            name: "Auto Pay Discount",
                            fee:
                                product.AutoPayDiscount !== undefined
                                    ? Number(product.AutoPayDiscount).toFixed(2)
                                    : (0.0).toFixed(2),
                            type: product.PriceType,
                            discount: true
                        };
                        cart.monthlyCharges.internet.push(autoPayDiscount);
                    }
                }
            });
        }
        let monthlyCharges = [
            ...cart.monthlyCharges.internet,
            ...cart.monthlyCharges.phone,
            ...cart.monthlyCharges.mobile
        ];
        monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        cart.todayCharges.forEach(
            (charge) => (cart.todayTotal = (Number(cart.todayTotal) + Number(charge.fee)).toFixed(2))
        );
        cart.firstBillTotal = cart.monthlyTotal;
        cart.hasFirstBill = true;
        this.cart = { ...cart };
        if (checkedTypes.length > 0) {
            this.disableNext = false;
        }
    }

    priceChangeBroadband(value) {
        let selected;
        let index = this.products.findIndex((product) => product.Id === value);
        if (index !== undefined && index !== -1) {
            selected = index;
        }
        if (
            this.productType === "internet-phone" ||
            this.productType === "internet-phone-mobile" ||
            this.productType === "internet-mobile"
        ) {
            this.products.forEach((product) => {
                if (product.Id === this.products[selected].Id) {
                    product.isChecked = true;
                } else {
                    product.isChecked = false;
                }
            });
        } else {
            let products = [...this.products];
            products.forEach((product) => {
                if (product.Id === products[selected].Id) {
                    product.isChecked = true;
                } else {
                    product.isChecked = false;
                }
            });
            this.products = [...products];
        }
        console.log("PRODUCTS", this.products);
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

    handleDescription(event) {
        if (!this.showProductDescription) {
            this.products.forEach((item) => {
                if (item.Id === event.detail) {
                    if (!this.disclaimerByOfferIdMap.has(item.Id)) {
                        this.getOfferDisclaimer(item.Id);
                    } else {
                        this.productDescription = this.disclaimerByOfferIdMap.get(item.Id);
                        this.showProductDescription = true;
                    }
                }
            });
        } else {
            this.showProductDescription = false;
        }
    }

    getOfferDisclaimer(offerId) {
        const path = "offerDisclaimer";
        this.loaderSpinner = true;
        let myData = {
            path,
            partnerName: "charter",
            offerId: offerId,
            sessionId: this.sessionId
        };
        console.log("Get Offer Disclaimer Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Get Offer Disclaimer Response", result);
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
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", apiResponse);
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    this.disclaimerByOfferIdMap.set(offerId, result.disclaimerText);
                    this.productDescription = result.disclaimerText;
                    this.showProductDescription = true;
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = DISCLAIMER_ERROR;
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

    handleClick() {
        this.loaderSpinner = true;
        this.productIds = [];
        let selectedProducts = [];
        let otherProducts = [];
        let product = {};
        let products = [...this.products];
        products.forEach((item) => {
            if (item.isChecked) {
                product = {
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
                this.productIds.push(item.ProductId);
            } else {
                let otherProduct = {
                    Description: item.Description,
                    Family: item.Family,
                    Name: item.Name.substring(0, 80),
                    UnitPrice: parseFloat(item.Price),
                    PriceType: item.PriceType,
                    ProductCode: item.ProductId,
                    servRef: item.ProductId,
                    vasProduct: false
                };
                otherProducts.push(otherProduct);
            }
        });
        let myData = {
            Program: SPECTRUM_API,
            ContextId: this.recordId,
            Product: product,
            Adders: selectedProducts,
            OtherProducts: otherProducts,
            iframe: false
        };

        saveProduct({ myData })
            .then((response) => {
                if (this.isGuestUser) {
                    const sendProductsEvent = new CustomEvent("productselection", {
                        detail: {
                            cart: this.cart,
                            productIds: this.productIds,
                            productName: this.productSelected
                        }
                    });
                    this.dispatchEvent(sendProductsEvent);
                    this.loaderSpinner = false;
                } else {
                    let trackerData = {
                        userId: this.userId,
                        operation: "setTrack",
                        isCount: true,
                        action: PRODUCT_SELECTION
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

                    const sendProductsEvent = new CustomEvent("productselection", {
                        detail: {
                            cart: this.cart,
                            productIds: this.productIds,
                            productName: this.productSelected
                        }
                    });
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
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: SERVER_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: GENERIC_PRODUCT_ERROR
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

    handleSaveModal(event) {
        this.showModal = false;
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

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: PRODUCTS_TAB,
            component: "poe_lwcBuyflowSpectrumProductsTab",
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
            tab: PRODUCTS_TAB
        };
        this.dispatchEvent(event);
    }

    handleShowBroadbandLabels() {
        if (!this.isGuestUser) return;

        this.template.querySelectorAll("c-poe_lwc-buyflow-spectrum-products-options").forEach((productOptionsEl) => {
            productOptionsEl.showBroadbandLabel();
        });

        setTimeout(() => {
            globalThis.scrollTo({ top: 0, left: 0 });
        }, 0);
    }
}