import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
import { NavigationMixin } from "lightning/navigation";

var stateNames = [
    { name: "Alabama", abbrev: "AL" },
    { name: "Alaska", abbrev: "AK" },
    { name: "Arizona", abbrev: "AZ" },
    { name: "Arkansas", abbrev: "AR" },
    { name: "California", abbrev: "CA" },
    { name: "Colorado", abbrev: "CO" },
    { name: "Connecticut", abbrev: "CT" },
    { name: "Delaware", abbrev: "DE" },
    { name: "District of Columbia", abbrev: "DC" },
    { name: "Florida", abbrev: "FL" },
    { name: "Georgia", abbrev: "GA" },
    { name: "Hawaii", abbrev: "HI" },
    { name: "Idaho", abbrev: "ID" },
    { name: "Illinois", abbrev: "IL" },
    { name: "Indiana", abbrev: "IN" },
    { name: "Iowa", abbrev: "IA" },
    { name: "Kansas", abbrev: "KS" },
    { name: "Kentucky", abbrev: "KY" },
    { name: "Louisiana", abbrev: "LA" },
    { name: "Maine", abbrev: "ME" },
    { name: "Maryland", abbrev: "MD" },
    { name: "Massachusetts", abbrev: "MA" },
    { name: "Michigan", abbrev: "MI" },
    { name: "Minnesota", abbrev: "MN" },
    { name: "Mississippi", abbrev: "MS" },
    { name: "Missouri", abbrev: "MO" },
    { name: "Montana", abbrev: "MT" },
    { name: "Nebraska", abbrev: "NE" },
    { name: "Nevada", abbrev: "NV" },
    { name: "New Hampshire", abbrev: "NH" },
    { name: "New Jersey", abbrev: "NJ" },
    { name: "New Mexico", abbrev: "NM" },
    { name: "New York", abbrev: "NY" },
    { name: "North Carolina", abbrev: "NC" },
    { name: "North Dakota", abbrev: "ND" },
    { name: "Ohio", abbrev: "OH" },
    { name: "Oklahoma", abbrev: "OK" },
    { name: "Oregon", abbrev: "OR" },
    { name: "Pennsylvania", abbrev: "PA" },
    { name: "Rhode Island", abbrev: "RI" },
    { name: "South Carolina", abbrev: "SC" },
    { name: "South Dakota", abbrev: "SD" },
    { name: "Tennessee", abbrev: "TN" },
    { name: "Texas", abbrev: "TX" },
    { name: "Utah", abbrev: "UT" },
    { name: "Vermont", abbrev: "VT" },
    { name: "Virginia", abbrev: "VA" },
    { name: "Washington", abbrev: "WA" },
    { name: "West Virginia", abbrev: "WV" },
    { name: "Wisconsin", abbrev: "WI" },
    { name: "Wyoming", abbrev: "WY" }
];
export default class poe_lwcBuyflowDirecTvCreditCheckTab extends NavigationMixin(LightningElement) {
    loaderSpinner;
    @api recordId;
    @api orderInfo;
    @api cartInfo;
    serviceAddress;
    @api logo;
    @api origin;
    @api accountId;
    @api stream;
    @api paymentMethod;
    @api productSelected;
    @api order;
    @api returnUrl;
    cart = {
        orderNumber: "",
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
    showModal = false;
    showModalQuestions = false;
    showModalDebt = false;
    noPersonalInformation = true;
    referenceNumber;
    ccShowSSN = true;
    ccSSN;
    ccDOB;
    ccDL;
    ccDLstate;
    ccDLexpDate;
    _actionUtil;
    firstName;
    lastName;
    noAddressInformation = true;
    email;
    phone;
    mockSSNResponse;
    billingAddress;
    billingApt;
    billingCity;
    billingState;
    billingZip;
    ssn;
    repeatSSN;
    sameSSN = false;
    DOB;
    DLstate;
    DLnumber;
    DLexpDate;
    noAnswers = true;
    noCompleteInfo = true;
    showSSNAgreement = true;
    agreementChecked = false;
    showBillingAddress = false;
    noShippingInformation = true;
    disclosureAgreement = false;
    isDL = false;
    SSNoptions = [
        { label: "SSN", value: "SSN" },
        { label: `Driver's License`, value: "DL" }
    ];
    SSNorDL = "SSN";
    states = [];
    method = "PCI";
    noContactInformation = true;
    validationSSNtry = 0;
    validationAddressTry = 0;
    fraudLimit = 0;
    ssnValidation;
    ssnLimit = false;
    showCollateral = false;
    isCallCenterOrigin;
    creditFreeze = false;
    clientIp;
    years = [];
    months = [];
    ccTypes = [];
    creditQuestions = [];
    creditAnswers = [];
    creditPayments = [];
    creditFee;
    feeMessage;
    creditScore;
    answer;
    calloutRequest;
    ccFirstName;
    ccLastName;
    ccv;
    type;
    ccNumber;
    month;
    year;
    ccZip;
    noFeeInfo = true;
    radioOptions = [
        {
            label: "Yes",
            value: "yes"
        },
        {
            label: "No",
            value: "no"
        }
    ];
    methods = [
        {
            label: "PCI Link",
            value: "PCI"
        },
        {
            label: "Manual",
            value: "Manual"
        }
    ];
    radioOption;
    isDOBFormatted = false;
    orderId;
    orderItemId;
    showModalFee = false;
    feeAgreement;
    noFeeAgreement = true;
    fee;
    creditCustomizations = [];
    showModalReview = false;
    reviewHtml;
    isPCI = true;
    isStatementRead = true;
    productDetailResponse;
    disclaimers = {
        creditCheckVerbiage1: "",
        creditCheckVerbiage2: ""
    };
    paymentAttempts;

    renderedCallback() {
        if (!this.isDOBFormatted && this.template.querySelector(".sensitive-input")) {
            const style = document.createElement("style");
            style.innerText = "input[name='ccDOB'] {-webkit-text-security: disc}";
            this.template.querySelector(".sensitive-input").appendChild(style);
            this.isDOBFormatted = true;
        }
    }

    handleFeeAgreement(event) {
        this.feeAgreement = event.target.checked;
        this.noFeeAgreement = !this.feeAgreement;
    }

    closeFeeDebt() {
        this.showModalFee = false;
        this.handleClick();
    }

    hideFeeModal() {
        this.showModalFee = false;
    }

    removeProduct() {
        const sendBackEvent = new CustomEvent("product", {
            detail: ""
        });
        this.dispatchEvent(sendBackEvent);
    }

    hideReviewModal() {
        this.showModalReview = false;
    }

    handleSSNValue() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId,
            value: this.agreementChecked
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_SetSSNAgreement",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
            });
    }

    handleSSNorDL(event) {
        this.sameSSN = false;
        this.ccSSN = undefined;
        this.repeatSSN = undefined;
        this.ccDOB = undefined;
        this.ccDL = undefined;
        this.ccDLstate = undefined;
        this.ccDLexpDate = undefined;
        switch (event.target.value) {
            case "SSN":
                this.ccShowSSN = true;
                break;
            case "DL":
                this.ccShowSSN = false;
                break;
        }
        this.disableValidations();
    }

    handleSSNClick(event) {
        this.showSSNAgreement = false;
        this.disableValidations();
    }

    handleChange(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        switch (event.target.name) {
            case "billingAddress":
                this.billingAddress = event.target.value;
                break;
            case "billingApt":
                this.billingApt = event.target.value;
                break;
            case "billingState":
                this.billingState = event.target.value;
                break;
            case "billingZip":
                this.billingZip = event.target.value;
                break;
            case "billingCity":
                this.billingCity = event.target.value;
                break;
            case "email":
                this.email = event.target.value;

                break;
        }
        if (this.email !== undefined && !this.showBillingAddress && emailre.test(this.email)) {
            this.noPersonalInformation = false;
        } else if (
            this.email !== "" &&
            this.showBillingAddress &&
            this.billingAddress !== "" &&
            this.billingState !== "" &&
            this.billingZip !== "" &&
            this.billingCity !== ""
        ) {
            this.noPersonalInformation = false;
        } else {
            this.noPersonalInformation = true;
        }
        this.disableValidations();
    }

    disableValidations() {
        let ssnPattern = /^\d{9}$/;
        if (this.disclosureAgreement && !this.noPersonalInformation) {
            if (this.ccShowSSN) {
                if (!this.isPCI) {
                    this.handleSSNRepeatValidation();
                    if (
                        !this.sameSSN &&
                        this.ccSSN !== undefined &&
                        ssnPattern.test(this.ccSSN) &&
                        ssnPattern.test(this.repeatSSN) &&
                        this.ccDOB !== undefined
                    ) {
                        let age = Math.floor((new Date() - new Date(this.ccDOB).getTime()) / 3.15576e10);
                        let dobElement = this.template.querySelector('[data-id="ssnDOB"]');
                        if (age < 18) {
                            this.noCompleteInfo = true;
                            if (age < 18) {
                                dobElement.setCustomValidity("Must be over 18 years old");
                                dobElement.reportValidity();
                            }
                        } else {
                            dobElement.setCustomValidity("");
                            dobElement.reportValidity();
                            this.noCompleteInfo = false;
                        }
                    } else {
                        this.noCompleteInfo = true;
                    }
                } else if (this.ccSSN !== undefined && this.ccDOB !== undefined && ssnPattern.test(this.ccSSN)) {
                    let age = Math.floor((new Date() - new Date(this.ccDOB).getTime()) / 3.15576e10);
                    let dobElement = this.template.querySelector('[data-id="ssnDOB"]');
                    if (age < 18) {
                        this.noCompleteInfo = true;
                        if (age < 18) {
                            dobElement.setCustomValidity("Must be over 18 years old");
                            dobElement.reportValidity();
                        }
                    } else {
                        dobElement.setCustomValidity("");
                        dobElement.reportValidity();
                        this.noCompleteInfo = false;
                    }
                } else {
                    this.noCompleteInfo = true;
                }
            } else {
                if (
                    this.ccDL !== undefined &&
                    this.ccDOB !== undefined &&
                    this.ccDLexpDate !== undefined &&
                    this.ccDLstate !== undefined
                ) {
                    if (!this.isPCI) {
                        let age = Math.floor((new Date() - new Date(this.ccDOB).getTime()) / 3.15576e10);
                        let invalidExpDate = new Date(this.ccDLexpDate) < new Date();
                        let dobElement = this.template.querySelector('[data-id="dlDOB"]');
                        let expDateElement = this.template.querySelector('[data-id="expDate"]');

                        if (age < 18 || invalidExpDate) {
                            this.noCompleteInfo = true;
                            if (age < 18) {
                                dobElement.setCustomValidity("Must be over 18 years old");
                                dobElement.reportValidity();
                            } else {
                                dobElement.setCustomValidity("");
                                dobElement.reportValidity();
                            }

                            if (invalidExpDate) {
                                expDateElement.setCustomValidity("Expiration date must be greater than today");
                                expDateElement.reportValidity();
                            } else {
                                expDateElement.setCustomValidity("");
                                expDateElement.reportValidity();
                            }
                        } else {
                            if (age > 18) {
                                dobElement.setCustomValidity("");
                                dobElement.reportValidity();
                            }
                            if (!invalidExpDate) {
                                expDateElement.setCustomValidity("");
                                expDateElement.reportValidity();
                            }
                            this.noCompleteInfo = false;
                        }
                    } else {
                        this.noCompleteInfo = false;
                    }
                } else {
                    this.noCompleteInfo = true;
                }
            }
        } else {
            this.noCompleteInfo = true;
        }
    }

    formatDOB() {
        const style = document.createElement("style");
        style.innerText = "input[name='ccDOB'] {-webkit-text-security: disc}";
        setTimeout(() => {
            this.template.querySelector(".sensitive-input").appendChild(style);
        }, 10);
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCancel() {
        if (this.returnUrl != undefined) {
            window.open(this.returnUrl, "_self");
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

    handleBillingAddress(event) {
        this.showBillingAddress = event.target.checked;
        if (this.showBillingAddress) {
            this.billingCity = "";
            this.billingAddress = "";
            this.billingState = "";
            this.billingZip = "";
        } else {
            this.billingCity = this.orderInfo.address.city;
            this.billingAddress = this.orderInfo.address.addressLine1;
            this.billingState = this.orderInfo.address.state;
            this.billingZip = this.orderInfo.address.zipCode;
        }
        if (this.email !== undefined && !this.showBillingAddress) {
            this.noPersonalInformation = false;
        } else if (
            !this.email &&
            !this.showBillingAddress &&
            !this.billingAddress &&
            !this.billingState &&
            !this.billingZip &&
            !this.billingCity
        ) {
            this.noPersonalInformation = false;
        } else {
            this.noPersonalInformation = true;
        }
        this.disableValidations();
    }

    connectedCallback() {
        this.cart = { ...this.cartInfo };
        this._actionUtil = new OmniscriptActionCommonUtil();
        this.saveIP();
        this.loaderSpinner = true;
        this.firstName = this.orderInfo.customer.firstName;
        this.lastName = this.orderInfo.customer.lastName;
        this.phone = this.orderInfo.customer.phoneNumber;
        this.email = this.orderInfo.customer.emailAddress;
        this.billingCity = this.orderInfo.address.city;
        this.billingAddress = this.orderInfo.address.addressLine1;
        this.billingApt = this.orderInfo.address.hasOwnProperty("addressLine2")
            ? this.orderInfo.address.addressLine2
            : "";
        this.billingState = this.orderInfo.address.state;
        this.billingZip = this.orderInfo.address.zipCode;
        this.serviceAddress = `${this.billingAddress} ${this.billingApt}, ${this.billingCity}, ${this.billingState} ${this.billingZip}`;
        if (this.email !== undefined) {
            this.noPersonalInformation = false;
        } else {
            this.noPersonalInformation = true;
        }
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.states.push(option);
        });
        if (this.origin === "phonesales") {
            this.isCallCenterOrigin = true;
        }
        let year = 21;
        for (var i = 0; i < 15; i++) {
            year = year + 1;
            let exp = {
                label: year.toString(),
                value: year.toString()
            };
            this.years.push(exp);
        }
        let month = 0;
        for (var i = 0; i < 12; i++) {
            month = month + 1;
            let m = {
                label: month.toString(),
                value: month.toString()
            };
            this.months.push(m);
        }
        let myData = {
            ContextId: this.recordId
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_GetCreditCardTypes",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                let initialCC = [];
                let ccs = response.result.IPResult.Credit_Card_Types__mdt;
                ccs.forEach((cc) => {
                    if (cc.Label !== "Discover") {
                        let credit = {
                            label: cc.Label,
                            value: cc.Label
                        };
                        initialCC.push(credit);
                    }
                });
                this.ccTypes = [...initialCC];
                let myData = {
                    ContextId: this.recordId,
                    partner: "directv"
                };
                const options = {};
                const params = {
                    input: JSON.stringify(myData),
                    sClassName: `vlocity_cmt.IntegrationProcedureService`,
                    sMethodName: "Buyflow_GetSSNFraudRules",
                    options: JSON.stringify(options)
                };
                this._actionUtil
                    .executeAction(params, null, this, null, null)
                    .then((response) => {
                        this.fraudLimit = response.result.IPResult.limit;
                        this.referenceNumber = response.result.IPResult.refNum;
                        this.paymentAttempts = response.result.IPResult.attempts;
                        this.callProductDetail();
                    })
                    .catch((error) => {
                        console.error(error, "ERROR");
                        this.loaderSpinner = false;
                    });
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
            });
    }

    callProductDetail() {
        let orderInfoParsed = JSON.parse(JSON.stringify(this.orderInfo));
        this.orderInfo = orderInfoParsed;
        let myData = {
            tab: "productDetail",
            componentCode: this.orderInfo?.componentCode,
            dealerCode: this.orderInfo?.dealerCode,
            partnerName: this.orderInfo?.partnerName,
            customerType: this.orderInfo?.customerType,
            productType: this.orderInfo?.productType,
            partnerOrderNumber: this.orderInfo?.partnerOrderNumber,
            customer: this.orderInfo?.customer
        };
        console.log("Product detail payload :");
        console.log(myData);
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_ProviderCallouts",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                this.productDetailResponse = response.result.IPResult;
                console.log("Response: ");
                console.log(this.productDetailResponse);

                let responseComponentCustomizations = this.productDetailResponse.hasOwnProperty(
                    "componentCustomizations"
                )
                    ? this.productDetailResponse.componentCustomizations
                    : undefined;

                if (responseComponentCustomizations === undefined) {
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: "There was an error processing the request try again"
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                } else {
                    this.productDetailResponse.legalCustomizations.forEach((item) => {
                        if (
                            item.customization.properties.subGroupName === "RC1CreditCheckVerbiage" ||
                            item.customization.properties.subGroupName === "VideoCreditCheckVerbiage"
                        ) {
                            this.disclaimers.creditCheckVerbiage1 = item.customization.description;
                            this.disclaimers.creditCheckVerbiage2 = item.customization.choices[0].choice.description;
                        }
                    });
                    this.generateCart();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The Product Detail request could not be made correctly to the server. Please, try again."
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
            });
    }

    saveIP() {
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
                url = url + "check?access_key=" + response.result.IPResult.Password__c;
                Http.open("GET", url);
                Http.send();
                Http.onreadystatechange = (e) => {
                    if (Http.readyState == 4 && Http.status == 200) {
                        let data = JSON.parse(Http.responseText);
                        this.clientIp = data.ip;
                        myData = {
                            ContextId: this.recordId,
                            IP: this.clientIp
                        };
                        const options = {};
                        const params = {
                            input: JSON.stringify(myData),
                            sClassName: `vlocity_cmt.IntegrationProcedureService`,
                            sMethodName: "Buyflow_saveFlagIP",
                            options: JSON.stringify(options)
                        };
                        this._actionUtil
                            .executeAction(params, null, this, null, null)
                            .then((response) => {
                                console.log("IP Saved");
                            })
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

    handleApprove(event) {
        this.disclosureAgreement = event.target.value === "yes" ? true : false;
        this.disableValidations();
    }

    showWarning() {
        if (this.validationSSNtry == Number(this.fraudLimit) - 1) {
            const event = new ShowToastEvent({
                title: "Warning",
                variant: "warning",
                mode: "sticky",
                message:
                    "A different SSN is being run with the same name after a failed Credit Check, please verify this is a valid entry."
            });
            this.dispatchEvent(event);
        } else if (this.validationSSNtry == Number(this.fraudLimit)) {
            const event = new ShowToastEvent({
                title: "Warning",
                variant: "warning",
                mode: "sticky",
                message: "This is the last attempt to correctly identify the SSN, please verify this is a valid entry."
            });
            this.dispatchEvent(event);
        }
    }

    handleSSNChange(event) {
        let ssnPattern = /^\d{9}$/;
        switch (event.target.name) {
            case "SSN":
                this.ccSSN = event.target.value !== "" ? event.target.value : undefined;
                if (
                    ssnPattern.test(event.target.value) &&
                    event.target.value !== this.ssnValidation &&
                    this.firstName + this.lastName === this.nameValidation
                ) {
                    this.showWarning();
                }
                this.sameSSN = false;
                break;
            case "repeatSSN":
                this.repeatSSN = event.target.value !== "" ? event.target.value : undefined;
                this.sameSSN = false;
                break;
            case "DOB":
                this.ccDOB =
                    event.target.value !== "" && Date.parse(event.target.value) >= Date.parse("1916-01-01")
                        ? event.target.value
                        : undefined;
                break;
            case "DLstate":
                this.ccDLstate = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "DL":
                this.ccDL = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "DLexpDate":
                this.ccDLexpDate =
                    event.target.value !== "" && event.target.value !== null ? event.target.value : undefined;
                break;
        }
        this.disableValidations();
    }

    handleSSNRepeatValidation() {
        this.sameSSN = this.repeatSSN !== this.ccSSN ? true : false;
    }

    handleCallCC() {
        if (!this.isStatementRead && !this.isCallCenterOrigin) {
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: 'The "I have read the statement below" checkbox must be selected'
            });
            this.dispatchEvent(event);
            return;
        }
        this.serviceAddress = `${this.billingAddress} ${this.billingApt}, ${this.billingCity}, ${this.billingState} ${this.billingZip}`;
        this.loaderSpinner = true;
        let calloutInfo = { ...this.orderInfo };
        calloutInfo.tab = "creditcheck";
        calloutInfo.qualityCheck = "";
        calloutInfo.account = {
            ssn: this.ccSSN,
            pin: "",
            dob: this.ccDOB,
            drivingLicense: {
                dlNumber: this.ccDL,
                expDate: this.ccDLexpDate,
                dlState: this.ccDLstate
            }
        };
        calloutInfo.customer = JSON.parse(JSON.stringify(calloutInfo.customer));
        calloutInfo.customer.firstName = this.firstName;
        calloutInfo.customer.lastName = this.lastName;
        calloutInfo.customer.phoneNumber = this.phone;
        calloutInfo.customer.emailAddress = this.email;
        delete calloutInfo.address;
        delete calloutInfo.orderNumber;
        if (calloutInfo.customer.middleName === null) {
            calloutInfo.customer.middleName = "";
        }
        this.calloutRequest = { ...calloutInfo };
        const options = {};
        const params = {
            input: JSON.stringify(calloutInfo),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_ProviderCallouts",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                let res = response;
                if (response.result.IPResult.hasOwnProperty("rc1CreditDecision")) {
                    let decision = response.result.IPResult.rc1CreditDecision.ccPlusAction;
                    let creditClass = response.result.IPResult.rc1CreditDecision.creditClass;
                    if (decision === "Refresh") {
                        this.handleCallCCPlus(calloutInfo, decision, creditClass, [], []);
                    } else if (decision === "RefreshCache" && creditClass === "REVIEW") {
                        let myData = {
                            ContextId: this.recordId
                        };
                        const options = {};
                        const params = {
                            input: JSON.stringify(myData),
                            sClassName: `vlocity_cmt.IntegrationProcedureService`,
                            sMethodName: "Buyflow_saveCreditFreeze",
                            options: JSON.stringify(options)
                        };
                        this._actionUtil
                            .executeAction(params, null, this, null, null)
                            .then((response) => {
                                if (this.stream) {
                                    this.loaderSpinner = false;
                                    this.creditScore = res.result.IPResult.rc1CreditDecision.creditClass;
                                    this.showModal = true;
                                } else {
                                    this.loaderSpinner = false;
                                    this.reviewHtml = res.result.IPResult.rc1CreditDecision.messageHtml;
                                    this.showModalReview = true;
                                }
                            })
                            .catch((error) => {
                                console.error(error, "ERROR");
                                this.loaderSpinner = false;
                            });
                    } else if (decision === "ValidateRC1" && creditClass === "NCVC") {
                        this.creditQuestions = response.result.IPResult.rc1CreditDecision.creditQuestions;
                        this.creditQuestions.forEach((question) => {
                            let answers = [];
                            question.creditAnswers.forEach((answer) => {
                                let newAnswer = {
                                    value: answer.answerId,
                                    label: answer.answerText
                                };
                                answers.push(newAnswer);
                            });
                            question.options = [...answers];
                            question.answered = false;
                            question.answer = "";
                        });
                        this.loaderSpinner = false;
                        this.showModalQuestions = true;
                    } else if (decision === "DebtPayment" && creditClass === "OB") {
                        this.creditFee = Number(response.result.IPResult.rc1CreditDecision.debtAmount).toFixed(2);
                        this.feeMessage = response.result.IPResult.rc1CreditDecision.message;
                        this.ccFirstName = this.firstName;
                        this.ccLastName = this.lastName;
                        this.ccZip = this.orderInfo.address.zipCode;
                        this.loaderSpinner = false;
                        this.showModalDebt = true;
                    }
                } else {
                    let errorMessage;
                    if (
                        response.result.IPResult.hasOwnProperty("result") &&
                        response.result.IPResult.result.hasOwnProperty("error") &&
                        response.result.IPResult.result.error.hasOwnProperty("provider") &&
                        response.result.IPResult.result.error.provider.hasOwnProperty("message")
                    ) {
                        errorMessage = response.result.IPResult.result.error.provider.message.message;
                    } else if (
                        response.result.IPResult.hasOwnProperty("result") &&
                        response.result.IPResult.result.hasOwnProperty("error") &&
                        response.result.IPResult.result.error.hasOwnProperty("message")
                    ) {
                        errorMessage = response.result.IPResult.result.error.message;
                    } else if (response.result.IPResult.hasOwnProperty("error")) {
                        errorMessage = response.result.IPResult.error;
                    }
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message:
                            errorMessage !== undefined
                                ? errorMessage
                                : "There was a problem during the Customer Qualification. Please try again."
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "Service unreachable. Please try again."
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
            });
    }

    handleCallCCPlus(calloutInfo, decision, className, answers, payments) {
        this.showModalQuestions = false;
        this.showModalDebt = false;
        let calloutInfoPlus = { ...calloutInfo };
        calloutInfoPlus.tab = "creditcheck+";
        calloutInfoPlus.ccPlusAction = decision;
        calloutInfoPlus.creditClass = className;
        calloutInfoPlus.creditAnswers = [...answers];
        calloutInfoPlus.userPayments = [...payments];
        console.log(calloutInfoPlus);
        const options = {};
        const params = {
            input: JSON.stringify(calloutInfoPlus),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_ProviderCallouts",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                let res = response;
                if (response.result.IPResult.hasOwnProperty("rc1CreditDecision")) {
                    let decision = response.result.IPResult.rc1CreditDecision.ccPlusAction;
                    this.creditScore = response.result.IPResult.rc1CreditDecision.creditClass;
                    if (decision === "Refresh") {
                        this.loaderSpinner = false;
                        if (
                            response.result.IPResult.rc1CreditDecision.creditFeeRequired === "True" ||
                            response.result.IPResult.rc1CreditDecision.creditAbpRequired === "True" ||
                            response.result.IPResult.rc1CreditDecision.creditFeeRequired === "true" ||
                            response.result.IPResult.rc1CreditDecision.creditAbpRequired === "true"
                        ) {
                            let taxObject;
                            let todayCharges = [];
                            this.creditCustomizations = [...response.result.IPResult.creditCustomizations];
                            this.creditCustomizations[0].customization.choices.forEach((item) => {
                                this.fee = Number(item.choice.fee.fee).toFixed(2);
                                taxObject = {
                                    name: item.choice.properties.name,
                                    fee: this.fee,
                                    discount: false,
                                    hasDescription: false,
                                    description: item.choice.description,
                                    type: "activationfee"
                                };
                            });
                            let cart = { ...this.cart };
                            cart.hasToday = true;
                            todayCharges = [...JSON.parse(JSON.stringify(cart.todayCharges))];
                            let hasActivation = false;
                            todayCharges.forEach((charge) => {
                                if (charge.type === "activationfee") {
                                    hasActivation = true;
                                }
                            });
                            if (!hasActivation) {
                                todayCharges.push(taxObject);
                            }
                            cart.todayTotal = 0;
                            cart.todayCharges = [...todayCharges];
                            cart.todayCharges.forEach((charge) => {
                                cart.todayTotal = Number(cart.todayTotal) + Number(charge.fee);
                            });
                            cart.todayTotal = Number(cart.todayTotal).toFixed(2);
                            this.cart = { ...cart };
                            this.showModalFee = true;
                        } else {
                            this.showModal = true;
                        }
                    } else if (decision === "RefreshCache" && this.creditScore === "REVIEW") {
                        let myData = {
                            ContextId: this.recordId
                        };
                        const options = {};
                        const params = {
                            input: JSON.stringify(myData),
                            sClassName: `vlocity_cmt.IntegrationProcedureService`,
                            sMethodName: "Buyflow_saveCreditFreeze",
                            options: JSON.stringify(options)
                        };
                        this._actionUtil
                            .executeAction(params, null, this, null, null)
                            .then((response) => {
                                if (this.stream) {
                                    this.loaderSpinner = false;
                                    this.showModal = true;
                                } else {
                                    this.loaderSpinner = false;
                                    this.reviewHtml = res.result.IPResult.rc1CreditDecision.messageHtml;
                                    this.showModalReview = true;
                                }
                            })
                            .catch((error) => {
                                console.error(error, "ERROR");
                                this.loaderSpinner = false;
                            });
                    } else if (decision === "ValidateRC1" && creditClass === "NCVC") {
                        this.creditQuestions = response.result.IPResult.rc1CreditDecision.creditQuestions;
                        this.creditQuestions.forEach((question) => {
                            let answers = [];
                            question.creditAnswers.forEach((answer) => {
                                let newAnswer = {
                                    value: answer.answerId,
                                    label: answer.answerText
                                };
                                answers.push(newAnswer);
                            });
                            question.options = [...answers];
                            question.answered = false;
                            question.answer = "";
                        });
                        this.loaderSpinner = false;
                        this.showModalQuestions = true;
                    } else if (decision === "DebtPayment" && creditClass === "OB") {
                        this.creditFee = Number(response.result.IPResult.rc1CreditDecision.debtAmount).toFixed(2);
                        this.feeMessage = response.result.IPResult.rc1CreditDecision.message;
                        this.ccFirstName = this.firstName;
                        this.ccLastName = this.lastName;
                        this.ccZip = this.calloutInfo.address.zipCode;
                        this.loaderSpinner = false;
                        this.showModalDebt = true;
                    }
                } else {
                    let errorMessage;
                    if (
                        response.result.IPResult.hasOwnProperty("result") &&
                        response.result.IPResult.result.hasOwnProperty("error") &&
                        response.result.IPResult.result.error.hasOwnProperty("provider") &&
                        response.result.IPResult.result.error.provider.hasOwnProperty("message")
                    ) {
                        errorMessage = response.result.IPResult.result.error.provider.message.message;
                    } else if (
                        response.result.IPResult.hasOwnProperty("result") &&
                        response.result.IPResult.result.hasOwnProperty("error") &&
                        response.result.IPResult.result.error.hasOwnProperty("message")
                    ) {
                        errorMessage = response.result.IPResult.result.error.message;
                    } else if (response.result.IPResult.hasOwnProperty("error")) {
                        errorMessage = response.result.IPResult.error;
                    }
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message:
                            errorMessage !== undefined
                                ? errorMessage
                                : "There was a problem during the Customer Qualification. Please try again."
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    message: "Service unreachable. Please try again."
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
            });
    }

    handleRefresh() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_getOppSensitiveData",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                let data =
                    response.result.IPResult.ccIdDetails !== undefined ? response.result.IPResult.ccIdDetails : {};
                this.ccDOB = data.hasOwnProperty("ccDob") ? data.ccDob : undefined;
                this.ccSSN = data.hasOwnProperty("ccSSN") ? data.ccSSN : undefined;
                this.ccShowSSN = this.ccSSN !== undefined ? true : false;
                if (!this.ccShowSSN) {
                    this.ccDL = data.hasOwnProperty("ccDriversLicenseNumber") ? data.ccDriversLicenseNumber : undefined;
                    this.ccDLexpDate = data.hasOwnProperty("ccDlExpirationDate") ? data.ccDlExpirationDate : undefined;
                    this.ccDLstate = data.hasOwnProperty("ccDlState") ? data.ccDlState : undefined;
                }
                this.disableValidations();
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
            });
    }

    handleSMS() {
        this.handleSSNValue();
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody =
            "To continue with your order, you will be required to enter your data in a secure environment. Click here to enter your information: " +
            index[0] +
            "/s/pci-personal-info?c__ContextId=" +
            this.recordId;
        let myData = {
            clientPhone: "1" + this.phone,
            body: mailBody
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_TwilioCallout",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                let result = response.result;
                this.loaderSpinner = false;
                let tit = result.error === "OK" ? "Success" : "Error";
                let varnt = result.error === "OK" ? "success" : "error";
                let mess =
                    result.error === "OK"
                        ? "The SMS was sent correctly with a link to enter the personal information."
                        : "The SMS could not be sent. Please, verify the telephone number and try again.";
                const event = new ShowToastEvent({
                    title: tit,
                    variant: varnt,
                    message: mess
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The SMS could not be sent. Please, verify the telephone number and try again."
                });
                this.dispatchEvent(event);
            });
    }

    sendPCIEmail() {
        this.handleSSNValue();
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody = index[0] + "/s/pci-personal-info?c__ContextId=" + this.recordId;
        let myData = {
            pciEmail: this.email,
            body: mailBody
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_sendCreditCheckPciEmail",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    message: "The email was sent correctly with a link to enter the personal information."
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The email could not be sent. Please, verify the email address and try again."
                });
                this.dispatchEvent(event);
            });
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    hideModal() {
        this.showModal = false;
        this.showModalDebt = false;
        this.showModalQuestions = false;
    }

    get creditAnswers() {
        return [
            { label: "Blue", value: "1" },
            { label: "Pink", value: "2" }
        ];
    }

    closeModalQuestions() {
        this.showModalQuestions = false;
        this.loaderSpinner = true;
        this.handleCallCCPlus(this.calloutRequest, "ValidateRC1", "NCVC", this.creditAnswers, []);
    }

    closeModalDebt() {
        this.showModalDebt = false;
        this.loaderSpinner = true;
        let paymentArray = [];
        let cardType;
        switch (this.type) {
            case "Visa":
                cardType = "VI";
                break;
            case "AMEX":
                cardType = "AM";
                break;
            case "MasterCard":
                cardType = "MC";
                break;
        }
        let paymentObject = {
            payment: { amount: "0", type: "OUTSTANDING_BALANCE", creditCardRef: "OUTSTANDING_BALANCE" },
            cards: [
                {
                    firstName: this.ccFirstName,
                    lastName: this.ccLastName,
                    cardType: cardType,
                    cardNumber: this.ccNumber,
                    cardExpMonth: this.month,
                    cardExpYear: this.year,
                    cvv: this.ccv,
                    zipCode: this.ccZip,
                    amount: String(this.creditFee),
                    payType: "",
                    uniqueId: "OUTSTANDING_BALANCE",
                    nameOnCard: ""
                }
            ]
        };
        paymentArray.push(paymentObject);
        this.handleCallCCPlus(this.calloutRequest, "DebtPayment", "OB", [], paymentArray);
    }

    handleClick() {
        this.showModal = false;
        if (this.order !== undefined) {
            this.loaderSpinner = true;
            let info = {
                billingAddress: {
                    addressLine1: this.billingAddress,
                    addressLine2: this.billingApt,
                    city: this.billingCity,
                    state: this.billingState,
                    country: "USA",
                    zipCode: this.billingZip
                },
                referenceNumber: this.referenceNumber,
                orderId: this.order,
                cart: this.cart,
                productDetailResponse: this.productDetailResponse,
                paymentAttempts: this.paymentAttempts
            };
            info.payInFull = this.creditScore !== "LOW" && this.stream;
            const sendBackEvent = new CustomEvent("creditchecknext", {
                detail: info
            });
            this.dispatchEvent(sendBackEvent);
            this.loaderSpinner = false;
        } else {
            this.loaderSpinner = true;
            let repType;
            switch (this.origin) {
                case "phonesales":
                    repType = "Phone Sales";
                    break;
                case "retail":
                    repType = "Retail";
                    break;
                case "event":
                    repType = "Event";
                    break;
                case "maps":
                    repType = "Door To Door";
                    break;
            }
            let json = {
                ContextId: this.recordId,
                AccountId: this.accountId,
                ProductName: this.productSelected,
                family: "DirecTV",
                representative: repType,
                Pricebook: "Standard Price Book",
                timeStamp: new Date(),
                creditCheck: {
                    accountDetails: {
                        billingCreditCheckAddress: {
                            billingAddress: this.billingAddress,
                            billingAptNumber: this.billingApt,
                            billingCity: this.billingCity,
                            billingState: this.billingState,
                            billingZip: this.billingZip
                        },
                        shippingServiceAddresss: {
                            shippingAddress: this.orderInfo.address.addressLine1,
                            shippingAptNumber: this.orderInfo.address.hasOwnProperty("addressLine2")
                                ? this.orderInfo.address.addressLine2
                                : "",
                            shippingCity: this.orderInfo.address.city,
                            shippingZip: this.orderInfo.address.zipCode,
                            shippingState: this.orderInfo.address.state
                        }
                    }
                },
                creditScoreResult: this.creditScore,
                identification:
                    this.ssn !== undefined && this.ssn !== null && this.ssn !== ""
                        ? "Social Security Number"
                        : `Driver's License`
            };
            console.log("IPSaveOrderDTV");
            console.log(json);
            const options = {};
            const params = {
                input: JSON.stringify(json),
                sClassName: `vlocity_cmt.IntegrationProcedureService`,
                sMethodName: "Buyflow_IPSaveOrderDTV",
                options: JSON.stringify(options)
            };
            this._actionUtil
                .executeAction(params, null, this, null, null)
                .then((response) => {
                    console.log(response);
                    this.orderId = response.result.IPResult.Order_1[0].Id;
                    this.orderItemId = response.result.IPResult.OrderItem_2[0].Id;
                    let info = {
                        billingAddress: {
                            addressLine1: this.billingAddress,
                            addressLine2: this.billingApt,
                            city: this.billingCity,
                            state: this.billingState,
                            country: "USA",
                            zipCode: this.billingZip
                        },
                        referenceNumber: this.referenceNumber,
                        orderId: this.orderId,
                        orderItemId: this.orderItemId,
                        cart: this.cart,
                        productDetailResponse: this.productDetailResponse,
                        paymentAttempts: this.paymentAttempts
                    };
                    info.payInFull = this.creditScore !== "LOW" && this.stream;
                    let data = {
                        ContextId: this.recordId
                    };
                    const options = {};
                    const params = {
                        input: JSON.stringify(data),
                        sClassName: `vlocity_cmt.IntegrationProcedureService`,
                        sMethodName: "Buyflow_saveACICreditCheck",
                        options: JSON.stringify(options)
                    };
                    this._actionUtil
                        .executeAction(params, null, this, null, null)
                        .then((response) => {
                            const sendBackEvent = new CustomEvent("creditchecknext", {
                                detail: info
                            });
                            this.dispatchEvent(sendBackEvent);
                            this.loaderSpinner = false;
                        })
                        .catch((error) => {
                            console.error(error, "ERROR");
                            const event = new ShowToastEvent({
                                title: "Error",
                                variant: "error",
                                mode: "sticky",
                                message: "The order could not be created. Please try again."
                            });
                            this.dispatchEvent(event);
                            this.loaderSpinner = false;
                        });
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "The order could not be created. Please try again."
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                });
        }
    }

    handleAnswerChange(event) {
        this.creditAnswers = [];
        let onefalse = false;
        let answers = [];
        this.creditQuestions.forEach((question) => {
            if (event.target.dataset.id == question.questionId) {
                question.answered = true;
                question.answer = event.target.value;
            }
        });
        this.creditQuestions.forEach((question) => {
            if (question.answered == false) {
                onefalse = true;
            } else {
                let answer = {
                    questionId: question.questionId,
                    answerId: question.answer
                };
                answers.push(answer);
            }
        });
        this.noAnswers = onefalse;
        this.creditAnswers = [...answers];
    }

    handleChangeCC(event) {
        switch (event.target.name) {
            case "ccFirstName":
                this.ccFirstName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "ccLastName":
                this.ccLastName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "ccv":
                this.ccv = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "type":
                this.type = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "ccNumber":
                this.ccNumber = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "month":
                this.month = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "year":
                this.year = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "ccZip":
                this.ccZip = event.target.value !== "" ? event.target.value : undefined;
                break;
        }
        if (
            this.ccFirstName !== undefined &&
            this.ccLastName !== undefined &&
            this.ccv !== undefined &&
            this.type !== undefined &&
            this.ccNumber !== undefined &&
            this.month !== undefined &&
            this.year !== undefined &&
            this.ccZip !== undefined
        ) {
            this.noFeeInfo = false;
        } else {
            this.noFeeInfo = true;
        }
    }

    handleMethod(event) {
        this.ccSSN = undefined;
        this.repeatSSN = undefined;
        this.ccDOB = undefined;
        this.ccDL = undefined;
        this.ccDLstate = undefined;
        this.ccDLexpDate = undefined;
        if (event.target.value == "PCI") {
            this.isPCI = true;
            this.isStatementRead = true;
        } else {
            this.ccShowSSN = true;
            this.isPCI = false;
            this.isStatementRead = false;
        }
        this.disableValidations();
    }

    handleStatementRead(event) {
        this.isStatementRead = event.target.checked;
    }

    generateCart() {
        let cart = { ...JSON.parse(JSON.stringify(this.cartInfo)) };
        let includedOffers = [];
        this.productDetailResponse.componentCustomizations.forEach((item) => {
            let generalType = item.customization.properties.groupName;
            let type = item.customization.properties.subGroupName;
            let maxChoices = Number(item.customization.properties.maxChoices);
            if (generalType === "Offers") {
                if (type === "IncludedOffers" && maxChoices > 0) {
                    item.customization.choices.forEach((subitem) => {
                        if (
                            subitem.choice.properties.choiceCode === "ATV-INCLUDED-OFFERS-REQUIRED" ||
                            subitem.choice.properties.choiceCode === "DTV-INCLUDED-OFFERS-REQUIRED"
                        ) {
                            subitem.choice.customizations.forEach((c) => {
                                c.customization.choices.forEach((offer) => {
                                    if (offer.choice.description !== "Not applicable.") {
                                        let includedObject = {
                                            id: offer.choice.properties.usoc,
                                            name: offer.choice.properties.name,
                                            cartVisible:
                                                offer.choice.properties.cartVisible === "True" ||
                                                offer.choice.properties.cartVisible === "true"
                                                    ? true
                                                    : false,
                                            cartDisclosure: offer.choice.cartDisclosure,
                                            choiceCode: offer.choice.properties.choiceCode,
                                            fee: offer.choice.hasOwnProperty("fee")
                                                ? Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            feeTerm: offer.choice.fee.feeTerm
                                        };
                                        if (
                                            includedObject.name === "Please Select an Option" ||
                                            includedObject.choiceCode.includes("DTV-LANDLORD")
                                        ) {
                                            includedObject.cartVisible = false;
                                        }
                                        includedOffers.push(includedObject);
                                    }
                                });
                            });
                        }
                    });
                }
            }
        });
        let cartElements = JSON.parse(JSON.stringify(this.cartInfo.monthlyCharges));
        let cartElementsToday = JSON.parse(JSON.stringify(this.cartInfo.todayCharges));
        let monthlyCharges = [...cartElements];
        let todayCharges = [...cartElementsToday];
        let savingCharges = [];
        includedOffers.forEach((item) => {
            if (item.cartVisible) {
                let newCharge = {
                    name: item.name,
                    fee: Number(item.fee).toFixed(2),
                    discount: Number(item.fee) > 0.0 ? false : true,
                    hasDescription:
                        item.cartDisclosure !== undefined && item.cartDisclosure !== null && item.cartDisclosure !== "",
                    description: item.cartDisclosure,
                    type: "required"
                };
                if (item.choiceCode.includes("ATT-VID-DTV") && item.choiceCode.includes("GC-SPC")) {
                    cart.hasSavings = true;
                    savingCharges.push(newCharge);
                } else if (item.choiceCode === "ATT-VID-ATV-150-GC-SPC") {
                    cart.hasSavings = true;
                    savingCharges.push(newCharge);
                } else {
                    if (item.feeTerm === "Monthly") {
                        cart.hasMonthly = true;
                        monthlyCharges.push(newCharge);
                    } else {
                        cart.hasToday = true;
                        todayCharges.push(newCharge);
                    }
                }
            }
        });
        cart.monthlyCharges = [...monthlyCharges];
        cart.todayCharges = [...todayCharges];
        cart.savingCharges = [...savingCharges];
        cart.todayTotal = 0;
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach((charge) => {
            cart.monthlyTotal = Number(cart.monthlyTotal) + Number(charge.fee);
        });
        cart.monthlyTotal = Number(cart.monthlyTotal).toFixed(2);
        cart.todayCharges.forEach((charge) => {
            cart.todayTotal = Number(cart.todayTotal) + Number(charge.fee);
        });
        cart.todayTotal = Number(cart.todayTotal).toFixed(2);
        this.cart = { ...cart };
        this.loaderSpinner = false;
    }
}