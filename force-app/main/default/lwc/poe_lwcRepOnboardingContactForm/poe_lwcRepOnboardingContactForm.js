import { LightningElement, api, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import chuzoFunctionalRolesURL from "@salesforce/resourceUrl/Chuzo_Functional_Roles";
import phonePrograms from "@salesforce/label/c.phonePrograms";
import retailPrograms from "@salesforce/label/c.retailPrograms";
import eventPrograms from "@salesforce/label/c.eventPrograms";
import d2dPrograms from "@salesforce/label/c.d2dPrograms";
import BAD_ONSHORE_MOBILE_PHONE_FORMAT_MESSAGE from "@salesforce/label/c.POE_Bad_OnShore_Mobile_Phone_Format_Message";
import BAD_OFFSHORE_MOBILE_PHONE_FORMAT_MESSAGE from "@salesforce/label/c.POE_Bad_OffShore_Mobile_Phone_Format_Message";
import getOwnerRepresentativeType from "@salesforce/apex/RepOnBoardingController.getOwnerRepresentativeType";
import getMobilePhoneRegex from "@salesforce/apex/RepOnBoardingController.getMobilePhoneRegex";

const stateNames = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "District of Columbia",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming"
];

export default class Poe_lwcRepOnboardingContactForm extends LightningElement {
    @api accountId;
    _contactData;
    @api
    get contactData() {
        return this._contactData;
    }
    set contactData(data) {
        if (data) {
            this._contactData = data;
            this.handleData();
        } else {
            this.clearData();
        }
    }
    @api isUpdate = false;
    @api showPhotoUploader = false;
    contactId;
    d2dProgramOptions = [];
    eventProgramOptions = [];
    retailProgramOptions = [];
    phoneProgramOptions = [];
    originalD2dProgramOptions = [];
    originalEventProgramOptions = [];
    originalRetailProgramOptions = [];
    originalPhoneProgramOptions = [];
    stateOptions = [];
    selectedOptions = [];
    selectedEventOptions = [];
    selectedRetailOptions = [];
    selectedD2DOptions = [];
    accountId;
    loaderSpinner;
    programsAvailable;
    eventPrograms;
    retailPrograms;
    d2dPrograms;
    firstName;
    birthDate;
    middleName;
    POE_Start_Date__c;
    lastName;
    mailingStreet;
    vlocity_cmt__SSN__c;
    mailingState;
    mobilePhone;
    email;
    confirmEmail;
    mailingPostalCode;
    mailingCounty;
    address;
    POE_Functional_Role__c;
    POE_RO_Status__c;
    docId;
    incompleteInfo = true;
    functionalRoles = [
        { label: "Agent", value: "Office Representative" },
        { label: "Owner", value: "Office Manager" },
        { label: "Sales Manager", value: "Sales Manager" },
        { label: "Team Lead", value: "Team Lead" }
    ];
    representativeTypes = [];
    @track selectedTypes = [];
    callCenterTypes = [
        {
            label: "Offshore",
            value: "Offshore"
        },
        {
            label: "On-site",
            value: "On-site"
        }
    ];
    callCenterType;
    isCallCenter = false;
    offshore = false;
    differentEmail = false;
    wrongPhoneFormat = false;
    mobilePhoneRegex;
    selectAllD2D = false;
    selectAllRetail = false;
    selectAllEvent = false;
    selectAllPhone = false;

    get badMobilePhoneFormatMessage() {
        return this.offshore ? BAD_OFFSHORE_MOBILE_PHONE_FORMAT_MESSAGE : BAD_ONSHORE_MOBILE_PHONE_FORMAT_MESSAGE;
    }

    get disablePhoneSalesPrograms() {
        return this.selectedTypes.indexOf("Phone Sales") == -1;
    }
    get disableEventPrograms() {
        return this.selectedTypes.indexOf("Event") == -1;
    }
    get disableRetailPrograms() {
        return this.selectedTypes.indexOf("Retail") == -1;
    }
    get disableD2DPrograms() {
        return this.selectedTypes.indexOf("Door To Door") == -1;
    }

