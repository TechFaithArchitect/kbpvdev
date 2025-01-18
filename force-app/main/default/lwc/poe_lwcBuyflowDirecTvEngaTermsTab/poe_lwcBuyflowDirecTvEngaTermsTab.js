import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import BuyflowPrompt from "c/poe_lwcBuyflowPrompt";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getTermsAndConditionsPathApex from "@salesforce/apex/POE_TermsAndConditionsController.getTermsAndConditionsPath";
import saveTermsAndConditionsApex from "@salesforce/apex/POE_TermsAndConditionsController.saveTermsAndConditions";
import sendTermsAndConditionSMSApex from "@salesforce/apex/POE_TermsAndConditionsController.sendTermsAndConditionSMS";
import sendTermsAndConditionEmailApex from "@salesforce/apex/POE_TermsAndConditionsController.sendTermsAndConditionEmail";
import getTermsAgreementApex from "@salesforce/apex/POE_TermsAndConditionsController.getTermsAgreement";
import confirmTermsAgreement from "@salesforce/apex/POE_TermsAndConditionsController.confirmTermsAgreement";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import feeScheduleTerm from "@salesforce/label/c.DTV_Fee_Schedule_Term";
import californiaTerm from "@salesforce/label/c.DTV_California_Term";
import TERMS_SMS_VERBIAGE from "@salesforce/label/c.POE_Terms_SMS_Verbiage";
import CONSENT_TERMS_SMS_VERBIAGE from "@salesforce/label/c.DTV_Consent_SMS_Verbiage";
import GET_TERMS_AND_CONDITIONS_PATH_ERROR_MESSAGE from "@salesforce/label/c.POE_Get_Terms_and_Conditions_Path_Error_Message";
import SAVE_TERMS_AND_CONDITIONS_ERROR_MESSAGE from "@salesforce/label/c.POE_Save_Terms_and_Conditions_Error_Message";
import SEND_SMS_ERROR_MESSAGE from "@salesforce/label/c.POE_Send_SMS_Error_Message";
import SEND_CONSENT_SMS_ERROR_MESSAGE from "@salesforce/label/c.DTV_Consent_SMS_Error";
import SEND_CONSENT_SMS_PATH from "@salesforce/label/c.DTV_Consent_Path";
import SMS_TERMS_AND_CONDITIONS_SENT_MESSAGE from "@salesforce/label/c.POE_SMS_Terms_and_Conditions_Sent_Message";
import SEND_EMAIL_ERROR_MESSAGE from "@salesforce/label/c.POE_Send_Email_Error_Message";
import EMAIL_TERMS_AND_CONDITIONS_SENT_MESSAGE from "@salesforce/label/c.POE_Email_Terms_and_Conditions_Sent_Message";
import CUSTOMER_AGREED_TO_TERMS_MESSAGE from "@salesforce/label/c.POE_Customer_Agreed_to_Terms_Message";
import CUSTOMER_DID_NOT_AGREE_TO_TERMS_MESSAGE from "@salesforce/label/c.POE_Customer_Did_Not_Agree_to_Terms_Message";
import GET_TERMS_AGREEMENT_ERROR_MESSAGE from "@salesforce/label/c.POE_Get_Terms_Agreement_Error_Message";
import CONFIRM_TERMS_AGREEMENT_ERROR_MESSAGE from "@salesforce/label/c.POE_Public_Confirm_Terms_Agreement_Error_Message";
import DTV_CONSENT_DISCLAIMER from "@salesforce/label/c.DTV_Terms_Consent_Text";
import NO_OPTION_LABEL from "@salesforce/label/c.No_Option_Label";
import YES_OPTION_LABEL from "@salesforce/label/c.Yes_Option_Label";
import DTV_CONSENT_SHOW from "@salesforce/label/c.DTV_Consent_Show";

