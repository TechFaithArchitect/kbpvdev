import { LightningElement, api } from "lwc";

import CLOSE_BUTTON_LABEL from "@salesforce/label/c.Close_Button_Label";
import PRODUCT_DETAIL_MODAL_TITLE from "@salesforce/label/c.Frontier_Product_Description_Modal_Title";

export default class Poe_lwcBuyflowEarthlinkProductDescriptionModal extends LightningElement {
    @api description;

    labels = {
        CLOSE_BUTTON_LABEL,
        PRODUCT_DETAIL_MODAL_TITLE
    };

    hideModal() {
        const closeModalEvent = new CustomEvent("closedescription", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }
}