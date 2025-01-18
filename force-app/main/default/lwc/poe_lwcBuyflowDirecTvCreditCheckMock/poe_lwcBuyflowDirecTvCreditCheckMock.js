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
    @api addressInfo;
    @api contactInfo;
    // @api orderInfo;
    orderInfo = {
        customer: {
            firstName: "",
            lastName: ""
        },
        address: {
            zipCode: ""
        }
    };
    serviceAddress;
    @api logo;
    @api origin;
    @api addressApi;
    showPreModal = false;
    showModal = false;
    showModalQuestions = false;
    showModalDebt = false;
    debugQuestions = false;
    debugDebt = false;
    noPersonalInformation = true;
    referenceNumber;
    ccShowSSN;
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
    noCompleteInfo = true;
    showSSNAgreement = true;
    agreementChecked = false;
    showBillingAddress = false;
    noShippingInformation = true;
    disclosureAgreement = false;
    isCallCenter;
    isPCI;
    isDL = false;
    SSNoptions = [
        { label: "SSN", value: "SSN" },
        { label: `Driver's License`, value: "DL" }
    ];
    SSNorDL = "SSN";
    isManual = true;
    states = [];
    methods = [
        { label: "Agent entry", value: "Agent entry" },
        { label: "CallCenter", value: "CallCenter" },
        { label: "PCI Link", value: "PCI" }
    ];
    method = "Agent entry";
    noContactInformation = true;
    validationSSNtry = 0;
    validationAddressTry = 0;
    fraudLimit = 0;
    ssnValidation;
    addressValidation;
    nameValidation;
    nameAddressValidation;
    addressWarning = false;
    ssnLimit = false;
    recType;
    showCollateral = false;
    isCallCenterOrigin;
    addressDiscrepancy = false;
    creditFreeze = false;
    clientIp;
    years = [];
    months = [];
    ccTypes = [
        { value: "visa", label: "Visa" },
        {
            value: "mastercard",
            label: "Mastercard"
        },
        { value: "american", label: "American Express" }
    ];
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
    radioOption;
    isDOBFormatted = false;

    renderedCallback() {
        if (!this.isDOBFormatted && this.template.querySelector(".sensitive-input")) {
            const style = document.createElement('style');
            style.innerText = "input[name='DOB'] {-webkit-text-security: disc}";
            this.template.querySelector('.sensitive-input').appendChild(style);
            this.isDOBFormatted = true;
        }
    }

    handleSSNValue(event) {
        this.agreementChecked = event.target.checked;
    }

    handleMethod(event) {
        switch (event.target.value) {
            case "CallCenter":
                this.isCallCenter = true;
                this.isManual = false;
                this.isPCI = false;
                this.ccShowSSN = true;
                this.ccDOB = undefined;
                this.ccSSN = undefined;
                break;
            case "Agent entry":
                this.isCallCenter = false;
                this.isManual = true;
                this.isPCI = false;
                this.formatDOB();
                break;
            case "PCI":
                this.isCallCenter = false;
                this.isManual = false;
                this.isPCI = true;
                this.ccShowSSN = true;
                this.ccDOB = undefined;
                this.ccSSN = undefined;
                break;
        }
    }

    handleSSNorDL(event) {
        switch (event.target.value) {
            case "SSN":
                this.isDL = false;
                break;
            case "DL":
                this.isDL = true;
                break;
        }
    }

    handleSSNClick(event) {
        this.showSSNAgreement = false;
        this.disableValidations();
    }

    handleChange(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        switch (event.target.name) {
            case "billingAddress":
                this.billingAddress = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "billingApt":
                this.billingApt = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "billingState":
                this.billingState = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "billingZip":
                this.billingZip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "billingCity":
                this.billingCity = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "email":
                this.email = emailre.test(event.target.value) ? event.target.value : undefined;
                break;
        }
        if (this.email !== undefined && !this.showBillingAddress) {
            this.noPersonalInformation = false;
        } else if (
            this.email !== undefined &&
            this.showBillingAddress &&
            this.billingAddress !== undefined &&
            this.billingState !== undefined &&
            this.billingZip !== undefined &&
            this.billingCity !== undefined
        ) {
            this.noPersonalInformation = false;
        } else {
            this.noPersonalInformation = true;
        }
        this.disableValidations();
    }

    formatDOB() {
        const style = document.createElement('style');
        style.innerText = "input[name='DOB'] {-webkit-text-security: disc}";
        setTimeout(() => { 
            this.template.querySelector('.sensitive-input').appendChild(style);
        }, 10);
    }

    disableValidations() {
        if (this.disclosureAgreement && !this.noPersonalInformation) {
            if (this.isManual) {
                if (!this.isDL) {
                    if (
                        this.ssn !== undefined &&
                        this.repeatSSN !== undefined &&
                        this.DOB !== undefined &&
                        this.sameSSN == false
                    ) {
                        this.noCompleteInfo = false;
                    } else {
                        this.noCompleteInfo = true;
                    }
                } else {
                    if (
                        this.DLstate !== undefined &&
                        this.DLnumber !== undefined &&
                        this.DOB !== undefined &&
                        this.DLexpDate !== undefined
                    ) {
                        this.noCompleteInfo = false;
                    } else {
                        this.noCompleteInfo = true;
                    }
                }
            } else {
                if (this.ccShowSSN) {
                    if (this.ccSSN !== undefined && this.ccDOB !== undefined) {
                        this.noCompleteInfo = false;
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
                        this.noCompleteInfo = false;
                    } else {
                        this.noCompleteInfo = true;
                    }
                }
            }
        } else {
            this.noCompleteInfo = true;
        }
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: this.recordId,
                objectApiName: "Opportunity",
                actionName: "view"
            }
        });
    }

    handleBillingAddress(event) {
        this.disclosureAgreement = false;
        this.disableValidations();
        this.showBillingAddress = event.target.checked;
        if (this.email !== undefined && !this.showBillingAddress) {
            this.noPersonalInformation = false;
        } else if (
            this.email !== undefined &&
            this.showBillingAddress &&
            this.billingAddress !== undefined &&
            this.billingState !== undefined &&
            this.billingZip !== undefined &&
            this.billingCity !== undefined
        ) {
            this.noPersonalInformation = false;
        } else {
            this.noPersonalInformation = true;
        }
    }

    connectedCallback() {
        //this.loaderSpinner = true;
        ////////////////////////////////////////////////
        ///////////////MOCKED DATA/////////////////////
        this.orderInfo.customer.firstName = "Steven";
        this.orderInfo.customer.lastName = "NOFDE";
        this.orderInfo.customer.phone = "1234566789";
        this.orderInfo.customer.email = "demo@demo.com";
        this.orderInfo.address.zipCode = "78242";
        this.firstName = this.orderInfo.customer.firstName;
        this.lastName = this.orderInfo.customer.lastName;
        this.phone = this.orderInfo.customer.phone;
        this.email = this.orderInfo.customer.email;
        this.serviceAddress = "8501 SPOTTED DEER ST, SAN ANTONIO, TX 78242";
        if (this.email !== undefined) {
            this.noPersonalInformation = false;
        } else {
            this.noPersonalInformation = true;
        }
        ////////////////////////////////////////////////
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.states.push(option);
        });
        //this.shippingState = this.addressInfo.state;
        //this._actionUtil = new OmniscriptActionCommonUtil();
        if (this.origin === "callcenter") {
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
        // this.firstName = this.contactInfo.firstName;
        // this.lastName = this.contactInfo.lastName;
        // this.phone = this.contactInfo.phone;
        // this.email = this.contactInfo.email;
        // this.shippingAddress = this.addressInfo.address;
        // this.shippingApt = this.addressInfo.apt;
        // this.shippingCity = this.addressInfo.city;
        // this.shippingZip = this.addressInfo.zip;

        /* let myData = {
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
                this.recType = response.result.IPResult.recType;
                this.disableValidations();
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
            });
        console.log(this.orderInfo); */
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
                message:
                    "A different SSN is being run with the same name after a failed Credit Check, please verify this is a valid entry."
            });
            this.dispatchEvent(event);
        } else if (this.validationSSNtry == Number(this.fraudLimit)) {
            const event = new ShowToastEvent({
                title: "Warning",
                variant: "warning",
                message: "This is the last attempt to correctly identify the SSN, please verify this is a valid entry."
            });
            this.dispatchEvent(event);
        }
    }

    handleSSNChange(event) {
        let ssnPattern = /^\d{9}$/;
        switch (event.target.name) {
            case "ssn":
                this.ssn = ssnPattern.test(event.target.value) ? event.target.value : undefined;
                if (
                    ssnPattern.test(event.target.value) &&
                    event.target.value !== this.ssnValidation &&
                    this.firstName + this.lastName === this.nameValidation
                ) {
                    this.showWarning();
                }
                this.sameSSN = event.target.value !== this.repeatSSN ? true : false;
                break;
            case "repeatSSN":
                this.repeatSSN = ssnPattern.test(event.target.value) ? event.target.value : undefined;
                this.sameSSN = event.target.value !== this.ssn ? true : false;
                break;
            case "DOB":
                this.DOB =
                    event.target.value !== "" && Date.parse(event.target.value) >= Date.parse("1916-01-01")
                        ? event.target.value
                        : undefined;
                break;
            case "DLstate":
                this.DLstate = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "DLnumber":
                this.DLnumber = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "DLexpDate":
                this.DLexpDate = event.target.value !== "" ? event.target.value : undefined;
                break;
        }
        this.disableValidations();
    }

    handleCallCC() {
        this.loaderSpinner = true;
        // let data = {
        //     FirstName: this.firstName,
        //     LastName: this.lastName,
        //     MiddleName: this.middleName,
        //     FullName: this.firstName + this.lastName,
        //     Phone: this.phone,
        //     Email: this.email,
        //     ShippingStreet: this.shippingAddress,
        //     ShippingCity: this.shippingCity,
        //     ShippingState: this.shippingState,
        //     ShippingApt: this.shippingApt,
        //     SSN: this.isManual ? this.ssn : this.ccSSN,
        //     Birthdate: this.isManual ? this.DOB : this.ccDOB,
        //     DL: this.isManual ? this.DLnumber : this.ccDL,
        //     DLState: this.isManual ? this.DLstate : this.ccDLstate,
        //     DLExpirationDate: this.isManual ? this.DLexpDate : this.ccDLexpDate,
        //     BillingStreet: this.billingAddress,
        //     BillingCity: this.billingCity,
        //     BillingApt: this.billingApt,
        //     BillingState: this.billingState,
        //     ShippingZipCode: this.shippingZip,
        //     BillingZipCode: this.billingZip
        // };
        // if (
        //     this.shippingAddress !== this.addressInfo.address ||
        //     this.shippingApt !== this.addressInfo.apt ||
        //     this.shippingCity !== this.addressInfo.city ||
        //     this.shippingZip !== this.addressInfo.zip ||
        //     (this.showBillingAddress &&
        //         (this.billingAddress !== this.addressInfo.address ||
        //             this.billingApt !== this.addressInfo.apt ||
        //             this.billingCity !== this.addressInfo.city ||
        //             this.billingZip !== this.addressInfo.zip))
        // ) {
        //     this.addressDiscrepancy = true;
        // }
        // let orderCalloutData = {
        //     offerId: this.offerId,
        //     partnerName: "directv",
        //     callLogId: "",
        //     tab: "creditcheck",
        //     serviceRef: "",
        //     customer: {
        //         firstName: data.FirstName,
        //         middleName: data.MiddleName,
        //         lastName: data.LastName,
        //         emailAddress: data.Email,
        //         phoneNumber: data.Phone
        //     },
        //     account: {
        //         contactEmail: "",
        //         customerAcceptedTC: true,
        //         tcSource: "",
        //         billingAddress: {
        //             addressLine1: this.showBillingAddress ? data.BillingStreet : data.ShippingStreet,
        //             addressLine2: "",
        //             city: this.showBillingAddress ? data.BillingCity : data.ShippingCity,
        //             state: this.showBillingAddress ? data.BillingState : data.ShippingState,
        //             country: this.showBillingAddress ? data.BillingCountry : data.ShippingCountry,
        //             county: "",
        //             zipCode: this.showBillingAddress ? data.BillingZipCode : data.ShippingZipCode
        //         },
        //         ssn: data.SSN,
        //         pin: "",
        //         dob: data.Birthdate,
        //         drivingLicense: {
        //             dlNumber: data.DL,
        //             expDate: data.DLExpirationDate,
        //             dlState: data.DLState
        //         }
        //     }
        // };

        let calloutData = {};
        /*
            tab: "creditcheck",
            partnerName: "directv",
            partnerOrderNumber: this.orderInfo.partnerOrderNumber,
            componentCode: this.orderInfo.componentCode,
            productType: "dtv",
            customerType: "RESIDENTIAL",
            customer: this.orderInfo.customer,
            account: {
                ssn: this.isManual ? this.ssn : this.ccSSN,
                pin: "",
                dob: this.isManual ? this.DOB : this.ccDOB,
                drivingLicense: {
                    dlNumber: this.isManual ? this.DLnumber : this.ccDL,
                    expDate: this.isManual ? this.DLexpDate : this.ccDLexpDate,
                    dlState: this.isManual ? this.DLstate : this.ccDLstate
                }
            }
        };
        const options = {};
        const params = {
            input: JSON.stringify(calloutData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_ProviderCallouts",
            options: JSON.stringify(options)
        };
        this._actionUtil d
            .executeAction(params, null, this, null, null)
            .then((response) => {
               // console.log(response);
              //  let creditDecision = response.result.IPResult.rc1CreditDecision;
              //  this.loaderSpinner = false;
                //     let status;
                //     if (this.firstName === "Freeze") {
                //         let mockFreezeResponse = {
                //             offerId: "607024",
                //             transactionId: "08b622e0-0919-11ed-b560-06f0d2bdd95a",
                //             errorInfo: {
                //                 errorCode: "0001",
                //                 errorMessage: "Fail - Credit Check Freeze"
                //             },
                //             customer: {
                //                 firstName: "Earl",
                //                 middleName: "E",
                //                 lastName: "Everett"
                //             },
                //             advancePayInd: "N"
                //         };
                //         status =
                //             mockFreezeResponse.hasOwnProperty("errorInfo") &&
                //             mockFreezeResponse.errorInfo.errorCode !== "0000"
                //                 ? false
                //                 : true;
                //     } else {
                //         status =
                //             response.result.IPResult.hasOwnProperty("errorInfo") &&
                //             response.result.IPResult.errorInfo.errorCode !== "0000"
                //                 ? false
                //                 : true;
                //     }
                //     if (!status) {
                //         if (this.firstName === "Freeze") {
                //             this.creditFreeze = true;
                //         } else {
                //             this.creditFreeze = response.result.IPResult.errorInfo.errorMessage
                //                 .toLowerCase()
                //                 .includes("freeze");
                //         }
                //         if (this.creditFreeze) {
                //             this.loaderSpinner = true;
                //             const event = new ShowToastEvent({
                //                 title: "Credit Check Declined Response",
                //                 variant: "error",
                //                 message: "The customer is on a Credit Freeze situation. Please review the information."
                //             });
                //             this.dispatchEvent(event);
                //             let myData = {
                //                 ContextId: this.recordId
                //             };
                //             const options = {};
                //             const params = {
                //                 input: JSON.stringify(myData),
                //                 sClassName: `vlocity_cmt.IntegrationProcedureService`,
                //                 sMethodName: "Buyflow_saveCreditFreeze",
                //                 options: JSON.stringify(options)
                //             };
                //             this._actionUtil
                //                 .executeAction(params, null, this, null, null)
                //                 .then((response) => {
                //                     console.log(response);
                //                     this.fraudValidation(data, true);
                //                     this.loaderSpinner = false;
                //                     return;
                //                 })
                //                 .catch((error) => {
                //                     console.error(error, "ERROR");
                //                     this.loaderSpinner = false;
                //                     return;
                //                 });
                //         } else {
                //             const event = new ShowToastEvent({
                //                 title: "Credit Check Declined Response",
                //                 variant: "error",
                //                 message: response.result.IPResult.errorInfo.errorMessage
                //             });
                //             this.dispatchEvent(event);
                //             this.fraudValidation(data, false);
                //         }
                //     } else {
                //         let repType;
                //         switch (this.origin) {
                //             case "callcenter":
                //                 repType = "Call Center";
                //                 break;
                //             case "retail":
                //                 repType = "Retail";
                //                 break;
                //             case "event":
                //                 repType = "Event";
                //                 break;
                //             case "maps":
                //                 repType = "Door To Door";
                //                 break;
                //         }
                //         let productsArray = this.selectedProduct.split(";");
                //         let bundle = productsArray[0];
                //         productsArray.shift();
                //         let addersArray = [];
                //         productsArray = productsArray.forEach((item) => {
                //             let adder = {
                //                 Name: item.substring(0, 80)
                //             };
                //             addersArray.push(adder);
                //         });
                //         let json = {
                //             addressDiscrepancy: this.addressDiscrepancy,
                //             family: "DirecTV",
                //             representative: repType,
                //             timeStamp: new Date(),
                //             ContextId: this.recordId,
                //             recordTypeName: "Consumer",
                //             ProductName: bundle.substring(0, 80),
                //             Adders: addersArray,
                //             recordTypeId: this.recType,
                //             Pricebook: "Standard Price Book",
                //             accName: data.FirstName + " " + data.LastName,
                //             creditCheck: {
                //                 accountDetails: {
                //                     billingCreditCheckAddress: {
                //                         shippingSameAsBilling: this.showBillingAddress,
                //                         billingAddress: data.BillingStreet,
                //                         billingAptNumber: data.BillingApt,
                //                         billingCity: data.BillingCity,
                //                         billingState: data.BillingState,
                //                         billingZip: data.BillingZipCode
                //                     },
                //                     shippingServiceAddresss: {
                //                         shippingAddress: data.ShippingStreet,
                //                         shippingAptNumber: data.ShippingApt,
                //                         shippingCity: data.ShippingCity,
                //                         shippingZip: data.ShippingZipCode,
                //                         shippingState: data.ShippingState
                //                     }
                //                 },
                //                 identification: {
                //                     ssn: data.SSN,
                //                     ssnRepeat: data.SSN,
                //                     driversLicenseNumber: data.DL,
                //                     driversLicenseState: data.DLState,
                //                     driversLicenseExpirationDate: data.DLExpirationDate,
                //                     dateOfBirth: data.Birthdate,
                //                     checkApproval: this.disclosureAgreement,
                //                     personalInformationType:
                //                         data.SSN !== null && data.SSN !== undefined && data.SSN !== "" ? "ssn" : "dl"
                //                 },
                //                 customerDetails: {
                //                     contactInformation: {
                //                         firstName: data.FirstName,
                //                         middleName: data.MiddleName,
                //                         lastName: data.LastName,
                //                         email: data.Email,
                //                         contactPhone: data.Phone
                //                     }
                //                 }
                //             }
                //         };
                //         let clientInfo = {
                //             addressInfo: {
                //                 address: data.ShippingStreet,
                //                 apt: data.ShippingApt,
                //                 city: data.ShippingCity,
                //                 number: data.ShippingApt,
                //                 state: data.ShippingState,
                //                 zip: data.ShippingZipCode
                //             },
                //             selectedAddressInfo: this.addressApi,
                //             address: {
                //                 addressLine1: data.ShippingStreet,
                //                 addressLine2: "",
                //                 city: data.ShippingCity,
                //                 state: data.ShippingState,
                //                 zipCode: data.ShippingZipCode,
                //                 county: ""
                //             },
                //             contactInfo: {
                //                 firstName: data.FirstName,
                //                 middleName: data.MiddleName,
                //                 lastName: data.LastName,
                //                 email: data.Email,
                //                 phone: data.Phone
                //             },
                //             accountInfo: {
                //                 ssn: data.SSN,
                //                 pin: "",
                //                 dob: data.Birthdate,
                //                 drivingLicense: {
                //                     dlNumber: data.DL,
                //                     expDate: data.DLExpirationDate,
                //                     dlState: data.DLState
                //                 }
                //             }
                //         };
                //         const options = {};
                //         const params = {
                //             input: JSON.stringify(json),
                //             sClassName: `vlocity_cmt.IntegrationProcedureService`,
                //             sMethodName: "Buyflow_saveAccountInformation",
                //             options: JSON.stringify(options)
                //         };
                //         this._actionUtil
                //             .executeAction(params, null, this, null, null)
                //             .then((response) => {
                //                 console.log(response);
                //                 let IPResult = response.result.IPResult;
                //                 if (
                //                     IPResult.hasOwnProperty("result") &&
                //                     IPResult.result.hasOwnProperty("errors") &&
                //                     IPResult.result.errors.hasOwnProperty("DRSaveClientContact") &&
                //                     IPResult.result.errors.DRSaveClientContact.hasOwnProperty("0:0")
                //                 ) {
                //                     this.loaderSpinner = false;
                //                     const event = new ShowToastEvent({
                //                         title: "Error",
                //                         variant: "error",
                //                         message:
                //                             "The Phone or Address information is already associated with another customer"
                //                     });
                //                     this.dispatchEvent(event);
                //                 } else {
                //                     json.creditCheck.IPResult = IPResult;
                //                     json.AccountId = json.creditCheck.IPResult.Account_1[0].Id;
                //                     const options = {};
                //                     const params = {
                //                         input: JSON.stringify(json),
                //                         sClassName: `vlocity_cmt.IntegrationProcedureService`,
                //                         sMethodName: "Buyflow_saveNewOrder",
                //                         options: JSON.stringify(options)
                //                     };
                //                     this._actionUtil
                //                         .executeAction(params, null, this, null, null)
                //                         .then((response) => {
                //                             console.log(response);
                //                             let Order = response.result.IPResult.OrderItem_2;
                //                             let OrderItems = response.result.IPResult.Order_1[0];
                //                             json.Order = Order;
                //                             json.OrderItems = OrderItems;
                //                             this.loaderSpinner = false;
                //                             let data = {
                //                                 offerId: this.offerId,
                //                                 clientInfo: clientInfo,
                //                                 customer: orderCalloutData.customer,
                //                                 accountId: orderCalloutData.account,
                //                                 referenceNumber: this.referenceNumber,
                //                                 creditCheckCallout: orderCalloutData
                //                             };
                //                             const closeModalEvent = new CustomEvent("creditcheckpassed", {
                //                                 detail: data
                //                             });
                //                             this.dispatchEvent(closeModalEvent);
                //                         })
                //                         .catch((error) => {
                //                             console.error(error, "ERROR");
                //                             this.loaderSpinner = false;
                //                         });
                //                 }
                //             })
                //             .catch((error) => {
                //                 console.error(error, "ERROR");
                //                 this.loaderSpinner = false;
                //             });
                //     }
           /* }) 
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    message: "The Credit Check request could not be made correctly to the server. Please, try again."
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
            }); */
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
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody = "Fill your personal info " + index[0] + "/s/pci-personal-info?c__ContextId=" + this.recordId;
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
                    message: "The SMS could not be sent. Please, verify the telephone number and try again."
                });
                this.dispatchEvent(event);
            });
    }

    sendPCIEmail() {
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody =
            "Please follow this link to enter your personal information " +
            index[0] +
            "/s/pci-personal-info?c__ContextId=" +
            this.recordId;
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
                    message: "The email could not be sent. Please, verify the email address and try again."
                });
                this.dispatchEvent(event);
            });
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    fraudValidation(data, creditfreeze) {
        this.loaderSpinner = false;
        if (this.validationSSNtry <= this.fraudLimit && !creditfreeze) {
            const event = new ShowToastEvent({
                title: "Credit Check Declined Response",
                variant: "error",
                message: "The information entered did not pass the Credit Check verification. Please review it."
            });
            this.dispatchEvent(event);
        }
        if (this.validationSSNtry <= this.fraudLimit) {
            if (
                this.validationSSNtry == 0 ||
                (data.SSN !== this.ssnValidation && data.FullName === this.nameValidation)
            ) {
                this.nameValidation = data.FullName;
                this.validationSSNtry = this.validationSSNtry + 1;
                this.ssnValidation = data.SSN;
            } else if (data.FullName !== this.nameValidation) {
                this.validationSSNtry = 1;
                this.ssnValidation = data.SSN;
                this.nameValidation = data.FullName;
            }
        }
        if (this.validationSSNtry > this.fraudLimit) {
            this.ssnLimit = true;
        }
        if (
            this.validationAddressTry == 0 ||
            (data.ShippingStreet !== this.addressValidation && this.nameAddressValidation === data.FullName) ||
            (data.ShippingStreet === this.addressValidation && this.nameAddressValidation !== data.FullName)
        ) {
            this.validationAddressTry = this.validationAddressTry + 1;
            this.nameAddressValidation = data.FullName;
            this.addressValidation = data.ShippingStreet;
        } else if (data.FullName !== this.nameAddressValidation && data.ShippingStreet !== this.addressValidation) {
            this.nameAddressValidation = data.FullName;
            this.validationAddressTry = 1;
            this.addressValidation = data.ShippingStreet;
        }
        this.addressWarning = this.validationAddressTry >= this.fraudLimit ? true : false;
    }

    handleModals() {
        console.log(this.debugQuestions);
        if (!this.showPreModal) {
            this.showPreModal = true;
        } else {
            this.showPreModal = false;
            if (this.debugQuestions) {
                this.openModalQuestions();
            } else if (this.debugDebt) {
                this.openModalDebt();
            } else {
                this.openModal();
            }
        }
    }

    setDebugQuestions(event) {
        this.debugQuestions = event.target.checked;
        console.log("Todo: " + event.target.checked);
    }

    setDebugPayment(event) {
        this.debugDebt = event.target.checked;
        console.log("Todo: " + event.target.checked);
    }

    hideModal() {
        if (this.showPreModal) {
            this.showPreModal = false;
        } else {
            this.showModal = false;
            this.showModalDebt = false;
            this.showModalQuestions = false;
        }
    }

    openModal() {
        this.loaderSpinner = true;
        setTimeout(() => {
            this.showModal = true;
            this.loaderSpinner = false;
        }, 1000);
    }

    closeModal() {
        this.showModal = false;
    }

    get creditAnswers() {
        return [
            { label: "Blue", value: "1" },
            { label: "Pink", value: "2" }
        ];
    }

    openModalQuestions() {
        this.loaderSpinner = true;
        setTimeout(() => {
            this.showModalQuestions = true;
            this.loaderSpinner = false;
        }, 1500);
    }

    closeModalQuestions() {
        this.loaderSpinner = true;
        this.showModalQuestions = false;
        setTimeout(() => {
            this.showModal = true;
            this.loaderSpinner = false;
        }, 1200);
    }

    openModalDebt() {
        this.loaderSpinner = true;
        setTimeout(() => {
            this.showModalDebt = true;
            this.loaderSpinner = false;
        }, 1500);
    }

    closeModalDebt() {
        this.showModalDebt = false;
        this.loaderSpinner = true;
        setTimeout(() => {
            this.showModal = true;
            this.loaderSpinner = false;
        }, 1200);
    }

    handleClick() {
        const sendBackEvent = new CustomEvent("creditchecknext");
        this.dispatchEvent(sendBackEvent);
    }
}