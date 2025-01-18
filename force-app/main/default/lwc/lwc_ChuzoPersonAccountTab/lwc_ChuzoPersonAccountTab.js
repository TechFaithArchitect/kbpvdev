import { LightningElement } from "lwc";
import TITLE_LABEL from "@salesforce/label/c.Contact_List_Title";
import SEARCH_PLACEHOLDER from "@salesforce/label/c.Contact_Search_Placeholder";
import INSERT_CONTACTS_LABEL from "@salesforce/label/c.Lwc_Uploader_Insert_Button_Label";
import BACK_BUTTON_LABEL from "@salesforce/label/c.Generic_Back_Button_Label";
import NEW_BUTTON_LABEL from "@salesforce/label/c.Generic_New_Button_Label";
import getAccountInformation from "@salesforce/apex/POE_ChuzoOpportunityListController.getAccountInformation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import lwc_ChuzoPersonAccountNewModal from "c/lwc_ChuzoPersonAccountNewModal";

const columns = [
    { label: "Created Date", fieldName: "createdDate", type: "date", sortable: true },
    {
        label: "Name",
        fieldName: "nameUrl",
        type: "url",
        typeAttributes: {
            label: { fieldName: "name" },
            target: "_self"
        },
        sortable: true
    },
    { label: "Email", fieldName: "email", sortable: false },
    { label: "Phone", fieldName: "phone", sortable: false },
    { label: "Zip Code", fieldName: "zipCode", sortable: false },
    { label: "Completed Sale", fieldName: "completedSale", type: "boolean", sortable: false }
];

export default class Lwc_ChuzoPersonAccountTab extends LightningElement {
    labels = {
        title: TITLE_LABEL,
        placeholder: SEARCH_PLACEHOLDER,
        csvTool: INSERT_CONTACTS_LABEL,
        backButton: BACK_BUTTON_LABEL,
        newButton: NEW_BUTTON_LABEL
    };
    data = [];
    columns = columns;
    allData = [];
    showCompletedSales = false;
    filter = "none";
    loaderSpinner = false;
    showInsertTool = false;

    get onContactTab() {
        return !this.showInsertTool;
    }

    connectedCallback() {
        this.getAccountData();
    }

    getAccountData() {
        this.loaderSpinner = true;
        const myData = {
            filter: this.filter
        };
        getAccountInformation({ myData })
            .then((response) => {
                let accs = response.result.accounts;
                let data = [];
                accs.forEach((acc) => {
                    let row = {
                        id: acc.Id,
                        createdDate: acc.CreatedDate,
                        nameUrl: `/account/${acc.Id}`,
                        name: acc.Name,
                        email: acc.PersonEmail,
                        phone: acc.Phone,
                        zipCode: acc.ShippingPostalCode,
                        completedSale: response.result.completed.some((item) => item === acc.Id)
                    };
                    data.push(row);
                });
                this.allData = data;
                if (this.showCompletedSales) {
                    data = data.filter((item) => item.completedSale);
                }
                this.data = data;
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
            });
    }

    handleSort(event) {
        this.data = [...event.detail];
    }

    handleToggleChange(event) {
        let contactData = [...this.allData];
        this.showCompletedSales = event.detail;
        if (event.detail) {
            this.data = [...contactData.filter((item) => item.completedSale)];
        } else {
            this.data = [...this.allData];
        }
    }

    handleFilter(event) {
        this.filter = event.detail.hasOwnProperty("value")
            ? event.detail.value
            : event.detail !== null && event.detail !== undefined && event.detail !== ""
            ? event.detail
            : "none";
        this.getAccountData();
    }

    handleNewPersonAccount() {
        lwc_ChuzoPersonAccountNewModal.open({ label: "New Person Account" }).then((result) => {
            if (result === "success") {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success!",
                        message: "Person Account created successfully",
                        variant: "success",
                        mode: "sticky"
                    })
                );
                this.getAccountData();
            } else if (result === "error") {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error",
                        message: "Something went wrong while trying to create the Person Account.",
                        variant: "error",
                        mode: "sticky"
                    })
                );
            }
        });
    }

    handleShowInsertTool() {
        this.showInsertTool = true;
    }

    handleCSVToolBack() {
        this.showInsertTool = false;
        this.getAccountData();
    }
}