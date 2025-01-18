import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import updateOpportunity from "@salesforce/apex/CreditCheckTabController.updateOpportunity";
import getSSNFraudRules from "@salesforce/apex/CreditCheckTabController.getSSNFraudRules";
import getIPStackSettings from "@salesforce/apex/InfoTabController.getIPStackSettings";
import saveFlagIP from "@salesforce/apex/CreditCheckTabController.saveFlagIP";
import saveAccountInformation from "@salesforce/apex/CreditCheckTabController.saveAccountInformation";
import IPSaveOrderDTV from "@salesforce/apex/CreditCheckTabController.IPSaveOrderDTV";
import saveACICreditCheck from "@salesforce/apex/CreditCheckTabController.saveACICreditCheck";
import customerReachedCap from "@salesforce/apex/CreditCheckTabController.customerReachedCap";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import ToastContainer from "lightning/toastContainer";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import capReachedError from "@salesforce/label/c.Order_Cap_Reached_Body";
import CONSENT_DISCLAIMER from "@salesforce/label/c.Chuzo_Consent_Text";

import ADDRESS_FIELD from "@salesforce/label/c.Address_Field_Label";
import CITY_FIELD from "@salesforce/label/c.City_Field_Label";
import COUNTRY_FIELD from "@salesforce/label/c.Country_Field_Label";
import ZIPCODE_FIELD from "@salesforce/label/c.Zip_Code_Field_Label";
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
import YES_OPTION from "@salesforce/label/c.Yes_Option_Label";
import NO_OPTION from "@salesforce/label/c.No_Option_Label";
import MANUAL_OPTION from "@salesforce/label/c.Manual_PCI_Option_Label";
import SPECTRUM_API from "@salesforce/label/c.Spectrum_API";
import RETAIL from "@salesforce/label/c.retail";
import PHONESALES from "@salesforce/label/c.phonesales";
import EVENT from "@salesforce/label/c.event";
import CHARTER from "@salesforce/label/c.charter";
import ERROR_VARIANT from "@salesforce/label/c.error_variant";
import STICKY_MODE from "@salesforce/label/c.sticky_mode";
import API_ERROR from "@salesforce/label/c.API_Error";
import GENERIC_ERROR from "@salesforce/label/c.Toast_Generic_Error_Title";
import SERVER_ERROR from "@salesforce/label/c.Server_Error_Toast_Title";
import GENERIC_ERROR_LOG from "@salesforce/label/c.Generic_Error_Log";
import CUSTOMER_VALIDATION_RESULT from "@salesforce/label/c.Spectrum_Customer_Validation_Result_Title";
import AUTO_PAY_DISCOUNT from "@salesforce/label/c.Spectrum_Auto_Pay_Discount";
import PREVIOUS_ADDRESS_LABEL from "@salesforce/label/c.Spectrum_Previous_Address_Label";
import ORDER_CREATION_ERROR from "@salesforce/label/c.Order_Creation_Generic_Error_Message";
import REQUEST_COULD_NOT_BE_MADE_ERROR from "@salesforce/label/c.viasat_request_could_not_be_made_correctly";
import ZERO_DOLLARS from "@salesforce/label/c.Zero_Dollars";
import PREPAYMENT_REQUIRED from "@salesforce/label/c.Spectrum_Prepayment_Required_Message";
import DELINQUENT_BALANCE from "@salesforce/label/c.Spectrum_Delinquent_Balance_Message";
import NO_PREPAYMENT_REQUIRED from "@salesforce/label/c.Spectrum_No_Prepayment_Required_Message";
import CUSTOMER_VALIDATION_TAB_NAME from "@salesforce/label/c.Customer_Validation_Tab_Name";
import FIRST_NAME from "@salesforce/label/c.First_Name_Field_Label";
import LAST_NAME from "@salesforce/label/c.Last_Name_Field_Label";
import EMAIL_ADDRESS from "@salesforce/label/c.Email_Address_Field_Label";
import PHONE from "@salesforce/label/c.Phone_Tab_Label";
import DATE_OF_BIRTH from "@salesforce/label/c.Date_of_Birth_Field_Label";
import PREVIOUS_ADDRESS from "@salesforce/label/c.Previous_Address_Field_Label";
import APT_UNIT from "@salesforce/label/c.Apt_Unit_Field_Label";
import ZIP from "@salesforce/label/c.Zip_Field_Label";
import BILLING_ADDRESS_CHECK from "@salesforce/label/c.Spectrum_Billing_Address_Check_Label";
import BILLING_ADDRESS from "@salesforce/label/c.Billing_Address_Field_Label";
import CART_PROMOTIONS from "@salesforce/label/c.Spectrum_Cart_Promotions_Title";
import LIMIT_REACHED from "@salesforce/label/c.Limit_Reached_Title";
import SPINNER_ALT_TEXT from "@salesforce/label/c.Spinner_Alternative_Text";
import CUSTOMER_INFORMATION from "@salesforce/label/c.Customer_Information";
import INVALID_PHONE_ERROR from "@salesforce/label/c.Invalid_Phone_Number_Generic_Error_Message";
import SERVICE_UNREACHABLE from "@salesforce/label/c.Service_unreachable";
import ALREADY_EXIST_ADDRESS_PHONE from "@salesforce/label/c.Windstream_already_exist_address_or_phone";
import CHARTER_SPECTRUM from "@salesforce/label/c.Charter_Spectrum";
import SELF_SERVICE_REP_TYPE from "@salesforce/label/c.Self_Service_Rep_Type";
import PHONE_SALES_REP_TYPE from "@salesforce/label/c.Phone_Sales_Rep_Type";
import RETAIL_REP_TYPE from "@salesforce/label/c.Retail_Rep_Type";
import EVENT_REP_TYPE from "@salesforce/label/c.Event_Rep_Type";
import DOOR_TO_DOOR_REP_TYPE from "@salesforce/label/c.Door_to_Door_Rep_Type";
import INSTALLATION_DATE_ERROR from "@salesforce/label/c.Spectrum_Installation_Date_Generic_Error";
import DELINQUENT_CHARGE_NAME from "@salesforce/label/c.Delinquent_Charge_Name";
import USA from "@salesforce/label/c.USA";
import ADD_BILLING_ADDRESS_ERROR from "@salesforce/label/c.Spectrum_Add_Billing_Address_Generic_Error";
import CREDIT_CHECK_LIMIT_ERROR_MESSAGE from "@salesforce/label/c.Credit_Check_Limit_Error_Message";
import CREDIT_CHECK_LIMIT_ERROR_TITLE from "@salesforce/label/c.Credit_Check_Limit_Error_Title";
import IP_STACK_SETTING_URL from "@salesforce/label/c.IPStack_Setting_URL";
import IP_STACK_SETTING_URL_PARAMETERS from "@salesforce/label/c.IPStack_Setting_URL_Parameters";
import OPPORTUNITY_OBJ_NAME from "@salesforce/label/c.Opportunity_Object_Name";
import MUST_BE_OVER_18_ERROR from "@salesforce/label/c.Windstream_must_be_over_18";

