import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";

import SELF_SERVICE_VALIDATE_LEAVING_MESSAGE from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import SELF_SERVICE_VALIDATE_LEAVING_TITLE from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import EARTHLINK_CART_TAB_FIRST_MONTH_CHARGES_TITLE from "@salesforce/label/c.EarthLink_Cart_Tab_First_Month_Charges_Title";
import EARTHLINK_CART_TAB_FIRST_MONTH_TOTAL_TITLE from "@salesforce/label/c.EarthLink_Cart_Tab_First_Month_Total_Title";
import EARTHLINK_CART_TAB_ONE_TIME_CHARGES_TITLE from "@salesforce/label/c.EarthLink_Cart_Tab_One_Time_Charges_Title";
import ONE_TIME_TOTAL_TITLE from "@salesforce/label/c.EarthLink_Cart_Tab_One_Time_Total_Title";
import EARTHLINK_CART_TAB_BOTTOM_NOTE from "@salesforce/label/c.EarthLink_Cart_Tab_Bottom_Note";

export default class Poe_lwcBuyflowEarthlinkCartTab extends NavigationMixin(LightningElement) {
    @api logo;
    @api product;
    @api recordId;
    @api selectedServices;
    @api firstFee;
    @api cartInfo;
    @api isGuestUser;
    products = [];
    activations = [];
    estimatedFirstMonthTotal = 0;
    estimatedOneTimeTotal = 0;
    loaderSpinner;
    showCollateral = false;
    labels = {
        SELF_SERVICE_VALIDATE_LEAVING_TITLE,
        SELF_SERVICE_VALIDATE_LEAVING_MESSAGE,
        EARTHLINK_CART_TAB_FIRST_MONTH_CHARGES_TITLE,
        EARTHLINK_CART_TAB_FIRST_MONTH_TOTAL_TITLE: `${EARTHLINK_CART_TAB_FIRST_MONTH_TOTAL_TITLE}*`,
        EARTHLINK_CART_TAB_ONE_TIME_CHARGES_TITLE,
        ONE_TIME_TOTAL_TITLE: `${ONE_TIME_TOTAL_TITLE}*`,
        EARTHLINK_CART_TAB_BOTTOM_NOTE
    };
    showSelfServiceCancelModal = false;

    get isNotGuestUser() { return !this.isGuestUser }

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

    connectedCallback() {
        this.loaderSpinner = true;
        let chosen = [];
        let services = [];
        let prod = {
            Id: 1,
            value: this.product.Name,
            price: this.product.UnitPrice.toString()
        };
        if (this.product.PriceType === "Monthly") {
            this.estimatedFirstMonthTotal = (
                Number(this.estimatedFirstMonthTotal) + Number(this.product.UnitPrice)
            ).toFixed(2);
            chosen.push(prod);
        } else {
            this.estimatedOneTimeTotal = (Number(this.estimatedOneTimeTotal) + Number(this.product.UnitPrice)).toFixed(
                2
            );
            services.push(prod);
        }
        if (this.selectedServices.length > 0) {
            this.selectedServices.forEach((service) => {
                let serv = {
                    Id: service.servRef,
                    value: service.Name,
                    price: service.UnitPrice.toString()
                };
                if (service.PriceType === "Monthly") {
                    this.estimatedFirstMonthTotal = (
                        Number(this.estimatedFirstMonthTotal) + Number(service.UnitPrice)
                    ).toFixed(2);
                    chosen.push(serv);
                } else {
                    this.estimatedOneTimeTotal = (
                        Number(this.estimatedOneTimeTotal) + Number(service.UnitPrice)
                    ).toFixed(2);
                    services.push(serv);
                }
            });
        }
        if (this.firstFee.hasOwnProperty("fee")) {
            if (this.firstFee.fee !== "0") {
                let activ = {
                    price: Number(this.firstFee.fee).toFixed(2),
                    value: this.firstFee.name,
                    id: this.firstFee.name
                };
                services.push(activ);
                this.estimatedOneTimeTotal = Number(this.estimatedOneTimeTotal) + Number(this.firstFee.fee);
            }
        }
        this.activations = [...services];
        this.products = [...chosen];
        this.loaderSpinner = false;
    }

    handleClick() {
        const sendCartNextEvent = new CustomEvent("cartnext", {
            detail: this.estimatedFirstMonthTotal
        });
        this.dispatchEvent(sendCartNextEvent);
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }
}