import { LightningElement, api, track } from "lwc";
import ToastContainer from "lightning/toastContainer";
import Windstream_an_Existing_account from "@salesforce/label/c.Windstream_an_Existing_account";
import Windstream_gather_additional_detail from  "@salesforce/label/c.Windstream_gather_additional_detail";
import Windstream_Address_Photo_Id from "@salesforce/label/c.Windstream_Address_Photo_Id";
import WINDSTREAM_ERROR_MESSAGE_1 from "@salesforce/label/c.Windstream_Info_Tab_Address_Has_Active_Service_Error_Message_1";
import WINDSTREAM_ERROR_MESSAGE_2 from "@salesforce/label/c.Windstream_Info_Tab_Address_Has_Active_Service_Error_Message_2";
import WINDSTREAM_ERROR_MESSAGE_3 from "@salesforce/label/c.Windstream_Info_Tab_Address_Has_Active_Service_Error_Message_3";

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

export default class Poe_lwcBuyflowWindstreamExistingAddressModal extends LightningElement {
    @api isGuestUser;
    @track errorDisclaimer = true;
    @track firstStep = true;
    @track checkboxChecked = false;

    movingInValue = "";
    noCompleteInfo = false;
    address;
    apt;
    city;
    state;
    stateOptions = [];
    moveInDate;
    formattedDate;
    tomorrow;
    sixtyDaysFromToday;
    zip;
    availableDates = [];
    addressOptions = {
        addressLabel: "Address",
        cityLabel: "City",
        cityPlaceHolder: undefined,
        countryDisabled: true,
        countryLabel: "Country",
        countryPlaceholder: undefined,
        fieldLevelHelp: undefined,
        postalCodeLabel: "Zip Code",
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

    labels = {
        Windstream_an_Existing_account,
        Windstream_gather_additional_detail,
        Windstream_Address_Photo_Id,
        errorMessage1 : WINDSTREAM_ERROR_MESSAGE_1,
        errorMessage2 : WINDSTREAM_ERROR_MESSAGE_2,
        errorMessage3: WINDSTREAM_ERROR_MESSAGE_3
    };

    get options() {
        return [
            { label: "Yes, I currently have a Windstream account at this location", value: "yes" },
            { label: "No, my location does not have a Windstream account", value: "no" }
        ];
    }

    get showAddressFields() {
        return this.movingInValue === "no";
    }

    connectedCallback() {
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

        this.handleAvailableDates();
    }

    handleAvailableDates() {
        const now = new Date();
        for (let i = 0; i < 60; i++) {
            now.setDate(now.getDate() + 1);
            let newDate =
                now.getFullYear() +
                "-" +
                ("0" + (now.getMonth() + 1)).slice(-2) +
                "-" +
                ("0" + now.getDate()).slice(-2);

            this.availableDates.push(newDate);
        }
    }

    handleChange(event) {
        switch (event.target.name) {
            case "address":
            case "apt":
            case "city":
            case "state":
            case "zip":
                this[event.target.name] = event.target.value ? event.target.value : undefined;
                break;
            case "movingInRadio":
                this.movingInValue = event.target.value;
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

    handleMoveInDateChange(event) {
        const selectedDateArr = event.detail.dateValue.split("-");
        const selectedDate = new Date(selectedDateArr[0], selectedDateArr[1] - 1, selectedDateArr[2]);
        const today = new Date();
        const sixtyDaysFromToday = new Date(today);
        sixtyDaysFromToday.setDate(today.getDate() + 60);

        // if (selectedDateArr.length !== 3 || selectedDate <= today || selectedDate > sixtyDaysFromToday) {
        //     const event = new ShowToastEvent({
        //         title: "Error",
        //         variant: "error",
        //         message: "Please select a valid date between tomorrow and sixty days from today."
        //     });
        //     this.dispatchEvent(event);
        //     this.moveInDate = undefined;
        // }

        const formattedDate = `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}/${selectedDate.getFullYear()}`;
        this.moveInDate = event.detail.dateValue;
        this.formattedDate = formattedDate;
        this.disableValidation();
    }

    handleCheckboxChange(event) {
        this.checkboxChecked = event.detail.checked;
        this.disableValidation();
    }

    handleNext() {
        if(this.firstStep){
            this.firstStep = false;
        }else{
            this.errorDisclaimer = false;
        }
        this.disableValidation();
    }

    handleConfirm() {
        let payload = {
            newService: this.showAddressFields,
            address: {
                addressLine1: this.address,
                addressLine2: this.apt ? this.apt : "",
                city: this.city,
                state: this.state,
                zipCode: this.zip
            },
            moveDate: this.formattedDate
        };
        const sendCheckServiceabilityEvent = new CustomEvent("confirm", {
            detail: payload
        });
        this.dispatchEvent(sendCheckServiceabilityEvent);
    }

    hideModal() {
        const closeEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(closeEvent);
    }

    disableValidation() {
        if(this.errorDisclaimer){
            this.noCompleteInfo = !this.firstStep && !this.checkboxChecked;
        }else{
            this.noCompleteInfo =
            !(this.address && this.city && this.state && this.zip && this.moveInDate) && this.showAddressFields;
        }
    }
}