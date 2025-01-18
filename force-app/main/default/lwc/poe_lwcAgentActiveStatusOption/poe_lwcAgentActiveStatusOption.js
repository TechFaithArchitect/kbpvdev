import { LightningElement, api } from "lwc";

export default class Poe_lwcAgentActiveStatusOption extends LightningElement {
    @api agentStatus;
    @api agentType;
    @api experience;
}