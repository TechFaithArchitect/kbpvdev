import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import sendEmail from "@salesforce/apex/POEDynamicUIDFieldsController.sendEmail";
import getDealerEmail from "@salesforce/apex/POEDynamicUIDFieldsController.getDealerEmail";
import ccEmails from "@salesforce/label/c.InformationRequest";

export default class Poe_lwcDynamicUIDFieldsModal extends LightningElement {
    @api recordId;
    noCompleteInformation = true;
    email;
    message;
    ccEmail;
    ccAddresses = [];

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: "cancel"
        });
        this.dispatchEvent(closeModalEvent);
    }

    connectedCallback() {
        let newArray = [];
        this.ccEmail = ccEmails;
        if (ccEmails.includes(";")) {
            newArray = ccEmails.split(";");
        } else {
            newArray.push(ccEmails);
        }
        this.ccAddresses = [...newArray];
        getDealerEmail({
            recordId: this.recordId
        })
            .then((result) => {
                this.email = result;
            })
            .catch((error) => {
                console.log(error);
            });
    }

    handleChange(event) {
        if (event.target.name === "message") {
            this.message = event.target.value;
        }
        if (this.message !== undefined && this.message !== null && this.message !== "") {
            this.noCompleteInformation = false;
        } else {
            this.noCompleteInformation = true;
        }
    }

    sendEmailHandler() {
        sendEmail({
            body: this.message,
            toSend: this.email,
            ccAddresses: this.ccAddresses
        })
            .then((result) => {
                const event = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    message: "The email was sent to the corresponding Owner requesting the information."
                });
                this.dispatchEvent(event);
                const closeModalEvent = new CustomEvent("close", {
                    detail: "cancel"
                });
                this.dispatchEvent(closeModalEvent);
            })
            .catch((error) => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The email could not be sent, please try again."
                });
                this.dispatchEvent(event);
            });
    }
}