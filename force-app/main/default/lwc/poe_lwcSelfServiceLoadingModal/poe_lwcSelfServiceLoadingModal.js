import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class Poe_lwcSelfServiceLoadingModal extends LightningModal {
	@api timeoutMilliseconds;
	@api callbackCallout;
    @api content;

	connectedCallback(){
		this.delayCallout();
	}

	delayCallout() {
		setTimeout(() => {
			this.callbackCallout(this);
		}, this.timeoutMilliseconds);
	}
}