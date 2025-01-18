import { LightningElement, api, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import ToastContainer from "lightning/toastContainer";
import convertDates from "@salesforce/apex/InstallationTPVTabController.convertDatesTimeZone";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getOnlyLettersRegEx from "@salesforce/apex/POE_RegExObtainer.getOnlyLettersRegEx";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import SELECT_AVAILABLE_DATE_TIME_FIELD_LABEL from "@salesforce/label/c.Select_Available_Date_Time_Field_Label";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";

export default class Poe_lwcBuyflowFrontierInstallationTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api cart;
    @api logo;
    @api quoteId;
    @api customer;
    @api frontierUserId;
    @api isGuestUser;
    @api timeZone;
    @api installationOptions;
    @api customerTN;
    @api quoteNumber;

    @track onlyLettersRegEx;
    @wire(getOnlyLettersRegEx) onlyLettersRegExParse({ data, error }) {
        if (data) {
            this.onlyLettersRegEx = data;
        } else if (error) {
            console.error(error);
        }
    }
    get onlyLettersRegExPattern() {
        return this.onlyLettersRegEx?.result?.expression;
    }
    get onlyLettersRegExErrorMessage() {
        return this.onlyLettersRegEx?.result?.errorMessage;
    }

    showCollateral = false;
    loaderSpinner;
    dateValue = {};
    earliestDate = {};
    noCompleteInfo = true;
    value;
    options = [];
    timeOut = false;
    installWindows = [];
    someoneOlderWillBePresent = false;
    anotherPersonWillBeAtInstallationAppointment = false;
    firstName;
    lastName;
    primaryPhoneNumber;
    secondaryPhoneNumber;
    showCreditCheckQuoteAssistanceModal;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        SELECT_AVAILABLE_DATE_TIME_FIELD_LABEL
    };
    showSelfServiceCancelModal = false;
    isFullInstall = true;
    createOptionsRequest = {};
    oneInstallationOption = false;
    installationOption;
    installationValues = [];
    installationCreated = false;
    showInstall = false;
    showPicker = false;
    installDropdownLabel = "Please select an available installation date/time from the dropdown:";
    availableDateTimeOptions = [];

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.handleInstallationOptions();
    }

    handleInstallationOptions() {
        this.createOptionsRequest = {
            partnerName: "frapi",
            userId: this.frontierUserId,
            quoteId: this.quoteId,
            installationOptions: [...this.installationOptions]
        };
        this.installationValues = [
            ...this.installationOptions.map((item) => {
                return {
                    label: `${item.pricing[0].Name} - ${item.pricing[0].Description}`,
                    value: item.installationOption
                };
            })
        ];
        this.installationOption = [...this.installationOptions.filter((item) => item.active)][0].installationOption;
        this.oneInstallationOption = this.installationValues.length === 1;
        if (this.oneInstallationOption) {
            this.handleCreateInstallationOptions(true);
        } else {
            this.disableValidations();
        }
    }

    handleCreateInstallationOptions(start) {
        this.loaderSpinner = true;
        const path = "createInstallOptions";
        let myData = {
            path,
            ...this.createOptionsRequest
        };
        console.log("Create Install Options Request: ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Create Install Options Response: ", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("result") &&
                        responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error
                        : responseParsed.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.oneInstallationOption = true;
                    this.installationCreated = true;
                    this.showInstall = true;
                    this.noCompleteInfo = true;
                    this.isFullInstall = this.installationOption === "FULL_INSTALL";
                    this.installDropdownLabel = `Please select an available ${
                        this.isFullInstall ? "installation" : "activation"
                    } date/time from the dropdown:`;
                    const event = new ShowToastEvent({
                        title: `${this.isFullInstall ? "Install" : "Activation"} Date Selection`,
                        variant: "success",
                        mode: "sticky",
                        message: `${
                            this.isFullInstall ? "Expert Installation" : "Self Installation"
                        } confirmed, please select an available date/time.`
                    });
                    this.dispatchEvent(event);
                    this.callInstallationData();
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const genericErrorMessage = "Couldn't fetch dates from the server. Please, try again.";
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
                this.timeOut = true;
                console.log(error);
            });
    }

    handleOption(event) {
        this.installationOption = event.target.value;
        let installOpt = this.installationOptions.map((item) => {
            return {
                ...item,
                active: item.installationOption === this.installationOption,
                pricing: [{ ...item.pricing[0], Active: item.installationOption === this.installationOption }]
            };
        });
        this.createOptionsRequest.installationOptions = [...installOpt];
    }

    formatDate(days) {
        let today = new Date();
        let dateValue = new Date(today.setDate(today.getDate() + days));
        const year = dateValue.getFullYear();
        const month = `0${dateValue.getMonth() + 1}`.slice(-2);
        const day = `0${dateValue.getDate()}`.slice(-2);
        return `${year}-${month}-${day}`;
    }

    callInstallationData() {
        this.loaderSpinner = true;
        const path = "installation";

        let myData = {
            path,
            tab: "tpv",
            partnerName: "frapi",
            quoteId: this.quoteId,
            userId: this.frontierUserId,
            startDates: [
                {
                    startDate: this.formatDate(1),
                    numberDaysToReturn: "14"
                },
                {
                    startDate: this.formatDate(15),
                    numberDaysToReturn: "14"
                },
                {
                    startDate: this.formatDate(30),
                    numberDaysToReturn: "14"
                },
                {
                    startDate: this.formatDate(45),
                    numberDaysToReturn: "14"
                },
                {
                    startDate: this.formatDate(60),
                    numberDaysToReturn: "1"
                }
            ]
        };
        console.log("Installation Request: ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Installation Response: ", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error
                        : responseParsed.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.timeOut = true;
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    let result = responseParsed;
                    if (result.installWindows !== undefined) {
                        result.installWindows.forEach((window) => {
                            if (
                                window.hasOwnProperty("scheduleId") &&
                                !this.installWindows.some((slot) => slot.scheduleId == window.scheduleId)
                            ) {
                                this.installWindows.push(window);
                            }
                        });
                        this.earliestDate = this.installWindows[0].date;
                        let windows = this.installWindows.map((e) => {
                            return { ...e, day: e.date };
                        });
                        this.handleConvertDates(windows);
                    } else {
                        this.loaderSpinner = false;
                        this.disableValidations();
                    }
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const genericErrorMessage = "Couldn't fetch dates from the server. Please, try again.";
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
                this.timeOut = true;
                console.log(error);
            });
    }

    handleConvertDates(data) {
        let myData = {
            timeZone: this.timeZone.timeZone,
            data: JSON.stringify(data)
        };
        console.log("Convert Slots Request", myData);
        convertDates({ inputMap: myData })
            .then((response) => {
                console.log("Convert Slots Response", response);
                let availableDateTimeOptions = [];
                let convertedSlots = [...response.result.slot];
                this.installWindows.forEach((item, index) => {
                    let dateValue = convertedSlots[index].startTime.substring(0, 10).trim();
                    let startDate = convertedSlots[index].startTime.substring(10).trim();
                    let endDate = convertedSlots[index].endTime.substring(10).trim();
                    availableDateTimeOptions.push({
                        date: dateValue,
                        timeSlot: `${startDate} - ${endDate}`,
                        value: String(item.scheduleId)
                    });
                });
                this.availableDateTimeOptions = [...availableDateTimeOptions];
                this.showPicker = true;
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The installation dates could not be retrieved. Please try again."
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handleInstallationTimeChange(event) {
        this.value = undefined;
        if (event.detail.hasOwnProperty("dateValue") && event.detail.hasOwnProperty("timeValue")) {
            let date = event.detail.dateValue;
            let time = event.detail.timeValue;
            this.value = [
                ...this.availableDateTimeOptions.filter((item) => item.date === date && item.timeSlot === time)
            ][0].value;
        }
        this.disableValidations();
    }

    handleCheckboxChange(e) {
        const checkboxName = e.target.name;
        this[checkboxName] = e.target.checked;
        this.disableValidations();
    }

    handleChange(e) {
        let phonere = /^\d{10}$/;
        switch (e.target.name) {
            case "firstName":
                this.firstName = e.target.value !== "" ? e.target.value : undefined;
                break;
            case "lastName":
                this.lastName = e.target.value !== "" ? e.target.value : undefined;
                break;
            case "primaryPhoneNumber":
                this.primaryPhoneNumber = e.target.value !== "" ? e.target.value : undefined;
                break;
            case "secondaryPhoneNumber":
                this.secondaryPhoneNumber = phonere.test(e.target.value) ? e.target.value : undefined;
                break;
        }
        this.disableValidations();
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
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

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleRefreshDates(event) {
        this.timeOut = false;
        this.callInstallationData();
    }

    disableValidations() {
        let phonere = /^\d{10}$/;
        let onlyLetters = new RegExp(this.onlyLettersRegEx.result.expression);
        let nameWithOnlyLetterCharacters = onlyLetters.test(this.firstName) && onlyLetters.test(this.lastName);

        this.noCompleteInfo = this.installationCreated
            ? !(
                  this.installationOption !== undefined &&
                  this.value !== undefined &&
                  this.availableDateTimeOptions.length > 0 &&
                  (!this.isFullInstall ||
                      (this.someoneOlderWillBePresent &&
                          ((this.anotherPersonWillBeAtInstallationAppointment &&
                              this.firstName !== undefined &&
                              this.lastName !== undefined &&
                              nameWithOnlyLetterCharacters &&
                              this.primaryPhoneNumber !== undefined &&
                              phonere.test(this.primaryPhoneNumber)) ||
                              !this.anotherPersonWillBeAtInstallationAppointment)))
              )
            : this.installationOption === undefined;
    }

    handleClick() {
        if (this.installationCreated) {
            this.callFinalInstallationData();
        } else {
            this.handleCreateInstallationOptions(false);
        }
    }

    handleReserveInstallation() {
        this.loaderSpinner = true;
        let name = this.anotherPersonWillBeAtInstallationAppointment
            ? `${this.firstName} ${this.lastName}`
            : `${this.customer.contactInfo.firstName} ${this.customer.contactInfo.lastName}`;
        let phone = this.anotherPersonWillBeAtInstallationAppointment
            ? this.primaryPhoneNumber
            : this.customer.contactInfo.phone;
        const path = "reserveInstallation";
        let myData = {
            path,
            tab: "reserve",
            partnerName: "frapi",
            quoteId: this.quoteId,
            scheduleId: this.value,
            contact: {
                name: name,
                primaryPhoneNumber: phone
            },
            userId: this.frontierUserId
        };
        console.log("Reserve Installation Request: ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Reserve Installation Response: ", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage =
                        responseParsed.hasOwnProperty("error") && responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message
                            : responseParsed.error;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    let installationDate;
                    this.installWindows.forEach((item) => {
                        if (item.scheduleId == this.value) {
                            installationDate = item.date;
                        }
                    });
                    let data = {
                        installationDetails: responseParsed,
                        date: installationDate,
                        earliestDate: this.earliestDate
                    };
                    const closeModalEvent = new CustomEvent("next", {
                        detail: data
                    });
                    this.dispatchEvent(closeModalEvent);
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const genericErrorMessage = "Couldn't fetch dates from the server. Please, try again.";
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
                console.log(error);
            });
    }

    callFinalInstallationData() {
        this.loaderSpinner = true;
        const path = "installation";
        let dateSlot = [...this.availableDateTimeOptions.filter((item) => item.value === this.value)][0].date;
        let dateValue = new Date(dateSlot);
        const year = dateValue.getFullYear();
        const month = `0${dateValue.getMonth() + 1}`.slice(-2);
        const day = `0${dateValue.getDate()}`.slice(-2);
        let myData = {
            path,
            tab: "tpv",
            partnerName: "frapi",
            quoteId: this.quoteId,
            userId: this.frontierUserId,
            startDates: [
                {
                    startDate: `${year}-${month}-${day}`,
                    numberDaysToReturn: "14"
                }
            ]
        };
        console.log("Final Installation Request: ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Final Installation Response: ", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error
                        : responseParsed.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    if (
                        responseParsed.hasOwnProperty("installWindows") &&
                        responseParsed.installWindows.some((e) => e.scheduleId == this.value)
                    ) {
                        this.handleReserveInstallation();
                    } else {
                        const event = new ShowToastEvent({
                            title: "Error",
                            variant: "error",
                            mode: "sticky",
                            message:
                                "The installation slot selected is no longer available. Please select a new one from the calendar."
                        });

                        this.dispatchEvent(event);
                        this.loaderSpinner = false;
                    }
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const genericErrorMessage = "Couldn't fetch dates from the server. Please, try again.";
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
                this.timeOut = true;
                console.log(error);
            });
    }

    handleShowCCQuoteAssistanceModal() {
        this.showCreditCheckQuoteAssistanceModal = true;
    }

    handleCloseCCQuoteAssistanceModal() {
        this.showCreditCheckQuoteAssistanceModal = false;
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Installation",
            component: "poe_lwcBuyflowFrontierInstallationTab",
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
            tab: "Installation"
        };
        this.dispatchEvent(event);
    }
}