import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import saveFile from "@salesforce/apex/lwcCSVUploaderController.saveFile";

import UPLOAD_SAMPLE_CSV from "@salesforce/resourceUrl/PersonAccountUploadSample";
import UPLOAD_GUIDE_PDF from "@salesforce/resourceUrl/PersonAccountUploadToolGuide";

import Address_Line_2_Field_Label from "@salesforce/label/c.Address_Line_2_Field_Label";
import City_Field_Label from "@salesforce/label/c.City_Field_Label";
import Contract_Expiration_Date_Field_Label from "@salesforce/label/c.Contract_Expiration_Date_Field_Label";
import Current_Provider_s_Cost_Field_Label from "@salesforce/label/c.Current_Provider_s_Cost_Field_Label";
import Current_Provider_s_Field_Label from "@salesforce/label/c.Current_Provider_s_Field_Label";
import Email_Field_Label from "@salesforce/label/c.Email_Field_Label";
import Email_Two_Field_Label from "@salesforce/label/c.Email_Two_Field_Label";
import First_Date_Contacted_Field_Label from "@salesforce/label/c.First_Date_Contacted_Field_Label";
import First_Name_Field_Label from "@salesforce/label/c.First_Name_Field_Label";
import Generic_Warning_Title from "@salesforce/label/c.Generic_Warning_Title";
import Last_Name_Field_Label from "@salesforce/label/c.Last_Name_Field_Label";
import Lead_Origin_Field_Label from "@salesforce/label/c.Lead_Origin_Field_Label";
import Lwc_Uploader_Download_Sample_CSV_File_Button_Label from "@salesforce/label/c.Lwc_Uploader_Download_Sample_CSV_File_Button_Label";
import Lwc_Uploader_Download_User_Guide_Button_Label from "@salesforce/label/c.Lwc_Uploader_Download_User_Guide_Button_Label";
import Lwc_Uploader_Failed_Contacts_Title from "@salesforce/label/c.Lwc_Uploader_Failed_Contacts_Title";
import Lwc_Uploader_File_Size_Error from "@salesforce/label/c.Lwc_Uploader_File_Size_Error";
import Lwc_Uploader_Insert_Button_Label from "@salesforce/label/c.Lwc_Uploader_Insert_Button_Label";
import Lwc_Uploader_Partial_Upload_Message from "@salesforce/label/c.Lwc_Uploader_Partial_Upload_Message";
import Lwc_Uploader_Process_CSV_File_Title from "@salesforce/label/c.Lwc_Uploader_Process_CSV_File_Title";
import Lwc_Uploader_Record_Creation_Failure_Message from "@salesforce/label/c.Lwc_Uploader_Record_Creation_Failure_Message";
import Lwc_Uploader_Upload_File_Error from "@salesforce/label/c.Lwc_Uploader_Upload_File_Error";
import Lwc_Uploader_Uploaded_Contacts_Title from "@salesforce/label/c.Lwc_Uploader_Uploaded_Contacts_Title";
import Lwc_Uploader_Uploaded_Successfully_Message from "@salesforce/label/c.Lwc_Uploader_Uploaded_Successfully_Message";
import Other_Lead_Origin_Field_Label from "@salesforce/label/c.Other_Lead_Origin_Field_Label";
import Other_Program_Lead_Type_Field_Label from "@salesforce/label/c.Other_Program_Lead_Type_Field_Label";
import Phone_Field_Label from "@salesforce/label/c.Phone_Field_Label";
import Phone_Two_Field_Label from "@salesforce/label/c.Phone_Two_Field_Label";
import Program_Lead_Type_Field_Label from "@salesforce/label/c.Program_Lead_Type_Field_Label";
import Rating_Field_Label from "@salesforce/label/c.Rating_Field_Label";
import Reason_Field_Label from "@salesforce/label/c.Reason_Field_Label";
import Second_Date_Contacted_Field_Label from "@salesforce/label/c.Second_Date_Contacted_Field_Label";
import Select_CSV_File_Generic_Label from "@salesforce/label/c.Select_CSV_File_Generic_Label";
import Sold_Date_Field_Label from "@salesforce/label/c.Sold_Date_Field_Label";
import Spinner_Alternative_Text from "@salesforce/label/c.Spinner_Alternative_Text";
import Stage_Field_Label from "@salesforce/label/c.Stage_Field_Label";
import State_Code_Field_Label from "@salesforce/label/c.State_Code_Field_Label";
import Street_Field_Label from "@salesforce/label/c.Street_Field_Label";
import Success_Toast_Title from "@salesforce/label/c.Success_Toast_Title";
import Suggested_Provider_s_Cost_Field_Label from "@salesforce/label/c.Suggested_Provider_s_Cost_Field_Label";
import Suggested_Provider_s_Field_Label from "@salesforce/label/c.Suggested_Provider_s_Field_Label";
import Third_Date_Contacted_Field_Label from "@salesforce/label/c.Third_Date_Contacted_Field_Label";
import Under_Contract_Field_Label from "@salesforce/label/c.Under_Contract_Field_Label";
import Upload_Failed_Generic_Title from "@salesforce/label/c.Upload_Failed_Generic_Title";
import Zip_Field_Label from "@salesforce/label/c.Zip_Field_Label";

