import { LightningElement, track, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";

export default class Poe_lwcBuyflowEarthlinkTermsTab extends NavigationMixin(LightningElement) {
    @track title = "Terms & Conditions";
    @api referenceNumber;
    @api logo;
    @api recordId;
    @api isGuestUser;
    showCollateral=false;
    @track orderType = "NLLS";
    @track productTitle = "EARTHLINK";
    @track productDisclosure = [
        {
            Id: 1,
            value: "YOU ARE ENTERING A NEW 24 MONTH-SERVICE AGREEMENT. IF YOU DISCONNECT EARLY YOU WILL BE CHARGED $20 FOR EACH MONTH REMAINING IN YOUR AGREEMENT. YOU EQUIPMENT IS LEASED, SO IF YOU CANCEL YOUR SERVICE YOU MUST RETURN THE EQUIPMENT TO AVOID NON-RETURN FEES ON MONTH 13 YOUR DISCOUNT WILL ROLL OFF AND YOUR PACKAGE PRICE WILL RETURN TO THE RACK RATE."
        },
        {
            Id: 2,
            value: "IF YOU RENT THE PROPERTY WHERE SERVICE IS BEING INSTALLED, PERMISSION FROM YOUR LANDLORD IS REQUIRED TO ALLOW EARTHLINK TO INSTALL YOUR SERVICES. YOU WILL RECEIVE A LINK TO THE LANDLORD PERMISSION FORM IN YOUR INITIAL CONFIRMATION EMAIL."
        },
        { Id: 3, value: "BE SURE TO READ THE CUSTOMER AGREEMENT." }
    ];
    @track productInstallation =
        "STANDARD INSTALLATION IS INCLUDED WITH THIS EARTHLINK ORDER. THIS INCLUDES THE FOLLOWING:";

    @track productOptions = [
        { Id: 1, name: "a", value: "INSTALLING HARDWARE NEEDED." },
        { Id: 2, name: "b", value: "CONNECTING RECIEVERS." },
        { Id: 3, name: "c", value: "ROUTING ALL CABLES." }
    ];

    get isNotGuestUser() { return !this.isGuestUser }

    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Opportunity',
                actionName: 'view'
            },
        });
    }

    handleClick() {
        const sendTermsNextEvent = new CustomEvent("termsnext");
        this.dispatchEvent(sendTermsNextEvent);
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === 'show' ? true: false;
    }
}