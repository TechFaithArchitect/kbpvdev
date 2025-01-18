import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import ENGA_OFFER_DETAIL_MODAL_BODY_1 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_1";
import ENGA_OFFER_DETAIL_MODAL_BODY_2 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_2";
import ENGA_OFFER_DETAIL_MODAL_BODY_3 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_3";
import ENGA_OFFER_DETAIL_MODAL_BODY_4 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_4";
import ENGA_OFFER_DETAIL_MODAL_BODY_5 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_5";
import ENGA_OFFER_DETAIL_MODAL_BODY_6 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_6";
import ENGA_OFFER_DETAIL_MODAL_BODY_7 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_7";
import ENGA_LOCALS_ANTENNA_DISCLAIMER_1_A from "@salesforce/label/c.Enga_Offer_Detail_Locals_Antenna_Disclaimer_1_A";
import ENGA_LOCALS_ANTENNA_DISCLAIMER_1_B from "@salesforce/label/c.Enga_Offer_Detail_Locals_Antenna_Disclaimer_1_B";
import ENGA_LOCALS_ANTENNA_DISCLAIMER_1_C from "@salesforce/label/c.Enga_Offer_Detail_Locals_Antenna_Disclaimer_1_C";
import ENGA_LOCALS_ANTENNA_DISCLAIMER_2 from "@salesforce/label/c.Enga_Offer_Detail_Locals_Antenna_Disclaimer_2";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveProduct from "@salesforce/apex/ProductTabController.saveProduct";
import GetInternationalPackage from "@salesforce/apex/ProductTabController.GetInternationalPackage";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";

