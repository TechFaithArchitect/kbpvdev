import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import affiliateId from "@salesforce/label/c.spectrumAffiliateId";
import getDealerCode from "@salesforce/apex/InfoTabController.getDealerCode";
import agentId from "@salesforce/label/c.spectrumAgentId";
import getAddressInfo from "@salesforce/apex/InfoTabController.getAddressInfo";
import saveACIPresentation from "@salesforce/apex/InfoTabController.saveACIPresentation";
import saveOpportunityAddressInformation from "@salesforce/apex/InfoTabController.saveOpportunityAddressInformation";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getCharterInformation from "@salesforce/apex/InfoTabController.getCharterInformation";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import ADDRESS_FIELD from "@salesforce/label/c.Address_Field_Label";
import CITY_FIELD from "@salesforce/label/c.City_Field_Label";
import COUNTRY_FIELD from "@salesforce/label/c.Country_Field_Label";
import ZIP_FIELD from "@salesforce/label/c.Zip_Field_Label";
import STATE_FIELD from "@salesforce/label/c.State_Field_Label";
import STREET_ADDRESS_FIELD from "@salesforce/label/c.Street_Address_Field_Label";
import ADDRESS_LINE_2_FIELD from "@salesforce/label/c.Address_Line_2_Field_Label";
import ALABAMA from "@salesforce/label/c.Alabama";
import ALASKA from "@salesforce/label/c.Alaska";
import ARIZONA from "@salesforce/label/c.Arizona";
import ARKANSAS from "@salesforce/label/c.Arkansas";
import CALIFORNIA from "@salesforce/label/c.California";
import COLORADO from "@salesforce/label/c.Colorado";
import CONNECTICUT from "@salesforce/label/c.Connecticut";
import DELAWARE from "@salesforce/label/c.Delaware";
import DISTRICT_OF_COLUMBIA from "@salesforce/label/c.District_of_Columbia";
import FLORIDA from "@salesforce/label/c.Florida";
import GEORGIA from "@salesforce/label/c.Georgia";
import HAWAII from "@salesforce/label/c.Hawaii";
import IDAHO from "@salesforce/label/c.Idaho";
import ILLINOIS from "@salesforce/label/c.Illinois";
import INDIANA from "@salesforce/label/c.Indiana";
import IOWA from "@salesforce/label/c.Iowa";
import KANSAS from "@salesforce/label/c.Kansas";
import KENTUCKY from "@salesforce/label/c.Kentucky";
import LOUISIANA from "@salesforce/label/c.Louisiana";
import MAINE from "@salesforce/label/c.Maine";
import MARYLAND from "@salesforce/label/c.Maryland";
import MASSACHUSETTS from "@salesforce/label/c.Massachusetts";
import MICHIGAN from "@salesforce/label/c.Michigan";
import MINNESOTA from "@salesforce/label/c.Minnesota";
import MISSISSIPPI from "@salesforce/label/c.Mississippi";
import MISSOURI from "@salesforce/label/c.Missouri";
import MONTANA from "@salesforce/label/c.Montana";
import NEBRASKA from "@salesforce/label/c.Nebraska";
import NEVADA from "@salesforce/label/c.Nevada";
import NEW_HAMPSHIRE from "@salesforce/label/c.New_Hampshire";
import NEW_JERSEY from "@salesforce/label/c.New_Jersey";
import NEW_MEXICO from "@salesforce/label/c.New_Mexico";
import NEW_YORK from "@salesforce/label/c.New_York";
import NORTH_CAROLINA from "@salesforce/label/c.North_Carolina";
import NORTH_DAKOTA from "@salesforce/label/c.North_Dakota";
import OHIO from "@salesforce/label/c.Ohio";
import OKLAHOMA from "@salesforce/label/c.Oklahoma";
import OREGON from "@salesforce/label/c.Oregon";
import PENNSYLVANIA from "@salesforce/label/c.Pennsylvania";
import RHODE_ISLAND from "@salesforce/label/c.Rhode_Island";
import SOUTH_CAROLINA from "@salesforce/label/c.South_Carolina";
import SOUTH_DAKOTA from "@salesforce/label/c.South_Dakota";
import TENNESSEE from "@salesforce/label/c.Tennessee";
import TEXAS from "@salesforce/label/c.Texas";
import UTAH from "@salesforce/label/c.Utah";
import VERMONT from "@salesforce/label/c.Vermont";
import VIRGINA from "@salesforce/label/c.Virginia";
import WASHINGTON from "@salesforce/label/c.Washington";
import WEST_VIRGINIA from "@salesforce/label/c.West_Virginia";
import WISCONSIN from "@salesforce/label/c.Wisconsin";
import WYOMING from "@salesforce/label/c.Wyoming";
import AL from "@salesforce/label/c.AL";
import AK from "@salesforce/label/c.AK";
import AZ from "@salesforce/label/c.AZ";
import AR from "@salesforce/label/c.AR";
import CA from "@salesforce/label/c.CA";
import CO from "@salesforce/label/c.CO";
import CT from "@salesforce/label/c.CT";
import DE from "@salesforce/label/c.DE";
import DC from "@salesforce/label/c.DC";
import FL from "@salesforce/label/c.FL";
import GA from "@salesforce/label/c.GA";
import HI from "@salesforce/label/c.HI";
import ID from "@salesforce/label/c.ID";
import IL from "@salesforce/label/c.IL";
import IN from "@salesforce/label/c.IN";
import IA from "@salesforce/label/c.IA";
import KS from "@salesforce/label/c.KS";
import KY from "@salesforce/label/c.KY";
import LA from "@salesforce/label/c.LA";
import ME from "@salesforce/label/c.ME";
import MD from "@salesforce/label/c.MD";
import MA from "@salesforce/label/c.MA";
import MI from "@salesforce/label/c.MI";
import MN from "@salesforce/label/c.MN";
import MS from "@salesforce/label/c.MS";
import MO from "@salesforce/label/c.MO";
import MT from "@salesforce/label/c.MT";
import NE from "@salesforce/label/c.NE";
import NV from "@salesforce/label/c.NV";
import NH from "@salesforce/label/c.NH";
import NJ from "@salesforce/label/c.NJ";
import NM from "@salesforce/label/c.NM";
import NY from "@salesforce/label/c.NY";
import NC from "@salesforce/label/c.NC";
import ND from "@salesforce/label/c.ND";
import OH from "@salesforce/label/c.OH";
import OK from "@salesforce/label/c.OK";
import OR from "@salesforce/label/c.OR";
import PA from "@salesforce/label/c.PA";
import RI from "@salesforce/label/c.RI";
import SC from "@salesforce/label/c.SC";
import SD from "@salesforce/label/c.SD";
import TN from "@salesforce/label/c.TN";
import TX from "@salesforce/label/c.TX";
import UT from "@salesforce/label/c.UT";
import VT from "@salesforce/label/c.VT";
import VA from "@salesforce/label/c.VA";
import WA from "@salesforce/label/c.WA";
import WV from "@salesforce/label/c.WV";
import WI from "@salesforce/label/c.WI";
import WY from "@salesforce/label/c.WY";
import NONE from "@salesforce/label/c.None";
import APT from "@salesforce/label/c.APT";
import BLDG from "@salesforce/label/c.BLDG";
import UNIT from "@salesforce/label/c.UNIT";
import RETAIL from "@salesforce/label/c.retail";
import PHONESALES from "@salesforce/label/c.phonesales";
import TOP_CENTER from "@salesforce/label/c.top_center";
import SPECTRUM_API from "@salesforce/label/c.Spectrum_API";
import SPECTRUM_INFO_RESPONSE from "@salesforce/label/c.Spectrum_Information_Response";
import CHARTER_SPECTRUM from "@salesforce/label/c.Charter_Spectrum";
import DEALER_CODE_RESPONSE from "@salesforce/label/c.Dealer_Code_Response";
import NO_AFFILIATE_ID_FOUND from "@salesforce/label/c.No_Affiliate_ID_found";
import ERROR_VARIANT from "@salesforce/label/c.error_variant";
import STICKY_MODE from "@salesforce/label/c.sticky_mode";
import SPECTRUM_AFFILIATE_ID_ERROR from "@salesforce/label/c.Spectrum_Affiliate_ID_Error_Message";
import CHARTER from "@salesforce/label/c.charter";
import EVENT from "@salesforce/label/c.event";
import OBJECT from "@salesforce/label/c.object";
import MAPS_CITY_FIELD from "@salesforce/label/c.Maps_City_Field_Label";
import MAPS_STREET_FIELD from "@salesforce/label/c.Maps_Street_Field_Label";
import MAPS_APPARTMENT_FIELD from "@salesforce/label/c.Maps_Appartment_Field_Label";
import MAPS_STATE_FIELD from "@salesforce/label/c.Maps_State_Field_Label";
import MAPS_POSTALCODE_FIELD from "@salesforce/label/c.Maps_Postal_Code_Field_Label";
import ADDRESS_TARGET from "@salesforce/label/c.address";
import APT_TARGET from "@salesforce/label/c.apt_lowercase";
import CITY_TARGET from "@salesforce/label/c.city_lowercase";
import STATE_TARGET from "@salesforce/label/c.state_lowercase";
import ZIP_TARGET from "@salesforce/label/c.zip_lowercase";
import UNITTYPE_TARGET from "@salesforce/label/c.unitType";
import STD_REC_PAGE from "@salesforce/label/c.standard_recordPage";
import SPINNER_TEXT from "@salesforce/label/c.Spinner_Alternative_Text";
import UNIT_TYPE_FIELD_LABEL from "@salesforce/label/c.Unit_Type_Field_Label";
import INFO_TAB_NAME from "@salesforce/label/c.Info_Tab_Name_Label";
import CHECK_SERVICE_BUTTON_LABEL from "@salesforce/label/c.Check_Serviceability_Button_Label";
import SELF_SERVICE_OPP_NAME from "@salesforce/label/c.Self_Service_Opportunity_Name";
import RETAIL_OPP_NAME from "@salesforce/label/c.Retail_Opportunity_Name";
import EVENT_OPP_NAME from "@salesforce/label/c.Event_Opportunity_Name";
import PHONE_SALES_OPP_NAME from "@salesforce/label/c.Phone_Sales_Opportunity_Name";
import MAPS_OPP_NAME from "@salesforce/label/c.Maps_Opportunity_Name";
import SERVER_ERROR from "@salesforce/label/c.Server_Error_Toast_Title";
import UNITED_STATES from "@salesforce/label/c.United_States";
import OPPORTUNITY_OBJ_NAME from "@salesforce/label/c.Opportunity_Object_Name";
import API_ERROR from "@salesforce/label/c.API_Error";
import GENERIC_ERROR from "@salesforce/label/c.Toast_Generic_Error_Title";
import GENERIC_ERROR_MESSAGE from "@salesforce/label/c.Chuzo_Generic_Error_Message";
import GENERIC_ERROR_LOG from "@salesforce/label/c.Generic_Error_Log";

