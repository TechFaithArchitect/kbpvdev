import { LightningElement, api, wire } from "lwc";
import LightningAlert from "lightning/alert";
import { getRecord } from "lightning/uiRecordApi";

import ALERT_MESSAGE_FIELD from "@salesforce/schema/Account.Alert_Message__c";

export default class MyApp extends LightningElement {
    @api recordId;
    alertDisplayed = false;

    @wire(getRecord, { recordId: "$recordId", fields: [ALERT_MESSAGE_FIELD] })
    account({ error, data }) {
        if (error) {
            console.log(error);
        } else if (data) {
            console.log(this.alertDisplayed);
            let alert = data.fields.Alert_Message__c.value;
            if (alert != ("" || null) && this.alertDisplayed == false) {
                LightningAlert.open({
                    message: alert,
                    theme: "info",
                    label: "Alert Message"
                });
                this.alertDisplayed = true;
                console.log(alert);
                console.log(this.alertDisplayed);
            }
        }
    }
}