import { LightningElement, api } from "lwc";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";

export default class Poe_lwcBuyflowDirecTvParent extends LightningElement {
    @api recordId;
    @api origin;
    @api userId;
    @api contact;
    @api returnUrl;
    @api codeFFL;
    @api codeNFFL;
    @api currentStep = "1";
    included;
    accountId;
    isStream = false;
    orderQualReq;
    todaysCharges;
    creditCheckRequired;
    offerId;
    selectedProduct;
    dateSelected;
    showLoaderSpinner;
    hardwareTabInfo;
    dealerCode;
    NFFL = false;
    logo = "/poe/sfsites/c/resource/POE_dtvIMG";
    showDirecTVInfoTab = true;
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
            phone: ""
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
    hardwareSelectedRequest;
    orderInfo = {
        dealerCode: "",
        partnerName: "",
        productType: "",
        partnerOrderNumber: "",
        componentCode: "",
        customerType: "",
        orderNumber: "",
        address: {
            addressLine1: "",
            addressLine2: "",
            addressLine2Type: "",
            city: "",
            state: "",
            zipCode: "",
            country: "USA"
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
            },
            shippingAddress: {
                addressLine1: "",
                addressLine2: "",
                city: "",
                state: "",
                country: "",
                zipCode: ""
            }
        },
        dtv: {},
        atv: {}
    };
    estimatedFirstMonthTotal;
    referenceNumber;
    cartInfo;
    creditCheckCallout;
    confirmationCallout;
    paymentCallout;
    paymentMethod;
    shippingCost;
    orderNumber;
    orderId;
    orderItemId;
    billingAddress;
    productSelected;
    hardwareSelected;
    legalCustomizations = {
        creditCheckVerbiage1: "",
        creditCheckVerbiage2: "",
        userValidationVerbiage: "",
        paperlessVerbiage: "",
        autopayVerbiage: ""
    };
    paymentInfo;
    installationInfo;
    mustPayInFull = false;
    sfOrderId;
    futureCharges;
    paymentAttempts;
    skipCreditCheck = false;
    suggestedAddressSelected = false;
    productContractTypeIsTaz = false;
    emailVerified = false;

    connectedCallback() {
        this._actionUtil = new OmniscriptActionCommonUtil();
        this.checkIP();
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
                break;
            case "3":
                this.currentStep = "2";
                this.showDirecTVProductsTab = true;
                this.showDirecTVCreditCheckTab = false;
                break;
            case "4":
                this.currentStep = "3";
                this.showDirecTVCreditCheckTab = true;
                this.showDirecTVHardwareTab = false;
                break;
            case "5":
                this.currentStep = "4";
                this.showDirecTVHardwareTab = true;
                this.showDirecTVOffersTab = false;
                break;
            case "6":
                this.currentStep = "5";
                this.showDirecTVOffersTab = true;
                this.showDirecTVOptionsTab = false;
                break;
            case "7":
                this.currentStep = "6";
                this.showDirecTVOptionsTab = true;
                this.showDirecTVSummaryTab = false;
                break;
            case "8":
                this.currentStep = "6";
                this.showDirecTVOptionsTab = true;
                this.showDirecTVTermsTab = false;
                break;
            case "9":
                this.currentStep = "8";
                this.showDirecTVTermsTab = true;
                this.showDirecTVOrderChecklistTab = false;
                break;
            case "10":
                this.currentStep = "8";
                this.showDirecTVTermsTab = true;
                this.showDirecTVTPVTab = false;
                break;
            case "11":
                this.paymentAttempts = Number(e.detail);
                this.showDirecTVPaymentInformation = false;
                if (this.isStream || this.NFFL) {
                    this.currentStep = "8";
                    this.showDirecTVTermsTab = true;
                } else {
                    this.showDirecTVTPVTab = true;
                    this.currentStep = "10";
                }
                break;
            case "12":
                this.currentStep = "11";
                this.showDirecTVOrderConfirmationTab = false;
                this.showDirecTVTPVTab = true;
                break;
        }
    }

    handleCheckServiceability(e) {
        this.checkIP();
        let response = JSON.parse(JSON.stringify(e.detail));
        this.orderInfo.customer = JSON.parse(JSON.stringify(e.detail.orderInfo.customer));
        this.orderInfo.address = JSON.parse(JSON.stringify(e.detail.orderInfo.address));
        this.orderInfo.customerType = JSON.parse(JSON.stringify(e.detail.orderInfo.customerType));
        this.orderInfo.dtv = JSON.parse(JSON.stringify(e.detail.orderInfo.dtv));
        this.orderInfo.atv = JSON.parse(JSON.stringify(e.detail.orderInfo.atv));
        this.orderInfo.customer = JSON.parse(JSON.stringify(e.detail.orderInfo.customer));
        this.orderInfo.customer.middleName =
            this.orderInfo.customer.middleName === null || this.orderInfo.customer.middleName === undefined
                ? ""
                : this.orderInfo.customer.middleName;
        this.orderInfo.dealerCode = e.detail.dealerCode;
        this.accountId = e.detail.accountId;
        this.dealerCode = e.detail.dealerCode;
        response.hasOwnProperty("multiAddress") ? (this.suggestedAddressSelected = response.multiAddress) : undefined;
        this.NFFL = e.detail.NFFL;
        this.showDirecTVInfoTab = false;
        this.showDirecTVProductsTab = true;
        this.currentStep = "2";
    }

    handleProductSelection(e) {
        this.checkIP();
        let productData = JSON.parse(JSON.stringify(e.detail));
        this.included = JSON.parse(productData.included);
        this.cartInfo = productData.cartInfo;
        this.isStream = productData.orderInfo.productType === "atv" ? true : false;
        if (!this.isStream) {
            this.paymentMethod = undefined;
        } else {
            this.NFFL = false;
            productData.orderInfo.product.contractType == "TAZ"
                ? (this.productContractTypeIsTaz = true)
                : (this.productContractTypeIsTaz = false);
        }
        this.orderInfo.productType = productData.orderInfo.productType;
        this.productSelected = productData.selectedProduct;
        this.orderInfo.partnerName = productData.orderInfo.partnerName;
        this.orderInfo.componentCode = productData.orderInfo.componentCode;
        this.orderInfo.orderNumber = productData.orderInfo.orderNumber;
        this.orderInfo.partnerOrderNumber = productData.orderInfo.partnerOrderNumber;
        this.internationalRequired = productData.internationalRequired;
        this.showDirecTVProductsTab = false;
        this.showDirecTVCreditCheckTab = true;
        this.currentStep = "3";
    }

    handleCreditCheckPassed(e) {
        this.checkIP();
        this.mustPayInFull = e.detail.payInFull;
        this.orderInfo.account.billingAddress = JSON.parse(JSON.stringify(e.detail.billingAddress));
        this.referenceNumber = e.detail.referenceNumber;
        this.sfOrderId = this.sfOrderId == undefined ? e.detail.orderId : this.orderItemId;
        this.orderItemId = this.orderItemId == undefined ? e.detail.orderItemId : this.orderItemId;
        this.cartCreditCheck = e.detail.cart;
        this.showDirecTVCreditCheckTab = false;
        this.paymentAttempts = e.detail.paymentAttempts;
        this.productDetailResponse = e.detail.productDetailResponse;
        this.showDirecTVHardwareTab = true;
        this.currentStep = "4";
    }

    handleProductDetail(e) {
        this.checkIP();
        if (this.isStream) {
            this.paymentMethod = e.detail.method;
        }
        this.productDetailResponse = JSON.parse(JSON.stringify(e.detail.response));
        this.creditCheckRequired =
            this.productDetailResponse.componentProperties.creditCheckRequired === "True" ? true : false;
        this.componentCustomizations = JSON.parse(JSON.stringify(e.detail.response.componentCustomizations));
        this.hardwareTabInfo = JSON.parse(JSON.stringify(e.detail));
        this.hardwareSelected = this.hardwareTabInfo.chosen.quantity;
        this.cartHardware = { ...this.hardwareTabInfo.cartInfo };
        this.hardwareSelectedRequest = e.detail.preQualRequest;
        this.productDetailResponse.legalCustomizations.forEach((item) => {
            if (item.customization.properties.subGroupName === "ATVUserValidationVerbiage") {
                this.legalCustomizations.userValidationVerbiage = item.customization.choices[0].choice.description;
            }
            if (item.customization.properties.subGroupName === "VideoABPPaymentVerbiage") {
                item.customization.choices.forEach((element) => {
                    if (element.choice.properties.usoc === "ABP-PAPERLESS-VID-SPC") {
                        this.legalCustomizations.paperlessVerbiage = element.choice.longDescription;
                    }
                    if (element.choice.properties.usoc === "ABP-AUTOPAY-VID-SPC") {
                        this.legalCustomizations.autopayVerbiage = element.choice.longDescription;
                    }
                });
            }
        });
        this.showDirecTVHardwareTab = false;
        this.currentStep = "5";
        this.showDirecTVOffersTab = true;
    }

    handleRemoveProduct() {
        this.checkIP();
        this.showDirecTVCreditCheckTab = false;
        this.showDirecTVProductsTab = true;
        this.currentStep = "2";
    }

    handleOffersNext(e) {
        this.checkIP();
        this.cartOffers = e.detail.cartInfo;
        this.offersSelected = e.detail.offersSelected;
        this.showDirecTVOffersTab = false;
        this.showDirecTVOptionsTab = true;
        this.currentStep = "6";
    }

    handleOptionsNext(e) {
        this.checkIP();
        let info = JSON.parse(JSON.stringify(e.detail));
        this.orderInfo.account.billingAddress = info.billingAddress;
        this.orderInfo.account.shippingAddress = info.shippingAddress;
        if (info.hasOwnProperty("securityVerification")) {
            this.orderInfo.securityVerification = info.securityVerification;
        }
        this.emailVerified = true;
        this.showDirecTVOptionsTab = false;
        this.showDirecTVTermsTab = true;
        this.currentStep = "8";
    }

    handleTermsNext(e) {
        this.checkIP();
        this.orderQualReq = e.detail.orderQualReq;
        this.todaysCharges = e.detail.todaysCharges;
        this.cartTerms = e.detail.cart;
        let todayCharges = this.cartTerms.todayCharges;
        let monthlyCharges = this.cartTerms.monthlyCharges;
        let firstBillCharges = this.cartTerms.firstBillCharges;
        let trimmedMonthlyCharges = monthlyCharges.filter((item) => item !== null);
        let trimmedTodayCharges = todayCharges.filter((item) => item !== null);
        let trimmedFirstBillCharges = firstBillCharges.filter((item) => item !== null);
        this.cartTerms.monthlyCharges = [...trimmedMonthlyCharges];
        this.cartTerms.todayCharges = [...trimmedTodayCharges];
        this.cartTerms.firstBillCharges = [...trimmedFirstBillCharges];
        this.futureCharges = e.detail.futureCharges;
        this.showDirecTVTermsTab = false;
        if (this.isStream || this.NFFL) {
            this.showDirecTVPaymentInformation = true;
            this.currentStep = "11";
        } else {
            this.showDirecTVTPVTab = true;
            this.currentStep = "10";
        }
    }

    handleOrderChecklistNext(e) {
        this.checkIP();
        this.showDirecTVPaymentInformation = true;
        this.showDirecTVOrderChecklistTab = false;
        this.currentStep = "10";
    }

    handleTPVNext(e) {
        this.checkIP();
        this.installationInfo = e.detail;
        this.showDirecTVTPVTab = false;
        this.showDirecTVPaymentInformation = true;
        this.currentStep = "11";
    }

    handlePaymentInformationNext(e) {
        this.checkIP();
        this.paymentInfo = e.detail.cardInfo;
        this.cartPayment = e.detail.cart;
        this.orderQualReq = e.detail.request;
        this.showDirecTVPaymentInformation = false;
        this.showDirecTVPaymentConfirmationTab = true;
        this.currentStep = "12";
    }

    handleOrderConfirmationNext(e) {
        this.checkIP();
        this.orderNumber = e.detail.orderNumber;
        this.orderId = e.detail.orderId;
        this.showDirecTVPaymentConfirmationTab = false;
        this.showDirecTVOrderSuccessTab = true;
        this.currentStep = "13";
    }

    checkIP() {
        let myData = {};
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_GetIPStackSettings",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                const Http = new XMLHttpRequest();
                let url = response.result.IPResult.URL__c
                    ? response.result.IPResult.URL__c
                    : "https://api.ipstack.com/";
                url = url + "/check?access_key=" + response.result.IPResult.Password__c;
                Http.open("GET", url);
                Http.send();
                Http.onreadystatechange = (e) => {
                    if (Http.readyState == 4 && Http.status == 200) {
                        let data = JSON.parse(Http.responseText);
                        let ipData = {
                            ContextId: this.recordId,
                            ip: data.ip,
                            userId: this.userId,
                            state: data.region_name
                        };
                        const options = {};
                        const params = {
                            input: JSON.stringify(ipData),
                            sClassName: `vlocity_cmt.IntegrationProcedureService`,
                            sMethodName: "Buyflow_saveIPStatisticRecord",
                            options: JSON.stringify(options)
                        };
                        this._actionUtil
                            .executeAction(params, null, this, null, null)
                            .then((response) => {})
                            .catch((error) => {
                                console.error(error, "ERROR");
                            });
                    }
                };
            })
            .catch((error) => {
                console.error(error, "ERROR");
            });
    }
}