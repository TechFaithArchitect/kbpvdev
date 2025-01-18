import { LightningElement, api } from "lwc";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import DTV_Existing_Service_Verbiage from "@salesforce/label/c.DTV_Existing_Service_Verbiage";
import POE_DTV_Address_Regex_ErrorMessage from "@salesforce/label/c.POE_DTV_Address_Regex_ErrorMessage";
import getAddressInfo from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveACIPresentation from "@salesforce/apex/InfoTabController.saveACIPresentation";
import getDealerCode from "@salesforce/apex/InfoTabController.getDealerCode";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import DISPOSITION_OUTCOME_ERROR_MESSAGE from "@salesforce/label/c.Self_Service_Disposition_Outcome_Error_Message";

const stateNames = [
    { name: "Alabama", abbrev: "AL" },
    { name: "Alaska", abbrev: "AK" },
    { name: "Arizona", abbrev: "AZ" },
    { name: "Arkansas", abbrev: "AR" },
    { name: "California", abbrev: "CA" },
    { name: "Colorado", abbrev: "CO" },
    { name: "Connecticut", abbrev: "CT" },
    { name: "Delaware", abbrev: "DE" },
    { name: "District of Columbia", abbrev: "DC" },
    { name: "Florida", abbrev: "FL" },
    { name: "Georgia", abbrev: "GA" },
    { name: "Hawaii", abbrev: "HI" },
    { name: "Idaho", abbrev: "ID" },
    { name: "Illinois", abbrev: "IL" },
    { name: "Indiana", abbrev: "IN" },
    { name: "Iowa", abbrev: "IA" },
    { name: "Kansas", abbrev: "KS" },
    { name: "Kentucky", abbrev: "KY" },
    { name: "Louisiana", abbrev: "LA" },
    { name: "Maine", abbrev: "ME" },
    { name: "Maryland", abbrev: "MD" },
    { name: "Massachusetts", abbrev: "MA" },
    { name: "Michigan", abbrev: "MI" },
    { name: "Minnesota", abbrev: "MN" },
    { name: "Mississippi", abbrev: "MS" },
    { name: "Missouri", abbrev: "MO" },
    { name: "Montana", abbrev: "MT" },
    { name: "Nebraska", abbrev: "NE" },
    { name: "Nevada", abbrev: "NV" },
    { name: "New Hampshire", abbrev: "NH" },
    { name: "New Jersey", abbrev: "NJ" },
    { name: "New Mexico", abbrev: "NM" },
    { name: "New York", abbrev: "NY" },
    { name: "North Carolina", abbrev: "NC" },
    { name: "North Dakota", abbrev: "ND" },
    { name: "Ohio", abbrev: "OH" },
    { name: "Oklahoma", abbrev: "OK" },
    { name: "Oregon", abbrev: "OR" },
    { name: "Pennsylvania", abbrev: "PA" },
    { name: "Rhode Island", abbrev: "RI" },
    { name: "South Carolina", abbrev: "SC" },
    { name: "South Dakota", abbrev: "SD" },
    { name: "Tennessee", abbrev: "TN" },
    { name: "Texas", abbrev: "TX" },
    { name: "Utah", abbrev: "UT" },
    { name: "Vermont", abbrev: "VT" },
    { name: "Virginia", abbrev: "VA" },
    { name: "Washington", abbrev: "WA" },
    { name: "West Virginia", abbrev: "WV" },
    { name: "Wisconsin", abbrev: "WI" },
    { name: "Wyoming", abbrev: "WY" }
];

