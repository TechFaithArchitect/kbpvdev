import { LightningElement, api, track } from 'lwc';
import handleDeleteFiles from '@salesforce/apex/PV_ProductTransferController.handleDeleteFiles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class FileUploader extends LightningElement {

    @track fileDataList = [];

    handleUploadFinished(event) {

        this.fileDataList = [...this.fileDataList, ...event.detail.files];
        this.handleDispatchUpdateEvent();
    }

    handleDeleteFile(event) {

        this.fileDataList = this.fileDataList.filter(file => file.name !== event.target.dataset.filename);
        const fileToDelete = this.fileDataList.filter(file => file.name === event.target.dataset.filename);

        handleDeleteFiles({files: fileToDelete})
            .then(result => {

                this.handleDispatchUpdateEvent();
                console.log('Successfully Deleted');
            })
            .catch(error => {

                const event = new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error',
                    mode: 'dismissable'
                });
                this.dispatchEvent(event);
            });

        this.handleDispatchDeleteEvent();
    }

    handleDispatchUpdateEvent() {

        if (this.fileDataList.length > 0) {

            this.dispatchEvent(new CustomEvent('fileupload', {
                detail: this.fileDataList
            }));
        }
    }

    handleDispatchDeleteEvent() {   

        this.dispatchEvent(new CustomEvent('filedelete', {
                detail: this.fileDataList
        }));
    }

    get acceptedFormats() {
        return ['.png, .jpg, .jpeg, .gif'];
    }
}