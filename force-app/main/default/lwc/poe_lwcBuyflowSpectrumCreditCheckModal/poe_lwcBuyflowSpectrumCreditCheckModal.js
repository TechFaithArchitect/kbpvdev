import { LightningElement, api } from "lwc";

export default class Poe_lwcBuyflowSpectrumCreditCheckModal extends LightningElement {
    @api modalBody;
    @api modalTitle;
    @api isRichText = false;
    @api showCancel = false;

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleConfirm() {
        const confirmModalEvent = new CustomEvent("confirm", {
            detail: ""
        });
        this.dispatchEvent(confirmModalEvent);
    }
}