import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import getAddressInfo from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveACIPresentation from "@salesforce/apex/InfoTabController.saveACIPresentation";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getGeoCodeData from "@salesforce/apex/InfoTabController.getGeoCodeData";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import Chuzo_Generic_Error_Message from "@salesforce/label/c.Chuzo_Generic_Error_Message";
import Windstream_validation_information from "@salesforce/label/c.Windstream_validation_information";
import Windstream_existing_address from "@salesforce/label/c.Windstream_existing_address";

const STATE_NAMES = [
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

export default class poe_lwcBuyflowWindstreamInfoTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api origin;
    @api selectedBuyFlow;
    @api isGuestUser;
    @api additionalInfo;
    noCompleteInfo = true;
    address;
    apt;
    city;
    state;
    stateOptions = [];
    zip;
    showLoaderSpinner;
    showCollateral;
    showPredictiveAddress;
    predictiveAddresses = [];
    addressInfo;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        Chuzo_Generic_Error_Message,
        Windstream_validation_information,
        Windstream_existing_address
    };
    showSelfServiceCancelModal = false;
    showExistingAddressModal = false;
    hardStop = false;
    responseAddressData = {};
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

    get hideCollateral() {
        return !this.showCollateral;
    }

    showAddressComponent = false;

    connectedCallback() {
        this.showLoaderSpinner = true;
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        STATE_NAMES.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.stateOptions.push(option);
        });
        let myData = {
            Id: this.recordId,
            Program: "Windstream"
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
                    this.zip = opportunity.hasOwnProperty("Maps_PostalCode__c")
                        ? opportunity.Maps_PostalCode__c
                        : undefined;
                }
                this.disableValidation();

                this.showAddressComponent = true;
                this.handleSaveACI();
            })
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    handleSaveACI() {
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

    handleChange(event) {
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

    disableValidation() {
        this.noCompleteInfo = this.hardStop || !(this.address && this.city && this.state && this.zip);
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
            Program: "Windstream",
            Id: this.recordId !== undefined ? this.recordId : null
        };
        let myData = {
            opportunity: info,
            origin: this.origin,
            contact: false
        };
        saveOpportunityAddressInformation({ myData: myData })
            .then((response) => {
                console.log(response);
                if (this.predictiveAddresses.length == 0) {
                    this.addressCallout(info);
                } else {
                    let addressData = {
                        addressInfo: {
                            address: this.address,
                            apt: this.apt !== undefined ? this.apt : "",
                            city: this.city,
                            state: this.state,
                            zip: this.zip
                        },
                        address: {
                            addressLine1: this.address,
                            addressLine2: this.apt,
                            city: this.city,
                            county: "",
                            state: this.state,
                            zipCode: this.zip
                        },
                        selectedAddressInfo: { ...this.addressInfo }
                    };
                    const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                        detail: { addressData }
                    });
                    this.dispatchEvent(sendCheckServiceabilityEvent);
                    this.showLoaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    addressCallout(info) {
        const path = "serviceAbilities";
        let myData = {
            partnerName: "windstream",
            path,
            selectedBuyFlow: this.selectedBuyFlow,
            address: {
                addressLine1: info.Maps_Street__c,
                addressLine2:
                    info.Maps_Appartment__c !== null && info.Maps_Appartment__c !== undefined
                        ? info.Maps_Appartment__c
                        : "",
                city: info.Maps_City__c,
                state: this.state,
                country: info.Maps_Country__c,
                zipCode: info.Maps_PostalCode__c
            }
        };
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                console.log("Address Response", JSON.parse(response));
                let responseParsed = JSON.parse(response);
                let success = responseParsed?.serviceAvailability;
                let msg =
                    responseParsed.hasOwnProperty("error") && responseParsed.error.hasOwnProperty("provider")
                        ? responseParsed.error.provider.message
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
                            apt: this.apt !== undefined ? this.apt : "",
                            city: this.city,
                            state: this.state,
                            zip: this.zip
                        },
                        address: {
                            addressLine1: responseParsed.address.addressLine1,
                            addressLine2: responseParsed.address.addressLine2,
                            city: responseParsed.address.city,
                            county: responseParsed.address.county !== null ? responseParsed.address.county : "",
                            state: responseParsed.address.state,
                            zipCode: responseParsed.address.zipCode
                        },
                        selectedAddressInfo: {
                            addressStatus: responseParsed.selectedAddressInfo.addressStatus,
                            billingAcctNbr: responseParsed.selectedAddressInfo.billingAcctNbr,
                            mirorPackage: responseParsed.selectedAddressInfo.mirorPackage,
                            phoneNumber: responseParsed.selectedAddressInfo.phoneNumber,
                            serviceKey: responseParsed.selectedAddressInfo.serviceKey,
                            townCode:
                                responseParsed.selectedAddressInfo.townCode === null
                                    ? ""
                                    : responseParsed.selectedAddressInfo.townCode,
                            uqualAddressId: responseParsed.selectedAddressInfo.uqualAddressId
                        }
                    };
                    this.showLoaderSpinner = false;
                    const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                        detail: { addressData }
                    });
                    this.dispatchEvent(sendCheckServiceabilityEvent);
                } else if (responseParsed?.errorCode == 1004) {
                    let address = this.address + ", " + this.city + ", " + this.state + " " + this.zip + " USA";
                    let myData = {
                        address: address
                    };
                    console.log("get GeoCode data request", myData);
                    getGeoCodeData({ myData: myData })
                        .then((response) => {
                            console.log("get GeoCode Data response", response);
                            let addressData = {
                                addressType: "nearby",
                                addressInfo: {
                                    address: this.address,
                                    apt: this.apt !== undefined ? this.apt : "",
                                    city: this.city,
                                    state: this.state,
                                    zip: this.zip
                                },
                                address: {
                                    addressLine1: this.address,
                                    addressLine2: this.apt,
                                    city: this.city,
                                    state: this.state,
                                    zipCode: this.zip
                                },
                                additionalAddress: {
                                    address: {
                                        addressLine1: this.address,
                                        addressLine2: this.apt,
                                        city: this.city,
                                        state: this.state,
                                        zipCode: this.zip
                                    },
                                    geoLat: response.result.data.position.lat.toString(),
                                    geoLong: response.result.data.position.lng.toString()
                                }
                            };

                            this.showLoaderSpinner = false;
                            const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                                detail: { addressData }
                            });
                            this.dispatchEvent(sendCheckServiceabilityEvent);
                        })
                        .catch((error) => {
                            this.showLoaderSpinner = false;
                            console.error("ERROR", error);
                            this.logError(error.body?.message || error.message);
                        });
                } else if (responseParsed?.errorCode == 1020 || responseParsed?.error?.provider?.code == 1020) {
                    this.responseAddressData = {};
                    this.responseAddressData = {
                        addressInfo: {
                            address: this.address,
                            apt: this.apt !== undefined ? this.apt : "",
                            city: this.city,
                            state: this.state,
                            zip: this.zip
                        },
                        address: {
                            addressLine1: responseParsed.address.addressLine1,
                            addressLine2: responseParsed.address.addressLine2,
                            city: responseParsed.address.city,
                            county: responseParsed.address.county !== null ? responseParsed.address.county : "",
                            state: responseParsed.address.state,
                            zipCode: responseParsed.address.zipCode
                        },
                        selectedAddressInfo: {
                            addressStatus: responseParsed.selectedAddressInfo.addressStatus,
                            billingAcctNbr: responseParsed.selectedAddressInfo.billingAcctNbr,
                            mirorPackage: responseParsed.selectedAddressInfo.mirorPackage,
                            phoneNumber: responseParsed.selectedAddressInfo.phoneNumber,
                            serviceKey: responseParsed.selectedAddressInfo.serviceKey,
                            townCode:
                                responseParsed.selectedAddressInfo.townCode === null
                                    ? ""
                                    : responseParsed.selectedAddressInfo.townCode,
                            uqualAddressId: responseParsed.selectedAddressInfo.uqualAddressId
                        }
                    };
                    this.showLoaderSpinner = false;
                    this.showExistingAddressModal = true;
                } else if (
                    responseParsed.hasOwnProperty("suggestedAddresses") &&
                    responseParsed.suggestedAddresses.length > 0
                ) {
                    let suggestedAddresses = [];
                    responseParsed.suggestedAddresses.forEach((item) => {
                        if (
                            !suggestedAddresses.some(
                                (element) =>
                                    element.address.addressLine1 === item.address.addressLine1 &&
                                    element.address.addressLine2 === item.address.addressLine2 &&
                                    element.address.city === item.address.city &&
                                    element.address.state === item.address.state &&
                                    element.address.zipCode === item.address.zipCode
                            )
                        ) {
                            suggestedAddresses.push(item);
                        }
                    });
                    this.predictiveAddresses = [...suggestedAddresses];
                    this.showPredictiveAddress = true;
                    this.showLoaderSpinner = false;
                } else {
                    const errorMessage = msg + this.labels.Windstream_validation_information;
                    const event = new ShowToastEvent({
                        title: "Service not Available",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.showLoaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = this.labels.Chuzo_Generic_Error_Message;
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

    hideModal(event) {
        this.predictiveAddresses = [];
        this.showPredictiveAddress = false;
    }

    handleConfirmExistingAddress(event) {
        this.showExistingAddressModal = false;
        if (event.detail.newService) {
            let movingInFlag = event.detail.newService;
            let additionalAddress = {
                address: { ...event.detail.address },
                moveDate: event.detail.moveDate
            };
            let addressType = "move";
            let addressData = { ...this.responseAddressData, additionalAddress, movingInFlag, addressType };
            const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                detail: { addressData }
            });
            this.dispatchEvent(sendCheckServiceabilityEvent);
        } else {
            this.hardStop = true;
            this.disableValidation();
            const errorToast = new ShowToastEvent({
                title: "Contact Windstream",
                variant: "error",
                mode: "sticky",
                message: this.labels.Windstream_existing_address
            });
            this.dispatchEvent(errorToast);
        }
    }

    handleCloseExistingAddress() {
        this.showExistingAddressModal = false;
    }

    selectAddress(event) {
        let received = JSON.parse(JSON.stringify(event.detail));
        this.showPredictiveAddress = false;
        this.address = received.address.addressLine1;
        this.apt = received.address.addressLine2;
        this.state = received.address.state;
        this.zip = received.address.zipCode;
        this.city = received.address.city;
        this.addressInfo = { ...received.selectedAddressInfo };
        this.handleClick();
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Info",
            component: "poe_lwcBuyflowWindstreamInfoTab",
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