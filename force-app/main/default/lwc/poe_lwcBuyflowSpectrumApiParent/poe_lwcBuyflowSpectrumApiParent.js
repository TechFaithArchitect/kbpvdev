import { LightningElement, api } from "lwc";

import INFO_TAB_NAME from "@salesforce/label/c.Info_Tab_Name_Label";
import PRODUCTS_TAB_NAME from "@salesforce/label/c.Products_Tab_Name_Label";
import CUSTOMIZATIONS_TAB_NAME from "@salesforce/label/c.Customizations_Tab_Name_Label";
import INSTALLATION_TAB_NAME from "@salesforce/label/c.Installation_Tab_Name_Label";
import CUSTOMER_VALIDATION_TAB_NAME from "@salesforce/label/c.Customer_Validation_Tab_Name";
import ORDER_REVIEW_TAB_NAME from "@salesforce/label/c.Order_Review_Tab_Name";
import CHECKOUT_TAB_NAME from "@salesforce/label/c.Checkout_Tab_Name_Label";
import ORDER_CONFIRMATION_TAB_NAME from "@salesforce/label/c.Order_Confirmation_Tab_Name_Label";
import ORDER_SUCCESS_TAB_NAME from "@salesforce/label/c.Order_Success_Tab_Name_Label";
import SPECTRUM_API from "@salesforce/label/c.Spectrum_API";
import USA from "@salesforce/label/c.USA";
import SPECTRUM_LOGO_URL from "@salesforce/label/c.Spectrum_Logo_URL";

const BUYFLOW_STEPS = [
    { label: INFO_TAB_NAME, value: "1" },
    { label: PRODUCTS_TAB_NAME, value: "2" },
    { label: CUSTOMIZATIONS_TAB_NAME, value: "3" },
    { label: INSTALLATION_TAB_NAME, value: "4" },
    { label: CUSTOMER_VALIDATION_TAB_NAME, value: "5" },
    { label: ORDER_REVIEW_TAB_NAME, value: "6" },
    { label: CHECKOUT_TAB_NAME, value: "7" },
    { label: ORDER_CONFIRMATION_TAB_NAME, value: "8" },
    { label: ORDER_SUCCESS_TAB_NAME, value: "9" }
];
export default class Poe_lwcBuyflowSpectrumApiParent extends LightningElement {
    @api recordId;
    @api origin;
    @api userId;
    @api contact;
    @api zip;
    @api returnUrl;
    @api isGuestUser;
    @api referralCodeData;
    sfOrderId;
    sfOrderItemId;
    referenceNumber;
    logo = SPECTRUM_LOGO_URL;
    currentStep = "1";
    showSpectrumInfoTab = true;
    showSpectrumProductsTab = false;
    showSpectrumCustomizationsTab = false;
    showSpectrumCreditCheckTab = false;
    showSpectrumInstallationTab = false;
    showSpectrumOrderReviewTab = false;
    showSpectrumPaymentTab = false;
    showSpectrumOrderConfirmationTab = false;
    showSpectrumOrderSuccessTab = false;
    offers;
    sessionId;
    addressInfo;
    productSelected;
    productSelection = {};
    installationInfo;
    alternativeInstallationInfo;
    earliestDate;
    cartInfo;
    cartProducts;
    cartCustomizations;
    cartInstallation;
    cartCreditCheck;
    cartPayment;
    orderInfo = {
        address: {
            addressLine1: "",
            addressLine2: "",
            addressLine2Type: "",
            city: "",
            state: "",
            zipCode: "",
            country: USA
        },
        customer: {
            firstName: "",
            middleName: "",
            lastName: "",
            emailAddress: "",
            phoneNumber: ""
        },
        account: {
            billingAddress: {
                addressLine1: "",
                addressLine2: "",
                city: "",
                state: "",
                country: "",
                zipCode: ""
            }
        }
    };
    useServiceAddress = true;
    autoPaySelected;
    prepayRequired;
    scheduleRequired = false;
    skipPayment = false;
    creditCheckPerformed = false;
    dob;
    automationSuccess;
    paperless;
    prepayment;
    dueToday = 0;
    hasPhone;
    hasMobile;
    delinquent;
    installationType;
    selfInstall;
    deliveryDate;
    mobileSelected = false;
    affiliateId;
    paymentAttempts;
    salesId;
    storedConfigurations = {};

