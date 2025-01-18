import { LightningElement,api,track,wire } from 'lwc';
import getResults from '@salesforce/apex/PV_ServiceResourceMultiSelectLookupCtrl.getResults';
import createServiceTerritory from '@salesforce/apex/PV_ServiceResourceMultiSelectLookupCtrl.insertServiceTerritory';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class LwcMultiLookup extends LightningElement {
    @api objectName = 'ServiceTerritory';
    @api recordId;
    @api fieldName = 'Name';
    @api placeholder = 'Select Regions of Operation...';
    @track searchRecords = [];
    @track selectedRecords = [];
    @track strId = [];
    @api required = false;
    @api iconName = 'standard:service_territory'
    @api LoadingText = false;
    @track txtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    @track messageFlag = false;
    @api loaded = false;
    @track isDealerCode;
    @track accrecord;

    @wire(getRecord, { recordId: '$recordId', fields: ['Account.POE_Dealer_Code__c'] })
    wiredAccount({ error, data }) {
        if (data) {
            this.accrecord = data;
            if(this.accrecord.fields.POE_Dealer_Code__c.value == null){
                this.isDealerCode = false;
            }else{
                this.isDealerCode = true;
            }

        } else if (error) {
            this.isDealerCode = undefined;
        }
    }
 
    searchField(event) {

        var currentText = event.target.value;
        var selectRecId = [];
        var selectedid = [];
        for(let i = 0; i < this.selectedRecords.length; i++){
            selectRecId.push(this.selectedRecords[i].recId);
        }
        this.LoadingText = true;
        getResults({ ObjectName: this.objectName, fieldName: this.fieldName, value: currentText, selectedRecId : selectRecId })
        .then(result => {
            this.searchRecords= result;
            this.LoadingText = false;            
            this.txtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
            if(currentText.length > 0 && result.length == 0) {
                this.messageFlag = true;
            }
            else {
                this.messageFlag = false;
            }

            if(this.selectRecordId != null && this.selectRecordId.length > 0) {
                this.iconFlag = false;
                this.clearIconFlag = true;
            }
            else {
                this.iconFlag = true;
                this.clearIconFlag = false;
            }
        })
        .catch(error => {
            console.log('-------error-------------'+error);
            console.log(error);
        });
        
    }
    
   setSelectedRecord(event) {
        var recId = event.currentTarget.dataset.id;
        var selectName = event.currentTarget.dataset.name;
        let newsObject = { 'recId' : recId ,'recName' : selectName };
        this.selectedRecords.push(newsObject);
        this.strId.push(recId);
        this.txtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        let selRecords = this.selectedRecords;
		this.template.querySelectorAll('lightning-input').forEach(each => {
            each.value = '';
        });
        const selectedEvent = new CustomEvent('selected', { detail: {selRecords}, });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }

    createServiceTerritoryRecords(event) {
        this.loaded = !this.loaded;
        if (this.selectedRecords.length === 0) {
            // Display a message that no Service Territory are selected
            const event = new ShowToastEvent({
                title: 'Error',
                message: 'No Service Territory selected',
                variant: 'error'
            });
            this.dispatchEvent(event);
            this.loaded = false;
            return;
        }
        
        // create ServiceTerritory for each selected record
        createServiceTerritory({
            acc: this.recordId,
            serviceTry: this.strId
        }).then((result) => {
            // Display a message that Service Territory created
            const event = new ShowToastEvent({
                title: 'Success',
                message: 'Service Territory created',
                variant: 'Success'
            });
            this.dispatchEvent(event);
            this.dispatchEvent(new CloseActionScreenEvent());
        }).catch((error)=>{
            // Display a message that Duplicate Service Territory found
            const event = new ShowToastEvent({
                title: 'Error',
                message: error.body.message,
                variant: 'error'
            });
            this.dispatchEvent(event);
            this.loaded = false;
        });
       
    }

    // Remove records
    removeRecord (event){
        let selectRecId = [];
        let selectedid = [];
        for(let i = 0; i < this.selectedRecords.length; i++){
            if(event.detail.name !== this.selectedRecords[i].recId){
                selectRecId.push(this.selectedRecords[i]);
                selectedid.push(this.selectedRecords[i].recId);
            }
        }
        this.selectedRecords = [...selectRecId];
        this.strId=[...selectedid];
    }

    // Closes the model box
    handleCloseClick() {
        
        this.dispatchEvent(new CloseActionScreenEvent());
      }
}