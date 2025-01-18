import { LightningElement, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import NO_OPTION_LABEL from "@salesforce/label/c.No_Option_Label";
import YES_OPTION_LABEL from "@salesforce/label/c.Yes_Option_Label";
import DTV_CONSENT_TEXT from "@salesforce/label/c.DTV_Terms_Consent_Text_PCI";
import updateConsent from "@salesforce/apex/POE_TermsAndConditionsController.updateCommunicationConsent";

export default class Poe_lwcPublicDirecTvConsent extends LightningElement {
    consentText = DTV_CONSENT_TEXT;
    isLoading = true;
    disableButton = true;
    disableChoice = false;
    buttonLabel = "Submit";
    consentOptions = [{ label: YES_OPTION_LABEL, value: YES_OPTION_LABEL.toLowerCase() }];
    recordId;
    partnerName;
    systemCode;
    correlationId;
    uuid;
    sid;
    phoneNumber;

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        this.recordId = currentPageReference.state?.recordId;
        if (this.recordId !== undefined && this.recordId.includes(" ")) {
            this.recordId = this.recordId.replaceAll(" ", "+");
        }
        this.partnerName = currentPageReference.state?.partnerName;
        this.systemCode = currentPageReference.state?.systemCode;
        this.correlationId = currentPageReference.state?.correlationId;
        this.uuid = currentPageReference.state?.uuid;
        this.sid = currentPageReference.state?.sid;
        this.phone = currentPageReference.state?.phonenumber;
        this.isLoading = false;
    }

    handleConsentChange(event) {
        this.disableButton = !(event.target.value === YES_OPTION_LABEL.toLowerCase());
    }

    connectedCallback() {
        const toastContainer = ToastContainer.instance();
        toastContainer.maxShown = 5;
        toastContainer.toastPosition = "top-center";
    }

    handleSubmit() {
        this.isLoading = true;
        const path = "updateConsent";
        let myData = {
            path,
            partnerName: this.partnerName,
            systemCode: this.systemCode,
            correlationId: this.correlationId,
            uuid: this.uuid,
            sid: this.sid,
            phonenumber: this.phone,
            consents: [
                {
                    consentName: "SMSMarketingCommunications",
                    transactionType: "YES"
                }
            ]
        };
        console.log("Update Consent Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Update Consent Response", result);
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
                    this.isLoading = false;
                } else {
                    this.disableButton = true;
                    this.disableChoice = true;
                    this.handleUpdateConsent();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The Consent request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.isLoading = false;
            });
    }

    handleUpdateConsent() {
        updateConsent({ opportunityId: this.recordId })
            .then((response) => {
                const event = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    mode: "sticky",
                    message: "Consent was registered successfully."
                });
                this.dispatchEvent(event);
                this.isLoading = false;
            })
            .catch((error) => {
                console.error("ERROR", error);
            });
    }
}