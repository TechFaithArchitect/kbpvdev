import { LightningElement,api } from 'lwc';
import fetchAuditQuestions from "@salesforce/apex/PV_AuditService.fetchAuditQuestions";
import fetchRelatedAudit from "@salesforce/apex/PV_AuditService.fetchRelatedAudit";

import getVendorType from "@salesforce/apex/PV_AuditService.getVendorType";
import insertAudit from "@salesforce/apex/PV_AuditService.insertAudit";
import handleAudit from "@salesforce/apex/PV_AuditService.handleAudit";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';



export default class PvAuditScreen extends LightningElement {
    auditData = [];
    auditResponse = [];
    @api recordId;
    status = '';
    showAudit = false;
    showStatusMessage = false;
    vendorType = '';
    exceptionErrorMessage = '';
    isupdate;
    readonlyuser=false;
    isLoading=true;
    action='insert';
    activeSections = ['A'];
    SingleFailure;
    isAvailable;
    connectedCallback() {
        this.getVendorType();

    }

    getVendorType() {
        getVendorType({ recordId: this.recordId }).then(response => {
        this.readonlyuser=response[0].IsReadOnlyUser;
        this.SingleFailure=response[0].noSingleFailure;
        this.isAvailable=response[0].isAvailable;
          if(response[0].IsUpdate){
            this.isupdate=true;
            this.action='Update';
            this.activeSections=[];
            this.getAudit(response[0].auditId)
          }else{
            this.action='Create';
            this.activeSections=['A'];
            this.getAuditQuestion(response[0].vendorType,response[0].workType);

          }
            
        }).catch(error => {
            console.log('ERROR -->' + JSON.stringify(error));
            this.showNotification('error',error.body.message,'error');
            this.isLoading=false;

        });
    }

    getAuditQuestion(vendorType,workType) {
        fetchAuditQuestions({ vendorType: vendorType ,workType:workType}).then(response => {
            
            this.formatResponse(response);
        }).catch(error => {
            console.log('ERROR -->' + JSON.stringify(error));
            this.showNotification('error',error.body.message,'error');
            this.isLoading=false;

        });
    }

    getAudit(AuditId) {
        this.auditResponse =[];
        fetchRelatedAudit({ AuditId:AuditId}).then(response => {
            this.formatAudit(response);

        }).catch(error => {
            console.log('ERROR -->' + JSON.stringify(error));
            this.showNotification('error',error.body.message,'error');

            this.isLoading=false;
        });
    }


    formatResponse(response) {
        this.showAudit = true;
        this.isLoading=false;
        this.auditData = response.map(ele => {
            this.auditResponse.push({ "question": ele.Question__c, "response":ele.Default_value__c, "isActive": ele.Is_active__c,"Id":ele.Id });
            return {
                "id": ele.Id,
                "question": ele.Question__c,
                "header": ele.Header__c,
                "values": ele.Options__c,
                "type": ele.Type__c,
                "isDependent": ele.Is_Dependent_Question__c,
                "depQuestion": ele.Dependent_Question__c,
                "depExpectedText": ele.Exp_Parent_Ques_Response__c,
                "isVisible": ele.Is_active__c,
                "value": ele.Default_value__c,
                "width":ele.Width__c,
                "readonly":false
            }

            
        });

        if(this.SingleFailure){
            const index = this.auditData.findIndex(ele => ele.question == 'Audit Result');
            this.auditData[index].readonly = true;
        }

    }

    
    formatAudit(response) {

        this.auditData = response.map(ele => {
            this.auditResponse.push({ "question": ele.Audit_Question__r.Question__c, "response":ele.Response__c, "isActive": ele.IsActive__c,"Id":ele.Id ,"responseId":ele.Id });
            return {
                "id": ele.Id,
                "question": ele.Audit_Question__r.Question__c,
                "header": ele.Audit_Question__r.Header__c,
                "values": ele.Audit_Question__r.Options__c,
                "type": ele.Audit_Question__r.Type__c,
                "isDependent": ele.Audit_Question__r.Is_Dependent_Question__c,
                "depQuestion": ele.Audit_Question__r.Dependent_Question__c,
                "depExpectedText": ele.Audit_Question__r.Exp_Parent_Ques_Response__c,
                "isVisible": ele.IsActive__c,
                "value": ele.Response__c,
                "width":ele.Audit_Question__r.Width__c,
                "readonly":ele.Audit_Question__r.Read_only__c
            }

            
        });

        if(this.SingleFailure){
            const index = this.auditData.findIndex(ele => ele.question == 'Audit Result');
            this.auditData[index].readonly = true;
        }

       this.showAudit = true;
       this.isLoading=false;
       
    }


