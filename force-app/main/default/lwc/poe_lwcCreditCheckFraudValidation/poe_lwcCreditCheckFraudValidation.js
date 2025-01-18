import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import setFraudFlag from "@salesforce/apex/CreditCheckTabController.setFraudFlag";

export default class PoeCreditCheckFraudValidation extends NavigationMixin(LightningElement) {
    @api recordId;

    handleClick() {
        const options = {};
        let myData = {
            ContextId: this.recordId
        };
        setFraudFlag({ myData: myData })
            .then((response) => {
                this[NavigationMixin.Navigate]({
                    type: "standard__recordPage",
                    attributes: {
                        recordId: this.recordId,
                        objectApiName: "Opportunity",
                        actionName: "view"
                    }
                });
            })
            .catch((error) => {
                console.error(error, "Error flagging Opportunity");
            });
    }
}