    get buyflowSteps() {
        return BUYFLOW_STEPS;
    }

    connectedCallback() {
        this.updateTabOpportunity(INFO_TAB_NAME);
        this.saveSelfServiceStatistic(INFO_TAB_NAME);
        if (this.contact != null) {
            this.orderInfo.customer.firstName = this.contact.firstName;
            this.orderInfo.customer.lastName = this.contact.lastName;
            this.orderInfo.customer.emailAddress = this.contact.email;
            this.orderInfo.customer.phoneNumber = this.contact.phone;
        }
    }

    handleCheckServiceability(event) {
        this.checkIP();
        this.updateTabOpportunity(PRODUCTS_TAB_NAME);
        this.saveSelfServiceStatistic(PRODUCTS_TAB_NAME);
        this.addressInfo = event.detail.address;
        let address = {
            addressLine1: this.addressInfo.address,
            addressLine2: this.addressInfo.hasOwnProperty("apt") ? this.addressInfo.apt : "",
            city: this.addressInfo.city,
            state: this.addressInfo.state,
            country: USA,
            zipCode: this.addressInfo.zip
        };
        this.orderInfo.address = address;
        this.orderInfo.account.billingAddress = address;
        this.affiliateId = event.detail.affiliateId;
        this.salesId = event.detail?.salesId;
        this.offers = event.detail.offers;
        this.sessionId = event.detail.sessionId;
        this.showSpectrumInfoTab = false;
        this.showSpectrumProductsTab = true;
        this.currentStep = "2";
    }

    handleProductSelection(event) {
        this.checkIP();
        this.saveSelfServiceStatistic(CUSTOMIZATIONS_TAB_NAME);
        let productData = JSON.parse(JSON.stringify(event.detail));
        this.cartProducts = { ...productData.cart };
        this.hasPhone = productData.cart.monthlyCharges.phone.length > 0;
        this.hasMobile = productData.cart.monthlyCharges.mobile.length > 0;
        this.showSpectrumProductsTab = false;
        this.showSpectrumCustomizationsTab = true;
        this.productSelected = productData.productIds[0];
        this.productSelection = {
            offerId: this.productSelected,
            sessionId: this.sessionId,
            name: productData.productName
        };
        this.currentStep = "3";
    }

    handleCustomizationSelection(event) {
        this.saveSelfServiceStatistic(INSTALLATION_TAB_NAME);
        let productData = JSON.parse(JSON.stringify(event.detail));
        this.orderInfo.customer.phoneNumber = productData.portablePhone;
        this.mobileSelected = productData.mobileSelected;
        this.cartCustomizations = { ...productData.cart };
        this.showSpectrumCustomizationsTab = false;
        this.showSpectrumInstallationTab = true;
        this.currentStep = "4";
    }

    handleStoreConfigurations(event) {
        this.storedConfigurations = event.detail.storedConfigurations;
    }

    handleInstallationDateSelection(event) {
        this.checkIP();
        this.updateTabOpportunity(CUSTOMER_VALIDATION_TAB_NAME);
        this.saveSelfServiceStatistic(CUSTOMER_VALIDATION_TAB_NAME);
        this.scheduleRequired = event.detail.installationSchedule;
        this.installationInfo = event.detail.dateValue;
        this.installationType = event.detail.installationType;
        this.alternativeInstallationInfo = event.detail.alternativeDateValue;
        this.earliestDate = event.detail.earliestDate;
        this.selfInstall = event.detail.selfInstall;
        this.deliveryDate = event.detail.deliveryDate;
        this.cartInstallation = { ...event.detail.cart };
        this.showSpectrumInstallationTab = false;
        this.showSpectrumCreditCheckTab = true;
        this.currentStep = "5";
    }

