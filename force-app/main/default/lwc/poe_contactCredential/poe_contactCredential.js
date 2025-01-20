import { LightningElement, api, wire, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord, createRecord } from "lightning/uiRecordApi";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import EXTERNAL_CONTACT_CREDENTIAL_OBJECT from "@salesforce/schema/POE_External_Contact_Credential__c";
import ID_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.Id";
import PROCESS_STATUS_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Process_Status__c";
import USERNAME_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Username__c";
import CODE_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Code__c";
import PROGRAM_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Program__c";
import CONTACT_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Contact__c";
import N_NUMBER_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_N_Number__c";
import ACTIVATION_DATE_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.Activation_Date__c";
import VERIZON_MARKET_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.Verizon_Market__c";
import SAVE_SUCCESS_MESSAGE from "@salesforce/label/c.POE_Contact_Credentials_Save_Success";
import SAVE_ERROR_MESSAGE from "@salesforce/label/c.POE_Contact_Credentials_Save_Error";

const LABELS_BY_PROGRAM = {
    directv: {
        usernameLabel: "Partner Id",
        codeLabel: "Dealer Code",
        activationDate: "Activation Date"
    },
    spectrum: {
        usernameLabel: "Username",
        codeLabel: "Dealer ID",
        activationDate: "Activation Date"
    },
    xfinity: {
        usernameLabel: "Username",
        codeLabel: "Partner ID",
        activationDate: "Activation Date"
    }
};

export default class Poe_contactCredential extends LightningElement {
    @api credentialInformation;
    @track formCredentialInformation = {};
    processStatusOptions = [];
    isLoading = false;
    disableSave = true;

    get labelsByProgram() {
        const program = this.formCredentialInformation.program?.toLowerCase();
        return LABELS_BY_PROGRAM[program] || {
            usernameLabel: "Username",
            codeLabel: "Code",
            activationDate: "Activation Date"
        };
    }

    get programLabel() {
        return (
            this.formCredentialInformation.isCommercial &&
            this.formCredentialInformation.program !== "Windstream D2D" &&
            this.formCredentialInformation.program !== "Verizon Residential"
        )
            ? `${this.formCredentialInformation.program} Commercial`
            : this.formCredentialInformation.program;
    }

    get showCodeField() {
        return !!LABELS_BY_PROGRAM[this.formCredentialInformation.program?.toLowerCase()];
    }

    get showTrainingSentDateField() {
        return this.formCredentialInformation.program?.toLowerCase() === "xfinity";
    }

    get showUserNameField() {
        return this.formCredentialInformation.program !== "Windstream D2D";
    }

    @wire(getObjectInfo, { objectApiName: EXTERNAL_CONTACT_CREDENTIAL_OBJECT })
    externalContactCredentialObjInfo;

    @wire(getPicklistValues, {
        recordTypeId: "$externalContactCredentialObjInfo.data.defaultRecordTypeId",
        fieldApiName: PROCESS_STATUS_FIELD
    })
    getProcessStatusOptions({ data, error }) {
        if (data) {
            this.processStatusOptions = data.values;
        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback() {
        if (this.credentialInformation) {
            this.formCredentialInformation = { ...this.credentialInformation };
        }
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
            [PROGRAM_FIELD.fieldApiName]: this.formCredentialInformation.program,
            [N_NUMBER_FIELD.fieldApiName]: this.formCredentialInformation.nNumber,
            [ACTIVATION_DATE_FIELD.fieldApiName]: this.formCredentialInformation.activationDate
        };

        if (this.formCredentialInformation.program?.toLowerCase() === "xfinity") {
            fields.trainingSentDate = this.formCredentialInformation.trainingSentDate;
        }

        let apiName = null;
        let upsertRecord = updateRecord;
        if (this.formCredentialInformation.id) {
            fields[ID_FIELD.fieldApiName] = this.formCredentialInformation.id;
        } else {
            fields[CONTACT_FIELD.fieldApiName] = this.formCredentialInformation.contactId;
            apiName = EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName;
            upsertRecord = createRecord;
        }

        upsertRecord({ fields, apiName })
            .then((result) => {
                this.formCredentialInformation.id = result.id;
                this.disableSave = true;
                this.showToast("success", "Success", SAVE_SUCCESS_MESSAGE);
            })
            .catch((error) => {
                console.error(error);
                this.showToast("error", "Error", SAVE_ERROR_MESSAGE);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    showToast(variant, title, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                mode: "sticky",
                title,
                variant,
                message
            })
        );
    }
}
