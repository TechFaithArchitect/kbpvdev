import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord, createRecord } from "lightning/uiRecordApi";
import getProgramMetadata from "@salesforce/apex/POEContactCredentialController.getProgramMetadata";


export default class PoeContactCredential extends LightningElement {
    @api credentialInformation;
    @track formCredentialInformation = {};
    @track labels = {};
    @track processStatusOptions = [];
    @track isLoading = false;
    @track disableSave = true;

    connectedCallback() {
        if (this.credentialInformation) {
            this.formCredentialInformation = { ...this.credentialInformation };
            this.fetchProgramMetadata();
        }
    }

    fetchProgramMetadata() {
        const program = this.formCredentialInformation.program?.toLowerCase();
        if (!program) return;

        this.isLoading = true;

        getProgramMetadata({ program })
            .then((result) => {
                this.labels = result.labels || {};
                this.processStatusOptions = result.processStatusOptions || [];
            })
            .catch((error) => {
                console.error("Error fetching program metadata: ", error);
                this.showToast("error", "Error", "Failed to fetch program metadata.");
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleFieldChange(event) {
        this.disableSave = false;
        const fieldName = event.currentTarget.name;
        const value = event.detail.value;
        this.formCredentialInformation[fieldName] = value;
    }

    handleSave() {
        if (this.disableSave) return;

        this.isLoading = true;
        const fields = {
            [USERNAME_FIELD.fieldApiName]: this.formCredentialInformation.username,
            [PROCESS_STATUS_FIELD.fieldApiName]: this.formCredentialInformation.processStatus,
            [CODE_FIELD.fieldApiName]: this.formCredentialInformation.code,
            [ACTIVATION_DATE_FIELD.fieldApiName]: this.formCredentialInformation.activationDate
        };

        if (this.formCredentialInformation.id) {
            fields[ID_FIELD.fieldApiName] = this.formCredentialInformation.id;
        } else {
            fields["ContactId"] = this.formCredentialInformation.contactId;
        }

        const recordInput = { fields };
        const upsert = this.formCredentialInformation.id ? updateRecord : createRecord;

        upsert(recordInput)
            .then(() => {
                this.disableSave = true;
                this.showToast("success", "Success", "Record saved successfully.");
            })
            .catch((error) => {
                console.error("Error saving record: ", error);
                this.showToast("error", "Error", "Failed to save record.");
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    showToast(variant, title, message) {
        this.dispatchEvent(new ShowToastEvent({ variant, title, message }));
    }
}
