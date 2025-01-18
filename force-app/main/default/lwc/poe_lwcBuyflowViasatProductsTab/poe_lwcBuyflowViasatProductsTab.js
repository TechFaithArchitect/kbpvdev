import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveProduct from "@salesforce/apex/ProductTabController.saveProduct";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import saveACICreditCheck from "@salesforce/apex/CreditCheckTabController.saveACICreditCheck";
import IPSaveOrderDTV from "@salesforce/apex/CreditCheckTabController.IPSaveOrderDTV";
import ViasatBaseUrl from "@salesforce/label/c.Viasat_Consumer_Broadband_Base_URL";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import getViasatBNLData from "@salesforce/apex/ProductTabController.getViasatBNLData";
import Product_Selection_Title from "@salesforce/label/c.Product_Selection_Title";
import Please_read_the_URL from "@salesforce/label/c.Please_read_the_URL";
import T_Chart_labels from "@salesforce/label/c.T_Chart_labels";
import Chuzo_Generic_Product_Error_Message from "@salesforce/label/c.Chuzo_Generic_Product_Error_Message";
import The_Order_request_could_not_be_made_correctly_to_the_server_Please_try_again from "@salesforce/label/c.The_Order_request_could_not_be_made_correctly_to_the_server_Please_try_again";
import Order_Creation_Generic_Error_Message from "@salesforce/label/c.Order_Creation_Generic_Error_Message";
import The_Product_Selection_could_not_be_saved_Please_try_again from "@salesforce/label/c.The_Product_Selection_could_not_be_saved_Please_try_again";

