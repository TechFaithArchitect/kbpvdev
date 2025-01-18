import { LightningElement, track, api } from 'lwc';
import getResults from '@salesforce/apex/PV_InventoryController.getResults';
import addInventoryProducts from '@salesforce/apex/PV_InventoryController.addInventoryProducts';
import getUserInformation from '@salesforce/apex/PV_InventoryController.getUserInformation';
import transferProduct from '@salesforce/apex/PV_ProductTransferController.transferProduct';
import handleDefectProduct from '@salesforce/apex/PV_ProductTransferController.handleDefectProduct';
import techlocationerror from "@salesforce/label/c.techlocationerror";
import VfOriginLabel from '@salesforce/label/c.PVVfOrigin';
import scannerurl from '@salesforce/label/c.PVScannerUrl';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";

export default class PvAddProducts extends NavigationMixin(LightningElement) {
    techerror = techlocationerror;
    @track searchKey;
    @track isLoading;
    @api screenType;
    scanurl = scannerurl;
    @api RMA = false;
    @api selectRecordId = '';
    @api selectRecordName;
    @api Label;
    @api searchRecords = [];
    @api required = false;
    @api readonly = false;
    @track Location = 'Location';
    @track productList;
    @track keyIndex = 0;
    @track showmodal;
    @track currentIndex;
    @track locationId = '';
    @track TargetlocationId;
    @track style;
    @track readonly;
    @track iconFlag = false;
    @track clearIconFlag = false;
    @track selectedPrimaryName;
    @track LocationError = false;
    @track itemList = [
        {
            idv: this.keyIndex,
            ProductName: '',
            ProductId: '',
            SerialNumber: '',
            Quantity: '',
            rmaNumber: '',
            IsSerialized: true,
            NotSerialized: true
        }
    ];
    transfer = false;
    connectedCallback() {

        var VfOrigin = VfOriginLabel;
        window.addEventListener("message", (message) => {
            if (message.origin !== VfOrigin) {
                //Not the expected origin
                return;
            }

            //handle the message
            if (message.data.name === "VFToLWCMessage") {
                this.itemList[this.currentIndex].SerialNumber = message.data.payload;
            }
        });

        if (this.screenType == 'Product transfer') {

            this.transfer = true;
            this.Location = 'Source Location';
        }

        if (this.screenType == 'RMA screen') {
            this.transfer = false;
            this.Location = 'Location';
            this.RMA = true;
        }

        getUserInformation()
            .then(result => {

                if (result.isTechnician) {

                    this.selectedPrimaryName = result.locationName;
                    this.locationId = result.locationId;
                    this.readonly = result.isTechnician;
                    this.iconFlag = false;
                    this.clearIconFlag = true;
                    this.readonly = true;

                    if (result.locationId == undefined || result.locationId == '') {

                        this.LocationError = true;
                    }
                }
            })
            .catch(error => {

                this.error = error;
                console.log(error);
            });

        if (screen.width < 500) {

            this.style = 'bgcolor'
        }
    }

    addRow(event) {
        if (this.screenType == 'RMA screen') {
            if (this.itemList[event.currentTarget.dataset.id].IsSerialized === false) {
                this.showToast('Error', 'Select defected Serialized Product', 'error');
                return;
            }

            /*
            if (this.itemList[event.currentTarget.dataset.id].rmaNumber == '') {
                this.showToast('Error', 'Fill RMA number', 'error');
                return;
            }
            */
        }

        if (this.itemList[event.currentTarget.dataset.id].ProductName === '') {
            this.showToast('Error', 'Fill Product field', 'error');
            return;
        }
        if (this.itemList[event.currentTarget.dataset.id].IsSerialized === true && this.itemList[event.currentTarget.dataset.id].SerialNumber === '') {
            this.showToast('Error', 'Fill Serial Number field', 'error');
            return;
        }

        if (this.itemList[event.currentTarget.dataset.id].IsSerialized === false && this.itemList[event.currentTarget.dataset.id].Quantity === '') {
            this.showToast('Error', 'Fill Quantity field', 'error');
            return;
        }
        ++this.keyIndex;

        this.itemList.push({
            idv: this.keyIndex,
            ProductName: '',
            ProductId: '',
            SerialNumber: '',
            Quantity: '',
            rmaNumber: '',
            IsSerialized: true,
            NotSerialized: true

        });
    }

