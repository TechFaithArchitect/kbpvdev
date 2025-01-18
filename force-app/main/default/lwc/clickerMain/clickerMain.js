import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import logError from "@salesforce/apex/ErrorLogModel.logError";
import EVENT_ICON from "@salesforce/contentAssetUrl/unknown_content_asset";
import INTERACTION_ICON from "@salesforce/contentAssetUrl/unknown_content_asset";
import STORE_ICON from "@salesforce/contentAssetUrl/unknown_content_asset";
import getUserFraudFlag from "@salesforce/apex/ClickerController.getUserFraudFlag";
import getEvent from "@salesforce/apex/ClickerController.getEvent";
import getStore from "@salesforce/apex/ClickerController.getStore";
import getClickerLocationRecordType from "@salesforce/apex/ClickerController.getClickerLocationRecordType";
import saveGeoLocalization from "@salesforce/apex/InfoTabController.saveGeoLocalization";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import getClickerRetailTrack from "@salesforce/apex/ClickerController.getClickerRetailTrack";
import getClickerEventTrack from "@salesforce/apex/ClickerController.getClickerEventTrack";


const RETAIL = "retail";
const EVENT = "event";
const PHONE_SALES = "phonesales";

export default class ClickerMain extends LightningElement {
    
    @api origin;
    zip;
    disableButton = true;
    showActions = false;
    showBuyflowMaster = false;
    showZipInput = true;
    showSelectModal = false;
    fraudFlag = false;
    selectName;
    selectLabel;
    selectValue;
    selectOptions;
    selectModalTitle;
    store;
    event;
    storeOptions = [];
    eventOptions = [];
    relatedRecordIconUrl;
    eventIconUrl = EVENT_ICON;
    storeIconUrl = STORE_ICON;
    interactionIconUrl = INTERACTION_ICON;
    geoRT;
    provider;
    NFFLcode;
    FFLcode;
    storeType;
    
    connectedCallback() {
        this.loaderSpinner = true;
        let parameters = this.getQueryParameters();
        let lowerCaseParameters = Object.keys(parameters).reduce((accumulator, key) => {
            accumulator[key.toLowerCase()] = parameters[key];
            return accumulator;
        }, {});
        this.provider = lowerCaseParameters.hasOwnProperty("provider")
                ? lowerCaseParameters.provider.toLowerCase()
                : undefined;
        this.origin = lowerCaseParameters.hasOwnProperty("clickerorigin") 
            ? lowerCaseParameters.clickerorigin 
            : this.provider == undefined 
                ? "maps" 
                : PHONE_SALES;
        this.getFraudFlag();
        if(this.fraudFlag) {
            this.disableButton = true;
        } else {
            this.getClickerLocationRT();
            this.getTrack();
        }
    }

    handleZipChange(event) {
        this.zip = event.target.value;
        this.disableValidations();
    }

    disableValidations() {
        let zipre = /^\d{5}$/;
        if (zipre.test(this.zip) &&
            (   this.origin === PHONE_SALES ||
                (this.origin === RETAIL && this.store !== undefined) ||
                (this.origin === EVENT && this.event !== undefined)
            )
        ) {
            this.disableButton = false;
        } else {
            this.disableButton = true;
        }
    }

    handleClick() {
        this.showZipInput = false;
        this.showBuyflowMaster = true;
    }

