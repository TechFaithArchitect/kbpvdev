import { LightningElement } from "lwc";

export default class Poe_lwcBuyflowDirecTvTermsModalStreamNationalMock extends LightningElement {
    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: "cancel"
        });
        this.dispatchEvent(closeModalEvent);
    }
}