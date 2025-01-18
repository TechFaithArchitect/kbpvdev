import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";
import chuzo_modalSendingOrderEarthLink from "c/chuzo_modalSendingOrderEarthLink";
import chuzo_modalGeneric from "c/chuzo_modalGeneric";

import SELF_SERVICE_VALIDATE_LEAVING_MESSAGE from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import SELF_SERVICE_VALIDATE_LEAVING_TITLE from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import SERVICE_INFORMATION_TAB_NAME_LABEL from "@salesforce/label/c.Service_Information_Tab_Name_Label";
import PLAN_CUSTOMIZATION_TAB_NAME_LABEL from "@salesforce/label/c.Plan_Customization_Tab_Name_Label";
import PERSONAL_INFORMATION_TAB_NAME_LABEL from "@salesforce/label/c.Personal_Information_Tab_Name_Label";
import PAYMENT_TAB_NAME_LABEL from "@salesforce/label/c.Payment_Tab_Name_Label";
import CONFIRMATION_TAB_NAME_LABEL from "@salesforce/label/c.Confirmation_Tab_Name_Label";
import STEP_LABEL from "@salesforce/label/c.Step_Label";
import INTERNET_CONNECTION_CART_TITLE from "@salesforce/label/c.Internet_Connection_Cart_Title";
import EARTHLINK_PROVIDER_LABEL from "@salesforce/label/c.Self_Service_Program_Selection_EarthLink_Name";
import CONFIRM_BUTTON_LABEL from "@salesforce/label/c.Confirm_Button_Label";

export default class Poe_lwcSelfServiceEarthlinkParent extends NavigationMixin(LightningElement) {
    @api recordId;
    @api origin;
    @api contact;
    @api userId;
    @api isGuestUser;
    @api referralCodeData;
    @api currentStep = 1;
    buyflowSteps;
    originalAddress;
    dateSelected;
    customerEmail;
    showLoaderSpinner;
    skipInstallation;
    isWireless;
    logo = "/poe/sfsites/c/resource/POE_elIMG";
    oneTimeFee = {};
    cartProducts;
    cartServices;
    paymentAttempts;
    bundleId;
    clientInfo = {
        addressInfo: {
            address: "",
            apt: "",
            city: "",
            state: "",
            zip: ""
        },
        contactInfo: {
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            phone: ""
        },
        contactEmail: ""
    };
    checkoutDisclaimers = [];
    selectedProduct;
    selectedServices = [];
    estimatedFirstMonthTotal = 0;
    estimatedOneTimeTotal = 0;
    referenceNumber;
    creditCheckCallout;
    confirmationCallout;
    paymentCallout;
    orderNumber;
    orderId;
    services;
    bundles;
    useEarthlinkDomain;
    wiredAddress = {};
    promoCodes = [];
    selectedPromoCode;
    sfOrderId;
    labels = {
        SELF_SERVICE_VALIDATE_LEAVING_TITLE,
        SELF_SERVICE_VALIDATE_LEAVING_MESSAGE,
        PAYMENT_TAB_NAME_LABEL,
        SERVICE_INFORMATION_TAB_NAME_LABEL,
        PLAN_CUSTOMIZATION_TAB_NAME_LABEL,
        PERSONAL_INFORMATION_TAB_NAME_LABEL,
        CONFIRMATION_TAB_NAME_LABEL,
        STEP_LABEL,
        INTERNET_CONNECTION_CART_TITLE,
        EARTHLINK_PROVIDER_LABEL
    };
    mobileStep = SERVICE_INFORMATION_TAB_NAME_LABEL;
    tempCart;
    showMobileCart = false;

