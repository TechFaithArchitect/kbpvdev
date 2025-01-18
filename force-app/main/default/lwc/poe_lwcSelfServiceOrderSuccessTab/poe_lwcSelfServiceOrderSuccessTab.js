import { LightningElement, api } from "lwc";
import { loadStyle } from "lightning/platformResourceLoader";
import addNewProduct from "@salesforce/apex/InfoTabController.addNewProduct";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

import HOME_BUTTON_LABEL from "@salesforce/label/c.Home_Button_Label";
import NEW_CUSTOMER_BUTTON_LABEL from "@salesforce/label/c.New_Customer_Button_Label";
import NEW_PRODUCT_BUTTON_LABEL from "@salesforce/label/c.New_Product_Button_Label";
import ORDER_SUCCESS_TAB_NAME_LABEL from "@salesforce/label/c.Order_Success_Tab_Name_Label";
import CONFIRMATION_NUMBER_LABEL from "@salesforce/label/c.Confirmation_Number_Label";
import ORDER_NUMBER_LABEL from "@salesforce/label/c.Order_Number_Label";
import REFERENCE_NUMBER_LABEL from "@salesforce/label/c.Reference_Number_Label";
import ORDER_SUCCESS_TAB_SUBTITLE from "@salesforce/label/c.Self_Service_Order_Success_Tab_Subtitle";
import QUOTE_NUMBER_FIELD_LABEL from "@salesforce/label/c.Quote_Number_Field_Label";
import BILLING_TELEPHONE_NUMBER_FIELD_LABEL from "@salesforce/label/c.Billing_Telephone_Number_Field_Label";

export default class Poe_lwcSelfServiceOrderSuccessTab extends LightningElement {
    @api recordId;
    @api origin;
    @api orderNumber;
    @api orderId;
    @api referenceNumber;
    @api returnUrl;
    @api clientInfo;
    @api isGuestUser;
    @api program;
    @api btn;
    @api quoteNumber;
    homeButtonLabel;
    showCollateral = false;
    signatureIncomplete = true;
    showSignature;
    name;
    address;
    hasReturnUrl = false;
    loaderSpinner = false;
    labels = {
        NEW_PRODUCT_BUTTON_LABEL,
        ORDER_SUCCESS_TAB_NAME_LABEL,
        CONFIRMATION_NUMBER_LABEL,
        REFERENCE_NUMBER_LABEL,
        ORDER_SUCCESS_TAB_SUBTITLE,
        QUOTE_NUMBER_FIELD_LABEL,
        BILLING_TELEPHONE_NUMBER_FIELD_LABEL,
        ORDER_NUMBER_LABEL
    };

    get isNotGuestUser() {
        return !this.isGuestUser;
    }
    get iconCheckGreen() {
        return chuzoSiteResources + "/images/icon-check.svg";
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get isFrontier() {
        return this.program === "frontier";
    }

    connectedCallback() {
        this.homeButtonLabel = this.isGuestUser ? HOME_BUTTON_LABEL : NEW_CUSTOMER_BUTTON_LABEL;

        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");

        this.hasReturnUrl = this.returnUrl != undefined;
    }

    newOpportunityHandler() {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };
        addNewProduct({ myData: myData })
            .then((response) => {
                console.log("Add product", response);
                this.loaderSpinner = false;
                let newOppId = response.result.Opportunity.Id;
                let program;

                switch (this.program) {
                    case "directv":
                        program = "DirecTV";
                        break;
                    case "earthlink":
                        program = "Earthlink";
                        break;
                    case "frontier":
                        program = "Frontier";
                        break;
                }

                let values = {
                    recordId: newOppId,
                    program
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
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: "Internal Error"
                });
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

    returnToUrlHandler() {
        window.open(this.returnUrl, "_self");
    }

    handleLogError(data) {
        let errorLog = {
            type: data.type,
            provider: this.program,
            tab: "Order Success",
            component: "poe_lwcSelfServiceOrderSuccessTab",
            error: data.error,
            endpoint: data.endpoint,
            request: JSON.stringify(data.request),
            opportunity: data.opportunity
        };

        let event = new CustomEvent("logerror", {
            detail: errorLog
        });
        this.dispatchEvent(event);
    }
}