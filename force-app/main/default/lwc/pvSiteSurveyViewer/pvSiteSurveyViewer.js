import { LightningElement, api,wire } from 'lwc';
import getSurveyQuestions from "@salesforce/apex/PV_SiteSurveyService.fetchSurveyQuestions";
import insertSurveyResponse from "@salesforce/apex/PV_SiteSurveyService.createSurveyResponses";
import getVendorType from "@salesforce/apex/PV_SiteSurveyService.getVendorType";
import getSurveyResponse from "@salesforce/apex/PV_SiteSurveyService.getSurveyResponse";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { createRecord,getRecord,getFieldValue ,deleteRecord,updateRecord  } from 'lightning/uiRecordApi';
import WO_ID from "@salesforce/schema/ServiceAppointment.FSSK__FSK_Work_Order__c";
import ID_FIELD from "@salesforce/schema/WorkOrder.Id";
import SITESURVEY_FIELD from "@salesforce/schema/WorkOrder.Site_Survey_Acknowledgement__c";
import acknowledgement from '@salesforce/label/c.PV_Site_Survey_Akn';

const fields = [WO_ID];

export default class PvSiteSurveyViewer extends LightningElement {
    surveyAck = acknowledgement;
    surveyData = [];
    surveyResponse = [];
    toBeDeletedResponse = [];
    @api recordId;
    status = '';
    showSiteSurvey = false;
    showStatusMessage = false;
    showSuccessMessage = false;
    vendorType = '';
    surveyCompleted = false;
    exceptionErrorMessage = '';
    showSubmit = false;
    submitDisabled = false;
    acknowledgement = false;
    siteSurveyAllowdedWT = '';
    showAcknowledgement = false;
    workType ='';

    @wire(getRecord, {
        recordId: "$recordId",
        fields
      })
      sa;

      get woId() {
        return getFieldValue(this.sa.data, WO_ID);
      }

    connectedCallback() {
        this.getVendorType();
    }

    getVendorType() {
        getVendorType({ recordId: this.recordId }).then(response => {
            if (response[0].availableForComponent && response[0].status == 'Onsite') {
                this.showSiteSurvey = true;
                this.getResponse(response[0].vendorType);
                this.workType = response[0].workType;
                this.siteSurveyAllowdedWT = response[0].siteSurveyAvailableWT;
                this.showAcknowledgement = this.siteSurveyAllowdedWT.includes(this.workType);

            }
            else if (response[0].status != 'Onsite' && response[0].availableForComponent) {
                this.showSiteSurvey = false;
                this.loader = false;
                this.showStatusMessage = true;
                this.exceptionErrorMessage = 'Site Survey available only in onsite status';
                this.showNotification('warning', 'Site Survey available only in onsite status', 'Error');
            }
            else {
                this.showSiteSurvey = false;
                this.loader = false;
                this.showStatusMessage = true;
                this.exceptionErrorMessage = 'Site Survey not available for this work type';
                this.showNotification('warning', 'Site Survey not available for this work type', 'Error');
            }

        }).catch(error => {
            console.log('ERROR At line 38' + JSON.stringify(error));
        });
    }

    getSurveyQuestion(vendorType) {
        getSurveyQuestions({ vendorType: vendorType }).then(response => {
           this.loader = false;
            this.formatResponse(response);
        }).catch(error => {
            this.loader = false;
            console.log('ERROR line 47', JSON.stringify(error));
        });
    }


    getResponse(vendorType) {
        this.loader = true;
        getSurveyResponse({ recordId: this.recordId ,vendorType: vendorType })
            .then(response => {
                if (response.length !=0) {
                    this.loader = false;
                    this.formatResponse(response);
                }
                else  {
                    this.getSurveyQuestion(vendorType);
                }
            }).catch(error => {
                this.loader = false;
                console.log('ERROR 62', JSON.stringify(error));
            });
    }

