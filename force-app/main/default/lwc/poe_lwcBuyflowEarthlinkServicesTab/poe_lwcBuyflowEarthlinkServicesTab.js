import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import saveProduct from "@salesforce/apex/ProductTabController.saveProduct";

import SELF_SERVICE_VALIDATE_LEAVING_MESSAGE from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import SELF_SERVICE_VALIDATE_LEAVING_TITLE from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import SERVER_ERROR_TOAST_TITLE from "@salesforce/label/c.Server_Error_Toast_Title";
import GENERIC_PRODUCT_ERROR_MESSAGE from "@salesforce/label/c.Chuzo_Generic_Product_Error_Message";
import SERVICES_TAB_ACCORDION_SECTION_TITLE from "@salesforce/label/c.EarthLink_Services_Tab_Accordion_Section_Title";
import T_CHART_BUTTON_LABEL from "@salesforce/label/c.T_Chart_labels";
import ONLINE_BACKUP_PRODUCT_NAME from "@salesforce/label/c.EarthLink_Online_Backup_Product_Name";

const INTERNAL_ERRROR = "Internal Error";

export default class poe_lwcBuyflowEarthlinkServicesTab extends NavigationMixin(LightningElement) {
    products = [];
    @api recordId;
    @api logo;
    @api selected;
    @api selectedServices;
    @api services;
    @api bundles;
    @api origin;
    @api userId;
    @api cartInfo;
    @api isGuestUser;

    cart;
    initialProducts = [];
    initialBundles = [];
    showSBS = false;
    loaderSpinner;
    showCollateral = false;
    servicesAvailable = [];
    logId;
    selectedBundle;

    activeSections = ["EarthLinkStandalone"];
    value = "all";
    selectedItem = "0";
    selectedItemPriceMonthly = "0";
    selectedItemNameMonthly;
    selectedItemPriceOneTime = "0";
    selectedItemNameOneTime;
    selectedTarget;
    labels = {
        SELF_SERVICE_VALIDATE_LEAVING_TITLE,
        SELF_SERVICE_VALIDATE_LEAVING_MESSAGE,
        SERVICES_TAB_ACCORDION_SECTION_TITLE,
        T_CHART_BUTTON_LABEL
    };
    showSelfServiceCancelModal = false;

