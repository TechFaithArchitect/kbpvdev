import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import updateTPVField from "@salesforce/apex/RepOnBoardingController.updateTPVField";
import createReactivationCaseWithContactId from "@salesforce/apex/RepOnBoardingController.createReactivationCaseWithContactId";
import SUCCESS_TITLE from "@salesforce/label/c.Success_Toast_Title";
import ERROR_TITLE from "@salesforce/label/c.Toast_Generic_Error_Title";
import REACTIVATION_MESSAGE from "@salesforce/label/c.Chuzo_Reactivation_Case_Created_Message";
import REACTIVATION_BUTTON_LABEL from "@salesforce/label/c.Chuzo_Reactivate_Button_Label";

export default class Poe_lwcRepOnboardingRepresentativesTab extends LightningElement {
    @api contactList;
    @api contactLength;
    @api tpv;
    @api listType;
    loaderSpinner;
    selectedContact;
    selectedId;
    showModal = false;
    labels = {
        SUCCESS_TITLE,
        ERROR_TITLE,
        REACTIVATION_MESSAGE,
        REACTIVATION_BUTTON_LABEL
    };

    get onboardingTab() {
        return this.listType == "Onboarding";
    }

    get activeTab() {
        return this.listType == "Active";
    }

    get inactiveTab() {
        return this.listType == "Inactive";
    }

    get showEditAndDeactivateButton() {
        return this.activeTab || this.onboardingTab;
    }

    connectedCallback() {
        this.displayTable = true;
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
                this.displayToast(this.labels.ERROR_TITLE, "error", errorMsg);
                this.logError(errorMsg);
            });
    }

    refreshTable() {
        let tableDetail = "";
        switch (this.listType) {
            case "Onboarding":
                tableDetail = "Onboarding";
            case "Active":
                tableDetail = "Active";
            case "Inactive":
                tableDetail = "Inactive";
        }

        this.showModal = false;
        const sendTrackerEvent = new CustomEvent("refresh", {
            detail: tableDetail
        });
        this.dispatchEvent(sendTrackerEvent);
    }

    showModalBox(event) {
        this.selectedId = event.target.name;
        this.contactList.forEach((item) => {
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
            component: "Poe_lwcRepOnboardingRepresentativesTab",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }

    handleReactivate(event) {
        this.loaderSpinner = true;
        let myData = {
            contactId: event.target.name
        };
        createReactivationCaseWithContactId({ myData: myData })
            .then((response) => {
                if (response?.result?.status == "error") {
                    console.error(response?.result?.message, "ERROR");
                    let errorMsg = response?.result?.message;
                    this.displayToast("Error", "error", errorMsg);
                    this.logError(errorMsg);
                } else {
                    this.refreshTable();
                    this.displayToast(this.labels.SUCCESS_TITLE, "Success", this.labels.REACTIVATION_MESSAGE);
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                let errorMsg = error.body?.message || error.message;
                this.displayToast(this.labels.ERROR_TITLE, "error", errorMsg);
                this.logError(errorMsg);
            });
    }

    displayToast(title, variant, message) {
        const toastEvent = new ShowToastEvent({
            title: title,
            variant: variant,
            mode: "sticky",
            message: message
        });
        this.dispatchEvent(toastEvent);
    }

    handleLogError(event) {
        this.dispatchEvent(event);
    }
}