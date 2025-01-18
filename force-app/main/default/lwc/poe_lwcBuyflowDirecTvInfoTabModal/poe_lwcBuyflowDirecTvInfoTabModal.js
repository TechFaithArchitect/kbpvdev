import { LightningElement, api } from "lwc";

export default class Poe_lwcBuyflowDirecTvInfoTabModal extends LightningElement {
    @api suggestedAddresses;
    value;
    options = [];
    noInfo = true;
    loaderSpinner;

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleChangeAddress(event) {
        this.noInfo = false;
        this.value = event.target.value;
    }

    connectedCallback() {
        let addresses = [];
        this.suggestedAddresses.forEach((item, index) => {
            let add = {
                label: `${item.addressLine1} ${item.addressLine2}, ${item.city}, ${item.state} ${
                    item.hasOwnProperty("zipCode") ? item.zipCode : item.zip
                }`,
                value: String(index)
            };
            addresses.push(add);
        });
        this.options = [...addresses];
    }

    handleConfirm() {
        this.loaderSpinner = true;
        let info = this.suggestedAddresses[Number(this.value)];
        const closeModalEvent = new CustomEvent("confirm", {
            detail: info
        });
        this.dispatchEvent(closeModalEvent);
        this.loaderSpinner = false;
    }
}