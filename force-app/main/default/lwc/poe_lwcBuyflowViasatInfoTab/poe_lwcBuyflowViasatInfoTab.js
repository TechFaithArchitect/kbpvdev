import { LightningElement, api, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import getAddressInfo from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveACIPresentation from "@salesforce/apex/InfoTabController.saveACIPresentation";
import getDealerCode from "@salesforce/apex/InfoTabController.getDealerCode";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import Address_info from "@salesforce/label/c.Address_info";
import No_dealer_codes_available_for_this_account from "@salesforce/label/c.No_dealer_codes_available_for_this_account";
import Windstream_validation_information from "@salesforce/label/c.Windstream_validation_information";
import Chuzo_Generic_Error_Message from "@salesforce/label/c.Chuzo_Generic_Error_Message";
import no_geolocation_data_was_retrieve from "@salesforce/label/c.no_geolocation_data_was_retrieve";
import No_agreements_were_returned from "@salesforce/label/c.No_agreements_were_returned";
import the_agreement_callout_could_not_be_made_correctly from "@salesforce/label/c.the_agreement_callout_could_not_be_made_correctly";

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

export default class Poe_lwcBuyflowViasatInfoTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api isGuestUser;
    @api referralCodeData;
    noCompleteInfo = true;
    address;
    apt;
    city;
    state;
    stateOptions = [];
    zip;
    showLoaderSpinner;
    showCollateral;
    useContactInfo = "true";
    isExistingCustomer = "false";
    showModal = false;
    partnerOrderNumber;
    showAgreementsModal;
    agreements = [];
    orderInfo;
    latitude;
    longitude;
    partyId;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        Address_info,
        No_dealer_codes_available_for_this_account,
        Windstream_validation_information,
        Chuzo_Generic_Error_Message,
        no_geolocation_data_was_retrieve,
        No_agreements_were_returned,
        the_agreement_callout_could_not_be_made_correctly
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

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    showAddressComponent = false;

    connectedCallback() {
        if (this.isGuestUser) {
            console.log("ref ", this.referralCodeData);
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.showLoaderSpinner = true;
        this.getDealerCodeData();
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.stateOptions.push(option);
        });
        let input = {
            Id: this.recordId,
            Program: "Viasat"
        };
        getAddressInfo({ myData: input })
            .then((response) => this.handleGetAddressInfo(response))
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    handleGetAddressInfo(response) {
        let result = response.result;
        let opportunity = result.Opportunity;
        if (typeof opportunity === "object") {
            this.city = opportunity.hasOwnProperty("Maps_City__c") ? opportunity.Maps_City__c : undefined;
            this.address = opportunity.hasOwnProperty("Maps_Street__c") ? opportunity.Maps_Street__c : undefined;
            this.apt = opportunity.hasOwnProperty("Maps_Appartment__c") ? opportunity.Maps_Appartment__c : undefined;
            let stateLong = opportunity.hasOwnProperty("Maps_State__c") ? opportunity.Maps_State__c : undefined;
            this.state =
                stateLong !== undefined
                    ? this.stateOptions.filter((state) => stateLong === state.label || stateLong === state.value)[0]
                          .value
                    : undefined;
            this.zip = opportunity.hasOwnProperty("Maps_PostalCode__c") ? opportunity.Maps_PostalCode__c : undefined;
        }
        this.showAddressComponent = true;
        this.disableValidation();
        let aci = {
            ContextId: this.recordId
        };
        saveACIPresentation({ request: JSON.stringify(aci) })
            .then((response) => {
                this.showLoaderSpinner = false;
            })
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    getDealerCodeData() {
        this.showLoaderSpinner = true;
        let input = {
            Id: this.recordId,
            program: "Viasat",
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
        try {
            let codes = [...response.result.Codes];
            console.log("Partner Party Id", codes);
            this.partyId = codes[0].POE_Dealer_Code__c;
            this.showLoaderSpinner = false;
        } catch (error) {
            const msg = this.labels.No_dealer_codes_available_for_this_account;
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: msg
            });
            console.log(error);
            this.logError(msg);
            this.dispatchEvent(event);
            this.showLoaderSpinner = false;
        }
    }

    handleChange(event) {
        this.suggestedAddressSelected = false;
        switch (event.target.name) {
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

    hideModal() {
        this.showModal = false;
        this.showSuggestedAddressModal = false;
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
        let name;
        if (this.isGuestUser) {
            name = "Self Service Opportunity";
        } else {
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
        }
        let info = {
            Maps_Appartment__c: this.apt !== undefined ? this.apt : null,
            Maps_City__c: this.city !== undefined ? this.city : null,
            Maps_Country__c: "United States",
            Maps_PostalCode__c: this.zip !== undefined ? this.zip : null,
            Maps_State__c: this.stateOptions.filter((state) => this.state === state.value)[0].label,
            Maps_Street__c: this.address !== undefined ? this.address : null,
            Name: name,
            StageName: "DM",
            Id: this.recordId !== undefined ? this.recordId : null
        };
        let input = {
            opportunity: info,
            origin: this.origin,
            contact: false
        };
        saveOpportunityAddressInformation({ myData: input })
            .then((response) => {
                console.log(response);
                this.addressCallout(info);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    addressCallout(info) {
        const path = "serviceAbilities";
        let myData = {
            partnerName: "viasat",
            path: path,
            partnerPartyId: this.partyId,
            tab: "info",
            address: {
                addressLine1: info.Maps_Street__c,
                addressLine2: this.apt !== undefined ? this.apt : "",
                addressLine2Type: "",
                city: info.Maps_City__c,
                state: this.state,
                country: info.Maps_Country__c,
                zipCode: info.Maps_PostalCode__c,
                countryCode: "US"
            }
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
                    this.orderInfo = {
                        address: {
                            addressLine1: info.Maps_Street__c,
                            addressLine2: this.apt !== undefined ? this.apt : "",
                            addressLine2Type: "",
                            city: info.Maps_City__c,
                            state: this.state,
                            country: info.Maps_Country__c,
                            zipCode: info.Maps_PostalCode__c,
                            countryCode: "US"
                        },
                        customer: {
                            firstName: this.firstName !== undefined ? this.firstName : null,
                            middleName: this.middleName !== undefined ? this.middleName : null,
                            lastName: this.lastName !== undefined ? this.lastName : null,
                            emailAddress: this.emailAddress !== undefined ? this.emailAddress : null,
                            phoneNumber: this.phoneNumber !== undefined ? this.phoneNumber : null
                        }
                    };
                    this.getAgreements(myData);
                } else {
                    if (msg === "latitude is a required element." || msg === "longitude is a required element.") {
                        msg = "The address is invalid.";
                    }
                    console.log(msg);
                    let errorMessage =
                        msg +
                        ". " +
                        this.labels.Windstream_validation_information;
                    let title = "Service not Available";
                    this.showLoaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: title,
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    this.labels.Chuzo_Generic_Error_Message;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.showLoaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
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

    getAgreements(myData) {
        myData.path = "partnerAgreement";
        console.log("Agreements Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Agreements Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        responseParsed.result.error.hasOwnProperty("provider") &&
                        responseParsed.result.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error
                        : responseParsed.result.error.provider.message.hasOwnProperty("message")
                        ? responseParsed.result.error.provider.message.message
                        : responseParsed.result.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, myData.path, "API Error");
                } else {
                    this.agreements = responseParsed.hasOwnProperty("agreements") ? [...responseParsed.agreements] : [];
                    this.showLoaderSpinner = false;
                    this.latitude = responseParsed.hasOwnProperty("latitude") ? responseParsed.latitude : undefined;
                    this.longitude = responseParsed.hasOwnProperty("latitude") ? responseParsed.longitude : undefined;
                    if (this.agreements.length > 0 && this.latitude !== undefined && this.longitude !== undefined) {
                        this.showAgreementsModal = true;
                    } else {
                        let errMsg;
                        if (this.latitude === undefined || this.longitude === undefined) {
                            errMsg =
                                this.labels.no_geolocation_data_was_retrieve;
                            const event = new ShowToastEvent({
                                title: "Server Error",
                                variant: "error",
                                mode: "sticky",
                                message: errMsg
                            });
                            this.dispatchEvent(event);
                            this.logError(`${errMsg}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                        } else {
                            errMsg =
                               this.labels.No_agreements_were_returned;
                            const event = new ShowToastEvent({
                                title: "Server Error",
                                variant: "error",
                                mode: "sticky",
                                message: errMsg
                            });
                            this.dispatchEvent(event);
                            this.logError(`${errMsg}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                        }
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                   this.labels.the_agreement_callout_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.showLoaderSpinner = false;
                if (apiResponse) {
                    this.logError(
                        `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                        myData,
                        myData.path,
                        "API Error"
                    );
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    hideAgreements() {
        this.showAgreementsModal = false;
    }

    handleAgreements(event) {
        this.showLoaderSpinner = false;
        let info = { ...this.orderInfo };
        info.salesOnly = event.detail.salesOnly;
        info.agreementId = event.detail.agreementId;
        info.fulfillmentAgreementId = event.detail.fulfillmentAgreementId;
        info.latitude = this.latitude;
        info.longitude = this.longitude;
        info.partyId = this.partyId;
        const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
            detail: info
        });
        this.dispatchEvent(sendCheckServiceabilityEvent);
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Info",
            component: "poe_lwcBuyflowViasatInfoTab",
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