import { LightningElement, api } from 'lwc';

export default class Poe_lwcBuyflowDirecTvEngaCreditCheckFeeModal extends LightningElement {
    @api fee = "";
    feeAgreement;
    noFeeAgreement = true;

    hideFeeModal(customerAgrees = false) {
        const modalEvent = new CustomEvent("closefeemodal", {
            detail: {
                customerAgrees
            }
        });
        this.dispatchEvent(modalEvent);
    }

    handleFeeAgreement(event) {
        this.feeAgreement = event.target.checked;
        this.noFeeAgreement = !this.feeAgreement;
    }

    removeProduct() {
        const sendBackEvent = new CustomEvent("modifyorder", {});
        this.dispatchEvent(sendBackEvent);
    }

    closeFeeDebt() {
        this.hideFeeModal(true);
    }
    
}