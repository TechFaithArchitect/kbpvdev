import { LightningElement, api } from "lwc";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
import { OmniscriptBaseMixin } from "vlocity_cmt/omniscriptBaseMixin";

export default class Poe_lwcRepresentativeSearchResultTable extends OmniscriptBaseMixin(LightningElement) {
    @api omniJsonData;
    contactData = [];
    connectedCallback() {
        this._actionUtil = new OmniscriptActionCommonUtil();
        let data = JSON.parse(JSON.stringify(this.omniJsonData));
        let myData = {
            AccountId: data.searchContactsAndUsers.searchContactsAndUsersBlock.AccountId,
            FirstName: data.searchContactsAndUsers.searchContactsAndUsersBlock.FirstName,
            LastName: data.searchContactsAndUsers.searchContactsAndUsersBlock.LastName,
            Birthdate: data.searchContactsAndUsers.searchContactsAndUsersBlock.Birthdate,
            vlocity_cmt__SSN__c: data.searchContactsAndUsers.searchContactsAndUsersBlock.vlocity_cmt__SSN__c
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "onboarding_newOnboarding",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                if (response?.result?.IPResult?.Contact?.length) {
                    const names = [];
                    const uniqueContacts = [];
                    response.result.IPResult.Contact.forEach((element) => {
                        if (!names.includes(element.FirstName + element.LastName)) {
                            names.push(element.FirstName + element.LastName);
                            uniqueContacts.push(element);
                        }
                    });
                    this.contactData = [...uniqueContacts];
                } else if (response?.result?.IPResult.Contact.Id) {
                    this.contactData = [response.result.IPResult.Contact];
                } else {
                    this.contactData = [];
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
            });
    }
    handleRadioChange(event) {
        let result = {};
        this.contactData.forEach((cont) => {
            if (cont.Id === event.target.value) {
                result = cont;
            }
        });

        let selectedContact = {
            Contact: {
                Id: result.Id,
                AccountId: result.AccountId,
                Birthdate: result.hasOwnProperty("Birthdate") ? result.Birthdate : "",
                Email: result.hasOwnProperty("Email") ? result.Email : "",
                POE_Functional_Role__c: result.hasOwnProperty("POE_Functional_Role__c")
                    ? result.POE_Functional_Role__c
                    : "",
                FirstName: result.hasOwnProperty("FirstName") ? result.FirstName : "",
                MiddleName: result.hasOwnProperty("MiddleName") ? result.MiddleName : "",
                LastName: result.LastName,
                MobilePhone: result.hasOwnProperty("MobilePhone") ? result.MobilePhone : "",
                MailingState: result.hasOwnProperty("MailingState") ? result.MailingState : "",
                MailingCountry: result.hasOwnProperty("MailingCountry") ? result.MailingCountry : "United States",
                MailingPostalCode: result.hasOwnProperty("MailingPostalCode") ? result.MailingPostalCode : "",
                POE_Programs_Available__c: result.hasOwnProperty("POE_Programs_Available__c")
                    ? result.POE_Programs_Available__c
                    : "",
                POE_Event_Programs__c: result.hasOwnProperty("POE_Event_Programs__c")
                    ? result.POE_Event_Programs__c
                    : "",
                POE_Retail_Programs__c: result.hasOwnProperty("POE_Retail_Programs__c")
                    ? result.POE_Retail_Programs__c
                    : "",
                D2D_Programs__c: result.hasOwnProperty("D2D_Programs__c")
                    ? result.D2D_Programs__c
                    : "",
                MailingStreet: result.hasOwnProperty("MailingStreet") ? result.MailingStreet : "",
                POE_Start_Date__c: result.hasOwnProperty("POE_Start_Date__c") ? result.POE_Start_Date__c : "",
                vlocity_cmt__SSN__c: result.hasOwnProperty("vlocity_cmt__SSN__c") ? result.vlocity_cmt__SSN__c : "",
                rowSelected: true,
                POE_Representative_Type__c: result.hasOwnProperty("POE_Representative_Type__c")
                    ? result.POE_Representative_Type__c
                    : "",
                POE_Call_Center_Type__c: result.hasOwnProperty("POE_Call_Center_Type__c")
                    ? result.POE_Call_Center_Type__c
                    : ""
            }
        };
        JSON.parse(JSON.stringify(selectedContact));
        this.omniUpdateDataJson(selectedContact);
    }
}