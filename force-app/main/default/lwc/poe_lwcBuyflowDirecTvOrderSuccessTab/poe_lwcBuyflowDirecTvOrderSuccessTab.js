import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";

export default class Poe_lwcBuyflowDirecTvOrderSuccessTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api origin;
    @api orderNumber;
    @api orderId;
    @api referenceNumber;
    @api returnUrl;
    showCollateral = false;
    signatureIncomplete = true;
    loaderSpinner = false;
    showSignature;
    name;
    address;
    hasReturnUrl = false;

    connectedCallback() {
        this._actionUtil = new OmniscriptActionCommonUtil();
        this.hasReturnUrl = this.returnUrl != undefined;
    }

    newOpportunityHandler() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_AddNewProduct",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                this.loaderSpinner = false;
                let newOppId = response.result.IPResult[0].Id;
                let values = {
                    recordId: newOppId,
                    program: "DirecTV"
                };
                let event = new CustomEvent("newproduct", {
                    detail: values,
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                console.log(error);
                this.loaderSpinner = false;
            });
    }

    homeHandler() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_eraseCustomerSensitiveData",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                this.loaderSpinner = false;
                console.log(this.origin);
                switch (this.origin) {
                    case "phonesales":
                        this[NavigationMixin.Navigate]({
                            type: "comm__namedPage",
                            attributes: {
                                name: "Clicker_Call_Center__c"
                            }
                        });
                        break;
                    case "retail":
                        this[NavigationMixin.Navigate]({
                            type: "comm__namedPage",
                            attributes: {
                                name: "retail_clicker__c"
                            }
                        });
                        break;
                    case "event":
                        this[NavigationMixin.Navigate]({
                            type: "comm__namedPage",
                            attributes: {
                                name: "Clicker_Event__c"
                            }
                        });
                        break;
                    case "maps":
                        this[NavigationMixin.Navigate]({
                            type: "comm__namedPage",
                            attributes: {
                                name: "Door_to_door__c"
                            }
                        });
                        break;
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
            });
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleSignatureDone(event) {
        this.showSignature = false;
        this.signatureIncomplete = false;
    }

    handleSignatureCancel(event) {
        this.showSignature = false;
    }

    signatureModalHandler() {
        this.showSignature = true;
    }

    returnToUrlHandler(){
        window.open(this.returnUrl, '_self');
    }
}