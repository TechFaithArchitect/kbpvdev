import { LightningElement } from 'lwc';
import saveInteraction from '@salesforce/apex/POE_DealerScoreCardController.saveInteraction';

export default class Poe_lwcDoorToDoorInteraction extends LightningElement {
    connectedCallback() {
        this.saveInteractions();
    }

    saveInteractions() {
        saveInteraction({
            isMaps: true
        })
        .then(result => {
            console.log('Interaction Saved');
        })
        .catch(error => {
            console.log(error);
        });
    }
}