import { LightningElement, api } from "lwc";
import NO_DEFAULT_OPTION from "@salesforce/label/c.Chuzo_Program_Selection_Shop_ID_No_Show";

export default class Poe_lwcBuyflowShopIdModal extends LightningElement {
    @api agentReferralCodes;
    @api programSelected;
    value;
    codes = [];
    noInfo = true;
    loaderSpinner;
    labels = {
        noDefaultOptionPrograms: NO_DEFAULT_OPTION
    };

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleChangeShopId(event) {
        this.noInfo = false;
        this.value = event.target.value;
    }

    connectedCallback() {
        this.loaderSpinner = true;
        let codes = [];
        let noDefaultOptionList = this.labels.noDefaultOptionPrograms.toLowerCase().split(",");
        console.log("LIST", noDefaultOptionList);
        console.log("program selected", this.programSelected);
        if (!noDefaultOptionList.includes(this.programSelected)) {
            let noCode = {
                label: "Don't use a Shop Id",
                value: "none"
            };
            codes.push(noCode);
        }
        this.agentReferralCodes.forEach((item) => {
            let add = {
                label: `${item.Referral_Code__c}`,
                value: String(item.Id)
            };
            codes.push(add);
        });
        this.codes = [...codes];
        this.loaderSpinner = false;
    }

    handleConfirm() {
        this.loaderSpinner = true;
        const referralCodeSelected = this.codes.find((code) => code.value === this.value);
        const confirmEvent = new CustomEvent("confirm", {
            detail: referralCodeSelected
        });
        this.dispatchEvent(confirmEvent);
    }
}