import { LightningElement, api } from "lwc";
import fslDatesModal from "c/poe_lwcBuyflowFslDatesModal";
import ENGA_GEMINI_WIRELESS_LABEL_PAIR from "@salesforce/label/c.Enga_Gemini_Wireless_Label_Pair";

const ORIG_GEMINI_WIRELESS_DISPLAY_NAME = ENGA_GEMINI_WIRELESS_LABEL_PAIR.split(";")[0];
const NEW_WIRELESS_GEMINI_DISPLAY_NAME = ENGA_GEMINI_WIRELESS_LABEL_PAIR.split(";")[1];
const BUYFLOW_STEPS = [
    { label: "Info", value: "1" },
    { label: "Products", value: "2" },
    { label: "Customer Information", value: "3" },
    { label: "Hardware", value: "4" },
    { label: "Offers", value: "5" },
    { label: "Options", value: "6" },
    { label: "T&C", value: "7" },
    { label: "Payment", value: "8" },
    { label: "Order Submitted", value: "9" }
];
export default class Poe_lwcBuyflowDirecTvEngaParent extends LightningElement {
    @api recordId;
    @api origin;
    @api userId;
    @api contact;
    @api returnUrl;
    @api codeFFL;
    @api codeNFFL;
    @api currentStep = "1";
    @api currentIp;
    @api isGuestUser;
    @api referralCodeData;
    @api zipCode;
    @api isFSLDatesEnabled;
    @api defaultWorkTypeId;
    @api defaultWorkTypeName;
    @api defaultFSLDealerCode;
    included;
    isStream = false;
    orderQualReq;
    creditCheckRequired;
    selectedProduct;
    dateSelected;
    showLoaderSpinner;
    dealerCode;
    NFFL = false;
    logo = "/poe/sfsites/c/resource/POE_dtvIMG";
    showDirecTVInfoTab = false;
    showDirecTVProductsTab = false;
    showDirecTVHardwareTab = false;
    showDirecTVCreditCheckTab = false;
    showDirecTVOffersTab = false;
    showDirecTVSummaryTab = false;
    showDirecTVTermsTab = false;
    showDirecTVOptionsTab = false;
    showDirecTVTPVTab = false;
    showDirecTVPaymentConfirmationTab = false;
    showDirecTVOrderSuccessTab = false;
    showDirecTVOrderChecklistTab = false;
    showDirecTVPaymentInformation = false;
    productDetailResponse = {};
    componentCustomizations = {};
    todayCharges = {
        subTotalAmount: "0.00",
        taxAmount: "0.00",
        totalAmount: "0.00"
    };
    internationalRequired = false;
    clientInfo = {
        contactInfo: {
            firstName: "",
            middleName: "",
            lastName: "",
            county: "",
            email: "",
            phone: "",
            method: "",
            time: ""
        }
    };
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
    cartHardware;
    cartOffers;
    cartPayment;
    cartTerms;
    cartCreditCheck;
    offersSelected;
    referenceNumber;
    orderNumber;
    orderId;
    orderItemId;
    billingAddress;
    hardwareSelected;
    installationInfo;
    sfOrderId;
    futureCharges;
    paymentAttempts;
    orderInfo = {};
    billingInfo = {};
    verifiedEmail;
    cartFinished = false;
    offers;
    protections;
    productTerms = [];
    equipmentTerms = [];
    offersTerms = [];
    terms = [];
    publicKey;
    verbiages = {};
    streamVerbiages = {};
    suggestedAddressSelected = false;
    accountId;
    paymentMethod;
    productSelected;
    legalCustomizations = {
        creditCheckVerbiage1: "",
        creditCheckVerbiage2: "",
        userValidationVerbiage: "",
        paperlessVerbiage: "",
        autopayVerbiage: ""
    };
    mustPayInFull;
    paymentInfo = {};
    serviceabilityInfo = {};
    treatmentCode;
    creditCheckTerms = [];
    addCartData = {};
    baseOffers = [];
    probation = {};
    dealerInventory;
    serials = [];
    hardwareId;
    closingOffers = [];
    showClosingOffers = false;
    isFSL = false;
    fslDealerCode;
    fslWorkOrderId;
    fslServiceAppointmentId;

