import { LightningElement, track } from 'lwc';
import getResults from '@salesforce/apex/PV_InventroyDetailsController.getInventoryDetails';
import USER_ID from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PvDispatcherInventoryView extends LightningElement {

    @track inventoryData = [];
    userId = USER_ID;
    startDate;
    showInventory = false;
    endDate;
   

    connectedCallback() {
        this.getTodaysDate();
    }

    getInventoryDetails() {
        getResults({ usrId: this.userId ,startDate: this.startDate ,endDate:this.endDate})
            .then(result => {
                this.inventoryData = result;
                if (this.inventoryData != '') {
                    this.showInventory = true;
                }
                else{
                    this.showInventory = false;
                }
                console.log("inventoryData>>>", JSON.stringify(this.inventoryData));
            })
            .catch((error) => {

                console.error('error inside' + JSON.stringify(error));

            });
    }
    handleSectionToggle(event) {
        console.log(event.detail.openSections);
    }

    getTodaysDate() {
        let today = new Date() ;
        let dd = today.getDate()+1;
        let mm = today.getMonth() + 1;
        let y = today.getFullYear();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        this.startDate = y + '-' + mm + '-' + dd;
        this.getInventoryDetails();
        console.log("todaysDate",this.startDate);  
    }

    handleDateChange(event){
        this.endDate = event.target.value;
        if(this.endDate < this.startDate){
            this.showNotification('Error','Please select a future date')

        }
        this.getInventoryDetails();
    }

    // Toast Message
    showNotification(variantVal, messageVal, titleVal, modeVal) {
        const evt = new ShowToastEvent({
            variant: variantVal,
            message: messageVal,
            title: titleVal,
            mode: modeVal
        });
        this.dispatchEvent(evt);
    }

}