import { LightningElement, api } from "lwc";

export default class Poe_lwcBuyflowDirecTvOrderSummaryMock extends LightningElement {
    @api orderInfo;
    @api origin;
    @api recordId;
    @api productSelected;
    @api hardwareSelected;
    @api paymentInfo;
    @api confirmedDate;
    @api serviceType;
    type;
    showSignatureModal = false;

    openSummarySignatureModal() {
        const sendSummarySignatureEvent = new CustomEvent("showsummarysignaturemodal");
        this.dispatchEvent(sendSummarySignatureEvent);
    }

    hideModal() {
        console.log("hide clicked");
        const closeModalEvent = new CustomEvent("closesummary", {
            detail: "summary"
        });
        this.dispatchEvent(closeModalEvent);
    }

    connectedCallback() {
        console.log("PAYMENT INFO", this.paymentInfo);
        //this.showSignatureModal = this.origin !== "callcenter" && this.origin !== "retail";
        switch (this.paymentInfo.cardType) {
            case "VI":
                this.type = "Visa";
                break;
            case "DI":
                this.type = "Discover";
                break;
            case "AM":
                this.type = "American Express";
                break;
            case "MC":
                this.type = "Mastercard";
                break;
            default:
                this.type = this.paymentInfo.cardType;
        }
    }
}