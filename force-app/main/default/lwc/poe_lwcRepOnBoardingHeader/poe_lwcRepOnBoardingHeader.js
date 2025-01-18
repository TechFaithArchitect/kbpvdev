import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import saveAccountChanges from "@salesforce/apex/RepOnBoardingController.saveAccountChanges";

export default class Poe_lwcRepOnBoardingHeader extends LightningElement {
    noEdit = true;
    noValidInfo = true;
    @api name;
    @api email;
    @api accountId;
    originalName;
    originalEmail;
    loaderSpinner;

    connectedCallback() {
        this.originalName = this.name;
        this.originalEmail = this.email;
    }

    handleEdit() {
        this.noEdit = false;
    }

    handleCancel() {
        this.name = this.originalName;
        this.email = this.originalEmail;
        this.noEdit = true;
    }

    handleChange(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        if (event.target.name === "email") {
            this.email = event.target.value.trim();
        } else if (event.target.name === "name") {
            this.name = event.target.value;
        }
        if (
            this.email !== undefined &&
            this.email !== null &&
            this.email !== "" &&
            emailre.test(this.email) &&
            this.name !== undefined &&
            this.name !== null &&
            this.name !== "" &&
            (this.name !== this.originalName || this.email !== this.originalEmail)
        ) {
            this.noValidInfo = false;
        } else {
            this.noValidInfo = true;
        }
    }

    handleSave() {
        this.loaderSpinner = true;
        let myData = {
            accountId: this.accountId,
            name: this.name,
            email: this.email
        };
        saveAccountChanges({ myData: myData })
            .then((response) => {
                console.log(response);
                const event = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    message: "Dealer information updated successfully"
                });
                this.dispatchEvent(event);
                this.originalEmail = this.email;
                this.originalName = this.name;
                this.noEdit = true;
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                let errorMsg = error.body?.message || error.message;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: errorMsg
                });
                this.dispatchEvent(event);
                console.error(error, "ERROR");
                this.logError(errorMsg);
            });
    }

    logError(errorMessage) {
        const error = {
            type: "Internal Error",
            tab: "Agent Onboarding",
            component: "poe_lwcRepOnBoardingHeader",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }
}