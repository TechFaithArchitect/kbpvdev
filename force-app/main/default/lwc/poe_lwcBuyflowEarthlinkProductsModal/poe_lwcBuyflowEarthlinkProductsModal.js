import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";

import GENERIC_PRODUCT_ERROR_MESSAGE from "@salesforce/label/c.Chuzo_Generic_Product_Error_Message";
import SERVER_ERROR_TOAST_TITLE from "@salesforce/label/c.Server_Error_Toast_Title";
import NO_WIRED_PRODUCTS_ERROR_TITLE from "@salesforce/label/c.No_Wired_Products_Error_Title";
import NO_WIRED_PRODUCTS_ERROR_MESSAGE from "@salesforce/label/c.No_Wired_Products_Error_Message";
import CONFIRM_BUTTON_LABEL from "@salesforce/label/c.Confirm_Button_Label";
import SUGGESTED_ADDRESS_SELECTION_TITLE from "@salesforce/label/c.Suggested_Address_Selection_Title";
import PRODUCT_SELECTION_MODAL_INSTRUCTIONS from "@salesforce/label/c.Earthlink_Wired_Product_Selection_Modal_Instructions";

const INTERNAL_ERROR = "Internal Error";
const API_ERROR = "API Error";
const PRODUCT_CONTENT_CLASS = "price-content";

export default class Poe_lwcBuyflowEarthlinkProductsModal extends LightningElement {
    @api suggestedAddresses;
    @api promoCode;
    @api isGuestUser;
    value;
    options = [];
    noInfo = true;
    loaderSpinner;
    services;
    wiredProducts;
    canScheduleAppt;
    bundles = [];
    labels = {
        CONFIRM_BUTTON_LABEL,
        SUGGESTED_ADDRESS_SELECTION_TITLE,
        PRODUCT_SELECTION_MODAL_INSTRUCTIONS
    };

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleChangeAddress(event) {
        this.noInfo = false;
        this.value = event.target.value;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        let addresses = [];
        this.suggestedAddresses.forEach((item, index) => {
            let add = {
                label: `${item.addressLine1} ${item.addressLine2}, ${item.city}, ${item.state} ${item.zipCode}`,
                value: String(index)
            };
            addresses.push(add);
        });
        this.options = [...addresses];
    }

