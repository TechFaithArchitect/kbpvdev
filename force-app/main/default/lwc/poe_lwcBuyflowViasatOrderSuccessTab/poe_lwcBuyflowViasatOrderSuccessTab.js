import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import addNewProduct from "@salesforce/apex/InfoTabController.addNewProduct";
import Order_Completed_Title from "@salesforce/label/c.Order_Completed_Title";
import New_Product_Button_Label from"@salesforce/label/c.New_Product_Button_Label";  

export default class Poe_lwcBuyflowViasatOrderSuccessTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api origin;
    @api orderNumber;
    @api orderId;
    @api referenceNumber;
    @api clientInfo;
    @api isGuestUser;
    @api email;
    @api phone;
    showCollateral = false;
    signatureIncomplete = true;
    showSignature;
    name;
    address;
    homeLabel = "New Customer";

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    labels = {
        Order_Completed_Title,
        New_Product_Button_Label
    };

    connectedCallback() {
        this.homeLabel = this.isGuestUser ? "Home" : "New Customer";
        let info = JSON.parse(JSON.stringify(this.clientInfo));
        this.name = info.contactInfo.firstName + " " + info.contactInfo.lastName;
        this.address =
            info.addressInfo.address +
            ", " +
            info.addressInfo.city +
            " " +
            info.addressInfo.state +
            " " +
            info.addressInfo.zip;
    }

    newOpportunityHandler() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };
        addNewProduct({ myData: myData })
            .then((response) => {
                this.loaderSpinner = false;
                let newOppId = response.result.Opportunity.Id;
                let values = {
                    recordId: newOppId,
                    program: "Viasat"
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
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
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
        } else {
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

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Order Success",
            component: "Poe_lwcBuyflowViasatOrderSuccessTab",
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
            tab: "Order Success"
        };
        this.dispatchEvent(event);
    }
}