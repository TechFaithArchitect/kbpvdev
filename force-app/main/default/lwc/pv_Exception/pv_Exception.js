import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import EXCEPTION_OBJECT from '@salesforce/schema/Exception__c';
import PRODUCTOBJECT from '@salesforce/schema/Exception_Product__c';
import ExceptionType_FIELD from '@salesforce/schema/Exception__c.Type__c';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import getProducts from '@salesforce/apex/PV_ExceptionController.getProducts';
import { createRecord } from 'lightning/uiRecordApi';
import { CloseActionScreenEvent } from 'lightning/actions';
import getVendorType from "@salesforce/apex/PV_ExceptionController.getVendorType";
import getSharinPixImage from "@salesforce/apex/PV_ExceptionController.getSharinPixImage";
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import WO_ID from "@salesforce/schema/ServiceAppointment.FSSK__FSK_Work_Order__c";

const fields = [WO_ID];

export default class Pv_Exception extends LightningElement {

    exceptionTypeOption = [];
    customProductList = [];
    filterList = [];
    exceptionTypeList = [];
    typeList = [];
    isValidationError = false;
    _selected = [];
    productList = [];
    installationIssue = '';
    workPreformed = '';
    @api recordId;
    result = '';
    index = 0;
    tripFees = '';
    productCreated = false;
    showException = true;
    showSuccess = false;
    showExceptionMessage = false;
    showExceptionMessageImage = false;
    records = '';

    @wire(getRecord, {
        recordId: "$recordId",
        fields
      })
      sa;

      get woId() {
        return getFieldValue(this.sa.data, WO_ID);
      }

    connectedCallback() {
        this.productData();
        getVendorType({ recordId: this.recordId }).then(response => {
            console.log('response' + response);
            if (response) {
                this.showException = true;
                this.getSharinPix();
            } else {
                this.showException = false;
                this.showExceptionMessage = true;
                this.showNotification('warning', 'Exception are not available for this work type.', 'Error',);
            }

        }).catch(error => {
            console.log('ERROR' + JSON.stringify(error));
        });

    }

    get selected() {
        return this._selected.length ? this._selected : 'none';
    }

     @wire(getRelatedListRecords, {
        parentRecordId: '0WO59000000w9QBGAY',
        relatedListId: 'sharinpix__SharinPixImage__c',
        fields: ['sharinpix__SharinPixImage__c.Work_Order_Image__c']
    })listInfo({ error, data }) {
        if (data) {
            this.records = data.records;
             console.log('inside Wire');
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.records = undefined;
        }
    }

    @wire(getObjectInfo, { objectApiName: EXCEPTION_OBJECT })
    exceptionObjectInfo;


    @wire(getPicklistValues, { recordTypeId: '$exceptionObjectInfo.data.defaultRecordTypeId', fieldApiName: ExceptionType_FIELD })
    exceptionType({ error, data }) {
        if (data) {
            this.exceptionTypeOption = data.values.map(objPL => {
                return {
                    label: `${objPL.label}`,
                    value: `${objPL.value}`
                };
            });
        } else if (error) {
            console.error('error residentTypeOption ', JSON.stringify(error));
        }
    }
    getSharinPix() {
        getSharinPixImage({ recordId: this.recordId }).then(response => {
            
            if (response == true) {
                this.showException = false;
                this.showExceptionMessageImage = true;
            } else {
                this.showException = true;
            }

        }).catch(error => {
            console.log('ERROR' + JSON.stringify(error));
        });

    }
    handleValueChange(event) {
        this.typeList = event.detail;
    }
    handleProductChange(event) {

        this.productList = event.detail;
        if (this.typeList.includes("Equipment credit")) {
            this.disableProduct = true;
        }

    }
    productData() {
        getProducts({})
            .then(result => {
                for (var key in result) {
                    const option = {
                        label: key,
                        value: result[key],
                        price: result[key]
                    };

                    this.customProductList = [...this.customProductList, option];
                }
            }).catch(error => {
                console.log(' Error message from customProductList ', JSON.stringify(error));
            })
    }

    handleValidation() {
        this.isValidationError = false;
        if (this.typeList == '' || this.typeList == null || this.typeList == undefined) {
            this.isValidationError = true;
            this.showNotification('Error', 'Please select a type ', 'Error');
        }
        else if (this.typeList.includes("Trip fees") && (this.tripFees == '' || this.tripFees == null || this.tripFees == undefined)) {
            this.isValidationError = true;
            this.showNotification('Error', 'Please Enter Trip Fee', 'Error');
        }
        else if (this.typeList.includes("Equipment credit") && (this.productList == '' || this.productList == null || this.productList == undefined)) {
            this.isValidationError = true;
            this.showNotification('Error', 'Please select products', 'Error');
        }else if(this.installationIssue == '' || this.installationIssue == null || this.installationIssue == undefined){
            this.isValidationError = true;
            this.showNotification('Error', 'Please fill Installation Issue', 'Error');
        }
        else if(this.workPreformed == '' || this.workPreformed == null || this.workPreformed == undefined){
            this.isValidationError = true;
            this.showNotification('Error', 'Please fill Work performed', 'Error');
        }
        
        if (!this.isValidationError) {
            this.handleCreate();
        }

    }

    handleChange(event) {
        if (event.target.name == 'tripFee') {
            this.tripFees = event.target.value;
        }
        if (event.target.name == 'installationIssue') {
            this.installationIssue = event.target.value;
        }
        if (event.target.name == 'workPreformed') {
            this.workPreformed = event.target.value;
        }
    }

    handleCreate() {
        let str = this.typeList.join(";");
        const fields = {
            Work_Performed__c: '',
            Trip_Fee__c: '',
            Installation_Issue_s__c: '',
            Service_Appointment__c: '',
            Type__c: '',
            Work_Order__c:''
        };

        fields.Work_Performed__c = this.workPreformed;
        fields.Trip_Fee__c = parseInt(this.tripFees);
        fields.Installation_Issue_s__c = this.installationIssue;
        fields.Service_Appointment__c = this.recordId;
        fields.Type__c = str;
        fields.Work_Order__c = this.woId;


        const recordInput = { apiName: EXCEPTION_OBJECT.objectApiName, fields: fields };

        createRecord(recordInput).then((record) => {
            const exceptionId = record.id;
            this.showNotification('success', "Exception Added", 'Success!');
            this.createProduct(exceptionId);
            this.showSuccess = true;
            this.showException = false;
        })
            .catch((error) => {
                console.log("error", error);
            });

    }

    createProduct(exceptionId) {

        const FIELDS = {
            Product_del__c: 'Product_del__c',
            Exception__c: 'Exception__c'
        };

        const fields = this.productList.forEach((item) => {
            const fields = {};
            console.log("item", item)
            fields[FIELDS.Product_del__c] = item;
            fields[FIELDS.Exception__c] = exceptionId;


            const recordInput = { apiName: PRODUCTOBJECT.objectApiName, fields };
            createRecord((recordInput))
                .then((record) => {
                })

                .catch((error) => {
                    console.log("error", error);
                });
        });

    }

    closeQuickAction() {
        console.log("inside close");
        this.dispatchEvent(new CloseActionScreenEvent());
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