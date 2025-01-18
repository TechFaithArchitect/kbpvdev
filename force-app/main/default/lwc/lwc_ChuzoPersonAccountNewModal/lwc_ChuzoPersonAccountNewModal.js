import { api, track, wire } from 'lwc';
import LightningModal from 'lightning/modal';
import createPersonAccount from '@salesforce/apex/ChuzoPersonAccountNewModalController.createPersonAccount';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import LEAD_ORIGIN_FIELD from '@salesforce/schema/Contact.Lead_Origin__c';
import PROGRAM_LEAD_TYPE_FIELD from '@salesforce/schema/Contact.Program_Lead_Type__c';
import RATING_FIELD from '@salesforce/schema/Contact.Rating__c';
import OPPORTUNITY_STAGE_FIELD from '@salesforce/schema/Contact.Opportunity_Stage__c';

export default class Lwc_ChuzoPersonAccountNewModal extends LightningModal {
    @api label;
    @track isLoading = false;
    @track disableSaving = true;

    firstName = '';
    lastName = '';
    streetLineOne = '';
    streetLineTwo = '';
    city = '';
    state = '';
    zip = '';
    country = '';
    phoneOne = '';
    phoneTwo = '';
    emailOne = '';
    emailTwo = '';
    leadOrigin = '';
    leadOriginOther = '';
    programLeadType = [];
    programLeadTypeOther = '';
    currentProviders = '';
    currentProvidersCost = null;
    underContract = false;
    contractExpirationDate = null;
    suggestedProviders = '';
    suggestedProvidersCost = null;
    firstDateContacted = null;
    secondDateContacted = null;
    thirdDateContacted = null;
    soldDate = null;
    stage = '';
    rating = '';

    get isLeadOriginOther(){
        return this.leadOrigin === 'Other';
    }

    get isProgramLeadTypeOther(){
        return this.programLeadType.includes('Other');
    }

    get saveButtonClass(){
        return this.allowSaving ? 'btn-provider-color btn-only-rounded' : 'btn-provider-color btn-only-rounded btn-disabled';
    }

    @track defaultRecordTypeId;
    @wire(getObjectInfo, { objectApiName: 'Contact' })
    getDefaultRecordTypeId(result){
        if(result.data){
            this.defaultRecordTypeId = result.data.defaultRecordTypeId;
        } else if(result.error){
            console.error(result.error);
        }
    }; 

    @track leadOriginOptions = [];
    @wire(getPicklistValues, { recordTypeId: '$defaultRecordTypeId', fieldApiName: LEAD_ORIGIN_FIELD })
    populateLeadOriginOptions(result){
        if(result.data){
            let pickListValues = [];
            for(let option of result.data.values){
                pickListValues.push({label: option.label, value: option.value});
            }
            this.leadOriginOptions = pickListValues;
        } else if(result.error){
            console.error(result.error);
        }
    };

    @track programLeadTypeOptions = [];
    @wire(getPicklistValues, { recordTypeId: '$defaultRecordTypeId', fieldApiName: PROGRAM_LEAD_TYPE_FIELD })
    populateProgramLeadTypeOptions(result){
        if(result.data){
            let pickListValues = [];
            for(let option of result.data.values){
                pickListValues.push({label: option.label, value: option.value});
            }
            this.programLeadTypeOptions = pickListValues;
        } else if(result.error){
            console.error(result.error);
        }
    };

    @track stageOptions = [];
    @wire(getPicklistValues, { recordTypeId: '$defaultRecordTypeId', fieldApiName: OPPORTUNITY_STAGE_FIELD })
    populateStageOptions(result){
        if(result.data){
            let pickListValues = [];
            for(let option of result.data.values){
                pickListValues.push({label: option.label, value: option.value});
            }
            this.stageOptions = pickListValues;
        } else if(result.error){
            console.error(result.error);
        }
    };

    @track ratingOptions = [];
    @wire(getPicklistValues, { recordTypeId: '$defaultRecordTypeId', fieldApiName: RATING_FIELD })
    populateRatingOptions(result){
        if(result.data){
            let pickListValues = [];
            for(let option of result.data.values){
                pickListValues.push({label: option.label, value: option.value});
            }
            this.ratingOptions = pickListValues;
        } else if(result.error){
            console.error(result.error);
        }
    };

