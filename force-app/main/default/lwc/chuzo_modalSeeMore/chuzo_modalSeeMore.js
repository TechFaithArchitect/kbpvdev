import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

export default class modal_SeeMore extends LightningModal {
	@api content;

	get iconInfoUser() {
		return chuzoSiteResources + '/images/icon-info-user.svg';
	}

	agreeDisclosure(){
		this.close('okay');
	}

	handleCancel() {
		this.close();
	}

}