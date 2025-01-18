import { LightningElement, api } from "lwc";
import ToastContainer from "lightning/toastContainer";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

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

export default class Poe_lwcAddressField extends LightningElement {
    // Default values
    @api
    get street() {
        return this.currentStreet;
    }
    set street(value) {
        this.currentStreet = value;
    }
    @api
    get addressLine2() {
        return this.currentAddressLine2;
    }
    set addressLine2(value) {
        this.currentAddressLine2 = value;
    }
    @api
    get city() {
        return this.currentCity;
    }
    set city(value) {
        this.currentCity = value;
    }
    @api
    get province() {
        return this.currentProvince;
    }
    set province(value) {
        this.currentProvince = value;
    }
    @api
    get postalCode() {
        return this.currentPostalCode;
    }
    set postalCode(value) {
        this.currentPostalCode = value;
    }
    @api
    get country() {
        return this.currentCountry;
    }
    set country(value) {
        this.currentCountry = value;
    }
    @api disabled;
    @api alwaysSendChanges = false;

    currentStreet = "";
    currentAddressLine2 = "";
    currentCity = "";
    currentProvince = "";
    currentPostalCode = "";
    currentCountry = "";
    completeAddressValue = {};
    timeoutId;

    connectedCallback() {
        console.log("ADDRESS LINE 2", this.addressLine2);
        this.currentStreet = this.street || "";
        this.currentAddressLine2 = this.addressLine2 || "";
        this.currentCity = this.city || "";
        this.currentProvince = this.province || "";
        this.currentPostalCode = this.postalCode || "";
        this.currentCountry = this.country || "";
        const toastContainer = ToastContainer.instance();
        toastContainer.maxShown = 5;
        toastContainer.toastPosition = "top-center";
    }

    handleInputValidations() {
        if (
            this.currentCountry !== undefined &&
            this.currentCountry !== "" &&
            this.currentCountry !== "United States" &&
            this.currentCountry !== "USA" &&
            this.currentCountry !== "US"
        ) {
            const event = new ShowToastEvent({
                title: "Invalid Address",
                variant: "error",
                message: "Please ensure the address provided is a valid United States address."
            });
            this.dispatchEvent(event);
        } else if (
            this.currentProvince !== undefined &&
            this.currentProvince !== "" &&
            !stateNames.some((item) => item.name === this.currentProvince || item.abbrev === this.currentProvince)
        ) {
            const event = new ShowToastEvent({
                title: "Invalid Address",
                variant: "error",
                message: "Invalid State value entered. Please verify the spelling and try again."
            });
            this.dispatchEvent(event);
        } else if (!this.alwaysSendChanges) {
            this.sendChangeEvent();
        }
    }

    handleAddressChange(event) {
        this.currentStreet = event.detail.street;
        this.currentCity = event.detail.city;
        this.currentProvince = event.detail.province;
        this.currentPostalCode = event.detail.postalCode;
        this.currentCountry = event.detail.country;
        this.currentAddressLine2 = event.detail.subpremise;

        this.completeAddressValue = {
            ...this.completeAddressValue,
            street: this.currentStreet,
            addressLine2: this.currentAddressLine2,
            city: this.currentCity,
            province: this.currentProvince,
            postalCode: this.currentPostalCode,
            country: this.currentCountry
        };

        if (this.alwaysSendChanges) {
            this.sendChangeEvent();
        }

        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => this.handleInputValidations(), 500);
    }

    sendChangeEvent() {
        this.dispatchEvent(
            new CustomEvent("addresschange", {
                detail: this.completeAddressValue
            })
        );
    }

    logError(errorMessage) {
        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: {
                    type: "Internal Error",
                    component: "poe_lwcAddressField",
                    error: errorMessage
                }
            })
        );
    }
}