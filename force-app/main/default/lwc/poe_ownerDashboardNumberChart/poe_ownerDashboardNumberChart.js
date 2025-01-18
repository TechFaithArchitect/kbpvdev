import { LightningElement, api } from 'lwc';
import { NavigationMixin } from "lightning/navigation";

export default class Poe_ownerDashboardNumberChart extends NavigationMixin(LightningElement) {
    @api numberData;
    @api type;
    @api greenValue;
    @api redValue;
    @api title;
    @api reportName;
    @api reportId;
    get isPercentage() {
        return this.type === 'percent';
    }
    get numberColor(){
        let color = (this.numberData > this.redValue && this.numberData < this.greenValue) 
            ? 'yellowNumber' 
            : this.numberData > this.greenValue 
                ? 'greenNumber' 
                : 'redNumber';
        return 'slds-text-align_center slds-var-m-top_medium slds-truncate ' + color;
    }

    handleReportClick(){
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: this.reportId,
                objectApiName: "Report",
                actionName: "view"
            }
        });
    }

}