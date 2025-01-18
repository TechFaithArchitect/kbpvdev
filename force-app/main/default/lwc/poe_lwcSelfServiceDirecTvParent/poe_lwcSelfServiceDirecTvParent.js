import { LightningElement, api } from "lwc";
import ENGA_GEMINI_WIRELESS_LABEL_PAIR from "@salesforce/label/c.Enga_Gemini_Wireless_Label_Pair";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";
import chuzo_modalChangeAddress from "c/chuzo_modalChangeAddress";
import chuzo_modalOneTimeNonRefoundable from "c/chuzo_modalOneTimeNonRefoundable";
import chuzo_modalVerifyCredit from "c/chuzo_modalVerifyCredit";
import chuzo_modalAutoPayTerm from "c/chuzo_modalAutoPayTerm";
import chuzo_modalTermsConditions from "c/chuzo_modalTermsConditions";
import chuzo_modalGeneric from "c/chuzo_modalGeneric";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import DO_FEE_PRODUCT_ID from "@salesforce/label/c.POE_DO_Fee_Product_Id";

const ORIG_GEMINI_WIRELESS_DISPLAY_NAME = ENGA_GEMINI_WIRELESS_LABEL_PAIR.split(";")[0];
const NEW_WIRELESS_GEMINI_DISPLAY_NAME = ENGA_GEMINI_WIRELESS_LABEL_PAIR.split(";")[1];

export default class Poe_lwcSelfServiceDirecTvParent extends LightningElement {
    @api recordId;
    @api origin;
    @api userId;
    @api contact;
    @api returnUrl;
    @api codeFFL;
    @api codeNFFL;
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
    billingInfoOffers = {};
    billingInfoHardware = {};
    verifiedEmail;
    cartFinished = false;
    offers;
    hardware;
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
    addCartDataOffers = {};
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
    productResponse = {};
    productFilters = {};
    view;
    providerStyle = "directv";
    beamCartRequest = {};
    showCart = false;
    showCollateral = false;
    tempCart; // Temporal cart with changes for the current tab.
    currentStep = 0;
    currentTabName;
    showMobileCart = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get installationPresent() {
        return !this.isStream && !this.NFFL;
    }

    get displayStep() {
        if (this.currentStep === this.totalSteps) {
            return this.currentStep;
        }

        return this.currentStep + 1;
    }

    get totalSteps() {
        if (this.isNotGuestUser) {
            return this.installationPresent ? 6 : 5;
        } else {
            return this.installationPresent ? 5 : 4;
        }
    }

    get cartItemsCount() {
        const cart = this.currentCart;

        let itemsCount = 0;
        itemsCount += cart?.todayCharges?.length || 0;
        itemsCount += cart?.monthlyCharges?.length || 0;
        itemsCount += cart?.firstBillCharges?.length || 0;

        return itemsCount;
    }

    get pageClass() {
        return `${this.showCart && !this.showCollateral ? "has-panel-right" : ""} page pages-nav`;
    }

    get currentCart() {
        if (this.tempCart) {
            return this.tempCart;
        }

        if (
            this.isViewServiceProviderPlanTwo ||
            this.isViewServiceProviderPlanThree ||
            this.isViewServiceProviderPlanFour
        ) {
            return this.cartInfo;
        } else if (this.isViewServiceProviderPlanFive) {
            return this.cartOffers;
        } else if (this.isViewServiceProviderPlanSix || this.isViewServiceProviderPlanSeven) {
            return this.cartHardware;
        } else if (this.isViewServiceProviderPlanEight || this.isViewServiceProviderPlanNine) {
            return this.cartCreditCheck;
        } else if (this.isViewServiceProviderPlanTen || this.isViewServiceProviderPlanEleven) {
            return this.cartPayment;
        }
    }

    checkIP() {
        if (!this.isGuestUser) {
            this.dispatchEvent(new CustomEvent("checkip"));
        }
    }

    handleCancel() {
        if (this.isGuestUser) {
            chuzo_modalGeneric
                .open({
                    content: {
                        title: selfServiceValidateLeavingTitle,
                        provider: "directv",
                        body: `<div class="slds-text-align_center slds-m-top_small">${selfServiceValidateLeavingMessage}</div>`,
                        agreeLabel: "Confirm",
                        canClose: true
                    }
                })
                .then((result) => {
                    if (!result?.agreed) {
                        return;
                    }

                    this.handleHome();
                });
        } else {
            this.handleHome();
        }
    }

