import { LightningElement, api } from "lwc";

export default class Poe_lwcBuyflowDirecTVInfoPopup extends LightningElement {
    @api description;

    hideModal() {
        const sendBackEvent = new CustomEvent("close");
        this.dispatchEvent(sendBackEvent);
    }
}