import LightningModal from "lightning/modal";
import { api } from "lwc";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";

export default class modalPredictiveAddress extends LightningModal {
    @api content;
    address = {};
    captchaVerified = false;
    enableNext = false;

    get buttonClass() {
        return `btn-rounded btn-orange btn-center ${this.enableNext ? "" : `btn-disabled`}`;
    }

    get iconInfoUser() {
        return chuzoSiteResources + "/images/icon-address.svg";
    }

    handleSubmit() {
        this.close(this.address);
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
    }

    handleAddressChange(event) {
        this.address.street = event.detail.street != "" ? event.detail.street : undefined;
        this.address.city = event.detail.city != "" ? event.detail.city : undefined;
        this.address.apt = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.address.state = event.detail.province != "" ? event.detail.province : undefined;
        this.address.zip = event.detail.postalCode != "" ? event.detail.postalCode : undefined;
        this.handleButton();
    }

    handleButton() {
        this.enableNext =
            this.address.street !== undefined &&
            this.address.city !== undefined &&
            this.address.state !== undefined &&
            this.address.zip !== undefined &&
            (this.captchaVerified || !this.content.showCaptcha);
    }

    handleCaptchaResult(event) {
        this.captchaVerified = event.detail.result;
        this.handleButton();
    }
}