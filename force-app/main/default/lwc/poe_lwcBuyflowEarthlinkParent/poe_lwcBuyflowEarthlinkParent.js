import { LightningElement, api } from "lwc";
import INFO_TAB_NAME_LABEL from "@salesforce/label/c.Info_Tab_Name_Label";
import PRODUCTS_TAB_NAME_LABEL from "@salesforce/label/c.Products_Tab_Name_Label";
import CREDIT_CHECK_TAB_NAME_LABEL from "@salesforce/label/c.Credit_Check_Tab_Name_Label";
import ORDER_SUCCESS_TAB_NAME_LABEL from "@salesforce/label/c.Order_Success_Tab_Name_Label";
import SERVICES_TAB_NAME_LABEL from "@salesforce/label/c.Services_Tab_Name_Label";
import CART_TAB_NAME_LABEL from "@salesforce/label/c.Cart_Tab_Name_Label";
import CHECKOUT_TAB_NAME_LABEL from "@salesforce/label/c.Checkout_Tab_Name_Label";
import INSTALLATION_TPV_TAB_NAME_LABEL from "@salesforce/label/c.Installation_TPV_Tab_Name_Label";
import ORDER_CONFIRMATION_TAB_NAME_LABEL from "@salesforce/label/c.Order_Confirmation_Tab_Name_Label";

const BUYFLOW_STEPS = [
    { label: INFO_TAB_NAME_LABEL, value: "1" },
    { label: PRODUCTS_TAB_NAME_LABEL, value: "2" },
    { label: SERVICES_TAB_NAME_LABEL, value: "3" },
    { label: CREDIT_CHECK_TAB_NAME_LABEL, value: "4" },
    { label: CART_TAB_NAME_LABEL, value: "5" },
    { label: CHECKOUT_TAB_NAME_LABEL, value: "6" },
    { label: INSTALLATION_TPV_TAB_NAME_LABEL, value: "7" },
    { label: ORDER_CONFIRMATION_TAB_NAME_LABEL, value: "8" },
    { label: ORDER_SUCCESS_TAB_NAME_LABEL, value: "9" }
];
export default class Poe_lwcBuyflowEarthlinkParent extends LightningElement {
    @api recordId;
    @api origin;
    @api contact;
    @api userId;
    @api isGuestUser;
    @api referralCodeData;
    originalAddress;
    dateSelected;
    customerEmail;
    showLoaderSpinner;
    skipInstallation;
    isWireless;
    logo = "/poe/sfsites/c/resource/POE_elIMG";
    showEarthlinkInfoTab = true;
    showEarthlinkProductsTab = false;
    showEarthlinkServicesTab = false;
    showEarthlinkCreditCheckTab = false;
    showEarthlinkCartTab = false;
    showEarthlinkTermsTab = false;
    showEarthlinkCheckoutTab = false;
    showEarthlinkTPVTab = false;
    showEarthlinkOrderConfirmationTab = false;
    showEarthlinkOrderSuccessTab = false;
    oneTimeFee = {};
    cartProducts;
    cartServices;
    paymentAttempts;
    bundleId;
    @api currentStep = "1";

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
    estimatedFirstMonthTotal;
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

    get buyflowSteps() {
        return BUYFLOW_STEPS;
    }

    connectedCallback() {
        this.clientInfo.contactInfo.firstName = this.contact.firstName !== "" ? this.contact.firstName : undefined;
        this.clientInfo.contactInfo.lastName = this.contact.lastName !== "" ? this.contact.lastName : undefined;
        this.clientInfo.contactInfo.email = this.contact.email !== "" ? this.contact.email : undefined;
        this.clientInfo.contactInfo.phone = this.contact.phone !== "" ? this.contact.phone : undefined;
        if (!this.isGuestUser) {
            this.checkIP();
        }
        this.saveSelfServiceStatistic("Info");
        this.updateTabOpportunity("Info");
    }

    handleBack(e) {
        if (!this.isGuestUser) {
            this.checkIP();
        }
        switch (this.currentStep) {
            case "2":
                this.currentStep = "1";
                this.showEarthlinkInfoTab = true;
                this.showEarthlinkProductsTab = false;
                this.saveSelfServiceStatistic("Info");
                break;
            case "3":
                this.currentStep = "2";
                this.clientInfo.addressInfo = this.originalAddress;
                this.showEarthlinkProductsTab = true;
                this.showEarthlinkServicesTab = false;
                this.saveSelfServiceStatistic("Products");
                break;
            case "4":
                console.log(this.isWireless);
                this.showEarthlinkCreditCheckTab = false;
                if (this.isWireless) {
                    this.showEarthlinkProductsTab = true;
                    this.currentStep = "2";
                    this.saveSelfServiceStatistic("Products");
                } else {
                    this.currentStep = "3";
                    this.showEarthlinkServicesTab = true;
                    this.saveSelfServiceStatistic("Services");
                }
                break;
            case "5":
                this.currentStep = "4";
                this.showEarthlinkCreditCheckTab = true;
                this.showEarthlinkCartTab = false;
                this.saveSelfServiceStatistic("Credit Check");
                break;
            case "6":
                this.currentStep = "5";
                this.showEarthlinkCartTab = true;
                this.showEarthlinkCheckoutTab = false;
                this.saveSelfServiceStatistic("Cart");
                break;
            case "7":
                this.currentStep = "6";
                this.showEarthlinkCheckoutTab = true;
                this.showEarthlinkTPVTab = false;
                this.saveSelfServiceStatistic("Checkout");
                break;
            case "8":
                this.paymentAttempts = Number(e.detail);
                if (this.selectedProduct.vasProduct || this.skipInstallation) {
                    this.currentStep = "6";
                    this.showEarthlinkCheckoutTab = true;
                    this.showEarthlinkOrderConfirmationTab = false;
                    this.saveSelfServiceStatistic("Checkout");
                } else {
                    this.currentStep = "7";
                    this.showEarthlinkTPVTab = true;
                    this.showEarthlinkOrderConfirmationTab = false;
                    this.saveSelfServiceStatistic("Installation");
                }
                break;
        }
    }

