import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import ToastContainer from "lightning/toastContainer";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import viasat_Voice_Selection from "@salesforce/label/c.viasat_Voice_Selection";
import viasat_Primary_contact from "@salesforce/label/c.viasat_Primary_contact";
import viasat_United_States from "@salesforce/label/c.viasat_United_States";
import viasat_Eligible from "@salesforce/label/c.viasat_Eligible";
import viasat_Not_Eligible from "@salesforce/label/c.viasat_Not_Eligible";
import viasat_text from "@salesforce/label/c.viasat_text";
import viasat_text_2 from "@salesforce/label/c.viasat_text_2";
import viasat_text_3 from "@salesforce/label/c.viasat_text_3";
import viasat_request_could_not_be_made_correctly from "@salesforce/label/c.viasat_request_could_not_be_made_correctly";
const FUNCTION_TYPE = "ELS";

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

export default class Poe_lwcBuyflowViasatVoiceTab extends NavigationMixin(LightningElement) {
    @api cartInfo;
    @api configurationSelection;
    @api logo;
    @api recordId;
    @api candidates;
    @api clientInfo;
    @api voiceId;
    @api productCandidateId;
    @api selectedAddonsAndOffers;
    @api isGuestUser;
    showLoaderSpinner;
    showCollateral = false;
    disableNext = true;
    address = {};
    contactInfo = {};
    phoneValue = "new";
    phoneOptions = [
        { label: "New number", value: "new" },
        { label: "Port an existing number", value: "port" }
    ];
    directoryListingValue = "";
    directoryListingOptions = [
        { label: "List and Publish", value: "LIST_PUBLISH" },
        { label: "List but Don't Publish", value: "LIST_NOT_PUBLISH" },
        { label: "Don't List and Don't Publish", value: "NOT_LIST_NOT_PUBLISH" }
    ];
    wireOptions = [
        { label: "Wireline", value: "Wireline" },
        { label: "Wireless", value: "Wireless" }
    ];
    wireValue = "";
    newPhoneNumber;
    newNumberOptions = [];
    previousNumberZip;
    newNumberZip;
    showNewPhoneFields = true;
    showPortPhoneFields = false;
    showRefreshButton = false;
    showWirelessFields = false;
    showEAddress = false;
    sameEAddress = true;
    noEAddress = true;
    callerName;
    blockCallerId = false;
    publishAddress = false;
    portPhoneNumber;
    portfolioCardinalityError = false;
    validatedPortPhoneNumber;
    authorizedName;
    directoryType;
    emergencyAddressLine1;
    emergencyAddressLine2;
    emergencyZipCode;
    emergencyCity;
    emergencyState;
    stateOptions = [];
    checkedEligibility = false;
    wirelessAccountNumber;
    wirelessPin;
    showDisclosures = {
        portability: false
    };

