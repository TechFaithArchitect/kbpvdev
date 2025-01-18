import { LightningElement, api, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import First_Months_Estimated_Bundle_Charges_labels from "@salesforce/label/c.First_Months_Estimated_Bundle_Charges_labels";
import EarthLink_Cart_Tab_First_Month_Total_Title from "@salesforce/label/c.EarthLink_Cart_Tab_First_Month_Total_Title";
import First_Months_Estimated_Adders_Charges_labels from "@salesforce/label/c.First_Months_Estimated_Adders_Charges_labels";


export default class Poe_lwcBuyflowViasatCartTab extends NavigationMixin(LightningElement) {
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
        First_Months_Estimated_Bundle_Charges_labels,
        EarthLink_Cart_Tab_First_Month_Total_Title,
        First_Months_Estimated_Adders_Charges_labels
    };

    get isNotGuestUser() { return !this.isGuestUser }

    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: this.recordId,
                objectApiName: "Opportunity",
                actionName: "view"
            }
        });
    }

    connectedCallback() {
        this.loaderSpinner = true;
        let allProducts = JSON.parse(JSON.stringify(this.cartInfo));
        let chosen = [];
        let chosenAdders = [];
        let prod = {
            Id: allProducts.product.servRef,
            value: allProducts.productName,
            price: allProducts.product.UnitPrice.toFixed(2)
        };
        chosen.push(prod);
        if (allProducts.product.PriceType === "12 Months") {
            this.estimatedFirstMonthTotal = this.estimatedFirstMonthTotal + Number(allProducts.product.UnitPrice);
            this.estimatedFirstMonthTotal = this.estimatedFirstMonthTotal.toFixed(2);
        } else {
            this.estimatedOneTimeTotal = this.estimatedOneTimeTotal + allProducts.product.UnitPrice;
            this.estimatedOneTimeTotal = Number(this.estimatedOneTimeTotal).toFixed(2);
        }
        this.products = [...chosen];
        allProducts.adders.forEach((adder) => {
            let add = {
                Id: adder.servRef,
                value: adder.Name,
                price: adder.UnitPrice.toFixed(2)
            };
            chosenAdders.push(add);
            this.estimatedOneTimeTotal = Number(this.estimatedOneTimeTotal) + Number(adder.UnitPrice);
            this.estimatedOneTimeTotal = Number(this.estimatedOneTimeTotal).toFixed(2);
        });
        this.adders = [...chosenAdders];
        this.loaderSpinner = false;
    }

    handleClick() {
        let totalAmount = (Number(this.estimatedFirstMonthTotal) + Number(this.estimatedOneTimeTotal)).toFixed(2);
        const sendCartNextEvent = new CustomEvent("cartnext", {
            detail: totalAmount
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