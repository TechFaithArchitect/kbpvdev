import { LightningElement,api,track,wire  } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import  getAudit from '@salesforce/apex/PV_AuditController.getAudit';
import  getCompletedAudit from '@salesforce/apex/PV_AuditController.getCompletedAudit';
import  updateAudit from '@salesforce/apex/PV_AuditController.updateAudit';
import  auditOptions from '@salesforce/apex/PV_AuditController.auditOptions';
import qualityOptions from '@salesforce/apex/PV_AuditController.qualityOptions';
import auditResult from '@salesforce/apex/PV_AuditController.auditResult';
import AUDIT_OBJECT from '@salesforce/schema/Audit__c';



export default class PvAudit extends LightningElement {
    @api objectApiName='Audit__c';
    @track auditResult=[];
    @track optionsLoaded = false;
    @track isCompleted = false;
    @api recordId;
    auditRecordId;
    @track audits={};
    @track  auditRecords = {
        On_Site__c:'N/A',
        Virtual__c:'N/A',
        Roof__c:'N/A',
        Stubby__c:'N/A',
        Round_Pole__c:'N/A',
        S_Mount__c:'N/A',
        Non_Pen__c:'N/A',
        Hex_Pole__c:'N/A',
        Undereave__c:'N/A',
        Approved_Mount__c:'N/A',
        Wall__c:'N/A',
        All_Required_Photos__c:'N/A',
        Quality_Follow_Up_Needed__c:'',
        Antenna_Pointing__c:'N/A',
        Equipment_Cable_ODU__c:'N/A',
        Line_of_Sight_10__c:'N/A',
        ODU_Mount_Hardware__c:'N/A',
        Approved_Cabling_Aesthetics__c:'N/A',
        System_Grounded_to_NEC_Ground_Source__c:'N/A',
        Pre_Install_Customer_Experience__c:'N/A',
        Site_Survey__c:'N/A',
        Antenna_Assembly__c:'N/A',
        Antenna_Mount__c:'N/A',
        Cable_Routing__c:'N/A',
        System_Grounded__c:'N/A',
        Point_Peak__c:'N/A',
        System_Provisioned__c:'N/A',
        Post_Install_Customer_Experience__c:'N/A',
        Audit_Result__c:'',
        Id:'',
        Work_Order__c:this.recordId

  
    };
    @track options=[ ];
    @track qualityFollwup=[];
    @track createAuditscreen=false;
    IsEditable;
    activeSections = ['A','B','C'];
    auditRecord = {};
    connectedCallback(){
        this.getReleatedAudit();

        getCompletedAudit({ workOrderId: this.recordId })
        .then((result) => {
            this.isCompleted = result;
            console.log('result',result);
            console.log('this.isCompleted',this.isCompleted);
        })
        .catch((error) => {
            this.error = error;
            this.showToastMessage('error',error.body.message,'error');

        });

       auditOptions()
        .then((result) => {
            this.options=result;
           
        })
        .catch((error) => {
            this.error = error;
            this.showToastMessage('error',error.body.message,'error');

        });

        qualityOptions()
        .then((result) => {

            this.qualityFollwup=result;
           
        })
        .catch((error) => {
            this.showToastMessage('error',error.body.message,'error');

        });


        auditResult()
        .then((result) => {
            this.auditResult=result;
            this.optionsLoaded=true;
           
        })
        .catch((error) => {
            this.error = error;
            this.showToastMessage('error',error.body.message,'error');

        });

    }   
   
    

    handleSectionToggle(event) {
        const openSections = event.detail.openSections;

       
    }
    handleChange(event){
        this.audits[event.target.name]=event.target.value;

    }

   
    createAudit(event) {
        this.audits['Work_Order__c']=this.recordId;
        const fields = this.audits;
        const recordInput = { apiName: AUDIT_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then((Audit) => {
                this.auditRecords.Id= Audit.id;
                this.showToastMessage('Success','Audit created successfully!','Success');

                this.createAuditscreen=false;
            })
            .catch((error) => {
                this.showToastMessage('error',error.body.message,'error');

            
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    getReleatedAudit(){
     
        getAudit({ workOrderId: this.recordId })
        .then((result) => {
            if(result.auditList==''){
                this.IsEditable = !(result.IsEditAccess);
                this.createAuditscreen=true;
                this.activeSections = ['A','B','C'];
            }else{
              
                this.auditRecords = result.auditList[0];
                this.IsEditable = !(result.IsEditAccess);
                this.auditRecordId= result.auditList[0].id;
                console.log(this.auditRecords.Audit_Result__c );
                this.optionsLoaded=true;
                this.activeSections=[];
                this.createAudit=false;

            }
           
        })
        .catch((error) => {
            this.error = error;
            this.showToastMessage('error',error.body.message,'error');

        });
    }

    updateAudit(){
   
        this.audits['Id']=this.auditRecords.Id;
        updateAudit({ auditrecord:this.audits })
        .then((result) => {
                this.showToastMessage('success','Audit record updated successfully','success');

        })
        .catch((error) => {
            this.showToastMessage('error',error.body.message,'error');

        });
    }
    
    showToastMessage(title, message, variant){
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
                duration:' 10000'
            })
            );
    }
}