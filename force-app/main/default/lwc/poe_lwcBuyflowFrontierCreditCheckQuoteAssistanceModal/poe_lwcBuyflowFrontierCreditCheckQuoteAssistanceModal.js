import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import RATING_Z_VERBIAGE from "@salesforce/label/c.Frontier_Quote_Assistance_Z_Rating_Verbiage";
import OTHER_VERBIAGE from "@salesforce/label/c.Frontier_Quote_Assistance_Other_Verbiage";

export default class Poe_lwcBuyflowFrontierCreditCheckQuoteAssistanceModal extends LightningElement {
    @api quoteId;
    @api quoteNumber;
    @api customerPhone;
    @api customerTN;
    @api frontierUserId;
    @api creditScoreRating;
    loaderSpinner;

    get verbiage() {
        return String(this.creditScoreRating).toLowerCase() === "z" ? RATING_Z_VERBIAGE : OTHER_VERBIAGE;
    }

    handleAssistanceCallout() {
        this.loaderSpinner = true;
        const path = "quoteAssistance";
        let myData = {
            partnerName: "frapi",
            tab: "assistance",
            path,
            quoteId: this.quoteId,
            userId: this.frontierUserId
        };
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                let creditScore = responseParsed?.customer?.creditProfile?.creditScore;
                let error =
                    responseParsed.hasOwnProperty("error") &&
                    responseParsed.error.hasOwnProperty("provider") &&
                    responseParsed.error.provider.hasOwnProperty("message");
                if (error) {
                    let errorMessage = responseParsed.error.provider.message;
                    this.portableError = true;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    let errorMessage = 'Assistance was required on this order with ';
                    if (this.quoteNumber) {
                        errorMessage += `Quote Number ${this.quoteNumber} and BTN `;
                    } else {
                        errorMessage += `Quote Id ${this.quoteId} and BTN `;
                    }

                    if (this.customerTN) {
                        errorMessage += `${this.customerTN}. ${this.verbiage}`;
                    } else {
                        errorMessage += `${this.customerPhone}. ${this.verbiage}`;
                    }
                    
                    const event = new ShowToastEvent({
                        title: "Assistance Required",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(errorMessage);
                    let action = String(creditScore).toLocaleLowerCase() === "z" ? "stop" : "confirm";
                    const closeModalEvent = new CustomEvent("close", {
                        detail: action
                    });
                    this.dispatchEvent(closeModalEvent);
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
            component: "poe_lwcBuyflowFrontierCreditCheckQuoteAssistanceModal",
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