    get buyflowSteps() {
        const steps = [...BUYFLOW_STEPS];
        if (this.isStream) {
            steps.push({ label: "Order Success", value: "10" });
        } else {
            if (!this.NFFL && !this.isFSL) {
                steps.push({ label: "Installation", value: "10" });
            }
            steps.push({ label: "Order Success", value: "11" });
        }

        return steps;
    }

    connectedCallback() {
        if (this.isFSLDatesEnabled) {
            this.handleFSLDatesModal();
        } else {
            this.showInfoTab();
        }
    }

    showInfoTab() {
        this.showDirecTVInfoTab = true;
        this.checkIP();
        this.updateTabOpportunity("Info");
        this.saveSelfServiceStatistic("Info");
        this.clientInfo.contactInfo.firstName = this.contact.firstName !== "" ? this.contact.firstName : undefined;
        this.clientInfo.contactInfo.lastName = this.contact.lastName !== "" ? this.contact.lastName : undefined;
        this.clientInfo.contactInfo.email = this.contact.email !== "" ? this.contact.email : undefined;
        this.clientInfo.contactInfo.phone = this.contact.phone !== "" ? this.contact.phone : undefined;
    }

    handleBack(e) {
        switch (this.currentStep) {
            case "2":
                this.currentStep = "1";
                this.showDirecTVInfoTab = true;
                this.showDirecTVProductsTab = false;
                this.saveSelfServiceStatistic("Info");
                break;
            case "3":
                this.currentStep = "2";
                this.orderInfo = { ...this.serviceabilityInfo };
                this.showDirecTVCreditCheckTab = false;
                this.showDirecTVProductsTab = true;
                this.saveSelfServiceStatistic("Products");
                break;
            case "4":
                this.currentStep = "3";
                this.showDirecTVHardwareTab = false;
                this.showDirecTVCreditCheckTab = true;
                this.saveSelfServiceStatistic("Customer Information");
                break;
            case "5":
                this.currentStep = "4";
                this.showDirecTVOffersTab = false;
                this.showDirecTVHardwareTab = true;
                this.saveSelfServiceStatistic("Hardware");
                break;
            case "6":
                this.currentStep = "5";
                this.showDirecTVOptionsTab = false;
                this.showDirecTVOffersTab = true;
                this.saveSelfServiceStatistic("Offers");
                break;
            case "7":
                this.currentStep = "6";
                this.showDirecTVTermsTab = false;
                this.showDirecTVOptionsTab = true;
                this.saveSelfServiceStatistic("Options");
                break;
            case "8":
                this.currentStep = "7";
                this.showDirecTVPaymentInformation = false;
                this.showDirecTVTermsTab = true;
                this.saveSelfServiceStatistic("T&C");
                break;
            case "9":
                delete this.orderInfo.paymentId;
                this.currentStep = "8";
                this.showDirecTVPaymentConfirmationTab = false;
                this.showDirecTVPaymentInformation = true;
                this.saveSelfServiceStatistic("Payment");
        }
    }

    handleCheckServiceability(e) {
        this.checkIP();
        this.updateTabOpportunity("Products");
        this.saveSelfServiceStatistic("Products");
        this.orderInfo = { ...e.detail };
        this.serviceabilityInfo = { ...e.detail };
        this.NFFL = e.detail.NFFL;
        this.clientInfo.contactInfo.firstName = e.detail.orderInfo.customer.firstName;
        this.clientInfo.contactInfo.middleName =
            e.detail.orderInfo.customer.middleName !== null && e.detail.orderInfo.customer.middleName !== undefined
                ? e.detail.orderInfo.customer.middleName
                : "";
        this.clientInfo.contactInfo.lastName = e.detail.orderInfo.customer.lastName;
        this.clientInfo.contactInfo.email = e.detail.orderInfo.customer.emailAddress;
        this.clientInfo.contactInfo.phone = e.detail.orderInfo.customer.phoneNumber;
        this.accountId = e.detail.accountId;
        this.probation = { ...e.detail.probation };
        e.detail.hasOwnProperty("multiAddress") ? (this.suggestedAddressSelected = e.detail.multiAddress) : undefined;
        this.showDirecTVInfoTab = false;
        this.showDirecTVProductsTab = true;
        this.currentStep = "2";
    }

