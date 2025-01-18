import { LightningElement, api, track, wire } from "lwc";
import basePathName from "@salesforce/community/basePath";
import { NavigationMixin } from "lightning/navigation";
import { getRecord, createRecord, getFieldValue } from "lightning/uiRecordApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import POE_Outcome_Notes__c from "@salesforce/schema/Opportunity.POE_Outcome_Notes__c";
import POE_Current_Internet_Speed__c from "@salesforce/schema/Opportunity.POE_Current_Internet_Speed__c";
import POE_Current_Wireless_Customer__c from "@salesforce/schema/Opportunity.POE_Current_Wireless_Customer__c";
import POE_Existing_Video__c from "@salesforce/schema/Opportunity.POE_Existing_Video__c";
import POE_Contract_Expiration_Date__c from "@salesforce/schema/Opportunity.POE_Contract_Expiration_Date__c";
import POE_Outcome__c from "@salesforce/schema/Opportunity.POE_Outcome__c";
import POE_Decision_Maker_Name__c from "@salesforce/schema/Opportunity.POE_Decision_Maker_Name__c";
import POE_Decision_Maker_Phone__c from "@salesforce/schema/Opportunity.POE_Decision_Maker_Phone__c";
import StageName from "@salesforce/schema/Opportunity.StageName";
import Id from "@salesforce/user/Id";
import USER_REP_TYPE from "@salesforce/schema/User.Contact.POE_Representative_Type__c";
import LOCATION_OBJECT from "@salesforce/schema/maps__Location__c";
import FRAUD_FIELD from "@salesforce/schema/Opportunity.POE_FraudObservation__c";
import FRAUDFLAG_FIELD from "@salesforce/schema/User.POE_FraudObservation__c";
import saveInteraction from "@salesforce/apex/POE_DealerScoreCardController.saveInteraction";
import saveACILocation from "@salesforce/apex/POE_SaveACIStatistics.initialSave";
import getTasks from "@salesforce/apex/POE_DispositionController.getTasks";
import getOpportunitiesByWaypointOrder from "@salesforce/apex/POE_GetOpportunitiesByWaypointOrder.getOpportunitiesByWaypointOrder";
import userIsAgentOrOwner from "@salesforce/apex/POE_PermissionsUtility.userIsAgentOrOwner";

