import { LightningElement, api } from "lwc";

export default class Poe_lwcBuyflowFrontierNoDepositModal extends LightningElement {
    @api title;
    @api description;
    @api isFee;
    @api creditFee;

    handleClick() {
        if (!this.isFee) {
            const closeModalEvent = new CustomEvent("close", {
                detail: ""
            });
            this.dispatchEvent(closeModalEvent);
        } else {
            const closeModalEvent = new CustomEvent("proceed", {
                detail: ""
            });
            this.dispatchEvent(closeModalEvent);
        }
    }

    handleChangeCredit() {
        const closeModalEvent = new CustomEvent("changecredit", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }
}