import { LightningElement, api } from 'lwc';

const columns = [
    {
        label: 'Case Number',
        fieldName: 'url',
        type: 'url',
        typeAttributes: {label: { fieldName: 'CaseNumber' }, target: '_blank'},
        sortable:true
    },
    { label: 'Status', fieldName: 'Status',sortable: true },
    { label: 'Type', fieldName: 'Type',sortable: true},
    { label: 'Sales Agent', fieldName: 'POE_ICL_Rep_Name__c',sortable: true},
    { label: 'Issue', fieldName: 'POE_Issue__c',sortable: true},
    { label: 'Subject', fieldName: 'Subject', sortable: true},
    { label: 'Description', fieldName: 'Description', sortable: true},
    { label: 'Case Result', fieldName: 'POE_Case_Result__c ', sortable: true},
    {
        label: 'Last Modified Date',
        fieldName: 'LastModifiedDate',
        type: 'date',
        sortable: true,
        cellAttributes: { alignment: 'left' },
    }   
];

export default class PoeOwnerConsoleCaseModal extends LightningElement {
    searchValue;
    showAllCases = false;
    originaldata;
    isAllCases;
    columns = columns;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortBy;
    OrderNumber;
    caseTableData;
    data;
    casedata;
    @api get caseData() {
        return this.casedata;
    }
    set caseData(value) {
        this.setAttribute('caseData', value);
        console.log(value);
        let attr = value === undefined ? [{}] : JSON.parse(JSON.stringify(value));
        this.isAllCases = Array.isArray(attr);
        if (this.isAllCases) {
            this.data = attr;
            this.originaldata = attr;
        } else {
            this.OrderNumber = attr.OrderNumber;
            this.data =  attr.cases;
            this.originaldata = attr.cases;
        }
        let openCases = this.data.filter(cas => cas.Status !== 'Closed');
        this.data = [...openCases];
    }

    handleDataChange(value) {
        
    }

    filterByOpenCases(event){
        let isChecked = event.target.checked;
        this.showAllCases = isChecked ? false : true;
        if (!this.showAllCases) {
            let openCases = this.data.filter(cas => cas.Status !== 'Closed');
            this.data = [...openCases];
        } 
        else {
            this.data=[...this.originaldata];
        }
    }

    searchKeyword(event) {
        let searchKey = event.target.value;
        if (searchKey.trim().length > 3) {
            let filteredData = [];
            searchKey = searchKey.trim().toLowerCase();
            filteredData = this.originaldata.filter(
                data => data.Subject.toLowerCase().includes(searchKey) ||
                data.POE_ICL_Rep_Name__c.toLowerCase().includes(searchKey) ||
                data.Status.toLowerCase().includes(searchKey)
            );
            if (! this.showAllCases) {
                filteredData = filteredData.filter(cas => cas.Status !== 'Closed');
            }
            this.data = [...filteredData];
        }  else {
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
            detail: ''
          });
        this.dispatchEvent(closeModalEvent);
    }

    showCreateCaseModal(){
        const closeModalEvent = new CustomEvent("closeandcreatemodal", {
            detail: ''
          });
        this.dispatchEvent(closeModalEvent);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.data));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === 'asc' ? 1: -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
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

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.caseTableData];
        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.caseTableData = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    downloadCSVFile() {  
        let listToCSV = [];
        this.data.forEach(cas=> {
            let element;
            element = {
                OrderNumber : cas.CaseNumber,
                Status : cas.Status,
                Type: cas.Type,
                ICLRep : cas.POE_ICL_Rep_Name__c,
                Issue: cas.POE_Issue__c,
                Subject: cas.Subject,
                Description: cas.Description,
                CaseResult: cas.POE_Case_Result__c,
                LastModifiedDate: cas.LastModifiedDate
            }
            listToCSV.push(element);
        })
        var csv = this.convertListToCSV(listToCSV);
        if (csv == null){return;}
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_self';
        hiddenElement.download = 'OrderData.csv';
        document.body.appendChild(hiddenElement);
        hiddenElement.click();
    }

    convertListToCSV(list){
        var columnEnd = ',';
        var lineEnd =  '\n';
        var keys = new Set();
        list.forEach(function (record) {
            Object.keys(record).forEach(function (key) {
                keys.add(key);
            });
        });
        keys = Array.from(keys);
        var csvString = '';
        csvString += keys.join(columnEnd);
        csvString += lineEnd;
        for(var i=0; i < list.length; i++){
            var counter = 0;
            for(var sTempkey in keys) {
                var skey = keys[sTempkey] ;
                if(counter > 0){
                    csvString += columnEnd;
                }
                var value = list[i][skey] === undefined ? '' : list[i][skey];
                csvString += '"'+ value +'"';
                counter++;
            }
            csvString += lineEnd;
        }
        return csvString;
    }
}