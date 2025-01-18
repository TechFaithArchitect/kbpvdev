import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from 'lightning/platformResourceLoader';

export default class modal_AutoPayTerm extends LightningModal {
	@api paperlessVerbiage;
	@api autoPayVerbiage;

	paperlessBillingAgreement = false;
	autopayAuthorization = false;

	get hasAgreedToTerms() {
		return this.paperlessBillingAgreement && this.autopayAuthorization;
	}

	get iconInfoTerm() {
		return chuzoSiteResources + '/images/icon-term.svg';
	}

	get acceptTermsClass() {
		return `${!this.hasAgreedToTerms ? 'btn-disabled' : ''} btn-provider-color btn-only-rounded`;
	}

	handleChange(e) {
		this[e.currentTarget.dataset.fieldName] = e.detail.checked;
	}

	handleCancel() {
		this.close({
			agreed: false
		})
	}

	acceptTerms(){
		if (!this.hasAgreedToTerms) {
			return;
		}

		this.close({
			agreed: true
		});
	}

	connectedCallback(){
		loadStyle(this, chuzoSiteResources + '/css/common.css');
	}
}