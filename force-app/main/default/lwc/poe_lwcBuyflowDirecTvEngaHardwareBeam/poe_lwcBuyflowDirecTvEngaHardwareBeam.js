import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import ENGA_GEMINI_WIRELESS_DESCRIPTION from "@salesforce/label/c.Enga_Gemini_Wireless_Description";
import ENGA_GEMINI_WIRELESS_LABEL_PAIR from "@salesforce/label/c.Enga_Gemini_Wireless_Label_Pair";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import dtvSelectDeviceMessage from "@salesforce/label/c.DIRECTV_Select_a_Device_Message";
import dtvGeminiOption from "@salesforce/label/c.DIRECTV_Gemini";
import dtvGenieMiniOption from "@salesforce/label/c.DIRECTV_Genie_Mini";
import ALTERNATIVE_HARDWARE_OPTIONS_LABEL from "@salesforce/label/c.DTV_Alternative_Hardware_Options";
import CLOSE_ALTERNATIVE_HARDWARE_OPTIONS_LABEL from "@salesforce/label/c.DTV_Close_Alternative_Hardware_Options";

const MAIN_GENIE2 = "OF_DEVICE-GENIE-2-WIRELESS-V1_sales_satellite";
const MAIN_GENIE = "OF_DEVICE-GENIE-HD-DVR-V1_sales_satellite";
const ADDTL_GENIE_MINI = "OF_DEVICE-GENIE-MINI-V2_sales_satellite";
const ADDTL_GEMINI = "OF_DEVICE-GEMINI-WIRELESS-V2_sales_satellite";
const ADDTL_GENIE_MINI_GENIE2 = "OF_DEVICE-GENIE-MINI-WIRELESS-V3_sales_satellite";
const ORIG_GEMINI_WIRELESS_DISPLAY_NAME = ENGA_GEMINI_WIRELESS_LABEL_PAIR.split(";")[0];
const NEW_WIRELESS_GEMINI_DISPLAY_NAME = ENGA_GEMINI_WIRELESS_LABEL_PAIR.split(";")[1];

