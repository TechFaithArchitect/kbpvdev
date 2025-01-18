import { api } from 'lwc';
import LightningModal from 'lightning/modal';

import CUSTOMER_TERMS_AND_CONDITIONS_SHORT_VERBIAGE from "@salesforce/label/c.Customer_Terms_and_Conditions_Short_Verbiage";
import CANCEL_ORDER_BUTTON_LABEL from "@salesforce/label/c.Cancel_Order_Button_Label";

export default class Poe_lwcSelfServiceProductsDisclaimerModal extends LightningModal {
    @api provider;
    @api disclaimer;

    get cancelOrderText() {
        return this.disclaimer?.cancelText 
               ? this.disclaimer.cancelText 
               : CANCEL_ORDER_BUTTON_LABEL;
    }

    get agreeText() {
        return this.disclaimer?.agreeText 
               ? this.disclaimer.agreeText 
               : CUSTOMER_TERMS_AND_CONDITIONS_SHORT_VERBIAGE;
    }

    closeModal() {
        this.close({ agree: true });
    }

    cancelOrder() {
        this.close({ cancelOrder: true });
    }
}