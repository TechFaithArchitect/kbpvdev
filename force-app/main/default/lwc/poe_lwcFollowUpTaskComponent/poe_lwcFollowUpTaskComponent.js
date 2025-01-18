import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import createNewTask from "@salesforce/apex/POE_CreateNewFollowUpTask.createNewTask";

export default class poe_lwcFollowUpTaskComponent extends LightningElement {
    @api recordId;
    showModal = false;
    loaderSpinner = false;
    dateTimeSelected;
    notes;
    subject;
    noCompleteInfo = true;
    dueDate;

    connectedCallback() {}

    handleClick(e) {
        this.showModal = true;
    }

    hideModal(e) {
        this.showModal = false;
    }

    handleChange(e) {
        switch (e.target.name) {
            case "subjectField":
                this.subject = e.target.value;
                break;
            case "dateTimeField":
                this.dateTimeSelected = e.target.value;
                this.dueDate = e.target.value.slice(0, 10);
                this.disableValidations();
                break;
            case "notesField":
                this.notes = e.target.value;
                break;
        }
    }

    handleTaskSave(e) {
        this.hideModal();
        this.loaderSpinner = true;
        createNewTask({
            opportunityId: this.recordId,
            description: this.notes !== undefined ? this.notes : "",
            followUpDateTime: this.dateTimeSelected,
            dueDate: this.dueDate,
            subject: this.subject !== undefined ? this.subject : ""
        })
            .then((result) => {
                console.log({
                    opportunityId: this.recordId,
                    description: this.notes !== undefined ? this.notes : "",
                    followUpDateTime: this.dateTimeSelected,
                    dueDate: this.dueDate,
                    subject: this.subject !== undefined ? this.subject : ""
                });
                let success = result;
                this.loaderSpinner = false;
                if (success) {
                    const event = new ShowToastEvent({
                        title: "Success!",
                        variant: "success",
                        message: "Follow Up Task Created!"
                    });
                    this.dispatchEvent(event);
                    const showCollateralEvent = new CustomEvent("refresh", {
                        detail: ""
                    });
                    this.dispatchEvent(showCollateralEvent);
                } else {
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: "Couldn't save this Task. Please, try again."
                    });
                    this.dispatchEvent(event);
                }
            })
            .catch((error) => {
                console.log(error);
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: "Couldn't save this Task. Please, try again."
                });
                this.dispatchEvent(event);
            });
    }
    disableValidations() {
        if (this.dateTimeSelected !== undefined) {
            this.noCompleteInfo = false;
        } else {
            this.noCompleteInfo = true;
        }
    }
}