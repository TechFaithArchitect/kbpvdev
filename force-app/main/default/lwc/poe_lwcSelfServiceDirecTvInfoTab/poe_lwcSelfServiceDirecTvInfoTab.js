import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import chuzo_modalGeneric from "c/chuzo_modalGeneric";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";
import ToastContainer from "lightning/toastContainer";
import getAddressInfo from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveACIPresentation from "@salesforce/apex/InfoTabController.saveACIPresentation";
import getDealerCode from "@salesforce/apex/InfoTabController.getDealerCode";
import updateProbationValue from "@salesforce/apex/InfoTabController.updateOnProbationValue";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import getDTVAddressRegExApex from "@salesforce/apex/InfoTabController.getDTVAddressRegEx";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveAccountInformation from "@salesforce/apex/CreditCheckTabController.saveAccountInformation";
import DTV_Existing_Service_Verbiage from "@salesforce/label/c.DTV_Existing_Service_Verbiage";
import POE_DTV_Address_Regex_ErrorMessage from "@salesforce/label/c.POE_DTV_Address_Regex_ErrorMessage";
import DTV_Pending_Order_Message from "@salesforce/label/c.DTV_Pending_Order_Message";

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
const INTERNAL_ERROR = "Internal Error";

export default class Poe_lwcSelfServiceDirecTvInfoTab extends NavigationMixin(LightningElement) {
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
    showLoaderSpinner;
    showCollateral;
    isExistingCustomer = "false";
    showSuggestedAddressModal = false;
    suggestedAddresses = [];
    suggestedAddressSelected = false;
    partnerOrderNumber;
    NFFL = false;
    engaNFFL = false;
    message;
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

    addressOptions = {
        addressLabel: "Address",
        cityLabel: "City",
        cityPlaceHolder: undefined,
        countryDisabled: true,
        countryLabel: "Country",
        countryPlaceholder: undefined,
        fieldLevelHelp: undefined,
        postalCodeLabel: "Zip Code",
        postalCodePlaceholder: undefined,
        provinceLabel: "State",
        provincePlaceholder: undefined,
        required: true,
        showAddressLookup: true,
        streetLabel: "Street Address",
        streetPlaceholder: undefined,
        addressLine2Label: "Address Line 2",
        addressLine2Placeholder: undefined
    };

    showAddressComponent = false;
    disableNext = true;
    dealerCodeView = true;
    customerView = false;
    addressView = false;

    get notFirstInput() {
        return !this.dealerCodeView;
    }

    get optionsRadio() {
        return [
            { label: "Yes", value: "true" },
            { label: "No", value: "false" }
        ];
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get iconFormUser() {
        return chuzoSiteResources + "/images/icon-user-profile.svg";
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get nextBtnDesktopClass() {
        return `btn-rounded btn-center hide-mobile ${this.disableNext && "btn-disabled"}`;
    }

    get nextBtnMobileClass() {
        return `btn-rounded btn-center ${this.disableNext && "btn-disabled"}`;
    }

    validateInitialInputs() {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        let phonere = /^\d{10}$/;
        if (this.emailAddress !== undefined && this.emailAddress !== "" && !emailre.test(this.emailAddress)) {
            const event = new ShowToastEvent({
                title: "Email Address Validation",
                variant: "error",
                mode: "sticky",
                message: "The preloaded email address has an incorrect format."
            });
            this.dispatchEvent(event);
        }
        if (this.phoneNumber !== undefined && this.phoneNumber !== "" && !phonere.test(this.phoneNumber)) {
            const event = new ShowToastEvent({
                title: "Phone Number Validation",
                variant: "error",
                mode: "sticky",
                message: "The preloaded phone number must be 10 digits."
            });
            this.dispatchEvent(event);
        }
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        this.showLoaderSpinner = true;
        this.firstName = this.clientInfo.contactInfo.firstName;
        this.lastName = this.clientInfo.contactInfo.lastName;
        this.emailAddress = this.clientInfo.contactInfo.email;
        this.phoneNumber = this.clientInfo.contactInfo.phone;
        this.validateInitialInputs();
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.stateOptions.push(option);
        });
        let opt = [];

        if (this.isFSL) {
            this.dealerCode = this.fslDealerCode;
            this.NFFL = true;
            this.dealerOptions = [
                {
                    label: `${this.fslDealerCode} - NFFL`,
                    value: this.fslDealerCode
                }
            ];
            this.getAddressInfoMethod().finally(() => {
                this.parallelCallUserProfile();
            });
        } else if (this.codeFFL === "none" && this.codeNFFL === "none") {
            let myData = {
                Id: this.recordId,
                program: "DirecTV",
                origin: this.origin
            };
            getDealerCode({ myData: myData })
                .then((response) => {
                    let codes = [...response.result.Codes];
                    codes.forEach((item) => {
                        let newOp = {
                            label: `${item.POE_Dealer_Code__c} - ${item.POE_Program_Type__c}`,
                            value: item.POE_Dealer_Code__c
                        };
                        opt.push(newOp);
                    });
                    this.dealerOptions = [...opt];
                    this.getAddressInfoMethod();
                })
                .catch((error) => {
                    this.showLoaderSpinner = false;
                    console.log(error);
                    this.logError(error.body?.message || error.message);
                });
        } else {
            if (this.codeNFFL !== "none") {
                let newOp = {
                    label: `${this.codeNFFL} - NFFL`,
                    value: this.codeNFFL
                };
                opt.push(newOp);
            }
            if (this.codeFFL !== "none") {
                let newOp = {
                    label: `${this.codeFFL} - FFL`,
                    value: this.codeFFL
                };
                opt.push(newOp);
            }

            this.dealerOptions = [...opt];
            this.getAddressInfoMethod();
        }
        this.getDTVAddressRegEx();
    }

