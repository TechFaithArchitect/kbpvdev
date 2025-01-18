import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import chuzo_modalSeeMore from "c/chuzo_modalSeeMore";
import ToastContainer from "lightning/toastContainer";
import ENGA_GEMINI_WIRELESS_DESCRIPTION from "@salesforce/label/c.Enga_Gemini_Wireless_Description";
import ENGA_GEMINI_WIRELESS_LABEL_PAIR from "@salesforce/label/c.Enga_Gemini_Wireless_Label_Pair";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import DO_FEE_PRODUCT_ID from "@salesforce/label/c.POE_DO_Fee_Product_Id";
import dtvSelectDeviceMessage from "@salesforce/label/c.DIRECTV_Select_a_Device_Message";
import dtvGeminiOption from "@salesforce/label/c.DIRECTV_Gemini";
import dtvGenieMiniOption from "@salesforce/label/c.DIRECTV_Genie_Mini";

const MAIN_GENIE2 = "OF_DEVICE-GENIE-2-WIRELESS-V1_sales_satellite";
const MAIN_GENIE = "OF_DEVICE-GENIE-HD-DVR-V1_sales_satellite";
const ADDTL_GEMINI = "OF_DEVICE-GEMINI-WIRELESS-V2_sales_satellite";
const ADDTL_GENIE_MINI_GENIE2 = "OF_DEVICE-GENIE-MINI-WIRELESS-V3_sales_satellite";
const ADDTL_4K = "OF_DEVICE-GENIE-MINI-4K_sales_satellite";
const ADDTL_WIRED_GENIE = "OF_DEVICE-GENIE-MINI-V2_sales_satellite";
const ORIG_GEMINI_WIRELESS_DISPLAY_NAME = ENGA_GEMINI_WIRELESS_LABEL_PAIR.split(";")[0];
const NEW_WIRELESS_GEMINI_DISPLAY_NAME = ENGA_GEMINI_WIRELESS_LABEL_PAIR.split(";")[1];

export default class Poe_lwcSelfServiceDirecTvHardwareBeamTab extends NavigationMixin(LightningElement) {
    @api orderInfo;
    @api origin;
    @api logo;
    @api recordId;
    @api cartInfo;
    @api treatmentCode;
    @api isGuestUser;
    @api providerStyle;
    @api hardwareOptionsResponse;
    @api cartRequest;
    @api billingInfo;

    //PER-3833
    disableTvPlus = false;
    disableTvMinus = true;
    disableHardwareSum = true;
    disableHardwareMin = false;
    disableGinieMin = true;
    disableGinieTwoMin = false;
    disableGinieSum = false;
    disableGinieTwoSum = true;

    isNotGuestUser;
    offers;
    protections;
    showCollateral;
    originalCart;
    hardwareCart;
    cart = {
        orderNumber: "",
        todayCharges: [],
        hasToday: false,
        monthlyCharges: [],
        hasMonthly: false,
        monthlyTotal: 0.0,
        todayTotal: 0.0,
        firstBillTotal: (0.0).toFixed(2),
        hasFirstBill: false,
        firstBillCharges: [],
        hasSavings: false,
        savingsCharges: []
    };
    loaderSpinner;
    showSBS = false;
    chosenOption;
    pageTitle = "Number of TVs";
    changeOfTvs;
    numberOfTVs = 1;
    numberOfDevicesAvailable = 1;
    numberOfDevicesAvailableAlternative = 0;
    numberOfDevicesSelected = 0;
    beamHardwareOptions = [];
    beamHardwareSubOptions = [];
    showAdditionalHardwareSelection = false;
    additionalHardwareOptions = [];
    additionalHardware = {};
    alternativeHardwareOptionsOpen = false;
    additionalHardwareOptionsList = [];
    geminiSelected = true;
    deviceTypeValue = "gemini";
    dtvSelectDeviceLabel = dtvSelectDeviceMessage;
    initialLoad;
    phonesalesOrigin = false;
    alternativeHardwareButtonText = "Alternative Hardware Options";
    alternativeHardwareCart;
    billingDetailsRequest = {};
    showModal = false;
    modalTitle;
    genieSuggestion;
    equipmentDisclosure;
    modalBody;
    modalButton;
    showStep = {
        tvSelection: true,
        mainHardware: false
    };
    valNumberTv = 1;
    directTvGenie = {
        quantity: 0,
        fee: 0.0,
        id: MAIN_GENIE,
        description: ""
    };
    directTvGenieTwo = {
        quantity: 1,
        fee: 0.0,
        id: MAIN_GENIE2,
        description: ""
    };
    subOptions = {
        wirelessGenieMini: {
            quantity: 0,
            fee: 0.0,
            id: ADDTL_GENIE_MINI_GENIE2,
            description: "",
            show: true
        },
        genieMini: {
            quantity: 0,
            fee: 0.0,
            id: ADDTL_4K,
            description: "",
            show: true
        },
        wirelessGemini: {
            quantity: 0,
            fee: 0.0,
            id: ADDTL_GEMINI,
            description: "",
            show: true
        },
        wiredGenieMini: {
            quantity: 0,
            fee: 0.0,
            id: ADDTL_WIRED_GENIE,
            description: "",
            show: true
        }
    };
    showSubOptions = true;
    title;
    disableNext = false;

    get hideSBS() {
        return !this.showSBS;
    }

    get iconCheckBlue() {
        return chuzoSiteResources + "/images/icon-check-blue.svg";
    }

