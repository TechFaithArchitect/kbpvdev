import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";
import chuzo_modalGeneric from "c/chuzo_modalGeneric";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import ENGA_OFFER_DETAIL_MODAL_BODY_1 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_1";
import ENGA_OFFER_DETAIL_MODAL_BODY_2 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_2";
import ENGA_OFFER_DETAIL_MODAL_BODY_3 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_3";
import ENGA_OFFER_DETAIL_MODAL_BODY_4 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_4";
import ENGA_OFFER_DETAIL_MODAL_BODY_5 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_5";
import ENGA_OFFER_DETAIL_MODAL_BODY_7 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_7";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveProduct from "@salesforce/apex/ProductTabController.saveProduct";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";

const ENTERTAINMENT_STREAM_ID = "OF_BASE-ENTERTAINMENT-201811_TAZCONTRACT_INTRO_2024";
const CHOICE_STREAM_ID = "OF_BASE-CHOICE-201811_TAZCONTRACT_INTRO_2024";
const CHOICE_BEAM_ID = "OF_BASE-CHOICE-ALL-INCLUDED_sales_satellite";
const ENTERTAINMENT_BEAM_ID = "OF_BASE-ENTERTAINMENT-ALL-INCLUDED_sales_satellite";
const PREFERRED_CHOICE_BEAM_ID = "OF_BASE-PREFERRED-CHOICE-ALL-INCLUDED_sales_satellite";

export default class Poe_lwcSelfServiceDirecTvCustomizationsThree extends NavigationMixin(LightningElement) {
    @api providerStyle;
    @api recordId;
    @api logo;
    @api origin;
    @api userId;
    @api orderInfo;
    @api returnUrl;
    @api isGuestUser;
    @api stream;
    @api products;
    @api filters;
    logId;
    disclosureAgreementLabel = "I have read the above disclosures to the customer, and the customer agreed";
    internationalAvailable;
    type;
    cartInfo = {
        orderNumber: "",
        todayCharges: [],
        hasToday: false,
        monthlyCharges: [],
        hasMonthly: false,
        monthlyTotal: (0.0).toFixed(2),
        todayTotal: (0.0).toFixed(2),
        firstBillTotal: (0.0).toFixed(2),
        hasFirstBill: false,
        firstBillCharges: [],
        hasSavings: false,
        savingsCharges: []
    };
    showModal = false;
    modalHeader;
    modalBody;
    showCollateral = false;
    showSBS = false;
    loaderSpinner;
    productType;
    spanish = false;
    included = true;
    allIncluded = "yes";
    packages = [];
    selectedItem;
    phonesalesOrigin = false;
    selectedTarget;
    newOrderInfo;
    chartCancel = false;
    emptyCart = {};
    partnerOrderNumber;
    cloudDVR = {};
    addCartData = {};
    orderData;
    verbiages = {};
    selectedProductId;
    closingOffers = [];
    title;
    offers;
    hardwareOptionsResponse;
    protections;
    baseOffers;
    disableNext = true;
    showMore = false;