export default class Poe_lwcBuyflowDirecTvEngaHardwareBeam extends NavigationMixin(LightningElement) {
    @api orderInfo;
    @api origin;
    @api logo;
    @api recordId;
    @api cartInfo;
    @api treatmentCode;
    @api isGuestUser;
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
    noCompleteInfo = true;
    pageTitle = "Number of TVs";
    changeOfTvs;
    numberOfTVs = 1;
    numberOfTVsOptions;
    numberOfDevicesAvailable = 1;
    numberOfDevicesAvailableAlternative = 0;
    numberOfDevicesSelected = 0;
    beamHardwareOptions = [];
    beamHardwareSubOptions = [];
    hardwareOptionsResponse = [];
    showAdditionalHardwareSelection = false;
    additionalHardwareOptions = [];
    additionalHardwareOptionsGemini = [];
    additionalHardwareOptionsGenieMini = [];
    additionalHardware = {};
    alternativeHardwareOptionsOpen = false;
    additionalHardwareOptionsList = [];
    additionalHardwareSelection = [];
    initialLoad;
    phonesalesOrigin = false;
    alternativeHardwareButtonText = ALTERNATIVE_HARDWARE_OPTIONS_LABEL;
    alternativeHardwareCart;
    billingDetailsRequest = {};
    showModal = false;
    modalTitle;
    genieSuggestion;
    equipmentDisclosure;
    modalBody;
    modalButton;
    genieButton = false;
    deviceSelected = "gemini";
    geminiSelected = true;
    deviceChange = false;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        dtvSelectDeviceMessage
    };
    showSelfServiceCancelModal = false;

    get hideSBS() {
        return !this.showSBS;
    }

    get notPhonesalesOrigin() {
        return !this.phonesalesOrigin;
    }

    get deviceOptions() {
        return [
            { label: dtvGeminiOption, value: "gemini" },
            { label: dtvGenieMiniOption, value: "genieMini" }
        ];
    }
    showDeviceSelection = true;

    connectedCallback() {
        this.isNotGuestUser = !this.isGuestUser;
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        this.cart = { ...this.cartInfo };
        this.originalCart = { ...this.cartInfo };
        this.initialLoad = true;
        this.phonesalesOrigin = this.origin === "phonesales";
        this.handleCallCms();
    }

    handleDeviceSelection(event) {
        this.deviceChange = true;
        this.deviceSelected = event.detail.value;
        this.geminiSelected = event.detail.value === "gemini" ? true : false;
        this.additionalHardwareSelection = [];
        this.numberOfDevicesSelected = 0;
        this.alternativeHardwareOptionsOpen = false;
        this.handleHardwareSelection();
        this.alternativeHardwareButtonText = this.alternativeHardwareOptionsOpen
            ? CLOSE_ALTERNATIVE_HARDWARE_OPTIONS_LABEL
            : ALTERNATIVE_HARDWARE_OPTIONS_LABEL;
    }

    handleCallCms() {
        this.loaderSpinner = true;
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

        callEndpoint({ inputMap: myData })
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
                    this.loaderSpinner = false;
                } else {
                    this.equipmentDisclosure = result[0].cmsContent;
                    this.genieSuggestion = result[1].cmsContent;
                    this.handleProductDetailCallout();
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
                this.loaderSpinner = false;
            });
    }

    handleProductDetailCallout() {
        this.loaderSpinner = true;
        const path = "getAddonEquipmentProtectionplanDetails";
        let myData = {
            path,
            ...this.orderInfo,
            selectedBaseOfferCode: this.orderInfo.componentCode,
            addOn: {
                offerProductFamily: ["satellite"],
                offerActionType: ["Acquisition"],
                contractIndicator: ["EDSP"],
                offerProductTypes: ["video-addon"]
            },
            equipment: {
                offerProductFamily: ["satellite"],
                offerActionType: ["Acquisition"],
                offerProductTypes: ["video-device", "fee"],
                contractIndicator: ["EDSP"]
            },
            protectionPlan: {
                offerProductFamily: ["satellite"],
                offerActionType: ["Acquisition"],
                offerProductTypes: ["insurance"],
                contractIndicator: ["EDSP"]
            }
        };
        console.log("Product Detail Request", myData);
        let apiResponse;

        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                this.serviceabilityCallout = {};
                let result = JSON.parse(response);
                console.log("Product Detail Response", result);
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
                    this.setNumberOfTVsOptions();
                    this.generateBeamHardwareOptions(result.equipment.equipment);
                    this.offers = result.addOns;
                    this.protections = result.protectionPlan;
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

    generateBeamHardwareOptions(equipments) {
        let options = [];
        equipments.forEach((hardwareOption) => {
            if (hardwareOption.product[0].deviceDisplayCategory.toLowerCase() === "primary") {
                let option = {
                    Id: hardwareOption.offerCode,
                    usoc: hardwareOption.product[0].billingProductCode,
                    quantity: hardwareOption.fullDisplayName,
                    description: hardwareOption.fullDescription,
                    terms: hardwareOption.product[0].termsAndConditions,
                    due: Number(
                        Number(hardwareOption.childSkus[0].price.basePrice) -
                            Number(
                                hardwareOption.childSkus[0].price.productBenefitsInfo.benefits.length > 0
                                    ? hardwareOption.childSkus[0].price.productBenefitsInfo.benefits[0]
                                          .benefitFlattOffPrice
                                    : 0
                            )
                    ).toFixed(2),
                    price: `$${Number(
                        Number(hardwareOption.childSkus[0].price.basePrice) -
                            Number(
                                hardwareOption.childSkus[0].price.productBenefitsInfo.benefits.length > 0
                                    ? hardwareOption.childSkus[0].price.productBenefitsInfo.benefits[0]
                                          .benefitFlattOffPrice
                                    : 0
                            )
                    ).toFixed(2)}`,
                    originalResponse: hardwareOption,
                    subOptions: [...hardwareOption.product[0].compatibleDevices[0].products],
                    isChecked: false,
                    displayOrder: hardwareOption.product[0].displayRanking,
                    minSelected: hardwareOption.minSelected
                };
                options.push(option);
            } else {
                if (hardwareOption.fullDisplayName === ORIG_GEMINI_WIRELESS_DISPLAY_NAME) {
                    // The text coming from the API was replaced by this text as per Henry Drakeford on 10/31/2023.
                    hardwareOption.fullDisplayName = NEW_WIRELESS_GEMINI_DISPLAY_NAME;
                    hardwareOption.fullDescription = ENGA_GEMINI_WIRELESS_DESCRIPTION;
                }
                this.beamHardwareSubOptions.push(hardwareOption);
            }
        });
        options.sort((a, b) => (a.displayOrder > b.displayOrder ? -1 : a.displayOrder < b.displayOrder ? 1 : 0));
        this.beamHardwareOptions = [...options];
        this.showModal = true;
        this.modalTitle = "DIRECTV Equipment Disclosure";
        this.modalBody = this.equipmentDisclosure;
        this.modalButton = "I have read the above disclosures to the customer, and the customer agreed";
        this.handleHardwareSelection();
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

    handleHardwareSelection(event) {
        this.numberOfDevicesSelected = this.initialLoad == true ? 1 : 0;
        this.numberOfDevicesAvailableAlternative = this.numberOfDevicesAvailable;
        this.additionalHardwareSelection = [];
        let chosen;
        if (this.initialLoad || this.changeOfTvs) {
            chosen = MAIN_GENIE2;
        } else if (this.genieButton) {
            chosen = MAIN_GENIE;
        } else if (this.deviceChange) {
            chosen = this.chosenOption.Id;
        } else {
            chosen = event.target?.value;
        }
        if (chosen == MAIN_GENIE) {
            this.showModal = true;
            this.modalTitle = "Genie 2 Suggestion";
            this.modalBody = this.genieSuggestion;
            this.modalButton = "Ok";
        }
        this.alternativeHardwareOptionsOpen = chosen == MAIN_GENIE2 && this.numberOfTVs > 1;
        this.alternativeHardwareButtonText = this.alternativeHardwareOptionsOpen
            ? CLOSE_ALTERNATIVE_HARDWARE_OPTIONS_LABEL
            : ALTERNATIVE_HARDWARE_OPTIONS_LABEL;
        this.showDeviceSelection = chosen == MAIN_GENIE2;
        if (chosen === MAIN_GENIE && this.chosenOption.Id === MAIN_GENIE2) {
            this.deviceSelected = "genieMini";
            this.geminiSelected = false;
        } else if (
            chosen === MAIN_GENIE2 &&
            this.chosenOption !== undefined &&
            this.chosenOption.hasOwnProperty("Id") &&
            this.chosenOption.Id === MAIN_GENIE
        ) {
            this.deviceSelected = "gemini";
            this.geminiSelected = true;
        }
        this.beamHardwareOptions.forEach((item) => {
            if (item.Id === chosen) {
                this.chosenOption = item;
                item.isChecked = true;
            } else {
                item.isChecked = false;
            }
        });
        this.setAdditionalHardwareOptions(this.chosenOption);

        let cart = { ...this.originalCart };
        let todayCharges = [...cart.todayCharges];
        let newCharge = {
            name: this.chosenOption.quantity,
            fee: Number(this.chosenOption.due).toFixed(2),
            feeTerm: "Today",
            discount: Number(this.chosenOption.due) > 0.0 ? false : true,
            hasDescription: false,
            description: "",
            type: "hardware"
        };
        cart.hasToday = true;
        todayCharges.push(newCharge);
        cart.todayCharges = [...todayCharges];
        cart.todayTotal = 0;
        cart.todayCharges.forEach((charge) => {
            cart.todayTotal = Number(cart.todayTotal) + Number(charge.fee);
        });
        cart.todayTotal = Number(cart.todayTotal).toFixed(2);
        this.cart = { ...cart };
        this.hardwareCart = { ...cart };
        if (
            this.genieButton ||
            this.initialLoad ||
            ((this.changeOfTvs || this.chosenOption.Id == MAIN_GENIE2) && this.numberOfTVs == 1)
        ) {
            this.handleAdditionalHardwareSelection();
            this.initialLoad = false;
        } else if (this.numberOfTVs > 1 && chosen == MAIN_GENIE2) {
            this.handleChangeAdditionalHardware();
        }
        this.changeOfTvs = false;
        this.deviceChange = false;
        this.disableValidations();
    }

    handleGenieMiniButton() {
        this.genieButton = true;
        this.deviceSelected = "genieMini";
        this.geminiSelected = false;
        this.additionalHardwareSelection = [];
        this.numberOfDevicesSelected = 0;
        this.alternativeHardwareOptionsOpen = false;
        this.handleHardwareSelection();
    }

    setAdditionalHardwareOptions(selectedHardware) {
        let options = [];
        this.numberOfDevicesAvailable =
            selectedHardware.originalResponse.product[0].maxOrderLimit == 1 ? this.numberOfTVs - 1 : this.numberOfTVs;
        let deviceQuantity = this.numberOfDevicesAvailable > 0 ? this.numberOfDevicesAvailable : "";
        this.additionalHardwareOptions = [];
        if (deviceQuantity > 0) {
            selectedHardware.subOptions.forEach((option) => {
                let productInformation = [
                    ...this.beamHardwareSubOptions.filter((item) => option.id === item.product[0].productId)
                ];
                if (productInformation.length > 0) {
                    let data = productInformation[0];
                    let fee = data.childSkus[0].price.basePrice * this.numberOfDevicesAvailable;
                    let discounts = 0;
                    let limit =
                        data.childSkus[0].price.productBenefitsInfo.benefits.length > 0
                            ? this.numberOfDevicesAvailable >
                              data.childSkus[0].price.productBenefitsInfo.benefits.length
                                ? data.childSkus[0].price.productBenefitsInfo.benefits.length
                                : this.numberOfDevicesAvailable
                            : 0;
                    for (var i = 0; i < limit; i++) {
                        discounts =
                            discounts + data.childSkus[0].price.productBenefitsInfo.benefits.length > 0
                                ? data.childSkus[0].price.productBenefitsInfo.benefits[i].benefitFlattOffPrice
                                : 0;
                    }
                    fee = fee - discounts;
                    let option = {
                        name: `${deviceQuantity} ${data.fullDisplayName}`,
                        shortName: data.fullDisplayName.replace("&#174;", "®"),
                        Id: data.offerCode,
                        usoc: data.product[0].billingProductCode,
                        quantity: data.fullDisplayName,
                        description: data.fullDescription,
                        price: String(Number(fee).toFixed(2)),
                        originalPrice: data.childSkus[0].price.basePrice,
                        formattedPrice: `$${String(Number(fee).toFixed(2))}`,
                        originalResponse: data,
                        options: this.generateAlternateHardwareOptions(),
                        disabled: false,
                        optionSelected: false,
                        quantity: this.numberOfDevicesAvailable,
                        isChecked: false,
                        displayOrder: data.product[0].displayRanking,
                        type: data.offerCode,
                        disclosure: !!data.product[0].termsAndConditions ? data.product[0].termsAndConditions : "",
                        autoShowDisclosure: false
                    };
                    options.push(option);
                }
            });
        }
        if (options.length > 0) {
            options.sort((a, b) => (a.displayOrder > b.displayOrder ? -1 : a.displayOrder < b.displayOrder ? 1 : 0));
            this.additionalHardwareOptions = [...options];
            this.additionalHardwareOptionsGemini = options.filter((item) => item.Id === ADDTL_GEMINI);
            this.additionalHardwareOptionsGenieMini = options.filter((item) => item.Id !== ADDTL_GEMINI);
            this.showAdditionalHardwareSelection = true;
            this.disableValidations();
        } else {
            this.showAdditionalHardwareSelection = false;
        }
    }

    handleAdditionalHardwareSelection(event) {
        let chosen;
        if (
            this.initialLoad ||
            ((this.changeOfTvs || (this.chosenOption.Id == MAIN_GENIE2 && event == undefined)) && this.numberOfTVs == 1)
        ) {
            chosen = ADDTL_GEMINI;
            this.geminiSelected = true;
        } else if (this.genieButton) {
            chosen = ADDTL_GENIE_MINI;
            this.genieButton = false;
            this.geminiSelected = false;
        } else {
            chosen = event.target?.value;
        }
        this.additionalHardware = undefined;
        this.additionalHardwareOptions.forEach((item) => {
            if (this.changeOfTvs) {
                if (item.Id === chosen) {
                    item.quantity = item.name.substring(0, 1);
                    this.additionalHardware = item;
                    item.isChecked = true;
                } else {
                    item.isChecked = false;
                    item.quantity = "0";
                }
            } else {
                if (item.Id === chosen) {
                    item.quantity = item.name.substring(0, 1);
                    this.additionalHardware = item;
                    item.isChecked = true;
                } else {
                    item.isChecked = false;
                    item.quantity = "0";
                }
            }
        });
        this.additionalHardwareSelection = [];
        this.additionalHardwareOptions.forEach((item) => {
            if (item.isChecked) {
                let selection = {
                    Id: item.Id,
                    quantity: item.name.substring(0, 1),
                    type: item.type,
                    shortName: item.shortName,
                    disclosure: item.disclosure
                };
                this.additionalHardwareSelection.push(selection);
            }
        });
        let cart = { ...this.hardwareCart };
        let todayCharges = [...cart.todayCharges];
        if (this.additionalHardware) {
            let newCharge = {
                name: this.additionalHardware.name,
                fee: Number(this.additionalHardware.price).toFixed(2),
                feeTerm: "Today",
                discount: Number(this.additionalHardware.price) > 0.0 ? false : true,
                hasDescription: false,
                description: this.additionalHardware.description,
                terms: this.additionalHardware.disclosure,
                type: "hardware-add"
            };
            cart.hasToday = true;
            todayCharges.push(newCharge);
        }
        cart.todayCharges = [...todayCharges];
        cart.todayTotal = 0;
        cart.todayCharges.forEach((charge) => {
            cart.todayTotal = Number(cart.todayTotal) + Number(charge.fee);
        });
        cart.todayTotal = Number(cart.todayTotal).toFixed(2);
        this.cart = { ...cart };
        this.disableValidations();
    }

    handleClick() {
        if (JSON.stringify(this.cart) === JSON.stringify(this.alternativeHardwareCart)) {
            this.handleNext();
        } else {
            this.handleBillingDetailsCallout("end");
        }
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    sbsHandler() {
        this.showSBS = true;
    }

    hideSBS() {
        this.showSBS = false;
    }

    disableValidations() {
        if (!this.showAdditionalHardwareSelection && this.chosenOption.hasOwnProperty("Id")) {
            this.noCompleteInfo = false;
        } else if (
            this.showAdditionalHardwareSelection &&
            this.additionalHardwareSelection.length > 0 &&
            this.chosenOption.hasOwnProperty("Id")
        ) {
            this.noCompleteInfo = false;
        } else {
            this.noCompleteInfo = true;
        }
    }

    setNumberOfTVsOptions() {
        const arr = new Array(8);
        arr.fill(1);
        this.numberOfTVsOptions = arr.map((element, index) => ({
            label: element * (index + 1),
            value: element * (index + 1)
        }));
    }

    handleChangeNumberOfTVs(event) {
        this.additionalHardwareSelection = [];
        this.numberOfDevicesSelected = 0;
        this.numberOfTVs = parseInt(event.detail.value);
        this.alternativeHardwareOptionsOpen = this.numberOfTVs > 1;
        this.alternativeHardwareButtonText = this.alternativeHardwareOptionsOpen
            ? CLOSE_ALTERNATIVE_HARDWARE_OPTIONS_LABEL
            : ALTERNATIVE_HARDWARE_OPTIONS_LABEL;
        this.numberOfDevicesAvailable = this.numberOfTVs;
        let cart = { ...this.cart };
        let monthlyCharges = [...cart.monthlyCharges];
        let todayCharges = [...cart.todayCharges];
        monthlyCharges = monthlyCharges.filter((item) => item.type !== "hardware-add");
        todayCharges = todayCharges.filter((item) => item.type !== "hardware-add");
        cart.monthlyCharges = [...monthlyCharges];
        cart.todayCharges = [...todayCharges];
        cart.monthlyTotal = 0;
        cart.todayTotal = 0;
        cart.monthlyCharges.forEach((charge) => {
            cart.monthlyTotal = Number(cart.monthlyTotal) + Number(charge.fee);
        });
        cart.monthlyTotal = Number(cart.monthlyTotal).toFixed(2);
        cart.todayCharges.forEach((charge) => {
            cart.todayTotal = Number(cart.todayTotal) + Number(charge.fee);
        });
        cart.todayTotal = Number(cart.todayTotal).toFixed(2);
        this.cart = { ...cart };
        this.changeOfTvs = true;
        this.handleHardwareSelection();
    }

    handleAlternativeHardwareOptions() {
        this.numberOfDevicesSelected = 0;
        let cart = { ...this.hardwareCart };
        let monthlyCharges = [...cart.monthlyCharges];
        let todayCharges = [...cart.todayCharges];
        cart.monthlyCharges = [...monthlyCharges];
        cart.todayCharges = [...todayCharges];
        cart.monthlyTotal = 0;
        cart.todayTotal = 0;
        cart.monthlyCharges.forEach((charge) => {
            cart.monthlyTotal = Number(cart.monthlyTotal) + Number(charge.fee);
        });
        cart.monthlyTotal = Number(cart.monthlyTotal).toFixed(2);
        cart.todayCharges.forEach((charge) => {
            cart.todayTotal = Number(cart.todayTotal) + Number(charge.fee);
        });
        cart.todayTotal = Number(cart.todayTotal).toFixed(2);
        this.cart = { ...cart };
        this.setAdditionalHardwareOptions(this.chosenOption);
        this.alternativeHardwareOptionsOpen = !this.alternativeHardwareOptionsOpen;
        this.alternativeHardwareButtonText = this.alternativeHardwareOptionsOpen
            ? CLOSE_ALTERNATIVE_HARDWARE_OPTIONS_LABEL
            : ALTERNATIVE_HARDWARE_OPTIONS_LABEL;
        this.additionalHardwareSelection = [];
        this.disableValidations();
    }

    generateAlternateHardwareOptions() {
        let value = this.numberOfDevicesAvailable - this.numberOfDevicesSelected;
        if (value >= 0) {
            let auxArr = [];
            let arr = new Array(value);
            arr.fill(1);
            let first = [{ label: "0", value: "0" }];
            auxArr = [
                ...first,
                ...arr.map((element, index) => ({
                    label: String(element * index + 1),
                    value: String(element * index + 1)
                }))
            ];
            return auxArr;
        } else {
            let noOptions = [{ label: "0", value: "0" }];
            return noOptions;
        }
    }

    handleChangeAdditionalHardware(event) {
        let selectedId = event != undefined ? event.target.dataset.id : undefined;
        let hardware = [];
        hardware = [...this.additionalHardwareOptions];
        this.numberOfDevicesSelected = 0;
        hardware.forEach((item) => {
            if (item.Id === selectedId) {
                item.quantity = Number(event.target.value);
                item.value = event.target.value;
            } else if (selectedId == undefined) {
                let quantity;
                if (this.geminiSelected) {
                    quantity = Number(item.Id === ADDTL_GEMINI ? this.numberOfTVs : 0);
                } else {
                    quantity = Number(item.Id === ADDTL_GENIE_MINI_GENIE2 ? this.numberOfTVs : 0);
                }
                item.quantity = quantity;
                item.value = String(quantity);
            }
            if (item.quantity > 0) {
                this.numberOfDevicesSelected += Number(item.quantity);
            }
        });
        let available = Number(this.numberOfDevicesAvailable) - Number(this.numberOfDevicesSelected);
        let sumDisabled = 0;
        if (available < 0) {
            hardware.forEach((item) => {
                if (item.Id !== selectedId) {
                    this.template.querySelector(`[data-id="${item.Id}"]`).value = "0";
                    sumDisabled = sumDisabled + item.quantity;
                    item.quantity = 0;
                }
            });
        }
        available = available + sumDisabled;
        hardware.forEach((item) => {
            let options = [...item.options];
            if (item.Id !== selectedId) {
                if (item.quantity <= available || item.quantity == 0) {
                    options = [];
                    for (let i = 0; i <= available + item.quantity; i++) {
                        let newObj = {
                            value: String(i),
                            label: String(i)
                        };
                        options.push(newObj);
                    }
                }
            }
            item.options = [...options];
        });
        this.additionalHardwareOptions = [...hardware];
        this.additionalHardwareOptionsGemini = hardware.filter((item) => item.Id === ADDTL_GEMINI);
        this.additionalHardwareOptionsGenieMini = hardware.filter((item) => item.Id !== ADDTL_GEMINI);
        this.additionalHardwareSelection = [];
        const sum = hardware.reduce((accumulator, item) => accumulator + Number(item.quantity), 0);
        if (sum == this.numberOfDevicesAvailable) {
            this.additionalHardwareSelection = [...hardware.filter((item) => item.quantity > 0)];
            this.handleBillingDetailsCallout("alternative");
            this.disableValidations();
        } else {
            this.cart = { ...this.hardwareCart };
            this.noCompleteInfo = true;
        }
    }

    handleBillingDetailsCallout(operation) {
        this.loaderSpinner = true;
        const path = "addBillingAccount";
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
                cartOffers: [
                    { offerCode: this.orderInfo.componentCode, quantity: 1 },
                    {
                        offerCode: this.chosenOption.Id,
                        quantity: 1
                    }
                ]
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
        this.additionalHardwareSelection.forEach((item) => {
            let offer = {
                offerCode: item.type,
                quantity: Number(item.quantity)
            };
            myData.cartContext.cartOffers.push(offer);
        });
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
                    this.updateCart(operation, result);
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

    updateCart(operation, result) {
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

            if (lineItem.lineItemType === "offer" && lineItem.lineItemIdentifier.productId === "Today") {
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
            } else if (lineItem.lineItemType === "offer" && lineItem.lineItemIdentifier.productId === "Recurring") {
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
        cart.monthlyCharges.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
        cart.todayCharges.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
        this.cart = { ...cart };
        this.alternativeHardwareCart = { ...cart };
        this.loaderSpinner = false;
        if (operation === "end") {
            this.handleNext();
        }
    }

    handleNext() {
        let info = {
            chosen: this.chosenOption,
            hardwareSelection: this.additionalHardwareSelection,
            name: this.chosenOption.quantity,
            cartInfo: this.cart,
            offers: this.offers,
            protections: this.protections,
            billingInfo: this.billingDetailsRequest
        };
        const sendCartNextEvent = new CustomEvent("hardwarenext", {
            detail: info
        });
        this.dispatchEvent(sendCartNextEvent);
    }

    get showMultipleGenieButton() {
        return this.numberOfTVs > 1;
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