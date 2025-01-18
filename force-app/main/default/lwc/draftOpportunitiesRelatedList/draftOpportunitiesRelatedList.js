import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import logError from "@salesforce/apex/ErrorLogModel.logError";
import getRecordsByCriteria from "@salesforce/apex/DynamicRelatedListPaneController.getRecordsByCriteria";

const BASE_TITLE = "Drafts";

export default class DraftOpportunitiesRelatedList extends NavigationMixin(LightningElement) {

    @api recordId;
    relatedListTitle;
    relatedListIcon = "standard:opportunities";
    object = "Opportunity";
    fieldList = "Name,StageName,Amount";
    filterCriteria = "POE_Dealer__c = ";
    records = []; 
    total = 0;
    showRecords = false;
    loaderSpinner = false;

    get relatedListViewUrl() {
        return `/lightning/n/Related_List_View?c__recordId=${this.recordId}&c__object=${this.object}&c__fields=${this.fieldList}&c__filterCriteria=${this.filterCriteria}&c__iconName=opportunity`;
    }

    connectedCallback(){
        this.getRecords();
    }

    getRecords() {
        this.loaderSpinner = true;
        let myData = {
            parentRecordId: this.recordId,
            objectName: this.object,
            fieldList: this.fieldList,
            filterCriteria: this.filterCriteria
        };
        getRecordsByCriteria({ myData: myData })
            .then((response) => {
                this.loaderSpinner = false;
                if(response){
                    this.total = response.length;
                    let viewedRecords = response.slice(0, 3);
                    viewedRecords.forEach((record) => {
                        let item = {...record};
                        let attributes = [];
                        for(var attribute in item) {
                            switch(attribute) {
                                case "StageName":
                                    attributes.push({
                                        name: "Stage",
                                        value: item[attribute]
                                    });
                                    break;
                                case "Id":
                                    item.url = item[attribute];
                                    break;
                            }
                        }
                        if(!attributes.hasOwnProperty("Amount")){
                            attributes.push({
                                name: "Amount",
                                value: ""
                            });
                        }
                        item.attributes = attributes;
                        this.records.push(item);
                    });
                }
                if(this.records.length > 0){
                    this.showRecords = true;
                    this.relatedListTitle = BASE_TITLE + " (" + this.total + ")";
                } else {
                    this.relatedListTitle = BASE_TITLE + " (0)";
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "An error occurred retrieving records"
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    navigateToOpportunity(event) {
        let opportunityId = event.target.dataset.id;
        if(opportunityId !== undefined){
            this[NavigationMixin.GenerateUrl]({
                type: "standard__recordPage",
                attributes: {
                    recordId: opportunityId,
                    actionName: "view"
                }
            }).then(url => {
                window.open(url, "_blank");
            });
        }
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Draft Opportunities Related List",
            component: "draftOpportunitiesRelatedList",
            error: errorMessage ? JSON.stringify(errorMessage) : errorMessage
        };

        logError({ error })
            .then(() => {})
            .catch((err) => {
                console.error(`LOGGING ERROR: ${err.body?.message || err.stack}`);
            });
    }

}