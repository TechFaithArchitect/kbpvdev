import { LightningElement, wire, api, track } from "lwc";
import { refreshApex } from "@salesforce/apex";
import userIsAgentOrOwner from "@salesforce/apex/POE_PermissionsUtility.userIsAgentOrOwner";
import strUserId from "@salesforce/user/Id";
import PROFILE_NAME_FIELD from "@salesforce/schema/User.Profile.Name";
import { getRecord } from "lightning/uiRecordApi";
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from "lightning/flowSupport";
import getLeads from "@salesforce/apex/POE_LeadsDataTableController.getLeads";

const columns = [
    {
        label: "Name",
        fieldName: "Name",
        type: "text",
        sortable: true
    },
    {
        label: "Email",
        fieldName: "Email",
        type: "email",
        sortable: true
    },
    {
        label: "Phone",
        fieldName: "Phone",
        type: "phone",
        sortable: true
    },
    {
        label: "Status",
        fieldName: "Status",
        sortable: true
    },
    {
        label: "Lead Source",
        fieldName: "LeadSource",
        sortable: true
    },
    {
        label: "Dealer",
        fieldName: "Company",
        sortable: true
    },
    {
        label: "Lead Owner",
        fieldName: "Lead_Owner__c",
        sortable: true
    }
];

export default class Poe_lwcLeadsDataTable extends LightningElement {
    @api selectedIds = [];
    @api sortedDirection = "asc";
    @api sortedBy = "Name";
    @api searchKey = "";
    @api action = "convert";
    @track allSelectedRows = [];
    @track radioValue = "convert";
    isPVManager = true;
    page = 1;
    items = [];
    data = [];
    columns;
    startingRecord = 1;
    endingRecord = 0;
    pageSize = 200;
    totalRecountCount = 0;
    totalPage = 1;
    isPageChanged = false;
    initialLoad = true;
    mapLeadByName = new Map();
    disableNext = true;
    showNextPageButton = false;
    showPreviousPageButton = false;
    showModal;
    value;
    error;
    result;
    buttonLabel = "Next";

    get radioOptions() {
        return [
            { label: "Convert Leads to Opportunities", value: "convert" },
            { label: "Change Owner", value: "changeOwner" },
            { label: "Close Leads", value: "closeLeads" }
        ];
    }

    @wire(getLeads, { searchKey: "$searchKey", sortBy: "$sortedBy", sortDirection: "$sortedDirection" })
    wiredAccounts({ error, data }) {
        if (data) {
            this.processRecords(data);
            this.error = undefined;
            this.page = 1;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }

    @wire(userIsAgentOrOwner)
    wireUserIsAgentOrOwner({ error, data }) {
        if (error) {
            this.error = error;
        } else if (data) {
            this.isPVManager = !data.isOwner && !data.isAgent;
            if (!this.isPVManager) {
                this.action = "convert";
                this.buttonLabel = "Convert Leads";
            }
        }
    }

    handleRadioChange(e) {
        this.action = e.target.value;
        this.radioValue = e.target.value;
    }

    handleFlowNext() {
        let ids = JSON.parse(JSON.stringify(this.selectedIds));
        if (ids.length > 200) {
            this.handleModal();
        } else {
            const attributeChangeEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(attributeChangeEvent);
        }
    }

    handleModal() {
        this.showModal = !this.showModal;
    }

    processRecords(data) {
        refreshApex(data);
        this.items = data;
        this.totalRecountCount = data.length;
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
        if (this.totalPage <= 0) {
            this.totalPage = 1;
        }
        this.data = this.items.slice(0, this.pageSize);
        this.endingRecord = this.pageSize;
        this.columns = columns;
        if (this.totalPage > 1 && this.page != this.totalPage) {
            this.showNextPageButton = true;
        }
        if (this.page > 1) this.showPreviousPageButton = true;
        if (this.selectedIds.length === 0) this.disableNext = true;
    }

    previousHandler() {
        this.isPageChanged = true;
        if (this.page > 1) {
            this.page = this.page - 1;
            this.displayRecordPerPage(this.page);
            this.showPreviousPageButton = true;
        }
        if (this.page == 1) this.showPreviousPageButton = false;
        if (this.totalPage > 1 && this.page != this.totalPage) {
            this.showNextPageButton = true;
        }
        this.isPageChanged = false;
        this.selectedIds = [];
    }

    nextHandler() {
        this.isPageChanged = true;
        if (this.page < this.totalPage && this.page !== this.totalPage) {
            this.page = this.page + 1;
            this.displayRecordPerPage(this.page);
        }
        if (this.page > 1) this.showPreviousPageButton = true;
        if (this.page == this.totalPage) this.showNextPageButton = false;
        this.isPageChanged = false;
        this.selectedIds = [];
    }

    displayRecordPerPage(page) {
        this.startingRecord = (page - 1) * this.pageSize;
        this.endingRecord = this.pageSize * page;

        this.endingRecord = this.endingRecord > this.totalRecountCount ? this.totalRecountCount : this.endingRecord;

        this.data = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }

    sortColumns(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        refreshApex(this.data);
    }

    onRowSelection(event) {
        if (!this.isPageChanged || this.initialLoad) {
            if (this.initialLoad) this.initialLoad = false;
            this.processSelectedRows(event.detail.selectedRows);
        } else {
            this.isPageChanged = false;
            this.initialLoad = true;
        }
    }
    processSelectedRows(selectedLeads) {
        let newMap = new Map();
        let auxArr = [];
        this.selectedIds = [];
        selectedLeads.forEach((lead) => {
            if (!this.allSelectedRows.includes(lead)) {
                auxArr.push(lead);
            }
            this.mapLeadByName.set(lead.Name, lead);
            newMap.set(lead.Name, lead);
        });

        for (let [key, value] of this.mapLeadByName.entries()) {
            if (newMap.size <= 0 || (!newMap.has(key) && this.initialLoad)) {
                const index = this.allSelectedRows.indexOf(value);
                if (index > -1) {
                    this.allSelectedRows.splice(index, 1);
                }
            }
        }

        if (auxArr.length > 0) {
            this.disableNext = false;
        } else {
            this.disableNext = true;
        }
        auxArr.forEach((currentItem) => {
            this.selectedIds.push(currentItem.Id);
        });

        const attributeChangeEvent = new FlowAttributeChangeEvent("selectedIds", this.selectedIds);
        this.dispatchEvent(attributeChangeEvent);
    }

    handleKeyChange(event) {
        this.searchKey = event.target.value;
        let data = [];

        this.items.forEach((item) => {
            if (item != undefined && item.Name.includes(this.searchKey)) {
                data.push(item);
            }
        });
        this.processRecords(data);
    }
}