    get isNotGuestUser() { return !this.isGuestUser }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.loaderSpinner = true;
        this.cart = { ...this.cartInfo };
        if (this.selectedServices !== undefined) {
            let cart = { ...this.cart };
            let monthlyCharges = [...cart.monthlyCharges];
            let todayCharges = [...cart.todayCharges];
            let oneNames = [];
            let serviceIds = [];
            let monthlyNames = [];
            let data = JSON.parse(JSON.stringify(this.selectedServices));
            data.forEach((service) => {
                serviceIds.push(service.servRef);
                if (service.PriceType === "Monthly") {
                    monthlyNames.push(service.Name);
                    this.selectedItemPriceMonthly = (
                        Number(this.selectedItemPriceMonthly) + Number(service.UnitPrice)
                    ).toFixed(2);
                    cart.hasMonthly = true;
                    let newCharge = {
                        name: service.Name,
                        fee: service.UnitPrice !== undefined ? Number(service.UnitPrice).toFixed(2) : (0.0).toFixed(2),
                        type: "services",
                        discount: service.UnitPrice !== undefined ? Number(service.UnitPrice) <= 0 : true,
                        hasDescription: false,
                        description: ""
                    };
                    monthlyCharges.push(newCharge);
                } else {
                    oneNames.push(service.Name);
                    this.selectedItemPriceOneTime = (
                        Number(service.UnitPrice) + Number(this.selectedItemPriceOneTime)
                    ).toFixed(2);
                    cart.hasToday = true;
                    let newCharge = {
                        name: service.Name,
                        fee: service.UnitPrice !== undefined ? Number(service.UnitPrice).toFixed(2) : (0.0).toFixed(2),
                        type: "services",
                        discount: service.UnitPrice !== undefined ? Number(service.UnitPrice) <= 0 : true,
                        hasDescription: false,
                        description: ""
                    };
                    todayCharges.push(newCharge);
                }
            });
            this.selectedItemsTotal += this.selectedItemPriceOneTime;
            this.selectedItemsTotal += this.selectedItemPriceMonthly;
            this.selectedItemNameOneTime = oneNames.join(",   \n");
            this.selectedItemNameMonthly = monthlyNames.join(",   \n");
            let checkedService = [];
            let services = JSON.parse(JSON.stringify(this.services));
            let hasOnlineChecked = false;
            let hasSymantecChecked = false;
            services.forEach((serv) => {
                serv.isChecked = serviceIds.includes(serv.Id) ? true : false;
                if (serv.isChecked && serv.Name.includes(ONLINE_BACKUP_PRODUCT_NAME)) {
                    hasOnlineChecked = true;
                } else if (serv.isChecked && serv.servCode == "symantec") {
                    hasSymantecChecked = true;
                }
                checkedService.push(serv);
            });
            if (hasOnlineChecked) {
                checkedService.forEach((item) => {
                    if (item.Name.includes(ONLINE_BACKUP_PRODUCT_NAME) && !item.isChecked) {
                        item.isDisabled = true;
                    }
                });
            } else {
                checkedService.forEach((item) => {
                    if (item.Name.includes(ONLINE_BACKUP_PRODUCT_NAME)) {
                        item.isDisabled = false;
                    }
                });
            }
            if (hasSymantecChecked) {
                checkedService.forEach((item) => {
                    if (item.servCode == "symantec" && !item.isChecked) {
                        item.isDisabled = true;
                    }
                });
            }
            this.services = [...checkedService];
            cart.todayTotal = (0.0).toFixed(2);
            cart.todayCharges = [...todayCharges];
            cart.monthlyCharges = [...monthlyCharges];
            cart.todayCharges.forEach((e) => {
                cart.todayTotal = (Number(cart.todayTotal) + Number(e.fee)).toFixed(2);
            });
            cart.monthlyTotal = (0.0).toFixed(2);
            cart.monthlyCharges.forEach((e) => {
                cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(e.fee)).toFixed(2);
            });
            this.cart = { ...cart };
        }
        this.loaderSpinner = false;
    }

    handlePriceChange(event) {
        this.loaderSpinner = true;
        let cart = { ...this.cart };
        cart.todayCharges = cart.todayCharges.filter((e) => e.type !== "services");
        cart.monthlyCharges = cart.monthlyCharges.filter((e) => e.type !== "services");

        let value = event.detail.product.Id;
        let symantechSelection = "none";
        let newServices = [];
        let services = JSON.parse(JSON.stringify(this.services));

        services.forEach((add) => {
            if (add.Id === value) {
                if (add.isChecked === false) {
                    add.isChecked = true;
                    symantechSelection = add.servCode === "symantec" ? "checked" : "none";
                } else {
                    add.isChecked = false;
                    symantechSelection = add.servCode === "symantec" ? "unchecked" : "none";
                }
            }
            newServices.push(add);
        });
        let hasOnlineChecked = false;
        newServices.forEach((serv) => {
            if (serv.isChecked && serv.Name.includes(ONLINE_BACKUP_PRODUCT_NAME)) {
                hasOnlineChecked = true;
            }
            if (symantechSelection == "checked" && serv.servCode == "symantec") {
                serv.isDisabled = !serv.isChecked;
            } else if (symantechSelection == "unchecked" && serv.servCode == "symantec") {
                serv.isDisabled = false;
            }
        });
        if (hasOnlineChecked) {
            newServices.forEach((item) => {
                if (item.Name.includes(ONLINE_BACKUP_PRODUCT_NAME) && !item.isChecked) {
                    item.isDisabled = true;
                }
            });
        } else {
            newServices.forEach((item) => {
                if (item.Name.includes(ONLINE_BACKUP_PRODUCT_NAME)) {
                    item.isDisabled = false;
                }
            });
        }
        this.services = [];
        this.services = [...newServices];
        if (newServices.length > 0) {
            this.selectedItemPriceOneTime = 0;
            this.selectedItemPriceMonthly = 0;
            this.selectedItemNameMonthly = "";
            this.selectedItemNameOneTime = "";
            let oneNames = [];
            let monthlyNames = [];
            newServices.forEach((adder) => {
                if (adder.isChecked) {
                    if (adder.PriceType === "Monthly") {
                        cart.hasMonthly = true;
                        let newCharge = {
                            name: adder.Name,
                            fee: adder.Price !== undefined ? Number(adder.Price).toFixed(2) : (0.0).toFixed(2),
                            type: "services",
                            discount: adder.Price !== undefined ? Number(adder.Price) <= 0 : true,
                            hasDescription: false,
                            description: ""
                        };
                        cart.monthlyCharges.push(newCharge);
                        monthlyNames.push(adder.Name);
                        this.selectedItemPriceMonthly = (
                            Number(this.selectedItemPriceMonthly) + Number(adder.Price)
                        ).toFixed(2);
                    } else {
                        cart.hasToday = true;
                        let newCharge = {
                            name: adder.Name,
                            fee: adder.Price !== undefined ? Number(adder.Price).toFixed(2) : (0.0).toFixed(2),
                            type: "services",
                            discount: adder.Price !== undefined ? Number(adder.Price) <= 0 : true,
                            hasDescription: false,
                            description: ""
                        };
                        cart.todayCharges.push(newCharge);
                        oneNames.push(adder.Name);
                        this.selectedItemPriceOneTime = (
                            Number(adder.Price) + Number(this.selectedItemPriceOneTime)
                        ).toFixed(2);
                    }
                }
            });
            this.selectedItemsTotal += this.selectedItemPriceOneTime;
            this.selectedItemsTotal += this.selectedItemPriceMonthly;
            this.selectedItemNameOneTime = oneNames.join(",   \n");
            this.selectedItemNameMonthly = monthlyNames.join(",   \n");
            cart.todayTotal = (0.0).toFixed(2);
            cart.todayCharges.forEach((e) => {
                cart.todayTotal = (Number(cart.todayTotal) + Number(e.fee)).toFixed(2);
            });
            cart.monthlyTotal = (0.0).toFixed(2);
            cart.monthlyCharges.forEach((e) => {
                cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(e.fee)).toFixed(2);
            });
            this.cart = { ...cart };
        }
        this.handleBundles();
        this.loaderSpinner = false;
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

    handleClick() {
        this.loaderSpinner = true;
        let servicesSelected = [];
        let onlineBackupSelected = false;
        this.services.forEach((service) => {
            if (service.isChecked) {
                if (service.Name.includes(ONLINE_BACKUP_PRODUCT_NAME)) onlineBackupSelected = true;
                let serv = {
                    Description: service.Description,
                    Family: service.Family,
                    Name: service.Name,
                    UnitPrice: parseFloat(service.Price),
                    PriceType: service.PriceType,
                    servRef: service.Id,
                    callLogId: this.logId,
                    vasProduct: false
                };
                servicesSelected.push(serv);
            }
        });
        let bundleId = this.selectedBundle != undefined ? this.selectedBundle.id : undefined;
        let serviceResponse = {
            servicesSelected,
            bundleId,
            onlineBackupSelected,
            cart: { ...this.cart }
        };
        let myData = {
            ContextId: this.recordId,
            Services: servicesSelected,
            Program: "EarthLink"
        };
        saveProduct({ myData: myData })
            .then((response) => {
                const sendServiceSelectionEvent = new CustomEvent("serviceselection", {
                    detail: serviceResponse
                });
                this.dispatchEvent(sendServiceSelectionEvent);
                this.loaderSpinner = false;
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
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERRROR
                });
                this.loaderSpinner = false;
            });
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
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

    handleBundles() {
        let bundles = JSON.parse(JSON.stringify(this.bundles));
        bundles.forEach((bundle) => {
            let packages = bundle.packages;
            let isSelectable = false;
            let services = this.services.filter((service) => service.isChecked);
            services.push(JSON.parse(JSON.stringify(this.selected)));
            let i = 0;
            if (services) {
                for (i; i < packages.length; i++) {
                    let packageSelected = services.findIndex(
                        (element) =>
                            element.servCode.toLowerCase() == packages[i].servCode.toLowerCase() &&
                            (packages[i].servLevel.toLowerCase() == "*" ||
                                element.servLevel.toLowerCase() == packages[i].servLevel.toLowerCase())
                    );

                    if (packageSelected != -1) {
                        isSelectable = true;
                        services.splice(packageSelected, 1);
                    } else {
                        isSelectable = false;
                        break;
                    }
                }
            }

            if (isSelectable && i != packages.length) {
                isSelectable = false;
            }

            if (isSelectable) {
                if (!this.selectedBundle) {
                    this.selectedBundle = bundle;
                } else if (bundle.price < this.selectedBundle.price) {
                    this.selectedBundle = bundle;
                }
            } else {
                this.selectedBundle = undefined;
            }
        });

        if (this.selectedBundle) {
            let cart = { ...this.cart };
            let newCharge = {
                name: this.selectedBundle.name,
                fee:
                    this.selectedBundle.price !== undefined
                        ? Number(this.selectedBundle.price).toFixed(2)
                        : (0.0).toFixed(2),
                type: "services",
                discount: this.selectedBundle.price !== undefined ? Number(this.selectedBundle.price) <= 0 : true,
                hasDescription: false,
                description: ""
            };
            cart.monthlyCharges.push(newCharge);
            this.selectedItemPriceMonthly = (
                Number(this.selectedItemPriceMonthly) + Number(this.selectedBundle.price)
            ).toFixed(2);

            cart.todayTotal = (0.0).toFixed(2);
            cart.todayCharges.forEach((e) => {
                cart.todayTotal = (Number(cart.todayTotal) + Number(e.fee)).toFixed(2);
            });
            cart.monthlyTotal = (0.0).toFixed(2);
            cart.monthlyCharges.forEach((e) => {
                cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(e.fee)).toFixed(2);
            });
            this.cart = { ...cart };
        }
    }

    handleLogError(data) {
        let errorLog = {
            type: data.type,
            provider: "Earthlink",
            tab: "Services",
            component: "poe_lwcBuyflowEarthlinkServicesTab",
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
}