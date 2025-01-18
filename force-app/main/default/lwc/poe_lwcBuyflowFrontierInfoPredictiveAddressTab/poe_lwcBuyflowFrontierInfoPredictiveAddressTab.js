import { LightningElement, api } from "lwc";
export default class Poe_lwcBuyflowFrontierInfoPredictiveAddressTab extends LightningElement {
    @api addresses;
    noCompleteInformation = true;
    loaderSpinner;
    selectedAddress;
    options = [];

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
        let i = Number(this.selectedAddress);
        let selected = addressOptions[i];
        const closeModalEvent = new CustomEvent("confirm", {
            detail: selected
        });
        this.dispatchEvent(closeModalEvent);
    }
}