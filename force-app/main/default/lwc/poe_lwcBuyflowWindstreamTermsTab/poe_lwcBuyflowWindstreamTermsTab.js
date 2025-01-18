import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import verbiageTop from "@salesforce/label/c.Windstream_Terms_Top";
import verbiageBottom from "@salesforce/label/c.Windstream_Terms_Bottom";
import termsLabel from "@salesforce/label/c.Terms_Tab_Name_Label";
import checkboxLabel from "@salesforce/label/c.Chuzo_Dealer_Terms_Tab_Checkbox_Agree_Message";

export default class Poe_lwcBuyflowWindstreamTermsTab extends NavigationMixin(LightningElement) {
    @api applicableDisclaimers;
    @api referenceNumber;
    @api logo;
    @api isGuestUser;
    @api recordId;
    showCollateral = false;
    labels = {
        verbiageTop,
        verbiageBottom,
        termsLabel,
        checkboxLabel
    };
    terms;
    disableNext = true;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        this.terms = this.applicableDisclaimers.map((disclaimer, index) => ({
            ...disclaimer,
            checked: false,
            id: `term-${index}`
        }));
        this.labels.verbiageTop = "<strong>" + this.labels.verbiageTop + "</strong>";
        this.labels.verbiageBottom = "<strong>" + this.labels.verbiageBottom + "</strong>";
    }

    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: this.recordId,
                objectApiName: "Opportunity",
                actionName: "view"
            }
        });
    }

    handleCheckbox(event) {
        const targetId = event.target.dataset.id;
        const foundItem = this.terms.find((item) => item.id == targetId);

        if (foundItem) {
            foundItem.checked = event.target.checked;
            this.disableNext = !this.terms.every((item) => item.checked);
        }
    }

    handleClick() {
        const sendTermsNextEvent = new CustomEvent("termsnext");
        this.dispatchEvent(sendTermsNextEvent);
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }
}