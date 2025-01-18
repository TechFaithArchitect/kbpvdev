import { api } from "lwc";
import LightningModal from "lightning/modal";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import hideCloseCss from "@salesforce/resourceUrl/hideCloseCss";
import { loadStyle } from "lightning/platformResourceLoader";

export default class modal_Generic extends LightningModal {
    @api content;

    get iconInfoUser() {
        return chuzoSiteResources + "/images/icon-info-user.svg";
    }

    get showIcon() {
        return this.content?.provider === 'earthlink' || this.content?.provider === 'frontier';
    }

    agreeDisclosure() {
        this.close({
            agreed: true
        });
    }

    cancel() {
        this.close({
            agreed: false
        });
    }

    connectedCallback() {
        if (!this.content.canClose) {
            loadStyle(this, hideCloseCss);
        }
    }
}