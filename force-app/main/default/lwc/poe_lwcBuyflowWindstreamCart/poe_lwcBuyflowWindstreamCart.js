import { LightningElement, api } from 'lwc';
import Order_Summary_labels from  "@salesforce/label/c.Order_Summary_labels";
import Todays_Charges_labels from  "@salesforce/label/c.Todays_Charges_labels";
import Today_Total_labels from  "@salesforce/label/c.Today_Total_labels";
import Plus_taxes_and_surcharges_labels from  "@salesforce/label/c.Plus_taxes_and_surcharges_labels";
import One_Time_Payments_labels from  "@salesforce/label/c.One_Time_Payments_labels";
import One_Time_Payments_Total_labels from  "@salesforce/label/c.One_Time_Payments_Total_labels";
import Monthly_Charges_Bundles_labels from  "@salesforce/label/c.Monthly_Charges_Bundles_labels";
import Bundle_Total_labels from  "@salesforce/label/c.Bundle_Total_labels"; 
import Monthly_Charges_Adders_labels from  "@salesforce/label/c.Monthly_Charges_Adders_labels";  
import Adders_Total_labels from  "@salesforce/label/c.Adders_Total_labels";   

export default class Poe_lwcBuyflowWindstreamCart extends LightningElement {
    @api cart;
    labels = {
        Order_Summary_labels,
        Todays_Charges_labels,
        Today_Total_labels,
        Plus_taxes_and_surcharges_labels,
        One_Time_Payments_labels,
        One_Time_Payments_Total_labels,
        Monthly_Charges_Bundles_labels,
        Bundle_Total_labels,
        Monthly_Charges_Adders_labels,
        Adders_Total_labels
    };
}