import { LightningElement,wire, api,track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getResourceList from '@salesforce/apex/PV_CreateStmController.getResourceList';
import getStmAsscociatedWithResource from '@salesforce/apex/PV_CreateStmController.getStmAsscociatedWithResource';
import createStm from '@salesforce/apex/PV_CreateStmController.createStm';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class PvCreateNewSTM extends LightningElement {
    @api recordId;
    serviceResource;
    showResourceRegion = false;
    isLoading = true;
    startDate;
    @track serviceResourceOptions = [];
    @track record;
    @track error;
    @track resourceList;
    selectedRegions = [];

    @wire(getResourceList, {
        accountId: '$recordId'
    })
    wiredAccount({
        error,
        data
    }) {
        if (data) {
            this.record = data;
            this.record.forEach(value => {
                this.serviceResourceOptions = [...this.serviceResourceOptions, {
                    value: value.Id,
                    label: value.Name
                }];
            });
            this.isLoading = false;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.record = undefined;
        }
    }
    connectedCallback(){
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        this.startDate = `${year}-${month}-${day}`;
    }

    handleServiceResourceChange(event) {
        this.serviceResource = event.detail.value;
        this.selectedRegions = [];
        this.resourceList = [];
        this.getRegionAssociatedWithResource();

    }
    getRegionAssociatedWithResource() {
        getStmAsscociatedWithResource({
                resourceId: this.serviceResource,
                accountId: this.recordId
            })
            .then((response) => {
                this.resourceList = response;
                this.showResourceRegion = this.resourceList && this.resourceList.length > 0;

            })
            .catch((error) => {
                console.error(error);
            })

    }
    handleStartDateChanged(event) {
        this.startDate = event.detail.value;
        if(this.startDate == null){
            this.selectedRegions = [];
        }
       
    }
    handleSelect(event) {
        if (event.target.checked) {
            const selected = [...this.selectedRegions];
            selected.push(event.target.dataset.id);

            this.selectedRegions = selected;

        } else if (!event.target.checked) {

            this.selectedRegions = this.selectedRegions.filter(item => item !== event.target.dataset.id);
        }
        

    }
    handleSave() {
        if (this.selectedRegions.length > 0 && this.startDate && this.serviceResource) {
            this.isLoading = true;
            createStm({
                    resourceRegionList: this.selectedRegions,
                    resourceId: this.serviceResource,
                    startDate: this.startDate
                })
                .then((response) => {

                    this.resourceList.forEach((value, index) => {
                        if (this.selectedRegions.includes(value.serviceTerritoryId)) {
                            value.isTerritoryMember = true;
                        }
                    });
                    this.selectedRegions = [];
                    this.isLoading = false;
                    this.showToastAndDispatch('Success !!', 'Service Territory Membership Created', 'success');
                })
                .catch((error) => {
                    console.error(error);
                    this.isLoading = false;
                    this.showToastAndDispatch('Error !!', 'Failed to create records', 'error');
                })
        } else {
            this.showToastAndDispatch('Error !!', 'Required Field Missing', 'error');
        }

    }
    get showResourceTable() {
        return this.resourceList && this.resourceList.length > 0 && this.startDate;
    }
    get showSaveButton() {
        return this.selectedRegions && this.selectedRegions.length > 0 ? false : true;
    }
    showToastAndDispatch(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
    get isResourceAvailable(){
        return this.serviceResourceOptions && this.serviceResourceOptions.length >0 ?true : false;
    }

}