import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ORDER_OBJECT from "@salesforce/schema/Order";
import DESCRIPTION_FIELD from "@salesforce/schema/Order.POE_Description__c";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import getCharterInformation from "@salesforce/apex/InfoTabController.getCharterInformation";
import getAddressInfo from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveACIPresentation from "@salesforce/apex/InfoTabController.saveACIPresentation";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import saveIframeClient from "@salesforce/apex/InfoTabController.saveIframeClient";
import saveProduct from "@salesforce/apex/ProductTabController.saveProduct";
import associateProductWithOrder from "@salesforce/apex/InfoTabController.associateProductWithOrder";
import saveOpportunityStage from "@salesforce/apex/InfoTabController.saveOpportunityStage";
import updateOrderBillingAddress from "@salesforce/apex/InfoTabController.updateOrderBillingAddress";
import setAddressDiscrepancy from "@salesforce/apex/InfoTabController.setAddressDiscrepancy";
import addNewProduct from "@salesforce/apex/InfoTabController.addNewProduct";
import customerReachedCap from "@salesforce/apex/CreditCheckTabController.customerReachedCap";
import capReachedError from "@salesforce/label/c.Order_Cap_Reached_Body";
import CONSENT_DISCLAIMER from "@salesforce/label/c.Chuzo_Consent_Text";
import callOrderVerbiage from "@salesforce/label/c.callOrderVerbiage";

