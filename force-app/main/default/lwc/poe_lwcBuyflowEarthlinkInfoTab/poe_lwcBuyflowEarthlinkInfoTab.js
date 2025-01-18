import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import getAddressInfo from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveACIPresentation from "@salesforce/apex/InfoTabController.saveACIPresentation";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import getEarthlinkPromoCodes from "@salesforce/apex/InfoTabController.getEarthlinkPromoCodes";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";

import SELF_SERVICE_VALIDATE_LEAVING_MESSAGE from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import SELF_SERVICE_VALIDATE_LEAVING_TITLE from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import ADDRESS_FIELD_LABEL from "@salesforce/label/c.Address_Field_Label";
import CITY_FIELD_LABEL from "@salesforce/label/c.City_Field_Label";
import COUNTRY_FIELD_LABEL from "@salesforce/label/c.Country_Field_Label";
import ZIP_FIELD_LABEL from "@salesforce/label/c.Zip_Field_Label";
import STATE_FIELD_LABEL from "@salesforce/label/c.State_Field_Label";
import STREET_ADDRESS_FIELD_LABEL from "@salesforce/label/c.Street_Address_Field_Label";
import ADDRESS_LINE_2_FIELD_LABEL from "@salesforce/label/c.Address_Line_2_Field_Label";
import GENERIC_ERROR_MESSAGE from "@salesforce/label/c.Chuzo_Generic_Error_Message";
import NO_ERROR_DESCRIPTION_MESSAGE from "@salesforce/label/c.No_Error_Description_Message";
import SERVER_ERROR_TOAST_TITLE from "@salesforce/label/c.Server_Error_Toast_Title";
import SUCCESS_TOAST_TITLE from "@salesforce/label/c.Success_Toast_Title";
import SERVICE_NOT_AVAILABLE_TOAST_TITLE from "@salesforce/label/c.Service_Not_Available_Toast_Title";
import DISPOSITION_OUTCOME_ERROR_MESSAGE from "@salesforce/label/c.Disposition_Outcome_Error_Message";
import INFO_TAB_NAME_LABEL from "@salesforce/label/c.Info_Tab_Name_Label";
import CHECK_SERVICEABILITY_BUTTON_LABEL from "@salesforce/label/c.Check_Serviceability_Button_Label";

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

const INTERNAL_ERRROR = "Internal Error";
const API_ERROR = "API Error";

