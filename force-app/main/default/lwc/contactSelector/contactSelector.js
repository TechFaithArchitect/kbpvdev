import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import saveContact from '@salesforce/apex/ContactSelectorController.saveContact';

const columns = [
    { label: 'Contact Name', fieldName: 'Name' },
    { label: 'Contact Email', fieldName: 'Email' },
    { label: 'Contact Account', fieldName: 'AccountName' },
    {
        type: 'button-icon',
        initialWidth: 75,
        typeAttributes: { 
            iconName: 'action:delete'
        }
    }
];

export default class ContactSelector extends LightningElement {
    @api 
    get accountId () {
        return this._accountId;
    };
    set accountId(value) {
        this._accountId = value; 
    }
    _accountId;
    @api
    get accountName(){
        return this._accountName;
    }
    set accountName(value){
        this._accountName = value;
    }
    _accountName;
    @api
    get contactIds(){
        return this._contactIds;
    }
    set contactIds(value = []) {
        this._contactIds = value;
    }
    _contactIds = [];
    chuzoAgent = true;
    @track data = [];
    columns = columns;
    get contactsSelected() {
        return this.data.length > 0
    }
    firstName;
    lastName;
    email;
    phone;
    showLoaderSpinner = false;
    filters;
    hasError = false;
    errorMessage;

    connectedCallback(){
        this.filters = 'AccountId = \'' + this.accountId + '\'';
    }

    handleToggle(event){
        this.chuzoAgent = event.target.checked;
    }

    handleChange(event){
        switch (event.target.name) {
            case "firstName":
                this.firstName = event.target.value;
                break;
            case "lastName":
                this.lastName = event.target.value;
                break;
            case "email":
                this.email = event.target.value;
                break;
            case "phone":
                this.phone = event.target.value;
                break;
        }
    }

    handleAddContact(){
        this.hasError = false;
        this.showLoaderSpinner = true;
        let myData = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
            accountId: this.accountId
        };
        saveContact({ myData: myData })
        .then(response => {
            let data = this.data;
            let newdata = {
                Name: response.FirstName + " " + response.LastName,
                Email: response.Email,
                Id: response.Id,
                AccountName: this.accountName
            }
            data.push(newdata);
            this.data = data.slice();

            this.firstName = undefined;
            this.lastName = undefined;
            this.email = undefined;
            this.phone = undefined;

            this._contactIds.push(newdata.Id);
        })
        .catch(error => {
            console.error(error);
            this.hasError = true;
            this.errorMessage = error.body.message;

        })
        .finally(() => {
            this.showLoaderSpinner = false;
        })
    }

    handleLookup(event) {
        if(event.detail.selectedRecord){
            let data = this.data;
            let selectedRecord = event.detail.selectedRecord;
            let newData = {
                Name: selectedRecord.Name,
                Email: selectedRecord.Email,
                Id: selectedRecord.Id,
                AccountName: selectedRecord.Account.Name
            }
            data.push(newData);
            this.data = data.slice();

            this._contactIds.push(newData.Id);
            this.generateFilters();
        }
    }

    handleRowAction(event){
        let rowId = event.detail.row.Id;
        let data = this.data;

        let index = data.findIndex(item => item.Id == rowId);
        data.splice(index, 1)
        this.data = data.slice();

        let idIndex = this._contactIds.indexOf(rowId);
        this._contactIds.splice(idIndex, 1);
        this.generateFilters();
    }

    generateFilters(){
        let newFilter = 'AccountId = \'' + this.accountId + '\'';
        if(this.contactIds.length > 0){
            let filterIds = this.contactIds.map(id => '\'' + id + '\'');
            newFilter += ' AND Id NOT IN (' + filterIds.join(',') + ')';
        }
        this.filters =  newFilter;
    }
}