const NULL = "";

const stateNames = [
    { name: ALABAMA, abbrev: AL },
    { name: ALASKA, abbrev: AK },
    { name: ARIZONA, abbrev: AZ },
    { name: ARKANSAS, abbrev: AR },
    { name: CALIFORNIA, abbrev: CA },
    { name: COLORADO, abbrev: CO },
    { name: CONNECTICUT, abbrev: CT },
    { name: DELAWARE, abbrev: DE },
    { name: DISTRICT_OF_COLUMBIA, abbrev: DC },
    { name: FLORIDA, abbrev: FL },
    { name: GEORGIA, abbrev: GA },
    { name: HAWAII, abbrev: HI },
    { name: IDAHO, abbrev: ID },
    { name: ILLINOIS, abbrev: IL },
    { name: INDIANA, abbrev: IN },
    { name: IOWA, abbrev: IA },
    { name: KANSAS, abbrev: KS },
    { name: KENTUCKY, abbrev: KY },
    { name: LOUISIANA, abbrev: LA },
    { name: MAINE, abbrev: ME },
    { name: MARYLAND, abbrev: MD },
    { name: MASSACHUSETTS, abbrev: MA },
    { name: MICHIGAN, abbrev: MI },
    { name: MINNESOTA, abbrev: MN },
    { name: MISSISSIPPI, abbrev: MS },
    { name: MISSOURI, abbrev: MO },
    { name: MONTANA, abbrev: MT },
    { name: NEBRASKA, abbrev: NE },
    { name: NEVADA, abbrev: NV },
    { name: NEW_HAMPSHIRE, abbrev: NH },
    { name: NEW_JERSEY, abbrev: NJ },
    { name: NEW_MEXICO, abbrev: NM },
    { name: NEW_YORK, abbrev: NY },
    { name: NORTH_CAROLINA, abbrev: NC },
    { name: NORTH_DAKOTA, abbrev: ND },
    { name: OHIO, abbrev: OH },
    { name: OKLAHOMA, abbrev: OK },
    { name: OREGON, abbrev: OR },
    { name: PENNSYLVANIA, abbrev: PA },
    { name: RHODE_ISLAND, abbrev: RI },
    { name: SOUTH_CAROLINA, abbrev: SC },
    { name: SOUTH_DAKOTA, abbrev: SD },
    { name: TENNESSEE, abbrev: TN },
    { name: TEXAS, abbrev: TX },
    { name: UTAH, abbrev: UT },
    { name: VERMONT, abbrev: VT },
    { name: VIRGINA, abbrev: VA },
    { name: WASHINGTON, abbrev: WA },
    { name: WEST_VIRGINIA, abbrev: WV },
    { name: WISCONSIN, abbrev: WI },
    { name: WYOMING, abbrev: WY }
];

