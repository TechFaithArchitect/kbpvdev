import { LightningElement, api } from 'lwc';

export default class Poe_lwcBroadbandLabel extends LightningElement {
    @api broadbandLabel;
    @api sectionLabel;
    @api template = false;
    
    isOpen = false;

    get defaultLabel() {
        return this.sectionLabel || 'Broadband Label';
    }

    get iconName() {
        return this.isOpen ? 'utility:chevrondown' : 'utility:chevronright';
    }

    @api 
    open() {
        this.isOpen = true;
    }

    toggleOpen(e) {
        e.stopPropagation();
        e.preventDefault();

        this.isOpen = !this.isOpen;
    }
}