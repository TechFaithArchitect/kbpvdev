import { LightningElement,api,wire} from 'lwc';
import fetchLookupData from '@salesforce/apex/ObjectCustomLookupController.fetchLookupData';

const DELAY = 300; // dealy apex callout timing in miliseconds  

export default class Poe_objectCustomLookup extends LightningElement {
    // public properties with initial default values 
    @api label = 'custom lookup label';
    @api placeholder = 'search...'; 
    @api iconName = 'standard:account';
    @api sObjectApiName = 'Account';
    @api additionalFilters;
    @api additionalFields;
    @api defaultRecordId = '';
    @api allowMultipleSelections = false;
    // private properties 
    lstResult = []; // to store list of returned records   
    hasRecords = true; 
    searchKey=''; // to store input field value    
    isSearchLoading = false; // to control loading spinner  
    delayTimeout;
    selectedRecord = {}; // to store selected lookup record in object formate 

    get notHasRecords() {
        return !this.hasRecords;
    }

    connectedCallback(){
        this.fetchData();
    }

    fetchData() {
        fetchLookupData({ searchKey: this.searchKey , sObjectApiName : this.sObjectApiName, additionalFilters : this.additionalFilters, additionalFields: this.additionalFields })
        .then(response => {
            this.isSearchLoading = false;
            if (response) {
                 this.hasRecords = response.length == 0 ? false : true; 
                 this.lstResult = response; 
             }
        })
        .catch(error => {
            console.error(error);
        })

    }
       
  // update searchKey property on input field change  
    handleKeyChange(event) {
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        this.isSearchLoading = true;
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.searchKey = searchKey;
            this.fetchData();
        }, DELAY);
    }
    // method to toggle lookup result section on UI 
    toggleResult(event){
        const lookupInputContainer = this.template.querySelector('.lookupInputContainer');
        const clsList = lookupInputContainer.classList;
        const whichEvent = event.target.getAttribute('data-source');
        switch(whichEvent) {
            case 'searchInputField':
                clsList.add('slds-is-open');
               break;
            case 'lookupContainer':
                clsList.remove('slds-is-open');    
            break;                    
           }
    }

    handleRemove(){
        this.searchKey = '';    
        this.selectedRecord = {};
        this.lookupUpdatehandler(undefined); // update value on parent component as well from helper function 
        
        // remove selected pill and display input field again 
        const searchBoxWrapper = this.template.querySelector('.searchBoxWrapper');
        searchBoxWrapper.classList.remove('slds-hide');
        searchBoxWrapper.classList.add('slds-show');
        const pillDiv = this.template.querySelector('.pillDiv');
        pillDiv.classList.remove('slds-show');
        pillDiv.classList.add('slds-hide');
    }
    // method to update selected record from search result 
    handelSelectedRecord(event){   
        var objId = event.target.getAttribute('data-recid'); // get selected record Id 
        this.selectedRecord = this.lstResult.find(data => data.Id === objId); // find selected record from list 
        this.lookupUpdatehandler(this.selectedRecord); // update value on parent component as well from helper function 
        if(!this.allowMultipleSelections){
            this.handelSelectRecordHelper(); // helper function to show/hide lookup result container on UI
        }
    }
    /*COMMON HELPER METHOD STARTED*/
    handelSelectRecordHelper(){
        this.template.querySelector('.lookupInputContainer').classList.remove('slds-is-open');
        const searchBoxWrapper = this.template.querySelector('.searchBoxWrapper');
        searchBoxWrapper.classList.remove('slds-show');
        searchBoxWrapper.classList.add('slds-hide');
        const pillDiv = this.template.querySelector('.pillDiv');
        pillDiv.classList.remove('slds-hide');
        pillDiv.classList.add('slds-show');     
    }
    // send selected lookup record to parent component using custom event
    lookupUpdatehandler(value){    
        const oEvent = new CustomEvent('lookupupdate',
            {
                'detail': {
                    selectedRecord: value
                }
            }
        );
        this.dispatchEvent(oEvent);
    }
}