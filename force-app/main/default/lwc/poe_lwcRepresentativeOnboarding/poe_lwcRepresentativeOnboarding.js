import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getAccountDetails from "@salesforce/apex/RepOnBoardingController.getAccountDetails";
import logError from "@salesforce/apex/ErrorLogModel.logError";

export default class Poe_lwcRepresentativeOnboarding extends LightningElement {
    pointOfContact;
    dealerOfficeEmail;
    accountId;
    loaderSpinner = false;
    showCreateModal = false;
    tab = "Onboarding";

    connectedCallback() {
        this.loaderSpinner = true;
        getAccountDetails()
            .then((response) => {
                console.log("get account detail response", response);

                let accountData = response.result.Account;
                this.accountId = response.result.hasOwnProperty("User") ? response.result.User.AccountId : undefined;
                this.pointOfContact = accountData.hasOwnProperty("POE_Point_of_Contact__c")
                    ? accountData.POE_Point_of_Contact__c
                    : undefined;
                this.dealerOfficeEmail = accountData.hasOwnProperty("POE_Dealer_Office_Email__c")
                    ? accountData.POE_Dealer_Office_Email__c
                    : undefined;

                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error("error", error);
                let errorMsg = error.body?.message || error.message;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: errorMsg
                });
                this.dispatchEvent(event);

                const errorlog = {
                    type: "Internal Error",
                    tab: "Agent Onboarding",
                    component: "poe_lwcRepresentativeOnboarding",
                    error: errorMsg
                };

                this.logError(errorlog);
            });
    }

    handleLogError(event) {
        this.logError(event.detail);
    }

    handleNewAgent() {
        this.showCreateModal = true;
    }

    handleClose() {
        this.showCreateModal = false;
    }

    handleUpdate() {
        let repsList = this.template.querySelector("c-poe_lwc-rep-onboarding-representatives");
        repsList.setRepresentativeList({ detail: this.tab });
        this.handleClose();
    }

    handleTab(event) {
        this.tab = event.detail;
    }

    logError(error) {
        logError({ error: error })
            .then(() => {})
            .catch((err) => {
                console.error(`LOGGING ERROR: ${err.body?.message || err.stack}`);
            });
    }
}