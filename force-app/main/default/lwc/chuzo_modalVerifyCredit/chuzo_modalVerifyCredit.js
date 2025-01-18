import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

export default class modal_VerifyCredit extends LightningModal {
	@api content;

	get iconInfoVerifyCredit() {
		return chuzoSiteResources + '/images/icon-verify.svg';
	}

	connectedCallback(){
		let this_fn = this;
		setTimeout(() => {
			this_fn.close('okay');
		}, 5000);
	}

}