import { LightningElement, api, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";

export default class Poe_lwcBuyflowFrontierOrderConfirmationTab extends NavigationMixin(LightningElement) {
    @api logo;
    @api recordId;
    @api origin;
    @api quoteId;
    @api accountId;
    @api preview;
    @api frontierUserId;
    @api isGuestUser;
    @api customerTN;
    @api quoteNumber;
    @api referralCodeData;
    @api clientInfo;

    @track divResponsiveClass = "slds-m-around_medium slds-box bill slds-size_12-of-12 slds-align_absolute-center";
    loaderSpinner;
    showCollateral = false;
    terms = [];
    showCreditCheckQuoteAssistanceModal;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage
    };
    showSelfServiceCancelModal = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
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

    connectedCallback() {
        if (this.isGuestUser) {
            window.addEventListener("resize", () => {
                this.updateDivResponsiveClass();
            });
            this.updateDivResponsiveClass();
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
    }

    updateDivResponsiveClass() {
        this.divResponsiveClass =
            window.innerWidth > 395
                ? "slds-m-around_medium slds-box bill slds-size_12-of-12 slds-align_absolute-center"
                : "slds-m-around_medium bill slds-size_12-of-12 slds-align_absolute-center";
    }

    renderedCallback() {
        let text = "";
        if (this.preview.includes(`body style="background-color: #e5e3e3;"&gt;`)) {
            text = this.preview.split(`body style="background-color: #e5e3e3;"&gt;`)[1];
        } else if (this.preview.includes(`&lt;/head&gt;`)) {
            text = this.preview.split(`&lt;/head&gt;`)[1];
        } else {
            text = this.preview;
        }
        text = text.split("&lt;/body&gt; &lt;/html&gt;")[0];
        text = text.replaceAll("color;", "color:");
        text = text.replaceAll("http:/", "http://");
        text = text.replaceAll("https:/", "https://");
        text = text.replaceAll('"', `\"`);
        text = text.replaceAll("$.", "$0.");
        text = text.replaceAll("-$0.00", "$0.00");
        this.template.querySelector(".bill").innerHTML = this.decodeHtml(String(text));
        let links = this.template.querySelectorAll("a");
        for (var i = 0; i < links.length; i++) {
            links[i].setAttribute("target", "_blank");
        }
        let imgs = this.template.querySelectorAll("td");
        for (var i = 0; i < imgs.length; i++) {
            if (imgs[i].hasAttribute("valign") && imgs[i].hasAttribute("align")) {
                imgs[i].style.setProperty("text-align", "-webkit-center", "important");
            }
        }
    }

    decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    handleClick() {
        this.loaderSpinner = true;

        const path = "payments";
        let myData = {
            path,
            partnerName: "frapi",
            billPreview: "done",
            acceptDisclosures: [],
            tpvTransfer: "",
            quoteId: this.quoteId,
            accountUuid: this.accountId,
            userId: this.frontierUserId
        };
        console.log("Get Terms Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Get Terms Response: ", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed?.error?.provider?.message
                            ? responseParsed?.error?.provider?.message
                            : responseParsed?.error
                        : "There was an error processing the request.";
                    if (JSON.stringify(errorMessage).includes("Declined")) {
                        errorMessage = "Credit Card not authorized. Payment was declined.";
                    }
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.terms = [...responseParsed];
                    const closeModalEvent = new CustomEvent("next", {
                        detail: this.terms
                    });
                    this.dispatchEvent(closeModalEvent);
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.log(error);
                const errMsg = error.body?.message || error.message;
                if (apiResponse) {
                    this.logError(`${errMsg}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    this.logError(errMsg);
                }
                this.loaderSpinner = false;
            });
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
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
            tab: "Bill Preview",
            component: "poe_lwcBuyflowFrontierOrderConfirmationTab",
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
            tab: "Bill Preview"
        };
        this.dispatchEvent(event);
    }
}