import { LightningElement, api, track, wire } from 'lwc';
import getVendorType from "@salesforce/apex/PV_CustomChargeController.getVendorType";
import CUSTOM_CHARGE from '@salesforce/schema/Custom_Charge__c';

import { createRecord,getRecord,getFieldValue } from 'lightning/uiRecordApi';
import getProducts from '@salesforce/apex/PV_CustomChargeController.getProducts';
import getProductPrice from '@salesforce/apex/PV_CustomChargeController.getProductPrice';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo} from 'lightning/uiObjectInfoApi';
import WO_ID from "@salesforce/schema/ServiceAppointment.FSSK__FSK_Work_Order__c";

const fields = [WO_ID];

export default class Pv_CustomCharges extends LightningElement {

    @api recordId;
    productList = [];
    //productData = [];
    customProductList = [];
    filterList = [];
    keyIndex = 0;
    isSpinner = false;
    productPrice = '';
    priceupdated = '';
    showPrice = true;
    timeoutId = '';
    totalPrice = [];
    priceDataProduct = [];
    quantity = '1';
    productCreated = false;
    showCustomCharge = true;
    validateProduct = '';
    showDelete = true;
    showAddButton = false;
    showLoader = false;
    showSave = false;
    customChargeMsg = '';


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
        this.handleAddRow();
        this.priceData();
        this.getVendorType();

    }

    getVendorType() {
        getVendorType({ recordId: this.recordId }).then(response => {
            console.log('response' + response);
            if (response) {
                this.showCustomCharge = true;
            } else {
                this.showCustomCharge = false;
                this.customChargeMsg = 'Custom Charge is not available for this work type ';
                this.showNotification('warning', 'Custom Charge is not available for this work type', 'Error',);
            }

        }).catch(error => {
            console.log('ERROR' + JSON.stringify(error));
        });
    }
    @wire(getObjectInfo, { objectApiName: CUSTOM_CHARGE })
    customchargeinfo;


    handleValidation() {
        console.log("inside vlidation", this.validateProduct);
        this.isValidationError = false;

        const hasEmptyProduct = this.filterList.some(item => !item.CustomCharge_Products__c);

        if (hasEmptyProduct) {
            this.isValidationError = true;
            this.showNotification('error', 'Please select a product', 'Error');
        }


        if (!this.isValidationError) {
            this.showLoader = true;
            this.handleCreateRecord();
        }
    }


    //add products to list according the selectd rows
    handleChange(event) {

        if (event.target.name == 'productName') {
            this.createMap(event.target.value);

            this.filterList[event.currentTarget.dataset.index].Name = event.target.options.find(opt => opt.value === event.detail.value).label;
            this.filterList[event.currentTarget.dataset.index].Service_Appointment__c = this.recordId;
            this.filterList[event.currentTarget.dataset.index].CustomCharge_Products__c = event.target.value;
            this.filterList[event.currentTarget.dataset.index].Product_Name__c = event.target.options.find(opt => opt.value === event.detail.value).label;
            this.validateProduct = event.target.value;
            if (this.validateProduct !== '' || this.validateProduct !== undefined || this.validateProduct !== null) {
                this.showAddButton = false;
            } else {
                this.showAddButton = true;
            }
            console.log("validate product", this.validateProduct);
            this.filterList[event.currentTarget.dataset.index].Price__c = this.productPrice;
            this.filterList[event.currentTarget.dataset.index].Quantity__c = this.filterList[event.currentTarget.dataset.index].Quantity__c;
            this.filterList[event.currentTarget.dataset.index].Total_Amount__c = this.filterList[event.currentTarget.dataset.index].Price__c * this.filterList[event.currentTarget.dataset.index].Quantity__c;
            this.showPrice = false;
            this.timeoutId = setTimeout(() => this.updateRecordView(), 1000);
            console.log("Price>>>>>>>", this.filterList[event.currentTarget.dataset.index].Service_Appointment__c);

        }
        else if (event.target.name == 'quantity') {
            this.filterList[event.currentTarget.dataset.index].Quantity__c = event.target.value;
            this.filterList[event.currentTarget.dataset.index].Total_Amount__c = this.filterList[event.currentTarget.dataset.index].Price__c * this.filterList[event.currentTarget.dataset.index].Quantity__c;
            this.showPrice = false;
            this.timeoutId = setTimeout(() => this.updateRecordView(), 1000);

        }
        console.log("productList>>>>", JSON.stringify(this.filterList));
    }

    //add next row to ui
    handleAddRow() {

        if (this.filterList.length == 0) {
            this.showDelete = false;
        } else {
            this.showDelete = true;
        }

        if (this.filterList.length >= 0) {
            this.showSave = false;
        }else{
            this.showSave = true;
        }
        
        let objRow = {
            CustomCharge_Products__c: '',
            Quantity__c: '1',
            Service_Appointment__c: this.recordId,
            Price__c: '',
            Total_Amount__c: '',
            Work_Order__c:this.woId,
            id: ++this.keyIndex
        }
        this.validateProduct = '';
        if (this.validateProduct == '' || this.validateProduct == undefined || this.validateProduct == null) {
            this.showAddButton = true;
        } else {
            this.showAddButton = false;
        }
        this.filterList = [...this.filterList, Object.create(objRow)];
    }


    //Remove Row
    handleRemoveRow(event) {
        this.filterList = this.filterList.filter((ele) => {
            return parseInt(ele.id) !== parseInt(event.currentTarget.dataset.index);
        });
        if (this.filterList.length == 0 ) {
            this.customProductList = [];
            this.validateProduct = '';
            this.isValidationError = false;
            this.productData();
            this.showDelete = false;
            this.showSave = true;
        }else if(this.filterList.length == 1){
            this.showDelete = false;
        }else {
            this.showDelete = true;
            this.showSave = false;
        }

        if (this.validateProduct != '' || this.validateProduct != undefined || this.validateProduct != null) {
            this.showAddButton = false;
        } else {
            this.showAddButton = true;
        }

    }

    //save data to database
    handleCreateRecord() {
        console.log("inside create record");
        const FIELDS = {
            CustomCharge_Products__c: 'CustomCharge_Products__c',
            Quantity__c: 'Quantity__c',
            Service_Appointment__c: 'Service_Appointment__c',
            Price__c: 'Price__c',
            Total_Amount__c: 'Total_Amount__c',
            Work_Order__c : 'Work_Order__c'
        };

        const fields = this.filterList.map(record => {
            const fields = {};
            fields[FIELDS.CustomCharge_Products__c] = record.CustomCharge_Products__c;
            fields[FIELDS.Quantity__c] = record.Quantity__c;
            fields[FIELDS.Service_Appointment__c] = record.Service_Appointment__c;
            fields[FIELDS.Price__c] = record.Price__c;
            fields[FIELDS.Total_Amount__c] = record.Total_Amount__c;
            fields[FIELDS.Work_Order__c] = this.woId;
            const recordInput = { apiName: CUSTOM_CHARGE.objectApiName, fields };
            createRecord((recordInput))
                .then((record) => {
                    console.log('New Custom Charge Created', record.id);
                    if (!this.productCreated) {
                        this.showNotification('success', 'Custom Charge Created', 'Success');
                        this.showLoader = false;
                        this.showCustomCharge = false;
                        this.customChargeMsg = 'Custom Charge created Successfully !'
                        this.productCreated = true;
                    }

                    this.filterList = [];
                    if (this.filterList.length == 0) {
                        this.handleAddRow();

                    }
                })

                .catch((error) => {
                    this.showLoader = false;
                    console.log("error", error.message);
                });
        });

    }

    //process error message
    processErrorMessage(message) {
        let errorMsg = '';
        if (message) {
            if (message.body) {
                if (Array.isArray(message.body)) {
                    errorMsg = message.body.map(e => e.message).join(', ');
                } else if (typeof message.body.message === 'string') {
                    errorMsg = message.body.message;
                }
            }
            else {
                errorMsg = message;
            }
        }
        this.showToastMessage('error', errorMsg, 'Error!');
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


    //method to get apex class and save the records as picklist
    productData() {
        getProducts({})
            .then(result => {

                console.log("inside extrenal lead source", result);
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

    //getting price according to the product selected
    priceData() {
        getProductPrice({})
            .then(result => {
                this.priceDataProduct = result;
                console.log("price", this.priceDataProduct);

            }).catch(error => {
                console.log(' Error message from customProductList ', JSON.stringify(error));
            })
    }

    updateRecordView() {
        this.showPrice = true;
    }

    // map for storing and updating product price
    createMap(productId) {
        // console.log("log>>>>>>",productId);
        console.log("inside create map");
        const recordMap = new Map();
        this.priceDataProduct.forEach(record => {
            recordMap.set(record.Id, record);

        });
        const value = recordMap.get(productId);
        this.productPrice = value.Price__c;
        //this.calculateTotalAmount();
    }

    get sumOfQuantity() {
        return this.filterList.reduce((total, item) => total + item.Total_Amount__c, 0);
    }
}