    eAddressVerbiage = viasat_text;
    authorizedNameVerbiage = viasat_text_2;
    wireTypeVerbiage = viasat_text_3;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        viasat_Voice_Selection,
        viasat_Primary_contact,
        viasat_United_States,
        viasat_Eligible,
        viasat_Not_Eligible,
        viasat_text,
        viasat_text_2,
        viasat_text_3,
        viasat_request_could_not_be_made_correctly
    };
    showSelfServiceCancelModal = false;
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
        showAddressLookup: true, // true
        streetLabel: "Street Address",
        streetPlaceholder: undefined,
        addressLine2Label: "Address Line 2",
        addressLine2Placeholder: undefined
    };

    get fullAddress() {
        if (this.address?.addressLine2) {
            return this.address.addressLine1 + ", " + this.address.addressLine2;
        }
        return this.address.addressLine1;
    }

    get isInvalidZipCode() {
        return (
            this.newNumberZip?.includes(",") ||
            this.newNumberZip?.includes(".") ||
            Number.isNaN(Number(this.newNumberZip))
        );
    }

    get disableRefreshPhoneNumbers() {
        return !this.newNumberZip || this.newNumberZip.length !== 5 || this.isInvalidZipCode;
    }

    get eligiblePortPhone() {
        return !!this.validatedPortPhoneNumber;
    }

    get notEligiblePortPhone() {
        return !this.eligiblePortPhone;
    }

    get disableCheckEligibility() {
        const regex = /[0-9]{10}/;
        const isValidPhoneNumber = regex.test(this.portPhoneNumber);
        return !this.portPhoneNumber || !isValidPhoneNumber;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        stateNames.forEach((state) => {
            let option = {
                label: state.name,
                value: state.abbrev
            };
            this.stateOptions.push(option);
        });
        this.cart = { ...this.cartInfo };
        this.address = { ...this.clientInfo?.address };
        this.contactInfo = { ...this.clientInfo?.contactInfo };
        this.newNumberZip = this.address?.zipCode;
        this.getAvailablePhoneNumbers();
    }

    handleChange(event) {
        switch (event.target.name) {
            case "newNumberZip":
                this.newNumberZip = event.target.value;
                if (this.isInvalidZipCode) {
                    event.currentTarget.setCustomValidity("Invalid zip code.");
                } else {
                    event.currentTarget.setCustomValidity("");
                }
                event.currentTarget.reportValidity();
                this.showRefreshButton = this.previousNumberZip != event.target.value;
                break;
            case "phoneSelection":
                this.phoneValue = event.target.value;
                switch (event.target.value) {
                    case "new":
                        this.showNewPhoneFields = true;
                        this.showPortPhoneFields = false;
                        break;
                    case "port":
                        this.showNewPhoneFields = false;
                        this.showPortPhoneFields = true;
                        break;
                }
                break;
            case "sameEAddress":
                this.showEAddress = !this.showEAddress;
                this.noEAddress = !this.noEAddress;
                break;
            case "callerName":
                this.callerName = event.target.value;
                break;
            case "blockCallerId":
                this.blockCallerId = !this.blockCallerId;
                break;
            case "directoryType":
                this.directoryListingValue = event.target.value;
                break;
            case "publishAddress":
                this.publishAddress = !this.publishAddress;
                break;
            case "portPhoneNumber":
                this.portPhoneNumber = event.target.value;
                break;
            case "authorizedName":
                this.authorizedName = event.target.value;
                break;
            case "emergencyAddressLine1":
                this.emergencyAddressLine1 = event.target.value;
                break;
            case "emergencyAddressLine2":
                this.emergencyAddressLine2 = event.target.value;
                break;
            case "emergencyZipCode":
                this.emergencyZipCode = event.target.value;
                break;
            case "emergencyCity":
                this.emergencyCity = event.target.value;
                break;
            case "emergencyState":
                if (!!event.target.value)
                    this.emergencyState = this.stateOptions.find((e) => e.value == event.target.value).value;
                break;
            case "numberSelection":
                this.newPhoneNumber = event.target.value;
                break;
            case "wireSelection":
                this.wireValue = event.target.value;
                switch (event.target.value) {
                    case "Wireline":
                        this.showWirelessFields = false;
                        break;
                    case "Wireless":
                        this.showWirelessFields = true;
                        break;
                }
                break;
            case "wirelessAccountNumber":
                this.wirelessAccountNumber = event.target.value;
                break;
            case "wirelessPin":
                this.wirelessPin = event.target.value;
                break;
        }
        this.disableValidations();
    }

    handleAddressChange(event) {
        this.emergencyAddressLine1 = event.detail.street != "" ? event.detail.street : undefined;
        this.emergencyCity = event.detail.city != "" ? event.detail.city : undefined;
        this.emergencyAddressLine2 = event.detail.addressLine2 != "" ? event.detail.addressLine2 : undefined;
        this.emergencyState = event.detail.province != "" ? event.detail.province : undefined;
        this.emergencyZipCode = event.detail.postalCode != "" ? event.detail.postalCode : undefined;

        this.disableValidations();
    }

    handleIntegerKeyPress(event) {
        if (!event.key.match(/^\d$/)) {
            event.preventDefault();
        }
    }

    handlePhoneSelectionChange(event) {
        this.phoneValue = event.target.value;
        switch (event.target.value) {
            case "new":
                this.showNewPhoneFields = true;
                this.showPortPhoneFields = false;
                break;
            case "port":
                this.showNewPhoneFields = false;
                this.showPortPhoneFields = true;
                break;
        }
        this.disableValidations();
    }

    getAvailablePhoneNumbers() {
        this.previousNumberZip = this.newNumberZip;
        this.showLoaderSpinner = true;
        let myData = {
            partnerName: "viasat",
            path: "availableTelephoneNumbers",
            functionType: FUNCTION_TYPE,
            maxResults: "10",
            zipCode: this.newNumberZip
        };
        console.log("Voice - availableTelephoneNumbers Request :", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Voice - availableTelephoneNumbers Response :", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        responseParsed.result.error.hasOwnProperty("provider") &&
                        responseParsed.result.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error
                        : responseParsed.result.error.provider.message.hasOwnProperty("message")
                        ? responseParsed.result.error.provider.message.message
                        : responseParsed.result.error.provider.message;
                    const finalErrorMessage = errorMessage !== "" ? errorMessage : "Internal Server Error";
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: finalErrorMessage
                    });
                    this.showRefreshButton = true;
                    this.showLoaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(
                        `${finalErrorMessage}\nAPI Response: ${apiResponse}`,
                        myData,
                        myData.path,
                        "API Error"
                    );
                } else {
                    let aux = [];
                    responseParsed?.vsm_telephone_number.forEach((number) => {
                        let numberOption = {
                            value: number.phone_number,
                            label: number.phone_number
                        };
                        aux.push(numberOption);
                    });
                    this.newNumberOptions = [];
                    this.newNumberOptions = [...aux];
                    this.showRefreshButton = false;
                    this.showLoaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = this.labels.viasat_request_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.showLoaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    handleRefreshPhone() {
        this.getAvailablePhoneNumbers();
    }

    handleCheckEligibility() {
        this.showLoaderSpinner = true;
        this.checkedEligibility = false;
        let myData = {
            partnerName: "viasat",
            path: "verifyRateCenterPortability",
            telephoneNumber: "1" + this.portPhoneNumber
        };
        console.log("verifyRateCenterPortability - Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("verifyRateCenterPortability - Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        responseParsed.result.error.hasOwnProperty("provider") &&
                        responseParsed.result.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error
                        : responseParsed.result.error.provider.message.hasOwnProperty("message")
                        ? responseParsed.result.error.provider.message.message
                        : responseParsed.result.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage !== "" ? errorMessage : "Internal Server Error"
                    });
                    this.showLoaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                } else if (responseParsed?.vsm_rate_center?.portable == "true") {
                    this.validatedPortPhoneNumber = this.portPhoneNumber;
                    this.checkedEligibility = true;
                    const event = new ShowToastEvent({
                        title: "Eligible!",
                        variant: "success",
                        mode: "sticky",
                        message: `${this.portPhoneNumber} is eligible!`
                    });
                    this.showLoaderSpinner = false;
                    this.dispatchEvent(event);
                } else {
                    this.validatedPortPhoneNumber = "";
                    this.checkedEligibility = true;
                    const event = new ShowToastEvent({
                        title: "Not Eligible",
                        variant: "error",
                        mode: "sticky",
                        message: `${this.portPhoneNumber} is not eligible!`
                    });
                    this.showLoaderSpinner = false;
                    this.dispatchEvent(event);
                }
                this.disableValidations();
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = this.labels.viasat_request_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.showLoaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    handleClick() {
        this.showLoaderSpinner = true;
        let myData = { ...JSON.parse(JSON.stringify(this.configurationSelection)) };
        let phone = this.phoneValue === "new" ? this.newPhoneNumber : `1${this.portPhoneNumber}`;
        let date = new Date();
        this.showDisclosures.portability = this.phoneValue === "port";
        date.setDate(date.getDate() + 30);
        const yyyy = date.getFullYear();
        let mm = date.getMonth() + 1;
        let dd = date.getDate();
        if (dd < 10) dd = "0" + dd;
        if (mm < 10) mm = "0" + mm;
        let voiceData = {
            telephoneNumber: phone,
            firstName: this.contactInfo.firstName,
            lastName: this.contactInfo.lastName,
            callerIdName: this.callerName,
            firstNameSecondary: "",
            directoryListType: this.directoryListingValue,
            numberType: this.phoneValue.toUpperCase(),
            temporaryTelephoneNumber: phone,
            billingTelephoneNumber: phone,
            portingAuthorizedName: this.authorizedName,
            portingWireType: this.wireValue,
            wirelessAccountNumber: this.wirelessAccountNumber,
            wirelessPin: this.wirelessPin,
            disconnectInternetService: "",
            disconnectTelevisionService: "",
            emergencyContactName: this.contactInfo.firstName + " " + this.contactInfo.lastName,
            crdDate: `${yyyy}-${mm}-${dd}`,
            emergency_address: {
                countryCode: "USA",
                addressLine1: this.noEAddress ? this.address.addressLine1 : this.emergencyAddressLine1,
                addressLine2: this.noEAddress ? this.address.addressLine2 : this.emergencyAddressLine2,
                zipCode: this.noEAddress ? this.address.zipCode : this.emergencyZipCode,
                city: this.noEAddress ? this.address.city : this.emergencyCity,
                state: this.noEAddress ? this.address.state : this.emergencyState
            }
        };
        myData.addOnProductId.forEach((item) => {
            if (item.productTypeId === this.voiceId) {
                item.voice = { ...voiceData };
            }
        });
        let apiResponse;
        console.log("Voice - orders request", myData);
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Voice - Orders Response: ", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("result") &&
                        responseParsed.result.hasOwnProperty("error") &&
                        responseParsed.result.error.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error
                        : responseParsed.result.error.provider.message.hasOwnProperty("message")
                        ? responseParsed.result.error.provider.message.message
                        : responseParsed.result.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                    if (errorMessage.includes("Portfolio Cardinality") && this.candidates.length === 0) {
                        this.portfolioCardinalityError = true;
                        this.getSelectedCandidatesAndRemove();
                    } else {
                        this.dispatchEvent(event);
                        this.showLoaderSpinner = false;
                    }
                } else {
                    let cart = { ...this.cart };
                    cart.todayCharges = [];
                    cart.monthlyCharges = [];
                    let cartItems = responseParsed.cart_items;
                    this.productSelected = responseParsed.productTypeId;
                    this.shoppingCartId = responseParsed.shoppingCartId;
                    this.productCandidateId = responseParsed.productCandidateId;
                    cartItems.forEach((item) => {
                        let price =
                            item.prices === null || item.prices.length === 0 ? 0.0 : item.prices[0].amount.value;
                        let newCharge = {
                            name: item.name,
                            fee: Number(price).toFixed(2),
                            discount: Number(price) > 0.0 ? false : true,
                            hasDescription: "",
                            description: "",
                            type: "product"
                        };
                        if (item.prices !== null && item.prices.length > 0 && item.prices[0].recurrence === "Once") {
                            cart.todayCharges.push(newCharge);
                        } else {
                            cart.monthlyCharges.push(newCharge);
                        }
                    });
                    cart.hasMonthly = cart.monthlyCharges.length > 0;
                    cart.hasToday = cart.todayCharges.length > 0;
                    cart.monthlyTotal = (0.0).toFixed(2);
                    cart.todayTotal = (0.0).toFixed(2);
                    cart.monthlyCharges.forEach(
                        (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
                    );
                    cart.todayCharges.forEach(
                        (charge) => (cart.todayTotal = (Number(cart.todayTotal) + Number(charge.fee)).toFixed(2))
                    );
                    this.cart = { ...cart };

                    let info = {
                        shoppingCartId: this.shoppingCartId,
                        productTypeId: this.productSelected,
                        productCandidateId: this.productCandidateId,
                        candidates: this.candidates,
                        cart: this.cart,
                        voiceRequest: myData,
                        showDisclosures: { ...this.showDisclosures }
                    };

                    let voiceSelectionEvent = new CustomEvent("next", {
                        detail: info
                    });
                    this.dispatchEvent(voiceSelectionEvent);

                    this.showLoaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The AddOns request could not be made correctly to the server. Please, try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.showLoaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    getSelectedCandidatesAndRemove() {
        this.showLoaderSpinner = true;
        let productTypeId = this.configurationSelection.productTypeId;
        let salesAgreementId = this.configurationSelection.salesAgreementId;
        let shoppingCartId = this.configurationSelection.shoppingCartId;

        let myData = {
            tab: "order",
            path: "orders",
            partnerName: "viasat",
            productTypeId: productTypeId,
            salesAgreementId: salesAgreementId,
            shoppingCartId: shoppingCartId
        };

        console.log("Get Selected Candidates Request: ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Get Selected Candidates Response: ", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") && responseParsed.error.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error
                        : responseParsed.error.provider.message.hasOwnProperty("message")
                        ? responseParsed.error.provider.message.message
                        : responseParsed.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.showLoaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                } else {
                    let candidates = [];
                    let cartItems = responseParsed.cart_items;
                    cartItems.forEach((item) => {
                        if (this.selectedAddonsAndOffers.some((element) => element === item.product_type_id)) {
                            candidates.push(item.product_candidate_id);
                        }
                    });
                    this.candidates = candidates;
                    if (this.candidates.length > 0) {
                        this.handleRemoveOrders();
                    } else {
                        this.handleClick();
                        this.showLoaderSpinner = false;
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = this.labels.viasat_request_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.showLoaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }
    handleRemoveOrders() {
        this.showLoaderSpinner = true;
        let myData = {
            partnerName: "viasat",
            path: "removeOrders",
            tab: "remove",
            shoppingCartId: this.configurationSelection.shoppingCartId,
            productCandidateIds: [...JSON.parse(JSON.stringify(this.candidates))]
        };
        console.log("Remove Orders Request: ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Remove Orders Response: ", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = responseParsed.hasOwnProperty("error")
                        ? responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error
                        : responseParsed.error.provider.message.hasOwnProperty("message")
                        ? responseParsed.error.provider.message.message
                        : responseParsed.error.provider.message;
                    const finalErrorMessage = errorMessage !== "" ? errorMessage : "Internal Server Error";
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: finalErrorMessage
                    });
                    this.showLoaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(
                        `${finalErrorMessage}\nAPI Response: ${apiResponse}`,
                        myData,
                        myData.path,
                        "API Error"
                    );
                } else {
                    if (this.portfolioCardinalityError) {
                        this.portfolioCardinalityError = false;
                        let candidates = [];
                        let cartItems = responseParsed.cart_items;
                        cartItems.forEach((item) => {
                            if (this.selectedAddonsAndOffers.some((element) => element === item.product_type_id)) {
                                candidates.push(item.product_candidate_id);
                            }
                        });
                        this.candidates = candidates;
                        this.handleClick();
                    } else {
                        this.candidates = [];
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage = this.labels.viasat_request_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
                if (this.candidates.length > 0) {
                    this.handleRemoveOrders();
                }
                this.showLoaderSpinner = false;
            });
    }

    disableValidations() {
        let isEmergencyAddressComplete =
            this.noEAddress ||
            (this.emergencyAddressLine1 && this.emergencyZipCode && this.emergencyCity && this.emergencyState);
        let areRequiredCommonFieldsPresent =
            this.callerName && this.directoryListingValue && isEmergencyAddressComplete;
        let completeInformation;
        if (this.phoneValue == "new") {
            completeInformation = this.newPhoneNumber && this.newNumberZip && areRequiredCommonFieldsPresent;
        } else if (this.phoneValue == "port") {
            let isWireFieldsValid =
                (this.wireValue == "Wireless" && this.wirelessAccountNumber && this.wirelessPin) ||
                this.wireValue == "Wireline";
            completeInformation =
                this.eligiblePortPhone && this.authorizedName && isWireFieldsValid && areRequiredCommonFieldsPresent;
        }
        this.disableNext = !completeInformation;
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleCancel() {
        if (this.isGuestUser) {
            this.showSelfServiceCancelModal = true;
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

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Voice",
            component: "Poe_lwcBuyflowViasatVoiceTab",
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
            tab: "Voice"
        };
        this.dispatchEvent(event);
    }
}