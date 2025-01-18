import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

export default class modal_OneTimeNonRefoundable extends LightningModal {
    @api fee = "";
    
	get iconInfoPayment() {
		return chuzoSiteResources + '/images/icon-payment-blue.svg';
	}

    hideFeeModal(customerAgrees = false) {
        this.close({
            customerAgrees
        });
    }

    handleModifyOrder() {
        this.hideFeeModal(false);
    }

    handleContinue() {
        this.hideFeeModal(true);
    }}