import { api } from "lwc";
import LightningModal from "lightning/modal";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";
import hideCloseCss from "@salesforce/resourceUrl/hideCloseCss";

export default class modal_ContactUs extends LightningModal {
    @api content;
    method = "sms";

    get iconCallUser() {
        return chuzoSiteResources + "/images/icon-call-user.svg";
    }

    get classButton() {
        return `btn-orange btn-only-rounded ${this.noMethod ? "btn-disabled" : ""}`;
    }

    handleMethod(event) {
        this.method = event.target.value;
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        loadStyle(this, hideCloseCss);
    }

    handleButton(event) {
        if (event.target.dataset.id === "close") {
            this.close("close");
        } else {
            this.close(this.method);
        }
    }
}