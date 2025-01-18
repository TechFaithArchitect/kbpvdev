import { LightningElement, api } from 'lwc';

export default class Poe_lwcBuyflowDirecTvEngaOfferOptions extends LightningElement {
    @api categoryLabel;
    @api feeLabel;
    @api showCategoryColumn;
    @api promos;
    @api showFullDescription;

    get showDescriptionIcon() {
        return !this.showFullDescription;
    }

    get categorySectionLabel() {
        return this.categoryLabel || 'Category';
    }

    get feeSectionLabel() {
        return this.feeLabel || 'Monthly Fee';
    }

    handleToggleChange(event) {
        this.dispatchEvent(new CustomEvent('togglechange', {
            detail: {
                checked: event.target.checked,
                id: event.target.dataset.id
            }
        }));
    }

    handleShowInfo(event) {
        this.dispatchEvent(new CustomEvent('showdata', {
            detail: {
                clientX: event.clientX,
                cleintY: event.clientY,    
                id: event.target.dataset.id
            }
        }));
    }
}