import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import saveFile from "@salesforce/apex/CSATabController.saveFile";
import sendCSAFormEmail from "@salesforce/apex/CSATabController.sendCSAFormEmail";
import BTN_LABEL from "@salesforce/label/c.Frontier_CSA_Tab_BTN_Label";
import savePayloadToOpportunity from "@salesforce/apex/CSAFormPageController.savePayloadToOpportunity";

export default class Poe_lwcBuyflowFrontierCSATab extends NavigationMixin(LightningElement) {
    @api clientInfo;
    @api origin;
    @api reservedTN;
    @api recordId;
    @api btn;
    @api cartInfo;
    notPhoneSales = false;
    isNotGuestUser = true;
    showCollateral = false;
    uploadDisabled = true;
    disableNext = true;
    loaderSpinner = false;
    homeLabel = "New Customer";
    btnLabel = BTN_LABEL;
    acceptedFormats = ["image/jpeg", "image/jpg", "application/pdf", "image/png", "image/tiff"];
    filesUploaded = [];
    fileReader;
    file;
    fileContents;
    fileName = "";
    documentId = "";
    contentVersionId = "";
    contentType = "";
    MAX_FILE_SIZE = 5000000;

    connectedCallback() {
        // this.saveDataToOpportunity();
        if (this.origin === "phonesales") {
            this.disableNext = false;
            this.notPhoneSales = false;
        }
    }

    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: this.recordId,
                objectApiName: "Opportunity",
                actionName: "view"
            }
        });
    }

    handleFilesChange(event) {
        if (event.target.files.length > 0) {
            this.filesUploaded = event.target.files;
            this.fileName = event.target.files[0].name;
            this.uploadDisabled = false;
        }
    }

    handleSave() {
        this.file = this.filesUploaded[0];
        if (this.file.size > this.MAX_FILE_SIZE) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Size Limit Error",
                    message: "Error while uploading Leads, file exceeds maximum size (5MB)",
                    variant: "error",
                    mode: "sticky"
                })
            );
            this.refreshComponent();
            return;
        }
        this.loaderSpinner = true;
        this.fileReader = new FileReader();
        this.fileReader.onloadend = () => {
            let dataUrl = this.fileReader.result;
            this.fileContents = dataUrl.split(",")[1];
            this.saveFileAndSendEmail();
        };
        this.fileReader.readAsDataURL(this.file);
    }

    refreshComponent() {
        this.filesUploaded = [];
        this.fileName = "";
        this.fileContents = "";
        this.uploadDisabled = true;
    }

    saveFileAndSendEmail() {
        this.loaderSpinner = true;
        let myData = {
            title: this.fileName,
            fileContents: this.fileContents
        };
        saveFile({ myData })
            .then((response) => {
                let result = response.result;
                console.log("result", result);
                if (result.hasOwnProperty("documentId")) {
                    this.documentId = result.documentId;
                    this.contentVersionId = result.contentVersionId;
                    this.sendEmail();
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Upload failed",
                            message: "Error while uploading File",
                            variant: "error",
                            mode: "sticky"
                        })
                    );
                }
            })
            .catch((error) => {
                console.log(error);
                this.loaderSpinner = false;
                this.refreshComponent();
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error while uploading File, check the File and try again",
                        message: error.message,
                        variant: "error",
                        mode: "sticky"
                    })
                );
                this.logError(error.body?.message || error.message);
            });
    }

    sendEmail() {
        this.loaderSpinner = true;
        let myData = {
            firstName: this.clientInfo.contactInfo.firstName,
            lastName: this.clientInfo.contactInfo.lastName,
            btn: this.reservedTN,
            documentId: this.documentId,
            contentVersionId: this.contentVersionId
        };
        sendCSAFormEmail({ myData: myData })
            .then((response) => {
                console.log("Send Email Response", response);
                if (!response.result.error) {
                    this.loaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        mode: "sticky",
                        message: "The email was sent correctly. Please click Next to continue."
                    });
                    this.dispatchEvent(event);
                    this.disableNext = false;
                } else {
                    this.loaderSpinner = false;
                    console.error(error, "ERROR");
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "The email could not be sent."
                    });
                    this.dispatchEvent(event);
                    this.logError(error.body?.message || error.message);
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The email could not be sent."
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    saveDataToOpportunity() {
        this.loaderSpinner = true;

        const installationCharge = this.cartInfo?.todayCharges.find(
            (charge) => charge.type === "Single" && charge.name.includes("Installation")
        );

        let myData = {
            monthlyRecurringCharges: this.cartInfo?.monthlyTotal,
            installationFee: installationCharge?.fee,
            btnPortIn: this.btn,
            customerContactAddress: this.clientInfo?.contactInfo?.email,
            firstName: this.clientInfo?.contactInfo?.firstName,
            lastName: this.clientInfo?.contactInfo?.lastName,
            address: this.clientInfo?.address?.addressLine1,
            apt: this.clientInfo?.address?.addressLine2,
            city: this.clientInfo?.address?.city,
            state: this.clientInfo?.address?.state,
            zip: this.clientInfo?.address?.zipCode,
            preferredContactNumber: this.clientInfo?.contactInfo?.phone
        };
        savePayloadToOpportunity({ oppId: this.recordId, myData: myData })
            .then((response) => {})
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The form could not be populated, manual input is required"
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });

        this.loaderSpinner = false;
    }

    handleCSAFormRedirect() {
        this[NavigationMixin.GenerateUrl]({
            type: "comm__namedPage",
            attributes: {
                name: "CSA_Form__c"
            },
            state: {
                recordId: this.recordId
            }
        }).then((url) => {
            window.open(url, "_blank");
        });
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "CSA",
            component: "poe_lwcBuyflowFrontierCSATab",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }

    handleLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "CSA"
        };
        this.dispatchEvent(event);
    }

    handleNext() {
        const nextTabEvent = new CustomEvent("next", {});
        this.dispatchEvent(nextTabEvent);
    }
}