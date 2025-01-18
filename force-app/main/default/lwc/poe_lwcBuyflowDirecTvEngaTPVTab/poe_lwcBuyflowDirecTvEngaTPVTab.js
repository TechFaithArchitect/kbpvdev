import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { NavigationMixin } from "lightning/navigation";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import updateOrderApex from "@salesforce/apex/InstallationTPVTabController.updateOrder";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";

export default class Poe_lwcBuyflowDirecTvEngaTPVTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api orderInfo;
    @api cartInfo;
    @api clientInfo;
    @api logo;
    @api returnUrl;
    @api verbiages;
    @api orderId;
    @api sfOrderId;
    @api isGuestUser;
    showCollateral = false;
    loaderSpinner;
    dateValue = {};
    noCompleteInfo = true;
    value;
    options = [];
    timeOut = false;
    buttonLabel = "Refresh Dates";
    installWindows;
    earliestDate;
    installStatus;
    confirmStatus;
    installKey;
    confirmKey;
    notes = "";
    installAgreement = false;
    showInstallationPicker = true;
    noInstallationVerbiage =
        "The customer's installation appointment cannot be scheduled at this time. The customer will be contacted within 24-72 hours to schedule an appointment.";
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage
    };
    showSelfServiceCancelModal = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        this.callInstallationData();
    }

    get skipInstallConfirmation() {
        return !this.showInstallationPicker;
    }

    handleRefresh() {
        this.callInstallationData();
    }

    delay(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    handleAgreement(event) {
        this.installAgreement = event.target.checked;
        this.noCompleteInfo = !(this.installAgreement && Object.keys(this.dateValue).length > 0);
    }

    callInstallationData() {
        this.loaderSpinner = true;
        const today = new Date();
        const startDate = this.orderInfo.dealerCode === "FFL" ? new Date(today.setDate(today.getDate() + 1)) : today;
        const path = "availableDates";
        let myData = {
            path,
            ...this.orderInfo,
            startDate: startDate.toLocaleDateString("fr-CA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }),
            numberOfDays: 15,
            omsOrderId: this.orderId
        };
        console.log("Get Installation Key Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Get Installation Key Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.loaderSpinner = false;
                } else {
                    this.installKey = { ...result.content };
                    const event = new ShowToastEvent({
                        title: "Waiting Confirmation",
                        variant: "warning",
                        message: "Fetching timeslots from the server. Expected time: one minute."
                    });
                    this.dispatchEvent(event);
                    this.delay(70000).then(() => this.getInstallationData());
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The Get Installation request could not be made correctly to the server. Please, validate the information and try again.";
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
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.loaderSpinner = false;
            });
    }

    getInstallationData() {
        this.loaderSpinner = true;
        const path = "availableDates";
        let myData = {
            path,
            ...this.orderInfo,
            callback: {
                content: {
                    ...this.installKey
                }
            }
        };
        console.log("Get Installation Dates Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Get Installation Dates Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("status")
                                ? result.error.provider.message.status
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.installStatus = "Failure";
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.installStatus = result.status;
                    if (
                        result.status === "Complete" &&
                        ((result.value.hasOwnProperty("data") && result.value.data !== null) ||
                            (result.value.hasOwnProperty("result") && result.value.result.status !== "failure"))
                    ) {
                        let installWindows = [];
                        this.installWindows = [...result.value.data.availableDatesList.availableDate];
                        this.installWindows.forEach((item, index) => {
                            let formattedDate = `${item.installStartDateTime.substring(
                                4,
                                8
                            )}/${item.installStartDateTime.substring(2, 4)}/${item.installStartDateTime.substring(
                                0,
                                2
                            )}`;
                            installWindows.push({
                                label: String(
                                    formattedDate +
                                        " " +
                                        item.installStartDateTime.slice(-5) +
                                        " - " +
                                        item.installEndDateTime.slice(-5)
                                ),
                                value: String(index)
                            });
                        });
                        this.options = [...installWindows];
                        this.earliestDate = installWindows[0];
                        this.timeOut = false;
                    } else if (
                        result.status === "Complete" &&
                        ((result.value.hasOwnProperty("data") && result.value.data === null) ||
                            (result.value.hasOwnProperty("result") && result.value.result.status === "failure"))
                    ) {
                        this.timeOut = false;
                        this.showInstallationPicker = false;
                        this.noCompleteInfo = false;
                    } else {
                        this.installStatus = "Failure";
                        if (result.status.toLowerCase() === "in progress") {
                            const genericErrorMessage =
                                "Transaction is still in progress, please wait 30 seconds and try again.";
                            const warningToastEvent = new ShowToastEvent({
                                title: "Transaction In Progress",
                                variant: "warning",
                                mode: "sticky",
                                message: genericErrorMessage
                            });
                            this.dispatchEvent(warningToastEvent);
                        }
                        this.timeOut = true;
                        this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    }
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The Get Installation Dates request could not be made correctly to the server. Please, validate the information and try again.";
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
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.loaderSpinner = false;
            });
    }

    handleDate(event) {
        this.value = event.target.value;
        this.dateValue = this.installWindows[Number(event.target.value)];
        this.daleValue.earliestDate = this.earliestDate;
        this.noCompleteInfo = this.installAgreement && event.target.value !== undefined ? false : true;
    }

    handleCancel() {
        if (this.returnUrl != undefined) {
            window.open(this.returnUrl, "_self");
        } else if (this.isGuestUser) {
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
        if (this.skipInstallConfirmation) {
            this.loaderSpinner = true;
            const forwardEvent = new CustomEvent("tpvnext", {
                detail: this.dateValue
            });
            this.dispatchEvent(forwardEvent);
        } else if (this.confirmStatus === "Failure" || this.confirmStatus === undefined) {
            this.submitConfirmation();
        } else this.getInstallConfirmation();
    }

    submitConfirmation() {
        this.loaderSpinner = true;
        const path = "installation";
        let myData = {
            path,
            ...this.orderInfo,
            omsOrderId: this.orderId,
            startTS: this.dateValue.installStartDateTime,
            endTS: this.dateValue.installEndDateTime,
            rescheduleReasonCode: "",
            name: `${this.clientInfo.contactInfo.firstName} ${this.clientInfo.contactInfo.lastName}`,
            contactNumber: this.clientInfo.contactInfo.phone,
            technicianNotes: this.notes !== undefined ? this.notes : ""
        };
        console.log("Confirm Installation Dates Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Confirm Installation Dates Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.loaderSpinner = false;
                } else {
                    this.confirmKey = { ...result.content };
                    const event = new ShowToastEvent({
                        title: "Waiting Confirmation",
                        variant: "warning",
                        message: "Getting selected timeslot confirmation from the server. Expected time: one minute."
                    });
                    this.dispatchEvent(event);
                    this.delay(70000).then(() => this.getInstallConfirmation());
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The Get Installation Dates request could not be made correctly to the server. Please, validate the information and try again.";
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
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.loaderSpinner = false;
            });
    }

    getInstallConfirmation() {
        this.loaderSpinner = true;
        const path = "installation";
        let myData = {
            path,
            ...this.orderInfo,
            callback: {
                content: {
                    ...this.confirmKey
                }
            }
        };
        console.log("Submit Installation Dates Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Submit Installation Dates Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.confirmStatus = result.status;
                    if (result.status === "Complete" && result.value.data !== null) {
                        this.updateOrder();
                        this.timeOut = false;
                    } else {
                        if (result.status.toLowerCase() === "in progress") {
                            const genericErrorMessage =
                                "Transaction is still in progress, please wait 30 seconds and try again.";
                            const warningToastEvent = new ShowToastEvent({
                                title: "Transaction In Progress",
                                variant: "warning",
                                mode: "sticky",
                                message: genericErrorMessage
                            });
                            this.dispatchEvent(warningToastEvent);
                            this.logError(
                                `${genericErrorMessage}\nAPI Response: ${response}`,
                                myData,
                                path,
                                "API Error"
                            );
                        } else {
                            this.logError(`API Response: ${response}`, myData, path, "API Error");
                        }
                        if (
                            result.status === "Complete" &&
                            result.value.data == null &&
                            result.value.hasOwnProperty("result") &&
                            result.value.result.hasOwnProperty("status") &&
                            result.value.result.status === "failure"
                        ) {
                            this.confirmStatus = "Failure";
                        }
                    }
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The Get Installation Dates request could not be made correctly to the server. Please, validate the information and try again.";
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
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.loaderSpinner = false;
            });
    }

    updateOrder() {
        const dateStr = `${this.dateValue.installStartDateTime.substring(
            4,
            8
        )}-${this.dateValue.installStartDateTime.substring(2, 4)}-${this.dateValue.installStartDateTime.substring(
            0,
            2
        )}`;

        const myData = {
            id: this.sfOrderId,
            installationDate: dateStr
        };

        updateOrderApex({ myData })
            .then(() => {
                const forwardEvent = new CustomEvent("tpvnext", {
                    detail: this.dateValue
                });
                this.dispatchEvent(forwardEvent);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const errorMessage = error.body?.message || error.message;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error creating record",
                        message: errorMessage,
                        variant: "error"
                    })
                );
                this.logError(errorMessage);
            });
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleRefreshDates() {
        this.installStatus === "Failure" ? this.callInstallationData() : this.getInstallationData();
    }

    handleChange(event) {
        this.notes = event.target.value;
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Installation",
            component: "poe_lwcBuyflowDirecTvEngaTPVTab",
            error: errorMessage ? JSON.stringify(errorMessage) : errorMessage
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
            tab: "Installation"
        };
        this.dispatchEvent(event);
    }
}