import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import addNewProduct from "@salesforce/apex/InfoTabController.addNewProduct";
export default class Poe_lwcBuyflowDirecTvEngaOrderSuccessTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api origin;
    @api orderNumber;
    @api orderId;
    @api referenceNumber;
    @api returnUrl;
    @api isGuestUser;
    @api email;
    @api phone;
    homeLabel = "New Customer";
    showCollateral = false;
    signatureIncomplete = true;
    loaderSpinner = false;
    showSignature;
    name;
    address;
    hasReturnUrl = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        this.homeLabel = this.isGuestUser ? "Home" : "New Customer";
        this.hasReturnUrl = this.returnUrl != undefined;
    }

    newOpportunityHandler() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };
        addNewProduct({ myData: myData })
            .then((response) => {
                console.log("New Product Handler Response", response);
                this.loaderSpinner = false;
                let newOppId = response.result.Opportunity.Id;
                let values = {
                    recordId: newOppId,
                    program: "DirecTV"
                };
                let event = new CustomEvent("newproduct", {
                    detail: values,
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                console.log(error);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    homeHandler() {
        if (this.isGuestUser) {
            const goBackEvent = new CustomEvent("home", {
                detail: "",
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(goBackEvent);
            return;
        }

        switch (this.origin) {
            case "phonesales":
                this[NavigationMixin.Navigate]({
                    type: "comm__namedPage",
                    attributes: {
                        name: "Clicker_Call_Center__c"
                    }
                });
                break;
            case "retail":
                this[NavigationMixin.Navigate]({
                    type: "comm__namedPage",
                    attributes: {
                        name: "retail_clicker__c"
                    }
                });
                break;
            case "event":
                this[NavigationMixin.Navigate]({
                    type: "comm__namedPage",
                    attributes: {
                        name: "Clicker_Event__c"
                    }
                });
                break;
            case "maps":
                this[NavigationMixin.Navigate]({
                    type: "comm__namedPage",
                    attributes: {
                        name: "Door_to_door__c"
                    }
                });
                break;
        }
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleSignatureDone(event) {
        this.showSignature = false;
        this.signatureIncomplete = false;
    }

    handleSignatureCancel(event) {
        this.showSignature = false;
    }

    signatureModalHandler() {
        this.showSignature = true;
    }

    returnToUrlHandler() {
        window.open(this.returnUrl, "_self");
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Order Success",
            component: "poe_lwcBuyflowDirecTvEngaOrderSuccessTab",
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
            tab: "Order Success"
        };
        this.dispatchEvent(event);
    }
}