    get notPhonesalesOrigin() {
        return !this.phonesalesOrigin;
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconNumberTV() {
        return chuzoSiteResources + "/images/icon-number-tv.svg";
    }

    get iconDeviceWireless() {
        return chuzoSiteResources + "/images/icon-device-2.svg";
    }

    get iconDeviceWire() {
        return chuzoSiteResources + "/images/icon-device-1.svg";
    }

    get nextBtnDesktopClass() {
        return `btn-rounded btn-center hide-mobile ${this.disableNext && "btn-disabled"}`;
    }

    get nextBtnMobileClass() {
        return `btn-rounded btn-center ${this.disableNext && "btn-disabled"}`;
    }

    get enableTvPlus() {
        return !this.disableTvPlus;
    }

    get enableTvMinus() {
        return !this.disableTvMinus;
    }

    get enableHardwareSum() {
        return !this.disableHardwareSum;
    }

    get enableHardwareMin() {
        return !this.disableHardwareMin;
    }

    get enableGinieMin() {
        return !this.disableGinieMin;
    }
    get enableGinieTwoMin() {
        return !this.disableGinieTwoMin;
    }
    get enableGinieSum() {
        return !this.disableGinieSum;
    }
    get enableGinieTwoSum() {
        return !this.disableGinieTwoSum;
    }

    get deviceTypeOptions() {
        return [
            { label: dtvGeminiOption, value: "gemini" },
            { label: dtvGenieMiniOption, value: "genieMini" }
        ];
    }

    connectedCallback() {
        this.isNotGuestUser = !this.isGuestUser;
        this.title = this.isGuestUser
            ? "How many TV’s would you like to connect?"
            : "How many TV’s would the customer like to connect?";
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        this.cart = { ...this.cartInfo };
        this.originalCart = { ...this.cartInfo };
        this.initialLoad = true;
        this.phonesalesOrigin = this.origin === "phonesales";
        this.loaderSpinner = true;
        Promise.all([this.handleCallCms(), this.handleRemoveCart()])
            .then(() => {})
            .catch(() => {})
            .finally(() => {
                this.loaderSpinner = false;

                if (this.beamHardwareOptions?.length > 0) {
                    chuzo_modalSeeMore.open().then((result) => {
                        if (result == "okay") {
                            this.handleMainDevicesDisplay();
                            this.handleSubOptionsDisplay();
                        } else {
                            this.handleBack();
                        }
                    });
                }
            });
    }

    handleRemoveCart() {
        const path = "removeCart";
        let myData = {
            path,
            ...this.orderInfo
        };
        this.stream ? (myData.selectedBaseOfferCode = this.orderInfo.componentCode) : undefined;
        console.log("Remove Cart Request", myData);
        let apiResponse;
        return callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Remove Cart Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
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
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    handleCallCms() {
        let contentDetails = [];
        let content = ["EQUIPMENT_DISCLOSURE", "GENIE_SUGGESTION_DISCLOSURE"];
        content.forEach((item) => {
            let detail = {
                content: item,
                subChannel: this.orderInfo.subChannel,
                stateId: "ALL",
                systemId: "",
                channel: this.orderInfo.channel
            };
            contentDetails.push(detail);
        });
        const path = "cmsUrl";
        let myData = {
            path,
            systemCode: this.orderInfo.systemCode,
            correlationId: this.orderInfo.correlationId,
            partnerName: "enga",
            contentDetails
        };
        console.log("CMSurl Request", myData);
        let apiResponse;

        return callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("CMSurl Response", result);
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
                    this.equipmentDisclosure = result[0].cmsContent;
                    this.genieSuggestion = result[1].cmsContent;
                    this.generateBeamHardwareOptions();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The CMSurl request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    generateBeamHardwareOptions() {
        let equipments = [...this.hardwareOptionsResponse];
        let options = [];
        equipments.forEach((hardwareOption) => {
            if (hardwareOption.product[0].deviceDisplayCategory.toLowerCase() === "primary") {
                let item = { ...hardwareOption };
                let option = {
                    Id: item.offerCode,
                    usoc: item.product[0].billingProductCode,
                    quantity: item.fullDisplayName,
                    description: item.fullDescription,
                    terms: item.product[0].termsAndConditions,
                    due: Number(
                        Number(item.childSkus[0].price.basePrice) -
                            Number(
                                item.childSkus[0].price.productBenefitsInfo.benefits.length > 0
                                    ? item.childSkus[0].price.productBenefitsInfo.benefits[0].benefitFlattOffPrice
                                    : 0
                            )
                    ).toFixed(2),
                    price: `$${Number(
                        Number(item.childSkus[0].price.basePrice) -
                            Number(
                                item.childSkus[0].price.productBenefitsInfo.benefits.length > 0
                                    ? item.childSkus[0].price.productBenefitsInfo.benefits[0].benefitFlattOffPrice
                                    : 0
                            )
                    ).toFixed(2)}`,
                    originalResponse: { ...item },
                    subOptions:
                        item.product[0].compatibleDevices[0].products !== null
                            ? [...item.product[0].compatibleDevices[0].products]
                            : [],
                    isChecked: false,
                    displayOrder: item.product[0].displayRanking,
                    minSelected: item.minSelected
                };
                options.push(option);
            } else {
                let option = { ...hardwareOption };
                if (hardwareOption.fullDisplayName === ORIG_GEMINI_WIRELESS_DISPLAY_NAME) {
                    // The text coming from the API was replaced by this text as per Henry Drakeford on 10/31/2023.
                    option = {
                        ...option,
                        fullDisplayName: NEW_WIRELESS_GEMINI_DISPLAY_NAME,
                        fullDescription: ENGA_GEMINI_WIRELESS_DESCRIPTION
                    };
                }
                this.beamHardwareSubOptions.push(option);
            }
        });
        options.sort((a, b) => (a.displayOrder > b.displayOrder ? -1 : a.displayOrder < b.displayOrder ? 1 : 0));
        this.beamHardwareOptions = [...options];
    }

    handleMainDevicesDisplay() {
        let genie2 = [...this.beamHardwareOptions.filter((e) => e.Id === MAIN_GENIE2)][0];
        let genie = [...this.beamHardwareOptions.filter((e) => e.Id === MAIN_GENIE)][0];
        this.directTvGenie = {
            quantity: 0,
            fee: genie.price === "$0.00" ? "Included for free." : `One-time pay of ${genie.price}`,
            id: genie.Id,
            description: genie.description,
            terms: genie.terms,
            label: genie.originalResponse.shortDisplayName
        };
        this.directTvGenieTwo = {
            quantity: 1,
            fee: genie2.price === "$0.00" ? "Included for free." : `One-time pay of ${genie2.price}`,
            id: genie2.Id,
            description: genie2.description,
            terms: genie2.terms,
            label: genie2.originalResponse.shortDisplayName
        };
    }

    handleChange(event) {
        this.deviceTypeValue = event.target.value;
        this.geminiSelected = this.deviceTypeValue === "gemini" ? true : false;
        let wirelessGenieMini = {};
        let wirelessGemini = {};
        let genieMini = {};
        let wiredGenieMini = {};

        if (this.geminiSelected) {
            wirelessGenieMini = { ...this.subOptions.wirelessGenieMini, show: false, quantity: 0 };
            genieMini = { ...this.subOptions.genieMini, show: false, quantity: 0 };
            wirelessGemini = { ...this.subOptions.wirelessGemini, show: true };
            wiredGenieMini = { ...this.subOptions.wiredGenieMini, show: false, quantity: 0 };
        } else {
            wirelessGenieMini = { ...this.subOptions.wirelessGenieMini, show: true };
            genieMini = {
                ...this.subOptions.genieMini,
                show: true
            };
            wiredGenieMini = { ...this.subOptions.wiredGenieMini, show: this.directTvGenie.quantity > 0 };
            wirelessGemini = { ...this.subOptions.wirelessGemini, show: false, quantity: 0 };
        }

        this.subOptions = {
            wirelessGenieMini: { ...wirelessGenieMini },
            genieMini: { ...genieMini },
            wirelessGemini: { ...wirelessGemini },
            wiredGenieMini: { ...wiredGenieMini }
        };

        this.disableHardwareSum = false;
        this.disableHardwareMin = true;
        this.validateDisplay();
    }

    handleSubOptionsDisplay() {
        let wirelessGenieMini = {};
        let wirelessGemini = {};
        let genieMini = {};
        let wiredGenieMini = {};
        this.beamHardwareSubOptions.forEach((item) => {
            let fee =
                item.childSkus[0].price.basePrice == 0
                    ? "Included for free."
                    : `One-time pay of $${Number(item.childSkus[0].price.basePrice).toFixed(2)}`;
            let description = item.fullDescription;
            if (item.offerCode === ADDTL_GENIE_MINI_GENIE2) {
                wirelessGenieMini = { ...this.subOptions.wirelessGenieMini, fee: fee, description: description };
            } else if (item.offerCode === ADDTL_GEMINI) {
                wirelessGemini = { ...this.subOptions.wirelessGemini, fee: fee, description: description };
            } else if (item.offerCode === ADDTL_4K) {
                genieMini = {
                    ...this.subOptions.genieMini,
                    fee: fee,
                    description: description
                };
            } else if (item.offerCode === ADDTL_WIRED_GENIE) {
                wiredGenieMini = {
                    ...this.subOptions.wiredGenieMini,
                    fee: fee,
                    description: description
                };
            }
        });
        this.subOptions = {
            wirelessGenieMini: { ...wirelessGenieMini },
            genieMini: { ...genieMini },
            wirelessGemini: { ...wirelessGemini },
            wiredGenieMini: { ...wiredGenieMini }
        };
    }

    handleCancel() {
        if (this.isGuestUser) {
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

    changeValInputToMin(event) {
        if (event.target.dataset.id === "valNumberTv") {
            if (this[event.target.dataset.id] != undefined && this[event.target.dataset.id] > 1) {
                this[event.target.dataset.id]--;
                this.disableTvPlus = false;
                if (this[event.target.dataset.id] == 1) {
                    this.disableTvMinus = true;
                }
            } else {
                this[event.target.dataset.id] = 1;
            }
            this.numberOfTVs = this[event.target.dataset.id];
        } else if (event.target.dataset.id === "directTvGenie.quantity") {
            if (this[event.target.dataset.id] != undefined && this[event.target.dataset.id] > 0) {
                this[event.target.dataset.id]--;
            } else {
                let genieObject = { ...this.directTvGenie, quantity: 0 };
                this.directTvGenie = { ...genieObject };
                this.disableGinieMin = true;
                this.disableGinieSum = false;
            }
        } else if (event.target.dataset.id === "directTvGenieTwo.quantity") {
            if (this[event.target.dataset.id] != undefined && this[event.target.dataset.id] > 0) {
                this[event.target.dataset.id]--;
            } else {
                let genieTwoObject = { ...this.directTvGenieTwo, quantity: 0 };
                this.directTvGenieTwo = { ...genieTwoObject };
                this.disableGinieTwoMin = true;
                this.disableGinieTwoSum = false;
            }
        }
        this.validateDisplay();
    }

    handleMinusHardware(event) {
        this.disableHardwareSum = false;
        let wirelessGenieMini = { ...this.subOptions.wirelessGenieMini };
        let genieMini = { ...this.subOptions.genieMini };
        let wirelessGemini = { ...this.subOptions.wirelessGemini };
        let wiredGenieMini = { ...this.subOptions.wiredGenieMini };
        let devicesAvailable = this.directTvGenie.quantity === 1 ? this.valNumberTv - 1 : this.valNumberTv;
        let devicesSelected =
            this.subOptions.genieMini.quantity +
            this.subOptions.wirelessGemini.quantity +
            this.subOptions.wirelessGenieMini.quantity +
            this.subOptions.wiredGenieMini.quantity;
        let netAvailable = devicesAvailable - devicesSelected;
        let selection;
        switch (event.target.dataset.id) {
            case "wirelessGenieMini":
                selection = "genie";
                break;
            case "directTvGenie":
                selection = "4k";
                break;
            case "wirelessGemini":
                selection = "gemini";
                break;
            case "wiredGenieMini":
                selection = "wired";
                break;
        }
        if (selection === "genie") {
            if (wirelessGenieMini.quantity === 0) {
                return;
            } else {
                let newQuantity = wirelessGenieMini.quantity - 1;
                wirelessGenieMini = { ...wirelessGenieMini, quantity: newQuantity };
            }
        } else if (selection === "4k") {
            if (genieMini.quantity === 0) {
                return;
            } else {
                let newQuantity = genieMini.quantity - 1;
                genieMini = { ...genieMini, quantity: newQuantity };
            }
        } else if (selection === "gemini") {
            if (wirelessGemini.quantity === 0) {
                return;
            } else {
                let newQuantity = wirelessGemini.quantity - 1;
                wirelessGemini = { ...wirelessGemini, quantity: newQuantity };
            }
        } else if (selection === "wired") {
            if (wiredGenieMini.quantity === 0) {
                return;
            } else {
                let newQuantity = wiredGenieMini.quantity - 1;
                wiredGenieMini = { ...wiredGenieMini, quantity: newQuantity };
            }
        }

        if (netAvailable == devicesAvailable - 1) {
            this.disableHardwareMin = true;
        }
        this.subOptions = {
            wirelessGenieMini: { ...wirelessGenieMini },
            genieMini: { ...genieMini },
            wirelessGemini: { ...wirelessGemini },
            wiredGenieMini: { ...wiredGenieMini }
        };
        this.validateDisplay();
    }

    handleSumHardware(event) {
        this.disableHardwareMin = false;
        let wirelessGenieMini = { ...this.subOptions.wirelessGenieMini };
        let genieMini = { ...this.subOptions.genieMini };
        let wirelessGemini = { ...this.subOptions.wirelessGemini };
        let wiredGenieMini = { ...this.subOptions.wiredGenieMini };
        let devicesAvailable = this.directTvGenie.quantity === 1 ? this.valNumberTv - 1 : this.valNumberTv;
        let devicesSelected =
            this.subOptions.genieMini.quantity +
            this.subOptions.wirelessGemini.quantity +
            this.subOptions.wirelessGenieMini.quantity +
            this.subOptions.wiredGenieMini.quantity;
        let netAvailable = devicesAvailable - devicesSelected;
        if (netAvailable == 1) {
            this.disableHardwareSum = true;
        }
        if (netAvailable == 0) {
            this.showLimitToast();
            return;
        }
        let selection;
        switch (event.target.dataset.id) {
            case "wirelessGenieMini":
                selection = "genie";
                break;
            case "directTvGenie":
                selection = "4k";
                break;
            case "wirelessGemini":
                selection = "gemini";
                break;
            case "wiredGenieMini":
                selection = "wired";
                break;
        }
        if (selection === "genie") {
            let newQuantity = wirelessGenieMini.quantity + 1;
            wirelessGenieMini = { ...wirelessGenieMini, quantity: newQuantity };
        } else if (selection === "4k") {
            let newQuantity = genieMini.quantity + 1;
            genieMini = { ...genieMini, quantity: newQuantity };
        } else if (selection === "gemini") {
            let newQuantity = wirelessGemini.quantity + 1;
            wirelessGemini = { ...wirelessGemini, quantity: newQuantity };
        } else if (selection === "wired") {
            let newQuantity = wiredGenieMini.quantity + 1;
            wiredGenieMini = { ...wiredGenieMini, quantity: newQuantity };
        }
        this.subOptions = {
            wirelessGenieMini: { ...wirelessGenieMini },
            genieMini: { ...genieMini },
            wirelessGemini: { ...wirelessGemini },
            wiredGenieMini: { ...wiredGenieMini }
        };
        this.validateDisplay();
    }

    changeValInputToSum(event) {
        if (event.target.dataset.id === "valNumberTv") {
            if (this[event.target.dataset.id] != undefined && this[event.target.dataset.id] < 8) {
                this[event.target.dataset.id]++;
                this.disableTvMinus = false;
            } else {
                this[event.target.dataset.id] = 8;
            }
            this.numberOfTVs = this[event.target.dataset.id];
        } else if (event.target.dataset.id === "directTvGenie.quantity") {
            if (this[event.target.dataset.id] != undefined && this[event.target.dataset.id] > 1) {
                this[event.target.dataset.id]--;
            } else {
                let genieObject = { ...this.directTvGenie, quantity: 1 };
                this.directTvGenie = { ...genieObject };
                let genieTwoObject = { ...this.directTvGenieTwo, quantity: 0 };
                this.directTvGenieTwo = { ...genieTwoObject };
                this.setGenieDefaultOptions();
                this.disableGinieSum = true;
                this.disableGinieMin = false;
                this.disableGinieTwoSum = false;
                this.disableGinieTwoMin = true;
                this.disableHardwareSum = false;
                this.disableHardwareMin = true;
            }
        } else if (event.target.dataset.id === "directTvGenieTwo.quantity") {
            if (this[event.target.dataset.id] != undefined && this[event.target.dataset.id] > 1) {
                this[event.target.dataset.id]--;
            } else {
                let genieObject = { ...this.directTvGenie, quantity: 0 };
                this.directTvGenie = { ...genieObject };
                let genieTwoObject = { ...this.directTvGenieTwo, quantity: 1 };
                this.directTvGenieTwo = { ...genieTwoObject };
                this.setGenie2DefaultOptions();
                this.disableGinieTwoSum = true;
                this.disableGinieTwoMin = false;
                this.disableGinieSum = false;
                this.disableGinieMin = true;
                this.disableHardwareSum = true;
                this.disableHardwareMin = false;
            }
        }
        this.validateDisplay();
    }

    showLimitToast(netAvailable) {
        const event = new ShowToastEvent({
            title: "Receiver Limit Reached",
            variant: "warning",
            mode: "sticky",
            message: `No receivers left to be selected. Please increase the TV's amount to select more.`
        });
        this.dispatchEvent(event);
    }

    setGenieDefaultOptions() {
        this.chosenOption = {
            Id: MAIN_GENIE,
            quantity: 1,
            disclosure: this.directTvGenie.terms,
            shortName: this.directTvGenie.label
        };
        this.deviceTypeValue = "genieMini";
        this.geminiSelected = false;
        let wirelessGenieMini = {
            ...this.subOptions.wirelessGenieMini,
            quantity: 0,
            show: true
        };
        let genieMini = {
            ...this.subOptions.genieMini,
            quantity: 0,
            show: true
        };
        let wirelessGemini = {
            ...this.subOptions.wirelessGemini,
            quantity: 0,
            show: false
        };
        let wiredGenieMini = {
            ...this.subOptions.wiredGenieMini,
            quantity: 0,
            show: true
        };
        let subOptions = {
            wirelessGenieMini: { ...wirelessGenieMini },
            genieMini: { ...genieMini },
            wirelessGemini: { ...wirelessGemini },
            wiredGenieMini: { ...wiredGenieMini }
        };
        this.subOptions = { ...subOptions };
    }

    setGenie2DefaultOptions() {
        this.chosenOption = {
            Id: MAIN_GENIE2,
            quantity: 1,
            disclosure: this.directTvGenieTwo.terms,
            shortName: this.directTvGenieTwo.label
        };
        this.deviceTypeValue = "gemini";
        this.geminiSelected = true;
        let wirelessGenieMini = {
            ...this.subOptions.wirelessGenieMini,
            quantity: 0,
            show: Number(this.valNumberTv) == 1
        };
        let genieMini = {
            ...this.subOptions.genieMini,
            quantity: 0,
            show: Number(this.valNumberTv) == 1
        };
        let wirelessGemini = {
            ...this.subOptions.wirelessGemini,
            quantity: this.valNumberTv,
            show: true
        };
        let wiredGenieMini = {
            ...this.subOptions.wiredGenieMini,
            quantity: 0,
            show: false
        };
        let subOptions = {
            wirelessGenieMini: { ...wirelessGenieMini },
            genieMini: { ...genieMini },
            wirelessGemini: { ...wirelessGemini },
            wiredGenieMini: { ...wiredGenieMini }
        };
        this.subOptions = { ...subOptions };
    }

    validateDisplay() {
        let devicesAvailable = this.directTvGenie.quantity === 1 ? this.valNumberTv - 1 : this.valNumberTv;
        this.showSubOptions = devicesAvailable > 0;
        this.handleButton(devicesAvailable);
    }

    handleButton(devicesAvailable) {
        let enableButton =
            this.showStep.tvSelection ||
            ((this.directTvGenie.quantity > 0 || this.directTvGenieTwo.quantity) > 0 &&
                devicesAvailable -
                    (this.subOptions.genieMini.quantity +
                        this.subOptions.wirelessGemini.quantity +
                        this.subOptions.wirelessGenieMini.quantity +
                        this.subOptions.wiredGenieMini.quantity) ===
                    0);
        if (enableButton) {
            this.disableNext = false;
            if (this.showStep.mainHardware) {
                this.handleBillingDetailsCallout();
            }
        } else {
            this.disableNext = true;
        }
    }

    resetDisplay(next) {
        this.handleMainDevicesDisplay();
        this.setGenie2DefaultOptions();
        if (next) {
            this.handleBillingDetailsCallout();
        } else {
            this.cart = { ...this.cartInfo };
            this.dispatchEvent(
                new CustomEvent("cartupdate", {
                    detail: this.cart
                })
            );
        }
    }

    handleNext() {
        let validation = { ...this.showStep };
        this.disableHardwareSum = true;
        this.disableHardwareMin = false;
        this.disableGinieMin = true;
        this.disableGinieTwoMin = false;
        this.disableGinieSum = false;
        this.disableGinieTwoSum = true;
        if (this.showStep.tvSelection) {
            validation.tvSelection = false;
            validation.mainHardware = true;
            this.showStep = { ...validation };
            this.title = this.isGuestUser ? "Customize your devices" : "Customize devices";
            this.resetDisplay(true);
        } else {
            this.handleAddCart();
        }
    }

    handleAddCart() {
        this.loaderSpinner = true;
        let myData = { ...this.cartRequest };
        let itemsList = [];
        let mainHardware = {
            offerId: this.chosenOption.Id,
            quantity: 1,
            action: "ADD",
            itemType: "HARDGOOD",
            productGroup: "DTVS"
        };
        itemsList.push(mainHardware);
        if (this.subOptions.genieMini.quantity > 0) {
            let offer = {
                offerId: ADDTL_4K,
                quantity: Number(this.subOptions.genieMini.quantity),
                action: "ADD",
                itemType: "HARDGOOD",
                productGroup: "DTVS"
            };
            itemsList.push(offer);
        }
        if (this.subOptions.wirelessGemini.quantity > 0) {
            let offer = {
                offerId: ADDTL_GEMINI,
                quantity: Number(this.subOptions.wirelessGemini.quantity),
                action: "ADD",
                itemType: "HARDGOOD",
                productGroup: "DTVS"
            };
            itemsList.push(offer);
        }
        if (this.subOptions.wirelessGenieMini.quantity > 0) {
            let offer = {
                offerId: ADDTL_GENIE_MINI_GENIE2,
                quantity: Number(this.subOptions.wirelessGenieMini.quantity),
                action: "ADD",
                itemType: "HARDGOOD",
                productGroup: "DTVS"
            };
            itemsList.push(offer);
        }
        if (this.subOptions.wiredGenieMini.quantity > 0) {
            let offer = {
                offerId: ADDTL_WIRED_GENIE,
                quantity: Number(this.subOptions.wiredGenieMini.quantity),
                action: "ADD",
                itemType: "HARDGOOD",
                productGroup: "DTVS"
            };
            itemsList.push(offer);
        }
        myData.itemsList = [...myData.itemsList, ...itemsList];
        console.log("Add Cart Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Add Cart Response", result);
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
                    this.handleClick();
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.serviceabilityCallout = {};
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
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.loaderSpinner = false;
            });
    }

    handleBack() {
        this.disableHardwareSum = true;
        this.disableHardwareMin = false;
        if (this.showStep.tvSelection) {
            const sendBackEvent = new CustomEvent("back");
            this.dispatchEvent(sendBackEvent);
        } else {
            let validation = { ...this.showStep };
            validation.mainHardware = false;
            validation.tvSelection = true;
            this.showStep = { ...validation };
            this.title = this.isGuestUser
                ? "How many TV’s would you like to connect?"
                : "How many TV’s would the customer like to connect?";

            this.disableNext = false;
            this.resetDisplay(false);
        }
    }

    sbsHandler() {
        this.showSBS = true;
    }

    hideSBS() {
        this.showSBS = false;
    }

    handleBillingDetailsCallout() {
        this.loaderSpinner = true;
        const path = "addBillingAccount";
        let billingData = { ...this.billingInfo };
        let myData = {
            path,
            ...this.orderInfo,
            treatmentCode: this.treatmentCode,
            customerEligibility: {
                zipCode: [this.orderInfo.address.zipCode],
                county: [this.orderInfo.address.county]
            },
            migrationIndicator: false,
            validateCart: true,
            reconnectCustomer: false,
            serviceEndDate: "",
            salesChannel: ["directIntegrationPartner"],
            cartContext: {
                cartOffers: [...billingData.cartContext.cartOffers]
            },
            customerContext: {
                satellite: {
                    acceptPaperlessBillEnrollment: true,
                    acceptAutoBillPayEnrollment: true,
                    isActive: false,
                    serviceAddress: {
                        streetAddress: this.orderInfo.address.addressLine1,
                        city: this.orderInfo.address.city,
                        state: this.orderInfo.address.state,
                        zipCode: this.orderInfo.address.zipCode
                    },
                    businessSegment: "REG",
                    accountStatus: "PEND"
                }
            },
            billingSystem: "STMS",
            channelEligibility: {
                isFulfillmentDealer: !this.orderInfo.NFFL
            },
            marketingSourceCode: [this.orderInfo.marketingSourceCode],
            offerActionType: ["Acquisition"]
        };
        let mainHardware = {
            offerCode: this.chosenOption.Id,
            quantity: 1
        };
        myData.cartContext.cartOffers.push(mainHardware);
        if (this.subOptions.genieMini.quantity > 0) {
            let offer = {
                offerCode: ADDTL_4K,
                quantity: Number(this.subOptions.genieMini.quantity)
            };
            myData.cartContext.cartOffers.push(offer);
        }
        if (this.subOptions.wirelessGemini.quantity > 0) {
            let offer = {
                offerCode: ADDTL_GEMINI,
                quantity: Number(this.subOptions.wirelessGemini.quantity)
            };
            myData.cartContext.cartOffers.push(offer);
        }
        if (this.subOptions.wirelessGenieMini.quantity > 0) {
            let offer = {
                offerCode: ADDTL_GENIE_MINI_GENIE2,
                quantity: Number(this.subOptions.wirelessGenieMini.quantity)
            };
            myData.cartContext.cartOffers.push(offer);
        }
        if (this.subOptions.wiredGenieMini.quantity > 0) {
            let offer = {
                offerCode: ADDTL_WIRED_GENIE,
                quantity: Number(this.subOptions.wiredGenieMini.quantity)
            };
            myData.cartContext.cartOffers.push(offer);
        }
        delete myData.marketingSourceCode;
        console.log("Billing Details Request", myData);
        let apiResponse;
        this.billingDetailsRequest = { ...myData };

        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Billing Details Response", result);
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
                    this.loaderSpinner = false;
                } else {
                    this.updateCart(result);
                }
            })
            .catch((error) => {
                this.serviceabilityCallout = {};
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
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.loaderSpinner = false;
            });
    }

