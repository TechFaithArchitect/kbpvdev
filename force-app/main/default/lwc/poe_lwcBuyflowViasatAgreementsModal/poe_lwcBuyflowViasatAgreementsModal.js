import { LightningElement, api } from "lwc";
import Agreement_Selection from  "@salesforce/label/c.Agreement_Selection";
import Please_Following from  "@salesforce/label/c.Please_Following";
import Viasat_Confirm_button from "@salesforce/label/c.Viasat_Confirm_button";
import Viasat_label_Agrement_modal from "@salesforce/label/c.Viasat_label_Agrement_modal";
import Viasat_label_Agrement_modal_SO from "@salesforce/label/c.Viasat_label_Agrement_modal_SO";

export default class Poe_lwcBuyflowDirecTvInfoTabModal extends LightningElement {
    @api agreements;
    value;
    options = [];
    noInfo = true;
    loaderSpinner;

    labels = {
        Agreement_Selection,
        Please_Following,
        Viasat_Confirm_button,
        Viasat_label_Agrement_modal,
        Viasat_label_Agrement_modal_SO
    };

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleChange(event) {
        this.noInfo = false;
        this.value = event.target.value;
    }

    connectedCallback() {
        let agreements = [];
        this.agreements.forEach((item) => {
            if (item.agreement_type === "FULFILLMENT") {
                let label =
                    item.name === "SI"
                        ? this.labels.Viasat_label_Agrement_modal.replace('item.name', item.name) 
                        : item.name === "Perfect Vision"
                        ? this.labels.Viasat_label_Agrement_modal_SO
                        : item.name;
                let newOption = {
                    value: item.id,
                    label: label
                };
                agreements.push(newOption);
            }
        });
        this.options = [...agreements];
    }

    handleConfirm() {
        let dealerId;
        let fulfillmentAgreementId = this.value;
        let agreementId;
        let salesOnly;
        this.agreements.forEach((item) => {
            if (item.agreement_type === "FULFILLMENT" && item.id === fulfillmentAgreementId) {
                dealerId = Array.isArray(item.characteristics)
                    ? item.characteristics[0].value
                    : item.characteristics.value;
                salesOnly = item.name === "SI";
            }
        });
        this.agreements.forEach((item) => {
            if (item.agreement_type === "SALES" && item.hasOwnProperty("characteristics")) {
                if (Array.isArray(item.characteristics) && item.characteristics[0].value === dealerId) {
                    agreementId = item.id;
                } else if (!Array.isArray(item.characteristics) && item.characteristics.value === dealerId) {
                    agreementId = item.id;
                }
            }
        });
        let info = {
            agreementId: agreementId,
            fulfillmentAgreementId: fulfillmentAgreementId,
            salesOnly: salesOnly
        };
        const closeModalEvent = new CustomEvent("confirm", {
            detail: info
        });
        this.dispatchEvent(closeModalEvent);
    }
}