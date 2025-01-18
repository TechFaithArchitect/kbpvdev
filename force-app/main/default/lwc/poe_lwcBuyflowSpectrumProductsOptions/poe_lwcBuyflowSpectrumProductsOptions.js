import { LightningElement, api } from "lwc";
import EMAIL_VERBIAGE from "@salesforce/label/c.SpectrumEmailBroadbandLabel";

export default class Poe_lwcBuyflowSpectrumProductsOptions extends LightningElement {
    @api products;
    @api productType;
    @api isGuestUser;
    emailLabel = EMAIL_VERBIAGE;

    @api
    showBroadbandLabel() {
        if (!this.isGuestUser) return;

        this.template.querySelectorAll('c-poe_lwc-broadband-label')
        .forEach(broadBandLabelEl => {
            broadBandLabelEl.open();
        });
    }

    handlePriceChange(event) {
        const sendProductsEvent = new CustomEvent("product", {
            detail: event.target.value
        });
        this.dispatchEvent(sendProductsEvent);
    }

    handleDescription(event) {
        const sendProductsEvent = new CustomEvent("description", {
            detail: event.target.dataset.id
        });
        this.dispatchEvent(sendProductsEvent);
    }
}