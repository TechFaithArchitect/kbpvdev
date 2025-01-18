import { LightningElement, api } from 'lwc';

export default class Poe_lwcBuyflowEarthlinkCart extends LightningElement {
    @api broadbandLabel;
    monthlyFees = [];
    showMonthlyFees = false;
    showOneTimeFee = false;
    showDiscountsAndBundles = false;

    connectedCallback(){
        // Create iterable for monthly fees
        if(this.broadbandLabel.hasOwnProperty("monthlyFees")){
            for (let label in this.broadbandLabel.monthlyFees){
                let value = this.broadbandLabel.monthlyFees[label];
                let monthlyFee = {
                    "label": label,
                    "value": value
                }
                this.monthlyFees.push(monthlyFee);
            }
            this.showMonthlyFees = this.monthlyFees.length > 0 ? true : false;
        }
        // One Time Fee(s)
        if(this.broadbandLabel.hasOwnProperty("oneTimeFees")){
            this.showOneTimeFee = true;
        }
        // Discount & Bundles
        if(this.broadbandLabel.hasOwnProperty("discountsAndBundles") && this.broadbandLabel.discountsAndBundles !== "NA"){
            this.showDiscountsAndBundles = true;
        }

        
    }
}