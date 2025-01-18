import { LightningElement, api, wire } from "lwc";
import getAgentStatus from "@salesforce/apex/POE_AgentActiveStatusController.getAgentStatus";

export default class Poe_lwcAgentActiveStatus extends LightningElement {
    @api recordId;
    agentStatus = {
        chuzo: false,
        fieldService: false
    };

    @wire(getAgentStatus, { contactId: "$recordId" })
    wiredResponse({ error, data }) {
        if (data) {
            this.processResponse(data);
        } else if (error) {
            console.log(error);
            this.agentStatus.chuzo = false;
            this.agentStatus.fieldService = false;
        }
    }

    processResponse(response) {
        let agentStatus = {
            chuzo: response.result.chuzo,
            fieldService: response.result.fieldService
        };
        this.agentStatus = { ...agentStatus };
    }
}