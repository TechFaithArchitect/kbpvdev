import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { getRecord, createRecord } from "lightning/uiRecordApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import NEGATIVE_OUTCOMES from "@salesforce/label/c.Disposition_Negative_Outcomes";
import LOCATION_OBJECT from "@salesforce/schema/maps__Location__c";

const FIELDS = [
    "Opportunity.POE_Clicker_Origin__c",
    "Opportunity.Maps_PostalCode__c",
    "Opportunity.POE_Outcome__c",
    "Opportunity.POE_FraudObservation__c",
    "Opportunity.StageName"
];

export default class Poe_lwcOpportunityBeginSaleButton extends NavigationMixin(LightningElement) {
    @api recordId;
    zipCode;
    origin;
    outcome;
    loaderSpinner = false;
    disableButton = true;

    @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
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
            this.zipCode = data.fields.Maps_PostalCode__c.value;
            this.origin =
                data.fields.POE_Clicker_Origin__c.value !== null ? data.fields.POE_Clicker_Origin__c.value : "maps";
            this.outcome = data.fields.POE_Outcome__c.value;

            let negativeOutcomeArray = NEGATIVE_OUTCOMES.split(",");
            this.disableButton =
                negativeOutcomeArray.includes(this.outcome) ||
                data.fields.POE_FraudObservation__c.value ||
                data.fields.StageName.value === "Order Created";
        }
    }

    @wire(getObjectInfo, { objectApiName: LOCATION_OBJECT })
    locationInfo;

    getRT() {
        const rtis = this.locationInfo.data.recordTypeInfos;
        return Object.keys(rtis).find((rti) => rtis[rti].name === "TrackingGeoCode");
    }

    handleClick() {
        this.loaderSpinner = true;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let fields = {
                    RecordTypeId: this.getRT(),
                    POE_GeoCode_Origin__c: "Opportunity Record Page",
                    POE_GeoCode_Sub_Origin__c: "Order Button",
                    maps__Latitude__c: position.coords.latitude,
                    maps__Longitude__c: position.coords.longitude
                };
                const recordInput = { apiName: LOCATION_OBJECT.objectApiName, fields };
                createRecord(recordInput)
                    .then((location) => {
                        this.loaderSpinner = false;
                        this[NavigationMixin.Navigate]({
                            type: "comm__namedPage",
                            attributes: {
                                name: "Addres_Serviceability_Check__c"
                            },
                            state: {
                                c__recordId: this.recordId,
                                zipCode: this.zipCode,
                                clickerorigin: this.origin
                            }
                        });
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
}