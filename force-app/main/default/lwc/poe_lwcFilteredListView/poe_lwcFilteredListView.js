import { LightningElement, wire } from 'lwc';
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { deleteRecord } from 'lightning/uiRecordApi';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import logError from "@salesforce/apex/ErrorLogModel.logError";
import getRecordsByCriteria from "@salesforce/apex/DynamicRelatedListPaneController.getRecordsByCriteria";
import getParentRecordInfo from "@salesforce/apex/DynamicRelatedListPaneController.getParentRecordInfo";

const FIELD_TYPES_DICT = {
    'Reference': 'url',
    'Currency': 'currency',
    'Date': 'date',
    'DateTime': 'date',
    'Int': 'number',
    'Double': 'number',
    'Long': 'number',
    'Percent': 'percent',
    'Url': 'url'
};

const ACTION_CONFIG = {
    type: 'action',
    typeAttributes: { 
        rowActions: [
            { label: 'Edit', name: 'edit' },
            { label: 'Delete', name: 'delete' },
        ] 
    }
};

export default class Poe_lwcFilteredListView extends NavigationMixin(LightningElement) {
    parentRecordId;
    object;
    fields;
    filterCriteria;
    objectIconName;

    objectPluralLabel;
    objectLabel;

    columns = [];
    records = [];
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    recordCount = 0;

    parentObjectName;
    parentObjectPluralLabel;
    parentLabel;

    isLoading = false;
    currentEditedRowId;
    navigationUpdateFn;

    get iconName() {
        return `standard:${this.objectIconName}`;
    }

    get itemCountText() {
        if (this.recordCount === 1) {
            return `1 item`;
        } else {
            return `${this.recordCount} items`;
        }
    }

    get parentListViewUrl() {
        return `/lightning/o/${this.parentObjectName}/home`;
    }

    get parentUrl() {
        return `/${this.parentRecordId}`;
    }

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        this.parentRecordId = currentPageReference.state?.c__recordId;
        this.fields = currentPageReference.state?.c__fields;
        this.filterCriteria = currentPageReference.state?.c__filterCriteria;        
        this.object = currentPageReference.state?.c__object;
        this.objectIconName = currentPageReference.state?.c__iconName;

        if (this.parentRecordId) {
            this.getData();
        }
    }

    @wire(getObjectInfo, { objectApiName: '$object' })
    wiredObjectInfo({ data }) {
        if (data) {
            this.objectPluralLabel = data.labelPlural;
            this.objectLabel = data.label;
            const fieldApiNames = this.fields.split(',');

            this.columns = fieldApiNames.map((fieldApiName, i) => {
                if (i === 0) {
                    return {
                        label: data.fields[fieldApiName]?.label,
                        fieldName: 'recordUrl',
                        type: 'url',
                        sortable: true,
                        typeAttributes: {
                            label: { fieldName: fieldApiName },
                        }
                    };
                }
                
                return {
                    label: data.fields[fieldApiName]?.label,
                    fieldName: fieldApiName,
                    sortable: true,
                    type: this.getFieldType(data.fields[fieldApiName]?.dataType)
                };
            });
            this.columns.push(ACTION_CONFIG);
        }
    }

    connectedCallback() {
        this.navigationUpdateFn = (event) => {
            this.handleNavigationUpdate(event.currentTarget.currentEntry.url);
        };
        window.navigation.addEventListener("navigate", this.navigationUpdateFn);
    }
    
    disconnectedCallback() {
        window.navigation.removeEventListener("navigate", this.navigationUpdateFn);
    }

    handleRowAction(event) {
        const action = event.detail.action.name;

        switch (action) {
            case 'edit':
                this.handleEdit(event.detail.row.Id);
                break;
            case 'delete':
                this.deleteRecord(event.detail.row);
                break;
        }
    }

    handleRefresh() {
        this.isLoading = true;

        this.getRecords()
        .finally(() => {
            this.isLoading = false;
        })
    }

    handleEdit(recordId) {
        this.currentEditedRowId = recordId;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'edit',
            },
        });
    }

    getFieldType(objectInfoType) {
        if (FIELD_TYPES_DICT[objectInfoType]) {
            return objectInfoType;
        }

        return 'text';
    }

    deleteRecord(row) {
        const recordName = row[this.columns[0].typeAttributes.label.fieldName];

        this.isLoading = true;
        deleteRecord(row.Id)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `${this.objectLabel} "${recordName}" was deleted.`,
                    variant: 'success'
                })
            );

            this.handleRefresh();
        })
        .catch(error => {
            console.error(error, "ERROR");
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: "An error occurred while deleting the record"
            });
            this.dispatchEvent(event);
            this.logError(error.body?.message || error.message);
            this.isLoading = false;
        });
    }

    getData() {
        this.isLoading = true;
        Promise.all([
            this.getParentRecordInfo(),
            this.getRecords()
        ])
        .then(() => {})
        .finally(() => {
            this.isLoading = false;
        });
    }

    getParentRecordInfo() {
        return getParentRecordInfo({ recordId: this.parentRecordId })
        .then(data => {
            this.parentObjectPluralLabel = data.sobjectPluralLabel;
            this.parentObjectName = data.sobjectApiName;
            this.parentLabel = data.parentRecordLabel;
        })
        .catch(error => {
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

    getRecords() {
        let myData = {
            parentRecordId: this.parentRecordId,
            objectName: this.object,
            fieldList: this.fields,
            filterCriteria: this.filterCriteria
        };

        return getRecordsByCriteria({ myData: myData })
        .then((response) => {
            if (response) {
                const records = [];
                response.forEach(item => {
                    item['recordUrl'] = `/${item['Id']}`;

                    records.push(item);
                });

                this.records = records;
            }

            this.recordCount = this.records.length;
            this.sort(this.sortedBy, this.sortDirection);
        })
        .catch((error) => {
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

    handleNavigationUpdate(currentHref) {
        if (currentHref.includes(`${this.currentEditedRowId}/edit`)) {
            this.currentEditedRowId = undefined;
            this.handleRefresh();
        }
    }

    handleSort(event) {
        this.isLoading = true;
        const { fieldName: sortedBy, sortDirection } = event.detail;
        setTimeout(() => {
            this.sort(sortedBy, sortDirection);
            this.isLoading = false;
        }, 100);
    }

    sort(sortedBy, sortDirection) {
        const cloneData = [...this.records];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.records = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Related List View",
            component: "poe_lwcFilteredListView",
            error: errorMessage ? JSON.stringify(errorMessage) : errorMessage
        };

        logError({ error })
        .then(() => {})
        .catch((err) => {
            console.error(`LOGGING ERROR: ${err.body?.message || err.stack}`);
        });
    }
}