    handleSelection(event) {
        const { id, result } = event.detail;
        this.auditData = this.auditData.map(ele => {
            if (ele.depQuestion &&
                ele.depQuestion == id) {
                //console.log(JSON.stringify(ele));
                ele.isVisible = result === ele.depExpectedText;
                //Audit response -- update & reset
                const depQuesIndex = this.auditResponse.findIndex(element => element.Id == ele.id)
                this.auditResponse[depQuesIndex].isActive = ele.isVisible;
                this.auditResponse[depQuesIndex].response = ele.value;
                // this.auditResponse[depQuesIndex] = { "question": ele.question, "response": '', "isActive": ele.isVisible };

            }
            return ele;
        });

        const index = this.auditResponse.findIndex(ele => ele.Id == id);
     
         this.auditResponse[index].response = result;
         this.validatesinglefailure(this.auditResponse);

    }

    handleAuditSubmit(event) {
        // this.isLoading=true;
        if(this.isupdate){
            const reque = this.auditResponse.filter(ele => ele.isActive).map(ele => {
                
                return {
                    "Response__c":ele.response,
                    "Id":ele.Id,
                    IsActive__c:true
                    
                };

            });
           
        
            handleAudit({ auditResponses: reque,IsUpdate:true}).then((result) => {
                this.showNotification('success', "Audit has been updated successfully", 'Success!');
                this.isLoading=false;
              
    
            }).catch((error) => {
                console.debug('ERROR -->' + JSON.stringify(error));
                this.showNotification('error',error.body.message,'error');

                this.isLoading=false;
            });
        }else{
            this.isLoading=false;
            insertAudit({ recordId: this.recordId}).then((result) => {

              console.log('response,',JSON.stringify(this.auditResponse));
                 const reque = this.auditResponse.filter(ele => ele.isActive).map(ele => {
                    
                     return {
                         "Question__c": ele.question,
                         "Response__c": ele.response,
                         "Work_Order__c": this.recordId,
                         "Audit_Question__c":ele.Id,
                         IsActive__c:true,
                         "Audit__c":result
                     };
     
                 });
               
                 handleAudit({ auditResponses: reque,IsUpdate:false}).then((result) => {
                     this.showNotification('success', "Audit has been created successfully", 'Success!');
                     this.getVendorType();
                 }).catch((error) => {
                    this.showNotification('error',error.body.message,'error');

                     console.debug('ERROR -->' + JSON.stringify(error));
                 });
     
             }).catch((error) => {
                 console.debug('ERROR -->' + JSON.stringify(error));
                 this.showNotification('error',error.body.message,'error');

             });
        }

       

     
    }

    validatesinglefailure(){

    if(this.SingleFailure){
                const index = this.auditResponse.findIndex(ele => ele.question == 'Audit Result');
                 const index2 = this.auditData.findIndex(ele => ele.question == 'Audit Result');
                const errorindex = this.auditResponse.findIndex(element => element.response == 'Fail')
             
                if(errorindex>0){
                    this.auditResponse[index].response='FAIL'
                    this.auditData[index2].value='FAIL'
                }else{
                    this.auditResponse[index].response='PASS'
                    this.auditData[index2].value='PASS'

                }

             }
    }

    handleClick() {
        let isChildValidated = true; 
        this.template.querySelectorAll("c-pv-audit-screen-element")
            .forEach(element => {
                if (element.checkValidity() === false) {
                    isChildValidated = false;
                }
            });
    
    
        if (isChildValidated === true) {
            this.handleAuditSubmit();
        } else {
            this.showNotification('error', "Please Fill the required fields", 'Error!');
        }
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

    handleSectionToggle(event) {
        const openSections = event.detail.openSections;

       
    }
    
}