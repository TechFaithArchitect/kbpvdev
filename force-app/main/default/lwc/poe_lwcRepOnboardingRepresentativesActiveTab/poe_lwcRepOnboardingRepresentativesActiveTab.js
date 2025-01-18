import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import updateTPVField from "@salesforce/apex/RepOnBoardingController.updateTPVField";

export default class Poe_lwcRepOnboardingRepresentativesActiveTab extends LightningElement {
    @api activeContacts;
    @api contactLength;
    @api tpv;
    loaderSpinner;
    selectedContact;
    selectedId;
    showModal = false;

    connectedCallback() {
        console.log("Contacts", this.activeContacts);
    }

    updateTPV(event) {
        this.loaderSpinner = true;
        let myData = {
            contactId: event.target.name,
            value: event.target.checked
        };

        updateTPVField({ myData: myData })
            .then((response) => {
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                let errorMsg = error.body?.message || error.message;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: errorMsg
                });
                this.dispatchEvent(event);

                this.logError(errorMsg);
            });
    }

    refreshTable() {
        this.showModal = false;
        const sendTrackerEvent = new CustomEvent("refresh", {
            detail: "Active"
        });
        this.dispatchEvent(sendTrackerEvent);
    }

    showModalBox(event) {
        this.selectedId = event.target.name;
        this.activeContacts.forEach((item) => {
            if (item.Id === this.selectedId) {
                this.selectedContact = item;
            }
        });
        this.selectedContact = JSON.parse(JSON.stringify(this.selectedContact));
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    logError(errorMessage) {
        const error = {
            type: "Internal Error",
            tab: "Agent Onboarding",
            component: "poe_lwcRepOnboardingRepresentativesActiveTab",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }

    handleLogError(event) {
        this.dispatchEvent(event);
    }
}