import { LightningElement, api } from "lwc";

export default class Lwc_ChuzoPersonAccountTabList extends LightningElement {
    @api accData;
    @api columns;
    defaultSortDirection = "desc";
    sortDirection = "asc";
    sortedBy;

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

    handleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.accData];
        cloneData.sort(this.sortBy(sortedBy, sortDirection === "asc" ? 1 : -1));
        const sendValueEvent = new CustomEvent("sort", {
            detail: [...cloneData]
        });
        this.dispatchEvent(sendValueEvent);
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
}