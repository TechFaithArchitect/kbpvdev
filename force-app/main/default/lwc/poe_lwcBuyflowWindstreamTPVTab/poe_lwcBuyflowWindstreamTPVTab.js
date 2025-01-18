import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import { NavigationMixin } from "lightning/navigation";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getTPVSettings from "@salesforce/apex/InstallationTPVTabController.getTPVSettings";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import portabilityNotificationLabel from "@salesforce/label/c.Windstream_Audit_Unlimited_Phone_Port_In_Disclosure";
import moveInVerbiage from "@salesforce/label/c.Windstream_Moving_Installation_Verbiage";
import installationDisclaimer from "@salesforce/label/c.Windstream_Installation_Disclaimer";
import 	Windstream_no_install_date_can_be_provided from "@salesforce/label/c.Windstream_no_install_date_can_be_provided";
import Windstream_TPV_text_phoneNumber from "@salesforce/label/c.Windstream_TPV_text_phoneNumber";

export default class Poe_lwcBuyflowWindstreamTPVTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api referenceNumber;
    @api clientInfo;
    @api logo;
    @api dateSelected;
    @api offerId;
    @api orderInfo;
    @api selectedBuyFlow;
    @api skipInstallDateSelection;
    @api portability;
    @api creditCheckResponseVerbiage;
    @api origin;
    @api isGuestUser;
    @api additionalInfo;
    showCollateral = false;
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
    noCompleteInfo = true;
    isCallCenter = true;
    options = [];
    timeOut = false;
    installationRequired = true;
    portabilityNotification = `<h1>Installation Review.</h1><p>${portabilityNotificationLabel}</p>`;
    skipInstallDateSelectionNoPortability;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        moveInVerbiage,
        installationDisclaimer,
        Windstream_no_install_date_can_be_provided,
        Windstream_TPV_text_phoneNumber
    };
    showSelfServiceCancelModal = false;
    showNoInstallationMessage = false;
    noInstallMessage =
       this.labels.Windstream_no_install_date_can_be_provided;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get moveInFlag() {
        return this.clientInfo?.addressType === "move";
    }

    get disableCombobox() {
        return this.skipInstallDateSelection || this.showNoInstallationMessage;
    }

    connectedCallback() {
        this.skipInstallDateSelectionNoPortability = this.skipInstallDateSelection;
        if (this.creditCheckResponseVerbiage == "" || this.creditCheckResponseVerbiage == undefined) {
            this.creditCheckResponseVerbiage = this.labels.Windstream_TPV_text_phoneNumber.replace('${this.orderInfo.reviewPhoneNumber}', this.orderInfo.reviewPhoneNumber);
        }
        if (this.portability) {
            this.skipInstallDateSelectionNoPortability = false;
            this.skipInstallDateSelection = true;
        }
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.creditCheck = {
            firstName: this.clientInfo.contactInfo.firstName,
            lastName: this.clientInfo.contactInfo.lastName,
            shippingAddress: `${this.clientInfo.addressInfo.address} ${this.clientInfo.addressInfo.apt}`,
            shippingCity: this.clientInfo.addressInfo.city,
            shippingState: this.clientInfo.addressInfo.state,
            shippingZip: this.clientInfo.addressInfo.zip
        };
        if (this.skipInstallDateSelection || this.moveInFlag) {
            this.dateValue = "";
            this.installationRequired = false;
            this.noCompleteInfo = false;
        } else {
            this.callTPVData();
        }
    }

    handleRefresh() {
        this.callTPVData();
    }

    callTPVData() {
        this.loaderSpinner = true;
        if (this.isGuestUser) {
            this.tpvCallout();
        } else {
            let myData = {
                ContextId: this.recordId
            };

            getTPVSettings({ myData })
                .then((response) => {
                    this.TPVText = response.result.TPVText === "Yes" ? true : false;
                    this.tpvCallout();
                })
                .catch((error) => {
                    this.loaderSpinner = false;
                    console.log(error);
                    this.logError(error.body?.message || error.message);
                });
        }
    }

    tpvCallout() {
        const path = "installation";
        this.loaderSpinner = true;
        let myData = {
            partnerName: "windstream",
            path,
            callLogId: "",
            offerId: this.offerId,
            selectedBuyFlow: this.selectedBuyFlow,
            serviceRef: "",
            customer: {
                firstName: this.clientInfo.contactInfo.firstName,
                middleName: this.clientInfo.contactInfo.middleName,
                lastName: this.clientInfo.contactInfo.lastName,
                emailAddress: this.clientInfo.contactInfo.email,
                phoneNumber: this.clientInfo.contactInfo.phone
            },
            account: {
                contactEmail: this.clientInfo.contactInfo.email,
                customerAcceptedTC: true,
                tcSource: "",
                billingAddress: {
                    addressLine1: this.clientInfo.billingAddress.addressLine1,
                    addressLine2: this.clientInfo.billingAddress.addressLine2,
                    city: this.clientInfo.billingAddress.city,
                    state: this.clientInfo.billingAddress.state,
                    zipCode: this.clientInfo.billingAddress.zipCode,
                    county: ""
                },
                ssn: this.clientInfo.accountInfo.ssn !== undefined ? this.clientInfo.accountInfo.ssn : "",
                pin: "",
                dob: this.clientInfo.accountInfo.dob,
                drivingLicense: {
                    dlNumber:
                        this.clientInfo.accountInfo.drivingLicense.dlNumber !== undefined
                            ? this.clientInfo.accountInfo.drivingLicense.dlNumber
                            : "",
                    expDate:
                        this.clientInfo.accountInfo.drivingLicense.expDate !== undefined
                            ? this.clientInfo.accountInfo.drivingLicense.expDate
                            : "",
                    dlState:
                        this.clientInfo.accountInfo.drivingLicense.dlState !== undefined
                            ? this.clientInfo.accountInfo.drivingLicense.dlState
                            : ""
                }
            },
            payment: {
                firstName: "",
                lastName: "",
                cardType: "",
                cardNumber: "",
                cardExpMonth: "",
                cardExpYear: "",
                cvv: "",
                zipCode: ""
            },
            orderInfo: {
                selectedHsiSpeed: this.orderInfo.selectedHsiSpeed,
                selectedBundle: this.orderInfo.selectedBundle,
                selectedBundleAdders: this.orderInfo.selectedBundleAdders,
                textMsgOptin: this.additionalInfo?.textMsgOptin
            }
        };
        console.log("Installation Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Installation Response", responseParsed);
                let slots = responseParsed.hasOwnProperty("installWindows") ? responseParsed.installWindows : [];
                let hasError = responseParsed.hasOwnProperty("error") ? true : false;
                let badRequest = responseParsed.hasOwnProperty("info")
                    ? responseParsed.info.statusCode == 400
                        ? true
                        : false
                    : false;
                if (hasError || badRequest) {
                    if (hasError) {
                        if (responseParsed.error.provider.code == "1071") {
                            this.dateValue = "";
                            this.showNoInstallationMessage = true;
                            this.noCompleteInfo = false;
                        } else {
                            const event = new ShowToastEvent({
                                title: "Server Error",
                                variant: "error",
                                mode: "sticky",
                                message:
                                    "The Installation request could not be made correctly to the server: " +
                                    responseParsed.error
                            });
                            this.dispatchEvent(event);

                            if (responseParsed.error === "Read timed out") {
                                this.timeOut = true;
                            }
                        }
                    } else if (badRequest) {
                        const genericErrorMessage =
                            "The Installation request could not be made correctly to the server: Bad Request";
                        const event = new ShowToastEvent({
                            title: "Server Error",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                    }
                    this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.loaderSpinner = false;
                } else {
                    this.timeOut = false;
                    let received = [];
                    if (slots.length > 0) {
                        this.earliestDate = slots[0];
                        slots.forEach((slot) => {
                            let s = {
                                label: slot.date + " " + slot.startTime + " - " + slot.endTime,
                                value: slot.date + " " + slot.startTime + " - " + slot.endTime
                            };
                            received.push(s);
                        });
                    }
                    this.options = [...received];
                    if (this.dateSelected !== null || this.dateSelected !== undefined) {
                        this.dateValue = this.dateSelected;
                        let valueFound = false;
                        this.options.forEach((date) => {
                            if (valueFound == false) {
                                valueFound = this.dateValue === date.value ? true : false;
                            }
                        });
                        this.noCompleteInfo = valueFound ? false : true;
                    }
                    this.loaderSpinner = false;
                    if (this.skipInstallDateSelection) this.noCompleteInfo = false;
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
                const errMsg = error.body?.message || error.message;
                if (apiResponse) {
                    this.logError(`${errMsg}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    this.logError(errMsg);
                }
            });
    }

    handleDate(event) {
        this.dateValue = event.target.value;
        this.noCompleteInfo = event.target.value !== undefined ? false : true;
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
        let evt = {
            date: this.dateValue,
            skipDate: this.skipInstallDateSelection || this.showNoInstallationMessage,
            earliestDate: this.earliestDate?.date,
            noInstallation: this.showNoInstallationMessage
        };
        const forwardEvent = new CustomEvent("tpvnext", {
            detail: evt
        });
        this.dispatchEvent(forwardEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleRefreshDates(event) {
        this.tpvCallout();
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Installation - TPV",
            component: "poe_lwcBuyflowWindstreamTPVTab",
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
            tab: "Installation - TPV"
        };
        this.dispatchEvent(event);
    }
}