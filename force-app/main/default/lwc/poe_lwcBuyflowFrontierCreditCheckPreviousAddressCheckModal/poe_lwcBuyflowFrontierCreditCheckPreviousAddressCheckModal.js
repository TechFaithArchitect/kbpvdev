import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";

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
export default class Poe_lwcBuyflowFrontierCreditCheckPreviousAddressCheckModal extends LightningElement {
    @api responseData;
    @api frontierUserId;
    states = [];
    accountUuid;
    quoteId;
    loaderSpinner;
    noCompleteInfo = true;

    previousAddress;
    previousApt;
    previousCity;
    previousZip;

    connectedCallback() {
        this.loaderSpinner = true;
        let responseDataParsed = JSON.parse(JSON.stringify(this.responseData));
        this.accountUuid = responseDataParsed.accountUuid;
        this.quoteId = responseDataParsed.quoteId;

        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.states.push(option);
        });
        this.loaderSpinner = false;
    }

    handleAddressChange(event) {
        switch (event.target.name) {
            case "previousAddress":
                this.previousAddress = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "previousApt":
                this.previousApt = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "previousState":
                this.previousState = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "previousZip":
                this.previousZip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "previousCity":
                this.previousCity = event.target.value !== "" ? event.target.value : undefined;
                break;
        }
        this.disableValidations();
    }

    disableValidations() {
        if (
            this.previousAddress !== undefined &&
            this.previousCity !== undefined &&
            this.previousState !== undefined &&
            this.previousZip !== undefined
        ) {
            this.noCompleteInfo = false;
        } else {
            this.noCompleteInfo = true;
        }
    }

    handleVerifyPreviousAddress() {
        this.loaderSpinner = true;
        let previousAddressCheck = {
            addressLine1: this.previousAddress,
            addressLine2: "",
            city: this.previousCity,
            state: this.previousState,
            zipCode: this.previousZip
        };
        const path = "previousAddressCheck";
        let myData = {
            partnerName: "frapi",
            tab: "previousaddresscheck",
            path,
            quoteId: this.quoteId,
            accountUuid: this.accountUuid,
            address: previousAddressCheck,
            userId: this.frontierUserId
        };
        let apiResponse;
        console.group("Previous Address Check Request", myData);
        callEndpoint({ inputMap: myData }).then((response) => {
            apiResponse = response;
            const responseParsed = JSON.parse(response);
            console.group("Previous Address Check Response", responseParsed);
            let result = responseParsed;
            let errorMessage;
            if (result.hasOwnProperty("error") && result.error.hasOwnProperty("provider")) {
                errorMessage = result.error.provider.message;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message:
                        errorMessage !== undefined
                            ? errorMessage
                            : "The credit check request could not be made correctly to the server. Please, try again."
                });
                this.dispatchEvent(event);
                this.logError(errorMessage);
                this.loaderSpinner = false;
            } else {
                const closeModalEvent = new CustomEvent("previousaddressverified", {
                    detail: result
                });
                this.dispatchEvent(closeModalEvent);
                this.loaderSpinner = false;
                this.hideModal();
            }
            this.loaderSpinner = false;
        });
    }

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: "cancel"
        });
        this.dispatchEvent(closeModalEvent);
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Credit Check",
            component: "poe_lwcBuyflowFrontierCreditCheckPreviousAddressCheckModal",
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
            tab: "Credit Check"
        };
        this.dispatchEvent(event);
    }
}