    handleProductSelection(e) {
        this.checkIP();
        this.updateTabOpportunity("Customer Information");
        this.saveSelfServiceStatistic("Customer Information");
        let data = e.detail;
        this.showDirecTVProductsTab = false;
        this.isStream = data.orderInfo.productType === "atv" ? true : false;
        this.orderInfo = { ...data.orderInfo };
        this.closingOffers = [...data.closingOffers];
        if (this.isStream) {
            this.cartInfo = { ...this.updateCartStream(data.result) };
            this.streamVerbiages = { ...e.detail.verbiages };
            this.productSelected = data.selectedProduct;
            this.addCartData = { ...e.detail.addCartData };
        } else {
            this.included = JSON.parse(data.included);
            this.cartInfo = { ...this.updateCart(data.result) };
            this.internationalRequired = data.internationalRequired;
            this.paymentMethod = undefined;
            this.billingInfo = {
                body: {
                    ...this.orderInfo,
                    migrationIndicator: false,
                    validateCart: true,
                    reconnectCustomer: false,
                    serviceEndDate: "",
                    cartContext: {
                        cartOffers: [{ offerCode: this.orderInfo.componentCode, quantity: 1 }]
                    },
                    salesChannel: ["directIntegrationPartner"],
                    customerContext: {
                        satellite: {
                            acceptPaperlessBillEnrollment: true,
                            acceptAutoBillPayEnrollment: true,
                            isActive: false,
                            businessSegment: "REG",
                            accountStatus: "PEND",
                            serviceAddress: {
                                streetAddress: this.orderInfo.address.addressLine1,
                                city: this.orderInfo.address.city,
                                state: this.orderInfo.address.state,
                                zipCode: this.orderInfo.address.zipCode
                            }
                        }
                    },
                    customerEligibility: {
                        county: [this.orderInfo.customerEligibility.county],
                        zipCode: [this.orderInfo.customerEligibility.zipCode]
                    },
                    channelEligibility: {
                        isFulfillmentDealer: !this.orderInfo.NFFL
                    },
                    marketingSourceCode: [this.orderInfo.marketingSourceCode],
                    offerActionType: ["Acquisition", "Closing"]
                }
            };
        }
        this.productTerms = [];
        this.productTerms.push({
            consentLabel: data.orderInfo.product.Name,
            consentText: data.orderInfo.product.disclosure,
            checked: false,
            id: data.orderInfo.product.Id
        });
        this.showDirecTVCreditCheckTab = true;
        this.currentStep = "3";
    }

    handleUpdateTreatment(e) {
        this.addCartData.shoppingContext.treatmentCode = e.detail;
    }

    handleCreditCheckPassed(e) {
        this.checkIP();
        this.updateTabOpportunity("Hardware");
        this.sfOrderId = this.sfOrderId == undefined ? e.detail.orderId : this.sfOrderId;
        this.orderItemId = this.orderItemId == undefined ? e.detail.orderItemId : this.orderItemId;
        this.paymentAttempts = e.detail.paymentAttempts;
        this.referenceNumber = e.detail.referenceNumber;
        this.showDirecTVCreditCheckTab = false;
        this.clientInfo.contactInfo.firstName = e.detail.customer.firstName;
        this.clientInfo.contactInfo.lastName = e.detail.customer.lastName;
        this.clientInfo.contactInfo.email = e.detail.customer.email;
        this.clientInfo.contactInfo.phone = e.detail.customer.phone;
        this.clientInfo.contactInfo.method = e.detail.customer.method;
        this.clientInfo.contactInfo.time = e.detail.customer.time;
        this.publicKey = e.detail.publicKey;
        this.orderInfo = { ...e.detail.orderInfo };
        this.creditCheckTerms = [...e.detail.terms];
        this.verbiages = e.detail.hasOwnProperty("verbiages") ? { ...e.detail.verbiages } : { ...this.verbiages };
        this.treatmentCode = e.detail.treatmentCode;
        this.mustPayInFull = e.detail.payInFull;
        if (this.isStream) {
            this.cartCreditCheck = { ...this.updateCartStream(e.detail.result) };
            this.orderInfo.billingAddress = JSON.parse(JSON.stringify(e.detail.orderInfo.billingAddress));
        } else {
            this.cartCreditCheck = { ...this.updateCart(e.detail.result) };
        }
        this.currentStep = "4";
        this.showDirecTVHardwareTab = true;
        this.saveSelfServiceStatistic("Hardware");
    }

