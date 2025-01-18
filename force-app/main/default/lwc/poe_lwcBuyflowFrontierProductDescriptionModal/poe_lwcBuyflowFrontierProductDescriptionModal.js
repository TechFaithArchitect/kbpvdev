import { LightningElement, api } from "lwc";

export default class Poe_lwcBuyflowFrontierProductDescriptionModal extends LightningElement {
    @api description;

    hideModal() {
        const closeModalEvent = new CustomEvent("closedescription", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }
}