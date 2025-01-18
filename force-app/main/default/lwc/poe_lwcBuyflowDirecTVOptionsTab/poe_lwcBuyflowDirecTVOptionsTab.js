import { LightningElement, api } from "lwc";
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

export default class Poe_lwcBuyflowDirecTVOptionsMock extends NavigationMixin(LightningElement) {
    @api logo;
    @api disclaimers;
    address;
    @api cartInfo;
    @api orderInfo;
    @api email;
    @api callInformation;
    @api recordId;
    @api origin;
    @api stream;
    @api emailVerified;
    @api returnUrl;
    pin;
    pinValidated = false;
    sameBilling;
    sameShipping;
    billingComplete;
    shippingComplete;
    shippingAddress;
    shippingApt;
    shippingZip;
    shippingCity;
    shippingState;
    billingAddress;
    billingApt;
    billingZip;
    billingCity;
    billingState;
    shipConfirm;
    showBilling = false;
    states = [];
    showShipping = false;
    noCompleteInfo = true;
    addressOptions = [
        {
            label: "Yes",
            value: "true"
        },
        { label: "No", value: "false" }
    ];
    loaderSpinner;
    showCollateral;

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleRadio(event) {
        if (event.target.name === "shipping") {
            this.sameShipping = event.target.value;
        } else {
            this.sameBilling = event.target.value;
        }
        this.showBilling = this.sameBilling === "false" ? true : false;
        this.showShipping = this.sameShipping === "false" ? true : false;
        this.disableValidations();
    }

    connectedCallback() {
        this._actionUtil = new OmniscriptActionCommonUtil();
        this.email = this.callInformation.customer.emailAddress;
        this.pinValidated = this.emailVerified;
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.states.push(option);
        });
        this.address = `${this.callInformation.address.addressLine1}, ${this.callInformation.address.city}, ${this.callInformation.address.state} ${this.callInformation.address.zipCode}`;
    }

    handleChange(event) {
        switch (event.target.name) {
            case "shippingAddress":
                this.shippingAddress = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "shippingApt":
                this.shippingApt = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "shippingState":
                this.shippingState = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "shippingZip":
                this.shippingZip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "shippingCity":
                this.shippingCity = event.target.value !== "" ? event.target.value : undefined;
                break;
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
            case "billingCity":
                this.billingCity = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "shipConfirm":
                this.shipConfirm = event.target.checked;
                break;
        }
        this.shippingComplete =
            this.shippingCity !== undefined &&
            this.shippingAddress !== undefined &&
            this.shippingState !== undefined &&
            this.shippingZip !== undefined &&
            this.shipConfirm
                ? true
                : false;
        this.billingComplete =
            this.billingCity !== undefined &&
            this.billingAddress !== undefined &&
            this.billingState !== undefined &&
            this.billingZip !== undefined
                ? true
                : false;
        this.disableValidations();
    }

    disableValidations() {
        if (
            this.pinValidated &&
            (this.sameBilling === "true" || (this.sameBilling == "false" && this.billingComplete)) &&
            (this.sameShipping === "true" || (this.sameShipping == "false" && this.shippingComplete))
        ) {
            this.noCompleteInfo = false;
        } else {
            this.noCompleteInfo = true;
        }
    }

    handleClick() {
        let billingAddress;
        let shippingAddress;
        if (this.sameBilling === "true") {
            billingAddress = {
                addressLine1: this.orderInfo.address.addressLine1,
                addressLine2: this.orderInfo.address.addressLine2,
                city: this.orderInfo.address.city,
                state: this.orderInfo.address.state,
                zipCode: this.orderInfo.address.zipCode,
                country: "USA"
            };
        } else {
            billingAddress = {
                addressLine1: this.billingAddress,
                addressLine2: this.billingApt,
                city: this.billingCity,
                state: this.billingState,
                zipCode: this.billingZip,
                country: "USA"
            };
        }
        if (this.sameShipping === "true") {
            shippingAddress = {
                addressLine1: this.orderInfo.address.addressLine1,
                addressLine2: this.orderInfo.address.addressLine2,
                city: this.orderInfo.address.city,
                state: this.orderInfo.address.state,
                zipCode: this.orderInfo.address.zipCode,
                country: "USA"
            };
        } else {
            shippingAddress = {
                addressLine1: this.shippingAddress,
                addressLine2: this.shippingApt,
                city: this.shippingCity,
                state: this.shippingState,
                zipCode: this.shippingZip,
                country: "USA"
            };
        }
        let info = {
            billingAddress: billingAddress,
            shippingAddress: shippingAddress,
            pin: this.pin
        };
        const sendCartNextEvent = new CustomEvent("optionsnext", {
            detail: info
        });
        this.dispatchEvent(sendCartNextEvent);
    }

    handleCancel() {
        if(this.returnUrl != undefined) {
            window.open(this.returnUrl, '_self');
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

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handlePinValidation(event) {
        this.pinValidated = event.detail.pinValidated;
        this.pin = event.detail.hasOwnProperty("pin") ? event.detail.pin : undefined;
        this.disableValidations();
    }
}