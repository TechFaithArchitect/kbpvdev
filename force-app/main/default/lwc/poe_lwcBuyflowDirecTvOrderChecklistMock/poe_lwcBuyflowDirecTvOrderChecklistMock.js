import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class Poe_lwcBuyflowDirecTvOrderChecklistMock extends LightningElement {
    @api returnUrl;
    @api title = "Order Checklist Items";
    disclosureAgreementLabel = "I have read the above disclosures to the customer, and the customer agreed";
    agreementPayments = false;
    agreementCancellationPolicy = false;
    agreementPremiumMovieChannels = false;
    agreementMovingTerms = false;
    agreementHighSpeedInternet = false;

    @api orderCheckListItem = [
        {
            Id: 1,
            title: "Payments",
            value: [
                {
                    text: "DIRECTV Via Internet is auto-charged in advance monthly to your payment method on your account. You will not receive a monthly bill. You authorize DIRECTV to automatically charge today’s one-time charges, all monthly payments, and any cancellation fees and/or balances to the card on your account."
                },
                {
                    text: "Your first auto-charged payment will occur when DIRECTV Via Internet service is activated on your TV, or on day 15 post order, whichever comes first.  DIRECTV Via Internet will charge your monthly payments on the same date every month unless your 1st payment is on the 29th through 31st of a given month, in which case you will be charged on the first day of each month."
                }
            ]
        },
        {
            Id: 2,
            title: "DIRECTV Via Internet Cancellation Policy",
            value: [
                {
                    text: "You can make changes to your account or cancel service by calling 800-531-5000"
                },
                {
                    text: "Purchased devices may be returned within 14 days for a full refund. Devices purchased on installment agreement subject to additional terms and conditions. See cancellation policy at directv.com/CancellationPolicyStream for more details. DIRECTV Via Internet Device comes with a limited 2-year warranty. Term and details can be found at https://www.directv.com/WarrantyInformation"
                }
            ]
        },
        {
            Id: 3,
            title: "Premium Movie Channels",
            value: [
                {
                    text: "Premiums promotional offers include premium channels at no extra cost for a certain promotional period. If you select a premium channel promotional offer, services will auto-renew at the end of the promotional period at the rate of those Premiums then in effect, unless you call 800-531-5000 PRIOR to the end of the Premium promotional period or at any later time to cancel."
                }
            ]
        },
        {
            Id: 4,
            title: "Moving Terms",
            value: [
                {
                    text: "Watch at home on your DIRECTV Via Internet device, or stream anywhere in the U.S. on your mobile device (excludes Puerto Rico and U.S. Virgin Islands). "
                },
                {
                    text: "Streaming on compatible 3rd party devices may be limited to the home Wi-Fi network connected to your DIRECTV Via Internet device."
                },
                {
                    text: "You can move your DIRECTV Via Internet device up to 4 times within a 12-month period."
                }
            ]
        },
        {
            Id: 5,
            title: "High Speed Internet",
            value: [
                {
                    text: "Data connection required. DIRECTV recommends a minimum internet speed of 8Mbps per stream for optimal viewing. All streams must be on the same home network and a compatible router is required. Certain channels are excluded. Limit 3 concurrent out-of-home DIRECTV Via Internet streams."
                }
            ]
        }
    ];

    handleCancel() {
        if (this.returnUrl != undefined) {
            window.open(this.returnUrl, "_self");
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

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }
    handleAgreement(event) {
        let str = event.currentTarget.dataset.id;
        switch (str) {
            case "1":
                this.agreementPayments = event.target.checked;
                break;
            case "2":
                this.agreementCancellationPolicy = event.target.checked;
                break;
            case "3":
                this.agreementPremiumMovieChannels = event.target.checked;
                break;
            case "4":
                this.agreementMovingTerms = event.target.checked;
                break;
            case "5":
                this.agreementHighSpeedInternet = event.target.checked;
                break;
        }
    }

    handleClick() {
        if (
            this.agreementPayments &&
            this.agreementCancellationPolicy &&
            this.agreementPremiumMovieChannels &&
            this.agreementMovingTerms &&
            this.agreementHighSpeedInternet
        ) {
            const sendCartNextEvent = new CustomEvent("orderchecklistnext", {
                detail: ""
            });
            this.dispatchEvent(sendCartNextEvent);
            const event = new ShowToastEvent({
                title: "Success",
                variant: "success",
                message: "Your information has been saved!"
            });
            this.dispatchEvent(event);
        } else {
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: "Please verify for order items not checked."
            });
            this.dispatchEvent(event);
        }
    }
}