import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { getRelatedListRecords } from "lightning/uiRelatedListApi";

// Import required fields and objects
import EXTERNAL_CONTACT_CREDENTIAL_OBJECT from "@salesforce/schema/POE_External_Contact_Credential__c";
import PROCESS_STATUS_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Process_Status__c";
import USERNAME_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Username__c";
import CODE_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Code__c";
import PROGRAM_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Program__c";
import N_NUMBER_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_N_Number__c";
import ACTIVATION_DATE_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.Activation_Date__c";
import VERIZON_MARKET_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.Verizon_Market__c";

import CONTACT_OBJECT from "@salesforce/schema/Contact";
import COMMERCIAL_PROGRAMS_FIELD from "@salesforce/schema/Contact.POE_Commercial_Programs__c";

const EXTERNAL_CONTACT_CREDENTIAL_FIELDS = [
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${PROCESS_STATUS_FIELD.fieldApiName}`,
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${USERNAME_FIELD.fieldApiName}`,
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${CODE_FIELD.fieldApiName}`,
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${PROGRAM_FIELD.fieldApiName}`,
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${N_NUMBER_FIELD.fieldApiName}`,
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${ACTIVATION_DATE_FIELD.fieldApiName}`,
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${VERIZON_MARKET_FIELD.fieldApiName}`
];

export default class Poe_lwcDynamicUIDFields extends LightningElement {
    @api recordId;
    @api objectApiName;
    programsWithCredentials = [];
    noPrograms = false;

    // Combobox options for Xfinity Status
    get xfinityStatusOptions() {
        return [
            { label: "Cancelled", value: "Cancelled" },
            { label: "In progress", value: "In progress" },
            { label: "New", value: "New" },
            { label: "Complete", value: "Complete" },
            { label: "Training Sent", value: "Training Sent" }
        ];
    }

    @wire(getRecord, {
        recordId: "$recordId",
        fields: [`${CONTACT_OBJECT.objectApiName}.${COMMERCIAL_PROGRAMS_FIELD.fieldApiName}`]
    })
    getContactRecord({ error, data }) {
        if (data) {
            const commercialPrograms = getFieldValue(
                data,
                COMMERCIAL_PROGRAMS_FIELD
            )?.split(";") || [];
            this.handlePrograms(commercialPrograms);
        } else if (error) {
            console.error(error);
        }
    }

    @wire(getRelatedListRecords, {
        parentRecordId: "$recordId",
        relatedListId: "External_Contact_Credentials__r",
        fields: EXTERNAL_CONTACT_CREDENTIAL_FIELDS
    })
    getExternalContactCredentials({ error, data }) {
        if (data) {
            const credentials = data.records || [];
            this.handleProgramCredentials(credentials);
        } else if (error) {
            console.error(error);
        }
    }

    handlePrograms(commercialPrograms) {
        this.noPrograms = commercialPrograms.length === 0;
    }

    handleProgramCredentials(credentials) {
        this.programsWithCredentials = credentials.map((record) => {
            const programName = getFieldValue(record, PROGRAM_FIELD);
            return {
                id: record.id,
                program: programName,
                processStatus: getFieldValue(record, PROCESS_STATUS_FIELD),
                partnerId: getFieldValue(record, USERNAME_FIELD), // Reusing USERNAME_FIELD for Partner ID
                trainingSentDate: getFieldValue(record, ACTIVATION_DATE_FIELD), // Placeholder field
                activationDate: getFieldValue(record, ACTIVATION_DATE_FIELD),
                key: record.id
            };
        });
    }

    handleFieldChange(event) {
        const fieldName = event.target.name;
        const programId = event.target.dataset.id; // Assuming `data-id` for program record ID
        const program = this.programsWithCredentials.find(
            (item) => item.id === programId
        );

        if (program) {
            program[fieldName] = event.target.value;
        }
    }

    handleEmail() {
        console.log("Email action triggered!");
    }
}
