import { LightningElement, api } from "lwc";

export default class ClickerModal extends LightningElement {
    @api name;
    @api label;
    @api value;
    @api options = [];
    @api modalTitle;
    @api placeholder;
    searchText;
    selection;

    handleChange(event) {
        this.value = event.detail.value;
        this.label = event.target.options.find(opt => opt.value === event.detail.value).label;
    }

    get disableConfirm() {
        this.value === undefined ? true : false;
    }

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleSelect() {
        const confirmModalEvent = new CustomEvent("select", {
            detail: {
                value: this.value,
                label: this.label
            }
        });
        this.dispatchEvent(confirmModalEvent);
    }
}