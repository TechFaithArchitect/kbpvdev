import { api } from "lwc";
import LightningModal from "lightning/modal";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";

import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";

import EMAIL_NOT_SENT_ERROR_MESSAGE from "@salesforce/label/c.Earthlink_Email_Not_Sent_Error_Message";
import SERVER_ERROR_TOAST_TITLE from "@salesforce/label/c.Server_Error_Toast_Title";
import SUCCESS_TOAST_TITLE from "@salesforce/label/c.Success_Toast_Title";
import EMAIL_SENT_MESSAGE from "@salesforce/label/c.Earthlink_Email_Sent_Message";
import EMAIL_BROADBAND_LABEL_MODAL_TITLE from "@salesforce/label/c.Earthlink_Email_Broadband_Label_Modal_Title";
import EMAIL_BROADBAND_LABEL_MODAL_INSTRUCTIONS from "@salesforce/label/c.Earthlink_Email_Broadband_Label_Modal_Instructions";
import CANCEL_BUTTON_LABEL from "@salesforce/label/c.Cancel_Button_Label";
import CONFIRM_BUTTON_LABEL from "@salesforce/label/c.Confirm_Button_Label";
import EMAIL_BROADBAND_LABEL_MODAL_PRODUCT_FIELD_LABEL from "@salesforce/label/c.Earthlink_Email_Broadband_Label_Modal_Product_Field_Label";
import EMAIL_BROADBAND_LABEL_MODAL_EMAIL_FIELD_LABEL from "@salesforce/label/c.Earthlink_Email_Broadband_Label_Modal_Email_Field_Label";
import PRODUCT_FIELD_PLACEHOLDER from "@salesforce/label/c.Product_Field_Placeholder";
import EMAIL_FIELD_PLACEHOLDER from "@salesforce/label/c.Email_Field_Placeholder";

const EMAIL_REGEX = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
export default class Poe_lwcSelfServiceEarthlinkEmailLabelModal extends LightningModal {
    @api products;
    @api promoCode;
    @api logId;
    @api isGuestUser;
    @api broadbandLabels = [];
    product;
    productOptions;
    email;
    loaderSpinner;
    labels = {
        EMAIL_BROADBAND_LABEL_MODAL_TITLE,
        EMAIL_BROADBAND_LABEL_MODAL_INSTRUCTIONS,
        CANCEL_BUTTON_LABEL,
        CONFIRM_BUTTON_LABEL,
        EMAIL_BROADBAND_LABEL_MODAL_PRODUCT_FIELD_LABEL,
        EMAIL_BROADBAND_LABEL_MODAL_EMAIL_FIELD_LABEL,
        PRODUCT_FIELD_PLACEHOLDER,
        EMAIL_FIELD_PLACEHOLDER
    };

    get confirmBtnClass() {
        return `${this.noInfo ? "btn-disabled" : ""} btn-provider-color btn-only-rounded`;
    }

    get noInfo() {
        return !this.product || !EMAIL_REGEX.test(this.email);
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.productOptions = this.products.map((item) => {
            return {
                value: item.Id,
                label: item.Name
            };
        });

        if (this.productOptions && this.productOptions.length) {
            this.product = this.productOptions[0].value;
        }
    }

    handleChange(event) {
        if (event.target.name === "products") {
            this.product = event.target.value;
        } else {
            this.email = event.target.value;
        }
    }

    hideModal() {
        this.close("");
    }

    handleConfirm() {
        this.loaderSpinner = true;
        const path = "sendLabel";
        let myData = {
            path,
            partnerName: "earthlink",
            callLogId: this.logId,
            serviceRef: this.product,
            promoCode: this.promoCode,
            emailAddress: this.email
        };
        console.log("Send Email Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Send Email Response", responseParsed);
                if (responseParsed.hasOwnProperty("error")) {
                    let errorMessage;
                    if (Object.keys(responseParsed.error).length == 0) {
                        errorMessage = EMAIL_NOT_SENT_ERROR_MESSAGE;
                    } else if (
                        responseParsed.error.hasOwnProperty("code") &&
                        responseParsed.error.code.hasOwnProperty("msg")
                    ) {
                        errorMessage = responseParsed.error.code.msg;
                    } else {
                        errorMessage = `${responseParsed.message !== undefined ? responseParsed.message : ""} ${
                            responseParsed.error.hasOwnProperty("provider")
                                ? responseParsed.error.provider.message.hasOwnProperty("message")
                                    ? responseParsed.error.provider.message.message
                                    : responseParsed.error.provider.message
                                : responseParsed.error.message
                        }`;
                    }
                    const event = new ShowToastEvent({
                        title: SERVER_ERROR_TOAST_TITLE,
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.handleLogError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    if (responseParsed.hasOwnProperty("message") && responseParsed.message === "Not Found") {
                        const event = new ShowToastEvent({
                            title: SERVER_ERROR_TOAST_TITLE,
                            variant: "error",
                            mode: "sticky",
                            message: EMAIL_NOT_SENT_ERROR_MESSAGE
                        });
                        this.dispatchEvent(event);
                        this.handleLogError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    } else {
                        if (
                            responseParsed.hasOwnProperty("fccLabel") &&
                            this.broadbandLabels.find((label) => label.serviceRef === myData.serviceRef) === undefined
                        ) {
                            let updatedBroadbandLabels = [...this.broadbandLabels];
                            updatedBroadbandLabels.push(responseParsed.fccLabel);

                            this.close({ detail: updatedBroadbandLabels });
                        }
                        const event = new ShowToastEvent({
                            title: SUCCESS_TOAST_TITLE,
                            variant: "success",
                            message: EMAIL_SENT_MESSAGE
                        });
                        this.dispatchEvent(event);
                    }
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = EMAIL_NOT_SENT_ERROR_MESSAGE;
                const event = new ShowToastEvent({
                    title: SERVER_ERROR_TOAST_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.handleLogError({
                        error: `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.handleLogError({
                        error: errMsg,
                        type: INTERNAL_ERRROR
                    });
                }
                this.loaderSpinner = false;
            });
    }

    handleLogError(data) {
        let errorLog = {
            type: data.type,
            provider: "Earthlink",
            tab: "Products",
            component: "poe_lwcBuyflowEarthlinkEmailLabelModal",
            error: data.error,
            endpoint: data.endpoint,
            request: JSON.stringify(data.request),
            opportunity: data.opportunity
        };

        let event = new CustomEvent("logerror", {
            detail: errorLog
        });
        this.dispatchEvent(event);
    }
}