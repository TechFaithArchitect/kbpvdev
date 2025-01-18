import { LightningElement, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import confirmTermsAgreement from "@salesforce/apex/POE_TermsAndConditionsController.confirmTermsAgreement";
import getTermsAndConditionsApex from "@salesforce/apex/POE_TermsAndConditionsController.getTermsAndConditions";
import sendTermsAndConditionSMSApex from "@salesforce/apex/POE_TermsAndConditionsController.sendTermsAndConditionSMS";
import logErrorApex from "@salesforce/apex/ErrorLogModel.logPublicError";
import saveSBSFile from "@salesforce/apex/ProductTabController.saveSBSFile";
import NO_TERMS_FOUND_MESSAGE from "@salesforce/label/c.POE_Public_No_Terms_Found_Message";
import TERMS_AGREED_MESSAGE from "@salesforce/label/c.POE_Public_Terms_Agreed_Message";
import GET_TERMS_ERROR_MESSAGE from "@salesforce/label/c.POE_Public_Get_Terms_And_Conditions_Error_Message";
import CONFIRM_TERMS_AGREEMENT_ERROR_MESSAGE from "@salesforce/label/c.POE_Public_Confirm_Terms_Agreement_Error_Message";
import DTV_CONSENT_DISCLAIMER from "@salesforce/label/c.DTV_Terms_Consent_Text";
import NO_OPTION_LABEL from "@salesforce/label/c.No_Option_Label";
import SEND_CONSENT_SMS_ERROR_MESSAGE from "@salesforce/label/c.DTV_Consent_SMS_Error";
import SEND_CONSENT_SMS_PATH from "@salesforce/label/c.DTV_Consent_Path";
import CONSENT_TERMS_SMS_VERBIAGE from "@salesforce/label/c.DTV_Consent_SMS_Verbiage";
import YES_OPTION_LABEL from "@salesforce/label/c.Yes_Option_Label";

const SIGNATURE_SAVED_DETAIL = "saved";
export default class Poe_lwcPublicTermsAndConditions extends LightningElement {
    recordId;
    isEncryptedId = true;
    terms = [];
    isLoading = false;
    noTermsFound = false;
    noTermsFoundMessage = NO_TERMS_FOUND_MESSAGE;
    showTermsAgreedMessage = false;
    termsAgreedMessage = TERMS_AGREED_MESSAGE;
    isEventOrD2D;
    electronicCheckbox = false;
    showSignatureOption;
    termsAgreement;
    subChannel;
    channel;
    isStream;
    partnerName;
    phone;
    uuid;
    sid;
    systemCode;
    correlationId;
    signatureName;
    signatureAddress;
    cancellationDisclosureVerbiage;
    cancellationAgreementVerbiage;
    signatureProvided;
    signatureCount;
    noSignatureAndTerms = false;
    notAllTermsAgreed = false;
    provider;
    showModal = false;
    showTermsSignatureModal = false;
    signatureImageURL;
    dtvConsentLabel = DTV_CONSENT_DISCLAIMER;
    dtvConsent = false;
    consentOptions = [
        { label: YES_OPTION_LABEL, value: YES_OPTION_LABEL.toLowerCase() },
        { label: NO_OPTION_LABEL, value: NO_OPTION_LABEL.toLowerCase() }
    ];

    get disableSubmit() {
        return this.showSignatureOption ? this.noSignatureAndTerms : this.notAllTermsAgreed;
    }

    get signatureLabel() {
        let label =
            this.signatureProvided && this.signatureCount != 0
                ? "Click here to Update Signature"
                : "Click here to Sign";
        return label;
    }

    get showAcceptButton() {
        return !this.showTermsAgreedMessage && !this.noTermsFound;
    }

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        this.recordId = currentPageReference.state?.recordId;
        if (this.recordId.includes(" ")) {
            this.recordId = this.recordId.replaceAll(" ", "+");
        }
        this.provider = currentPageReference.state?.provider;
        this.subChannel = currentPageReference.state?.subChannel;
        this.channel = currentPageReference.state?.channel;
        this.isStream = String(currentPageReference.state?.stream) === String(true);
        this.systemCode = currentPageReference.state?.systemCode;
        this.correlationId = currentPageReference.state?.correlationId;
        const origin = currentPageReference.state?.origin;
        this.isEventOrD2D = origin === "maps" || origin === "event";
        this.showSignatureOption = this.isEventOrD2D;
        this.partnerName = currentPageReference.state?.partnerName;
        this.phone = currentPageReference.state?.phone;
        this.uuid = currentPageReference.state?.uuid;
        this.sid = currentPageReference.state?.sid;
        this.showSignatureOption ? this.noSignatureAndTermsValidation() : this.termsValidation();

        this.isLoading = true;
        Promise.all([this.getTermsAndConditions(), this.handleCallCms()]).finally(() => {
            this.isLoading = false;
        });
    }

    handleConsentChange(event) {
        this.dtvConsent = event.target.value === YES_OPTION_LABEL.toLowerCase();
    }

    handleSendConsentSMS() {
        const siteBaseUrl = window.location.href.split("/s/")[0];
        const termsPath = SEND_CONSENT_SMS_PATH;
        const params = {
            recordId: this.recordId,
            partnerName: this.partnerName,
            systemCode: this.systemCode,
            correlationId: this.correlationId,
            uuid: this.uuid,
            sid: this.sid,
            phonenumber: this.phone
        };
        let paramsStr = "";
        Object.keys(params).forEach((key) => {
            paramsStr = `${paramsStr}&${key}=${encodeURIComponent(params[key])}`;
        });
        const termsAndConditionsLink = `${siteBaseUrl}/s/${termsPath}${paramsStr}`;
        const myData = {
            clientPhone: this.phone,
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

    getTermsAndConditions() {
        return getTermsAndConditionsApex({ recordId: this.recordId })
            .then((response) => {
                this.terms = response.result.terms;
                this.showTermsAgreedMessage = response.result.termsAccepted;
                this.signatureAddress = response.result.signatureAddress;
                this.signatureName = response.result.signatureName;
                this.noTermsFound = response.result.noTermsFound || !this.terms || this.terms.length === 0;
            })
            .catch((error) => {
                console.error("ERROR", error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: GET_TERMS_ERROR_MESSAGE
                    })
                );
                this.logError(error.body?.message || error.message);
            });
    }

    handleTermsAgreement() {
        this.isLoading = true;
        if (this.dtvConsent) {
            this.handleSendConsentSMS();
        }
        confirmTermsAgreement({ recordId: this.recordId })
            .then(() => {
                if (this.showSignatureOption && this.signatureImageURL) {
                    this.saveSignature();
                } else {
                    this.isLoading = false;
                    this.showTermsAgreedMessage = true;
                }
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

    handleAgreement() {
        this.termsAgreement = !this.termsAgreement;
        this.showSignatureOption ? this.noSignatureAndTermsValidation() : this.termsValidation();
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

    openModal() {
        this.showModal = true;
    }

    hideModal() {
        this.showModal = false;
    }

    openTermsSignatureModal() {
        this.showTermsSignatureModal = true;
    }

    hideSignatureModal() {
        this.showTermsSignatureModal = false;
    }

    handleSignatureSave(event) {
        this.signatureImageURL = event.detail;
        this.signatureConfirmation({ detail: SIGNATURE_SAVED_DETAIL });
    }

    signatureConfirmation(e) {
        if (e.detail == SIGNATURE_SAVED_DETAIL) {
            this.signatureProvided = true;
            this.signatureCount = this.signatureCount + 1;
        } else if (this.signatureCount == 0) {
            this.signatureProvided = false;
        }
        this.noSignatureAndTermsValidation();
        this.hideSignatureModal();
    }

    handleCallCms() {
        let contentDetails = [
            {
                content: "TNC_NOTICE_CANCEL_DISCLOSURE",
                subChannel: this.subChannel,
                stateId: "ALL",
                systemId: "",
                channel: this.channel
            },
            {
                content: "TNC_NOTICE_CANCEL_AGREEMENT",
                subChannel: this.subChannel,
                stateId: "ALL",
                systemId: "",
                channel: this.channel
            }
        ];
        const path = "cmsUrl";
        let myData = {
            path,
            systemCode: this.isStream ? "ENGA-CHUZO" : this.systemCode,
            partnerName: "enga",
            correlationId: this.correlationId,
            contentDetails
        };

        let apiResponse;
        this.isLoading = true;
        return callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
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
                    this.isLoading = false;
                } else {
                    this.cancellationDisclosureVerbiage = result[0].cmsContent;
                    this.cancellationAgreementVerbiage = result[1].cmsContent;
                }
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
                    this.logError(error.body?.message || error.message);
                }
            });
    }

    saveSignature() {
        let myData = {
            ContextId: this.recordId,
            strSignElement: this.signatureImageURL.replace(/^data:image\/(png|jpg);base64,/, ""),
            Update: false,
            Type: "signature",
            cvId: undefined,
            isEncryptedId: this.isEncryptedId
        };

        saveSBSFile({ myData: myData })
            .then((response) => {
                this.isLoading = false;
                this.showTermsAgreedMessage = true;
            })
            .catch((error) => {
                this.isLoading = false;
                console.log(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error capturing signature",
                        message: "Please try again.",
                        variant: "error",
                        mode: "sticky"
                    })
                );
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "T&C",
            component: "poe_lwcPublicTermsAndConditions",
            error: errorMessage,
            provider: "DIRECTV",
            opportunity: this.recordId
        };

        logErrorApex({ error })
            .then(() => {})
            .catch((err) => {
                console.error(`LOGGING ERROR: ${err.body?.message || err.stack}`);
            });
    }
}