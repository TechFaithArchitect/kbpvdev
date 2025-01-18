import { LightningElement } from "lwc";

export default class Poe_lwcLeadsWarningModal extends LightningElement {
    hideModal() {
        const showCollateralEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(showCollateralEvent);
    }
}