import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getDealerCode from "@salesforce/apex/InfoTabController.getDealerCode";
import NO_DEALER_CODES_MESSAGE from "@salesforce/label/c.POE_Frontier_No_Dealer_Codes_Error";
import { loadStyle } from "lightning/platformResourceLoader";
import { NavigationMixin } from "lightning/navigation";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import chuzo_modalGeneric from "c/chuzo_modalGeneric";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";

export default class Poe_lwcSelfServiceFrontierParent extends NavigationMixin(LightningElement) {
    @api recordId;
    @api origin;
    @api userId;
    @api contact;
    @api isGuestUser;
    @api referralCodeData;
    @api selfServiceAddress;
    offerId;
    cart = {
        hasTodayCharge: false,
        hasMonthlyCharge: false,
        todayCharges: [],
        monthlyCharges: [],
        todayTotal: (0.0).toFixed(2),
        monthlyTotal: (0.0).toFixed(2)
    };
    creditCheckCart;
    configurationsCart;
    paymentCart;
    portableNumber;
    reservedTN;
    quoteId;
    accountUuid;
    selectedProduct;
    showLoaderSpinner;
    logo = "/poe/sfsites/c/resource/POE_froIMG";
    showFrontierInfoTab = true;
    showFrontierInfoPredictiveAddressTab = false;
    showFrontierProductsTab = false;
    showFrontierConfigurationsTab = false;
    showFrontierCreditCheckTab = false;
    showFrontierCartTab = false;
    showFrontierTermsTab = false;
    showFrontierCheckoutTab = false;
    showFrontierTPVTab = false;
    showFrontierOrderConfirmationTab = false;
    showFrontierOrderSuccessTab = false;
    referenceNumber;
    paymentAttempts;
    terms = [];
    clientInfo = {
        addressInfo: {
            address: "",
            apt: "",
            building: "",
            city: "",
            number: "",
            floor: "",
            state: "",
            zip: ""
        },
        address: {
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            zipCode: "",
            county: "",
            addressKey: "",
            controlNumber: "",
            environment: ""
        },
        contactInfo: {
            firstName: "",
            middleName: "",
            lastName: "",
            county: "",
            email: "",
            phone: ""
        },
        accountInfo: {
            ssn: "",
            pin: "",
            dob: "",
            drivingLicense: {
                dlNumber: "",
                expDate: "",
                dlState: ""
            }
        }
    };
    preview;
    orderInfo = {
        selectedHsiSpeed: "",
        selectedBundle: "",
        selectedBundleAdders: [],
        textMsgOptin: ""
    };
    cartInfo;
    creditCheckCallout;
    confirmationCallout;
    paymentCallout;
    shippingCost;
    orderNumber;
    orderId;
    btn;
    sfOrderId;
    orderItemId;
    productInfo;
    paperBill;
    autoPay;
    eBill;
    installationDetails;
    installationDate;
    earliestDate;
    addOnProducts = [];
    frontierSecureProducts = [];
    voiceProducts = [];
    accountId;
    productSelected;
    installationType;
    manualCreditCheck;
    frontierUserId;
    agentId;
    timeZone = {};
    currentTabName;
    showCollateral = false;
    tempCart; // Temporal cart with changes for the current tab.
    currentStep = 0;
    showMobileCart = false;
    view;
    installationOptions = [];
    customerValidationParams = {};
    autoPayNode = {};
    autoPayDiscounts = [];
    cartSubtitle = "Internet connection";
    quoteNumber;
    btn;

    get isViewInfoTab() {
        return this.isView("info_tab");
    }

    get isViewProducts() {
        return this.isView("products_tab");
    }

    get isViewCreditCheck() {
        return this.isView("credit_check_tab");
    }

    get isConfigurationsTab() {
        return this.isView("configurations_tab");
    }

    get isInstallationTab() {
        return this.isView("installation_tab");
    }

    get isViewPayment() {
        return this.isView("payment_tab");
    }

    get isViewOrderSuccess() {
        return this.isView("order_success_tab");
    }

    get isViewBillPreview() {
        return this.isView("bill_preview_tab");
    }

