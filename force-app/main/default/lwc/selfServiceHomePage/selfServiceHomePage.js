import { LightningElement, track } from "lwc";
import isGuest from "@salesforce/user/isGuest";
import SS_BCKGR from "@salesforce/resourceUrl/selfServiceHome";
import getReferralCode from "@salesforce/apex/SelfServiceUtils.getReferralCode";
import logError from "@salesforce/apex/ErrorLogModel.logError";
import saveSelfServiceStatistic from "@salesforce/apex/SelfServiceUtils.saveSelfServiceStatistic";
import setSelfServiceStatisticEndTime from "@salesforce/apex/SelfServiceUtils.setSelfServiceStatisticEndTime";
const INTERNAL_ERROR = "Internal Error";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import selfServiceResources from "@salesforce/resourceUrl/selfServiceResources";
import selfServiceDocuments from "@salesforce/resourceUrl/selfServiceDocuments";
import { loadStyle } from "lightning/platformResourceLoader";
import chuzo_modalContactUs from "c/chuzo_modalContactUs";
import chuzo_modalPredictiveAddress from "c/chuzo_modalPredictiveAddress";
import chuzo_modalScheduleCall from "c/chuzo_modalScheduleCall";
import ABOUT_US_URL from "@salesforce/label/c.About_Us_Link";

export default class SelfServiceHomePage extends LightningElement {
    @track toastQueue = [];
    @track referralCode = {};
    address = {
        zip: "",
        state: "",
        apt: "",
        street: "",
        city: ""
    };
    disableButton = true;
    showBuyflowMaster = false;
    showZipInput = true;
    imageUrl = SS_BCKGR;
    previousStatistic;
    addressTextValue;
    providerStyle;
    showCaptcha = true;
    isAddressModalOpen = false;
    aboutUsURL = ABOUT_US_URL;
    isMobile = false;

    get primaryColorBackground() {
        return `background-color: #${this.referralCode?.primaryColor || "white"} !important;`;
    }

    get secondaryColorBackground() {
        return `background-color: #${this.referralCode?.secondaryColor || "white"} !important;`;
    }

    get secondaryColorText() {
        return `color: #${this.referralCode?.secondaryColor || "white"} !important;`;
    }

    get logoPoweredChuzo() {
        return chuzoSiteResources + "/images/powered-by-chuzo.svg";
    }

    get getBackgroundImage() {
        return `background-image:url("${this.imageUrl}");height:100vh;`;
    }

    get videoHome() {
        return chuzoSiteResources + "/images/loop-video.mp4";
    }

    get iconPointAddress() {
        return chuzoSiteResources + "/images/icon-point-address.svg";
    }

    get logoProvidersShowDirectv() {
        return chuzoSiteResources + "/images/providers-show/directv.svg";
    }

    get logoProvidersShowFrontier() {
        return chuzoSiteResources + "/images/providers-show/frontier.svg";
    }

    get logoProvidersShowEarthlink() {
        return chuzoSiteResources + "/images/providers-show/earthlink.svg";
    }

    get logoProvidersShowKinetic() {
        return chuzoSiteResources + "/images/providers-show/kinetic.svg";
    }

    get logoProvidersShowSpectrum() {
        return chuzoSiteResources + "/images/providers-show/spectrum.svg";
    }

    get logoProvidersShowOptimum() {
        return chuzoSiteResources + "/images/providers-show/optimum.svg";
    }

    get logoProvidersShowViasat() {
        return chuzoSiteResources + "/images/providers-show/viasat.svg";
    }

    get logoProvidersShowHomeSecurity() {
        return chuzoSiteResources + "/images/providers-show/home-security.png";
    }

    get logoFooterChuzo() {
        return chuzoSiteResources + "/images/logo.png";
    }

    handleShowToast(event) {
        if (event.stopPropagation) event.stopPropagation();

        const toastParams = {
            ...event.toastAttributes,
            variant: event.toastAttributes.type
        };
        toastParams.key = `${toastParams.title}${toastParams.message}${toastParams.variant}${toastParams.mode}${
            toastParams.duration
        }${new Date().getTime()}`;

        this.toastQueue.push(toastParams);
    }

    handleToastEnd(event) {
        const toastKey = event.detail.key;
        this.toastQueue = this.toastQueue.filter((t) => t.key !== toastKey);
    }

    contactUsModal() {
        chuzo_modalContactUs
            .open({
                content: {
                    label: this.providerStyle !== undefined ? `Need help with your order?` : `Let's connect`,
                    tollNumber: this.referralCode.tollNumber,
                    tollNumberURL: this.referralCode.tollNumberURL,
                    isMobile: this.isMobile
                }
            })
            .then((result) => {
                if (result === "schedule") {
                    this.scheduleCallModal();
                }
            });
    }

    scheduleCallModal() {
        chuzo_modalScheduleCall
            .open({
                referralCodeData: this.referralCode
            })
            .then((result) => {});
    }

    handleAddressModal(e) {
        if (this.isAddressModalOpen) {
            return;
        }
        const originalValue = this.addressTextValue;
        if (e.detail?.value) {
            this.addressTextValue = e.detail.value;
        }

        this.isAddressModalOpen = true;
        chuzo_modalPredictiveAddress
            .open({
                content: {
                    showCaptcha: this.showCaptcha
                }
            })
            .then((result) => {
                this.isAddressModalOpen = false;
                if (!result) {
                    this.addressTextValue = originalValue;
                    return;
                }

                this.zip = result.zip;
                this.address = { ...this.address, ...result };
                this.addressTextValue = `${result.street}${result.apt !== undefined ? ` ${result.apt}` : ""}, ${
                    result.city
                }, ${result.state} ${result.zip}, US`;
                this.showCaptcha = false;
                this.disableValidations();
            });
    }

