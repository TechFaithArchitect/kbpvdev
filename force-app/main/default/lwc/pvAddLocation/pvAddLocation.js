import { LightningElement,api} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import submitForLocationApproval from '@salesforce/apex/PV_AddLocation.submitForLocationApproval';

export default class PvAddLocation extends LightningElement {
@api recordId;
locationType = '';
isInventory = false;
isMobile = false;
locationName = '';
serviceResource = null;
showSpinner = false;
showResource = false;

handleNameChange(event) {
    this.locationName = event.target.value;
}
handleInventoryChange(event) {
    this.isInventory = event.target.value;
}
handleResourceChange(event) {
    this.serviceResource = event.target.value;
}
handleMobileChange(event) {
    this.isMobile = event.target.value;
}
handleTypeChange(event) {
    this.locationType = event.target.value;
    if(this.locationType === 'Van'){
        this.showResource = true;
    }else{
        this.showResource = false;
        this.serviceResource = null;
    }
}

handleSuccess() {
    this.showSpinner = true;
    if (this.locationName && this.locationType) {
        console.log('serviceResource : ',this.serviceResource);
        console.log('this.showResource : ',this.showResource);
        submitForLocationApproval({ 
            accountId: this.recordId,
            locationName: this.locationName,
            isInventory: this.isInventory,
            isMobile: this.isMobile,
            locationType: this.locationType,
            serviceResource: this.serviceResource
        })
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records submitted successfully',
                    variant: 'success'
                })
            );
            this.handleCloseClick();
            // Reset input field values
            // this.locationName = '';
            // this.locationType = '';
            // this.isInventory = false;
            // this.isMobile = false;
        })
        .catch((error) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                })
            );
            this.showSpinner = false;
        });
    } else {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Required',
                message: 'Please fill in the Location Name and Location Type',
                variant: 'error'
            })
        );
        this.showSpinner = false;
    }
}

    handleCloseClick() {
        //this.dispatchEvent(new CloseActionScreenEvent());
        const closeEvent = new CustomEvent('close');
        this.dispatchEvent(closeEvent);
    }
}