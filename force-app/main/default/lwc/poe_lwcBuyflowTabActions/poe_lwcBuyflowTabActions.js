import { LightningElement, api } from 'lwc';
import NEXT_BUTTON_LABEL from "@salesforce/label/c.Next_Button_Label";
import CANCEL_BUTTON_LABEL from "@salesforce/label/c.Cancel_Button_Label";
import PREVIOUS_BUTTON_LABEL from "@salesforce/label/c.Previous_Button_Label";


export default class Poe_lwcBuyflowTabActions extends LightningElement {
    @api nextLabel;
    @api previousLabel;
    @api cancelLabel;
    @api showCancel;
    @api showPrevious;
    @api showNext;
    @api disableNext;

    get nextBtnLabel() {
        return this.nextLabel || NEXT_BUTTON_LABEL;
    }
    
    get previousBtnLabel() {
        return this.previousLabel || PREVIOUS_BUTTON_LABEL;
    }
    
    get cancelBtnLabel() {
        return this.cancelLabel || CANCEL_BUTTON_LABEL;
    }

    get showNextBtn() {
        return typeof this.showNext === 'undefined' || this.showNext;
    }

    handleNext() {
        this.dispatchEvent(new CustomEvent('next'));
    }

    handlePrevious() {
        this.dispatchEvent(new CustomEvent('previous'));
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('cancel'));
    }
}