import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class poeDispositionComponent extends NavigationMixin(LightningElement) {
    @api opportunity = false;
    @api contact = false;
    @api dM = false;
    @api presentation = false;
    @api order = false;
    locationInfo;
    isDoorToDoor = false;
    isFraudFlagged;
    isUserFlagged;
    isOppFlagged;
    @track selectedOutcome;
    @track savedOutcome;
    @api recordId;
    @api objectApiName;
    currentUserProfileId;
    error;
    geoCode = {
        latitude: 0,
        longitude: 0
    };
    locationRT;
    origin;
    loaderSpinner = false;
    tasks = [];
    hasTasks;
    showNavigation;
    opportunityRoute;
    currentRoutePosition;
    previousRoutePosition;
    @track hasNextRoutePosition = false;
    @track hasPreviousRoutPosition = false;
    nextRoutePosition;
    routePreviousOpportunity = {
        id: "",
        street: "",
        city: "",
        state: "",
        postalCode: ""
    };
    routeNextOpportunity = { id: "", street: "", city: "", state: "", postalCode: "" };
    negativeOutcomes = [
        "Address Does Not Exist",
        "Business vs Residential",
        "DNK/DNC Request",
        "No Answer - Final",
        "Vacant Lot",
        "Existing Customer",
        "No Contact with DM - Final"
    ];
    isResidential = false;

    @wire(userIsAgentOrOwner)
    wireUserIsAgentOrOwner({ error, data }) {
        if (error) {
            this.error = error;
        } else if (data) {
            this.isResidential = data.isResidential;
        }
    }

    @wire(getRecord, { recordId: Id, fields: [FRAUDFLAG_FIELD, USER_REP_TYPE] })
    userDetails({ error, data }) {
        if (data) {
            this.isUserFlagged = data.fields.POE_FraudObservation__c.value;
            let repType = data.fields.Contact.value.fields.POE_Representative_Type__c.value;
            this.isDoorToDoor = repType && repType.includes("Door To Door");
            this.checkFlag();
        } else if (error) {
            this.error = error;
            console.log(this.error);
        }
    }

    @wire(getRecord, { recordId: "$recordId", fields: [FRAUD_FIELD, POE_Outcome__c, StageName] })
    wiredRecord({ error, data }) {
        if (error) {
            console.error("ERROR", error);
        } else if (data) {
            this.isOppFlagged = data.fields.POE_FraudObservation__c.value;
            this.stageName = data.fields.StageName.value;
            this.checkFlag();
        }
    }

    checkFlag() {
        if (this.isOppFlagged == true || this.isUserFlagged == true) {
            this.isFraudFlagged = true;
        }
    }

    @wire(getObjectInfo, { objectApiName: LOCATION_OBJECT })
    locationInfo;

    StageName = StageName;
    POE_Outcome_Notes__c = POE_Outcome_Notes__c;
    POE_Current_Internet_Speed__c = POE_Current_Internet_Speed__c;
    POE_Current_Wireless_Customer__c = POE_Current_Wireless_Customer__c;
    POE_Existing_Video__c = POE_Existing_Video__c;
    POE_Contract_Expiration_Date__c = POE_Contract_Expiration_Date__c;
    POE_Outcome__c = POE_Outcome__c;
    POE_Decision_Maker_Name__c = POE_Decision_Maker_Name__c;
    POE_Decision_Maker_Phone__c = POE_Decision_Maker_Phone__c;

    showToast() {
        const event = new ShowToastEvent({
            title: "Success",
            variant: "success",
            message: "Your disposition is saved!"
        });
        this.dispatchEvent(event);
    }

    mapHandler() {
        this[NavigationMixin.Navigate]({
            type: "comm__namedPage",
            attributes: {
                name: "Door_to_door__c"
            }
        });
    }

    getList() {
        this.loaderSpinner = true;
        getTasks({
            recordId: this.recordId
        })
            .then((result) => {
                console.log(result);
                let taskList = [];
                this.hasTasks = result.length > 0;
                result.forEach((item) => {
                    if (!item.hasOwnProperty("Subject")) {
                        item.Subject = "No Subject";
                    }
                    if (!item.hasOwnProperty("Description")) {
                        item.Description = "";
                    }
                    item.url = basePathName + "/task/" + item.Id;
                    taskList.push(item);
                });
                this.tasks = [...taskList];
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error("getTasks ERROR", error);
                this.loaderSpinner = false;
            });
    }

    getRouteOpportunities() {
        getOpportunitiesByWaypointOrder({ opportunityId: this.recordId })
            .then((result) => {
                if (Object.keys(result).length > 1) {
                    this.opportunityRoute = Object.values(result);
                    let waypointTotal = Object.keys(result).length;
                    this.showNavigation = true;
                    this.currentRoutePosition = Number(
                        Object.keys(result).find((key) => result[key].Id === this.recordId)
                    );
                    this.hasNextRoutePosition = this.currentRoutePosition != waypointTotal;
                    this.hasPreviousRoutePosition = this.currentRoutePosition != 1;

                    if (waypointTotal - this.currentRoutePosition > 0 && this.currentRoutePosition !== 1) {
                        this.nextRoutePosition = this.currentRoutePosition + 1;
                        this.previousRoutePosition = this.currentRoutePosition - 1;
                    } else if (waypointTotal - this.currentRoutePosition === 0) {
                        this.nextRoutePosition = 1;
                        this.previousRoutePosition = this.currentRoutePosition - 1;
                    } else {
                        this.nextRoutePosition = 2;
                        this.previousRoutePosition = waypointTotal;
                    }

                    this.routePreviousOpportunity = {
                        id: this.opportunityRoute[this.previousRoutePosition - 1].Id,
                        street:
                            this.opportunityRoute[this.previousRoutePosition - 1].Maps_Street__c === undefined
                                ? ""
                                : this.opportunityRoute[this.previousRoutePosition - 1].Maps_Street__c + ",",
                        city:
                            this.opportunityRoute[this.previousRoutePosition - 1].Maps_City__c === undefined
                                ? ""
                                : this.opportunityRoute[this.previousRoutePosition - 1].Maps_City__c + ",",
                        state:
                            this.opportunityRoute[this.previousRoutePosition - 1].Maps_State__c === undefined
                                ? ""
                                : this.opportunityRoute[this.previousRoutePosition - 1].Maps_State__c + ",",

                        postalCode:
                            this.opportunityRoute[this.previousRoutePosition - 1].Maps_PostalCode__c === undefined
                                ? ""
                                : this.opportunityRoute[this.previousRoutePosition - 1].Maps_PostalCode__c
                    };

                    this.routeNextOpportunity = {
                        id: this.opportunityRoute[this.nextRoutePosition - 1].Id,

                        street:
                            this.opportunityRoute[this.nextRoutePosition - 1].Maps_Street__c === undefined
                                ? ""
                                : this.opportunityRoute[this.nextRoutePosition - 1].Maps_Street__c + ",",

                        city:
                            this.opportunityRoute[this.nextRoutePosition - 1].Maps_City__c === undefined
                                ? ""
                                : this.opportunityRoute[this.nextRoutePosition - 1].Maps_City__c + ",",
                        state:
                            this.opportunityRoute[this.nextRoutePosition - 1].Maps_State__c === undefined
                                ? ""
                                : this.opportunityRoute[this.nextRoutePosition - 1].Maps_State__c + ",",
                        postalCode:
                            this.opportunityRoute[this.nextRoutePosition - 1].Maps_PostalCode__c === undefined
                                ? ""
                                : this.opportunityRoute[this.nextRoutePosition - 1].Maps_PostalCode__c
                    };
                }
            })
            .catch((error) => {
                console.error("getOpportunitiesByWaypointOrder ERROR", error);
            });
    }

    handlePreviousOpportunity() {
        let route = Object.values(this.opportunityRoute);
        let previousOppId = route[this.previousRoutePosition - 1].Id;
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: previousOppId,
                objectApiName: "Opportunity",
                actionName: "view"
            }
        });
    }
    handleNextOpportunity() {
        let route = Object.values(this.opportunityRoute);
        let nextOppId = route[this.nextRoutePosition - 1].Id;
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: nextOppId,
                objectApiName: "Opportunity",
                actionName: "view"
            }
        });
    }

    connectedCallback() {
        this.opportunity = true;
        this.getList();
        this.getRouteOpportunities();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;
                saveACILocation({
                    recordId: this.recordId,
                    latitude: lat,
                    longitude: lon
                })
                    .then((result) => {
                        console.log("Initial ACI Saved");
                    })
                    .catch((error) => {
                        console.error("saveACILocation ERROR", error);
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

    saveInteractions() {
        saveInteraction({
            isMaps: false
        })
            .then((result) => {
                console.log("Interaction Saved");
            })
            .catch((error) => {
                console.log(error);
            });
    }

    getRT() {
        const rtis = this.locationInfo.data.recordTypeInfos;
        return Object.keys(rtis).find((rti) => rtis[rti].name === "TrackingGeoCode");
    }

    getOrigin() {
        return this.isResidential ? "D2D-Disposition" : "Retail-Disposition";
    }

    getGeolocation(withRedirect) {
        var redirect = withRedirect;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.geoCode.latitude = position.coords.latitude;
                this.geoCode.longitude = position.coords.longitude;
                var fields = {
                    RecordTypeId: this.locationRT,
                    POE_GeoCode_Origin__c: redirect ? "MapsPage" : this.origin,
                    POE_GeoCode_Sub_Origin__c: redirect ? "Order Button" : this.selectedOutcome,
                    maps__Latitude__c: this.geoCode.latitude,
                    maps__Longitude__c: this.geoCode.longitude
                };
                const recordInput = { apiName: LOCATION_OBJECT.objectApiName, fields };
                createRecord(recordInput)
                    .then((location) => {
                        console.log("location saved");
                        console.log(location);
                        if (redirect) {
                            this[NavigationMixin.Navigate]({
                                type: "comm__namedPage",
                                attributes: {
                                    name: "Addres_Serviceability_Check__c"
                                },
                                state: {
                                    c__recordId: this.recordId
                                }
                            });
                        }
                    })
                    .catch((error) => {
                        console.log("error saving geoloaction");
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

    createGeoLocationRecord(withRedirect) {
        if (!withRedirect) {
            this.locationRT = this.getRT();
            this.origin = this.getOrigin();
        }
        this.getGeolocation(withRedirect);
    }
}