import { LightningElement, api } from "lwc";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class Poe_lwcBuyflowDirecTVOffersMock extends NavigationMixin(LightningElement) {
    @api logo;
    @api stream;
    @api offerObject;
    @api cartInfo;
    @api recordId;
    @api internationalRequired;
    @api origin;
    @api returnUrl;
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
    originalCart;
    loaderSpinner;
    showSBS = false;
    left;
    top;
    showPopup = false;
    offerDescription;
    configurations = {
        offers: {
            required: [],
            included: []
        },
        premiums: [],
        sports: [],
        international: [],
        closingOffers: []
    };
    hasClosingOffers = false;
    showCollateral;
    requiredPresent = true;
    hasLandlord = false;
    landlordDisclaimer;
    landlordOptions = [];
    landlordStructure = [];
    landlordValue;
    noCompleteInfo;

    handleToggleChange(event) {
        let customAction = "";
        let configs = { ...this.configurations };
        if (event.target.dataset.id === "13003" && event.target.checked) {
            configs.offers.included.forEach((item) => {
                if (item.id === "3130") {
                    item.show = false;
                    item.checked = false;
                    customAction = "delete 20";
                }
            });
        } else if (event.target.dataset.id === "13003" && !event.target.checked) {
            configs.offers.included.forEach((item) => {
                if (item.id === "3130") {
                    item.show = true;
                    item.checked = true;
                    customAction = "show 20";
                }
            });
        }
        this.configurations = { ...configs };
        let allOffers = [
            ...this.configurations.offers.included,
            ...this.configurations.offers.required,
            ...this.configurations.sports,
            ...this.configurations.international,
            ...this.configurations.premiums,
            ...this.configurations.closingOffers
        ];
        let hideChoiceCode;
        let checked = event.target.checked;
        let disable;
        allOffers.forEach((item) => {
            if (item.choiceCode == event.target.dataset.choice) {
                item.checked = event.target.checked;
                if (item.disableChoiceCode !== undefined) {
                    disable = item.disableChoiceCode;
                }
                if (item.hideChoiceCode !== undefined) {
                    hideChoiceCode = item.hideChoiceCode;
                }
            }
        });
        if (disable !== undefined) {
            allOffers.forEach((item) => {
                if (disable.includes(item.choiceCode)) {
                    if (checked) {
                        item.required = true;
                        item.checked = true;
                        item.fee = "$" + Number(0.0).toFixed(2);
                    } else {
                        item.required = false;
                        item.checked = false;
                        item.fee = item.originalfee;
                    }
                }
            });
        }
        if (hideChoiceCode !== undefined) {
            allOffers.forEach((item) => {
                if (hideChoiceCode.includes(item.choiceCode)) {
                    if (checked) {
                        item.show = false;
                        item.checked = false;
                    } else {
                        item.show = true;
                    }
                }
            });
        }
        this.generateCart(customAction);
    }

    generateCart(customAction) {
        let allOffers = [
            ...this.configurations.offers.required,
            ...this.configurations.sports,
            ...this.configurations.international,
            ...this.configurations.premiums,
            ...this.configurations.closingOffers
        ];
        let cart = { ...this.originalCart };
        let cartElements = JSON.parse(JSON.stringify(cart.monthlyCharges));
        let cartElementsToday = JSON.parse(JSON.stringify(cart.todayCharges));
        let monthlyCharges = [...cartElements];
        let todayCharges = [...cartElementsToday];
        let firstBillCharges = [];
        allOffers.forEach((item) => {
            if (item.checked && item.cartVisible && !item.required && item.cartfee != "") {
                let newCharge = {
                    name: item.cartName,
                    fee: Number(item.cartfee).toFixed(2),
                    discount: Number(item.cartfee) > 0.0 ? false : true,
                    hasDescription:
                        item.cartDisclosure !== undefined && item.cartDisclosure !== null && item.cartDisclosure !== "",
                    description: item.cartDisclosure,
                    type: "offers"
                };
                if (item.feeTerm === "Monthly") {
                    cart.hasMonthly = true;
                    monthlyCharges.push(newCharge);
                } else if (item.feeTerm === "Single") {
                    cart.hasFirstBill = true;
                    firstBillCharges.push(newCharge);
                } else {
                    cart.hasToday = true;
                    todayCharges.push(newCharge);
                }
            }
        });
        let unlimited = false;
        for (var i = monthlyCharges.length - 1; i > -1; i--) {
            if (
                monthlyCharges[i].name ===
                "RECOMMENDED: upgrade to Unlimited hours of Cloud DVR recordings for $10/mo. more"
            ) {
                unlimited = true;
            }
        }
        if (unlimited) {
            for (var i = monthlyCharges.length - 1; i > -1; i--) {
                if (monthlyCharges[i].name == "20 Hours of Cloud DVR storage") {
                    monthlyCharges.splice(i, 1);
                }
            }
        }
        cart.monthlyCharges = [...monthlyCharges];
        cart.todayCharges = [...todayCharges];
        cart.firstBillCharges = [...firstBillCharges];
        cart.todayTotal = 0;
        cart.monthlyTotal = 0;
        cart.firstBillTotal = 0;
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
        this.cart = { ...cart };
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleOfferObject(offerArray) {
        let customizationCodes = [];
        let objectCustomizations = [];
        offerArray.forEach((item) => {
            if (customizationCodes.includes(item.customizationCode)) {
                let newObject = {
                    choice: {
                        properties: {
                            choiceCode: item.choiceCode,
                            usoc: item.id
                        }
                    }
                };
                objectCustomizations.forEach((element) => {
                    if (element.customization.properties.customizationCode === item.customizationCode) {
                        element.customization.choices.push(newObject);
                    }
                });
            } else {
                let newObject = {
                    customization: {
                        properties: {
                            customizationCode: item.customizationCode
                        },
                        choices: [
                            {
                                choice: {
                                    properties: {
                                        choiceCode: item.choiceCode,
                                        usoc: item.id
                                    }
                                }
                            }
                        ]
                    }
                };
                objectCustomizations.push(newObject);
                customizationCodes.push(item.customizationCode);
            }
        });
        return objectCustomizations;
    }

    handleClick() {
        if (this.internationalRequired) {
            let valid = false;
            this.configurations.international.forEach((item) => {
                if (item.checked && item.internationalQualifier) {
                    valid = true;
                }
            });
            if (!valid) {
                const event = new ShowToastEvent({
                    title: "International Package Required",
                    variant: "error",
                    mode: "sticky",
                    message:
                        "Based on the Base Package selection, an International package (except MYX) is required to be selected."
                });
                this.dispatchEvent(event);
                return;
            }
        }
        let checkedItemsIncluded = [];
        let checkedItemsRequired = [];
        let checkedItemsSports = [];
        let checkedItemsInternational = [];
        let checkedItemsPremiums = [];
        let checkedItemsClosingOffers = [];
        let allOffers = [
            ...this.configurations.offers.included,
            ...this.configurations.offers.required,
            ...this.configurations.sports,
            ...this.configurations.international,
            ...this.configurations.premiums,
            ...this.configurations.closingOffers
        ];
        allOffers.forEach((item) => {
            if (item.checked && !item.required) {
                switch (item.type) {
                    case "ATV-INCLUDED-OFFERS-REQUIRED":
                        checkedItemsIncluded.push(item);
                        break;
                    case "DTV-INCLUDED-OFFERS-REQUIRED":
                        checkedItemsIncluded.push(item);
                        break;
                    case "ATV-INCLUDED-OFFERS-OPTIONAL":
                        checkedItemsRequired.push(item);
                        break;
                    case "DTV-INCLUDED-OFFERS-OPTIONAL":
                        checkedItemsRequired.push(item);
                        break;
                    case "ATV-OPTIONAL-OFFERS-CHANNELS":
                        checkedItemsPremiums.push(item);
                        break;
                    case "DTV-OPTIONAL-OFFERS-CHANNELS":
                        checkedItemsPremiums.push(item);
                        break;
                    case "ATV-OPTIONAL-OFFERS-SPORTS":
                        checkedItemsSports.push(item);
                        break;
                    case "DTV-OPTIONAL-OFFERS-SPORTS":
                        checkedItemsSports.push(item);
                        break;
                    case "ATV-OPTIONAL-OFFERS-INTERNATIONAL":
                        checkedItemsInternational.push(item);
                        break;
                    case "DTV-OPTIONAL-OFFERS-INTERNATIONAL":
                        checkedItemsInternational.push(item);
                        break;
                    case "ATV-OPTIONAL-OFFERS-CLOSING":
                        checkedItemsClosingOffers.push(item);
                        break;
                    case "DTV-OPTIONAL-OFFERS-CLOSING":
                        checkedItemsClosingOffers.push(item);
                        break;
                }
            }
        });
        let offersSelected = [
            {
                customization: {
                    properties: {
                        customizationCode: this.stream ? "ATV-INCLUDED-OFFERS" : "DTV-INCLUDED-OFFERS"
                    },
                    choices: []
                }
            },
            {
                customization: {
                    properties: {
                        customizationCode: this.stream ? "ATV-OPTIONAL-OFFERS" : "DTV-OPTIONAL-OFFERS"
                    },
                    choices: []
                }
            }
        ];
        if (checkedItemsIncluded.length > 0) {
            let includedObject = {
                choice: {
                    properties: {
                        choiceCode: this.stream ? "ATV-INCLUDED-OFFERS-REQUIRED" : "DTV-INCLUDED-OFFERS-REQUIRED",
                        usoc: this.stream ? "ATV-INCLUDED-OFFERS-REQUIRED" : "DTV-INCLUDED-OFFERS-REQUIRED"
                    },
                    customizations: []
                }
            };
            includedObject.choice.customizations = [...this.handleOfferObject(checkedItemsIncluded)];
            offersSelected[0].customization.choices.push(includedObject);
        }
        if (checkedItemsRequired.length > 0) {
            let includedObject = {
                choice: {
                    properties: {
                        choiceCode: this.stream ? "ATV-INCLUDED-OFFERS-OPTIONAL" : "DTV-INCLUDED-OFFERS-OPTIONAL",
                        usoc: this.stream ? "ATV-INCLUDED-OFFERS-OPTIONAL" : "DTV-INCLUDED-OFFERS-OPTIONAL"
                    },
                    customizations: []
                }
            };
            includedObject.choice.customizations = [...this.handleOfferObject(checkedItemsRequired)];
            offersSelected[0].customization.choices.push(includedObject);
        }
        if (checkedItemsPremiums.length > 0) {
            let includedObject = {
                choice: {
                    properties: {
                        choiceCode: this.stream ? "ATV-OPTIONAL-OFFERS-CHANNELS" : "DTV-OPTIONAL-OFFERS-CHANNELS",
                        usoc: this.stream ? "ATV-OPTIONAL-OFFERS-CHANNELS" : "DTV-OPTIONAL-OFFERS-CHANNELS"
                    },
                    customizations: []
                }
            };
            includedObject.choice.customizations = [...this.handleOfferObject(checkedItemsPremiums)];
            offersSelected[1].customization.choices.push(includedObject);
        }
        if (checkedItemsSports.length > 0) {
            let includedObject = {
                choice: {
                    properties: {
                        choiceCode: this.stream ? "ATV-OPTIONAL-OFFERS-SPORTS" : "DTV-OPTIONAL-OFFERS-SPORTS",
                        usoc: this.stream ? "ATV-OPTIONAL-OFFERS-SPORTS" : "DTV-OPTIONAL-OFFERS-SPORTS"
                    },
                    customizations: []
                }
            };
            includedObject.choice.customizations = [...this.handleOfferObject(checkedItemsSports)];
            offersSelected[1].customization.choices.push(includedObject);
        }
        if (checkedItemsInternational.length > 0) {
            let includedObject = {
                choice: {
                    properties: {
                        choiceCode: this.stream
                            ? "ATV-OPTIONAL-OFFERS-INTERNATIONAL"
                            : "DTV-OPTIONAL-OFFERS-INTERNATIONAL",
                        usoc: this.stream ? "ATV-OPTIONAL-OFFERS-INTERNATIONAL" : "DTV-OPTIONAL-OFFERS-INTERNATIONAL"
                    },
                    customizations: []
                }
            };
            includedObject.choice.customizations = [...this.handleOfferObject(checkedItemsInternational)];
            offersSelected[1].customization.choices.push(includedObject);
        }
        if (checkedItemsClosingOffers.length > 0) {
            let includedObject = {
                choice: {
                    properties: {
                        choiceCode: this.stream ? "ATV-OPTIONAL-OFFERS-CLOSING" : "DTV-OPTIONAL-OFFERS-CLOSING",
                        usoc: this.stream ? "ATV-OPTIONAL-OFFERS-CLOSING" : "DTV-OPTIONAL-OFFERS-CLOSING"
                    },
                    customizations: []
                }
            };
            includedObject.choice.customizations = [...this.handleOfferObject(checkedItemsClosingOffers)];
            offersSelected[1].customization.choices.push(includedObject);
        }
        if (this.hasLandlord) {
            offersSelected.forEach((a) => {
                if (
                    a.customization.properties.customizationCode === "DTV-INCLUDED-OFFERS" ||
                    a.customization.properties.customizationCode === "ATV-INCLUDED-OFFERS"
                ) {
                    a.customization.choices.forEach((b) => {
                        if (
                            b.choice.properties.choiceCode === "DTV-INCLUDED-OFFERS-REQUIRED" ||
                            b.choice.properties.choiceCode === "ATV-INCLUDED-OFFERS-REQUIRED"
                        ) {
                            b.choice.customizations.forEach((c) => {
                                if (
                                    c.customization.properties.customizationCode === "DTV-INCLUDED-OFFERS-REQUIRED" ||
                                    c.customization.properties.customizationCode === "ATV-INCLUDED-OFFERS-REQUIRED"
                                ) {
                                    let structure = [...JSON.parse(JSON.stringify(this.landlordStructure))];
                                    structure.forEach((d) => {
                                        if (d.choice.properties.usoc === this.landlordValue) {
                                            let newChoice = {
                                                choice: {
                                                    properties: {
                                                        choiceCode: d.choice.properties.choiceCode,
                                                        usoc: d.choice.properties.usoc
                                                    }
                                                }
                                            };
                                            c.customization.choices.push(newChoice);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        let info = {
            offersSelected: offersSelected,
            cartInfo: this.cart
        };
        const sendCartNextEvent = new CustomEvent("offernext", {
            detail: info
        });
        this.dispatchEvent(sendCartNextEvent);
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

    showData(event) {
        this.left = event.clientX;
        this.top = event.clientY;
        let allOffers = [
            ...this.configurations.offers.included,
            ...this.configurations.offers.required,
            ...this.configurations.sports,
            ...this.configurations.international,
            ...this.configurations.premiums,
            ...this.configurations.closingOffers
        ];
        allOffers.forEach((item) => {
            if (item.id == event.target.dataset.id) {
                this.offerDescription = item.description;
            }
        });
        this.showPopup = true;
    }

    hideData(event) {
        this.showPopup = false;
    }

    connectedCallback() {
        this.cart = { ...this.cartInfo };
        this.originalCart = { ...this.cartInfo };
        let included = [];
        let required = [];
        let premium = [];
        let sports = [];
        let internationals = [];
        let closingOffers = [];

        this.offerObject.componentCustomizations.forEach((item) => {
            let generalType = item.customization.properties.groupName;
            let type = item.customization.properties.subGroupName;
            let maxChoices = Number(item.customization.properties.maxChoices);
            if (generalType === "Offers") {
                if (type === "IncludedOffers" && maxChoices > 0) {
                    item.customization.choices.forEach((subitem) => {
                        let typeCode = subitem.choice.properties.choiceCode;
                        if (
                            subitem.choice.properties.choiceCode === "ATV-INCLUDED-OFFERS-REQUIRED" ||
                            subitem.choice.properties.choiceCode === "DTV-INCLUDED-OFFERS-REQUIRED"
                        ) {
                            subitem.choice.customizations.forEach((c) => {
                                let customCode = c.customization.properties.customizationCode;
                                if (
                                    customCode === "ATT-DTV-LANDLORD-PERMISSION" ||
                                    customCode === "ATT-ATV-LANDLORD-PERMISSION"
                                ) {
                                    this.hasLandlord = true;
                                    this.noCompleteInfo = true;
                                    this.landlordDisclaimer = c.customization.longDescription;
                                    let options = [];
                                    let structure = [];
                                    c.customization.choices.forEach((o) => {
                                        if (o.choice.description !== "Please Select an Option") {
                                            structure.push(o);
                                            let newOption = {
                                                id: o.choice.properties.choiceCode,
                                                label: `${o.choice.description} - $${String(
                                                    Number(o.choice.fee.fee).toFixed(2)
                                                )}`,
                                                help: o.choice.longDescription,
                                                checked: false,
                                                disabled: false,
                                                order: Number(o.choice.properties.seq),
                                                stop: o.choice.properties.choiceCode === "DTV-LANDLORD-RENT-NO"
                                            };
                                            options.push(newOption);
                                        }
                                    });
                                    options.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
                                    this.landlordOptions = [...options];
                                    this.landlordStructure = [...structure];
                                } else {
                                    if (c.customization.hasOwnProperty("choices")) {
                                        c.customization.choices.forEach((offer) => {
                                            let includedObject = {
                                                id: offer.choice.properties.usoc,
                                                name: offer.choice.properties.name,
                                                description: offer.choice.hasOwnProperty("longDisclosure")
                                                    ? offer.choice.longDisclosure
                                                    : offer.choice.disclosure,
                                                hasDescription: offer.choice.hasOwnProperty("longDisclosure")
                                                    ? offer.choice.longDisclosure !== undefined &&
                                                      offer.choice.longDisclosure.length > 0
                                                    : offer.choice.disclosure !== undefined &&
                                                      offer.choice.disclosure.length > 0,
                                                cartName: offer.choice.properties.name,
                                                cartDisclosure: offer.choice.hasOwnProperty("cartDisclosure")
                                                    ? offer.choice.cartDisclosure
                                                    : "",
                                                flowVisible:
                                                    (offer.choice.properties.hasOwnProperty("flowVisible") &&
                                                        offer.choice.properties.flowVisible === "True") ||
                                                    offer.choice.properties.flowVisible === "true"
                                                        ? true
                                                        : false,
                                                cartVisible:
                                                    offer.choice.properties.cartVisible === "True" ||
                                                    offer.choice.properties.cartVisible === "true"
                                                        ? true
                                                        : false,
                                                img: offer.choice.properties.hasOwnProperty("imageUrlHiRes")
                                                    ? offer.choice.properties.imageUrlHiRes
                                                    : undefined,
                                                checked: true,
                                                fee: offer.choice.hasOwnProperty("fee")
                                                    ? "$" + Number(offer.choice.fee.fee).toFixed(2)
                                                    : "",
                                                cartfee: offer.choice.hasOwnProperty("fee")
                                                    ? Number(offer.choice.fee.fee).toFixed(2)
                                                    : "",
                                                originalfee: offer.choice.hasOwnProperty("fee")
                                                    ? "$" + Number(offer.choice.fee.fee).toFixed(2)
                                                    : "",
                                                show:
                                                    offer.choice.properties.hasOwnProperty("flowVisible") &&
                                                    (offer.choice.properties.flowVisible === "True" ||
                                                        offer.choice.properties.flowVisible === "true"),
                                                required:
                                                    offer.choice.properties.hasOwnProperty("includedWithPackage") &&
                                                    offer.choice.properties.includedWithPackage === "true",
                                                choiceCode: offer.choice.properties.choiceCode,
                                                hideChoiceCode: offer.choice.properties.hasOwnProperty(
                                                    "includedOfferCodesHide"
                                                )
                                                    ? offer.choice.properties.includedOfferCodesHide
                                                    : undefined,
                                                disableChoiceCode: offer.choice.properties.hasOwnProperty(
                                                    "includedOfferCodes"
                                                )
                                                    ? offer.choice.properties.includedOfferCodes
                                                    : undefined,
                                                type: typeCode,
                                                feeTerm: offer.choice.hasOwnProperty("fee")
                                                    ? offer.choice.fee.feeTerm
                                                    : "",
                                                customizationCode: customCode,
                                                order: parseInt(offer.choice.properties.seq)
                                            };
                                            included.push(includedObject);
                                        });
                                    }
                                }
                            });
                        } else if (
                            subitem.choice.properties.choiceCode === "ATV-INCLUDED-OFFERS-OPTIONAL" ||
                            subitem.choice.properties.choiceCode === "DTV-INCLUDED-OFFERS-OPTIONAL"
                        ) {
                            if (subitem.choice.customizations !== undefined) {
                                subitem.choice.customizations.forEach((c) => {
                                    let customCode = c.customization.properties.customizationCode;
                                    if (c.customization.hasOwnProperty("choices")) {
                                        c.customization.choices.forEach((offer) => {
                                            if (offer.choice.properties.cartVisible !== "False") {
                                                let reqObject = {
                                                    id: offer.choice.properties.usoc,
                                                    name: offer.choice.properties.name,
                                                    cartName: offer.choice.properties.name,
                                                    description: offer.choice.hasOwnProperty("longDisclosure")
                                                        ? offer.choice.longDisclosure
                                                        : offer.choice.disclosure,
                                                    hasDescription: offer.choice.hasOwnProperty("longDisclosure")
                                                        ? offer.choice.longDisclosure !== undefined &&
                                                          offer.choice.longDisclosure.length > 0
                                                        : offer.choice.disclosure !== undefined &&
                                                          offer.choice.disclosure.length > 0,
                                                    cartDisclosure: offer.choice.cartDisclosure,
                                                    img: offer.choice.properties.hasOwnProperty("imageUrlHiRes")
                                                        ? offer.choice.properties.imageUrlHiRes
                                                        : undefined,
                                                    checked: false,
                                                    required:
                                                        offer.choice.properties.hasOwnProperty("includedWithPackage") &&
                                                        offer.choice.properties.includedWithPackage === "true",
                                                    cartVisible:
                                                        offer.choice.properties.cartVisible === "True" ||
                                                        offer.choice.properties.cartVisible === "true"
                                                            ? true
                                                            : false,
                                                    flowVisible:
                                                        offer.choice.properties.hasOwnProperty("flowVisible") &&
                                                        (offer.choice.properties.flowVisible === "True" ||
                                                            offer.choice.properties.flowVisible === "true")
                                                            ? true
                                                            : false,
                                                    fee: offer.choice.hasOwnProperty("fee")
                                                        ? "$" + Number(offer.choice.fee.fee).toFixed(2)
                                                        : "",
                                                    cartfee: offer.choice.hasOwnProperty("fee")
                                                        ? Number(offer.choice.fee.fee).toFixed(2)
                                                        : "",
                                                    originalfee: offer.choice.hasOwnProperty("fee")
                                                        ? "$" + Number(offer.choice.fee.fee).toFixed(2)
                                                        : "",
                                                    choiceCode: offer.choice.properties.choiceCode,
                                                    hideChoiceCode: offer.choice.properties.hasOwnProperty(
                                                        "includedOfferCodesHide"
                                                    )
                                                        ? offer.choice.properties.includedOfferCodesHide
                                                        : undefined,
                                                    disableChoiceCode: offer.choice.properties.hasOwnProperty(
                                                        "includedOfferCodes"
                                                    )
                                                        ? offer.choice.properties.includedOfferCodes
                                                        : undefined,
                                                    feeTerm: offer.choice.hasOwnProperty("fee")
                                                        ? offer.choice.fee.feeTerm
                                                        : "",
                                                    show: true,
                                                    type: typeCode,
                                                    customizationCode: customCode,
                                                    order: parseInt(offer.choice.properties.seq)
                                                };
                                                if (reqObject.flowVisible) {
                                                    required.push(reqObject);
                                                }
                                            }
                                        });
                                    }
                                });
                            } else {
                                this.requiredPresent = false;
                            }
                        }
                    });
                } else if (type === "OptionalOffers" && maxChoices > 0) {
                    item.customization.choices.forEach((subitem) => {
                        let typeCode = subitem.choice.properties.choiceCode;
                        if (
                            subitem.choice.properties.choiceCode === "ATV-OPTIONAL-OFFERS-CHANNELS" ||
                            subitem.choice.properties.choiceCode === "DTV-OPTIONAL-OFFERS-CHANNELS"
                        ) {
                            subitem.choice.customizations.forEach((c) => {
                                let customCode = c.customization.properties.customizationCode;
                                if (c.customization.hasOwnProperty("choices")) {
                                    c.customization.choices.forEach((offer) => {
                                        let premiumObject = {
                                            id: offer.choice.properties.usoc,
                                            name: offer.choice.description,
                                            cartName: offer.choice.properties.name,
                                            description: offer.choice.hasOwnProperty("longDisclosure")
                                                ? offer.choice.longDisclosure
                                                : offer.choice.disclosure,
                                            hasDescription: offer.choice.hasOwnProperty("longDisclosure")
                                                ? offer.choice.longDisclosure !== undefined &&
                                                  offer.choice.longDisclosure.length > 0
                                                : offer.choice.disclosure !== undefined &&
                                                  offer.choice.disclosure.length > 0,
                                            cartDisclosure: offer.choice.cartDisclosure,
                                            img: offer.choice.properties.hasOwnProperty("imageUrl")
                                                ? offer.choice.properties.imageUrl
                                                : undefined,
                                            cartVisible:
                                                offer.choice.properties.cartVisible === "True" ||
                                                offer.choice.properties.cartVisible === "true"
                                                    ? true
                                                    : false,
                                            checked:
                                                offer.choice.properties.hasOwnProperty("includedWithPackage") &&
                                                offer.choice.properties.includedWithPackage === "true",
                                            required:
                                                offer.choice.properties.hasOwnProperty("includedWithPackage") &&
                                                offer.choice.properties.includedWithPackage === "true",
                                            fee: offer.choice.hasOwnProperty("fee")
                                                ? "$" + Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            originalfee: offer.choice.hasOwnProperty("fee")
                                                ? "$" + Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            cartfee: offer.choice.hasOwnProperty("fee")
                                                ? Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            feeTerm: offer.choice.hasOwnProperty("fee") ? offer.choice.fee.feeTerm : "",
                                            category: offer.choice.properties.genre,
                                            choiceCode: offer.choice.properties.choiceCode,
                                            hideChoiceCode: offer.choice.properties.hasOwnProperty(
                                                "includedOfferCodesHide"
                                            )
                                                ? offer.choice.properties.includedOfferCodesHide
                                                : undefined,
                                            disableChoiceCode: offer.choice.properties.hasOwnProperty(
                                                "includedOfferCodes"
                                            )
                                                ? offer.choice.properties.includedOfferCodes
                                                : undefined,
                                            show: true,
                                            type: typeCode,
                                            customizationCode: customCode,
                                            order: parseInt(offer.choice.properties.seq)
                                        };
                                        premium.push(premiumObject);
                                    });
                                }
                            });
                        } else if (
                            subitem.choice.properties.choiceCode === "ATV-OPTIONAL-OFFERS-SPORTS" ||
                            subitem.choice.properties.choiceCode === "DTV-OPTIONAL-OFFERS-SPORTS"
                        ) {
                            subitem.choice.customizations.forEach((c) => {
                                let customCode = c.customization.properties.customizationCode;
                                if (c.customization.hasOwnProperty("choices")) {
                                    c.customization.choices.forEach((offer) => {
                                        let sportObject = {
                                            id: offer.choice.properties.usoc,
                                            name: offer.choice.description,
                                            description: offer.choice.hasOwnProperty("longDisclosure")
                                                ? offer.choice.longDisclosure
                                                : offer.choice.disclosure,
                                            hasDescription: offer.choice.hasOwnProperty("longDisclosure")
                                                ? offer.choice.longDisclosure !== undefined &&
                                                  offer.choice.longDisclosure.length > 0
                                                : offer.choice.disclosure !== undefined &&
                                                  offer.choice.disclosure.length > 0,
                                            cartName: offer.choice.properties.name,
                                            cartVisible:
                                                offer.choice.properties.cartVisible === "True" ||
                                                offer.choice.properties.cartVisible === "true"
                                                    ? true
                                                    : false,
                                            cartDisclosure: offer.choice.cartDisclosure,
                                            img: offer.choice.properties.hasOwnProperty("imageUrl")
                                                ? offer.choice.properties.imageUrl
                                                : undefined,
                                            checked:
                                                offer.choice.properties.hasOwnProperty("includedWithPackage") &&
                                                offer.choice.properties.includedWithPackage === "true",
                                            required:
                                                offer.choice.properties.hasOwnProperty("includedWithPackage") &&
                                                offer.choice.properties.includedWithPackage === "true",
                                            fee: offer.choice.hasOwnProperty("fee")
                                                ? "$" + Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            originalfee: offer.choice.hasOwnProperty("fee")
                                                ? "$" + Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            cartfee: offer.choice.hasOwnProperty("fee")
                                                ? Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            feeTerm: offer.choice.hasOwnProperty("fee") ? offer.choice.fee.feeTerm : "",
                                            category: offer.choice.properties.sport,
                                            hideChoiceCode: offer.choice.properties.hasOwnProperty(
                                                "includedOfferCodesHide"
                                            )
                                                ? offer.choice.properties.includedOfferCodesHide
                                                : undefined,
                                            disableChoiceCode: offer.choice.properties.hasOwnProperty(
                                                "includedOfferCodes"
                                            )
                                                ? offer.choice.properties.includedOfferCodes
                                                : undefined,
                                            show: true,
                                            choiceCode: offer.choice.properties.choiceCode,
                                            type: typeCode,
                                            customizationCode: customCode,
                                            order: parseInt(offer.choice.properties.seq)
                                        };
                                        sports.push(sportObject);
                                    });
                                }
                            });
                        } else if (
                            subitem.choice.properties.choiceCode === "ATV-OPTIONAL-OFFERS-INTERNATIONAL" ||
                            subitem.choice.properties.choiceCode === "DTV-OPTIONAL-OFFERS-INTERNATIONAL"
                        ) {
                            subitem.choice.customizations.forEach((c) => {
                                let customCode = c.customization.properties.customizationCode;
                                if (c.customization.hasOwnProperty("choices")) {
                                    c.customization.choices.forEach((offer) => {
                                        let internationalObject = {
                                            id: offer.choice.properties.usoc,
                                            name: offer.choice.description,
                                            description: offer.choice.hasOwnProperty("longDisclosure")
                                                ? offer.choice.longDisclosure
                                                : offer.choice.disclosure,
                                            hasDescription: offer.choice.hasOwnProperty("longDisclosure")
                                                ? offer.choice.longDisclosure !== undefined &&
                                                  offer.choice.longDisclosure.length > 0
                                                : offer.choice.disclosure !== undefined &&
                                                  offer.choice.disclosure.length > 0,
                                            cartName: offer.choice.properties.name,
                                            cartDisclosure: offer.choice.cartDisclosure,
                                            cartVisible:
                                                offer.choice.properties.cartVisible === "True" ||
                                                offer.choice.properties.cartVisible === "true"
                                                    ? true
                                                    : false,
                                            img: offer.choice.properties.hasOwnProperty("imageUrl")
                                                ? offer.choice.properties.imageUrl
                                                : undefined,
                                            checked:
                                                offer.choice.properties.hasOwnProperty("includedWithPackage") &&
                                                offer.choice.properties.includedWithPackage === "true",
                                            required:
                                                offer.choice.properties.hasOwnProperty("includedWithPackage") &&
                                                offer.choice.properties.includedWithPackage === "true",
                                            fee: offer.choice.hasOwnProperty("fee")
                                                ? "$" + Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            originalfee: offer.choice.hasOwnProperty("fee")
                                                ? "$" + Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            cartfee: offer.choice.hasOwnProperty("fee")
                                                ? Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            feeTerm: offer.choice.hasOwnProperty("fee") ? offer.choice.fee.feeTerm : "",
                                            category: offer.choice.properties.language,
                                            hideChoiceCode: offer.choice.properties.hasOwnProperty(
                                                "includedOfferCodesHide"
                                            )
                                                ? offer.choice.properties.includedOfferCodesHide
                                                : undefined,
                                            disableChoiceCode: offer.choice.properties.hasOwnProperty(
                                                "includedOfferCodes"
                                            )
                                                ? offer.choice.properties.includedOfferCodes
                                                : undefined,
                                            show: true,
                                            choiceCode: offer.choice.properties.choiceCode,
                                            type: typeCode,
                                            customizationCode: customCode,
                                            order: parseInt(offer.choice.properties.seq),
                                            internationalQualifier: offer.choice.properties.hasOwnProperty(
                                                "internationalQualifier"
                                            )
                                                ? offer.choice.properties.internationalQualifier === "True" ||
                                                  offer.choice.properties.internationalQualifier === "true"
                                                : false
                                        };
                                        internationals.push(internationalObject);
                                    });
                                }
                            });
                        } else if (
                            subitem.choice.properties.choiceCode === "ATV-OPTIONAL-OFFERS-CLOSING" ||
                            subitem.choice.properties.choiceCode === "DTV-OPTIONAL-OFFERS-CLOSING"
                        ) {
                            subitem.choice.customizations.forEach((c) => {
                                let customCode = c.customization.properties.customizationCode;
                                if (c.customization.hasOwnProperty("choices")) {
                                    c.customization.choices.forEach((offer) => {
                                        let closingOfferObject = {
                                            id: offer.choice.properties.usoc,
                                            name: offer.choice.description,
                                            description: offer.choice.hasOwnProperty("longDisclosure")
                                                ? offer.choice.longDisclosure
                                                : offer.choice.disclosure,
                                            hasDescription: offer.choice.hasOwnProperty("longDisclosure")
                                                ? offer.choice.longDisclosure !== undefined &&
                                                  offer.choice.longDisclosure.length > 0
                                                : offer.choice.disclosure !== undefined &&
                                                  offer.choice.disclosure.length > 0,
                                            cartName: offer.choice.properties.name,
                                            cartDisclosure: offer.choice.cartDisclosure,
                                            cartVisible:
                                                offer.choice.properties.cartVisible === "True" ||
                                                offer.choice.properties.cartVisible === "true"
                                                    ? true
                                                    : false,
                                            img: offer.choice.properties.hasOwnProperty("imageUrl")
                                                ? offer.choice.properties.imageUrl
                                                : undefined,
                                            checked:
                                                offer.choice.properties.hasOwnProperty("includedWithPackage") &&
                                                offer.choice.properties.includedWithPackage === "true",
                                            required:
                                                offer.choice.properties.hasOwnProperty("includedWithPackage") &&
                                                offer.choice.properties.includedWithPackage === "true",
                                            fee: offer.choice.hasOwnProperty("fee")
                                                ? "$" + Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            originalfee: offer.choice.hasOwnProperty("fee")
                                                ? "$" + Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            cartfee: offer.choice.hasOwnProperty("fee")
                                                ? Number(offer.choice.fee.fee).toFixed(2)
                                                : "",
                                            feeTerm: offer.choice.hasOwnProperty("fee") ? offer.choice.fee.feeTerm : "",
                                            hideChoiceCode: offer.choice.properties.hasOwnProperty(
                                                "includedOfferCodesHide"
                                            )
                                                ? offer.choice.properties.includedOfferCodesHide
                                                : undefined,
                                            disableChoiceCode: offer.choice.properties.hasOwnProperty(
                                                "includedOfferCodes"
                                            )
                                                ? offer.choice.properties.includedOfferCodes
                                                : undefined,
                                            show: true,
                                            choiceCode: offer.choice.properties.choiceCode,
                                            type: typeCode,
                                            customizationCode: customCode,
                                            order: parseInt(offer.choice.properties.seq)
                                        };
                                        closingOffers.push(closingOfferObject);
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
        this.configurations.offers.included = this.sortOffers(included);
        this.configurations.offers.required = this.sortOffers(required);
        this.configurations.premiums = this.sortOffers(premium);
        this.configurations.sports = this.sortOffers(sports);
        this.configurations.international = this.sortOffers(internationals);
        this.configurations.closingOffers = this.sortOffers(closingOffers);
        this.hasClosingOffers = this.configurations.closingOffers.length > 0;
    }

    sortOffers(offers) {
        return offers.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
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

    handleLandlordChange(event) {
        let options = [...this.landlordOptions];
        let hardStop = false;
        options.forEach((item) => {
            if (event.target.checked) {
                if (item.id === event.target.dataset.id) {
                    this.landlordValue = item.id;
                    item.checked = true;
                    hardStop = item.stop;
                } else {
                    item.disabled = true;
                    item.checked = false;
                }
            } else {
                item.checked = false;
                item.disabled = false;
            }
        });
        if (!hardStop && event.target.checked) {
            this.noCompleteInfo = false;
        } else if ((hardStop && event.target.checked) || !event.target.checked) {
            this.noCompleteInfo = true;
        }
        this.landlordOptions = [...options];
    }
}