import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getWindstreamDisclaimers from "@salesforce/apex/ProductTabController.getWindstreamDisclaimers";
import saveProductCall from "@salesforce/apex/ProductTabController.saveProduct";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import techDisclaimerTitle from "@salesforce/label/c.Tech_Disclaimer_Title";
import broadbandLabel from "@salesforce/label/c.Windstream_Broadband_Label";
import Chuzo_Generic_Product_Error_Message from  "@salesforce/label/c.Chuzo_Generic_Product_Error_Message";
import Windstream_address_Prequalified from  "@salesforce/label/c.Windstream_address_Prequalified";
import Windstream_autopay from "@salesforce/label/c.Windstream_autopay";

const EXCLUDED_PRODUCTS_ID = ["2430"]; //Added $25 VoIP Bundle Credit Id

export default class Poe_lwcBuyflowWindstreamProductsTab extends NavigationMixin(LightningElement) {
    @api products = [];
    @api bundles = [];
    @api recordId;
    @api isGuestUser;
    @api logo;
    @api origin;
    @api userId;
    @api selected;
    @api clientInfo;
    @api selectedBuyFlow;
    cart = {
        hasBundles: false,
        bundlesCharges: [],
        bundlesTotal: (0.0).toFixed(2),
        hasAdders: false,
        addersCharges: [],
        addersTotal: (0.0).toFixed(2),
        hasToday: false,
        todayCharges: [],
        todayTotal: (0.0).toFixed(2),
        hasUpfront: false,
        upfrontCharges: [],
        upfrontTotal: (0.0).toFixed(2)
    };
    showCollateral = false;
    showSBS = false;
    loaderSpinner;
    offerId;
    value = "all";
    selectedItemsTotal = 0;
    selectedItemPriceMonthly = 0;
    selectedItemNameMonthly;
    selectedTarget;
    disclaimers = [];
    showDisclaimer = false;
    disclaimer = [];
    techDisclaimer;
    disableNext = true;
    showProducts = true;
    modalLabel = "Close";
    preQualified = false;
    showExtendedCopper = false;
    dropDisclaimer = {
        description: "",
        header: "",
        shortDescription: ""
    };
    copperDropReview = false;
    skipInstallation = false;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        techDisclaimerTitle,
        broadbandLabel,
        Chuzo_Generic_Product_Error_Message,
        Windstream_address_Prequalified,
        Windstream_autopay
    };
    showSelfServiceCancelModal = false;
    showBroadbandModal = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get directoryListingOptions() {
        return [
            { label: "Listed - Free", value: "listed" },
            { label: "Unlisted - $5.00", value: "unlisted" }
        ];
    }

    directoryListingValue = "listed";
    showDirectoryListing = false;
    directoryName;
    directoryType;
    applicableDisclaimers = [];

    productCallout() {
        let selected;
        if (this.selected !== undefined) {
            selected = this.selected.split(";");
        }
        let clientInfoParsed = JSON.parse(JSON.stringify(this.clientInfo));
        const path = "products/windstream";
        let myData = {
            partnerName: "windstream",
            path,
            address: clientInfoParsed.address,
            selectedAddressInfo: clientInfoParsed.selectedAddressInfo,
            selectedBuyFlow: this.selectedBuyFlow
        };
        if (clientInfoParsed?.additionalAddress) {
            myData.additionalAddress = { ...clientInfoParsed.additionalAddress };
            myData.addressType = clientInfoParsed.addressType;
        }

        console.log("Products Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Products Response", responseParsed);
                let products = [];
                if (
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    (responseParsed.hasOwnProperty("error") && responseParsed.error.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error")
                ) {
                    this.loaderSpinner = false;
                    let errorMessage;
                    if (
                        responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")
                    ) {
                        if (responseParsed.error.provider.message.hasOwnProperty("message")) {
                            errorMessage = responseParsed.error.provider.message.message;
                        } else {
                            errorMessage = responseParsed.error.provider.message;
                        }
                    } else if (
                        responseParsed.hasOwnProperty("result") &&
                        responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("message")
                    ) {
                        errorMessage = responseParsed.error.message;
                    } else if (responseParsed.hasOwnProperty("error")) {
                        errorMessage = responseParsed.error;
                    }
                    const finalErrorMessage =
                        errorMessage !== undefined
                            ? errorMessage
                            : this.labels.Chuzo_Generic_Product_Error_Message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: finalErrorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${finalErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.offerId = responseParsed.offerId;
                    responseParsed.products.forEach((product) => {
                        if (product.hasOwnProperty("disclaimerNumber")) {
                            const header = "Description";
                            const shortDescription = "";
                            if (["23", "20"].includes(product.disclaimerNumber)) {
                                const disclaimer = this.disclaimers.find(
                                    (item) => item.Name === product.disclaimerNumber
                                );
                                if (disclaimer) {
                                    this.dropDisclaimer.description = disclaimer.Disclaimer__c;
                                }
                                if (product?.disclaimerDesc) {
                                    this.dropDisclaimer.header = product.disclaimerDesc;
                                    this.dropDisclaimer.shortDescription = product.disclaimerDesc + " Disclaimer";
                                } else {
                                    this.dropDisclaimer.header = header;
                                    this.dropDisclaimer.shortDescription = shortDescription;
                                }
                                this.showExtendedCopper = true;
                            }
                        }
                    });
                    let bnd = responseParsed.products
                        .map((product, index) => {
                            const filteredBundles = product.bundles.filter(
                                (item) => !EXCLUDED_PRODUCTS_ID.includes(item.bundleID)
                            );
                            if (filteredBundles.length === 0) {
                                return [];
                            }
                            return filteredBundles.map((bundle) => ({
                                ...bundle,
                                qualifiedSpeed: product.qualifiedSpeed,
                                adders: { ...product.adders },
                                techDisclaimer: product.disclaimerNumber,
                                index
                            }));
                        })
                        .flat();
                    if (bnd !== undefined) {
                        bnd.forEach((item) => {
                            let promoArray = item?.promoArray !== null ? item?.promoArray : [];
                            let promo = promoArray.find((e) => e.promoName === "first 3 months");
                            let hasPromo = !!promo;
                            let intProduct = {
                                Id: item.bundleID,
                                ProductId: item.qualifiedSpeed,
                                Index: item.index,
                                Name: item.bundleName,
                                Type: "bundle",
                                Voice: item?.disclaimerDesc ? item.disclaimerDesc.includes("Bundle") : false,
                                Price: hasPromo
                                    ? Number(promo.promoPrice).toFixed(2)
                                    : Number(item.promoPrice).toFixed(2),
                                OldPrice: Number(item.promoPrice).toFixed(2),
                                Family: "Windstream",
                                PriceType: hasPromo ? promo.promoTerm + " Months" : item.promoTerm,
                                Speed: item.speed,
                                Description: item.disclaimerDesc,
                                isChecked:
                                    this.selected !== undefined ? selected.some((e) => e === item.bundleName) : false,
                                hasDisclaimer:
                                    this.disclaimers.some((e) => e.Name === item.disclaimerNumber) &&
                                    item.disclaimerNumber !== null,
                                disclaimerNumber: item.disclaimerNumber,
                                hasTechDisclaimer:
                                    this.disclaimers.some((e) => e.Name === item.techDisclaimer) &&
                                    item.disclaimerNumber !== null,
                                techNumber: item.techDisclaimer,
                                adders: item.adders,
                                hasPromo: hasPromo,
                                promo: promo
                            };
                            if (intProduct.isChecked) {
                                this.disableNext = false;
                            }
                            products.push(intProduct);
                        });
                    }
                    products.sort((a, b) =>
                        Number(a.Price) > Number(b.Price) ? -1 : Number(a.Price) < Number(b.Price) ? 1 : 0
                    );
                    this.products = [...products];
                    let cart = { ...this.cart };
                    this.products.forEach((item) => {
                        if (item.isChecked) {
                            let newCharge = {
                                name: item.Name,
                                fee: Number(item.Price).toFixed(2),
                                discount: Number(item.Price) > 0.0 ? false : true,
                                hasDescription: false,
                                description: "",
                                type: "product"
                            };
                            cart.bundlesCharges.push(newCharge);
                            cart.hasBundles = true;
                            this.selectedItemNameMonthly = item.Name;
                            this.selectedTarget = item.Name;
                            this.selectedItemPriceMonthly = parseFloat(item.Price);
                        }
                    });
                    cart.bundlesCharges.forEach((item) => {
                        cart.bundlesTotal = (Number(cart.bundlesTotal) + Number(item.fee)).toFixed(2);
                    });
                    this.cart.hasBundles = cart.hasBundles;
                    this.cart.bundlesCharges = [...cart.bundlesCharges];
                    this.cart.bundlesTotal = cart.bundlesTotal;
                    this.selectedItemsTotal += this.selectedItemPriceMonthly;
                    this.selectedItemsTotal = parseFloat(this.selectedItemsTotal.toFixed(2));
                    if (
                        responseParsed.hasOwnProperty("promoOffers") &&
                        responseParsed.promoOffers !== null &&
                        responseParsed.promoOffers.length > 0
                    ) {
                        this.preQualified =
                            responseParsed.promoOffers.filter((item) => item.promoName === "Prequalified").length > 0;
                        if (this.preQualified) {
                            let promoInfo = responseParsed.promoOffers.filter(
                                (item) => item.promoName === "Prequalified"
                            )[0];
                            if (promoInfo.promoDescription) {
                                let message = promoInfo.promoDescription;
                                if (
                                    promoInfo.promoDescription ==
                                        this.labels.Windstream_address_Prequalified &&
                                    promoInfo.promoType == "Pop Up"
                                ) {
                                    message += this.labels.Windstream_autopay;
                                }
                                const event = new ShowToastEvent({
                                    title: promoInfo.promoName,
                                    variant: "success",
                                    mode: "sticky",
                                    message: message
                                });
                                this.dispatchEvent(event);
                            }
                        }
                    }
                    this.loaderSpinner = false;
                    if (!this.showExtendedCopper) {
                        this.showBroadbandModal = true;
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    this.labels.Chuzo_Generic_Product_Error_Message;
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
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    handleBroadbandModal() {
        this.showBroadbandModal = false;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.getDisclaimers();
    }

    getDisclaimers() {
        this.loaderSpinner = true;
        getWindstreamDisclaimers()
            .then((response) => {
                console.log(response);
                this.disclaimers = [...response.result.Disclaimers];
                this.productCallout();
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: this.labels.Chuzo_Generic_Product_Error_Message
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handlePriceChange(event) {
        this.selectedItemsTotal = 0;
        let index = this.products.findIndex((product) => product.Id === event.target.value);
        let sel = [];
        this.products.forEach((product) => {
            if (product.Id === this.products[index].Id) {
                product.isChecked = true;
            } else {
                product.isChecked = false;
            }
            sel.push(product);
        });
        this.products = [];
        this.products = [...sel];
        let cart = { ...this.cart };
        cart.bundlesCharges = [];
        cart.hasBundles = false;
        cart.bundlesTotal = (0.0).toFixed(2);
        cart.todayCharges = [];
        cart.hasToday = false;
        cart.todayTotal = (0.0).toFixed(2);
        if (this.products[index].Name !== undefined && this.products[index].Price !== undefined) {
            cart.hasBundles = true;
            let newCharge = {
                name: this.products[index].Name,
                fee: Number(this.products[index].Price).toFixed(2),
                discount: Number(this.products[index].Price) > 0.0 ? false : true,
                hasDescription: false,
                description: "",
                type: "product"
            };
            cart.bundlesCharges.push(newCharge);
            this.selectedItemNameMonthly = this.products[index].Name;
            this.selectedItemPriceMonthly = parseFloat(this.products[index].Price);
        }
        this.selectedTarget = this.products[index]?.Name;
        if (this.selectedTarget.includes("Unlimited Phone")) {
            this.showDirectoryListing = true;
            this.directoryName = "Listed";
            this.directoryType = "Listed";
        } else {
            this.showDirectoryListing = false;
            this.directoryName = "";
            this.directoryType = "";
        }
        cart.bundlesCharges.forEach((item) => {
            cart.bundlesTotal = (Number(cart.bundlesTotal) + Number(item.fee)).toFixed(2);
        });
        this.cart = { ...cart };
        this.selectedItemsTotal += this.selectedItemPriceMonthly;
        this.selectedItemsTotal = parseFloat(this.selectedItemsTotal.toFixed(2));
        this.directoryListingValue = "listed";
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

    saveProduct() {
        this.loaderSpinner = true;
        let speed;
        let adders = {};
        let hasPhone;
        let selectedProduct;
        this.products.forEach((prod) => {
            if (prod.Name === this.selectedTarget) {
                speed = prod.Speed;
                selectedProduct = {
                    Description: prod.Description,
                    Family: prod.Family,
                    Name: this.selectedTarget.substring(0, 80),
                    UnitPrice: parseFloat(prod.Price),
                    PriceType: prod.PriceType,
                    ProductCode: prod.Id,
                    servRef: prod.Id,
                    vasProduct: false,
                    callLogId: undefined
                };
                adders = { ...prod.adders };
                hasPhone = prod.Description.includes("Bundle");
            }
        });
        let cartInfo = {
            product: selectedProduct,
            productName: this.selectedTarget,
            adders: []
        };
        let myData = {
            Program: "Windstream",
            ContextId: this.recordId,
            Product: selectedProduct,
            Adders: [],
            iframe: false
        };
        let orderInfo = {
            skipInstallation: this.skipInstallation,
            copperDropReview: this.copperDropReview,
            cartInfo: cartInfo,
            offerId: this.offerId,
            applicableDisclaimers: this.applicableDisclaimers,
            orderInfo: {
                selectedHsiSpeed: speed,
                selectedBundle: this.selectedTarget,
                selectedBundleAdders: [],
                textMsgOptin: "N",
                adders: { ...adders },
                hasPhone: hasPhone,
                bundleId: selectedProduct.ProductCode,
                disclaimers: [...this.disclaimers],
                directoryName: this.directoryName,
                directoryType: this.directoryType
            },
            cart: { ...this.cart },
            preQualified: this.preQualified
        };
        saveProductCall({ myData })
            .then((response) => {
                const trackerData = {
                    userId: this.userId,
                    operation: "setTrack",
                    isCount: true,
                    action: "Product Selection"
                };
                if (this.isGuestUser) {
                    this.loaderSpinner = false;
                    const sendProductSelectionEvent = new CustomEvent("productselection", {
                        detail: orderInfo
                    });
                    this.dispatchEvent(sendProductSelectionEvent);
                    return;
                } else {
                    let setClickerTrack;
                    if (this.origin === "retail") {
                        setClickerTrack = setClickerRetailTrack;
                    } else if (this.origin === "event") {
                        setClickerTrack = setClickerEventTrack;
                    } else if (this.origin === "phonesales") {
                        setClickerTrack = setClickerCallCenterTrack;
                    } else {
                        this.loaderSpinner = false;
                        const sendProductSelectionEvent = new CustomEvent("productselection", {
                            detail: orderInfo
                        });
                        this.dispatchEvent(sendProductSelectionEvent);
                        return;
                    }

                    setClickerTrack({ myData: trackerData })
                        .then((response) => {
                            console.log(response);
                            this.loaderSpinner = false;
                            const sendProductSelectionEvent = new CustomEvent("productselection", {
                                detail: orderInfo
                            });
                            this.dispatchEvent(sendProductSelectionEvent);
                        })
                        .catch((error) => {
                            console.error(error, "ERROR");
                            this.loaderSpinner = false;
                            this.logError(error.body?.message || error.message);
                        });
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: this.labels.Chuzo_Generic_Product_Error_Message
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handleClick() {
        this.products.forEach((prod) => {
            if (prod.Name === this.selectedTarget) {
                let disclaimer = [];
                let item = {
                    name: prod.Name,
                    number: prod.disclaimerNumber,
                    description: this.disclaimers.filter((item) => item.Name === prod.disclaimerNumber)[0].Disclaimer__c
                };

                let ProductQualified = this.products.find((i) => i.Name == this.selectedTarget);

                item.description = item.description.replace(/XX/g, ProductQualified.ProductId);
                item.description = item.description.replace("â", "'");

                disclaimer.push(item);
                this.disclaimer = [...disclaimer];
                if (prod.techNumber !== null && prod.techNumber !== undefined) {
                    let techDisclaimer = {
                        name: this.labels.techDisclaimerTitle,
                        number: "",
                        description: (this.techDisclaimer = this.disclaimers.filter(
                            (item) => item.Name === prod.techNumber
                        )[0].Disclaimer__c)
                    };
                    this.applicableDisclaimers.push(techDisclaimer);
                }
                this.applicableDisclaimers.push(item);
            }
        });
        this.saveProduct();
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

    handleDescription(event) {
        if (this.showDisclaimer) {
            this.showDisclaimer = false;
        } else {
            let disclaimer = [];
            let item = {
                name: event.target.dataset.name,
                number: event.target.dataset.id,
                description: this.disclaimers.filter((item) => item.Name === event.target.dataset.id)[0].Disclaimer__c
            };

            let ProductQualified = this.products.find((i) => i.Name == event.target.dataset.name);
            let minSpeedMatch = [...ProductQualified.Name.matchAll(/Range\s(.*)\sto/g)];
            let minSpeed = minSpeedMatch.length != 0 ? minSpeedMatch[0][1] : null;
            let maxSpeedMatch = [...ProductQualified.Name.matchAll(/to\s(.*)Mb\)/g)];
            let maxSpeed = maxSpeedMatch.length != 0 ? maxSpeedMatch[0][1] : null;
            item.description = item.description.replace(/XX/g, ProductQualified.ProductId);
            item.description = minSpeed ? item.description.replace(/XY/g, minSpeed) : item.description;
            item.description = maxSpeed ? item.description.replace(/XZ/g, maxSpeed) : item.description;
            item.description = item.description.replace("â", "'");

            disclaimer.push(item);
            this.disclaimer = [...disclaimer];
            if (event.target.dataset.tech !== null && event.target.dataset.tech !== undefined) {
                this.techDisclaimer = this.disclaimers.filter(
                    (item) => item.Name === event.target.dataset.tech
                )[0].Disclaimer__c;
            }
            this.showDisclaimer = true;
        }
    }

    handleCopperReview(event) {
        this.skipInstallation = true;
        this.copperDropReview = true;
        this.showExtendedCopper = false;
        this.showBroadbandModal = true;
    }

    handleDirectoryListing(event) {
        let cart = { ...this.cart };
        cart.todayCharges = [];
        cart.hasToday = false;
        cart.todayTotal = (0.0).toFixed(2);
        this.directoryListingValue = "listed";
        if (event.detail.value === "unlisted") {
            cart.hasToday = true;
            this.directoryListingValue = "unlisted";
            let newCharge = {
                name: "Directory Listing",
                fee: (5).toFixed(2),
                discount: false,
                hasDescription: false,
                description: "",
                type: "product"
            };
            cart.todayCharges.push(newCharge);
            cart.todayTotal = (5).toFixed(2);
        }
        this.cart = { ...cart };
        if (this.directoryListingValue === "listed") {
            this.directoryName = "Listed";
            this.directoryType = "Listed";
        } else if (this.directoryListingValue === "unlisted") {
            this.directoryName = "Nonpublished";
            this.directoryType = "Nonpublished";
        }
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Products",
            component: "poe_lwcBuyflowWindstreamProductsTab",
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