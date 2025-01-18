import { LightningElement, api } from "lwc";
import MOBILE_CART_VERBIAGE from "@salesforce/label/c.Chuzo_Spectrum_Mobile_Cart_Verbiage";

export default class Poe_lwcBuyflowSpectrumCart extends LightningElement {
    @api cart;
    @api hasPhone;
    @api logo;
    @api hasMobile;
    labels = {
        mobile: MOBILE_CART_VERBIAGE
    };
}