import { LightningElement, api, track } from 'lwc';

export default class PvSiteSurveyElement extends LightningElement {

    id;
    @api type;
    @api input ;
    source;
    values;
    header;
    checkBoxValues = '';
    @api value = [];

    @api responseValue;
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
        console.log('this.input.value',this.input.value);
        this.showHideOtherTextBox(this.input.value);
    }

   
    handleCheckboxChange(event) {
        let selectedValues = event.detail.value;
        this.showHideOtherTextBox(selectedValues);
        
    }

    handleCheckBox(event) {
        if (event.target.name == 'Checkbox Group') {
            this.checkBoxValues = event.detail.value;
            console.log('value-------->',event.target.value);
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
            const selectedEvent = new CustomEvent('selected', { detail: { id: this.input.id, result: changedValue,responseId:this.input.responseId } });
            this.dispatchEvent(selectedEvent);
        }, 500);
    }

    showHideOtherTextBox(selectedValues) {
        const selectedEvent = new CustomEvent('selected', { detail: { id: this.input.id, result: selectedValues ,responseId:this.input.responseId} });
        this.dispatchEvent(selectedEvent);
    }

    @api checkValidity() {
        let isSelfValidated = true;
        if (this.type === 'dropdown') {
            const combobox = this.template.querySelector('lightning-combobox');
            if (combobox.value === undefined)  {
                combobox.classList.add('slds-has-error');
                isSelfValidated = false;
            } else {
                console.log('inside if');
                combobox.classList.remove('slds-has-error');
            }
        } else if (this.type === 'radio') {
            const radioGroup = this.template.querySelector('lightning-radio-group');
            if (radioGroup.value === undefined ) {
                radioGroup.classList.add('slds-has-error');
                isSelfValidated = false;
            }
            else {
                radioGroup.classList.remove('slds-has-error');
            }
        } else {
            isSelfValidated = [
                this.template.querySelector(".inputCmp")
            ].reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        }
        return isSelfValidated;
    }
    
}