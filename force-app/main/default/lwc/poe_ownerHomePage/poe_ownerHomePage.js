import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";

export default class Poe_ownerHomePage extends NavigationMixin(LightningElement) {
    showModal = false;
    showCreateModal = false;
    caseType;
    caseTypeRT;

    handleClick(event) {
        this.caseType = event.target.name;
        this.showModal = true;
    }

    handleCloseModal() {
        this.showModal = false;
    }

    handleCreateCase(event) {
        this.handleCloseModal();
        this[NavigationMixin.Navigate]({
            type: "comm__namedPage",
            attributes: {
                name: "create_case__c"
            },
            state: {
                c__target: "c:homepageCreateCaseEnglish",
                c__recordTypeName: this.caseTypeRT,
                c__RT: event.detail.rtId,
                c__contactId: event.detail.agentId
            }
        });
    }
}