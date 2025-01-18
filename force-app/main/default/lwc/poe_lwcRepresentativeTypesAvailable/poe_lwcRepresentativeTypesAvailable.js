import { LightningElement, api } from "lwc";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
import { OmniscriptBaseMixin } from "vlocity_cmt/omniscriptBaseMixin";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class Poe_lwcRepresentativeProgramsAvailable extends OmniscriptBaseMixin(LightningElement) {
    @api omniJsonData;
    showD2D;
    showCallCenter;
    showEvent;
    showRetail;
    _actionUtil;
    loaderSpinner;
    data;

    connectedCallback() {
        this.loaderSpinner = true;
        this._actionUtil = new OmniscriptActionCommonUtil();
        let data = JSON.parse(JSON.stringify(this.omniJsonData));
        let types =
            data.hasOwnProperty("Contact") && data.Contact.hasOwnProperty("POE_Representative_Type__c")
                ? data.Contact.POE_Representative_Type__c
                : undefined;
        if (types === undefined) {
            const event = new ShowToastEvent({
                title: "No Representative Types Available",
                variant: "error",
                mode: "sticky",
                message:
                    "Your user doesn't have at least a Representative Type assigned. Please contact Account Services."
            });
            this.dispatchEvent(event);
        } else {
            this.showD2D = types.includes("Door To Door");
            this.showEvent = types.includes("Event");
            this.showRetail = types.includes("Retail");
            this.showCallCenter = types.includes("Phone Sales");
            this.data = {
                d2dCheckbox: false,
                eventCheckbox: false,
                retailCheckbox: false,
                callCenterCheckbox: false
            };
        }
        this.loaderSpinner = false;
    }

    handleChecked(event) {
        switch (event.target.name) {
            case "callCenter":
                this.data.callCenterCheckbox = event.target.checked;
                break;
            case "doorToDoor":
                this.data.d2dCheckbox = event.target.checked;
                break;
            case "event":
                this.data.eventCheckbox = event.target.checked;
                break;
            case "retail":
                this.data.retailCheckbox = event.target.checked;
                break;
        }
        JSON.parse(JSON.stringify(this.data));
        console.log(this.data);
        this.omniUpdateDataJson(this.data);
    }
}