import { LightningElement, api, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const stateNames = [
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

const customerType = "RESIDENTIAL";

export default class Poe_lwcBuyflowDirecTvInfoTab extends NavigationMixin(LightningElement) {
    dealerCode;
    @api recordId;
    @api logo;
    @api origin;
    @api clientInfo;
    @api returnUrl;
    @api codeNFFL;
    @api codeFFL;
    noCompleteInfo = true;
    firstName;
    middleName;
    lastName;
    phoneNumber;
    emailAddress;
    address;
    apt;
    city;
    state;
    stateName;
    stateOptions = [];
    dealerOptions = [];
    zip;
    showLoaderSpinner;
    showCollateral;
    isExistingCustomer = "false";
    showModal = false;
    showSuggestedAddressModal = false;
    suggestedAddresses = [];
    suggestedAddressSelected = false;
    partnerOrderNumber;
    NFFL = false;
    message;
    showMessageModal = false;
    orderInfo;
    disclosureAgreementLabel = "I have read the above disclosures to the customer, and the customer agreed";

    get optionsRadio() {
        return [
            { label: "Yes", value: "true" },
            { label: "No", value: "false" }
        ];
    }

    connectedCallback() {
        this.showLoaderSpinner = true;
        this.firstName = this.clientInfo.contactInfo.firstName;
        this.lastName = this.clientInfo.contactInfo.lastName;
        this.emailAddress = this.clientInfo.contactInfo.email;
        this.phoneNumber = this.clientInfo.contactInfo.phone;
        this._actionUtil = new OmniscriptActionCommonUtil();
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.stateOptions.push(option);
        });
        let opt = [];
        if (this.codeFFL === "none" && this.codeNFFL === "none") {
            let myData = {
                Id: this.recordId,
                program: "DirecTV"
            };
            const options = {};
            const params = {
                input: JSON.stringify(myData),
                sClassName: `vlocity_cmt.IntegrationProcedureService`,
                sMethodName: "Buyflow_GetDtvDealerCode",
                options: JSON.stringify(options)
            };
            this._actionUtil
                .executeAction(params, null, this, null, null)
                .then((response) => {
                    let codes = [...response.result.IPResult.Codes];
                    codes.forEach((item) => {
                        let newOp = {
                            label: `${item.POE_Dealer_Code__c} - ${item.POE_Program_Type__c}`,
                            value: item.POE_Dealer_Code__c
                        };
                        opt.push(newOp);
                    });
                    this.dealerOptions = [...opt];
                    this.getAddressinfo();
                })
                .catch((error) => {
                    this.showLoaderSpinner = false;
                    console.log(error);
                });
        } else {
            if (this.codeNFFL !== "none") {
                let newOp = {
                    label: `${this.codeNFFL} - NFFL`,
                    value: this.codeNFFL
                };
                opt.push(newOp);
            }
            if (this.codeFFL !== "none") {
                let newOp = {
                    label: `${this.codeFFL} - FFL`,
                    value: this.codeFFL
                };
                opt.push(newOp);
            }
            this.dealerOptions = [...opt];
            this.getAddressinfo();
        }
    }

    getAddressinfo() {
        let myData = {
            Id: this.recordId,
            Program: "DirecTV"
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_getAddressInfo",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                let result = response.result.IPResult;
                let opportunity = result.Opportunity;
                if (typeof opportunity === "object") {
                    this.city = opportunity.hasOwnProperty("Maps_City__c") ? opportunity.Maps_City__c : undefined;
                    this.address = opportunity.hasOwnProperty("Maps_Street__c")
                        ? opportunity.Maps_Street__c
                        : undefined;
                    this.apt = opportunity.hasOwnProperty("Maps_Appartment__c")
                        ? opportunity.Maps_Appartment__c
                        : undefined;
                    let stateLong = opportunity.hasOwnProperty("Maps_State__c") ? opportunity.Maps_State__c : undefined;
                    this.state =
                        stateLong !== undefined
                            ? this.stateOptions.filter(
                                  (state) => stateLong === state.label || stateLong === state.value
                              )[0].value
                            : undefined;
                    this.stateName =
                        stateLong !== undefined
                            ? this.stateOptions.filter(
                                  (state) => stateLong === state.label || stateLong === state.value
                              )[0].label
                            : undefined;
                    this.zip = opportunity.hasOwnProperty("Maps_PostalCode__c")
                        ? opportunity.Maps_PostalCode__c
                        : undefined;
                }
                this.disableValidation();
                let aci = {
                    ContextId: this.recordId
                };
                const options = {};
                const params = {
                    input: JSON.stringify(aci),
                    sClassName: `vlocity_cmt.IntegrationProcedureService`,
                    sMethodName: "Buyflow_saveACIPresentation",
                    options: JSON.stringify(options)
                };
                this._actionUtil
                    .executeAction(params, null, this, null, null)
                    .then((response) => {
                        this.showLoaderSpinner = false;
                    })
                    .catch((error) => {
                        this.showLoaderSpinner = false;
                        console.log(error);
                    });
            })
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
            });
    }

    handleChange(event) {
        this.suggestedAddressSelected = false;
        switch (event.target.name) {
            case "firstName":
                this.firstName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "middleName":
                this.middleName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "lastName":
                this.lastName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "phoneNumber":
                this.phoneNumber =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "emailAddress":
                this.emailAddress =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;

            case "address":
                this.address =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "apt":
                this.apt =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "city":
                this.city =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "state":
                this.state =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                this.stateName =
                    this.state !== undefined ? this.stateOptions.find((e) => e.value == this.state).label : undefined;
                break;
            case "zip":
                this.zip =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "existingCustomer":
                this.isExistingCustomer = event.target.value === "true" ? event.target.value : "false";
                this.showModal = this.isExistingCustomer === "true" ? true : false;
                break;
            case "dealerCode":
                this.dealerCode = event.target.value;
                this.NFFL = this.dealerOptions
                    .filter((item) => item.value === event.target.value)[0]
                    .label.includes("NFFL");
                break;
        }
        this.disableValidation();
    }

    hideModal() {
        this.showModal = false;
        this.showSuggestedAddressModal = false;
    }

    disableValidation() {
        if (
            this.dealerCode !== undefined &&
            this.address !== undefined &&
            this.city !== undefined &&
            this.state !== undefined &&
            this.zip !== undefined &&
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            this.phoneNumber !== undefined &&
            this.emailAddress !== undefined &&
            this.isExistingCustomer === "false"
        ) {
            this.noCompleteInfo = false;
        } else {
            this.noCompleteInfo = true;
        }
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

    handleClick() {
        this.showLoaderSpinner = true;
        let name;
        switch (this.origin) {
            case "retail":
                name = "Retail Opportunity";
                break;
            case "event":
                name = "Event Opportunity";
                break;
            case "phonesales":
                name = "Phone Sales Opportunity";
                break;
            default:
                name = "Maps Opportunity";
                break;
        }
        let info = {
            Maps_Appartment__c: this.apt !== undefined ? this.apt : null,
            Maps_City__c: this.city !== undefined ? this.city : null,
            Maps_Country__c: "United States",
            Maps_PostalCode__c: this.zip !== undefined ? this.zip : null,
            Maps_State__c: this.stateOptions.filter((state) => this.state === state.value)[0].label,
            Maps_Street__c: this.address !== undefined ? this.address : null,
            POE_DTV_Program_Selected__c: this.dealerOptions.filter((item) => item.value === this.dealerCode)[0].label,
            Name: name,
            StageName: "DM",
            Id: this.recordId !== undefined ? this.recordId : null
        };
        let myData = {
            opportunity: info,
            origin: this.origin,
            contact: false
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_saveOpportunityAddressInformation",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                this.addressCallout(info);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
            });
    }

    addressCallout(info) {
        let myData = {
            partnerName: "directv",
            dealerCode: this.dealerCode,
            customerFacing: this.origin !== "phonesales",
            tab: "info",
            customerType: customerType,
            address: {
                addressLine1: info.Maps_Street__c,
                addressLine2: this.apt !== undefined ? this.apt : "",
                addressLine2Type: "",
                city: info.Maps_City__c,
                state: this.state,
                country: info.Maps_Country__c,
                zipCode: info.Maps_PostalCode__c
            },
            customer: {
                firstName: this.firstName !== undefined ? this.firstName : "",
                middleName: this.middleName !== undefined ? this.middleName : "",
                lastName: this.lastName !== undefined ? this.lastName : "",
                emailAddress: this.emailAddress !== undefined ? this.emailAddress : "",
                phoneNumber: this.phoneNumber !== undefined ? this.phoneNumber : ""
            }
        };
        if (this.suggestedAddressSelected) {
            myData.multiAddress = true;
            myData.partnerOrderNumber = this.partnerOrderNumber;
        }
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
                let dtv = response.result.IPResult.dtv;
                let atv = response.result.IPResult.atv;
                let hasSuggestedAddress = dtv.hasOwnProperty("suggestedAddress");
                hasSuggestedAddress ? (this.suggestedAddresses = [...dtv.suggestedAddress]) : [];
                if (dtv.hasOwnProperty("code") && response.result.IPResult.code == "2009") {
                    this.message = response.result.IPResult?.message;
                }
                let msg =
                    dtv.hasOwnProperty("result") &&
                    dtv.result.hasOwnProperty("error") &&
                    dtv.result.error.hasOwnProperty("provider")
                        ? dtv.result.error.provider.message
                        : dtv.hasOwnProperty("message")
                        ? dtv.message
                        : dtv.hasOwnProperty("error")
                        ? dtv.error
                        : "";
                if (dtv.serviceAvailability || atv.serviceAvailability) {
                    this.orderInfo = {
                        address: {
                            addressLine1: info.Maps_Street__c,
                            addressLine2: this.apt !== undefined ? this.apt : "",
                            addressLine2Type: "",
                            city: info.Maps_City__c,
                            state: this.state,
                            country: info.Maps_Country__c,
                            zipCode: info.Maps_PostalCode__c
                        },
                        customer: {
                            firstName: this.firstName !== undefined ? this.firstName : null,
                            middleName: this.middleName !== undefined ? this.middleName : null,
                            lastName: this.lastName !== undefined ? this.lastName : null,
                            emailAddress: this.emailAddress !== undefined ? this.emailAddress : null,
                            phoneNumber: this.phoneNumber !== undefined ? this.phoneNumber : null
                        },
                        dealerCode: this.dealerCode,
                        customerType: customerType,
                        dtv: dtv,
                        atv: atv
                    };
                    if (!!this.message) {
                        this.showLoaderSpinner = false;
                        this.showMessageModal = true;
                    } else {
                        console.log(this.orderInfo);
                        this.saveAccountInfo(this.orderInfo, msg);
                    }
                } else if (hasSuggestedAddress) {
                    this.partnerOrderNumber = dtv.partnerOrderNumber;
                    this.suggestedAddressSelected = true;
                    this.showLoaderSpinner = false;
                    this.showSuggestedAddressModal = true;
                } else {
                    let errorMessage;
                    let title;
                    if (String(msg).length > 15) {
                        errorMessage = msg;
                        title = "Service Found";
                    } else {
                        msg = "No Offers Found" ? "No Offers Found. " : msg;
                        errorMessage =
                            msg +
                            "Please validate the information entered. In case the correct address was entered, let the customer know and indicate the corresponding Outcome on the Disposition";
                        title = "Service not Available";
                    }

                    const event = new ShowToastEvent({
                        title: title,
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.showLoaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message:
                        "The request could not be made correctly to the server. Please, validate the information and try again."
                });
                this.dispatchEvent(event);
                this.showLoaderSpinner = false;
            });
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleSuggestedAddress(event) {
        let response = JSON.parse(JSON.stringify(event.detail));
        this.address = response.addressLine1;
        this.apt = response.addressLine2;
        this.city = response.city;
        this.state = response.state;
        this.zip = response.zipCode;
        this.hideModal();
    }

    handleMessageModal() {
        this.showMessageModal = false;
        this.showLoaderSpinner = true;
        this.saveAccountInfo(this.orderInfo, this.message);
    }

    saveAccountInfo(orderInfo, msg) {
        let data = {
            accName: this.firstName + " " + this.lastName,
            ContextId: this.recordId,
            recordTypeName: "Person Account",
            creditCheck: {
                customerDetails: {
                    contactInformation: {
                        firstName: this.firstName,
                        middleName: this.middleName == null || this.middleName == undefined ? "" : this.middleName,
                        lastName: this.lastName,
                        email: this.emailAddress,
                        contactPhone: this.phoneNumber
                    }
                },
                accountDetails: {
                    billingCreditCheckAddress: {
                        billingAddress: this.address,
                        billingAptNumber: this.apt,
                        billingCity: this.city,
                        billingState: this.state,
                        billingStateName: this.stateName,
                        billingZip: this.zip
                    },
                    shippingServiceAddresss: {
                        shippingAddress: this.address,
                        shippingAptNumber: this.apt,
                        shippingCity: this.city,
                        shippingZip: this.zip,
                        shippingState: this.state,
                        shippingStateName: this.stateName
                    }
                }
            }
        };
        const options = {};
        const params = {
            input: JSON.stringify(data),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_saveAccountInformation",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                let IPResult = response.result.IPResult;
                if (
                    IPResult.hasOwnProperty("result") &&
                    IPResult.result.hasOwnProperty("errors") &&
                    IPResult.result.errors.hasOwnProperty("DRSaveClientContact") &&
                    IPResult.result.errors.DRSaveClientContact.hasOwnProperty("0:0")
                ) {
                    this.showLoaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: "Error",
                        mode: "sticky",
                        variant: "error",
                        message: "The Phone or Address information is already associated with another customer"
                    });
                    this.dispatchEvent(event);
                } else {
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success"
                    });
                    this.dispatchEvent(event);
                    this.showLoaderSpinner = false;
                    let accountId = response.result.IPResult.Account_1[0].Id;
                    let dealerCode = this.dealerCode;
                    let NFFL = this.NFFL;
                    if (this.suggestedAddressSelected) {
                        let multiAddress = true;
                        const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                            detail: { orderInfo, accountId, dealerCode, NFFL, multiAddress }
                        });
                        this.dispatchEvent(sendCheckServiceabilityEvent);
                    } else {
                        const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                            detail: { orderInfo, accountId, dealerCode, NFFL }
                        });
                        this.dispatchEvent(sendCheckServiceabilityEvent);
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
            });
    }
    get isCallCenterOrigin() {
        return this.origin == "phonesales";
    }
}