    handleProductDetail(e) {
        this.checkIP();
        this.updateTabOpportunity("Offers");
        this.saveSelfServiceStatistic("Offers");
        this.showDirecTVHardwareTab = false;
        let data = JSON.parse(JSON.stringify(e.detail));
        this.offers = data.offers;
        this.protections = data.protections;
        this.cartHardware = { ...data.cartInfo };
        this.hardwareSelected = data.chosen.quantity;
        if (this.isStream) {
            this.cartHardware = this.updateCartStream(data.result);
            this.addCartData = data.addCartData;
            this.serials = [...data.serials];
            this.dealerInventory = data.dealerInventory;
            this.hardwareId = data.chosen.Id;
        } else {
            this.billingInfo = { ...data.billingInfo };
            this.baseOffers = [...data.billingInfo.cartContext.cartOffers];
            this.orderInfo.equipmentSelected = [
                ...data.hardwareSelection,
                {
                    Id: data.chosen.Id,
                    quantity: 1,
                    type: data.chosen.Id,
                    label: data.chosen.shortName,
                    terms: data.chosen.disclosure
                }
            ];
        }
        this.equipmentTerms = [];
        if (data.hasOwnProperty("chosen") && data.chosen.hasOwnProperty("terms")) {
            this.equipmentTerms.push({
                consentLabel: "Equipment Selection Agreement",
                consentText: data.chosen.terms,
                checked: false,
                id: data.chosen.Id
            });
        }
        this.showDirecTVOffersTab = true;
        this.currentStep = "5";
    }

    handleOffersNext(e) {
        this.checkIP();
        this.updateTabOpportunity("Options");
        this.saveSelfServiceStatistic("Options");
        this.showDirecTVOffersTab = false;
        this.showClosingOffers = e.detail.hasClosingOffers;
        if (this.isStream) {
            this.cartOffers = { ...this.updateCartStream(e.detail.result) };
        } else {
            this.cartOffers = { ...this.updateCart(e.detail.result) };
        }
        this.cartFinished = true;
        this.billingInfo = { ...e.detail.billingRequest };
        this.offersTerms = [...e.detail.terms];
        this.orderInfo.selectedOffers = [...e.detail.checkedOffers];
        this.terms = [];
        this.terms = [...this.creditCheckTerms, ...this.productTerms, ...this.equipmentTerms, ...this.offersTerms];
        this.currentStep = "6";
        this.showDirecTVOptionsTab = true;
    }

    handleOptionsNext(e) {
        this.checkIP();
        this.updateTabOpportunity("T&C");
        this.saveSelfServiceStatistic("T&C");
        if (this.isStream) {
            let info = JSON.parse(JSON.stringify(e.detail));
            this.orderInfo.billingAddress = info.billingAddress;
            this.orderInfo.shippingAddress = info.shippingAddress;
            this.verifiedEmail = info.verifiedEmail;
            this.showDirecTVTermsTab = true;
        }
        this.showDirecTVTermsTab = true;
        this.showDirecTVOptionsTab = false;
        this.currentStep = "7";
    }

    handleTermsNext(e) {
        this.checkIP();
        this.updateTabOpportunity("Payment");
        this.saveSelfServiceStatistic("Payment");
        this.showDirecTVTermsTab = false;
        this.showDirecTVPaymentInformation = true;
        this.currentStep = "8";
    }

    handlePaymentInformationNext(e) {
        this.checkIP();
        this.updateTabOpportunity("Order Submitted");
        this.saveSelfServiceStatistic("Order Submitted");
        this.cartPayment = e.detail.cart;
        if (this.isStream) {
            this.orderQualReq = e.detail.request;
        } else {
            this.orderInfo.paymentId = e.detail.paymentId;
        }
        this.paymentInfo = e.detail.cardInfo;
        this.showDirecTVPaymentInformation = false;
        this.showDirecTVPaymentConfirmationTab = true;
        this.currentStep = "9";
    }

