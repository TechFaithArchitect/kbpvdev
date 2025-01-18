import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class Poe_lwcRepOnboardingRepresentativesOnboardingTab extends LightningElement {
    @api contactsOnboarding;
    @api tpv;
    loaderSpinner;
    selectedContact;
    selectedId;
    showModal = false;
    @api contactLength;

    refreshTable() {
        this.showModal = false;
        const sendTrackerEvent = new CustomEvent("refresh", {
            detail: "Onboarding"
        });

        this.dispatchEvent(sendTrackerEvent);
    }

    closeModal() {
        this.showModal = false;
    }

    connectedCallback() {}

    showModalBox(event) {
        this.selectedId = event.target.name;
        this.contactsOnboarding.forEach((item) => {
            if (item.Id === this.selectedId) {
                this.selectedContact = item;
            }
        });
        this.selectedContact = JSON.parse(JSON.stringify(this.selectedContact));
        this.showModal = true;
    }

    handleLogError(event) {
        this.dispatchEvent(event);
    }
}