const MAX_FILE_SIZE = 1500000;
export default class poe_lwcCSVUploader extends LightningElement {
    labels = {
        Generic_Warning_Title,
        Lwc_Uploader_Download_Sample_CSV_File_Button_Label,
        Lwc_Uploader_Download_User_Guide_Button_Label,
        Lwc_Uploader_Failed_Contacts_Title,
        Lwc_Uploader_File_Size_Error,
        Lwc_Uploader_Insert_Button_Label,
        Lwc_Uploader_Partial_Upload_Message,
        Lwc_Uploader_Process_CSV_File_Title,
        Lwc_Uploader_Record_Creation_Failure_Message,
        Lwc_Uploader_Upload_File_Error,
        Lwc_Uploader_Uploaded_Contacts_Title,
        Lwc_Uploader_Uploaded_Successfully_Message,
        Select_CSV_File_Generic_Label,
        Spinner_Alternative_Text,
        Success_Toast_Title,
        Upload_Failed_Generic_Title,
        First_Name_Field_Label,
        Last_Name_Field_Label,
        Phone_Field_Label,
        Email_Field_Label,
        Phone_Two_Field_Label,
        Email_Two_Field_Label,
        Street_Field_Label,
        Address_Line_2_Field_Label,
        City_Field_Label,
        State_Code_Field_Label,
        Zip_Field_Label,
        Lead_Origin_Field_Label,
        Other_Lead_Origin_Field_Label,
        Program_Lead_Type_Field_Label,
        Other_Program_Lead_Type_Field_Label,
        Current_Provider_s_Field_Label,
        Current_Provider_s_Cost_Field_Label,
        Under_Contract_Field_Label,
        Contract_Expiration_Date_Field_Label,
        Suggested_Provider_s_Field_Label,
        Suggested_Provider_s_Cost_Field_Label,
        First_Date_Contacted_Field_Label,
        Second_Date_Contacted_Field_Label,
        Third_Date_Contacted_Field_Label,
        Sold_Date_Field_Label,
        Rating_Field_Label,
        Stage_Field_Label,
        Reason_Field_Label
    };
    fileName = "";
    showLoadingSpinner = false;
    insertDisabled = true;
    filesUploaded = [];
    file;
    fileContents;
    fileReader;
    showFailedInserts = false;
    showInsertedRecords = false;
    insertedRecords = [];
    failedRecords = [];
    dataUrl;

    activeSections = [];

    get uploadedRecordsCount() {
        return typeof this.insertedRecords?.length === "number" ? this.insertedRecords.length : 0;
    }

    get failedRecordsCount() {
        return typeof this.failedRecords?.length === "number" ? this.failedRecords.length : 0;
    }

    get uploadedContactsTitle() {
        return `${this.uploadedRecordsCount} ${this.labels.Lwc_Uploader_Uploaded_Contacts_Title}`;
    }

    get failedContactsTitle() {
        return `${this.failedRecordsCount} ${this.labels.Lwc_Uploader_Failed_Contacts_Title}`;
    }

    handleFilesChange(event) {
        if (event.target.files.length > 0) {
            this.filesUploaded = event.target.files;
            this.fileName = event.target.files[0].name;
            this.insertDisabled = false;
        }
    }

