import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import CHOICE_SPEED_VERBIAGE from "@salesforce/label/c.Viasat_Data_Speed_Choice_Plan_Disclosure";
import UNLEASHED_SPEED_VERBIAGE from "@salesforce/label/c.Viasat_Data_Speed_Unleashed_Plan_Disclosure";
import GENERAL_SPEED_VERBIAGE from "@salesforce/label/c.Viasat_Data_Speed_General_Disclosures";
import CONN_25_VERBIAGE from "@salesforce/label/c.Viasat_Connection25_Plan_Disclosure";
import SHIELD_PREMIUM_VERBIAGE from "@salesforce/label/c.Viasat_Shield_Premium_Disclosure";
import VIASAT_VOICE_VERBIAGE_1 from "@salesforce/label/c.Viasat_Voice_General_Disclosure_1";
import VIASAT_VOICE_VERBIAGE_2 from "@salesforce/label/c.Viasat_Voice_General_Disclosure_2";
import VIASAT_VOICE_VERBIAGE_3 from "@salesforce/label/c.Viasat_Voice_General_Disclosure_3";
import PORTING_VERBIAGE from "@salesforce/label/c.Viasat_Voice_Porting_Disclosure";
import EASY_CARE_VERBIAGE from "@salesforce/label/c.Viasat_EasyCare_Disclosure";
import BILLING_VERBIAGE from "@salesforce/label/c.Viasat_Billing_Disclosure_1";
import NO_FEE_VERBIAGE from "@salesforce/label/c.Viasat_Billing_No_Installation_Fee_Disclosure";
import FEE_VERBIAGE from "@salesforce/label/c.Viasat_Billing_Installation_Fee_Disclosure";
import BILLING_2_VERBIAGE from "@salesforce/label/c.Viasat_Billing_Disclosure_2";
import SERVICE_COM_VERBIAGE from "@salesforce/label/c.Viasat_Billing_Service_Commitment_Disclosure";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import Term_condition_and_Disclosures from "@salesforce/label/c.Term_condition_and_Disclosures";
import T_Chart_labels from "@salesforce/label/c.T_Chart_labels";
import i_have_read_and_agreed from "@salesforce/label/c.i_have_read_and_agreed";
import Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message from  "@salesforce/label/c.Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message";
import Customer_Terms_and_Conditions_Instructions from  "@salesforce/label/c.Customer_Terms_and_Conditions_Instructions";
import Agent_Terms_and_Conditions_Instructions from "@salesforce/label/c.Agent_Terms_and_Conditions_Instructions";
import verbiage_Viasat_Billing_Disclosure_1 from "@salesforce/label/c.verbiage_Viasat_Billing_Disclosure_1";
import verbiage_Viasat_Billing_Installation_Fee_Disclosure from "@salesforce/label/c.verbiage_Viasat_Billing_Installation_Fee_Disclosure";
import verbiage_Viasat_Billing_No_Installation_Fee_Disclosure from "@salesforce/label/c.verbiage_Viasat_Billing_No_Installation_Fee_Disclosure";
import verbiage_Viasat_Billing_Disclosure_2 from "@salesforce/label/c.verbiage_Viasat_Billing_Disclosure_2";
import verbiage_Viasat_Billing_Service_Commitment_Disclosure from "@salesforce/label/c.verbiage_Viasat_Billing_Service_Commitment_Disclosure";
import verbiage_Viasat_Data_Speed_Choice_Plan_Disclosure from "@salesforce/label/c.verbiage_Viasat_Data_Speed_Choice_Plan_Disclosure";
import verbiage_Viasat_Data_Speed_Unleashed_Plan_Disclosure from "@salesforce/label/c.verbiage_Viasat_Data_Speed_Unleashed_Plan_Disclosure";
import verbiage_Viasat_Data_Speed_General_Disclosure from "@salesforce/label/c.verbiage_Viasat_Data_Speed_General_Disclosure";
import verbiage_Viasat_Connection25_Plan_Disclosure from "@salesforce/label/c.verbiage_Viasat_Connection25_Plan_Disclosure";
import verbiage_Viasat_Shield_Premium_Disclosure from "@salesforce/label/c.verbiage_Viasat_Shield_Premium_Disclosure";
import verbiage_Viasat_Voice_General_Disclosure from  "@salesforce/label/c.verbiage_Viasat_Voice_General_Disclosure";
import verbiage_iasat_Voice_Porting_Disclosure from "@salesforce/label/c.verbiage_iasat_Voice_Porting_Disclosure";
import verbiage_Viasat_EasyCare_Disclosure from "@salesforce/label/c.verbiage_Viasat_EasyCare_Disclosure";