    handleHome() {
        if (this.isGuestUser) {
            const goBackEvent = new CustomEvent("home", {
                detail: ""
            });
            this.dispatchEvent(goBackEvent);
        } else if (this.returnUrl !== undefined) {
            window.open(this.returnUrl, "_self");
        } else {
            switch (this.origin) {
                case "phonesales":
                    this[NavigationMixin.Navigate]({
                        type: "comm__namedPage",
                        attributes: {
                            name: "Clicker_Call_Center__c"
                        }
                    });
                    break;
                case "retail":
                    this[NavigationMixin.Navigate]({
                        type: "comm__namedPage",
                        attributes: {
                            name: "retail_clicker__c"
                        }
                    });
                    break;
                case "event":
                    this[NavigationMixin.Navigate]({
                        type: "comm__namedPage",
                        attributes: {
                            name: "Clicker_Event__c"
                        }
                    });
                    break;
                case "maps":
                    this[NavigationMixin.Navigate]({
                        type: "comm__namedPage",
                        attributes: {
                            name: "Door_to_door__c"
                        }
                    });
                    break;
            }
        }
    }

    isView(viewName) {
        return this.view === viewName;
    }

    get headerMode() {
        let mode = this.view == "home" ? "home buyflow-header" : "pages buyflow-header";
        if (this.showMobileCart) {
            mode = `${mode} has-open-cart`;
        }

        return mode;
    }

    get stepInformation() {
        return !(this.view == "home" || this.view == "services");
    }

    changeStyleToProvider(style) {
        this.providerStyle = style;
    }

    get isViewServiceProviderPlanOne() {
        return this.isView("services_provider_plan_one");
    }

    get isViewInfoTab() {
        return this.isView("info_tab");
    }

    changeViewToServiceDirecTVPlanOne() {
        this.changeView("services_provider_plan_one");
        this.changeStyleToProvider("directv");
    }

    goOrderNow() {
        this.changeViewToServiceDirecTVPlanOne();
    }

    get isViewServiceProviderPlanTwo() {
        return this.isView("services_provider_plan_two");
    }

    get isViewServiceProviderPlanThree() {
        return this.isView("services_provider_plan_three");
    }

    get isViewServiceProviderPlanFour() {
        return this.isView("services_provider_plan_four");
    }

    get isViewServiceProviderPlanFive() {
        return this.isView("services_provider_plan_five");
    }

    changeViewToServiceDirecTVPlanFive() {
        this.changeView("services_provider_plan_five");
        this.changeStyleToProvider("directv");
    }

    get isViewServiceProviderPlanSix() {
        return this.isView("services_provider_plan_six");
    }

    changeViewToServiceDirecTVPlanSix() {
        this.changeView("services_provider_plan_six");
        this.changeStyleToProvider("directv");
    }

    get isViewServiceProviderPlanSeven() {
        return this.isView("services_provider_plan_seven");
    }

    changeViewToServiceDirecTVPlanSeven() {
        this.changeView("services_provider_plan_seven");
        this.changeStyleToProvider("directv");
    }

    get isViewServiceProviderPlanEight() {
        return this.isView("services_provider_plan_eight");
    }

    changeViewToServiceDirecTVPlanEight() {
        this.changeView("services_provider_plan_eight");
        this.changeStyleToProvider("directv");
    }

    get isViewServiceProviderPlanNine() {
        return this.isView("services_provider_plan_nine");
    }

    changeViewToServiceDirecTVPlanNine() {
        this.changeView("services_provider_plan_nine");
        this.changeStyleToProvider("directv");
    }

    get isViewServiceProviderPlanTen() {
        return this.isView("services_provider_plan_ten");
    }

    changeViewToServiceDirecTVPlanTen() {
        this.changeView("services_provider_plan_ten");
        this.changeStyleToProvider("directv");
    }

    get isViewServiceProviderPlanEleven() {
        return this.isView("services_provider_plan_eleven");
    }

    changeViewToServiceDirecTVPlanEleven() {
        this.changeView("services_provider_plan_eleven");
        this.changeStyleToProvider("directv");
    }

