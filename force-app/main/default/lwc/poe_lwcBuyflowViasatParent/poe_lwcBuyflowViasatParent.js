import { LightningElement, api } from "lwc";

const BASE_BUYFLOW_STEPS = [
    { label: "Info", value: "1" },
    { label: "Products Preview", value: "2" },
    { label: "Customer Information", value: "3" },
    { label: "Product Selection", value: "4" },
    { label: "Configurations", value: "5" }
];
const VOICE_STEPS = [
    { label: "Voice", value: "6" },
    { label: "T&C", value: "7" },
    { label: "Checkout", value: "8" },
    { label: "Installation", value: "9" },
    { label: "Order Confirmation", value: "10" },
    { label: "Order Success", value: "11" }
];
const NO_VOICE_STEPS = [
    { label: "T&C", value: "6" },
    { label: "Checkout", value: "7" },
    { label: "Installation", value: "8" },
    { label: "Order Confirmation", value: "9" },
    { label: "Order Success", value: "10" }
];

export default class Poe_lwcBuyflowViasatParent extends LightningElement {
    @api recordId;
    @api origin;
    @api userId;
    @api contact;
    @api isGuestUser;
    @api referralCodeData;
    @api currentStep = "1";

    selectedProduct;
    showLoaderSpinner;
    logo = "/poe/sfsites/c/resource/POE_viIMG";
    showViasatInfoTab = true;
    showViasatProductsPreviewTab = false;
    showViasatProductsTab = false;
    showViasatCreditCheckTab = false;
    showViasatCartTab = false;
    showViasatTermsTab = false;
    showViasatCheckoutTab = false;
    showViasatTPVTab = false;
    showViasatOrderConfirmationTab = false;
    showViasatOrderSuccessTab = false;
    showViasatConfigurationsTab = false;
    showViasatVoiceTab = false;
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
            countryCode: ""
        },
        billingAddress: {
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            zipCode: "",
            county: "",
            countryCode: ""
        },
        shippingAddress: {
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            zipCode: "",
            county: "",
            countryCode: ""
        },
        contactInfo: {
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            phone: ""
        }
    };
    userInfo = {};
    accountId;
    referenceNumber;
    cartInfo;
    cartProducts;
    cartConfigurations;
    agreementId;
    fulfillmentAgreementId;
    productCallout;
    productSelectionCallout = {
        customerId: undefined
    };
    productConfigurationsCallout;
    tpvCallout;
    installationAppointment;
    userCreated;
    taxJurisdiction = {};
    paymentInfo = {};
    confirmationCallout;
    location;
    productSelected = {};
    orderId;
    sfOrderId;
    paymentAttempts;
    salesOnly = false;
    sfOrderItemId;
    candidates = [];
    billingDetails;
    configurationOrderRequest = {};
    voiceSelected;
    voiceId;
    productCandidateId;
    selectedAddonsAndOffers;
    showDisclosures = {};
    buyflowSteps = [...BASE_BUYFLOW_STEPS, ...NO_VOICE_STEPS];
    partyId;
    consent = false;

    connectedCallback() {
        this.clientInfo.contactInfo.firstName = this.contact.firstName !== "" ? this.contact.firstName : undefined;
        this.clientInfo.contactInfo.lastName = this.contact.lastName !== "" ? this.contact.lastName : undefined;
        this.clientInfo.contactInfo.email = this.contact.email !== "" ? this.contact.email : undefined;
        this.clientInfo.contactInfo.phone = this.contact.phone !== "" ? this.contact.phone : undefined;
        this.userInfo = {
            firstName: this.clientInfo.contactInfo.firstName,
            lastName: this.clientInfo.contactInfo.lastName,
            email: this.clientInfo.contactInfo.email,
            phone: this.clientInfo.contactInfo.phone
        };
        this.saveSelfServiceStatistic("Info");
        this.updateTabOpportunity("Info");
        if (!this.isGuestUser) {
            this.checkIP();
        }
    }

    handleBack(e) {
        if (!this.isGuestUser) {
            this.checkIP();
        }
        switch (this.currentStep) {
            case "2":
                this.currentStep = "1";
                this.showViasatInfoTab = true;
                this.showViasatProductsPreviewTab = false;
                this.saveSelfServiceStatistic("Info");
                break;
            case "3":
                this.currentStep = "2";
                this.showViasatProductsPreviewTab = true;
                this.showViasatCreditCheckTab = false;
                this.saveSelfServiceStatistic("Products Preview");
                break;
            case "4":
                this.currentStep = "3";
                this.showViasatCreditCheckTab = true;
                this.showViasatProductsTab = false;
                this.saveSelfServiceStatistic("Credit Check");
                break;
            case "5":
                this.currentStep = "4";
                this.showViasatProductsTab = true;
                this.showViasatConfigurationsTab = false;
                this.saveSelfServiceStatistic("Products");
                break;
            case "6":
                if (this.voiceSelected) {
                    this.showViasatVoiceTab = false;
                    this.showViasatConfigurationsTab = true;
                } else {
                    this.paymentAttempts = Number(e.detail);
                    this.showViasatConfigurationsTab = true;
                    this.showViasatTermsTab = false;
                }
                this.currentStep = "5";
                this.saveSelfServiceStatistic("Configurations");
                break;
            case "7":
                if (this.voiceSelected) {
                    this.paymentAttempts = Number(e.detail);
                    this.showViasatTermsTab = false;
                    this.showViasatVoiceTab = true;
                    this.saveSelfServiceStatistic("Voice");
                } else {
                    this.showViasatTermsTab = true;
                    this.showViasatCheckoutTab = false;
                    this.saveSelfServiceStatistic("T&C");
                }
                this.currentStep = "6";
                break;
            case "8":
                if (this.voiceSelected) {
                    this.showViasatCheckoutTab = false;
                    this.showViasatTermsTab = true;
                    this.saveSelfServiceStatistic("T&C");
                } else {
                    this.showViasatTPVTab = false;
                    this.showViasatCheckoutTab = true;
                    this.saveSelfServiceStatistic("Checkout");
                }
                this.currentStep = "7";
                break;
            case "9":
                this.showViasatCheckoutTab = true;
                this.showViasatTPVTab = false;
                this.currentStep = "8";
                this.saveSelfServiceStatistic("Checkout");
                break;
        }
    }

    handleCheckServiceability(e) {
        this.saveSelfServiceStatistic("Products Preview");
        if (!this.isGuestUser) {
            this.checkIP();
        }
        let data = JSON.parse(JSON.stringify(e.detail));
        this.clientInfo.address = data.address;
        this.agreementId = data.agreementId;
        this.fulfillmentAgreementId = data.fulfillmentAgreementId;
        this.salesOnly = data.salesOnly;
        this.productCallout = {
            tab: "products",
            partnerName: "viasat",
            salesAgreementId: this.agreementId,
            addressInfo: { ...data.addressInfo },
            location: {
                address: { ...data.address },
                latitude: String(data.latitude),
                longitude: String(data.longitude)
            }
        };
        this.partyId = data.partyId;
        this.showViasatInfoTab = false;
        this.showViasatProductsPreviewTab = true;
        this.currentStep = "2";
    }

    handleProductPreview(e) {
        this.updateTabOpportunity("Customer Information");
        this.saveSelfServiceStatistic("Credit Check");
        if (!this.isGuestUser) {
            this.checkIP();
        }
        this.agreementId = e.detail;
        this.productCallout.salesAgreementId = this.agreementId;
        this.showViasatProductsPreviewTab = false;
        this.showViasatCreditCheckTab = true;
        this.currentStep = "3";
    }

    handleUserCreation(e) {
        this.updateTabOpportunity("Products");
        this.saveSelfServiceStatistic("Products");
        let data = JSON.parse(JSON.stringify(e.detail));
        this.productSelectionCallout = { ...this.productCallout };
        this.productSelectionCallout.customerId = data.customerId;
        this.productSelectionCallout.taxIdentification = {
            countryCode: "US",
            dob: data.dob
        };
        if (data.ssn !== undefined) {
            this.productSelectionCallout.taxIdentification.ssn = data.ssn;
        }
        this.referenceNumber = data.referenceNumber;
        this.userInfo = { ...data.userInfo };
        this.clientInfo.contactInfo.firstName = data.userInfo.firstName;
        this.clientInfo.contactInfo.middleName = data.userInfo.middleName;
        this.clientInfo.contactInfo.lastName = data.userInfo.lastName;
        this.clientInfo.contactInfo.email = data.userInfo.email;
        this.clientInfo.contactInfo.phone = data.userInfo.phone;
        this.clientInfo.billingAddress = data.billingAddress;
        this.clientInfo.shippingAddress = data.shippingAddress;
        this.paymentAttempts = data.paymentAttempts;
        this.consent = data.consent;
        this.productSelectionCallout.tab = "products";
        this.accountId = data.accountId;
        this.showViasatCreditCheckTab = false;
        this.showViasatProductsTab = true;
        this.currentStep = "4";
    }

    handleProductSelection(e) {
        if (!this.isGuestUser) {
            this.checkIP();
        }
        let data = JSON.parse(JSON.stringify(e.detail));
        this.productSelected = { ...data.productSelected };
        this.showDisclosures = { ...data.showDisclosures };
        this.productConfigurationsCallout = { ...this.productSelectionCallout };
        this.productConfigurationsCallout.productTypeId = data.productTypeId;
        this.productConfigurationsCallout.shoppingCartId = data.shoppingCartId;
        this.productConfigurationsCallout.productCandidateId = data.productCandidateId;
        this.cartProducts = { ...data.cart };
        this.sfOrderId = data.orderId;
        this.sfOrderItemId = data.orderItemId;
        this.showViasatProductsTab = false;
        this.showViasatConfigurationsTab = true;
        this.offerId = this.productSelected.OfferId;
        this.candidates = [];
        this.currentStep = "5";
        this.saveSelfServiceStatistic("Configurations");
    }

    handleConfigurationsNext(e) {
        if (!this.isGuestUser) {
            this.checkIP();
        }
        let data = JSON.parse(JSON.stringify(e.detail));
        this.cartConfigurations = { ...data.cart };
        this.showDisclosures = { ...this.showDisclosures, ...data.showDisclosures };
        this.showViasatConfigurationsTab = false;
        this.candidates = [...data.candidates];
        this.voiceSelected = data.voiceSelected;
        this.productCandidateId = data.productCandidateId;
        this.selectedAddonsAndOffers = data.selectedAddonsAndOffers;
        if (this.voiceSelected) {
            this.buyflowSteps = [...BASE_BUYFLOW_STEPS, ...VOICE_STEPS];
            this.configurationOrderRequest = { ...data.orderRequest };
            this.voiceId = data.voiceId;
            this.showViasatVoiceTab = true;
            this.saveSelfServiceStatistic("Voice");
        } else {
            this.buyflowSteps = [...BASE_BUYFLOW_STEPS, ...NO_VOICE_STEPS];
            this.showDisclosures = { ...this.showDisclosures, portability: false };
            this.showViasatTermsTab = true;
            this.saveSelfServiceStatistic("T&C");
        }
        this.currentStep = "6";
    }

    handleVoiceNext(e) {
        this.saveSelfServiceStatistic("T&C");
        if (!this.isGuestUser) {
            this.checkIP();
        }
        let data = JSON.parse(JSON.stringify(e.detail));
        this.showDisclosures = { ...this.showDisclosures, ...data.showDisclosures };
        this.cartConfigurations = { ...data.cart };
        this.candidates = [...data.candidates];
        this.showViasatVoiceTab = false;
        this.showViasatTermsTab = true;
        this.currentStep = "7";
    }

    handleTermsNext(e) {
        this.updateTabOpportunity("Payment");
        this.saveSelfServiceStatistic("Checkout");
        if (!this.isGuestUser) {
            this.checkIP();
        }
        this.showViasatTermsTab = false;
        this.showViasatCheckoutTab = true;
        this.voiceSelected ? (this.currentStep = "8") : (this.currentStep = "7");
    }

    handleCheckoutNext(e) {
        if (!this.isGuestUser) {
            this.checkIP();
        }
        let data = { ...JSON.parse(JSON.stringify(e.detail)) };
        this.tpvCallout = {
            partnerName: "viasat",
            tab: "tpv",
            account: {
                shippingAddress: { ...this.clientInfo.shippingAddress }
            },
            customerId: this.productSelectionCallout.customerId,
            billingAccountNumber: data.billingAccountNumber,
            fulfillmentAgreementId: this.fulfillmentAgreementId,
            shoppingCartId: this.productConfigurationsCallout.shoppingCartId
        };
        this.paymentInfo = { ...data.payment };
        this.taxJurisdiction = { ...data.taxJurisdiction };
        this.showViasatCheckoutTab = false;
        if (this.salesOnly) {
            this.installationAppointment = { startTime: "", endTime: "" };
            let finalData = this.tpvCallout;
            finalData.orderInfo = this.orderInfo;
            finalData.taxJurisdiction = this.taxJurisdiction;
            finalData.clientInfo = this.clientInfo;
            finalData.payment = this.paymentInfo;
            finalData.salesAgreementId = this.agreementId;
            finalData.serviceLocation = { ...this.productCallout.location };
            finalData.productSelected = { ...this.productSelected };
            this.confirmationCallout = finalData;
            this.showViasatOrderConfirmationTab = true;
            this.voiceSelected ? (this.currentStep = "10") : (this.currentStep = "9");
            this.saveSelfServiceStatistic("Order Confirmation");
        } else {
            this.showViasatTPVTab = true;
            this.voiceSelected ? (this.currentStep = "9") : (this.currentStep = "8");
            this.saveSelfServiceStatistic("Installation");
        }
    }

    handleTPVNext(e) {
        this.updateTabOpportunity("Order Submitted");
        this.saveSelfServiceStatistic("Order Confirmation");
        if (!this.isGuestUser) {
            this.checkIP();
        }
        let data = { ...JSON.parse(JSON.stringify(e.detail)) };
        this.installationAppointment = { ...data.appointment };
        let finalData = this.tpvCallout;
        finalData.orderInfo = this.orderInfo;
        finalData.taxJurisdiction = this.taxJurisdiction;
        finalData.clientInfo = this.clientInfo;
        finalData.payment = this.paymentInfo;
        finalData.salesAgreementId = this.agreementId;
        finalData.serviceLocation = { ...this.productCallout.location };
        finalData.productSelected = { ...this.productSelected };
        if (data.appointment) {
            finalData.appointment = { ...data.appointment };
        }
        finalData.earliestDate = data.earliestDate;
        this.confirmationCallout = finalData;
        this.showViasatTPVTab = false;
        this.showViasatOrderConfirmationTab = true;
        this.voiceSelected ? (this.currentStep = "10") : (this.currentStep = "9");
    }

    handleOrderConfirmationNext(e) {
        this.updateTabOpportunity("Order Success");
        this.saveSelfServiceStatistic("Order Success");
        let data = { ...JSON.parse(JSON.stringify(e.detail)) };
        if (!this.isGuestUser) {
            this.checkIP();
        }
        this.orderId = data.orderId;
        this.showViasatOrderConfirmationTab = false;
        this.showViasatOrderSuccessTab = true;
        this.voiceSelected ? (this.currentStep = "11") : (this.currentStep = "10");
    }

    checkIP() {
        this.dispatchEvent(new CustomEvent("checkip"));
    }

    saveSelfServiceStatistic(tab) {
        if (!this.isGuestUser) {
            return;
        }

        const event = new CustomEvent("selfservicestatistic", {
            detail: {
                tabName: tab,
                program: "Viasat",
                orderId: this.sfOrderId
            }
        });

        this.dispatchEvent(event);
    }

    handleBillingSuccess(event) {
        this.billingDetails = event.detail;
    }

    updateTabOpportunity(value) {
        let event = new CustomEvent("tabupdate", {
            detail: { tab: value }
        });
        this.dispatchEvent(event);
    }

    handleLogError(event) {
        console.log("logerror event in parent: ", event);
        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: {
                    ...event.detail,
                    provider: "Viasat",
                    opportunity: this.recordId
                }
            })
        );
    }
}