export default class Poe_lwcBuyflowViasatTermsTab extends NavigationMixin(LightningElement) {
    @api referenceNumber;
    @api logo;
    @api recordId;
    @api cartInfo;
    @api origin;
    @api showDisclosures;
    @api isGuestUser;
    termsAndConditionsInstructions = "";
    terms = [];
    disableNext = true;
    verbiages = {
        choice: CHOICE_SPEED_VERBIAGE,
        unleashed: UNLEASHED_SPEED_VERBIAGE,
        generalSpeed: GENERAL_SPEED_VERBIAGE,
        connection25: CONN_25_VERBIAGE,
        shield: SHIELD_PREMIUM_VERBIAGE,
        voice: VIASAT_VOICE_VERBIAGE_1 + VIASAT_VOICE_VERBIAGE_2 + VIASAT_VOICE_VERBIAGE_3,
        porting: PORTING_VERBIAGE,
        easyCare: EASY_CARE_VERBIAGE,
        billingVerbiage: BILLING_VERBIAGE,
        billingVerbiage2: BILLING_2_VERBIAGE,
        noFee: NO_FEE_VERBIAGE,
        fee: FEE_VERBIAGE,
        serviceCom: SERVICE_COM_VERBIAGE
    };
    showLoaderSpinner;
    checkboxAgreementMessage;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        Term_condition_and_Disclosures,
        T_Chart_labels,
        i_have_read_and_agreed,
        Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message,
        Customer_Terms_and_Conditions_Instructions,
        Agent_Terms_and_Conditions_Instructions,
        verbiage_Viasat_Billing_Disclosure_1,
        verbiage_Viasat_Billing_Installation_Fee_Disclosure,
        verbiage_Viasat_Billing_No_Installation_Fee_Disclosure,
        verbiage_Viasat_Billing_Disclosure_2,
        verbiage_Viasat_Billing_Service_Commitment_Disclosure,
        verbiage_Viasat_Data_Speed_Choice_Plan_Disclosure,
        verbiage_Viasat_Data_Speed_Unleashed_Plan_Disclosure,
        verbiage_Viasat_Data_Speed_General_Disclosure,
        verbiage_Viasat_Connection25_Plan_Disclosure,
        verbiage_Viasat_Shield_Premium_Disclosure,
        verbiage_Viasat_Voice_General_Disclosure,
        verbiage_iasat_Voice_Porting_Disclosure,
        verbiage_Viasat_EasyCare_Disclosure
    };
    showSelfServiceCancelModal = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        this.checkboxAgreementMessage = this.isGuestUser
            ? this.labels.i_have_read_and_agreed
            : this.labels.Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message;
        this.showLoaderSpinner = true;
        this.termsAndConditionsInstructions = this.isGuestUser
            ? this.labels.Customer_Terms_and_Conditions_Instructions
            : this.labels.Agent_Terms_and_Conditions_Instructions;
        this.handleDisclosures();
        this.showLoaderSpinner = false;
    }

    getBillingMonths() {
        let month = 12;
        let monthsArray = [];
        this.cartInfo.monthlyCharges.forEach((item) => {
            if (item.name.toLowerCase().includes("for") && item.name.toLowerCase().includes("months")) {
                let name = item.name.toLowerCase();
                let split = name.split("for");
                let month = split[1];
                let matches = month.match(/(\d+)/);
                monthsArray.push(Number(matches[0]));
            }
        });
        if (monthsArray.length > 0) {
            month = Math.min(...monthsArray);
        }
        return month;
    }

    handleDisclosures() {
        let auxTerms = [];
        let billingText = this.verbiages.billingVerbiage.replace("{BILLING_AMOUNT}", this.cartInfo.monthlyTotal);
        let months = this.getBillingMonths();
        billingText = billingText.replace("{BILLING_MONTHS}", months);
        let billingTerm = {
            consentLabel: this.labels.verbiage_Viasat_Billing_Disclosure_1,
            consentText: billingText,
            checked: false,
            id: auxTerms.length
        };
        auxTerms.push(billingTerm);
        if (this.cartInfo.todayCharges.length > 0) {
            let feeText = this.verbiages.fee.replace("{INSTALLATION_FEE}", this.cartInfo.todayTotal);
            let term = {
                consentLabel: this.labels.verbiage_Viasat_Billing_Installation_Fee_Disclosure,
                consentText: feeText,
                checked: false,
                id: auxTerms.length
            };
            auxTerms.push(term);
        } else {
            let term = {
                consentLabel: this.labels.verbiage_Viasat_Billing_No_Installation_Fee_Disclosure,
                consentText: this.verbiages.noFee,
                checked: false,
                id: auxTerms.length
            };
            auxTerms.push(term);
        }
        let billingTerm2 = {
            consentLabel: this.labels.verbiage_Viasat_Billing_Disclosure_2,
            consentText: this.verbiages.billingVerbiage2,
            checked: false,
            id: auxTerms.length
        };
        auxTerms.push(billingTerm2);
        if (this.showDisclosures.vs12) {
            let term = {
                consentLabel: this.labels.verbiage_Viasat_Billing_Service_Commitment_Disclosure,
                consentText: this.verbiages.serviceCom,
                checked: false,
                id: auxTerms.length
            };
            auxTerms.push(term);
        }
        if (this.showDisclosures.choice) {
            let choiceText = this.verbiages.choice.replace("{DATA_AMOUNT} GB", this.showDisclosures.choiceCap);
            let term = {
                consentLabel: this.labels.verbiage_Viasat_Data_Speed_Choice_Plan_Disclosure,
                consentText: choiceText,
                checked: false,
                id: auxTerms.length
            };
            auxTerms.push(term);
        }
        if (this.showDisclosures.unleashed) {
            let term = {
                consentLabel: this.labels.verbiage_Viasat_Data_Speed_Unleashed_Plan_Disclosure,
                consentText: this.verbiages.unleashed,
                checked: false,
                id: auxTerms.length
            };
            auxTerms.push(term);
        }
        if (this.showDisclosures.unleashed || this.showDisclosures.choice) {
            let term = {
                consentLabel: this.labels.verbiage_Viasat_Data_Speed_General_Disclosure,
                consentText: this.verbiages.generalSpeed,
                checked: false,
                id: auxTerms.length
            };
            auxTerms.push(term);
        }
        if (this.showDisclosures.connection25) {
            let term = {
                consentLabel:this.labels.verbiage_Viasat_Connection25_Plan_Disclosure,
                consentText: this.verbiages.connection25,
                checked: false,
                id: auxTerms.length
            };
            auxTerms.push(term);
        }
        if (this.showDisclosures.shield) {
            let term = {
                consentLabel: this.labels.verbiage_Viasat_Shield_Premium_Disclosure,
                consentText: this.verbiages.shield,
                checked: false,
                id: auxTerms.length
            };
            auxTerms.push(term);
        }
        if (this.showDisclosures.voice) {
            let term = {
                consentLabel: this.labels.verbiage_Viasat_Voice_General_Disclosure,
                consentText: this.verbiages.voice,
                checked: false,
                id: auxTerms.length
            };
            auxTerms.push(term);
        }
        if (this.showDisclosures.portability) {
            let term = {
                consentLabel: this.labels.verbiage_iasat_Voice_Porting_Disclosure,
                consentText: this.verbiages.porting,
                checked: false,
                id: auxTerms.length
            };
            auxTerms.push(term);
        }
        if (this.showDisclosures.easyCare) {
            let term = {
                consentLabel: this.labels.verbiage_Viasat_EasyCare_Disclosure,
                consentText: this.verbiages.easyCare,
                checked: false,
                id: auxTerms.length
            };
            auxTerms.push(term);
        }
        this.terms = [...auxTerms];
    }

    handleCancel() {
        if (this.isGuestUser) {
            this.showSelfServiceCancelModal = true;
        } else {
            this[NavigationMixin.Navigate]({
                type: "standard__recordPage",
                attributes: {
                    recordId: this.recordId,
                    objectApiName: "Opportunity",
                    actionName: "view"
                }
            });
        }
    }
    hideSelfServiceModal() {
        this.showSelfServiceCancelModal = false;
    }

    selfServiceReturnToHomePage() {
        const goBackEvent = new CustomEvent("home", {
            detail: "",
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(goBackEvent);
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleCheckbox(event) {
        let disclosures = this.terms.map((item) => {
            if (item.id == event.target.dataset.id) {
                return { ...item, checked: event.target.checked };
            } else {
                return { ...item };
            }
        });
        this.terms = [...disclosures];
        this.disableNext = !this.terms.every((item) => item.checked);
    }

    handleClick() {
        const sendBackEvent = new CustomEvent("next");
        this.dispatchEvent(sendBackEvent);
    }
}