import { LightningElement, api } from "lwc";
import Windstream_Advance_Payment_Y_labels from "@salesforce/label/c.Windstream_Advance_Payment_Y_labels"; 
import Windstream_Advance_Payment_C_labels from "@salesforce/label/c.Windstream_Advance_Payment_C_labels";
import Windstream_Advance_Payment_Default_labels from "@salesforce/label/c.Windstream_Advance_Payment_Default_labels";
import Windstream_Customer_want_to_pay_amount_in_advance from "@salesforce/label/c.Windstream_Customer_want_to_pay_amount_in_advance";
import Windstream_Customer_want_to_enroll_autopay_already_chossen_enroll from "@salesforce/label/c.Windstream_Customer_want_to_enroll_autopay_already_chossen_enroll";
import Windstream_Advance_Deposit_Required from "@salesforce/label/c.Windstream_Advance_Deposit_Required";

export default class Poe_lwcBuyflowWindstreamCreditCheckDepositRequired extends LightningElement {
    @api amount;
    @api hasAutoPay;
    @api advancePaymentIndicator;
    options = [];
    value;
    noCompleteInformation = true;
    verbiage;

    labels = {
        Windstream_Advance_Deposit_Required
    }

    handleOptions(event) {
        this.value = event.target.value;
        this.noCompleteInformation = false;
    }

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    connectedCallback() {
        let optionsC = [
            {
                label: Windstream_Customer_want_to_pay_amount_in_advance.replace('${this.amount}', this.amount),
                value: `deposit`
            },
            {
                label: Windstream_Customer_want_to_enroll_autopay_already_chossen_enroll ,
                value: `autoPay`
            }
        ];
        let optionsY = [
            {
                label:  Windstream_Customer_want_to_pay_amount_in_advance.replace('${this.amount}', this.amount),
                value: `deposit`
            }
        ];

        let flag = String(this.advancePaymentIndicator);
        switch (flag) {
            case "Y":
                this.verbiage = Windstream_Advance_Payment_Y_labels.replace('${this.amount}', this.amount);
                this.options = [...optionsY];
                break;
            case "C":
                this.verbiage = Windstream_Advance_Payment_C_labels.replace('${this.amount}', this.amount);
                this.options = [...optionsC];
                if (this.hasAutoPay) {
                    this.value = "autoPay";
                    this.noCompleteInformation = false;
                }
                break;
            default:
                this.verbiage = Windstream_Advance_Payment_Default_labels.replace('${this.amount}', this.amount);
                this.options = [...optionsC];
                break;
        }
    }

    handleNext() {
        const closeModalEvent = new CustomEvent("confirm", {
            detail: this.value
        });
        this.dispatchEvent(closeModalEvent);
    }
}