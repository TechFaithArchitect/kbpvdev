import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord, createRecord } from "lightning/uiRecordApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import LOCATION_OBJECT from "@salesforce/schema/maps__Location__c";
import OPPORTUNITY_OBJECT from "@salesforce/schema/Opportunity";
import getAvailablePrograms from "@salesforce/apex/POE_AccountBeginButtonController.getAvailablePrograms";
import getClickerRetailTrack from "@salesforce/apex/ClickerController.getClickerRetailTrack";
import getClickerEventTrack from "@salesforce/apex/ClickerController.getClickerEventTrack";

import tacticsModal from "c/poe_lwcAccountBeginSaleButtonTacticModal";

const ACCOUNT_FIELDS = [
    "Account.ShippingCity",
    "Account.ShippingCountry",
    "Account.ShippingCountryCode",
    "Account.ShippingPostalCode",
    "Account.ShippingState",
    "Account.ShippingStateCode",
    "Account.ShippingStreet",
    "Account.Shipping_Address_Line_2__c"
];

export default class Poc_newOppFromPersonAccount extends NavigationMixin(LightningElement) {
    @api recordId;
    newOpportunityId;
    zipCode;
    origin = "phonesales";
    loaderSpinner = false;
    showSaleButton = true;
    disableButton = true;
    city;
    country;
    zip;
    state;
    addressLine2;
    street;
    availablePrograms;
    programOptions = [];
    showTacticsModal = false;

