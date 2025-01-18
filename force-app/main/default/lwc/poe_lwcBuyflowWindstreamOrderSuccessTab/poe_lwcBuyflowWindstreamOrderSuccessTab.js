import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import addNewProduct from "@salesforce/apex/InfoTabController.addNewProduct";
import COPPER_REVIEW_VERBIAGE from "@salesforce/label/c.POE_Windstream_Copper_Review";
import SELF_INSTALL_VERBIAGE from "@salesforce/label/c.POE_Windstream_Self_Install_Verbiage";
import Windstream_Order_Needs_Review from "@salesforce/label/c.Windstream_Order_Needs_Review";
import Order_Completed_Title from "@salesforce/label/c.Order_Completed_Title";
import 	New_Product_Button_Label from "@salesforce/label/c.New_Product_Button_Label";
import New_Customer_Button_Label from  "@salesforce/label/c.New_Customer_Button_Label";

export default class Poe_lwcBuyflowWindstreamOrderSuccessTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api origin;
    @api orderNumber;
    @api orderId;
    @api referenceNumber;
    @api clientInfo;
    @api orderInfo;
    @api skipInstallation;
    @api skipInstallDateSelection;
    @api reviewCopper;
    @api reviewPhoneNumber;
    @api creditCheckResponseVerbiage;
    @api isGuestUser;
    @api offerId;
    @api email;
    @api phone;
    homeLabel = "New Customer";
    showCollateral = false;
    signatureIncomplete = true;
    showSignature;
    name;
    address;
    copperReviewVerbiage = COPPER_REVIEW_VERBIAGE;
    selfInstallVerbiage = SELF_INSTALL_VERBIAGE;

    labels = {
        Windstream_Order_Needs_Review,
        Order_Completed_Title,
        New_Product_Button_Label,
        New_Customer_Button_Label
    };

    get review() {
        return this.skipInstallDateSelection || this.reviewCopper || this.skipInstallation;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        console.log("skip? ", this.skipInstallDateSelection);
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
        if (this.creditCheckResponseVerbiage == "" || this.creditCheckResponseVerbiage == undefined) {
            this.creditCheckResponseVerbiage = `<h1>Order Needs Review.</h1><p>You must call ISD after submitting the order with the consumer on the phone at ${this.orderInfo.reviewPhoneNumber} to clear the alert and get an install date.</p><p>The order will be held until alert is cleared</p>`;
        } else {
            this.creditCheckResponseVerbiage = this.creditCheckResponseVerbiage.replace(this.offerId, this.orderNumber);
        }
    }

    newOpportunityHandler() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };

        addNewProduct({ myData })
            .then((response) => {
                console.log(response);
                this.loaderSpinner = false;
                let newOppId = response.result.Opportunity.Id;
                let values = {
                    recordId: newOppId,
                    program: "Windstream"
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

    logError(errorMessage) {
        const error = {
            type: "Internal Error",
            tab: "Order Success",
            component: "poe_lwcBuyflowWindstreamOrderSuccessTab",
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