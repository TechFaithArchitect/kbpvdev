import { LightningElement, track, api, wire } from 'lwc';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import WO_OBJECT from '@salesforce/schema/ProductConsumed';
import Location_Field from '@salesforce/schema/ProductConsumed.Location__c';
import updateTmoDetails from "@salesforce/apex/PV_TmoWorkCompletionController.addInventoryProducts";
import locationCheck from "@salesforce/apex/PV_TmoWorkCompletionController.locationCheck";
import statusCheck from "@salesforce/apex/PV_TmoWorkCompletionController.statusCheck";
import workTypeCheck from "@salesforce/apex/PV_TmoWorkCompletionController.workTypeCheck";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from "@salesforce/user/Id";
export default class PvTmobileCompletion extends NavigationMixin(LightningElement) {


    userId = Id;
    loader = false;
    showComp = true;
    @api recordId;
    barcodeScanner;
    @track scannedBarcodes;
    scannedBarcodesAsString = '';
    @track productList;
    location = [];
    locationId = '';
    showDelete = false;
    other = false;
    componentHideMessage = '';
    @track formData = {
        uploadArrivalCG: '',
        downloadArrivalCG: '',
        uploadDepartureCG: '',
        downloadDepartureCG: '',
        uploadArrivalIoT: '',
        downloadArrivalIoT: '',
        uploadDepartureIoT: '',
        downloadDepartureIoT: '',
        existingSIMNumber: '',
        existingMSISDNNumber: '',
        installedSIMNumber: '',
        installedMSISDNNumber: '',
        equipmentValidation1: false,
        installationRepair: false,
        siteSurveyAcknowledgement: false,
        otherTextBox:'',
        Id: ''
    };


    connectedCallback() {
        this.loader = true;
        this.checkWorkType();
        this.barcodeScanner = getBarcodeScanner();
        this.initData();
        this.showDelete = this.productList.length > 1;
    }

    checkWorkType() {
        workTypeCheck({ woId: this.recordId })
            .then(response => {
                if (!response ) {
                    this.loader = false;
                    this.showComp = true;
                    this.statusCheck();
                } else {
                    this.loader = false;
                    this.showComp = false;
                    this.componentHideMessage = 'T-Mobile Completion form is not available for this work type!'
                    this.showNotification('Warning ', 'T-Mobile Completion form is not available for this work type!', 'Warning', 'dismissable');
                }
            }).catch(error => {
                this.loader = false;
                console.log('ERROR in checkWorkType', JSON.stringify(error));
            });
    }

    locationCheck() {
        locationCheck({ userId: this.userId }).then(response => {

            this.locationId = response;
            if (this.locationId == null || this.locationId == '' || this.locationId == undefined) {
                this.showComp = false;
                this.componentHideMessage = 'Inventory location is not available, please contact your Manager!';
                this.loader = false;
                this.showNotification('Warning ', 'Inventory location is not available, please contact your Manager !', 'Warning', 'dismissable');

            } else {
                this.loader = false;
                this.showComp = true;
            }

        }).catch(error => {
            this.loader = false;
            console.log('ERROR in handle submit', JSON.stringify(error));
        });
    }

    statusCheck() {
        statusCheck({ woId: this.recordId }).then(response => {
            if (response) {
                this.loader = false;
                this.showComp = true;
                this.locationCheck();
               
            }else{
                this.loader = false;
                this.showComp = false;
                this.componentHideMessage = 'Completion form is available from Onsite status only! '
                this.showNotification('Warning ', 'Completion form available from Onsite status!', 'Warning', 'dismissable');
            }

        }).catch(error => {
            this.loader = false;
            console.log('ERROR in handle submit', JSON.stringify(error));
        });
    }


    @wire(getObjectInfo, { objectApiName: WO_OBJECT })
    workOrderobjectInfo;

    @wire(getPicklistValues, { recordTypeId: '$workOrderobjectInfo.data.defaultRecordTypeId', fieldApiName: Location_Field })
    locationData({ error, data }) {
        if (data) {
            this.location = data.values.map(objPL => {
                return {
                    label: `${objPL.label}`,
                    value: `${objPL.value}`
                };
            });
        } else if (error) {
            console.error('error location ', JSON.stringify(error));
        }
    }

    initData() {
        let productList = [];
        this.createRow(productList);
        this.selectedNames = Array.from({ length: productList.length }, () => null);
        this.productList = productList;
    }

    createRow(productList) {
        let productObject = {};
        if (productList.length > 0) {
            productObject.index = productList[productList.length - 1].index + 1;
        } else {
            productObject.index = 0;
        }
        productObject.ProductId = null;
        productObject.ProductName = null;
        productObject.SerialNumber = null;
        productObject.Location = null;
        productObject.LocationId = this.LocationId;
        productObject.IsSerialized = false;
        productObject.additionalProduct = false;
        productObject.otherTextBox = null;
        productList.push(productObject);


    }
    /**
     * Adds a new row
     */
    addNewRow() {
        this.createRow(this.productList);
        this.showDelete = true;

    }
    /**
     * Removes the selected row
     */
    removeRow(event) {
        let toBeDeletedRowIndex = event.target.name;
        let productList = [];
        for (let i = 0; i < this.productList.length; i++) {
            let tempRecord = Object.assign({}, this.productList[i]); //cloning object
            if (tempRecord.index !== toBeDeletedRowIndex) {
                productList.push(tempRecord);
            }
        }
        // for (let i = 0; i < productList.length; i++) {
        //     productList[i].index = i + 1;
        // }
        this.productList = productList;
        this.showDelete = productList.length > 1;
    }
   

