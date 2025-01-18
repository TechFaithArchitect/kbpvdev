import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import Products_Preview from "@salesforce/label/c.Products_Preview";
import Plans_available_for from "@salesforce/label/c.Plans_available_for";
import Service_Address_Title from "@salesforce/label/c.Service_Address_Title";

const stateNames = [
    { name: "Alabama", abbrev: "AL" },
    { name: "Alaska", abbrev: "AK" },
    { name: "Arizona", abbrev: "AZ" },
    { name: "Arkansas", abbrev: "AR" },
    { name: "California", abbrev: "CA" },
    { name: "Colorado", abbrev: "CO" },
    { name: "Connecticut", abbrev: "CT" },
    { name: "Delaware", abbrev: "DE" },
    { name: "District of Columbia", abbrev: "DC" },
    { name: "Florida", abbrev: "FL" },
    { name: "Georgia", abbrev: "GA" },
    { name: "Hawaii", abbrev: "HI" },
    { name: "Idaho", abbrev: "ID" },
    { name: "Illinois", abbrev: "IL" },
    { name: "Indiana", abbrev: "IN" },
    { name: "Iowa", abbrev: "IA" },
    { name: "Kansas", abbrev: "KS" },
    { name: "Kentucky", abbrev: "KY" },
    { name: "Louisiana", abbrev: "LA" },
    { name: "Maine", abbrev: "ME" },
    { name: "Maryland", abbrev: "MD" },
    { name: "Massachusetts", abbrev: "MA" },
    { name: "Michigan", abbrev: "MI" },
    { name: "Minnesota", abbrev: "MN" },
    { name: "Mississippi", abbrev: "MS" },
    { name: "Missouri", abbrev: "MO" },
    { name: "Montana", abbrev: "MT" },
    { name: "Nebraska", abbrev: "NE" },
    { name: "Nevada", abbrev: "NV" },
    { name: "New Hampshire", abbrev: "NH" },
    { name: "New Jersey", abbrev: "NJ" },
    { name: "New Mexico", abbrev: "NM" },
    { name: "New York", abbrev: "NY" },
    { name: "North Carolina", abbrev: "NC" },
    { name: "North Dakota", abbrev: "ND" },
    { name: "Ohio", abbrev: "OH" },
    { name: "Oklahoma", abbrev: "OK" },
    { name: "Oregon", abbrev: "OR" },
    { name: "Pennsylvania", abbrev: "PA" },
    { name: "Rhode Island", abbrev: "RI" },
    { name: "South Carolina", abbrev: "SC" },
    { name: "South Dakota", abbrev: "SD" },
    { name: "Tennessee", abbrev: "TN" },
    { name: "Texas", abbrev: "TX" },
    { name: "Utah", abbrev: "UT" },
    { name: "Vermont", abbrev: "VT" },
    { name: "Virginia", abbrev: "VA" },
    { name: "Washington", abbrev: "WA" },
    { name: "West Virginia", abbrev: "WV" },
    { name: "Wisconsin", abbrev: "WI" },
    { name: "Wyoming", abbrev: "WY" }
];

