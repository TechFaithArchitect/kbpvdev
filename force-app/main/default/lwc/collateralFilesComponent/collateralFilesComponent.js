import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getRelatedFilesByRecordId from "@salesforce/apex/FilePreviewController.getRelatedFilesByRecordId";

const PROVIDERS_MAP = {
    earthlink: "Earthlink",
    charter: "Charter",
    spectrum: "Spectrum",
    windstream: "Windstream",
    directv: "DirecTV",
    optimum: "Optimum",
    frontier: "Frontier"
};
export default class CollateralFilesComponent extends NavigationMixin(LightningElement) {
    @api libraryId;
    @api provider;
    filesList = [];
    buyflowType;
    loaderSpinner;
    selectedUrl;
    selectedTitle;
    showFilePreview;

    connectedCallback() {
        this.loaderSpinner = true;
        this.buyflowType = `${PROVIDERS_MAP[this.provider]} Buyflow`;
        this.getFiles();
    }

    getFiles() {
        const myData = {
            libraryName: this.buyflowType
        };

        getRelatedFilesByRecordId({ myData })
            .then((response) => {
                console.log(response);
                const documents = response.result.Documents;
                if (documents?.length > 0) {
                    documents.forEach((doc) => {
                        let dc = {
                            label: doc.Title,
                            value: doc.Id,
                            url: `/sfc/servlet.shepherd/version/download/${doc.Id}`
                        };
                        this.filesList.push(dc);
                    });
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.dispatchEvent(
                    new CustomEvent("logerror", {
                        detail: {
                            type: "Internal Error",
                            component: "collateralFilesComponent",
                            error: error.body?.message || error.message
                        }
                    })
                );
            });
    }

    previewHandler(event) {
        console.log(JSON.stringify(event.target.dataset.id));
        this.filesList.forEach((file) => {
            if (file.value === event.target.dataset.id) {
                (this.selectedTitle = file.label), (this.selectedUrl = file.url);
            }
        });
        this.showFilePreview = true;
    }

    handleCancel() {
        const showCollateralEvent = new CustomEvent("showcollateral", {
            detail: "hide"
        });
        this.dispatchEvent(showCollateralEvent);
    }

    handleHideModal(event) {
        this.showFilePreview = false;
    }
}