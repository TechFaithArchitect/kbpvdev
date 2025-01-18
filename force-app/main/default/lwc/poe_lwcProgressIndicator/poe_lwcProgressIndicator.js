import { LightningElement, api } from 'lwc';

export default class Poe_lwcProgressIndicator extends LightningElement {
    @api currentStep;

    _steps;
    stepsByValue = {};

    @api 
    get steps() {
        return this._steps
    }
    set steps(value) {
        this._steps = value;
        this._steps.forEach(step => {
            this.stepsByValue[step.value] = step;
        });
    }

    get currentTabName() {
        return this.stepsByValue[this.currentStep].label;
    }
}