    handleOrderConfirmationNext(e) {
        this.checkIP();
        this.orderNumber = e.detail.orderId;
        this.orderId = e.detail.orderNumber;
        this.showDirecTVPaymentConfirmationTab = false;
        if (this.NFFL || this.isStream) {
            this.updateTabOpportunity("Order Success");
            this.saveSelfServiceStatistic("Order Success");
            this.showDirecTVOrderSuccessTab = true;
            this.currentStep = this.isStream ? "10" : "11";
        } else {
            this.updateTabOpportunity("Installation");
            this.saveSelfServiceStatistic("Installation");
            this.showDirecTVTPVTab = true;
            this.currentStep = "10";
        }
    }

    handleTPVNext(e) {
        this.checkIP();
        this.updateTabOpportunity("Order Success");
        this.saveSelfServiceStatistic("Order Success");
        this.installationInfo = e.detail;
        this.showDirecTVTPVTab = false;
        this.showDirecTVOrderSuccessTab = true;
        this.currentStep = "11";
    }

    checkIP() {
        if (!this.isGuestUser) {
            this.dispatchEvent(new CustomEvent("checkip"));
        }
    }

    updateTabOpportunity(value) {
        let event = new CustomEvent("tabupdate", {
            detail: { tab: value }
        });
        this.dispatchEvent(event);
    }

    saveSelfServiceStatistic(tab) {
        if (!this.isGuestUser) {
            return;
        }

        const event = new CustomEvent("selfservicestatistic", {
            detail: {
                tabName: tab,
                program: "DIRECTV",
                orderId: this.sfOrderId
            }
        });

        this.dispatchEvent(event);
    }