export default class Poe_lwcBuyflowViasatProductsPreviewTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api origin;
    @api userId;
    @api selected;
    @api payload;
    @api isGuestUser;
    showCollateral = false;
    products = [];
    initialProducts = [];
    stateOptions = [];
    showSBS = false;
    clientInfo = {};
    loaderSpinner;
    disableNext = true;
    agreementId;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        Products_Preview,
        Plans_available_for,
        Service_Address_Title
    };
    showSelfServiceCancelModal = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        this.loaderSpinner = true;
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.stateOptions.push(option);
        });
        let clientInfoParsed = JSON.parse(JSON.stringify(this.payload));
        this.clientInfo = { ...clientInfoParsed };
        if (this.clientInfo.hasOwnProperty("addressInfo")) {
            this.clientInfo.addressInfo.address !== undefined && this.clientInfo.addressInfo.address !== null
                ? (this.billingAddress = this.clientInfo.addressInfo.address)
                : "";
            this.clientInfo.addressInfo.apt !== undefined && this.clientInfo.addressInfo.apt !== null
                ? (this.billingApt = this.clientInfo.addressInfo.apt)
                : "";
            this.clientInfo.addressInfo.number !== undefined && this.clientInfo.addressInfo.number !== null
                ? (this.billingNumber = this.clientInfo.addressInfo.number)
                : "";
            this.clientInfo.addressInfo.building !== undefined && this.clientInfo.addressInfo.building !== null
                ? (this.billingBuilding = this.clientInfo.addressInfo.building)
                : "";
            this.clientInfo.addressInfo.city !== undefined && this.clientInfo.addressInfo.city !== null
                ? (this.billingCity = this.clientInfo.addressInfo.city)
                : "";
            this.clientInfo.addressInfo.number !== undefined && this.clientInfo.addressInfo.number !== null
                ? (this.billingNumber = this.clientInfo.addressInfo.number)
                : "";
            this.clientInfo.addressInfo.floor !== undefined && this.clientInfo.addressInfo.floor !== null
                ? (this.billingFloor = this.clientInfo.addressInfo.floor)
                : "";
            this.clientInfo.addressInfo.state !== undefined && this.clientInfo.addressInfo.state !== null
                ? (this.billingState = this.clientInfo.addressInfo.state)
                : "";
            this.clientInfo.addressInfo.zip !== undefined && this.clientInfo.addressInfo.zip !== null
                ? (this.billingZip = this.clientInfo.addressInfo.zip)
                : "";
        }
        const path = "productDetails";
        let myData = {
            partnerName: "viasat",
            path: path,
            salesAgreementId: this.clientInfo.salesAgreementId,
            location: {
                address: this.clientInfo.location.address,
                latitude: this.clientInfo.location.latitude,
                longitude: this.clientInfo.location.longitude
            }
        };
        console.log("Products Preview Payload :", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                console.log("Products Preview  Response:", JSON.parse(response));
                let responseParsed = JSON.parse(response);
                let error =
                    (responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        responseParsed.result.error.hasOwnProperty("provider") &&
                        responseParsed.result.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error
                        : responseParsed.result.error.provider.message.hasOwnProperty("message")
                        ? responseParsed.result.error.provider.message.message
                        : responseParsed.result.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.loaderSpinner = false;
                    this.dispatchEvent(event);
                } else {
                    let products = [];
                    let result = responseParsed;
                    let productTypes = result.hasOwnProperty("product_types") ? result.product_types : undefined;
                    this.agreementId = result.salesAgreementId;
                    if (productTypes !== undefined) {
                        productTypes.forEach((item) => {
                            let intProduct = { ...this.productWrapper(item) };
                            products.push(intProduct);
                        });
                    }
                    let aux = this.sortProduct(products);
                    this.products = [...aux];
                    this.initialProducts = [...products];
                    this.disableNext = false;
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The Product request could not be made correctly to the server. Please, try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    productWrapper(item) {
        let characteristicsIndex = item.marketing_copy.translations.findIndex((e) =>
            e.hasOwnProperty("characteristics")
        );
        let priceIndex = item.prices.findIndex((e) => e.hasOwnProperty("amount"));

        let price;
        let dataCap;
        let uploadSpeed;
        let downloadSpeed;
        let description;
        let name;
        let feeText;
        let disclosureText;
        let uiCharacteristics = [...item.marketing_copy.ui_behaviors.characteristics];
        let marketingCopyTranslations = [...item.marketing_copy.translations];

        uiCharacteristics.forEach((element) => {
            element.name == "MARKETING_RECURRING_PRICE" ? (price = element.value) : undefined;
            element.name == "INFLECTION_POINT" ? (dataCap = element.value) : undefined;
        });

        marketingCopyTranslations[characteristicsIndex].characteristics.forEach((element) => {
            element.name == "UPLOAD_SPEED_TEXT" ? (uploadSpeed = element.value) : undefined;
            element.name == "DOWNLOAD_SPEED_TEXT" ? (downloadSpeed = element.value) : undefined;
            element.name == "OFFER_DESCRIPTION" ? (description = element.value) : undefined;
            element.name == "OFFER_NAME" ? (name = element.value) : undefined;
            element.name == "FEE_TEXT" ? (feeText = element.value) : undefined;
            element.name == "DISCLOSURE" ? (disclosureText = element.value) : undefined;
        });

        let wrappedProduct = {
            Id: item.id,
            Name: name,
            Price: item.prices[priceIndex].amount.value,
            Family: "Viasat",
            PriceType: item.prices[priceIndex].recurrence,
            UploadSpeed: uploadSpeed,
            DownloadSpeed: downloadSpeed,
            Description: description,
            DataCap: dataCap,
            FeeText: feeText,
            DisclosureText: disclosureText
        };
        return wrappedProduct;
    }

    sortProduct(products) {
        return products.sort((a, b) =>
            Number(a.Price) > Number(b.Price) ? -1 : Number(a.Price) < Number(b.Price) ? 1 : 0
        );
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

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleClick() {
        const sendConfirmEvent = new CustomEvent("confirm", {
            detail: this.agreementId
        });
        this.dispatchEvent(sendConfirmEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Products Preview",
            component: "Poe_lwcBuyflowViasatProductsPreviewTab",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }

    handleLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "Products Preview"
        };
        this.dispatchEvent(event);
    }
}