    handleConfirm() {
        this.loaderSpinner = true;
        let myData = {
            path: "products/earthlink",
            address: JSON.parse(JSON.stringify(this.suggestedAddresses[Number(this.value)])),
            promoCode: this.promoCode
        };
        console.log("Products Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Products Response", result);
                let wiredProducts = [];
                let vasServices = [];
                let bundles = [];
                let callLogId = result.hasOwnProperty("callLogId") ? result.callLogId : undefined;
                let internet = result.hasOwnProperty("products") ? result.products : undefined;
                let vasProducts = result.hasOwnProperty("vasProducts") ? result.vasProducts : undefined;
                let ccBundles = result.hasOwnProperty("bundles") ? result.bundles : undefined;
                let i = 0;
                if (internet.length > 0) {
                    internet.forEach((item) => {
                        i = i + 1;
                        let intProduct = {
                            Id: item.servRef,
                            Name: item.productName,
                            Type: "internet",
                            Price: item.price,
                            hasTerms: item.termsOfSrvc !== "",
                            terms: item.termsOfSrvc !== "" ? item.termsOfSrvc : "",
                            equipmentCost: item.equipmentCost,
                            speedDisclaimer: item.hasOwnProperty("speedDisclaimer") ? item.speedDisclaimer : "",
                            installActivatePoints: item.hasOwnProperty("installActivatePoints")
                                ? item.installActivatePoints
                                : "",
                            equipmentDesc: item.equipmentDesc,
                            Family: "EarthLink",
                            PriceType: item.pricePeriod,
                            Speed: item.speed,
                            vasProduct: false,
                            Description: item.productDescription,
                            keyFeatures: this.splitDescriptionIntoKeyFeatures(item.productDescription),
                            isChecked: false,
                            servCode: item.servCode,
                            servLevel: item.servLevel,
                            styleClass: PRODUCT_CONTENT_CLASS
                        };
                        wiredProducts.push(intProduct);
                    });
                    if (vasProducts !== undefined) {
                        vasProducts.forEach((item) => {
                            i = i + 1;
                            let vasProduct = {
                                Id: item.servRef,
                                Name: item.productName,
                                Type: "internet",
                                hasTerms: item.termsOfSrvc !== "",
                                terms: item.termsOfSrvc !== "" ? item.termsOfSrvc : "",
                                Price: item.price,
                                Family: "EarthLink",
                                PriceType: item.pricePeriod,
                                speedDisclaimer: item.hasOwnProperty("speedDisclaimer") ? item.speedDisclaimer : "",
                                hasDescription:
                                    item.productDescription !== "" && item.productDescription !== null ? true : false,
                                Speed: item.speed,
                                vasProduct: true,
                                Description: item.productDescription,
                                isChecked: false,
                                servCode: item.servCode,
                                servLevel: item.servLevel
                            };
                            vasServices.push(vasProduct);
                        });
                    }
                    if (ccBundles != undefined) {
                        ccBundles.forEach((item) => {
                            let packages = item.serviceInfo.split(",");
                            let newPackages = [];
                            packages.forEach((pack) => {
                                let packInfo = pack.split(":");
                                let newPack = {
                                    servCode: packInfo[0],
                                    servLevel: packInfo[1]
                                };
                                newPackages.push(newPack);
                            });
                            let bundle = {
                                id: item.servRef,
                                price: item.price,
                                name: item.serviceName,
                                packages: newPackages
                            };

                            bundles.push(bundle);
                        });
                    }

                    this.bundles = [...bundles];
                    this.services = [...vasServices];
                    this.serviceFees = [...result.serviceTerm];
                    this.wiredProducts = [...wiredProducts];
                    this.canScheduleAppt = result.canScheduleAppt === "yes";
                    let normalizedAddress = result.normalizedAddress;
                    let info = {
                        services: this.services,
                        wiredProducts: this.wiredProducts,
                        canScheduleAppt: this.canScheduleAppt,
                        callLogId: callLogId,
                        serviceFees: this.serviceFees,
                        wiredAddress: { ...normalizedAddress },
                        bundles: this.bundles
                    };
                    const closeModalEvent = new CustomEvent("confirm", {
                        detail: info
                    });
                    this.dispatchEvent(closeModalEvent);
                    this.loaderSpinner = false;
                } else {
                    const event = new ShowToastEvent({
                        title: NO_WIRED_PRODUCTS_ERROR_TITLE,
                        variant: "error",
                        mode: "sticky",
                        message: NO_WIRED_PRODUCTS_ERROR_MESSAGE
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: SERVER_ERROR_TOAST_TITLE,
                    variant: "error",
                    mode: "sticky",
                    message: GENERIC_PRODUCT_ERROR_MESSAGE
                });
                this.dispatchEvent(event);

                const errMsg = error.body?.message || error.message;
                if (apiResponse) {
                    this.handleLogError({
                        error: `${errMsg}\nAPI Response: ${apiResponse}`,
                        type: API_ERROR,
                        endpoint: myData.path,
                        request: myData,
                        opportunity: this.recordId
                    });
                } else {
                    this.handleLogError({
                        error: errMsg,
                        type: INTERNAL_ERROR
                    });
                }
                this.loaderSpinner = false;
            });
    }

    splitDescriptionIntoKeyFeatures(description) {
        const potentialSentences = description.split(/[.?!]/);
        const keyFeaturesWithIds = potentialSentences
            .map((sentence, index) => {
                const trimmedSentence = sentence.trim();
                return {
                    id: index + 1,
                    feature: trimmedSentence.length > 1 ? trimmedSentence + "." : ""
                };
            })
            .filter((obj) => obj.feature !== "");
        const firstThreeFeatures = keyFeaturesWithIds.slice(0, 3);
        return firstThreeFeatures;
    }

    handleLogError(data) {
        let errorLog = {
            type: data.type,
            provider: "Earthlink",
            tab: "Products",
            component: "poe_lwcBuyflowEarthlinkProductsModal",
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

    filterResidentialPromoCode(promoObject) {
        if (!promoObject || !promoObject.promoCodes) {
            return { promoCodes: [] };
        }

        const filteredPromoCodes = promoObject.promoCodes.filter((code) => code.label === "Residential Sale");

        return { promoCodes: filteredPromoCodes };
    }
}