    get dateMinusEighteenYears() {
        const today = new Date();
        today.setFullYear(today.getFullYear() - 18);
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    get validBirthDate() {
        return this.dateMinusEighteenYears >= this.birthDate;
    }

    labels = {
        d2dPrograms,
        retailPrograms,
        eventPrograms,
        phonePrograms
    };

    get isCreate() {
        return !this.isUpdate;
    }

    get acceptedFormats() {
        return [".jpg", ".png"];
    }

    @wire(getMobilePhoneRegex)
    wireMobilePhoneRegex({ data, error }) {
        if (data) {
            this.mobilePhoneRegex = data.result.mobilePhoneRegex;
        } else if (error) {
            console.error(error, "ERROR");

            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: error.body?.message || error.message
            });
            this.dispatchEvent(event);

            this.logError(errorMsg);
        }
    }

    connectedCallback() {
        let stateArray = [];
        stateNames.forEach((state) => {
            let opt = {
                label: state,
                value: state
            };
            stateArray.push(opt);
        });
        this.stateOptions = [...stateArray];
        getOwnerRepresentativeType()
            .then((response) => {
                let types = response.result.representativeType;
                let repTypes = [];
                if (types.callCenter) {
                    let type = {
                        label: "Phone Sales",
                        value: "Phone Sales"
                    };
                    repTypes.push(type);
                }
                if (types.doorToDoor) {
                    let type = { label: "Door To Door", value: "Door To Door" };
                    repTypes.push(type);
                }
                if (types.event) {
                    let type = { label: "Event", value: "Event" };
                    repTypes.push(type);
                }
                if (types.retail) {
                    let type = { label: "Retail", value: "Retail" };
                    repTypes.push(type);
                }
                this.representativeTypes = [...repTypes];
                let availablePrograms = response.result.programsAvailable;
                if (availablePrograms != null && availablePrograms !== undefined) {
                    let accPrograms = [];
                    let programsAvailableList = this.replaceProgramValuesArray(availablePrograms);
                    programsAvailableList.forEach((element) => {
                        let obj = {
                            value: element,
                            label: element
                        };
                        accPrograms.push(obj);
                    });
                    let eventProgramOptions = [
                        ...accPrograms.filter((item) => this.labels.eventPrograms.includes(item.value))
                    ];
                    let retailProgramOptions = [
                        ...accPrograms.filter((item) => this.labels.retailPrograms.includes(item.value))
                    ];
                    let phoneProgramOptions = [
                        ...accPrograms.filter((item) => this.labels.phonePrograms.includes(item.value))
                    ];
                    let d2dProgramOptions = [
                        ...accPrograms.filter((item) => this.labels.d2dPrograms.includes(item.value))
                    ];
                    this.originalEventProgramOptions = [...eventProgramOptions];
                    this.originalRetailProgramOptions = [...retailProgramOptions];
                    this.originalPhoneProgramOptions = [...phoneProgramOptions];
                    this.originalD2dProgramOptions = [...d2dProgramOptions];
                    if (
                        this.contactData !== undefined &&
                        this.contactData.hasOwnProperty("POE_Blacklisted_Programs__c")
                    ) {
                        let blacklistedPrograms = this.replaceProgramValuesArray(
                            this.contactData.POE_Blacklisted_Programs__c
                        );
                        this.eventProgramOptions = [
                            ...eventProgramOptions.filter((item) => !blacklistedPrograms.includes(item.value))
                        ];
                        this.retailProgramOptions = [
                            ...retailProgramOptions.filter((item) => !blacklistedPrograms.includes(item.value))
                        ];
                        this.phoneProgramOptions = [
                            ...phoneProgramOptions.filter((item) => !blacklistedPrograms.includes(item.value))
                        ];
                        this.d2dProgramOptions = [
                            ...d2dProgramOptions.filter((item) => !blacklistedPrograms.includes(item.value))
                        ];
                    } else {
                        this.eventProgramOptions = [...eventProgramOptions];
                        this.retailProgramOptions = [...retailProgramOptions];
                        this.phoneProgramOptions = [...phoneProgramOptions];
                        this.d2dProgramOptions = [...d2dProgramOptions];
                    }
                }
                this.disableValidations();
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                let errorMsg = error.body?.message || error.message;
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

    handleData() {
        let data = this.contactData;
        if (this.contactData !== undefined && this.contactData.hasOwnProperty("POE_Blacklisted_Programs__c")) {
            let blacklistedPrograms = this.replaceProgramValuesArray(this.contactData.POE_Blacklisted_Programs__c);
            let eventProgramOptions = [
                ...this.eventProgramOptions.filter((item) => !blacklistedPrograms.includes(item.value))
            ];
            let retailProgramOptions = [
                ...this.retailProgramOptions.filter((item) => !blacklistedPrograms.includes(item.value))
            ];
            let phoneProgramOptions = [
                ...this.phoneProgramOptions.filter((item) => !blacklistedPrograms.includes(item.value))
            ];
            let d2dProgramOptions = [
                ...this.d2dProgramOptions.filter((item) => !blacklistedPrograms.includes(item.value))
            ];
            this.eventProgramOptions = [...eventProgramOptions];
            this.retailProgramOptions = [...retailProgramOptions];
            this.phoneProgramOptions = [...phoneProgramOptions];
            this.d2dProgramOptions = [...d2dProgramOptions];
        }
        this.contactId = data.Id;
        this.firstName = data.FirstName !== "" && data.FirstName !== null ? data.FirstName : undefined;
        this.birthDate = data.Birthdate !== "" && data.Birthdate !== null ? data.Birthdate : undefined;
        this.middleName = data.MiddleName !== "" && data.MiddleName !== null ? data.MiddleName : undefined;
        this.POE_Start_Date__c =
            data.POE_Start_Date__c !== "" && data.POE_Start_Date__c !== null ? data.POE_Start_Date__c : undefined;
        this.lastName = data.LastName !== "" && data.LastName !== null ? data.LastName : undefined;
        this.mailingStreet = data.MailingStreet !== "" && data.MailingStreet !== null ? data.MailingStreet : undefined;
        this.mailingState = data.MailingState !== "" && data.MailingState !== null ? data.MailingState : undefined;
        this.mailingCounty = data.POE_County__c !== "" && data.POE_County__c !== null ? data.POE_County__c : undefined;
        this.mobilePhone = data.MobilePhone !== "" && data.MobilePhone !== null ? data.MobilePhone : undefined;
        this.email = data.Email !== "" && data.Email !== null ? data.Email : undefined;
        this.mailingPostalCode =
            data.MailingPostalCode !== "" && data.MailingPostalCode !== null ? data.MailingPostalCode : undefined;
        this.POE_Functional_Role__c =
            data.POE_Functional_Role__c !== "" && data.POE_Functional_Role__c !== null
                ? data.POE_Functional_Role__c
                : undefined;

        this.programsAvailable =
            data.POE_Programs_Available__c !== "" && data.POE_Programs_Available__c !== null
                ? data.POE_Programs_Available__c
                : undefined;
        this.eventPrograms =
            data.POE_Event_Programs__c !== "" && data.POE_Event_Programs__c !== null
                ? data.POE_Event_Programs__c
                : undefined;
        this.retailPrograms =
            data.POE_Retail_Programs__c !== "" && data.POE_Retail_Programs__c !== null
                ? data.POE_Retail_Programs__c
                : undefined;
        this.d2dPrograms =
            data.D2D_Programs__c !== "" && data.D2D_Programs__c !== null ? data.D2D_Programs__c : undefined;
        this.POE_RO_Status__c =
            data.POE_RO_Status__c !== "" && data.POE_RO_Status__c !== null ? data.POE_RO_Status__c : undefined;
        this.accountId = data.AccountId;
        this.offshore = data.POE_Call_Center_Type__c == "Offshore" ? true : false;
        if (this.offshore) {
            this.address = this.mailingStreet;
        }
        let representativeType =
            data.POE_Representative_Type__c !== "" && data.POE_Representative_Type__c !== null
                ? data.POE_Representative_Type__c
                : undefined;

        if (representativeType !== undefined && representativeType !== null) {
            let t = [];
            if (representativeType.includes("Phone Sales")) {
                this.isCallCenter = true;
            }
            if (representativeType.includes(";")) {
                let typeList = representativeType.split(";");
                typeList.forEach((element) => {
                    t.push(element);
                });
            } else {
                t.push(representativeType);
            }
            this.selectedTypes = [...t];
        }
        if (this.programsAvailable != null && this.programsAvailable !== undefined) {
            this.selectedOptions = this.replaceProgramValuesArray(this.programsAvailable);
        } else {
            this.programsAvailableList = null;
        }
        if (this.eventPrograms != null && this.eventPrograms !== undefined) {
            this.selectedEventOptions = this.replaceProgramValuesArray(this.eventPrograms);
        } else {
            this.programsAvailableList = null;
        }
        if (this.retailPrograms != null && this.retailPrograms !== undefined) {
            this.selectedRetailOptions = this.replaceProgramValuesArray(this.retailPrograms);
        } else {
            this.programsAvailableList = null;
        }
        if (this.d2dPrograms != null && this.d2dPrograms !== undefined) {
            this.selectedD2DOptions = this.replaceProgramValuesArray(this.d2dPrograms);
        } else {
            this.programsAvailableList = null;
        }
        this.handleSelectAllCheckboxes();
        this.disableValidations();

        this.loaderSpinner = false;
    }

    handleSelectAllCheckboxes() {
        this.selectAllD2D =
            this.selectedD2DOptions.length > 0 && this.selectedD2DOptions.length == this.d2dProgramOptions.length;
        this.selectAllPhone =
            this.selectedOptions.length > 0 && this.selectedOptions.length == this.phoneProgramOptions.length;
        this.selectAllRetail =
            this.selectedRetailOptions.length > 0 &&
            this.selectedRetailOptions.length == this.retailProgramOptions.length;
        this.selectAllEvent =
            this.selectedEventOptions.length > 0 && this.selectedEventOptions.length == this.eventProgramOptions.length;
    }

    clearData() {
        this.contactId = undefined;
        this.firstName = undefined;
        this.birthDate = undefined;
        this.middleName = undefined;
        this.POE_Start_Date__c = undefined;
        this.lastName = undefined;
        this.mailingStreet = undefined;
        this.mailingState = undefined;
        this.mailingCounty = undefined;
        this.mobilePhone = undefined;
        this.email = undefined;
        this.mailingPostalCode = undefined;
        this.POE_Functional_Role__c = undefined;

        this.programsAvailable = undefined;
        this.eventPrograms = undefined;
        this.retailPrograms = undefined;
        this.d2dPrograms = undefined;
        this.POE_RO_Status__c = undefined;
        this.accountId = undefined;
        this.offshore = false;

        this.selectedTypes = [];

        this.selectedOptions = [];
        this.selectedEventOptions = [];
        this.selectedRetailOptions = [];
        this.programsAvailableList = null;
        this.selectedD2DOptions = [];

        this.eventProgramOptions = [...this.originalEventProgramOptions];
        this.retailProgramOptions = [...this.originalRetailProgramOptions];
        this.phoneProgramOptions = [...this.originalPhoneProgramOptions];
        this.d2dProgramOptions = [...this.originalD2dProgramOptions];

        this.disableValidations();
    }

    replaceProgramValue(stringValue) {
        switch (stringValue) {
            case "DirecTV":
                return "DIRECTV";
            case "Charter/Spectrum":
                return "Spectrum";
            case "Altice":
                return "Optimum";
            default:
                return stringValue;
        }
    }

    replaceProgramValuesArray(inputString) {
        let output = [];
        let tempArray = [];
        if (inputString.includes(";")) {
            let valuesArray = inputString.split(";");

            for (let i = 0; i < valuesArray.length; i++) {
                if (valuesArray[i] !== "Spectrum API") {
                    tempArray.push(this.replaceProgramValue(valuesArray[i]));
                }
            }
            tempArray.sort();
            output = tempArray;
        } else {
            output.push(this.replaceProgramValue(inputString));
        }
        return output;
    }

    handleShowModalDTV(options, value) {
        if (!options.includes("DIRECTV") && value.includes("DIRECTV")) {
            const event = new ShowToastEvent({
                title: "Warning",
                variant: "Warning",
                mode: "sticky",
                message:
                    "Once this request is submitted, user credentials for this program need to be verified by the Customer Service team before it is added to the user’s Chuzo account."
            });
            this.dispatchEvent(event);
        }
    }

    handleChange(event) {
        switch (event.target.name) {
            case "checkboxGroup":
                this.handleShowModalDTV(this.selectedOptions, event.detail.value);
                this.selectedOptions = event.detail.value;
                this.disableValidations();
                break;
            case "checkboxGroupEvent":
                this.selectAllEvent = false;
                this.handleShowModalDTV(this.selectedEventOptions, event.detail.value);
                this.selectedEventOptions = event.detail.value;
                this.disableValidations();
                break;
            case "checkboxGroupRetail":
                this.selectAllRetail = false;
                this.handleShowModalDTV(this.selectedRetailOptions, event.detail.value);
                this.selectedRetailOptions = event.detail.value;
                this.disableValidations();
                break;
            case "checkboxGroupD2D":
                this.selectAllD2D = false;
                this.handleShowModalDTV(this.selectedD2DOptions, event.detail.value);
                this.selectedD2DOptions = event.detail.value;
                this.disableValidations();
                break;
            case "fistNameField":
                this.firstName = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "dobField":
                this.birthDate = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "middleNameField":
                this.middleName = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "startDateField":
                this.POE_Start_Date__c = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "lastNameField":
                this.lastName = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "mailingStreetField":
                this.mailingStreet = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "ssnField":
                this.vlocity_cmt__SSN__c = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "mailingStateField":
                this.mailingState = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "mailingCountyField":
                this.mailingCounty = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "address":
                this.address = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "mobilePhoneField":
                this.setMobilePhone(event.target.value);
                this.disableValidations();
                break;
            case "emailField":
                this.email = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "confirmEmailField":
                this.confirmEmail = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "mailingPostalCodeField":
                this.mailingPostalCode = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "functionalRoleField":
                this.POE_Functional_Role__c = event.target.value ? event.target.value : undefined;
                this.disableValidations();
                break;
            case "checkboxGroupRepType":
                this.selectedTypes = event.target.value;
                this.isCallCenter = this.selectedTypes.includes("Phone Sales") ? true : false;
                this.disableValidations();
                break;
            case "offshore":
                this.offshore = event.detail.checked;
                this.setMobilePhone(this.mobilePhone);
                this.address = undefined;
                this.mailingPostalCode = undefined;
                this.mailingStreet = undefined;
                this.mailingState = undefined;
                this.mailingCounty = undefined;
                this.disableValidations();
                break;
        }
        this.handleSelectAllCheckboxes();
    }

    get requiredChannelValidations() {
        let types = this.selectedTypes.join(";");
        let result = true;

        if (types.includes("Phone Sales")) {
            result = result && this.selectedOptions.length > 0;
        }
        if (types.includes("Door To Door")) {
            result = result && this.selectedD2DOptions.length > 0;
        }
        if (types.includes("Retail")) {
            result = result && this.selectedRetailOptions.length > 0;
        }
        if (types.includes("Event")) {
            result = result && this.selectedEventOptions.length > 0;
        }

        return result;
    }

    setMobilePhone(value) {
        if (!value) {
            return (this.mobilePhone = this.offshore ? "" : "+1 ");
        }

        if (this.offshore || value.startsWith("+1 ") || value.startsWith("+01 ") || value.startsWith("+001 ")) {
            return (this.mobilePhone = value);
        }

        let onShoreNumber = value.trim();

        if (onShoreNumber.startsWith("+1")) {
            onShoreNumber = onShoreNumber.substring(2);
            this.mobilePhone = `+1 ${onShoreNumber}`;
        } else if (onShoreNumber.startsWith("+01")) {
            onShoreNumber = onShoreNumber.substring(3);
            this.mobilePhone = `+01 ${onShoreNumber}`;
        } else if (onShoreNumber.startsWith("+001")) {
            onShoreNumber = onShoreNumber.substring(4);
            this.mobilePhone = `+001 ${onShoreNumber}`;
        } else if (onShoreNumber.startsWith("+")) {
            onShoreNumber = onShoreNumber.substring(1);
            this.mobilePhone = `+1 ${onShoreNumber}`;
        } else {
            this.mobilePhone = `+1 ${onShoreNumber}`;
        }
    }

    disableValidations() {
        const emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        const phonere = new RegExp(this.mobilePhoneRegex);
        const zipre = /(^\d{5}$)/;

        if (
            this.firstName !== undefined &&
            this.birthDate !== undefined &&
            this.validBirthDate &&
            this.POE_Start_Date__c !== undefined &&
            this.lastName !== undefined &&
            ((!this.offshore &&
                this.mailingStreet !== undefined &&
                this.mailingState !== undefined &&
                this.mailingPostalCode !== undefined &&
                zipre.test(this.mailingPostalCode)) ||
                (this.offshore && this.address !== undefined)) &&
            this.mobilePhone !== undefined &&
            phonere.test(this.mobilePhone) &&
            ((this.isCreate &&
                this.email !== undefined &&
                emailre.test(this.email) &&
                this.confirmEmail !== undefined &&
                emailre.test(this.confirmEmail) &&
                this.email == this.confirmEmail) ||
                this.isUpdate) &&
            this.POE_Functional_Role__c !== undefined &&
            this.selectedTypes.length > 0 &&
            this.requiredChannelValidations
        ) {
            const validationEvent = new CustomEvent("validation", {
                detail: {
                    incompleteInfo: false,
                    contactData: {
                        firstName: this.firstName,
                        birthDate: this.birthDate,
                        POE_Start_Date__c: this.POE_Start_Date__c,
                        lastName: this.lastName,
                        middleName: this.middleName,
                        offshore: this.offshore,
                        mailingStreet: this.mailingStreet,
                        mailingState: this.mailingState,
                        mailingPostalCode: this.mailingPostalCode,
                        address: this.address,
                        mailingCounty: this.mailingCounty,
                        mobilePhone: this.mobilePhone,
                        email: this.email,
                        POE_Functional_Role__c: this.POE_Functional_Role__c,
                        selectedTypes: this.selectedTypes,
                        ssn: this.ssn,
                        contactId: this.contactId,
                        accountId: this.accountId,
                        selectedOptions: this.selectedOptions,
                        selectedEventOptions: this.selectedEventOptions,
                        selectedRetailOptions: this.selectedRetailOptions,
                        selectedD2DOptions: this.selectedD2DOptions,
                        documentId: this.docId
                    }
                }
            });
            this.dispatchEvent(validationEvent);
        } else {
            const validationEvent = new CustomEvent("validation", {
                detail: { incompleteInfo: true }
            });
            this.dispatchEvent(validationEvent);
        }

        if (
            this.isCreate &&
            this.email !== undefined &&
            emailre.test(this.email) &&
            this.confirmEmail !== undefined &&
            emailre.test(this.confirmEmail)
        ) {
            this.differentEmail = !(this.email == this.confirmEmail);
        }

        if (this.mobilePhone !== undefined) {
            this.wrongPhoneFormat = !phonere.test(this.mobilePhone);
        }
    }

    handleOpenPDF() {
        window.open(chuzoFunctionalRolesURL, "_blank");
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        this.docId = uploadedFiles[0].documentId;
        this.disableValidations();
    }

    logError(errorMessage) {
        const error = {
            type: "Internal Error",
            tab: "Agent Onboarding",
            component: "poe_lwcRepOnboardingContactForm",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }

    handleAllCheckbox(event) {
        let checked = event.target.checked;
        let dtvValue = ["DIRECTV"];
        let hasDTV = false;
        if (event.target.name === "selectAllPhone" && checked) {
            hasDTV = this.phoneProgramOptions.some((item) => item.value === dtvValue[0]);
            if (hasDTV) {
                this.handleShowModalDTV(this.selectedOptions, dtvValue);
            }
            this.selectedOptions = [...this.phoneProgramOptions.map((item) => item.value)];
        } else if (event.target.name === "selectAllPhone" && !checked) {
            this.selectedOptions = [];
        } else if (event.target.name === "selectAllEvent" && checked) {
            hasDTV = this.eventProgramOptions.some((item) => item.value === dtvValue[0]);
            if (hasDTV) {
                this.handleShowModalDTV(this.selectedEventOptions, dtvValue);
            }
            this.selectedEventOptions = [...this.eventProgramOptions.map((item) => item.value)];
        } else if (event.target.name === "selectAllEvent" && !checked) {
            this.selectedEventOptions = [];
        } else if (event.target.name === "selectAllRetail" && checked) {
            hasDTV = this.retailProgramOptions.some((item) => item.value === dtvValue[0]);
            if (hasDTV) {
                this.handleShowModalDTV(this.selectedRetailOptions, dtvValue);
            }
            this.selectedRetailOptions = [...this.retailProgramOptions.map((item) => item.value)];
        } else if (event.target.name === "selectAllRetail" && !checked) {
            this.selectedRetailOptions = [];
        } else if (event.target.name === "selectAllD2D" && checked) {
            hasDTV = this.d2dProgramOptions.some((item) => item.value === dtvValue[0]);
            if (hasDTV) {
                this.handleShowModalDTV(this.selectedD2DOptions, dtvValue);
            }
            this.selectedD2DOptions = [...this.d2dProgramOptions.map((item) => item.value)];
        } else if (event.target.name === "selectAllD2D" && !checked) {
            this.selectedD2DOptions = [];
        }
        this.disableValidations();
    }
}