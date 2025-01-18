import { LightningElement, api } from "lwc";
import Windstream_Disclaimers from "@salesforce/label/c.Windstream_Disclaimers";
import Tech_Disclaimer_Title from "@salesforce/label/c.Tech_Disclaimer_Title";

export default class Poe_lwcBuyflowWindstreamProductDescriptionModal extends LightningElement {
    @api description;
    @api modalLabel;
    @api tech;
    hasTech;

    labels = {
        Windstream_Disclaimers,
        Tech_Disclaimer_Title
    };

    hideModal() {
        const closeModalEvent = new CustomEvent("closedescription", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    closeModal() {
        if (this.modalLabel === "Close") {
            const closeModalEvent = new CustomEvent("closedescription", {
                detail: ""
            });
            this.dispatchEvent(closeModalEvent);
        } else {
            const closeModalEvent = new CustomEvent("accept", {
                detail: ""
            });
            this.dispatchEvent(closeModalEvent);
        }
    }
    connectedCallback() {
        this.hasTech = this.tech !== undefined && this.tech !== null;
    }
}