export default class Poe_lwcBuyflowViasatProductsTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api origin;
    @api userId;
    @api payload;
    @api accountId;
    @api isGuestUser;
    @api referralCodeData;
    @api partyId;
    @api consent;
    @api clientInfo;
    isNotGuestUser;
    showCollateral = false;
    products = [];
    initialProducts = [];
    showSBS = false;
    loaderSpinner;
    disableNext = true;
    cart = {
        hasToday: false,
        hasMonthly: false,
        todayCharges: [],
        monthlyCharges: [],
        todayTotal: (0.0).toFixed(2),
        monthlyTotal: (0.0).toFixed(2)
    };
    productSelected;
    productName;
    shoppingCartId;
    productStructure = [];
    orderId;
    orderItemId;
    showDisclosures = {
        unleashed: false,
        choice: false,
        connection25: false,
        choiceCap: 0,
        vs12: false
    };
    broadbandUrl = `<a href=${ViasatBaseUrl} target="_blank"></a>${ViasatBaseUrl.replace("https://", "")}`;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        Product_Selection_Title,
        Please_read_the_URL,
        T_Chart_labels,
        Chuzo_Generic_Product_Error_Message,
        The_Order_request_could_not_be_made_correctly_to_the_server_Please_try_again,
        Order_Creation_Generic_Error_Message,
        The_Product_Selection_could_not_be_saved_Please_try_again
    };
    showSelfServiceCancelModal = false;
    showBNLModal = false;

    connectedCallback() {
        this.loaderSpinner = true;
        this.isNotGuestUser = !this.isGuestUser;
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        let myData = { ...JSON.parse(JSON.stringify(this.payload)) };
        myData.path = "products/viasat";
        console.log("Products Payload :", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Products Response", responseParsed);
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
                        message: errorMessage !== "" ? errorMessage : "Internal Server Error"
                    });
                    this.loaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                } else {
                    let products = [];
                    let result = responseParsed;
                    let productTypes = result.hasOwnProperty("product_types") ? result.product_types : undefined;
                    this.productStructure = [...productTypes];
                    if (productTypes !== undefined) {
                        productTypes.forEach((item) => {
                            let intProduct = { ...this.productWrapper(item) };
                            products.push(intProduct);
                        });
                    }
                    let aux = this.sortProduct(products);
                    this.products = [...aux];
                    this.initialProducts = [...products];
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = this.labels.Chuzo_Generic_Product_Error_Message;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
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
        let category;

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
            element.name == "PRODUCT_FAMILY" ? (category = element.value) : undefined;
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
            Type: category,
            DataCap: dataCap,
            isChecked: false,
            FeeText: feeText,
            DisclosureText: disclosureText,
            OfferId: item.offer_id
        };
        return wrappedProduct;
    }

    sortProduct(products) {
        return products.sort((a, b) =>
            Number(a.Price) > Number(b.Price) ? -1 : Number(a.Price) < Number(b.Price) ? 1 : 0
        );
    }

    handlePriceChange(event) {
        this.productSelected = event.target.dataset.id;
        let cart = { ...this.cart };
        let monthlyCharges = [];
        let todayCharges = [];
        let product = {};
        this.products.forEach((item) => {
            if (item.Id === this.productSelected) {
                product = { ...item };
                item.isChecked = true;
            } else {
                item.isChecked = false;
            }
        });
        let newCharge = {
            name: product.Name,
            fee: Number(product.Price).toFixed(2),
            discount: Number(product.Price) > 0.0 ? false : true,
            hasDescription: "",
            description: "",
            type: "product"
        };
        monthlyCharges.push(newCharge);
        this.productStructure.forEach((type) => {
            if (type.id === this.productSelected) {
                this.shoppingCartId = type.offer_id;
                type.package_types.forEach((pack) => {
                    if (
                        pack.kind === "bep.ofm.package-types.account-setup-fee" ||
                        pack.kind === "bep.ofm.package-types.discounts-promotions"
                    ) {
                        if (pack.product_types.length > 0) {
                            pack.product_types.forEach((prod) => {
                                let name;
                                if (
                                    prod.marketing_copy.translations.length > 0 &&
                                    prod.marketing_copy.translations[0].characteristics.length > 0
                                ) {
                                    prod.marketing_copy.translations[0].characteristics.forEach((item) => {
                                        if (item.name === "OFFER_NAME") {
                                            name = item.value;
                                        }
                                    });
                                }
                                if (
                                    prod.prices.length > 0 &&
                                    pack.product_types.length === 1 &&
                                    pack.max_selections === 1 &&
                                    pack.min_selections == 1
                                ) {
                                    let newCharge = {
                                        name: name !== undefined ? name : prod.description,
                                        fee: Number(prod.prices[0].amount.value).toFixed(2),
                                        discount: Number(prod.prices[0].amount.value) > 0.0 ? false : true,
                                        hasDescription: "",
                                        description: "",
                                        type: "product"
                                    };
                                    if (prod.prices[0].recurrence === "Once") {
                                        todayCharges.push(newCharge);
                                    } else {
                                        monthlyCharges.push(newCharge);
                                    }
                                }
                            });
                        }
                        if (pack.package_types.length > 0) {
                            pack.package_types.forEach((prod) => {
                                if (prod.product_types.length > 0) {
                                    prod.product_types.forEach((item) => {
                                        let name;
                                        if (
                                            item.marketing_copy.translations.length > 0 &&
                                            item.marketing_copy.translations[0].characteristics.length > 0
                                        ) {
                                            item.marketing_copy.translations[0].characteristics.forEach((item) => {
                                                if (item.name === "OFFER_NAME") {
                                                    name = item.value;
                                                }
                                            });
                                        }
                                        if (
                                            item.prices.length > 0 &&
                                            prod.product_types.length === 1 &&
                                            prod.max_selections === 1 &&
                                            prod.min_selections == 1
                                        ) {
                                            let newCharge = {
                                                name: item.description,
                                                fee: Number(item.prices[0].amount.value).toFixed(2),
                                                discount: Number(item.prices[0].amount.value) > 0.0 ? false : true,
                                                hasDescription: "",
                                                description: "",
                                                type: "product"
                                            };
                                            if (item.prices[0].recurrence === "Once") {
                                                todayCharges.push(newCharge);
                                            } else {
                                                monthlyCharges.push(newCharge);
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
        if (monthlyCharges.length > 0) {
            cart.hasMonthly = true;
            cart.monthlyCharges = [...monthlyCharges];
            cart.monthlyTotal = 0.0;
            cart.monthlyCharges.forEach(
                (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
            );
        }
        if (todayCharges.length > 0) {
            cart.hasToday = true;
            cart.todayCharges = [...todayCharges];
            cart.todayTotal = 0.0;
            cart.todayCharges.forEach(
                (charge) => (cart.todayTotal = (Number(cart.todayTotal) + Number(charge.fee)).toFixed(2))
            );
        }
        this.cart = { ...cart };
        this.disableNext = false;
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
        this.loaderSpinner = true;
        let data = { ...JSON.parse(JSON.stringify(this.payload)) };
        let myData = {
            tab: "order",
            path: "orders",
            partnerName: "viasat",
            productTypeId: this.productSelected,
            salesAgreementId: data.salesAgreementId,
            shoppingCartId: this.shoppingCartId
        };
        console.log("Orders Endpoint Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Orders Endpoint Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error
                        : responseParsed.error.provider.message.hasOwnProperty("message")
                        ? responseParsed.error.provider.message.message
                        : responseParsed.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.loaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                } else {
                    let cart = { ...this.cart };
                    let cartItems = responseParsed.cart_items;
                    this.productSelected = responseParsed.productTypeId;
                    this.shoppingCartId = responseParsed.shoppingCartId;
                    this.productCandidateId = responseParsed.productCandidateId;
                    cartItems.forEach((item) => {
                        if (
                            item.kind !== "bep.ofm.product-types.fixed-satellite-internet" &&
                            item.kind !== "bep.ofm.product-types.discount-promotion" &&
                            item.kind !== "bep.ofm.product-types.account-setup-fee"
                        ) {
                            let price =
                                item.prices === null || item.prices.length === 0 ? 0.0 : item.prices[0].amount.value;
                            let newCharge = {
                                name: item.name,
                                fee: Number(price).toFixed(2),
                                discount: Number(price) > 0.0 ? false : true,
                                hasDescription: "",
                                description: "",
                                type: "product"
                            };
                            if (
                                item.prices !== null &&
                                item.prices.length > 0 &&
                                item.prices[0].recurrence === "Once"
                            ) {
                                cart.todayCharges.push(newCharge);
                            } else {
                                cart.monthlyCharges.push(newCharge);
                            }
                        }
                    });
                    cart.todayTotal = 0.0;
                    cart.monthlyTotal = 0.0;
                    if (cart.todayCharges.length > 0) {
                        cart.hasToday = true;
                        cart.todayCharges.forEach(
                            (charge) => (cart.todayTotal = (Number(cart.todayTotal) + Number(charge.fee)).toFixed(2))
                        );
                    }
                    if (cart.monthlyCharges.length > 0) {
                        cart.hasMonthly = true;
                        cart.monthlyCharges.forEach(
                            (charge) =>
                                (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
                        );
                    }
                    this.cart = { ...cart };

                    let info = {
                        shoppingCartId: this.shoppingCartId,
                        productTypeId: this.productSelected,
                        productCandidateId: this.productCandidateId,
                        cart: this.cart
                    };
                    this.products.forEach((item) => {
                        if (item.Id === this.productSelected) {
                            info.productSelected = item;
                        }
                    });
                    this.saveProduct(info);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    this.labels.The_Order_request_could_not_be_made_correctly_to_the_server_Please_try_again;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    sbsHandler() {
        this.showSBS = true;
    }

    hideSBS() {
        this.showSBS = false;
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    saveProduct(info) {
        let selectedProduct = {};
        this.products.forEach((item) => {
            if (item.Id === this.productSelected) {
                this.productName = item.Name;
                selectedProduct = {
                    Description: item.Description,
                    Family: "Viasat",
                    Name: item.Name.substring(0, 80),
                    UnitPrice: parseFloat(item.Price),
                    PriceType: "Monthly",
                    ProductCode: item.Id,
                    servRef: item.Id.substring(0, 25),
                    vasProduct: false,
                    callLogId: undefined
                };
                switch (item.Type) {
                    case "Unleashed":
                        this.showDisclosures.unleashed = true;
                        break;
                    case "CAF II":
                        this.showDisclosures.connection25 = true;
                        break;
                    case "Unlimited":
                        this.showDisclosures.choice = true;
                        this.showDisclosures.choiceCap = item.DataCap;
                        if (
                            item.Id === "02378ab1-bdeb-4e65-a057-93540c5791dc" ||
                            item.Id === "b11a6535-0ba3-427d-90e3-6719c21a3953" ||
                            item.Id === "58c081da-1e35-4498-b278-928806863cbe"
                        ) {
                            this.showDisclosures.vs12 = true;
                        }
                        break;
                }
            }
        });
        info.showDisclosures = { ...this.showDisclosures };
        let data = {
            Program: "Viasat",
            ContextId: this.recordId,
            Product: selectedProduct,
            iframe: false
        };
        saveProduct({ myData: data })
            .then((response) => {
                console.log("Save Product Response", response);
                if (this.isGuestUser) {
                    this.saveOrder(info);
                } else {
                    this.setTrack(info);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: this.labels.The_Product_Selection_could_not_be_saved_Please_try_again
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    setTrack(info) {
        let trackerData = {
            userId: this.userId,
            operation: "setTrack",
            isCount: true,
            action: "Product Selection"
        };
        if (this.origin === "retail") {
            setClickerRetailTrack({ myData: trackerData })
                .then((response) => {
                    this.saveOrder(info);
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                    this.logError(error.body?.message || error.message);
                });
        } else if (this.origin === "event") {
            setClickerEventTrack({ myData: trackerData })
                .then((response) => {
                    this.saveOrder(info);
                })
                .catch((error) => {
                    console.log(error);
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                    this.logError(error.body?.message || error.message);
                });
        } else if (this.origin === "phonesales") {
            setClickerCallCenterTrack({ myData: trackerData })
                .then((response) => {
                    this.saveOrder(info);
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                    this.logError(error.body?.message || error.message);
                });
        } else {
            this.saveOrder(info);
        }
    }

    saveOrder(info) {
        let repType;
        if (this.isGuestUser) {
            repType = "Self Service";
        } else {
            switch (this.origin) {
                case "phonesales":
                    repType = "Phone Sales";
                    break;
                case "retail":
                    repType = "Retail";
                    break;
                case "event":
                    repType = "Event";
                    break;
                case "maps":
                    repType = "Door To Door";
                    break;
            }
        }
        let json = {
            ContextId: this.recordId,
            AccountId: this.accountId,
            ProductName: this.productName,
            consent: this.consent,
            isGuestUser: this.isGuestUser,
            phone: this.clientInfo.contactInfo.phone,
            email: this.clientInfo.contactInfo.email,
            family: "Viasat",
            representative: repType,
            Pricebook: "Standard Price Book",
            timeStamp: new Date(),
            referralCodeId: this.isGuestUser ? this.referralCodeData.Id : undefined,
            identification: "Social Security Number",
            creditCheck: {
                accountDetails: {
                    billingCreditCheckAddress: {
                        billingAddress: this.clientInfo.billingAddress.addressLine1,
                        billingAptNumber: this.clientInfo.billingAddress.hasOwnProperty("addressLine2")
                            ? this.clientInfo.billingAddress.addressLine2
                            : "",
                        billingCity: this.clientInfo.billingAddress.city,
                        billingState: this.clientInfo.billingAddress.state,
                        billingZip: this.clientInfo.billingAddress.zipCode
                    },
                    shippingServiceAddresss: {
                        shippingAddress: this.clientInfo.shippingAddress.addressLine1,
                        shippingAptNumber: this.clientInfo.shippingAddress.hasOwnProperty("addressLine2")
                            ? this.clientInfo.shippingAddress.addressLine2
                            : "",
                        shippingCity: this.clientInfo.shippingAddress.city,
                        shippingState: this.clientInfo.shippingAddress.state,
                        shippingZip: this.clientInfo.shippingAddress.zipCode
                    }
                }
            }
        };
        IPSaveOrderDTV({ myData: json })
            .then((response) => {
                console.log("Save Order Response", response);
                this.orderId = response.result.Order.Id;
                this.orderItemId = response.result.OrderItem.Id;
                info.orderId = this.orderId;
                info.orderItemId = this.orderItemId;
                if (this.isGuestUser) {
                    const sendCheckServiceabilityEvent = new CustomEvent("next", {
                        detail: info
                    });
                    this.dispatchEvent(sendCheckServiceabilityEvent);
                    this.loaderSpinner = false;
                } else {
                    let aci = {
                        ContextId: this.recordId
                    };
                    saveACICreditCheck({ myData: aci })
                        .then((response) => {
                            const sendCheckServiceabilityEvent = new CustomEvent("next", {
                                detail: info
                            });
                            this.dispatchEvent(sendCheckServiceabilityEvent);
                            this.loaderSpinner = false;
                        })
                        .catch((error) => {
                            console.error(error, "ERROR");
                            const event = new ShowToastEvent({
                                title: "Error",
                                variant: "error",
                                mode: "sticky",
                                message: this.labels.Order_Creation_Generic_Error_Message
                            });
                            this.dispatchEvent(event);
                            this.loaderSpinner = false;
                            this.logError(error.body?.message || error.message);
                        });
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: this.labels.Order_Creation_Generic_Error_Message
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }
    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Products",
            component: "Poe_lwcBuyflowViasatProductsTab",
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
            tab: "Products"
        };
        this.dispatchEvent(event);
    }

    handleBNLModal() {
        if (
            !this.showBNLModal &
            (this.orgId === undefined || this.viasatOrgUrl === undefined || this.leadSource === undefined)
        ) {
            this.loaderSpinner = true;
            getViasatBNLData()
                .then((response) => {
                    console.log("getViasatBNLData response", response);
                    this.orgId = response.result.orgId;
                    this.viasatOrgUrl = response.result.viasatOrgUrl__c;
                    this.leadSource = response.result.leadSource__c;
                    console.log(this.orgId);
                    console.log(this.viasatOrgUrl);
                    console.log(this.leadSource);

                    this.showBNLModal = !this.showBNLModal;
                    this.loaderSpinner = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.loaderSpinner = false;
                    this.logError(error.body?.message || error.message);
                });
        } else this.showBNLModal = !this.showBNLModal;
    }
}