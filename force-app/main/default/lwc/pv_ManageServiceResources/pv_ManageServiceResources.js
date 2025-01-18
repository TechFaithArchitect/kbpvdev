import { LightningElement, api, wire, track } from 'lwc';
import getRelatedContacts from '@salesforce/apex/PV_ManageServiceResources.getRelatedContacts';
import submitForApprovalOrSRCreation from '@salesforce/apex/PV_ManageServiceResources.submitForApprovalOrSRCreation';
import getPickValues from '@salesforce/apex/PV_ManageServiceResources.getPickValues';
import getFirstjobstatus from '@salesforce/apex/PV_ManageServiceResources.getFirstjobstatus';
import getSecondjobstatus from '@salesforce/apex/PV_ManageServiceResources.getSecondjobstatus';
import validateContact from '@salesforce/apex/PV_ManageServiceResources.validateContact';
import getValues from '@salesforce/apex/PV_ManageServiceResources.getValues';
import getskills from '@salesforce/apex/PV_ManageServiceResources.getskill';
import getManager from '@salesforce/apex/PV_ManageServiceResources.getManager';
import USER_AVATAR from '@salesforce/resourceUrl/UserAvatar';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import PROFILE_FIELD from '@salesforce/schema/User.Profile.Name';
import Account_Name from '@salesforce/schema/Account.Name';
import { NavigationMixin } from 'lightning/navigation';
import USER_ID from '@salesforce/user/Id';
import getStmAsscociatedWithResource from '@salesforce/apex/PV_CreateStmController.getStmAsscociatedWithResource';
import directTVSkill from '@salesforce/label/c.PV_DirectTV_Certifiaction';
import viasatSkill from '@salesforce/label/c.PV_Viasat_Certification';
//import nextlinkSkill from '@salesforce/label/c.PV_Nextlink_Certifiaction'; // If a new vendor is added
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import validatePermission from '@salesforce/apex/PV_ManageServiceResources.validatePermission';
import permissionMsg from '@salesforce/label/c.MSRPermissionMessage';


import COUNTRY_CODE from '@salesforce/schema/Account.BillingCountryCode';
import BILLING_STATE_CODE from '@salesforce/schema/Account.BillingStateCode';

///Create contact

import conObject from '@salesforce/schema/Contact';
import conTimezone from '@salesforce/schema/Contact.Time_zone__c';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', wrapText: true, hideDefaultActions: true },
    { label: 'Email', fieldName: 'Email', wrapText: true, hideDefaultActions: true }
];

const FIELDS = [
    'Account.Name',
];

export default class Pv_ManageServiceResources extends NavigationMixin(LightningElement) {

    countries = [];
    countriesToStates = {};
    selectedCountry;
    selectedState;
    street;
    postalCode;


    @api recordId;
    @track imageUrl = USER_AVATAR;
    // 'https://www.lightningdesignsystem.com/assets/images/avatar2.jpg';
    @track contacts;
    columns = COLUMNS;
    @track selectedRows = [];
    contactRecord;
    @track ManagerField=false;
    @track resourceTypeValue;
    @track showError = false;
    @track isShowModal = true;
    @track isVisiblePage = false;
    @track statusMessage;
    showSpinner = false;
    ShowServiceTerritory = false;
    @api horizontalAlign = 'space';
    submit = false;
    CurrentIndexId = 0;
    disablesubmit = false;
    dispatcher = false;
    
