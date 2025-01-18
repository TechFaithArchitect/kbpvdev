import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const BUYFLOW_STEPS = [
    { label: "Info", value: "1" },
    { label: "Products", value: "2" },
    { label: "Credit Check", value: "3" },
    { label: "Configurations", value: "4" },
    { label: "Installation", value: "5" },
    { label: "Payment", value: "6" },
    { label: "Bill Preview", value: "7" },
    { label: "T&C", value: "8" }
];
export default class Poe_lwcBuyflowFrontierParent extends LightningElement {
    @api recordId;
    @api origin;
    @api userId;
    @api contact;
    @api currentStep = "1";
    @api isGuestUser;
    @api referralCodeData;
    offerId;
    cart = {
        hasQuote: false,
        hasTodayCharge: false,
        hasMonthlyCharge: false,
        todayCharges: [],
        monthlyCharges: [],
        todayTotal: (0.0).toFixed(2),
        monthlyTotal: (0.0).toFixed(2)
    };
    creditCheckCart;
    configurationsCart;
    portableNumber;
    reservedTN;
    btn;
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
    showFrontierCSATab = false;
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
    installationOptions = [];
    quoteNumber;
    autoPayNode = {};
    autoPayDiscounts = [];

    get buyflowSteps() {
        const steps = [...BUYFLOW_STEPS];
        if (this.isGuestUser) {
            steps.push({ label: "Order Success", value: "9" });
        } else {
            steps.push({ label: "CSA", value: "9" });
            steps.push({ label: "Order Success", value: "10" });
        }

        return steps;
    }

    connectedCallback() {
        this.clientInfo.contactInfo.firstName = this.contact.firstName !== "" ? this.contact.firstName : undefined;
        this.clientInfo.contactInfo.lastName = this.contact.lastName !== "" ? this.contact.lastName : undefined;
        this.clientInfo.contactInfo.email = this.contact.email !== "" ? this.contact.email : undefined;
        this.clientInfo.contactInfo.phone = this.contact.phone !== "" ? this.contact.phone : undefined;
        this.updateTabOpportunity("Info");
        this.saveSelfServiceStatistic("Info");
    }

    handleBack(e) {
        switch (this.currentStep) {
            case "2":
                this.currentStep = "1";
                this.showFrontierInfoTab = true;
                this.showFrontierProductsTab = false;
                this.saveSelfServiceStatistic("Info");
                break;
        }
    }

    handleCheckServiceability(e) {
        this.checkIP();
        this.saveSelfServiceStatistic("Products");
        this.updateTabOpportunity("Products");
        let data = JSON.parse(JSON.stringify(e.detail));
        this.clientInfo.addressInfo = data.addressData.addressInfo;
        this.clientInfo.address = data.addressData.address;
        this.clientInfo.address.addressLine1 = data.intAddress.AddressLine1;
        this.clientInfo.address.addressLine2 = data.intAddress.AddressLine2;
        this.clientInfo.address.city = data.intAddress.City;
        this.clientInfo.address.zipCode = data.intAddress.ZipCode;
        this.clientInfo.address.addressKey = data.intAddress.AddressKey;
        this.clientInfo.address.controlNumber = data.intAddress.ControlNumber;
        this.clientInfo.address.environment = data.intAddress.Environment;
        if (data.hasOwnProperty("contactInfo")) {
            this.clientInfo.contactInfo.firstName = data.contactInfo.hasOwnProperty("firstName")
                ? data.contactInfo.firstName
                : "";
            this.clientInfo.contactInfo.lastName = data.contactInfo.hasOwnProperty("lastName")
                ? data.contactInfo.lastName
                : "";
            this.clientInfo.contactInfo.email = data.contactInfo.hasOwnProperty("email") ? data.contactInfo.email : "";
            this.clientInfo.contactInfo.phone = data.contactInfo.hasOwnProperty("contactPhone")
                ? data.contactInfo.contactPhone
                : "";
        }
        this.accountId = data.hasOwnProperty("accountId") ? data.accountId : "";
        this.frontierUserId = data.frontierUserId;
        this.agentId = data.agentId;
        this.showFrontierInfoTab = false;
        this.showFrontierProductsTab = true;
        this.currentStep = "2";
    }

