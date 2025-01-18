import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import isguest from "@salesforce/user/isGuest";
import getIPStackSettings from "@salesforce/apex/InfoTabController.getIPStackSettings";
import saveIPStatisticRecord from "@salesforce/apex/InfoTabController.saveIPStatisticRecord";
import saveBuyflowTab from "@salesforce/apex/InfoTabController.saveBuyflowTab";
import logError from "@salesforce/apex/ErrorLogModel.logError";
import saveSelfServiceStatistic from "@salesforce/apex/SelfServiceUtils.saveSelfServiceStatistic";
import setSelfServiceStatisticEndTime from "@salesforce/apex/SelfServiceUtils.setSelfServiceStatisticEndTime";
import getAccountFSLDatesConfigApex from "@salesforce/apex/InfoTabController.getAccountFSLDatesConfig";
import getAgentReferralCodes from "@salesforce/apex/InfoTabController.getAgentReferralCodes";
import saveOpportunityReferralCode from "@salesforce/apex/InfoTabController.saveOpportunityReferralCode";

export default class Poe_lwcBuyflowMaster extends LightningElement {
    @api zipCode;
    @api referralCodeData;
    @api isMobile;
    @api clickerOrigin;
    @api selfServiceAddress;
    recordId;
    productFamilies = [];
    origin;
    loaderSpinner;
    trackerId;
    showAddressServiceability = false;
    showProgramSelection = false;
    showAltice;
    showDirecTv;
    showEarthlink;
    showCharter;
    showFrontier;
    showWindstream;
    showViasat;
    showOther;
    showSpectrumAPI;
    contact = {
        firstName: "",
        lastName: "",
        phone: "",
        email: ""
    };
    newProduct;
    userId;
    isNationalRetail;
    codeFFL = "none";
    codeNFFL = "none";
    provider;
    returnUrl;
    isProviderEnabled;
    showError = false;
    error;
    urlInfo;
    ip;
    isGuestUser = isguest;
    previousTabStatistic;
    isFSLDatesEnabled;
    defaultWorkTypeId;
    defaultWorkTypeName;
    defaultFSLDealerCode;
    agentReferralCodes = [];
    referralCodeSelected;
    showShopIdModal = false;
    programSelected;

    get shopIdEligible() {
        return !this.isGuestUser && this.programSelected !== "other" && this.agentReferralCodes.length > 0;
    }

    connectedCallback() {
        this.loaderSpinner = true;
        // this.getAccountFSLDatesConfig().finally(() => {
        //     this.loaderSpinner = false;
        // });

        if (!this.isGuestUser) {
            this.loaderSpinner = true;
            let parameters = this.getQueryParameters();
            let lowerCaseParameters = Object.keys(parameters).reduce((accumulator, key) => {
                accumulator[key.toLowerCase()] = parameters[key];
                return accumulator;
            }, {});
            if (lowerCaseParameters.hasOwnProperty("clickerorigin")) {
                if (lowerCaseParameters.clickerorigin === "Phone Sales-Lead") {
                    lowerCaseParameters.clickerorigin = "phonesales";
                }
                if (lowerCaseParameters.clickerorigin === "D2D-Lead") {
                    lowerCaseParameters.clickerorigin = "maps";
                }
            }
            this.recordId = lowerCaseParameters.hasOwnProperty("c__recordid")
                ? lowerCaseParameters.c__recordid
                : undefined;
            this.zipCode = this.zipCode
                ? this.zipCode
                : lowerCaseParameters.hasOwnProperty("zipcode")
                ? lowerCaseParameters.zipcode
                : undefined;
            this.provider = lowerCaseParameters.hasOwnProperty("provider")
                ? lowerCaseParameters.provider.toLowerCase()
                : undefined;
            this.origin = this.clickerOrigin
                ? this.clickerOrigin
                : lowerCaseParameters.hasOwnProperty("clickerorigin")
                ? lowerCaseParameters.clickerorigin
                : this.provider == undefined
                ? "maps"
                : "phonesales";
            let firstName = lowerCaseParameters.hasOwnProperty("firstname") ? lowerCaseParameters.firstname : undefined;
            let lastName = lowerCaseParameters.hasOwnProperty("lastname") ? lowerCaseParameters.lastname : undefined;
            let email = lowerCaseParameters.hasOwnProperty("email") ? lowerCaseParameters.email : undefined;
            let phone = lowerCaseParameters.hasOwnProperty("phone") ? lowerCaseParameters.phone : undefined;
            let addressLine1 = lowerCaseParameters.hasOwnProperty("addressline1")
                ? lowerCaseParameters.addressline1
                : undefined;
            let addressLine2 = lowerCaseParameters.hasOwnProperty("addressline2")
                ? lowerCaseParameters.addressline2
                : undefined;
            let city = lowerCaseParameters.hasOwnProperty("city") ? lowerCaseParameters.city : undefined;
            let state = lowerCaseParameters.hasOwnProperty("state") ? lowerCaseParameters.state : undefined;
            let externalAgentId = lowerCaseParameters.hasOwnProperty("externalagentid")
                ? lowerCaseParameters.externalagentid
                : undefined;
            let externalSessionId = lowerCaseParameters.hasOwnProperty("externalsessionid")
                ? lowerCaseParameters.externalsessionid
                : undefined;
            this.returnUrl = lowerCaseParameters.hasOwnProperty("returnurl")
                ? lowerCaseParameters.returnurl
                : undefined;

            this.urlInfo = {
                address: {
                    addressLine1: addressLine1,
                    addressLine2: addressLine2,
                    city: city,
                    state: state
                },
                externalAgentId: externalAgentId,
                externalSessionId: externalSessionId
            };

            this.contact = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone
            };
            this.loaderSpinner = false;
        }

