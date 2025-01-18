import { LightningElement, api, wire } from "lwc";
import { OmniscriptBaseMixin } from "vlocity_cmt/omniscriptBaseMixin";
import { getNamespaceDotNotation } from "vlocity_cmt/omniscriptInternalUtils";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";

export default class GeoLocalizationTrackerComponent extends OmniscriptBaseMixin(LightningElement) {
    _actionUtil;

    connectedCallback() {
        this._actionUtil = new OmniscriptActionCommonUtil();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let info = JSON.parse(JSON.stringify(this.omniJsonData));
                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;
                let origin = "";
                if (info.userProfile === "System Administrator" || info.userProfile === "Retail Profile") {
                    origin = "ClickerPage";
                    let myData = {
                        maps__Location__c: {
                            RecordTypeId: info.RecordType[0].Id,
                            POE_GeoCode_Origin__c: origin,
                            POE_GeoCode_Sub_Origin__c: "Get Started Button",
                            maps__Latitude__c: latitude,
                            maps__Longitude__c: longitude
                        }
                    };
                    let myData2 = {
                        maps__Location__c: {
                            RecordTypeId: info.RecordType[0].Id,
                            POE_GeoCode_Origin__c: origin,
                            POE_GeoCode_Sub_Origin__c: "Check Serviceability Button",
                            maps__Latitude__c: latitude,
                            maps__Longitude__c: longitude
                        }
                    };
                    this.omniUpdateDataJson(myData2);
                    const options = {};
                    const params = {
                        input: JSON.stringify(myData),
                        sClassName: `vlocity_cmt.IntegrationProcedureService`,
                        sMethodName: "Buyflow_saveGeolocalization",
                        options: JSON.stringify(options)
                    };
                    this._actionUtil
                        .executeAction(params, null, this, null, null)
                        .then((response) => {
                            console.log("Geolocalization with Started Button saved");
                            navigator.geolocation.watchPosition(
                                (pos) => {
                                    var crd = pos.coords;
                                    let myData2 = {
                                        maps__Location__c: {
                                            RecordTypeId: info.RecordType[0].Id,
                                            POE_GeoCode_Origin__c: origin,
                                            POE_GeoCode_Sub_Origin__c: "Check Serviceability Button",
                                            maps__Latitude__c: crd.latitude,
                                            maps__Longitude__c: crd.longitude
                                        }
                                    };
                                    this.omniUpdateDataJson(myData2);
                                },
                                (e) => {
                                    this.strError = e.message;
                                },
                                { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true }
                            );
                        })
                        .catch((error) => {
                            console.error(error, "ERROR");
                        });
                }
            },
            (e) => {
                this.strError = e.message;
            },
            { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true }
        );
    }
}