import { LightningElement, api } from "lwc";

export default class Poe_lwcBuyflowWindstreamProductDescriptionModal extends LightningElement {
    @api disclaimer;

    get cancelOrderText() {
        return this.disclaimer?.cancelText ? this.disclaimer.cancelText : 'Cancel Order';
    }

    get agreeText() {
        return this.disclaimer?.agreeText ? this.disclaimer.agreeText : 'I agree';
    }

    closeModal() {
        const closeModalEvent = new CustomEvent("agree", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    cancelOrder() {
        const cancelOrderEvent = new CustomEvent("cancelorder", {
            detail: ""
        });
        this.dispatchEvent(cancelOrderEvent);
    }
}