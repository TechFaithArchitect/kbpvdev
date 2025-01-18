import { api } from "lwc";
import LightningModal from "lightning/modal";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";

export default class modal_GetProducts extends LightningModal {
    @api content;

    get iconInfoVerifyCredit() {
        return chuzoSiteResources + "/images/icon-verify.svg";
    }
}