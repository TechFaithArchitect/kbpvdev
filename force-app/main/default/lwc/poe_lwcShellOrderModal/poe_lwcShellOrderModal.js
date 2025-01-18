import { LightningElement, api, wire } from "lwc";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import getInitialData from "@salesforce/apex/POEShellOrderController.getInitialData";
import saveNewData from "@salesforce/apex/POEShellOrderController.saveData";
import { updateRecord } from "lightning/uiRecordApi";
import PHONE_FIELD from "@salesforce/schema/Account.Phone";
import ACC_ID_FIELD from "@salesforce/schema/Account.Id";
import ORDER_ID_FIELD from "@salesforce/schema/Order.Id";
import REASON_FIELD from "@salesforce/schema/Order.POE_ShellReason__c";
import STATUS_FIELD from "@salesforce/schema/Order.Status";
import INSTALL_FIELD from "@salesforce/schema/Order.POE_InstallationDate__c";
import BAN_FIELD from "@salesforce/schema/Order.POE_BAN__c";
import REC_TYPE_FIELD from "@salesforce/schema/Order.RecordTypeId";
import TYPE_FIELD from "@salesforce/schema/Order.Type";
import SEC_PHONE_FIELD from "@salesforce/schema/Account.POE_Secondary_Phone__c";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ORDER_OBJECT from "@salesforce/schema/Order";

export default class Poe_lwcShellOrderModal extends LightningElement {
    @api recordId;
    @api selected;
    loaderSpinner;
    programs = [];
    program;
    reasons = [];
    orderId;
    orderNumber;
    accountId;
    reason;
    today;
    firstName;
    middleName;
    lastName;
    phone;
    secondPhone;
    hasOrder = false;
    productSelected;
    programSelected;
    ban;
    ccBan;
    sameBAN = false;
    instDate;
    noCompleteInformation = true;
    recordTypeId;

    @wire(getObjectInfo, { objectApiName: ORDER_OBJECT })
    getObjectData({ data, error }) {
        if (data) {
            let recordTypes = data.recordTypeInfos;
            recordTypes = Object.values(data.recordTypeInfos);
            console.log(recordTypes);
            recordTypes.forEach((rec) => {
                if (rec.name === "Shell Order") {
                    this.recordTypeId = rec.recordTypeId;
                    console.log(this.recordTypeId);
                }
            });
        } else if (error) {
            console.log(error);
        }
    }

    hideModal() {
        const closeModalEvent = new CustomEvent("closemodal", {
            detail: "cancel"
        });
        this.dispatchEvent(closeModalEvent);
    }

    connectedCallback() {
        this.loaderSpinner = true;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var dd = String(today.getDate()).padStart(2, "0");
        var mm = String(today.getMonth() + 1).padStart(2, "0");
        var yyyy = today.getFullYear();
        this.today = yyyy + "/" + mm + "/" + dd;
        getInitialData({
            recordId: this.recordId
        })
            .then((result) => {
                console.log(result);
                let prog = result.programValues;
                let arr = [];
                let arrReas = [];
                prog.forEach((item) => {
                    let campaign = {
                        label: item,
                        value: item
                    };
                    arr.push(campaign);
                });
                let reas = result.reasonValues;
                reas.forEach((reason) => {
                    let r = {
                        label: reason,
                        value: reason
                    };
                    arrReas.push(r);
                });
                this.programs = [...arr];
                this.reasons = [...arrReas];
                this.program = this.programs[0].value;
                this.orderId = result.order.hasOwnProperty("Id") ? result.order.Id : undefined;
                this.hasOrder = this.orderId !== undefined ? true : false;
                if (this.hasOrder) {
                    this.accountId = result.order.AccountId;
                    this.orderNumber = result.order.OrderNumber;
                    this.firstName = result.contact.hasOwnProperty("FirstName") ? result.contact.FirstName : undefined;
                    this.lastName = result.contact.hasOwnProperty("LastName") ? result.contact.LastName : undefined;
                    this.phone = result.order.Account.hasOwnProperty("Phone") ? result.order.Account.Phone : undefined;
                    this.secondPhone = result.order.Account.hasOwnProperty("POE_Secondary_Phone__c ")
                        ? result.order.Account.POE_Secondary_Phone__c
                        : undefined;
                    this.productSelected = result.product.hasOwnProperty("Product2")
                        ? result.product.Product2.Name
                        : undefined;
                    this.programSelected = result.product.hasOwnProperty("Product2")
                        ? result.product.Product2.Family
                        : undefined;
                }
                this.loaderSpinner = false;
                this.disableValidations();
            })
            .catch((error) => {
                this.loaderSpinner = false;
                this.error = error;
                console.log(error);
            });
    }