export default class Poe_lwcBuyflowCharterApiInfoTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api zip;
    @api isGuestUser;
    @api origin;
    noCompleteInfo = true;
    address;
    apt;
    unitType = NONE;
    unitTypeOptions = [
        { label: NONE, value: NONE },
        {
            label: APT,
            value: APT
        },
        { label: BLDG, value: BLDG },
        { label: UNIT, value: UNIT }
    ];
    addressLine2entered = false;
    unitTypeEntered = false;
    city;
    state;
    locationKey;
    legacyMSO;
    stateOptions = [];
    predictiveAddresses = [];
    showLoaderSpinner;
    showCollateral;
    offers = [];
    sessionId;
    storeId;
    userEmail;
    multiAddress = false;
    showPredictiveAddress = false;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        affiliateId,
        agentId,
        ADDRESS_FIELD,
        CITY_FIELD,
        COUNTRY_FIELD,
        ZIP_FIELD,
        STATE_FIELD,
        STREET_ADDRESS_FIELD,
        ADDRESS_LINE_2_FIELD,
        SPINNER_TEXT,
        CHARTER,
        UNIT_TYPE_FIELD_LABEL,
        INFO_TAB_NAME,
        CHECK_SERVICE_BUTTON_LABEL
    };
    showAddressValidation = false;
    addressDetail = {};
    addressMessage;
    addressPhone;
    showSelfServiceCancelModal = false;
    addressOptions = {
        addressLabel: ADDRESS_FIELD,
        cityLabel: CITY_FIELD,
        cityPlaceHolder: undefined,
        countryDisabled: true,
        countryLabel: COUNTRY_FIELD,
        countryPlaceholder: undefined,
        fieldLevelHelp: undefined,
        postalCodeLabel: ZIP_FIELD,
        postalCodePlaceholder: undefined,
        provinceLabel: STATE_FIELD,
        provincePlaceholder: undefined,
        required: true,
        showAddressLookup: true,
        streetLabel: STREET_ADDRESS_FIELD,
        streetPlaceholder: undefined,
        addressLine2Label: ADDRESS_LINE_2_FIELD,
        addressLine2Placeholder: undefined
    };
    showAddressComponent = false;
    isRetail = false;
    salesId;

    connectedCallback() {
        this.showLoaderSpinner = true;
        this.isRetail = this.origin === RETAIL;
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = TOP_CENTER;
        }
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.stateOptions.push(option);
        });
        let input = {
            program: SPECTRUM_API
        };
        getCharterInformation({ myData: input })
            .then((response) => {
                console.log(SPECTRUM_INFO_RESPONSE, response);
                this.storeId = response.result.storeId;
                this.userEmail = response.result.userEmail;
                if (this.origin !== PHONESALES) {
                    this.handleGetAffiliateId();
                } else {
                    this.handleGetAddressInfo();
                }
            })
            .catch((error) => {
                this.logError(error.body?.message || error.message);
                this.showLoaderSpinner = false;
                console.log(error);
            });
    }

    handleGetAffiliateId() {
        let myData = {
            Id: this.recordId,
            program: CHARTER_SPECTRUM,
            origin: this.origin
        };
        getDealerCode({ myData: myData })
            .then((response) => {
                console.log(DEALER_CODE_RESPONSE, response);
                if (response.result.Codes.length > 0) {
                    this.labels.affiliateId = response.result.Codes[0].POE_Affiliate_Id__c;
                    this.salesId = response.result.Codes[0]?.Spectrum_Sales_Id__c;
                    this.handleGetAddressInfo();
                } else {
                    const event = new ShowToastEvent({
                        title: NO_AFFILIATE_ID_FOUND,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: SPECTRUM_AFFILIATE_ID_ERROR
                    });
                    this.dispatchEvent(event);
                    this.showLoaderSpinner = false;
                }
            })
            .catch((error) => {
                this.showLoaderSpinner = false;
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    handleGetAddressInfo() {
        let myData = {
            Id: this.recordId,
            Program: SPECTRUM_API
        };

        getAddressInfo({ myData })
            .then((response) => {
                let result = response.result;
                let opportunity = result.Opportunity;
                if (typeof opportunity === OBJECT) {
                    this.city = opportunity.hasOwnProperty(MAPS_CITY_FIELD) ? opportunity.Maps_City__c : undefined;
                    this.address = opportunity.hasOwnProperty(MAPS_STREET_FIELD)
                        ? opportunity.Maps_Street__c
                        : undefined;
                    this.apt = opportunity.hasOwnProperty(MAPS_APPARTMENT_FIELD)
                        ? opportunity.Maps_Appartment__c
                        : undefined;
                    if (this.apt !== undefined) {
                        let lowerCaseApt = this.apt.toLowerCase();
                        let aptValue = APT.toLowerCase();
                        let unitValue = UNIT.toLowerCase();
                        let buildingValue = BLDG.toLowerCase();
                        this.unitType = lowerCaseApt.includes(aptValue)
                            ? APT
                            : lowerCaseApt.includes(unitValue)
                            ? UNIT
                            : lowerCaseApt.includes(buildingValue)
                            ? BLDG
                            : NULL;
                        this.apt = lowerCaseApt
                            .replace(aptValue, NULL)
                            .replace(unitValue, NULL)
                            .replace(buildingValue, NULL)
                            .toUpperCase()
                            .trim();
                    }
                    let stateLong = opportunity.hasOwnProperty(MAPS_STATE_FIELD)
                        ? opportunity.Maps_State__c
                        : undefined;
                    this.state =
                        stateLong !== undefined
                            ? this.stateOptions.filter(
                                  (state) => stateLong === state.label || stateLong === state.value
                              )[0].value
                            : undefined;
                    this.zip = opportunity.hasOwnProperty(MAPS_POSTALCODE_FIELD)
                        ? opportunity.Maps_PostalCode__c
                        : undefined;
                }
                this.disableValidation();

                const aci = {
                    ContextId: this.recordId
                };

                this.showAddressComponent = true;
                saveACIPresentation({ request: JSON.stringify(aci) })
                    .then((response) => {
                        this.showLoaderSpinner = false;
                    })
                    .catch((error) => {
                        this.logError(error.body?.message || error.message);
                        this.showLoaderSpinner = false;
                        console.log(error);
                    });
            })
            .catch((error) => {
                this.logError(error.body?.message || error.message);
                this.showLoaderSpinner = false;
                console.log(error);
            });
    }

    handleChange(event) {
        this.multiAddress = false;
        switch (event.target.name) {
            case ADDRESS_TARGET:
                this.address =
                    event.target.value !== NULL && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case APT_TARGET:
                this.apt =
                    event.target.value !== NULL && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                this.addressLine2entered =
                    event.target.value !== NULL && event.target.value !== null && event.target.value !== undefined;
                if (!this.addressLine2entered) {
                    this.unitType = NONE;
                    this.unitTypeEntered = false;
                }
                break;
            case CITY_TARGET:
                this.city =
                    event.target.value !== NULL && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case STATE_TARGET:
                this.state =
                    event.target.value !== NULL && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case ZIP_TARGET:
                this.zip =
                    event.target.value !== NULL && event.target.value !== null && event.target.value !== undefined
                        ? event.target.value
                        : undefined;
                break;
            case UNITTYPE_TARGET:
                this.unitType = event.target.value;
                this.unitTypeEntered = event.target.value !== NONE;
                break;
        }
        this.disableValidation();
    }

    handleAddressChange(event) {
        this.address = event.detail.street != NULL ? event.detail.street : undefined;
        this.city = event.detail.city != NULL ? event.detail.city : undefined;
        this.apt = event.detail.addressLine2 != NULL ? event.detail.addressLine2 : undefined;
        this.state = event.detail.province != NULL ? event.detail.province : undefined;
        this.zip = event.detail.postalCode != NULL ? event.detail.postalCode : undefined;

        this.disableValidation();
    }

    disableValidation() {
        if (
            this.address !== undefined &&
            this.city !== undefined &&
            this.state !== undefined &&
            this.zip !== undefined &&
            (!this.addressLine2entered || (this.addressLine2entered && this.unitType !== NONE)) &&
            (!this.unitTypeEntered || (this.unitTypeEntered && this.apt !== undefined))
        ) {
            this.noCompleteInfo = false;
        } else {
            this.noCompleteInfo = true;
        }
    }

    handleCancel() {
        if (this.isGuestUser) {
            this.showSelfServiceCancelModal = true;
        } else {
            this[NavigationMixin.Navigate]({
                type: STD_REC_PAGE,
                attributes: {
                    recordId: this.recordId,
                    objectApiName: OPPORTUNITY_OBJ_NAME,
                    actionName: "view"
                }
            });
        }
    }

    hideSelfServiceModal() {
        this.showSelfServiceCancelModal = false;
    }

    selfServiceReturnToHomePage() {
        const goBackEvent = new CustomEvent("home", {
            detail: NULL,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(goBackEvent);
    }

    handleClick() {
        this.showLoaderSpinner = true;
        let name;
        if (this.isGuestUser) {
            name = SELF_SERVICE_OPP_NAME;
        } else {
            switch (this.origin) {
                case RETAIL:
                    name = RETAIL_OPP_NAME;
                    break;
                case EVENT:
                    name = EVENT_OPP_NAME;
                    break;
                case PHONESALES:
                    name = PHONE_SALES_OPP_NAME;
                    break;
                default:
                    name = MAPS_OPP_NAME;
                    break;
            }
        }
        let info = {
            Maps_Appartment__c: this.apt !== undefined ? `${this.unitType} ${this.apt}` : null,
            Maps_City__c: this.city !== undefined ? this.city : null,
            Maps_Country__c: UNITED_STATES,
            Maps_PostalCode__c: this.zip !== undefined ? this.zip : null,
            Maps_State__c: this.state !== undefined ? this.state : null,
            Maps_Street__c: this.address !== undefined ? this.address : null,
            Name: name,
            StageName: "DM",
            Program: CHARTER,
            Id: this.recordId !== undefined ? this.recordId : null
        };
        let myData = {
            opportunity: info,
            origin: this.origin,
            contact: false
        };

        saveOpportunityAddressInformation({ myData })
            .then((response) => {
                console.log(JSON.parse(JSON.stringify(response)));
                this.addressCallout(info);
            })
            .catch((error) => {
                this.logError(error.body?.message || error.message);
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
            });
    }

    addressCallout(info) {
        let emailArray = this.userEmail.split("@");
        let cleanEmail = emailArray[0].replace(/[^a-zA-Z ]/g, NULL);
        let agentEmail = `${cleanEmail}@${emailArray[1]}`;
        const path = "products/charter";
        let myData = {
            path,
            partnerName: CHARTER,
            customerType: "R",
            fetchOffers: true,
            address: {
                addressLine1: info.Maps_Street__c,
                addressLine2: this.apt !== undefined ? `${this.unitType} ${this.apt}` : NULL,
                city: info.Maps_City__c,
                state: info.Maps_State__c,
                country: info.Maps_Country__c,
                zipCode: info.Maps_PostalCode__c,
                locationKey: this.locationKey !== undefined && this.multiAddress ? this.locationKey : NULL,
                legacyMSO: this.legacyMSO !== undefined && this.multiAddress ? this.legacyMSO : NULL
            },
            channelInformation: {
                storeId: this.storeId,
                channel: "RESI-RETAIL",
                salesAgentId: this.labels.agentId,
                affiliateId: this.labels.affiliateId,
                salesAgentEmail: agentEmail,
                customerPresent: false
            }
        };
        if (this.origin === RETAIL) {
            delete myData.channelInformation.storeId;
        }
        console.log("Serviceability Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Serviceability Response", responseParsed);
                if (responseParsed.hasOwnProperty(ERROR_VARIANT)) {
                    let errorMessage = `${responseParsed.message !== undefined ? responseParsed.message : NULL} ${
                        responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("technicalMessage")
                                ? responseParsed.error.provider.message.technicalMessage
                                : responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: SERVER_ERROR,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", response);
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    if (responseParsed.serviceAvailability) {
                        let addressInfo = {
                            address: this.address,
                            apt: this.apt !== undefined ? `${this.unitType} ${this.apt}` : NULL,
                            city: this.city,
                            state: this.state,
                            zip: this.zip
                        };
                        this.addressDetail = {
                            address: addressInfo,
                            sessionId: responseParsed.sessionId,
                            offers: responseParsed.offers,
                            affiliateId: this.labels.affiliateId
                        };
                        if (responseParsed.responseCode === 603) {
                            this.addressMessage = responseParsed.message;
                            this.addressPhone = responseParsed.reasonTN;
                            this.showAddressValidation = true;
                        } else {
                            const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
                                detail: {
                                    ...this.addressDetail,
                                    salesId: this.salesId
                                }
                            });
                            this.dispatchEvent(sendCheckServiceabilityEvent);
                        }
                    } else {
                        if (
                            responseParsed.hasOwnProperty("suggestedAddress") &&
                            responseParsed.suggestedAddress.length > 0
                        ) {
                            let multiAddresses = [];
                            responseParsed.suggestedAddress.forEach((address) => {
                                let addressObject = {
                                    address: {
                                        addressLine1: address.addressLine1,
                                        addressLine2: address.addressLine2,
                                        city: address.city,
                                        state: address.state,
                                        zipCode: address.zipCode.substring(0, 5),
                                        zipCodeLong: address.zipCode,
                                        locationKey: address.locationKey,
                                        legacyMSO: address.legacyMSO
                                    }
                                };
                                multiAddresses.push(addressObject);
                            });
                            this.predictiveAddresses = [...multiAddresses];
                            this.showPredictiveAddress = true;
                        } else if (
                            responseParsed.responseCode === 604 &&
                            responseParsed.hasOwnProperty("gisRecommendationData") &&
                            responseParsed.gisRecommendationData.hasOwnProperty("gisErrorMessage") &&
                            responseParsed.gisRecommendationData.gisErrorMessage !== null &&
                            responseParsed.gisRecommendationData.gisErrorMessage.hasOwnProperty("errorBody")
                        ) {
                            const errorMessage = responseParsed.gisRecommendationData.gisErrorMessage.errorBody;
                            const event = new ShowToastEvent({
                                title: responseParsed.gisRecommendationData.gisErrorMessage.errorHeader,
                                variant: ERROR_VARIANT,
                                mode: STICKY_MODE,
                                message: errorMessage
                            });
                            this.dispatchEvent(event);
                            let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", response);
                            this.logError(finalErrorLog, myData, path, API_ERROR);
                        } else {
                            const errorMessage = `${responseParsed.message} ${
                                responseParsed.hasOwnProperty("reasonMessageCustomer")
                                    ? responseParsed.reasonMessageCustomer
                                    : responseParsed.hasOwnProperty("reasonMesssageCustomer")
                                    ? responseParsed.reasonMesssageCustomer
                                    : NULL
                            } ${
                                responseParsed.hasOwnProperty("reasonTN") &&
                                responseParsed.reasonTN !== null &&
                                responseParsed.reasonTN !== NULL
                                    ? "TFN: " + responseParsed.reasonTN
                                    : NULL
                            }`;
                            const event = new ShowToastEvent({
                                title: responseParsed.hasOwnProperty("reasonDescription")
                                    ? responseParsed.reasonDescription
                                    : GENERIC_ERROR,
                                variant: ERROR_VARIANT,
                                mode: STICKY_MODE,
                                message: errorMessage.trim().substring(-1) === "." ? errorMessage : `${errorMessage}.`
                            });
                            this.dispatchEvent(event);
                            let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", response);
                            this.logError(finalErrorLog, myData, path, API_ERROR);
                        }
                    }
                }
                this.showLoaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = GENERIC_ERROR_MESSAGE;
                const event = new ShowToastEvent({
                    title: SERVER_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", genericErrorMessage).replace(
                        "{1}",
                        apiResponse
                    );
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.showLoaderSpinner = false;
            });
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    hideModal(event) {
        this.predictiveAddresses = [];
        this.showPredictiveAddress = false;
        this.legacyMSO = undefined;
        this.locationKey = undefined;
    }

    selectAddress(event) {
        this.multiAddress = true;
        let received = JSON.parse(JSON.stringify(event.detail));
        this.showPredictiveAddress = false;
        this.address = received.address.addressLine1;
        this.unitType = received.address.addressLine2.includes(APT)
            ? APT
            : received.address.addressLine2.includes(UNIT)
            ? UNIT
            : received.address.addressLine2.includes(BLDG)
            ? BLDG
            : NONE;
        this.apt = received.address.addressLine2.replace(APT, NULL).replace(UNIT, NULL).replace(BLDG, NULL);
        this.unitTypeEntered = this.unitType !== NONE;

        this.addressLine2entered = this.apt !== NULL && this.apt !== null && this.apt !== undefined;
        this.state = received.address.state;
        this.zip = received.address.zipCode;
        this.city = received.address.city;
        this.legacyMSO = received.address.legacyMSO;
        this.locationKey = received.address.locationKey;
        this.handleClick();
    }

    hideAddressModal() {
        this.showAddressValidation = false;
    }

    confirmAddressModal() {
        const sendCheckServiceabilityEvent = new CustomEvent("checkserviceability", {
            detail: {
                ...this.addressDetail,
                salesId: this.salesId
            }
        });
        this.dispatchEvent(sendCheckServiceabilityEvent);
    }

    logError(errorMessage, request, endpoint = NULL, type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: INFO_TAB_NAME,
            component: "poe_lwcBuyflowCharterApiInfoTab",
            error: errorMessage
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
            tab: INFO_TAB_NAME
        };
        this.dispatchEvent(event);
    }
}