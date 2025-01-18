import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";
import { IsConsoleNavigation, getFocusedTabInfo, closeTab, openTab, focusTab } from 'lightning/platformWorkspaceApi';
import CASE_OBJECT from '@salesforce/schema/Case';
import getCaseRecordTypes from "@salesforce/apex/POE_NewCaseOverrideController.getCaseRecordTypes";

export default class Poe_lwcNewCaseOverride extends NavigationMixin(LightningElement) {
    objectApiName = CASE_OBJECT;
    recordTypeOptionsById = {};
    selectedRecordTypeId;
    selectedRecordTypeName;
    isLoading = true;
    showRecordTypeSelection = true;
    cardTitle;
    layoutFields = [];
    colSize;
    isSaveAndNew = false;

    get recordTypeOptions() {
        const options = [];
        Object.values(this.recordTypeOptionsById).forEach(recTypeOpt => {
            if (recTypeOpt.isDefault) {
                options.unshift(recTypeOpt);
            } else {
                options.push(recTypeOpt);
            }
        });

        return options;
    }

    get disableNext() {
        return !this.selectedRecordTypeId;
    }

    @wire(IsConsoleNavigation) 
    isConsoleNavigation;

    @wire(getCaseRecordTypes)
    getCaseRecordTypesWire({ data, error }) {
        if (data && data.length > 0) {
            this.objectApiName = data[0].objectApiName;

            this.recordTypeOptionsById = {};
            data.forEach(recordTypeInfo => {
                if (!recordTypeInfo.isAvailable) {
                    return;
                }

                if (recordTypeInfo.isDefault) {
                    this.selectedRecordTypeId = recordTypeInfo.recordTypeId;
                    this.selectedRecordTypeName = recordTypeInfo.name;
                }

                this.recordTypeOptionsById[recordTypeInfo.recordTypeId] = {
                    label: recordTypeInfo.name,
                    value: recordTypeInfo.recordTypeId,
                    description: recordTypeInfo.description,
                    isDefault: recordTypeInfo.isDefault
                };
            });

            this.isLoading = false;
        } else if (error) {
            console.error('ERROR', error);
        }
    }

    handleLayoutLoad(event) {
        if (!event.detail.layout) {
            return;
        }

        const layout = event.detail.layout.sections[0];
        this.colSize = `slds-col slds-size_1-of-${layout.columns}`;
        this.layoutFields = [];
        layout.layoutRows.forEach(row => {
            row.layoutItems.forEach(item => {
                this.layoutFields.push({
                    fieldApiName: item.layoutComponents[0].apiName,
                    required: item.required,
                    readonly: !item.editableForNew
                });
            });
        });
        
        this.isLoading = false;
    }

    handleSaveAndNew() {
        this.isSaveAndNew = true;
    }

    handleSaveClick() {
        this.isSaveAndNew = false;
    }

    handleSubmit() {
        this.isLoading = true;
    }

    handleError() {
        this.isSaveAndNew = false;
        this.isLoading = false;
    }

    handleChange(event) {
        this.selectedRecordTypeId = event.detail.value;
        this.selectedRecordTypeName = this.recordTypeOptionsById[this.selectedRecordTypeId].label;
    }

    handleNext() {
        this.isLoading = true;
        this.showRecordTypeSelection = false;
        this.cardTitle = `New Case: ${this.selectedRecordTypeName}`;
    }

    async handleSuccess(e) {
        const recordId = e.detail.id;

        const event = new ShowToastEvent({
            title: 'Success',
            variant: 'success',
            message: 'Case {0} was created.',
            messageData: [
                {
                    url: `/${recordId}`,
                    label: recordId,
                },
            ],
        });
        this.dispatchEvent(event);

        const createdRecordPageReference = {
            type: "standard__recordPage",
            attributes: {
                recordId: recordId,
                objectApiName: this.objectApiName,
                actionName: "view"
            }
        };
        const newRecordActionPageReference = {
            type: 'standard__objectPage',
            attributes: {
                objectApiName: this.objectApiName,
                actionName: 'new'
            }
        };

        if (this.isConsoleNavigation) {
            const { tabId } = await getFocusedTabInfo();
            let newTabId = await openTab({
                pageReference: createdRecordPageReference
            });

            if (this.isSaveAndNew) {
                newTabId = await openTab({
                    pageReference: newRecordActionPageReference
                });
            }

            await focusTab(newTabId);
            await closeTab(tabId);
        } else {
            this[NavigationMixin.Navigate](
                this.isSaveAndNew ? newRecordActionPageReference : createdRecordPageReference
            )
        }
    }

    async handleCancel() {
        if (this.isConsoleNavigation) {
            const { tabId } = await getFocusedTabInfo();
            await closeTab(tabId);
        } else {
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: this.objectApiName,
                    actionName: 'list'
                },
                state: {
                    filterName: 'Recent'
                }
            });
        }
    }
}