import { LightningElement,api,track } from 'lwc';

export default class Pv_MultiSelectPicklist extends LightningElement {
    @api label = "Default label";
    _disabled = false;
    @api
    get disabled(){
        return this._disabled;
    }
    set disabled(value){
        this._disabled = value;
        this.handleDisabled();
    }
    @track inputOptions;
    @api
    get options() {
        return this.inputOptions.filter(option => option.value !== '--None--');
    }
    set options(value) {
        let options = [{
            value: '--None--',
            label: '--None--'
        }];
        this.inputOptions = options.concat(value);
    }
    @api
    clear(){
        this.handleAllOption();
    }
    value = [];
    @api inputValue = '';
    hasRendered;
    renderedCallback() {
        if (!this.hasRendered) {
            //  we coll the logic once, when page rendered first time
            this.handleDisabled();
        }
        this.hasRendered = true;
    }
    handleDisabled(){
        let input = this.template.querySelector("input");
        if (input){
            input.disabled = this.disabled;
        }
    }
    comboboxIsRendered;
    handleClick() {
        let sldsCombobox = this.template.querySelector(".slds-combobox");
        sldsCombobox.classList.toggle("slds-is-open");
        if (!this.comboboxIsRendered){
            let allOption = this.template.querySelector('[data-id="--None--"]');
            allOption.firstChild.classList.add("slds-is-selected");
            this.comboboxIsRendered = true;
        }
    }
    handleSelection(event) {
        let value = event.currentTarget.dataset.value;
        if (value === '--None--') {
            this.handleAllOption();
        }
        else {
            this.handleOption(event, value);
        }
        let input = this.template.querySelector("input");
        input.focus();
        this.sendValues();
    }
    sendValues(){
        let values = [];
        for (const valueObject of this.value) {
            values.push(valueObject.value);
        }
        this.dispatchEvent(new CustomEvent("valuechange", {
            detail: values
        }));
    }
    handleAllOption(){
        this.value = [];
        this.inputValue = '--None--';
        let listBoxOptions = this.template.querySelectorAll('.slds-is-selected');
        for (let option of listBoxOptions) {
            option.classList.remove("slds-is-selected");
        }
        let allOption = this.template.querySelector('[data-id="--None--"]');
        allOption.firstChild.classList.add("slds-is-selected");
        this.closeDropbox();
    }

    handleOption(event, value){
        let listBoxOption = event.currentTarget.firstChild;
        if (listBoxOption.classList.contains("slds-is-selected")) {
            this.value = this.value.filter(option => option.value !== value);
        }
        else {
            let allOption = this.template.querySelector('[data-id="--None--"]');
            allOption.firstChild.classList.remove("slds-is-selected");
            let option = this.options.find(option => option.value === value);
            this.value.push(option);
        }
        if (this.value.length > 1) {
            this.inputValue = this.value.length + ' options selected';
        }
        else if (this.value.length === 1) {
            this.inputValue = this.value[0].label;
        }
        else {
            this.inputValue = '--None--';
        }
        listBoxOption.classList.toggle("slds-is-selected");
    }
    dropDownInFocus = false;
    handleBlur() {
        if (!this.dropDownInFocus) {
            this.closeDropbox();
        }
    }
    handleMouseleave() {
        this.dropDownInFocus = false;
    }
    handleMouseEnter() {
        this.dropDownInFocus = true;
    }
    closeDropbox() {
        let sldsCombobox = this.template.querySelector(".slds-combobox");
        sldsCombobox.classList.remove("slds-is-open");
    }
}