    addSl(event) {
        if (this.screenType == 'RMA screen') {
            if (this.itemList[event.currentTarget.dataset.id].IsSerialized == false) {

                this.showToast('Error', 'Select defected Serialized Product', 'error');
                return;
            }
        }

        if (this.itemList[event.currentTarget.dataset.id].SerialNumber === '') {
            const event = new ShowToastEvent({
                title: 'Error',
                message: 'Add serial number to product',
                variant: 'error',
                mode: 'dismissable'
            });
            this.dispatchEvent(event);
            return;
        }
        ++this.keyIndex;
        console.log(this.itemList[event.currentTarget.dataset.id].SerialNumber);
        this.itemList.push({
            idv: this.keyIndex,
            ProductName: this.itemList[event.currentTarget.dataset.id].ProductName,
            ProductId: this.itemList[event.currentTarget.dataset.id].ProductId,
            rmaNumber: '',
            SerialNumber: '',
            Quantity: '',
            IsSerialized: this.itemList[event.currentTarget.dataset.id].IsSerialized,
            NotSerialized: this.itemList[event.currentTarget.dataset.id].NotSerialized

        });
    }

    removeRow(event) {
        if (this.itemList.length > 1) {
            this.itemList.splice(event.currentTarget.dataset.id, 1);
        } else {
            this.itemList = [
                {
                    idv: 0,
                    ProductName: '',
                    ProductId: '',
                    SerialNumber: '',
                    Quantity: '',
                    rmaNumber: '',
                    IsSerialized: true,
                    NotSerialized: true
                }
            ];
        }
    }

    productselected(event) {
        if (this.screenType == 'RMA screen' && event.detail.isSerialized === false) {
            this.showToast('Error', 'Please select a defected serialized Product', 'error');
        }

        if (event.detail.productname === '') {
            this.itemList[event.detail.IndexId].SerialNumber = '';
            this.itemList[event.detail.IndexId].Quantity = '';
            this.itemList[event.detail.IndexId].rmaNumber = '';
            this.itemList[event.detail.IndexId].IsSerialized = true;
            this.itemList[event.detail.IndexId].NotSerialized = true;
            return;
        }

        if (event.detail.isSerialized === true) {
            this.itemList[event.detail.IndexId].IsSerialized = true;
            this.itemList[event.detail.IndexId].NotSerialized = false;
        } else {
            this.itemList[event.detail.IndexId].IsSerialized = false;
            this.itemList[event.detail.IndexId].NotSerialized = true;
        }

        this.itemList[event.detail.IndexId].ProductName = event.detail.productname;
        this.itemList[event.detail.IndexId].ProductId = event.detail.productid;
    }

    slnumberchange(event) {
        this.itemList[event.currentTarget.dataset.id].SerialNumber = event.target.value;
    }

    rmaNumberchange(event) {
        this.itemList[event.currentTarget.dataset.id].rmaNumber = event.target.value;
    }

    quantitychange(event) {
        if (event.target.value < 999 && event.target.value > 0) {
            this.itemList[event.currentTarget.dataset.id].Quantity = event.target.value;
        } else {
            if (event.target.value > 999) {
                let text = event.target.value.toString().substr(0, 3);
                this.itemList[event.currentTarget.dataset.id].Quantity = parseInt(text);
                this.showToast('Error', 'Maximum 3 digits allowed ', 'error');
            }
        }
    }

