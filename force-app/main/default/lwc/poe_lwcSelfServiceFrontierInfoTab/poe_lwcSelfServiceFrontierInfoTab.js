import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import ToastContainer from "lightning/toastContainer";
import getAddressInfo from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveACIPresentation from "@salesforce/apex/InfoTabController.saveACIPresentation";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import poe_lwcSelfServiceFrontierInfoPredictiveAddressModal from "c/poe_lwcSelfServiceFrontierInfoPredictiveAddressModal";
import DISPOSITION_OUTCOME_ERROR_MESSAGE from "@salesforce/label/c.Self_Service_Disposition_Outcome_Error_Message";

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
export default class Poe_lwcSelfServiceFrontierInfoTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api clientInfo;
    @api frontierUserId;
    @api isGuestUser;
    @api selfServiceAddress;
    @api origin;
    @api referralCodeData;

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
    showAddressComponent = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconFormUser() {
        return chuzoSiteResources + "/images/icon-frontier-user.svg";
    }

    get nextButtonClass() {
        return this.noCompleteInfo
            ? "btn-rounded btn-center hide-mobile btn-disabled"
            : "btn-rounded btn-center hide-mobile";
    }

    get nextButtonClassMobile() {
        return this.noCompleteInfo ? "btn-rounded btn-center btn-disabled" : "btn-rounded btn-center";
    }

    get showInfoTabContent() {
        return !this.selfServiceAddress;
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
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

        if (this.selfServiceAddress) {
            return this.skipInfoTab();
        }

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
                            ? this.stateOptions.filter((state) => stateLong === state.label)[0].value
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
                        this.showLoaderSpinner = false;
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

    skipInfoTab() {
        this.address = this.selfServiceAddress.street;
        this.apt = this.selfServiceAddress.apt;
        this.city = this.selfServiceAddress.city;
        this.state = this.selfServiceAddress.state;
        this.zip = this.selfServiceAddress.zip;
        this.opportunityName = "Self Service Opportunity";

        const info = {
            Maps_Street__c: this.address !== undefined ? this.address : null,
            Maps_City__c: this.city !== undefined ? this.city : null,
            Maps_Country__c: "United States",
            Maps_PostalCode__c: this.zip !== undefined ? this.zip : null
        };

        this.addressCallout(info);
    }

    handleChange(event) {
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
        if (
            this.address !== undefined &&
            this.city !== undefined &&
            this.state !== undefined &&
            this.zip !== undefined
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
            Id: this.recordId !== undefined ? this.recordId : null,
            referralCodeId: this.referralCodeData?.Id || this.referralCodeData?.referralCodeId
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
                    if (this.isNotGuestUser) {
                        const event = new ShowToastEvent({
                            title: "Success",
                            variant: "success",
                            message: msg
                        });
                        this.dispatchEvent(event);
                    }

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
                            ? msg + ". Please validate the information entered and try again.."
                            : " Please validate the information entered and try again..";
                    const event = new ShowToastEvent({
                        title: "Service not Available",
                        variant: "error",
                        mode: "sticky",
                        message: DISPOSITION_OUTCOME_ERROR_MESSAGE
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
                        const contactInfo = {
                            firstName: this.firstName,
                            middleName: this.middleName,
                            lastName: this.lastName,
                            email: this.emailAddress,
                            contactPhone: this.phoneNumber
                        };

                        const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                            detail: { intAddress, addressData, contactInfo }
                        });
                        this.dispatchEvent(sendCheckServiceabilityEvent);
                        return;
                    }
                    this.handlePredictiveAddressModal();
                    this.showLoaderSpinner = false;
                } else {
                    const finalErrorMessage =
                        msg !== undefined
                            ? msg + ". Please validate the information entered and try again."
                            : " Please validate the information entered and try again.";
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

    handlePredictiveAddressModal() {
        poe_lwcSelfServiceFrontierInfoPredictiveAddressModal
            .open({
                addresses: this.predictiveAddresses
            })
            .then((result) => {
                if (result?.detail) {
                    this.selectAddress(result.detail);
                } else {
                    this.selfServiceReturnToHomePage();
                }
            });
    }

    selectAddress(received) {
        this.showLoaderSpinner = true;
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
            Id: this.recordId !== undefined ? this.recordId : null,
            referralCodeId: this.referralCodeData?.Id || this.referralCodeData?.referralCodeId
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

                const contactInfo = {
                    firstName: this.firstName,
                    middleName: this.middleName,
                    lastName: this.lastName,
                    email: this.emailAddress,
                    contactPhone: this.phoneNumber
                };

                const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                    detail: { intAddress, addressData, contactInfo }
                });
                this.dispatchEvent(sendCheckServiceabilityEvent);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
                this.showLoaderSpinner = false;
            });
    }

    // Move this method to personal information / credit check
    // saveAccountInformation(intAddress, addressData) {
    //     let data = {
    //         accName: this.firstName + " " + this.lastName,
    //         ContextId: this.recordId,
    //         recordTypeName: "Consumer",
    //         consent: false,
    //         creditCheck: {
    //             customerDetails: {
    //                 contactInformation: {
    //                     firstName: this.firstName,
    //                     middleName: this.middleName,
    //                     lastName: this.lastName,
    //                     email: this.emailAddress,
    //                     contactPhone: this.phoneNumber
    //                 }
    //             },
    //             accountDetails: {
    //                 billingCreditCheckAddress: {
    //                     billingAddress: this.address,
    //                     billingAptNumber: this.apt,
    //                     billingCity: this.city,
    //                     billingState: this.state,
    //                     billingStateName: this.stateName,
    //                     billingZip: this.zip
    //                 },
    //                 shippingServiceAddresss: {
    //                     shippingAddress: this.address,
    //                     shippingAptNumber: this.apt,
    //                     shippingCity: this.city,
    //                     shippingZip: this.zip,
    //                     shippingState: this.state,
    //                     shippingStateName: this.stateName
    //                 }
    //             }
    //         }
    //     };
    //     saveAccountInformation({ myData: data })
    //         .then((response) => {
    //             if (response.result.error) {
    //                 console.error(response.result.errorMessage);
    //                 this.loaderSpinner = false;
    //                 const event = new ShowToastEvent({
    //                     title: "Error",
    //                     mode: "sticky",
    //                     variant: "error",
    //                     message: "The Phone or Address information is already associated with another customer"
    //                 });
    //                 this.dispatchEvent(event);
    //             } else {
    //                 let contactInfo = data.creditCheck.customerDetails.contactInformation;
    //                 let accountId = response.result.Account.Id;
    //                 this.showLoaderSpinner = false;
    //                 const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
    //                     detail: { intAddress, addressData, contactInfo, accountId }
    //                 });
    //                 this.dispatchEvent(sendCheckServiceabilityEvent);
    //             }
    //         })
    //         .catch((error) => {
    //             console.error(error, "ERROR");
    //             this.logError(error.body?.message || error.message);
    //             this.showLoaderSpinner = false;
    //         });
    // }

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