    handleDownload() {
        const downloadElement = document.createElement("a");
        downloadElement.href = UPLOAD_SAMPLE_CSV;
        downloadElement.target = "_self";
        downloadElement.download = "Chuzo Contact Upload Sample.csv";
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement);
    }

    handleSave() {
        this.file = this.filesUploaded[0];
        this.showFailedInserts = false;
        this.showInsertedRecords = false;
        if (this.file.size > MAX_FILE_SIZE) {
            this.refreshComponent();
            this.displayToast(
                this.labels.Lwc_Uploader_Upload_File_Error,
                "error",
                this.labels.Lwc_Uploader_File_Size_Error
            );
            return;
        }
        this.showLoadingSpinner = true;
        this.fileReader = new FileReader();
        this.fileReader.onloadend = () => {
            this.fileContents = this.fileReader.result;
            this.saveToFile();
        };
        this.fileReader.readAsText(this.file);
    }

    refreshComponent() {
        this.showFailedInserts = false;
        this.showInsertedRecords = false;
        this.filesUploaded = [];
        this.insertedRecords = [];
        this.failedRecords = [];
        this.fileName = "";
    }

    saveToFile() {
        saveFile({ base64Data: JSON.stringify(this.fileContents) })
            .then((result) => {
                let insertedRecords = [];
                let failedRecords = [];
                let canParse = this.checkParser(result);
                if (canParse) {
                    let parsedResult = JSON.parse(result);
                    parsedResult.forEach((item) => {
                        if (item.isSuccess) {
                            insertedRecords.push(item.personAccountData);
                        } else {
                            let auxItem = item;
                            let message = "";
                            auxItem.errors.forEach((error) => {
                                message += error.message + "\n";
                            });
                            auxItem.personAccountData.errorMessage = message;
                            failedRecords.push(auxItem.personAccountData);
                        }
                    });
                    this.insertedRecords = [...insertedRecords];
                    this.failedRecords = [...failedRecords];

                    this.showFailedInserts = this.failedRecords?.length > 0;
                    this.showInsertedRecords = this.insertedRecords?.length > 0;

                    this.fileName = this.file.name + " - " + this.labels.Lwc_Uploader_Uploaded_Successfully_Message;
                    this.showLoadingSpinner = false;

                    if (this.showInsertedRecords === true && this.showFailedInserts === true) {
                        this.activeSections = ["A", "B"];
                        this.insertDisabled = true;
                        this.displayToast(
                            this.labels.Generic_Warning_Title,
                            "warning",
                            this.labels.Lwc_Uploader_Partial_Upload_Message
                        );
                    } else if (this.showInsertedRecords === true && this.showFailedInserts === false) {
                        this.activeSections = ["A"];
                        this.insertDisabled = true;
                        let msg = this.file.name + " - " + this.labels.Lwc_Uploader_Uploaded_Successfully_Message;

                        this.displayToast(this.labels.Success_Toast_Title, "success", msg);
                    } else if (this.showInsertedRecords === false && this.showFailedInserts === true) {
                        this.activeSections = ["B"];
                        this.insertDisabled = true;
                        this.displayToast(
                            this.labels.Upload_Failed_Generic_Title,
                            "error",
                            this.labels.Lwc_Uploader_Record_Creation_Failure_Message
                        );
                    }
                } else {
                    this.displayToast(
                        this.labels.Upload_Failed_Generic_Title,
                        "error",
                        `${this.labels.Upload_Failed_Generic_Title} ${result}`
                    );

                    this.insertDisabled = true;
                    this.showLoadingSpinner = false;
                }
            })
            .catch((error) => {
                console.log(error);
                this.showLoadingSpinner = false;
                this.refreshComponent();
                this.displayToast(this.labels.Lwc_Uploader_Invalid_File_Generic_Error, "error", error.message);
            });
    }

    displayToast(title, variant, message) {
        const toastEvent = new ShowToastEvent({
            title: title,
            variant: variant,
            mode: "sticky",
            message: message
        });
        this.dispatchEvent(toastEvent);
    }

    checkParser(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    handleDownloadGuide() {
        const downloadElement = document.createElement("a");
        downloadElement.href = UPLOAD_GUIDE_PDF;
        downloadElement.target = "_self";
        downloadElement.download = "Chuzo - Contact Upload Tool User Guide.pdf";
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement);
    }

    handleSections(e) {
        let value = e.target.name;
        let aux = [...this.activeSections];
        const index = aux.indexOf(value);

        if (index > -1) {
            aux.splice(index, 1);
        } else {
            aux.push(value);
        }
        this.activeSections = [...aux];
    }
}