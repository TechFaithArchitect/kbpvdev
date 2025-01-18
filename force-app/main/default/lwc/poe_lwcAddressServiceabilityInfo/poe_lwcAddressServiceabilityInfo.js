import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getAddressInfo from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveGeoLocalization from "@salesforce/apex/InfoTabController.saveGeoLocalization";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";

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

export default class Poe_lwcAddressServiceabilityInfo extends NavigationMixin(LightningElement) {
    @api recordId;
    @api origin;
    @api newProduct;
    options = [];
    noZip = true;
    address;
    apt;
    building;
    city;
    number;
    floor;
    state;
    zip;
    loaderSpinner;
    profileName;
    userId;
    inProgressEvent;
    inProgressRetail;
    inProgressCallCenter;
    geoRT;
    showDisclaimer = true;
    phone;
    firstName;
    lastName;
    email;
    hasContactInfo;
    aciLatitude;
    aciLongitude;
    program;
    pastOrigin;

    connectedCallback() {
        this.loaderSpinner = true;
        stateNames.forEach((state) => {
            let opt = {
                label: state.name,
                value: state.name
            };
            this.options.push(opt);
        });
        let myData = {
            Id: this.recordId
        };
        getAddressInfo({ myData: myData })
            .then((response) => {
                let result = response.result;
                this.profileName = result.UserProfile;
                this.userId = result.UserId;
                this.geoRT = result.GeoRecordType;
                let opportunity = result.Opportunity;
                let contact = result.Contact;
                if (typeof opportunity === "object") {
                    this.city = opportunity.hasOwnProperty("Maps_City__c") ? opportunity.Maps_City__c : undefined;
                    this.program = opportunity.hasOwnProperty("POE_Program__c")
                        ? opportunity.POE_Program__c
                        : undefined;
                    this.address = opportunity.hasOwnProperty("Maps_Street__c")
                        ? opportunity.Maps_Street__c
                        : undefined;
                    this.apt = opportunity.hasOwnProperty("Maps_Appartment__c")
                        ? opportunity.Maps_Appartment__c
                        : undefined;
                    this.state = opportunity.hasOwnProperty("Maps_State__c") ? opportunity.Maps_State__c : undefined;
                    if (this.state !== undefined && this.state.length === 2) {
                        stateNames.forEach((state) => {
                            if (this.state === state.abbrev) {
                                this.state = state.name;
                            }
                        });
                    }
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
                    this.noZip = this.zip !== undefined && this.zip !== null && this.zip !== "" ? false : true;
                    this.pastOrigin = opportunity.hasOwnProperty("POE_Clicker_Origin__c")
                        ? opportunity.POE_Clicker_Origin__c
                        : undefined;
                    if (this.pastOrigin !== undefined) {
                        const selectedProduct = new CustomEvent("origin", {
                            detail: this.pastOrigin
                        });
                        this.dispatchEvent(selectedProduct);
                    }
                }
                if (typeof contact === "object") {
                    this.hasContactInfo = true;
                    this.email = contact.hasOwnProperty("Email") ? contact.Email : undefined;
                    this.lastName = contact.hasOwnProperty("LastName") ? contact.LastName : undefined;
                    this.firstName = contact.hasOwnProperty("FirstName") ? contact.FirstName : undefined;
                    this.phone = contact.hasOwnProperty("Phone") ? contact.Phone : undefined;
                }
                this.callGeoLocalization(true, {});
                if (this.newProduct) {
                    this.handleClick();
                } else {
                    this.loaderSpinner = false;
                }
                let contactInfo = {
                    hasContactInfo: this.hasContactInfo,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    phone: this.phone,
                    email: this.email
                };
                let data = {
                    record: this.recordId,
                    contact: contactInfo,
                    userId: this.userId,
                    program: this.program
                };
                switch (this.program) {
                    case "Earthlink":
                        const selectedProduct = new CustomEvent("resumeflow", {
                            detail: data
                        });
                        this.dispatchEvent(selectedProduct);
                        break;
                    default:
                        break;
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
            });
    }

    callGeoLocalization(start, data) {
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
                            POE_GeoCode_Sub_Origin__c: start ? "Get Started Button" : "Check Serviceability Button",
                            maps__Latitude__c: latitude,
                            maps__Longitude__c: longitude
                        }
                    };
                    console.log("Save Geolocation request", myData);
                    saveGeoLocalization({ myData: myData })
                        .then((response) => {
                            console.log("Save Geolocation response", response);
                            if (start) {
                                console.log("Geolocalization with Started Button saved");
                            }
                            if (!start) {
                                console.log("Geolocalization saved");
                                this.loaderSpinner = false;
                                const sendProducts = new CustomEvent("saveinfo", {
                                    detail: data
                                });
                                this.dispatchEvent(sendProducts);
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            console.error(error, "ERROR");
                        });
                }
                if (!start) {
                    this.loaderSpinner = false;
                    const sendProducts = new CustomEvent("saveinfo", {
                        detail: data
                    });
                    this.dispatchEvent(sendProducts);
                }
            },
            (e) => {
                this.loaderSpinner = false;
                this.strError = e.message;
                if (!start && e.code == 3) {
                    this.loaderSpinner = false;
                    const sendProducts = new CustomEvent("saveinfo", {
                        detail: data
                    });
                    this.dispatchEvent(sendProducts);
                } else if (!start && e.code == 1) {
                    console.log(e.message);
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "Geolocation is not activated on your Browser"
                    });
                    this.dispatchEvent(event);
                }
            },
            { maximumAge: 60000, timeout: 10000, enableHighAccuracy: false }
        );
    }

    handleChange(event) {
        switch (event.target.name) {
            case "address":
                this.address = event.target.value;
                break;
            case "apt":
                this.apt = event.target.value;
                break;
            case "building":
                this.building = event.target.value;
                break;
            case "city":
                this.city = event.target.value;
                break;
            case "number":
                this.number = event.target.value;
                break;
            case "floor":
                this.floor = event.target.value;
                break;
            case "state":
                this.state = event.target.value;
                break;
            case "zip":
                this.zip = event.target.value;
                this.noZip = this.zip !== undefined && this.zip !== null && this.zip !== "" ? false : true;
                break;
        }
    }

    handleCancel() {
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
    }

    handleClick() {
        this.loaderSpinner = true;
        this.setTrack();
    }

    setTrack() {
        if (this.origin === "retail") {
            let myData = {
                userId: this.userId,
                operation: "setTrack",
                isCount: "true",
                action: "Serviceability Check"
            };
            setClickerRetailTrack({ myData: myData })
                .then((response) => {
                    let trackerId = response.result.inProgressRetail;
                    this.inProgressRetail = trackerId;
                    const sendTrackerEvent = new CustomEvent("clickertrack", {
                        detail: trackerId
                    });
                    this.dispatchEvent(sendTrackerEvent);
                    this.saveInfo();
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "event") {
            let myData = {
                operation: "setTrack",
                isCount: "true",
                action: "Serviceability Check",
                userId: this.userId
            };
            setClickerEventTrack({ myData: myData })
                .then((response) => {
                    let trackerId = response.result.inProgressEvent;
                    this.inProgressEvent = trackerId;
                    const sendTrackerEvent = new CustomEvent("clickertrack", {
                        detail: trackerId
                    });
                    this.dispatchEvent(sendTrackerEvent);
                    this.saveInfo();
                })
                .catch((error) => {
                    console.log(error);
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "phonesales") {
            let myData = {
                userId: this.userId,
                operation: "setTrack",
                isCount: "true",
                action: "Serviceability Check"
            };
            setClickerCallCenterTrack({ myData: myData })
                .then((response) => {
                    let trackerId = response.result.inProgressRetail;
                    this.inProgressRetail = trackerId;
                    const sendTrackerEvent = new CustomEvent("clickertrack", {
                        detail: trackerId
                    });
                    this.dispatchEvent(sendTrackerEvent);
                    this.saveInfo();
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                });
        } else {
            this.saveInfo();
        }
    }

    saveInfo() {
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
            Maps_AptNumber__c: this.number !== undefined ? this.number : null,
            Maps_Building__c: this.building !== undefined ? this.building : null,
            Maps_City__c: this.city !== undefined ? this.city : null,
            Maps_Country__c: "United States",
            Maps_Floor__c: this.floor !== undefined ? this.floor : null,
            Maps_PostalCode__c: this.zip !== undefined ? this.zip : null,
            Maps_State__c: this.state !== undefined ? this.state : null,
            Maps_Street__c: this.address !== undefined ? this.address : null,
            Name: name,
            StageName: "Opportunity",
            Id: this.recordId !== undefined ? this.recordId : null
        };
        let myData = {
            latitude: this.aciLatitude,
            longitude: this.aciLongitude,
            opportunity: info,
            origin: this.origin,
            inProgressEvent: this.inProgressEvent !== undefined ? this.inProgressEvent : null,
            inProgressRetail: this.inProgressRetail !== undefined ? this.inProgressRetail : null,
            contact: true
        };
        console.log("Save opp Address Info request", myData);
        saveOpportunityAddressInformation({ myData: myData })
            .then((response) => {
                console.log("Save opp Address Info response", response);
                let result = response.result;
                let families = [];
                let accountPrograms = "";
                let contactPrograms = "";
                if (
                    result.hasOwnProperty("accountPrograms") &&
                    result.accountPrograms.hasOwnProperty("Account") &&
                    result.accountPrograms.Account.hasOwnProperty("POE_Programs_available__c")
                ) {
                    accountPrograms = result.accountPrograms.Account.POE_Programs_available__c;
                }
                if (
                    result.hasOwnProperty("contactPrograms") &&
                    result.contactPrograms.hasOwnProperty("Contact") &&
                    result.contactPrograms.Contact.hasOwnProperty("POE_Programs_Available__c")
                ) {
                    contactPrograms = result.contactPrograms.Contact.POE_Programs_Available__c;
                }
                if (
                    accountPrograms !== "" &&
                    accountPrograms.includes("DirecTV") &&
                    contactPrograms !== "" &&
                    contactPrograms.includes("DirecTV")
                ) {
                    families.push({
                        program: "DirecTV",
                        speed: "",
                        price: ""
                    });
                }
                if (
                    accountPrograms !== "" &&
                    accountPrograms.includes("Viasat") &&
                    contactPrograms !== "" &&
                    contactPrograms.includes("Viasat")
                ) {
                    families.push({
                        program: "Viasat",
                        speed: "",
                        price: ""
                    });
                }
                if (
                    accountPrograms !== "" &&
                    accountPrograms.includes("Frontier") &&
                    contactPrograms !== "" &&
                    contactPrograms.includes("Frontier")
                ) {
                    families.push({
                        program: "Frontier",
                        speed: "",
                        price: ""
                    });
                }
                if (
                    result.hasOwnProperty("zipCodePrograms") &&
                    result.zipCodePrograms.hasOwnProperty("Programs") &&
                    Array.isArray(result.zipCodePrograms.Programs) &&
                    accountPrograms !== "" &&
                    contactPrograms !== ""
                ) {
                    result.zipCodePrograms.Programs.forEach((progr) => {
                        if (accountPrograms.includes(progr.Program__c) && contactPrograms.includes(progr.Program__c)) {
                            let famData = {
                                program: progr.Program__c,
                                speed: progr.hasOwnProperty("Speed__c") ? progr.Speed__c : "",
                                price: progr.hasOwnProperty("Price__c") ? progr.Price__c : ""
                            };
                            families.push(famData);
                        }
                    });
                }
                let oppId = response.result.opportunityId;
                let contactInfo = {
                    hasContactInfo: this.hasContactInfo,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    phone: this.phone,
                    email: this.email
                };
                let data = {
                    record: oppId,
                    products: families,
                    contact: contactInfo,
                    userId: this.userId
                };
                this.callGeoLocalization(false, data);
            })
            .catch((error) => {
                console.log(error);
                console.error(error, "ERROR");
                this.loaderSpinner = false;
            });
    }
}