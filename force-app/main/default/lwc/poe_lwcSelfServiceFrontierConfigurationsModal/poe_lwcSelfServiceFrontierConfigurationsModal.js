import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { loadStyle } from "lightning/platformResourceLoader";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import hideCloseCss from "@salesforce/resourceUrl/hideCloseCss";

export default class Poe_lwcSelfServiceFrontierConfigurationsModal extends LightningModal {
    @api label;
    @api hasPhone;
    @api freezeOptions;
    @api freezeOption;
    @api additionalListing;
    @api listingOptions;
    @api listingOption;
    @api listedId;
    @api internationalOptions;
    @api voiceMailOption;
    @api homeOption;
    hasFreezeOptions;
    noInfo = true;
    hasListingOptions;
    hasInternational;
    hasVoiceMail;
    showAdditional;
    additionalWanted;
    additionalLabel;
    voiceMailOptions = [
        {
            label: "Yes",
            value: "yes"
        },
        {
            label: "No",
            value: "no"
        }
    ];
    voiceMailSelection;
    voiceMailSelected;
    hasSecurityOptions;
    hasHomeOption;
    ring = "None";

    get nextButtonClass() {
        return this.noInfo ? "btn-rounded btn-center btn-disabled" : "btn-rounded btn-center";
    }

    handleConfirm() {
        const closeModalEvent = new CustomEvent("confirm", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
        this.disableClose = false;
        this.close({
            agreed: true
        });
    }

    handleFreeze(event) {
        const closeModalEvent = new CustomEvent("freezeselected", {
            detail: event.target.value
        });
        this.dispatchEvent(closeModalEvent);
        this.disableValidations();
    }

    handleListing(event) {
        if (event.target.value === this.listedId) {
            this.showAdditional = true;
        } else {
            this.showAdditional = false;
        }
        this.listingOption = event.target.value;
        const closeModalEvent = new CustomEvent("listingselected", {
            detail: event.target.value
        });
        this.dispatchEvent(closeModalEvent);
        this.disableValidations();
    }

    connectedCallback() {
        loadStyle(this, hideCloseCss);
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");

        this.hasFreezeOptions = this.freezeOptions.length > 0;
        this.hasListingOptions = this.listingOptions.length > 0;
        this.hasInternational = this.internationalOptions.length > 0;
        if (this.additionalListing !== undefined) {
            this.additionalLabel = `${this.additionalListing.label}: $${this.additionalListing.price}`;
        }
        this.hasVoiceMail = this.voiceMailOption !== undefined;
        if (this.hasVoiceMail) {
            this.voiceMailSelection = this.voiceMailOption.isChecked ? "yes" : "no";
            this.voiceMailSelected = this.voiceMailSelection === "yes";
        }
        this.hasSecurityOptions = this.homeOption !== undefined;
        this.hasHomeOption = this.homeOption !== undefined;
        this.disableValidations();
    }

    handleAdditional(event) {
        this.additionalWanted = event.target.checked;
        const closeModalEvent = new CustomEvent("additionalselected", {
            detail: event.target.checked
        });
        this.dispatchEvent(closeModalEvent);
        this.disableValidations();
    }

    handleInternational(event) {
        let options = [...JSON.parse(JSON.stringify(this.internationalOptions))];
        let isWorld = false;
        options.forEach((item) => {
            if (item.id === event.target.dataset.id) {
                item.isChecked = event.target.checked;
                if (item.name.includes("World Plan") && event.target.checked) {
                    isWorld = true;
                }
            }
        });
        if (isWorld) {
            options.forEach((item) => {
                if (item.id !== event.target.dataset.id && item.name.includes("World Plan") && !item.required) {
                    item.isChecked = false;
                }
            });
        }
        this.internationalOptions = [...options];
        let info = {
            options: this.internationalOptions
        };
        const closeModalEvent = new CustomEvent("internationalselected", {
            detail: info
        });
        this.dispatchEvent(closeModalEvent);
        this.disableValidations();
    }

    handleRing(event) {
        this.ring = event.target.value;
        const closeModalEvent = new CustomEvent("ringselected", {
            detail: event.target.value
        });
        this.dispatchEvent(closeModalEvent);
        this.disableValidations();
    }

    handleVoiceMail(event) {
        this.voiceMailSelection = event.target.value;
        this.voiceMailSelected = event.target.value === "yes";
        const closeModalEvent = new CustomEvent("mailselected", {
            detail: this.voiceMailSelected
        });
        this.dispatchEvent(closeModalEvent);
        this.disableValidations();
    }

    handleHome(event) {
        const closeModalEvent = new CustomEvent("homeselected", {
            detail: event.target.checked
        });
        this.dispatchEvent(closeModalEvent);
        this.disableValidations();
    }

    disableValidations() {
        if (
            ((this.hasFreezeOptions && this.freezeOption !== undefined) || !this.hasFreezeOptions) &&
            ((this.hasListingOptions && this.listingOption !== undefined) || !this.hasListingOptions) &&
            ((this.voiceMailSelected && this.ring !== undefined && this.ring !== "None") || !this.voiceMailSelected)
        ) {
            this.noInfo = false;
        } else {
            this.noInfo = true;
        }
    }
}