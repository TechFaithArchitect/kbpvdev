import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { NavigationMixin } from "lightning/navigation";

import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getTPVSettings from "@salesforce/apex/InstallationTPVTabController.getTPVSettings";

import SELF_SERVICE_VALIDATE_LEAVING_MESSAGE from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import SELF_SERVICE_VALIDATE_LEAVING_TITLE from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import SERVER_ERROR_TOAST_TITLE from "@salesforce/label/c.Server_Error_Toast_Title";
import INSTALLATION_DATE_NOT_AVAILABLE_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_Installation_Date_Not_Available_Error_Message";
import INSTALLATION_REQUEST_GENERIC_ERROR_MESSAGE from "@salesforce/label/c.Installation_Request_Generic_Error_Message";
import PLEASE_TRY_AGAIN_ERROR_MESSAGE from "@salesforce/label/c.Please_Try_Again_Error_Message";
import BAD_REQUEST_ERROR_MESSAGE from "@salesforce/label/c.Bad_Request_Error_Message";
import TPV_PLEASE_CALL_HEADER from "@salesforce/label/c.TPV_Please_Call_Header";
import TPV_PHONE_NUMBER_HEADER from "@salesforce/label/c.TPV_Phone_Number_Header";
import TPV_REFERENCE_NUMBER_INSTRUCTIONS_HEADER from "@salesforce/label/c.TPV_Reference_Number_Instructions_Header";
import TPV_REFERENCE_NUMBER_INSTRUCTIONS_HEADER_2 from "@salesforce/label/c.TPV_Reference_Number_Instructions_Header_2";
import SELECT_AVAILABLE_DATE_TIME_FIELD_LABEL from "@salesforce/label/c.Select_Available_Date_Time_Field_Label";
import REFRESH_DATES_BUTTON_LABEL from "@salesforce/label/c.Refresh_Dates_Button_Label";
import SERVICE_INFO_TITLE from "@salesforce/label/c.Service_Info_Title";
import TPV_INTERNAL_UNHANDLED_SERVER_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_TPV_Internal_Unhandled_Server_Error_Message";
import TPV_TIMEOUT_ERROR_MESSAGE from "@salesforce/label/c.EarthLink_TPV_Timeout_Error_Message";

const INTERNAL_ERRROR = "Internal Error";
const API_ERROR = "API Error";

