import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getChuzoAgents from "@salesforce/apex/RepOnBoardingController.getChuzoAgents";
import getOnboardingRepresentatives from "@salesforce/apex/RepOnBoardingController.getOnboardingRepresentatives";

export default class Poe_lwcRepOnboardingRepresentatives extends LightningElement {
    @api recordId;
    activeTab = "Onboarding";
    tpvControl = false;
    @api contactData;
    loaderSpinner;
    displayOnboarding = false;
    displayActive = false;
    displayInactive = false;

    connectedCallback() {
        this.loaderSpinner = true;
        this.displayOnboarding = true;
        this.contactData = [];
        let myData = {
            representativeList: this.activeTab
        };
        getOnboardingRepresentatives({ myData: myData })
            .then((response) => {
                console.log("Get Representatives Response", response);
                let data = response.result;
                if (data.hasOwnProperty("Account")) {
                    this.tpvControl = data.Account.POE_Require_TPV__c;
                }
                if (
                    data.hasOwnProperty("Representatives") &&
                    data.Representatives != null &&
                    data.Representatives.length > 0
                ) {
                    let auxList = [];

                    data.Representatives.forEach((item) => {
                        if (item.hasOwnProperty("Contact")) {
                            auxList.push({
                                ...item.Contact,
                                IsActive: item.IsActive,
                                IsInactive: !item.IsActive,
                                UserId: item.hasOwnProperty("Id") ? item.Id : ""
                            });
                        } else {
                            auxList.push(item);
                        }
                    });

                    this.contactData = [...auxList];
                    this.contactData = this.replacePrograms(this.contactData);
                } else {
                    this.contactData = [];
                }

                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                let errorMsg = error.body?.message || error.message;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: errorMsg
                });
                this.dispatchEvent(event);

                this.logError(errorMsg);
            });
    }

    handleUpdate() {
        const updateTab = new CustomEvent("update", {});
        this.dispatchEvent(updateTab);
    }

    replacePrograms(array) {
        return array.map((obj) => {
            if (obj.hasOwnProperty("POE_Programs_Available__c")) {
                obj.POE_Programs_Available__c = obj.POE_Programs_Available__c.replace("Charter/Spectrum", "Spectrum")
                    .replace("DirecTV", "DIRECTV")
                    .replace("Altice", "Optimum");
            }
            return obj;
        });
    }

    @api
    setRepresentativeList(event) {
        this.loaderSpinner = true;
        if (event.detail === "Onboarding" || event.detail === "Active" || event.detail === "Inactive") {
            this.activeTab = event.detail;
        } else this.activeTab = event.target.value;

        const selectedTab = new CustomEvent("changetab", {
            detail: this.activeTab
        });
        this.dispatchEvent(selectedTab);

        let myData = {
            representativeList: this.activeTab
        };
        getOnboardingRepresentatives({ myData: myData })
            .then((response) => {
                console.log("Get Representatives Response", response);
                let data = response.result;
                if (this.activeTab == "Onboarding") {
                    this.displayOnboarding = true;
                    this.displayActive = false;
                    this.displayInactive = false;
                } else if (this.activeTab == "Active") {
                    this.displayOnboarding = false;
                    this.displayActive = true;
                    this.displayInactive = false;
                } else if (this.activeTab == "Inactive") {
                    this.displayOnboarding = false;
                    this.displayActive = false;
                    this.displayInactive = true;
                }
                if (
                    data.hasOwnProperty("Representatives") &&
                    data.Representatives != null &&
                    data.Representatives.length > 0
                ) {
                    let auxList = [];

                    data.Representatives.forEach((item) => {
                        if (item.hasOwnProperty("Contact")) {
                            auxList.push({
                                ...item.Contact,
                                IsActive: item.IsActive,
                                IsInactive: !item.IsActive,
                                UserId: item.hasOwnProperty("Id") ? item.Id : ""
                            });
                        } else {
                            auxList.push(item);
                        }
                    });

                    this.contactData = [...auxList];
                    this.contactData = this.replacePrograms(this.contactData);
                } else {
                    this.contactData = [];
                }
                if (this.contactData.length > 0 && this.activeTab === "Active") {
                    this.handleFilterChuzoAgents();
                } else {
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                let errorMsg = error.body?.message || error.message;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: errorMsg
                });
                this.dispatchEvent(event);

                this.logError(errorMsg);
            });
    }

    handleFilterChuzoAgents() {
        getChuzoAgents({})
            .then((response) => {
                console.log("Filter Data Response", response);
                let contactData = [...this.contactData.filter((item) => response.result.memberList.includes(item.Id))];
                this.contactData = [...contactData];
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                let errorMsg = error.body?.message || error.message;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: errorMsg
                });
                this.dispatchEvent(event);

                this.logError(errorMsg);
            });
    }

    logError(errorMessage) {
        const error = {
            type: "Internal Error",
            tab: "Agent Onboarding",
            component: "poe_lwcRepOnboardingRepresentatives",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }

    handleLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "Agent Onboarding"
        };
        this.dispatchEvent(event);
    }
}