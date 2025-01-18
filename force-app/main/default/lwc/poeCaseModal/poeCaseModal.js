import { LightningElement, api } from "lwc";
import getChuzoCases from "@salesforce/apex/CaseModel.getChuzoCases";

const columns = [
    {
        label: "Case Number",
        fieldName: "Case_URL__c",
        type: "url",
        typeAttributes: { label: { fieldName: "CaseNumber" }, target: "_blank" },
        sortable: true
    },
    { label: "Status", fieldName: "Status", sortable: true },
    { label: "Type", fieldName: "Type", sortable: true },
    { label: "Sales Agent", fieldName: "POE_ICL_Rep_Name__c", sortable: true },
    { label: "Subject", fieldName: "Subject", sortable: true },
    { label: "Description", fieldName: "Description", sortable: true },
    {
        label: "Last Modified Date",
        fieldName: "LastModifiedDate",
        type: "date",
        sortable: true,
        cellAttributes: { alignment: "left" }
    }
];

export default class PoeCaseModal extends LightningElement {
    @api caseType;
    rtId;
    searchValue;
    showAllCases = false;
    originaldata;
    isAllCases;
    columns = columns;
    defaultSortDirection = "asc";
    sortDirection = "asc";
    sortBy;
    OrderNumber;
    caseTableData;
    data = [];
    caseData;
    agentId;

    showLoaderSpinner = false;

    connectedCallback() {
        this.showLoaderSpinner = true;
        getChuzoCases()
            .then((response) => {
                console.log('get chuzo cases response: ', response);
                if (Array.isArray(response.result.Cases)) {
                    this.data = response.result.Cases;
                } else {
                    let data = [];
                    data.push(response.result.Cases);
                    this.data = data;
                }
                this.rtId = response.result.recordTypeId;
                this.agentId = response.result.agentId;
                if (this.data) {
                    this.data.map(
                        (element) =>
                            (element.Case_URL__c = element.Case_URL__c.substring(
                                element.Case_URL__c.indexOf("https"),
                                element.Case_URL__c.lastIndexOf('" target=')
                            ))
                    );
                    this.originaldata = this.data;
                    let openCases = this.data.filter((cas) => cas.Status !== "Closed");
                    this.data = [...openCases];
                }
                this.showLoaderSpinner = false;
            })
            .catch((error) => {
                console.log(error);
                this.showLoaderSpinner = false;
            });
    }

    filterByOpenCases(event) {
        let isChecked = event.target.checked;
        this.showAllCases = isChecked ? false : true;
        if (!this.showAllCases) {
            let openCases = this.data.filter((cas) => cas.Status !== "Closed");
            this.data = [...openCases];
        } else {
            this.data = [...this.originaldata];
        }
    }

    searchKeyword(event) {
        let searchKey = event.target.value;
        if (searchKey.trim().length >= 3) {
            let filteredData = [];
            searchKey = searchKey.trim().toLowerCase();
            filteredData = this.originaldata.filter(
                (data) =>
                    data.Subject.toLowerCase().includes(searchKey) ||
                    data.POE_ICL_Rep_Name__c.toLowerCase().includes(searchKey) ||
                    data.Status.toLowerCase().includes(searchKey)
            );
            if (!this.showAllCases) {
                filteredData = filteredData.filter((cas) => cas.Status !== "Closed");
            }
            this.data = [...filteredData];
        } else {
            this.data = [...this.originaldata];
        }
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    hideModal() {
        const closeModalEvent = new CustomEvent("closemodal", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    showCreateCaseModal() {
        const closeModalEvent = new CustomEvent("closeandcreatemodal", {
            detail: {
                rtId: this.rtId,
                agentId: this.agentId
            }
        });
        this.dispatchEvent(closeModalEvent);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.data));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === "asc" ? 1 : -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : "";
            y = keyValue(y) ? keyValue(y) : "";
            return isReverse * ((x > y) - (y > x));
        });
        this.data = parseData;
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
}