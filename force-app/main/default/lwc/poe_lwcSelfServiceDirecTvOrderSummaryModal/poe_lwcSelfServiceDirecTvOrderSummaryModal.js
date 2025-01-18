import { api } from 'lwc';
import LightningModal from "lightning/modal";

export default class Poe_lwcSelfServiceDirecTvOrderSummaryModal extends LightningModal {
    @api orderInfo;
    @api origin;
    @api recordId;
    @api productSelected;
    @api hardwareSelected;
    @api paymentInfo;
    @api confirmedDate;
    type;
    // showSignatureModal = false;

    // openSummarySignatureModal() {
    //     const sendSummarySignatureEvent = new CustomEvent("showsummarysignaturemodal");
    //     this.dispatchEvent(sendSummarySignatureEvent);
    // }

    get customerName() {
        return `${this.orderInfo.customer.firstName} ${this.orderInfo.customer.lastName}`;
    }

    get paymentInfoCustomerName() {
        return `${this.paymentInfo.firstName} ${this.paymentInfo.lastName}`;
    }

    get addressText() {
        const { addressLine1, addressLine2, city, state, zipCode } = this.orderInfo.account.shippingAddress;
        return `${addressLine1} ${addressLine2 || ''} ${city} ${state}, ${zipCode}`;
    }

    hideModal() {
        this.close();
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