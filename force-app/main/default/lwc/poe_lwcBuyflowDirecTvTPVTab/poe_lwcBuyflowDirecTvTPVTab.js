import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
import { NavigationMixin } from "lightning/navigation";

export default class Poe_lwcBuyflowDirecTvTPVTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api dateSelected;
    @api orderRequest;
    @api cartInfo;
    @api logo;
    @api returnUrl;
    showCollateral = false;
    loaderSpinner;
    dateValue = {};
    noCompleteInfo = true;
    isCallCenter = true;
    showDisclaimer = false;
    installDisclaimer = "";
    value;
    options = [];
    timeOut = false;
    installWindows;

    connectedCallback() {
        console.log("order request");
        console.log(this.orderRequest);
        this.callInstallationData();
    }

    handleRefresh() {
        this.callInstallationData();
    }

    callInstallationData() {
        this.loaderSpinner = true;
        this._actionUtil = new OmniscriptActionCommonUtil();
        let orderRequestParsed = JSON.parse(JSON.stringify(this.orderRequest));
        this.orderRequest = orderRequestParsed;
        let customer = this.orderRequest.customer;
        if (customer.middleName === null) {
            customer.middleName = "";
        }
        let myData = {
            tab: "tpv",
            partnerName: this.orderRequest?.partnerName,
            partnerOrderNumber: this.orderRequest?.partnerOrderNumber,
            productType: this.orderRequest?.productType,
            dealerCode: this.orderRequest?.dealerCode,
            componentCode: this.orderRequest?.componentCode,
            customerType: this.orderRequest?.customerType,
            customer: customer,
            account: this.orderRequest?.account,
            securityVerification: this.orderRequest?.securityVerification,
            componentCustomizations: this.orderRequest?.componentCustomizations
        };
        console.log(myData);
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_ProviderCallouts",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                let result = response.result.IPResult;
                let installWindows = [];

                if (result.installWindows !== undefined) {
                    this.installWindows = result.installWindows;
                    this.installWindows.forEach((item, index) => {
                        installWindows.push({
                            label: String(item.date + " " + item.startTime + " - " + item.endTime),
                            value: String(index)
                        });
                    });
                }
                if (result.appointmentProperties.installDisclaimer !== undefined) {
                    this.showDisclaimer = true;
                    this.installDisclaimer = result.appointmentProperties.installDisclaimer;
                }
                this.options = [...installWindows];
                console.log(this.options);
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: "Couldn't fetch dates from the server. Please, try again."
                });
                this.dispatchEvent(event);
                console.log(error);
            });
    }

    handleDate(event) {
        console.log(event.target.value);
        this.value = event.target.value;
        this.dateValue.installationDetail = this.installWindows[Number(event.target.value)];
        this.noCompleteInfo = event.target.value !== undefined ? false : true;
        console.log(this.dateValue);
    }

    handleCancel() {
        if (this.returnUrl != undefined) {
            window.open(this.returnUrl, "_self");
        } else {
            this[NavigationMixin.Navigate]({
                type: "standard__recordPage",
                attributes: {
                    recordId: this.recordId,
                    objectApiName: "Opportunity",
                    actionName: "view"
                }
            });
        }
    }

    handleGoBack() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleGoToConfirmation() {
        const forwardEvent = new CustomEvent("tpvnext", {
            detail: this.dateValue
        });
        this.dispatchEvent(forwardEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }
    handleRefreshDates(event) {
        this.callInstallationData();
    }
}