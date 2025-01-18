import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class Poe_lwcViasatBNLForm extends LightningElement {
    @api dealerId;
    @api orgId;
    @api viasatOrgUrl;
    @api leadSource;

    handleFormSubmission() {
        const event = new ShowToastEvent({
            title: "Success",
            variant: "success",
            message: "Physical Broadband Label has been sent."
        });
        this.dispatchEvent(event);
        setTimeout(() => {
            this.hideModal();
        }, 1500);
    }

    hideModal() {
        this.dispatchEvent(
            new CustomEvent("close", {
                detail: ""
            })
        );
    }
}