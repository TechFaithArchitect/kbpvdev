import { api } from "lwc";
import LightningModal from "lightning/modal";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import createChuzoLead from "@salesforce/apex/POE_ScheduleCallController.createChuzoLead";
import logError from "@salesforce/apex/ErrorLogModel.logError";
import CONSENT_DISCLAIMER from "@salesforce/label/c.Self_Service_Consent_Text";
import CALL_SCHEDULED_TITLE from "@salesforce/label/c.Self_Service_Schedule_Call_Success_Title";
import CALL_SCHEDULED_MESSAGE from "@salesforce/label/c.Self_Service_Schedule_Call_Success_Message";
import SCHEDULE_ERROR_TITLE from "@salesforce/label/c.Toast_Generic_Error_Title";
import SCHEDULE_ERROR_MESSAGE from "@salesforce/label/c.Self_Service_Schedule_Call_Error_Message";

export default class modalScheduleCall extends LightningModal {
    @api referralCodeData;

    name;
    lastName;
    phone;
    contactEmail;
    time;
    checkboxOptions = [
        { id: "DIRECTV", label: "DIRECTV", checked: false },
        { id: "Spectrum", label: "Spectrum", checked: false },
        { id: "Optimum", label: "Optimum", checked: false },
        { id: "Frontier", label: "Frontier", checked: false },
        { id: "Kinetic by Windstream", label: "Kinetic by Windstream", checked: false },
        { id: "Earthlink", label: "EarthLink", checked: false },
        { id: "Home Security", label: "PerfectHome Solutions", checked: false }
    ];
    consentAgreement = false;
    consentLabel = CONSENT_DISCLAIMER;
    enableNext = false;
    optionsTimeToContact = [];
    isLoading = false;

    get iconInbox() {
        return chuzoSiteResources + "/images/icon-inbox.svg";
    }

    handleSubmit() {
        if (!this.enableNext) {
            return;
        }
        this.isLoading = true;
        const leadToCreate = {
            referralCodeId: this.referralCodeData?.referralCodeId,
            firstName: this.name,
            lastName: this.lastName,
            phone: this.phone,
            email: this.contactEmail,
            preferredContactMethod: "",
            preferredContactTime: this.time,
            leadSource: "Self Service",
            type: "Other",
            programs: this.checkboxOptions.filter((opt) => opt.checked).map((opt) => opt.id),
            ip: "",
            latitude: 0,
            longitude: 0,
            owner: ""
        };

        createChuzoLead({ leadToCreate })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: CALL_SCHEDULED_TITLE,
                        variant: "success",
                        message: CALL_SCHEDULED_MESSAGE
                    })
                );
                this.close("submit");
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

                this.handleLogError({
                    type: "Internal Error",
                    component: "modalScheduleCall",
                    error: error.body?.message || error.message,
                    request: JSON.stringify(leadToCreate)
                });
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    connectedCallback() {
        const toastContainer = ToastContainer.instance();
        toastContainer.maxShown = 5;
        toastContainer.toastPosition = "top-center";

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
    }

    handleInput(event) {
        this[event.target.name] = event.target.value !== undefined ? event.target.value : undefined;
        this.handleButton();
    }

    handleRadio(event) {
        this.time = event.target.value;
    }

    handleCheckbox(event) {
        let checkboxOptions = [...this.checkboxOptions];
        checkboxOptions.forEach((item) => {
            if (item.id === event.target.dataset.id) {
                item.checked = event.target.checked;
            }
        });
        this.checkboxOptions = [...checkboxOptions];
        this.handleButton();
    }

    handleButton() {
        const button = this.template.querySelector('[data-id="next"]');
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        let phonere = /^\d{10}$/;
        this.enableNext =
            this.consentAgreement &&
            this.checkboxOptions.some((item) => item.checked) &&
            this.name !== undefined &&
            this.phone !== undefined &&
            this.contactEmail !== undefined &&
            phonere.test(this.phone) &&
            emailre.test(this.contactEmail);
        if (this.enableNext) {
            button.classList.remove("btn-disabled");
        } else {
            button.classList.add("btn-disabled");
        }
    }

    handleCancel() {
        this.close();
    }

    handleConsentChange(e) {
        this.consentAgreement = e.detail.checked;
        this.handleButton();
    }

    handleLogError(error) {
        logError({ error })
            .then(() => {})
            .catch(() => {});
    }
}