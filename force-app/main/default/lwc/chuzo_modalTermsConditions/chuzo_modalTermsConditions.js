import { api } from "lwc";
import LightningModal from "lightning/modal";
import hideCloseCss from "@salesforce/resourceUrl/hideCloseCss";
import BuyflowPrompt from "c/poe_lwcBuyflowPrompt";
import chuzo_modalGeneric from "c/chuzo_modalGeneric";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import getTermsAndConditionsPathApex from "@salesforce/apex/POE_TermsAndConditionsController.getTermsAndConditionsPath";
import saveTermsAndConditionsApex from "@salesforce/apex/POE_TermsAndConditionsController.saveTermsAndConditions";
import sendTermsAndConditionSMSApex from "@salesforce/apex/POE_TermsAndConditionsController.sendTermsAndConditionSMS";
import sendTermsAndConditionEmailApex from "@salesforce/apex/POE_TermsAndConditionsController.sendTermsAndConditionEmail";
import getTermsAgreementApex from "@salesforce/apex/POE_TermsAndConditionsController.getTermsAgreement";
import confirmTermsAgreement from "@salesforce/apex/POE_TermsAndConditionsController.confirmTermsAgreement";
import SAVE_TERMS_AND_CONDITIONS_ERROR_MESSAGE from "@salesforce/label/c.POE_Save_Terms_and_Conditions_Error_Message";
import TERMS_SMS_VERBIAGE from "@salesforce/label/c.POE_Terms_SMS_Verbiage";
import GET_TERMS_AND_CONDITIONS_PATH_ERROR_MESSAGE from "@salesforce/label/c.POE_Get_Terms_and_Conditions_Path_Error_Message";
import SEND_SMS_ERROR_MESSAGE from "@salesforce/label/c.POE_Send_SMS_Error_Message";
import SMS_TERMS_AND_CONDITIONS_SENT_MESSAGE from "@salesforce/label/c.POE_SMS_Terms_and_Conditions_Sent_Message";
import SEND_EMAIL_ERROR_MESSAGE from "@salesforce/label/c.POE_Send_Email_Error_Message";
import EMAIL_TERMS_AND_CONDITIONS_SENT_MESSAGE from "@salesforce/label/c.POE_Email_Terms_and_Conditions_Sent_Message";
import CUSTOMER_AGREED_TO_TERMS_MESSAGE from "@salesforce/label/c.POE_Customer_Agreed_to_Terms_Message";
import CUSTOMER_DID_NOT_AGREE_TO_TERMS_MESSAGE from "@salesforce/label/c.POE_Customer_Did_Not_Agree_to_Terms_Message";
import GET_TERMS_AGREEMENT_ERROR_MESSAGE from "@salesforce/label/c.POE_Get_Terms_Agreement_Error_Message";
import CONFIRM_TERMS_AGREEMENT_ERROR_MESSAGE from "@salesforce/label/c.POE_Public_Confirm_Terms_Agreement_Error_Message";
import CONSENT_TERMS_SMS_VERBIAGE from "@salesforce/label/c.DTV_Consent_SMS_Verbiage";
import SEND_CONSENT_SMS_ERROR_MESSAGE from "@salesforce/label/c.DTV_Consent_SMS_Error";
import SEND_CONSENT_SMS_PATH from "@salesforce/label/c.DTV_Consent_Path";
import DTV_CONSENT_DISCLAIMER from "@salesforce/label/c.DTV_Terms_Consent_Text";
import NO_OPTION_LABEL from "@salesforce/label/c.No_Option_Label";
import YES_OPTION_LABEL from "@salesforce/label/c.Yes_Option_Label";
import DTV_CONSENT_SHOW from "@salesforce/label/c.DTV_Consent_Show";
import feeScheduleTerm from "@salesforce/label/c.DTV_Fee_Schedule_Term";
import californiaTerm from "@salesforce/label/c.DTV_California_Term";
import { loadStyle } from "lightning/platformResourceLoader";
import ToastContainer from "lightning/toastContainer";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class modal_TermsConditions extends LightningModal {
    @api content;
    nonPhoneSalesInstructions = "Please read the following Terms and Conditions";
    phoneSalesInstructions = "Please read the following Terms and Conditions to The Customer";
    phoneSalesCheckboxAgreementMessage = "Customer accept this.";
    nonPhoneSalesCheckboxAgreementMessage = "I accept this.";
    termsAndConditionsInstructions;
    checkboxAgreementMessage;
    terms = [];
    feeScheduleTerm = feeScheduleTerm;
    californiaTerm = californiaTerm;
    loaderSpinner;
    showRefreshButton = false;
    termsAndConditionsAgreed = false;
    termsAgreement = false;
    signatureProvided = false;
    refreshTermsAndConditionsAgreed = false;
    showTermsSignatureModal = false;
    termsAndConditionsLink;
    isEventOrD2D;
    signatureName;
    signatureAddress;
    dtvConsentLabel = DTV_CONSENT_DISCLAIMER;
    dtvConsent = false;
    consentOptions = [
        { label: YES_OPTION_LABEL, value: YES_OPTION_LABEL.toLowerCase() },
        { label: NO_OPTION_LABEL, value: NO_OPTION_LABEL.toLowerCase() }
    ];
    showConsentRadio = DTV_CONSENT_SHOW === "show";

    get iconInfoTerm() {
        return chuzoSiteResources + "/images/icon-term.svg";
    }

    acceptTerms() {
        if (this.dtvConsent) {
            this.handleSendConsentSMS();
        }
        this.loaderSpinner = true;
        confirmTermsAgreement({ recordId: this.content.recordId })
            .then(() => {
                this.handleTermsCallout();
            })
            .catch((error) => {
                console.error("ERROR", error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: CONFIRM_TERMS_AGREEMENT_ERROR_MESSAGE
                    })
                );
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    handleSendConsentSMS() {
        const siteBaseUrl = window.location.href.split("/s/")[0];
        const termsPath = SEND_CONSENT_SMS_PATH;
        const params = {
            recordId: this.content.recordId,
            partnerName: this.content.stream ? "enga-stream" : "enga",
            systemCode: this.content.orderInfo.systemCode,
            correlationId: this.content.orderInfo.correlationId,
            uuid: this.content.orderInfo.uuid,
            sid: this.content.orderInfo.sid,
            phonenumber: this.content.clientInfo.contactInfo.phone
        };
        let paramsStr = "";
        Object.keys(params).forEach((key) => {
            paramsStr = `${paramsStr}&${key}=${encodeURIComponent(params[key])}`;
        });
        const termsAndConditionsLink = `${siteBaseUrl}/s/${termsPath}${paramsStr}`;
        const myData = {
            clientPhone: this.content.clientInfo.contactInfo.phone,
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

    handleCancel() {
        this.close("cancel");
    }

    connectedCallback() {
        this.loaderSpinner = true;
        loadStyle(this, hideCloseCss);
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        this.isEventOrD2D = this.content.origin == "maps" || this.content.origin == "event";
        this.termsAndConditionsInstructions =
            this.content.origin === "phonesales" ? this.phoneSalesInstructions : this.nonPhoneSalesInstructions;
        this.checkboxAgreementMessage =
            this.origin === "phonesales"
                ? this.phoneSalesCheckboxAgreementMessage
                : this.nonPhoneSalesCheckboxAgreementMessage;
        this.terms = [
            ...this.content.productTerms.filter((item) => item.consentText !== ""),
            ...this.generateAdditionalTerms()
        ];
        this.signatureName = `${this.content.clientInfo.contactInfo.firstName} ${this.content.clientInfo.contactInfo.lastName}`;
        this.signatureAddress = `${this.content.orderInfo.address.addressLine1} ${
            this.content.orderInfo.address.addressLine2 !== undefined ? this.content.orderInfo.address.addressLine2 : ""
        } ${this.content.orderInfo.address.city} ${this.content.orderInfo.address.state}, ${
            this.content.orderInfo.address.zipCode
        }`;
        if (this.content.isNotGuestUser) {
            Promise.all([this.saveTermsAndConditions(), this.getTermsAndConditionsPath()]).finally(() => {
                this.loaderSpinner = false;
            });
        } else {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
            this.loaderSpinner = false;
        }
    }

    saveTermsAndConditions() {
        return saveTermsAndConditionsApex({
            opportunityId: this.content.recordId,
            termsJSON: JSON.stringify(this.terms)
        })
            .then(() => {})
            .catch((error) => {
                console.error("ERROR", error);
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    message: SAVE_TERMS_AND_CONDITIONS_ERROR_MESSAGE
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    handleSignatureConfirmation(event) {
        this.showTermsSignatureModal = false;
        this.close("okay");
    }

    getTermsAndConditionsPath() {
        return getTermsAndConditionsPathApex({ opportunityId: this.content.recordId })
            .then((response) => {
                const siteBaseUrl = window.location.href.split("/s/")[0];
                const termsPath = response.result.termsAndConditionsPath;
                const params = {
                    origin: this.content.origin,
                    subChannel: this.content.orderInfo.subChannel,
                    channel: this.content.orderInfo.channel,
                    stream: this.content.stream,
                    systemCode: this.content.stream ? "ENGA-CHUZO" : this.content.orderInfo.systemCode,
                    correlationId: this.content.orderInfo.correlationId,
                    provider: "DIRECTV"
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
                this.loaderSpinner = false;
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
            this.content.orderInfo.address.state === "CA" ||
            this.content.orderInfo.address.state === "California" ||
            this.content.orderInfo.billingAddress.state === "California" ||
            this.content.orderInfo.billingAddress.state === "CA"
        ) {
            let californiaTerm = {
                consentLabel: "California Privacy Act",
                id: "CA-PRIVACY-ACT",
                consentText: this.californiaTerm
            };
            terms.push(californiaTerm);
        }
        if (this.isEventOrD2D) {
            let consentTerm = {
                consentLabel: "Consent to Electronic Delivery of Disclosures",
                id: "CONSENT-TERM",
                consentText: `<a href="https://www.directv.com/legal/directv-consent-electronic-delivery-disclosures/" target="”_blank">Click here to view Electronic Delivery of Disclosures</a>`
            };
            terms.push(consentTerm);
            let cancellationTerms = {
                consentLabel: "Notice of Cancellation",
                id: "CANCEL-TERM",
                consentText: this.content.verbiages.cancellationDisclosure
            };
            terms.push(cancellationTerms);
        }

        return terms;
    }

    // handleCheckbox(event) {
    //     let auxTerms = [];
    //     this.terms.forEach((item) => {
    //         if (item.id === event.currentTarget.dataset.id) {
    //             item = { ...item, checked: event.currentTarget.checked };
    //         }
    //         auxTerms.push(item);
    //     });
    //     this.terms = [...auxTerms];
    // }

    handleRefresh() {
        this.loaderSpinner = true;
        getTermsAgreementApex({ opportunityId: this.content.recordId })
            .then((response) => {
                this.refreshTermsAndConditionsAgreed = response.result.termsAgreed;

                if (this.refreshTermsAndConditionsAgreed) {
                    this.signatureProvided = true;
                    this.termsAgreement = true;
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
                this.loaderSpinner = false;
            });
    }

    handleSendViaSMS() {
        BuyflowPrompt.open({
            fieldLabel: "Phone Number",
            defaultValue: this.content.clientInfo.contactInfo.phone
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
            defaultValue: this.content.clientInfo.contactInfo.email
        }).then((result) => {
            if (!result) {
                return;
            }

            this.sendTermsAndConditionEmail(result);
        });
    }

    sendTermsAndConditionSMS(phoneNumber) {
        const myData = {
            clientPhone: phoneNumber,
            body: `${TERMS_SMS_VERBIAGE} ${this.termsAndConditionsLink}`
        };
        this.loaderSpinner = true;
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
                this.loaderSpinner = false;
            });
    }

    sendTermsAndConditionEmail(email) {
        const myData = {
            email: email,
            body: this.termsAndConditionsLink
        };
        this.loaderSpinner = true;
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
                this.loaderSpinner = false;
            });
    }

    handleTermsCallout() {
        this.loaderSpinner = true;
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
            ipAddress: this.content.isNotGuestUser ? this.content.currentIp : "",
            dateTime: "dateTime",
            acceptanceIndicatior: "Y"
        };
        const path = "termsAndConditions";
        let myData = {
            path,
            ...this.content.orderInfo,
            partnerName: this.content.stream ? "enga-stream" : "enga",
            terms: {
                stmsTermsAndConditions,
                eSignature: {
                    signatureText: "base 64 encoded string",
                    encryption: "base64"
                }
            }
        };
        if (this.content.stream) {
            myData.systemCode = "ENGA-CHUZO";
            myData.correlationId = this.content.orderInfo.correlationId;
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
                    if (this.isEventOrD2D) {
                        this.showTermsSignatureModal = true;
                    } else {
                        this.close("okay");
                    }
                }
                this.loaderSpinner = false;
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
                this.loaderSpinner = false;
            });
    }

    handleShowModal() {
        chuzo_modalGeneric.open({
            content: {
                title: "Notice of Cancellation",
                provider: "directv",
                body: this.content.verbiages.cancellationAgreement,
                agreeLabel: this.content.isNotGuestUser ? "Customer agrees" : "Agree disclosure",
                canClose: false
            }
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
}