export default class Poe_lwcBuyflowDirecTvEngaProductsTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api origin;
    @api userId;
    @api orderInfo;
    @api returnUrl;
    @api nonFulfillment;
    @api isGuestUser;
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
    language = "";
    typeOption = "";
    allIncluded = "yes";
    isDTV;
    products = [];
    originalDTVProducts = [];
    selectedItem;
    phonesalesOrigin = false;
    selectedTarget;
    newOrderInfo;
    disableNext = true;
    chartCancel = false;
    emptyCart = {};
    partnerOrderNumber;
    cloudDVR = {};
    addCartData = {};
    orderData;
    streamData;
    beamData;
    verbiages = {};
    showOffersSelection = false;
    noLocalsAvailable = false;
    antennaOffersAvailable = false;
    localProducts = [];
    noLocalProducts = [];
    antennaProducts = [];
    selectedProductId;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage
    };
    showSelfServiceCancelModal = false;
    closingOffers = [];
    typeOptions = [{ label: "Locals", value: "locals" }];
    addressString = "";

    get isNotPhonesalesOrigin() {
        return !this.phonesalesOrigin;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.addressString = `${this.orderInfo.address.addressLine1}${
            this.orderInfo.address.hasOwnProperty("addressLine2") &&
            this.orderInfo.address.addressLine2 !== undefined &&
            this.orderInfo.address.addressLine2 !== ""
                ? ` ${this.orderInfo.address.addressLine2}`
                : ""
        }, ${this.orderInfo.address.city}, ${this.orderInfo.address.state}, ${this.orderInfo.address.zipCode}`;
        this.orderData = { ...this.orderInfo.orderInfo };
        this.streamData = { ...this.orderInfo.stream };
        this.beamData = { ...this.orderInfo.beam };
        this.emptyCart = { ...this.cartInfo };
        this.language = "english";
        this.allIncluded = "yes";
        this.phonesalesOrigin = this.origin === "phonesales";
    }

    providerCallout(event) {
        if (!this.chartCancel) {
            this.loaderSpinner = true;
            this.cartInfo = { ...this.emptyCart };
            this.selectedItem = null;
            this.disableNext = true;
            this.productType = event.target.value;
            this.isDTV = this.productType === "dtv" ? true : false;
            if (this.isDTV) {
                this.cartInfo.orderNumber = this.beamData?.orderNumber;
                this.handleENGAProductCallout();
            } else {
                this.cartInfo.orderNumber = this.streamData?.orderNumber;
                this.handleENGAStreamProductCallout();
            }
        } else {
            this.chartCancel = false;
        }
    }

    handleENGAStreamProductCallout() {
        const path = "products/enga-stream";
        let myData = {
            ...this.streamData,
            systemCode: "ENGA-CHUZO",
            partnerName: "enga-stream",
            orderMod: false,
            billingSystem: "EVERGENT",
            treatmentCode: "A001",
            customerEligibility: {
                zipCode: this.orderInfo.address.zipCode,
                county: this.orderInfo.address.county
            },
            offerProductFamily: ["OTT"],
            offerActionType: ["Acquisition"],
            contractIndicator: ["TAZCONTRACT"],
            offerProductTypes: ["video-plan"],
            channelEligibility: {
                salesChannel: this.streamData.channel,
                salesSubChannel: this.streamData.subChannel,
                locationID: this.streamData.locationId,
                locationTypeID: this.streamData.locationTypeId,
                dealerCode: this.orderInfo.dealerCode,
                directIntegrationPartnerName: "ENGA-CHUZO"
            }
        };
        this.newOrderInfo = {
            ...myData,
            address: {
                addressLine1: this.orderData.address.addressLine1,
                addressLine2: this.orderData.address.addressLine2,
                city: this.orderData.address.city,
                state: this.orderData.address.state,
                zipCode: this.orderData.address.zipCode
            }
        };
        myData.path = path;
        console.log("Products Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Products Response", result);
                this.serviceabilityCallout = {};
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
                    let products = [];
                    let englishPackages = result.hasOwnProperty("english") ? result.english : [];
                    let latinoPackages = result.hasOwnProperty("latino") ? result.latino : [];
                    products = [
                        ...this.handleProductsBundle(englishPackages),
                        ...this.handleProductsBundle(latinoPackages)
                    ];
                    this.products = [...products];
                    this.products.forEach((item) => {
                        if (item.isChecked) {
                            this.selectedTarget = item.Id;
                        }
                    });
                    if (Object.keys(this.verbiages).length == 0) {
                        this.handleCallCms();
                    } else {
                        this.modalHeader = "DIRECTV Via Internet Information";
                        this.modalBody = `<span style='font-size: 14px;'><strong>DIRECTV Information</strong></span><span style='font-size: 12px;'><p><strong>Internet Speeds:</strong></p><ul><li>${this.verbiages.minimumSpeed}</li></ul><p><strong>Billing: </strong></p><ul><li>${this.verbiages.packageMonthlyCharge}</li></ul></span>`;
                        this.showModal = true;
                        this.loaderSpinner = false;
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

    handleENGAProductCallout() {
        const path = "products/enga";
        let myData = {
            partnerName: "enga",
            NFFL: this.orderInfo.NFFL,
            ...this.orderData,
            ...this.beamData,
            orderMod: false,
            billingSystem: "STMS",
            treatmentCode: "A001",
            customerContext: {
                serviceAddress: {
                    addressLine1: this.orderData.address.addressLine1,
                    addressLine2: this.orderData.address.addressLine2,
                    city: this.orderData.address.city,
                    state: this.orderData.address.state,
                    zipCode: this.orderData.address.zipCode
                },
                businessSegment: "REG",
                accountStatus: "PEND"
            },
            channelEligibility: {
                opusChannel: this.beamData.channel.toLowerCase(),
                opusStoreId: this.beamData.opusStoreId,
                salesChannel: this.beamData.channel,
                salesSubChannel: this.beamData.subChannel,
                locationId: this.beamData.locationId,
                locationTypeId: this.beamData.locationTypeId,
                dealerCode: this.orderInfo.dealerCode,
                directIntegrationPartnerName: ""
            },
            customerEligibility: {
                zipCode: this.orderInfo.address.zipCode,
                county: this.orderInfo.address.county
            },
            offerProductFamily: ["satellite"],
            offerActionType: ["Acquisition"],
            contractIndicator: ["non-contract"],
            offerProductTypes: ["video-plan"]
        };
        this.newOrderInfo = { ...myData };
        myData.path = path;
        console.log("Products Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                let result = JSON.parse(res);
                let isLocalViaAntennaAvailable = false;
                console.log("Products Response", result);
                this.serviceabilityCallout = {};
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
                    let products = [];
                    let englishPackages = result.hasOwnProperty("english") ? result.english : [];
                    let latinoPackages = result.hasOwnProperty("latino") ? result.latino : [];
                    products = [
                        ...this.handleProductsBundle(englishPackages),
                        ...this.handleProductsBundle(latinoPackages)
                    ];
                    this.noLocalsAvailable = products.some((e) => !e.local && !e.antenna);
                    this.antennaOffersAvailable = products.some((e) => e.antenna);
                    if (this.noLocalsAvailable || this.antennaOffersAvailable) {
                        this.showOffersSelection = true;
                        let radioOptions = [];
                        radioOptions.push(this.typeOptions[0]);
                        if (this.noLocalsAvailable) {
                            let noLocalsOption = { label: "No Locals", value: "noLocals" };
                            radioOptions.push(noLocalsOption);
                            this.noLocalProducts = [...products.filter((e) => !e.local)];
                        }
                        let viaLocalAntennaOption = null;
                        if (this.antennaOffersAvailable) {
                            viaLocalAntennaOption = { label: "Locals via Antenna", value: "viaAntenna" };
                            radioOptions.push(viaLocalAntennaOption);
                            this.antennaProducts = [...products.filter((e) => e.antenna)];
                            isLocalViaAntennaAvailable = true;
                        }
                        this.typeOptions = [...radioOptions];
                        this.typeOption = viaLocalAntennaOption ? viaLocalAntennaOption.value : "locals";
                        this.localProducts = [...products.filter((e) => e.local && !e.antenna)];
                        products = [...this.localProducts];
                    }
                    this.originalDTVProducts = [];
                    this.originalDTVProducts = [...products];
                    let newProducts = [];
                    this.originalDTVProducts.forEach((item) => {
                        if (this.included && item.included && this.spanish && item.language === "spanish") {
                            newProducts.push(item);
                        } else if (!this.included && !item.included && this.spanish && item.language === "spanish") {
                            newProducts.push(item);
                        } else if (this.included && item.included && !this.spanish && item.language === "english") {
                            newProducts.push(item);
                        } else if (!this.included && !item.included && !this.spanish && item.language === "english") {
                            newProducts.push(item);
                        }
                    });
                    this.products = [...newProducts];
                    if (this.internationalAvailable === undefined) {
                        this.handleLatinoPackageAvailability();
                    } else {
                        this.loaderSpinner = false;
                    }
                    if (isLocalViaAntennaAvailable) {
                        this.handleFilter({ target: { value: this.typeOption, name: "noLocals" } });
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

    displayNoLocalsPopUp() {
        this.modalHeader = "DIRECTV Via Satellite Information";
        this.modalBody = ENGA_OFFER_DETAIL_MODAL_BODY_6;
        this.showModal = true;
    }

    displayAntennaPopUp() {
        this.modalHeader = "DIRECTV Via Satellite Information";
        this.modalBody = `${ENGA_LOCALS_ANTENNA_DISCLAIMER_1_A}<br/><br/>${ENGA_LOCALS_ANTENNA_DISCLAIMER_1_B.replace(
            "[CUSTOMER-ADDRESS]",
            this.addressString
        )}<br/>${ENGA_LOCALS_ANTENNA_DISCLAIMER_1_C}`;
        this.showModal = true;
    }

    handleProductsBundle(packages) {
        let products = [];
        if (packages.length > 0) {
            packages.forEach((item) => {
                let product = {
                    Id: item.offerCode,
                    local: this.isDTV ? item.product.locals : false,
                    antenna: this.isDTV ? item.isLCCBasePackage : false,
                    Name: item.fullDisplayName,
                    Description:
                        !this.isDTV && item.hasOwnProperty("descriptionsByKey") && item.descriptionsByKey.length > 0
                            ? item.descriptionsByKey[0]["long-partner"]
                            : item.fullDescription,
                    pricingRequirement: item.product.termsAndConditions,
                    disclosure: !this.isDTV
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
                        item.includedProducts[0].products !== null ? [...item.includedProducts[0].products] : []
                };
                products.push(product);
            });
        }
        return products;
    }

    handleLatinoPackageAvailability() {
        GetInternationalPackage()
            .then((response) => {
                console.log("Get international package response", response);
                this.internationalAvailable = response.result.Account.POE_Espanol_Package__c;
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.log(error);
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handlePriceChange(event) {
        this.selectedProductId = event.detail.value;
        let closingOffers = [];
        this.selectedItem = this.products.findIndex((product) => product.Id === this.selectedProductId);
        if (this.selectedItem !== undefined) {
            let sel = [];
            this.products.forEach((product) => {
                if (product.Id === this.selectedProductId) {
                    product.isChecked = true;
                } else {
                    product.isChecked = false;
                }
                sel.push(product);
            });
            this.products = [];
            this.products = [...sel];
        }
        if (
            this.products[this.selectedItem] !== undefined &&
            this.products[this.selectedItem].discountedFee !== undefined
        ) {
            this.selectedTarget = this.products[this.selectedItem].Id;
            this.modalHeader = "Offer Detail";
            if (this.productType === "dtv") {
                if (this.typeOption === "viaAntenna") {
                    this.modalBody =
                        ENGA_LOCALS_ANTENNA_DISCLAIMER_2 +
                        "<br/><br/>" +
                        ENGA_OFFER_DETAIL_MODAL_BODY_1 +
                        ENGA_OFFER_DETAIL_MODAL_BODY_2 +
                        ENGA_OFFER_DETAIL_MODAL_BODY_7;
                } else {
                    // The text coming from the API was replaced by this text as per Henry Drakeford on 10/31/2023.
                    this.modalBody =
                        ENGA_OFFER_DETAIL_MODAL_BODY_1 +
                        ENGA_OFFER_DETAIL_MODAL_BODY_2 +
                        ENGA_OFFER_DETAIL_MODAL_BODY_7;
                }
            } else {
                this.modalBody =
                    ENGA_OFFER_DETAIL_MODAL_BODY_4 +
                    " " +
                    ENGA_OFFER_DETAIL_MODAL_BODY_5 +
                    ENGA_OFFER_DETAIL_MODAL_BODY_3;
            }
            this.showModal = true;
            this.cartInfo.hasMonthly = true;
            let charges = [];
            let newCharge = {
                name: this.products[this.selectedItem].Name,
                fee: Number(this.products[this.selectedItem].fee).toFixed(2),
                discount: false,
                hasDescription: false,
                description: "",
                type: "product"
            };
            charges.push(newCharge);
            if (this.products[this.selectedItem].benefits.length > 0) {
                this.products[this.selectedItem].benefits.forEach((benefit) => {
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

    handleCallCms() {
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
                subChannel: this.streamData.subChannel,
                stateId: "ALL",
                systemId: "",
                channel: this.streamData.channel
            };
            contentDetails.push(detail);
        });
        let myData = {
            path,
            systemCode: "ENGA-CHUZO",
            partnerName: "enga-stream",
            correlationId: this.streamData.correlationId,
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
                    this.modalHeader = "DIRECTV Via Internet Information";
                    this.modalBody = `<span style='font-size: 14px;'><strong>DIRECTV Information</strong></span><span style='font-size: 12px;'><p><strong>Internet Speeds:</strong></p><ul><li>${this.verbiages.minimumSpeed}</li></ul><p><strong>Billing: </strong></p><ul><li>${this.verbiages.packageMonthlyCharge}</li></ul></span>`;
                    this.showModal = true;
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

    handleCancel() {
        if (this.returnUrl != undefined) {
            window.open(this.returnUrl, "_self");
        } else if (this.isGuestUser) {
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
        if (this.isDTV) {
            this.handleBillingDetailsCallout();
        } else {
            this.handleGetIncludedAddOns();
        }
    }

    handleGetIncludedAddOns() {
        this.loaderSpinner = true;
        const path = "getAddonEquipmentProtectionplanDetails";
        let myData = {
            ...this.streamData,
            path,
            partnerName: "enga-stream",
            systemCode: "ENGA-CHUZO",
            selectedBaseOfferCode: this.selectedTarget,
            addOn: {
                offerProductFamily: ["OTT"],
                offerActionType: ["Acquisition"],
                contractIndicator: ["TAZCONTRACT"],
                offerProductTypes: ["video-addon"],
                addOnType: ["Programming-Bolt-on", "Bolt-on", "Standalone", "Subscription"]
            },
            equipment: {
                offerProductFamily: ["OTT"],
                offerActionType: ["Acquisition"],
                offerProductTypes: ["video-device", "fee"],
                contractIndicator: ["TAZCONTRACT"]
            },
            protectionPlan: {
                salesChannel: [this.streamData.channel],
                offerProductTypes: ["protection-plan"],
                offerActionType: ["Acquisition"],
                contractIndicator: ["TAZCONTRACT"],
                offerProductFamily: ["OTT"],
                cartContext: {
                    epochOfferCodes: [this.selectedItem]
                },
                migrationIndicator: false,
                creditRisk: ""
            },
            channelEligibility: {
                salesChannel: this.streamData.channel,
                salesSubChannel: this.streamData.subChannel,
                locationID: this.streamData.locationId,
                locationTypeID: this.streamData.locationTypeId,
                dealerCode: this.streamData.dealerAgentId,
                directIntegrationPartnerName: "ENGA-CHUZO"
            }
        };
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
            ...this.streamData,
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
            marketingSourceCode: [this.streamData.marketingSourceCode],
            salesChannel: "directIntegrationPartner",
            uiProps: "stream",
            shoppingContext: {
                hboMaxIncluded: false,
                contractOffer: true,
                contractType: "TAZCONTRACT",
                treatmentCode: "dummy_4321"
            },
            GeoInfo: {
                zipCode: this.orderInfo.address.zipCode,
                zipCounty: this.orderInfo.address.county
            },
            channelEligibility: {
                salesChannel: this.streamData.channel,
                salesSubChannel: this.streamData.subChannel,
                locationID: this.streamData.locationId,
                locationTypeID: this.streamData.locationTypeId,
                dealerCode: this.streamData.dealerAgentId,
                directIntegrationPartnerName: "ENGA-CHUZO",
                isFulfillmentDealer: !this.newOrderInfo.NFFL,
                masterDealerId: this.streamData.masterDealerId,
                dealerId: this.streamData.dealerId
            }
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
            ...this.newOrderInfo,
            customerEligibility: {
                zipCode: [this.orderInfo.address.zipCode],
                county: [this.orderInfo.address.county]
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
                        streetAddress: this.orderInfo.address.addressLine1,
                        city: this.orderInfo.address.city,
                        state: this.orderInfo.address.state,
                        zipCode: this.orderInfo.address.zipCode
                    },
                    businessSegment: "REG",
                    accountStatus: "PEND"
                }
            },
            channelEligibility: {
                isFulfillmentDealer: !this.newOrderInfo.NFFL
            },
            marketingSourceCode: [this.newOrderInfo.marketingSourceCode],
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
            ...this.streamData
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
        let product = this.products[this.selectedItem];
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
        let info = {
            orderInfo: {
                ...this.newOrderInfo,
                orderNumber: this.cartInfo.orderNumber,
                productType: this.productType,
                componentCode: this.selectedTarget,
                product: product
            },
            selectedProduct: selectedProduct.Name,
            closingOffers: this.closingOffers
        };
        if (this.isDTV) {
            info = { ...info, internationalRequired: product.internationalRequired, result, included: this.included };
        } else {
            info = {
                ...info,
                cartInfo: this.cartInfo,
                result,
                addCartData: this.addCartData,
                verbiages: this.verbiages
            };
        }
        let availableProducts = [];
        this.products.forEach((p) => {
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
                    const sendProductSelectionEvent = new CustomEvent("productselection", {
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
                    const sendProductSelectionEvent = new CustomEvent("productselection", {
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
                    const sendProductSelectionEvent = new CustomEvent("productselection", {
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
            const sendProductSelectionEvent = new CustomEvent("productselection", {
                detail: { ...info }
            });
            this.dispatchEvent(sendProductSelectionEvent);
        }
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    sbsHandler() {
        this.showSBS = true;
    }

    hideSBS() {
        this.chartCancel = true;
        this.showSBS = false;
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    hideModal() {
        this.showModal = false;
    }

    handleDisclosure(e) {
        this.modalHeader = "Offer Detail";
        this.modalBody =
            ENGA_OFFER_DETAIL_MODAL_BODY_4 + " " + ENGA_OFFER_DETAIL_MODAL_BODY_5 + ENGA_OFFER_DETAIL_MODAL_BODY_3;
        this.showModal = true;
    }

    handleIncludedFeatures(e) {
        this.modalHeader = "Included Features";
        let productCode = e.detail.value;
        let selectedItemIndex = this.products.findIndex((product) => product.Id === productCode);
        let formattedFeatures = this.products[selectedItemIndex].includedFeatures.replace("|", "<br>");
        this.modalBody = formattedFeatures;
        this.showModal = true;
    }

    handleFilter(event) {
        let auxProducts = [];
        this.selectedProductId = undefined;
        this.products.forEach((item) => {
            if (item.isChecked) {
                item.isChecked = false;
            }
            auxProducts.push(item);
        });
        this.products = [];
        this.products = [...auxProducts];

        if (event.target.name === "language") {
            this.language = event.target.value;
            if (this.language == "spanish") this.spanish = true;
            else this.spanish = false;
        } else if (event.target.name === "included") {
            this.allIncluded = event.target.value;
            if (this.allIncluded == "yes") this.included = true;
            else this.included = false;
        } else if (event.target.name === "noLocals") {
            this.typeOption = event.target.value;
            if (this.typeOption === "viaAntenna") {
                this.displayAntennaPopUp();
            } else if (this.typeOption === "noLocals") {
                this.displayNoLocalsPopUp();
            }
        }
        let newProducts = [];
        if (this.showOffersSelection) {
            this.originalDTVProducts =
                this.typeOption === "locals"
                    ? [...this.localProducts]
                    : this.typeOption === "noLocals"
                    ? [...this.noLocalProducts]
                    : this.typeOption === "viaAntenna"
                    ? [...this.antennaProducts]
                    : [];
        }
        this.originalDTVProducts.forEach((item) => {
            if (this.included && item.included && this.spanish && item.language === "spanish") {
                newProducts.push(item);
            } else if (!this.included && !item.included && this.spanish && item.language === "spanish") {
                newProducts.push(item);
            } else if (this.included && item.included && !this.spanish && item.language === "english") {
                newProducts.push(item);
            } else if (!this.included && !item.included && !this.spanish && item.language === "english") {
                newProducts.push(item);
            }
        });
        this.products = [...newProducts];
        let auxCartInfo = {
            orderNumber: this.cartInfo.orderNumber,
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
        this.cartInfo = {};
        this.cartInfo = { ...auxCartInfo };
        this.disableNext = true;
    }
    get languageOptions() {
        return [
            { label: "English", value: "english" },
            { label: "Spanish", value: "spanish" }
        ];
    }

    get includedOptions() {
        return [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" }
        ];
    }

    get isCallCenterOrigin() {
        return this.origin == "phonesales";
    }

    get msgDtv() {
        let msgDtv =
            this.orderData.dtv.hasOwnProperty("error") && this.orderData.dtv.error.hasOwnProperty("provider")
                ? this.orderData.dtv.error.provider.message
                : this.orderData.dtv.hasOwnProperty("message")
                ? this.orderData.dtv.message
                : this.orderData.dtv.hasOwnProperty("error")
                ? this.orderData.dtv.error
                : "";
        return msgDtv;
    }

    get msgAtv() {
        let msgAtv =
            this.orderData.atv.hasOwnProperty("error") && this.orderData.atv.error.hasOwnProperty("provider")
                ? this.orderData.atv.error.provider.message
                : this.orderData.atv.hasOwnProperty("message")
                ? this.orderData.atv.message
                : this.orderData.atv.hasOwnProperty("error")
                ? this.orderData.atv.error
                : "";
        return msgAtv;
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Products",
            component: "poe_lwcBuyflowDirecTvEngaProductsTab",
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