    getAddressInfoMethod() {
        let myData = {
            Id: this.recordId,
            Program: "DIRECTV"
        };
        return getAddressInfo({ myData: myData })
            .then((response) => {
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
                this.disableValidation();

                this.showAddressComponent = true;

                let aci = {
                    ContextId: this.recordId
                };
                return saveACIPresentation({ request: JSON.stringify(aci) })
                    .then((response) => {
                        this.showLoaderSpinner = false;
                    })
                    .catch((error) => {
                        this.showLoaderSpinner = false;
                        console.log(error);
                        this.logError(error.body?.message || error.message);
                    });
            })
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    restartAddressId() {
        this.addressId = "";
    }

    handleChange(event) {
        this.suggestedAddressSelected = false;
        switch (event.target.name) {
            case "firstName":
                this.firstName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "middleName":
                this.middleName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "lastName":
                this.lastName =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "phoneNumber":
                this.phoneNumber =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "emailAddress":
                this.emailAddress =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;

            case "address":
                this.restartAddressId();
                this.address =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "apt":
                this.restartAddressId();
                this.apt =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "city":
                this.restartAddressId();
                this.city =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value.trim()
                        : undefined;
                break;
            case "state":
                this.restartAddressId();
                this.state =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                this.stateName =
                    this.state !== undefined ? this.stateOptions.find((e) => e.value == this.state).label : undefined;
                break;
            case "zip":
                this.restartAddressId();
                this.zip =
                    event.target.value !== "" && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case "existingCustomer":
                this.isExistingCustomer = event.target.value === "true" ? event.target.value : "false";
                if (event.target.value === "true") {
                    chuzo_modalGeneric.open({
                        content: {
                            title: "Notice",
                            provider: "directv",
                            body: `<p class="slds-text-heading_small slds-text-align_center">Buyflow allowed only for new customers</p>`,
                            agreeLabel: "Confirm",
                            canClose: true
                        }
                    });
                }
                break;
            case "dealerCode":
                this.dealerCode = event.target.value;
                this.NFFL = this.dealerOptions
                    .filter((item) => item.value === event.target.value)[0]
                    .label.includes("NFFL");
                this.parallelCallUserProfile();
                return;
        }
        this.disableValidation();
    }

    handleAddressChange(event) {
        this.address = event.detail.street != "" ? event.detail.street : undefined;
        this.city = event.detail.city != "" ? event.detail.city : undefined;
        this.apt = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.state = event.detail.province != "" ? event.detail.province : undefined;
        this.zip = event.detail.postalCode != "" ? event.detail.postalCode : undefined;

        this.disableValidation();
    }

    sliceText(text, i) {
        return text.slice(i).toLowerCase();
    }

    makeId(length, numbers) {
        let result = "";
        const characters = numbers ? "0123456789" : "abcdefghijklmnopqrstuvwxyz";
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    parallelCallUserProfile() {
        this.showLoaderSpinner = true;
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
                        chuzo_modalGeneric.open({
                            content: {
                                title: "Notice",
                                provider: "directv",
                                body: this.dealerCodeStatusBody,
                                agreeLabel: "Confirm",
                                canClose: true
                            }
                        });
                        this.dealerStatusStop = true;
                        this.showLoaderSpinner = false;
                        this.disableValidation();
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
                    this.showLoaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: userProfileErrorMessages[0]
                    });
                    this.dealerStatusStop = true;
                    this.disableValidation();
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

                this.disableValidation();
                this.showLoaderSpinner = false;

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
                // Only show an error if both salesFlow callouts failed
                if (salesFlowErrorMessages.length === 2) {
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: salesFlowErrorMessages[0]
                    });
                    this.dispatchEvent(event);
                }
                this.disableValidation();
                this.showLoaderSpinner = false;
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
                this.disableValidation();
                this.showLoaderSpinner = false;

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

    disableValidation() {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        let phonere = /^\d{10}$/;
        const button = this.template.querySelector('[data-id="next"]');
        if (this.dealerCodeView) {
            if (!this.dealerStatusStop && this.dealerCode !== undefined) {
                this.disableNext = false;
            } else {
                this.disableNext = true;
            }
        } else if (this.customerView) {
            if (
                this.firstName !== undefined &&
                this.lastName !== undefined &&
                this.phoneNumber !== undefined &&
                this.emailAddress !== undefined &&
                emailre.test(this.emailAddress) &&
                phonere.test(this.phoneNumber)
            ) {
                this.disableNext = false;
            } else {
                this.disableNext = true;
            }
        } else if (this.addressView) {
            if (
                this.address !== undefined &&
                this.city !== undefined &&
                this.state !== undefined &&
                this.zip !== undefined &&
                this.isExistingCustomer === "false" &&
                this.validateAddressInputs()
            ) {
                this.disableNext = false;
            } else {
                this.disableNext = true;
            }
        }
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

    handleBack() {
        if (this.addressView) {
            this.addressView = false;
            this.customerView = true;
        } else if (this.customerView) {
            this.customerView = false;
            this.dealerCodeView = true;
        }
        this.disableValidation();
    }

    selfServiceReturnToHomePage() {
        const goBackEvent = new CustomEvent("home", {
            detail: "",
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(goBackEvent);
    }

    handleNext() {
        const button = this.template.querySelector('[data-id="next"]');
        if (button.classList.contains("btn-disabled")) {
            return;
        }
        if (this.addressView) {
            this.handleClick();
        } else if (this.customerView) {
            this.customerView = false;
            this.addressView = true;
            this.disableValidation();
        } else {
            this.dealerCodeView = false;
            this.customerView = true;
            this.disableValidation();
        }
    }

    handleClick() {
        this.showLoaderSpinner = true;
        let name;
        if (this.isGuestUser) {
            name = "Self Service Opportunity";
        } else {
            this.updateOnProbationValue();
            switch (this.origin) {
                case "retail":
                    name = "Retail Opportunity";
                    break;
                case "event":
                    name = "Event Opportunity";
                    break;
                case "phonesales":
                    name = "Phone Sales Opportunity";
                    break;
                default:
                    name = "Maps Opportunity";
                    break;
            }
        }

        let info = {
            Maps_Appartment__c: this.apt !== undefined ? this.apt : null,
            Maps_City__c: this.city !== undefined ? this.city : null,
            Maps_Country__c: "United States",
            Maps_PostalCode__c: this.zip !== undefined ? this.zip : null,
            Maps_State__c: this.stateOptions.filter((state) => this.state === state.value)[0].label,
            Maps_Street__c: this.address !== undefined ? this.address : null,
            POE_DTV_Program_Selected__c: this.dealerOptions.filter((item) => item.value === this.dealerCode)[0].label,
            Name: name,
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
                this.searchExistingAccountHandler(info);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    updateOnProbationValue() {
        this.showLoaderSpinner = true;
        let probation = this.probation.stream || this.probation.beam;
        updateProbationValue({ probation: probation })
            .then((response) => {
                this.showLoaderSpinner = true;
            })
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    searchExistingAccountHandler(info) {
        const path = "searchExistingAccount";
        let myData = {
            path,
            ...this.serviceabilityCalloutStream,
            partnerName: "enga-stream",
            phoneNumber: this.phoneNumber,
            address: {
                addressLine1: this.address,
                addressLine2: this.apt !== undefined ? this.apt : "",
                city: this.city,
                state: this.state,
                zipCode: this.zip,
                addressType: "Billing"
            }
        };
        console.log(`Search Existing Account Request`, myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log(`Search Existing Account Response`, result);
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
                    this.showLoaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    if (
                        Array.isArray(result) &&
                        result.length > 0 &&
                        result[0].acct_status.toLowerCase() === "active"
                    ) {
                        const genericErrorMessage = "An existing service is present in this address.";
                        const event = new ShowToastEvent({
                            title: "Existing Service",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                        this.showLoaderSpinner = false;
                    } else if (
                        Array.isArray(result) &&
                        result.length > 0 &&
                        result[0].acct_status.toLowerCase() === "pend"
                    ) {
                        const genericErrorMessage = DTV_Pending_Order_Message;
                        const event = new ShowToastEvent({
                            title: "Pending Service",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                        this.showLoaderSpinner = false;
                    } else {
                        this.parallelAddressCallout(info);
                    }
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
                this.showLoaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
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
                        this.showLoaderSpinner = false;
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

                    // Stop buyflow in any of the remaining scenarios.
                    this.showLoaderSpinner = false;
                    return;
                }

                // If there's any serviceability, continue with the buyflow
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
                            addressLine1: info.Maps_Street__c,
                            addressLine2: this.apt !== undefined && this.apt !== null ? this.apt : "",
                            addressLine2Type: "",
                            city: info.Maps_City__c,
                            state: this.state,
                            county: this.county,
                            country: info.Maps_Country__c,
                            zipCode: info.Maps_PostalCode__c
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
                    this.saveAccountInfo(this.orderInfo);
                } else {
                    const event = new ShowToastEvent({
                        title: "Address Serviceability",
                        variant: "error",
                        mode: "sticky",
                        message: serviceabilityErrorMessage
                    });
                    this.dispatchEvent(event);
                    this.showLoaderSpinner = false;
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
                this.showLoaderSpinner = false;

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

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleSuggestedAddress(event) {
        let response = JSON.parse(JSON.stringify(event.detail));
        this.address = response.addressLine1;
        this.apt = response.addressLine2;
        this.city = response.city;
        this.state = response.state;
        this.zip = response.zip;
        this.addressId = response.addressId;
        this.showSuggestedAddressModal = false;
    }

    saveAccountInfo(orderInfo) {
        let data = {
            accName: this.firstName + " " + this.lastName,
            ContextId: this.recordId,
            recordTypeName: "Person Account",
            consent: false,
            creditCheck: {
                customerDetails: {
                    contactInformation: {
                        firstName: this.firstName,
                        middleName: this.middleName == null || this.middleName == undefined ? "" : this.middleName,
                        lastName: this.lastName,
                        email: this.emailAddress,
                        contactPhone: this.phoneNumber
                    }
                },
                accountDetails: {
                    billingCreditCheckAddress: {
                        billingAddress: this.address,
                        billingAptNumber: this.apt,
                        billingCity: this.city,
                        billingState: this.state,
                        billingStateName: this.stateName,
                        billingZip: this.zip
                    },
                    shippingServiceAddresss: {
                        shippingAddress: this.address,
                        shippingAptNumber: this.apt,
                        shippingCity: this.city,
                        shippingZip: this.zip,
                        shippingState: this.state,
                        shippingStateName: this.stateName
                    }
                }
            }
        };
        console.log("Save Account Information Request", data);

        saveAccountInformation({ myData: data })
            .then((response) => {
                console.log("Save Account Information Response", response);
                if (
                    response.result.hasOwnProperty("result") &&
                    response.result.result.hasOwnProperty("errors") &&
                    response.result.result.errors.hasOwnProperty("DRSaveClientContact") &&
                    response.result.result.errors.DRSaveClientContact.hasOwnProperty("0:0")
                ) {
                    this.showLoaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: "Error",
                        mode: "sticky",
                        variant: "error",
                        message: "The Phone or Address information is already associated with another customer"
                    });
                    this.dispatchEvent(event);
                } else {
                    let info = {
                        orderInfo,
                        accountId: response.result.Account.Id,
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

                    this.showLoaderSpinner = false;
                    info.stream.multiAddress = this.suggestedAddressSelected;
                    const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                        detail: { ...info }
                    });
                    this.dispatchEvent(sendCheckServiceabilityEvent);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }
    get isCallCenterOrigin() {
        return this.origin == "phonesales";
    }

    get isNonCallCenterOrigin() {
        return !this.isCallCenterOrigin;
    }

    getDTVAddressRegEx() {
        this.loaderSpinner = true;

        getDTVAddressRegExApex()
            .then((response) => {
                this.dtvAddressRegEx = new RegExp(response.result.dtvAddressRegEx);
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.handleLogError({
                    error: error.body?.message || error.message,
                    type: INTERNAL_ERROR
                });
                this.loaderSpinner = false;
            });
    }

    validateAddressInputs() {
        const isValidAddress =
            this.dtvAddressRegEx.test(this.address) &&
            this.dtvAddressRegEx.test(this.apt) &&
            this.dtvAddressRegEx.test(this.city);
        if (!isValidAddress) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Invalid Address",
                    variant: "error",
                    mode: "sticky",
                    message: POE_DTV_Address_Regex_ErrorMessage
                })
            );
        }

        return isValidAddress;
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
}