    updateCart(result) {
        let cart = {
            orderNumber: this.orderInfo.orderNumber,
            todayCharges: [],
            hasToday: false,
            monthlyCharges: [],
            hasMonthly: false,
            monthlyTotal: 0.0,
            todayTotal: 0.0,
            firstBillTotal: (0.0).toFixed(2),
            hasFirstBill: false,
            firstBillCharges: [],
            hasSavings: false,
            savingsCharges: []
        };
        let accessories = [];
        let rebates = [];
        result.content.lineItemList.forEach((item) => {
            let lineItem = item.lineItem;

            if (lineItem?.lineItemIdentifier?.productName === ORIG_GEMINI_WIRELESS_DISPLAY_NAME) {
                lineItem.lineItemIdentifier.productName = NEW_WIRELESS_GEMINI_DISPLAY_NAME;
            }

            if (
                lineItem.lineItemType === "offer" &&
                lineItem.lineItemIdentifier.productId === "Today" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("taxLineItems")
            ) {
                lineItem.customData.taxLineItems.forEach((taxItem) => {
                    if (taxItem.value != 0) {
                        let newTaxCharge = {
                            name: taxItem.name,
                            order: 3,
                            fee: Number(taxItem.value).toFixed(2),
                            feeTerm: "Today",
                            discount: Number(taxItem.value) <= 0,
                            hasDescription: false,
                            description: "",
                            type: "tax"
                        };
                        cart.hasToday = true;
                        cart.todayCharges.push(newTaxCharge);
                    }
                });
            } else if (
                lineItem.lineItemType === "offer" &&
                lineItem.lineItemIdentifier.productId === "Recurring" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("taxLineItems")
            ) {
                lineItem.customData.taxLineItems.forEach((taxItem) => {
                    if (taxItem.value != 0) {
                        let newTaxCharge = {
                            name: taxItem.name,
                            order: 3,
                            fee: Number(taxItem.value).toFixed(2),
                            feeTerm: "Monthly",
                            discount: Number(taxItem.value) <= 0,
                            hasDescription: false,
                            description: "",
                            type: "tax"
                        };
                        cart.hasMonthly = true;
                        cart.monthlyCharges.push(newTaxCharge);
                    }
                });
            } else if (
                lineItem.lineItemType === "virtual" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "fee"
            ) {
                if (lineItem.price.subTotalAmount != 0) {
                    let newFeeCharge = {
                        name: lineItem.lineItemIdentifier.productName,
                        fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                        order: 3,
                        feeTerm:
                            lineItem.hasOwnProperty("price") &&
                            lineItem.price.hasOwnProperty("recurringPriceList") &&
                            lineItem.price.recurringPriceList.hasOwnProperty("recurringPrice") &&
                            lineItem.price.recurringPriceList.recurringPrice.frequencyOfCharge === "monthly"
                                ? "Monthly"
                                : "Today",
                        discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                        hasDescription: false,
                        description: "",
                        type: "fee"
                    };
                    if (newFeeCharge.feeTerm === "Today") {
                        cart.hasToday = true;
                        cart.todayCharges.push(newFeeCharge);
                    } else {
                        cart.hasMonthly = true;
                        cart.monthlyCharges.push(newFeeCharge);
                    }
                }
            } else if (
                lineItem.lineItemType === "programming" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "fee"
            ) {
                if (lineItem.price.subTotalAmount != 0 && lineItem.isVisible) {
                    let newFeeCharge = {
                        name: lineItem.lineItemIdentifier.productName,
                        fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                        feeTerm: "Monthly",
                        order: 3,
                        discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                        hasDescription: false,
                        description: "",
                        type: "fee"
                    };
                    cart.hasMonthly = true;
                    cart.monthlyCharges.push(newFeeCharge);
                }
            } else if (
                lineItem.lineItemType === "programming" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "video-plan"
            ) {
                let newProductCharge = {
                    name: lineItem.lineItemIdentifier.productName,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    order: 1,
                    feeTerm: "Monthly",
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "fee"
                };
                cart.hasMonthly = true;
                cart.monthlyCharges.push(newProductCharge);
            } else if (
                lineItem.lineItemType === "programming" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "video-addon"
            ) {
                let newAddonCharge = {
                    name: lineItem.lineItemIdentifier.productName,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    order: 5,
                    feeTerm:
                        lineItem.price.recurringPriceList.recurringPrice.frequencyOfCharge === "monthly"
                            ? "Monthly"
                            : "Single",
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "fee"
                };
                if (newAddonCharge.feeTerm === "Monthly") {
                    cart.hasMonthly = true;
                    cart.monthlyCharges.push(newAddonCharge);
                } else {
                    cart.hasFirstBill = true;
                    cart.firstBillCharges.push(newAddonCharge);
                }
            } else if (
                lineItem.lineItemType === "programming" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "insurance"
            ) {
                let newInsuranceCharge = {
                    name: lineItem.lineItemIdentifier.productName,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    order: 6,
                    feeTerm:
                        lineItem.price.recurringPriceList.recurringPrice.frequencyOfCharge === "monthly"
                            ? "Monthly"
                            : "Single",
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "fee"
                };
                if (newInsuranceCharge.feeTerm === "Monthly") {
                    cart.hasMonthly = true;
                    cart.monthlyCharges.push(newInsuranceCharge);
                } else {
                    cart.hasFirstBill = true;
                    cart.firstBillCharges.push(newInsuranceCharge);
                }
            } else if (
                lineItem.lineItemType === "receiver" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "video-device"
            ) {
                let newProductCharge = {
                    name: lineItem.lineItemIdentifier.productName,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    order: 2,
                    feeTerm: "Today",
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "fee"
                };
                cart.hasToday = true;
                cart.todayCharges.push(newProductCharge);
            } else if (
                lineItem.lineItemType === "accessory" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "video-device"
            ) {
                let newProductCharge = {
                    name: lineItem.lineItemIdentifier.productName,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    feeTerm: "Monthly",
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "fee"
                };
                accessories.push(newProductCharge);
            } else if (
                lineItem.lineItemType === "agreement" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "agreement"
            ) {
                let newProductCharge = {
                    name:
                        lineItem.lineItemIdentifier.productName !== "DTV_$10_off_AP_PB_Lifetime_DS2361"
                            ? lineItem.lineItemIdentifier.productName
                            : lineItem.lineItemIdentifier.productDescription,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    order: 3,
                    feeTerm: "Monthly",
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription:
                        lineItem.lineItemIdentifier.productName !== "DTV_$10_off_AP_PB_Lifetime_DS2361" &&
                        lineItem.lineItemIdentifier.hasOwnProperty("productDescription") &&
                        lineItem.lineItemIdentifier.productName !== lineItem.lineItemIdentifier.productDescription,
                    description: lineItem.lineItemIdentifier.hasOwnProperty("productDescription")
                        ? lineItem.lineItemIdentifier.productDescription
                        : "",
                    type: "fee"
                };
                cart.hasMonthly = true;
                cart.monthlyCharges.push(newProductCharge);
            } else if (
                lineItem.lineItemType === "virtual" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "equipment-rebate"
            ) {
                let newProductCharge = {
                    name: lineItem.lineItemIdentifier.productName,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    feeTerm: "Today",
                    order: 3,
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "fee"
                };
                rebates.push(newProductCharge);
            }
        });
        if (rebates.length > 0) {
            const fee = rebates.reduce((accumulator, item) => accumulator + Number(item.fee), 0);
            let newProductCharge = {
                name: "Equipment Selection Instant Rebate",
                fee: Number(fee).toFixed(2),
                feeTerm: "Today",
                order: 3,
                discount: Number(fee) > 0.0 ? false : true,
                hasDescription: false,
                description: "",
                type: "fee"
            };
            cart.hasToday = true;
            cart.todayCharges.push(newProductCharge);
        }
        if (accessories.length > 0) {
            let accessoryNames = [];
            accessories.forEach((item) => {
                if (!accessoryNames.includes(item.name)) {
                    let filteredArray = [...accessories.filter((e) => e.name === item.name)];
                    let fee = filteredArray.reduce((accumulator, item) => accumulator + Number(item.fee), 0);
                    let newProductCharge = {
                        name: `${filteredArray.length} ${item.name}`,
                        fee: Number(fee).toFixed(2),
                        feeTerm: "Today",
                        order: 2,
                        discount: Number(fee) > 0.0 ? false : true,
                        hasDescription: false,
                        description: "",
                        type: "fee"
                    };
                    cart.hasToday = true;
                    cart.todayCharges.push(newProductCharge);
                    accessoryNames.push(item.name);
                }
            });
        }
        cart.monthlyCharges.forEach((charge) => {
            cart.monthlyTotal = Number(cart.monthlyTotal) + Number(charge.fee);
        });
        cart.monthlyTotal = Number(cart.monthlyTotal).toFixed(2);
        cart.todayCharges.forEach((charge) => {
            cart.todayTotal = Number(cart.todayTotal) + Number(charge.fee);
        });
        cart.todayTotal = Number(cart.todayTotal).toFixed(2);
        cart.firstBillCharges.forEach((charge) => {
            cart.firstBillTotal = Number(cart.firstBillTotal) + Number(charge.fee);
        });
        cart.firstBillTotal = Number(cart.firstBillTotal).toFixed(2);
        cart.monthlyCharges.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
        cart.todayCharges.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
        cart.firstBillCharges.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
        return cart;
    }

