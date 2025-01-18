import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getTPVSettings from "@salesforce/apex/InstallationTPVTabController.getTPVSettings";
import ToastContainer from "lightning/toastContainer";
import INSTALLATION_VERBIAGE_1 from "@salesforce/label/c.Viasat_Installation_Disclosures_1";
import INSTALLATION_VERBIAGE_2 from "@salesforce/label/c.Viasat_Installation_Disclosures_2";
import NO_INSTALLATION_SLOTS from "@salesforce/label/c.Viasat_No_Installation_Slots";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import viasat_Please_call from "@salesforce/label/c.viasat_Please_call";
import viasat_number from "@salesforce/label/c.viasat_number";
import viasat_Provide_this_reference_to_the_TPV_agent from "@salesforce/label/c.viasat_Provide_this_reference_to_the_TPV_agent";
import viasat_Reference from "@salesforce/label/c.viasat_Reference";
import viasat_No_installation_slots_available from "@salesforce/label/c.viasat_No_installation_slots_available";
import i_have_read_and_agreed from "@salesforce/label/c.i_have_read_and_agreed";
import Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message from  "@salesforce/label/c.Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message";
import Please_read_the_following_discloure from "@salesforce/label/c.Please_read_the_following_discloure";
import Please_read_the_following_disclosure_to_the_customer from "@salesforce/label/c.Please_read_the_following_disclosure_to_the_customer";
import viasat_The_Installation_request_could_not_be_made_correctly_to_the_server from "@salesforce/label/c.viasat_The_Installation_request_could_not_be_made_correctly_to_the_server";
import viasat_The_Installation_request_could_not_be_made_correctly_to_the_server_Bad_R from "@salesforce/label/c.viasat_The_Installation_request_could_not_be_made_correctly_to_the_server_Bad_R";