    handleLogInteraction() {
        if(this.origin === RETAIL && this.store === undefined) {
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: "You must select a store to continue"
            });
            this.dispatchEvent(event);
            return;
        } else if(this.origin === EVENT && this.event === undefined) {
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: "You must select an event to continue"
            });
            this.dispatchEvent(event);            
            return;
        } else {
            this.logInteraction();
        }
    }

    showSelectionModal() {
        this.showSelectModal = true;
    }

    hideSelectModal() {
        this.showSelectModal = false;
    }

    handleSelectModal(event) {
        this.selectLabel = event.detail.label;
        this.selectValue = event.detail.value;
        if(this.origin === RETAIL){
            this.store = this.selectValue;
        } else if (this.origin === EVENT){
            this.event = this.selectValue;
        }
        this.selectModalTitle = this.selectLabel;
        this.setTrack(true);
        this.disableValidations();
        this.hideSelectModal();
    }

    getFraudFlag() {
        this.loaderSpinner = true;
        let myData = {
            userId: null
        };
        getUserFraudFlag({ myData: myData })
            .then((response) => {
                this.loaderSpinner = false;
                this.fraudFlag = response;
                if(this.fraudFlag) {
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "User blocked for security reasons"
                    });
                    this.dispatchEvent(event);
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "User blocked for security reasons"
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    getClickerLocationRT() {
        this.loaderSpinner = true;
        let myData = {};
        getClickerLocationRecordType({ myData: myData })
            .then((response) => {
                this.geoRT = response;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "Error retrieving record type"
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    callGeoLocalization() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;
                this.aciLatitude = latitude;
                this.aciLongitude = longitude;
                let origin = "";
                if (this.origin === "event" || this.origin === "retail") {
                    origin = "ClickerPage";
                    let myData = {
                        maps__Location__c: {
                            RecordTypeId: this.geoRT,
                            POE_GeoCode_Origin__c: origin,
                            POE_GeoCode_Sub_Origin__c: "Get Started Button",
                            maps__Latitude__c: latitude,
                            maps__Longitude__c: longitude
                        }
                    };
                    saveGeoLocalization({ myData: myData })
                        .then((response) => {
                            console.log(response);
                            console.log("Geolocalization with Started Button saved");
                        })
                        .catch((error) => {
                            console.log(error);
                            console.error(error, "ERROR");
                            this.logError(error.body?.message || error.message);
                        });
                }
            },
            (e) => {
                this.loaderSpinner = false;
                this.strError = e.message;
                if (e.code == 3) {
                    this.loaderSpinner = false;
                    const sendProducts = new CustomEvent("saveinfo", {
                        detail: data
                    });
                    this.dispatchEvent(sendProducts);
                } else if (e.code == 1) {
                    console.log(e.message);
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "Geolocation is not activated on your Browser"
                    });
                    this.dispatchEvent(event);
                    this.logError(error.body?.message || error.message);
                }
            },
            { maximumAge: 60000, timeout: 10000, enableHighAccuracy: false }
        );
    }

    getEventOptions() {
        this.loaderSpinner = true;
        this.selectOptions = [];
        let myData = {
            userId: null
        };
        getEvent({ myData: myData })
            .then((response) => {
                this.loaderSpinner = false;
                let events;
                if(response.hasOwnProperty("events")){
                    events = response.events;
                    events.forEach(event => {
                        this.selectOptions.push({
                            label: event.Name, 
                            value: event.Id
                        });
                    });
                } else {
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "No events found"
                    });
                    this.dispatchEvent(event);
                }
            
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "An error occurred retrieving events"
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    getStoreOptions() {
        this.loaderSpinner = true;
        this.selectOptions = [];
        let myData = {
            userId: null
        };
        getStore({ myData: myData })
            .then((response) => {
                this.loaderSpinner = false;
                let stores;
                if(response.hasOwnProperty("stores")){
                    stores = response.stores;
                    stores.forEach(store => {
                        this.selectOptions.push({
                            label: store.Name, 
                            value: store.Id
                        });
                    });
                } else {
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "No stores found"
                    });
                    this.dispatchEvent(event);
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "An error occurred retrieving stores"
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    setTrack(recordSelection) {
        if (this.origin === "retail") {
            let myData = {
                userId: null,
                operation: "setTrack",
                action: "Contact",
                store: this.store
            };
            if(recordSelection){
                myData.isCount = false;
            } else {
                myData.isCount = true;
            }
            setClickerRetailTrack({ myData: myData })
                .then((response) => {
                    console.log("RetailTrack", response);
                    this.isNationalRetail = response.result.storeType === "National Retail";
                    this.FFLCode = response.result.FFLcode;
                    this.NFFLCode = response.result.NFFLcode;
                    let trackerId = response.result.inProgressRetail;
                    this.inProgressRetail = trackerId;
                    const sendTrackerEvent = new CustomEvent("clickertrack", {
                        detail: trackerId
                    });
                    this.dispatchEvent(sendTrackerEvent);
                    this.loaderSpinner = false;
                })
                .catch((error) => {
                    console.log(error);
                    console.error(error, "ERROR");
                    this.logError(error.body?.message || error.message);
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "event") {
            let myData = {
                operation: "setTrack",
                action: "Contact",
                userId: null,
                event: this.event
            };
            if(recordSelection){
                myData.isCount = false;
            } else {
                myData.isCount = true;
            }
            const options = {};
            setClickerEventTrack({ myData: myData })
                .then((response) => {
                    console.log("event track", response);
                    let trackerId = response.result.inProgressEvent;
                    this.inProgressEvent = trackerId;
                    const sendTrackerEvent = new CustomEvent("clickertrack", {
                        detail: trackerId
                    });
                    this.dispatchEvent(sendTrackerEvent);
                    this.loaderSpinner = false;
                })
                .catch((error) => {
                    console.log(error);
                    console.error(error, "ERROR");
                    this.logError(error.body?.message || error.message);
                    this.loaderSpinner = false;
                });
        } else {
            this.loaderSpinner = false;
        }
    }

    getTrack() {
        if (this.origin === "retail") {
            let myData = {
                userId: null,
                searchDate: null
            };
            getClickerRetailTrack({ myData: myData })
                .then((response) => {
                    console.log("RetailTrack", response);
                    this.selectModalTitle = response.store ? response.store : "Click here to select a Store";
                    this.store = response.storeId;
                    this.storeType = response.storeType;
                    this.FFLCode = response.FFLcode;
                    this.NFFLCode = response.NFFLcode;
                    this.relatedRecordIconUrl = this.storeIconUrl;
                    this.showActions = true;
                    this.selectName = 'Store Selection';
                    this.getStoreOptions();
                    this.loaderSpinner = false;
                })
                .catch((error) => {
                    console.log(error);
                    console.error(error, "ERROR");
                    this.logError(error.body?.message || error.message);
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "event") {
            let myData = {
                userId: null,
                searchDate: null
            };
            const options = {};
            getClickerEventTrack({ myData: myData })
                .then((response) => {
                    console.log("event track", response);
                    this.selectModalTitle = response.event ? response.event : "Click here to select an Event";
                    this.event = response.eventId;
                    this.relatedRecordIconUrl = this.eventIconUrl;
                    this.showActions = true;
                    this.selectName = "Event Selection";
                    this.getEventOptions();
                    this.loaderSpinner = false;
                })
                .catch((error) => {
                    console.log(error);
                    console.error(error, "ERROR");
                    this.logError(error.body?.message || error.message);
                    this.loaderSpinner = false;
                });
        } else {
            this.loaderSpinner = false;
        }
    }

    logInteraction() {
        this.loaderSpinner = true;
        try {
            this.setTrack(false);
            this.callGeoLocalization();
            const event = new ShowToastEvent({
                title: "Success",
                variant: "success",
                mode: "sticky",
                message: "Interaction Logged"
            });
            this.dispatchEvent(event);
        } catch (error) {
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: "An error occurred logging the interaction"
            });
            this.dispatchEvent(event);
            this.logError(error.body?.message || error.message);
        }
    }

    handleHome() {
        this.zip = undefined;
        this.showBuyflowMaster = false;
        this.showZipInput = true;
        this.disableValidations();
    }

    getQueryParameters() {
        var params = {};
        var search = location.search.substring(1);
        if (search) {
            params = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', (key, value) => {
                return key === "" ? value : decodeURIComponent(value);
            });
        }
        return params;
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Clicker Main",
            component: "clickerMain",
            error: errorMessage ? JSON.stringify(errorMessage) : errorMessage
        };

        logError({ error })
            .then(() => {})
            .catch((err) => {
                console.error(`LOGGING ERROR: ${err.body?.message || err.stack}`);
            });
    }


}