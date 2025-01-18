import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";

export default class Poe_lwcBuyflowDirecTVSummaryMock extends NavigationMixin(LightningElement) {
    @api productSelected;
    @api hardwareSelected;
    @api logo;
    @api cartInfo;
    @api recordId;
    showCollateral;

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleClick() {
        const sendCartNextEvent = new CustomEvent("summarynext", {
            detail: ""
        });
        this.dispatchEvent(sendCartNextEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: this.recordId,
                objectApiName: "Opportunity",
                actionName: "view"
            }
        });
    }
}