var stateNames = [
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

export default class Poe_lwcBuyflowSpectrumCreditCheckTab extends NavigationMixin(LightningElement) {
    @api recordId;
    @api orderInfo;
    @api cartInfo;
    @api productSelection;
    @api addressInfo;
    @api logo;
    @api origin;
    @api useServiceAddress;
    @api order;
    @api hasPhone;
    @api hasMobile;
    @api creditCheckPerformed;
    @api scheduleRequired;
    @api dateValue;
    @api alternativeDateValue;
    @api dob;
    @api paperlessOption;
    @api isGuestUser;
    @api referralCodeData;

    loaderSpinner;
    cart = {
        orderNumber: "",
        todayCharges: [],
        hasToday: false,
        monthlyCharges: {
            phone: [],
            internet: [],
            mobile: []
        },
        hasMonthly: false,
        monthlyTotal: 0.0,
        todayTotal: 0.0,
        firstBillTotal: (0.0).toFixed(2),
        hasFirstBill: true,
        firstBillCharges: [],
        hasSavings: false,
        monthlyTaxes: (0.0).toFixed(2),
        firstBillTaxes: (0.0).toFixed(2),
        savingsCharges: []
    };
    showCartPromotions = false;
    noPersonalInformation = true;
    referenceNumber;
    ccDOB;
    firstName;
    lastName;
    noAddressInformation = true;
    email;
    phone;
    showBillingAddress = false;
    billingAddressCheck = true;
    billingAddress;
    billingApt;
    billingCity;
    billingState;
    billingZip;
    showPreviousAddress = false;
    previousAddress;
    previousAddressLabel;
    previousApt;
    previousCity;
    previousState;
    previousZip;
    noCompleteInfo = true;
    states = [];
    method = MANUAL_OPTION;
    noContactInformation = true;
    showCollateral = false;
    clientIp;
    radioOptions = [
        {
            label: YES_OPTION,
            value: "yes"
        },
        {
            label: NO_OPTION,
            value: "no"
        }
    ];
    radioOption;
    isDOBFormatted = false;
    orderId;
    orderItemId;
    isPCI = true;
    paymentAttempts;
    creditCheckAttempts;
    terms = [];
    prepayRequired;
    paperless = true;
    showModal = false;
    prepayInfo = {};
    modalTitle = CUSTOMER_VALIDATION_RESULT;
    modalBody;
    autoPay;
    autoPayCharge = {};
    autoPayPresent = true;
    content = {
        paperless: "",
        autoPay: "",
        autoPayLabel: "",
        paperlessVerbiage: ""
    };
    prepayment = false;
    delinquent = false;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        capReachedError,
        CHARTER,
        CUSTOMER_INFORMATION,
        FIRST_NAME,
        LAST_NAME,
        EMAIL_ADDRESS,
        PHONE,
        DATE_OF_BIRTH,
        PREVIOUS_ADDRESS,
        APT_UNIT,
        CITY: CITY_FIELD,
        STATE: STATE_FIELD,
        ZIP,
        BILLING_ADDRESS_CHECK,
        BILLING_ADDRESS,
        ADDRESS_FIELD,
        ADDRESS_LINE_2_FIELD,
        CART_PROMOTIONS,
        LIMIT_REACHED,
        SPINNER_ALT_TEXT,
        INVALID_PHONE_ERROR
    };
    showSelfServiceCancelModal = false;
    creditCheckModshowCapReachedModal = false;
    addressOptions = {
        addressLabel: ADDRESS_FIELD,
        cityLabel: CITY_FIELD,
        cityPlaceHolder: undefined,
        countryDisabled: true,
        countryLabel: COUNTRY_FIELD,
        countryPlaceholder: undefined,
        fieldLevelHelp: undefined,
        postalCodeLabel: ZIPCODE_FIELD,
        postalCodePlaceholder: undefined,
        provinceLabel: STATE_FIELD,
        provincePlaceholder: undefined,
        required: true,
        showAddressLookup: true, // true
        streetLabel: STREET_ADDRESS_FIELD,
        streetPlaceholder: undefined,
        addressLine2Label: ADDRESS_LINE_2_FIELD,
        addressLine2Placeholder: undefined
    };
    showAutoPayEnrollment = false;
    contactConsentLabel = CONSENT_DISCLAIMER;
    contactConsent = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    renderedCallback() {
        if (!this.isDOBFormatted && this.template.querySelector(".sensitive-input")) {
            const style = document.createElement("style");
            style.innerText = "input[name='ccDOB'] {-webkit-text-security: disc}";
            this.template.querySelector(".sensitive-input").appendChild(style);
            this.isDOBFormatted = true;
        }
    }

    connectedCallback() {
        this.loaderSpinner = true;
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        } else {
            this.saveIP();
        }
        this.creditCheckAttempts = 0;
        this.cart = { ...this.cartInfo };
        let autoPayFilter = [...this.cart.monthlyCharges.internet.filter((item) => item.name === AUTO_PAY_DISCOUNT)];
        if (autoPayFilter.length > 0) {
            this.autoPayCharge = { ...autoPayFilter[0] };
        } else {
            this.autoPayPresent = false;
            this.showAutoPayEnrollment = true;
            this.autoPay = true;
        }
        this.firstName = this.orderInfo.customer.firstName !== "" ? this.orderInfo.customer.firstName : undefined;
        this.lastName = this.orderInfo.customer.lastName !== "" ? this.orderInfo.customer.lastName : undefined;
        this.email = this.orderInfo.customer.emailAddress !== "" ? this.orderInfo.customer.emailAddress : undefined;
        this.phone = this.orderInfo.customer.phoneNumber !== "" ? this.orderInfo.customer.phoneNumber : undefined;
        this.ccDOB = this.dob;
        this.paperless = this.paperlessOption !== undefined ? this.paperlessOption : true;
        let addressInfo = `${this.addressInfo.address}${
            this.addressInfo.hasOwnProperty("apt") ? ` ${this.addressInfo.apt}` : ""
        }, ${this.addressInfo.city}`;
        let zipInfo = `${this.addressInfo.state} ${this.addressInfo.zip}`;
        let previousAddressLabel = PREVIOUS_ADDRESS_LABEL.replace("{0}", addressInfo).replace("{1}", zipInfo);
        this.previousAddressLabel = previousAddressLabel;
        this.handlePersonalInformation();
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.states.push(option);
        });
        let myData = {
            ContextId: this.recordId,
            partner: SPECTRUM_API
        };

        getSSNFraudRules({ myData })
            .then((response) => {
                this.referenceNumber = response.result.refNum;
                this.paymentAttempts = response.result.attempts;
                if (
                    this.productSelection !== undefined &&
                    this.productSelection.hasOwnProperty("offerId") &&
                    this.productSelection.offerId !== undefined
                ) {
                    this.getCartPromotions(this.productSelection.offerId);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    handleConsentChange(e) {
        this.contactConsent = e.detail.checked;
    }

    handleContentCallout() {
        this.loaderSpinner = true;
        const path = "contents";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            contentType: "contact"
        };
        console.log("Content Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                const result = JSON.parse(res);
                console.log("Content Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    this.orderSuccess = false;
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: SERVER_ERROR,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    let finalErrorLog = GENERIC_ERROR_LOG.replace("{0}", errorMessage).replace("{1}", res);
                    this.logError(finalErrorLog, myData, path, API_ERROR);
                } else {
                    this.content.autoPay = result.content.properties.elements.autoPay_enrollment_description.value;
                    this.content.autoPayLabel = result.content.properties.elements.autoPay_enrollment.title;
                    this.content.paperless = result.content.properties.elements.paperlessBilling.title;
                    this.content.paperlessVerbiage =
                        result.content.properties.elements.paperlessBilling_description.value;
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const genericErrorMessage = SERVICE_UNREACHABLE;
                const event = new ShowToastEvent({
                    title: GENERIC_ERROR,
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
            });
    }

    handlePersonalInformation() {
        let emailre = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        let phonere = /^\d{10}$/;
        let zipre = /^\d{5}$/;
        if (
            this.email !== undefined &&
            emailre.test(this.email) &&
            this.phone !== undefined &&
            phonere.test(this.phone) &&
            (!this.showBillingAddress ||
                (this.showBillingAddress &&
                    this.billingAddress !== undefined &&
                    this.billingState !== undefined &&
                    this.billingZip !== undefined &&
                    zipre.test(this.billingZip) &&
                    this.billingCity !== undefined)) &&
            this.firstName !== undefined &&
            this.lastName !== undefined &&
            this.radioOption !== undefined &&
            (!this.showPreviousAddress ||
                (this.showPreviousAddress &&
                    this.previousAddress !== undefined &&
                    this.previousState !== undefined &&
                    this.previousZip !== undefined &&
                    zipre.test(this.previousZip) &&
                    this.previousCity !== undefined))
        ) {
            this.noPersonalInformation = false;
        } else {
            this.noPersonalInformation = true;
        }
    }

    handleChange(event) {
        switch (event.target.name) {
            case "billingAddress":
                this.billingAddress = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "billingApt":
                this.billingApt = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "billingState":
                this.billingState = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "billingZip":
                this.billingZip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "billingCity":
                this.billingCity = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "previousAddress":
                this.previousAddress = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "previousApt":
                this.previousApt = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "previousState":
                this.previousState = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "previousZip":
                this.previousZip = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "previousCity":
                this.previousCity = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "email":
                this.email = event.target.value !== "" ? event.target.value.trim() : undefined;
                break;
            case "firstName":
                this.firstName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "lastName":
                this.lastName = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "phone":
                this.phone = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "paperless":
                this.paperless = event.target.checked;
                break;
            case "DOB":
                this.ccDOB =
                    event.target.value !== "" && Date.parse(event.target.value) >= Date.parse("1916-01-01")
                        ? event.target.value
                        : undefined;
                break;
            case "billingAddressCheck":
                this.billingAddressCheck = event.target.checked;
                this.showBillingAddress = !this.billingAddressCheck;
                break;
            case "radioGroup":
                this.radioOption = event.target.value;
                this.showPreviousAddress = this.radioOption === "no";
                break;
            case "autopay":
                this.autoPay = event.target.checked;
                this.handleCartAutoPay();
                break;
        }
        this.handlePersonalInformation();
        this.disableValidations();
    }

    handleBillingAddressChange(event) {
        this.billingAddress = event.detail.street != "" ? event.detail.street : undefined;
        this.billingCity = event.detail.city != "" ? event.detail.city : undefined;
        this.billingApt = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.billingState = event.detail.province != "" ? event.detail.province : undefined;
        this.billingZip = event.detail.postalCode != "" ? event.detail.postalCode : undefined;

        this.handlePersonalInformation();
        this.disableValidations();
    }

    disableValidations() {
        if (this.creditCheckPerformed) {
            this.noCompleteInfo = false;
        } else if (!this.noPersonalInformation) {
            if (this.ccDOB !== undefined) {
                let age = Math.floor((new Date() - new Date(this.ccDOB).getTime()) / 3.15576e10);
                let dobElement = this.template.querySelector('[data-id="ssnDOB"]');
                if (age < 18) {
                    this.noCompleteInfo = true;
                    if (age < 18) {
                        dobElement.setCustomValidity(MUST_BE_OVER_18_ERROR);
                        dobElement.reportValidity();
                    }
                } else {
                    dobElement.setCustomValidity("");
                    dobElement.reportValidity();
                    this.noCompleteInfo = false;
                }
            } else {
                this.noCompleteInfo = true;
            }
        } else {
            this.noCompleteInfo = true;
        }
    }

    formatDOB() {
        const style = document.createElement("style");
        style.innerText = "input[name='ccDOB'] {-webkit-text-security: disc}";
        setTimeout(() => {
            this.template.querySelector(".sensitive-input").appendChild(style);
        }, 10);
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCancel() {
        if (this.isGuestUser) {
            this.showSelfServiceCancelModal = true;
        } else {
            this[NavigationMixin.Navigate]({
                type: "standard__recordPage",
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
            detail: "",
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(goBackEvent);
    }

    handleBillingAddress(event) {
        this.showBillingAddress = event.target.checked;
        if (this.showBillingAddress) {
            this.billingCity = undefined;
            this.billingApt = undefined;
            this.billingAddress = undefined;
            this.billingState = undefined;
            this.billingZip = undefined;
        } else {
            this.billingCity = this.addressInfo.city;
            this.billingApt = this.addressInfo.hasOwnProperty("apt") ? this.addressInfo.apt : "";
            this.billingAddress = this.addressInfo.address;
            this.billingState = this.addressInfo.state;
            this.billingZip = this.addressInfo.zip;
        }
        this.handlePersonalInformation();
        this.disableValidations();
    }

    saveIP() {
        getIPStackSettings()
            .then((response) => {
                const Http = new XMLHttpRequest();
                let url = response.result.URL__c ? response.result.URL__c : IP_STACK_SETTING_URL;
                url = url + IP_STACK_SETTING_URL_PARAMETERS + response.result.Password__c;
                Http.open("GET", url);
                Http.send();
                Http.onreadystatechange = (e) => {
                    if (Http.readyState == 4 && Http.status == 200) {
                        let data = JSON.parse(Http.responseText);
                        this.clientIp = data.ip;
                        const myData = {
                            ContextId: this.recordId,
                            IP: this.clientIp
                        };

                        saveFlagIP({ myData })
                            .then((response) => {
                                console.log("IP Saved");
                            })
                            .catch((error) => {
                                console.error(error, "ERROR");
                                this.logError(error.body?.message || error.message);
                            });
                    }
                };
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
            });
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    hideModal() {
        this.showModal = false;
    }

    handleNext() {
        this.loaderSpinner = true;
        let data = {
            Email: this.email
        };

        console.log("Customer Cap Reached Request", data);
        customerReachedCap({ myData: data })
            .then((response) => {
                console.log("Customer Cap Reached response", response);
                let capReached = response.result.capReached;

                if (capReached) {
                    this.loaderSpinner = false;
                    this.showCapReachedModal = true;

                    this.logError(this.labels.capReachedError);
                } else {
                    if (this.creditCheckAttempts < 3) {
                        this.creditCheckAttempts = this.creditCheckAttempts + 1;
                    } else {
                        const event = new ShowToastEvent({
                            title: CREDIT_CHECK_LIMIT_ERROR_TITLE,
                            variant: ERROR_VARIANT,
                            mode: STICKY_MODE,
                            message: CREDIT_CHECK_LIMIT_ERROR_MESSAGE
                        });
                        this.dispatchEvent(event);
                        this.paymentAttempts = this.creditCheckAttempts;
                        this.noCompleteInfo = true;
                        this.updateOpp();
                        this.loaderSpinner = false;
                        return;
                    }
                    if (this.showBillingAddress) {
                        this.addBillingAddress();
                    } else this.updateCartPromotions();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const errMsg = error.body?.message || error.message;
                this.logError(errMsg);
            });
    }

    addBillingAddress() {
        this.loaderSpinner = true;
        const path = "addAddress";
        let myData = {
            path: path,
            partnerName: CHARTER,
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            recurringPayment: true,
            address: {
                addressLine1: this.billingAddress,
                addressLine2: this.billingApt,
                city: this.billingCity,
                state: this.billingState,
                zipCode: this.billingZip,
                type: "billing",
                useServiceAddress: false
            }
        };
        console.log("Add Address Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Add Address Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: SERVER_ERROR,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                } else {
                    this.updateCartPromotions();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = ADD_BILLING_ADDRESS_ERROR;
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
                this.loaderSpinner = false;
            });
    }

    getCustomerInfo() {
        let customer = {
            firstName: this.firstName,
            lastName: this.lastName,

            phone: this.phone,
            email: this.email,
            method: this.preferredMethod,
            time: this.preferredTime
        };
        return customer;
    }

    getBillingAddress() {
        let billingAddress = {
            addressLine1: this.billingAddress,
            addressLine2: this.billingApt,
            city: this.billingCity,
            state: this.billingState,
            country: USA,
            zipCode: this.billingZip
        };
        return billingAddress;
    }

    updateCartWithPrepayments() {
        let hasFirstBill = this.cart.hasFirstBill;
        let firstBillCharges = [...this.cart.firstBillCharges];
        if (this.prepayInfo.paymentRequirements.delinquentBalance !== ZERO_DOLLARS) {
            this.delinquent = true;
            let firstBillTotal = this.cartInfo.monthlyTotal;
            let delinquentCharge = {
                name: DELINQUENT_CHARGE_NAME,
                fee: Number(this.prepayInfo.paymentRequirements.delinquentBalance).toFixed(2),
                type: "creditcheck",
                discount: false
            };
            firstBillCharges.push(delinquentCharge);
            if (firstBillCharges.length > 0) {
                hasFirstBill = true;
                firstBillCharges.forEach(
                    (charge) => (firstBillTotal = (Number(firstBillTotal) + Number(charge.fee)).toFixed(2))
                );
            }
            firstBillTotal = Number(Number(firstBillTotal) + Number(this.cart.firstBillTaxes)).toFixed(2);
            this.cart = {
                ...this.cart,
                hasFirstBill,
                firstBillCharges,
                firstBillTotal
            };
        }
    }

    confirmCreditCheck(event) {
        this.showModal = false;
        if (this.scheduleRequired) {
            this.confirmInstallation();
        } else {
            this.saveAccountInfo();
        }
    }

    confirmInstallation() {
        this.loaderSpinner = true;
        const path = "installation";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            primaryInstallationDetails: {
                scheduleId: this.dateValue.installationDetail.scheduleId,
                date: this.dateValue.installationDetail.date,
                startTime: this.dateValue.installationDetail.startTime,
                endTime: this.dateValue.installationDetail.endTime
            }
        };
        if (Object.keys(this.alternativeDateValue).length > 0) {
            myData.secondaryInstallationDetails = {
                scheduleId: this.alternativeDateValue.installationDetail.scheduleId,
                date: this.alternativeDateValue.installationDetail.date,
                startTime: this.alternativeDateValue.installationDetail.startTime,
                endTime: this.alternativeDateValue.installationDetail.endTime
            };
        }
        console.log("Confirm Installation Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Confirm Installation Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
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
                    this.loaderSpinner = false;
                } else {
                    this.saveAccountInfo();
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const genericErrorMessage = INSTALLATION_DATE_ERROR;
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
                console.log(error);
            });
    }

    saveAccountInfo() {
        this.loaderSpinner = true;

        if (this.prepayRequired) {
            this.updateCartWithPrepayments();
        }
        let eventDetail = { ...this.prepayInfo };
        let data = {
            accName: this.firstName + " " + this.lastName,
            ContextId: this.recordId,
            consent: this.contactConsent,
            recordTypeName: "Person Account",
            creditCheck: {
                customerDetails: {
                    contactInformation: {
                        firstName: this.firstName,
                        middleName: "",
                        lastName: this.lastName,
                        email: this.email,
                        contactPhone: this.phone
                    }
                },
                accountDetails: {
                    billingCreditCheckAddress: {
                        billingAddress: this.showBillingAddress ? this.billingAddress : this.addressInfo.address,
                        billingAptNumber: this.showBillingAddress
                            ? this.billingApt !== undefined
                                ? this.billingApt
                                : ""
                            : this.addressInfo.hasOwnProperty("apt")
                            ? this.addressInfo.apt
                            : "",
                        billingCity: this.showBillingAddress ? this.billingCity : this.addressInfo.city,
                        billingState: this.showBillingAddress ? this.billingState : this.addressInfo.state,
                        billingStateName: this.showBillingAddress
                            ? stateNames.filter((state) => this.billingState === state.abbrev)[0].name
                            : stateNames.filter((state) => this.addressInfo.state === state.abbrev)[0].name,
                        billingZip: this.showBillingAddress ? this.billingZip : this.addressInfo.zip
                    },
                    shippingServiceAddresss: {
                        shippingAddress: this.addressInfo.address,
                        shippingAptNumber: this.addressInfo.hasOwnProperty("apt") ? this.addressInfo.apt : "",
                        shippingCity: this.addressInfo.city,
                        shippingZip: this.addressInfo.zip,
                        shippingState: this.addressInfo.state,
                        shippingStateName: stateNames.filter((state) => this.addressInfo.state === state.abbrev)[0].name
                    }
                }
            }
        };
        console.log("Save Account Data", data);

        saveAccountInformation({ myData: data })
            .then((response) => {
                console.log("Save Account Response", response);
                if (response.result.error) {
                    console.error(response.result.errorMessage);
                    this.loaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: GENERIC_ERROR,
                        mode: STICKY_MODE,
                        variant: ERROR_VARIANT,
                        message: ALREADY_EXIST_ADDRESS_PHONE
                    });
                    this.dispatchEvent(event);
                } else {
                    this.accountId = response.result.Account.Id;
                    this.saveOrder(this.accountId, eventDetail);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    saveOrder(accountId, eventDetail) {
        if (this.order !== undefined) {
            this.loaderSpinner = true;
            let info = {
                ...eventDetail,
                customer: { ...this.getCustomerInfo() },
                billingAddress: { ...this.getBillingAddress() },
                referenceNumber: this.referenceNumber,
                orderId: this.order,
                useServiceAddress: !this.showBillingAddress,
                autoPay: this.autoPay,
                paymentAttempts: this.paymentAttempts,
                cart: { ...this.cart },
                paymentRequired: this.prepayRequired,
                dob: this.ccDOB,
                paperless: this.paperless,
                prepayment: this.prepayment,
                delinquent: this.delinquent
            };
            const sendBackEvent = new CustomEvent("creditchecknext", {
                detail: info
            });
            this.dispatchEvent(sendBackEvent);
            this.loaderSpinner = false;
        } else {
            this.loaderSpinner = true;
            let repType;
            if (this.isGuestUser) {
                repType = SELF_SERVICE_REP_TYPE;
            } else {
                switch (this.origin) {
                    case PHONESALES:
                        repType = PHONE_SALES_REP_TYPE;
                        break;
                    case RETAIL:
                        repType = RETAIL_REP_TYPE;
                        break;
                    case EVENT:
                        repType = EVENT_REP_TYPE;
                        break;
                    case "maps":
                        repType = DOOR_TO_DOOR_REP_TYPE;
                        break;
                }
            }
            let json = {
                ContextId: this.recordId,
                AccountId: accountId,
                ProductName: this.productSelection.name,
                family: CHARTER_SPECTRUM,
                consent: this.contactConsent,
                isGuestUser: this.isGuestUser,
                phone: this.phone,
                email: this.email,
                representative: repType,
                Pricebook: "Standard Price Book",
                timeStamp: new Date(),
                creditCheck: {
                    accountDetails: {
                        billingCreditCheckAddress: {
                            billingAddress: this.showBillingAddress ? this.billingAddress : this.addressInfo.address,
                            billingAptNumber: this.showBillingAddress
                                ? this.billingApt !== undefined
                                    ? this.billingApt
                                    : ""
                                : this.addressInfo.hasOwnProperty("apt")
                                ? this.addressInfo.apt
                                : "",
                            billingCity: this.showBillingAddress ? this.billingCity : this.addressInfo.city,
                            billingState: this.showBillingAddress ? this.billingState : this.addressInfo.state,
                            billingZip: this.showBillingAddress ? this.billingZip : this.addressInfo.zip
                        },
                        shippingServiceAddresss: {
                            shippingAddress: this.addressInfo.address,
                            shippingAptNumber: this.addressInfo.hasOwnProperty("apt") ? this.addressInfo.apt : "",
                            shippingCity: this.addressInfo.city,
                            shippingZip: this.addressInfo.zip,
                            shippingState: this.addressInfo.state
                        }
                    }
                },
                identification: ""
            };
            this.isGuestUser && !!this.referralCodeData ? (json.referralCodeId = this.referralCodeData?.Id) : undefined;
            IPSaveOrderDTV({ myData: json })
                .then((response) => {
                    console.log("Create Order Response", response);
                    let info = {
                        ...eventDetail,
                        referenceNumber: this.referenceNumber,
                        customer: { ...this.getCustomerInfo() },
                        billingAddress: { ...this.getBillingAddress() },
                        orderId: response.result.Order.Id,
                        orderItemId: response.result.OrderItem.Id,
                        useServiceAddress: !this.showBillingAddress,
                        paymentAttempts: this.paymentAttempts,
                        autoPay: this.autoPay,
                        cart: { ...this.cart },
                        paymentRequired: this.prepayRequired,
                        dob: this.ccDOB,
                        paperless: this.paperless,
                        prepayment: this.prepayment,
                        delinquent: this.delinquent
                    };
                    let data = {
                        ContextId: this.recordId
                    };
                    if (this.isGuestUser) {
                        const sendBackEvent = new CustomEvent("creditchecknext", {
                            detail: info
                        });
                        this.dispatchEvent(sendBackEvent);
                        this.loaderSpinner = false;
                    } else {
                        saveACICreditCheck({ myData: data })
                            .then((response) => {
                                const sendBackEvent = new CustomEvent("creditchecknext", {
                                    detail: info
                                });
                                this.dispatchEvent(sendBackEvent);
                                this.loaderSpinner = false;
                            })
                            .catch((error) => {
                                console.error(error, "ERROR");
                                const event = new ShowToastEvent({
                                    title: GENERIC_ERROR,
                                    variant: ERROR_VARIANT,
                                    mode: STICKY_MODE,
                                    message: ORDER_CREATION_ERROR
                                });
                                this.dispatchEvent(event);
                                this.logError(error.body?.message || error.message);
                                this.loaderSpinner = false;
                            });
                    }
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    const event = new ShowToastEvent({
                        title: GENERIC_ERROR,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: ORDER_CREATION_ERROR
                    });
                    this.dispatchEvent(event);
                    this.logError(error.body?.message || error.message);
                    this.loaderSpinner = false;
                });
        }
    }

    getCartPromotions(offerId) {
        this.loaderSpinner = true;
        const path = "cartPromotions";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: offerId,
            sessionId: this.productSelection.sessionId
        };
        console.log("Get Cart Promotions Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Get Cart Promotions Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
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
                    this.loaderSpinner = false;
                } else {
                    result.cartPromotions.forEach((promo) => {
                        promo.isAuto = promo.id === "1-AG6NI5";
                    });
                    this.cartPromotions = [...result.cartPromotions];
                    this.showCartPromotions = this.cartPromotions.length > 0;
                    this.assessRiskRequirements(this.productSelection.offerId);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = REQUEST_COULD_NOT_BE_MADE_ERROR;
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
                this.loaderSpinner = false;
            });
    }

    assessRiskRequirements(offerId) {
        this.loaderSpinner = true;
        const path = "assessRiskRequirements";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: offerId,
            sessionId: this.productSelection.sessionId
        };
        console.log("Assess Risk Requirements Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Assess Risk Requirements Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
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
                    this.loaderSpinner = false;
                } else {
                    this.assessRiskRequired = result.assessRiskRequired;
                    this.handleContentCallout();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = REQUEST_COULD_NOT_BE_MADE_ERROR;
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
                this.loaderSpinner = false;
            });
    }

    updateCartPromotions() {
        this.loaderSpinner = true;
        let promotions = [];
        this.cartPromotions.forEach((promotion) => {
            if (promotion.selected) {
                promotions.push({
                    id: promotion.id,
                    action: "Add"
                });
            }
        });
        const path = "cartPromotions";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: this.productSelection.offerId,
            sessionId: this.productSelection.sessionId,
            cartPromotions: promotions
        };
        console.log("Update Cart Promotions Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Update Cart Promotions Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
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
                    this.loaderSpinner = false;
                } else {
                    this.updatedCartPromotions = result.updatedCartPromotions;
                    this.creditCheck(this.productSelection.offerId);
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = REQUEST_COULD_NOT_BE_MADE_ERROR;
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
                this.loaderSpinner = false;
            });
    }

    handleNamesLength() {
        let namesLength = this.firstName.length + this.lastName.length;
        if (namesLength <= 25) {
            return {
                first: this.firstName,
                last: this.lastName
            };
        } else {
            let diff = namesLength - 25;
            if (this.firstName.length > diff) {
                let value = diff * -1;
                let firstName = this.firstName.slice(0, value);
                console.log(firstName);
                return {
                    first: firstName,
                    last: this.lastName
                };
            } else {
                diff = diff - this.firstName.length + 1;
                let value = diff * -1;
                let firstName = this.firstName.slice(0, 1);
                let lastName = this.lastName.slice(0, value);
                return {
                    first: firstName,
                    last: lastName
                };
            }
        }
    }

    creditCheck(offerId) {
        this.loaderSpinner = true;
        let customerInformation = this.handleNamesLength();
        const path = "creditCheck";
        let myData = {
            path,
            partnerName: CHARTER,
            offerId: offerId,
            sessionId: this.productSelection.sessionId,
            customer: {
                firstName: customerInformation.first,
                middleName: "",
                lastName: customerInformation.last,
                emailAddress: this.email,
                phoneNumber: this.phone
            },
            account: {
                ssn: "",
                dob: this.ccDOB,
                serviceAddress: {
                    addressLine1: this.addressInfo.address,
                    addressLine2: this.addressInfo.hasOwnProperty("apt") ? this.addressInfo.apt : "",
                    city: this.addressInfo.city,
                    state: this.addressInfo.state,
                    zipCode: this.addressInfo.zip
                },
                formerAddress: {
                    addressLine1: this.showPreviousAddress ? this.previousAddress : this.addressInfo.address,
                    addressLine2: this.showPreviousAddress
                        ? this.previousApt !== undefined
                            ? this.previousApt
                            : ""
                        : this.addressInfo.hasOwnProperty("apt")
                        ? this.addressInfo.apt
                        : "",
                    city: this.showPreviousAddress ? this.previousCity : this.addressInfo.city,
                    state: this.showPreviousAddress ? this.previousState : this.addressInfo.state,
                    zipCode: this.showPreviousAddress ? this.previousZip : this.addressInfo.zip
                }
            },
            paperlessBilling: this.paperless,
            runExternalCreditCheck: false
        };
        console.log("Credit Check Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Credit Check Response", result);
                if (result.hasOwnProperty(ERROR_VARIANT)) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("technicalMessage")
                                ? result.error.provider.message.technicalMessage
                                : result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message
                            : result.error.message
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
                    this.prepayment = result.paymentRequirements.prepaymentAmount !== null;
                    this.prepayRequired =
                        result.paymentRequirements.prepaymentRequired ||
                        result.paymentRequirements.prepaymentAmount !== null ||
                        (result.paymentRequirements.delinquentBalance !== ZERO_DOLLARS &&
                            result.paymentRequirements.delinquentBalance !== null);
                    this.prepayInfo = {
                        paymentRequirements: result.paymentRequirements,
                        cart: this.cart,
                        customer: { ...this.getCustomerInfo() }
                    };
                    let prepaymentRequiredMessage = result.paymentRequirements.prepaymentRequired
                        ? PREPAYMENT_REQUIRED.replace("{0}", result.paymentRequirements.prepaymentAmount)
                        : "";
                    let delinquentBalanceFoundMessage =
                        result.paymentRequirements.delinquentBalance !== ZERO_DOLLARS
                            ? DELINQUENT_BALANCE.replace("{0}", result.paymentRequirements.delinquentBalance)
                            : "";
                    this.modalBody = this.prepayRequired
                        ? prepaymentRequiredMessage + " " + delinquentBalanceFoundMessage
                        : NO_PREPAYMENT_REQUIRED;
                    this.showModal = true;
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = REQUEST_COULD_NOT_BE_MADE_ERROR;
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
                this.loaderSpinner = false;
            });
    }

    handlePromotion(event) {
        this.cartPromotions.forEach((promotion) => {
            if (promotion.id === event.target.dataset.id) {
                promotion.selected = event.target.checked;
            }
        });
        if (event.target.dataset.id === "1-AG6NI5") {
            this.autoPay = !this.cartPromotions.filter((promotion) => promotion.id === "1-AG6NI5")[0].selected;
            this.handleCartAutoPay();
        }
    }

    handleCartAutoPay() {
        let internetMonthlyCharges = [...this.cart.monthlyCharges.internet];
        if (!this.showAutoPayEnrollment) {
            if (internetMonthlyCharges.some((item) => item.name === AUTO_PAY_DISCOUNT)) {
                if (!this.autoPay) {
                    internetMonthlyCharges = [
                        ...internetMonthlyCharges.filter((item) => item.name !== AUTO_PAY_DISCOUNT)
                    ];
                }
            } else {
                if (this.autoPay) {
                    internetMonthlyCharges.push(this.autoPayCharge);
                }
            }
        }
        let monthlyTotal = 0;
        let charges = [
            ...internetMonthlyCharges,
            ...this.cart.monthlyCharges.phone,
            ...this.cart.monthlyCharges.mobile
        ];
        let monthlyCharges = {
            internet: internetMonthlyCharges,
            phone: this.cart.monthlyCharges.phone,
            mobile: this.cart.monthlyCharges.mobile
        };
        charges.forEach((charge) => (monthlyTotal = Number(monthlyTotal) + Number(charge.fee)));
        monthlyTotal = (Number(monthlyTotal) + Number(this.cart.monthlyTaxes)).toFixed(2);
        let firstBillTotal = 0;
        this.cart.firstBillCharges.forEach((item) => (firstBillTotal = Number(firstBillTotal) + Number(item.fee)));
        firstBillTotal = Number(
            Number(firstBillTotal) + Number(this.cart.firstBillTaxes) + Number(monthlyTotal)
        ).toFixed(2);
        this.cart = { ...this.cart, monthlyCharges, monthlyTotal, firstBillTotal };
    }

    updateOpp() {
        let myData = {
            Id: this.recordId,
            creditCheckLimitReached: true
        };
        updateOpportunity({ myData: myData })
            .then((response) => {
                let status = response.result.status;
                if (!status) {
                    this.loaderSpinner = false;
                    let error = response.result.error;
                    const event = new ShowToastEvent({
                        title: GENERIC_ERROR,
                        variant: ERROR_VARIANT,
                        mode: STICKY_MODE,
                        message: response.result.error
                    });
                    this.dispatchEvent(event);
                    this.logError(error.body?.message || error.message);
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
                const event = new ShowToastEvent({
                    title: GENERIC_ERROR,
                    variant: ERROR_VARIANT,
                    mode: STICKY_MODE,
                    message: error
                });
                this.dispatchEvent(event);
                this.logError(error.body?.message || error.message);
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: CUSTOMER_VALIDATION_TAB_NAME,
            component: "poe_lwcBuyflowSpectrumApiCreditCheckTab",
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
            tab: CUSTOMER_VALIDATION_TAB_NAME
        };
        this.dispatchEvent(event);
    }
}