    handleChangeProgram(event) {
        this.program = event.detail.value;
    }

    handleContact(event) {
        let phonere = /^\d{10}$/;
        switch (event.target.name) {
            case "firstName":
                this.firstName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "middleName":
                this.middleName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "lastName":
                this.lastName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "phone":
                this.phone = phonere.test(event.target.value) ? event.target.value : undefined;
                break;
            case "secondPhone":
                this.secondPhone = phonere.test(event.target.value) ? event.target.value : undefined;
                break;
        }
        this.disableValidations();
    }

    handleAccount(event) {
        let banre = /^[0-9]+$/;
        var today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        switch (event.target.name) {
            case "ban":
                this.ban = event.target.value !== "" && banre.test(event.target.value) ? event.target.value : undefined;
                this.sameBAN = event.target.value !== this.ccBan ? true : false;
                break;
            case "ccBan":
                this.ccBan =
                    event.target.value !== "" && banre.test(event.target.value) ? event.target.value : undefined;
                this.sameBAN = event.target.value !== this.ban ? true : false;
                break;
            case "instDate":
                let dt = new Date(event.target.value).getTime();
                this.instDate = event.target.value !== "" && dt >= today.getTime() ? event.target.value : undefined;
                break;
        }
        this.disableValidations();
    }

    handleReason(event) {
        this.reason = event.target.value;
        this.disableValidations();
    }

    disableValidations() {
        if (
            this.reason !== undefined &&
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            this.phone !== undefined &&
            this.ban !== undefined &&
            this.ccBan !== undefined &&
            this.instDate !== undefined &&
            !this.sameBAN
        ) {
            this.noCompleteInformation = false;
        } else {
            this.noCompleteInformation = true;
        }
    }

    saveShellOrder() {
        this.loaderSpinner = true;
        if (!this.hasOrder) {
            this.handleCreate();
        } else {
            this.handleUpdate();
        }
    }

    handleCreate() {
        saveNewData({
            firstName: this.firstName,
            lastName: this.lastName,
            oppId: this.recordId,
            middleName: this.middleName !== undefined ? this.middleName : null,
            phone: this.phone,
            secondaryPhone: this.secondPhone,
            ban: this.ban,
            installationDate: this.instDate,
            reason: this.reason,
            recType: this.recordTypeId
        })
            .then((result) => {
                const event = new ShowToastEvent({
                    title: "Order Created",
                    message: "The Shell Order #" + result.OrderNumber + " was created.",
                    variant: "success",
                    mode: "dismissable"
                });
                this.dispatchEvent(event);
                const closeModalEvent = new CustomEvent("closemodal", {
                    detail: this.selected
                });
                this.dispatchEvent(closeModalEvent);
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                this.error = error;
                console.log(error);
            });
    }

    handleUpdate() {
        const fields = {};
        fields[ACC_ID_FIELD.fieldApiName] = this.accountId;
        fields[PHONE_FIELD.fieldApiName] = this.phone;
        if (this.secPhone !== undefined) {
            fields[SEC_PHONE_FIELD.fieldApiName] = this.secondPhone;
        }
        let recordInput = { fields };
        updateRecord(recordInput)
            .then(() => {
                const field = {};
                field[ORDER_ID_FIELD.fieldApiName] = this.orderId;
                field[STATUS_FIELD.fieldApiName] = "Pending Installation";
                field[REASON_FIELD.fieldApiName] = this.reason;
                field[INSTALL_FIELD.fieldApiName] = this.instDate;
                field[BAN_FIELD.fieldApiName] = this.ban;
                field[TYPE_FIELD.fieldApiName] = "Call Center";
                field[REC_TYPE_FIELD.fieldApiName] = this.recordTypeId;
                recordInput = { fields: field };
                updateRecord(recordInput)
                    .then(() => {
                        this.loaderSpinner = false;
                        const event = new ShowToastEvent({
                            title: "Order Updated",
                            message: "The Order #" + this.orderNumber + " was updated with the Shell Order conditions.",
                            variant: "success",
                            mode: "dismissable"
                        });
                        this.dispatchEvent(event);
                        const closeModalEvent = new CustomEvent("closemodal", {
                            detail: this.selected
                        });
                        this.dispatchEvent(closeModalEvent);
                    })
                    .catch((error) => {
                        this.loaderSpinner = false;
                        console.log(error);
                    });
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
            });
    }
}