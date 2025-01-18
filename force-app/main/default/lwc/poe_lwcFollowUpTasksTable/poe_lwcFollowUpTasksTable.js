import { LightningElement, api } from "lwc";

const columns = [
    {
        label: "Follow Up Date/Time",
        fieldName: "Follow_Up_Date_Time__c",
        type: "date",
        sortable: true,
        cellAttributes: { alignment: "left" }
    },
    {
        label: "Subject",
        fieldName: "url",
        type: "url",
        typeAttributes: { label: { fieldName: "Subject" }, target: "_blank" },
        sortable: false
    },
    {
        label: "Due Date",
        fieldName: "ActivityDate",
        type: "date",
        sortable: true,
        cellAttributes: { alignment: "left" }
    },
    {
        label: "Decision Maker Name",
        fieldName: "Decision_Maker_Name__c",
        sortable: false
    },
    {
        label: "Decision Maker Phone",
        fieldName: "Decision_Maker_Phone__c",
        sortable: false
    },
    { label: "Notes", fieldName: "Description", sortable: false }
];

export default class poe_lwcFollowUpTasksTable extends LightningElement {
    @api tasks;
    columns = columns;
    defaultSortDirection = "asc";
    sortDirection = "asc";
    sortBy;
    data;

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.tasks));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === "asc" ? 1 : -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : "";
            y = keyValue(y) ? keyValue(y) : "";
            return isReverse * ((x > y) - (y > x));
        });
        this.tasks = parseData;
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

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.tasks];
        cloneData.sort(this.sortBy(sortedBy, sortDirection === "asc" ? 1 : -1));
        this.caseTableData = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
}