    UserStatus = 0;
    PermissionsetStatus = 0;
    ServiceresourceStatus = 0;
    ServiceterritorymembershipStatus = 0;
    UserStatusSpinner;
    @track Vendoroptions = [];
    PermissionSpinner;
    ServiceresourceSpinner;
    ServiceterritorySpinner;
    UserS = 'base-autocomplete';
    Permissionset = 'base-autocomplete';
    Serviceresource = 'base-autocomplete';
    Serviceterritory = 'base-autocomplete';
    PermissionsetBatchId;
    stmbatchid;
    @track optionsLoaded = false;
    @track selectedRegions = [];
    @track selectedSkills = [];
    wiredCOntact;
    picname;
    StatusScreen = false;
    picklistValues;
    options = [];
    startDate;
    skillStartDate;
    selectedValue;
    DIRECTVexp;
    Viasatexp;
    CreateContact = true;
    firstNext = true;
    secondNext = false;
    firstback = false;
    secondback = false;
    submit = false;
    ShowSkill = false;
    readyfofiles;
    filescreen;
    Territoryloaded = false;
    showResourceTable = false;
    skillloaded = false;
    noTerritory;
    profilepic = null;
    fileInputClass = 'file-input-hidden';
    @track fileList = [];
    @track disableSaveButton = true;
    @track resourceList;
    @track skillList;
    @track Manageroptions = [];
    @track skillListArray = [];
    @track constant = {
        SUCCESS: 'Success',
        ERROR: 'Error',
        APPROVAL_SUCCESS_MESSAGE: 'Approval Process submitted successfully',
        USER_SUCCESS_MESSAGE: 'User and Service Resource created',
        Disp_SUCCESS_MESSAGE:'User has been created Successfully',
        APPROVAL_ERROR_MESSAGE: 'Approval Process cannot be submitted',
        USER_ERROR_MESSAGE: 'User and SR cannot be created',
        ERROR_MESSAGE: 'You do not have the previlege to manage service resources',
        messageVariable: 'Service Resource process',
        ONE_PRIMARY_ERROR: 'At least one Primary membership record required ',
        Duplicate_territory: 'Duplicate territory selected'
    };
    @track membershipRecords = [];
    @track memberShips = [];
    @track rec = {
        FirstName: '',
        LastName: '',
        Account: this.recordId,
        Timezone: '',
        Email: '',
        Phone: '',
        DrugScreenDate: '',
        BackgroundCheckDate: '',
        IncludeinSchedulingOptimization: '',
        MailingStreet: '',
        MailingCity: '',
        MailingStateCode: '',
        MailingCountryCode: '',
        MailingPostalCode: '',
        IDDirecTV: '',
        IDViasat: '',
       // IDNextlink: '', // If a new vendor is added
        Vendor: '',
        Manager: null

    };
ManagerLoaded=false;
// If a new vendor is added
//@track nextlinkvalue = false;
@track directvvalue = false;
@track viasatvalue = false;

    @track allValues = [];


    @wire(getRecord, { recordId: USER_ID, fields: [PROFILE_FIELD] })
    userRecord;
    get profileName() {
        return getFieldValue(this.userRecord.data, PROFILE_FIELD);
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    Account;
    get accountname() {
        return getFieldValue(this.Account.data, Account_Name);
    }

    @wire(getManager,{ accountId: '$recordId'})
    wiredContacts({ error, data }) {
      if (data) {
        for (var i = 0; i < data.length; i++) {
            this.Manageroptions.push({ label: data[i].Name, value:data[i].Id});
            
        }
        this.ManagerLoaded=true;
        this.error = undefined;
      } else if (error) {
        this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);

 
      }
    }