    handleSelection(event) {
        const { id, result,responseId } = event.detail;
        const depQuesIndexde = this.surveyResponse.findIndex(element => element.depQuestion == id);
        this.surveyData = this.surveyData.map(ele => {
            if (ele.depQuestion &&ele.depQuestion == id) {
                
                ele.isVisible = result === ele.depExpectedText;
                //Survey response -- update & reset
                const depQuesIndex = this.surveyResponse.findIndex(element => element.question == ele.id);
                if (result != ele.depExpectedText && result !== undefined) {
                     this.toBeDeletedResponse.push( this.surveyResponse[depQuesIndex].responseId) ;
                }else{
                    const index = this.toBeDeletedResponse.findIndex(element => element == this.surveyResponse[depQuesIndex].responseId);
                    this.toBeDeletedResponse.splice(index, 1);
                }
                this.surveyResponse[depQuesIndex] = { "question": ele.id, "response": '', "isActive": ele.isVisible };
            }
            return ele;
        });

       
        const index = this.surveyResponse.findIndex(ele => ele.question == id);
        
        this.surveyResponse[index].response = result;
        this.surveyResponse[index].responseId = responseId;
    }

    handleSurveySubmit(event) {

        const request = this.surveyResponse.filter(ele => ele.isActive).map(ele => {
            return {
                "question__c": ele.question,
                "response__c": ele.response,
                "Service_Appointment__c": this.recordId,
                "Work_Order__c": this.woId,
                "Id" : ele.responseId
            };
        });
        insertSurveyResponse({ surveyResponses: request }).then((result) => {
            this.updateWorkOrder();
            this.toBeDeletedResponse.filter(ele => ele != undefined);
            if(this.toBeDeletedResponse.length != 0){
                this.handleDelete();
            }
            this.showNotification('success', "Site Survey Submitted", 'Success!');
            this.showSuccessMessage = true;
            this.showSiteSurvey = false;
            this.loader = false;

        }).catch((error) => {
            this.loader = false;
            this.submitDisabled = true;
            console.debug('ERROR -->' + JSON.stringify(error));
        });
    }

    handleDelete(){
        this.toBeDeletedResponse.filter(ele => ele != undefined).forEach(recordId => {
            deleteRecord(recordId)
                .then(() => {
                    this.loader = false;
                    console.log('Record deleted successfully');
                })
                .catch(error => {
                    this.loader = false;
                    console.error('Error deleting record:', error);
                });
        });
    }

    formatResponse(response) {
        this.surveyData = response.map(ele => {
            this.surveyResponse.push({ "question": ele.QuestionId, "response": ele.value, "isActive": ele.isActive,
            "responseId":ele.responseId,"value": ele.value,"depQuestion":ele.dependentQuestion,"isDependent": ele.isDependentQuestion});
            return {
                "id": ele.QuestionId,
                "question": ele.question,
                "header": ele.header,
                "values": ele.options,
                "type": ele.type,
                "isDependent": ele.isDependentQuestion,
                "depQuestion": ele.dependentQuestion,
                "depExpectedText": ele.expParentQuesResponse,
                "isVisible": ele.isActive,
                "value" : ele.value,
                "responseId": ele.responseId
            }
        });

        this.showSubmit = true;
        this.loader = false;
        this.showSiteSurvey = true;
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

    // Handle the submit button click
    handleSubmit() {
        this.submitDisabled = true;
        this.loader = true;
        let isFormValid = true;

        // Iterate through child components and check validity
        this.template.querySelectorAll("c-pv-site-survey-element").forEach(childComponent => {
            if (!childComponent.checkValidity()) {
                isFormValid = false;
            }
        });

        if (!isFormValid   ) {
            this.submitDisabled = false;
            this.showNotification('error', 'Please fill in all required fields.', 'Error');
            this.loader = false;
        }else if(this.acknowledgement != true && this.showAcknowledgement == true){
            this.submitDisabled = false;
            this.showNotification('error', 'Please accept Site Survey Acknowledgement.', 'Error');
            this.loader = false;
        } 
        else {
            this.handleSurveySubmit();
        }
    }
    handleCheckBoxChange(event){
      this.acknowledgement = event.target.checked;
    }

    updateWorkOrder() {
        
      const fields = {};
  
      fields[ID_FIELD.fieldApiName] = this.woId;
      fields[SITESURVEY_FIELD.fieldApiName] = this.acknowledgement;
          
      const recordInput = {
        fields: fields
      };
  
      updateRecord(recordInput).then((record) => {
        console.log(record);
      });
    }
}