    get iconCheckBlue() {
        return chuzoSiteResources + "/images/icon-check-blue.svg";
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get isNotPhonesalesOrigin() {
        return !this.phonesalesOrigin;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get nextBtnDesktopClass() {
        return `btn-rounded btn-center hide-mobile ${this.disableNext && "btn-disabled"}`;
    }

    get nextBtnMobileClass() {
        return `btn-rounded btn-center ${this.disableNext && "btn-disabled"}`;
    }

    changeViewToServiceDirecTVPlanTwo() {
        const goBackEvent = new CustomEvent("back", {});
        this.dispatchEvent(goBackEvent);
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        this.title = this.isGuestUser ? "Select your service package" : "Select the service package";
        this.orderData = { ...this.orderInfo };
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.phonesalesOrigin = this.origin === "phonesales";
        if (this.stream) {
            this.handleStreamResponse();
        } else {
            this.handleBeamResponse();
        }
    }

    handleShowMore(event) {
        let packages = [];
        if (event.target.checked) {
            packages = [
                ...this.packages.map((item) => {
                    if (!item.show) {
                        item.show = true;
                    }
                    return item;
                })
            ];
        } else {
            packages = [
                ...this.packages.map((item) => {
                    if (
                        (this.stream && item.Id === ENTERTAINMENT_STREAM_ID) ||
                        (!this.stream && (item.Id === PREFERRED_CHOICE_BEAM_ID || item.Id === ENTERTAINMENT_BEAM_ID))
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
        }
        this.packages = [...packages];
    }

    handleStreamResponse() {
        let products = [];
        let englishPackages = this.products.hasOwnProperty("english") ? this.products.english : [];
        let latinoPackages = this.products.hasOwnProperty("latino") ? this.products.latino : [];
        products = [...this.handleProductsBundle(englishPackages), ...this.handleProductsBundle(latinoPackages)];
        this.packages = [...products];
        this.packages.forEach((item) => {
            if (item.isChecked) {
                this.selectedTarget = item.Id;
            }
        });
        if (Object.keys(this.verbiages).length == 0) {
            this.handleCallCms();
        } else {
            chuzo_modalGeneric.open({
                content: {
                    title: "DIRECTV Via Internet Information",
                    provider: "directv",
                    body: `<span style='font-size: 14px;'><strong>DIRECTV Information</strong></span><span style='font-size: 12px;'><p><strong>Internet Speeds:</strong></p><ul><li>${this.verbiages.minimumSpeed}</li></ul><p><strong>Billing: </strong></p><ul><li>${this.verbiages.packageMonthlyCharge}</li></ul></span>`,
                    agreeLabel: this.isGuestUser ? "Agree disclosure" : "Customer agrees",
                    canClose: false
                }
            });
        }
    }

    handleBeamResponse() {
        let products = [];
        let packages =
            this.filters.language === "english"
                ? this.products.hasOwnProperty("english")
                    ? this.products.english
                    : []
                : this.products.hasOwnProperty("latino")
                ? this.products.latino
                : [];
        products = [...this.handleProductsBundle(packages)];
        if (this.filters.locals === "locals") {
            products = [...products.filter((e) => e.local && e.included)];
        } else {
            products = [...products.filter((e) => !e.local && e.included)];
        }
        this.packages = [...products];
    }

    handleProductsBundle(packages) {
        let products = [];
        if (packages.length > 0) {
            packages.forEach((item) => {
                let product = {
                    Id: item.offerCode,
                    containerId: item.offerCode + "-container",
                    local: this.stream ? false : item.product.locals,
                    Name: item.fullDisplayName,
                    Description:
                        this.stream && item.hasOwnProperty("descriptionsByKey") && item.descriptionsByKey.length > 0
                            ? item.descriptionsByKey[0]["long-partner"]
                            : item.fullDescription,
                    pricingRequirement: item.product.termsAndConditions,
                    disclosure: this.stream
                        ? item.hasOwnProperty("descriptionsByKey") && item.descriptionsByKey.length > 0
                            ? item.descriptionsByKey[0]["long-myatt"]
                            : item.product.termsAndConditions
                        : item.offerDetails,
                    internationalRequired: item.product.isInternationalAddonRequired,
                    fee: Number(item.childSkus[0].price.basePrice).toFixed(2).toString(),
                    discountedFee: Number(item.childSkus[0].price.bestPrice).toFixed(2).toString(),
                    isChecked: false,
                    language: item.product.language.toLowerCase(),
                    included: item.product.allIncluded,
                    type: item.offerType,
                    benefits: [...item.childSkus[0].price.productBenefitsInfo.benefits],
                    includedProducts:
                        item.includedProducts[0].products !== null ? [...item.includedProducts[0].products] : [],
                    isChoice: item.offerCode.toLowerCase().includes("choice"),
                    isUltimate: item.offerCode.toLowerCase().includes("ultimate"),
                    isPremier: item.offerCode.toLowerCase().includes("premier"),
                    isEntertainment: item.offerCode.toLowerCase().includes("entertainment"),
                    show: this.stream
                        ? item.offerCode !== ENTERTAINMENT_STREAM_ID
                        : item.offerCode !== ENTERTAINMENT_BEAM_ID && item.offerCode !== PREFERRED_CHOICE_BEAM_ID,
                    popular: this.stream ? item.offerCode === CHOICE_STREAM_ID : item.offerCode === CHOICE_BEAM_ID
                };
                product.contentClass = `${product.popular ? "popular-product" : ""} price-content`;
                products.push(product);
            });
        }
        products.sort((a, b) => (Number(a.fee) > Number(b.fee) ? -1 : Number(a.fee) < Number(b.fee) ? 1 : 0));
        return products;
    }

    handleCallCms() {
        this.loaderSpinner = true;
        const path = "cmsUrl";
        let contentDetails = [];
        let content = [
            "minimumSpeed",
            "packageMonthlyCharge",
            "streamEquipmentTerms",
            "streamSpecialOffers",
            "streamPreAuthorization",
            "streamEmailValidation",
            "streamCreateAccount",
            "streamPaymentInfo",
            "streamOrderConfirmation"
        ];
        content.forEach((item) => {
            let detail = {
                content: item,
                subChannel: this.orderData.subChannel,
                stateId: "ALL",
                systemId: "",
                channel: this.orderData.channel
            };
            contentDetails.push(detail);
        });
        let myData = {
            path,
            systemCode: "ENGA-CHUZO",
            partnerName: "enga-stream",
            correlationId: this.orderData.correlationId,
            contentDetails
        };
        console.log("CMSurl Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("CMSurl Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.verbiages = {
                        minimumSpeed: result[0].cmsContent,
                        packageMonthlyCharge: result[1].cmsContent,
                        streamEquipmentTerms: result[2].cmsContent,
                        streamSpecialOffers: result[3].cmsContent,
                        streamPreAuthorization: result[4].cmsContent,
                        streamEmailValidation: result[5].cmsContent,
                        streamCreateAccount: result[6].cmsContent,
                        streamPaymentInfo: result[7].cmsContent,
                        streamOrderConfirmation: result[8].cmsContent
                    };
                    this.loaderSpinner = false;
                    chuzo_modalGeneric.open({
                        content: {
                            title: "DIRECTV Via Internet Information",
                            provider: "directv",
                            body: `<span style='font-size: 14px;'><strong>DIRECTV Information</strong></span><span style='font-size: 12px;'><p><strong>Internet Speeds:</strong></p><ul><li>${this.verbiages.minimumSpeed}</li></ul><p><strong>Billing: </strong></p><ul><li>${this.verbiages.packageMonthlyCharge}</li></ul></span>`,
                            agreeLabel: this.isGuestUser ? "Agree disclosure" : "Customer agrees",
                            canClose: false
                        }
                    });
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The CMSurl request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    handlePriceChange(event) {
        let selectedId = event.target.dataset.id.replace("-container", "");
        this.selectedProductId = selectedId;
        let ids = [
            ...this.packages.map((e) => {
                if (e.show) {
                    return e.Id;
                } else {
                    return "";
                }
            })
        ];
        ids.forEach((id) => {
            if (id !== "") {
                if (id === selectedId) {
                    let selectedCard = this.template.querySelector(`[data-id="${id}-container"]`);
                    selectedCard.classList.add("selected");
                } else {
                    let notSelectedCard = this.template.querySelector(`[data-id="${id}-container"]`);
                    if (notSelectedCard.classList.contains("selected")) {
                        notSelectedCard.classList.remove("selected");
                    }
                }
            }
        });

        let closingOffers = [];
        this.selectedItem = this.packages.findIndex((product) => product.Id === this.selectedProductId);
        if (this.selectedItem !== undefined) {
            let sel = [];
            this.packages.forEach((product) => {
                if (product.Id === this.selectedProductId) {
                    product.isChecked = true;
                } else {
                    product.isChecked = false;
                }
                sel.push(product);
            });
            this.packages = [];
            this.packages = [...sel];
        }
        if (
            this.packages[this.selectedItem] !== undefined &&
            this.packages[this.selectedItem].discountedFee !== undefined
        ) {
            this.selectedTarget = this.packages[this.selectedItem].Id;
            chuzo_modalGeneric.open({
                content: {
                    title: "Offer Detail",
                    provider: "directv",
                    body: this.stream
                        ? ENGA_OFFER_DETAIL_MODAL_BODY_4 +
                          " " +
                          ENGA_OFFER_DETAIL_MODAL_BODY_5 +
                          ENGA_OFFER_DETAIL_MODAL_BODY_3
                        : ENGA_OFFER_DETAIL_MODAL_BODY_1 +
                          ENGA_OFFER_DETAIL_MODAL_BODY_2 +
                          ENGA_OFFER_DETAIL_MODAL_BODY_7,
                    agreeLabel: this.isGuestUser ? "Agree disclosure" : "Customer agrees",
                    canClose: false
                }
            });
            this.cartInfo.hasMonthly = true;
            let charges = [];
            let newCharge = {
                name: this.packages[this.selectedItem].Name,
                fee: Number(this.packages[this.selectedItem].fee).toFixed(2),
                discount: false,
                hasDescription: false,
                description: "",
                type: "product"
            };
            charges.push(newCharge);
            if (this.packages[this.selectedItem].benefits.length > 0) {
                this.packages[this.selectedItem].benefits.forEach((benefit) => {
                    if (benefit.benefitCode === "SAVENOW10OFF24M") {
                        closingOffers.push(benefit);
                    } else {
                        let newDiscount = {
                            name: benefit.benefitDisplayName,
                            fee: Number(
                                benefit.benefitFlattOffPrice !== 0
                                    ? benefit.benefitFlattOffPrice * -1
                                    : benefit.benefitFlattOffPrice
                            ).toFixed(2),
                            discount: true,
                            hasDescription: false,
                            description: "",
                            type: "discount"
                        };
                        charges.push(newDiscount);
                    }
                });
            }
            let monthlyTotal = 0;
            charges.forEach((charge) => {
                monthlyTotal = Number(monthlyTotal) + Number(charge.fee);
            });
            monthlyTotal = monthlyTotal.toFixed(2);
            this.cartInfo = { ...this.cartInfo, monthlyCharges: charges, monthlyTotal };
            this.disableNext = false;
        } else {
            this.cartInfo.hasMonthly = false;
        }
        this.closingOffers = [...closingOffers];
    }

    handleNext() {
        this.handleGetIncludedAddOns();
    }

    handleGetIncludedAddOns() {
        this.loaderSpinner = true;
        const path = "getAddonEquipmentProtectionplanDetails";
        let myData = {
            ...this.orderData,
            path,
            partnerName: this.stream ? "enga-stream" : "ENGA",
            systemCode: this.stream ? "ENGA-CHUZO" : this.orderData.NFFL ? "ENGA-CHUZO-NFF" : "ENGA-CHUZO",
            selectedBaseOfferCode: this.selectedTarget,
            addOn: {},
            equipment: {},
            protectionPlan: {},
            channelEligibility: {}
        };
        if (this.stream) {
            myData.addOn = {
                offerProductFamily: ["OTT"],
                offerActionType: ["Acquisition"],
                contractIndicator: ["TAZCONTRACT"],
                offerProductTypes: ["video-addon"],
                addOnType: ["Programming-Bolt-on", "Bolt-on", "Standalone", "Subscription"]
            };
            myData.equipment = {
                offerProductFamily: ["OTT"],
                offerActionType: ["Acquisition"],
                offerProductTypes: ["video-device", "fee"],
                contractIndicator: ["TAZCONTRACT"]
            };
            myData.protectionPlan = {
                salesChannel: [this.orderData.channel],
                offerProductTypes: ["protection-plan"],
                offerActionType: ["Acquisition"],
                contractIndicator: ["TAZCONTRACT"],
                offerProductFamily: ["OTT"],
                cartContext: {
                    epochOfferCodes: [this.selectedItem]
                },
                migrationIndicator: false,
                creditRisk: ""
            };
            myData.channelEligibility = {
                salesChannel: this.orderData.channel,
                salesSubChannel: this.orderData.subChannel,
                locationID: this.orderData.locationId,
                locationTypeID: this.orderData.locationTypeId,
                dealerCode: this.orderData.dealerAgentId,
                directIntegrationPartnerName: "ENGA-CHUZO"
            };
        } else {
            myData.addOn = {
                offerProductFamily: ["satellite"],
                offerActionType: ["Acquisition"],
                contractIndicator: ["EDSP"],
                offerProductTypes: ["video-addon"]
            };
            myData.protectionPlan = {
                offerProductFamily: ["satellite"],
                offerActionType: ["Acquisition"],
                offerProductTypes: ["insurance"],
                contractIndicator: ["EDSP"]
            };
            myData.equipment = {
                offerProductFamily: ["satellite"],
                offerActionType: ["Acquisition"],
                offerProductTypes: ["video-device", "fee"],
                contractIndicator: ["EDSP"]
            };
        }
        console.log("Product Detail Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let responseParsed = JSON.parse(response);
                console.log("Product Detail Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = `${responseParsed.message !== undefined ? responseParsed.message + "." : ""} ${
                        responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.offers = responseParsed.addOns;
                    this.hardwareOptionsResponse = responseParsed.equipment.equipment;
                    this.protections = responseParsed.protectionPlan;
                    if (this.stream) {
                        responseParsed.addOns.addonOffers.forEach((item) => {
                            if (item.offerCode === "OF_UNLTDCDVR2021_TAZCONTRACT") {
                                this.cloudDVR = {
                                    action: "ADD",
                                    itemType: "ADDON",
                                    offerId: item.offerCode,
                                    productGroup: "DTVNOW",
                                    quantity: 1
                                };
                            }
                        });
                        this.handleAddCart();
                    } else {
                        this.handleBillingDetailsCallout();
                    }
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
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    handleAddCart() {
        this.loaderSpinner = true;
        const path = "addCart";
        let myData = {
            path,
            ...this.orderData,
            partnerName: "enga-stream",
            systemCode: "ENGA-CHUZO",
            selectedBaseOfferCode: this.selectedTarget,
            itemsList: [
                {
                    action: "ADD",
                    itemType: "BASE",
                    offerId: this.selectedTarget,
                    productGroup: "DTVNOW",
                    quantity: 1
                }
            ],
            serviceContext: {
                srcSystem: "myAttSales"
            },
            salesChannel: "directIntegrationPartner",
            uiProps: "stream",
            shoppingContext: {
                hboMaxIncluded: false,
                contractOffer: true,
                contractType: "TAZCONTRACT",
                treatmentCode: "dummy_4321"
            },
            GeoInfo: {
                zipCode: this.orderData.address.zipCode,
                zipCounty: this.orderData.address.county
            },
            channelEligibility: {
                salesChannel: this.orderData.channel,
                salesSubChannel: this.orderData.subChannel,
                locationID: this.orderData.locationId,
                locationTypeID: this.orderData.locationTypeId,
                dealerCode: this.orderData.dealerAgentId,
                directIntegrationPartnerName: "ENGA-CHUZO",
                isFulfillmentDealer: !this.orderData.NFFL,
                masterDealerId: this.orderData.masterDealerId,
                dealerId: this.orderData.dealerId
            },
            marketingSourceCode: [this.orderData.marketingSourceCode]
        };
        if (Object.keys(this.cloudDVR).length > 0) {
            myData.itemsList.push(this.cloudDVR);
        }
        this.addCartData = { ...myData };
        console.log("Add Cart Stream Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Add Cart Stream Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    if (result.content.payload.cartStatus.cartState.toLowerCase() === "complete") {
                        this.handleCartSummary();
                    } else {
                        const genericErrorMessage = "Cart couldn't be validated";
                        const event = new ShowToastEvent({
                            title: "Invalid Cart",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                        this.loaderSpinner = false;
                        this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    handleBillingDetailsCallout() {
        const path = "addBillingAccount";
        this.loaderSpinner = true;
        let myData = {
            path,
            ...this.orderData,
            partnerName: "enga",
            customerEligibility: {
                zipCode: [this.orderData.address.zipCode],
                county: [this.orderData.address.county]
            },
            migrationIndicator: false,
            validateCart: true,
            reconnectCustomer: false,
            serviceEndDate: "",
            cartContext: {
                cartOffers: [{ offerCode: this.selectedTarget, quantity: 1 }]
            },
            customerContext: {
                satellite: {
                    acceptPaperlessBillEnrollment: true,
                    acceptAutoBillPayEnrollment: true,
                    isActive: false,
                    serviceAddress: {
                        streetAddress: this.orderData.address.addressLine1,
                        city: this.orderData.address.city,
                        state: this.orderData.address.state,
                        zipCode: this.orderData.address.zipCode
                    },
                    businessSegment: "REG",
                    accountStatus: "PEND"
                }
            },
            channelEligibility: {
                isFulfillmentDealer: !this.orderData.NFFL
            },
            marketingSourceCode: [this.orderData.marketingSourceCode],
            offerActionType: ["Acquisition"]
        };
        console.log("Billing Details Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Billing Details Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.saveProductHandler(result);
                }
            })
            .catch((error) => {
                this.serviceabilityCallout = {};
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    handleCartSummary() {
        const path = "cartSummary";
        this.loaderSpinner = true;
        let myData = {
            path,
            partnerName: "enga-stream",
            systemCode: "ENGA-CHUZO",
            ...this.orderData
        };
        console.log("Cart Summary Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Cart Summary Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.loaderSpinner = false;
                } else {
                    this.saveProductHandler(result);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    saveProductHandler(result) {
        this.loaderSpinner = true;
        let product = this.packages[this.selectedItem];
        let selectedProduct = {
            Description: product.Description,
            Family: "DIRECTV",
            Name: product.Name.substring(0, 80),
            UnitPrice: parseFloat(product.fee),
            PriceType: "Monthly",
            ProductCode: product.Id,
            servRef: product.Id.substring(0, 25),
            vasProduct: false,
            callLogId: undefined
        };
        if (!this.cartInfo.orderNumber) {
            this.cartInfo.orderNumber = this.orderData.orderNumber;
        }

        let info = {
            orderInfo: {
                ...this.orderData,
                orderNumber: this.cartInfo.orderNumber,
                productType: this.productType,
                componentCode: this.selectedTarget,
                product: product
            },
            selectedProduct: selectedProduct.Name,
            closingOffers: this.closingOffers,
            offers: this.offers,
            protections: this.protections,
            hardware: this.hardwareOptionsResponse
        };
        if (this.stream) {
            info = {
                ...info,
                cartInfo: this.cartInfo,
                result,
                addCartData: this.addCartData,
                verbiages: this.verbiages
            };
        } else {
            info = {
                ...info,
                internationalRequired: product.internationalRequired,
                result,
                included: this.included
            };
        }
        let availableProducts = [];
        this.packages.forEach((p) => {
            let otherProduct = {
                Description: p.Description,
                Family: "DIRECTV",
                Name: p.Name.substring(0, 80),
                UnitPrice: parseFloat(p.fee),
                PriceType: "Monthly",
                ProductCode: p.Id,
                servRef: p.Id.substring(0, 25),
                vasProduct: false,
                callLogId: undefined
            };
            availableProducts.push(otherProduct);
        });
        let myData = {
            Program: "DirecTV",
            ContextId: this.recordId,
            Product: selectedProduct,
            OtherProducts: availableProducts,
            iframe: false
        };
        console.log("Buyflow_SaveProduct Payload:", myData);
        saveProduct({ myData: myData })
            .then((response) => {
                console.log("Save Product Response", response);
                this.setTrack(info);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The Product Selection could not be saved. Please, try again."
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    setTrack(info) {
        let trackerData = {
            userId: this.userId,
            operation: "setTrack",
            isCount: true,
            action: "Product Selection"
        };
        if (this.origin === "retail") {
            setClickerRetailTrack({ myData: trackerData })
                .then((response) => {
                    console.log("Set Track Response", response);
                    this.loaderSpinner = false;
                    const sendProductSelectionEvent = new CustomEvent("next", {
                        detail: { ...info }
                    });
                    this.dispatchEvent(sendProductSelectionEvent);
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.logError(error.body?.message || error.message);
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "event") {
            setClickerEventTrack({ myData: trackerData })
                .then((response) => {
                    console.log("Set Track Response", response);
                    this.loaderSpinner = false;
                    const sendProductSelectionEvent = new CustomEvent("next", {
                        detail: { ...info }
                    });
                    this.dispatchEvent(sendProductSelectionEvent);
                })
                .catch((error) => {
                    console.log(error);
                    console.error(error, "ERROR");
                    this.logError(error.body?.message || error.message);
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "phonesales") {
            setClickerCallCenterTrack({ myData: trackerData })
                .then((response) => {
                    console.log("Set Track Response", response);
                    this.loaderSpinner = false;
                    const sendProductSelectionEvent = new CustomEvent("next", {
                        detail: { ...info }
                    });
                    this.dispatchEvent(sendProductSelectionEvent);
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.logError(error.body?.message || error.message);
                    this.loaderSpinner = false;
                });
        } else {
            this.loaderSpinner = false;
            const sendProductSelectionEvent = new CustomEvent("next", {
                detail: { ...info }
            });
            this.dispatchEvent(sendProductSelectionEvent);
        }
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Products",
            component: "poe_lwcSelfServiceDirecTvCustomizationsThree",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }
}