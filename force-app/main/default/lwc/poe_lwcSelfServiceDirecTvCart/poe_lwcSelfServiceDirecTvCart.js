import { LightningElement, api } from "lwc";

export default class Poe_lwcSelfServiceDirecTvCart extends LightningElement {
    @api 
    get cartInfo() {
        return this.cart;
    }
    set cartInfo(value) {
        if (value) {
            this.cart = { 
                ...value,
                todayCharges: value.todayCharges 
                        ? this.setChargeListIds(value.todayCharges) 
                        : value.todayCharges,
                monthlyCharges: value.monthlyCharges 
                        ? this.setChargeListIds(value.monthlyCharges) 
                        : value.monthlyCharges,
                firstBillCharges: value.firstBillCharges 
                        ? this.setChargeListIds(value.firstBillCharges) 
                        : value.firstBillCharges,
            }
        }
    }
    @api cartIcon;
    @api cartTitle;
    @api cartSubtitle;
    hasRendered = false;
    adjustHeightListener;
    cart;

    connectedCallback() {
        this.adjustHeightListener = () => {
            this.adjustContentHeight();
        };  
        window.addEventListener("resize", this.adjustHeightListener);
    }

    disconnectedCallback() {
        window.removeEventListener("resize", this.adjustHeightListener);
    }

    renderedCallback() {
        if (!this.hasRendered) {
            this.adjustContentHeight();
        }

        this.hasRendered = true;
    }

    adjustContentHeight() {
        const panelContent = this.template.querySelector(".panel-content");
        const panelFooter = this.template.querySelector(".panel-footer");
        if (!panelContent || !panelFooter) return;

        const footerHeight = panelFooter.clientHeight + 48; // Add 48px for padding
        panelContent.style.height = `calc(100% - ${footerHeight}px)`;
    }

    setChargeListIds(charges = []) {
        return charges.map((charge, i) => {
            return {
                ...charge,
                id: `${charge.name}-${i}-${Math.random()}`
            };
        });
    }
}