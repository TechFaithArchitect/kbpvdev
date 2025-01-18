import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class Poe_lwcBuyflowPrompt extends LightningModal {
    @api fieldLabel;
    @api defaultValue;

    value;

    connectedCallback() {
        this.value = this.defaultValue;
    }

    handleChange(event) {
        this.value = event.detail.value;
    }

    handleCancel() {
        this.close();
    }

    handleConfirm() {
        this.close(this.value);
    }
}