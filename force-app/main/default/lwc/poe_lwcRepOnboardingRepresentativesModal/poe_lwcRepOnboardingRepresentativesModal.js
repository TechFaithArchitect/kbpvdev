import { LightningElement, api, track, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import saveRepresentative from "@salesforce/apex/RepOnBoardingController.saveRepresentative";

const FIELDS = [
    "Contact.Id",
    "Contact.POE_Programs_Available__c",
    "Contact.FirstName",
    "Contact.Birthdate",
    "Contact.MiddleName",
    "Contact.POE_Start_Date__c",
    "Contact.LastName",
    "Contact.MailingStreet",
    "Contact.MailingState",
    "Contact.MobilePhone",
    "Contact.Email",
    "Contact.MailingPostalCode",
    "Contact.POE_Functional_Role__c",
    "Contact.AccountId",
    "Contact.POE_RO_Status__c",
    "Contact.POE_Representative_Type__c",
    "Contact.POE_Event_Programs__c",
    "Contact.POE_Retail_Programs__c",
    "Contact.D2D_Programs__c",
    "Contact.Account.POE_Programs_available__c",
    "Contact.POE_Call_Center_Type__c",
    "Contact.POE_County__c"
];

export default class Poe_lwcRepOnboardingRepresentativesModal extends LightningElement {
    @api contact;
    @api recordId;
    contactData;
    incompleteInfo = true;
    loaderSpinner = false;

    @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
    getProgramsAvailable({ error, data }) {
        this.loaderSpinner = true;
        if (data) {
            console.log(data);
            let contactData = {};
            Object.keys(data.fields).forEach((element) => {
                contactData[element] = data.fields[element].value;
            });
            this.contact = { ...contactData };
            this.loaderSpinner = false;
        } else if (error) {
            this.loaderSpinner = false;
            console.log(error);
        }
    }

    handleValidation(event) {
        this.incompleteInfo = event.detail.incompleteInfo;
        if (!this.incompleteInfo) {
            this.contactData = event.detail.contactData;
        }
    }

    hideModalBox() {
        const closeModal = new CustomEvent("close", {});
        this.dispatchEvent(closeModal);
    }

    handleOpenPDF() {
        window.open(chuzoFunctionalRolesURL, "_blank");
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
            }
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

    logError(errorMessage) {
        const error = {
            type: "Internal Error",
            tab: "Agent Onboarding",
            component: "poe_lwcRepOnboardingRepresentativesModal",
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