import { LightningElement } from 'lwc';
import saveInteraction from '@salesforce/apex/POE_DealerScoreCardController.saveFirstInteraction';

export default class Poe_lwcClickerFirstInteraction extends LightningElement {
    connectedCallback() {
        this.saveInteractions();
    }

    saveInteractions() {
        saveInteraction({
        })
        .then(result => {
            console.log('Interaction Saved');
        })
        .catch(error => {
            console.log(error);
        });
    }
}