    handleProductSelection(e) {
        this.checkIP();
        this.updateTabOpportunity("Customer Information");
        this.saveSelfServiceStatistic("Credit Check");
        let productData = JSON.parse(JSON.stringify(e.detail));
        this.cartInfo = { ...productData.cart, hasQuote: true, orderNumber: productData.quoteId };
        this.quoteId = productData.quoteId;
        this.accountUuid = productData.accountUuid;
        this.showFrontierProductsTab = false;
        this.showFrontierCreditCheckTab = true;
        this.productSelected = productData.productSelected;

        this.currentStep = "3";
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
        this.clientInfo.contactInfo.firstName = data.contactInfo.firstName;
        this.clientInfo.contactInfo.lastName = data.contactInfo.lastName;
        this.clientInfo.contactInfo.email = data.contactInfo.email;
        this.clientInfo.contactInfo.phone = data.contactInfo.phone;
        this.accountId = data.accountId;
        this.creditCheckCart = data.cart;
        this.autoPay = data.paymentProfile.autoPay;
        this.referenceNumber = data.referenceNumber;
        this.paymentAttempts = data.paymentAttempts;
        this.eBill = data.paymentProfile.eBill;
        this.sfOrderId = data.orderId;
        this.orderItemId = data.orderItemId;
        this.manualCreditCheck = data.manualCreditCheck;
        this.autoPayNode = { ...data.autoPayNode };
        this.autoPayDiscounts = [...data.autoPayDiscounts];
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
        this.showFrontierConfigurationsTab = true;
        this.showFrontierCreditCheckTab = false;
        this.currentStep = "4";
        this.saveSelfServiceStatistic("Configurations");
        this.updateTabOpportunity("Configurations");
    }

    handleAutoPay(e) {
        this.autoPay = e.detail;
    }

    handleEBill(e) {
        this.eBill = e.detail;
    }

    handleConfigSelection(e) {
        this.saveSelfServiceStatistic("Installation");
        this.checkIP();
        let detail = JSON.parse(JSON.stringify(e.detail));
        this.configurationsCart = { ...detail.cart, orderNumber: detail.quoteNumber };
        this.portableNumber = detail.hasOwnProperty("portable") ? detail.portable : undefined;
        this.reservedTN = detail.reservedTN;
        this.btn = detail.btn;
        this.installationOptions = [...detail.installationOptions];
        this.quoteNumber = detail.quoteNumber;
        this.timeZone = { ...detail.timeZone };
        this.currentStep = "5";
        this.showFrontierConfigurationsTab = false;
        this.showFrontierTPVTab = true;
    }

    handleTPVNext(e) {
        this.updateTabOpportunity("Payment");
        this.saveSelfServiceStatistic("Payment");
        let detail = JSON.parse(JSON.stringify(e.detail));
        this.installationDetails = detail.installationDetails;
        this.installationDate = detail.date;
        this.earliestDate = detail.earliestDate;
        this.showFrontierTPVTab = false;
        this.showFrontierCheckoutTab = true;
        this.currentStep = "6";
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
        this.showFrontierCheckoutTab = false;
        this.showFrontierOrderConfirmationTab = true;
        this.currentStep = "7";
    }

    handleOrderConfirmationNext(e) {
        this.saveSelfServiceStatistic("T&C");
        this.checkIP();
        this.terms = [...JSON.parse(JSON.stringify(e.detail))];
        this.showFrontierOrderConfirmationTab = false;
        this.showFrontierTermsTab = true;
        this.currentStep = "8";
    }

    handleTermsNext(e) {
        this.updateTabOpportunity("Order Success");
        if (this.isGuestUser) {
            this.saveSelfServiceStatistic("Order Success");
            this.showFrontierOrderSuccessTab = true;
        } else {
            this.showFrontierCSATab = true;
        }
        let data = JSON.parse(JSON.stringify(e.detail));
        this.orderId = data.orderId;
        this.orderNumber = data.orderNumber;
        this.installationType = data.installationType;
        this.btn = data.btn;
        this.quoteNumber = data.quoteNumber;
        this.showFrontierTermsTab = false;
        this.currentStep = "9";
    }

    handleCSANext() {
        this.showFrontierCSATab = false;
        this.showFrontierOrderSuccessTab = true;
        this.currentStep = "10";
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