    handleCheckServiceability(e) {
        this.updateTabOpportunity("Products");
        this.saveSelfServiceStatistic("Products");
        if (!this.isGuestUser) {
            this.checkIP();
        }
        this.clientInfo.addressInfo = e.detail.addressInfo;
        this.promoCodes = e.detail.promoCodes;
        this.originalAddress = e.detail.addressInfo;
        this.showEarthlinkInfoTab = false;
        this.showEarthlinkProductsTab = true;
        this.currentStep = "2";
    }

    handleNormalizedAddress(e) {
        this.clientInfo.addressInfo = e.detail.normalizedAddress;
    }

    handleProductSelection(e) {
        if (!this.isGuestUser) {
            this.checkIP();
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
        this.showEarthlinkProductsTab = false;
        if (this.isWireless) {
            this.cartServices = { ...this.cartProducts };
            this.showEarthlinkCreditCheckTab = true;
            this.currentStep = "4";
            this.saveSelfServiceStatistic("Credit Check");
        } else {
            this.showEarthlinkServicesTab = true;
            this.currentStep = "3";
            this.saveSelfServiceStatistic("Services");
        }
    }

    handleServiceSelection(e) {
        this.updateTabOpportunity("Customer Information");
        this.saveSelfServiceStatistic("Credit Check");
        if (!this.isGuestUser) {
            this.checkIP();
        }
        this.selectedServices = [...e.detail.servicesSelected];
        this.useEarthlinkDomain = e.detail.onlineBackupSelected;
        this.cartServices = { ...e.detail.cart };
        this.bundleId = e.detail.bundleId;
        this.showEarthlinkServicesTab = false;
        this.showEarthlinkCreditCheckTab = true;
        this.currentStep = "4";
    }

    handleCreditCheckPassed(e) {
        this.updateTabOpportunity("Order Summary");
        if (!this.isGuestUser) {
            this.checkIP();
        }
        this.clientInfo = e.detail.clientInfo;
        this.referenceNumber = e.detail.referenceNumber;
        this.creditCheckCallout = e.detail.creditCheckCallout;
        this.customerEmail = e.detail.contactEmail;
        this.paymentAttempts = e.detail.paymentAttempts;
        this.sfOrderId = e.detail.orderId;
        this.showEarthlinkCreditCheckTab = false;
        this.showEarthlinkCartTab = true;
        this.currentStep = "5";
        this.saveSelfServiceStatistic("Cart");
    }

    handleCartNext(e) {
        this.updateTabOpportunity("Payment");
        this.saveSelfServiceStatistic("Checkout");
        if (!this.isGuestUser) {
            this.checkIP();
        }
        this.estimatedFirstMonthTotal = e.detail;
        this.showEarthlinkCartTab = false;
        this.showEarthlinkTermsTab = false;
        this.showEarthlinkCheckoutTab = true;
        this.currentStep = "6";
    }

    handleCheckoutNext(e) {
        if (!this.isGuestUser) {
            this.checkIP();
        }
        this.paymentCallout = e.detail.payment;
        if (this.selectedProduct.vasProduct || this.skipInstallation) {
            let finalData = JSON.parse(JSON.stringify(this.creditCheckCallout));
            this.dateSelected = e.detail;
            let serviceCodes = [];
            serviceCodes.push(this.selectedProduct.servRef);
            if (this.selectedServices.length > 0) {
                this.selectedServices.forEach((service) => {
                    serviceCodes.push(service.servRef);
                });
            }
            finalData.callLogId = this.selectedProduct.callLogId;
            finalData.payment = JSON.parse(JSON.stringify(this.paymentCallout));
            finalData.serviceRef = serviceCodes.join(",");
            finalData.account.customerAcceptedTC = true;
            finalData.account.tcSource = "AOE-App";
            finalData.account.pin = "1234567";
            if (this.bundleId) {
                finalData.ioPromoCode = this.bundleId;
            }
            this.confirmationCallout = finalData;
            this.showEarthlinkCheckoutTab = false;
            this.showEarthlinkTPVTab = false;
            this.showEarthlinkOrderConfirmationTab = true;
            this.currentStep = "8";
            this.saveSelfServiceStatistic("Order Confirmation");
        } else {
            this.showEarthlinkCheckoutTab = false;
            this.showEarthlinkTPVTab = true;
            this.currentStep = "7";
            this.saveSelfServiceStatistic("Installation");
        }
    }

    handleTPVNext(e) {
        this.updateTabOpportunity("Order Submitted");
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
        this.showEarthlinkTPVTab = false;
        this.showEarthlinkOrderConfirmationTab = true;
        this.currentStep = "8";
    }

    handleOrderConfirmationNext(e) {
        this.updateTabOpportunity("Order Success");
        this.saveSelfServiceStatistic("Order Success");
        if (!this.isGuestUser) {
            this.checkIP();
        }
        this.orderNumber = e.detail.orderNumber;
        if (this.orderNumber === undefined || this.orderNumber === null || this.orderNUmber === "") {
            this.orderNumber = e.detail.orderId;
        }
        this.orderId = e.detail.orderId;
        this.showEarthlinkOrderConfirmationTab = false;
        this.showEarthlinkOrderSuccessTab = true;
        this.currentStep = "9";
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
                program: "Earthlink",
                orderId: this.sfOrderId
            }
        });

        this.dispatchEvent(event);
    }
}