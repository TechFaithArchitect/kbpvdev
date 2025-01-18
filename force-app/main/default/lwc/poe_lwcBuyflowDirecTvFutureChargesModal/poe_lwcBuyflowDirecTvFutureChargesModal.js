import { LightningElement, api } from "lwc";

export default class Poe_lwcBuyflowDirecTvFutureChargesModal extends LightningElement {
    @api futureCharges;

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: "cancel"
        });
        this.dispatchEvent(closeModalEvent);
    }

    toggleSection(event) {
        let buttonid = event.currentTarget.dataset.buttonid;
        let currentsection = this.template.querySelector('[data-id="' + buttonid + '"]');
        if (currentsection.className.search("slds-is-open") == -1) {
            currentsection.className = "slds-section slds-is-open";
        } else {
            currentsection.className = "slds-section slds-is-close";
        }
    }
}