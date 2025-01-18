import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import deactivateRepresentative from "@salesforce/apex/POEUserDeactivationController.deactivateRepresentative";
import deactivateRepresentativeContact from "@salesforce/apex/POEUserDeactivationController.deactivateRepresentativeContact";
import reactivateRepresentative from "@salesforce/apex/POEUserDeactivationController.reactivateRepresentative";
import hasOpenCases from "@salesforce/apex/POEUserDeactivationController.hasOpenCase";

export default class Poe_lwcRepOnboardingRepresentativesInactiveModal extends LightningElement {
    @api userId;
    @api isActive;
    @api name;
    @track isShowModal = false;
    loaderSpinner = false;
    deactivationReason;
    @track hasNoReason = true;
    disableButton = false;

    get isInactive() {
        return !this.isActive;
    }

    connectedCallback() {
        // console.log("Name", this.name);
        // console.log("Is Active", this.isActive);
        // let myData = {
        //     userId: this.userId
        // };
        // hasOpenCases({
        //     myData: myData
        // })
        //     .then((Response) => {
        //         this.disableButton = Response;
        //     })
        //     .catch((error) => {
        //         this.logError(errorMsg);
        //     });
    }

    hideLoaderSpinner() {
        this.loaderSpinner = false;
    }

    showModalBox() {
        this.isShowModal = true;
    }

    hideModalBox() {
        this.isShowModal = false;
        this.deactivationReason = '';
        this.disableValidations();
    }

    handleReasonChange(event) {
        this.deactivationReason = event.target.value;
        this.disableValidations();
    }

    disableValidations() {
        if (this.deactivationReason != "" && this.deactivationReason != null && this.deactivationReason != undefined) {
            this.hasNoReason = false;
        } else {
            this.hasNoReason = true;
        }
    }

    reactivateRepresentative(event) {
        let myData = {
            userId: event.target.name
        };
        this.loaderSpinner = true;

        reactivateRepresentative({ myData: myData })
            .then((response) => {
                this.isShowModal = false;
                this.loaderSpinner = false;
                this.disableButton = true;
                const sendTrackerEvent = new CustomEvent("update", {});
                this.dispatchEvent(sendTrackerEvent);
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

    deactivateRepresentative(event) {
        this.loaderSpinner = true;
        let myData = {
            userId: event.target.name,
            deactivationReason: this.deactivationReason
        };
        console.log(" My data :", myData);
        deactivateRepresentativeContact({ myData: myData })
            .then((response) => {
                deactivateRepresentative({
                    myData: myData
                })
                    .then((response) => {
                        this.isShowModal = false;
                        this.loaderSpinner = false;
                        this.isActive = false;
                        console.log("Response :", response);
                        const sendTrackerEvent = new CustomEvent("update", {});
                        this.dispatchEvent(sendTrackerEvent);
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

    logError(errorMessage) {
        const error = {
            type: "Internal Error",
            tab: "Agent Onboarding",
            component: "poe_lwcRepOnboardingRepresentativesInactiveModal",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }
}