import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getOpportunities from "@salesforce/apex/POE_ChuzoOpportunityListController.getOpportunities";
import userIsAgentOrOwner from "@salesforce/apex/POE_PermissionsUtility.userIsAgentOrOwner";
import logError from "@salesforce/apex/ErrorLogModel.logError";

const columns = [
    {
        label: "Opportunity Name",
        fieldName: "nameUrl",
        type: "url",
        typeAttributes: {
            label: { fieldName: "name" },
            target: "_self"
        },
        sortable: true
    },
    {
        label: "Account Name",
        fieldName: "accNameUrl",
        type: "url",
        typeAttributes: {
            label: { fieldName: "accName" },
            target: "_self"
        },
        sortable: true
    },
    { label: "Stage", fieldName: "stageName", sortable: true },
    { label: "Close Date", fieldName: "closeDate", type: "date", sortable: true },
    {
        label: "Owner Full Name",
        fieldName: "ownerNameUrl",
        type: "url",
        typeAttributes: {
            label: { fieldName: "ownerName" },
            target: "_self"
        },
        sortable: true
    }
];

export default class Poe_ChuzoOpportunityList extends LightningElement {
    data = [];
    columns = columns;
    showDataTable = false;
    defaultSortDirection = "asc";
    sortDirection = "asc";
    sortedBy;
    loaderSpinner = false;
    viewTypeOptions = [
        { label: "All Opportunities", value: "all" },
        { label: "My Opportunities", value: "user" },
        { label: "Office Opportunities", value: "office" }
    ];
    viewTypeLabel = this.viewTypeOptions[0].label;
    viewType = this.viewTypeOptions[0].value;
    isOwner = false;

    @wire(userIsAgentOrOwner)
    userIsAgentOrOwnerWire({ data, error }) {
        if (data) {
            this.isOwner = data.isOwner;
        } else if (error) {
            this.isOwner = false;
        }
    }

    connectedCallback() {
        this.getOpportunitiesForViewType();
    }

    getOpportunitiesForViewType() {
        this.loaderSpinner = true;
        const myData = {
            viewType: this.viewType
        };

        getOpportunities({ myData })
            .then((response) => {
                let opps = response.result.opportunities;
                const data = [];
                opps.forEach((opp) => {
                    let row = {
                        nameUrl: `/opportunity/${opp.Id}`,
                        name: opp.Name,
                        accName: opp.Account?.Name,
                        accNameUrl: opp.Account ? `/detail/${opp.Account?.Id}` : undefined,
                        stageName: opp.StageName,
                        closeDate: opp.CloseDate,
                        amount: opp.Amount,
                        ownerName: opp.Owner.Name,
                        ownerNameUrl: `/detail/${opp.Owner.Id}`
                    };

                    data.push(row);
                });

                this.data = data;
                this.showDataTable = true;
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                let msg = error.body?.message || error.message;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: msg
                });
                this.dispatchEvent(event);
                this.handleLogError(msg);
            });
    }

    // Used to sort the 'Age' column
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
        const cloneData = [...this.data];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === "asc" ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    handleViewTypeChange(event) {
        this.viewType = event.detail.value;
        const viewTypeOption = this.viewTypeOptions.find((vt) => vt.value === this.viewType);
        if (viewTypeOption) {
            this.viewTypeLabel = viewTypeOption.label;
        }

        this.getOpportunitiesForViewType();
    }

    handleLogError(error) {
        let errorLog = {
            type: "Internal Error",
            tab: "My Opportunities",
            component: "poe_ChuzoOppotunityList",
            error: error
        };
        logError({ error: errorLog })
            .then(() => {})
            .catch((err) => {
                console.error(`LOGGING ERROR: ${err.body?.message || err.stack}`);
            });
    }
}