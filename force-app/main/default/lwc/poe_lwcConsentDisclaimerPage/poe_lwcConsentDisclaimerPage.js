import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import CONSENT_DISCLAIMER from "@salesforce/label/c.Security_Leads_Consent_Text";
import CONSENT_TITLE from "@salesforce/label/c.Security_Leads_Consent_Title";
import CONSENT_INPUT_1 from "@salesforce/label/c.Security_Leads_Consent_Input_1";
import CONSENT_INPUT_2 from "@salesforce/label/c.Security_Leads_Consent_Input_2";
import CONSENT_BUTTON from "@salesforce/label/c.Security_Leads_Consent_Button_Label";
import DUPLICATE_ERROR from "@salesforce/label/c.Security_Leads_Duplicate_Error";
import SECURITY_VALUE from "@salesforce/label/c.Security_Leads_Security_Value";
import TYPE_VALUE from "@salesforce/label/c.Security_Leads_Security_Type_Value";
import getLeadInformation from "@salesforce/apex/ConsentDisclaimerPageController.getLeadData";
import createChuzoLead from "@salesforce/apex/POE_ScheduleCallController.createChuzoLead";
import getIPStackSettings from "@salesforce/apex/InfoTabController.getIPStackSettings";
import CALL_SCHEDULED_TITLE from "@salesforce/label/c.Self_Service_Schedule_Call_Success_Title";
import CALL_SCHEDULED_MESSAGE from "@salesforce/label/c.Self_Service_Schedule_Call_Success_Message";
import SCHEDULE_ERROR_TITLE from "@salesforce/label/c.Toast_Generic_Error_Title";
import SCHEDULE_ERROR_MESSAGE from "@salesforce/label/c.Self_Service_Schedule_Call_Error_Message";

export default class Poe_lwcConsentDisclaimerPage extends LightningElement {
    labels = {
        disclaimer: CONSENT_DISCLAIMER,
        title: CONSENT_TITLE,
        input1: CONSENT_INPUT_1,
        input2: CONSENT_INPUT_2,
        button: CONSENT_BUTTON,
        apiValue: SECURITY_VALUE,
        typeValue: TYPE_VALUE,
        successMessage: `${CALL_SCHEDULED_TITLE} ${CALL_SCHEDULED_MESSAGE}`
    };
    agree = false;
    time;
    disableButton = true;
    optionsTimeToContact = [];
    showConsent = true;
    loaderSpinner = false;
    recordId;
    securityLeadCallout = {};
    leadSent = false;

    connectedCallback() {
        this.handleContactTime();
        let parameters = this.getQueryParameters();
        this.recordId = parameters.recordId;
        this.getLeadInformation();
        this.disableValidation();
    }

    getQueryParameters() {
        var params = {};
        var search = location.search.substring(1);
        if (search) {
            params = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', (key, value) => {
                return key === "" ? value : decodeURIComponent(value);
            });
        }
        return params;
    }

    getLeadInformation() {
        this.loaderSpinner = true;
        getLeadInformation({ recordId: this.recordId })
            .then((response) => {
                console.log("Lead Information Result", response);
                if (response.hasPrevious) {
                    this.showDuplicateToast();
                } else {
                    this.securityLeadCallout = {
                        referralCodeId: "",
                        firstName: response.firstName,
                        lastName: response.lastName,
                        phone: response.phone,
                        email: response.email,
                        preferredContactMethod: this.contactMethod !== undefined ? this.contactMethod : "",
                        preferredContactTime: this.time,
                        leadSource: "Chuzo",
                        type: this.labels.typeValue,
                        programs: [this.labels.apiValue],
                        owner: response.owner
                    };
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "Lead Information could not be retrieved. Please try again."
                });
                this.dispatchEvent(event);
            });
    }

    handleContactTime() {
        this.optionsTimeToContact = [];
        for (let i = 8; i <= 18; i++) {
            let value;
            const minutePartStart = i === 8 ? "30" : "00";
            const minutePartEnd = i === 18 ? "30" : "00";
            if (i < 12) {
                value = `${i}:${minutePartStart} am to ${i + 1}:${minutePartEnd} ${i === 11 ? "pm" : "am"}`;
            } else if (i == 12) {
                value = `12:00 pm to 1:00 pm`;
            } else {
                let pmValue = i - 12;
                const endPmValue = i === 18 ? pmValue : pmValue + 1;
                value = `${pmValue}:${minutePartStart} pm to ${endPmValue}:${minutePartEnd} pm`;
            }
            this.optionsTimeToContact.push({
                label: value,
                value
            });
        }
        this.time = this.optionsTimeToContact[0].value;
    }

    showDuplicateToast() {
        this.showConsent = false;
        const event = new ShowToastEvent({
            title: "Consent already granted",
            variant: "error",
            mode: "sticky",
            message: DUPLICATE_ERROR
        });
        this.dispatchEvent(event);
    }

    handleCheckbox(event) {
        this.agree = event.target.checked;
        this.disableValidation();
    }

    disableValidation() {
        this.disableButton = !this.agree || this.time === undefined;
    }

    handleRadio(event) {
        this.time = event.target.value;
        this.disableValidation();
    }

    handleClick() {
        this.loaderSpinner = true;
        getIPStackSettings()
            .then((response) => {
                const Http = new XMLHttpRequest();
                let url = response.result.URL__c ? response.result.URL__c : "https://api.ipstack.com/";

                url = url + "/check?access_key=" + response.result.Password__c;
                Http.open("GET", url);
                Http.send();
                Http.onreadystatechange = (e) => {
                    if (!(Http.readyState == 4 && Http.status == 200)) {
                        this.loaderSpinner = false;
                        return;
                    }
                    let data = JSON.parse(Http.responseText);
                    this.securityLeadCallout.latitude = data.latitude;
                    this.securityLeadCallout.longitude = data.longitude;
                    this.securityLeadCallout.ip = data.ip;
                    this.handleCreateLead();
                };
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
            });
    }

    handleCreateLead() {
        this.loaderSpinner = true;
        const leadToCreate = {
            ...this.securityLeadCallout
        };
        createChuzoLead({ leadToCreate })
            .then(() => {
                this.leadSent = true;
            })
            .catch((error) => {
                console.error("ERROR", error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: SCHEDULE_ERROR_TITLE,
                        variant: "error",
                        message: SCHEDULE_ERROR_MESSAGE
                    })
                );
            })
            .finally(() => {
                this.loaderSpinner = false;
            });
    }
}