    get noInstallation() {
        return this.selectedProduct.vasProduct || this.skipInstallation;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    /* Cart logic */
    get currentCart() {
        if (this.tempCart) {
            return this.tempCart;
        }

        if (this.isViewServiceTab) {
            return this.cartProducts;
        } else if (this.isViewCreditCheckTab || this.isViewCheckoutTab) {
            return this.cartServices;
        }

        return undefined;
    }

    get pageClass() {
        return `${this.currentCart && !this.showCollateral ? "has-panel-right" : ""} page pages-nav`;
    }

    get cartItemsCount() {
        const cart = this.currentCart;

        let itemsCount = 0;
        itemsCount += cart.todayCharges?.length || 0;
        itemsCount += cart.monthlyCharges?.length || 0;
        itemsCount += cart.firstBillCharges?.length || 0;

        return itemsCount;
    }
    /* End cart logic */

    /* Resources logic */

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

    get providerLogoEarthlink() {
        return chuzoSiteResources + "/images/provider-logo-earthlink.svg";
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconFormUser() {
        return chuzoSiteResources + "/images/icon-earthlink-user.svg";
    }

    get iconFormCreditCard() {
        return chuzoSiteResources + "/images/icon-earthlink-creditcard.svg";
    }

    get iconFormCreditCardCheck() {
        return chuzoSiteResources + "/images/icon-creditcard-check.svg";
    }

    get iconCheckGreen() {
        return chuzoSiteResources + "/images/icon-check.svg";
    }

    get iconCart() {
        return chuzoSiteResources + "/images/icon-cart-orange.svg";
    }

    /* End Resources logic */

    /* View logic */
    view = "info_tab";
    providerStyle = "earthlink";

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

    get isViewInfoTab() {
        return this.isView("info_tab");
    }

    changeViewToInfoTab() {
        this.saveSelfServiceStatistic("Info");
        this.tempCart = undefined;
        this.view = "info_tab";
        this.mobileStep = SERVICE_INFORMATION_TAB_NAME_LABEL;
    }

    get isViewProductsTab() {
        return this.isView("products_tab");
    }

    changeViewToProductsTab() {
        this.saveSelfServiceStatistic("Products");
        this.tempCart = undefined;
        this.mobileStep = PLAN_CUSTOMIZATION_TAB_NAME_LABEL;
        this.view = "products_tab";
    }

    get isViewServiceTab() {
        return this.isView("services_tab");
    }

    changeViewToServicesTab() {
        this.saveSelfServiceStatistic("Services");
        this.tempCart = undefined;
        this.mobileStep = PLAN_CUSTOMIZATION_TAB_NAME_LABEL;
        this.view = "services_tab";
    }

    get isViewCreditCheckTab() {
        return this.isView("credit_check");
    }

    changeViewToCreditCheckTab() {
        this.saveSelfServiceStatistic("Credit Check");
        this.tempCart = undefined;
        this.mobileStep = PERSONAL_INFORMATION_TAB_NAME_LABEL;
        this.view = "credit_check";
    }

    get isViewCheckoutTab() {
        return this.isView("checkout_tab");
    }

    changeViewToCheckoutTab() {
        this.saveSelfServiceStatistic("Checkout");
        //previous cart tab logic
        let chosen = [];
        let services = [];
        let prod = {
            Id: 1,
            value: this.selectedProduct.Name,
            price: this.selectedProduct.UnitPrice.toString()
        };
        if (this.selectedProduct.PriceType === "Monthly") {
            this.estimatedFirstMonthTotal = (
                Number(this.estimatedFirstMonthTotal) + Number(this.selectedProduct.UnitPrice)
            ).toFixed(2);
            chosen.push(prod);
        } else {
            this.estimatedOneTimeTotal = (
                Number(this.estimatedOneTimeTotal) + Number(this.selectedProduct.UnitPrice)
            ).toFixed(2);
            services.push(prod);
        }
        if (this.selectedServices.length > 0) {
            this.selectedServices.forEach((service) => {
                let serv = {
                    Id: service.servRef,
                    value: service.Name,
                    price: service.UnitPrice.toString()
                };
                if (service.PriceType === "Monthly") {
                    this.estimatedFirstMonthTotal = (
                        Number(this.estimatedFirstMonthTotal) + Number(service.UnitPrice)
                    ).toFixed(2);
                    chosen.push(serv);
                } else {
                    this.estimatedOneTimeTotal = (
                        Number(this.estimatedOneTimeTotal) + Number(service.UnitPrice)
                    ).toFixed(2);
                    services.push(serv);
                }
            });
        }
        if (this.oneTimeFee.hasOwnProperty("fee")) {
            if (this.oneTimeFee.fee !== "0") {
                let activ = {
                    price: Number(this.oneTimeFee.fee).toFixed(2),
                    value: this.oneTimeFee.name,
                    id: this.oneTimeFee.name
                };
                services.push(activ);
                this.estimatedOneTimeTotal = Number(this.estimatedOneTimeTotal) + Number(this.oneTimeFee.fee);
            }
        }
        this.activations = [...services];
        this.products = [...chosen];
        // end previous cart tab logic
        this.view = "checkout_tab";
        this.tempCart = undefined;
        this.mobileStep = PAYMENT_TAB_NAME_LABEL;
    }

    get isViewOrderConfirmation() {
        return this.isView("order_confirmation_tab");
    }

    changeViewToOrderConfirmationTab() {
        this.saveSelfServiceStatistic("Order Confirmation");
        this.tempCart = undefined;
        this.mobileStep = CONFIRMATION_TAB_NAME_LABEL;
        this.view = "order_confirmation_tab";
    }

    showModalSendingOrder() {
        chuzo_modalSendingOrderEarthLink.open().then((result) => {
            console.log("chuzo_modalSendingOrderEarthLink -> ", result);
            if (result == "okay") this.changeViewToOrderConfirmationTab();
        });
    }

    changeViewToOrderSuccessTab() {
        this.saveSelfServiceStatistic("Order Success");
        this.view = "order_success_tab";
    }

    get isViewOrderSuccessTab() {
        return this.isView("order_success_tab");
    }

    /* End View logic */

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        this.clientInfo.contactInfo.firstName = this.contact.firstName !== "" ? this.contact.firstName : undefined;
        this.clientInfo.contactInfo.lastName = this.contact.lastName !== "" ? this.contact.lastName : undefined;
        this.clientInfo.contactInfo.email = this.contact.email !== "" ? this.contact.email : undefined;
        this.clientInfo.contactInfo.phone = this.contact.phone !== "" ? this.contact.phone : undefined;
        this.changeViewToInfoTab();
        if (!this.isGuestUser) {
            this.checkIP();
            this.changeViewToInfoTab();
            this.buyflowSteps = 7;
        } else {
            this.changeViewToProductsTab();
            this.buyflowSteps = 6;
        }
        console.log('this.labels', this.labels);
    }

    handleBack(e) {
        this.tempCart = undefined;

        if (!this.isGuestUser) {
            this.checkIP();
        }
        switch (this.currentStep) {
            case "2":
                this.currentStep = "1";
                if (this.isGuestUser) {
                    this.updatePath("personal-item", 0);
                    setTimeout(() => this.updatePath("customizations-item", 33), 350);
                    this.changeViewToProductsTab();
                } else {
                    this.updatePath("customizations-item", 0);
                    setTimeout(() => this.updatePath("service-item", 50), 350);
                    this.changeViewToInfoTab();
                }
                break;
            case "3":
                this.currentStep = "2";
                this.clientInfo.addressInfo = this.originalAddress;
                if (this.isGuestUser) {
                    if (this.isWireless) {
                        this.updatePath("payment-item", 0);
                        setTimeout(() => this.updatePath("personal-item", 50), 350);
                        this.changeViewToCreditCheckTab();
                    } else {
                        this.updatePath("personal-item", 0);
                        setTimeout(() => this.updatePath("customizations-item", 66), 350);
                        this.changeViewToServicesTab();
                    }
                } else {
                    this.updatePath("personal-item", 0);
                    setTimeout(() => this.updatePath("customizations-item", 33), 350);
                    this.changeViewToProductsTab();
                }
                break;
            case "4":
                this.currentStep = "3";
                if (this.isGuestUser) {
                    if (this.isWireless) {
                        this.updatePath("confirmation-item", 0);
                        setTimeout(() => this.updatePath("payment-item", 50), 350);
                        this.changeViewToCheckoutTab();
                    } else {
                        this.updatePath("payment-item", 0);
                        setTimeout(() => this.updatePath("personal-item", 50), 350);
                        this.changeViewToCreditCheckTab();
                    }
                } else {
                    if (this.isWireless) {
                        this.updatePath("payment-item", 0);
                        setTimeout(() => this.updatePath("personal-item", 50), 350);
                        this.changeViewToCreditCheckTab();
                    } else {
                        this.updatePath("customizations-item", 66);
                        this.changeViewToServicesTab();
                    }
                }
                break;
            case "5":
                this.currentStep = "4";
                if (this.isGuestUser) {
                    this.updatePath("confirmation-item", 0);
                    setTimeout(() => this.updatePath("payment-item", 50), 350);
                    this.changeViewToCheckoutTab();
                } else {
                    if (this.isWireless) {
                        this.paymentAttempts = Number(e.detail);
                        this.updatePath("confirmation-item", 0);
                        setTimeout(() => this.updatePath("payment-item", 50), 350);
                        this.changeViewToCheckoutTab();
                    } else {
                        this.updatePath("payment-item", 0);
                        setTimeout(() => this.updatePath("personal-item", 50), 350);
                        this.changeViewToCreditCheckTab();
                    }
                }
                break;
        }
    }

    handleCheckServiceability(e) {
        if (!this.isGuestUser) {
            this.checkIP();
            this.updatePath("service-item", 100);
        }
        this.clientInfo.addressInfo = e.detail.addressInfo;
        this.promoCodes = e.detail.promoCodes;
        this.originalAddress = e.detail.addressInfo;
        this.currentStep = "2";
        this.changeViewToProductsTab();
    }

    handleNormalizedAddress(e) {
        this.clientInfo.addressInfo = e.detail.normalizedAddress;
    }

    handleProductSelection(e) {
        if (!this.isGuestUser) {
            this.currentStep = "3";
            this.checkIP();
        } else {
            this.currentStep = "2";
        }
        this.checkoutDisclaimers = e.detail.checkoutDisclaimers;
        this.oneTimeFee = { ...JSON.parse(JSON.stringify(e.detail.oneTimeFee)) };
        this.selectedProduct = e.detail.Product;
        this.services = e.detail.Services;
        this.bundles = e.detail.bundles;
        this.skipInstallation = e.detail.skipInstallation;
        this.isWireless = e.detail.isWireless;
        this.cartProducts = { ...JSON.parse(JSON.stringify(e.detail.cart)) };
        this.selectedPromoCode = e.detail.selectedPromoCode;
        if (e.detail.wiredAddress.hasOwnProperty("city") && !this.isWireless) {
            this.clientInfo.addressInfo.address = e.detail.wiredAddress.addressLine1;
            this.clientInfo.addressInfo.apt = e.detail.wiredAddress.addressLine2;
            this.clientInfo.city = e.detail.wiredAddress.city;
            this.clientInfo.state = e.detail.wiredAddress.state;
            this.clientInfo.zip = e.detail.wiredAddress.zipCode;
        }

        if (this.isGuestUser) {
            this.originalAddress = this.clientInfo.addressInfo;
        }

        if (this.isWireless) {
            this.cartServices = { ...this.cartProducts };
            this.updatePath("customizations-item", 100);
            setTimeout(() => this.updatePath("personal-item", 50), 350);
            this.changeViewToCreditCheckTab();
            this.buyflowSteps = this.isGuestUser ? this.buyflowSteps - 1 : this.buyflowSteps;
        } else {
            this.updatePath("customizations-item", 66);
            this.changeViewToServicesTab();
        }
    }

    handleServiceSelection(e) {
        this.updatePath("customizations-item", 100);
        setTimeout(() => this.updatePath("personal-item", 50), 350);
        if (!this.isGuestUser) {
            this.checkIP();
            this.isWireless ? (this.currentStep = "3") : (this.currentStep = "4");
        } else {
            this.isWireless ? (this.currentStep = "2") : (this.currentStep = "3");
        }
        this.selectedServices = [...e.detail.servicesSelected];
        this.useEarthlinkDomain = e.detail.onlineBackupSelected;
        this.cartServices = { ...e.detail.cart };
        this.bundleId = e.detail.bundleId;
        this.changeViewToCreditCheckTab();
    }

    handleCreditCheckPassed(e) {
        if (!this.isGuestUser) {
            this.checkIP();
            this.isWireless ? (this.currentStep = "4") : (this.currentStep = "5");
        } else {
            this.isWireless ? (this.currentStep = "3") : (this.currentStep = "4");
        }
        this.updatePath("personal-item", 100);
        setTimeout(() => this.updatePath("payment-item", 50), 350);
        this.clientInfo = e.detail.clientInfo;
        this.referenceNumber = e.detail.referenceNumber;
        this.creditCheckCallout = e.detail.creditCheckCallout;
        this.customerEmail = e.detail.contactEmail;
        this.paymentAttempts = e.detail.paymentAttempts;
        this.sfOrderId = e.detail.orderId;
        //installation logic
        let finalData = JSON.parse(JSON.stringify(this.creditCheckCallout));
        if (e.detail.selectedDate !== "" && e.detail.selectedDate !== undefined) {
            this.dateSelected = e.detail.selectedDate;
            finalData.installationDetails = {
                date: e.detail.selectedDate.substring(0, 10),
                startTime: e.detail.selectedDate.substring(11, 16),
                endTime: e.detail.selectedDate.substring(19, 24),
                earliestDate: e.detail.earliestDate.date
            };
        }
        // finalData.payment = JSON.parse(JSON.stringify(this.paymentCallout));
        let serviceCodes = [];
        serviceCodes.push(this.selectedProduct.servRef);
        if (this.selectedServices.length > 0) {
            this.selectedServices.forEach((service) => {
                serviceCodes.push(service.servRef);
            });
        }
        finalData.serviceRef = serviceCodes.join(",");
        finalData.callLogId = this.selectedProduct.callLogId;
        finalData.account.customerAcceptedTC = true;
        finalData.account.tcSource = "AOE-App";
        finalData.account.pin = "1234567";
        if (this.bundleId) {
            finalData.ioPromoCode = this.bundleId;
        }
        this.confirmationCallout = finalData;
        //end installation logic

        this.changeViewToCheckoutTab();
    }

    handleCheckoutNext(e) {
        if (!this.isGuestUser) {
            this.checkIP();
            this.isWireless ? (this.currentStep = "5") : (this.currentStep = "6");
        } else {
            this.isWireless ? (this.currentStep = "4") : (this.currentStep = "5");
        }
        this.updatePath("payment-item", 100);
        setTimeout(() => this.updatePath("confirmation-item", 50), 350);
        this.paymentCallout = e.detail.payment;
        let billingAddress = e.detail?.billingAddress;
        let finalData = { ...this.confirmationCallout };
        this.confirmationCallout = {};
        finalData.payment = this.paymentCallout;
        if (billingAddress) {
            finalData.account.billingAddress = { ...billingAddress };
        }
        this.confirmationCallout = { ...finalData };
        this.changeViewToOrderConfirmationTab();
    }

    handleTPVNext(e) {
        this.saveSelfServiceStatistic("Order Confirmation");
        if (!this.isGuestUser) {
            this.checkIP();
        }
        let finalData = JSON.parse(JSON.stringify(this.creditCheckCallout));
        if (e.detail.selectedDate !== "" && e.detail.selectedDate !== undefined) {
            this.dateSelected = e.detail.selectedDate;
            finalData.installationDetails = {
                date: e.detail.selectedDate.substring(0, 10),
                startTime: e.detail.selectedDate.substring(11, 16),
                endTime: e.detail.selectedDate.substring(19, 24),
                earliestDate: e.detail.earliestDate.date
            };
        }
        finalData.payment = JSON.parse(JSON.stringify(this.paymentCallout));
        let serviceCodes = [];
        serviceCodes.push(this.selectedProduct.servRef);
        if (this.selectedServices.length > 0) {
            this.selectedServices.forEach((service) => {
                serviceCodes.push(service.servRef);
            });
        }
        finalData.serviceRef = serviceCodes.join(",");
        finalData.callLogId = this.selectedProduct.callLogId;
        finalData.account.customerAcceptedTC = true;
        finalData.account.tcSource = "AOE-App";
        finalData.account.pin = "1234567";
        if (this.bundleId) {
            finalData.ioPromoCode = this.bundleId;
        }
        this.confirmationCallout = finalData;
    }

    handleOrderConfirmationNext(e) {
        if (!this.isGuestUser) {
            this.checkIP();
            this.isWireless ? (this.currentStep = "6") : (this.currentStep = "7");
        } else {
            this.isWireless ? (this.currentStep = "5") : (this.currentStep = "6");
        }
        this.orderNumber = e.detail.orderNumber;
        if (this.orderNumber === undefined || this.orderNumber === null || this.orderNUmber === "") {
            this.orderNumber = e.detail.orderId;
        }
        this.orderId = e.detail.orderId;
        this.updatePath("confirmation-item", 100);
        this.changeViewToOrderSuccessTab();
    }

    checkIP() {
        this.dispatchEvent(new CustomEvent("checkip"));
    }

    handleLogError(event) {
        let logEvent = new CustomEvent("logerror", {
            detail: event.detail
        });
        this.dispatchEvent(logEvent);
    }

    handleHome() {
        const goBackEvent = new CustomEvent("home", {
            detail: ""
        });
        this.dispatchEvent(goBackEvent);
    }

    saveSelfServiceStatistic(tab) {
        if (!this.isGuestUser) {
            return;
        }

        const event = new CustomEvent("selfservicestatistic", {
            detail: {
                tabName: tab,
                program: "Earthlink",
                orderId: this.sfOrderId
            }
        });

        this.dispatchEvent(event);
    }

    selfServiceReturnToHomePage() {
        const goBackEvent = new CustomEvent("home", {
            detail: "",
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(goBackEvent);
    }

    handleCancel() {
        if (this.isGuestUser) {
            let content = {
                provider: "Earthlink",
                title: this.labels.SELF_SERVICE_VALIDATE_LEAVING_TITLE,
                body: `<div class="slds-text-align_center slds-m-top_small">${this.labels.SELF_SERVICE_VALIDATE_LEAVING_MESSAGE}</div>`,
                agreeLabel: CONFIRM_BUTTON_LABEL,
                canClose: true
            };
            chuzo_modalGeneric.open({ content: content }).then((result) => {
                if (result.agreed) {
                    this.selfServiceReturnToHomePage();
                }
            });
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
    updatePath(id, width) {
        const path = this.template.querySelector(`[data-id="${id}"]`);
        const mobilePath = this.template.querySelector(`[data-id="mobile-path"]`);
        let mobileWidth = (Number(this.currentStep) * 100) / Number(this.buyflowSteps);
        path.style.width = `${width}%`;
        mobilePath.style.width = `${mobileWidth}%`;
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
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

    handleCartUpdate(event) {
        this.tempCart = event.detail;
    }
}