    updateCartStream(result) {
        let cart = {
            orderNumber: this.orderInfo.orderNumber,
            todayCharges: [],
            hasToday: false,
            monthlyCharges: [],
            hasMonthly: false,
            monthlyTotal: 0.0,
            todayTotal: 0.0,
            firstBillTotal: (0.0).toFixed(2),
            hasFirstBill: false,
            firstBillCharges: [],
            hasSavings: false,
            savingsCharges: []
        };
        let cartData = result.content.payload.dtvnowCart;
        let charges = Object.values(Object.values(cartData.losgs)[0].lineItems);
        let taxes = cartData.taxBreakup !== undefined ? cartData.taxBreakup : [];
        if (charges.length > 0) {
            charges.forEach((charge) => {
                let newCharge = {
                    name:
                        charge.itemType.toLowerCase() === "equipment"
                            ? `${charge.quantity} ${charge.displayName}`
                            : charge.displayName,
                    fee:
                        charge.itemType.toLowerCase() === "base"
                            ? Number(charge.price.baseAmount).toFixed(2)
                            : Number(charge.price.total).toFixed(2),
                    order: 3,
                    feeTerm:
                        charge.price.priceType.toLowerCase() === "rc" || charge.itemType.toLowerCase() === "equipment"
                            ? "Monthly"
                            : "Today",
                    discount: Number(charge.price.total) > 0.0 ? false : true,
                    hasDescription: charge.hasOwnProperty("description") && charge.description !== charge.displayName,
                    description:
                        charge.hasOwnProperty("description") && charge.description !== charge.displayName
                            ? charge.description
                            : "",
                    type: "charge"
                };
                if (newCharge.feeTerm === "Monthly") {
                    cart.hasMonthly = true;
                    cart.monthlyCharges.push(newCharge);
                } else {
                    cart.hasToday = true;
                    cart.todayCharges.push(newCharge);
                }
            });
        }
        if (taxes.length > 0) {
            taxes.forEach((tax) => {
                let newTax = {
                    name: tax.taxDescription,
                    fee: Number(tax.taxAmount).toFixed(2),
                    order: 3,
                    feeTerm: "Today",
                    discount: false,
                    hasDescription: false,
                    description: "",
                    type: "tax"
                };
                cart.hasToday = true;
                cart.todayCharges.push(newTax);
            });
        }
        if (cartData.promotions.length > 0) {
            cartData.promotions.forEach((promo) => {
                if (
                    Number(promo.amount) > 0 &&
                    ((promo.promotionId === "388245" && this.showClosingOffers) || promo.promotionId !== "388245")
                ) {
                    let newCharge = {
                        name: promo.displayName,
                        fee: Number(Number(promo.amount) * -1).toFixed(2),
                        order: 3,
                        feeTerm: promo.promotionCycle.toLowerCase() === "monthly" ? "Monthly" : "Today",
                        discount: true,
                        hasDescription: false,
                        description: "",
                        type: "promo"
                    };
                    if (newCharge.feeTerm === "Monthly") {
                        cart.hasMonthly = true;
                        cart.monthlyCharges.push(newCharge);
                    } else {
                        cart.hasToday = true;
                        cart.todayCharges.push(newCharge);
                    }
                }
            });
        }
        if (cartData.hasOwnProperty("trialPromo") && Number(cartData.trialPromo.amount) > 0) {
            let newCharge = {
                name: cartData.trialPromo.displayName,
                fee: Number(Number(cartData.trialPromo.amount) * -1).toFixed(2),
                order: 3,
                feeTerm: cartData.trialPromo.promotionCycle.toLowerCase() === "monthly" ? "Monthly" : "Today",
                discount: true,
                hasDescription: false,
                description: "",
                type: "promo"
            };
            if (newCharge.feeTerm === "Monthly") {
                cart.hasMonthly = true;
                cart.monthlyCharges.push(newCharge);
            } else {
                cart.hasToday = true;
                cart.todayCharges.push(newCharge);
            }
        }
        cart.monthlyCharges.forEach((charge) => {
            cart.monthlyTotal = Number(cart.monthlyTotal) + Number(charge.fee);
        });
        cart.monthlyTotal = Number(cart.monthlyTotal).toFixed(2);
        cart.todayCharges.forEach((charge) => {
            cart.todayTotal = Number(cart.todayTotal) + Number(charge.fee);
        });
        cart.todayTotal = Number(cart.todayTotal).toFixed(2);
        cart.firstBillCharges.forEach((charge) => {
            cart.firstBillTotal = Number(cart.firstBillTotal) + Number(charge.fee);
        });
        cart.firstBillTotal = Number(cart.firstBillTotal).toFixed(2);
        return cart;
    }

