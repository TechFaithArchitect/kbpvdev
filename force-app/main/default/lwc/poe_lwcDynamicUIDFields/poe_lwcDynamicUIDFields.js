import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { getRelatedListRecords } from "lightning/uiRelatedListApi";

import EXTERNAL_CONTACT_CREDENTIAL_OBJECT from "@salesforce/schema/POE_External_Contact_Credential__c";
import PROCESS_STATUS_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Process_Status__c";
import USERNAME_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Username__c";
import CODE_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Code__c";
import PROGRAM_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_Program__c";
import N_NUMBER_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.POE_N_Number__c";
import ACTIVATION_DATE_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.Activation_Date__c";
import VERIZON_MARKET_FIELD from "@salesforce/schema/POE_External_Contact_Credential__c.Verizon_Market__c";

import CONTACT_OBJECT from "@salesforce/schema/Contact";
import EVENT_PROGRAMS_FIELD from "@salesforce/schema/Contact.POE_Event_Programs__c";
import RETAIL_PROGRAMS_FIELD from "@salesforce/schema/Contact.POE_Retail_Programs__c";
import D2D_PROGRAMS_FIELD from "@salesforce/schema/Contact.D2D_Programs__c";
import PROGRAMS_AVAILABLE_FIELD from "@salesforce/schema/Contact.POE_Programs_Available__c";
import COMMERCIAL_PROGRAMS_FIELD from "@salesforce/schema/Contact.POE_Commercial_Programs__c";

import CASE_OBJECT from "@salesforce/schema/Case";
import CONTACT_ID_FIELD from "@salesforce/schema/Case.ContactId";

const EXTERNAL_CONTACT_CREDENTIAL_FIELDS = [
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${PROCESS_STATUS_FIELD.fieldApiName}`,
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${USERNAME_FIELD.fieldApiName}`,
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${CODE_FIELD.fieldApiName}`,
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${PROGRAM_FIELD.fieldApiName}`,
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${N_NUMBER_FIELD.fieldApiName}`,
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${ACTIVATION_DATE_FIELD.fieldApiName}`,
    `${EXTERNAL_CONTACT_CREDENTIAL_OBJECT.objectApiName}.${VERIZON_MARKET_FIELD.fieldApiName}`
];

const CONTACT_FIELDS = [
    `${CONTACT_OBJECT.objectApiName}.${EVENT_PROGRAMS_FIELD.fieldApiName}`,
    `${CONTACT_OBJECT.objectApiName}.${RETAIL_PROGRAMS_FIELD.fieldApiName}`,
    `${CONTACT_OBJECT.objectApiName}.${D2D_PROGRAMS_FIELD.fieldApiName}`,
    `${CONTACT_OBJECT.objectApiName}.${PROGRAMS_AVAILABLE_FIELD.fieldApiName}`,
    `${CONTACT_OBJECT.objectApiName}.${COMMERCIAL_PROGRAMS_FIELD.fieldApiName}`
];

const CASE_FIELDS = [`${CASE_OBJECT.objectApiName}.${CONTACT_ID_FIELD.fieldApiName}`];

const EXTERNAL_CONTACT_CREDENTIALS_RELATIONSHIP = "External_Contact_Credentials__r";

export default class Poe_lwcDynamicUIDFields extends LightningElement {
    @api recordId;
    @api objectApiName;
    contactId;
    chuzoPrograms = new Set();
    commercialPrograms = [];
    programsWithCredentials = [];
    showModal = false;
    credentialData;

    // Options for Xfinity Status picklist
    get xfinityStatusOptions() {
        return [
            { label: "Cancelled", value: "Cancelled" },
            { label: "In progress", value: "In progress" },
            { label: "New", value: "New" },
            { label: "Complete", value: "Complete" },
            { label: "Training Sent", value: "Training Sent" }
        ];
    }

    get noPrograms() {
        return this.chuzoPrograms.size === 0 && this.commercialPrograms.length === 0;
    }

