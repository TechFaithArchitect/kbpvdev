import { LightningElement, api } from "lwc";
import termsLabel from "@salesforce/label/c.Terms_Tab_Name_Label";

export default class Poe_lwcBuyflowWindstreamParent extends LightningElement {
    @api recordId;
    @api origin;
    @api userId;
    @api contact;
    @api currentStep = "1";
    @api isGuestUser;
    @api nationalRetail;
    @api referralCodeData;
    offerId;
    selectedProduct;
    dateSelected;
    showLoaderSpinner;
    logo = "/poe/sfsites/c/resource/POE_wiIMG";
    showWindstreamInfoTab = true;
    showWindstreamProductsTab = false;
    showWindstreamAddersTab = false;
    showWindstreamCreditCheckTab = false;
    showWindstreamCartTab = false;
    showWindstreamTermsTab = false;
    showWindstreamCheckoutTab = false;
    showWindstreamTPVTab = false;
    showWindstreamOrderConfirmationTab = false;
    showWindstreamOrderSuccessTab = false;
    confirmationLabel = "Order Success";
    creditCheckResponseVerbiage = "";
    reviewPhoneNumber;
    selectedBuyFlow;
    clientInfo = {
        addressInfo: {
            address: "",
            apt: "",
            city: "",
            state: "",
            zip: ""
        },
        address: {
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            zipCode: "",
            county: ""
        },
        billingAddress: {
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            zipCode: "",
            county: ""
        },
        contactInfo: {
            firstName: "",
            middleName: "",
            lastName: "",
            county: "",
            email: "",
            phone: ""
        },
        selectedAddressInfo: {
            mirorPackage: "",
            serviceKey: "",
            townCode: "",
            addressStatus: "",
            uqualAddressId: "",
            phoneNumber: "",
            billingAcctNbr: ""
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

    additionalInfo = {
        textMsgOptin: "",
        authorizedUserName: "",
        authorizedUserPhone: "",
        accountPin: "",
        customerRemarks: ""
    };

    orderInfo = {
        selectedHsiSpeed: "",
        selectedBundle: "",
        selectedBundleAdders: []
    };
    referenceNumber;
    cartInfo;
    creditCheckCallout;
    confirmationCallout;
    paymentCallout;
    shippingCost;
    orderNumber;
    orderId;
    cartProducts;
    cartAdders;
    cartCredit;
    cartCheckout;
    sfOrder;
    sfOrderItem;
    isBundle;
    adderSelection;
    skipInstallDateSelection = false;
    skipInstallation;
    hasAutoPay = false;
    portability;
    portabilityData;
    manualReview;
    preQualified = false;
    apiPreQualified = false;
    creditCheckLabel = "Credit Check";
    creditCheckLimitOfferId;
    autoPayChanged;
    forcedAutoPay = false;
    copperDropReview = false;
    fakeSSNLimit = 0;
    noInstallation = false;
    pins = {};
    applicableDisclaimers = [];
    labels = {
        termsLabel
    };

    get buyflowSteps() {
        return [
            { label: "Info", value: "1" },
            { label: "Products", value: "2" },
            { label: "Adders", value: "3" },
            { label: this.creditCheckLabel, value: "4" },
            { label: "Order Summary", value: "5" },
            { label: "Checkout", value: "6" },
            { label: "Installation - TPV", value: "7" },
            { label: this.labels.termsLabel, value: "8" },
            { label: "Order Confirmation", value: "9" },
            { label: this.confirmationLabel, value: "10" }
        ];
    }

    connectedCallback() {
        this.selectedBuyFlow =
            (this.origin == "retail" && !this.nationalRetail) || this.isGuestUser
                ? "phonesales"
                : this.origin === "maps"
                ? "d2d"
                : this.origin;
        this.clientInfo.contactInfo.firstName = this.contact.firstName !== "" ? this.contact.firstName : undefined;
        this.clientInfo.contactInfo.lastName = this.contact.lastName !== "" ? this.contact.lastName : undefined;
        this.clientInfo.contactInfo.email = this.contact.email !== "" ? this.contact.email : undefined;
        this.clientInfo.contactInfo.phone = this.contact.phone !== "" ? this.contact.phone : undefined;
        this.checkIP();
        this.updateTabOpportunity("Info");
        this.saveSelfServiceStatistic("Info");
    }

    handleBack(e) {
        this.checkIP();
        switch (this.currentStep) {
            case "2":
                this.currentStep = "1";
                this.showWindstreamInfoTab = true;
                this.showWindstreamProductsTab = false;
                this.saveSelfServiceStatistic("Info");
                break;
            case "3":
                this.currentStep = "2";
                this.showWindstreamProductsTab = true;
                this.showWindstreamAddersTab = false;
                this.adderSelection = undefined;
                this.saveSelfServiceStatistic("Products");
                break;
            case "4":
                this.currentStep = "3";
                this.showWindstreamAddersTab = true;
                this.showWindstreamCreditCheckTab = false;
                this.saveSelfServiceStatistic("Adders");
                break;
            case "5":
                this.currentStep = "4";
                this.showWindstreamCreditCheckTab = true;
                this.showWindstreamCartTab = false;
                this.saveSelfServiceStatistic("Credit Check");
                break;
            case "6":
                this.currentStep = "5";
                this.showWindstreamCartTab = true;
                this.showWindstreamCheckoutTab = false;
                this.saveSelfServiceStatistic("Order Summary");
                break;
            case "7":
                this.currentStep = "6";
                this.showWindstreamCheckoutTab = true;
                this.showWindstreamTPVTab = false;
                this.saveSelfServiceStatistic("Checkout");
                break;
            case "8":
                this.currentStep = "7";
                this.showWindstreamTermsTab = false;
                if (!this.skipInstallation) {
                    this.currentStep = "7";
                    this.showWindstreamTPVTab = true;
                    this.saveSelfServiceStatistic("Installation - TPV");
                } else {
                    this.currentStep = "6";
                    this.showWindstreamCheckoutTab = true;
                    this.saveSelfServiceStatistic("Checkout");
                }
                break;
            case "9":
                this.currentStep = "8";
                this.showWindstreamOrderConfirmationTab = false;
                this.showWindstreamTermsTab = true;
                this.saveSelfServiceStatistic("T&C");
                break;
        }
    }

    handleCheckServiceability(e) {
        this.updateTabOpportunity("Products");
        this.saveSelfServiceStatistic("Products");
        this.checkIP();
        let serviceAvailabilityData = { ...JSON.parse(JSON.stringify(e.detail.addressData)) };
        this.clientInfo.addressInfo = { ...serviceAvailabilityData.addressInfo };
        this.clientInfo.address = { ...serviceAvailabilityData.address };
        this.clientInfo.selectedAddressInfo = { ...serviceAvailabilityData.selectedAddressInfo };
        if (serviceAvailabilityData?.additionalAddress) {
            this.clientInfo.additionalAddress = { ...serviceAvailabilityData.additionalAddress };
            this.clientInfo.addressType = serviceAvailabilityData.addressType;
        }
        this.showWindstreamInfoTab = false;
        this.showWindstreamProductsTab = true;
        this.currentStep = "2";
    }

    handleProductSelection(e) {
        this.saveSelfServiceStatistic("Adders");
        this.checkIP();
        let productData = JSON.parse(JSON.stringify(e.detail));
        this.orderInfo = productData.orderInfo;
        this.offerId = productData.offerId;
        this.cartInfo = productData.cartInfo;
        this.skipInstallation = productData.skipInstallation;
        this.copperDropReview = productData.copperDropReview;
        this.apiPreQualified = productData.preQualified;
        this.cartProducts = { ...productData.cart };
        let productNames = [];
        productNames.push(this.orderInfo.selectedBundle);
        this.selectedProduct = productNames.join(";");
        this.applicableDisclaimers = [...productData.applicableDisclaimers];
        this.showWindstreamProductsTab = false;
        this.showWindstreamAddersTab = true;
        this.currentStep = "3";
    }

    handleAddersSelection(e) {
        this.updateTabOpportunity("Customer Information");
        this.saveSelfServiceStatistic("Credit Check");
        this.checkIP();
        let data = JSON.parse(JSON.stringify(e.detail));
        this.cartAdders = data.cart;
        this.hasAutoPay = data.hasAutoPay;
        this.preQualified = this.apiPreQualified && this.hasAutoPay;
        this.creditCheckLabel = this.preQualified ? "Customer Information" : "Credit Check";
        this.adderSelection = data.adderSelection;
        this.portability = data.portability;
        if (this.portability) {
            this.portabilityData = data.portabilityData;
        }
        this.skipInstallation == false ? (this.skipInstallation = data.skipInstallation) : undefined;
        this.orderInfo.selectedBundleAdders = [];
        this.applicableDisclaimers = [...this.applicableDisclaimers, ...data.applicableDisclaimers];
        this.showWindstreamAddersTab = false;
        this.showWindstreamCreditCheckTab = true;
        this.currentStep = "4";
    }

    handleCreditCheckPassed(e) {
        this.updateTabOpportunity("Order Summary");
        this.checkIP();
        this.clientInfo = { ...this.clientInfo, ...e.detail.clientInfo };
        this.sfOrder = e.detail.orderId;
        this.sfOrderItem = e.detail.orderItemId;
        this.referenceNumber = e.detail.referenceNumber;
        this.creditCheckCallout = e.detail.creditCheckCallout;
        this.hasAutoPay = e.detail.hasAutoPay;
        this.forcedAutoPay = e.detail.forcedAutoPay;
        this.cartCredit = { ...e.detail.cart };
        this.skipInstallDateSelection = e.detail.skipInstallDateSelection;
        this.manualReview = e.detail.manualReview;
        this.reviewPhoneNumber = e.detail.reviewPhoneNumber;
        this.creditCheckResponseVerbiage = e.detail.creditCheckResponseVerbiage;
        this.cartInfo = { ...e.detail.cartInfo };
        this.adderSelection = { ...e.detail.adderSelection };
        this.orderInfo.selectedBundleAdders = [];
        this.additionalInfo = JSON.parse(JSON.stringify(e.detail?.additionalInfo));
        this.fakeSSNLimit = e.detail.fakeSSNLimit;
        this.pins = { ...e.detail.pins };
        for (const property in this.additionalInfo) {
            if (this.additionalInfo.hasOwnProperty(property)) {
                this.orderInfo[property] = this.additionalInfo[property];
            }
        }
        let allAdders = [...Object.values(this.adderSelection).flat(Infinity)];
        allAdders.forEach((item) => {
            if (item.isChecked) {
                let newAdder = {
                    bundleAdderName: item.Name
                };
                this.orderInfo.selectedBundleAdders.push(newAdder);
            }
        });
        this.showWindstreamCreditCheckTab = false;
        this.showWindstreamCartTab = true;
        this.currentStep = "5";
        this.saveSelfServiceStatistic("Order Summary");
    }

    handleCartNext(e) {
        this.updateTabOpportunity("Payment");
        this.saveSelfServiceStatistic("Checkout");
        this.checkIP();
        this.showWindstreamCartTab = false;
        this.showWindstreamTermsTab = false;
        this.showWindstreamCheckoutTab = true;
        this.currentStep = "6";
    }

    handleCheckoutNext(e) {
        this.checkIP();
        let data = JSON.parse(JSON.stringify(e.detail));
        this.hasAutoPay = data.hasAutoPay;
        this.autoPayChanged = data.autoPayChanged;
        this.adderSelection = { ...data.adderSelection };
        if (this.hasAutoPay && !this.manualReview) {
            this.skipInstallDateSelection = false;
        }
        this.orderInfo.selectedBundleAdders = [];
        let allAdders = [...Object.values(this.adderSelection).flat(Infinity)];
        allAdders.forEach((item) => {
            if (item.isChecked) {
                let newAdder = {
                    bundleAdderName: item.Name
                };
                this.orderInfo.selectedBundleAdders.push(newAdder);
            }
        });
        if (this.portability) {
            this.orderInfo.portinPhoneNumber = this.portabilityData.PortinPhoneNumber;
            this.orderInfo.currentProvider = this.portabilityData.CurrentProvider;
            this.orderInfo.currentAccount = this.portabilityData.CurrentAccount;
            this.orderInfo.currentPin = this.portabilityData.CurrentPin;
        }
        this.cartCheckout = { ...data.cart };
        this.showWindstreamCheckoutTab = false;
        if (!this.skipInstallation) {
            this.saveSelfServiceStatistic("Installation - TPV");
            this.showWindstreamTPVTab = true;
            this.reviewPhoneNumber != undefined
                ? (this.orderInfo.reviewPhoneNumber = this.reviewPhoneNumber)
                : undefined;
            this.currentStep = "7";
        } else {
            this.saveSelfServiceStatistic("T&C");
            let finalData = JSON.parse(JSON.stringify(this.creditCheckCallout));
            finalData.orderInfo = this.orderInfo;
            finalData.installationDetails = {
                date: "",
                startTime: "",
                endTime: ""
            };
            if (finalData.hasOwnProperty("disclaimers")) {
                delete finalData.disclaimers;
            }
            this.confirmationCallout = finalData;
            this.confirmationLabel = "Order Needs Review";
            this.showWindstreamTermsTab = true;
            this.currentStep = "8";
        }
    }

    handleTPVNext(e) {
        this.saveSelfServiceStatistic("T&C");
        this.checkIP();
        let skipDate = e?.detail?.skipDate;
        let noInstallation = e?.detail?.noInstallation;
        this.skipInstallDateSelection = skipDate;
        this.noInstallation = noInstallation;
        let finalData = JSON.parse(JSON.stringify(this.creditCheckCallout));
        skipDate === false ? (this.dateSelected = e.detail.date) : (this.dateSelected = "");
        finalData.orderInfo = this.orderInfo;
        finalData.installationDetails = {
            date: skipDate === false ? e.detail.date.substring(0, 10) : "",
            startTime: skipDate === false ? e.detail.date.substring(11, 16) : "",
            endTime: skipDate === false ? e.detail.date.substring(19, 24) : ""
        };
        finalData.earliestDate = e.detail.earliestDate;
        finalData.orderInfo.verificationCode = this.pins.phone;
        finalData.orderInfo.emailVerificationCode = this.pins.email;
        delete finalData.disclaimers;
        this.confirmationCallout = finalData;
        this.skipInstallDateSelection
            ? (this.confirmationLabel = "Order Needs Review")
            : (this.confirmationLabel = "Order Success");
        this.showWindstreamTPVTab = false;
        this.showWindstreamTermsTab = true;
        this.currentStep = "8";
    }

    handleTermsNext() {
        this.updateTabOpportunity("Order Submitted");
        this.saveSelfServiceStatistic("Order Confirmation");
        this.currentStep = "9";
        this.showWindstreamTermsTab = false;
        this.showWindstreamOrderConfirmationTab = true;
    }

    handleOrderConfirmationNext(e) {
        this.updateTabOpportunity("Order Success");
        this.saveSelfServiceStatistic("Order Success");
        this.checkIP();
        this.orderNumber = e.detail.orderNumber;
        this.orderId = e.detail.orderId;
        this.showWindstreamOrderConfirmationTab = false;
        this.showWindstreamOrderSuccessTab = true;
        this.currentStep = "10";
    }

    checkIP() {
        this.dispatchEvent(new CustomEvent("checkip"));
    }

    handleLogError(event) {
        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: {
                    ...event.detail,
                    provider: "Windstream",
                    opportunity: this.recordId
                }
            })
        );
    }

    handleSetProductStep(event) {
        this.offerId = undefined;
        this.fakeSSNLimit = event.detail.fakeSSNLimit;
        this.showWindstreamCreditCheckTab = false;
        this.showWindstreamProductsTab = true;
        this.currentStep = "2";
    }

    handleCreditCheckAttempt(event) {
        this.creditCheckLimitOfferId = event.detail;
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
                program: "Windstream",
                orderId: this.sfOrder
            }
        });
        this.dispatchEvent(event);
    }
}