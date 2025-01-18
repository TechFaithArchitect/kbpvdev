import { api } from "lwc";
import LightningModal from "lightning/modal";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

export default class modal_ContactUs extends LightningModal {
    @api content;

    get iconCallUser() {
        return chuzoSiteResources + "/images/icon-call-user.svg";
    }

    handleButton(event) {
        this.close(event.target.dataset.id);
    }
}