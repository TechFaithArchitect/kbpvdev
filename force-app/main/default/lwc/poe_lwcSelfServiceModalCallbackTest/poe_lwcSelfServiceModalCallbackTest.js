import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class Poe_lwcSelfServiceModalCallbackTest extends LightningModal {
    @api callbackFn;

    connectedCallback() {
        this.callbackFn(this);
    }
}