    @wire(getRecord, { recordId: "$recordId", fields: ACCOUNT_FIELDS })
    wiredRecord({ error, data }) {
        if (error) {
            let message = "Unknown error";
            if (Array.isArray(error.body)) {
                message = error.body.map((e) => e.message).join(", ");
            } else if (typeof error.body.message === "string") {
                message = error.body.message;
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Opportunity Data Error",
                    message,
                    variant: "error"
                })
            );
        } else if (data) {
            this.city = data.fields.ShippingCity.value;
            this.country = data.fields.ShippingCountry.value;
            this.zip = data.fields.ShippingPostalCode.value;
            this.state = data.fields.ShippingStateCode.value;
            this.street = data.fields.ShippingStreet.value;
            this.addressLine2 = data.fields?.Shipping_Address_Line_2__c.value;
            this.handleGetAvailablePrograms();
        }
    }

    @wire(getObjectInfo, { objectApiName: LOCATION_OBJECT })
    locationInfo;

    @wire(getObjectInfo, { objectApiName: OPPORTUNITY_OBJECT })
    opportunityInfo;

    getLocationRT() {
        const rtis = this.locationInfo.data.recordTypeInfos;
        return Object.keys(rtis).find((rti) => rtis[rti].name === "TrackingGeoCode");
    }

    getOpportunityRT() {
        const rtis = this.opportunityInfo.data.recordTypeInfos;
        return Object.keys(rtis).find((rti) => rtis[rti].name === "Standard Opportunity");
    }

    handleGetAvailablePrograms() {
        let myData = {
            zip: this.zip
        };
        getAvailablePrograms({ myData })
            .then((response) => {
                this.handleProgramOptions(response.result.types);
                let availablePrograms = [];
                let agentPrograms = [];
                if (response.result.hasOwnProperty("agentPrograms")) {
                    agentPrograms = [...response.result.agentPrograms];
                }
                let zipPrograms = response.result.zipPrograms;
                agentPrograms.forEach((program) => {
                    if (program === "DirecTV") {
                        availablePrograms.push("DIRECTV");
                    }
                    if (program === "EarthLink" && zipPrograms.includes("EarthLink")) {
                        availablePrograms.push("EarthLink");
                    }
                    if (
                        (program === "Spectrum API" || program === "Charter/Spectrum") &&
                        zipPrograms.includes("Charter")
                    ) {
                        availablePrograms.push("Spectrum");
                    }
                    if (program === "Frontier" && zipPrograms.includes("Frontier")) {
                        availablePrograms.push("Frontier");
                    }
                    if (program === "Windstream" && zipPrograms.includes("Windstream")) {
                        availablePrograms.push("Windstream");
                    }
                    if (program === "Altice" && zipPrograms.includes("Altice")) {
                        availablePrograms.push("Optimum");
                    }
                    if (program === "Viasat") {
                        availablePrograms.push("Viasat");
                    }
                });
                this.availablePrograms = availablePrograms.sort().join(", ");
                this.disableButton = false;
            })
            .catch((error) => {
                console.log(error, "ERROR");
            });
    }

    handleProgramOptions(types) {
        let tactics = types.split(";");
        let options = [];
        tactics.forEach((tactic) => {
            let tacticObject = {
                label: tactic,
                value: ""
            };
            switch (tactic) {
                case "Event":
                    tacticObject.value = "event";
                    break;
                case "Retail":
                    tacticObject.value = "retail";
                    break;
                case "Phone Sales":
                    tacticObject.value = "phonesales";
                    break;
                case "Door To Door":
                    tacticObject.value = "maps";
                    break;
            }
            options.push(tacticObject);
        });
        this.programOptions = [...options];
    }

    handleClick() {
        if (this.programOptions.length > 1) {
            this.showTacticsModal = true;
        } else {
            this.origin = this.programOptions[0].value;
            this.handleStoreEventLogic();
        }
    }

    handleGetStore() {
        this.loaderSpinner = true;
        let myData = {
            userId: null,
            searchDate: null
        };
        getClickerRetailTrack({ myData: myData })
            .then((response) => {
                console.log("Retail Track Response", response);
                if (response.hasOwnProperty("storeId")) {
                    this.startNewSale();
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "No Store Associated",
                            message: "No Store is associated for this sale. Please select one in the Store tab.",
                            variant: "error"
                        })
                    );
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.log("Retail Track Error", error);
                this.loaderSpinner = false;
            });
    }

    handleGetEvent() {
        this.loaderSpinner = true;
        let myData = {
            userId: null,
            searchDate: null
        };
        const options = {};
        getClickerEventTrack({ myData: myData })
            .then((response) => {
                console.log("Event Track Response", response);
                if (response.hasOwnProperty("eventId")) {
                    this.startNewSale();
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "No Event Associated",
                            message: "No Event is associated for this sale. Please select one in the Events tab.",
                            variant: "error"
                        })
                    );
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.log("Event Track Error", error);
                this.loaderSpinner = false;
            });
    }

    handleSaveGeolocation() {
        this.loaderSpinner = true;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let fields = {
                    RecordTypeId: this.getLocationRT(),
                    POE_GeoCode_Origin__c: "Account Record Page",
                    POE_GeoCode_Sub_Origin__c: "Order Button",
                    maps__Latitude__c: position.coords.latitude,
                    maps__Longitude__c: position.coords.longitude
                };
                const recordInput = { apiName: LOCATION_OBJECT.objectApiName, fields };
                createRecord(recordInput)
                    .then((location) => {
                        this.startNewSale();
                    })
                    .catch((error) => {
                        console.log("Error Saving Geolocation", error);
                        this.loaderSpinner = false;
                    });
            },
            (e) => {
                this.strError = e.message;
            },
            {
                enableHighAccuracy: true
            }
        );
    }

    hideModal() {
        this.showTacticsModal = false;
    }

    confirmTactic(event) {
        this.showTacticsModal = false;
        this.origin = event.detail;
        this.handleStoreEventLogic();
    }

    handleStoreEventLogic() {
        if (this.origin === "retail") {
            this.handleGetStore();
        } else if (this.origin === "event") {
            this.handleGetEvent();
        } else {
            this.startNewSale();
        }
    }

    startNewSale() {
        this.loaderSpinner = true;
        let fields = {
            RecordTypeId: this.getOpportunityRT(),
            AccountId: this.recordId,
            CloseDate: new Date(),
            Maps_City__c: this.city,
            Maps_Country__c: this.country,
            Maps_Appartment__c: this.addressLine2,
            Maps_PostalCode__c: this.zip,
            Maps_State__c: this.state,
            Maps_Street__c: this.street,
            POE_Clicker_Origin__c: this.origin,
            StageName: "Opportunity",
            Name: "New Opportunity"
        };
        const recordInput = { apiName: OPPORTUNITY_OBJECT.objectApiName, fields };
        createRecord(recordInput)
            .then((record) => {
                this[NavigationMixin.Navigate]({
                    type: "comm__namedPage",
                    attributes: {
                        name: "Addres_Serviceability_Check__c"
                    },
                    state: {
                        c__recordId: record.id,
                        zipCode: this.zip,
                        clickerorigin: fields.POE_Clicker_Origin__c
                    }
                });
            })
            .catch((error) => {
                console.log("Error Creating Opportunity", error);
            })
            .finally(() => {
                this.loaderSpinner = false;
            });
    }
}