import { LightningElement, api } from "lwc";
import Frontier_Info_Predictive_Address_Modal_Title from "@salesforce/label/c.Frontier_Info_Predictive_Address_Modal_Title";
import Windstream_an_unique_address_was_not_correctly from "@salesforce/label/c.Windstream_an_unique_address_was_not_correctly";
import Close_Button_Label from "@salesforce/label/c.Close_Button_Label";
import Confirm_Button_Label from "@salesforce/label/c.Confirm_Button_Label";

export default class Poe_lwcBuyflowWindstreamPredictiveAddressModal extends LightningElement {
    @api addresses;
    noCompleteInformation = true;
    loaderSpinner;
    selectedAddress;
    options = [];

    labels = {
        Frontier_Info_Predictive_Address_Modal_Title,
        Windstream_an_unique_address_was_not_correctly,
        Close_Button_Label,
        Confirm_Button_Label
    };

    connectedCallback() {
        this.loaderSpinner = true;
        console.log(JSON.parse(JSON.stringify(this.addresses)));
        let addressOptions = JSON.parse(JSON.stringify(this.addresses));
        let optionsArray = [];
        addressOptions.forEach((option, index) => {
            let opt = {
                label: `${option.address.addressLine1} ${option.address.addressLine2}, ${option.address.city}, ${option.address.state}, ${option.address.zipCode}`,
                value: String(index)
            };
            optionsArray.push(opt);
        });
        this.options = [...optionsArray];
        this.loaderSpinner = false;
    }

    handleChange(event) {
        this.selectedAddress = event.target.value;
        if (this.selectedAddress !== undefined) {
            this.noCompleteInformation = false;
        } else {
            this.noCompleteInformation = true;
        }
    }

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: "cancel"
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleSelector() {
        let addressOptions = JSON.parse(JSON.stringify(this.addresses));
        let selected = addressOptions[Number(this.selectedAddress)];
        const closeModalEvent = new CustomEvent("confirm", {
            detail: { ...selected }
        });
        this.dispatchEvent(closeModalEvent);
    }
}