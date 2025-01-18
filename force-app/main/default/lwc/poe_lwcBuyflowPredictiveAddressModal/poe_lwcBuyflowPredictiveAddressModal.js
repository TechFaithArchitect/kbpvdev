import { api } from 'lwc';
import LightningModal from "lightning/modal";

export default class Poe_lwcBuyflowPredictiveAddressModal extends LightningModal {
    @api addresses;
    @api provider;
    noCompleteInformation = true;
    loaderSpinner;
    selectedAddress;
    options = [];

    get confirmBtnClass() {
        return `${this.noCompleteInformation && 'btn-disabled'} btn-provider-color btn-only-rounded`;
    }

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
        this.close({
            cancel: true
        });
    }

    handleSelector() {
        const addressOptions = JSON.parse(JSON.stringify(this.addresses));
        const selected = addressOptions[Number(this.selectedAddress)];
        
        this.close({
            cancel: false,
            detail: { ...selected }
        });
    }
}