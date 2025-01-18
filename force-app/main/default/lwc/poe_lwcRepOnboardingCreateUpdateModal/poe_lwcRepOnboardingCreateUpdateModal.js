import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import saveRepresentative from "@salesforce/apex/RepOnBoardingController.saveRepresentative";

const FIELDS = [
    "POE_Programs_Available__c",
    "FirstName",
    "Birthdate",
    "MiddleName",
    "POE_Start_Date__c",
    "LastName",
    "MailingStreet",
    "MailingState",
    "MobilePhone",
    "Email",
    "MailingPostalCode",
    "POE_Functional_Role__c",
    "AccountId",
    "POE_RO_Status__c",
    "POE_Representative_Type__c",
    "POE_Event_Programs__c",
    "POE_Retail_Programs__c",
    "D2D_Programs__c",
    "Account.POE_Programs_available__c",
    "POE_Blacklisted_Programs__c",
    "POE_Call_Center_Type__c",
    "POE_County__c"
];

export default class Poe_lwcRepOnboardingCreateUpdateModal extends LightningElement {
    @api accountId;
    contact;
    contactData;
    incompleteInfo = true;
    loaderSpinner = false;
    filters;
    fields;
    showInputLookup = true;

    get confirmButtonLabel() {
        return this.showInputLookup ? "Update" : "Create";
    }

    connectedCallback() {
        this.filters = `AccountId = '${this.accountId}' AND POE_Blacklist__c = false`;
        this.fields = FIELDS.join(",");
    }

    handleLookup(event) {
        this.contact = event.detail.selectedRecord;
    }

    handleToggle(event) {
        this.showInputLookup = event.target.checked;
        this.contact = undefined;
    }

    saveRepresentative() {
        this.loaderSpinner = true;
        let data = this.contactData;
        let types = data.selectedTypes.join(";");
        let myData = {
            contactId: data.contactId,
            accountId: data.accountId,
            phoneSalesOptions: data.selectedOptions.join(";"),
            eventOptions: data.selectedEventOptions.join(";"),
            retailOptions: data.selectedRetailOptions.join(";"),
            d2dOptions: data.selectedD2DOptions.join(";"),
            userData: {
                FirstNameCreate: data.firstName,
                BirthdateCreate: data.birthDate,
                MiddleNameCreate: data.middleName,
                Start_Date__cCreate: data.POE_Start_Date__c,
                LastNameCreate: data.lastName,
                MailingStreet: data.offshore ? data.address : data.mailingStreet,
                SsnCreate: data.ssn,
                MailingStateCreate: data.mailingState,
                County: data.mailingCounty,
                MailingCountryCreate: "United States",
                ConfirmEmailCreate: data.email,
                MobilePhoneCreate: data.mobilePhone,
                MailingZipcodeCreate: data.mailingPostalCode,
                FunctionalRole: data.POE_Functional_Role__c,
                POE_RO_Status__c: data.POE_RO_Status__c,
                RepresentativeType: types,
                CallCenterType: data.offshore ? "Offshore" : "On-site"
            },
            documentId: data.documentId
        };

        console.log("save representative request", myData);
        saveRepresentative({ myData: myData })
            .then((response) => {
                console.log("save representative response", response);
                this.loaderSpinner = false;
                const sendTrackerEvent = new CustomEvent("update", {});
                this.dispatchEvent(sendTrackerEvent);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                let errorMsg = error.body?.message || error.message;
                if (errorMsg.includes("blacklisted program available")) {
                    errorMsg = "You can't select a blacklisted program available.";
                }
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

    handleValidation(event) {
        this.incompleteInfo = event.detail.incompleteInfo;
        if (!this.incompleteInfo) {
            this.contactData = event.detail.contactData;
        }
    }

    handleClose() {
        const closeEvent = new CustomEvent("close", {});
        this.dispatchEvent(closeEvent);
    }

    logError(errorMessage) {
        const error = {
            type: "Internal Error",
            tab: "Agent Onboarding",
            component: "poe_lwcRepOnboardingCreateUpdateModal",
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
            tab: "Agent Onboarding"
        };
        this.logError(event);
    }
}