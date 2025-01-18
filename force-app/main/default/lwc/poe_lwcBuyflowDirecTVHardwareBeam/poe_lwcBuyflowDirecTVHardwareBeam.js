import { LightningElement, api, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
const MAIN_GENIE2 = "DTV-EQUIPMENT-MAIN-GENIE2";
const MAIN_GENIE = "DTV-EQUIPMENT-MAIN-GENIE";
const ADDTL_GENIE_MINI = "DTV-EQUIPMENT-GENIE-ADDTL-MINI";
const ADDTL_GEMINI = "DTV-EQUIPMENT-GENIE2-ADDTL-MINI-GEMINI";
export default class Poe_lwcBuyflowDirecTVHardwareBeam extends NavigationMixin(LightningElement) {
    @api orderInfo;
    @api origin;
    @api userId;
    @api logo;
    @api hardwareSelected;
    @api paymentMethod;
    @api recordId;
    @api cartInfo;
    @api included;
    @api productDetailResponse;
    @api returnUrl;
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
    productDetailResponse;
    loaderSpinner;
    showSBS = false;
    chosenOption;
    noCompleteInfo = true;
    zeroDevices = false;
    device;
    pageTitle;
    numberOfTVs = 1;
    numberOfTVsOptions;
    numberOfDevicesAvailable = 1;
    numberOfDevicesAvailableAlternative = 0;
    numberOfDevicesSelected = 0;
    beamHardwareOptions = [];
    hardwareOptionsResponse = [];
    showAdditionalHardwareSelection = false;
    additionalHardwareOptions = [];
    additionalHardware = {};
    alternativeHardwareOptionsOpen = false;
    additionalHardwareOptionsList = [];
    additionalHardwareSelection = [];
    maximumHardwareSelected = false;
    showModal;
    hasActivationFee;
    modalBody;
    modalTitle;
    genieButton = false;
    equipmentCosts;
    initialLoad;
    changeOfTvs = false;
    phonesalesOrigin = false;

    connectedCallback() {
        this.initialLoad = true;
        this.pageTitle = "Number of TVs";
        this.originalCart = { ...this.cartInfo };
        this.cart = { ...this.cartInfo };
        this.phonesalesOrigin = this.origin === "phonesales";
        this.loaderSpinner = true;
        this._actionUtil = new OmniscriptActionCommonUtil();
        let orderInfoParsed = JSON.parse(JSON.stringify(this.orderInfo));
        this.orderInfo = orderInfoParsed;
        let responseComponentCustomizations = this.productDetailResponse.hasOwnProperty("componentCustomizations")
            ? this.productDetailResponse.componentCustomizations
            : undefined;
        if (responseComponentCustomizations === undefined) {
            const event = new ShowToastEvent({
                title: "Server Error",
                mode: "sticky",
                variant: "error",
                message: "There was an error processing the request try again"
            });
            this.dispatchEvent(event);
            this.loaderSpinner = false;
        } else {
            let beamHardwareOptions = [];
            responseComponentCustomizations.forEach((customization) => {
                if (customization.customization.properties.customizationCode === "DTV-EQUIPMENT-MAIN") {
                    customization.customization.choices.forEach((equipmentChoice) => {
                        if (equipmentChoice.choice.properties.isMain === "true") {
                            beamHardwareOptions.push(equipmentChoice.choice);
                        }
                    });
                }
            });
            this.hardwareOptionsResponse = [...beamHardwareOptions];
            this.setNumberOfTVsOptions();
            this.generateBeamHardwareOptions();
        }
    }

    generateBeamHardwareOptions() {
        this.beamHardwareOptions = [];
        let options = [];
        this.hardwareOptionsResponse.forEach((hardwareOption) => {
            let option = {
                Id: hardwareOption.properties?.choiceCode,
                usoc: hardwareOption.properties?.usoc,
                quantity: hardwareOption.properties?.name,
                description: hardwareOption?.longDescription,
                due: hardwareOption.fee?.fee,
                price: `$${hardwareOption.fee?.fee}`,
                originalResponse: hardwareOption,
                subOptions: this.generateBeamHardwareSubOptions(hardwareOption),
                isChecked: false
            };
            options.push(option);
        });
        this.beamHardwareOptions = [...options];
        this.calculateBeamHardwareOptionsPricing();
    }

    calculateBeamHardwareOptionsPricing() {
        let hardwareData = [];
        this.beamHardwareOptions.forEach((hardware) => {
            let hardwarePricing = [];
            for (let i = 1; i <= 8; i++) {
                let numberOfTvs = i;
                let devicesAvailable =
                    hardware.originalResponse.customizations[0].customization.properties.minChoices == 0
                        ? numberOfTvs - 1
                        : numberOfTvs;
                this.additionalHardwareOptions = [];
                hardwarePricing = this.hardwarePricingArrayHandler(hardware.Id, numberOfTvs, devicesAvailable);
                hardwareData = [...hardwareData, hardwarePricing];
            }
        });
        let myData = {
            tab: "cost",
            partnerName: "directv",
            partnerOrderNumber: this.orderInfo?.partnerOrderNumber,
            dealerCode: this.orderInfo?.dealerCode,
            productType: this.orderInfo?.productType,
            equipments: [...hardwareData.flat(Infinity)]
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
                if (
                    response.result.IPResult.hasOwnProperty("equipmentCosts") &&
                    response.result.IPResult.equipmentCosts.length > 0
                ) {
                    this.equipmentCosts = [...response.result.IPResult.equipmentCosts];
                    this.loaderSpinner = false;
                    this.initialLoad ? this.handleHardwareSelection() : undefined;
                } else {
                    this.loaderSpinner = false;
                    let errorMessage;
                    if (
                        response.result.IPResult.hasOwnProperty("result") &&
                        response.result.IPResult.result.hasOwnProperty("error") &&
                        response.result.IPResult.result.error.hasOwnProperty("provider") &&
                        response.result.IPResult.result.error.provider.hasOwnProperty("message")
                    ) {
                        errorMessage = response.result.IPResult.result.error.provider.message.errorMessage;
                    } else if (
                        response.result.IPResult.hasOwnProperty("result") &&
                        response.result.IPResult.result.hasOwnProperty("error") &&
                        response.result.IPResult.result.error.hasOwnProperty("message")
                    ) {
                        errorMessage = response.result.IPResult.result.error.message;
                    } else if (response.result.IPResult.hasOwnProperty("error")) {
                        errorMessage = response.result.IPResult.error;
                    }
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message:
                            errorMessage !== undefined
                                ? errorMessage
                                : "There was a problem getting the Equipment Cost. Please try again."
                    });
                    this.dispatchEvent(event);
                }
                this.showModal = true;
                this.modalTitle = "DIRECTV Equipment Disclosure";
                this.modalBody =
                    "Internet Connection is required. To use this device, it is recommended that your connection is 25Mbps or higher. Gemini Devices will deactivate after 90 consecutive days without internet connection.";
                this.modalButton = "I have read the above disclosures to the customer, and the customer agreed";
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The Equipment Cost request could not be made correctly to the server. Please, try again."
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
            });
    }

    hardwarePricingArrayHandler(option, numberOfTvs, devicesAvailable) {
        let num = numberOfTvs;
        let hardwarePricingArray = [];
        let addtlHD = {
            id: `${option}-${String(num)}-HD Receiver`,
            roomCount: String(num),
            mainGenie2: "0",
            mainGenie: "0",
            mainGenieLite: "0",
            mainHDDVR: "0",
            mainHD: "0",
            addtlGemini: "0",
            addtlWireless: "0",
            addtlWired: "0",
            addtl4K: "0",
            addtlRVU: "0",
            addtlHDDVR: "0",
            addtlHD: String(devicesAvailable)
        };
        let addtlWireless = {
            ...addtlHD,
            id: `${option}-${String(num)}-Wireless Genie Mini`,
            addtlWireless: String(devicesAvailable),
            addtlHD: "0"
        };
        let addtlWired = {
            ...addtlHD,
            id: `${option}-${String(num)}-Genie Mini`,
            addtlWired: String(devicesAvailable),
            addtlHD: "0"
        };
        let addtlGemini = {
            ...addtlHD,
            id: `${option}-${String(num)}-Wireless Gemini`,
            addtlGemini: String(devicesAvailable),
            addtlHD: "0"
        };
        let addtl4K = {
            ...addtlHD,
            id: `${option}-${String(num)}-4K Genie Mini`,
            addtl4K: String(devicesAvailable),
            addtlHD: "0"
        };
        switch (option) {
            case "DTV-EQUIPMENT-MAIN-GENIE":
                hardwarePricingArray.push(addtlWireless, addtlHD, addtlWired, addtl4K);
                hardwarePricingArray.map((item) => (item.mainGenie = "1"));
                break;
            case "DTV-EQUIPMENT-MAIN-HD":
                hardwarePricingArray.push(addtlHD);
                hardwarePricingArray.map((item) => (item.mainHD = "1"));
                break;
            case "DTV-EQUIPMENT-MAIN-GENIE2":
                hardwarePricingArray.push(addtlGemini, addtlWireless);
                hardwarePricingArray.map((item) => (item.mainGenie2 = "1"));
                break;
            case "DTV-EQUIPMENT-MAIN-GENIELITE":
                hardwarePricingArray.push(addtlHD, addtlWired);
                hardwarePricingArray.map((item) => (item.mainGenieLite = "1"));
                break;
        }
        return hardwarePricingArray;
    }

    generateBeamHardwareSubOptions(mainEquipmentChoice) {
        let subOptions = [];
        mainEquipmentChoice.customizations.forEach((mainEquipmentChoiceCustomization) => {
            mainEquipmentChoiceCustomization.customization.choices.forEach((mainEquipmentChoiceCustomizationChoice) => {
                let auxObj = {};
                auxObj = { ...mainEquipmentChoiceCustomizationChoice };
                auxObj.showOnZeroDevices =
                    mainEquipmentChoiceCustomization.customization.properties.minChoices === "0" ? false : true;

                subOptions.push(auxObj);
            });
        });
        return subOptions;
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

    handleHardwareSelection(event) {
        this.numberOfDevicesSelected = this.initialLoad == true ? 1 : 0;
        this.numberOfDevicesAvailableAlternative = this.numberOfDevicesAvailable;
        this.additionalHardwareSelection = [];
        let chosen;
        if (this.initialLoad || this.changeOfTvs) {
            chosen = MAIN_GENIE2;
        } else if (this.genieButton) {
            chosen = MAIN_GENIE;
        } else {
            chosen = event.target?.value;
        }
        if (chosen == MAIN_GENIE) {
            this.showModal = true;
            this.modalTitle = "Genie 2 Suggestion";
            this.modalBody =
                "If the customer has at least 25Mbps Internet speed, a Genie 2 plus at least one Gemini is the best offer.";
            this.modalButton = "Ok";
        }
        this.alternativeHardwareOptionsOpen = chosen == MAIN_GENIE2 && this.numberOfTVs > 1;
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
        let monthlyCharges = [...cart.monthlyCharges];
        let todayCharges = [...cart.todayCharges];
        let newCharge = {
            name: this.chosenOption.quantity,
            fee: Number(this.chosenOption.originalResponse.fee.fee).toFixed(2),
            feeTerm: this.chosenOption.originalResponse.fee.feeTerm,
            discount: Number(this.chosenOption.originalResponse.fee.fee) > 0.0 ? false : true,
            hasDescription:
                this.chosenOption.originalResponse.cartDisclosure !== undefined &&
                this.chosenOption.originalResponse.cartDisclosure !== null &&
                this.chosenOption.originalResponse.cartDisclosure !== "",
            description: this.chosenOption.originalResponse.cartDisclosure,
            type: "hardware"
        };
        if (newCharge.feeTerm === "Monthly") {
            cart.hasMonthly = true;
            monthlyCharges.push(newCharge);
        } else {
            cart.hasToday = true;
            todayCharges.push(newCharge);
        }
        if (newCharge.fee >= 99) {
            this.hasActivationFee = true;
        } else {
            this.hasActivationFee = false;
        }
        for (let i = 0; i < monthlyCharges.length; i++) {
            if (monthlyCharges[i].name === "TV Access FEE") {
                monthlyCharges.splice(i, 1);
            }
        }
        if (this.numberOfTVs > 1 && this.included) {
            let newCharge = {
                name: "TV Access FEE",
                fee: Number(7 * (Number(this.numberOfTVs) - 1)).toFixed(2),
                discount: false,
                hasDescription: false,
                description: "",
                type: "hardware"
            };
            monthlyCharges.push(newCharge);
        } else if (!this.included) {
            let newCharge = {
                name: "TV Access FEE",
                fee: Number(7 * Number(this.numberOfTVs)).toFixed(2),
                discount: false,
                hasDescription: false,
                description: "",
                type: "hardware"
            };
            monthlyCharges.push(newCharge);
        }
        cart.monthlyCharges = [...monthlyCharges];
        cart.todayCharges = [...todayCharges];
        cart.todayTotal = 0;
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach((charge) => {
            cart.monthlyTotal = Number(cart.monthlyTotal) + Number(charge.fee);
        });

        cart.monthlyTotal = Number(cart.monthlyTotal).toFixed(2);
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
        this.disableValidations();
    }

    setAdditionalHardwareOptions(selectedHardware) {
        let options = [];
        selectedHardware.originalResponse.customizations[0].customization.properties.minChoices == 0
            ? (this.numberOfDevicesAvailable = this.numberOfTVs - 1)
            : (this.numberOfDevicesAvailable = this.numberOfTVs);
        let type = selectedHardware.originalResponse.customizations[0].customization.properties.customizationCode;
        let deviceQuantity = this.numberOfDevicesAvailable > 0 ? this.numberOfDevicesAvailable : "";
        this.additionalHardwareOptions = [];
        selectedHardware.subOptions.forEach((hardwareSubOption, index) => {
            let hardwareSubOptionChoice = hardwareSubOption.choice;
            let fee = (0.0).toFixed(2);
            let filteredCosts = [
                ...this.equipmentCosts.filter(
                    (cost) =>
                        cost.id ===
                        `${this.chosenOption.Id}-${this.numberOfTVs}-${hardwareSubOption.choice.description}`
                )
            ];
            if (filteredCosts.length > 0) {
                let fees = filteredCosts[0];
                switch (hardwareSubOption.choice.description) {
                    case "Wireless Genie Mini":
                        fee = Number(fees.addtlWireless);
                        break;
                    case "HD Receiver":
                        fee = Number(fees.addtlHD);
                        break;
                    case "Genie Mini":
                        fee = Number(fees.addtlWired);
                        break;
                    case "4K Genie Mini":
                        fee = Number(fees.addtl4K);
                        break;
                    case "Wireless Gemini":
                        fee = Number(fees.addtlGemini);
                        break;
                }
                fee = fee.toFixed(2);
            }
            if (
                hardwareSubOptionChoice.properties?.usoc !== "DTV-EQUIPMENT-GENIE-ADDTL-RVU" &&
                hardwareSubOptionChoice.properties?.usoc !== "DTV-EQUIPMENT-GENIELITE-ADDTL-RVU"
            ) {
                let option = {
                    name: `${deviceQuantity} ${hardwareSubOptionChoice.properties?.name}`,
                    shortName: hardwareSubOptionChoice.properties?.name,
                    Id: hardwareSubOptionChoice.properties?.choiceCode,
                    usoc: hardwareSubOptionChoice.properties?.usoc,
                    quantity: hardwareSubOptionChoice.properties?.name,
                    description: hardwareSubOptionChoice?.longDescription,
                    price: String(fee),
                    originalPrice: hardwareSubOptionChoice.fee?.fee,
                    formattedPrice: `$${String(fee)}`,
                    originalResponse: hardwareSubOptionChoice,
                    options: this.generateAlternateHardwareOptions(),
                    disabled: false,
                    optionSelected: false,
                    quantity: this.numberOfDevicesAvailable,
                    isChecked: false,
                    type: type,
                    disclosure: !!hardwareSubOptionChoice.disclosure ? hardwareSubOptionChoice.disclosure : "",
                    autoShowDisclosure: !!hardwareSubOptionChoice.properties.autoShowDisclosure
                        ? hardwareSubOptionChoice.properties.autoShowDisclosure == "true"
                            ? true
                            : false
                        : false
                };
                if (this.numberOfTVs == 1 && hardwareSubOption.showOnZeroDevices === true) {
                    options.push(option);
                    this.showAdditionalHardwareSelection = true;
                } else if (
                    this.numberOfTVs > 1 &&
                    !(this.numberOfTVs > 2 && option.Id === "DTV-EQUIPMENT-GENIE2-ADDTL-MINI-4K")
                ) {
                    options.push(option);
                    this.showAdditionalHardwareSelection = true;
                } else {
                    this.showAdditionalHardwareSelection = false;
                }
            }
        });
        this.additionalHardwareOptions = [...options];
        this.disableValidations();
    }

    handleAdditionalHardwareSelection(event) {
        let chosen;
        if (
            this.initialLoad ||
            ((this.changeOfTvs || (this.chosenOption.Id == MAIN_GENIE2 && event == undefined)) && this.numberOfTVs == 1)
        ) {
            chosen = ADDTL_GEMINI;
        } else if (this.genieButton) {
            chosen = ADDTL_GENIE_MINI;
            this.genieButton = false;
        } else {
            chosen = event.target?.value;
        }
        this.additionalHardware = undefined;
        this.additionalHardwareOptions.forEach((item) => {
            if (item.Id === chosen) {
                item.quantity = item.name.substring(0, 1);
                this.additionalHardware = item;
                item.isChecked = true;
            } else {
                item.isChecked = false;
                item.quantity = "0";
            }
        });
        this.additionalHardwareSelection = [];
        this.additionalHardwareOptions.forEach((item) => {
            if (item.isChecked) {
                let selection = {
                    Id: item.Id,
                    quantity: item.name.substring(0, 1),
                    type: item.type
                };
                this.additionalHardwareSelection.push(selection);
            }
        });
        let cart = { ...this.hardwareCart };
        let monthlyCharges = [...cart.monthlyCharges];
        let todayCharges = [...cart.todayCharges];
        if (this.additionalHardware) {
            let newCharge = {
                name: this.additionalHardware.name,
                fee: Number(this.additionalHardware.price).toFixed(2),
                feeTerm: this.additionalHardware.originalResponse.fee.feeTerm,
                discount: Number(this.additionalHardware.price) > 0.0 ? false : true,
                hasDescription:
                    this.additionalHardware.originalResponse.cartDisclosure !== undefined &&
                    this.additionalHardware.originalResponse.cartDisclosure !== null &&
                    this.additionalHardware.originalResponse.cartDisclosure !== "",
                description: this.additionalHardware.originalResponse.cartDisclosure,
                type: "hardware-add"
            };
            if (newCharge.feeTerm === "Monthly") {
                cart.hasMonthly = true;
                monthlyCharges.push(newCharge);
            } else {
                cart.hasToday = true;
                todayCharges.push(newCharge);
            }
        }

        for (let i = 0; i < monthlyCharges.length; i++) {
            if (monthlyCharges[i].name === "TV Access FEE") {
                monthlyCharges.splice(i, 1);
            }
        }
        if (this.numberOfTVs > 1 && this.included) {
            let newCharge = {
                name: "TV Access FEE",
                fee: Number(7 * (Number(this.numberOfTVs) - 1)).toFixed(2),
                discount: false,
                hasDescription: false,
                description: "",
                type: "hardware"
            };
            monthlyCharges.push(newCharge);
        } else if (!this.included) {
            let newCharge = {
                name: "TV Access FEE",
                fee: Number(7 * Number(this.numberOfTVs)).toFixed(2),
                discount: false,
                hasDescription: false,
                description: "",
                type: "hardware"
            };
            monthlyCharges.push(newCharge);
        }
        cart.monthlyCharges = [...monthlyCharges];
        cart.todayCharges = [...todayCharges];
        cart.todayTotal = 0;
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach((charge) => {
            cart.monthlyTotal = Number(cart.monthlyTotal) + Number(charge.fee);
        });
        cart.monthlyTotal = Number(cart.monthlyTotal).toFixed(2);
        cart.todayCharges.forEach((charge) => {
            cart.todayTotal = Number(cart.todayTotal) + Number(charge.fee);
        });
        cart.todayTotal = Number(cart.todayTotal).toFixed(2);
        this.cart = { ...cart };
        if (
            this.additionalHardware &&
            this.additionalHardware.originalResponse.properties?.autoShowDisclosure == "true"
        ) {
            this.showModal = true;
            this.modalTitle = "Disclosures";
            this.modalBody = this.additionalHardware.originalResponse?.disclosure;
            this.modalButton = "I have read the above disclosures to the customer, and the customer agreed";
        }
        this.disableValidations();
    }

    handleClick() {
        let preQualInfo = [
            {
                customization: {
                    properties: {
                        customizationCode: "DTV-RECEIVER-COUNT"
                    },
                    choices: [
                        {
                            choice: {
                                properties: {
                                    choiceCode: "DTV-RECEIVER-COUNT-NUMBER",
                                    usoc: "DTV-RECEIVER-COUNT-NUMBER",
                                    value: String(this.numberOfTVs)
                                }
                            }
                        }
                    ]
                }
            },
            {
                customization: {
                    properties: {
                        customizationCode: "DTV-EQUIPMENT-MAIN"
                    },
                    choices: [
                        {
                            choice: {
                                properties: {
                                    choiceCode: this.chosenOption.Id,
                                    usoc: this.chosenOption.Id,
                                    value:
                                        this.chosenOption.originalResponse.customizations[0].customization.properties
                                            .minChoices == 0
                                            ? String(1)
                                            : String(0)
                                },
                                customizations: []
                            }
                        }
                    ]
                }
            }
        ];

        if (this.additionalHardwareSelection.length > 0) {
            let selectionObject = {
                customization: {
                    properties: {
                        customizationCode: this.additionalHardwareSelection[0].type
                    },
                    choices: this.generateSelectionRequest()
                }
            };
            preQualInfo[1].customization.choices[0].choice.customizations.push(selectionObject);
        }
        let info = {
            chosen: this.chosenOption,
            response: this.productDetailResponse,
            name: this.chosenOption.quantity,
            method: this.paymentMethod,
            preQualRequest: preQualInfo,
            cartInfo: this.cart
        };
        const sendCartNextEvent = new CustomEvent("hardwarenext", {
            detail: info
        });
        this.dispatchEvent(sendCartNextEvent);
    }

    generateSelectionRequest() {
        let selection = [];
        this.additionalHardwareSelection.forEach((item) => {
            let obj = {
                choice: {
                    properties: {
                        choiceCode: item.Id,
                        usoc: item.Id,
                        value: item.quantity
                    }
                }
            };
            selection.push(obj);
        });
        return selection;
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
        this.numberOfDevicesAvailable = this.numberOfTVs;
        let cart = { ...this.cart };
        let monthlyCharges = [...cart.monthlyCharges];
        let todayCharges = [...cart.todayCharges];
        monthlyCharges = monthlyCharges.filter((item) => item.type !== "hardware-add");
        todayCharges = todayCharges.filter((item) => item.type !== "hardware-add");
        for (let i = 0; i < monthlyCharges.length; i++) {
            if (monthlyCharges[i].name === "TV Access FEE") {
                monthlyCharges.splice(i, 1);
            }
        }
        if (this.numberOfTVs > 1 && this.included) {
            let newCharge = {
                name: "TV Access FEE",
                fee: Number(7 * (Number(this.numberOfTVs) - 1)).toFixed(2),
                discount: false,
                hasDescription: false,
                description: "",
                type: "hardware"
            };
            monthlyCharges.push(newCharge);
        } else if (!this.included) {
            let newCharge = {
                name: "TV Access FEE",
                fee: Number(7 * Number(this.numberOfTVs)).toFixed(2),
                discount: false,
                hasDescription: false,
                description: "",
                type: "hardware"
            };
            monthlyCharges.push(newCharge);
        }
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

    handleGenieMiniButton() {
        this.genieButton = true;
        this.additionalHardwareSelection = [];
        this.numberOfDevicesSelected = 0;
        this.alternativeHardwareOptionsOpen = false;
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
                if (item.originalResponse.properties?.autoShowDisclosure == "true" && Number(event.target.value) != 0) {
                    this.showModal = true;
                    this.modalBody = item.originalResponse?.disclosure;
                    this.modalTitle = "Disclosures";
                    this.modalButton = "I have read the above disclosures to the customer, and the customer agreed";
                }
                item.quantity = Number(event.target.value);
                item.value = event.target.value;
            } else if (selectedId == undefined) {
                let quantity = item.Id === ADDTL_GEMINI ? 1 : this.numberOfTVs - 1;
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
        this.additionalHardwareSelection = [];
        const sum = hardware.reduce((accumulator, item) => accumulator + Number(item.quantity), 0);
        if (sum == this.numberOfDevicesAvailable) {
            this.loaderSpinner = true;
            let hardwareData = {
                roomCount: String(this.numberOfTVs),
                mainGenie2: "0",
                mainGenie: "0",
                mainGenieLite: "0",
                mainHDDVR: "0",
                mainHD: "0",
                addtlGemini: "0",
                addtlWireless: "0",
                addtlWired: "0",
                addtl4K: "0",
                addtlRVU: "0",
                addtlHDDVR: "0",
                addtlHD: "0"
            };
            switch (this.chosenOption.Id) {
                case "DTV-EQUIPMENT-MAIN-GENIE2":
                    hardwareData.mainGenie2 = "1";
                    break;
                case "DTV-EQUIPMENT-MAIN-GENIE":
                    hardwareData.mainGenie = "1";
                    break;
                case "DTV-EQUIPMENT-MAIN-HD":
                    hardwareData.mainHD = "1";
                    break;
                case "DTV-EQUIPMENT-MAIN-GENIELITE":
                    hardwareData.mainGenieLite = "1";
                    break;
            }
            this.additionalHardwareOptions.forEach((item) => {
                switch (item.Id) {
                    case ADDTL_GEMINI:
                        hardwareData.addtlGemini = String(item.quantity);
                        break;
                    case "DTV-EQUIPMENT-GENIE2-ADDTL-MINI-WRLS":
                    case "DTV-EQUIPMENT-GENIE-ADDTL-MINI-WRLS":
                        hardwareData.addtlWireless = String(item.quantity);
                        break;
                    case "DTV-EQUIPMENT-GENIE-ADDTL-MINI":
                        hardwareData.addtlWired = String(item.quantity);
                        break;
                    case "DTV-EQUIPMENT-GENIE-ADDTL-HD":
                    case "DTV-EQUIPMENT-HD-ADDTL-HD":
                        hardwareData.addtlHD = String(item.quantity);
                        break;
                }
            });
            let myData = {
                tab: "cost",
                partnerName: "directv",
                partnerOrderNumber: this.orderInfo?.partnerOrderNumber,
                dealerCode: this.orderInfo?.dealerCode,
                productType: this.orderInfo?.productType,
                equipment: { ...hardwareData }
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
                    if (response.result.IPResult.hasOwnProperty("equipmentCost")) {
                        let fees = response.result.IPResult.equipmentCost;
                        let objArray = [];
                        let cart = { ...this.hardwareCart };
                        let monthlyCharges = [...cart.monthlyCharges];
                        let todayCharges = [...cart.todayCharges];
                        hardware.forEach((item) => {
                            let fee = (0.0).toFixed(2);
                            switch (item.shortName) {
                                case "Wireless Genie Mini":
                                    fee = Number(fees.addtlWireless);
                                    break;
                                case "HD Receiver":
                                    fee = Number(fees.addtlHD);
                                    break;
                                case "Genie Mini":
                                    fee = Number(fees.addtlWired);
                                    break;
                                case "4K Genie Mini":
                                    fee = Number(fees.addtl4K);
                                    break;
                                case "Wireless Gemini":
                                    fee = Number(fees.addtlGemini);
                                    break;
                            }
                            fee = fee.toFixed(2);
                            if (item.quantity > 0) {
                                let productSelected = {
                                    Id: item.Id,
                                    quantity: String(item.quantity),
                                    type: item.type
                                };
                                objArray.push(productSelected);
                                let newCharge = {
                                    name: `${item.quantity} ${item.shortName}`,
                                    fee: Number(fee).toFixed(2),
                                    feeTerm: item.originalResponse.fee.feeTerm,
                                    discount: Number(fee) > 0.0 ? false : true,
                                    hasDescription:
                                        item.originalResponse.cartDisclosure !== undefined &&
                                        item.originalResponse.cartDisclosure !== null &&
                                        item.originalResponse.cartDisclosure !== "",
                                    description: item.originalResponse.cartDisclosure,
                                    type: "hardware-add"
                                };
                                if (newCharge.feeTerm === "Monthly") {
                                    cart.hasMonthly = true;
                                    monthlyCharges.push(newCharge);
                                } else {
                                    cart.hasToday = true;
                                    todayCharges.push(newCharge);
                                }
                            }
                        });
                        for (let i = 0; i < monthlyCharges.length; i++) {
                            if (monthlyCharges[i].name === "TV Access FEE") {
                                monthlyCharges.splice(i, 1);
                            }
                        }
                        if (this.numberOfTVs > 1) {
                            let newCharge = {
                                name: "TV Access FEE",
                                fee: Number(7 * (Number(this.numberOfTVs) - 1)).toFixed(2),
                                discount: false,
                                hasDescription: false,
                                description: "",
                                type: "hardware"
                            };
                            monthlyCharges.push(newCharge);
                        }
                        cart.monthlyCharges = [...monthlyCharges];
                        cart.todayCharges = [...todayCharges];
                        cart.todayTotal = 0;
                        cart.monthlyTotal = 0;
                        cart.monthlyCharges.forEach((charge) => {
                            cart.monthlyTotal = Number(cart.monthlyTotal) + Number(charge.fee);
                        });
                        cart.monthlyTotal = Number(cart.monthlyTotal).toFixed(2);
                        cart.todayCharges.forEach((charge) => {
                            cart.todayTotal = Number(cart.todayTotal) + Number(charge.fee);
                        });
                        cart.todayTotal = Number(cart.todayTotal).toFixed(2);
                        this.cart = { ...cart };
                        this.additionalHardwareSelection = [...objArray];
                        this.disableValidations();
                        this.loaderSpinner = false;
                    } else {
                        this.loaderSpinner = false;
                        let errorMessage;
                        if (
                            response.result.IPResult.hasOwnProperty("result") &&
                            response.result.IPResult.result.hasOwnProperty("error") &&
                            response.result.IPResult.result.error.hasOwnProperty("provider") &&
                            response.result.IPResult.result.error.provider.hasOwnProperty("message")
                        ) {
                            errorMessage = response.result.IPResult.result.error.provider.message.errorMessage;
                        } else if (
                            response.result.IPResult.hasOwnProperty("result") &&
                            response.result.IPResult.result.hasOwnProperty("error") &&
                            response.result.IPResult.result.error.hasOwnProperty("message")
                        ) {
                            errorMessage = response.result.IPResult.result.error.message;
                        } else if (response.result.IPResult.hasOwnProperty("error")) {
                            errorMessage = response.result.IPResult.error;
                        }
                        const event = new ShowToastEvent({
                            title: "Error",
                            variant: "error",
                            mode: "sticky",
                            message:
                                errorMessage !== undefined
                                    ? errorMessage
                                    : "There was a problem getting the Equipment Cost. Please try again."
                        });
                        this.dispatchEvent(event);
                    }
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message:
                            "The Equipment Cost request could not be made correctly to the server. Please, try again."
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                });
        } else {
            this.cart = { ...this.hardwareCart };
            this.noCompleteInfo = true;
        }
    }

    get showMultipleGenieButton() {
        return this.numberOfTVs > 1;
    }

    get hardwareOptions() {
        return this.beamHardwareOptions;
    }

    get alternativeHardwareButtonText() {
        return this.alternativeHardwareOptionsOpen
            ? "Close Alternative Hardware Options"
            : "Alternative Hardware Options";
    }

    get showAlert() {
        return this.numberOfTVs > 8;
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    hideModal() {
        this.showModal = false;
    }

    get isCallCenterOrigin() {
        return this.origin == "phonesales";
    }
}