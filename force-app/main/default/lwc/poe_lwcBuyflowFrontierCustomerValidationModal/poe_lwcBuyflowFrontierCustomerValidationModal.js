import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import SUCCESS_VERBIAGE from "@salesforce/label/c.Success_Toast_Title";
import NEXT_LABEL from "@salesforce/label/c.Next_Button_Label";
import ERROR_MESSAGE from "@salesforce/label/c.Frontier_Customer_Validation_Error_Message";
import VALIDATION_TITLE from "@salesforce/label/c.Frontier_Customer_Validation_Result_Title";
import RADIO_LABEL from "@salesforce/label/c.Frontier_Customer_Validation_Radio_Label";
import MODAL_WORDING from "@salesforce/label/c.Frontier_Customer_Validation_Modal_Wording";
import MODAL_TITLE from "@salesforce/label/c.Frontier_Customer_Validation_Modal_Title";
export default class Poe_lwcBuyflowFrontierProductTabModal extends LightningElement {
    @api controlNumber;
    @api environmentCode;
    @api productIds;
    @api cart;
    @api isGuestUser;
    @api agentId;
    @api productSelected;
    @api acp;
    @api frontierUserId;
    quoteId;
    accountUuid;
    newCustomerSuccess;
    newCustomerError;
    showLoading;
    upgradeModal = false;
    orderBlocked = true;
    options = [
        { label: "The customer is moving to this address", value: "moving" },
        { label: "The customer wants to upgrade services", value: "upgrade" }
    ];
    labels = {
        radioLabel: RADIO_LABEL,
        wording: MODAL_WORDING,
        validationResult: VALIDATION_TITLE,
        errorMessage: ERROR_MESSAGE,
        success: SUCCESS_VERBIAGE,
        nextButton: NEXT_LABEL,
        title: MODAL_TITLE
    };
    value;

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: "cancel"
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleOptions(e) {
        this.value = e.target.value;
        if (this.value === "upgrade") {
            this.orderBlocked = true;
            this.newCustomerError = true;
        } else {
            this.orderBlocked = false;
            this.newCustomerError = false;
        }
    }

    handleClick() {
        if (!this.upgradeModal) {
            let info = {
                quoteId: this.quoteId,
                accountUuid: this.accountUuid,
                cart: this.cart,
                productSelected: this.productSelected
            };
            if (!this.acp) {
                const closeModalEvent = new CustomEvent("productselection", {
                    bubbles: true,
                    composed: true,
                    detail: info
                });
                this.dispatchEvent(closeModalEvent);
            } else {
                const closeModalEvent = new CustomEvent("showacp", {
                    detail: info
                });
                this.dispatchEvent(closeModalEvent);
            }
        } else {
            this.showLoading = true;
            this.orderBlocked = true;
            this.newCustomerValidation();
        }
    }

    connectedCallback() {
        this.customerCallout();
    }

    customerCallout() {
        this.showLoading = true;
        const path = "products/frapi";
        let myData = {
            partnerName: "frapi",
            path,
            agent: this.isGuestUser ? "online" : this.agentId,
            customerType: "Residential",
            assisted: true,
            environmentCode: this.environmentCode,
            activeAddressReason: "NewToAddress",
            controlNumber: this.controlNumber,
            requestingApplication: "PartnerDirect",
            userId: this.frontierUserId,
            tracking: [
                {
                    key: "selfInstallSalesJourney",
                    value: "TRUE"
                }
            ]
        };
        console.log("Customer Validation Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let responseParsed = JSON.parse(response);
                console.log("Customer Validation Response", responseParsed);
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
                    this.orderBlocked = true;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.showLoading = false;
                } else {
                    this.quoteId = responseParsed.quoteId;
                    this.accountUuid = responseParsed.accountUuid;
                    let hasActiveService = responseParsed.hasActiveServiceAtAddress;
                    if (!hasActiveService) {
                        this.showLoading = false;
                        this.newCustomerSuccess = true;
                        this.orderBlocked = false;
                    } else {
                        this.showLoading = false;
                        this.orderBlocked = true;
                        this.upgradeModal = true;
                    }
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
            });
    }

    newCustomerValidation() {
        this.upgradeModal = false;
        const path = "products/frapi";
        let myData = {
            partnerName: "frapi",
            path,
            quoteId: this.quoteId,
            type: "New Customer",
            userId: this.frontierUserId
        };
        console.log("New Customer Validation Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let responseParsed = JSON.parse(response);
                console.log("New Customer Validation Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = `${
                        responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.orderBlocked = true;
                } else {
                    this.newCustomerSuccess = true;
                    this.orderBlocked = false;
                }
                this.showLoading = false;
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
                this.orderBlocked = true;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
                this.showLoading = false;
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Products",
            component: "poe_lwcBuyflowFrontierCustomerValidationModal",
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