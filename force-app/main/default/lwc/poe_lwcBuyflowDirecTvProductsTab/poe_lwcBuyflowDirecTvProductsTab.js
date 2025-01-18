import { LightningElement, track, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const partnerName = "directv";

export default class Poe_lwcBuyflowDirecTvProductsTab extends NavigationMixin(LightningElement) {
    @track products = [];
    @api recordId;
    @api logo;
    @api origin;
    @api userId;
    @api selected;
    @api orderInfo;
    @api dealerCode;
    @api suggestedAddressSelected;
    @api returnUrl;
    disclosureAgreementLabel = "I have read the above disclosures to the customer, and the customer agreed";
    internationalAvailable;
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
    partnerOrderNumber;
    productType;
    customerType;
    spanish = false;
    included = true;
    language = "";
    allIncluded;
    isDTV;
    originalDTVProducts = [];
    selectedItemsTotal = 0;
    selectedItem;
    selectedItemPriceMonthly = 0;
    selectedItemNameMonthly;
    phonesalesOrigin = false;
    chartCancel = false;

    selectedTarget;

    disableNext = true;

    connectedCallback() {
        this.cartInfo.orderNumber = this.orderInfo.dtv.orderNumber;
        this.language = "english";
        this.allIncluded = "yes";
        this.phonesalesOrigin = this.origin === "phonesales";
    }
    providerCallout(event) {
        this.productType = event.target.value;
        this.isDTV = this.productType === "dtv" ? true : false;
        if (!this.chartCancel) {
            this.selectedItemsTotal = 0;
            this.selectedItemNameMonthly = "";
            this.selectedItem = null;
            let orderInfoParsed = JSON.parse(JSON.stringify(this.orderInfo));
            this.orderInfo = orderInfoParsed;
            this.cartInfo.orderNumber = this.isDTV ? this.orderInfo.dtv.orderNumber : this.orderInfo.atv.orderNumber;
            this.partnerOrderNumber = this.isDTV
                ? this.orderInfo.dtv.partnerOrderNumber
                : this.orderInfo.atv.partnerOrderNumber;
            this.customerType = orderInfoParsed.customerType;
            this.loaderSpinner = true;
            this._actionUtil = new OmniscriptActionCommonUtil();
            let myData = {
                dealerCode: this.dealerCode,
                customerFacing: this.origin !== "phonesales",
                partnerName: partnerName,
                tab: "products",
                customerType: this.customerType,
                productType: this.productType,
                partnerOrderNumber: this.partnerOrderNumber,
                address: orderInfoParsed.address,
                customer: {
                    firstName: orderInfoParsed.customer.firstName,
                    lastName: orderInfoParsed.customer.lastName,
                    emailAddress: orderInfoParsed.customer.emailAddress,
                    middleName: orderInfoParsed.customer.middleName !== null ? orderInfoParsed.customer.middleName : "",
                    phoneNumber: orderInfoParsed.customer.phoneNumber
                },
                address: orderInfoParsed.address
            };
            myData.customer.middleName == null ? (myData.customer.middleName = "") : undefined;
            this.suggestedAddressSelected ? (myData.multiAddress = true) : undefined;
            console.log("Products Payload :", myData);
            const options = {};
            const params = {
                input: JSON.stringify(myData),
                sClassName: `vlocity_cmt.IntegrationProcedureService`,
                sMethodName: "Buyflow_ProviderCallouts",
                options: JSON.stringify(options)
            };
            this._actionUtil
                .executeAction(params, null, this, null, null)
                .then((response) => {
                    console.log(response);
                    let products = [];
                    let result = response.result.IPResult;
                    if (result.hasOwnProperty("result") && result.result.hasOwnProperty("error")) {
                        this.loaderSpinner = false;
                        const event = new ShowToastEvent({
                            title: "Server Error",
                            variant: "error",
                            mode: "sticky",
                            message: "The Product request could not be made correctly to the server. Please, try again."
                        });
                        this.dispatchEvent(event);
                    } else {
                        if (result.hasOwnProperty("message")) {
                            this.modalBody = result.message;
                            this.modalHeader = "Notice";
                            this.showModal = true;
                        }
                        if (result.hasOwnProperty("productDisclosure") && this.productType === "atv") {
                            this.modalHeader = "DirecTV Via Internet Information";
                            this.modalBody = result.productDisclosure.disclosureHtml;
                            this.showModal = true;
                        }
                        this.partnerOrderNumber = result.partnerOrderNumber;
                        let bnd = result.hasOwnProperty("components") ? result.components : undefined;

                        if (bnd !== undefined) {
                            bnd.forEach((item) => {
                                let intProduct = {
                                    Id: item.component.code,
                                    Name: item.component.name,
                                    Description: item.component.shortDescription,
                                    pricingRequirement: item.component.standardFees.hasOwnProperty("proximity2")
                                        ? item.component.standardFees.proximity2
                                        : "",
                                    disclosure: item.component.disclosure,
                                    internationalRequired: item.component.hasOwnProperty("international")
                                        ? item.component.international === "1"
                                        : false,
                                    includedFeatures: item.component.includedFeatures,
                                    fee: Number(item.component.standardFees.fee).toFixed(2).toString(),
                                    discountedFee: Number(item.component.standardFees.discountedFee)
                                        .toFixed(2)
                                        .toString(),
                                    autopayDiscount: Number(item.component.standardFees.autopayDiscount)
                                        .toFixed(2)
                                        .toString(),
                                    isChecked: false,
                                    contractType: item.component.hasOwnProperty("contractType")
                                        ? item.component.contractType
                                        : undefined,
                                    language: item.component.language,
                                    included: item.component.allIncluded === "1" ? true : false
                                };
                                products.push(intProduct);
                            });
                        }
                        this.products = [...products];
                        if (this.isDTV) {
                            this.originalDTVProducts = [];
                            this.originalDTVProducts = [...this.products];
                            let newProducts = [];
                            this.originalDTVProducts.forEach((item) => {
                                if (this.included && item.included && this.spanish && item.language === "spanish") {
                                    newProducts.push(item);
                                } else if (
                                    !this.included &&
                                    !item.included &&
                                    this.spanish &&
                                    item.language === "spanish"
                                ) {
                                    newProducts.push(item);
                                } else if (
                                    this.included &&
                                    item.included &&
                                    !this.spanish &&
                                    item.language === "english"
                                ) {
                                    newProducts.push(item);
                                } else if (
                                    !this.included &&
                                    !item.included &&
                                    !this.spanish &&
                                    item.language === "english"
                                ) {
                                    newProducts.push(item);
                                }
                            });
                            this.products = [...newProducts];
                        }
                        this.products.forEach((item) => {
                            if (item.isChecked) {
                                this.selectedItemNameMonthly = item.Name;
                                this.selectedTarget = item.Id;
                                this.selectedItemPriceMonthly = parseFloat(item.discountedFee);
                            }
                        });

                        this.selectedItemsTotal += this.selectedItemPriceMonthly;
                        this.selectedItemsTotal = parseFloat(this.selectedItemsTotal.toFixed(2));
                        if (this.isDTV && this.internationalAvailable === undefined) {
                            let internationalData = {};
                            const options = {};
                            const params = {
                                input: JSON.stringify(internationalData),
                                sClassName: `vlocity_cmt.IntegrationProcedureService`,
                                sMethodName: "Buyflow_GetInternationalPackage",
                                options: JSON.stringify(options)
                            };
                            this._actionUtil
                                .executeAction(params, null, this, null, null)
                                .then((response) => {
                                    this.internationalAvailable =
                                        response.result.IPResult.Account.POE_Espanol_Package__c;
                                    this.loaderSpinner = false;
                                })
                                .catch((error) => {
                                    console.log(error);
                                    this.loaderSpinner = false;
                                });
                        } else {
                            this.loaderSpinner = false;
                        }
                    }
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
                    this.loaderSpinner = false;
                });
        } else {
            this.chartCancel = false;
        }
    }

    handlePriceChange(event) {
        this.value = event.target.value;
        this.selectedItemsTotal = 0;
        this.selectedItem = this.products.findIndex((product) => product.Id === event.target.value);

        if (this.selectedItem !== undefined) {
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
        }

        if (
            this.products[this.selectedItem] !== undefined &&
            this.products[this.selectedItem].discountedFee !== undefined
        ) {
            this.selectedItemNameMonthly = this.products[this.selectedItem].Name;
            this.selectedItemsTotal = this.products[this.selectedItem].discountedFee;
            this.selectedTarget = this.products[this.selectedItem].Id;
            if (this.productType === "dtv") {
                this.modalHeader = "Offer Detail";
                this.modalBody = this.products[this.selectedItem].disclosure;
                this.showModal = true;
            }
            console.log(this.products[this.selectedItem]);
            this.cartInfo.monthlyCharges = [];
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

            this.cartInfo.monthlyTotal = 0;
            this.cartInfo.monthlyCharges = [...charges];
            charges.forEach((charge) => {
                this.cartInfo.monthlyTotal = charge.discount
                    ? Number(this.cartInfo.monthlyTotal) - Number(charge.fee)
                    : Number(this.cartInfo.monthlyTotal) + Number(charge.fee);
            });
            this.cartInfo.monthlyTotal = Number(this.cartInfo.monthlyTotal).toFixed(2);
            this.disableNext = false;
        } else {
            this.cartInfo.hasMonthly = false;
        }
    }
    handleCancel() {
        if (this.returnUrl != undefined) {
            window.open(this.returnUrl, "_self");
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

    handleClick() {
        this.loaderSpinner = true;
        let product = this.products[this.selectedItem];
        let productInfo = {
            orderInfo: {
                partnerName: partnerName,
                partnerOrderNumber: this.partnerOrderNumber,
                orderNumber: this.cartInfo.orderNumber,
                productType: this.productType,
                dealerCode: this.dealerCode,
                componentCode: this.selectedTarget,
                customerType: this.customerType,
                product: product,
                customer: this.orderInfo.customer
            },
            cartInfo: { ...this.cartInfo },
            included: this.included,
            internationalRequired: product.internationalRequired
        };
        let selectedProduct = {
            Description: product.Description,
            Family: "DirecTV",
            Name: product.Name.substring(0, 80),
            UnitPrice: parseFloat(product.fee),
            PriceType: "Monthly",
            ProductCode: product.Id,
            servRef: product.Id.substring(0, 25),
            vasProduct: false,
            callLogId: undefined
        };

        let availableProducts = [];

        this.products.forEach((p) => {
            let otherProduct = {
                Description: p.Description,
                Family: "DirecTV",
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
        productInfo.selectedProduct = selectedProduct.Name;
        console.log(productInfo);
        let myData = {
            Program: "DirecTV",
            ContextId: this.recordId,
            Product: selectedProduct,
            OtherProducts: availableProducts,
            iframe: false
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_SaveProduct",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                this.setTrack(productInfo);
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
                this.loaderSpinner = false;
            });
    }

    setTrack(productInfo) {
        console.log(productInfo);
        let trackerData = {
            userId: this.userId,
            operation: "setTrack",
            isCount: "true",
            action: "Product Selection"
        };
        if (this.origin === "retail") {
            const options = {};
            const params = {
                input: JSON.stringify(trackerData),
                sClassName: `vlocity_cmt.IntegrationProcedureService`,
                sMethodName: "Clicker_RetailMain",
                options: JSON.stringify(options)
            };
            this._actionUtil
                .executeAction(params, null, this, null, null)
                .then((response) => {
                    console.log(response);
                    this.loaderSpinner = false;
                    const sendProductSelectionEvent = new CustomEvent("productselection", {
                        detail: productInfo
                    });
                    this.dispatchEvent(sendProductSelectionEvent);
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "event") {
            const options = {};
            const params = {
                input: JSON.stringify(trackerData),
                sClassName: `vlocity_cmt.IntegrationProcedureService`,
                sMethodName: "Clicker_EventMain",
                options: JSON.stringify(options)
            };
            this._actionUtil
                .executeAction(params, null, this, null, null)
                .then((response) => {
                    console.log(response);
                    this.loaderSpinner = false;
                    const sendProductSelectionEvent = new CustomEvent("productselection", {
                        detail: productInfo
                    });
                    this.dispatchEvent(sendProductSelectionEvent);
                })
                .catch((error) => {
                    console.log(error);
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "phonesales") {
            const options = {};
            const params = {
                input: JSON.stringify(trackerData),
                sClassName: `vlocity_cmt.IntegrationProcedureService`,
                sMethodName: "Clicker_CallCenterMain",
                options: JSON.stringify(options)
            };
            this._actionUtil
                .executeAction(params, null, this, null, null)
                .then((response) => {
                    console.log(response);
                    this.loaderSpinner = false;
                    const sendProductSelectionEvent = new CustomEvent("productselection", {
                        detail: productInfo
                    });
                    this.dispatchEvent(sendProductSelectionEvent);
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                });
        } else {
            this.loaderSpinner = false;
            const sendProductSelectionEvent = new CustomEvent("productselection", {
                detail: productInfo
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
        this.modalBody = e.currentTarget.dataset.id;
        this.showModal = true;
    }

    handleIncludedFeatures(e) {
        this.modalHeader = "Included Features";
        let productCode = e.currentTarget.dataset.id;
        let selectedItemIndex = this.products.findIndex((product) => product.Id === productCode);
        let formattedFeatures = this.products[selectedItemIndex].includedFeatures.replace("|", "<br>");
        this.modalBody = formattedFeatures;
        this.showModal = true;
    }

    handleFilter(event) {
        this.disableNext = true;
        let auxProducts = [];
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
        }
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
        let auxCartInfo = {
            orderNumber: this.isDTV ? this.orderInfo.dtv.orderNumber : this.orderInfo.atv.orderNumber,
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
            this.orderInfo.dtv.hasOwnProperty("result") &&
            this.orderInfo.dtv.result.hasOwnProperty("error") &&
            this.orderInfo.dtv.result.error.hasOwnProperty("provider")
                ? this.orderInfo.dtv.result.error.provider.message
                : this.orderInfo.dtv.hasOwnProperty("message")
                ? this.orderInfo.dtv.message
                : this.orderInfo.dtv.hasOwnProperty("error")
                ? this.orderInfo.dtv.error
                : "";
        return msgDtv;
    }

    get msgAtv() {
        let msgAtv =
            this.orderInfo.atv.hasOwnProperty("result") &&
            this.orderInfo.atv.result.hasOwnProperty("error") &&
            this.orderInfo.atv.result.error.hasOwnProperty("provider")
                ? this.orderInfo.atv.result.error.provider.message
                : this.orderInfo.atv.hasOwnProperty("message")
                ? this.orderInfo.atv.message
                : this.orderInfo.atv.hasOwnProperty("error")
                ? this.orderInfo.atv.error
                : "";
        return msgAtv;
    }
}