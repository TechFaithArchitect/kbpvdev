import { LightningElement, api, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";
import chuzo_modalContactUs from "c/chuzo_modalContactUs";
import chuzo_modalScheduleCall from "c/chuzo_modalScheduleCall";
import getAddressInfoApex from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import TAB_TITLE from "@salesforce/label/c.Self_Service_Program_Selection_Title";
import TAB_SUBTITLE from "@salesforce/label/c.Self_Service_Program_Selection_Sub_Title";
import ALL_TAB from "@salesforce/label/c.Self_Service_Program_Selection_All_Tab";
import TV_TAB from "@salesforce/label/c.Self_Service_Program_Selection_TV_Tab";
import INTERNET_TAB from "@salesforce/label/c.Self_Service_Program_Selection_Internet_Tab";
import SECURITY_TAB from "@salesforce/label/c.Self_Service_Program_Selection_Security_Tab";
import PRICE_DISCLAIMER from "@salesforce/label/c.Self_Service_Program_Selection_Price_Disclaimer";
import SERVICE_DISCLAIMER from "@salesforce/label/c.Self_Service_Program_Selection_Service_Disclaimer";
import DETAIL_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_Detail_Header";
import DETAIL_HEADER_2 from "@salesforce/label/c.Self_Service_Program_Selection_Detail_Header_2";
import ORDER_BUTTON from "@salesforce/label/c.Self_Service_Program_Selection_Order_Button";
import CONTACT_BUTTON from "@salesforce/label/c.Self_Service_Program_Selection_Contact_Button";
import EARTHLINK_NAME from "@salesforce/label/c.Self_Service_Program_Selection_EarthLink_Name";
import EARTHLINK_CATEGORY from "@salesforce/label/c.Self_Service_Program_Selection_EarthLink_Category";
import EARTHLINK_ONE_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_EarthLink_Char_One_Header";
import EARTHLINK_ONE_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_EarthLink_Char_One_Value";
import EARTHLINK_TWO_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_EarthLink_Char_Two_Header";
import EARTHLINK_TWO_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_EarthLink_Char_Two_Value";
import EARTHLINK_DISCLAIMER from "@salesforce/label/c.Self_Service_Program_Selection_EarthLink_Disclaimer";
import EARTHLINK_INCLUDED from "@salesforce/label/c.Self_Service_Program_Selection_EarthLink_Included";
import EARTHLINK_DETAILS from "@salesforce/label/c.Self_Service_Program_Selection_EarthLink_Details";
import EARTHLINK_SHOW from "@salesforce/label/c.Self_Service_Program_Selection_EarthLink_Show";
import DIRECTV_NAME from "@salesforce/label/c.Self_Service_Program_Selection_DIRECTV_Name";
import DIRECTV_CATEGORY from "@salesforce/label/c.Self_Service_Program_Selection_DIRECTV_Category";
import DIRECTV_ONE_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_DIRECTV_Char_One_Header";
import DIRECTV_ONE_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_DIRECTV_Char_One_Value";
import DIRECTV_TWO_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_DIRECTV_Char_Two_Header";
import DIRECTV_TWO_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_DIRECTV_Char_Two_Value";
import DIRECTV_DISCLAIMER from "@salesforce/label/c.Self_Service_Program_Selection_DIRECTV_Disclaimer";
import DIRECTV_INCLUDED from "@salesforce/label/c.Self_Service_Program_Selection_DIRECTV_Included";
import DIRECTV_DETAILS from "@salesforce/label/c.Self_Service_Program_Selection_DIRECTV_Details";
import DIRECTV_SHOW from "@salesforce/label/c.Self_Service_Program_Selection_DIRECTV_Show";
import FRONTIER_NAME from "@salesforce/label/c.Self_Service_Program_Selection_Frontier_Name";
import FRONTIER_CATEGORY from "@salesforce/label/c.Self_Service_Program_Selection_Frontier_Category";
import FRONTIER_ONE_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_Frontier_Char_One_Header";
import FRONTIER_ONE_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_Frontier_Char_One_Value";
import FRONTIER_TWO_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_Frontier_Char_Two_Header";
import FRONTIER_TWO_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_Frontier_Char_Two_Value";
import FRONTIER_DISCLAIMER from "@salesforce/label/c.Self_Service_Program_Selection_Frontier_Disclaimer";
import FRONTIER_INCLUDED from "@salesforce/label/c.Self_Service_Program_Selection_Frontier_Included";
import FRONTIER_DETAILS from "@salesforce/label/c.Self_Service_Program_Selection_Frontier_Details";
import FRONTIER_SHOW from "@salesforce/label/c.Self_Service_Program_Selection_Frontier_Show";
import WINDSTREAM_NAME from "@salesforce/label/c.Self_Service_Program_Selection_Windstream_Name";
import WINDSTREAM_CATEGORY from "@salesforce/label/c.Self_Service_Program_Selection_Windstream_Category";
import WINDSTREAM_ONE_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_Windstream_Char_One_Header";
import WINDSTREAM_ONE_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_Windstream_Char_One_Value";
import WINDSTREAM_TWO_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_Windstream_Char_Two_Header";
import WINDSTREAM_TWO_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_Windstream_Char_Two_Value";
import WINDSTREAM_DISCLAIMER from "@salesforce/label/c.Self_Service_Program_Selection_Windstream_Disclaimer";
import WINDSTREAM_INCLUDED from "@salesforce/label/c.Self_Service_Program_Selection_Windstream_Included";
import WINDSTREAM_DETAILS from "@salesforce/label/c.Self_Service_Program_Selection_Windstream_Details";
import WINDSTREAM_SHOW from "@salesforce/label/c.Self_Service_Program_Selection_Windstream_Show";
import SPECTRUM_NAME from "@salesforce/label/c.Self_Service_Program_Selection_Spectrum_Name";
import SPECTRUM_CATEGORY from "@salesforce/label/c.Self_Service_Program_Selection_Spectrum_Category";
import SPECTRUM_ONE_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_Spectrum_Char_One_Header";
import SPECTRUM_ONE_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_Spectrum_Char_One_Value";
import SPECTRUM_TWO_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_Spectrum_Char_Two_Header";
import SPECTRUM_TWO_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_Spectrum_Char_Two_Value";
import SPECTRUM_DISCLAIMER from "@salesforce/label/c.Self_Service_Program_Selection_Spectrum_Disclaimer";
import SPECTRUM_INCLUDED from "@salesforce/label/c.Self_Service_Program_Selection_Spectrum_Included";
import SPECTRUM_DETAILS from "@salesforce/label/c.Self_Service_Program_Selection_Spectrum_Details";
import SPECTRUM_SHOW from "@salesforce/label/c.Self_Service_Program_Selection_Spectrum_Show";
import OPTIMUM_NAME from "@salesforce/label/c.Self_Service_Program_Selection_Optimum_Name";
import OPTIMUM_CATEGORY from "@salesforce/label/c.Self_Service_Program_Selection_Optimum_Category";
import OPTIMUM_ONE_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_Optimum_Char_One_Header";
import OPTIMUM_ONE_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_Optimum_Char_One_Value";
import OPTIMUM_TWO_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_Optimum_Char_Two_Header";
import OPTIMUM_TWO_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_Optimum_Char_Two_Value";
import OPTIMUM_DISCLAIMER from "@salesforce/label/c.Self_Service_Program_Selection_Optimum_Disclaimer";
import OPTIMUM_INCLUDED from "@salesforce/label/c.Self_Service_Program_Selection_Optimum_Included";
import OPTIMUM_DETAILS from "@salesforce/label/c.Self_Service_Program_Selection_Optimum_Details";
import OPTIMUM_SHOW from "@salesforce/label/c.Self_Service_Program_Selection_Optimum_Show";
import HOUSE_CONCIERGE_NAME from "@salesforce/label/c.Self_Service_Program_Selection_House_Concierge_Name";
import HOUSE_CONCIERGE_CATEGORY from "@salesforce/label/c.Self_Service_Program_Selection_House_Concierge_Category";
import HOUSE_CONCIERGE_DISCLAIMER from "@salesforce/label/c.Self_Service_Program_Selection_House_Concierge_Disclaimer";
import HOUSE_CONCIERGE_ONE_HEADER from "@salesforce/label/c.Self_Service_Program_Selection_House_Concierge_Char_One_Header";
import HOUSE_CONCIERGE_ONE_VALUE from "@salesforce/label/c.Self_Service_Program_Selection_House_Concierge_Char_One_Value";
import HOUSE_CONCIERGE_INCLUDED from "@salesforce/label/c.Self_Service_Program_Selection_House_Concierge_Included";
import HOUSE_CONCIERGE_DETAILS from "@salesforce/label/c.Self_Service_Program_Selection_House_Concierge_Details";
import HOUSE_CONCIERGE_SHOW from "@salesforce/label/c.Self_Service_Program_Selection_House_Concierge_Show";

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

export default class Poe_lwcSelfServiceProductsDisplay extends NavigationMixin(LightningElement) {
    @api recordId;
    @api newProduct;
    @api programs;
    @api origin;
    @api zipCode;
    @api provider;
    @api urlInfo;
    @api isGuestUser;
    @api referralCodeData;
    @api selfServiceAddress;
    @api isMobile;
    availablePrograms = [];
    allPrograms = [];
    tvPrograms = [];
    internetPrograms = [];
    securityPrograms = [];
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
    partnersQuantity;
    partners = [];
    labels = {
        title: TAB_TITLE,
        subTitle: TAB_SUBTITLE,
        allTab: ALL_TAB,
        internetTab: INTERNET_TAB,
        tvTab: TV_TAB,
        securityTab: SECURITY_TAB,
        pricesDisclaimer: PRICE_DISCLAIMER,
        serviceDisclaimer: SERVICE_DISCLAIMER,
        programDetailHeader: DETAIL_HEADER,
        programDetailHeader2: DETAIL_HEADER_2,
        orderButtonLabel: ORDER_BUTTON,
        contactButtonLabel: CONTACT_BUTTON,
        earthlink: {
            name: EARTHLINK_NAME,
            category: EARTHLINK_CATEGORY,
            characteristicOneHeader: EARTHLINK_ONE_HEADER,
            characteristicOneValue: EARTHLINK_ONE_VALUE,
            characteristicTwoHeader: EARTHLINK_TWO_HEADER,
            characteristicTwoValue: EARTHLINK_TWO_VALUE,
            disclaimer: EARTHLINK_DISCLAIMER,
            included: EARTHLINK_INCLUDED,
            details: EARTHLINK_DETAILS,
            show: EARTHLINK_SHOW
        },
        directv: {
            name: DIRECTV_NAME,
            category: DIRECTV_CATEGORY,
            characteristicOneHeader: DIRECTV_ONE_HEADER,
            characteristicOneValue: DIRECTV_ONE_VALUE,
            characteristicTwoHeader: DIRECTV_TWO_HEADER,
            characteristicTwoValue: DIRECTV_TWO_VALUE,
            disclaimer: DIRECTV_DISCLAIMER,
            included: DIRECTV_INCLUDED,
            details: DIRECTV_DETAILS,
            show: DIRECTV_SHOW
        },
        frontier: {
            name: FRONTIER_NAME,
            category: FRONTIER_CATEGORY,
            characteristicOneHeader: FRONTIER_ONE_HEADER,
            characteristicOneValue: FRONTIER_ONE_VALUE,
            characteristicTwoHeader: FRONTIER_TWO_HEADER,
            characteristicTwoValue: FRONTIER_TWO_VALUE,
            disclaimer: FRONTIER_DISCLAIMER,
            included: FRONTIER_INCLUDED,
            details: FRONTIER_DETAILS,
            show: FRONTIER_SHOW
        },
        windstream: {
            name: WINDSTREAM_NAME,
            category: WINDSTREAM_CATEGORY,
            characteristicOneHeader: WINDSTREAM_ONE_HEADER,
            characteristicOneValue: WINDSTREAM_ONE_VALUE,
            characteristicTwoHeader: WINDSTREAM_TWO_HEADER,
            characteristicTwoValue: WINDSTREAM_TWO_VALUE,
            disclaimer: WINDSTREAM_DISCLAIMER,
            included: WINDSTREAM_INCLUDED,
            details: WINDSTREAM_DETAILS,
            show: WINDSTREAM_SHOW
        },
        spectrum: {
            name: SPECTRUM_NAME,
            category: SPECTRUM_CATEGORY,
            characteristicOneHeader: SPECTRUM_ONE_HEADER,
            characteristicOneValue: SPECTRUM_ONE_VALUE,
            characteristicTwoHeader: SPECTRUM_TWO_HEADER,
            characteristicTwoValue: SPECTRUM_TWO_VALUE,
            disclaimer: SPECTRUM_DISCLAIMER,
            included: SPECTRUM_INCLUDED,
            details: SPECTRUM_DETAILS,
            show: SPECTRUM_SHOW
        },
        optimum: {
            name: OPTIMUM_NAME,
            category: OPTIMUM_CATEGORY,
            characteristicOneHeader: OPTIMUM_ONE_HEADER,
            characteristicOneValue: OPTIMUM_ONE_VALUE,
            characteristicTwoHeader: OPTIMUM_TWO_HEADER,
            characteristicTwoValue: OPTIMUM_TWO_VALUE,
            disclaimer: OPTIMUM_DISCLAIMER,
            included: OPTIMUM_INCLUDED,
            details: OPTIMUM_DETAILS,
            show: OPTIMUM_SHOW
        },
        home: {
            name: HOUSE_CONCIERGE_NAME,
            category: HOUSE_CONCIERGE_CATEGORY,
            characteristicOneHeader: HOUSE_CONCIERGE_ONE_HEADER,
            characteristicOneValue: HOUSE_CONCIERGE_ONE_VALUE,
            characteristicTwoHeader: "",
            characteristicTwoValue: "",
            disclaimer: HOUSE_CONCIERGE_DISCLAIMER,
            included: HOUSE_CONCIERGE_INCLUDED,
            details: HOUSE_CONCIERGE_DETAILS,
            show: HOUSE_CONCIERGE_SHOW
        }
    };

    get dynamicColor() {
        let style = this.isGuestUser
            ? `background-color:white;padding: 0 !important;max-height:100%`
            : `background-color:#f7f5fa`;
        return style;
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get providerLogoDirectv() {
        return chuzoSiteResources + "/images/provider-logo-directv.svg";
    }

    get providerLogoEarthlink() {
        return chuzoSiteResources + "/images/provider-logo-earthlink.svg";
    }

    get providerLogoFrontier() {
        return chuzoSiteResources + "/images/provider-logo-frontier.svg";
    }

    get providerLogoKinetic() {
        return chuzoSiteResources + "/images/provider-logo-kinetic.png";
    }

    get providerLogoOptimum() {
        return chuzoSiteResources + "/images/provider-logo-optimum.png";
    }

    get providerLogoSpectrum() {
        return chuzoSiteResources + "/images/provider-logo-spectrum.png";
    }

    get providerLogoHouse() {
        return chuzoSiteResources + "/images/provider-logo-home-security.png";
    }

    get iconInformation() {
        return chuzoSiteResources + "/images/icon-information.svg";
    }

    get iconCheckOrange() {
        return chuzoSiteResources + "/images/icon-check-orange.svg";
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        this.loaderSpinner = true;
        stateNames.forEach((state) => {
            let opt = {
                label: state.name,
                value: state.name
            };
            this.options.push(opt);
        });

        this.saveInfo(this.zip);
        this.saveSelfServiceStatistic();
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
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
            });
    }

    handleProductsDisplay(zipCodePrograms) {
        let availablePrograms = [];
        let info = JSON.parse(JSON.stringify(this.programs));
        let dtvInfo = [...info.filter((item) => item.program === "DirecTV")];
        if (dtvInfo.length > 0) {
            let dtv = this.handleProgramObject(dtvInfo, this.labels.directv, this.providerLogoDirectv, false);
            availablePrograms.push(dtv);
        }
        if (zipCodePrograms.includes("EarthLink")) {
            let earthLinkInfo = [...info.filter((item) => item.program === "EarthLink")];
            if (earthLinkInfo.length > 0) {
                let earthlink = this.handleProgramObject(
                    earthLinkInfo,
                    this.labels.earthlink,
                    this.providerLogoEarthlink,
                    false
                );
                availablePrograms.push(earthlink);
            }
        }
        if (zipCodePrograms.includes("Frontier")) {
            let frontierInfo = [...info.filter((item) => item.program === "Frontier")];
            if (frontierInfo.length > 0) {
                let frontier = this.handleProgramObject(
                    frontierInfo,
                    this.labels.frontier,
                    this.providerLogoFrontier,
                    false
                );
                availablePrograms.push(frontier);
            }
        }
        if (zipCodePrograms.includes("Windstream")) {
            let windstreamInfo = [...info.filter((item) => item.program === "Windstream")];
            if (windstreamInfo.length > 0) {
                let windstream = this.handleProgramObject(
                    windstreamInfo,
                    this.labels.windstream,
                    this.providerLogoKinetic,
                    false
                );
                availablePrograms.push(windstream);
            }
        }
        if (zipCodePrograms.includes("Charter")) {
            let spectrumInfo = [...info.filter((item) => item.program === "Charter")];
            if (spectrumInfo.length > 0) {
                let spectrum = this.handleProgramObject(
                    spectrumInfo,
                    this.labels.spectrum,
                    this.providerLogoSpectrum,
                    false
                );
                availablePrograms.push(spectrum);
            }
        }
        if (zipCodePrograms.includes("Altice")) {
            let alticeInfo = [...info.filter((item) => item.program === "Altice")];
            if (alticeInfo.length > 0) {
                let altice = this.handleProgramObject(alticeInfo, this.labels.optimum, this.providerLogoOptimum, false);
                availablePrograms.push(altice);
            }
        }
        let homeSecurity = this.handleProgramObject([], this.labels.home, this.providerLogoHouse, true);
        availablePrograms.push(homeSecurity);
        this.availablePrograms = [...availablePrograms];
        this.allPrograms = [...availablePrograms];
        this.tvPrograms = [...availablePrograms.filter((item) => item.category === "TV provider")];
        this.internetPrograms = [...availablePrograms.filter((item) => item.category === "Internet connectivity")];
        this.securityPrograms = [...availablePrograms.filter((item) => item.category === "Security")];
        if (!this.hasProducts) {
            this.saveInfo(this.zip, false);
        }
        this.hasProducts = true;
        this.getAddressInfo();
    }

    handleProgramObject(zipCodeValues, info, logo, isSecurity) {
        return {
            name: info.name,
            logo: logo,
            category: info.category,
            characteristicOneHeader: info.characteristicOneHeader,
            characteristicOneValue:
                zipCodeValues.length > 0 &&
                zipCodeValues[0].hasOwnProperty("speed") &&
                zipCodeValues[0].speed !== undefined &&
                zipCodeValues[0].speed !== null &&
                zipCodeValues[0].speed !== ""
                    ? `Up to ${zipCodeValues[0].speed} Mbps`
                    : info.characteristicOneValue,
            characteristicTwoHeader: info.characteristicTwoHeader,
            characteristicTwoValue:
                zipCodeValues.length > 0 &&
                zipCodeValues[0].hasOwnProperty("price") &&
                zipCodeValues[0].price !== undefined &&
                zipCodeValues[0].price !== null &&
                zipCodeValues[0].price !== ""
                    ? `$${Number(zipCodeValues[0].price).toFixed(2)}`
                    : info.characteristicTwoValue,
            eventId: info.name.toLowerCase(),
            disclaimer: info.disclaimer,
            included: info.included,
            providerDetails: info.details,
            canOrder: info.show === "show",
            isSecurity
        };
    }

    handleFilter(event) {
        switch (event.target.dataset.id) {
            case "all-tab":
                this.availablePrograms = [...this.allPrograms];
                break;
            case "internet-tab":
                this.availablePrograms = [...this.internetPrograms];
                break;
            case "tv-tab":
                this.availablePrograms = [...this.tvPrograms];
                break;
            case "security-tab":
                this.availablePrograms = [...this.securityPrograms];
                break;
        }
        this.handleSelectTab(event.target.dataset.id);
    }

    handleSelectTab(value) {
        const buttons = this.template.querySelectorAll(".button-tab");
        buttons.forEach((button) => {
            if (button.dataset.id === value) {
                button.classList.add("selected");
            } else {
                button.classList.remove("selected");
            }
        });
    }

    saveInfo(zip, handleProductsDisplay = true) {
        if (this.recordId !== undefined && this.zipCode === undefined) {
            this.getZipCode();
            return;
        }
        let info = {
            Maps_Country__c: "United States",
            Maps_PostalCode__c: this.selfServiceAddress.zip,
            Maps_Street__c: this.selfServiceAddress.street,
            Maps_Appartment__c: this.selfServiceAddress.apt !== undefined ? this.selfServiceAddress.apt : "",
            Maps_State__c: this.selfServiceAddress.state,
            Maps_City__c: this.selfServiceAddress.city,
            External_Agent_Id__c: "",
            External_Session_Id__c: "",
            Name: "Self Service Opportunity",
            StageName: "Opportunity",
            Id: this.recordId !== undefined ? this.recordId : this.opportunityId,
            Available_Programs__c: this.getAvailableProgramsAsText()
        };
        if (this.isGuestUser && this.referralCodeData) {
            info.referralCodeId = this.referralCodeData.Id || this.referralCodeData.referralCodeId;
        }

        let myData = {
            latitude: 0.0,
            longitude: 0.0,
            opportunity: info,
            origin: "Self Service",
            inProgressEvent: null,
            inProgressRetail: null,
            contact: true
        };
        console.log("Save Opportunity Data", myData);
        saveOpportunityAddressInformation({ myData: myData })
            .then((response) => {
                console.log("Save Opportunity Data Response", response);
                let result = response.result;
                let families = [];
                let zipCodePrograms = [];

                families.push({
                    program: "DirecTV",
                    speed: "",
                    price: ""
                });

                families.push({
                    program: "Frontier",
                    speed: "",
                    price: ""
                });

                if (
                    result.hasOwnProperty("zipCodePrograms") &&
                    result.zipCodePrograms.hasOwnProperty("Programs") &&
                    Array.isArray(result.zipCodePrograms.Programs)
                ) {
                    result.zipCodePrograms.Programs.forEach((progr) => {
                        let famData = {
                            program: progr.Program__c,
                            speed: progr.hasOwnProperty("Speed__c") ? progr.Speed__c : "",
                            price: progr.hasOwnProperty("Price__c") ? progr.Price__c : ""
                        };
                        families.push(famData);
                        zipCodePrograms.push(progr.Program__c);
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
                    this.handleProductsDisplay(zipCodePrograms);
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

    goOrderNow(event) {
        let info = {
            program: event.target.dataset.id,
            isNationalRetail: this.isNationalRetail,
            NFFLCode: this.NFFLCode,
            FFLCode: this.FFLCode
        };
        const selectedProduct = new CustomEvent("programselection", {
            detail: info
        });
        this.dispatchEvent(selectedProduct);
    }

    contactUsModal() {
        chuzo_modalContactUs
            .open({
                content: {
                    label: `Let's connect`,
                    tollNumber: this.referralCodeData.tollNumber,
                    tollNumberURL: this.referralCodeData.tollNumberURL,
                    isMobile: this.isMobile
                }
            })
            .then((result) => {
                console.log("Contact Us Modal", result);
                if (result === "schedule") {
                    this.scheduleCallModal();
                }
            });
    }

    scheduleCallModal() {
        chuzo_modalScheduleCall.open().then((result) => {});
    }

    changeViewToHome() {
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
}