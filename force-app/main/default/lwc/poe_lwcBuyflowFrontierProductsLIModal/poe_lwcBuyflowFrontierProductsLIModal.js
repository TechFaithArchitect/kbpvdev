import { LightningElement, api, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getOnlyLettersRegEx from "@salesforce/apex/POE_RegExObtainer.getOnlyLettersRegEx";
import disclosureFRAPIUrl from "@salesforce/label/c.acpDisclosureFrontier";

var stateNames = [
    { label: "Alabama", value: "AL" },
    { label: "Alaska", value: "AK" },
    { label: "Arizona", value: "AZ" },
    { label: "Arkansas", value: "AR" },
    { label: "California", value: "CA" },
    { label: "Colorado", value: "CO" },
    { label: "Connecticut", value: "CT" },
    { label: "Delaware", value: "DE" },
    { label: "District of Columbia", value: "DC" },
    { label: "Florida", value: "FL" },
    { label: "Georgia", value: "GA" },
    { label: "Hawaii", value: "HI" },
    { label: "Idaho", value: "ID" },
    { label: "Illinois", value: "IL" },
    { label: "Indiana", value: "IN" },
    { label: "Iowa", value: "IA" },
    { label: "Kansas", value: "KS" },
    { label: "Kentucky", value: "KY" },
    { label: "Louisiana", value: "LA" },
    { label: "Maine", value: "ME" },
    { label: "Maryland", value: "MD" },
    { label: "Massachusetts", value: "MA" },
    { label: "Michigan", value: "MI" },
    { label: "Minnesota", value: "MN" },
    { label: "Mississippi", value: "MS" },
    { label: "Missouri", value: "MO" },
    { label: "Montana", value: "MT" },
    { label: "Nebraska", value: "NE" },
    { label: "Nevada", value: "NV" },
    { label: "New Hampshire", value: "NH" },
    { label: "New Jersey", value: "NJ" },
    { label: "New Mexico", value: "NM" },
    { label: "New York", value: "NY" },
    { label: "North Carolina", value: "NC" },
    { label: "North Dakota", value: "ND" },
    { label: "Ohio", value: "OH" },
    { label: "Oklahoma", value: "OK" },
    { label: "Oregon", value: "OR" },
    { label: "Pennsylvania", value: "PA" },
    { label: "Rhode Island", value: "RI" },
    { label: "South Carolina", value: "SC" },
    { label: "South Dakota", value: "SD" },
    { label: "Tennessee", value: "TN" },
    { label: "Texas", value: "TX" },
    { label: "Utah", value: "UT" },
    { label: "Vermont", value: "VT" },
    { label: "Virginia", value: "VA" },
    { label: "Washington", value: "WA" },
    { label: "West Virginia", value: "WV" },
    { label: "Wisconsin", value: "WI" },
    { label: "Wyoming", value: "WY" }
];

export default class Poe_lwcBuyflowFrontierProductsLIModal extends LightningElement {
    @api quoteId;
    @api accountId;
    @api frontierUserId;

    @track onlyLettersRegEx;
    @wire(getOnlyLettersRegEx) onlyLettersRegExParse({data, error}){
        if(data){
            this.onlyLettersRegEx = data;
        } else if(error){
            console.error(error);
        }
    };
    get onlyLettersRegExPattern(){
        return this.onlyLettersRegEx?.result?.expression;
    }
    get onlyLettersRegExErrorMessage(){
        return this.onlyLettersRegEx?.result?.errorMessage;
    }

    radioOptions = [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" }
    ];
    noApplication = false;
    applicationOption = "yes";
    application;
    ssn;
    dob;
    tribalEnrollment = "no";
    incompleteInfo = true;
    firstName;
    lastName;
    email;
    phone;
    state;
    stateOptions = [...stateNames];
    address;
    address2;
    city;
    zipCode;
    loaderSpinner;
    labels = {
        disclosureFRAPIUrl
    };
    acpDisclosures = [];

    get hasApplication() {
        return !this.noApplication;
    }

    connectedCallback() {
        this.loaderSpinner = true;
        const path = "disclosures";
        let myData = {
            partnerName: "frapi",
            path,
            quoteId: this.quoteId,
            disclosures: [this.labels.disclosureFRAPIUrl],
            userId: this.frontierUserId
        };
        console.log("ACP Disclosure Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let responseParsed = JSON.parse(response);
                console.log("ACP Disclosure Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = `${responseParsed.message !== undefined ? responseParsed.message + "." : ""} ${
                        responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    let disclosures = [];
                    if (responseParsed.disclosures.length > 0) {
                        responseParsed.disclosures.forEach((disclosure, index) => {
                            let disclosureObject = {
                                disclaimer: Object.values(disclosure)[0],
                                checked: false,
                                id: index
                            };
                            disclosures.push(disclosureObject);
                        });
                    }
                    this.acpDisclosures = [...disclosures];
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
                this.loaderSpinner = false;
            });
    }

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleChange(event) {
        switch (event.target.name) {
            case "noApplication":
                this.applicationOption = event.target.value;
                this.noApplication = this.applicationOption === "no";
                break;
            case "application":
                this.application = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "ssn":
                this.ssn = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "dob":
                this.dob = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "tribalEnrollment":
                this.tribalEnrollment = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "firstName":
                this.firstName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "lastName":
                this.lastName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "state":
                this.state = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "email":
                this.email = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "phone":
                this.phone = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "address":
                this.address = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "address2":
                this.address2 = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "city":
                this.city = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "zipCode":
                this.zipCode = event.target.value !== "" ? event.target.value : undefined;
                break;
        }
        this.inputValidations();
    }

    inputValidations() {
        let phonePattern = /^\d{10}$/;
        let ssnPattern = /^\d{4}$/;
        let emailPattern = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        let dobElement = this.template.querySelector('[data-id="dob"]');
        let emailElement = this.template.querySelector('[data-id="email"]');
        let ssnElement = this.template.querySelector('[data-id="ssn"]');
        let phoneElement = this.template.querySelector('[data-id="phone"]');
        let age = this.dob !== undefined ? Math.floor((new Date() - new Date(this.dob).getTime()) / 3.15576e10) : 0;
        if (this.dob !== undefined) {
            if (age < 18) {
                dobElement.setCustomValidity("Must be over 18 years old");
                dobElement.reportValidity();
            } else {
                dobElement.setCustomValidity("");
                dobElement.reportValidity();
            }
        }
        if (this.ssn !== undefined && this.noApplication) {
            if (!ssnPattern.test(this.ssn)) {
                ssnElement.setCustomValidity("You must enter the four last digits of the SSN");
                ssnElement.reportValidity();
            } else {
                ssnElement.setCustomValidity("");
                ssnElement.reportValidity();
            }
        }
        if (this.phone !== undefined) {
            if (!phonePattern.test(this.phone)) {
                phoneElement.setCustomValidity("Please enter a valid 10-digit Phone Number");
                phoneElement.reportValidity();
            } else {
                phoneElement.setCustomValidity("");
                phoneElement.reportValidity();
            }
        }
        if (this.email !== undefined) {
            if (!emailPattern.test(this.email)) {
                emailElement.setCustomValidity("Please enter a valid email");
                emailElement.reportValidity();
            } else {
                emailElement.setCustomValidity("");
                emailElement.reportValidity();
            }
        }
        if (this.noApplication) {
            let onlyLetters = new RegExp(this.onlyLettersRegEx.result.expression);
            let nameWithOnlyLetterCharacters = onlyLetters.test(this.firstName) && onlyLetters.test(this.lastName);
    
            this.incompleteInfo =
                (this.email === undefined && this.phone === undefined) ||
                (this.email !== undefined && !emailPattern.test(this.email)) ||
                (this.phone !== undefined && !phonePattern.test(this.phone)) ||
                this.phone === undefined ||
                this.state === undefined ||
                this.firstName === undefined ||
                this.lastName === undefined ||
                !nameWithOnlyLetterCharacters ||
                this.city === undefined ||
                this.zipCode === undefined ||
                this.address === undefined ||
                !ssnPattern.test(this.ssn) ||
                age < 18 ||
                this.ssn === undefined ||
                this.dob === undefined ||
                this.dob === null;
        } else {
            this.incompleteInfo =
                (this.email === undefined && this.phone === undefined) ||
                (this.email !== undefined && !emailPattern.test(this.email)) ||
                (this.phone !== undefined && !phonePattern.test(this.phone)) ||
                this.phone === undefined ||
                this.state === undefined ||
                this.firstName === undefined ||
                this.lastName === undefined ||
                !nameWithOnlyLetterCharacters ||
                age < 18 ||
                this.application === undefined ||
                this.dob === undefined ||
                this.dob === null;
        }
    }

    handleConfirm() {
        this.loaderSpinner = true;
        let url = window.location.href;
        let isDevEnvironment = false;
        const formattedDOB = new Date(this.dob);
        const yyyy = formattedDOB.getFullYear();
        let mm = formattedDOB.getMonth() + 1;
        let dd = formattedDOB.getDate();
        if (dd < 10) dd = "0" + dd;
        if (mm < 10) mm = "0" + mm;
        const finalDOB = mm + "/" + dd + "/" + yyyy;
        const path = "lowIncomeVerification";
        if (url.includes("qa") || url.includes("dev") || url.includes("uat") || url.includes("trainin")) {
            isDevEnvironment = true;
        }
        let myData = {
            path,
            partnerName: "frapi",
            quoteId: this.quoteId,
            accountUuid: isDevEnvironment == true ? "4B4BBBA1B740416E8EF91C7B05BAC81C" : this.accountId,
            customer: {
                applicationId: this.application === undefined ? "" : this.application,
                firstName: this.firstName,
                lastName: this.lastName,
                enrollInTribalBenefit: this.tribalEnrollment === "yes",
                tribalId: "",
                ssn: this.ssn === undefined ? "" : this.ssn,
                dob: finalDOB,
                phoneNumber: this.phone === undefined ? "" : this.phone
            },
            serviceAddress: {
                addressLine1: this.address === undefined ? "" : this.address,
                addressLine2: this.address2 === undefined ? "" : this.address2,
                city: this.city === undefined ? "" : this.city,
                state: this.state,
                zipCode: this.zipCode === undefined ? "" : this.zipCode
            },
            contactPhoneNumber: this.phone === undefined ? "" : this.phone,
            userId: this.frontierUserId
        };
        if (this.email !== undefined && this.email !== "") {
            myData.customer.email = this.email;
        }
        console.log("ACP Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let responseParsed = JSON.parse(response);
                console.log("ACP Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = `${responseParsed.message !== undefined ? responseParsed.message + "." : ""} ${
                        responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.loaderSpinner = false;
                } else {
                    let result = true;
                    if (responseParsed.isEligible) {
                        const event = new ShowToastEvent({
                            title: "Success",
                            variant: "success",
                            mode: "sticky",
                            message: "The customer is eligible for the Affordable Connectivity Programs"
                        });
                        this.dispatchEvent(event);
                    } else {
                        let failureMessage = "";
                        result = false;
                        responseParsed.errors.verification.forEach(
                            (item) => (failureMessage += `${item.description} `)
                        );
                        const event = new ShowToastEvent({
                            title: "Customer Not Eligible",
                            variant: "error",
                            mode: "sticky",
                            message: failureMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(`${failureMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    }
                    let info = {
                        result: result,
                        products: responseParsed.products
                    };
                    const closeModalEvent = new CustomEvent("confirm", {
                        detail: info
                    });
                    this.dispatchEvent(closeModalEvent);
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
                this.loaderSpinner = false;
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Products",
            component: "poe_lwcBuyflowFrontierProductsLIModal",
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
            tab: "Products"
        };
        this.dispatchEvent(event);
    }
}