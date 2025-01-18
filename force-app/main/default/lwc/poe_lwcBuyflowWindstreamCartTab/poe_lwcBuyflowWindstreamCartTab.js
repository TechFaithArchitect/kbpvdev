import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import orderSummaryReminder from "@salesforce/label/c.Windstream_Order_Summary_Reminder";
import Todays_Charges_labels from "@salesforce/label/c.Todays_Charges_labels";
import Todays_Total_plus_taxes_and_surcharges_labels from "@salesforce/label/c.Todays_Total_plus_taxes_and_surcharges_labels";
import One_Time_Payments_labels from "@salesforce/label/c.One_Time_Payments_labels";
import One_Time_Payments_Total_plus_taxes_and_surcharges_labels from "@salesforce/label/c.One_Time_Payments_Total_plus_taxes_and_surcharges_labels";
import Estimated_First_Months_Total_plus_taxes_and_surcharges_lables from "@salesforce/label/c.Estimated_First_Months_Total_plus_taxes_and_surcharges_lables";
import First_Months_Estimated_Bundle_Charges_labels from "@salesforce/label/c.First_Months_Estimated_Bundle_Charges_labels";
import First_Months_Estimated_Adders_Charges_labels from "@salesforce/label/c.First_Months_Estimated_Adders_Charges_labels";


export default class Poe_lwcBuyflowWindstreamCartTab extends NavigationMixin(LightningElement) {
    @api logo;
    @api cartInfo;
    @api recordId;
    @api isGuestUser;
    products = [];
    adders = [];
    estimatedFirstMonthTotal = 0;
    estimatedOneTimeTotal = 0;
    loaderSpinner;
    showCollateral = false;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        orderSummaryReminder,
        Todays_Charges_labels,
        Todays_Total_plus_taxes_and_surcharges_labels,
        One_Time_Payments_labels,
        One_Time_Payments_Total_plus_taxes_and_surcharges_labels,
        Estimated_First_Months_Total_plus_taxes_and_surcharges_lables,
        First_Months_Estimated_Bundle_Charges_labels,
        First_Months_Estimated_Adders_Charges_labels
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

    connectedCallback() {}

    handleClick() {
        let totalAmount = (Number(this.estimatedFirstMonthTotal) + Number(this.estimatedOneTimeTotal)).toFixed(2);
        const sendCartNextEvent = new CustomEvent("cartnext");
        this.dispatchEvent(sendCartNextEvent);
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "Order Summary"
        };
        this.dispatchEvent(event);
    }
}