    get isViewServiceProviderPlanTwelve() {
        return this.isView("services_provider_plan_twelve");
    }

    changeViewToServiceDirecTVPlanTwelve() {
        this.changeView("services_provider_plan_twelve");
        this.changeStyleToProvider("directv");
    }

    get isViewServiceProviderPlanThirteen() {
        return this.isView("services_provider_plan_thirteen");
    }

    get isViewServiceProviderPlanFourteen() {
        return this.isView("services_provider_plan_fourteen");
    }

    showModalInfoAddress() {
        chuzo_modalChangeAddress.open().then((result) => {
            if (result == "okay") this.changeViewToServiceDirecTVPlanEleven();
        });
    }

    showModalOneTimeNonRefoundable() {
        chuzo_modalOneTimeNonRefoundable.open().then((result) => {
            if (result == "okay") this.showModalVerifyCredit();
        });
    }

    showModalVerifyCredit() {
        chuzo_modalVerifyCredit.open().then((result) => {
            if (result == "okay") this.changeViewToServiceDirecTVPlanTwelve();
        });
    }

    showModalAutoPayTerms() {
        chuzo_modalAutoPayTerm.open().then((result) => {
            if (result == "okay") this.changeViewToServiceDirecTVPlanTen();
        });
    }

    showModalTermsConditions(event) {
        chuzo_modalTermsConditions
            .open({
                content: {
                    origin: this.origin,
                    productTerms: this.terms,
                    verbiages: this.verbiages,
                    orderInfo: this.orderInfo,
                    label: "Terms, Conditions and/or Disclosures",
                    isNotGuestUser: !this.isGuestUser,
                    stream: this.isStream,
                    clientInfo: this.clientInfo,
                    recordId: this.recordId,
                    currentIp: this.currentIp
                }
            })
            .then((result) => {
                if (result !== "cancel") {
                    this.updateTabOpportunity("Payment");
                    this.saveSelfServiceStatistic("Payment");
                    this.changeView("services_provider_plan_nine");
                    this.changeStyleToProvider("directv");
                }
            });
    }

    get optionsEmailOrSms() {
        return [
            { label: "Email", value: "option1" },
            { label: "SMS", value: "option2" }
        ];
    }

    get optionsVerifyMethodSSNOrDriver() {
        return [
            { label: "SSN", value: "option1" },
            { label: "Driver’s Licence Number", value: "option2" }
        ];
    }

    get optionsStates() {
        return [
            { label: "Select your state", value: "" },
            { label: "Arkansas", value: "1" }
        ];
    }

    changeValInputToSum(event) {
        if (this[event.currentTarget.dataset.id] != undefined && this[event.currentTarget.dataset.id] < 99) {
            this[event.currentTarget.dataset.id]++;
        } else {
            this[event.currentTarget.dataset.id] = 0;
        }
    }