export default class Poe_lwcBuyflowDirecTvEngaTermsTab extends NavigationMixin(LightningElement) {
    @api referenceNumber;
    @api logo;
    @api productTerms;
    @api recordId;
    @api orderInfo;
    @api clientInfo;
    @api cartInfo;
    @api origin;
    @api returnUrl;
    @api orderType = "NLLS";
    @api verbiages;
    @api currentIp;
    @api stream;
    @api isGuestUser;
    termsSignatureText = "By signing you are consenting to the DIRECTV Terms and Conditions.";
    cart = {
        orderNumber: "",
        todayCharges: [],
        hasToday: false,
        monthlyCharges: [],
        hasMonthly: false,
        monthlyTotal: 0.0,
        todayTotal: 0.0,
        firstBillTotal: (0.0).toFixed(2),
        hasFirstBill: false,
        firstBillCharges: [],
        hasSavings: false,
        savingCharges: []
    };
    dtvConsentLabel = DTV_CONSENT_DISCLAIMER;
    dtvConsent = false;
    terms = [];
    agreementPrivacyPolicy = false;
    agreementDisclosures = false;
    agreementAutomaticPayments = false;
    agreementNationalOffers = false;
    agreementPremiumOffers = false;
    agreementElectronicDelivery = false;
    agreementRightToCancel = false;
    showNationalOffersTermModal = false;
    showPremiumOffersTermModal = false;
    showRightToCancelTermModal = false;
    showTermsSignatureModal = false;
    showCollateral = false;
    showLoaderSpinner = false;
    showSignatureOption = false;
    signatureName;
    signatureAddress;
    futureDate;
    modalHeader = "Notice of Cancellation";
    phoneSalesInstructions = "Please read the following Terms and Conditions to The Customer:";
    nonPhoneSalesInstructions = "Please read the following Terms and Conditions:";
    termsAndConditionsInstructions = "";
    phoneSalesCheckboxAgreementMessage = "I have read the above disclosures to the customer, and the customer agreed.";
    nonPhoneSalesCheckboxAgreementMessage = "I have read and agreed to the Terms & Conditions.";
    checkboxAgreementMessage = "";
    modalBody;
    showModal = false;
    signatureProvided = false;
    termsAgreement = false;
    signatureCount = 0;
    showErrorMessage = false;
    notAllTermsAgreed = true;
    errorMessage = "";
    noSignatureAndTerms = false;
    electronicCheckbox = false;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage
    };
    showSelfServiceCancelModal = false;
    feeScheduleTerm = feeScheduleTerm;
    californiaTerm = californiaTerm;
    termsAndConditionsLink;
    showRefreshButton = false;
    refreshTermsAndConditionsAgreed = false;
    consentOptions = [
        { label: YES_OPTION_LABEL, value: YES_OPTION_LABEL.toLowerCase() },
        { label: NO_OPTION_LABEL, value: NO_OPTION_LABEL.toLowerCase() }
    ];
    showConsentRadio = DTV_CONSENT_SHOW === "show";

    get disableNext() {
        return (
            !this.refreshTermsAndConditionsAgreed &&
            (this.showSignatureOption ? this.noSignatureAndTerms : this.notAllTermsAgreed)
        );
    }

    get nextLabel() {
        return this.refreshTermsAndConditionsAgreed ? "Next" : "Accept";
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.isEventOrD2D = this.origin == "maps" || this.origin == "event";
        this.showLoaderSpinner = true;
        this.cart = { ...this.cartInfo };
        this.futureDate = this.formattedFutureDate();
        this.terms = [
            ...this.productTerms.filter((item) => item.consentText !== ""),
            ...this.generateAdditionalTerms()
        ];
        this.modalBody = this.verbiages.cancellationAgreement;
        this.signatureName = `${this.clientInfo.contactInfo.firstName} ${this.clientInfo.contactInfo.lastName}`;
        this.signatureAddress = `${this.orderInfo.address.addressLine1} ${
            this.orderInfo.address.addressLine2 !== undefined ? this.orderInfo.address.addressLine2 : ""
        } ${this.orderInfo.address.city} ${this.orderInfo.address.state}, ${this.orderInfo.address.zipCode}`;
        this.showSignatureOption = this.origin == "maps" || this.origin == "event";
        this.showSignatureOption ? this.noSignatureAndTermsValidation() : this.termsValidation();
        this.termsAndConditionsInstructions =
            this.origin === "phonesales" ? this.phoneSalesInstructions : this.nonPhoneSalesInstructions;
        this.checkboxAgreementMessage =
            this.origin === "phonesales"
                ? this.phoneSalesCheckboxAgreementMessage
                : this.nonPhoneSalesCheckboxAgreementMessage;

        this.showLoaderSpinner = true;
        Promise.all([this.saveTermsAndConditions(), this.getTermsAndConditionsPath()]).finally(() => {
            this.showLoaderSpinner = false;
        });
    }

    getTermsAndConditionsPath() {
        return getTermsAndConditionsPathApex({ opportunityId: this.recordId })
            .then((response) => {
                const siteBaseUrl = window.location.href.split("/s/")[0];
                const termsPath = response.result.termsAndConditionsPath;
                const params = {
                    origin: this.origin,
                    subChannel: this.orderInfo.subChannel,
                    channel: this.orderInfo.channel,
                    stream: this.stream,
                    systemCode: this.stream ? "ENGA-CHUZO" : this.orderInfo.systemCode,
                    correlationId: this.orderInfo.correlationId,
                    provider: "DIRECTV",
                    partnerName: this.orderInfo.partnerName,
                    uuid: this.orderInfo.uuid,
                    sid: this.orderInfo.sid
                };

                let paramsStr = "";
                Object.keys(params).forEach((key) => {
                    paramsStr = `${paramsStr}&${key}=${encodeURIComponent(params[key])}`;
                });

                this.termsAndConditionsLink = `${siteBaseUrl}/s/${termsPath}${paramsStr}`;
            })
            .catch((error) => {
                console.error("ERROR", error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    message: GET_TERMS_AND_CONDITIONS_PATH_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    generateAdditionalTerms() {
        let terms = [];
        let feeScheduleTerm = {
            consentLabel: "DIRECTV Fee Schedule",
            id: "FEE-SCHEDULE",
            consentText: this.feeScheduleTerm
        };
        terms.push(feeScheduleTerm);
        if (
            this.orderInfo.address.state === "CA" ||
            this.orderInfo.address.state === "California" ||
            this.orderInfo.billingAddress.state === "California" ||
            this.orderInfo.billingAddress.state === "CA"
        ) {
            let californiaTerm = {
                consentLabel: "California Privacy Act",
                id: "CA-PRIVACY-ACT",
                consentText: this.californiaTerm
            };
            terms.push(californiaTerm);
        }
        return terms;
    }

    formattedFutureDate() {
        const today = new Date();
        const future = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
        const month = future.getMonth() + 1;
        const day = future.getDate();
        const year = future.getFullYear();
        const futureDate = `${month}/${day}/${year}`;
        return futureDate;
    }

    signatureConfirmation(e) {
        if (e.detail == "saved") {
            this.signatureProvided = true;
            this.signatureCount = this.signatureCount + 1;
        } else if (this.signatureCount == 0) {
            this.signatureProvided = false;
        }
        this.noSignatureAndTermsValidation();
        this.hideSignatureModal();
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

    handleAgreement() {
        this.termsAgreement = !this.termsAgreement;
        this.showSignatureOption ? this.noSignatureAndTermsValidation() : undefined;
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    hideModal(e) {
        this.showSignatureOption ? this.noSignatureAndTermsValidation() : undefined;
    }

    openTermsSignatureModal() {
        this.showTermsSignatureModal = true;
    }

    hideSignatureModal() {
        this.showTermsSignatureModal = false;
    }

    handleCheckbox(event) {
        if (event.currentTarget.name == "electronicCheckbox") {
            this.electronicCheckbox = event.currentTarget.checked;
        } else {
            let auxTerms = [];
            this.terms.forEach((item) => {
                if (item.id === event.currentTarget.dataset.id) {
                    item = { ...item, checked: event.currentTarget.checked };
                }
                auxTerms.push(item);
            });
            this.terms = [...auxTerms];
        }

        if (this.showSignatureOption) {
            this.noSignatureAndTermsValidation();
        } else {
            this.termsValidation();
        }
    }

    handleClick() {
        if (this.dtvConsent) {
            this.handleSendConsentSMS();
        }
        if (
            this.refreshTermsAndConditionsAgreed ||
            (this.terms.every((element) => element.checked === true) &&
                this.terms.length > 0 &&
                (!this.isEventOrD2D || this.electronicCheckbox))
        ) {
            this.showLoaderSpinner = true;
            confirmTermsAgreement({ recordId: this.recordId })
                .then(() => {
                    this.handleTermsCallout();
                })
                .catch((error) => {
                    console.error("ERROR", error);
                    this.isLoading = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Server Error",
                            variant: "error",
                            mode: "sticky",
                            message: CONFIRM_TERMS_AGREEMENT_ERROR_MESSAGE
                        })
                    );
                    this.logError(error.body?.message || error.message);
                });
        } else {
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                message: "Please check for items not agreed to."
            });
            this.dispatchEvent(event);
        }
    }

    handleSendConsentSMS() {
        const siteBaseUrl = window.location.href.split("/s/")[0];
        const termsPath = SEND_CONSENT_SMS_PATH;
        const params = {
            recordId: this.recordId,
            partnerName: this.stream ? "enga-stream" : "enga",
            systemCode: this.orderInfo.systemCode,
            correlationId: this.orderInfo.correlationId,
            uuid: this.orderInfo.uuid,
            sid: this.orderInfo.sid,
            phonenumber: this.clientInfo.contactInfo.phone
        };
        let paramsStr = "";
        Object.keys(params).forEach((key) => {
            paramsStr = `${paramsStr}&${key}=${encodeURIComponent(params[key])}`;
        });
        const termsAndConditionsLink = `${siteBaseUrl}/s/${termsPath}${paramsStr}`;
        const myData = {
            clientPhone: this.clientInfo.contactInfo.phone,
            body: `${CONSENT_TERMS_SMS_VERBIAGE} ${termsAndConditionsLink}`
        };
        console.log("Consent SMS Request", myData);
        sendTermsAndConditionSMSApex({ myData })
            .then((response) => {
                console.log("Consent SMS Response", response);
            })
            .catch((error) => {
                console.error("ERROR", error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    message: SEND_CONSENT_SMS_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    handleConsentChange(event) {
        this.dtvConsent = event.target.value === YES_OPTION_LABEL.toLowerCase();
    }

    handleTermsCallout() {
        this.showLoaderSpinner = true;
        let stmsTermsAndConditions = [];
        this.terms.forEach((term) => {
            if (term.consentText !== "") {
                let termObject = {
                    agreementText: term.consentText.replace(/<[^>]+>/g, ""),
                    termsCategoryType: "DIRECTV",
                    agreementType: "Pa",
                    acceptanceIndicator: "Y"
                };
                stmsTermsAndConditions.push(termObject);
            }
        });
        let ipDetails = {
            ipAddress: this.currentIp,
            dateTime: "dateTime",
            acceptanceIndicatior: "Y"
        };
        const path = "termsAndConditions";
        let myData = {
            path,
            ...this.orderInfo,
            partnerName: this.stream ? "enga-stream" : "enga",
            terms: {
                stmsTermsAndConditions,
                eSignature: {
                    signatureText: "base 64 encoded string",
                    encryption: "base64"
                }
            }
        };
        if (this.stream) {
            myData.systemCode = "ENGA-CHUZO";
            myData.correlationId = this.orderInfo.correlationId;
            myData.terms.ipDetails = ipDetails;
        } else {
            myData.ipDetails = ipDetails;
        }
        console.log("Terms Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Terms Response", result);
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
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message: "Your information has been saved!"
                    });
                    this.dispatchEvent(event);
                    const sendTermsNextEvent = new CustomEvent("termsnext");
                    this.dispatchEvent(sendTermsNextEvent);
                }
                this.showLoaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The CMSurl request could not be made correctly to the server. Please, validate the information and try again.";
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
                this.showLoaderSpinner = false;
            });
    }

    openModal() {
        this.showModal = true;
    }

    hideModal() {
        this.showModal = false;
    }

    get signatureLabel() {
        let label =
            this.signatureProvided && this.signatureCount != 0
                ? "Click here to Update Signature"
                : "Click here to Sign";
        return label;
    }

    noSignatureAndTermsValidation() {
        this.noSignatureAndTerms = !(
            this.signatureProvided &&
            this.termsAgreement &&
            this.terms.every((element) => element.checked === true) &&
            this.terms.length > 0 &&
            this.electronicCheckbox
        );
    }

    termsValidation() {
        this.notAllTermsAgreed = !(
            this.terms.length > 0 &&
            (!this.isEventOrD2D || this.electronicCheckbox) &&
            this.terms.every((element) => element.checked === true)
        );
    }

    handleSendViaSMS() {
        BuyflowPrompt.open({
            fieldLabel: "Phone Number",
            defaultValue: this.clientInfo.contactInfo.phone
        }).then((result) => {
            if (!result) {
                return;
            }

            this.sendTermsAndConditionSMS(result);
        });
    }

    handleSendViaEmail() {
        BuyflowPrompt.open({
            fieldLabel: "Email Address",
            defaultValue: this.clientInfo.contactInfo.email
        }).then((result) => {
            if (!result) {
                return;
            }

            this.sendTermsAndConditionEmail(result);
        });
    }

    saveTermsAndConditions() {
        return saveTermsAndConditionsApex({
            opportunityId: this.recordId,
            termsJSON: JSON.stringify(this.terms)
        })
            .then(() => {})
            .catch((error) => {
                console.error("ERROR", error);
                this.showLoaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    message: SAVE_TERMS_AND_CONDITIONS_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    sendTermsAndConditionSMS(phoneNumber) {
        const myData = {
            clientPhone: phoneNumber,
            body: `${TERMS_SMS_VERBIAGE} ${this.termsAndConditionsLink}&phone=${phoneNumber}`
        };
        console.log("Terms and Conditions SMS Request", myData);
        this.showLoaderSpinner = true;
        sendTermsAndConditionSMSApex({ myData })
            .then((response) => {
                if (response?.result?.success) {
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message: SMS_TERMS_AND_CONDITIONS_SENT_MESSAGE
                    });
                    this.dispatchEvent(event);

                    this.showRefreshButton = true;
                } else {
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        message: SEND_SMS_ERROR_MESSAGE
                    });
                    this.dispatchEvent(event);
                }
            })
            .catch((error) => {
                console.error("ERROR", error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    message: SEND_SMS_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            })
            .finally(() => {
                this.showLoaderSpinner = false;
            });
    }

    sendTermsAndConditionEmail(email) {
        const myData = {
            email: email,
            body: `${this.termsAndConditionsLink}&phone=${this.clientInfo.contactInfo.phone}`
        };
        this.showLoaderSpinner = true;
        sendTermsAndConditionEmailApex({ myData })
            .then((response) => {
                if (response?.result?.success) {
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message: EMAIL_TERMS_AND_CONDITIONS_SENT_MESSAGE
                    });
                    this.dispatchEvent(event);

                    this.showRefreshButton = true;
                } else if (response?.result?.errorMessage) {
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        message: SEND_EMAIL_ERROR_MESSAGE
                    });
                    this.dispatchEvent(event);
                }
            })
            .catch((error) => {
                console.error("ERROR", error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    message: SEND_EMAIL_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            })
            .finally(() => {
                this.showLoaderSpinner = false;
            });
    }

    handleRefresh() {
        this.showLoaderSpinner = true;
        getTermsAgreementApex({ opportunityId: this.recordId })
            .then((response) => {
                this.refreshTermsAndConditionsAgreed = response.result.termsAgreed;

                if (this.refreshTermsAndConditionsAgreed) {
                    this.signatureProvided = true;
                    this.termsAgreement = true;
                    this.electronicCheckbox = true;

                    this.terms = this.terms.map((element) => {
                        return {
                            ...element,
                            checked: true,
                            disabled: true
                        };
                    });

                    setTimeout(() => {
                        this.template.querySelectorAll('[data-type="checkbox"]').forEach((checkboxEl) => {
                            checkboxEl.reportValidity();
                        });
                    }, 0);

                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message: CUSTOMER_AGREED_TO_TERMS_MESSAGE
                    });
                    this.dispatchEvent(event);
                    this.showConsentRadio = false;
                } else {
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        message: CUSTOMER_DID_NOT_AGREE_TO_TERMS_MESSAGE
                    });
                    this.dispatchEvent(event);
                }
            })
            .catch((error) => {
                console.error("ERROR", error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    message: GET_TERMS_AGREEMENT_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            })
            .finally(() => {
                this.showLoaderSpinner = false;
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "T&C",
            component: "poe_lwcBuyflowDirecTvEngaTermsTab",
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
            tab: "T&C"
        };
        this.dispatchEvent(event);
    }
}