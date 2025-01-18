import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

export default class modal_ChangeAddress extends LightningModal {
	@api content;

	get iconInfoUser() {
		return chuzoSiteResources + '/images/icon-info-user.svg';
	}

	changeAddress(){
		this.close('okay');
	}

}