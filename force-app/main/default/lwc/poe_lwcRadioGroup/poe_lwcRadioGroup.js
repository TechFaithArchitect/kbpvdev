import { LightningElement, api } from 'lwc';

export default class Poe_lwcRadioGroup extends LightningElement {
    @api label;

    _options;
    _value;

    @api
    get options() {
        return this._options;
    }
    set options(value) {
        this._options = value;
    }

    @api
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;

        this._options = this._options.map(opt => {
            return {
                ...opt,
                checked: this._value === opt.value
            }
        });
    }

    connectedCallback() {
        this._options = this.options.map(opt => {
            return {
                ...opt,
                checked: opt.value === this.value
            }
        });
    }

    handleInput(e) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                value: e.target.value
            }
        }));
    }
}