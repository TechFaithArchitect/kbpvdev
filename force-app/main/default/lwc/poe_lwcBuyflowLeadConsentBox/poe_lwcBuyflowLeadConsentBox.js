import { LightningElement, api } from "lwc";
import PAGE_TITLE from "@salesforce/label/c.Security_Leads_Title";
import CHECKBOX_DISCLAIMER from "@salesforce/label/c.Security_Leads_Checkbox_Disclaimer";
import SMS_VERBIAGE from "@salesforce/label/c.Security_Leads_SMS_Disclaimer";
import ALREADY_SENT_VERBIAGE from "@salesforce/label/c.Security_Leads_Already_Sent_Error";
import VERBIAGE_URL from "@salesforce/label/c.Security_Leads_Disclaimer_URL";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import chuzo_modalConsentContactMethod from "c/chuzo_modalConsentContactMethod";
import sendSMS from "@salesforce/apex/CreditCheckTabController.sendPCISMS";
import sendEmail from "@salesforce/apex/CreditCheckTabController.sendLeadConsentEmail";
import getHomeConciergeEnabled from "@salesforce/apex/BuyFlowLeadConsentBoxController.isHomeConciergeEnabled";


export default class Poe_lwcBuyflowLeadConsentBox extends LightningElement {
    @api phone;
    @api recordId;
    @api email;
    sent = {
        email: false,
        sms: false
    };
    agree = false;
    labels = {
        title: PAGE_TITLE,
        disclaimer: CHECKBOX_DISCLAIMER,
        smsVerbiage: SMS_VERBIAGE,
        disclaimerURL: VERBIAGE_URL
    };
    contactOptions = [
        {
            label: "SMS",
            value: "sms"
        },
        {
            label: "Email",
            value: "email"
        }
    ];
    loaderSpinner = false;
    isHomeConciergeEnabled = false;

    connectedCallback() {
        getHomeConciergeEnabled({ opportunityId: this.recordId })
            .then((response) => {
                this.isHomeConciergeEnabled = response;
            })
            .catch((error) => {
                console.log(error);
            });
    }

    handleCheckbox(e) {
        this.agree = e.target.checked;
        if (e.target.checked) {
            chuzo_modalConsentContactMethod
                .open({
                    content: {
                        label: "Preferred Communication Method",
                        title: "Preferred Communication Method",
                        subtitle:
                            "Please select customer's preferred communication method to receive the Security Leads Confirmation URL.",
                        options: this.contactOptions
                    }
                })
                .then((result) => {
                    if (this.contactOptions.some((e) => e.value === result)) {
                        this.handleSend(result);
                    }
                });
        }
    }

    handleSend(result) {
        if (result === "sms") {
            if (this.sent.sms) {
                this.showAlreadySentToast();
            } else {
                this.handleTwilioCallout();
            }
        } else {
            if (this.sent.email) {
                this.showAlreadySentToast();
            } else {
                this.handleEmail();
            }
        }
    }

    showAlreadySentToast() {
        const event = new ShowToastEvent({
            title: "Disclaimers already sent",
            variant: "error",
            mode: "sticky",
            message: ALREADY_SENT_VERBIAGE
        });
        this.dispatchEvent(event);
    }

    handleTwilioCallout() {
        this.loaderSpinner = true;
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody = this.labels.smsVerbiage + index[0] + this.labels.disclaimerURL + this.recordId;
        let myData = {
            clientPhone: "1" + this.phone,
            body: mailBody,
            opportunityId: this.recordId
        };
        sendSMS({ myData: myData })
            .then((response) => {
                let result = response.result;
                this.loaderSpinner = false;
                let tit = result.error === "OK" ? "Success" : "Error";
                let varnt = result.error === "OK" ? "success" : "error";
                let mess =
                    result.error === "OK"
                        ? "The SMS was sent correctly with a link to enter the information."
                        : "The SMS could not be sent. Please, verify the telephone number and try again.";
                const event = new ShowToastEvent({
                    title: tit,
                    variant: varnt,
                    message: mess
                });
                this.dispatchEvent(event);
                if (result.error === "OK") {
                    this.sent.sms = true;
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The SMS could not be sent. Please, verify the telephone number and try again."
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    handleEmail() {
        this.loaderSpinner = true;
        let url = window.location.href;
        let index = url.split("/s/");
        this.loaderSpinner = true;
        let mailBody = index[0] + this.labels.disclaimerURL + this.recordId;
        let myData = {
            pciEmail: this.email,
            body: mailBody
        };
        sendEmail({ myData: myData })
            .then((response) => {
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    message: "The email was sent correctly with a link to enter the information."
                });
                this.dispatchEvent(event);
                this.sent.email = true;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The email could not be sent. Please, verify the email address and try again."
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }
}