    handleCreditCheckPassed(event) {
        this.checkIP();
        this.updateTabOpportunity("Order Summary");
        let productData = JSON.parse(JSON.stringify(event.detail));
        this.dueToday =
            Number(productData.paymentRequirements.prepaymentAmount) +
            Number(productData.paymentRequirements.delinquentBalance);
        this.cartCreditCheck = { ...event.detail.cart };
        this.orderInfo.customer.firstName = productData.customer.firstName;
        this.orderInfo.customer.lastName = productData.customer.lastName;
        this.orderInfo.customer.middleName = productData.customer.middleName;
        this.orderInfo.customer.emailAddress = productData.customer.email;
        this.orderInfo.customer.phoneNumber = productData.customer.phone;
        this.referenceNumber = productData.referenceNumber;
        this.paymentAttempts = productData.paymentAttempts;
        this.dob = productData.dob;
        this.prepayment = productData.prepayment;
        this.delinquent = productData.delinquent;
        this.paperless = productData.paperless;
        this.sfOrderId = productData.orderId;
        this.sfOrderItemId = productData.orderItemId;
        this.useServiceAddress = productData.useServiceAddress;
        this.autoPaySelected = productData.autoPay;
        if (!this.creditCheckPerformed) {
            this.prepayRequired = productData.paymentRequired;
        }
        this.skipPayment = !this.prepayRequired && !this.autoPaySelected;
        this.orderInfo.account.billingAddress = {
            addressLine1: productData.billingAddress.addressLine1,
            addressLine2: productData.billingAddress.hasOwnProperty("addressLine2")
                ? productData.billingAddress.addressLine2
                : "",
            city: productData.billingAddress.city,
            state: productData.billingAddress.state,
            country: productData.billingAddress.country,
            zipCode: productData.billingAddress.zipCode
        };
        this.creditCheckPerformed = true;
        this.showSpectrumCreditCheckTab = false;
        this.showSpectrumOrderReviewTab = true;
        this.currentStep = "6";
        this.saveSelfServiceStatistic(ORDER_REVIEW_TAB_NAME);
    }

    handleOrderReview(event) {
        this.checkIP();
        this.showSpectrumOrderReviewTab = false;
        if (this.skipPayment) {
            this.cartPayment = { ...this.cartCreditCheck };
            this.showSpectrumOrderConfirmationTab = true;
            this.saveSelfServiceStatistic(ORDER_CONFIRMATION_TAB_NAME);
            this.currentStep = "8";
        } else {
            this.showSpectrumPaymentTab = true;
            this.saveSelfServiceStatistic(CHECKOUT_TAB_NAME);
            this.currentStep = "7";
        }
        this.updateTabOpportunity("Payment");
    }
    handlePaymentValidated(event) {
        this.checkIP();
        this.saveSelfServiceStatistic(ORDER_CONFIRMATION_TAB_NAME);
        this.cartPayment = { ...event.detail.cart };
        this.showSpectrumPaymentTab = false;
        this.showSpectrumOrderConfirmationTab = true;
        this.currentStep = "8";
    }

    handleConfirmationNext(event) {
        this.checkIP();
        this.updateTabOpportunity(ORDER_SUCCESS_TAB_NAME);
        this.saveSelfServiceStatistic(ORDER_SUCCESS_TAB_NAME);
        this.orderNumber = event.detail.orderNumber;
        this.orderId = event.detail.orderId;
        this.automationSuccess = event.detail.automationSuccess;
        this.showSpectrumOrderConfirmationTab = false;
        this.showSpectrumOrderSuccessTab = true;
        this.currentStep = "9";
    }

    handleBack(event) {
        switch (this.currentStep) {
            case "2":
                this.currentStep = "1";
                this.showSpectrumInfoTab = true;
                this.showSpectrumProductsTab = false;
                this.saveSelfServiceStatistic(INFO_TAB_NAME);
                break;
            case "3":
                this.currentStep = "2";
                this.showSpectrumProductsTab = true;
                this.showSpectrumCustomizationsTab = false;
                this.saveSelfServiceStatistic(PRODUCTS_TAB_NAME);
                break;
            case "4":
                this.currentStep = "3";
                this.showSpectrumCustomizationsTab = true;
                this.showSpectrumInstallationTab = false;
                this.saveSelfServiceStatistic(CUSTOMIZATIONS_TAB_NAME);
                break;
            case "5":
                this.currentStep = "4";
                this.showSpectrumCreditCheckTab = false;
                this.showSpectrumInstallationTab = true;
                this.saveSelfServiceStatistic(INSTALLATION_TAB_NAME);
                break;
        }
    }

    checkIP() {
        this.dispatchEvent(new CustomEvent("checkip"));
    }

    handleLogError(event) {
        console.log("logerror event in parent: ", event);
        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: {
                    ...event.detail,
                    provider: "spectrum api",
                    opportunity: this.recordId
                }
            })
        );
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
                program: SPECTRUM_API,
                orderId: this.sfOrderId
            }
        });

        this.dispatchEvent(event);
    }
}