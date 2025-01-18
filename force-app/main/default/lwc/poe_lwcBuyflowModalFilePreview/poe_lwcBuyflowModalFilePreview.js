import { LightningElement, api } from 'lwc';

export default class Poe_lwcBuyflowModalFilePreview extends LightningElement {
    @api url;
    @api title;

    hideModal() {
        const showCollateralEvent = new CustomEvent("hidemodal", {
            detail: 'hide'
        });
        this.dispatchEvent(showCollateralEvent);
    }
}