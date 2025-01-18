import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

export default class modal_SendingOrderEarthLink extends LightningModal {
	@api content;

	get iconInfoVerifyOrder() {
		return chuzoSiteResources + '/images/icon-send-order-earthlink.svg';
	}

	connectedCallback(){
		let this_fn = this;
		setTimeout(() => {
			this_fn.close('okay');
		}, 5000);
	}

}