    disableValidations(){
        let fieldsDontHaveValues = (this.firstName === undefined || this.firstName !== '' 
            || this.lastName !== undefined || this.lastName !== '' 
            || this.phoneOne !== undefined || this.phoneOne !== '' 
            || this.emailOne !== undefined || this.emailOne !== '');
        
        let fieldsAreValid = true;
        let allInputs = this.template.querySelectorAll('lightning-input');

        for(let input of allInputs){
            fieldsAreValid = fieldsAreValid && input.checkValidity();
        }

        this.disableSaving = fieldsDontHaveValues && !fieldsAreValid;
    }

    handleChange(event){
        switch (event.target.name){
            case "firstName":
                this.firstName = event.target.value;
                break;
            case "lastName":
                this.lastName = event.target.value;
                break;
            case "phoneOne":
                this.phoneOne = event.target.value;
                break;
            case "phoneTwo":
                this.phoneTwo = event.target.value;
                break;
            case "emailOne":
                this.emailOne = event.target.value;
                break;
            case "emailTwo":
                this.emailTwo = event.target.value;
                break;
            case "leadOrigin":
                this.leadOrigin = event.target.value;
                break;
            case "leadOriginOther":
                this.leadOriginOther = event.target.value;
                break;
            case "programLeadType":
                this.programLeadType = event.target.value;
                break;
            case "programLeadTypeOther":
                this.programLeadTypeOther = event.target.value;
                break;
            case "currentProviders":
                this.currentProviders = event.target.value;
                break;
            case "currentProvidersCost":
                this.currentProvidersCost = event.target.value;
                break;
            case "underContract":
                this.underContract = event.target.checked;
                break;
            case "contractExpirationDate":
                this.contractExpirationDate = event.target.value;
                break;
            case "suggestedProviders":
                this.suggestedProviders = event.target.value;
                break;
            case "suggestedProvidersCost":
                this.suggestedProvidersCost = event.target.value;
                break;
            case "firstDateContacted":
                this.firstDateContacted = event.target.value;
                break;
            case "secondDateContacted":
                this.secondDateContacted = event.target.value;
                break;
            case "thirdDateContacted":
                this.thirdDateContacted = event.target.value;
                break;
            case "soldDate":
                this.soldDate = event.target.value;
                break;
            case "stage":
                this.stage = event.target.value;
                break;
            case "rating":
                this.rating = event.target.value;
                break;
        }
        this.disableValidations();
    }

    handleAddressChange(event){
        this.streetLineOne = event.target.street;
        this.streetLineTwo = event.target.addressLine2;
        this.city = event.target.city;
        this.state = event.target.province;
        this.zip = event.target.postalCode;
        this.country = event.target.country;
    }

    handleSubmit(){
        this.isLoading = true;
        const myData = {
            firstName : this.firstName,
            lastName : this.lastName,
            streetLineOne : this.streetLineOne,
            streetLineTwo : this.streetLineTwo,
            city : this.city,
            state : this.state,
            zip : this.zip,
            country : this.country,
            phoneOne : this.phoneOne,
            phoneTwo : this.phoneTwo,
            emailOne : this.emailOne,
            emailTwo : this.emailTwo,
            leadOrigin : this.leadOrigin,
            leadOriginOther : this.leadOriginOther,
            programLeadType : this.programLeadType.join(';'),
            programLeadTypeOther : this.programLeadTypeOther,
            currentProviders : this.currentProviders,
            currentProvidersCost : this.currentProvidersCost,
            underContract : this.underContract,
            contractExpirationDate : this.contractExpirationDate,
            suggestedProviders : this.suggestedProviders,
            suggestedProvidersCost : this.suggestedProvidersCost,
            firstDateContacted : this.firstDateContacted,
            secondDateContacted : this.secondDateContacted,
            thirdDateContacted : this.thirdDateContacted,
            soldDate : this.soldDate,
            stage : this.stage,
            rating : this.rating
        }
        createPersonAccount({jsonRequest: JSON.stringify(myData)}).then(
            () => {
                this.isLoading = false;
                this.close('success');
            }
        ).catch(
            (error) => {
                console.error(error);
                this.close('error');
            }
        );
    }

    handleCancel(){
        this.close('cancel');
    }
}