import { LightningElement, track, api } from "lwc";
import chartjs from "@salesforce/resourceUrl/chart";
import { loadScript } from "lightning/platformResourceLoader";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";

export default class Sh_FIM_PermissionSetChart extends NavigationMixin(LightningElement) {
    @api title;
    @api report;
    @api chartDataset;
    @api chartStyle;
    get hasData() {
        return this.chartDataset != undefined && JSON.stringify(this.chartDataset) != '{}';
    };
    chart;

    connectedCallback() {
        Promise.all([loadScript(this, chartjs)])
            .then(() => {
                if(this.hasData){
                    this.loadChart();
                }
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error loading Chart",
                        message: error.message,
                        variant: "error"
                    })
                );
            });
    }

    loadChart(){
        const ctx = this.template.querySelector("canvas");
        const container = this.template.querySelector('[data-id="canvas-container"]');

        let datasetLength = this.chartDataset.data.labels.length;
        if(datasetLength > 12){
            let newHeight = (datasetLength - 14) * 25 + 300; //calculating new container height
            container.style.height = newHeight + 'px';
        }
        this.chart = new Chart(ctx, JSON.parse(JSON.stringify(this.chartDataset)));
    }

    handleReportClick(){
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: this.report.Id,
                objectApiName: "Report",
                actionName: "view"
            }
        });
    }
}