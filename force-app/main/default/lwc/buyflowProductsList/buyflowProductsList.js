import { LightningElement, track } from "lwc";
import { OmniscriptBaseMixin } from "vlocity_cmt/omniscriptBaseMixin";

export default class BuyflowProductsList extends OmniscriptBaseMixin(LightningElement) {
    @track products = [];
    @track bundles = [];

    initialProducts = [];
    initialBundles = [];

    connectedCallback() {
        let data = JSON.parse(JSON.stringify(this.omniJsonData));
        this.products = data.products;
        this.initialProducts = data.products;
        this.bundles = data.bundles;
        this.initialBundles = data.bundles;
    }
    
    get productsRadioOptions() {
        return this.products.map(function (obj) {
            return {
                label: obj.Name + " - Price: $" + obj.Price + " - " + obj.PriceType,
                value: obj.Id
            };
        });
    }

    get bundlesRadioOptions() {
        return this.bundles.map(function (obj) {
            return {
                label: obj.Name + " - Price: $" + obj.Price + " - " + obj.PriceType,
                value: obj.Id
            };
        });
    }

    activeSections = ["EarthLinkStandalone", "EarthLinkBundle", "EarthLinkInstallationType"];
    value = "all";
    @track selectedItem = "0";
    @track selectedItemPriceMonthly = "0";
    @track selectedItemNameMonthly;
    @track selectedItemPriceOneTime = "0";
    @track selectedItemNameOneTime;
    @track selectedTarget;

    get options() {
        return [
            { label: "INTERNET", value: "internet" },
            { label: "PHONE", value: "phone" },
            { label: "ALL", value: "all" },
            { label: "INSTALLATION TYPE", value: "installationType" }
        ];
    }

    handleFilterProducts(event) {
        const selectedOption = event.detail.value;
        if (selectedOption == "all") {
            this.products = this.initialProducts;
            this.bundles = this.initialBundles;
        } else if (selectedOption == "phone" || selectedOption == "internet") {
            this.products = this.initialProducts.filter((product) => product.Type == selectedOption);
            this.bundles = this.initialBundles.filter((bundle) => bundle.Type == selectedOption);
        }
    }

    handlePriceChange(event) {
        this.value = event.detail.value;
        let allproducts = this.products.concat(this.bundles);
        this.selectedItem = allproducts.findIndex((product) => product.Id === event.detail.value);
        console.log(this.selectedItem);
        if (allproducts[this.selectedItem].PriceType == "Monthly") {
            this.selectedItemPriceMonthly = allproducts[this.selectedItem].Price;
            this.selectedItemNameMonthly = allproducts[this.selectedItem].Name;
            this.selectedItemPriceOneTime = "0";
            this.selectedItemNameOneTime = "";
            console.log(this.selectedItemPriceMonthly);
        } else if (allproducts[this.selectedItem].PriceType == "One Time") {
            this.selectedItemPriceOneTime = allproducts[this.selectedItem].Price;
            this.selectedItemNameOneTime = allproducts[this.selectedItem].Name;
            this.selectedItemPriceMonthly = "0";
            this.selectedItemNameMonthly = "";
            console.log(this.selectedItemPriceOneTime);
        }

        this.omniApplyCallResp({productSelected: allproducts[this.selectedItem]});
    }
}