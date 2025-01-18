import { LightningElement, api } from 'lwc';
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import addNewProduct from '@salesforce/apex/InfoTabController.addNewProduct';

export default class Poe_lwcSelfServiceEarthlinkOrderSuccessTab extends LightningElement {
    @api recordId;
    @api origin;
    @api orderNumber = '1234124';
    @api orderId;
    @api referenceNumber = '553214';
    @api clientInfo;
    @api isGuestUser;
    homeButtonLabel;
    showCollateral = false;
    signatureIncomplete = true;
    showSignature;
    name;
    address;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }
    get iconCheckGreen() {
		return chuzoSiteResources + '/images/icon-check.svg';
	}

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    connectedCallback(){
        this.homeButtonLabel = this.isGuestUser ? "Home" : "New Customer";
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
                console.log("Add product", response);
                this.loaderSpinner = false;
                let newOppId = response.result.Opportunity.Id;
                let values = {
                    recordId: newOppId,
                    program: "Earthlink"
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
                    type: INTERNAL_ERROR
                });
                this.loaderSpinner = false;
            });
    }

    homeHandler() {
        if (this.isGuestUser) {
            const goBackEvent = new CustomEvent("home", {
                detail: ""
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

    handleLogError(data) {
        let errorLog = {
            type: data.type,
            provider: "Earthlink",
            tab: "Order Success",
            component: "poe_lwcBuyflowEarthlinkOrderSuccessTab",
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