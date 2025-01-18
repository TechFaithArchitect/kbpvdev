import { LightningElement, api } from "lwc";

const OFFER_TYPE = "Offers";

export default class Poe_lwcBuyflowDirecTvDisclaimerPopup extends LightningElement {
    @api description;
    @api promos;
    @api typeOffer;
    @api promoId;
    disclosureAgreementLabel = "I have read the above disclosures to the customer, and the customer agreed";
    isDisclaimerAgreed = false;
    amountChecked = 0;
    showError = false;

    hideModal() {
        if (this.typeOffer === OFFER_TYPE) {
            this.hideOffersModal();
            return;
        }
        const sendBackEvent = new CustomEvent("close", {
            detail: {
                isAgree: this.isDisclaimerAgreed,
                promoId: this.promoId
            }
        });
        this.dispatchEvent(sendBackEvent);
    }
    handleAgree(event) {
        if (event.target.checked) {
            this.isDisclaimerAgreed = true;
            this.amountChecked++;
        } else {
            this.isDisclaimerAgreed = false;
            this.amountChecked--;
        }
    }

    hideOffersModal() {
        this.showError = false;
        const inputElements = this.template.querySelectorAll("lightning-input");
        if (this.amountChecked != inputElements.length) {
            this.showError = true;
            return;
        }
        const sendBackEvent = new CustomEvent("close", {
            detail: {
                isAgree: true
            }
        });
        this.dispatchEvent(sendBackEvent);
    }
}