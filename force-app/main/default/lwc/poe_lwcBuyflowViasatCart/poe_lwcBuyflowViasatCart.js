import { LightningElement, api } from 'lwc';
import Order_Summary_labels from  "@salesforce/label/c.Order_Summary_labels";
import Today_Total_labels from "@salesforce/label/c.Today_Total_labels";
import Todays_Charges_labels from "@salesforce/label/c.Todays_Charges_labels";
import Plus_taxes_and_surcharges_labels from "@salesforce/label/c.Plus_taxes_and_surcharges_labels";
import Cart_Monthly_Total_Section_Title from "@salesforce/label/c.Cart_Monthly_Total_Section_Title";

export default class Poe_lwcBuyflowViasatCart extends LightningElement {
    @api cart;

    labels = {
        Order_Summary_labels,
        Today_Total_labels,
        Todays_Charges_labels,
        Plus_taxes_and_surcharges_labels,
        Cart_Monthly_Total_Section_Title
    };
}