export default class Poe_lwcBuyflowViasatTPVTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api referenceNumber;
    @api clientInfo;
    @api logo;
    @api dateSelected;
    @api cartInfo;
    @api callout;
    @api isGuestUser;
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
    earliestDate;
    noCompleteInfo = true;
    isCallCenter = true;
    options = [];
    timeOut = false;
    installSelections = [];
    start;
    end;
    checkboxAgreementMessage;
    termsAndConditionsInstructions;
    installationConsent = false;
    installationDisclosure = INSTALLATION_VERBIAGE_1 + INSTALLATION_VERBIAGE_2;
    noSlotsAvailable = false;
    noSlotsAvailableDisclosure = NO_INSTALLATION_SLOTS;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        viasat_Please_call,
        viasat_number,
        viasat_Provide_this_reference_to_the_TPV_agent,
        viasat_Reference,
        viasat_No_installation_slots_available,
        i_have_read_and_agreed,
        Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message,
        Please_read_the_following_discloure,
        Please_read_the_following_disclosure_to_the_customer,
        viasat_The_Installation_request_could_not_be_made_correctly_to_the_server,
        viasat_The_Installation_request_could_not_be_made_correctly_to_the_server_Bad_R
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
        this.checkboxAgreementMessage = this.isGuestUser
            ? this.labels.i_have_read_and_agreed
            : this.labels.Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message;
        this.termsAndConditionsInstructions = this.isGuestUser
            ? this.labels.Please_read_the_following_discloure
            : this.labels.Please_read_the_following_disclosure_to_the_customer;
        this.creditCheck = {
            firstName: this.clientInfo.contactInfo.firstName,
            lastName: this.clientInfo.contactInfo.lastName,
            shippingAddress: `${this.clientInfo.shippingAddress.addressLine1} ${this.clientInfo.shippingAddress.addressLine2}`,
            shippingCity: this.clientInfo.shippingAddress.city,
            shippingState: this.clientInfo.shippingAddress.state,
            shippingZip: this.clientInfo.shippingAddress.zipCode
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
                this.TPVText = response.result.TPVText === "Yes" ? true : false;
                this.tpvCallout();
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    tpvCallout() {
        let myData = { ...JSON.parse(JSON.stringify(this.callout)) };
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let start = today.toISOString();
        let date = new Date();
        date.setDate(date.getDate() + 30);
        date.setHours(0, 0, 0, 0);
        let end = date.toISOString();
        myData.startTS = start;
        myData.endTS = end;
        myData.path = "installation";
        console.log(myData);
        let apiResponse;
        callEndpoint({ inputMap: myData }).then((response) => {
            apiResponse = response;
            const responseParsed = JSON.parse(response);
            console.log("Installation Response", responseParsed);
            let error =
                (responseParsed.hasOwnProperty("result") &&
                    responseParsed.result.hasOwnProperty("error") &&
                    responseParsed.result.error.hasOwnProperty("provider") &&
                    responseParsed.result.error.provider.hasOwnProperty("message")) ||
                responseParsed.hasOwnProperty("error");
            if (error) {
                let errorMessage = responseParsed.hasOwnProperty("error")
                    ? responseParsed.error.hasOwnProperty("provider")
                        ? responseParsed.error.provider.message.hasOwnProperty("message")
                            ? responseParsed.error.provider.message.message
                            : responseParsed.error.provider.message
                        : responseParsed.error
                    : responseParsed.result.error.provider.message;
                const finalErrorMessage = errorMessage !== "" ? errorMessage : "Internal Server Error";
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: finalErrorMessage
                });
                this.loaderSpinner = false;
                this.dispatchEvent(event);
                this.logError(`${finalErrorMessage}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
            } else {
                let slots = responseParsed.hasOwnProperty("installWindows") ? responseParsed.installWindows : [];
                let hasError = responseParsed.hasOwnProperty("error") ? true : false;
                let badRequest = responseParsed.hasOwnProperty("info")
                    ? responseParsed.info.statusCode == 400
                        ? true
                        : false
                    : false;
                if (hasError || badRequest) {
                    if (hasError) {
                        const errorMessage =
                            this.labels.viasat_The_Installation_request_could_not_be_made_correctly_to_the_server +
                            responseParsed.error;
                        const event = new ShowToastEvent({
                            title: "Server Error",
                            variant: "error",
                            mode: "sticky",
                            message: errorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(
                            `${errorMessage}\nAPI Response: ${apiResponse}`,
                            myData,
                            myData.path,
                            "API Error"
                        );

                        if (
                            responseParsed.error === "Read timed out" ||
                            (responseParsed.hasOwnProperty("info") && responseParsed.info.status === "Request Timeout")
                        ) {
                            this.timeOut = true;
                        }
                    } else if (badRequest) {
                        const genericErrorMessage =
                           this.labels.viasat_The_Installation_request_could_not_be_made_correctly_to_the_server_Bad_R;
                        const event = new ShowToastEvent({
                            title: "Server Error",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(
                            `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                            myData,
                            myData.path,
                            "API Error"
                        );
                    }
                    this.loaderSpinner = false;
                } else {
                    this.timeOut = false;
                    let received = [];
                    if (slots.length > 0) {
                        this.earliestDate = slots[0];
                        slots.forEach((slot, index) => {
                            let s = {
                                label: slot.date + " " + slot.startTime + " - " + slot.endTime,
                                value: String(index)
                            };
                            received.push(s);
                            let t = {
                                appointment: {
                                    startTime: slot.date + "T" + slot.startTime + ":00",
                                    endTime: slot.date + "T" + slot.endTime + ":00"
                                },
                                value: String(index)
                            };
                            this.installSelections.push(t);
                        });
                    } else {
                        this.noSlotsAvailable = true;
                        this.noCompleteInfo = false;
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
                }
            }
        });
    }

    handleDate(event) {
        if (event.target.name === "installationConsent") {
            this.installationConsent = event.target.checked;
        } else {
            this.dateValue = event.target.value;
        }

        this.noCompleteInfo = !((this.dateValue !== undefined || this.noSlotsAvailable) && this.installationConsent);
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
        let info = {};
        if (!this.noSlotsAvailable) {
            info = {
                appointment: { ...this.installSelections.filter((e) => e.value === this.dateValue)[0].appointment },
                earliestDate: this.earliestDate
            };
        }
        console.log(info);
        const forwardEvent = new CustomEvent("tpvnext", {
            detail: info
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
            tab: "Installation",
            component: "Poe_lwcBuyflowViasatTPVTab",
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