    Submit() {
        const unique = [];
        const dupe = [];
        for (const item of this.itemList) {
            // 👇 "ProductName" and "SerialNumber" used for duplicate check
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
            this.showToast('Error', 'Please enter unique serial number for for the product ' + dupe, 'error');
            return;
        }

        for (let i = 0; i < this.itemList.length; i++) {
            let j = i + 1;

            if (this.itemList[i].IsSerialized == false && this.screenType == 'RMA screen') {
                this.showToast('Error', 'Select defected Serialized Product in row ' + j, 'error');
                return;
            }

            if (this.itemList[i].ProductName == '') {
                this.showToast('Error', 'Fill Product field in row ' + j, 'error');
                return;
            }

            if (this.itemList[i].IsSerialized == true && this.itemList[i].SerialNumber == '') {

                this.showToast('Error', 'Fill Serial Number field in row ' + j, 'error');
                return;
            }

            if (this.itemList[i].IsSerialized == false && this.itemList[i].Quantity == '') {

                this.showToast('Error', 'Fill Quantity field in row ' + j, 'error');
                return;
            }
        }

        if (this.screenType == 'Add products') {
            if (this.locationId == '') {

                this.showToast('Error', 'Select Location', 'error');
                return;
            }
            this.isLoading = true;
            addInventoryProducts({ productItemJson: JSON.stringify(this.itemList), locationId: this.locationId })
                .then(result => {
                    this.isLoading = false;
                    const event = new ShowToastEvent({
                        title: 'Success',
                        message: 'Products have been added to Inventory',
                        variant: 'success',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(event);

                    this.itemList = [
                        {
                            idv: 0,
                            ProductName: '',
                            ProductId: '',
                            SerialNumber: '',
                            Quantity: '',
                            rmaNumber: '',
                            IsSerialized: true,
                            NotSerialized: true
                        }
                    ];
                })
                .catch(error => {
                    this.isLoading = false;
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(event);
                }
            );
        }

        if (this.screenType == 'Product transfer') {
            if (this.locationId == '' || this.locationId == null) {

                this.showToast('Error', 'Select Source Location', 'error');
                return;
            }

            if (this.TargetlocationId == '' || this.TargetlocationId == null) {

                this.showToast('Error', 'Select Destination Location', 'error');
                return;
            }
            this.isLoading = true;
            transferProduct({ productTransferJson: JSON.stringify(this.itemList), fromLocationId: this.locationId, ToLocationId: this.TargetlocationId })
                .then(result => {
                    this.isLoading = false;
                    this.showToast('Success', 'Product transfer is successful', 'success');
                    this.itemList = [
                        {
                            idv: 0,
                            ProductName: '',
                            ProductId: '',
                            SerialNumber: '',
                            Quantity: '',
                            rmaNumber: '',
                            IsSerialized: true,
                            NotSerialized: true
                        }
                    ];
                })
                .catch(error => {
                    this.isLoading = false;
                    this.showToast('Error', error.body.message, 'error');
                }
            );
        }

        if (this.screenType == 'RMA screen') {
            if (this.locationId == '') {
                this.showToast('Error', 'Select Location', 'error');
                return;
            }

            this.isLoading = true;

            handleDefectProduct({ 
                defectProductJson: JSON.stringify(this.itemList), 
                fromLocationId: this.locationId,
                files: this.fileDataList
            })
                .then(result => {
                    this.isLoading = false;
                    this.showToast('Success', 'Product Return is sucessful', 'success');

                    this.itemList = [
                        {
                            idv: 0,
                            ProductName: '',
                            ProductId: '',
                            SerialNumber: '',
                            Quantity: '',
                            rmaNumber: '',
                            IsSerialized: true,
                            NotSerialized: true
                        }
                    ];

                    this.clearValues();
                    window.location.reload();
                })
                .catch(error => {
                    this.isLoading = false;
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(event);
                }
            );
        }
    }

    clearValues() {
        this.itemList = [
            {
                idv: 0,
                ProductName: '',
                ProductId: '',
                SerialNumber: '',
                Quantity: '',
                rmaNumber: '',
                IsSerialized: true,
                NotSerialized: true
            }
        ];
        this.locationId = '';
        this.TargetlocationId = '';
        this.fileDataList = [];
    }

    scanbarcode(event) {
        this.currentIndex = event.currentTarget.dataset.id;
        this.showmodal = true;
    }

    handleOkay(event) {
        this.showmodal = false;
    }

    showToast(title, messsage, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: messsage,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    parentlocationselected(event) {
        this.locationId = event.detail.LocationId;
    }

    targetlocationselected(event) {
        this.TargetlocationId = event.detail.LocationId;
    }

    // Kuiper documentation
    @track fileDataList = [];

    handleFileUpload(event) {

        const allFiles = event.detail;
        const newFiles = allFiles.filter(newFile => {
            return !this.fileDataList.some(existingFile => existingFile.documentId === newFile.documentId);
        });

        this.fileDataList = [...this.fileDataList, ...newFiles];
    }

    handleFileDelete(event) {

        this.fileDataList = event.detail;
    }
}