    handleProviderStyle(event) {
        this.providerStyle = event.detail;
    }

    handleMobile() {
        const minWidth = 768;
        return window.innerWidth < minWidth || screen.width < minWidth;
    }

    connectedCallback() {
        this.isMobile = this.handleMobile();
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        const url = new URL(window.location.href);
        const params = url.searchParams;
        const caseInsensitiveParams = new URLSearchParams(
            Array.from(params, ([key, value]) => [key.toLowerCase(), value.toLowerCase()])
        );
        const refCode = caseInsensitiveParams.get("shopid");
        const myData = {
            refCode: refCode
        };
        console.log("ReferralCode Callout: ", myData);
        getReferralCode({ myData })
            .then((response) => {
                const codeData = response.result?.Code;
                console.log("ReferralCode Response: ", response);
                if (codeData) {
                    this.referralCode.referralCodeId = codeData.Id;
                    this.referralCode.primaryColor = codeData.Primary_Brand_Color__c;
                    this.referralCode.secondaryColor = codeData.Secondary_Brand_Color__c;
                    this.referralCode.logo = this.getUrlFromField(codeData.Logo_URL__c);
                    this.referralCode.termsUrl = this.getUrlFromField(codeData.Terms_of_Use_Link__c);
                    this.referralCode.privacyPolicyUrl = this.getUrlFromField(codeData.Privacy_Policy_Link__c);
                    this.referralCode.tollNumber = codeData.Contact_Phone_Number__c;
                    this.referralCode.tollNumberURL = `tel:+${codeData.Contact_Phone_Number__c.replace("-", "")
                        .replace("(", "")
                        .replace(")", "")}`;
                    this.referralCode.title = codeData.Title__c;
                    this.referralCode.subtitle = codeData.Subtitle__c;
                    this.referralCode.body = codeData.Body__c;
                    this.referralCode.bannerDescription = codeData.Banner_Description__c;
                    this.referralCode.bannerLogo = this.getUrlFromField(codeData.Banner_Logo__c);
                }
            })
            .catch((error) => {
                this.handleLogError({
                    detail: {
                        error: error.body?.message || error.message,
                        type: INTERNAL_ERROR,
                        component: "selfServiceHomePage"
                    }
                });
            });

        this.createSelfServiceStatistic();
    }

    disableValidations() {
        const button = this.template.querySelector('[data-id="next-available"]');
        let zipre = /^\d{5}$/;
        if (button !== null) {
            if (zipre.test(this.zip)) {
                button.classList.remove("btn-disabled");
            } else {
                button.classList.add("btn-disabled");
            }
        }
    }

    handleClick() {
        this.showZipInput = false;
        this.showBuyflowMaster = true;
        this.updateSelfServiceStatistic();
    }

    handleHome() {
        this.showBuyflowMaster = false;
        this.showZipInput = true;
        this.providerStyle = undefined;
        this.zip = undefined;
        this.addressTextValue = "";
        this.address = {};
        this.disableValidations();
        this.createSelfServiceStatistic();
    }

    handleLogError(event) {
        logError({ error: event.detail })
            .then(() => {})
            .catch((err) => {
                console.error(`LOGGING ERROR: ${err.body?.message || err.stack}`);
            });
    }

    createSelfServiceStatistic() {
        if (!isGuest || this.previousStatistic) {
            return;
        }

        const myData = {
            tabName: "Home",
            startTime: JSON.stringify(new Date())
        };

        saveSelfServiceStatistic({ myData })
            .then((response) => {
                this.previousStatistic = response.result.statistic;
            })
            .catch((error) => {
                console.error("ERROR", error);

                this.handleLogError({
                    detail: {
                        type: INTERNAL_ERROR,
                        tab: myData.tabName,
                        component: "selfServiceHomePage",
                        error: error.body?.message || error.message,
                        opportunity: this.recordId
                    }
                });
            });
    }

    updateSelfServiceStatistic() {
        if (!isGuest || !this.previousStatistic.Id) {
            return;
        }

        const myData = {
            id: this.previousStatistic.Id,
            endTime: JSON.stringify(new Date())
        };

        setSelfServiceStatisticEndTime({ myData })
            .then(() => {
                this.previousStatistic = undefined;
            })
            .catch((error) => {
                console.error("ERROR", error);

                this.handleLogError({
                    detail: {
                        type: INTERNAL_ERROR,
                        tab: this.previousStatistic.Tab_Name__c,
                        component: "selfServiceHomePage",
                        error: error.body?.message || error.message
                    }
                });
            });
    }

    getUrlFromField(fieldValue) {
        const isAbsUrlRegex = /^https?:\/\//;
        const isDocRegex = /\.pdf$/;
        const isDocument = isDocRegex.test(fieldValue);

        if (isAbsUrlRegex.test(fieldValue)) {
            return fieldValue;
        } else {
            fieldValue = fieldValue?.startsWith("/") ? fieldValue.substring(1) : fieldValue;
            return `${isDocument ? selfServiceDocuments : selfServiceResources}/${fieldValue}`;
        }
    }
}