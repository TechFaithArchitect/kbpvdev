import { LightningElement ,wire,api} from 'lwc';
import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import UserNameFld from '@salesforce/schema/User.Name';
import chuzo_image from '@salesforce/resourceUrl/Chuzo_Image';
import getWorkPlan from '@salesforce/apex/PV_WorkPlanController.getWorkPlan';
import getWorkPlanType from '@salesforce/apex/PV_WorkPlanController.getWorkPlanType';


export default class PvWorkplan extends LightningElement {
    userId = Id;
    currentUserName;
    chuzoImage = chuzo_image;
    workPlanRecords = '';
    records ;
    @api recordId;
    workTypeName = '';
    showWorkPlan = true;

    connectedCallback(){
        this.getWorkPlanType();
    }

   
   @wire(getRecord, {recordId: Id, fields: [UserNameFld ]}) 
    userDetails({error, data}) {
        if (data) {
            this.currentUserName = data.fields.Name.value;
        } else if (error) {
            this.error = error ;
        }
    }

     getWorkPlanType(){
        getWorkPlanType({recordId :this.recordId})
        .then(result => {
            console.log("INSIDE aPEX");
            this.workTypeName = result;
            this.getWorkPlan()
            console.log('workTypeName',this.workTypeName);
        }).catch(error => {
            console.log('error ', JSON.stringify(error));
        })
    }

        getWorkPlan(){
            getWorkPlan({workType :this.workTypeName})
            .then(result => {
                console.log("INSIDE getWorkPlan");
                console.log("records------->",result);
            this.records = result;
           if(!this.records || this.records.length === 0){
             this.showWorkPlan = false;
           }
        }).catch(error => {
            console.log('error ', JSON.stringify(error));
        })
    }

 
}