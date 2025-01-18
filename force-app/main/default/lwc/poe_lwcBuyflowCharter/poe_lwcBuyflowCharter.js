import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ORDER_OBJECT from "@salesforce/schema/Order";
import DESCRIPTION_FIELD from "@salesforce/schema/Order.POE_Description__c";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import getCharterInformation from "@salesforce/apex/InfoTabController.getCharterInformation";
import getAddressInfo from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveACIPresentation from "@salesforce/apex/InfoTabController.saveACIPresentation";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import saveIframeClient from "@salesforce/apex/InfoTabController.saveIframeClient";
import saveProduct from "@salesforce/apex/ProductTabController.saveProduct";
import associateProductWithOrder from "@salesforce/apex/InfoTabController.associateProductWithOrder";
import saveOpportunityStage from "@salesforce/apex/InfoTabController.saveOpportunityStage";
import addNewProduct from "@salesforce/apex/InfoTabController.addNewProduct";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import CONSENT_DISCLAIMER from "@salesforce/label/c.Chuzo_Consent_Text";

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
export default class Poe_lwcBuyflowCharter extends NavigationMixin(LightningElement) {
    @api recordId;
    @api origin;
    @api userId;
    logo = "/poe/sfsites/c/resource/POE_chIMG";
    address;
    apt = "";
    zip;
    fname;
    originalAddress;
    lname;
    phone;
    mobile;
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
    referenceNumber;
    addressDiscrepancy = false;
    orderTotal;
    showLoaderSpinner;
    showInfo = true;
    showForm = false;
    showConfirmation = false;
    charterUrl;
    showCollateral;
    showSBS;
    noConfirmationType = true;
    confirmationType;
    confirmationTypes = [
        {
            label: "Confirmation Number",
            value: "confirmation"
        },
        {
            label: "Customer Account Number",
            value: "account"
        },
        {
            label: "Work Order Number",
            value: "work"
        }
    ];
    conflictOrder;
    descriptionOptions = [];
    contactConsentLabel = CONSENT_DISCLAIMER;
    contactConsent = false;
    orderRtId;

    get options() {
        return [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" }
        ];
    }

    get trackerData() {
        return {
            userId: this.userId,
            operation: "setTrack",
            isCount: true
        };
    }

    get hideConfirmation() {
        return !this.showConfirmation;
    }

    get hideSBS() {
        return !this.showSBS;
    }

    @wire(getObjectInfo, { objectApiName: ORDER_OBJECT })
    getRtId({ data, error }) {
        if (data) {
            let rtInfo = data.recordTypeInfos;
            this.orderRtId = Object.keys(rtInfo).find((key) => rtInfo[key].name === "Standard Order");
        } else if (error) {
            this.logError(error.body?.message || error.message);
            console.log(error);
        }
    }
    @wire(getPicklistValues, { recordTypeId: "$orderRtId", fieldApiName: DESCRIPTION_FIELD })
    getProgramDescriptionValues({ data, error }) {
        console.log("Program Other Details ", data);
        if (data) {
            let controllerValue = data.controllerValues["Charter/Spectrum"];
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
            this.logError(error.body?.message || error.message);
            console.log(error);
        }
    }