export default class Poe_lwcBuyflowEarthlinkTPVTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api referenceNumber;
    @api clientInfo;
    @api logo;
    @api dateSelected;
    @api shippingAddress;
    @api selectedProduct;
    @api isGuestUser;
    creditCheck = {
        firstName: "",
        lastName: "",
        shippingAddress: "",
        shippingCity: "",
        shippingState: "",
        shippingZip: ""
    };
    loaderSpinner;
    TPVText;
    dateValue;
    earliestDate;
    noCompleteInfo = true;
    isCallCenter = true;
    showCollateral = false;
    options = [];
    timeOut = false;
    error = false;
    labels = {
        SELF_SERVICE_VALIDATE_LEAVING_TITLE,
        SELF_SERVICE_VALIDATE_LEAVING_MESSAGE,
        INSTALLATION_DATE_NOT_AVAILABLE_ERROR_MESSAGE,
        TPV_PLEASE_CALL_HEADER,
        TPV_PHONE_NUMBER_HEADER,
        TPV_REFERENCE_NUMBER_INSTRUCTIONS_HEADER,
        TPV_REFERENCE_NUMBER_INSTRUCTIONS_HEADER_2,
        SELECT_AVAILABLE_DATE_TIME_FIELD_LABEL,
        REFRESH_DATES_BUTTON_LABEL,
        SERVICE_INFO_TITLE
    };
    showSelfServiceCancelModal = false;
    availableDateTimeOptions;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get showDatePicker() {
        return !this.error && this.availableDateTimeOptions && this.availableDateTimeOptions.length > 0;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.creditCheck = {
            firstName: this.clientInfo.contactInfo.firstName,
            lastName: this.clientInfo.contactInfo.lastName,
            shippingAddress: `${this.shippingAddress.addressLine1} ${this.shippingAddress.addressLine2}`,
            shippingCity: this.shippingAddress.city,
            shippingState: this.shippingAddress.state,
            shippingZip: this.shippingAddress.zipCode
        };
        this.callTPVData();
    }

    handleRefresh() {
        this.callTPVData();
    }

    callTPVData() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };

        getTPVSettings({ myData })
            .then((response) => {
                this.TPVText = response.result.TPVText === "Yes";
                this.tpvCallout();
            })
            .catch((error) => {
                this.loaderSpinner = false;
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERRROR
                });
                console.log(error);
            });
    }

    tpvCallout() {
        this.noCompleteInfo = true;
        this.loaderSpinner = true;
        let myData = {
            partnerName: "earthlink",
            path: "installation",
            callLogId: this.selectedProduct.callLogId,
            serviceRef: this.selectedProduct.servRef
        };
        console.log("Installation Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Installation Response", responseParsed);
                let slots = responseParsed.hasOwnProperty("installWindows") ? responseParsed.installWindows : [];
                let hasError =
                    responseParsed.hasOwnProperty("error") ||
                    (responseParsed.hasOwnProperty("result") && responseParsed.result.hasOwnProperty("message"));
                let badRequest = responseParsed.hasOwnProperty("info") ? responseParsed.info.statusCode == 400 : false;
                if (hasError || badRequest) {
                    this.error = true;
                    this.noCompleteInfo = false;
                    let msg;
                    if (hasError) {
                        msg =
                            responseParsed.hasOwnProperty("error") && responseParsed.error.hasOwnProperty("provider")
                                ? responseParsed.error.provider.message
                                : responseParsed.error.hasOwnProperty("message")
                                ? responseParsed.error.message
                                : responseParsed.error;
                        const event = new ShowToastEvent({
                            title: SERVER_ERROR_TOAST_TITLE,
                            variant: "error",
                            mode: "sticky",
                            message: `${INSTALLATION_REQUEST_GENERIC_ERROR_MESSAGE}: ${msg}`
                        });
                        this.dispatchEvent(event);
                        if (msg === TPV_TIMEOUT_ERROR_MESSAGE || msg === TPV_INTERNAL_UNHANDLED_SERVER_ERROR_MESSAGE) {
                            this.timeOut = true;
                        }
                    } else if (badRequest) {
                        msg = `${INSTALLATION_REQUEST_GENERIC_ERROR_MESSAGE}: ${BAD_REQUEST_ERROR_MESSAGE}`;
                        const event = new ShowToastEvent({
                            title: SERVER_ERROR_TOAST_TITLE,
                            variant: "error",
                            mode: "sticky",
                            message: msg
                        });
                        this.dispatchEvent(event);
                    }
                    this.handleLogError({
                        error: msg,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                    this.loaderSpinner = false;
                } else {
                    this.error = false;
                    this.timeOut = false;
                    this.availableDateTimeOptions = [];
                    if (slots.length > 0) {
                        slots.forEach((slot) => {
                            this.availableDateTimeOptions.push({
                                date: slot.date,
                                timeSlot: `${slot.startTime} - ${slot.endTime}`
                            });
                        });
                        this.earliestDate = slots[0];
                    }
                    if (this.dateSelected !== null || this.dateSelected !== undefined) {
                        this.dateValue = this.dateSelected;
                        let valueFound = false;
                        for (const datetime of this.availableDateTimeOptions) {
                            valueFound = this.dateValue === `${datetime.date} ${datetime.timeSlot}`;
                            if (valueFound) {
                                break;
                            }
                        }
                        this.noCompleteInfo = !valueFound;
                    }
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                this.error = true;
                this.noCompleteInfo = false;
                const event = new ShowToastEvent({
                    title: SERVER_ERROR_TOAST_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: `${INSTALLATION_REQUEST_GENERIC_ERROR_MESSAGE}. ${PLEASE_TRY_AGAIN_ERROR_MESSAGE}`
                });
                this.dispatchEvent(event);
                console.log(error);
                const errMsg = error.body?.message || error.message;
                if (apiResponse) {
                    this.handleLogError({
                        error: `${errMsg}\nAPI Response: ${apiResponse}`,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                } else {
                    this.handleLogError({
                        error: errMsg,
                        type: INTERNAL_ERRROR
                    });
                }
                this.loaderSpinner = false;
            });
    }

    handleInstallationTimeChange(event) {
        this.dateValue = `${event.detail.dateValue} ${event.detail.timeValue}`;
        this.noCompleteInfo = !this.dateValue || this.dateValue.includes(String(undefined));
    }

    handleCancel() {
        if (this.isGuestUser) {
            this.showSelfServiceCancelModal = true;
        } else {
            this[NavigationMixin.Navigate]({
                type: "standard__recordPage",
                attributes: {
                    recordId: this.recordId,
                    objectApiName: "Opportunity",
                    actionName: "view"
                }
            });
        }
    }
    hideSelfServiceModal() {
        this.showSelfServiceCancelModal = false;
    }

    selfServiceReturnToHomePage() {
        const goBackEvent = new CustomEvent("home", {
            detail: "",
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(goBackEvent);
    }

    handleGoBack() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleGoToConfirmation() {
        let dateV = !this.dateValue ? "" : this.dateValue;
        const forwardEvent = new CustomEvent("tpvnext", {
            detail: {
                selectedDate: dateV,
                earliestDate: this.earliestDate
            }
        });
        this.dispatchEvent(forwardEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleRefreshDates(event) {
        this.tpvCallout();
    }

    handleLogError(data) {
        let errorLog = {
            type: data.type,
            provider: "Earthlink",
            tab: "Installation - TPV",
            component: "poe_lwcBuyflowEarthlinkTPVTab",
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