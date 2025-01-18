import { LightningElement, api } from "lwc";
import getDealerInfo from "@salesforce/apex/InfoTabController.getDealerInfo";


export default class Poe_lwcAddressServiceabilityConsent extends LightningElement {
    @api recordId;
    accountName;

    connectedCallback() {
        let myData = {
            Id: this.recordId
        };
        getDealerInfo({ myData: myData })
            .then((response) => {
                let result = response.result;
                this.accountName = result.Accounts.Name;
                console.log(response.result);
            })
            .catch((error) => {
                console.log(error);
            });
    }
}