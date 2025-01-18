import { LightningElement, api } from 'lwc';

export default class PoeOwnerConsoleFilterModal extends LightningElement {
    isAgent;
    searchValue;
    isProduct;
    originaldata;
    filterdata;
    @api get filterData() {
        return this.filterdata;
    }
    set filterData(value) {
        this.setAttribute('filterData', value);
        this.filterdata = value;
        this.originaldata = value;
        console.log(JSON.parse(JSON.stringify(value)));
    }
    typedata;
    @api get typeData() {
        return this.typedata;
    }
    set typeData(value) {
        this.setAttribute('typeData', value);
        let type  = JSON.parse(JSON.stringify(value))
        this.handleTypeChange(type);
    }

    connectedCallback() {
        
    }

    handleTypeChange(type) {
        if (type === 'agent') {
            this.isAgent = true;
            this.isProduct = false;
        } 
        else if (type === 'product') {
            this.isProduct = true;
            this.isAgent = false;
        }
    }

    searchKeyword(event) {
        let searchKey = event.target.value;
        if (searchKey.trim().length > 3) {
            searchKey = searchKey.trim().toLowerCase();
            let filteredData = this.originaldata.filter(rep => rep.label.toLowerCase().includes(searchKey));
            this.filterdata = [...filteredData];
        } else {
            this.filterdata = [...this.originaldata];
        }
    }

    selectOption(event) {
        if(this.isAgent) {
            let agentSelected = this.filterdata.filter(rep => rep.value === event.target.id.substring(0,18));
            const agentSelectionEvent = new CustomEvent("agentselected", {
                detail: agentSelected
              });
            this.dispatchEvent(agentSelectionEvent);
        }
        else if (this.isProduct) {
            let productSelected = this.filterdata.filter(rep => rep.value === event.target.name);
            const productSelectionEvent = new CustomEvent("productselected", {
                detail: productSelected
              });
            this.dispatchEvent(productSelectionEvent);
        }
    }

    hideModal() {
        let evdetail = this.isAgent ? 'agent' : 'product';
        const closeModalEvent = new CustomEvent("closemodal", {
            detail: evdetail
          });
        this.dispatchEvent(closeModalEvent);
    }
}