    updateCart(result) {
        let cart = {
            orderNumber: this.orderInfo.orderNumber,
            todayCharges: [],
            hasToday: false,
            monthlyCharges: [],
            hasMonthly: false,
            monthlyTotal: 0.0,
            todayTotal: 0.0,
            firstBillTotal: (0.0).toFixed(2),
            hasFirstBill: false,
            firstBillCharges: [],
            hasSavings: false,
            savingsCharges: []
        };
        let accessories = [];
        let rebates = [];
        result.content.lineItemList.forEach((item) => {
            let lineItem = item.lineItem;

            if (lineItem?.lineItemIdentifier?.productName === ORIG_GEMINI_WIRELESS_DISPLAY_NAME) {
                lineItem.lineItemIdentifier.productName = NEW_WIRELESS_GEMINI_DISPLAY_NAME;
            }

            if (lineItem.lineItemIdentifier.productId === DO_FEE_PRODUCT_ID) {
                lineItem.lineItemIdentifier.productName = "One time non-refundable credit fee";
            }

            if (
                lineItem.lineItemType === "offer" &&
                lineItem.lineItemIdentifier.productId === "Today" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("taxLineItems")
            ) {
                lineItem.customData.taxLineItems.forEach((taxItem) => {
                    if (taxItem.value != 0) {
                        let newTaxCharge = {
                            name: taxItem.name,
                            order: 3,
                            fee: Number(taxItem.value).toFixed(2),
                            feeTerm: "Today",
                            discount: Number(taxItem.value) <= 0,
                            hasDescription: false,
                            description: "",
                            type: "tax"
                        };
                        cart.hasToday = true;
                        cart.todayCharges.push(newTaxCharge);
                    }
                });
            } else if (
                lineItem.lineItemType === "offer" &&
                lineItem.lineItemIdentifier.productId === "Recurring" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("taxLineItems")
            ) {
                lineItem.customData.taxLineItems.forEach((taxItem) => {
                    if (taxItem.value != 0) {
                        let newTaxCharge = {
                            name: taxItem.name,
                            order: 3,
                            fee: Number(taxItem.value).toFixed(2),
                            feeTerm: "Monthly",
                            discount: Number(taxItem.value) <= 0,
                            hasDescription: false,
                            description: "",
                            type: "tax"
                        };
                        cart.hasMonthly = true;
                        cart.monthlyCharges.push(newTaxCharge);
                    }
                });
            } else if (
                lineItem.lineItemType === "virtual" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "fee"
            ) {
                if (lineItem.price.subTotalAmount != 0) {
                    let newFeeCharge = {
                        name: lineItem.lineItemIdentifier.productName,
                        fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                        order: 3,
                        feeTerm:
                            lineItem.hasOwnProperty("price") &&
                            lineItem.price.hasOwnProperty("recurringPriceList") &&
                            lineItem.price.recurringPriceList.hasOwnProperty("recurringPrice") &&
                            lineItem.price.recurringPriceList.recurringPrice.frequencyOfCharge === "monthly"
                                ? "Monthly"
                                : "Today",
                        discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                        hasDescription: false,
                        description: "",
                        type: "fee"
                    };
                    if (newFeeCharge.feeTerm === "Today") {
                        cart.hasToday = true;
                        cart.todayCharges.push(newFeeCharge);
                    } else {
                        cart.hasMonthly = true;
                        cart.monthlyCharges.push(newFeeCharge);
                    }
                }
            } else if (
                lineItem.lineItemType === "programming" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "fee"
            ) {
                if (lineItem.price.subTotalAmount != 0 && lineItem.isVisible) {
                    let newFeeCharge = {
                        name: lineItem.lineItemIdentifier.productName,
                        fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                        feeTerm: "Monthly",
                        order: 3,
                        discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                        hasDescription: false,
                        description: "",
                        type: "fee"
                    };
                    cart.hasMonthly = true;
                    cart.monthlyCharges.push(newFeeCharge);
                }
            } else if (
                lineItem.lineItemType === "programming" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "video-plan"
            ) {
                let newProductCharge = {
                    name: lineItem.lineItemIdentifier.productName,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    order: 1,
                    feeTerm: "Monthly",
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "fee"
                };
                cart.hasMonthly = true;
                cart.monthlyCharges.push(newProductCharge);
            } else if (
                lineItem.lineItemType === "programming" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "video-addon"
            ) {
                let newAddonCharge = {
                    name: lineItem.lineItemIdentifier.productName,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    order: 5,
                    feeTerm:
                        lineItem.price.recurringPriceList.recurringPrice.frequencyOfCharge === "monthly"
                            ? "Monthly"
                            : "Single",
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "fee"
                };
                if (newAddonCharge.feeTerm === "Monthly") {
                    cart.hasMonthly = true;
                    cart.monthlyCharges.push(newAddonCharge);
                } else {
                    cart.hasFirstBill = true;
                    cart.firstBillCharges.push(newAddonCharge);
                }
            } else if (
                lineItem.lineItemType === "programming" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "insurance"
            ) {
                let newInsuranceCharge = {
                    name: lineItem.lineItemIdentifier.productName,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    order: 6,
                    feeTerm:
                        lineItem.price.recurringPriceList.recurringPrice.frequencyOfCharge === "monthly"
                            ? "Monthly"
                            : "Single",
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "fee"
                };
                if (newInsuranceCharge.feeTerm === "Monthly") {
                    cart.hasMonthly = true;
                    cart.monthlyCharges.push(newInsuranceCharge);
                } else {
                    cart.hasFirstBill = true;
                    cart.firstBillCharges.push(newInsuranceCharge);
                }
            } else if (
                lineItem.lineItemType === "receiver" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "video-device"
            ) {
                let newProductCharge = {
                    name: lineItem.lineItemIdentifier.productName,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    order: 2,
                    feeTerm: "Today",
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "fee"
                };
                cart.hasToday = true;
                cart.todayCharges.push(newProductCharge);
            } else if (
                lineItem.lineItemType === "accessory" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "video-device"
            ) {
                let newProductCharge = {
                    name: lineItem.lineItemIdentifier.productName,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    feeTerm: "Monthly",
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "fee"
                };
                accessories.push(newProductCharge);
            } else if (
                lineItem.lineItemType === "agreement" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "agreement"
            ) {
                let newProductCharge = {
                    name:
                        lineItem.lineItemIdentifier.productName !== "DTV_$10_off_AP_PB_Lifetime_DS2361"
                            ? lineItem.lineItemIdentifier.productName
                            : lineItem.lineItemIdentifier.productDescription,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    order: 3,
                    feeTerm: "Monthly",
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription:
                        lineItem.lineItemIdentifier.productName !== "DTV_$10_off_AP_PB_Lifetime_DS2361" &&
                        lineItem.lineItemIdentifier.hasOwnProperty("productDescription") &&
                        lineItem.lineItemIdentifier.productName !== lineItem.lineItemIdentifier.productDescription,
                    description: lineItem.lineItemIdentifier.hasOwnProperty("productDescription")
                        ? lineItem.lineItemIdentifier.productDescription
                        : "",
                    type: "fee"
                };
                cart.hasMonthly = true;
                cart.monthlyCharges.push(newProductCharge);
            } else if (
                lineItem.lineItemType === "virtual" &&
                lineItem.hasOwnProperty("customData") &&
                lineItem.customData.hasOwnProperty("productType") &&
                lineItem.customData.productType === "equipment-rebate"
            ) {
                let newProductCharge = {
                    name: lineItem.lineItemIdentifier.productName,
                    fee: Number(lineItem.price.subTotalAmount).toFixed(2),
                    feeTerm: "Today",
                    order: 3,
                    discount: Number(lineItem.price.subTotalAmount) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "fee"
                };
                rebates.push(newProductCharge);
            }
        });
        if (rebates.length > 0) {
            const fee = rebates.reduce((accumulator, item) => accumulator + Number(item.fee), 0);
            let newProductCharge = {
                name: "Equipment Selection Instant Rebate",
                fee: Number(fee).toFixed(2),
                feeTerm: "Today",
                order: 3,
                discount: Number(fee) > 0.0 ? false : true,
                hasDescription: false,
                description: "",
                type: "fee"
            };
            cart.hasToday = true;
            cart.todayCharges.push(newProductCharge);
        }
        if (accessories.length > 0) {
            let accessoryNames = [];
            accessories.forEach((item) => {
                if (!accessoryNames.includes(item.name)) {
                    let filteredArray = [...accessories.filter((e) => e.name === item.name)];
                    let fee = filteredArray.reduce((accumulator, item) => accumulator + Number(item.fee), 0);
                    let newProductCharge = {
                        name: `${filteredArray.length} ${item.name}`,
                        fee: Number(fee).toFixed(2),
                        feeTerm: "Today",
                        order: 2,
                        discount: Number(fee) > 0.0 ? false : true,
                        hasDescription: false,
                        description: "",
                        type: "fee"
                    };
                    cart.hasToday = true;
                    cart.todayCharges.push(newProductCharge);
                    accessoryNames.push(item.name);
                }
            });
        }
        cart.monthlyCharges.forEach((charge) => {
            cart.monthlyTotal = Number(cart.monthlyTotal) + Number(charge.fee);
        });
        cart.monthlyTotal = Number(cart.monthlyTotal).toFixed(2);
        cart.todayCharges.forEach((charge) => {
            cart.todayTotal = Number(cart.todayTotal) + Number(charge.fee);
        });
        cart.todayTotal = Number(cart.todayTotal).toFixed(2);
        cart.firstBillCharges.forEach((charge) => {
            cart.firstBillTotal = Number(cart.firstBillTotal) + Number(charge.fee);
        });
        cart.firstBillTotal = Number(cart.firstBillTotal).toFixed(2);
        cart.monthlyCharges.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
        cart.todayCharges.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
        cart.firstBillCharges.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
        this.cart = { ...cart };
        this.alternativeHardwareCart = { ...cart };
        this.loaderSpinner = false;

        this.dispatchEvent(
            new CustomEvent("cartupdate", {
                detail: this.cart
            })
        );
    }

    handleClick() {
        let info = {
            chosen: this.chosenOption,
            name: this.chosenOption.quantity,
            cartInfo: this.cart,
            billingInfo: this.billingDetailsRequest
        };
        const sendCartNextEvent = new CustomEvent("next", {
            detail: info
        });
        this.dispatchEvent(sendCartNextEvent);
    }

    get showMultipleGenieButton() {
        return this.numberOfTVs > 1 && this.directTvGenie.quantity == 0;
    }

    get hardwareOptions() {
        return this.beamHardwareOptions;
    }

    get showAlert() {
        return this.numberOfTVs > 8;
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    get isCallCenterOrigin() {
        return this.origin == "phonesales";
    }

    hideModal() {
        this.showModal = false;
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Hardware",
            component: "poe_lwcBuyflowDirecTvEngaHardwareBeam",
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
            tab: "Hardware"
        };
        this.dispatchEvent(event);
    }
}