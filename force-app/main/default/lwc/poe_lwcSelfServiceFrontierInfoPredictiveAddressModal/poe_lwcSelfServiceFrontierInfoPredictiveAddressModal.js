import { api } from "lwc";
import LightningModal from "lightning/modal";
import CANCEL_BUTTON_LABEL from "@salesforce/label/c.Cancel_Button_Label";
import CONFIRM_BUTTON_LABEL from "@salesforce/label/c.Confirm_Button_Label";
import INFO_PREDICTIVE_ADDRESS_MODAL_TITLE from "@salesforce/label/c.Frontier_Info_Predictive_Address_Modal_Title";
import INFO_PREDICTIVE_ADDRESS_MODAL_SUBTITLE from "@salesforce/label/c.Frontier_Info_Predictive_Address_Modal_Subtitle";

export default class Poe_lwcSelfServiceFrontierInfoPredictiveAddressModal extends LightningModal {
    @api addresses;
    loaderSpinner;
    selectedAddress;
    options = [];

    labels = {
        CANCEL_BUTTON_LABEL,
        CONFIRM_BUTTON_LABEL,
        INFO_PREDICTIVE_ADDRESS_MODAL_TITLE,
        INFO_PREDICTIVE_ADDRESS_MODAL_SUBTITLE
    };

    get confirmBtnClass() {
        return `${this.selectedAddress ? "" : "btn-disabled"} btn-provider-color btn-only-rounded`;
    }

    connectedCallback() {
        this.loaderSpinner = true;
        let addressOptions = JSON.parse(JSON.stringify(this.addresses));
        let optionsArray = [];
        addressOptions.forEach((option, index) => {
            let opt = {
                label: `${option.AddressLine1}${
                    option.hasOwnProperty("AddressLine2") &&
                    option.AddressLine2 !== undefined &&
                    option.AddressLine2 !== null &&
                    option.AddressLine2 !== ""
                        ? ` ${option.AddressLine2}`
                        : ""
                }, ${option.City}, ${option.StateProvince}, ${option.ZipCode}`,
                value: String(index)
            };
            optionsArray.push(opt);
        });
        this.options = [...optionsArray];
        this.loaderSpinner = false;
    }

    handleChange(event) {
        this.selectedAddress = event.target.value;
    }

    hideModal() {
        this.close();
    }

    handleSelector() {
        let addressOptions = JSON.parse(JSON.stringify(this.addresses));
        let i = Number(this.selectedAddress);
        let selected = addressOptions[i];
        this.close({
            detail: selected
        });
    }
}