        if (this.zipCode == undefined) {
            this.showError = true;
            this.error = "Missing ZipCode";
        } else {
            this.showProgramSelection = true;
        }
    }

    getAccountFSLDatesConfig() {
        return getAccountFSLDatesConfigApex()
            .then((response) => {
                this.isFSLDatesEnabled = response.result.isFSLDatesEnabled;
                this.defaultWorkTypeId = response.result.defaultWorkTypeId;
                this.defaultWorkTypeName = response.result.defaultWorkTypeName;
                this.defaultFSLDealerCode = response.result.fslDealerCode;
            })
            .catch((err) => {
                const error = {
                    type: "Internal Error",
                    component: "poe_lwcBuyflowMaster",
                    error: err.body?.message || err.message,
                    opportunity: this.recordId
                };

                this.handleLogError({
                    detail: error
                });
            });
    }

    handleOrigin(e) {
        this.origin = e.detail;
    }

    handleZipCode(e) {
        this.zipCode = e.detail;
    }

    getQueryParameters() {
        var params = {};
        var search = location.search.substring(1);
        if (search) {
            params = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', (key, value) => {
                return key === "" ? value : decodeURIComponent(value);
            });
        }
        return params;
    }

    handleTracker(event) {
        this.trackerId = event.detail;
    }

    handleAddressInfo(event) {
        this.loaderSpinner = true;
        let info = JSON.parse(JSON.stringify(event.detail));
        this.recordId = info.record;
        this.programs = info.products;
        console.log(info);
        if (info.contact.hasContactInfo) {
            this.contact = info.contact;
        }
        this.userId = info.userId;
        this.loaderSpinner = false;
    }

    handleProgram(event) {
        this.showProgramSelection = false;
        this.programSelected = event.detail.program.toLowerCase();
        this.providerEnabled =
            event.detail.hasOwnProperty("isProviderEnabled") && event.detail.isProviderEnabled ? true : false;
        this.recordId = event.detail.hasOwnProperty("recordId") ? event.detail.recordId : this.recordId;
        if (event.detail.hasOwnProperty("userId")) {
            this.userId = event.detail.userId;
        }
        if (
            this.provider == undefined ||
            (this.provider != undefined &&
                this.providerEnabled &&
                (this.provider == "directv" ||
                    this.provider == "charter" ||
                    this.provider == "spectrum api" ||
                    this.provider == "altice"))
        ) {
            this.isNationalRetail = event.detail.isNationalRetail;
            if (this.origin === "retail") {
                this.codeFFL = event.detail.FFLCode;
                this.codeNFFL = event.detail.NFFLCode;
            }
            if (this.isGuestUser) {
                const goBackEvent = new CustomEvent("providerstyle", {
                    detail: this.programSelected
                });
                this.dispatchEvent(goBackEvent);
            } else {
                this.handleGetAgentReferralCodes(this.userId);
            }
            switch (this.programSelected) {
                case "altice":
                    this.showAltice = true;
                    break;
                case "earthlink":
                    this.showEarthlink = true;
                    break;
                case "windstream":
                    this.showWindstream = true;
                    break;
                case "directv":
                    this.showDirecTv = true;
                    break;
                case "charter":
                    this.showCharter = true;
                    break;
                case "frontier":
                    this.showFrontier = true;
                    break;
                case "viasat":
                    this.showViasat = true;
                    break;
                case "spectrum api":
                    this.showSpectrumAPI = true;
                    break;
                case "other":
                    this.showOther = true;
                    break;
            }
        } else {
            this.showError = true;
            this.error = "Invalid provider";
        }
    }

    handleResume(event) {
        let info = JSON.parse(JSON.stringify(event.detail));
        this.recordId = info.record;
        if (info.contact.hasContactInfo) {
            this.contact = info.contact;
        }
        this.userId = info.userId;
        switch (info.program) {
            case "Altice":
                this.showAltice = true;
                break;
            case "Earthlink":
                this.showEarthlink = true;
                this.showProgramSelection = false;
                break;
            case "Windstream":
                this.showWindstream = true;
                break;
            case "DirecTV":
                this.showDirecTv = true;
                break;
            case "Charter":
                this.showCharter = true;
                break;
            case "Spectrum":
                window.alert("Buyflow under Construction");
                break;
            case "AT&T":
                window.alert("Buyflow under Construction");
                break;
            case "Frontier":
                this.showFrontier = true;
                break;
            case "Viasat":
                this.showViasat = true;
                break;
            case "spectrum api":
                this.showSpectrumAPI = true;
                break;
        }
    }

    handleNewProduct(event) {
        let result = event.detail;
        this.recordId = result.recordId;
        this.newProduct = true;
        switch (result.program) {
            case "Altice":
                this.showAltice = false;
                this.showProgramSelection = true;
                break;
            case "Earthlink":
                this.showEarthlink = false;
                this.showProgramSelection = true;
                break;
            case "Windstream":
                this.showWindstream = false;
                this.showProgramSelection = true;
                break;
            case "Charter":
                this.showCharter = false;
                this.showProgramSelection = true;
                break;
            case "DirecTV":
                this.showDirecTv = false;
                this.showProgramSelection = true;
                break;
            case "Frontier":
                this.showFrontier = false;
                this.showProgramSelection = true;
                break;
            case "Viasat":
                this.showViasat = false;
                this.showProgramSelection = true;
                break;
            case "Other":
                this.showOther = false;
                this.showProgramSelection = true;
                break;
            case "spectrum api":
                this.showSpectrumAPI = false;
                this.showProgramSelection = true;
                break;
        }
    }

    handlePrevious() {
        this.showProgramSelection = false;
        this.handleCancel();
    }

    handleCheckIP() {
        getIPStackSettings()
            .then((response) => {
                const Http = new XMLHttpRequest();
                let url = response.result.URL__c ? response.result.URL__c : "https://api.ipstack.com/";

                url = url + "/check?access_key=" + response.result.Password__c;
                Http.open("GET", url);
                Http.send();
                Http.onreadystatechange = (e) => {
                    if (!(Http.readyState == 4 && Http.status == 200)) {
                        return;
                    }

                    let data = JSON.parse(Http.responseText);
                    this.ip = data.ip;
                    let ipData = {
                        ContextId: this.recordId,
                        ip: this.ip,
                        userId: this.userId,
                        state: data.region_name
                    };

                    saveIPStatisticRecord({ myData: ipData })
                        .then(() => {})
                        .catch((error) => {
                            console.error(error, "ERROR");
                        });
                };
            })
            .catch((error) => {
                console.error(error, "ERROR");
            });
    }

    handleTabUpdate(event) {
        const tab = event.detail.tab;
        const myData = {
            oppId: this.recordId,
            tab: tab
        };

        console.log("update tab request", myData);
        saveBuyflowTab({ myData })
            .then((response) => {
                console.log("update tab response", response);
            })
            .catch((error) => {
                console.error(error, "ERROR");
            });
    }

    async handleSelfServiceStatistics(event) {
        this.loaderSpinner = !this.isGuestUser; // Only show spinner for Chuzo users
        if (this.previousTabStatistic) {
            await this.updateSelfServiceStatistic();
        }

        await this.createSelfServiceStatistic(event.detail);
        this.loaderSpinner = false;
    }

    createSelfServiceStatistic(data) {
        if (!this.isGuestUser) {
            return;
        }

        const myData = {
            ...data,
            startTime: JSON.stringify(new Date()),
            opportunityId: this.recordId
        };

        return saveSelfServiceStatistic({ myData })
            .then((response) => {
                this.previousTabStatistic = response.result.statistic;
            })
            .catch((error) => {
                console.error("ERROR", error);

                this.handleLogError({
                    detail: {
                        type: "Internal Error",
                        provider: data.program,
                        tab: data.tabName,
                        component: "poe_lwcBuyflowMaster",
                        error: error.body?.message || error.message,
                        opportunity: this.recordId
                    }
                });
            });
    }

    updateSelfServiceStatistic() {
        if (!this.isGuestUser || !this.previousTabStatistic.Id) {
            return;
        }

        const myData = {
            id: this.previousTabStatistic.Id,
            endTime: JSON.stringify(new Date())
        };

        return setSelfServiceStatisticEndTime({ myData })
            .then(() => {})
            .catch((error) => {
                console.error("ERROR", error);

                this.handleLogError({
                    detail: {
                        type: "Internal Error",
                        provider: this.previousTabStatistic.Program__c,
                        tab: this.previousTabStatistic.Tab_Name__c,
                        component: "poe_lwcBuyflowMaster",
                        error: error.body?.message || error.message,
                        opportunity: this.recordId
                    }
                });
            });
    }

    handleLogError(event) {
        logError({ error: event.detail })
            .then(() => {})
            .catch((err) => {
                console.error(`LOGGING ERROR: ${err.body?.message || err.stack}`);
            });
    }

    handleHome(event) {
        event.stopPropagation();
        this.updateSelfServiceStatistic();

        const goBackEvent = new CustomEvent("home", {
            detail: ""
        });
        this.dispatchEvent(goBackEvent);
    }

    handleGetAgentReferralCodes(userId) {
        let myData = {
            userId: userId
        };
        getAgentReferralCodes({ myData })
            .then((response) => {
                const hasCodes = response?.result?.hasCodes;
                if (hasCodes) {
                    this.agentReferralCodes = [...response.result.availableCodes];
                    if (this.shopIdEligible) {
                        this.handleShowShopIdModal();
                    }
                }
            })
            .catch((error) => {
                console.error("ERROR", error);

                this.handleLogError({
                    detail: {
                        type: "Internal Error",
                        provider: this.provider,
                        tab: "Info Tab",
                        component: "poe_lwcBuyflowMaster",
                        error: error.body?.message || error.message,
                        opportunity: this.recordId
                    }
                });
            })
            .finally(() => {
                this.loaderSpinner = false;
            });
    }

    handleSaveOpportunityReferralCode(referralCodeSelected) {
        this.loaderSpinner = true;
        let myData = {
            oppId: this.recordId,
            referralCode: referralCodeSelected.value
        };
        saveOpportunityReferralCode({ myData })
            .then((response) => {
                const event = new ShowToastEvent({
                    title: "Success",
                    variant: "success",
                    message: `Referral Code ${referralCodeSelected.label} added to the Order!`
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                console.error("ERROR", error);

                this.handleLogError({
                    detail: {
                        type: "Internal Error",
                        provider: this.provider,
                        tab: "Info Tab",
                        component: "poe_lwcBuyflowMaster",
                        error: error.body?.message || error.message,
                        opportunity: this.recordId
                    }
                });
            })
            .finally(() => {
                this.loaderSpinner = false;
            });
    }
    handleShowShopIdModal() {
        this.showShopIdModal = !this.showShopIdModal;
    }
    handleShopIdSelection(event) {
        let referralCodeSelected = { ...event?.detail };
        if (referralCodeSelected.value !== "none" && referralCodeSelected.value !== undefined) {
            this.handleSaveOpportunityReferralCode(referralCodeSelected);
        }
        this.handleShowShopIdModal();
    }
}