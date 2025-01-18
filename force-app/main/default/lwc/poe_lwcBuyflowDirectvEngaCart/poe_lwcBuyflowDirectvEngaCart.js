import { LightningElement, api } from 'lwc';

export default class Poe_lwcBuyflowDirectvEngaCart extends LightningElement {
    @api cart;
    @api boldDescription;

    get showBoldDescriptions() {
        return typeof this.boldDescription === "undefined" || this.boldDescription === "true"
            || (typeof this.boldDescription === "boolean" && this.boldDescription);
    }
}