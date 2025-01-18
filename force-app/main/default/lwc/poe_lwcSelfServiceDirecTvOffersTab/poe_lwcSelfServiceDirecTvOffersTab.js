import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import getAgentName from "@salesforce/apex/POE_OffersTabController.getAgentName";
import DTVEngaStreamProtectionPlansLabel from "@salesforce/label/c.DTV_Enga_Stream_Protection_Plans_Label";
import DTVEngaBeamProtectionPlansLabel from "@salesforce/label/c.DTV_Enga_Beam_Protection_Plans_Label";
import DTVEngaStreamTechProtectVerbiage1 from "@salesforce/label/c.DTVEngaStreamTechProtectVerbiage1";
import DTVEngaStreamTechProtectVerbiage2 from "@salesforce/label/c.DTVEngaStreamTechProtectVerbiage2";
import DTVEngaStreamTechProtectPremiumVerbiage1 from "@salesforce/label/c.DTVEngaStreamTechProtectPremiumVerbiage1";
import DTVEngaStreamTechProtectPremiumVerbiage2 from "@salesforce/label/c.DTVEngaStreamTechProtectPremiumVerbiage2";
import MAX_DISCLAIMER from "@salesforce/label/c.DTV_Offer_Tab_Max_Disclaimer";
import PARAMOUNT_DISCLAIMER from "@salesforce/label/c.DTV_Offer_Tab_Paramount_Disclaimer";
import MGM_DISCLAIMER from "@salesforce/label/c.DTV_Offer_Tab_MGM_Disclaimer";
import CINEMAX_DISCLAIMER from "@salesforce/label/c.DTV_Offer_Tab_Cinemax_Disclaimer";
import STARZ_DISCLAIMER from "@salesforce/label/c.DTV_Offer_Tab_Starz_Disclaimer";
import MXP_DISCLAIMER from "@salesforce/label/c.DTV_Offer_Tab_MXP_Disclaimer";
import DISCOVERY_DISCLAIMER from "@salesforce/label/c.DTV_Offer_Tab_Discovery_Disclaimer";
import HISTORY_DISCLAIMER from "@salesforce/label/c.DTV_Offer_Tab_History_Disclaimer";
import LIFETIME_DISCLAIMER from "@salesforce/label/c.DTV_Offer_Tab_Lifetime_Disclaimer";
import SPORTS_DISCLAIMER from "@salesforce/label/c.DTV_Offer_Tab_Sports_Disclaimer";
import TECH_PROTECT_DISCLAIMER_1 from "@salesforce/label/c.DTV_Offer_Tab_Tech_Protect_Disclaimer_1";
import TECH_PROTECT_DISCLAIMER_2 from "@salesforce/label/c.DTV_Offer_Tab_Tech_Protect_Disclaimer_2";
import DEFAULT_DISCLAIMER from "@salesforce/label/c.DTV_Offer_Tab_Default_Disclaimer";
import MAX_DESCRIPTION from "@salesforce/label/c.DTV_Offer_Tab_Max_Description";
import MGM_DESCRIPTION from "@salesforce/label/c.DTV_Offer_Tab_MGM_Description";
import PARAMOUNT_DESCRIPTION from "@salesforce/label/c.DTV_Offer_Tab_Paramount_Description";

//Hardcoded T&Cs as per ENGA's request on 01/04/2023 since they haven't fully developed the functionality//
const streamTerms = {
    "BOLT-HBO-201610": MAX_DISCLAIMER,
    "BOLT-CINEMAX-201610": CINEMAX_DISCLAIMER,
    "BOLT-STARZ-201610": STARZ_DISCLAIMER,
    "BOLT-SHOWTIME-201707": PARAMOUNT_DISCLAIMER,
    "BOLT-MVPX-201910": MXP_DISCLAIMER,
    "BOLT-DISCOVERY-202208": DISCOVERY_DISCLAIMER,
    "BOLT-HISTORY-202310": HISTORY_DISCLAIMER,
    "BOLT-LIFETIME-201910": LIFETIME_DISCLAIMER,
    "BOLT-SPACK-202222": SPORTS_DISCLAIMER,
    "BOLT-EPIX-201907": MGM_DISCLAIMER,
    Default: DEFAULT_DISCLAIMER
};

const streamDescriptions = {
    "BOLT-HBO-201610": MAX_DESCRIPTION,
    "BOLT-SHOWTIME-201707": PARAMOUNT_DESCRIPTION,
    "BOLT-EPIX-201907": MGM_DESCRIPTION
};