const customerType = "RESIDENTIAL";
export default class Poe_lwcSelfServiceDirecTvCustomizationsOne extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api origin;
    @api clientInfo;
    @api returnUrl;
    @api codeNFFL;
    @api codeFFL;
    @api isGuestUser;
    @api isFSL;
    @api fslDealerCode;
    @api chuzoOrderInfo;
    @api providerStyle;
    @api referralCodeData;

    dealerStatusStop = false;
    noCompleteInfo = true;
    firstName;
    middleName;
    lastName;
    phoneNumber;
    emailAddress;
    address;
    apt;
    city;
    county;
    state;
    stateName;
    stateOptions = [];
    dealerOptions = [];
    zip;
    loaderSpinner;
    showCollateral;
    isExistingCustomer = "false";
    showModal = false;
    showSuggestedAddressModal = false;
    suggestedAddresses = [];
    suggestedAddressSelected = false;
    partnerOrderNumber;
    NFFL = false;
    engaNFFL = false;
    message;
    showMessageModal = false;
    orderInfo;
    disclosureAgreementLabel = "I have read the above disclosures to the customer, and the customer agreed";
    dealerCode;
    serviceabilityCallout = {};
    serviceabilityCalloutStream = {};
    dtv = {};
    atv = {};
    addressId = "";
    probation = {
        stream: false,
        beam: false
    };
    labels = {
        DTV_Existing_Service_Verbiage,
        POE_DTV_Address_Regex_ErrorMessage
    };
    dtvAddressRegEx;
    showDealerCodeStatusModal = false;
    dealerCodeStatusBody = "";
    typeSelected;
    streamAvailable = false;
    beamAvailable = false;
    orderData = {};
    streamData = {};
    beamData = {};
    isDtv = false;
    disableNext = true;
    title;

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconExistConnection() {
        return chuzoSiteResources + "/images/icon-exist-connection.svg";
    }

    get iconConnectionSatellite() {
        return chuzoSiteResources + "/images/icon-connection-satellite.svg";
    }

    get iconConnectionPreference() {
        return chuzoSiteResources + "/images/icon-connection-preference.svg";
    }

    get nextBtnDesktopClass() {
        return `btn-rounded btn-center hide-mobile ${this.disableNext && "btn-disabled"}`;
    }

    get nextBtnMobileClass() {
        return `btn-rounded btn-center ${this.disableNext && "btn-disabled"}`;
    }

    changeViewToService() {
        if (this.isGuestUser) {
            const goBackEvent = new CustomEvent("home", {
                detail: "",
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(goBackEvent);
        } else {
            const goBackEvent = new CustomEvent("back");
            this.dispatchEvent(goBackEvent);
        }
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        this.title = this.isGuestUser
            ? "How Do You Want To Connect To DIRECTV?"
            : "Preferred DIRECTV Connection Method";
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.stateOptions.push(option);
        });
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
            this.handleDealerCode();
        } else {
            this.orderInfo = {
                ...this.chuzoOrderInfo.orderInfo,
                stream: { ...this.chuzoOrderInfo.stream },
                beam: { ...this.chuzoOrderInfo.beam }
            };
            this.streamAvailable = this.orderInfo.atv.serviceAvailability && !this.chuzoOrderInfo.probation.stream;
            this.beamAvailable = this.orderInfo.dtv.serviceAvailability && !this.chuzoOrderInfo.probation.stream;
        }
    }

    handleDealerCode() {
        this.loaderSpinner = true;
        let myData = {
            Id: this.recordId,
            program: "DirecTV",
            origin: this.origin
        };
        getDealerCode({ myData: myData })
            .then((response) => {
                console.log("Codes Response", response);
                let codes = [...response.result.Codes];
                let opt = [];
                codes.forEach((item) => {
                    if (item.POE_Program_Type__c === "FFL") {
                        let newOp = {
                            label: `${item.POE_Dealer_Code__c} - ${item.POE_Program_Type__c}`,
                            value: item.POE_Dealer_Code__c
                        };
                        opt.push(newOp);
                    }
                });
                this.dealerCode = opt[0].value;
                this.dealerOptions = [...opt];
                this.getAddressInfoMethod();
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    getAddressInfoMethod() {
        let myData = {
            Id: this.recordId,
            Program: "DIRECTV"
        };
        getAddressInfo({ myData: myData })
            .then((response) => {
                console.log("Get Address Info Response", response);
                let result = response.result;
                let opportunity = result.Opportunity;
                if (typeof opportunity === "object") {
                    this.city = opportunity.hasOwnProperty("Maps_City__c") ? opportunity.Maps_City__c : undefined;
                    this.address = opportunity.hasOwnProperty("Maps_Street__c")
                        ? opportunity.Maps_Street__c
                        : undefined;
                    this.apt = opportunity.hasOwnProperty("Maps_Appartment__c")
                        ? opportunity.Maps_Appartment__c != "" && !opportunity.Maps_Appartment__c.includes("null")
                            ? opportunity.Maps_Appartment__c
                            : undefined
                        : undefined;
                    let stateLong = opportunity.hasOwnProperty("Maps_State__c") ? opportunity.Maps_State__c : undefined;
                    this.state =
                        stateLong !== undefined
                            ? this.stateOptions.filter(
                                  (state) => stateLong === state.label || stateLong === state.value
                              )[0].value
                            : undefined;
                    this.stateName =
                        stateLong !== undefined
                            ? this.stateOptions.filter(
                                  (state) => stateLong === state.label || stateLong === state.value
                              )[0].label
                            : undefined;
                    this.zip = opportunity.hasOwnProperty("Maps_PostalCode__c")
                        ? opportunity.Maps_PostalCode__c
                        : undefined;
                }
                let aci = {
                    ContextId: this.recordId
                };
                saveACIPresentation({ request: JSON.stringify(aci) })
                    .then((response) => {
                        this.parallelCallUserProfile();
                    })
                    .catch((error) => {
                        this.loaderSpinner = false;
                        console.log(error);
                        this.logError(error.body?.message || error.message);
                    });
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    parallelCallUserProfile() {
        this.dealerStatusStop = false;
        let apiResponse;
        let request;
        Promise.all([this.callUserProfile(true), this.callUserProfile(false)])
            .then((responses) => {
                const userProfileErrorMessages = [];
                for (const { response, myData, beam } of responses) {
                    apiResponse = response;
                    request = myData;
                    const result = JSON.parse(response);
                    console.log(`${beam ? "Beam" : "Stream"} User Profile Response`, result);
                    if (result?.userProfile?.user_permissions) {
                        this.dealerCodeStatusBody = result.userProfile?.user_permissions;
                        this.showDealerCodeStatusModal = true;
                        this.dealerStatusStop = true;
                        this.loaderSpinner = false;
                        break;
                    } else {
                        if (beam) {
                            this.serviceabilityCallout = {};
                        } else {
                            this.serviceabilityCalloutStream = {};
                        }

                        if (result.hasOwnProperty("error")) {
                            const errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                                result.error.hasOwnProperty("provider")
                                    ? result.error.provider.message.hasOwnProperty("message")
                                        ? result.error.provider.message.message
                                        : result.error.provider.message.hasOwnProperty("errorDescription")
                                        ? result.error.provider.message.errorDescription
                                        : result.error.provider.message
                                    : result.error.message
                            }.`;

                            this.logError(
                                `${errorMessage}\nAPI Response: ${response}`,
                                request,
                                request.path,
                                "API Error"
                            );
                            userProfileErrorMessages.push(errorMessage);
                        }

                        if (
                            Array.isArray(result?.userProfile?.userLocations) &&
                            result?.userProfile?.userLocations.length > 0
                        ) {
                            const callout = {
                                addressOverride: false,
                                correlationId: result.correlationId,
                                dealerCorpId: result.userProfile.userLocations[0].corpId,
                                masterDealerId: result.userProfile.userLocations[0].masterDealerId,
                                dealerId: result.userProfile.userLocations[0].dealerID,
                                dealerAgentId: result.userProfile.userLocations[0].hasOwnProperty("dealerCode")
                                    ? result.userProfile.userLocations[0].dealerCode
                                    : result.userProfile.userLocations[0].masterDealerId,
                                dealerLocation: result.userProfile.userLocations[0].hasOwnProperty("location")
                                    ? result.userProfile.userLocations[0].location
                                    : result.userProfile.userLocations[0].locationId,
                                locationId: result.userProfile.userLocations[0].locationId,
                                dealerChainNumber: result.userProfile.userLocations[0].dealerChainNumber,
                                opusStoreId: result.userProfile.userLocations[0].location,
                                locationTypeId: result.userProfile.userLocations[0].locationTypeId,
                                channel: result.userProfile.userDetails.channel,
                                user: result.userProfile.userDetails.hasOwnProperty("user")
                                    ? result.userProfile.userDetails.user
                                    : "",
                                subChannel: result.userProfile.userDetails.hasOwnProperty("subChannel")
                                    ? result.userProfile.userDetails.subChannel
                                    : "",
                                corpIdGroup: result.userProfile.userLocations[0].corpIdGroup,
                                ispBundleBill: result.userProfile.userLocations[0].hasOwnProperty("ispSimplifiedBill")
                                    ? result.userProfile.userLocations[0].ispSimplifiedBill
                                    : "N",
                                marketingSourceCode: result.userProfile.userLocations[0].marketingSourceCode
                            };

                            if (callout.ispBundleBill === "Y") {
                                callout.ispPartnerBAN = result.userProfile.userLocations[0].ispPartnerBAN;
                                callout.locationName = result.userProfile.userLocations[0].locationName;
                            }

                            if (beam) {
                                this.engaNFFL =
                                    result.userProfile.userLocations[0].fullfilmentType.toLowerCase() !== "true";
                                callout.systemCode = this.engaNFFL ? "ENGA-CHUZO-NFF" : "ENGA-CHUZO";
                                callout.welcomeLetterCode = result.userProfile.userLocations[0].welcomeLetterCode;

                                this.serviceabilityCallout = callout;
                                this.probation.beam =
                                    result.userProfile.userLocations[0].dealerOnProbation.toLowerCase() === "y";
                            } else {
                                callout.systemCode = "ENGA-CHUZO";
                                this.serviceabilityCalloutStream = callout;
                                this.probation.stream =
                                    result.userProfile.userLocations[0].dealerOnProbation.toLowerCase() === "y";
                            }
                        }
                    }
                }
                if (userProfileErrorMessages.length === 2) {
                    this.loaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: userProfileErrorMessages[0]
                    });
                    this.dealerStatusStop = true;
                    this.dispatchEvent(event);
                } else if (!this.dealerStatusStop) {
                    this.parallelCallSalesFlow();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");

                this.serviceabilityCallout = {};
                this.serviceabilityCalloutStream = {};
                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;

                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    callUserProfile(beam) {
        const myData = {
            path: "userProfile",
            systemCode: "ENGA-CHUZO",
            partnerName: beam ? "enga" : "enga-stream",
            dealerCode: this.dealerCode
        };

        console.log(`${beam ? "Beam" : "Stream"} User Profile Request`, myData);
        return callEndpoint({ inputMap: myData }).then((response) => {
            return {
                response,
                myData,
                beam
            };
        });
    }

    parallelCallSalesFlow() {
        let apiResponse;
        let request;
        Promise.all([this.callSalesFlow(true), this.callSalesFlow(false)])
            .then((responses) => {
                const salesFlowErrorMessages = [];
                for (const { response, myData, beam } of responses) {
                    apiResponse = response;
                    request = myData;

                    const result = JSON.parse(response);
                    console.log(`${beam ? "Beam" : "Stream"} Sales Flow Response`, result);

                    if (result.hasOwnProperty("error")) {
                        let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                            result.error.hasOwnProperty("provider")
                                ? result.error.provider.message.hasOwnProperty("message")
                                    ? result.error.provider.message.message
                                    : result.error.provider.message.hasOwnProperty("errorDescription")
                                    ? result.error.provider.message.errorDescription
                                    : result.error.provider.message
                                : result.error.message
                        }.`;
                        this.logError(`${errorMessage}\nAPI Response: ${response}`, request, request.path, "API Error");
                        salesFlowErrorMessages.push(errorMessage);
                    }

                    if (beam) {
                        this.serviceabilityCallout = {
                            ...this.serviceabilityCallout,
                            uuid: result.salesFlow.uuid,
                            sid: result.salesFlow.sid,
                            orderNumber: result.cartDetails.cartId
                        };
                    } else {
                        this.serviceabilityCalloutStream = {
                            ...this.serviceabilityCalloutStream,
                            uuid: result.salesFlow.uuid,
                            sid: result.salesFlow.sid,
                            orderNumber: result.salesFlow.uuid
                        };
                    }
                }
                if (salesFlowErrorMessages.length === 2) {
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: salesFlowErrorMessages[0]
                    });
                    this.dispatchEvent(event);
                } else {
                    this.saveOpportunityInformation();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");

                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;

                if (apiResponse) {
                    this.logError(
                        `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                        request,
                        request.path,
                        "API Error"
                    );
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    callSalesFlow(beam) {
        let myData = {
            path: "salesFlow",
            partnerName: beam ? "enga" : "enga-stream",
            dealerCode: this.dealerCode
        };

        if (beam) {
            myData.cartIdInitialization = true;
            myData = { ...myData, ...this.serviceabilityCallout };
        } else {
            myData = { ...myData, ...this.serviceabilityCalloutStream };
        }

        console.log(`${beam ? "Beam" : "Stream"} Sales Flow Request`, myData);
        return callEndpoint({ inputMap: myData })
            .then((response) => {
                return {
                    response,
                    myData,
                    beam
                };
            })
            .catch((error) => {
                if (beam) {
                    this.serviceabilityCallout = {};
                } else {
                    this.serviceabilityCalloutStream = {};
                }

                throw error;
            });
    }

    saveOpportunityInformation() {
        let info = {
            Maps_Appartment__c: this.apt !== undefined ? this.apt : null,
            Maps_City__c: this.city !== undefined ? this.city : null,
            Maps_Country__c: "United States",
            Maps_PostalCode__c: this.zip !== undefined ? this.zip : null,
            Maps_State__c: this.stateName,
            Maps_Street__c: this.address !== undefined ? this.address : null,
            POE_DTV_Program_Selected__c: this.dealerOptions.filter((item) => item.value === this.dealerCode)[0].label,
            Name: "Self Service Opportunity",
            StageName: "DM",
            Id: this.recordId !== undefined ? this.recordId : null,
            referralCodeId: this.referralCodeData?.Id || this.referralCodeData?.referralCodeId
        };
        let myData = {
            opportunity: info,
            origin: this.origin,
            contact: false
        };
        console.log("Save Opportunity Information", myData);
        saveOpportunityAddressInformation({ myData: myData })
            .then((response) => {
                console.log(response);
                this.parallelAddressCallout(info);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    parallelAddressCallout(info) {
        let apiResponse;
        let request;
        Promise.all([this.engaAddressCallout(true), this.engaAddressCallout(false)])
            .then((responses) => {
                let serviceabilityErrorMessage;
                for (const { response, myData, beam } of responses) {
                    apiResponse = response;
                    request = myData;
                    const result = JSON.parse(response);
                    console.log(`${beam ? "Beam" : "Stream"} Serviceability Response`, result);
                    if (beam) {
                        this.dtv = result;
                    } else {
                        this.atv = result;
                    }

                    const hasSuggestedAddress =
                        result.hasOwnProperty("closeMatchAddress") &&
                        Array.isArray(result.closeMatchAddress) &&
                        result.closeMatchAddress.length > 0;

                    if (result.hasOwnProperty("error")) {
                        let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                            result.error.hasOwnProperty("provider")
                                ? result.error.provider.message.hasOwnProperty("message")
                                    ? result.error.provider.message.message
                                    : result.error.provider.message.hasOwnProperty("errorDescription")
                                    ? result.error.provider.message.errorDescription
                                    : result.error.provider.message
                                : result.error.message
                        }.`;
                        const event = new ShowToastEvent({
                            title: "Serviceability Callout Error",
                            variant: "error",
                            mode: "sticky",
                            message: errorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(`${errorMessage}\nAPI Response: ${response}`, request, request.path, "API Error");
                        this.loaderSpinner = false;
                        return;
                    }

                    if (result.serviceAvailability) {
                        if (beam) {
                            this.serviceabilityCallout.wiringType = result.hasOwnProperty("wiringSchema")
                                ? result.wiringSchema
                                : "";
                        } else {
                            this.serviceabilityCalloutStream.wiringType = result.hasOwnProperty("wiringSchema")
                                ? result.wiringSchema
                                : "";
                        }
                        this.county = result.addressFeatures.countyFIPScode;
                        continue;
                    }

                    if (hasSuggestedAddress) {
                        this.suggestedAddresses = [...result.closeMatchAddress];
                        this.suggestedAddressSelected = true;
                        this.showSuggestedAddressModal = true;
                    } else {
                        serviceabilityErrorMessage = result.message;
                        this.logError(
                            `${serviceabilityErrorMessage}\nAPI Response: ${response}`,
                            request,
                            request.path,
                            "API Error"
                        );
                        continue;
                    }
                    this.loaderSpinner = false;
                    return;
                }
                if (this.atv.serviceAvailability || this.dtv.serviceAvailability) {
                    if (
                        (this.atv.availabilityStatus === "EXISTINGSERVICES" &&
                            this.atv.existingServices.dtvServiceExisting) ||
                        (this.dtv.availabilityStatus === "EXISTINGSERVICES" &&
                            this.dtv.existingServices.dtvServiceExisting)
                    ) {
                        const event = new ShowToastEvent({
                            title: "Warning",
                            variant: "warning",
                            mode: "sticky",
                            message: this.labels.DTV_Existing_Service_Verbiage
                        });
                        this.dispatchEvent(event);
                    }
                    this.orderInfo = {
                        address: {
                            addressLine1: this.address,
                            addressLine2: this.apt !== undefined && this.apt !== null ? this.apt : "",
                            addressLine2Type: "",
                            city: this.city,
                            state: this.state,
                            county: this.county,
                            country: this.country,
                            zipCode: this.zip
                        },
                        customer: {
                            firstName: this.firstName !== undefined ? this.firstName : "",
                            middleName: this.middleName !== undefined ? this.middleName : "",
                            lastName: this.lastName !== undefined ? this.lastName : "",
                            emailAddress: this.emailAddress !== undefined ? this.emailAddress : "",
                            phoneNumber: this.phoneNumber !== undefined ? this.phoneNumber : ""
                        },
                        dealerCode: this.dealerCode,
                        customerType: customerType,
                        dtv: this.dtv,
                        atv: this.atv
                    };
                    let info = {
                        ...this.orderInfo,
                        accountId: "",
                        address: {
                            addressLine1: this.address,
                            addressLine2: this.apt,
                            city: this.city,
                            state: this.state,
                            zipCode: this.zip,
                            county: this.county
                        },
                        NFFL: this.engaNFFL,
                        dealerCode: this.dealerCode,
                        stream: {
                            ...this.serviceabilityCalloutStream
                        },
                        beam: {
                            ...this.serviceabilityCallout
                        },
                        probation: { ...this.probation }
                    };

                    this.loaderSpinner = false;
                    info.stream.multiAddress = this.suggestedAddressSelected;
                    const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                        detail: { ...info }
                    });
                    this.orderInfo = { ...info };
                    this.dispatchEvent(sendCheckServiceabilityEvent);
                    this.streamAvailable = this.orderInfo.atv.serviceAvailability && !this.orderInfo.probation.stream;
                    this.beamAvailable = this.orderInfo.dtv.serviceAvailability && !this.orderInfo.probation.stream;
                } else {
                    const event = new ShowToastEvent({
                        title: "Address Serviceability",
                        variant: "error",
                        mode: "sticky",
                        message: DISPOSITION_OUTCOME_ERROR_MESSAGE
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");

                const genericErrorMessage =
                    "The request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;

                if (apiResponse) {
                    this.logError(
                        `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                        request,
                        request.path,
                        "API Error"
                    );
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    engaAddressCallout(beam) {
        let myData = {
            path: "serviceAbilities",
            partnerName: beam ? "enga" : "enga-stream",
            address: {
                addressLine1: this.address,
                addressLine2: this.apt !== undefined ? this.apt : "",
                city: this.city,
                state: this.state,
                zipCode: this.zip
            }
        };

        if (beam) {
            myData = { ...myData, ...this.serviceabilityCallout };
        } else {
            myData = { ...myData, ...this.serviceabilityCalloutStream };
        }

        if (this.addressId !== "") {
            myData.addressId = this.addressId;
        }

        console.log(`${beam ? "Beam" : "Stream"} Serviceability Request`, myData);
        return callEndpoint({ inputMap: myData }).then((response) => {
            return {
                response,
                myData,
                beam
            };
        });
    }

    handleSuggestedAddress(event) {
        this.loaderSpinner = true;
        let response = JSON.parse(JSON.stringify(event.detail));
        this.address = response.addressLine1;
        this.apt = response.addressLine2;
        this.city = response.city;
        this.state = response.state;
        this.zip = response.zip;
        this.addressId = response.addressId;
        this.showSuggestedAddressModal = false;
        this.saveOpportunityInformation();
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Info",
            component: "poe_lwcBuyflowDirecTvEngaInfoTab",
            error: errorMessage ? JSON.stringify(errorMessage) : errorMessage
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
            tab: "Info"
        };
        this.dispatchEvent(event);
    }

    handleType(event) {
        if (event.target.dataset.id !== undefined) {
            this.typeSelected =
                event.target.dataset.id === "stream" || event.target.dataset.id === "stream-container"
                    ? "stream"
                    : "beam";
            let toAddSelected = event.target.dataset.id === "stream" ? "stream-container" : "beam-container";
            let toRemoveSelected = event.target.dataset.id === "stream" ? "beam-container" : "stream-container";
            let selectedCard = this.template.querySelector(`[data-id="${toAddSelected}"]`);
            let notSelectedCard = this.template.querySelector(`[data-id="${toRemoveSelected}"]`);
            selectedCard.classList.add("focus");
            if (notSelectedCard.classList.contains("focus")) {
                notSelectedCard.classList.remove("focus");
            }
        }
        this.disableNext = this.typeSelected === undefined;
    }

    handleNext() {
        this.loaderSpinner = true;
        this.orderData = { ...this.orderInfo };
        this.streamData = {
            ...this.orderInfo.stream,
            NFFL: this.orderInfo.NFFL,
            address: { ...this.orderData.address }
        };
        this.beamData = {
            ...this.orderInfo.beam,
            NFFL: this.orderInfo.NFFL,
            address: { ...this.orderData.address }
        };
        this.isDtv = this.typeSelected === "beam";
        if (this.isDtv) {
            this.handleENGAProductCallout();
        } else {
            this.handleENGAStreamProductCallout();
        }
    }

    handleENGAStreamProductCallout() {
        const path = "products/enga-stream";
        let myData = {
            ...this.streamData,
            systemCode: "ENGA-CHUZO",
            partnerName: "enga-stream",
            orderMod: false,
            billingSystem: "EVERGENT",
            treatmentCode: "A001",
            customerEligibility: {
                zipCode: this.orderInfo.address.zipCode,
                county: this.orderInfo.address.county
            },
            offerProductFamily: ["OTT"],
            offerActionType: ["Acquisition"],
            contractIndicator: ["TAZCONTRACT"],
            offerProductTypes: ["video-plan"],
            channelEligibility: {
                salesChannel: this.streamData.channel,
                salesSubChannel: this.streamData.subChannel,
                locationID: this.streamData.locationId,
                locationTypeID: this.streamData.locationTypeId,
                dealerCode: this.orderInfo.dealerCode,
                directIntegrationPartnerName: "ENGA-CHUZO"
            }
        };
        this.streamData = {
            ...this.streamData,
            ...myData
        };
        myData.path = path;
        delete myData.customer;
        console.log("Internet Products Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Internet Products Response", result);
                this.serviceabilityCallout = {};
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    const viewTwoEvent = new CustomEvent("next", {
                        detail: {
                            stream: true,
                            orderInfo: this.streamData,
                            ...result
                        }
                    });
                    this.dispatchEvent(viewTwoEvent);
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The Product request could not be made correctly to the server. Please, try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    handleENGAProductCallout() {
        const path = "products/enga";
        let myData = {
            partnerName: "enga",
            NFFL: this.orderInfo.NFFL,
            ...this.orderData,
            ...this.beamData,
            orderMod: false,
            billingSystem: "STMS",
            treatmentCode: "A001",
            customerContext: {
                serviceAddress: {
                    addressLine1: this.orderData.address.addressLine1,
                    addressLine2: this.orderData.address.addressLine2,
                    city: this.orderData.address.city,
                    state: this.orderData.address.state,
                    zipCode: this.orderData.address.zipCode
                },
                businessSegment: "REG",
                accountStatus: "PEND"
            },
            channelEligibility: {
                opusChannel: this.beamData.channel.toLowerCase(),
                opusStoreId: this.beamData.opusStoreId,
                salesChannel: this.beamData.channel,
                salesSubChannel: this.beamData.subChannel,
                locationId: this.beamData.locationId,
                locationTypeId: this.beamData.locationTypeId,
                dealerCode: this.orderInfo.dealerCode,
                directIntegrationPartnerName: ""
            },
            customerEligibility: {
                zipCode: this.orderInfo.address.zipCode,
                county: this.orderInfo.address.county
            },
            offerProductFamily: ["satellite"],
            offerActionType: ["Acquisition"],
            contractIndicator: ["non-contract"],
            offerProductTypes: ["video-plan"]
        };

        this.beamData = { ...this.beamData, ...myData };
        delete myData.customer;
        myData.path = path;
        console.log("Satellite Products Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Satellite Products Response", result);
                this.serviceabilityCallout = {};
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    const viewTwoEvent = new CustomEvent("next", {
                        detail: {
                            stream: false,
                            orderInfo: this.beamData,
                            ...result
                        }
                    });
                    this.dispatchEvent(viewTwoEvent);
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The Product request could not be made correctly to the server. Please, try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Products",
            component: "poe_lwcSelfServiceDirecTvCustomizationsOne",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }
}