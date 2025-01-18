import { LightningElement, api } from "lwc";

export default class Poe_lwcBuyflowSpectrumAddressMovingModal extends LightningElement {
    @api calloutMessage;
    @api spectrumNumber;
    options = [
        { label: "The customer is moving to this address", value: "moving" },
        { label: "The customer wants to upgrade services", value: "upgrade" }
    ];
    value;
    newCustomerError;
    orderBlocked = true;

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {});
        this.dispatchEvent(closeModalEvent);
    }

    handleOptions(e) {
        this.value = e.target.value;
        if (this.value === "upgrade") {
            this.orderBlocked = true;
            this.newCustomerError = true;
        } else {
            this.orderBlocked = false;
            this.newCustomerError = false;
        }
    }

    handleClick() {
        const closeModalEvent = new CustomEvent("confirm", {});
        this.dispatchEvent(closeModalEvent);
    }
}