var stateNames = [
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
export default class Poe_lwcBuyflowAltice extends NavigationMixin(LightningElement) {
    @api recordId;
    @api origin;
    @api userId;
    @api referralCodeData;
    @api contact;

    labels = {
        capReachedError,
        callOrderVerbiage
    };
    logo = "/poe/sfsites/c/resource/POE_alticeIMG";
    address;
    apt = "";
    zip;
    fname;
    originalAddress;
    lname;
    email;
    moving = false;
    present = false;
    agentEmail;
    noCompleteInformation = true;
    salesId;
    affiliate;
    city;
    state;
    stateName;
    states = [];
    confirmationNumber;
    productDescription;
    installationDate;
    orderId;
    callOrderLabel = this.labels.callOrderVerbiage;
    isCallOrder;
    isCallOrderOptions = [
        { label: "Yes", value: "YES" },
        { label: "No", value: "NO" }
    ];
    referenceNumber;
    addressDiscrepancy = false;
    orderTotal;
    showLoaderSpinner;
    showInfo = true;
    showForm = false;
    showConfirmation = false;
    alticeUrl;
    agentId;
    showCollateral;
    showSBS;
    program = "Altice";
    dealerCode;
    orderRtId;
    descriptionOptions = [];
    creditCheckModshowCapReachedModal = false;
    showCapReachedModal = false;
    contactConsentLabel = CONSENT_DISCLAIMER;
    contactConsent = false;

    get trackerData() {
        return {
            userId: this.userId,
            operation: "setTrack",
            isCount: true
        };
    }

    get showCollateralOrSBS() {
        return this.showCollateral || this.showSBS;
    }

    get hideCollateralOrSBS() {
        return !this.showCollateralOrSBS;
    }

    get hideConfirmation() {
        return !this.showConfirmation;
    }

    @wire(getObjectInfo, { objectApiName: ORDER_OBJECT })
    getRtId({ data, error }) {
        if (data) {
            let rtInfo = data.recordTypeInfos;
            this.orderRtId = Object.keys(rtInfo).find((key) => rtInfo[key].name === "Standard Order");
        } else if (error) {
            console.log(error);
            this.logError(error.body?.message || error.message);
        }
    }
    @wire(getPicklistValues, { recordTypeId: "$orderRtId", fieldApiName: DESCRIPTION_FIELD })
    getProgramDescriptionValues({ data, error }) {
        console.log("get programs other details ", data);
        if (data) {
            let controllerValue = data.controllerValues["Altice"];
            let fieldValues = data.values.filter(
                (element) => element.validFor.findIndex((value) => value == controllerValue) != -1
            );
            fieldValues.forEach((value) => {
                let detailElement = {
                    label: value.label,
                    value: value.value
                };

                this.descriptionOptions.push(detailElement);
            });
        } else if (error) {
            console.log(error);
            this.logError(error.body?.message || error.message);
        }
    }

    connectedCallback() {
        this.showLoaderSpinner = true;
        this.checkIP();
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.states.push(option);
        });

        let input = {
            program: "Altice"
        };

        getCharterInformation({ myData: input })
            .then((response) => this.handleGetCharterInformation(response))
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    handleConsentChange(e) {
        this.contactConsent = e.detail.checked;
    }

    handleGetCharterInformation(response) {
        let firstName = response.result.firstName.replace(/\(|\)/g, "");
        let lastName = response.result.lastName.replace(/\(|\)/g, "");
        this.agentId = firstName + lastName;
        this.agentId = this.agentId.replace(/ +/g, "").trim();
        this.dealerCode = response.result.salesId;
        this.agentEmail = response.result.userEmail;
        this.alticeUrl = response.result.url;

        let input = {
            Id: this.recordId,
            Program: "Optimum"
        };
        getAddressInfo({ myData: input })
            .then((response) => this.handleGetAddressInfo(response))
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    handleGetAddressInfo(response) {
        let result = response.result;
        let opportunity = result.Opportunity;
        let contact = result.Contact;

        if (typeof opportunity === "object") {
            this.address = opportunity.hasOwnProperty("Maps_Street__c") ? opportunity.Maps_Street__c : undefined;
            this.apt = opportunity.hasOwnProperty("Maps_Appartment__c") ? opportunity.Maps_Appartment__c : undefined;
            this.zip = opportunity.hasOwnProperty("Maps_PostalCode__c") ? opportunity.Maps_PostalCode__c : undefined;
            this.address = opportunity.hasOwnProperty("Maps_Street__c") ? opportunity.Maps_Street__c : undefined;
            this.city = opportunity.hasOwnProperty("Maps_City__c") ? opportunity.Maps_City__c : undefined;
            this.state = opportunity.hasOwnProperty("Maps_State__c") ? opportunity.Maps_State__c : undefined;
            this.stateName =
                this.state !== undefined ? this.states.find((e) => e.value == this.state).label : undefined;
            this.referenceNumber = opportunity.hasOwnProperty("POE_Reference_Number__c")
                ? opportunity.POE_Reference_Number__c
                : undefined;
        }
        if (typeof contact === "object") {
            this.fname = contact.hasOwnProperty("FirstName") ? contact.FirstName : undefined;
            this.lname = contact.hasOwnProperty("LastName") ? contact.LastName : undefined;
            this.phone = contact.hasOwnProperty("Phone") ? contact.Phone : undefined;
            this.email = contact.hasOwnProperty("PersonEmail") ? contact.PersonEmail : undefined;
        }

        if (this.contact != null) {
            this.fname = this.contact.firstName;
            this.lname = this.contact.lastName;
            this.email = this.contact.email;
            this.phone = this.contact.phone;
        }

        this.disableValidations();
        let aci = {
            ContextId: this.recordId
        };

        saveACIPresentation({ request: JSON.stringify(aci) })
            .then((response) => {
                this.updateTabOpportunity("Info");
                this.showLoaderSpinner = false;
            })
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    handleChange(event) {
        switch (event.target.name) {
            case "address":
                this.address = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "apt":
                this.apt = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "zip":
                this.zip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "fname":
                this.fname = event.target.value !== "" ? event.target.value : undefined;
                this.fname = this.fname?.replaceAll("'", "");
                break;
            case "lname":
                this.lname = event.target.value !== "" ? event.target.value : undefined;
                this.lname = this.lname?.replaceAll("'", "");
                break;
            case "phone":
                this.phone = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "email":
                this.email = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "city":
                this.city = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "state":
                this.state = event.target.value !== "" ? event.target.value : undefined;
                this.stateName =
                    this.state !== undefined ? this.states.find((e) => e.value == this.state).label : undefined;
                break;
            case "confirmation":
                this.confirmationNumber = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "date":
                let selectedDateArr = event.target.value.split("-");
                let selectedDate = Date.UTC(selectedDateArr[0], selectedDateArr[1], selectedDateArr[2]);
                let todayString = new Date(new Date().getTime()).toISOString();
                let todayDateArr = todayString.split("T");
                let todayArr = todayDateArr[0].split("-");
                let today = Date.UTC(todayArr[0], todayArr[1], todayArr[2]);

                if (event.target.value !== "" && selectedDate >= today) {
                    this.installationDate = event.target.value;
                } else {
                    this.showToast("error", "Error", "Installation Date must be today or greater.");
                    this.installationDate = undefined;
                }
                break;
            case "product":
                this.productDescription = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "amount":
                this.orderTotal = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "callOrder":
                this.isCallOrder = event.target.value;
                break;
        }
        this.disableValidations();
    }

    disableValidations() {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        let phonere = /^\d{10}$/;
        let zipre = /^\d{5}$/;
        if (this.showInfo) {
            if (
                this.address !== undefined &&
                zipre.test(this.zip) &&
                this.fname !== undefined &&
                this.lname !== undefined &&
                phonere.test(this.phone) &&
                emailre.test(this.email) &&
                this.state !== undefined &&
                this.city !== undefined
            ) {
                this.noCompleteInformation = false;
            } else {
                this.noCompleteInformation = true;
            }
        } else if (this.showForm) {
            let confElement = this.template.querySelector('[data-id="confirmation"]');
            if (
                this.isCallOrder !== undefined &&
                this.productDescription !== undefined &&
                this.installationDate !== undefined &&
                this.address !== undefined &&
                this.zip !== undefined &&
                this.state !== undefined &&
                this.city !== undefined &&
                this.orderTotal !== undefined
            ) {
                confElement.setCustomValidity("");
                confElement.reportValidity();
                this.noCompleteInformation = false;
            } else {
                this.noCompleteInformation = true;
            }
        }
    }

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

    handlePrevious() {
        if (this.showForm) {
            this.showInfo = true;
            this.showForm = false;
            this.showConfirmation = false;
        }
        this.disableValidations();
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleNext() {
        this.showLoaderSpinner = true;

        let data = {
            Email: this.email
        };

        console.log("Customer Cap Reached Request", data);
        customerReachedCap({ myData: data })
            .then((response) => {
                console.log("Customer Cap Reached response", response);
                let capReached = response.result.capReached;

                if (capReached) {
                    this.showLoaderSpinner = false;
                    this.showCapReachedModal = true;

                    this.logError(this.labels.capReachedError);
                } else {
                    if (this.showInfo) {
                        this.saveCustomerInformation();
                    }
                    if (!this.showForm) return;
                    this.callSaveIframeClient();
                    const trackerData = this.trackerData;
                    trackerData.action = "Product Selection";
                    let saveTrackerMethod = this.getSaveTrackerMethod();
                    if (!saveTrackerMethod) {
                        return this.saveProductOrder();
                    }
                    saveTrackerMethod({ myData: trackerData })
                        .then((response) => {
                            console.log(response);
                            this.saveProductOrder();
                        })
                        .catch((error) => {
                            console.error(error, "ERROR");
                            this.showLoaderSpinner = false;
                            this.logError(error.body?.message || error.message);
                        });
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
                const errMsg = error.body?.message || error.message;
                this.logError(errMsg);
            });
    }

    saveCustomerInformation() {
        this.showLoaderSpinner = true;
        let name;

        switch (this.origin) {
            case "retail":
                name = "Retail Opportunity";
                break;
            case "event":
                name = "Event Opportunity";
                break;
            case "phonesales":
                name = "Phone Sales Opportunity";
                break;
            default:
                name = "Maps Opportunity";
                break;
        }

        let info = {
            Maps_Appartment__c: this.apt !== undefined ? this.apt : null,
            Maps_PostalCode__c: this.zip !== undefined ? this.zip : null,
            Maps_Street__c: this.address !== undefined ? this.address : null,
            Maps_City__c: this.city !== undefined ? this.city : null,
            Maps_State__c: this.state !== undefined ? this.state : null,
            Name: name,
            StageName: "DM",
            Id: this.recordId
        };
        this.originalAddress = {
            zip: this.zip,
            street: this.address,
            city: this.city,
            state: this.state
        };
        let myData = {
            opportunity: info,
            contact: false,
            origin: this.origin
        };

        saveOpportunityAddressInformation({ myData })
            .then((response) => {
                this.callSaveIframeClient();
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    callSaveIframeClient() {
        let data = {
            recordId: this.recordId,
            firstName: this.fname,
            lastName: this.lname,
            street: this.address,
            addressLine2: !!this.apt ? this.apt : null,
            city: this.city,
            state: this.state,
            stateName: this.stateName,
            zipCode: this.zip,
            phone: this.phone,
            email: this.email,
            origin: this.origin,
            program: "Altice",
            productDescription: this.productDescription,
            consent: this.contactConsent,
            isCallOrder: this.isCallOrder === "YES"
        };

        saveIframeClient({ myData: data })
            .then((response) => {
                console.log(response);
                if (!this.showInfo) return;
                if (response.result.hasOwnProperty("Order") && response.result.hasOwnProperty("Opportunity")) {
                    this.updateTabOpportunity("Customer Information");
                    this.orderId = response.result.Order.Id;
                    this.showInfo = false;
                    this.showForm = true;
                    this.showConfirmation = false;
                    this.disableValidations();
                    let trAddress = this.address.replaceAll(" ", "%20");

                    this.showToast(
                        "success",
                        "Sales Process Information",
                        "You are now leaving Chuzo to process the order. Important: For proper commission payment, the order number and product information must be entered exactly as seen in the Partner Portal."
                    );
                    let url =
                        this.alticeUrl +
                        "/?dealer_salesperson=" +
                        this.agentId +
                        "&dealer_location_code=" +
                        this.dealerCode +
                        "&_check_service=1" +
                        "&street=" +
                        trAddress +
                        "&zipcode=" +
                        this.zip +
                        "&ab.reset=session";
                    this.apt !== "" && this.apt != undefined
                        ? (url = url + "&unit=" + this.apt.replaceAll(" ", "%20"))
                        : undefined;
                    console.log(url);
                    window.open(url, "_tab");
                    this.showLoaderSpinner = false;
                } else {
                    let errMsg =
                        "The information could not be saved to the system, the Phone or Address information may be associated with another customer. Please review it and try again.";
                    this.showToast("error", "Error", errMsg);
                    this.showLoaderSpinner = false;
                    this.logError(`${errMsg}\nMethod Response: ${response}`);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    saveProductOrder() {
        let nameValue = this.productDescription.trim().replace(/[\r\n]/gm, "");
        if (
            this.originalAddress.zip !== this.zip ||
            this.originalAddress.street !== this.address ||
            this.originalAddress.addressLine2 !== this.apt ||
            this.originalAddress.city !== this.city ||
            this.originalAddress.state !== this.state
        ) {
            this.addressDiscrepancy = true;
        } else {
            this.addressDiscrepancy = false;
        }
        let productName;
        if (nameValue.length === 0) {
            productName = "Optimum Default Product";
        } else {
            productName = nameValue.length > 80 ? nameValue.substring(0, 80) : nameValue;
        }

        let data = {
            Product: {
                Description: nameValue,
                Name: productName,
                servRef: "0",
                Family: "Optimum",
                UnitPrice: parseFloat(this.orderTotal),
                iframe: true,
                orderId: this.orderId
            },
            ContextId: this.recordId
        };

        saveProduct({ myData: data })
            .then((response) => this.handleSaveProductResult(response))
            .catch((error) => {
                console.log(error);
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handleSaveProductResult(response) {
        console.log(response);
        let productData = {
            name: response.result.ProductName,
            orderId: this.orderId
        };

        associateProductWithOrder({ myData: productData })
            .then(() => {
                let orderData = {
                    ContextId: this.recordId,
                    accountNumber: "",
                    orderId: "",
                    orderNumber: this.confirmationNumber,
                    installationDate: this.installationDate
                };
                this.updateTabOpportunity("Order Success");
                saveOpportunityStage({ myData: orderData })
                    .then((response) => this.handleSaveOpportunityStage(response))
                    .catch((error) => {
                        console.log(error);
                        this.showLoaderSpinner = false;
                        this.logError(error.body?.message || error.message);
                    });
            })
            .catch((error) => {
                console.log(error);
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handleSaveOpportunityStage(response) {
        console.log(response);
        this.saveTracker();

        if (!this.addressDiscrepancy) {
            this.saveTracker();
            return;
        }

        let billingAddress = {
            orderId: this.orderId,
            zip: this.zip,
            street: !!this.apt ? this.address + " " + this.apt : this.address,
            city: this.city,
            state: this.state
        };

        updateOrderBillingAddress({ myData: billingAddress })
            .then(() => {
                let oppData = {
                    ContextId: this.recordId
                };

                setAddressDiscrepancy({ myData: oppData })
                    .then((response) => {
                        console.log(response);
                        this.saveTracker();
                    })
                    .catch((error) => {
                        console.log(error);
                        this.showLoaderSpinner = false;
                        this.logError(error.body?.message || error.message);
                    });
            })
            .catch((error) => {
                console.log(error);
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    newOpportunityHandler() {
        this.showLoaderSpinner = true;
        let myData = {
            ContextId: this.recordId
        };

        addNewProduct({ myData })
            .then((response) => {
                console.log(response);
                this.showLoaderSpinner = false;
                let newOppId = response.result.Opportunity.Id;
                let values = {
                    recordId: newOppId,
                    program: "Altice"
                };

                let event = new CustomEvent("newproduct", {
                    detail: values,
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                console.log(error);
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    homeHandler() {
        this.showLoaderSpinner = true;
        switch (this.origin) {
            case "phonesales":
                this[NavigationMixin.Navigate]({
                    type: "comm__namedPage",
                    attributes: {
                        name: "Clicker_Call_Center__c"
                    }
                });
                break;
            case "retail":
                this[NavigationMixin.Navigate]({
                    type: "comm__namedPage",
                    attributes: {
                        name: "retail_clicker__c"
                    }
                });
                break;
            case "event":
                this[NavigationMixin.Navigate]({
                    type: "comm__namedPage",
                    attributes: {
                        name: "Clicker_Event__c"
                    }
                });
                break;
            case "maps":
                this[NavigationMixin.Navigate]({
                    type: "comm__namedPage",
                    attributes: {
                        name: "Door_to_door__c"
                    }
                });
                break;
        }
        this.showLoaderSpinner = false;
    }

    saveTracker() {
        const trackerData = this.trackerData;
        trackerData.action = "Buyflow Completed";

        let saveTrackerMethod = this.getSaveTrackerMethod();

        if (!saveTrackerMethod) {
            this.showForm = false;
            this.showInfo = false;
            this.showConfirmation = true;
            this.showLoaderSpinner = false;
            return;
        }

        saveTrackerMethod({ myData: trackerData })
            .then(() => {
                this.showForm = false;
                this.showInfo = false;
                this.showConfirmation = true;
                this.showLoaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    getSaveTrackerMethod() {
        switch (this.origin) {
            case "retail":
                return setClickerRetailTrack;
            case "event":
                return setClickerEventTrack;
            case "phonesales":
                return setClickerCallCenterTrack;
        }

        return undefined;
    }

    showToast(variant, title, message) {
        const event = new ShowToastEvent({
            title: title,
            variant: variant,
            mode: "sticky",
            message: message
        });
        this.dispatchEvent(event);
    }

    sbsHandler() {
        this.showSBS = true;
    }

    hideSBS() {
        this.showSBS = false;
    }

    updateTabOpportunity(value) {
        let event = new CustomEvent("tabupdate", {
            detail: { tab: value }
        });
        this.dispatchEvent(event);
    }

    checkIP() {
        this.dispatchEvent(new CustomEvent("checkip"));
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            provider: "Optimum",
            tab: "Info",
            component: "poe_lwcBuyflowAltice",
            error: errorMessage,
            opportunity: this.recordId
        };
        console.log("logerror: ", error);
        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }

    handleLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "Info"
        };
        this.logError(event);
    }
}