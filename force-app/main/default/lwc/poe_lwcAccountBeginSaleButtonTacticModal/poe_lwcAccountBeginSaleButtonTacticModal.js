import { api } from "lwc";
import LightningModal from "lightning/modal";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import CONFIRM_BUTTON_LABEL from "@salesforce/label/c.Confirm_Button_Label";

export default class Poe_lwcAccountBeginSaleButtonTacticModal extends LightningModal {
    @api options;
    noCompleteInformation = true;
    loaderSpinner;
    selectedTactic;
    labels = {
        CONFIRM_BUTTON_LABEL
    };

    get iconInfoUser() {
        return chuzoSiteResources + "/images/icon-info-user.svg";
    }

    handleChange(event) {
        this.selectedTactic = event.target.value;
        if (this.selectedTactic !== undefined) {
            this.noCompleteInformation = false;
        } else {
            this.noCompleteInformation = true;
        }
    }

    hideModal() {
        const closeEvent = new CustomEvent("close", {});
        this.dispatchEvent(closeEvent);
    }

    handleConfirm() {
        const confirmationEvent = new CustomEvent("confirm", {
            detail: this.selectedTactic
        });
        this.dispatchEvent(confirmationEvent);
    }
}