    get isViewTerms() {
        return this.isView("terms_tab");
    }

    get logoHeader() {
        return chuzoSiteResources + "/images/" + (this.view == "home" ? "logo.png" : "logo-frontier.svg");
    }

    get providerLogoFrontier() {
        return chuzoSiteResources + "/images/provider-logo-frontier.svg";
    }

    get iconCart() {
        return chuzoSiteResources + "/images/icon-cart-red.svg";
    }

    get headerMode() {
        let mode = this.view == "home" ? "home buyflow-header" : "pages buyflow-header";
        if (this.showMobileCart) {
            mode = `${mode} has-open-cart`;
        }

        return mode;
    }

    get displayStep() {
        if (this.currentStep === this.totalSteps) {
            return this.currentStep;
        }

        return this.currentStep + 1;
    }

    get totalSteps() {
        return this.isGuestUser ? 6 : 8;
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
        return `${this.currentCart && !this.showCollateral ? "has-panel-right" : ""} page pages-nav`;
    }

    get currentCart() {
        if (this.tempCart) {
            return this.tempCart;
        }

        if (this.isViewInfoTab || this.isViewProducts) {
            return undefined;
        } else if (this.isViewCreditCheck) {
            return this.cartInfo;
        } else if (this.isConfigurationsTab) {
            return this.creditCheckCart;
        }

        return this.configurationsCart;
    }

    get stepInformation() {
        return !(this.view == "home" || this.view == "services");
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");

        this.clientInfo.contactInfo.firstName = this.contact.firstName !== "" ? this.contact.firstName : undefined;
        this.clientInfo.contactInfo.lastName = this.contact.lastName !== "" ? this.contact.lastName : undefined;
        this.clientInfo.contactInfo.email = this.contact.email !== "" ? this.contact.email : undefined;
        this.clientInfo.contactInfo.phone = this.contact.phone !== "" ? this.contact.phone : undefined;
        this.getDealerCodeData();
        this.saveSelfServiceStatistic("Info");
        this.currentTabName = this.isGuestUser ? "Plan customization" : "Service information";
        this.changeView("info_tab");
    }

    isView(viewName) {
        return this.view === viewName;
    }

    handlePaymentCart(event) {
        this.configurationsCart = { ...event.detail };
    }

    changeView(newView) {
        this.tempCart = undefined;
        this.view = newView;
    }

    handleCartUpdate(event) {
        this.tempCart = event.detail;
    }

    handleBack(e) {
        switch (this.view) {
            case "info_tab":
                this.handleHome();
                break;
            case "products_tab":
                if (this.isGuestUser) {
                    return this.handleHome();
                }
                this.currentStep = 0;
                this.currentTabName = "Service Information";
                this.updatePath("customizations-item", 0);
                setTimeout(() => this.updatePath("service-item", 50), 350);
                this.changeView("info_tab");
                this.saveSelfServiceStatistic("Info");
                break;
        }
    }

