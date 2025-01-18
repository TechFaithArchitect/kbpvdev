import { LightningElement, api } from "lwc";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
import { OmniscriptBaseMixin } from "vlocity_cmt/omniscriptBaseMixin";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import phonePrograms from "@salesforce/label/c.phonePrograms";
import retailPrograms from "@salesforce/label/c.retailPrograms";
import eventPrograms from "@salesforce/label/c.eventPrograms";
import d2dPrograms from "@salesforce/label/c.d2dPrograms";

export default class Poe_lwcRepresentativeProgramsAvailable extends OmniscriptBaseMixin(LightningElement) {
    _omniJsonData;
    @api
    set omniJsonData(omniData) {
        this._omniJsonData = omniData;
        this.disabled = true;
        if (omniData != null && omniData != undefined) {
            let data = JSON.parse(JSON.stringify(omniData));
            if (
                data.hasOwnProperty("createContactUser") &&
                data.createContactUser.hasOwnProperty("createContactUserBlock") &&
                data.createContactUser.createContactUserBlock.hasOwnProperty("RepresentativeType")
            ) {
                switch (this.block) {
                    case "Phone Sales":
                        this.disabled =
                            !data.createContactUser.createContactUserBlock.RepresentativeType.callCenterCheckbox;
                        break;
                    case "Event":
                        this.disabled = !data.createContactUser.createContactUserBlock.RepresentativeType.eventCheckbox;
                        break;
                    case "Retail":
                        this.disabled =
                            !data.createContactUser.createContactUserBlock.RepresentativeType.retailCheckbox;
                        break;
                    case "Door To Door":
                        this.disabled = !data.createContactUser.createContactUserBlock.RepresentativeType.d2dCheckbox;
                        break;
                }
            }
        }
    }
    get omniJsonData() {
        return this._omniJsonData;
    }
    @api block;
    showDTV;
    showBrinks;
    showCharter;
    showEarthLink;
    showFrontier;
    showTMobile;
    showViasat;
    showWindstream;
    showAltice;
    _actionUtil;
    loaderSpinner;
    hasDTV = false;
    hasBrinks = false;
    hasCharter = false;
    hasEarthLink = false;
    hasFrontier = false;
    hasTMobile = false;
    hasViasat = false;
    hasWindstream = false;
    hasAltice = false;
    data;
    disabled;
    labels = {
        d2dPrograms,
        retailPrograms,
        eventPrograms,
        phonePrograms
    };