    changeValInputToMin(event) {
        if (this[event.currentTarget.dataset.id] != undefined && this[event.currentTarget.dataset.id] > 0) {
            this[event.currentTarget.dataset.id]--;
        } else {
            this[event.currentTarget.dataset.id] = 0;
        }
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        this.currentTabName = this.isNotGuestUser ? "Service information" : "Plan customization";
        this.changeView(this.isGuestUser ? "services_provider_plan_one" : "info_tab");
        this.showInfoTab();
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

    get logoHeader() {
        return (
            chuzoSiteResources +
            "/images/" +
            (this.view == "home"
                ? "logo.png"
                : this.providerStyle == ""
                ? "logo-pages.png"
                : "logo-" + this.providerStyle + ".svg")
        );
    }

    get homeImage() {
        return chuzoSiteResources + "/images/home-image.jpg";
    }

    get logoDirectv() {
        return chuzoSiteResources + "/images/directv.svg";
    }

    get logoEarthlink() {
        return chuzoSiteResources + "/images/earthlink.svg";
    }

    get logoSpectrum() {
        return chuzoSiteResources + "/images/spectrum.svg";
    }

    get logoKinetic() {
        return chuzoSiteResources + "/images/kinetic.svg";
    }

    get logoViasat() {
        return chuzoSiteResources + "/images/viasat.svg";
    }

    get iconInformation() {
        return chuzoSiteResources + "/images/icon-information.svg";
    }

    get providerLogoDirectv() {
        return chuzoSiteResources + "/images/provider-logo-directv.svg";
    }

    get providerLogoEarthlink() {
        return chuzoSiteResources + "/images/provider-logo-earthlink.svg";
    }

    get providerLogoFrontier() {
        return chuzoSiteResources + "/images/provider-logo-frontier.svg";
    }

    get iconLogoMax() {
        return chuzoSiteResources + "/images/icon-logo-max.svg";
    }

    get iconLogoMlb() {
        return chuzoSiteResources + "/images/icon-logo-mlb.svg";
    }

    get iconLogoTvGlobo() {
        return chuzoSiteResources + "/images/icon-logo-tv-globo.svg";
    }

    get iconProviderLogoDirectv() {
        return chuzoSiteResources + "/images/provider-logo-directv.svg";
    }

    get iconArrowDown() {
        return chuzoSiteResources + "/images/icon-arrow-down.svg";
    }

    get iconArrowDownBlue() {
        return chuzoSiteResources + "/images/icon-arrow-down-blue.svg";
    }

    get iconExistConnection() {
        return chuzoSiteResources + "/images/icon-exist-connection.svg";
    }

    get iconConnectionSatellite() {
        return chuzoSiteResources + "/images/icon-connection-satellite.svg";
    }

    get iconCheckOrange() {
        return chuzoSiteResources + "/images/icon-check-orange.svg";
    }

    get iconNumberTV() {
        return chuzoSiteResources + "/images/icon-number-tv.svg";
    }

    get iconDeviceWire() {
        return chuzoSiteResources + "/images/icon-device-1.svg";
    }

    get iconFormPassword() {
        return chuzoSiteResources + "/images/icon-security.svg";
    }

    get iconFormUser() {
        return chuzoSiteResources + "/images/icon-user-profile.svg";
    }

    get iconFormCreditCard() {
        return chuzoSiteResources + "/images/icon-creditcard.svg";
    }

    get iconFormCreditCardCheck() {
        return chuzoSiteResources + "/images/icon-creditcard-check.svg";
    }

    get iconCheckGreen() {
        return chuzoSiteResources + "/images/icon-check.svg";
    }

    get iconCart() {
        return chuzoSiteResources + "/images/icon-cart.svg";
    }

    toggleCart() {
        this.showMobileCart = !this.showMobileCart;
        const rightPanel = this.template.querySelector(".panel-right");
        const cartIcon = this.template.querySelector(".cart-right-float");

        if (rightPanel && cartIcon) {
            rightPanel.classList.toggle("open-cart-panel-right");
            cartIcon.classList.toggle("has-open-cart-panel-right");
        }
    }

    updatePath(id, width) {
        const path = this.template.querySelector(`[data-id="${id}"]`);
        path.style.width = `${width}%`;

        const mobilePath = this.template.querySelector(`[data-id="mobile-stepper"]`);
        const mobileWidth = (this.currentStep * 100) / this.totalSteps;
        mobilePath.style.width = `${mobileWidth}%`;
    }

    handleCheckServiceability(e) {
        this.checkIP();
        this.updateTabOpportunity("Products");
        this.saveSelfServiceStatistic("Products");
        this.orderInfo = { ...e.detail };
        this.serviceabilityInfo = { ...e.detail };
        this.NFFL = e.detail.NFFL;
        this.probation = { ...e.detail.probation };
        e.detail.hasOwnProperty("multiAddress") ? (this.suggestedAddressSelected = e.detail.multiAddress) : undefined;
        this.currentStep = this.isNotGuestUser ? 1 : 0;
        this.currentTabName = "Plan customization";
        if (this.isNotGuestUser) {
            this.updatePath("service-item", 100);
            setTimeout(() => this.updatePath("customizations-item", 16), 350);
            this.clientInfo.contactInfo.firstName = e.detail.orderInfo.customer.firstName;
            this.clientInfo.contactInfo.middleName =
                e.detail.orderInfo.customer.middleName !== null && e.detail.orderInfo.customer.middleName !== undefined
                    ? e.detail.orderInfo.customer.middleName
                    : "";
            this.clientInfo.contactInfo.lastName = e.detail.orderInfo.customer.lastName;
            this.clientInfo.contactInfo.email = e.detail.orderInfo.customer.emailAddress;
            this.clientInfo.contactInfo.phone = e.detail.orderInfo.customer.phoneNumber;
            this.accountId = e.detail.accountId;
            this.changeViewToServiceDirecTVPlanOne();
        }
    }

    changeViewToServiceDirecTVPlanTwo(event) {
        this.isStream = event.detail.stream;
        this.orderInfo = { ...event.detail.orderInfo };
        let pathWidth = this.isStream ? 50 : 33;
        this.updatePath("customizations-item", pathWidth);
        this.changeView(this.isStream ? "services_provider_plan_three" : "services_provider_plan_two");
        this.productResponse = { ...event.detail };
        this.changeStyleToProvider("directv");
    }

    handleFiltersSelection(event) {
        this.productFilters = { ...event.detail };
        this.changeView("services_provider_plan_three");
        this.updatePath("customizations-item", 50);
        this.changeStyleToProvider("directv");
    }

    handleProductSelection(e) {
        this.checkIP();
        this.updateTabOpportunity("Customer Information");
        this.saveSelfServiceStatistic("Customer Information");
        let data = e.detail;
        this.orderInfo = { ...data.orderInfo };
        this.closingOffers = [...data.closingOffers];
        this.offers = data.offers;
        this.protections = data.protections;
        this.hardware = data.hardware;
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
                offerActionType: ["Acquisition"]
            };
        }
        this.productTerms = [];
        this.productTerms.push({
            consentLabel: data.orderInfo.product.Name,
            consentText: data.orderInfo.product.disclosure,
            checked: false,
            id: data.orderInfo.product.Id
        });
        this.updatePath("customizations-item", 66);
        this.changeView("services_provider_plan_four");
        this.showCart = true;
        this.changeStyleToProvider("directv");
    }

    handleOffersNext(e) {
        this.checkIP();
        this.updateTabOpportunity("Hardware");
        this.saveSelfServiceStatistic("Hardware");
        this.showClosingOffers = e.detail.hasClosingOffers;
        if (this.isStream) {
            this.cartOffers = { ...this.updateCartStream(e.detail.result) };
            this.addCartDataOffers = e.detail.addCartData;
        } else {
            this.beamCartRequest = e.detail.beamCartRequest;
            this.cartOffers = { ...this.updateCart(e.detail.result) };
        }
        this.billingInfoOffers = { ...e.detail.billingRequest };
        this.offersTerms = [...e.detail.terms];
        this.orderInfo.selectedOffers = [...e.detail.checkedOffers];
        this.updatePath("customizations-item", 83);
        this.changeView("services_provider_plan_five");
        this.changeStyleToProvider("directv");
    }

    handleProductDetail(e) {
        this.checkIP();
        this.updateTabOpportunity("Offers");
        this.saveSelfServiceStatistic("Offers");
        let data = JSON.parse(JSON.stringify(e.detail));
        this.cartHardware = { ...data.cartInfo };
        this.hardwareSelected = data.chosen.quantity;
        this.hardwareSelectedName = this.isStream ? data.chosen.quantity : data.chosen.shortName;
        if (this.isStream) {
            this.cartHardware = this.updateCartStream(data.result);
            this.addCartData = data.addCartData;
            this.serials = [...data.serials];
            this.dealerInventory = data.dealerInventory;
            this.hardwareId = data.chosen.Id;
        } else {
            this.billingInfoHardware = { ...data.billingInfo };
        }
        this.equipmentTerms = [];
        if (data.hasOwnProperty("chosen") && data.chosen.hasOwnProperty("disclosure")) {
            this.equipmentTerms.push({
                consentLabel: "Equipment Selection Agreement",
                consentText: data.chosen.disclosure,
                checked: false,
                id: data.chosen.Id
            });
        }
        this.currentStep = this.isNotGuestUser ? 2 : 1;
        this.currentTabName = "Personal information";
        this.updatePath("customizations-item", 100);
        setTimeout(() => this.updatePath("personal-item", 25), 350);
        this.changeView("services_provider_plan_six");
        this.changeStyleToProvider("directv");
    }

    handleCreditCheckOneNext(e) {
        this.clientInfo.contactInfo.firstName = e.detail.customer.firstName;
        this.clientInfo.contactInfo.lastName = e.detail.customer.lastName;
        this.clientInfo.contactInfo.email = e.detail.customer.email;
        this.clientInfo.contactInfo.phone = e.detail.customer.phone;
        this.clientInfo.contactInfo.method = e.detail.customer.method;
        this.clientInfo.contactInfo.time = e.detail.customer.time;
        this.orderInfo.customer = e.detail.customer;

        if (this.isGuestUser) {
            this.accountId = e.detail.accountId;
        }
        this.creditCheckTerms = [...e.detail.terms];
        this.verbiages = e.detail.hasOwnProperty("verbiages") ? { ...e.detail.verbiages } : { ...this.verbiages };
        this.terms = [];
        this.terms = [...this.creditCheckTerms, ...this.productTerms, ...this.equipmentTerms, ...this.offersTerms];
        this.updatePath("personal-item", 50);
        this.changeView("services_provider_plan_seven");
        this.changeStyleToProvider("directv");
    }

    handleGoToProducts(e) {
        this.showCart = false;
        this.currentStep = this.isNotGuestUser ? 1 : 0;
        this.currentTabName = "Plan customization";
        this.updatePath("personal-item", 0);
        setTimeout(() => this.updatePath("customizations-item", 16), 350);
        this.changeView("services_provider_plan_one");
        this.saveSelfServiceStatistic("Products");
    }

    handleCreditCheckTwoNext(e) {
        this.checkIP();
        this.updateTabOpportunity("Options");
        this.saveSelfServiceStatistic("Options");
        this.sfOrderId = this.sfOrderId == undefined ? e.detail.orderId : this.sfOrderId;
        this.orderItemId = this.orderItemId == undefined ? e.detail.orderItemId : this.orderItemId;
        this.paymentAttempts = e.detail.paymentAttempts;
        this.referenceNumber = e.detail.referenceNumber;
        this.publicKey = e.detail.publicKey;
        this.orderInfo = { ...e.detail.orderInfo };
        this.treatmentCode = e.detail.treatmentCode;
        this.mustPayInFull = e.detail.payInFull;
        if (this.isStream) {
            this.cartCreditCheck = { ...this.updateCartStream(e.detail.result) };
            this.orderInfo.billingAddress = JSON.parse(JSON.stringify(e.detail.orderInfo.billingAddress));
        } else {
            this.cartCreditCheck = { ...this.updateCart(e.detail.result) };
        }
        this.updatePath("personal-item", 75);
        this.changeView("services_provider_plan_eight");
        this.changeStyleToProvider("directv");
    }

    handleOptionsNext(e) {
        this.checkIP();
        this.updateTabOpportunity("T&C");
        this.saveSelfServiceStatistic("T&C");
        if (this.isStream) {
            let info = JSON.parse(JSON.stringify(e.detail));
            this.orderInfo.shippingAddress = info.shippingAddress;
            this.verifiedEmail = info.verifiedEmail;
        }
        this.currentStep = this.isNotGuestUser ? 3 : 2;
        this.currentTabName = "Payment";
        this.updatePath("personal-item", 100);
        setTimeout(() => this.updatePath("payment-item", 50), 350);
        this.showModalTermsConditions();
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

        this.showCart = false;
        this.currentStep = this.isNotGuestUser ? 4 : 3;
        this.currentTabName = "Confirmation";
        this.updatePath("payment-item", 100);
        setTimeout(() => this.updatePath("confirmation-item", 50), 350);
        this.changeView("services_provider_plan_ten");
        this.changeStyleToProvider("directv");
    }

    handleOrderConfirmationNext(e) {
        this.checkIP();
        this.orderNumber = e.detail.orderId;
        this.orderId = e.detail.orderNumber;
        this.changeStyleToProvider("directv");
        this.updatePath("confirmation-item", 100);
        if (this.NFFL || this.isStream) {
            this.currentStep = this.totalSteps;
            this.currentTabName = "Order completed";
            this.changeView("services_provider_plan_twelve");
            this.updateTabOpportunity("Order Success");
            this.saveSelfServiceStatistic("Order Success");
        } else {
            this.showCart = true;
            this.currentStep = this.isNotGuestUser ? 5 : 4;
            this.currentTabName = "Installation";
            setTimeout(() => this.updatePath("installation-item", 50), 350);
            this.changeView("services_provider_plan_eleven");
            this.updateTabOpportunity("Installation");
            this.saveSelfServiceStatistic("Installation");
        }
    }

    handleTPVNext(e) {
        this.checkIP();
        this.showCart = false;
        this.currentStep = this.totalSteps;
        this.currentTabName = "Order completed";
        this.updateTabOpportunity("Order Success");
        this.saveSelfServiceStatistic("Order Success");
        this.changeStyleToProvider("directv");
        this.updatePath("installation-item", 100);
        this.installationInfo = e.detail;
        this.changeView("services_provider_plan_twelve");
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

    handleBack(e) {
        switch (this.view) {
            case "services_provider_plan_one":
                this.currentStep = 0;
                this.currentTabName = "Service Information";
                this.updatePath("customizations-item", 0);
                setTimeout(() => this.updatePath("service-item", 50), 350);
                this.changeView("info_tab");
                this.saveSelfServiceStatistic("Info");
                break;
            case "services_provider_plan_two":
                this.currentStep = this.isNotGuestUser ? 1 : 0;
                this.currentTabName = "Plan customization";
                this.updatePath("customizations-item", 16);
                this.changeView("services_provider_plan_one");
                this.saveSelfServiceStatistic("Products");
                break;
            case "services_provider_plan_three":
                let pathWidth = this.isStream ? 16 : 33;
                this.currentStep = this.isNotGuestUser ? 1 : 0;
                this.currentTabName = "Plan customization";
                this.updatePath("customizations-item", pathWidth);
                this.changeView(this.isStream ? "services_provider_plan_one" : "services_provider_plan_two");
                this.saveSelfServiceStatistic("Products");
                break;
            case "services_provider_plan_four":
                this.currentStep = this.isNotGuestUser ? 1 : 0;
                this.currentTabName = "Plan customization";
                this.updatePath("customizations-item", 50);
                this.showCart = false;
                this.changeView("services_provider_plan_three");
                this.saveSelfServiceStatistic("Products");
                break;
            case "services_provider_plan_five":
                this.currentStep = this.isNotGuestUser ? 1 : 0;
                this.currentTabName = "Plan customization";
                this.updatePath("customizations-item", 66);
                this.changeView("services_provider_plan_four");
                this.saveSelfServiceStatistic("Offers");
                break;
            case "services_provider_plan_six":
                this.currentStep = this.isNotGuestUser ? 1 : 0;
                this.currentTabName = "Plan customization";
                this.updatePath("personal-item", 0);
                setTimeout(() => this.updatePath("customizations-item", 83), 350);
                this.changeView("services_provider_plan_five");
                this.saveSelfServiceStatistic("Hardware");
                break;
            case "services_provider_plan_seven":
                this.currentStep = this.isNotGuestUser ? 2 : 1;
                this.currentTabName = "Personal information";
                this.updatePath("personal-item", 25);
                this.changeView("services_provider_plan_six");
                this.saveSelfServiceStatistic("Customer Information");
                break;
            case "services_provider_plan_eight":
                this.currentStep = this.isNotGuestUser ? 2 : 1;
                this.currentTabName = "Personal information";
                this.updatePath("personal-item", 50);
                this.changeView("services_provider_plan_seven");
                this.saveSelfServiceStatistic("Customer Information");
                break;
            case "services_provider_plan_nine":
                this.paymentAttempts = e.detail;
                this.currentStep = this.isNotGuestUser ? 2 : 1;
                this.currentTabName = "Personal information";
                this.updatePath("payment-item", 0);
                setTimeout(() => this.updatePath("personal-item", 75), 350);
                this.changeView("services_provider_plan_eight");
                this.saveSelfServiceStatistic("Customer Information");
                break;
            case "services_provider_plan_ten":
                this.currentStep = this.isNotGuestUser ? 3 : 2;
                this.currentTabName = "Payment";
                this.updatePath("confirmation-item", 0);
                setTimeout(() => this.updatePath("payment-item", 50), 350);
                this.changeView("services_provider_plan_nine");
                this.saveSelfServiceStatistic("Payment");
                break;
        }
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleCartUpdate(event) {
        this.tempCart = event.detail;
    }

    changeView(newView) {
        this.tempCart = undefined;
        this.view = newView;
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

            if (lineItem.lineItemIdentifier.productId === DO_FEE_PRODUCT_ID) {
                lineItem.lineItemIdentifier.productName = "One time non-refundable credit fee";
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
}