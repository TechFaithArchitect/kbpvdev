import { LightningElement, api, wire, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import getAddressInfo from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveACIPresentation from "@salesforce/apex/InfoTabController.saveACIPresentation";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveAccountInformation from "@salesforce/apex/CreditCheckTabController.saveAccountInformation";
import getOnlyLettersRegEx from "@salesforce/apex/POE_RegExObtainer.getOnlyLettersRegEx";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import getDealerCode from "@salesforce/apex/InfoTabController.getDealerCode";
import NO_DEALER_CODES_MESSAGE from "@salesforce/label/c.POE_Frontier_No_Dealer_Codes_Error";
import NO_DEALER_CODES_MESSAGE_EVENT from "@salesforce/label/c.POE_Frontier_No_Dealer_Codes_Error_Event";
import NO_DEALER_CODES_MESSAGE_RETAIL from "@salesforce/label/c.POE_Frontier_No_Dealer_Codes_Error_Retail";

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
export default class Poe_lwcBuyflowFrontierInfoTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api clientInfo;
    @api isGuestUser;
    @api origin;

    @track onlyLettersRegEx;
    @wire(getOnlyLettersRegEx) onlyLettersRegExParse({ data, error }) {
        if (data) {
            this.onlyLettersRegEx = data;
        } else if (error) {
            console.error(error);
        }
    }
    get onlyLettersRegExPattern() {
        return this.onlyLettersRegEx?.result?.expression;
    }
    get onlyLettersRegExErrorMessage() {
        return this.onlyLettersRegEx?.result?.errorMessage;
    }

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
    zip;
    showLoaderSpinner;
    showCollateral;
    showFrontierInfoPredictiveAddressTab;
    predictiveAddresses = [];
    opportunityName;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage
    };
    showSelfServiceCancelModal = false;
    addressOptions = {
        addressLabel: "Address",
        cityLabel: "City",
        cityPlaceHolder: undefined,
        countryDisabled: true,
        countryLabel: "Country",
        countryPlaceholder: undefined,
        fieldLevelHelp: undefined,
        postalCodeLabel: "Zip",
        postalCodePlaceholder: undefined,
        provinceLabel: "State",
        provincePlaceholder: undefined,
        required: true,
        showAddressLookup: true, // true
        streetLabel: "Street Address",
        streetPlaceholder: undefined,
        addressLine2Label: "Address Line 2",
        addressLine2Placeholder: undefined
    };
    frontierUserId;
    fixedDealerCode = false;
    dealerOptions = [];
    dealerCodes = [];
    agentId;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    showAddressComponent = false;

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.showLoaderSpinner = true;
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.stateOptions.push(option);
        });
        let myData = {
            Id: this.recordId,
            Program: "Frontier"
        };
        getAddressInfo({ myData: myData })
            .then((response) => {
                let result = response.result;
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
                this.firstName = this.clientInfo.contactInfo.firstName;
                this.lastName = this.clientInfo.contactInfo.lastName;
                this.emailAddress = this.clientInfo.contactInfo.email;
                this.phoneNumber = this.clientInfo.contactInfo.phone;
                this.disableValidation();
                let aci = {
                    ContextId: this.recordId
                };

                this.showAddressComponent = true;
                saveACIPresentation({ request: JSON.stringify(aci) })
                    .then((response) => {
                        this.getDealerCodeData();
                    })
                    .catch((error) => {
                        this.showLoaderSpinner = false;
                        this.logError(error.body?.message || error.message);
                        console.log(error);
                    });
            })
            .catch((error) => {
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
                console.log(error);
            });
    }

    getDealerCodeData() {
        this.showLoaderSpinner = true;
        let input = {
            program: "Frontier",
            origin: this.origin
        };

        getDealerCode({ myData: input })
            .then((response) => this.handleGetDealerCode(response))
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    handleGetDealerCode(response) {
        console.log("Dealer Codes Response", response);
        if (
            response.result.hasOwnProperty("Codes") &&
            response.result.Codes.length > 0 &&
            response.result.Codes.every((e) => e.hasOwnProperty("POE_Dealer_Code__c"))
        ) {
            this.agentId = this.isGuestUser ? "online" : response.result.User[0].Id;
            this.dealerCodes = [...response.result.Codes];
            this.handleDealerOptions();
            this.showLoaderSpinner = false;
        } else {
            let message;
            if (this.origin === "retail") {
                message = NO_DEALER_CODES_MESSAGE_RETAIL;
            } else if (this.origin === "event") {
                message = NO_DEALER_CODES_MESSAGE_EVENT;
            } else {
                message = NO_DEALER_CODES_MESSAGE;
            }
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: message
            });
            this.dispatchEvent(event);
            this.showLoaderSpinner = false;
            this.logError(msg);
        }
    }

    handleDealerOptions() {
        let dealerCodeList = [];
        this.fixedDealerCode = this.origin === "event" || this.origin === "retail";
        if (this.fixedDealerCode) {
            let fixedDealerCode = {
                label: this.dealerCodes[0].Frontier_PID__c,
                value: this.dealerCodes[0].POE_Dealer_Code__c
            };
            dealerCodeList.push(fixedDealerCode);
            this.frontierUserId = this.dealerCodes[0].POE_Dealer_Code__c;
        } else {
            this.dealerCodes.forEach((item) => {
                let dealerCodeObject = {
                    label: item.Frontier_PID__c,
                    value: item.POE_Dealer_Code__c
                };
                dealerCodeList.push(dealerCodeObject);
            });
        }
        this.dealerOptions = [...dealerCodeList];
    }

    handleChange(event) {
        switch (event.target.name) {
            case "firstName":
                this.firstName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "middleName":
                this.middleName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "lastName":
                this.lastName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "phoneNumber":
                this.phoneNumber =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "emailAddress":
                this.emailAddress =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "address":
                this.address =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "apt":
                this.apt =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "city":
                this.city =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "state":
                this.state =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                this.stateName =
                    this.state !== undefined ? this.stateOptions.find((e) => e.value == this.state).label : undefined;
                break;
            case "zip":
                this.zip =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "dealerCode":
                this.frontierUserId = event.target.value;
                break;
        }
        this.disableValidation();
    }

    handleAddressChange(event) {
        this.address = event.detail.street != "" ? event.detail.street : undefined;
        this.city = event.detail.city != "" ? event.detail.city : undefined;
        this.apt = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.state = event.detail.province != "" ? event.detail.province : undefined;
        this.zip = event.detail.postalCode != "" ? event.detail.postalCode : undefined;

        this.disableValidation();
    }

    disableValidation() {
        let onlyLetters = new RegExp(this.onlyLettersRegEx.result.expression);
        if (
            this.address !== undefined &&
            this.city !== undefined &&
            this.state !== undefined &&
            this.zip !== undefined &&
            (this.firstName === undefined || onlyLetters.test(this.firstName)) &&
            (this.lastName === undefined || onlyLetters.test(this.lastName)) &&
            this.frontierUserId !== undefined
        ) {
            this.noCompleteInfo = false;
        } else {
            this.noCompleteInfo = true;
        }
    }

    handleCancel() {
        if (this.isGuestUser) {
            this.showSelfServiceCancelModal = true;
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
    hideSelfServiceModal() {
        this.showSelfServiceCancelModal = false;
    }

    selfServiceReturnToHomePage() {
        const goBackEvent = new CustomEvent("home", {
            detail: "",
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(goBackEvent);
    }

    handleClick() {
        this.showLoaderSpinner = true;

        if (this.isGuestUser) {
            this.opportunityName = "Self Service Opportunity";
        } else {
            switch (this.origin) {
                case "retail":
                    this.opportunityName = "Retail Opportunity";
                    break;
                case "event":
                    this.opportunityName = "Event Opportunity";
                    break;
                case "phonesales":
                    this.opportunityName = "Phone Sales Opportunity";
                    break;
                default:
                    this.opportunityName = "Maps Opportunity";
                    break;
            }
        }

        let info = {
            Maps_Appartment__c: this.apt !== undefined ? this.apt : null,
            Maps_City__c: this.city !== undefined ? this.city : null,
            Maps_Country__c: "United States",
            Maps_PostalCode__c: this.zip !== undefined ? this.zip : null,
            Maps_State__c: this.stateOptions.filter((state) => this.state === state.value)[0].label,
            Maps_Street__c: this.address !== undefined ? this.address : null,
            Name: this.opportunityName,
            StageName: "Opportunity",
            Id: this.recordId !== undefined ? this.recordId : null
        };
        let myData = {
            opportunity: info,
            origin: this.origin,
            contact: false
        };
        saveOpportunityAddressInformation({ myData: myData })
            .then((response) => {
                this.addressCallout(info);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
                this.showLoaderSpinner = false;
            });
    }

    addressCallout(info) {
        const path = "serviceAbilities";
        let myData = {
            partnerName: "frapi",
            path,
            address: {
                addressLine1: info.Maps_Street__c,
                addressLine2: this.apt !== undefined ? this.apt : "",
                city: info.Maps_City__c,
                state: this.state,
                country: info.Maps_Country__c,
                zipCode: info.Maps_PostalCode__c
            },
            userId: this.frontierUserId
        };
        console.log("Serviceability Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Serviceability Response", responseParsed);
                let success = responseParsed.serviceAvailability;
                let msg =
                    responseParsed.hasOwnProperty("result") &&
                    responseParsed.result.hasOwnProperty("error") &&
                    responseParsed.result.error.hasOwnProperty("provider")
                        ? responseParsed.result.error.provider.message
                        : responseParsed.hasOwnProperty("message")
                        ? responseParsed.message
                        : responseParsed.hasOwnProperty("error")
                        ? responseParsed.error
                        : "";
                if (success) {
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message: msg
                    });
                    this.dispatchEvent(event);
                    let addressData = {
                        addressInfo: {
                            address: this.address,
                            apt: this.apt,
                            city: this.city,
                            state: this.state,
                            zip: this.zip
                        }
                    };
                    this.checkPredictiveAddresses(addressData.addressInfo);
                } else {
                    const finalErrorMessage =
                        msg !== undefined && msg !== ""
                            ? msg +
                              ". Please validate the information entered. In case the correct address was entered, let the customer know and indicate the corresponding Outcome on the Disposition."
                            : "Please validate the information entered. In case the correct address was entered, let the customer know and indicate the corresponding Outcome on the Disposition.";
                    const event = new ShowToastEvent({
                        title: "Service not Available",
                        variant: "error",
                        mode: "sticky",
                        message: finalErrorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${finalErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.showLoaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
                this.showLoaderSpinner = false;
            });
    }

    checkPredictiveAddresses(info) {
        this.showLoaderSpinner = true;
        const path = "predictiveAddresses";
        let myData = {
            partnerName: "frapi",
            path,
            address: {
                addressLine1: info.address,
                addressLine2: this.apt !== undefined ? this.apt : "",
                city: info.city,
                state: info.state,
                country: info.country,
                zipCode: info.zip
            },
            userId: this.frontierUserId
        };
        console.log("Predictive Address Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Predictive Address Response", responseParsed);
                let result = responseParsed;
                let addresses = [];
                let predictiveAddresses = [];
                let i = 0;
                addresses = JSON.parse(JSON.stringify(result.addresses));
                let success = result.hasOwnProperty("addresses") ? result.addresses : undefined;
                let msg =
                    responseParsed.hasOwnProperty("result") &&
                    responseParsed.result.hasOwnProperty("error") &&
                    responseParsed.result.error.hasOwnProperty("provider")
                        ? responseParsed.result.error.provider.message
                        : responseParsed.hasOwnProperty("message")
                        ? responseParsed.message
                        : responseParsed.hasOwnProperty("error")
                        ? responseParsed.error
                        : "";
                if (success !== undefined) {
                    if (addresses !== undefined) {
                        addresses.forEach((item) => {
                            i = i + 1;
                            if (item.samRecords[0] !== undefined && !item.isParent) {
                                let intAddress = {
                                    AddressKey: item.addressKey,
                                    AddressLine1: item.address.addressLine1,
                                    AddressLine2: item.address.addressLine2,
                                    City: item.address.city,
                                    StateProvince: item.address.stateProvince,
                                    ZipCode: item.address.zipCode.substring(0, 5),
                                    Environment: item.samRecords[0].environment,
                                    ControlNumber: item.samRecords[0].controlNumber,
                                    isChecked:
                                        this.selected !== undefined
                                            ? this.selected.hasOwnProperty("AddressKey")
                                                ? item.addressKey === this.selected.AddressKey
                                                    ? true
                                                    : false
                                                : false
                                            : false
                                };

                                predictiveAddresses.push(intAddress);
                            }
                        });
                    }
                    this.predictiveAddresses = [...predictiveAddresses];
                    if (
                        (this.predictiveAddresses.length == 1 &&
                            this.predictiveAddresses[0].AddressLine1.toLowerCase() ===
                                this.address.toLowerCase().trim() &&
                            ((this.apt !== undefined &&
                                this.predictiveAddresses[0].AddressLine2.toLowerCase() ===
                                    this.apt.toLowerCase().trim()) ||
                                this.apt === undefined) &&
                            this.predictiveAddresses[0].City.toLowerCase() === this.city.toLowerCase().trim() &&
                            this.predictiveAddresses[0].StateProvince.toLowerCase() ===
                                this.state.toLowerCase().trim() &&
                            this.predictiveAddresses[0].ZipCode === this.zip) ||
                        this.predictiveAddresses.some(
                            (i) =>
                                i.AddressLine1.toLowerCase() === this.address.toLowerCase().trim() &&
                                ((this.apt !== undefined &&
                                    i.AddressLine2.toLowerCase() === this.apt.toLowerCase().trim()) ||
                                    this.apt === undefined) &&
                                i.City.toLowerCase() === this.city.toLowerCase().trim() &&
                                i.StateProvince.toLowerCase() === this.state.toLowerCase().trim() &&
                                i.ZipCode === this.zip
                        )
                    ) {
                        let addressData = {
                            addressInfo: {
                                address: this.address,
                                apt: this.apt,
                                city: this.city,
                                state: this.state,
                                zip: this.zip
                            },
                            address: {
                                addressLine1: this.address,
                                addressLine2: this.apt !== undefined ? this.apt : "",
                                city: this.city,
                                county: "",
                                state: this.state,
                                zipCode: this.zip
                            }
                        };
                        let intAddress =
                            this.predictiveAddresses.length === 1
                                ? this.predictiveAddresses[0]
                                : this.predictiveAddresses.filter(
                                      (i) =>
                                          i.AddressLine1.toLowerCase() === this.address.toLowerCase().trim() &&
                                          ((this.apt !== undefined &&
                                              i.AddressLine2.toLowerCase() === this.apt.toLowerCase().trim()) ||
                                              this.apt === undefined) &&
                                          i.City.toLowerCase() === this.city.toLowerCase().trim() &&
                                          i.StateProvince.toLowerCase() === this.state.toLowerCase().trim() &&
                                          i.ZipCode === this.zip
                                  )[0];
                        this.saveAccountInformation(intAddress, addressData);
                        return;
                    }
                    this.showFrontierInfoPredictiveAddressTab = true;
                    this.showLoaderSpinner = false;
                } else {
                    const finalErrorMessage =
                        msg !== undefined
                            ? msg +
                              ". Please validate the information entered. In case the correct address was entered, let the customer know and indicate the corresponding Outcome on the Disposition."
                            : "Please validate the information entered. In case the correct address was entered, let the customer know and indicate the corresponding Outcome on the Disposition.";
                    const event = new ShowToastEvent({
                        title: "Service not Available",
                        variant: "error",
                        mode: "sticky",
                        message: finalErrorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${finalErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.showLoaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
                this.showLoaderSpinner = false;
            });
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    hideModal(e) {
        this.showFrontierInfoPredictiveAddressTab = false;
    }

    selectAddress(event) {
        this.showLoaderSpinner = true;
        let received = JSON.parse(JSON.stringify(event.detail));
        this.showFrontierInfoPredictiveAddressTab = false;
        this.address = received.AddressLine1;
        this.apt = received.AddressLine2;
        this.state = received.StateProvince;
        this.zip = received.ZipCode;
        this.city = received.City;

        let intAddress = {
            AddressKey: received.AddressKey,
            AddressLine1: received.AddressLine1,
            AddressLine2: received.AddressLine2,
            City: received.City,
            StateProvince: received.StateProvince,
            ZipCode: received.ZipCode,
            Environment: received.Environment,
            ControlNumber: received.ControlNumber
        };

        let info = {
            Maps_Appartment__c: this.apt !== undefined ? this.apt : null,
            Maps_City__c: this.city !== undefined ? this.city : null,
            Maps_Country__c: "United States",
            Maps_PostalCode__c: this.zip !== undefined ? this.zip : null,
            Maps_State__c: this.stateOptions.filter((state) => this.state === state.value)[0].label,
            Maps_Street__c: this.address !== undefined ? this.address : null,
            Name: this.opportunityName,
            StageName: "Opportunity",
            Id: this.recordId !== undefined ? this.recordId : null
        };
        let myData = {
            opportunity: info,
            origin: this.origin,
            contact: false
        };
        console.log("Save Opportunity Data", myData);
        saveOpportunityAddressInformation({ myData: myData })
            .then((response) => {
                let addressData = {
                    addressInfo: {
                        address: this.address,
                        apt: this.apt,
                        city: this.city,
                        state: this.state,
                        zip: this.zip
                    },
                    address: {
                        addressLine1: this.address,
                        addressLine2: this.apt !== undefined ? this.apt : "",
                        city: this.city,
                        county: "",
                        state: this.state,
                        zipCode: this.zip
                    }
                };
                this.saveAccountInformation(intAddress, addressData);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
                this.showLoaderSpinner = false;
            });
    }

    saveAccountInformation(intAddress, addressData) {
        if (
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            this.phoneNumber !== undefined &&
            this.emailAddress !== undefined
        ) {
            let data = {
                accName: this.firstName + " " + this.lastName,
                ContextId: this.recordId,
                recordTypeName: "Consumer",
                consent: false,
                creditCheck: {
                    customerDetails: {
                        contactInformation: {
                            firstName: this.firstName,
                            middleName: this.middleName,
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
            console.log("Save Account Info Data", data);
            saveAccountInformation({ myData: data })
                .then((response) => {
                    if (response.result.error) {
                        console.error(response.result.errorMessage);
                        this.showLoaderSpinner = false;
                        const event = new ShowToastEvent({
                            title: "Error",
                            mode: "sticky",
                            variant: "error",
                            message: "The Phone or Address information is already associated with another customer"
                        });
                        this.dispatchEvent(event);
                    } else {
                        let contactInfo = data.creditCheck.customerDetails.contactInformation;
                        let accountId = response.result.Account.Id;
                        this.showLoaderSpinner = false;
                        const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                            detail: {
                                intAddress,
                                addressData,
                                contactInfo,
                                accountId,
                                frontierUserId: this.frontierUserId,
                                agentId: this.agentId
                            }
                        });
                        this.dispatchEvent(sendCheckServiceabilityEvent);
                    }
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.logError(error.body?.message || error.message);
                    this.showLoaderSpinner = false;
                });
        } else {
            const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                detail: {
                    intAddress,
                    addressData,
                    contactInfo: {
                        firstName: this.firstName,
                        lastName: this.lastName,
                        middleName: this.middleName,
                        contactPhone: this.phoneNumber,
                        email: this.emailAddress
                    },
                    frontierUserId: this.frontierUserId,
                    agentId: this.agentId
                }
            });
            this.dispatchEvent(sendCheckServiceabilityEvent);
        }
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Info",
            component: "poe_lwcBuyflowFrontierInfoTab",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }

    handleLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "Info"
        };
        this.dispatchEvent(event);
    }
}