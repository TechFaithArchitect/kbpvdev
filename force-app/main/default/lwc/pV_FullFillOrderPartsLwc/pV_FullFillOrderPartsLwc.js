import { LightningElement, track, wire, api } from 'lwc'; 
import getOrderPartsAndWarehouseInfo from '@salesforce/apex/PV_FullFill_OrderParts.getOrderPartsAndWarehouseInfo'; 
import updateOrderParts from '@salesforce/apex/PV_FullFill_OrderParts.updateOrderParts'; 
import updateOrderAndInventory from '@salesforce/apex/PV_FullFill_OrderParts.updateOrderAndInventory';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; 
import NUMBER_FIELD from '@salesforce/schema/Order__c.Name';
import ACCOUNT_FIELD from '@salesforce/schema/Order__c.Account_Name__c';
import WAREHOUSE_FIELD from '@salesforce/schema/Order__c.Warehouse__c';
import CREATED_DATE_FIELD from '@salesforce/schema/Order__c.CreatedDate';
import LightningConfirm from "lightning/confirm";

const COLUMNS = [ 
    { label: 'Part #', fieldName: 'partName', type: 'text' },
    { label: 'Part Description', fieldName: 'partDescription', type: 'text' },
    { label: 'BIN#', fieldName: 'partBin', type: 'text' },
    { label: 'Quantity Requested', fieldName: 'partReqQty', type: 'text' },
    { label: 'Quantity at Hand', fieldName: 'partWarehouseQty', type: 'text' },
    { label: 'Quantity Fulfilled', fieldName: 'partFullFillQty', type: 'text' , editable: true },
];

export default class PV_FullFillOrderPartsLwc extends LightningElement { 
    @track isShowModal = false;
    @api recordId;
    @api objectApiName;
    @api updatedFields;
    @track ordNumber;
    @track creditHistory = [];
    @track data=[];
    updatedData=[];
    @track errors={rows:{},table:{}};
    columns = COLUMNS;
    draftValues = [];
    @track isError = false;
    @track disableSubmit = true;
    @track disableSave = false;
    @track constant = {
        SUCCESS : 'Success',
        ERROR : 'Error',
        FULFILL_QUANTITY_ERROR : 'Fulfill quantity cannot be greater than Quantity in Hand or Requested quantity and should be greater than Zero',
        FULFILL_QUANTITY_FIELD : 'partFullFillQty',
        SUCCESS_SAVE_MESSAGE : 'Parts saved successfully',
        SUCCESS_MESSAGE : 'Parts fulfilled successfully',
        messageVariable : 'You cannot make updates to order once submitted. Please confirm',
        labelVariable : 'Fulfillment Confirmation',
        themeVariable : 'inverse'
    };
    showSpinner = false;
    numField = NUMBER_FIELD;
    accField = ACCOUNT_FIELD;
    whField = WAREHOUSE_FIELD;
    createdDateField = CREATED_DATE_FIELD;
    nonNumericRegex = /\D/;

    handleSave(event) {
        try {
            this.showSpinner = true;
            this.isError = false;
            this.updatedData.forEach(row => {
                console.log('on save click',JSON.stringify(row));
                this.quantityValidation(row);
            });

            if(!this.isError){
                this.errors={rows:{},table:{}};
                updateOrderParts({ orderPartsToUpdate : JSON.stringify(this.updatedData)})
                    .then(result =>{
                        this.showToastMessage(this.constant.SUCCESS, this.constant.SUCCESS_SAVE_MESSAGE, this.constant.SUCCESS);
                        this.disableSubmit = false;
                        this.showSpinner = false;
                    })
                    .catch(error =>{
                        console.log('error ', JSON.stringify( error ));
                    });
            }
        } catch (error) {
            console.error(error);
            this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);
         }
    } 

    fulfilledOnChange(event){
        this.updatedData.forEach(row => {
            if(row.partId == event.detail.draftValues[0].partId){
                this.errors.rows[row.partId] = {};
                row.partFullFillQty = event.detail.draftValues[0].partFullFillQty;
                this.quantityValidation(row);
            }
        });
    }
    handleKeyUp(){
        this.disableSave = true;
        this.disableSubmit = true;
    }
    showModalBox() {
        this.errors={rows:{},table:{}};
        this.showSpinner = true;
        this.data = [];
        this.draftValues = [];
        getOrderPartsAndWarehouseInfo({orderId: this.recordId})
            .then((result) => {
                console.log('result ', JSON.stringify( result ));
                this.data = JSON.parse(result);
                this.updatedData = JSON.parse(result);
                this.disableSave = false;
                this.ordNumber=JSON.stringify(this.data[0].orderNumber);
                this.ordNumber= this.ordNumber.replace(/['"]+/g, '');
                this.isShowModal = true;
                this.showSpinner = false;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    closePopUp() {
        this.isShowModal = false;
    }

    quantityValidation(row){
       // this.disableSubmit = true;
        this.disableSave = false;
        console.log('row.partFullFillQty:', typeof(parseInt(row.partFullFillQty)) );
        console.log('Warehouse:', parseInt(this.data.find(x => x.partId === row.partId).partWarehouseQty) );
        if(row.partFullFillQty==='' || this.nonNumericRegex.test(row.partFullFillQty) ||
            parseInt(row.partFullFillQty) > parseInt(this.data.find(x => x.partId === row.partId).partWarehouseQty)
            || parseInt(row.partFullFillQty) > parseInt(this.data.find(x => x.partId === row.partId).partReqQty)){
                console.log('inside if quantity');
                this.isError = true;
                this.showSpinner = false;
                this.disableSave = true;
                this.disableSubmit = true;
                //this.rowError(row, this.constant.FULFILL_QUANTITY_ERROR, this.constant.FULFILL_QUANTITY_FIELD);
                let errorMessage = 'For '+this.data.find(x => x.partId === row.partId).partName+':'+this.constant.FULFILL_QUANTITY_ERROR;
                this.showToastMessage('Error',errorMessage,'Error');
        }
        console.log('disableSave',this.disableSave);
    }

    rowError(row, rowErrorMessage, rowErrorField){
        let tableRowError = {
            title: this.constant.ERROR,
            messages: [rowErrorMessage],
            fieldNames: [rowErrorField]
        };
        console.log('rowerror',JSON.stringify(row));
        this.errors.rows[row.partId] = tableRowError;
    }

    showToastMessage(title, message, variant){
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
                duration:' 10000'
                //mode: 'sticky'
            })
            );
    }

    handleSubmit(){       
        this.handleConfirmClick(this.constant.messageVariable, this.constant.labelVariable, this.constant.themeVariable);
    }

    async handleConfirmClick(messageVariable, labelVariable, themeVariable) {
        const result = await LightningConfirm.open({    
        message: messageVariable,
        label: labelVariable,
        theme : themeVariable
        });
        if (result) {
            updateOrderAndInventory({ orderPartsToUpdate : JSON.stringify(this.updatedData), orderId: this.recordId})
            .then((result) => {
                eval("$A.get('e.force:refreshView').fire();");
                this.isShowModal = false;
                this.showToastMessage(this.constant.SUCCESS, this.constant.SUCCESS_MESSAGE, this.constant.SUCCESS);
            })
            .catch((error) => {
                console.error(error);
            });
        }
    }
}