    @wire(getRecord, { recordId: "$recordId", fields: CASE_FIELDS })
    getCaseRecord({ error, data }) {
        if (error) {
            console.error(error);
        } else if (data) {
            this.contactId = getFieldValue(data, CONTACT_ID_FIELD);
        }
    }

    connectedCallback() {
        if (this.objectApiName === "Contact") {
            this.contactId = this.recordId;
        }
    }

    @wire(getRecord, { recordId: "$contactId", fields: CONTACT_FIELDS })
    getContactRecord({ error, data }) {
        if (error) {
            console.error(error);
        } else if (data) {
            this.chuzoPrograms = new Set();

            let allChuzoPrograms = getFieldValue(data, EVENT_PROGRAMS_FIELD) || "";
            allChuzoPrograms += ";" + (getFieldValue(data, RETAIL_PROGRAMS_FIELD) || "");
            allChuzoPrograms += ";" + (getFieldValue(data, D2D_PROGRAMS_FIELD) || "");
            allChuzoPrograms += ";" + (getFieldValue(data, PROGRAMS_AVAILABLE_FIELD) || "");
            allChuzoPrograms.split(";").forEach((value) => {
                if (value.toLowerCase() === "directv") {
                    this.chuzoPrograms.add(value);
                }
            });

            this.commercialPrograms =
                getFieldValue(data, COMMERCIAL_PROGRAMS_FIELD)?.split(";") || [];
            if (this.credentialData) this.handleProgramCredentials();
        }
    }

    @wire(getRelatedListRecords, {
        parentRecordId: "$contactId",
        relatedListId: EXTERNAL_CONTACT_CREDENTIALS_RELATIONSHIP,
        fields: EXTERNAL_CONTACT_CREDENTIAL_FIELDS
    })
    getExternalContactCredentials({ data, error }) {
        if (data) {
            this.credentialData = data;
            if (!this.noPrograms) this.handleProgramCredentials();
        } else if (error) {
            console.error(error);
        }
    }

    handleEmail() {
        this.showModal = true;
    }

    handleCloseModal() {
        this.showModal = false;
    }

    handleProgramCredentials() {
        this.programsWithCredentials = [];

        const recordsByProgram = new Map();
        this.credentialData.records?.forEach((record) => {
            recordsByProgram.set(getFieldValue(record, PROGRAM_FIELD)?.toLowerCase(), record);
        });

        const allSortedPrograms = [...this.commercialPrograms, ...this.chuzoPrograms].sort();
        const processedPrograms = new Set();

        allSortedPrograms.forEach((program) => {
            if (processedPrograms.has(program)) return;
            processedPrograms.add(program);

            const isCommercial = this.commercialPrograms.includes(program);
            const record = recordsByProgram.get(program.toLowerCase());
            const isXfinity = program.toLowerCase() === "xfinity";

            if (!record) {
                return this.programsWithCredentials.push({
                    id: "",
                    username: "",
                    processStatus: "",
                    code: "",
                    program,
                    activationDate: "",
                    verizonMarket: "",
                    contactId: this.contactId,
                    isCommercial,
                    isXfinity,
                    key: program
                });
            }

            this.programsWithCredentials.push({
                id: record.id,
                username: getFieldValue(record, USERNAME_FIELD),
                processStatus: getFieldValue(record, PROCESS_STATUS_FIELD),
                code: getFieldValue(record, CODE_FIELD),
                program: getFieldValue(record, PROGRAM_FIELD),
                nNumber: getFieldValue(record, N_NUMBER_FIELD),
                activationDate: getFieldValue(record, ACTIVATION_DATE_FIELD),
                verizonMarket: getFieldValue(record, VERIZON_MARKET_FIELD),
                contactId: this.contactId,
                isCommercial,
                isXfinity,
                key: record.id
            });
        });
    }

    handleFieldChange(event) {
        const fieldName = event.target.name;
        const programId = event.target.dataset.id; // Assuming `data-id` for program record ID
        const program = this.programsWithCredentials.find((item) => item.id === programId);

        if (program) {
            program[fieldName] = event.target.value;
        }
    }
}
