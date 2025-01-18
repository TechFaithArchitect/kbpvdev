import { LightningElement, api } from 'lwc';

export default class Poe_lwcBuyflowDirecTvEngaProductOption extends LightningElement {
    @api product;
    @api included;
    @api selectedProduct;
    isChecked = false;

    renderedCallback() {
        this.isChecked = this.selectedProduct === this.product.Id;;
    }

    handleDisclosure() {
        this.dispatchEvent(new CustomEvent('showdisclosure'));
    }

    handlePriceChange(event) {
        this.dispatchEvent(new CustomEvent('pricechange', {
            detail: {
                value: event.target.value
            }
        }));
    }

}