import { LightningElement } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import getCurrentSessionType from "@salesforce/apex/ClickerController.getCurrentSessionType";
import logError from "@salesforce/apex/ErrorLogModel.logError";

export default class ClickerRetail extends NavigationMixin(LightningElement) {

    loaderSpinner = false;

    connectedCallback() {
        this.loaderSpinner = true;
        this.getSessionType();
        
    }

    getSessionType() {
        let myData = {};
        getCurrentSessionType({ myData: myData })
            .then((response) => {
                this.loaderSpinner = false;
                if(response === 'ChatterNetworks'){
                    this[NavigationMixin.Navigate]({
                        type: "comm__namedPage",
                        attributes: {
                            name: "Clicker__c"
                        },
                        state: {
                          clickerOrigin: "retail"
                        }
                    });
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "An error occurred retrieving session type"
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Clicker Retail",
            component: "clickerRetail",
            error: errorMessage ? JSON.stringify(errorMessage) : errorMessage
        };

        logError({ error })
            .then(() => {})
            .catch((err) => {
                console.error(`LOGGING ERROR: ${err.body?.message || err.stack}`);
            });
    }
}