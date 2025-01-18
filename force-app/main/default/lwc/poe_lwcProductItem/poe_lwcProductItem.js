import { LightningElement, api } from 'lwc';

export default class Poe_lwcProductItem extends LightningElement {
    @api allowMultipleSelection = false;
    @api product;

    showDetailsModal = false;

    get selectionTypeClasses() {
        return this.allowMultipleSelection
            ? {
                base: 'slds-checkbox',
                label: 'slds-checkbox__label',
                faux: 'slds-checkbox_faux slds-m-right_none'
            }
            : {
                base: 'slds-radio',
                label: 'slds-radio__label',
                faux: 'slds-radio_faux slds-m-right_none'
            };
    }

    get inputType() {
        return this.allowMultipleSelection ? 'checkbox' : 'radio';
    }

    handleChange(event) {
        this.dispatchEvent(new CustomEvent('productselectchange', {
            detail: {
                product: this.product,
                selected: event.target.checked
            }
        }));
    }

    toggleShowDetails(event) {
        this.showDetailsModal = !this.showDetailsModal;
        event.preventDefault();
    }
}