    connectedCallback() {

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        this.startDate = `${year}-${month}-${day}`;
        this.skillStartDate = `${year}-${month}-${day}`;
        this.checkPermission();
        //this.getVendors();
        // this.getManagers();

    }
    @wire(getObjectInfo, { objectApiName: conObject })
    objectInfo;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: conTimezone })
    wiredData({ error, data }) {

        if (data) {

            this.options = data.values.map(objPL => {
                return {
                    label: `${objPL.label}`,
                    value: `${objPL.value}`
                };
            });

        } else if (error) {
            this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);

            console.error(JSON.stringify(error));

        }

    }


    @wire(getPickValues)
    wiredPicklistValues({ error, data }) {
        this.showSpinner = true;
        if (data) {
            this.picklistValues = data.map(picklistValue => {
                return { label: picklistValue, value: picklistValue };
            });
            this.showSpinner = false;
        } else if (error) {
            this.showSpinner = false;
            this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);
        }
    }



    getSelectedName(event) {
        const selectedRows = event.detail.selectedRows;
        this.contactRecord = selectedRows[0];
        this.hasSelectedRow = this.selectedRows.length > 0;
        // Display that fieldName of the selected rows
        for (let i = 0; i < selectedRows.length; i++) {
            //alert('You selected: ' + selectedRows[i].Name);
        }
    }

    handleResourceTypeChange(event) {
        this.resourceTypeValue = event.detail.value;
        if(this.resourceTypeValue=='Technician'){
            this.ManagerField=true;
            
        }else{
            this.ManagerField=false;
        }
        if (this.resourceTypeValue === 'Dispatcher') {

            this.dispatcher = true;
        } else {

            this.dispatcher = false;

        }
    }

    handleSubmit() {


        if (this.membershipRecords.length == 0) {
            for (let key in this.selectedRegions) {

                if (key == 0) {
                    this.membershipRecords.push({
                        IndexId: key,
                        TerritoryId: this.selectedRegions[key],
                        StartDate: this.startDate,
                        TerritoryType: 'Primary'
                    });
                } else {
                    this.membershipRecords.push({
                        IndexId: key,
                        TerritoryId: this.selectedRegions[key],
                        StartDate: this.startDate,
                        TerritoryType: 'Secondary'
                    });
                }


            }
        }

        if (this.profilepic === null || this.profilepic === undefined || this.profilepic === '') {

            this.showToastMessage(this.constant.ERROR, 'Please upload a profile picture', this.constant.ERROR);

            return;

        }
        for (let i=0 ; i<this.skillListArray.length;i++){
             if (this.skillListArray[i].isslected && !this.selectedSkills.includes(this.skillListArray[i].DeveloperName))
                this.selectedSkills.push(this.skillListArray[i].DeveloperName);
        }

        if (this.contactRecord) {
            this.showError = false;
            this.showSpinner = true;
            this.UserStatusSpinner = true;
            this.StatusScreen = true;
            this.isShowModal = false;
            this.PermissionSpinner = true;
            this.ServiceresourceSpinner = true;
            this.ServiceterritorySpinner = true;
            submitForApprovalOrSRCreation({
                partnerContact: this.contactRecord,
                resourceType: this.resourceTypeValue,
                stMembership: JSON.stringify(this.membershipRecords),
                skillList: this.selectedSkills,
                startDate: this.skillStartDate,
                viasatExpiry: this.Viasatexp,
                directvExpiry: this.DIRECTVexp,
                profilepic: this.profilepic,
                approvalid: null,
                imgurl: null
            })
                .then(result => {
                    this.showSpinner = false;
                    if (!result.includes("Approval")) {
                        this.StatusScreen = true;
                        this.isShowModal = false;
                        this.UserStatusSpinner = false;
                        this.UserS = 'base-autocomplete';
                        this.UserStatus = 100;
                        this.showSpinner = false;
                        this._interval = setInterval(() => {
                            getFirstjobstatus({ jobid: result })
                                .then(result => {

                                    if (result == 'Completed') {
                                        this.PermissionSpinner = false;
                                        this.PermissionsetStatus = 100;
                                        this.Permissionset = 'base-autocomplete';
                                        if (this.dispatcher == true) {
                                            this.showToastMessage(this.constant.SUCCESS,'User has been created successfully', this.constant.SUCCESS);
                                            clearInterval(this._interval);

                                        }else{
                                                
                                                getSecondjobstatus()
                                                .then(result => {
    
                                                    if (result == 'Completed') {
                                                        this.showToastMessage(this.constant.SUCCESS, this.constant.USER_SUCCESS_MESSAGE, this.constant.SUCCESS);
                                                        this.ServiceresourceSpinner = false;
                                                        this.ServiceterritorySpinner = false;
                                                        this.ServiceresourceStatus = 100;
                                                        this.ServiceterritorymembershipStatus = 100
                                                        this.Serviceresource = 'base-autocomplete';
                                                        this.Serviceterritory = 'base-autocomplete';
                                                        clearInterval(this._interval);
                                                        this.dispatchEvent(new CloseActionScreenEvent());
    
                                                    }
    
                                                    if (result == 'Failed') {
    
                                                        this.Serviceresource = 'expired';
                                                        this.Serviceterritory = 'expired';
                                                        this.ServiceresourceSpinner = false;
                                                        this.ServiceterritorySpinner = false;
                                                        clearInterval(this._interval);
                                                    }
    
    
                                                })
                                                .catch(error => {
                                                    this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);
                                                    this.Serviceresource = 'expired';
                                                    this.Serviceterritory = 'expired';
                                                    this.ServiceresourceSpinner = false;
                                                    this.ServiceterritorySpinner = false;
                                                    clearInterval(this._interval);
    
                                                });
                                            }
                                    
                                    }
                                    if (result == 'Failed') {

                                        this.Permissionset = 'expired';
                                        this.Serviceresource = 'expired';
                                        this.Serviceterritory = 'expired';
                                        this.PermissionSpinner = false;
                                        this.ServiceresourceSpinner = false;
                                        this.ServiceterritorySpinner = false;
                                        clearInterval(this._interval);
                                    }
                                })
                                .catch(error => {

                                    this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);
                                    this.Permissionset = 'expired';
                                });
                        }, 1000);
                    } else {
                        var splitStr = result.substring(result.indexOf('-') + 1);
                        this.showToastMessage(this.constant.SUCCESS, this.constant.APPROVAL_SUCCESS_MESSAGE, this.constant.SUCCESS);

                        this[NavigationMixin.Navigate]({
                            type: 'standard__recordPage',
                            attributes: {
                                recordId: splitStr,
                                objectApiName: 'Process_Approval__c',
                                actionName: 'view'
                            }
                        });
                        this.dispatchEvent(new CloseActionScreenEvent());


                    }



                    this.showSpinner = false;

                })
                .catch(error => {
                    this.showSpinner = false;
                    this.UserS = 'expired';
                    this.Permissionset = 'expired';
                    this.Serviceresource = 'expired';
                    this.Serviceterritory = 'expired';
                    this.UserStatusSpinner = false;
                    this.PermissionSpinner = false;
                    this.ServiceresourceSpinner = false;
                    this.ServiceterritorySpinner = false;
                    this.showToastMessage(this.constant.ERROR, error.body.message, 'error');

                })
        }
        if (!this.contactRecord) {
            this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);
            this.showError = true;
        }
    }

    showToastMessage(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
                duration: ' 10000'
            })
        );
    }

    ///Handle next button 

    handleNext() {

        if (this.resourceTypeValue == undefined || this.resourceTypeValue == null) {
            this.showToastMessage(this.constant.ERROR, 'Select Resource Type', this.constant.ERROR);
            return;
        }
        if (this.rec.Vendor == '' || this.rec.Vendor == null || this.rec.Vendor == 'None') {
            this.showToastMessage(this.constant.ERROR, 'Please select Vendor', this.constant.ERROR);
            return;
        }
        // if(this.rec.FirstName==''||this.rec.FirstName==null ||this.rec.FirstName.trim().length === 0){
        //     this.showToastMessage(this.constant.ERROR,'Please fill First Name', this.constant.ERROR);
        //     return;
        // }
        if (this.rec.LastName == '' || this.rec.LastName == null || this.rec.LastName.trim().length === 0) {
            this.showToastMessage(this.constant.ERROR, 'Please fill Last Name', this.constant.ERROR);
            return;
        }
        if (this.rec.Email == '' || this.rec.Email == null || this.rec.Email.trim().length === 0) {
            this.showToastMessage(this.constant.ERROR, 'Please fill Email', this.constant.ERROR);
            return;
        }
        if (this.rec.Phone == '' || this.rec.Phone == null || this.rec.Phone.trim().length === 0) {
            this.showToastMessage(this.constant.ERROR, 'Please fill Phone', this.constant.ERROR);
            return;
        }
        if (this.rec.Timezone == '' || this.rec.Timezone == null) {
            this.showToastMessage(this.constant.ERROR, 'Please fill Timezone', this.constant.ERROR);
            return;
        }
        if ((this.rec.Manager == '' || this.rec.Manager == null) && this.resourceTypeValue === 'Technician') {
            this.showToastMessage(this.constant.ERROR, 'Please select a Manager', this.constant.ERROR);
            return;
        }

        if (this.rec.MailingStreet == '' || this.rec.MailingStreet == null) {
            this.showToastMessage(this.constant.ERROR, 'Please fill Street', this.constant.ERROR);
            return;
        }
        if (this.rec.MailingCity == '' || this.rec.MailingCity == null) {
            this.showToastMessage(this.constant.ERROR, 'Please fill City', this.constant.ERROR);
            return;
        }
        if (this.rec.MailingStateCode == '' || this.rec.MailingStateCode == null) {
            this.showToastMessage(this.constant.ERROR, 'Please fill State', this.constant.ERROR);
            return;
        }
        if (this.rec.MailingCountryCode == '' || this.rec.MailingCountryCode == null) {
            this.showToastMessage(this.constant.ERROR, 'Please fill Country', this.constant.ERROR);
            return;
        }
        if (this.rec.MailingPostalCode == '' || this.rec.MailingPostalCode == null) {
            this.showToastMessage(this.constant.ERROR, 'Please fill Postal Code', this.constant.ERROR);
            return;
        }


        if(this.rec.Vendor.includes("Viasat") && this.rec.IDViasat == null){
            this.showToastMessage(this.constant.ERROR, 'Please fill Viasat Id', this.constant.ERROR);
            return;
        }
        
        if(this.rec.Vendor.includes("DIRECTV") && this.rec.IDDirecTV == null){
            this.showToastMessage(this.constant.ERROR, 'Please fill DIRECTV Id', this.constant.ERROR);
            return;
        }
        
        if(this.rec.Vendor.includes("Viasat") && this.Viasatexp != null){
        if (this.rec.Vendor.includes("Viasat") && this.isDateInPast(this.Viasatexp)) {
            bgfield.setCustomValidity('Date is in the past. Please give a valid date ');
        }
    }
   
    if(this.rec.Vendor.includes("DIRECTV") && this.DIRECTVexp != null){
        if (this.rec.Vendor.includes("DIRECTV") && this.isDateInPast(this.DIRECTVexp)) {
            bgfield.setCustomValidity('Date is in the past. Please give a valid date ');
        }
    }

        /*if(this.rec.Vendor.includes("Nextlink") && this.rec.IDNextlink == null){
            this.showToastMessage(this.constant.ERROR, 'Please fill Nextlink Id', this.constant.ERROR);
            return;
        }*/
        


        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let emailVal = this.rec.Email;
        if (emailVal.match(emailRegex)) {

        } else {
            this.showToastMessage(this.constant.ERROR, 'Enter a valid email', this.constant.ERROR);
            return;
        }




        validateContact({
            con: JSON.stringify(this.rec),
            resourceType: this.resourceTypeValue,
            viasatExpiry: this.Viasatexp,
            directvExpiry: this.DIRECTVexp
        })
            .then((result) => {
                this.getRegionAssociatedWithResource();
                this.contactRecord = result;
                if (this.dispatcher == true) {
                    this.ShowServiceTerritory = true;
                    this.CreateContact = false;
                    this.firstNext = false;
                    this.secondNext = false;
                    this.firstback = false;
                    this.secondback = true;
                    this.submit = false;
                    this.ShowSkill = false;
                    this.readyfofiles = true;

                } else {
                    this.getskills();
                    this.ShowSkill = true;
                    this.ShowServiceTerritory = false;
                    this.CreateContact = false;
                    this.firstNext = false;
                    this.secondNext = true;
                    this.firstback = true;
                    this.secondback = false;
                    this.submit = false;
                    this.readyfofiles = false;

                }


            })
            .catch((error) => {
                this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);
                return;
            });

    }

    handleback() {

        this.ShowSkill = false;
        this.ShowServiceTerritory = false;
        this.CreateContact = true;
        this.firstNext = true;
        this.secondNext = false;
        this.firstback = false;
        this.secondback = false;
        this.submit = false;
        this.readyfofiles = false;


    }



    contactChangeVal(event) {
        if (event.target.label == 'First Name') {
            this.rec.FirstName = event.target.value;
        }
        if (event.target.label == 'Last Name') {

            this.rec.LastName = event.target.value;
        }
        if (event.target.label == 'Email') {
            this.rec.Email = event.target.value;
        }
        if (event.target.label == 'Phone') {
            this.rec.Phone = event.target.value;
        }
        if (event.target.label == 'Timezone') {
            this.rec.Timezone = event.target.value;
        }

        if (event.target.label == 'Manager') {
            this.rec.Manager = event.target.value;
        }
        if (event.target.label == 'Drug Screen Date') {
            let bgfield = this.template.querySelector("[data-field='ds']");

            if (!isNaN(Date.parse(event.target.value))) {
                bgfield.setCustomValidity("");
                this.rec.DrugScreenDate = event.target.value;

            } else {
                bgfield.setCustomValidity('Please give a valid date ');

            }

        }
        if (event.target.label == 'Background Check Date') {
            let bgfield = this.template.querySelector("[data-field='bg']");

            if (!isNaN(Date.parse(event.target.value))) {
                bgfield.setCustomValidity("");
                this.rec.BackgroundCheckDate = event.target.value;


            } else {
                bgfield.setCustomValidity('Please give a valid date ');
            }


        }
        if (event.target.label == 'DIRECTV Id') {
            this.rec.IDDirecTV = event.target.value;
        }

        if (event.target.label == 'Viasat Id') {
            this.rec.IDViasat = event.target.value;
        }
        // If a new vendor is added
      /*  if (event.target.label == 'Nextlink Id') {
            this.rec.IDNextlink = event.target.value;
            console.log('this.rec.IDNextlink',this.rec.IDNextlink);
        }*/
        
        // if(event.target.label=='Vendor'){
        //     this.rec.Vendor = event.target.value;
        // }

        if (event.target.label == 'Include in Scheduling Optimization') {
            this.rec.IncludeinSchedulingOptimization = event.target.checked;
        }

        if (event.target.label == 'DIRECTV Id Expiration Date') {
            let bgfield = this.template.querySelector("[data-field='de']");

            if (!isNaN(Date.parse(event.target.value))) {
                this.DIRECTVexp = event.target.value;
                bgfield.setCustomValidity("");

                if (this.isDateInPast(this.DIRECTVexp)) {
                    bgfield.setCustomValidity('Date is in the past!, please give a valid date ');
                }



            } else {
                bgfield.setCustomValidity('Please give a valid date ');

            }
            

        }

        if (event.target.label == 'Viasat Id Expiration Date') {
            let bgfield = this.template.querySelector("[data-field='ve']");

            if (!isNaN(Date.parse(event.target.value))) {
                bgfield.setCustomValidity("");
                this.Viasatexp = event.target.value;
                
                if (this.isDateInPast(this.Viasatexp)) {
                    bgfield.setCustomValidity('Date is in the past!, please give a valid date ');
                }

            } else {
                bgfield.setCustomValidity('Please give a valid date ');
            }
        }

        this.rec.Account = this.recordId;

    }
    //handle vendor type change
    handleVendorType(event) {
        this.allValues = event.detail;
        let vendorValues = this.allValues.join(";");
        this.rec.Vendor = vendorValues;
        let vendorList = vendorValues.split(";");
        // If a new vendor is added
        if(vendorList.includes("DIRECTV")){
            this.directvvalue = true;
            this.rec.IDViasat = '';
            this.Viasatexp = null;
        }
        else{
            this.directvvalue = false;
        }
        if(vendorList.includes("Viasat")){
            this.viasatvalue = true;
            this.rec.IDDirecTV = '';
            this.DIRECTVexp = null;
        }
        else{
            this.viasatvalue = false;
        }
        /*if(vendorList.includes("Nextlink")){
            this.nextlinkvalue = true;
        }
        else{
            this.nextlinkvalue = false;
        }*/
        this.locationType = event.target.value;
        if(this.skillListArray.length > 0){
            for (let i=0;i<this.skillListArray.length;i++){
                // If a new vendor is added
                if ((vendorList.includes("DIRECTV") && this.skillListArray[i].Name == directTVSkill) ||
                    (vendorList.includes("Viasat") && this.skillListArray[i].Name == viasatSkill)){
                    //(vendorList.includes("Nextlink") && this.skillListArray[i].Name == nextlinkSkill)){
                    this.skillListArray[i].isslected = true;
                }
                else{
                    this.skillListArray[i].isslected = false;  
                }
            }
        }
    }

    Addresschange(event) {
        this.selectedCountry = event.detail.country;
        this.selectedState = event.detail.province;

        this.rec.MailingStreet = event.target.street;
        this.rec.MailingCity = event.target.city;
        this.rec.MailingStateCode = event.target.province;
        this.rec.MailingCountryCode = event.target.country;
        this.rec.MailingPostalCode = event.target.postalCode;

    }
    handleSelect(event) {
        if (event.target.checked) {
            const selected = [...this.selectedRegions];
            selected.push(event.target.dataset.id);

            this.selectedRegions = selected;
            var foundIndex = this.memberShips.findIndex(x => x.serviceTerritoryId == event.target.dataset.id);
            this.memberShips[foundIndex].isTerritoryMember = true;

        } else if (!event.target.checked) {

            this.selectedRegions = this.selectedRegions.filter(item => item !== event.target.dataset.id);
            var foundIndex = this.memberShips.findIndex(x => x.serviceTerritoryId == event.target.dataset.id);
            this.memberShips[foundIndex].isTerritoryMember = false;
        }


    }
    getRegionAssociatedWithResource() {

        if (this.Territoryloaded == false) {
            getStmAsscociatedWithResource({
                resourceId: this.serviceResource,
                accountId: this.recordId
            })
                .then((response) => {

                    if (response.length > 0) {
                        this.resourceList = response;
                        this.showResourceRegion = true;
                        for (let key in this.resourceList) {
                            this.memberShips.push({
                                serviceTerritoryId: this.resourceList[key].serviceTerritoryId,
                                territoryName: this.resourceList[key].territoryName,
                                isTerritoryMember: false

                            });

                        }
                        this.Territoryloaded = true;
                        this.noTerritory = false;

                    } else {

                        this.noTerritory = true;
                    }

                })
                .catch((error) => {
                    this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);
                })
        }


    }




    getVendors() {
        this.showSpinner = true;
        getValues({ objectName: 'ServiceResource', fieldName: 'Vendor_Type__c' })
            .then((result) => {
                for (var i = 0; i < result.length; i++) {
                    this.Vendoroptions.push({ label: result[i], value: result[i] });

                }
                this.optionsLoaded = true;
                this.showSpinner = false;
            })
            .catch((error) => {

                this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);

                console.error('error ' + JSON.stringify(error));
                this.showSpinner = false;
            });
    }

    checkPermission() {
       validatePermission()
            .then((result) => {
                if(result === 'true'){
                    this.showSpinner = true;
                    this.getVendors();
                    console.log('TRUE');
                    this.isVisiblePage = true;
                }
                else{
                    this.isVisiblePage = false;
                    this.isShowModal = false;
                    this.showSpinner = false;
                    this.statusMessage = permissionMsg;
                }
            })
            .catch((error) => {

                this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);

                console.error('error ' + JSON.stringify(error));
                this.showSpinner = false;
            });
    }


    getManagers() {
        this.showSpinner = true;
        getManager({accountId:'$recordId'})
            .then((result) => {
                for (var i = 0; i < result.length; i++) {
                    this.Manageroptions.push({ label: result[i], value: result[i] });
                    
                }
                this.optionsLoaded = true;
                this.showSpinner = false;
                
            })
            .catch((error) => {

                this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);

                console.error('error inside' + JSON.stringify(error));
                this.showSpinner = false;
            });
    }



    getskills() {
        this.showSpinner = true;
        if (this.skillloaded == false) {
            getskills({})
                .then((response) => {
                    this.skillList = response;
                    this.skillListArray = [];
                    for (let key in this.skillList) {
                        // If a new vendor is added
                        this.ischeckedAndDisabled = false;
                        if ((this.rec.Vendor.includes("DIRECTV") && this.skillList[key].MasterLabel == directTVSkill) || 
                             (this.rec.Vendor.includes("Viasat") && this.skillList[key].MasterLabel == viasatSkill)){
                             //(this.rec.Vendor.includes("Nextlink") && this.skillList[key].MasterLabel == nextlinkSkill)){
                             this.ischeckedAndDisabled = true;
                             }
                        this.skillListArray.push({
                            DeveloperName: this.skillList[key].DeveloperName,
                            Name: this.skillList[key].MasterLabel,
                            isslected: this.ischeckedAndDisabled,
                        });

                    }
                    this.skillloaded = true;
                    this.showSpinner = false;

                })
                .catch((error) => {
                    console.error(error);
                    this.showToastMessage(this.constant.ERROR, error.body.message, this.constant.ERROR);
                    this.showSpinner = false;
                })
        } else {
            this.showSpinner = false;
        }


    }



    handleStartDateChanged(event) {
        this.startDate = event.detail.value;

    }

    handleskillStartDateChanged(event) {
        this.skillStartDate = event.detail.value;

    }

    handleSelectskill(event) {
        if (event.target.checked) {
            const selected = [...this.selectedSkills];
            selected.push(event.target.dataset.id);

            this.selectedSkills = selected;
            var foundIndex = this.skillListArray.findIndex(x => x.DeveloperName == event.target.dataset.id);
            this.skillListArray[foundIndex].isslected = true;


        } else if (!event.target.checked) {

            this.selectedSkills = this.selectedSkills.filter(item => item !== event.target.dataset.id);
            var foundIndex = this.skillListArray.findIndex(x => x.DeveloperName == event.target.dataset.id);
            this.skillListArray[foundIndex].isslected = false;

        }


    }

    handleNextTerritory(event) {
        this.defaultSkills = 0;
        for (let i=0 ; i<this.skillListArray.length;i++){
            if (this.skillListArray[i].isslected && !this.selectedSkills.includes(this.skillListArray[i].DeveloperName))
                this.defaultSkills =   this.defaultSkills + 1;     
        }

        if (this.selectedSkills.length > 0 && this.skillStartDate == null && this.dispatcher == false) {
            this.showToastMessage(this.constant.ERROR, 'Please select a Start Date', this.constant.ERROR);
            return;
        }

        if (this.selectedSkills.length == 0 && this.defaultSkills == 0) {
            
            this.showToastMessage(this.constant.ERROR, 'Please select at least one skill', this.constant.ERROR);
            return;

        }

        this.getRegionAssociatedWithResource();
        this.ShowServiceTerritory = true;
        this.CreateContact = false;
        this.firstNext = false;
        this.secondNext = false;
        this.firstback = false;
        this.secondback = true;
        this.submit = false;
        this.ShowSkill = false;
        this.readyfofiles = true;


    }

    handlefiles() {

        if (this.selectedRegions.length == 0) {
            this.showToastMessage(this.constant.ERROR, 'Please select at least one region', this.constant.ERROR);
            return;

        }
        if (this.selectedRegions.length != 0 && this.startDate == null && this.dispatcher == false) {
            this.showToastMessage(this.constant.ERROR, 'Please select a start date', this.constant.ERROR);
            return;

        }

        this.ShowServiceTerritory = false;
        this.CreateContact = false;
        this.firstNext = false;
        this.secondNext = false;
        this.firstback = false;
        this.secondback = false;
        this.submit = true;
        this.ShowSkill = false;
        this.readyfofiles = false;
        this.filescreen = true;

    }

    handlefileback() {

        this.ShowServiceTerritory = true;
        this.CreateContact = false;
        this.firstNext = false;
        this.secondNext = false;
        this.firstback = false;
        this.secondback = true;
        this.submit = false;
        this.ShowSkill = false;
        this.readyfofiles = true;
        this.filescreen = false;
    }

    handlesecondback() {



        if (this.dispatcher == true) {
            this.ShowSkill = false;
            this.ShowServiceTerritory = false;
            this.CreateContact = true;
            this.firstNext = true;
            this.secondNext = false;
            this.firstback = false;
            this.secondback = false;
            this.submit = false;
            this.readyfofiles = false;
        } else {

            this.ShowSkill = true;
            this.ShowServiceTerritory = false;
            this.CreateContact = false;
            this.firstNext = false;
            this.secondNext = true;
            this.firstback = true;
            this.secondback = false;
            this.submit = false;
            this.readyfofiles = false;
        }
    }




    handleFileChange(event) {
        const file = event.target.files[0];

        if (file) {

            const fsize = file.size;
            const sfile = Math.round((fsize / 1024));
            // The size of the file.
            if (sfile >= 3000) {

                this.showToastMessage(this.constant.ERROR, 'Please select an image less than 3 MB', this.constant.ERROR);

                return;

            }
            const reader = new FileReader();
            reader.onload = () => {
                this.imageUrl = reader.result;
                this.fileInputClass = 'file-input-hidden';
                this.profilepic = reader.result.split(',')[1]
                this.picname = file.name;



            };

            reader.readAsDataURL(file);
        }
    }
    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: COUNTRY_CODE
    })
    wiredCountires({ data }) {
        this.countries = data?.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: BILLING_STATE_CODE })
    wiredStates({ data }) {
        if (!data) {
            return;
        }

        const validForNumberToCountry = Object.fromEntries(Object.entries(data.controllerValues).map(([key, value]) => [value, key]));
        this.countriesToStates = data.values.reduce((accumulatedStates, state) => {
            const countryIsoCode = validForNumberToCountry[state.validFor[0]];
            return { ...accumulatedStates, [countryIsoCode]: [...(accumulatedStates?.[countryIsoCode] || []), state] };
        }, {});
    }
    get states() {
        return this.countriesToStates[this.selectedCountry] || [];
    }
    handleUploadClick() {
        this.fileInputClass = 'file-input-visible';
    }
    isDateInPast(dateString) {
        // Check if the entered date is in the past
        const enteredDate = new Date(dateString);
        const currentDate = new Date();

        return enteredDate < currentDate;
    }

}