    handleConfirmationType(event) {
        this.confirmationType = event.target.value;
        this.noConfirmationType = false;
        this.disableValidations();
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
            program: "Charter"
        };
        getCharterInformation({ myData: input })
            .then((response) => this.handleGetCharterInformation(response))
            .catch((error) => {
                this.logError(error.body?.message || error.message);
                this.showLoaderSpinner = false;
                console.log(error);
            });
    }

    handleConsentChange(e) {
        this.contactConsent = e.detail.checked;
    }

    handleGetCharterInformation(response) {
        console.log("Get Charter Information Response", response);
        this.agentEmail = response.result.userEmail;
        this.affiliate = response.result.affiliateId;
        this.salesId = response.result.salesId;
        this.charterUrl = response.result.url;
        let input = {
            Id: this.recordId,
            Program: "Spectrum"
        };
        getAddressInfo({ myData: input })
            .then((response) => this.handleGetAddressInfo(response))
            .catch((error) => {
                this.logError(error.body?.message || error.message);
                this.showLoaderSpinner = false;
                console.log(error);
            });
    }

    handleGetAddressInfo(response) {
        console.log("Get Address Information Response", response);
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
            this.email = contact.hasOwnProperty("Email") ? contact.Email : undefined;
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
                this.logError(error.body?.message || error.message);
                this.showLoaderSpinner = false;
                console.log(error);
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
                break;
            case "lname":
                this.lname = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "phone":
                this.phone = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "mobile":
                this.mobile = event.target.value !== "" ? event.target.value : undefined;
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
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "Installation Date must be today or greater."
                    });
                    this.dispatchEvent(event);
                    this.installationDate = undefined;
                }
                break;
            case "product":
                this.productDescription = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "amount":
                this.orderTotal = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "conflictOrder":
                this.conflictOrder = event.target.value;
        }
        this.disableValidations();
    }

    disableValidations() {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        let phonere = /^\d{10}$/;
        let zipre = /^\d{5}$/;
        let ordernumre = /^\d{16}$/;
        let confnumre = /^\d{10}$/;

        if (this.showInfo) {
            if (
                this.address !== undefined &&
                zipre.test(this.zip) &&
                this.fname !== undefined &&
                this.lname !== undefined &&
                phonere.test(this.phone) &&
                phonere.test(this.mobile) &&
                emailre.test(this.email) &&
                this.state !== undefined &&
                this.city !== undefined
            ) {
                this.noCompleteInformation = false;
            } else {
                this.noCompleteInformation = true;
            }
        } else if (this.showForm) {
            let validOrder =
                ((this.confirmationType == "work" || this.confirmationType == "account") &&
                    ordernumre.test(this.confirmationNumber)) ||
                (this.confirmationType == "confirmation" && confnumre.test(this.confirmationNumber));
            let confElement = this.template.querySelector('[data-id="confirmation"]');
            if (
                validOrder &&
                this.productDescription !== undefined &&
                this.installationDate !== undefined &&
                this.address !== undefined &&
                this.zip !== undefined &&
                this.state !== undefined &&
                this.city !== undefined &&
                this.orderTotal !== undefined &&
                this.conflictOrder !== undefined
            ) {
                confElement.setCustomValidity("");
                confElement.reportValidity();
                this.noCompleteInformation = false;
            } else {
                if (!validOrder) {
                    if (this.confirmationType == "work" || this.confirmationType == "account") {
                        confElement.setCustomValidity(
                            "Customer Account Number and Work Order Number must be 16 digits long."
                        );
                        confElement.reportValidity();
                    } else if (this.confirmationType == "confirmation") {
                        confElement.setCustomValidity("Confirmation Number must be 10 digits long.");
                        confElement.reportValidity();
                    }
                } else {
                    confElement.setCustomValidity("");
                    confElement.reportValidity();
                }
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

    handleNext() {
        if (this.showInfo) {
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
                addressLine2: this.apt,
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
                    this.saveIframeClient();
                })
                .catch((error) => {
                    this.logError(error.body?.message || error.message);
                    console.error(error, "ERROR");
                    this.showLoaderSpinner = false;
                });
        }
        if (this.showForm) {
            this.showLoaderSpinner = true;
            this.saveIframeClient();
            let trackerData = this.trackerData;
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
                    this.logError(error.body?.message || error.message);
                    console.error(error, "ERROR");
                    this.showLoaderSpinner = false;
                });
        }
    }

    saveIframeClient() {
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
            mobile: this.mobile,
            email: this.email,
            origin: this.origin,
            program: "Charter/Spectrum",
            productDescription: this.productDescription,
            consent: this.contactConsent
        };
        console.log("Save Client Data Request", data);
        saveIframeClient({ myData: data })
            .then((response) => {
                console.log(response);
                if (this.showInfo) {
                    if (response.result.hasOwnProperty("Order") && response.result.hasOwnProperty("Opportunity")) {
                        this.updateTabOpportunity("Customer Information");
                        this.orderId = response.result.Order.Id;
                        this.showInfo = false;
                        this.showForm = true;
                        this.showConfirmation = false;
                        this.showLoaderSpinner = false;
                        this.disableValidations();
                        let addressString;
                        if (!!this.apt) {
                            addressString =
                                "address/?address1=" +
                                encodeURIComponent(this.address) +
                                "&address2=" +
                                encodeURIComponent(this.apt);
                        } else addressString = "address/?address1=" + encodeURIComponent(this.address) + "&address2=";
                        const event = new ShowToastEvent({
                            title: "Sales Process Information",
                            variant: "success",
                            mode: "sticky",
                            message:
                                "You are now leaving Chuzo to process the order. Important: For proper commission payment, the order number and product information must be entered exactly as seen in the Partner Portal."
                        });
                        this.dispatchEvent(event);
                        let url =
                            this.charterUrl +
                            addressString +
                            "&zip=" +
                            encodeURIComponent(this.zip) +
                            "&fname=" +
                            encodeURIComponent(this.fname) +
                            "&lname=" +
                            encodeURIComponent(this.lname) +
                            "&phone=" +
                            encodeURIComponent(this.phone) +
                            "&email=" +
                            encodeURIComponent(this.email) +
                            "&agentEmail=" +
                            encodeURIComponent(this.agentEmail) +
                            "&salesID=" +
                            encodeURIComponent(this.salesId) +
                            "&affiliate=" +
                            encodeURIComponent(this.affiliate) +
                            "&TransID=PV_" +
                            encodeURIComponent(this.referenceNumber) +
                            "&present=true";
                        console.log(url);
                        window.open(url, "_tab");
                    } else {
                        this.logError(error.body?.message || error.message);
                        const event = new ShowToastEvent({
                            title: "Error",
                            variant: "error",
                            mode: "sticky",
                            message:
                                "The information could not be saved to the system, the Phone or Address information may be associated with another customer. Please review it and try again."
                        });
                        this.dispatchEvent(event);
                        this.showLoaderSpinner = false;
                    }
                }
            })
            .catch((error) => {
                this.logError(error.body?.message || error.message);
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
            });
    }

    saveProductOrder() {
        this.showLoaderSpinner = true;
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
            productName = "Charter Default Product";
        } else {
            productName = nameValue.length > 80 ? nameValue.substring(0, 80) : nameValue;
        }
        let data = {
            Product: {
                Description: nameValue,
                Name: productName,
                servRef: "0",
                Family: "Spectrum",
                UnitPrice: parseFloat(this.orderTotal),
                iframe: true,
                orderId: this.orderId
            },
            ContextId: this.recordId
        };
        saveProduct({ myData: data })
            .then((response) => this.handleSaveProductResult(response))
            .catch((error) => {
                this.logError(error.body?.message || error.message);
                console.log(error);
                this.showLoaderSpinner = false;
            });
    }

    handleSaveProductResult(response) {
        console.log("Save Product Response", response);
        let productData = {
            name: response.result.ProductName,
            orderId: this.orderId,
            isConflictOrder: this.conflictOrder == "yes" ? true : false
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
                        this.logError(error.body?.message || error.message);
                        console.log(error);
                        this.showLoaderSpinner = false;
                    });
            })
            .catch((error) => {
                this.logError(error.body?.message || error.message);
                console.log(error);
                this.showLoaderSpinner = false;
            });
    }

    handleSaveOpportunityStage(response) {
        console.log("Save Opportunity Stage Response", response);
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
                        console.log("Address Discrepancy Response", response);
                        this.saveTracker();
                    })
                    .catch((error) => {
                        this.logError(error.body?.message || error.message);
                        console.log(error);
                        this.showLoaderSpinner = false;
                    });
            })
            .catch((error) => {
                this.logError(error.body?.message || error.message);
                console.log(error);
                this.showLoaderSpinner = false;
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
                    program: "Charter"
                };

                let event = new CustomEvent("newproduct", {
                    detail: values,
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                this.logError(error.body?.message || error.message);
                console.log(error);
                this.showLoaderSpinner = false;
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
        this.showLoaderSpinner = true;
        let trackerData = this.trackerData;
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
                this.logError(error.body?.message || error.message);
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
            });
    }

    sbsHandler() {
        this.showSBS = true;
    }

    hideSBS() {
        this.showSBS = false;
    }

    checkIP() {
        this.dispatchEvent(new CustomEvent("checkip"));
    }

    updateTabOpportunity(value) {
        let event = new CustomEvent("tabupdate", {
            detail: { tab: value }
        });
        this.dispatchEvent(event);
    }

    handleLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "Charter iFrame",
            provider: "Windstream",
            opportunity: this.recordId
        };
        this.dispatchEvent(event);
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            provider: "Spectrum (iframe)",
            opportunity: this.recordId,
            endpoint,
            type,
            tab: "Charter iFrame",
            component: "poe_lwcBuyflowCharter",
            error: errorMessage
        };
        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }
}