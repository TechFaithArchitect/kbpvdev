import { LightningElement, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import getSSNAgreement from "@salesforce/apex/CreditCheckTabController.getSSNAgreement";
import encryptAndSaveCreditCheckData from "@salesforce/apex/POECCEncryptionService.encryptAndSaveCreditCheckData";
import logError from "@salesforce/apex/ErrorLogModel.logError";

const stateNames = [
    { name: "Alabama", abbrev: "AL" },
    { name: "Alaska", abbrev: "AK" },
    { name: "Arizona", abbrev: "AZ" },
    { name: "Arkansas", abbrev: "AR" },
    { name: "California", abbrev: "CA" },
    { name: "Colorado", abbrev: "CO" },
    { name: "Connecticut", abbrev: "CT" },
    { name: "Delaware", abbrev: "DE" },
    { name: "District of Columbia", abbrev: "DC" },
    { name: "Florida", abbrev: "FL" },
    { name: "Georgia", abbrev: "GA" },
    { name: "Hawaii", abbrev: "HI" },
    { name: "Idaho", abbrev: "ID" },
    { name: "Illinois", abbrev: "IL" },
    { name: "Indiana", abbrev: "IN" },
    { name: "Iowa", abbrev: "IA" },
    { name: "Kansas", abbrev: "KS" },
    { name: "Kentucky", abbrev: "KY" },
    { name: "Louisiana", abbrev: "LA" },
    { name: "Maine", abbrev: "ME" },
    { name: "Maryland", abbrev: "MD" },
    { name: "Massachusetts", abbrev: "MA" },
    { name: "Michigan", abbrev: "MI" },
    { name: "Minnesota", abbrev: "MN" },
    { name: "Mississippi", abbrev: "MS" },
    { name: "Missouri", abbrev: "MO" },
    { name: "Montana", abbrev: "MT" },
    { name: "Nebraska", abbrev: "NE" },
    { name: "Nevada", abbrev: "NV" },
    { name: "New Hampshire", abbrev: "NH" },
    { name: "New Jersey", abbrev: "NJ" },
    { name: "New Mexico", abbrev: "NM" },
    { name: "New York", abbrev: "NY" },
    { name: "North Carolina", abbrev: "NC" },
    { name: "North Dakota", abbrev: "ND" },
    { name: "Ohio", abbrev: "OH" },
    { name: "Oklahoma", abbrev: "OK" },
    { name: "Oregon", abbrev: "OR" },
    { name: "Pennsylvania", abbrev: "PA" },
    { name: "Rhode Island", abbrev: "RI" },
    { name: "South Carolina", abbrev: "SC" },
    { name: "South Dakota", abbrev: "SD" },
    { name: "Tennessee", abbrev: "TN" },
    { name: "Texas", abbrev: "TX" },
    { name: "Utah", abbrev: "UT" },
    { name: "Vermont", abbrev: "VT" },
    { name: "Virginia", abbrev: "VA" },
    { name: "Washington", abbrev: "WA" },
    { name: "West Virginia", abbrev: "WV" },
    { name: "Wisconsin", abbrev: "WI" },
    { name: "Wyoming", abbrev: "WY" }
];

const DIRECTV_CODE = "DIRECTV";

export default class Poe_PCICreditCheckForm extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference) pageRef;

    recordId;
    ssn;
    repeatSSN;
    isSsnMismatch = false;
    dob;
    dlNumber;
    dlState;
    dlExpDate;
    noCompleteInformation = true;
    loaderSpinner = false;
    ssnAgreementChecked = false;
    isValidDob = false;
    radioOption;
    states = [];
    program;

    radioOptions = [
        {
            label: "SSN",
            value: "ssn"
        },
        {
            label: "Driver's License",
            value: "dl"
        }
    ];

    get showMethods() {
        return !this.ssnAgreementChecked;
    }

    get showSSN() {
        return this.radioOption === "ssn";
    }

    get maximumDOB() {
        const today = new Date();
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        const year = eighteenYearsAgo.getFullYear();
        const month = String(eighteenYearsAgo.getMonth() + 1).padStart(2, "0");
        const day = String(eighteenYearsAgo.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    get todayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    connectedCallback() {
        this.loaderSpinner = true;
        this.recordId = this.pageRef.state?.c__ContextId;
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.states.push(option);
        });
        let myData = {
            ContextId: this.recordId
        };
        getSSNAgreement({ myData: myData })
            .then((response) => {
                let data = response.result ?? {};
                this.ssnAgreementChecked = !!data?.Opportunity?.POE_SSN_Agreement__c;
                this.program = String(data?.Opportunity?.POE_Program__c).toUpperCase();
                this.radioOption = this.ssnAgreementChecked || this.program === DIRECTV_CODE ? "ssn" : "dl";
            })
            .catch((error) => {
                console.error(error, "ERROR");
                let errorMessage =
                    "There was an error connecting to the server. Please check your internet connection and try again. If the error persists, please contact your sales agent";
                const event = new ShowToastEvent({
                    title: "There was an error retrieving your information",
                    variant: "error",
                    mode: "sticky",
                    message: errorMessage
                });
                this.dispatchEvent(event);
                this.handleLogError(error);
            });
        this.disableValidations();
        this.loaderSpinner = false;
    }

    handleChange(event) {
        switch (event.target.name) {
            case "ssn":
            case "repeatSSN":
            case "dlNumber":
            case "dlState":
            case "dlExpDate":
                this[event.target.name] = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "dob":
                const date = new Date(event.target.value);
                const maximumDOB = new Date(this.maximumDOB);
                date.setHours(0, 0, 0, 0);
                maximumDOB.setHours(0, 0, 0, 0);
                this.isValidDob = date.getTime() <= maximumDOB.getTime();
                this.dob = event.target.value !== "" ? event.target.value : undefined;
                break;
        }

        this.disableValidations();
    }

    handleSSNorDL(event) {
        this.isSsnMismatch = false;
        this.ssn = undefined;
        this.repeatSSN = undefined;
        this.dob = undefined;
        this.dlNumber = undefined;
        this.dlState = undefined;
        this.dlExpDate = undefined;
        this.radioOption = event.target.value;
        this.disableValidations();
    }

    disableValidations() {
        const ssnValidation = this.radioOption === "ssn" ? !!this.ssn && !!this.repeatSSN && !this.isSsnMismatch : true;
        const dlValidation = this.radioOption === "dl" ? !!this.dlNumber && !!this.dlState && !!this.dlExpDate : true;
        const dobValidation = this.isValidDob;
        this.noCompleteInformation = !(ssnValidation && dlValidation && dobValidation);
    }

    handleSSNRepeatValidation() {
        this.isSsnMismatch = this.repeatSSN !== this.ssn ? true : false;
        const inputField = this.template.querySelector('[data-id="repeatSSN"]');
        if (this.isSsnMismatch) {
            inputField.setCustomValidity("Both SSN inputs must match");
            inputField.reportValidity();
        } else {
            inputField.setCustomValidity("");
            inputField.reportValidity();
        }
        this.disableValidations();
    }

    handleLogError(error) {
        let detail = {
            type: "Internal Error",
            provider: this.opportunityProgram,
            tab: "PCI Credit Check Form",
            component: "Poe_PCICreditCheckForm",
            error: JSON.stringify(error),
            opportunity: this.recordId
        };
        logError({ error: detail })
            .then(() => {
                console.log("Error logged");
            })
            .catch((err) => {
                console.error(`LOGGING ERROR: ${err.body?.message || err.stack}`);
            });
    }

    handleClick() {
        this.loaderSpinner = true;
        let myData = {
            opportunityId: this.recordId,
            sensitiveData: {
                ccDriversLicenseNumber: this.dlNumber || "",
                ccDlState: this.dlState || "",
                ccDlExpirationDate: this.dlExpDate || "",
                ccSSN: this.ssn || "",
                ccDob: this.dob || ""
            }
        };

        encryptAndSaveCreditCheckData({ myData: myData })
            .then((response) => {
                if (response?.result.success) {
                    console.log("encryptAndSaveCreditCheckData success", response);
                    this[NavigationMixin.Navigate]({
                        type: "comm__namedPage",
                        attributes: {
                            name: "SuccessMessage__c"
                        }
                    });
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                let errorMessage =
                    "There was an error connecting to the server. Please check your internet connection and try again. If the error persists, please contact your sales agent";
                const event = new ShowToastEvent({
                    title: "There was an error sending your information",
                    variant: "error",
                    mode: "sticky",
                    message: errorMessage
                });
                this.dispatchEvent(event);
                this.handleLogError(error);
            });
    }
}