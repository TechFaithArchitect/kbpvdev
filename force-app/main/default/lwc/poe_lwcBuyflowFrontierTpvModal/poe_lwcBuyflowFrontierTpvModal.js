import { LightningElement, api } from "lwc";

export default class Poe_lwcBuyflowFrontierTpvModal extends LightningElement {
    @api number;
    @api description;

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleNext() {
        const closeModalEvent = new CustomEvent("next", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }
}