export default class Poe_lwcBuyflowEarthlinkInfoTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api isGuestUser;
    noCompleteInfo = true;
    address;
    apt;
    city;
    state;
    stateName;
    stateOptions = [];
    zip;
    showLoaderSpinner;
    showCollateral;
    promoCodes = [];
    serviceAvailabilityResults = [];
    labels = {
        SELF_SERVICE_VALIDATE_LEAVING_TITLE,
        SELF_SERVICE_VALIDATE_LEAVING_MESSAGE,
        INFO_TAB_NAME_LABEL,
        STREET_ADDRESS_FIELD_LABEL,
        ADDRESS_LINE_2_FIELD_LABEL,
        CITY_FIELD_LABEL,
        STATE_FIELD_LABEL,
        ZIP_FIELD_LABEL,
        CHECK_SERVICEABILITY_BUTTON_LABEL
    };
    showSelfServiceCancelModal = false;
    addressOptions = {
        addressLabel: ADDRESS_FIELD_LABEL,
        cityLabel: CITY_FIELD_LABEL,
        cityPlaceHolder: undefined,
        countryDisabled: true,
        countryLabel: COUNTRY_FIELD_LABEL,
        countryPlaceholder: undefined,
        fieldLevelHelp: undefined,
        postalCodeLabel: ZIP_FIELD_LABEL,
        postalCodePlaceholder: undefined,
        provinceLabel: STATE_FIELD_LABEL,
        provincePlaceholder: undefined,
        required: true,
        showAddressLookup: true,
        streetLabel: STREET_ADDRESS_FIELD_LABEL,
        streetPlaceholder: undefined,
        addressLine2Label: ADDRESS_LINE_2_FIELD_LABEL,
        addressLine2Placeholder: undefined
    };

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
            Program: "EarthLink"
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
                this.disableValidation();

                let aci = {
                    ContextId: this.recordId
                };

                this.showAddressComponent = true;
                saveACIPresentation({ request: JSON.stringify(aci) })
                    .then((response) => {
                        this.getPromoCodes();
                    })
                    .catch((error) => {
                        console.error(error);

                        this.handleLogError({
                            error: error.body?.message || error.message,
                            type: INTERNAL_ERRROR
                        });

                        this.showLoaderSpinner = false;
                    });
            })
            .catch((error) => {
                this.showLoaderSpinner = false;

                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERRROR
                });

                console.log(error);
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
            Maps_State__c: this.stateName !== undefined ? this.stateName : null,
            Maps_Street__c: this.address !== undefined ? this.address : null,
            Name: name,
            StageName: "DM",
            Program: "EarthLink",
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
                this.checkServiceability(info);
            })
            .catch((error) => {
                console.error(error, "ERROR");

                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERRROR
                });

                this.showLoaderSpinner = false;
            });
    }

    addressCallout(info, promoCode) {
        let myData = {
            partnerName: "earthlink",
            path: "serviceAbilities",
            address: {
                addressLine1: info.Maps_Street__c,
                addressLine2: this.apt !== undefined ? this.apt : "",
                city: info.Maps_City__c,
                state: this.state,
                country: info.Maps_Country__c,
                zipCode: info.Maps_PostalCode__c
            },
            promoCode: promoCode.value
        };
        console.log("Address Request", myData);
        let apiResponse;
        return callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let responseParsed = JSON.parse(response);
                console.log("Address Response", responseParsed);
                let success = responseParsed.serviceAvailability;
                let msg = responseParsed.hasOwnProperty("message")
                    ? responseParsed.message
                    : responseParsed.hasOwnProperty("error")
                    ? responseParsed.error.hasOwnProperty("provider")
                        ? responseParsed.error.provider.message.hasOwnProperty("message")
                            ? responseParsed.error.provider.message.message
                            : responseParsed.error.provider.message
                        : responseParsed.error
                    : NO_ERROR_DESCRIPTION_MESSAGE;

                if (success) {
                    this.serviceAvailabilityResults.push({
                        message: msg,
                        success: true,
                        promoCode
                    });
                } else {
                    this.serviceAvailabilityResults.push({
                        message: msg,
                        success: false
                    });

                    this.handleLogError({
                        error: `${msg}\nAPI Response: ${apiResponse}`,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = GENERIC_ERROR_MESSAGE;
                const event = new ShowToastEvent({
                    title: SERVER_ERROR_TOAST_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.handleLogError({
                        error: `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.handleLogError({
                        error: errMsg,
                        type: INTERNAL_ERRROR
                    });
                }
            });
    }

    handleChildLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "Info"
        };
        this.dispatchEvent(event);
    }

    handleLogError(data) {
        let errorLog = {
            type: data.type,
            provider: "Earthlink",
            tab: "Info",
            component: "poe_lwcBuyflowEarthlinkInfoTab",
            error: data.error,
            endpoint: data.endpoint,
            request: JSON.stringify(data.request),
            opportunity: data.opportunity
        };

        let event = new CustomEvent("logerror", {
            detail: errorLog
        });
        this.dispatchEvent(event);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    checkServiceability(info) {
        Promise.all(this.promoCodes.map((code) => this.addressCallout(info, code)))
            .then(() => {
                const successMessages = this.serviceAvailabilityResults.filter((msg) => msg.success);

                if (successMessages.length > 0) {
                    const event = new ShowToastEvent({
                        title: SUCCESS_TOAST_TITLE,
                        variant: "success",
                        message: successMessages[0].message
                    });
                    this.dispatchEvent(event);

                    const addressInfo = {
                        address: this.address,
                        apt: this.apt,
                        city: this.city,
                        state: this.state,
                        zip: this.zip
                    };

                    const successMessagesByPromoCode = {};
                    successMessages.forEach((message) => {
                        successMessagesByPromoCode[message.promoCode.value] = message;
                    });

                    let successfulPromoCodes = [];
                    this.promoCodes.forEach((code) => {
                        if (successMessagesByPromoCode.hasOwnProperty(code.value)) {
                            let promoValue = { ...successMessagesByPromoCode[code.value].promoCode };
                            successfulPromoCodes.push(promoValue);
                        }
                    });

                    const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                        detail: {
                            addressInfo,
                            promoCodes: successfulPromoCodes
                        }
                    });
                    this.dispatchEvent(sendCheckServiceabilityEvent);
                } else {
                    const event = new ShowToastEvent({
                        title: SERVICE_NOT_AVAILABLE_TOAST_TITLE,
                        variant: "error",
                        mode: "sticky",
                        message: `${
                            this.serviceAvailabilityResults[0].hasOwnProperty("message")
                                ? this.serviceAvailabilityResults[0].message
                                : this.serviceAvailabilityResults[0]
                        }. ${DISPOSITION_OUTCOME_ERROR_MESSAGE}`
                    });

                    this.dispatchEvent(event);
                }
            })
            .catch((error) => {
                console.error(error);

                const errMsg = error.body?.message || error.message;
                this.handleLogError({
                    error: errMsg,
                    type: INTERNAL_ERRROR
                });
            })
            .finally(() => {
                this.showLoaderSpinner = false;
            });
    }

    getPromoCodes() {
        this.showLoaderSpinner = true;

        getEarthlinkPromoCodes()
            .then((response) => {
                this.promoCodes = response.result.promoCodes;
            })
            .catch((error) => {
                console.error(error);

                const errMsg = error.body?.message || error.message;
                this.handleLogError({
                    error: errMsg,
                    type: INTERNAL_ERRROR
                });
            })
            .finally(() => {
                this.showLoaderSpinner = false;
            });
    }
}