    handleCancel() {
        if (this.isGuestUser) {
            chuzo_modalGeneric
                .open({
                    content: {
                        title: selfServiceValidateLeavingTitle,
                        provider: "frontier",
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
        this.saveSelfServiceStatistic("Products");
        this.accountId = e.detail.accountId;
        this.clientInfo.addressInfo = e.detail.addressData.addressInfo;
        this.clientInfo.address = e.detail.addressData.address;
        this.clientInfo.address.addressLine1 = e.detail.intAddress.AddressLine1;
        this.clientInfo.address.addressLine2 = e.detail.intAddress.AddressLine2;
        this.clientInfo.address.city = e.detail.intAddress.City;
        this.clientInfo.address.zipCode = e.detail.intAddress.ZipCode;
        this.clientInfo.address.addressKey = e.detail.intAddress.AddressKey;
        this.clientInfo.address.controlNumber = e.detail.intAddress.ControlNumber;
        this.clientInfo.address.environment = e.detail.intAddress.Environment;
        this.clientInfo.contactInfo.firstName = e.detail.contactInfo.firstName;
        this.clientInfo.contactInfo.lastName = e.detail.contactInfo.lastName;
        this.clientInfo.contactInfo.email = e.detail.contactInfo.email;
        this.clientInfo.contactInfo.phone = e.detail.contactInfo.contactPhone;

        this.currentTabName = "Plan customization";
        this.currentStep = this.isGuestUser ? 0 : 1;
        this.changeView("products_tab");
        if (this.isNotGuestUser) {
            this.updatePath("service-item", 100);
            setTimeout(() => this.updatePath("customizations-item", 50), 350);
        }
    }

    handleProductSelection(e) {
        this.checkIP();
        this.saveSelfServiceStatistic("Credit Check");
        let productData = JSON.parse(JSON.stringify(e.detail));
        this.cartInfo = productData.cart;
        this.accountUuid = productData.accountUuid;
        this.productSelected = productData.productSelected;
        this.customerValidationParams = productData.customerValidationParams;
        this.creditCheckCallout = {
            partnerName: "frapi",
            quoteId: this.quoteId,
            accountUuid: this.accountUuid,
            customer: {
                accountName: this.clientInfo.contactInfo.firstName + " " + this.clientInfo.contactInfo.lastName,
                firstName: this.clientInfo.contactInfo.firstName,
                lastName: this.clientInfo.contactInfo.lastName
            }
        };

        this.currentStep = this.isGuestUser ? 1 : 2;
        this.currentTabName = "Personal information";

        this.changeView("credit_check_tab");
        this.updatePath("customizations-item", 100);
        setTimeout(() => this.updatePath("personal-item", 50), 350);
    }

    handleQuote() {
        this.quoteId = event.detail;
        this.cartSubtitle = `${this.cartSubtitle} - Quote: ${this.quoteId}`;
    }

    handleConfigProducts(e) {
        let productData = JSON.parse(JSON.stringify(e.detail));
        this.addOnProducts = [...productData.addOns];
        this.addOnProducts.forEach((item) => {
            if (item.ProductId === "PBILL") {
                this.paperBill = item.PromoPrice;
            }
        });
        this.frontierSecureProducts = [...productData.secure];
        this.voiceProducts = [...productData.voiceProducts];
        this.productInfo = [...productData.productIds];
    }

    handleCreditCheckPassed(e) {
        this.checkIP();
        let data = JSON.parse(JSON.stringify(e.detail));
        this.creditCheckCart = data.cart;
        this.autoPay = data.paymentProfile.autoPay;
        this.referenceNumber = data.referenceNumber;
        this.paymentAttempts = data.paymentAttempts;
        this.eBill = data.paymentProfile.eBill;
        this.sfOrderId = data.orderId;
        this.orderItemId = data.orderItemId;
        this.autoPayNode = { ...data.autoPayNode };
        this.autoPayDiscounts = [...data.autoPayDiscounts];
        this.manualCreditCheck = data.manualCreditCheck;
        if (this.isGuestUser) {
            this.quoteId = data.quoteId;
            this.accountUuid = data.accountUuid;
            this.clientInfo.contactInfo.firstName = data.contactInfo.firstName;
            this.clientInfo.contactInfo.lastName = data.contactInfo.lastName;
            this.clientInfo.contactInfo.email = data.contactInfo.email;
            this.clientInfo.contactInfo.phone = data.contactInfo.contactPhone;
            this.creditCheckCallout.customer = data.customer;
        }

        this.currentStep = this.isGuestUser ? 2 : 3;
        this.changeView("configurations_tab");
        this.updatePath("personal-item", 100);
        setTimeout(() => this.updatePath("configuration-item", 33), 350);
        this.saveSelfServiceStatistic("Configurations");
    }

    handleAutoPay(e) {
        this.autoPay = e.detail.autoPay;
        this.tempCart = e.detail.cart;
    }

    handleEBill(e) {
        this.eBill = e.detail.eBill;
        this.tempCart = e.detail.cart;
    }

    handleConfigSelection(e) {
        this.saveSelfServiceStatistic("Installation");
        this.checkIP();
        let detail = JSON.parse(JSON.stringify(e.detail));
        this.configurationsCart = detail.cart;
        this.portableNumber = detail.hasOwnProperty("portable") ? detail.portable : undefined;
        this.reservedTN = detail.reservedTN;
        this.installationOptions = [...detail.installationOptions];
        this.timeZone = { ...detail.timeZone };
        this.btn = detail.btn;
        this.quoteNumber = detail.quoteNumber;
        this.cartSubtitle = this.cartSubtitle.replace(this.quoteId, this.quoteNumber);
        this.currentStep = this.isGuestUser ? 3 : 4;
        this.changeView("installation_tab");
        this.updatePath("configuration-item", 66);
    }

    handleTPVNext(e) {
        this.saveSelfServiceStatistic("Payment");
        let detail = JSON.parse(JSON.stringify(e.detail));
        this.installationDetails = detail.installationDetails;
        this.installationDate = detail.date;
        this.earliestDate = detail.earliestDate;

        this.currentStep = this.isGuestUser ? 4 : 5;
        this.changeView("payment_tab");
        this.updatePath("configuration-item", 100);
        setTimeout(() => this.updatePath("payment-item", 50), 350);
    }

    handleAddressInfoUpdate(e) {
        let dataInfo = JSON.parse(JSON.stringify(e.detail));
        this.addressInfo.ssn = dataInfo.ssn;
        this.addressInfo.dob = dataInfo.dob;
    }

    handleCheckoutNext(e) {
        this.saveSelfServiceStatistic("Bill Preview");
        this.checkIP();
        let data = JSON.parse(JSON.stringify(e.detail));
        this.preview = data.preview;

        this.currentStep = this.isGuestUser ? 5 : 6;
        this.changeView("bill_preview_tab");
        this.updatePath("payment-item", 100);
        setTimeout(() => {
            const fillPercentage = this.isGuestUser ? 50 : 33;
            this.updatePath("confirmation-item", fillPercentage);
        }, 350);
    }

    handleOrderConfirmationNext(e) {
        this.saveSelfServiceStatistic("T&C");
        this.checkIP();
        this.terms = [...JSON.parse(JSON.stringify(e.detail))];

        this.currentStep = this.isGuestUser ? 5 : 7;
        this.changeView("terms_tab");
        if (this.isNotGuestUser) {
            this.updatePath("confirmation-item", 66);
        }
    }

    handleTermsNext(e) {
        this.saveSelfServiceStatistic("Order Success");
        let data = JSON.parse(JSON.stringify(e.detail));
        this.orderId = data.orderId; //quoteNumber
        this.btn = data.accountNumber; //btn
        this.orderNumber = data.orderNumber;
        this.installationType = data.installationType;

        this.currentStep = this.isGuestUser ? 6 : 8;
        this.changeView("order_success_tab");
        this.updatePath("confirmation-item", 100);
    }

    checkIP() {
        if (!this.isGuestUser) {
            this.dispatchEvent(new CustomEvent("checkip"));
        }
    }

    handleLogError(event) {
        console.log("logerror event in parent: ", event);
        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: {
                    ...event.detail,
                    provider: "Frontier",
                    opportunity: this.recordId
                }
            })
        );
    }

    getDealerCodeData() {
        this.showLoaderSpinner = true;
        let input = {
            program: "Frontier",
            origin: this.origin
        };

        getDealerCode({ myData: input })
            .then((response) => this.handleGetDealerCode(response))
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    handleGetDealerCode(response) {
        if (response.result.Codes?.length > 0) {
            this.agentId = this.isGuestUser ? "online" : response.result.User[0].Id;
            this.frontierUserId = response.result.Codes[0].POE_Dealer_Code__c;
            this.showLoaderSpinner = false;
        } else {
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: NO_DEALER_CODES_MESSAGE
            });
            this.dispatchEvent(event);
            this.showLoaderSpinner = false;
            this.logError(msg);
        }
    }

    saveSelfServiceStatistic(tab) {
        if (!this.isGuestUser) {
            return;
        }

        const event = new CustomEvent("selfservicestatistic", {
            detail: {
                tabName: tab,
                program: "Frontier",
                orderId: this.sfOrderId
            }
        });

        this.dispatchEvent(event);
    }
}