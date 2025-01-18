import { LightningElement, api, wire, track } from "lwc";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ORDER_OBJECT from "@salesforce/schema/Order";
import DETAIL_OTHER_FIELD from "@salesforce/schema/Order.POE_Program_Other_Detail__c";
import callOrderVerbiage from "@salesforce/label/c.callOrderVerbiage";
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
import addNewProduct from "@salesforce/apex/InfoTabController.addNewProduct";
import getOppReferenceNumber from "@salesforce/apex/InfoTabController.getOppReferenceNumber";
import customerReachedCap from "@salesforce/apex/CreditCheckTabController.customerReachedCap";
import capReachedError from "@salesforce/label/c.Order_Cap_Reached_Body";

let stateNames = [
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

export default class Poe_lwcBuyflowOther extends NavigationMixin(LightningElement) {
    @api recordId;
    @api origin;
    @api userId;
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
    noCompleteInformation = true;
    city;
    state;
    stateName;
    states = [];
    confirmationNumber;
    productDescription;
    installationDate;
    programOtherDetail;
    programOtherProvider;
    orderId;
    referenceNumber;
    orderTotal;
    showLoaderSpinner;
    showForm = false;
    showConfirmation = false;
    name;
    isCallOrder;
    isCallOrderOptions = [
        { label: "Yes", value: "YES" },
        { label: "No", value: "NO" }
    ];
    programOptions = [];
    @track detailOptions = [];
    detailDisabled = true;
    detailFieldData;
    shellOrderDisclaimer =
        "*Please note that by utilizing this tab you are not placing an actual order. The purpose of this page is to track and tie commissions back to any orders that needed to be placed outside of the Chuzo order entry platform.";
    callOrderLabel = callOrderVerbiage;
    finishLoad = false;
    orderRtId;
    labels = {
        capReachedError
    };
    creditCheckModshowCapReachedModal = false;
    showCapReachedModal = false;

    @wire(getObjectInfo, { objectApiName: ORDER_OBJECT })
    getRtId({ data, error }) {
        if (data) {
            let rtInfo = data.recordTypeInfos;
            this.orderRtId = Object.keys(rtInfo).find((key) => rtInfo[key].name === "Standard Order");
        } else if (error) {
            console.log(error);
        }
    }
    @wire(getPicklistValues, { recordTypeId: "$orderRtId", fieldApiName: DETAIL_OTHER_FIELD })
    getProgramOtherDetailValues({ data, error }) {
        console.log("get programs other details ", data);
        if (data) {
            this.detailFieldData = data;
            let programs = data.controllerValues;
            for (let key in programs) {
                let option = {
                    label: key == "Altice" ? "Optimum" : key === "Charter/Spectrum" ? "Spectrum" : key,
                    value: key
                };
                this.programOptions.push(option);
            }
            this.finishLoad = true;
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
        let myData = {
            Id: this.recordId,
            Program: this.programOtherProvider
        };

        getAddressInfo({ myData })
            .then((response) => {
                let result = response.result;
                let opportunity = result.Opportunity;
                if (typeof opportunity === "object") {
                    this.city = opportunity.hasOwnProperty("Maps_City__c") ? opportunity.Maps_City__c : undefined;
                    this.address = opportunity.hasOwnProperty("Maps_Street__c")
                        ? opportunity.Maps_Street__c
                        : undefined;
                    this.apt = opportunity.hasOwnProperty("Maps_Appartment__c")
                        ? opportunity.Maps_Appartment__c
                        : undefined;
                    this.state = opportunity.hasOwnProperty("Maps_State__c") ? opportunity.Maps_State__c : undefined;
                    this.stateName =
                        this.state !== undefined ? this.states.find((e) => e.value == this.state).label : undefined;
                    this.building = opportunity.hasOwnProperty("Maps_Building__c")
                        ? opportunity.Maps_Building__c
                        : undefined;
                    this.number = opportunity.hasOwnProperty("Maps_AptNumber__c")
                        ? opportunity.Maps_AptNumber__c
                        : undefined;
                    this.floor = opportunity.hasOwnProperty("Maps_Floor__c") ? opportunity.Maps_Floor__c : undefined;
                    this.zip = opportunity.hasOwnProperty("Maps_PostalCode__c")
                        ? opportunity.Maps_PostalCode__c
                        : undefined;
                }
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
            })
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    handleChange(event) {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        switch (event.target.name) {
            case "fname":
                this.fname = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "lname":
                this.lname = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "address":
                this.address = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "apt":
                this.apt = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "city":
                this.city = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "state":
                this.state = event.target.value !== "" ? event.target.value : undefined;
                this.stateName =
                    this.state !== undefined ? this.states.find((e) => e.value == this.state).label : undefined;
                break;
            case "zip":
                this.zip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "mobile":
                this.mobile = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "emailField":
                this.email = event.target.value !== "" ? event.target.value : undefined;
                const emailCmp = this.template.querySelector('[data-id="txtEmailAddress"]');
                if (!emailre.test(this.email)) {
                    emailCmp.setCustomValidity("Enter a valid Email Address");
                } else emailCmp.setCustomValidity("");
                break;
            case "confirmation":
                this.confirmationNumber = event.target.value !== "" ? event.target.value : undefined;
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
                    document.getElementById("date").reset();
                }
                break;
            case "programOtherDetail":
                this.programOtherDetail = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "program":
                this.programOtherProvider = event.target.value !== "" ? event.target.value : undefined;
                this.generateDetailOptions();
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

    generateDetailOptions() {
        this.detailOptions = [];
        this.showLoaderSpinner = true;
        let controllerValue = this.detailFieldData.controllerValues[this.programOtherProvider];
        let fielValues = this.detailFieldData.values.filter(
            (element) => element.validFor.findIndex((value) => value == controllerValue) != -1
        );
        fielValues.forEach((value) => {
            let detailElement = {
                label: value.label,
                value: value.value
            };
            this.detailOptions.push(detailElement);
        });
        this.detailDisabled = false;
        this.showLoaderSpinner = false;
    }

    disableValidations() {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        let phonere = /^\d{10}$/;
        let zipre = /^\d{5}$/;
        if (
            this.isCallOrder !== undefined &&
            this.address !== undefined &&
            this.zip !== undefined &&
            zipre.test(this.zip) &&
            this.fname !== undefined &&
            this.lname !== undefined &&
            this.mobile !== undefined &&
            phonere.test(this.mobile) &&
            this.email !== undefined &&
            emailre.test(this.email) &&
            this.state !== undefined &&
            this.city !== undefined &&
            this.orderTotal !== undefined &&
            this.installationDate !== undefined &&
            this.confirmationNumber !== undefined &&
            this.programOtherDetail !== undefined &&
            this.programOtherProvider !== undefined &&
            this.installationDate !== undefined
        ) {
            this.noCompleteInformation = false;
        } else {
            this.noCompleteInformation = true;
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
                        Program: this.programOtherProvider,
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
                                productName: this.programOtherProvider,
                                programOtherProvider: this.programOtherProvider,
                                // productDescription: "Created using 'Other' Buyflow",
                                programOtherDetail: this.programOtherDetail,
                                program: "Other",
                                isCallOrder: this.isCallOrder === "YES"
                            };

                            saveIframeClient({ myData: data })
                                .then((response) => {
                                    console.log(response);
                                    if (
                                        response.result.hasOwnProperty("Order") &&
                                        response.result.hasOwnProperty("Opportunity")
                                    ) {
                                        this.updateTabOpportunity("Customer Information");
                                        this.orderId = response.result.Order.Id;
                                        this.showLoaderSpinner = true;
                                        const trackerData = {
                                            userId: this.userId,
                                            operation: "setTrack",
                                            isCount: true,
                                            action: "Product Selection"
                                        };
                                        let setClickerMethod;

                                        if (this.origin === "retail") {
                                            setClickerMethod = setClickerRetailTrack;
                                        } else if (this.origin === "event") {
                                            setClickerMethod = setClickerEventTrack;
                                        } else if (this.origin === "phonesales") {
                                            setClickerMethod = setClickerCallCenterTrack;
                                        } else {
                                            this.saveProductOrder();
                                            return;
                                        }

                                        setClickerMethod({ myData: trackerData })
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
                                    this.logError(error.body?.message || error.message);
                                });
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

    saveProductOrder() {
        this.showLoaderSpinner = true;

        const trimAndReplaceSpaces = (item) => {
            return item.trim().replace(/[\r\n]/gm, "");
        };

        let productDescription = trimAndReplaceSpaces(this.programOtherDetail);

        let data = {
            Product: {
                Description: productDescription.length === 0 ? "Created using 'Other' Buyflow" : productDescription,
                Name: this.programOtherDetail,
                servRef: "0",
                Family: "Other",
                UnitPrice: parseFloat(this.orderTotal),
                orderId: this.orderId,
                iframe: true
            },
            ContextId: this.recordId
        };

        saveProduct({ myData: data })
            .then((response) => {
                let productData = {
                    name: response.result.ProductName,
                    orderId: this.orderId
                };

                associateProductWithOrder({ myData: productData })
                    .then((response) => {
                        let orderData = {
                            ContextId: this.recordId,
                            accountNumber: "",
                            orderId: this.orderId,
                            orderNumber: this.confirmationNumber,
                            installationDate: this.installationDate
                        };
                        this.updateTabOpportunity("Order Success");
                        saveOpportunityStage({ myData: orderData })
                            .then((response) => {
                                this.getOpportunityReferenceNumber();
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
            })
            .catch((error) => {
                console.log(error);
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    getOpportunityReferenceNumber() {
        const myData = {
            ContextId: this.recordId
        };

        getOppReferenceNumber({ myData })
            .then((response) => {
                this.referenceNumber = response.result.referenceNumber;
            })
            .catch((error) => {
                console.log(error);
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
                console.log("Add New Product Handler", response);
                this.showLoaderSpinner = false;
                let newOppId = response.result.Opportunity.Id;
                let values = {
                    recordId: newOppId,
                    program: "Other"
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
        this.showLoaderSpinner = true;
        const trackerData = {
            userId: this.userId,
            operation: "setTrack",
            isCount: true,
            action: "Buyflow Completed"
        };
        this.name = this.fname + " " + this.lname;
        let setClickerMethod;

        if (this.origin === "retail") {
            setClickerMethod = setClickerRetailTrack;
        } else if (this.origin === "event") {
            setClickerMethod = setClickerEventTrack;
        } else if (this.origin === "phonesales") {
            setClickerMethod = setClickerCallCenterTrack;
        } else {
            this.showForm = false;
            this.showConfirmation = true;
            this.showLoaderSpinner = false;
            return;
        }

        setClickerMethod({ myData: trackerData })
            .then((response) => {
                this.showForm = false;
                this.showConfirmation = true;
                this.showLoaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
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

    logError(errorMessage) {
        const error = {
            type: "Internal Error",
            provider: "Other",
            tab: "Other",
            component: "Poe_lwcBuyflowOther",
            error: errorMessage,
            opportunity: this.recordId
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }
}