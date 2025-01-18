import { LightningElement,api,track} from 'lwc';

export default class PvAuditScreenElement extends LightningElement {

    id;
    @api type;
    @api input;
    @api readonlyuser;
    source;
    values;
    header;
    checkBoxValues = '';
    @api  value;
    showOtherTextBox = false;
    @track otherText = '';
    checkBoxSeprated = '';
    appendedData = '';
    get title() {
        return this.input.question;
    }

    get isCheckBox() {
        return this.type === 'checkbox';
    }

    get isDropDown() {
        return this.type === 'dropdown';
    }

    get isRadio() {
        return this.type === 'radio';
    }

    get isInputText() {
        return this.type === 'textbox';
    }

    get isNumberBox() {
        return this.type === 'number';
    }

    get options() {
        return this.input.values && this.input.values.split(",").map(val => {
           
            return { "label": val, "value": val }
        });
    }

    connectedCallback() {
        console.log('value'+this.readonlyuser);
    }

    handleCheckboxChange(event) {
        let selectedValues = event.detail.value;
      ;
        this.showHideOtherTextBox(selectedValues);
    }

    handleCheckBox(event) {
        if (event.target.name == 'Checkbox Group') {
            this.checkBoxValues = event.detail.value;
            this.checkBoxSeprated = this.checkBoxValues.join(",");
            this.showOtherTextBox = this.checkBoxValues.includes('Other');
            this.showHideOtherTextBox(this.checkBoxSeprated);
        }
        if (event.target.name == 'otherText') {
            this.otherText = event.target.value;
            this.appendedData = this.checkBoxSeprated + ',' + 'Others Comments : ' + this.otherText;
            this.showHideOtherTextBox(this.appendedData);
        }
    }

    handleOtherTextChange(event) {
        const changedValue = event.detail.value;
        window.clearTimeout(this.delayTimeout);
        this.delayTimeout = setTimeout(() => {
            const selectedEvent = new CustomEvent('selected', { detail: { id: this.input.id, result: changedValue } });
            this.dispatchEvent(selectedEvent);
        }, 500);
    }

    showHideOtherTextBox(selectedValues) {
        const selectedEvent = new CustomEvent('selected', { detail: { id: this.input.id, result: selectedValues } });
        this.dispatchEvent(selectedEvent);
    }
    @api checkValidity() {
        // let isChildValidated = true;
        // var inputCmp = this.template.querySelector(".inputCmp");
        let isSelfValidated = false;
        isSelfValidated = [
            this.template.querySelector(".inputCmp")
        ].reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);
        return isSelfValidated;
    }
}