const MGM_PLUS_DISCOUNT_BUNDLE_CODE = "OF_BOLTON-HBO-SHOW-STARZ-CINE-EPIX-V2_satellite";
const MGM_PLUS_ID = "a1bdfe8b-e861-4c2c-bd25-f98a6184e3b1";
const TECH_PROTECT_DISCLAIMER = TECH_PROTECT_DISCLAIMER_1 + TECH_PROTECT_DISCLAIMER_2;

export default class Poe_lwcBuyflowDirecTvEngaOffersTab extends NavigationMixin(LightningElement) {
    @api logo;
    @api stream;
    @api orderInfo;
    @api providerStyle;
    @api billingInfo;
    @api cartInfo;
    @api recordId;
    @api internationalRequired;
    @api origin;
    @api returnUrl;
    @api clientInfo;
    @api treatmentCode;
    @api addCartData;
    @api isGuestUser;
    @api closingOffers;
    @api offers;
    @api protections;
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
        protectionPlans: [],
        closingOffers: []
    };
    showCollateral;
    hasRequired = true;
    hasIncluded = true;
    noCompleteInfo;
    billingDetailsRequest;
    agentFirstName;
    agentLastName;
    checkedOffers = [];
    labels = {
        DTVEngaStreamTechProtectVerbiage1,
        DTVEngaStreamTechProtectVerbiage2,
        DTVEngaStreamTechProtectPremiumVerbiage1,
        DTVEngaStreamTechProtectPremiumVerbiage2
    };
    showClosingOffers = false;
    hasClosingOffers = false;
    beamClosingOffers = [];
    showTab = {
        required: true,
        included: false,
        premium: false,
        international: false,
        sports: false,
        protection: false,
        closing: false
    };
    offersToShow = [];
    title;
    showIncluded = true;
    beamCartRequest = {};

    get DTVEngaProtectionPlansLabel() {
        return this.stream ? DTVEngaStreamProtectionPlansLabel : DTVEngaBeamProtectionPlansLabel;
    }

    get beam() {
        return !this.stream;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get hiddenSBS() {
        return !this.showSBS;
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconCheckBlue() {
        return chuzoSiteResources + "/images/icon-check-blue.svg";
    }

    get iconCheckGreenMin() {
        return chuzoSiteResources + "/images/icon-check-green.svg";
    }

    get iconNumberTV() {
        return chuzoSiteResources + "/images/icon-number-tv.svg";
    }

    get globeLogo() {
        return chuzoSiteResources + "/images/globe-icon1-blue.png";
    }

    get sportLogo() {
        return chuzoSiteResources + "/images/sports-icon-blue.png";
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        this.title = this.isGuestUser ? "Add extras to your service" : "Service Extras";
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        } else {
            this.getUserDetails();
        }
        this.cart = { ...this.cartInfo };
        this.originalCart = { ...this.cartInfo };
        this.offersHandler();
        this.offersToShow = [...this.configurations.offers.required];
        this.showClosingOffers =
            !this.isGuestUser && (this.beamClosingOffers.length > 0 || this.closingOffers.length > 0);
        this.protectionPlansHandler();
        if (this.showClosingOffers) {
            this.closingOffersHandler();
        }
        this.handleRemoveCart();
    }

    handleTab(event) {
        let showController = { ...this.showTab };
        let offers = [];

        switch (event.target.dataset.id) {
            case "required":
                showController = {
                    required: true,
                    included: false,
                    premium: false,
                    international: false,
                    sports: false,
                    protection: false,
                    closing: false
                };
                offers = [...this.configurations.offers.required];
                break;
            case "included":
                showController = {
                    required: false,
                    included: true,
                    premium: false,
                    international: false,
                    sports: false,
                    protection: false,
                    closing: false
                };
                offers = [...this.configurations.offers.included];
                break;
            case "premium":
                showController = {
                    required: false,
                    included: false,
                    premium: true,
                    international: false,
                    sports: false,
                    protection: false,
                    closing: false
                };
                offers = [...this.configurations.premiums];
                break;
            case "sports":
                showController = {
                    required: false,
                    included: false,
                    premium: false,
                    international: false,
                    sports: true,
                    protection: false,
                    closing: false
                };
                offers = [...this.configurations.sports];
                break;
            case "international":
                showController = {
                    required: false,
                    included: false,
                    premium: false,
                    international: true,
                    sports: false,
                    protection: false,
                    closing: false
                };
                offers = [...this.configurations.international];
                break;
            case "protection":
                showController = {
                    required: false,
                    included: false,
                    premium: false,
                    international: false,
                    sports: false,
                    protection: true,
                    closing: false
                };
                offers = [...this.configurations.protectionPlans];
                break;
            case "closing":
                showController = {
                    required: false,
                    included: false,
                    premium: false,
                    international: false,
                    sports: false,
                    protection: false,
                    closing: true
                };
                offers = [...this.configurations.closingOffers];
                break;
        }
        this.showTab = { ...showController };
        this.offersToShow = [...offers];
        let tabs = this.template.querySelectorAll(".button-tab");
        tabs.forEach((item) => {
            if (item.dataset.id === event.target.dataset.id) {
                item.classList.add("selected");
            } else {
                item.classList.remove("selected");
            }
        });
    }

    getUserDetails() {
        getAgentName()
            .then((response) => {
                this.agentFirstName = response.result.firstName;
                this.agentLastName = response.result.lastName;
            })
            .catch((error) => {
                console.error("ERROR", error);
                const errorMessage = error.body?.message || error.message;
                this.logError(errorMessage);
            });
    }

    handleToggleChange(event) {
        let offers = [...this.offersToShow];
        let protections = [...this.configurations.protectionPlans];
        let disable = [];
        let selectedId = event.target.dataset.id;
        let checked = ![...offers.filter((item) => item.id == selectedId)][0].checked;
        offers.forEach((item) => {
            if (item.id == selectedId) {
                item.checked = checked;
                if (item.disableChoiceCode !== undefined) {
                    disable = [...item.disableChoiceCode];
                }

                if (item.id === MGM_PLUS_DISCOUNT_BUNDLE_CODE) {
                    disable.push(MGM_PLUS_ID);
                }
                if (item.type === "protection") {
                    protections.forEach((offer) => {
                        if (offer.id !== item.id) {
                            let confElement = this.template.querySelector(`[data-id=${offer.id}]`);
                            offer.required = checked;
                            if (checked) {
                                confElement.classList.add("btn-disabled");
                            } else {
                                confElement.classList.remove("btn-disabled");
                            }
                        }
                    });
                    this.configurations.protectionPlans = [...protections];
                }
            }
        });
        let allOffers = [
            ...this.configurations.offers.required,
            ...this.configurations.sports,
            ...this.configurations.international,
            ...this.configurations.premiums,
            ...this.configurations.protectionPlans,
            ...this.configurations.closingOffers
        ];
        if (disable.length > 0) {
            allOffers.forEach((item) => {
                if (disable.includes(item.productId)) {
                    if (checked) {
                        item.required = true;
                        item.checked = true;
                        item.fee = "$" + Number(0.0).toFixed(2);
                    } else {
                        item.required = false;
                        item.checked = false;
                        item.fee = item.originalFee;
                    }
                }
            });
        }

        this.offersToShow = [...offers];
        if (this.showTab.required) {
            this.configurations.offers.required = [...offers];
        } else if (this.showTab.included) {
            this.configurations.offers.included = [...offers];
        } else if (this.showTab.sports) {
            this.configurations.sports = [...offers];
        } else if (this.showTab.international) {
            this.configurations.international = [...offers];
        } else if (this.showTab.premium) {
            this.configurations.premiums = [...offers];
        } else if (this.showTab.closing) {
            this.configurations.closingOffers = [...offers];
        } else if (this.showTab.protection) {
            this.configurations.protectionPlans = [...offers];
        }
        this.generateCart();
    }

    generateCart() {
        let allOffers = [
            ...this.configurations.offers.required,
            ...this.configurations.sports,
            ...this.configurations.international,
            ...this.configurations.premiums,
            ...this.configurations.protectionPlans,
            ...this.configurations.closingOffers
        ];

        let cart = { ...this.originalCart };
        let cartElements = JSON.parse(JSON.stringify(cart.monthlyCharges));
        let cartElementsToday = JSON.parse(JSON.stringify(cart.todayCharges));
        let monthlyCharges = [...cartElements];
        let todayCharges = [...cartElementsToday];
        let firstBillCharges = [];
        allOffers.forEach((item) => {
            if (item.checked && !item.required && item.fee != "") {
                let fee = Number(item.fee.replace("$", "")).toFixed(2);
                let newCharge = {
                    name: item.cartName,
                    fee: fee,
                    discount: fee > 0.0 ? false : true,
                    hasDescription: false,
                    description: item.cartDisclosure,
                    type: "offers"
                };
                if (item.feeTerm === "Monthly") {
                    if (item.freePromo && this.stream) {
                        let benefitCharge = {
                            ...newCharge,
                            fee: (Number(fee) * -1).toFixed(2),
                            discount: true,
                            hasDescription: false
                        };
                        monthlyCharges.push(benefitCharge);
                    } else {
                        cart.hasMonthly = true;
                        monthlyCharges.push(newCharge);
                    }
                } else if (item.feeTerm === "Single") {
                    if (item.freePromo && this.stream) {
                        let benefitCharge = {
                            ...newCharge,
                            fee: (Number(fee) * -1).toFixed(2),
                            discount: true,
                            hasDescription: false
                        };
                        firstBillCharges.push(benefitCharge);
                    } else {
                        cart.hasFirstBill = true;
                        firstBillCharges.push(newCharge);
                    }
                } else {
                    if (item.freePromo && this.stream) {
                        let benefitCharge = {
                            ...newCharge,
                            fee: (Number(fee) * -1).toFixed(2),
                            discount: true,
                            hasDescription: false
                        };
                        todayCharges.push(benefitCharge);
                    } else {
                        cart.hasToday = true;
                        todayCharges.push(newCharge);
                    }
                }
            }
        });
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

        this.dispatchEvent(
            new CustomEvent("cartupdate", {
                detail: this.cart
            })
        );
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    handleNext() {
        this.loaderSpinner = true;
        if (this.internationalRequired) {
            let valid = false;
            this.configurations.international.forEach((item) => {
                if (item.checked) {
                    valid = true;
                }
            });
            if (!valid) {
                const event = new ShowToastEvent({
                    title: "International Package Required",
                    variant: "error",
                    message: "Based on the Base Package selection, an International package is required to be selected."
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                return;
            }
        }

        let allOffers = [
            ...this.configurations.offers.included,
            ...this.configurations.offers.required,
            ...this.configurations.sports,
            ...this.configurations.international,
            ...this.configurations.premiums,
            ...this.configurations.protectionPlans,
            ...this.configurations.closingOffers
        ];
        let terms = [];
        this.checkedOffers = [];
        let auxCartOffers = [];
        allOffers.forEach((item) => {
            if (item.checked && !item.required) {
                let offer = {
                    offerCode: item.id,
                    quantity: 1
                };
                auxCartOffers.push(offer);
                terms.push({
                    consentLabel: item.name,
                    consentText: item.terms,
                    checked: false,
                    id: item.id
                });
                this.checkedOffers.push(item);
            }
        });
        if (this.stream) {
            let info = {
                terms,
                checkedOffers: this.checkedOffers
            };
            this.handleAddCart(info);
        } else {
            const path = "addBillingAccount";
            let myData = { ...JSON.parse(JSON.stringify(this.billingInfo)), path, partnerName: "enga" };
            myData.treatmentCode = this.treatmentCode;
            myData.cartContext.cartOffers = [...myData.cartContext.cartOffers, ...auxCartOffers];
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
                        let info = {
                            result,
                            terms,
                            checkedOffers: this.checkedOffers,
                            billingRequest: this.billingDetailsRequest
                        };
                        this.handleAddCart(info);
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
                        this.logError(
                            `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                            myData,
                            path,
                            "API Error"
                        );
                    } else {
                        const errorMessage = error.body?.message || error.message;
                        this.logError(errorMessage);
                    }
                    this.loaderSpinner = false;
                });
        }
    }

    handleBack() {
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
        this.left = event.detail?.clientX || event.clientX;
        this.top = event.detail?.clientY || event.clientY;
        let allOffers = [
            ...this.configurations.offers.included,
            ...this.configurations.offers.required,
            ...this.configurations.sports,
            ...this.configurations.international,
            ...this.configurations.premiums,
            ...this.configurations.protectionPlans,
            ...this.configurations.closingOffers
        ];
        allOffers.forEach((item) => {
            if (item.id == (event.detail?.id || event.target.dataset.id)) {
                this.offerDescription = item.description;
            }
        });
        this.showPopup = true;
    }

    hideData(event) {
        this.showPopup = false;
    }

    protectionPlansHandler() {
        let data = [...this.protections.content.offers];
        let protectionPlans = [];
        this.protectionHeader = this.stream ? "Protection Plans" : data[0].description.en;
        data.forEach((offer) => {
            let offerObject = {
                id: offer.code,
                productId: offer.code,
                name: this.stream ? offer.name.en : offer.attributes.displayName.en,
                description: this.stream ? offer.description.en : offer.attributes.termsAndConditions.en,
                terms: this.stream ? TECH_PROTECT_DISCLAIMER : offer.attributes.termsAndConditions.en,
                hasDescription: this.stream
                    ? offer.description.en
                    : offer.attributes.hasOwnProperty("termsAndConditions") &&
                      offer.attributes.termsAndConditions.en != "",
                cartName: this.stream ? offer.name.en : offer.attributes.displayName.en,
                cartDisclosure: "",
                img: "",
                checked: false,
                required: false,
                originalFee: "$" + Number(offer.attributes.offerPrice.dollarAmount).toFixed(2),
                fee: "$" + Number(offer.attributes.offerPrice.dollarAmount).toFixed(2),
                feeTerm: "Monthly",
                disableChoiceCode: [],
                show: true,
                order: Number(this.stream ? offer.rank : offer.attributes.rank),
                type: "protection"
            };
            protectionPlans.push(offerObject);
        });
        this.configurations.protectionPlans = [...this.sortOffers(protectionPlans)];
    }

    offersHandler() {
        let included = [];
        let required = [];
        let adults = [];
        let tv = [];
        let premium = [];
        let sports = [];
        let internationals = [];
        let includedProducts = [];
        if (this.orderInfo.product.includedProducts.length > 0) {
            this.orderInfo.product.includedProducts.forEach((item) => includedProducts.push(item.key));
        }
        this.offers.addonOffers.forEach((offer, index) => {
            if (offer.offerType.toLowerCase() === "credit") {
                this.beamClosingOffers.push(offer);
            } else {
                let addOn = { ...this.createOfferObject(offer, index) };
                if (includedProducts.includes(offer.product.billingProductCode)) {
                    addOn.checked = true;
                    addOn.fee = "$" + Number(0.0).toFixed(2);
                    addOn.isIncluded = true;
                    included.push(addOn);
                } else if (offer.specialOffer) {
                    required.push(addOn);
                } else {
                    if (offer.product.subCategory.toLowerCase() === "international") {
                        internationals.push(addOn);
                    } else if (offer.product.subCategory.toLowerCase() === "tv") {
                        tv.push(addOn);
                    } else if (offer.product.subCategory.toLowerCase() === "premium") {
                        premium.push(addOn);
                    } else if (offer.product.subCategory.toLowerCase() === "adult") {
                        adults.push(addOn);
                    } else if (offer.product.subCategory.toLowerCase() === "sports") {
                        sports.push(addOn);
                    }
                }
            }
        });
        if (this.offers.addonIncludedProducts !== null) {
            this.offers.addonIncludedProducts.forEach((includedOffer, index) => {
                if (!this.stream || (this.stream && includedOffer.offerType !== "video-plan")) {
                    let offerObject = {
                        id: includedOffer.offerCode,
                        name: includedOffer.shortDisplayName,
                        description: `${includedOffer.fullDescription}&nbsp;${includedOffer.termsAndConditions}`,
                        terms: includedOffer.termsAndConditions,
                        hasDescription:
                            includedOffer.hasOwnProperty("fullDescription") && includedOffer.fullDescription != "",
                        cartName: includedOffer.fullDisplayName,
                        cartDisclosure: "",
                        img: "",
                        checked: true,
                        required: true,
                        isIncluded: true,
                        fee: Number(0.0).toFixed(2),
                        feeTerm: "Monthly",
                        show: true,
                        order: index,
                        type: "included"
                    };
                    included.push(offerObject);
                }
            });
        }
        this.hasRequired = required.length > 0;
        this.hasIncluded = included.length > 0;
        this.configurations.offers.included = this.sortOffers(included);
        this.showIncluded = this.configurations.offers.included.length > 0;
        this.configurations.offers.required = this.sortOffers(required);
        this.configurations.premiums = [
            ...this.sortOffers(premium),
            ...this.sortOffers(tv),
            ...this.sortOffers(adults)
        ];
        this.configurations.sports = this.sortOffers(sports);
        this.configurations.international = this.sortOffers(internationals).sort((a, b) =>
            a.category > b.category ? 1 : a.category < b.category ? -1 : 0
        );
    }

    closingOffersHandler() {
        let closingOffers = [];
        if (this.stream) {
            this.closingOffers.forEach((item, index) => {
                let offerObject = {
                    id: item.benefitCode,
                    name: item.benefitName,
                    description: item.benefitDescription,
                    terms: "",
                    hasDescription: item.hasOwnProperty("benefitDescription") && item.benefitDescription != "",
                    cartName: item.benefitDisplayName,
                    cartDisclosure: "",
                    img: "",
                    checked: false,
                    required: false,
                    fee: `$${(Number(item.benefitFlattOffPrice) * -1).toFixed(2)}`,
                    feeTerm: "Monthly",
                    show: true,
                    order: index,
                    type: "closingOffer"
                };
                closingOffers.push(offerObject);
            });
        } else {
            this.beamClosingOffers.forEach((item, index) => {
                let offerObject = {
                    id: item.offerCode,
                    name: item.fullDisplayName,
                    description: item.fullDescription,
                    terms: "",
                    hasDescription: item.hasOwnProperty("fullDescription") && item.fullDescription != "",
                    cartName: item.shortDisplayName,
                    cartDisclosure: "",
                    img: "",
                    checked: false,
                    required: false,
                    fee:
                        item.childSkus[0].hasOwnProperty("price") &&
                        item.childSkus[0].price.hasOwnProperty("productBenefitsInfo") &&
                        item.childSkus[0].price.productBenefitsInfo.benefits.length > 0
                            ? "$" +
                              (
                                  Number(item.childSkus[0].price.productBenefitsInfo.benefits[0].benefitFlattOffPrice) *
                                  -1
                              ).toFixed(2)
                            : "",
                    feeTerm: "Monthly",
                    show: true,
                    order: index,
                    type: "closingOffer"
                };
                closingOffers.push(offerObject);
            });
        }
        this.configurations.closingOffers = [...closingOffers];
    }

    createOfferObject(offer, order) {
        let disableCodes = [];
        offer.product.bundleProducts.forEach((item) => {
            item.products.forEach((subProduct) => {
                if (Array.isArray(subProduct.includedProducts)) {
                    subProduct.includedProducts.forEach((includedProduct) => {
                        if (includedProduct.products !== null) {
                            includedProduct.products.forEach((bundledProduct) => {
                                disableCodes.push(bundledProduct.id);
                            });
                        }
                    });
                } else {
                    if (subProduct.includedProducts.hasOwnProperty("products")) {
                        subProduct.includedProducts.products.forEach((includedProduct) => {
                            disableCodes.push(includedProduct.id);
                        });
                    }
                }
            });
        });
        let offerObject = {
            id: offer.offerCode,
            billingProductCode: this.stream ? offer.product.billingProductCode : "",
            productId: offer.product.productId,
            name: offer.fullDisplayName,
            description:
                this.stream && streamDescriptions.hasOwnProperty(offer.product.billingProductCode)
                    ? streamDescriptions[offer.product.billingProductCode] +
                      `${offer.product.longDescription.replace(/##/g, " ")}&nbsp;${offer.product.termsAndConditions}`
                    : `${offer.product.longDescription.replace(/##/g, " ")}&nbsp;${offer.product.termsAndConditions}`,
            terms: this.stream
                ? streamTerms.hasOwnProperty(offer.product.billingProductCode)
                    ? streamTerms[offer.product.billingProductCode]
                    : streamTerms["Default"]
                : offer.product.termsAndConditions,
            hasDescription:
                (offer.product.hasOwnProperty("longDescription") && offer.product.longDescription != "") ||
                (this.stream && streamDescriptions.hasOwnProperty(offer.product.billingProductCode)),
            cartName: offer.fullDisplayName,
            cartDisclosure: offer.specialOffer ? offer.shortDescription : "",
            img: "",
            checked: false,
            required: false,
            isIncluded: false,
            originalFee: offer.childSkus[0].hasOwnProperty("price")
                ? "$" + Number(offer.childSkus[0].price.bestPrice).toFixed(2)
                : "",
            fee: offer.childSkus[0].hasOwnProperty("price")
                ? "$" + Number(offer.childSkus[0].price.bestPrice).toFixed(2)
                : "",
            feeTerm:
                offer.childSkus[0].price.chargeType === "nrc" ||
                offer.childSkus[0].price.chargeType === "mrc" ||
                offer.childSkus[0].price.chargeType === ""
                    ? "Monthly"
                    : "Single",
            freePromo:
                offer.childSkus[0].hasOwnProperty("price") &&
                offer.childSkus[0].price.hasOwnProperty("productBenefitsInfo") &&
                offer.childSkus[0].price.productBenefitsInfo.benefits.some((item) => item.benefitType === "free-promo"),
            category: offer.product.language === "Brazilian Portuguese" ? "Brazilian" : offer.product.language,
            disableChoiceCode: [...disableCodes],
            show: true,
            order: Number(offer.product.hasOwnProperty("displayRanking") ? offer.product.displayRanking : order),
            type: "addOn"
        };
        return offerObject;
    }

    sortOffers(offers) {
        return offers.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
    }

    handleCancel() {
        if (this.returnUrl != undefined) {
            window.open(this.returnUrl, "_self");
        } else if (this.isGuestUser) {
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

    handleAddCart(info) {
        const { firstName, middleName, lastName } = this.clientInfo.contactInfo;
        let myData = {};
        const path = "addCart";
        if (this.beam) {
            let date = new Date();
            date.setDate(date.getDate() + 30);
            const yyyy = date.getFullYear();
            let mm = date.getMonth() + 1;
            let dd = date.getDate();
            if (dd < 10) dd = "0" + dd;
            if (mm < 10) mm = "0" + mm;
            myData = {
                path,
                ...this.orderInfo,
                shoppingContext: {},
                itemsList: [],
                serviceContext: {
                    srcSystem: "myAttSales"
                },
                GeoInfo: {
                    zipCode: this.orderInfo.address.zipCode,
                    zipCounty: this.orderInfo.address.county
                },
                channelEligibility: {
                    isFulfillmentDealer: !this.orderInfo.NFFL
                },
                marketingSourceCode: [this.orderInfo.marketingSourceCode],
                treatmentCode: this.treatmentCode,
                customData: {
                    paramKVPair: [
                        {
                            name: "name",
                            value: this.isGuestUser
                                ? ["Self Service Customer"]
                                : [`${firstName} ${middleName !== undefined ? middleName : ""} ${lastName}`]
                        },
                        {
                            name: "fulfillmentFlag",
                            value: [(!this.orderInfo.NFFL).toString().toLowerCase()]
                        },
                        {
                            name: "salesAgentId",
                            value: [this.orderInfo.dealerAgentId]
                        },
                        {
                            name: "alternateSalesAgentId",
                            value: [""]
                        },
                        {
                            name: "SalesCRMAgentId",
                            value: [this.orderInfo.dealerAgentId]
                        },
                        {
                            name: "AgentId",
                            value: [this.orderInfo.dealerAgentId]
                        },
                        {
                            name: "agentSite",
                            value: [this.orderInfo.opusStoreId]
                        },
                        {
                            name: "salesAgent",
                            value: [this.orderInfo.dealerAgentId]
                        },
                        {
                            name: "salesChannelIndicator",
                            value: [this.orderInfo.channel]
                        },
                        {
                            name: "Corp_Id",
                            value: [this.orderInfo.dealerCorpId]
                        },
                        {
                            name: "channel",
                            value: [this.orderInfo.channel]
                        },
                        {
                            name: "subChannel",
                            value: [this.orderInfo.subChannel]
                        },
                        {
                            name: "user",
                            value: [this.orderInfo.dealerAgentId]
                        },
                        {
                            name: "locationId",
                            value: [this.orderInfo.dealerLocation]
                        },
                        {
                            name: "locationTypeId",
                            value: [this.orderInfo.locationTypeId]
                        },
                        {
                            name: "dealerID",
                            value: [this.orderInfo.dealerId]
                        },
                        {
                            name: "dealerCode",
                            value: [this.orderInfo.channelEligibility.dealerCode]
                        },
                        {
                            name: "dealerChainNumber",
                            value: [this.orderInfo.dealerChainNumber]
                        },
                        {
                            name: "masterDealerId",
                            value: [this.orderInfo.masterDealerId]
                        },
                        {
                            name: "welcomeLetterCode",
                            value: [this.orderInfo.welcomeLetterCode]
                        },
                        {
                            name: "collectpaymentflag",
                            value: ["true"]
                        },
                        {
                            name: "corporateId",
                            value: [this.orderInfo.dealerCorpId]
                        }
                    ],
                    customerContext: {
                        satellite: {
                            businessSegment: "REG",
                            accountStatus: "PEND"
                        }
                    },
                    reconnectCustomer: false,
                    serviceEndDate: `${mm}-${dd}-${yyyy}`,
                    salesChannel: "directIntegrationPartner"
                }
            };

            if (!this.isGuestUser) {
                myData.customData.paramKVPair.push(
                    {
                        name: "agentFirstName",
                        value: [this.agentFirstName]
                    },
                    {
                        name: "agentLastName",
                        value: [this.agentLastName]
                    }
                );
            }
            myData.itemsList.push({
                action: "ADD",
                itemType: "BASE",
                offerId: this.orderInfo.product.Id,
                productGroup: this.beam ? "DTVS" : "DTVNOW",
                quantity: 1
            });
        } else {
            myData = JSON.parse(JSON.stringify(this.addCartData));
            myData.path = "addCart";
        }
        this.checkedOffers.forEach((item) => {
            myData.itemsList.push({
                action: "ADD",
                itemType:
                    item.type === "protection"
                        ? "PROTECTIONPLAN"
                        : item.type === "closingOffer" && this.stream
                        ? "BASE"
                        : "ADDON",
                offerId: item.id,
                productGroup: this.beam ? "DTVS" : "DTVNOW",
                quantity: 1
            });
        });
        if (this.orderInfo.hasOwnProperty("equipmentSelected")) {
            this.orderInfo.equipmentSelected.forEach((item) => {
                myData.itemsList.push({
                    action: "ADD",
                    itemType: this.beam ? "HARDGOOD" : "EQUIPMENT",
                    offerId: item.type,
                    productGroup: this.beam ? "DTVS" : "DTVNOW",
                    quantity: Number(item.quantity)
                });
            });
        }
        info.hasClosingOffers = this.checkedOffers.some((item) => item.type === "closingOffer");
        info.beamCartRequest = { ...myData };
        console.log("Add Cart Request", myData);
        let addCartData = { ...myData };
        if (this.beam) {
            this.loaderSpinner = false;
            const nextEvent = new CustomEvent("next", {
                detail: info
            });
            this.dispatchEvent(nextEvent);
        } else {
            let apiResponse;
            const genericErrorMessage =
                "The request could not be made correctly to the server. Please, validate the information and try again.";
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
                        this.loaderSpinner = false;
                    } else {
                        if (result.content.payload.cartStatus.cartState.toLowerCase() === "complete") {
                            info.addCartData = addCartData;
                            this.handleCartSummary(info);
                        } else {
                            const event = new ShowToastEvent({
                                title: "Server Error",
                                variant: "error",
                                mode: "sticky",
                                message: genericErrorMessage
                            });
                            this.dispatchEvent(event);
                            this.logError(
                                `${genericErrorMessage}\nAPI Response: ${response}`,
                                myData,
                                path,
                                "API Error"
                            );
                            this.loaderSpinner = false;
                        }
                    }
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: genericErrorMessage
                    });
                    this.dispatchEvent(event);
                    if (apiResponse) {
                        this.logError(
                            `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                            myData,
                            path,
                            "API Error"
                        );
                    } else {
                        const errorMessage = error.body?.message || error.message;
                        this.logError(errorMessage);
                    }
                    this.loaderSpinner = false;
                });
        }
    }

    handleCartSummary(info) {
        this.loaderSpinner = true;
        const path = "cartSummary";
        let myData = {
            path,
            partnerName: "enga-stream",
            systemCode: "ENGA-CHUZO",
            correlationId: this.orderInfo.correlationId,
            dealerCorpId: this.orderInfo.dealerCorpId,
            dealerId: this.orderInfo.dealerId,
            dealerAgentId: this.orderInfo.dealerAgentId,
            dealerLocation: this.orderInfo.dealerLocation,
            uuid: this.orderInfo.uuid,
            sid: this.orderInfo.sid
        };
        console.log("Cart Summary Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Cart Summary Response", result);
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
                } else {
                    info.result = result;
                    const nextEvent = new CustomEvent("next", {
                        detail: info
                    });
                    this.dispatchEvent(nextEvent);
                }
                this.loaderSpinner = false;
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
                this.loaderSpinner = false;
            });
    }

    handleRemoveCart() {
        this.loaderSpinner = true;
        const path = "removeCart";
        let myData = {
            path,
            ...this.orderInfo
        };
        this.stream ? (myData.selectedBaseOfferCode = this.orderInfo.componentCode) : undefined;
        console.log("Remove Cart Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Remove Cart Response", result);
                this.loaderSpinner = false;
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
                this.loaderSpinner = false;
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Offers",
            component: "poe_lwcBuyflowDirecTvEngaOffersTab",
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
            tab: "Offers"
        };
        this.dispatchEvent(event);
    }
}