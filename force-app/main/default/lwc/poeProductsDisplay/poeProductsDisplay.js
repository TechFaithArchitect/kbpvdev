import { LightningElement, api, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getAddressInfoApex from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveGeoLocalization from "@salesforce/apex/InfoTabController.saveGeoLocalization";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import SPECTRUM_SPEED from "@salesforce/label/c.Chuzo_Program_Selection_Spectrum_Speed";
import SPECTRUM_PRICE from "@salesforce/label/c.Chuzo_Program_Selection_Spectrum_Price";
import DTV_PRICE from "@salesforce/label/c.Chuzo_Program_Selection_DIRECTV_Price";
import WINDSTREAM_SPEED from "@salesforce/label/c.Chuzo_Program_Selection_Windstream_Speed";
import WINDSTREAM_PRICE from "@salesforce/label/c.Chuzo_Program_Selection_Windstream_Price";
import FRONTIER_SPEED from "@salesforce/label/c.Chuzo_Program_Selection_Frontier_Speed";
import FRONTIER_PRICE from "@salesforce/label/c.Chuzo_Program_Selection_Frontier_Price";
import VIASAT_SPEED from "@salesforce/label/c.Chuzo_Program_Selection_Viasat_Speed";
import VIASAT_PRICE from "@salesforce/label/c.Chuzo_Program_Selection_Viasat_Price";
import OPTIMUM_SPEED from "@salesforce/label/c.Chuzo_Program_Selection_Optimum_Speed";
import OPTIMUM_PRICE from "@salesforce/label/c.Chuzo_Program_Selection_Optimum_Price";
import EARTHLINK_SPEED from "@salesforce/label/c.Chuzo_Program_Selection_EarthLink_Speed";
import EARTHLINK_PRICE from "@salesforce/label/c.Chuzo_Program_Selection_EarthLink_Price";

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

export default class poeProductsDisplay extends NavigationMixin(LightningElement) {
    @api recordId;
    @api newProduct;
    @api programs;
    @api origin;
    @api zipCode;
    @api provider;
    @api urlInfo;
    @api isGuestUser;
    @api referralCodeData;
    availablePrograms = [];
    unavailablePrograms = [];
    blacklistedPrograms = [];
    tvimages = [];
    hasProducts = false;
    options = [];
    noZip = this.zipCode ? false : true;
    zip;
    loaderSpinner;
    userId;
    address;
    apt;
    building;
    city;
    number;
    floor;
    state;
    opportunityId;
    inProgressEvent;
    inProgressRetail;
    inProgressCallCenter;
    geoRT;
    showDisclaimer = true;
    phone;
    firstName;
    lastName;
    email;
    hasContactInfo = false;
    aciLatitude;
    aciLongitude;
    program;
    pastOrigin;
    isNationalRetail = false;
    isOwner = false;
    FFLCode;
    NFFLCode;
    pricesDisclaimer = "* Speeds and pricing may vary by location and promotions and are subject to change";
    serviceDisclaimer =
        "** Please note service availability on this page is a high-level check verifying if the product is available within the zip code entered, serviceability at the household will need to be validated by entering the full address in the subsequent steps of the buy flow.";
    showSpectrumAPI = false;
    partnersQuantity;

    get dynamicColor() {
        let style = this.isGuestUser
            ? `background-color:white;padding: 0 !important;max-height:100%`
            : `background-color:#f7f5fa`;
        return style;
    }

    connectedCallback() {
        this.loaderSpinner = true;
        stateNames.forEach((state) => {
            let opt = {
                label: state.name,
                value: state.name
            };
            this.options.push(opt);
        });
        if (!this.isGuestUser) {
            this.callGeoLocalization();
        } else {
            this.saveInfo(this.zip);
            this.saveSelfServiceStatistic();
        }
    }

    getAddressInfo() {
        let myData = {
            Id: this.recordId !== undefined ? this.recordId : this.opportunityId
        };
        getAddressInfoApex({ myData: myData })
            .then((response) => {
                console.log("Get Address Info Response", response);
                let result = response.result;
                this.userId = result.UserId;
                this.geoRT = result.GeoRecordType;
                this.isOwner = result.IsOwner;
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
                    this.apt =
                        opportunity.hasOwnProperty("Maps_Appartment__c") &&
                        !opportunity.Maps_Appartment__c.includes("null")
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
                    this.email = contact.hasOwnProperty("PersonEmail") ? contact.PersonEmail : undefined;
                    this.lastName = contact.hasOwnProperty("LastName") ? contact.LastName : undefined;
                    this.firstName = contact.hasOwnProperty("FirstName") ? contact.FirstName : undefined;
                    this.phone = contact.hasOwnProperty("Phone") ? contact.Phone : undefined;
                }
                let contactInfo = {
                    hasContactInfo: this.hasContactInfo,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    phone: this.phone,
                    email: this.email
                };
                let data = {
                    record: this.opportunityId,
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
                if (this.origin !== "maps" && this.zipCode !== undefined) {
                    this.zip = this.zipCode;
                }
                let contactInformation = {
                    hasContactInfo: this.hasContactInfo,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    phone: this.phone,
                    email: this.email
                };
                let info = {
                    record: this.opportunityId,
                    products: this.programs,
                    contact: contactInformation,
                    userId: this.userId
                };
                const sendProducts = new CustomEvent("saveinfo", {
                    detail: info
                });
                this.dispatchEvent(sendProducts);
                if (!this.isGuestUser) {
                    this.setTrack();
                } else {
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
            });
    }

    handleProductsDisplay(zipCodePrograms, blacklistedPrograms) {
        let info = JSON.parse(JSON.stringify(this.programs));
        if (
            !this.isGuestUser &&
            zipCodePrograms.includes("Altice") &&
            (blacklistedPrograms === "" || (blacklistedPrograms !== "" && !blacklistedPrograms.includes("Altice")))
        ) {
            let alticeInfo = [...info.filter((item) => item.program === "Altice")];
            if (alticeInfo.length > 0) {
                let altice = {
                    id: "Altice",
                    src: "/poe/sfsites/c/resource/POE_alticeIMG",
                    order: 2,
                    product: "Altice",
                    speed:
                        alticeInfo[0].speed !== undefined && alticeInfo[0].speed !== null && alticeInfo[0].speed !== ""
                            ? "Speeds up to " + alticeInfo[0].speed + " Mbps."
                            : OPTIMUM_SPEED,
                    price:
                        alticeInfo[0].price !== undefined && alticeInfo[0].price !== null && alticeInfo[0].price !== ""
                            ? "Prices starting at $" + Number(alticeInfo[0].price).toFixed(2) + "."
                            : OPTIMUM_PRICE,
                    class: "none"
                };
                this.availablePrograms.push(altice);
            } else if (!this.isGuestUser) {
                let altice = {
                    id: "Altice",
                    src: "/poe/sfsites/c/resource/POE_alticeIMG",
                    order: 2,
                    product: "Altice",
                    price: "Please contact PerfectVision to add this partner.",
                    class: "disabled"
                };
                this.unavailablePrograms.push(altice);
            }
        }
        if (
            (zipCodePrograms.includes("Charter") || zipCodePrograms.includes("Spectrum API")) &&
            (blacklistedPrograms === "" ||
                (blacklistedPrograms !== "" &&
                    !blacklistedPrograms.includes("Charter") &&
                    !blacklistedPrograms.includes("Spectrum API")))
        ) {
            let programName = this.showSpectrumAPI ? "Spectrum API" : "Charter";
            let spectrumInfo = [...info.filter((item) => item.program === programName)];
            if (spectrumInfo.length > 0) {
                let spectrum = {
                    id: programName,
                    src: "/poe/sfsites/c/resource/POE_chIMG",
                    order: 2,
                    product: spectrumInfo[0].program,
                    speed:
                        spectrumInfo[0].speed !== undefined &&
                        spectrumInfo[0].speed !== null &&
                        spectrumInfo[0].speed !== ""
                            ? `${"Speeds up to " + spectrumInfo[0].speed + " Mbps."}`
                            : SPECTRUM_SPEED,
                    price:
                        spectrumInfo[0].price !== undefined &&
                        spectrumInfo[0].price !== null &&
                        spectrumInfo[0].price !== ""
                            ? `${"Prices starting at $" + Number(spectrumInfo[0].price).toFixed(2) + "."}`
                            : SPECTRUM_PRICE,
                    class: "none"
                };
                this.availablePrograms.push(spectrum);
            } else if (!this.isGuestUser) {
                let spectrum = {
                    id: programName,
                    src: "/poe/sfsites/c/resource/POE_chIMG",
                    order: 2,
                    product: programName,
                    price: "Please contact PerfectVision to add this partner.",
                    class: "disabled"
                };
                this.unavailablePrograms.push(spectrum);
            }
        }
        if (blacklistedPrograms === "" || (blacklistedPrograms !== "" && !blacklistedPrograms.includes("DirecTV"))) {
            let dtvInfo = [...info.filter((item) => item.program === "DirecTV")];
            if (dtvInfo.length > 0) {
                let dtv = {
                    id: "DirecTV",
                    src: "/poe/sfsites/c/resource/POE_dtvIMG",
                    order: 1,
                    product: dtvInfo[0].program,
                    speed:
                        dtvInfo[0].speed !== undefined && dtvInfo[0].speed !== null && dtvInfo[0].speed !== ""
                            ? `${"Speeds up to " + dtvInfo[0].speed + " Mbps."}`
                            : ``,
                    price:
                        dtvInfo[0].price !== undefined && dtvInfo[0].price !== null && dtvInfo[0].price !== ""
                            ? `${"Prices starting at $" + Number(dtvInfo[0].price).toFixed(2) + "."}`
                            : DTV_PRICE,
                    class: "none"
                };
                this.availablePrograms.push(dtv);
            } else if (!this.isGuestUser) {
                let dtv = {
                    id: "DirecTV",
                    src: "/poe/sfsites/c/resource/POE_dtvIMG",
                    order: 1,
                    product: "DirecTV",
                    price: "Please contact PerfectVision to add this partner.",
                    class: "disabled"
                };
                this.unavailablePrograms.push(dtv);
            }
        }
        if (
            zipCodePrograms.includes("EarthLink") &&
            (blacklistedPrograms === "" || (blacklistedPrograms !== "" && !blacklistedPrograms.includes("EarthLink")))
        ) {
            let earthLinkInfo = [...info.filter((item) => item.program === "EarthLink")];
            if (earthLinkInfo.length > 0) {
                let earthLink = {
                    id: "EarthLink",
                    src: "/poe/sfsites/c/resource/POE_elIMG",
                    order: 3,
                    product: earthLinkInfo[0].program,
                    speed:
                        earthLinkInfo[0].speed !== undefined &&
                        earthLinkInfo[0].speed !== null &&
                        earthLinkInfo[0].speed !== ""
                            ? `${"Speeds up to " + earthLinkInfo[0].speed + " Mbps."}`
                            : EARTHLINK_SPEED,
                    price:
                        earthLinkInfo[0].price !== undefined &&
                        earthLinkInfo[0].price !== null &&
                        earthLinkInfo[0].price !== ""
                            ? `${"Prices starting at $" + Number(earthLinkInfo[0].price).toFixed(2) + "."}`
                            : EARTHLINK_PRICE,
                    class: "none"
                };
                this.availablePrograms.push(earthLink);
            } else if (!this.isGuestUser) {
                let earthLink = {
                    id: "EarthLink",
                    src: "/poe/sfsites/c/resource/POE_elIMG",
                    order: 3,
                    product: "EarthLink",
                    price: "Please contact PerfectVision to add this partner.",
                    class: "disabled"
                };
                this.unavailablePrograms.push(earthLink);
            }
        }
        if (
            zipCodePrograms.includes("Windstream") &&
            (blacklistedPrograms === "" || (blacklistedPrograms !== "" && !blacklistedPrograms.includes("Windstream")))
        ) {
            let windstreamInfo = [...info.filter((item) => item.program === "Windstream")];
            if (windstreamInfo.length > 0) {
                let windstream = {
                    id: "Windstream",
                    src: "/poe/sfsites/c/resource/POE_wiIMG",
                    order: 4,
                    product: windstreamInfo[0].program,
                    speed:
                        windstreamInfo[0].speed !== undefined &&
                        windstreamInfo[0].speed !== null &&
                        windstreamInfo[0].speed !== ""
                            ? `${"Speeds up to " + windstreamInfo[0].speed + " Mbps."}`
                            : WINDSTREAM_SPEED,
                    price:
                        windstreamInfo[0].price !== undefined &&
                        windstreamInfo[0].price !== null &&
                        windstreamInfo[0].price !== ""
                            ? `${
                                  this.isGuestUser
                                      ? `$${Number(windstreamInfo[0].price).toFixed(2)}`
                                      : "Prices starting at $" + Number(windstreamInfo[0].price).toFixed(2) + "."
                              }`
                            : WINDSTREAM_PRICE,

                    class: "none"
                };
                this.availablePrograms.push(windstream);
            } else if (!this.isGuestUser) {
                let windstream = {
                    id: "Windstream",
                    src: "/poe/sfsites/c/resource/POE_wiIMG",
                    order: 4,
                    product: "Windstream",
                    price: "Please contact PerfectVision to add this partner.",
                    class: "disabled"
                };
                this.unavailablePrograms.push(windstream);
            }
        }
        if (
            zipCodePrograms.includes("Frontier") &&
            (blacklistedPrograms === "" || (blacklistedPrograms !== "" && !blacklistedPrograms.includes("Frontier")))
        ) {
            let frontierInfo = [...info.filter((item) => item.program === "Frontier")];
            if (frontierInfo.length > 0) {
                let frontier = {
                    id: "Frontier",
                    src: "/poe/sfsites/c/resource/POE_froIMG",
                    order: 4,
                    product: frontierInfo[0].program,
                    speed:
                        frontierInfo[0].speed !== undefined &&
                        frontierInfo[0].speed !== null &&
                        frontierInfo[0].speed !== ""
                            ? `${"Speeds up to " + frontierInfo[0].speed + " Mbps."}`
                            : FRONTIER_SPEED,
                    price:
                        frontierInfo[0].price !== undefined &&
                        frontierInfo[0].price !== null &&
                        frontierInfo[0].price !== ""
                            ? `${"Prices starting at $" + Number(frontierInfo[0].price).toFixed(2) + "."}`
                            : FRONTIER_PRICE,
                    class: "none"
                };
                this.availablePrograms.push(frontier);
            } else if (!this.isGuestUser) {
                // let frontier = {
                //     id: "Frontier",
                //     src: "/poe/sfsites/c/resource/POE_froIMG",
                //     order: 4,
                //     product: "Frontier",
                //     price: "Please contact PerfectVision to add this partner.",
                //     class: "disabled"
                // };
                // this.unavailablePrograms.push(frontier);
            }
        }
        if (blacklistedPrograms === "" || (blacklistedPrograms !== "" && !blacklistedPrograms.includes("Viasat"))) {
            let viasatInfo = [...info.filter((item) => item.program === "Viasat")];
            if (viasatInfo.length > 0) {
                let viasat = {
                    id: "Viasat",
                    src: "/poe/sfsites/c/resource/POE_viIMG",
                    order: 4,
                    product: viasatInfo[0].program,
                    speed:
                        viasatInfo[0].speed !== undefined && viasatInfo[0].speed !== null && viasatInfo[0].speed !== ""
                            ? `${"Speeds up to " + viasatInfo[0].speed + " Mbps."}`
                            : VIASAT_SPEED,
                    price:
                        viasatInfo[0].price !== undefined && viasatInfo[0].price !== null && viasatInfo[0].price !== ""
                            ? `${"Prices starting at $" + Number(viasatInfo[0].price).toFixed(2) + "."}`
                            : VIASAT_PRICE,
                    class: "none"
                };
                this.availablePrograms.push(viasat);
            } else if (!this.isGuestUser) {
                let viasat = {
                    id: "Viasat",
                    src: "/poe/sfsites/c/resource/POE_viIMG",
                    order: 4,
                    product: "Viasat",
                    price: "Please contact PerfectVision to add this partner.",
                    class: "disabled"
                };
                this.unavailablePrograms.push(viasat);
            }
        }
        this.availablePrograms.sort((a, b) => a.order - b.order);
        if (this.isGuestUser) {
            this.availablePrograms.forEach((item) => {
                item.src = item.src.replace("/poe", "/selfService");
                item.hasSpeed = item.speed !== "";
            });
            this.partnersQuantity = this.availablePrograms.length;
        }
        this.unavailablePrograms.sort((a, b) => a.order - b.order);
        if (!this.hasProducts) {
            this.saveInfo(this.zip, false);
        }
        this.hasProducts = true;
        this.getAddressInfo();
    }

    callGeoLocalization() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;
                this.aciLatitude = latitude;
                this.aciLongitude = longitude;
                this.saveInfo(this.zip);
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
                }
            },
            { maximumAge: 60000, timeout: 10000, enableHighAccuracy: false }
        );
    }

    setTrack() {
        if (this.origin === "retail") {
            let myData = {
                userId: this.userId,
                operation: "setTrack",
                isCount: true,
                action: "Serviceability Check"
            };
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
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "event") {
            let myData = {
                operation: "setTrack",
                isCount: true,
                action: "Serviceability Check",
                userId: this.userId
            };
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
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "phonesales") {
            let myData = {
                userId: this.userId,
                operation: "setTrack",
                isCount: true,
                action: "Serviceability Check"
            };
            setClickerCallCenterTrack({ myData: myData })
                .then((response) => {
                    console.log("call center track", response);
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
                    this.loaderSpinner = false;
                });
        } else {
            this.loaderSpinner = false;
        }
    }

    saveInfo(zip, handleProductsDisplay = true) {
        if (this.recordId !== undefined && this.zipCode === undefined) {
            this.getZipCode();
            return;
        }
        let name;
        if (this.isGuestUser) {
            name = "Self Service Opportunity";
        } else {
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
        }
        let info = {
            Maps_Country__c: "United States",
            Maps_PostalCode__c: zip === undefined ? this.zipCode : zip,
            Maps_Street__c: this.isGuestUser ? "" : this.urlInfo.address.addressLine1,
            Maps_Appartment__c: this.isGuestUser ? "" : this.urlInfo.address.addressLine2,
            Maps_State__c: this.isGuestUser ? "" : this.urlInfo.address.state,
            Maps_City__c: this.isGuestUser ? "" : this.urlInfo.address.city,
            External_Agent_Id__c: this.isGuestUser ? "" : this.urlInfo.externalAgentId,
            External_Session_Id__c: this.isGuestUser ? "" : this.urlInfo.externalSessionId,
            Name: name,
            StageName: "Opportunity",
            Id: this.recordId !== undefined ? this.recordId : this.opportunityId,
            Available_Programs__c: this.getAvailableProgramsAsText()
        };
        this.isGuestUser && !!this.referralCodeData ? (info.referralCodeId = this.referralCodeData.Id) : undefined;

        let myData = {
            latitude: this.isGuestUser ? 0.0 : this.aciLatitude,
            longitude: this.isGuestUser ? 0.0 : this.aciLongitude,
            opportunity: info,
            origin: this.isGuestUser ? "Self Service" : this.origin,
            inProgressEvent: this.inProgressEvent !== undefined ? this.inProgressEvent : null,
            inProgressRetail: this.inProgressRetail !== undefined ? this.inProgressRetail : null,
            contact: true
        };
        console.log("Save Opportunity Data", myData);
        saveOpportunityAddressInformation({ myData: myData })
            .then((response) => {
                console.log("Save Opportunity Data Response", response);
                let result = response.result;
                let families = [];
                let accountPrograms = "";
                let contactPrograms = "";
                let blacklistedPrograms = "";
                let zipCodePrograms = [];
                if (
                    result.hasOwnProperty("accountPrograms") &&
                    result.accountPrograms.hasOwnProperty("Account") &&
                    result.accountPrograms.Account.hasOwnProperty("POE_Programs_available__c")
                ) {
                    accountPrograms = result.accountPrograms.Account.POE_Programs_available__c;
                }
                if (result.hasOwnProperty("contactPrograms") && result.contactPrograms.hasOwnProperty("Contact")) {
                    if (
                        this.origin == "phonesales" &&
                        result.contactPrograms.Contact.hasOwnProperty("POE_Programs_Available__c")
                    ) {
                        contactPrograms = result.contactPrograms.Contact.POE_Programs_Available__c;
                    }
                    if (
                        this.origin == "event" &&
                        result.contactPrograms.Contact.hasOwnProperty("POE_Event_Programs__c")
                    ) {
                        contactPrograms = result.contactPrograms.Contact.POE_Event_Programs__c;
                    }
                    if (
                        this.origin == "retail" &&
                        result.contactPrograms.Contact.hasOwnProperty("POE_Retail_Programs__c")
                    ) {
                        contactPrograms = result.contactPrograms.Contact.POE_Retail_Programs__c;
                    }
                    if (this.origin == "maps" && result.contactPrograms.Contact.hasOwnProperty("D2D_Programs__c")) {
                        contactPrograms = result.contactPrograms.Contact.D2D_Programs__c;
                    }
                    if (result.contactPrograms.Contact.hasOwnProperty("POE_Blacklisted_Programs__c")) {
                        blacklistedPrograms = result.contactPrograms.Contact.POE_Blacklisted_Programs__c;
                    }
                }

                this.showSpectrumAPI =
                    this.isGuestUser ||
                    (contactPrograms.includes("Spectrum API") &&
                        (blacklistedPrograms === "" ||
                            (blacklistedPrograms !== "" && !blacklistedPrograms.includes("Spectrum API"))));

                if (
                    this.isGuestUser ||
                    (accountPrograms !== "" &&
                        accountPrograms.includes("DirecTV") &&
                        contactPrograms !== "" &&
                        contactPrograms.includes("DirecTV") &&
                        (blacklistedPrograms === "" ||
                            (blacklistedPrograms !== "" && !blacklistedPrograms.includes("DirecTV"))))
                ) {
                    families.push({
                        program: "DirecTV",
                        speed: "",
                        price: ""
                    });
                }
                if (
                    this.isGuestUser ||
                    (accountPrograms !== "" &&
                        accountPrograms.includes("Viasat") &&
                        contactPrograms !== "" &&
                        contactPrograms.includes("Viasat") &&
                        (blacklistedPrograms === "" ||
                            (blacklistedPrograms !== "" && !blacklistedPrograms.includes("Viasat"))))
                ) {
                    families.push({
                        program: "Viasat",
                        speed: "",
                        price: ""
                    });
                }
                if (
                    this.isGuestUser ||
                    (accountPrograms !== "" &&
                        accountPrograms.includes("Frontier") &&
                        contactPrograms !== "" &&
                        contactPrograms.includes("Frontier") &&
                        (blacklistedPrograms === "" ||
                            (blacklistedPrograms !== "" && !blacklistedPrograms.includes("Frontier"))))
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
                    Array.isArray(result.zipCodePrograms.Programs)
                ) {
                    result.zipCodePrograms.Programs.forEach((progr) => {
                        let programName =
                            (this.showSpectrumAPI && progr.Program__c) == "Charter" ? "Spectrum API" : progr.Program__c;
                        if (
                            this.isGuestUser ||
                            (accountPrograms.includes(programName) && contactPrograms.includes(programName))
                        ) {
                            let famData = {
                                program: programName,
                                speed: progr.hasOwnProperty("Speed__c") ? progr.Speed__c : "",
                                price: progr.hasOwnProperty("Price__c") ? progr.Price__c : ""
                            };
                            families.push(famData);
                        }
                        if (
                            this.isGuestUser ||
                            blacklistedPrograms === "" ||
                            (blacklistedPrograms !== "" && !blacklistedPrograms.includes(programName))
                        ) {
                            zipCodePrograms.push(programName);
                        }
                    });
                }
                this.programs = families;
                this.opportunityId = response.result.opportunityId;
                if (this.provider != undefined) {
                    getAddressInfoApex({ myData: myData })
                        .then((response) => {
                            console.log("Get Address Info", response);
                            let info = {
                                isProviderEnabled:
                                    this.programs.findIndex((p) => p.program.toLowerCase() == this.provider) != -1,
                                isNationalRetail: this.isNationalRetail,
                                FFLCode: this.FFLCode,
                                NFFLCode: this.NFFLCode,
                                program: this.provider,
                                recordId: this.opportunityId,
                                userId: response.result.UserId
                            };
                            const selectedProduct = new CustomEvent("programselection", {
                                detail: info
                            });
                            this.dispatchEvent(selectedProduct);
                        })
                        .catch((error) => {
                            this.loaderSpinner = false;
                            console.log(error);
                        });
                } else if (handleProductsDisplay) {
                    this.handleProductsDisplay(zipCodePrograms, blacklistedPrograms);
                }
            })
            .catch((error) => {
                console.log(error);
                console.error(error, "ERROR");
                this.loaderSpinner = false;
            });
    }

    getZipCode() {
        let myData = {
            Id: this.recordId
        };
        getAddressInfoApex({ myData: myData })
            .then((response) => {
                console.log("ZipCodeResponse", response);
                let result = response.result;
                let opportunity = result.Opportunity;
                if (typeof opportunity === "object") {
                    this.zip = opportunity.hasOwnProperty("Maps_PostalCode__c")
                        ? opportunity.Maps_PostalCode__c
                        : undefined;
                    const updateZipCode = new CustomEvent("zipcode", {
                        detail: this.zip
                    });
                    this.dispatchEvent(updateZipCode);
                }
                this.saveInfo(this.zip);
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
            });
    }

    startBuyflow(event) {
        if (event.target.name !== "Other") {
            let img = this.template.querySelector(`[name='${event.target.name}']`);
            if (img.classList.contains("disabled")) {
                return;
            }
        }
        let info = {
            program: event.target.name,
            isNationalRetail: this.isNationalRetail,
            NFFLCode: this.NFFLCode,
            FFLCode: this.FFLCode
        };
        const selectedProduct = new CustomEvent("programselection", {
            detail: info
        });
        this.dispatchEvent(selectedProduct);
    }

    handlePrevious() {
        if (this.isGuestUser) {
            const goBackEvent = new CustomEvent("home", {
                detail: ""
            });
            this.dispatchEvent(goBackEvent);
        } else {
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
    }

    handleCreateCase(event) {
        this[NavigationMixin.Navigate]({
            type: "comm__namedPage",
            attributes: {
                name: "create_case__c"
            }
        });
    }

    getAvailableProgramsAsText() {
        let availableProgramsText = "";
        this.availablePrograms.forEach((program) => {
            let programName = program.id;
            switch (programName) {
                case "DirecTV":
                    programName = "DIRECTV";
                    break;
                case "Altice":
                    programName = "Optimum";
                    break;
                case "Charter":
                    programName = "Spectrum";
                    break;
                case "Spectrum API":
                    programName = "Spectrum";
                    break;
            }
            if (!availableProgramsText.includes(programName)) {
                availableProgramsText = `${availableProgramsText};${programName}`;
            }
        });

        return availableProgramsText.substring(1);
    }

    saveSelfServiceStatistic() {
        const event = new CustomEvent("selfservicestatistic", {
            detail: {
                tabName: "Products Display"
            }
        });
        this.dispatchEvent(event);
    }
}