    handleInputChange(event) {
        let index = event.target.dataset.id;
        let fieldName = event.target.name;
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        
        if (fieldName === 'Location') {
            this.productList[index].Location = value;
            if (value === 'Other') {
                // Enable the "Other" text box for the selected row
                this.productList[index].otherTextBoxEnabled = true;
            } else {
                // Disable the "Other" text box for the selected row
                this.productList[index].otherTextBoxEnabled = false;
                this.productList[index].otherTextBox = null; // Reset the value when disabling
            }
        } else {
            this.productList[index][fieldName] = value;
        }
    }
    
    

    beginScanning(event) {
        // Set your configuration options, including bulk and multi-scanning if desired, in this scanningOptions object
        const rowIndex = event.currentTarget.dataset.rowindex;
        const scanningOptions = {
            barcodeTypes: [this.barcodeScanner.barcodeTypes.CODE_128],
            scannerSize: "FULLSCREEN",
            cameraFacing: "BACK",
            showSuccessCheckMark: true,
            enableBulkScan: false,
            enableMultiScan: false,
        };

        // Make sure BarcodeScanner is available before trying to use it
        if (this.barcodeScanner != null && this.barcodeScanner.isAvailable()) {
            // Reset scannedBarcodes before starting new scanning session
            this.scannedBarcodes = [];

            // Start scanning barcodes
            this.barcodeScanner
                .scan(scanningOptions)
                .then((results) => {
                    this.processScannedBarcodes(results, rowIndex);
                })
                .catch((error) => {
                    this.processError(error);
                })
                .finally(() => {
                    this.barcodeScanner.dismiss();
                });
        } else {
            console.log("BarcodeScanner unavailable. Non-mobile device?");
        }
    }

    processScannedBarcodes(barcodes, rowIndex) {

        console.log(JSON.stringify(barcodes));
        this.scannedBarcodes = this.scannedBarcodes.concat(barcodes);
        this.scannedBarcodesAsString = this.scannedBarcodes.map((barcode) => barcode.value).join("\n");

        this.productList[rowIndex].SerialNumber = this.scannedBarcodesAsString; // Update to rec.serial

    }

    processError(error) {
        // Check to see if user ended scanning
        if (error.code == "USER_DISMISSED") {
            console.log("User terminated scanning session.");
        } else {
            console.error(error);
        }
    }

    productselected(event) {
        const { IndexId, productname, productid, isSerialized } = event.detail;
        this.productList[IndexId].ProductName = productname;
        this.productList[IndexId].ProductId = productid;
        this.productList[IndexId].IsSerialized = isSerialized;
    }

    handleChange(event) {
        const { name, value, type, checked } = event.target;
        this.formData[name] = type === 'checkbox' ? checked : value;
       
    }

    validateForm() {
        let isValid = true;
    
        // Validate each row in the productList array
        for (let i = 0; i < this.productList.length; i++) {
            const product = this.productList[i];
            if (!product.ProductName || !product.SerialNumber || !product.Location) {
                isValid = false;
                this.showNotification('error', 'Please fill in all required fields for each product.', 'Error', 'dismissable');
                return isValid; // Exit the loop and return false if any row is invalid
            }
        }
        
        // Check if location is "Other" and otherTextBox is empty
        if (this.productList.some(product => product.Location === 'Other' && !product.otherTextBox)) {
            this.showNotification('error', 'Please fill in the "Other" field for the selected location.', 'Error', 'dismissable');
            isValid = false;
            return isValid; // Exit the loop and return false if any row is invalid
        }
    
        // Validate other fields
        if (
            !this.formData.uploadDepartureCG ||
            !this.formData.downloadDepartureCG ||
            !this.formData.installedSIMNumber 
        ) {
            isValid = false;
            this.showNotification('error', 'Please fill in all required fields.', 'Error', 'dismissable');
            return isValid; // Return false if any required field is empty
        }
    
        // Allow submission if any checkbox is true
        if (
            this.formData.siteSurveyAcknowledgement || 
            this.formData.installationRepair || 
            this.formData.equipmentValidation1
        ) {
            return true;
        }
    
        // No checkbox is true
        isValid = false;
        this.showNotification('error', 'Please select at least one checkbox.', 'Error', 'dismissable');
        return isValid;
    }
    
    

    handleSubmit() {

        const unique = [];
        const dupe = [];
        for (const item of this.productList) {
            const duplicate = unique.find(
                (obj) => obj.ProductName === item.ProductName && obj.SerialNumber === item.SerialNumber && item.IsSerialized == true
            );
            if (!duplicate) {
                unique.push(item);
            } else {

                dupe.push(item.ProductName);
            }
        }
        if (dupe.length > 0) {

            this.showNotification('Error', 'Please enter unique serial number for for the product ' + dupe, 'error');
            return;


        }
        this.loader = true;
        this.showComp = false;
        if (!this.validateForm()) {
            this.loader = false;
            this.showComp = true;
            return; 
        }

        this.formData.Id = this.recordId;
        console.log('formData---------', JSON.stringify(this.productList));
        updateTmoDetails({ formData: this.formData, productsJson: JSON.stringify(this.productList), locationId: this.locationId})
            .then(response => {
                console.log('response', JSON.stringify(response));
                if (response) {
                    this.loader = false;
                    this.showComp = false;
                    this.componentHideMessage = 'Report submitted successfully!';
                    this.showNotification('Success', 'Report submitted successfully!', 'Success', 'dismissable');
                }

            }).catch(error => {
                console.log('error',JSON.stringify(error));
                this.showNotification('error', 'The selected Serial Number is already added/consumed, Please try again.', 'error', 'dismissable');
                this.showComp = true;
                this.loader = false;

            });
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