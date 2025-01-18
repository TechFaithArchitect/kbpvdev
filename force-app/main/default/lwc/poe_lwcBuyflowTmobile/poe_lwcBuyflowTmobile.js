import { LightningElement, api, wire, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ORDER_OBJECT from "@salesforce/schema/Order";
import DESCRIPTION_FIELD from "@salesforce/schema/Order.POE_Description__c";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
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

export default class Poe_lwcBuyflowTmobile extends NavigationMixin(LightningElement) {
    @api recordId;
    @api origin;
    @api userId;
    logo = "/poe/sfsites/c/resource/POE_mobIMG";
    orderId;
    showForm = false;
    serviceability;
    noCompleteInformation = true;
    serviceUrl = "https://www.t-mobile.com/isp/eligibility&output=embed";
    address;
    city;
    states = [];
    state;
    stateName;
    zip;
    confirmationNumber;
    productDescription;
    fname;
    lname;
    email;
    phone;
    orderTotal;
    showLoaderSpinner;
    referenceNumber;
    showConfirmation = false;
    showCollateral = false;
    showSBS;
    signatureIncomplete = true;
    showSignature;
    name;
    addressSignature;
    @track descriptionOptions = [];
    finishLoad = false;
    orderRtId;

    get trackerData() {
        return {
            userId: this.userId,
            operation: "setTrack",
            isCount: true
        };
    }

    get hiddenConfirmation() {
        return !this.showConfirmation;
    }

    @wire(getObjectInfo, { objectApiName: ORDER_OBJECT })
    getRtId({ data, error }) {
        if (data) {
            let rtInfo = data.recordTypeInfos;
            this.orderRtId = Object.keys(rtInfo).find((key) => rtInfo[key].name === "Standard Order");
        } else if (error) {
            console.log(error);
        }
    }
    @wire(getPicklistValues, { recordTypeId: "$orderRtId", fieldApiName: DESCRIPTION_FIELD })
    getProgramDescriptionValues({ data, error }) {
        console.log("get programs other details ", data);
        if (data) {
            let controllerValue = data.controllerValues["T-Mobile"];
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
            this.finishLoad = true;
        } else if (error) {
            console.log(error);
        }
    }

    connectedCallback() {
        this.showLoaderSpinner = true;
        const event = new ShowToastEvent({
            title: "Sales Process Information",
            variant: "success",
            mode: "sticky",
            message:
                "You are now leaving Chuzo to process the order. Important: For proper commission payment, the order number and product information must be entered exactly as seen in the Partner Portal."
        });
        this.dispatchEvent(event);
        this.checkIP();
        window.open("https://www.t-mobile.com/d2c", "_blank").focus();
        this.showForm = true;
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.name
            };
            this.states.push(option);
        });

        let myData = {
            Id: this.recordId,
            Program: "T-Mobile"
        };

        getAddressInfo({ myData })
            .then((response) => {
                console.log(response);
                let result = response.result;
                let opportunity = result.Opportunity;
                let contact = result.Contact;
                if (typeof opportunity === "object") {
                    this.address = opportunity.hasOwnProperty("Maps_Street__c")
                        ? opportunity.Maps_Street__c
                        : undefined;
                    this.zip = opportunity.hasOwnProperty("Maps_PostalCode__c")
                        ? opportunity.Maps_PostalCode__c
                        : undefined;
                    this.address = opportunity.hasOwnProperty("Maps_Street__c")
                        ? opportunity.Maps_Street__c
                        : undefined;
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
                        this.showLoaderSpinner = false;
                    })
                    .catch((error) => {
                        this.showLoaderSpinner = false;
                        console.log(error);
                    });
            })
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
            });
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

    handleChange(event) {
        switch (event.target.name) {
            case "serviceability":
                this.serviceability = event.target.checked;
                break;
            case "address":
                this.address = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "zip":
                this.zip = event.target.value;
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
            case "email":
                this.email = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "confirmation":
                this.confirmationNumber = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "product":
                this.productDescription = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "amount":
                this.orderTotal = event.target.value !== "" ? event.target.value : undefined;
                break;
        }
        this.disableValidations();
    }

    disableValidations() {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        let phonere = /^\d{10}$/;
        if (this.showForm) {
            if (
                this.confirmationNumber !== undefined &&
                this.address !== undefined &&
                this.city !== undefined &&
                this.state !== undefined &&
                /^\d{5}$/.test(this.zip) &&
                this.email !== undefined &&
                emailre.test(this.email) &&
                phonere.test(this.phone) &&
                this.phone !== undefined &&
                this.fname !== undefined &&
                this.lname !== undefined &&
                this.orderTotal !== undefined &&
                this.productDescription !== undefined
            ) {
                this.noCompleteInformation = false;
            } else {
                this.noCompleteInformation = true;
            }
        }
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleNext() {
        this.checkIP();
        if (this.showForm) {
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
                origin: this.origin,
                contact: false
            };

            saveOpportunityAddressInformation({ myData })
                .then((response) => {
                    let data = {
                        recordId: this.recordId,
                        firstName: this.fname,
                        lastName: this.lname,
                        street: this.address,
                        city: this.city,
                        state: this.state,
                        stateName: this.stateName,
                        zipCode: this.zip,
                        mobile: this.phone,
                        email: this.email,
                        origin: this.origin,
                        program: "T-Mobile",
                        productDescription: this.productDescription
                    };

                    saveIframeClient({ myData: data })
                        .then((response) => {
                            console.log(response);
                            if (
                                response.result.hasOwnProperty("Order") &&
                                response.result.hasOwnProperty("Opportunity")
                            ) {
                                this.orderId = response.result.Order.Id;
                                this.saveProductTracker();
                            } else {
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
                        })
                        .catch((error) => {
                            console.error(error, "ERROR");
                            this.showLoaderSpinner = false;
                        });
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.showLoaderSpinner = false;
                });
        }
    }

    saveProductTracker() {
        const trackerData = this.trackerData;
        trackerData.action = "Product Selection";

        const saveTrackerMethod = this.getSaveTrackerMethod();

        if (!saveTrackerMethod) {
            this.saveProductOrder();
            return;
        }

        saveTrackerMethod({ myData: trackerData })
            .then((response) => {
                console.log(response);
                this.saveProductOrder();
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
            });
    }

    saveProductOrder() {
        this.showLoaderSpinner = true;
        let nameValue = this.productDescription.trim().replace(/[\r\n]/gm, "");
        let productName;
        if (nameValue.length === 0) {
            productName = "T-Mobile Default Product";
        } else {
            productName = nameValue.length > 80 ? nameValue.substring(0, 80) : nameValue;
        }
        let data = {
            Product: {
                Description: nameValue,
                Name: productName,
                servRef: "0",
                Family: "T-Mobile",
                UnitPrice: parseFloat(this.orderTotal),
                iframe: true,
                orderId: this.orderId
            },
            ContextId: this.recordId
        };

        saveProduct({ myData: data })
            .then((response) => {
                console.log(response);
                let productData = {
                    name: response.result.ProductName,
                    orderId: this.orderId
                };

                associateProductWithOrder({ myData: productData })
                    .then((response) => {
                        console.log(response);
                        let orderData = {
                            ContextId: this.recordId,
                            orderId: this.orderId,
                            orderNumber: this.confirmationNumber
                        };

                        saveOpportunityStage({ myData: orderData })
                            .then((response) => {
                                console.log(response);
                                this.saveTracker();
                            })
                            .catch((error) => {
                                console.log(error);
                                this.showLoaderSpinner = false;
                            });
                    })
                    .catch((error) => {
                        console.log(error);
                        this.showLoaderSpinner = false;
                    });
            })
            .catch((error) => {
                console.log(error);
                this.showLoaderSpinner = false;
            });
    }

    saveTracker() {
        this.showLoaderSpinner = true;
        this.name = this.fname + " " + this.lname;
        this.addressSignature = this.address + ", " + this.city + " " + this.state + " " + this.zip;
        const trackerData = this.trackerData;
        trackerData.action = "Buyflow Completed";

        const saveTrackerMethod = this.getSaveTrackerMethod();

        if (!saveTrackerMethod) {
            this.showForm = false;
            this.showConfirmation = true;
            this.showLoaderSpinner = false;
            return;
        }

        saveTrackerMethod({ myData: trackerData })
            .then(() => {
                this.showForm = false;
                this.showConfirmation = true;
                this.showLoaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
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
                    program: "T-Mobile"
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

    sbsHandler() {
        this.showSBS = true;
    }

    hideSBS() {
        this.showSBS = false;
    }

    checkIP() {
        this.dispatchEvent(new CustomEvent("checkip"));
    }

    handleSignatureDone(event) {
        this.showSignature = false;
        this.signatureIncomplete = false;
    }

    handleSignatureCancel(event) {
        this.showSignature = false;
    }

    signatureModalHandler() {
        this.showSignature = true;
    }
}