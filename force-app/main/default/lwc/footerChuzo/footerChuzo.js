import { LightningElement, wire } from "lwc";
import getManualPDFLinkCustomSetting from "@salesforce/apex/FooterChuzoController.getManualPDFLinkCustomSetting";
import tollFee from "@salesforce/label/c.Toll_Fee";

export default class FooterChuzo extends LightningElement {
    hasUrl = false;
    url;
    labels = {
        tollFee
    };

    @wire(getManualPDFLinkCustomSetting)
    getPDFLink({ data, error }) {
        if (data) {
            this.url = data.Chuzo_Manual_File_URL__c;
            this.hasUrl = this.url != undefined;
        } else if (error) {
            console.error(error);
        }
    }

    handleClick() {
        console.log("aca");
        window.open(this.url, "_blank").focus();
    }
}