    connectedCallback() {
        this.loaderSpinner = true;
        this._actionUtil = new OmniscriptActionCommonUtil();
        let data = JSON.parse(JSON.stringify(this.omniJsonData));
        console.log(data);
        let programTypes = [];
        switch (this.block) {
            case "Phone Sales":
                programTypes = [...this.labels.phonePrograms.split(";")];
                break;
            case "Event":
                programTypes = [...this.labels.eventPrograms.split(";")];
                break;
            case "Retail":
                programTypes = [...this.labels.retailPrograms.split(";")];
                break;
            case "Door To Door":
                programTypes = [...this.labels.d2dPrograms.split(";")];
                break;
        }
        this.showDTV =
            data.hasOwnProperty("programsAvailable") &&
            data.programsAvailable["DirecTV"] &&
            programTypes.includes("DIRECTV")
                ? true
                : false;
        this.showBrinks =
            data.hasOwnProperty("programsAvailable") &&
            data.programsAvailable["Brinks"] &&
            programTypes.includes("Brinks")
                ? true
                : false;
        this.showCharter =
            data.hasOwnProperty("programsAvailable") &&
            data.programsAvailable["Charter/Spectrum"] &&
            programTypes.includes("Spectrum")
                ? true
                : false;
        this.showEarthLink =
            data.hasOwnProperty("programsAvailable") &&
            data.programsAvailable["EarthLink"] &&
            programTypes.includes("EarthLink")
                ? true
                : false;
        this.showFrontier =
            data.hasOwnProperty("programsAvailable") &&
            data.programsAvailable["Frontier"] &&
            programTypes.includes("Frontier")
                ? true
                : false;
        this.showTMobile =
            data.hasOwnProperty("programsAvailable") &&
            data.programsAvailable["T-Mobile"] &&
            programTypes.includes("T-Mobile")
                ? true
                : false;
        this.showViasat =
            data.hasOwnProperty("programsAvailable") &&
            data.programsAvailable["Viasat"] &&
            programTypes.includes("Viasat")
                ? true
                : false;
        this.showWindstream =
            data.hasOwnProperty("programsAvailable") &&
            data.programsAvailable["Windstream"] &&
            programTypes.includes("Windstream")
                ? true
                : false;
        this.showAltice =
            data.hasOwnProperty("programsAvailable") &&
            data.programsAvailable["Altice"] &&
            programTypes.includes("Optimum")
                ? true
                : false;
        if (data.hasOwnProperty("displayContactsAndUsers")) {
            if (this.block == "Phone Sales") {
                this.hasDTV =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Programs_Available__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Programs_Available__c.includes("DirecTV")
                        ? true
                        : false;
                this.hasBrinks =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Programs_Available__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Programs_Available__c.includes("Brinks")
                        ? true
                        : false;
                this.hasCharter =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Programs_Available__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Programs_Available__c.includes("Charter")
                        ? true
                        : false;
                this.hasEarthLink =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Programs_Available__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Programs_Available__c.includes("EarthLink")
                        ? true
                        : false;
                this.hasFrontier =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Programs_Available__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Programs_Available__c.includes("Frontier")
                        ? true
                        : false;
                this.hasTMobile =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Programs_Available__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Programs_Available__c.includes("T-Mobile")
                        ? true
                        : false;
                this.hasViasat =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Programs_Available__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Programs_Available__c.includes("Viasat")
                        ? true
                        : false;
                this.hasWindstream =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Programs_Available__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Programs_Available__c.includes("Windstream")
                        ? true
                        : false;
                this.hasAltice =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Programs_Available__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Programs_Available__c.includes("Altice")
                        ? true
                        : false;
            }
            if (this.block == "Event") {
                this.hasDTV =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Event_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Event_Programs__c.includes("DirecTV")
                        ? true
                        : false;
                this.hasBrinks =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Event_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Event_Programs__c.includes("Brinks")
                        ? true
                        : false;
                this.hasCharter =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Event_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Event_Programs__c.includes("Charter")
                        ? true
                        : false;
                this.hasEarthLink =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Event_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Event_Programs__c.includes("EarthLink")
                        ? true
                        : false;
                this.hasFrontier =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Event_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Event_Programs__c.includes("Frontier")
                        ? true
                        : false;
                this.hasTMobile =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Event_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Event_Programs__c.includes("T-Mobile")
                        ? true
                        : false;
                this.hasViasat =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Event_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Event_Programs__c.includes("Viasat")
                        ? true
                        : false;
                this.hasWindstream =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Event_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Event_Programs__c.includes("Windstream")
                        ? true
                        : false;
                this.hasAltice =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Event_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Event_Programs__c.includes("Altice")
                        ? true
                        : false;
            }
            if (this.block == "Retail") {
                this.hasDTV =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Retail_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Retail_Programs__c.includes("DirecTV")
                        ? true
                        : false;
                this.hasBrinks =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Retail_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Retail_Programs__c.includes("Brinks")
                        ? true
                        : false;
                this.hasCharter =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Retail_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Retail_Programs__c.includes("Charter")
                        ? true
                        : false;
                this.hasEarthLink =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Retail_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Retail_Programs__c.includes("EarthLink")
                        ? true
                        : false;
                this.hasFrontier =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Retail_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Retail_Programs__c.includes("Frontier")
                        ? true
                        : false;
                this.hasTMobile =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Retail_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Retail_Programs__c.includes("T-Mobile")
                        ? true
                        : false;
                this.hasViasat =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Retail_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Retail_Programs__c.includes("Viasat")
                        ? true
                        : false;
                this.hasWindstream =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Retail_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Retail_Programs__c.includes("Windstream")
                        ? true
                        : false;
                this.hasAltice =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("POE_Retail_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.POE_Retail_Programs__c.includes("Altice")
                        ? true
                        : false;
            }
            if (this.block == "Door To Door") {
                this.hasDTV =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("D2D_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.D2D_Programs__c.includes("DirecTV")
                        ? true
                        : false;
                this.hasBrinks =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("D2D_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.D2D_Programs__c.includes("Brinks")
                        ? true
                        : false;
                this.hasCharter =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("D2D_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.D2D_Programs__c.includes("Charter")
                        ? true
                        : false;
                this.hasEarthLink =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("D2D_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.D2D_Programs__c.includes("EarthLink")
                        ? true
                        : false;
                this.hasFrontier =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("D2D_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.D2D_Programs__c.includes("Frontier")
                        ? true
                        : false;
                this.hasTMobile =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("D2D_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.D2D_Programs__c.includes("T-Mobile")
                        ? true
                        : false;
                this.hasViasat =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("D2D_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.D2D_Programs__c.includes("Viasat")
                        ? true
                        : false;
                this.hasWindstream =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("D2D_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.D2D_Programs__c.includes("Windstream")
                        ? true
                        : false;
                this.hasAltice =
                    data.displayContactsAndUsers.searchTable.Contact.hasOwnProperty("D2D_Programs__c") &&
                    data.displayContactsAndUsers.searchTable.Contact.D2D_Programs__c.includes("Altice")
                        ? true
                        : false;
            }
        }

        this.data = {
            dtvCheckbox: this.hasDTV,
            brinksCheckbox: this.hasBrinks,
            charterCheckbox: this.hasCharter,
            earthlinkCheckbox: this.hasEarthLink,
            frontierCheckbox: this.hasFrontier,
            tmobileCheckbox: this.hasTMobile,
            viasatCheckbox: this.hasViasat,
            windstreamCheckbox: this.hasWindstream,
            alticeCheckbox: this.hasAltice
        };
        JSON.parse(JSON.stringify(this.data));
        this.omniUpdateDataJson(this.data);
        this.loaderSpinner = false;
    }

    handleChecked(event) {
        let showModal = false;
        switch (event.target.name) {
            case "at":
                if (event.target.checked) {
                    showModal = true;
                }
                this.data.dtvCheckbox = event.target.checked;
                break;
            case "brinks":
                this.data.brinksCheckbox = event.target.checked;
                break;
            case "charter":
                this.data.charterCheckbox = event.target.checked;
                break;
            case "earthlink":
                this.data.earthlinkCheckbox = event.target.checked;
                break;
            case "frontier":
                this.data.frontierCheckbox = event.target.checked;
                break;
            case "t-mobile":
                if (event.target.checked) {
                    showModal = true;
                }
                this.data.tmobileCheckbox = event.target.checked;
                break;
            case "viasat":
                this.data.viasatCheckbox = event.target.checked;
                break;
            case "windstream":
                this.data.windstreamCheckbox = event.target.checked;
                break;
            case "altice":
                this.data.alticeCheckbox = event.target.checked;
                break;
        }

        if (showModal) {
            const event = new ShowToastEvent({
                title: "Warning",
                variant: "Warning",
                mode: "sticky",
                message:
                    "Once this request is submitted, user credentials for this program need to be verified by the Customer Service team before it is added to the user’s Chuzo account."
            });
            this.dispatchEvent(event);
        }

        JSON.parse(JSON.stringify(this.data));
        this.omniUpdateDataJson(this.data);
    }
}