    handleRemoveProduct() {
        this.checkIP();
        this.orderInfo = { ...this.serviceabilityInfo };
        this.showDirecTVCreditCheckTab = false;
        this.showDirecTVProductsTab = true;
        this.currentStep = "2";
        this.saveSelfServiceStatistic("Products");
    }

    handleLogError(event) {
        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: {
                    ...event.detail,
                    provider: "DIRECTV",
                    opportunity: this.recordId,
                    providerSubtype: this.isStream ? "Stream" : "Beam"
                }
            })
        );
    }

    handleHome() {
        const goBackEvent = new CustomEvent("home", {
            detail: ""
        });
        this.dispatchEvent(goBackEvent);
    }

    handleFSLDatesModal() {
        fslDatesModal
            .open({
                zipCode: this.zipCode,
                workType: this.defaultWorkTypeId,
                workTypeName: this.defaultWorkTypeName,
                onlogerror: (e) => this.handleLogError(e)
            })
            .then((result) => {
                if (result) {
                    this.isFSL = true;
                    this.fslDealerCode = this.defaultFSLDealerCode;
                    this.fslWorkOrderId = result.fslWorkOrderId;
                    this.fslServiceAppointmentId = result.fslServiceAppointmentId;
                }

                this.showInfoTab();
            });
    }
}