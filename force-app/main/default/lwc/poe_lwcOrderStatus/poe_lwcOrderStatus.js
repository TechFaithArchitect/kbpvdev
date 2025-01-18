import { LightningElement, api, wire } from "lwc";
import ORDER_TYPE from "@salesforce/schema/Order.Type";
import { getRecord } from "lightning/uiRecordApi";

export default class Poe_lwcOrderStatus extends LightningElement {
    @api recordId;

    @wire(getRecord, { recordId: "$recordId", fields: [ORDER_TYPE] })
    order;
}