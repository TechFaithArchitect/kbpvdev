import { LightningElement, api } from 'lwc';

import ORDER_SUMMARY_TITLE from "@salesforce/label/c.Order_Summary_Title";
import TODAYS_CHARGES_TITLE from "@salesforce/label/c.Todays_Charges_labels";
import TODAYS_TOTAL_TITLE from "@salesforce/label/c.Today_Total_labels";
import CART_BOTTOM_NOTE from "@salesforce/label/c.EarthLink_Cart_Tab_Bottom_Note";
import MONTHLY_CHARGES_CART_TITLE from "@salesforce/label/c.Monthly_Charges_Cart_Title";
import CART_MONTHLY_TOTAL_SECTION_TITLE from "@salesforce/label/c.Cart_Monthly_Total_Section_Title";

export default class Poe_lwcBuyflowEarthlinkCart extends LightningElement {
    @api cart;
    labels = {
        ORDER_SUMMARY_TITLE,
        TODAYS_CHARGES_TITLE,
        TODAYS_TOTAL_TITLE,
        CART_BOTTOM_NOTE,
        MONTHLY_CHARGES_CART_TITLE,
        CART_MONTHLY_TOTAL_SECTION_TITLE
    };
}