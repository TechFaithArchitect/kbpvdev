import { LightningElement } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import { CloseActionScreenEvent } from 'lightning/actions';
import PVTechProductURL from '@salesforce/label/c.PVTechProductURL';

export default class PvTechInventory   extends NavigationMixin( LightningElement ) {
    PVTechProductURL=PVTechProductURL;

    connectedCallback(){
        this.handleNavigate();

    }

    handleNavigate() {
        const config = {
            type: 'standard__webPage',
            attributes: {
                url: this.PVTechProductURL
            }
        };
        this[NavigationMixin.Navigate](config);
        this.dispatchEvent(new CloseActionScreenEvent());
      }
}