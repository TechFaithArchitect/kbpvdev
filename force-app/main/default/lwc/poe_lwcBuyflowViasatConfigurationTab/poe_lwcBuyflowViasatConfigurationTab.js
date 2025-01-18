import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import ToastContainer from "lightning/toastContainer";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import Product_Selection_Title from  "@salesforce/label/c.Product_Selection_Title";
import The_request_for_checking_voice from "@salesforce/label/c.The_request_for_checking_voice";
import The_Offers_request_could_not_be_made_correctly from "@salesforce/label/c.The_Offers_request_could_not_be_made_correctly";
import The_AddOns_request_could_not_be_made_correctly from "@salesforce/label/c.The_AddOns_request_could_not_be_made_correctly";

export default class Poe_lwcBuyflowViasatConfigurationTab extends NavigationMixin(LightningElement) {
    @api cartInfo;
    @api productSelection;
    @api logo;
    @api recordId;
    @api candidates;
    @api clientInfo;
    @api isGuestUser;
    @api offerId;
    hasOffers = false;
    offers = [];
    hasAddons = false;
    addons = [];
    selectedAddons = [];
    selectedOffers = [];
    loaderSpinner;
    disableNext = true;
    cart = {
        hasToday: false,
        hasMonthly: false,
        todayCharges: [],
        monthlyCharges: [],
        todayTotal: (0.0).toFixed(2),
        monthlyTotal: (0.0).toFixed(2)
    };
    portfolioCardinalityError = false;
    voiceAvailable = false;
    voiceSelected = false;
    voiceId;
    showDisclosures = {
        shield: false,
        voice: false,
        easyCare: false
    };
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        Product_Selection_Title,
        The_request_for_checking_voice,
        The_Offers_request_could_not_be_made_correctly,
        The_AddOns_request_could_not_be_made_correctly
    };
    showSelfServiceCancelModal = false;

    connectedCallback() {
        this.loaderSpinner = true;
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.cart = { ...this.cartInfo };
        if (this.candidates.length > 0) {
            this.handleRemoveOrders();
        } else {
            this.handleConfigurationCallout();
        }
    }

    checkVoiceServiceAvailability() {
        let myData = {
            partnerName: "viasat",
            path: "voiceAvailableAddresses",
            address: {
                addressLine1: this.clientInfo.address.addressLine1,
                addressLine2: this.clientInfo.address.addressLine2,
                zipCode: this.clientInfo.address.zipCode,
                countryCode: "USA"
            }
        };
        console.log("voiceAvailableAddresses Request", myData);
        let apiResponse;
        let getAddonsCalled = false;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("voiceAvailableAddresses Response", responseParsed);
                let error = !(Array.isArray(responseParsed?.vsm_address) && responseParsed.vsm_address.length > 0);
                if (error) {
                    //Awaiting error response to implement behavior
                    this.voiceAvailable = false;
                    const errMsg = "Placeholder error";
                    this.logError(`${errMsg}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                } else {
                    this.voiceAvailable = true;
                }
                getAddonsCalled = true;
                this.getAddons();
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    this.labels.The_request_for_checking_voice;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
                if (!getAddonsCalled) {
                    this.getAddons();
                }
                this.dispatchEvent(event);
            });
    }

    handleConfigurationCallout() {
        let info = this.productSelection;
        let myData = {
            partnerName: "viasat",
            path: "offers",
            tab: "configuration",
            apiName: "offers",
            salesAgreementId: info.salesAgreementId,
            productTypeId: info.productTypeId,
            address: info.location.address,
            latitude: info.location.latitude,
            longitude: info.location.longitude
        };
        console.log("Offers Request: ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Offers Response: ", responseParsed);
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
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage !== "" ? errorMessage : "Internal Server Error"
                    });
                    this.loaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                } else {
                    let result = responseParsed;
                    if (result.hasOwnProperty("Offers_product_types")) {
                        this.hasOffers = result.Offers_product_types.length > 0;
                        if (this.hasOffers) {
                            let offers = result.Offers_product_types;
                            offers.forEach((o) => {
                                const offer = {
                                    description:
                                        o.name +
                                        " - Recurring: $" +
                                        o.prices[0].amount.value +
                                        " " +
                                        o.prices[0].recurrence,
                                    name: o.name,
                                    discounts:
                                        o.discounts.itemized_discounts.length > 0
                                            ? o.discounts.itemized_discounts[0]
                                            : undefined,
                                    id: o.id,
                                    fee: o.prices[0].amount.value,
                                    recurrence: o.prices[0].recurrence,
                                    optionSelected: true
                                };
                                this.offers.push(offer);
                                this.selectedOffers.push(offer.id);

                                const { newCharge, discountCharge } = this.createOfferCharges(offer);
                                this.calculateCart(newCharge, offer.id, discountCharge);
                            });
                        }
                        this.checkVoiceServiceAvailability();
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    this.labels.The_Offers_request_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    getAddons() {
        let info = this.productSelection;
        let myData = {
            partnerName: "viasat",
            path: "addOns",
            tab: "configuration",
            offerId: this.offerId,
            apiName: "addons",
            salesAgreementId: info.salesAgreementId,
            productTypeId: info.productTypeId,
            address: info.location.address,
            latitude: info.location.latitude,
            longitude: info.location.longitude
        };
        console.log("Addons Request: ", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                const responseParsed = JSON.parse(response);
                console.log("Addons Response: ", responseParsed);
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
                    this.loaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(
                        `${finalErrorMessage}\nAPI Response: ${apiResponse}`,
                        myData,
                        myData.path,
                        "API Error"
                    );
                } else {
                    let result = responseParsed;
                    if (result.hasOwnProperty("AddOns_product_types")) {
                        this.hasAddons = result.AddOns_product_types.length > 0;
                        if (this.hasAddons) {
                            let addons = result.AddOns_product_types;
                            addons.forEach((a) => {
                                let attributes = a.marketing_copy.translations[0].characteristics.filter(
                                    (ch) => ch.name.includes("ATTRIBUTE_") && ch.value != ""
                                );
                                if (a.discounts.itemized_discounts.length > 0) {
                                    let attribute = {
                                        value: `${a.discounts.itemized_discounts[0].name}`,
                                        name: "DISCOUNT"
                                    };
                                    attributes.push(attribute);
                                }

                                let displayOrder = a.marketing_copy.ui_behaviors.characteristics
                                    .filter((ch) => {
                                        return ch.name == "DISPLAY_ORDER";
                                    })
                                    .map((ch) => {
                                        return ch.value;
                                    });
                                let addon = {
                                    addonName: a.name,
                                    id: a.id,
                                    description:
                                        a.marketing_copy.translations[0].characteristics.filter(
                                            (ch) => ch.name == "OFFER_DESCRIPTION"
                                        ).length > 0
                                            ? a.marketing_copy.translations[0].characteristics.find(
                                                  (ch) => ch.name == "OFFER_DESCRIPTION"
                                              ).value
                                            : "",
                                    attributes: attributes,
                                    displayOrder: displayOrder[0],
                                    label:
                                        "Accept - Recurring: $" +
                                        a.prices[0].amount.value +
                                        " " +
                                        a.prices[0].recurrence,
                                    price: a.prices[0].amount.value,
                                    discounts:
                                        a.discounts.itemized_discounts.length > 0
                                            ? a.discounts.itemized_discounts[0]
                                            : undefined,
                                    recurrence: a.prices[0].recurrence,
                                    optionSelected: false
                                };
                                this.addons.push(addon);
                            });
                            if (!this.voiceAvailable) {
                                this.addons = this.addons.filter(
                                    (addon) =>
                                        addon.addonName !== "Viasat Voice" &&
                                        addon.id !== "9fbdac0d-bc2a-468c-b5ce-52bd3e0bd916" &&
                                        addon.id !== "aa97c809-f847-4953-819d-3c42706f74f2" &&
                                        addon.addonName !== "Viasat CAFII Voice"
                                );
                            }
                            this.addons.sort((a, b) => (a.displayOrder > b.displayOrder ? 1 : -1));
                        }
                    }
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    this.labels.The_AddOns_request_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    handlePackageSelection(event) {
        let currentValue = event.target.value;
        let addonId = event.currentTarget.dataset.id;
        let addonsOptions = this.template.querySelectorAll(`[data-id="${addonId}"]`);
        addonsOptions.forEach((a) => {
            if (currentValue == a.value) {
                a.classList.add("selectedPackage");
                a.checked = true;
            } else {
                a.classList.remove("selectedPackage");
                a.checked = false;
            }
        });

        let newCharge;
        let discountCharge;
        let addonIndex = this.addons.findIndex((a) => a.id == addonId);
        this.addons[addonIndex].optionSelected = true;
        let addon = this.addons.find((a) => a.id == addonId);
        let isVoiceAddon =
            addon?.addonName == "Viasat Voice" ||
            addon?.addonName == "Viasat CAFII Voice" ||
            addon?.id == "aa97c809-f847-4953-819d-3c42706f74f2" ||
            addon?.id == "9fbdac0d-bc2a-468c-b5ce-52bd3e0bd916";
        if (currentValue == "decline") {
            if (isVoiceAddon) this.voiceSelected = false;

            let index = this.selectedAddons.indexOf(addonId);
            if (index != -1) {
                this.selectedAddons.splice(index, 1);
            }
            newCharge = false;
        } else {
            if (isVoiceAddon) {
                this.voiceSelected = true;
                this.voiceId = addonId;
            }
            this.selectedAddons.push(addonId);
            newCharge = {
                name: addon.addonName,
                fee: addon.price.toFixed(2),
                recurrence: addon.recurrence,
                id: addonId,
                discount: Number(addon.price).toFixed(2) <= 0
            };
            if (addon.discounts !== undefined) {
                discountCharge = {
                    name: addon.discounts.name,
                    fee: addon.discounts.amount.value.toFixed(2),
                    recurrence: addon.recurrence,
                    id: addonId + "D",
                    discount: Number(addon.discounts.amount.value).toFixed(2) <= 0
                };
            }
        }
        this.disableValidations();
        this.calculateCart(newCharge, addonId, discountCharge);
    }

    handleOfferSelection(event) {
        let offerId = event.currentTarget.dataset.id;
        let currentValue = event.target.value;
        let offerOptions = this.template.querySelectorAll(`[data-id="${offerId}"]`);

        offerOptions.forEach((o) => {
            if (currentValue == o.value) {
                o.classList.add("selectedPackage");
                o.checked = true;
            } else {
                o.classList.remove("selectedPackage");
                o.checked = false;
            }
        });

        let newCharge;
        let discountCharge;
        let offerIndex = this.offers.findIndex((o) => o.id == offerId);
        this.offers[offerIndex].optionSelected = true;
        if (currentValue == "decline") {
            let index = this.selectedOffers.indexOf(offerId);
            if (index != -1) {
                this.selectedOffers.splice(index, 1);
            }
            newCharge = false;
        } else {
            const offer = this.offers[offerIndex];
            this.selectedOffers.push(offer.id);

            const resultCharges = this.createOfferCharges(offer);
            newCharge = resultCharges.newCharge;
            discountCharge = resultCharges.discountCharge;
        }

        this.disableValidations();
        this.calculateCart(newCharge, offerId, discountCharge);
    }

    createOfferCharges(offer) {
        const newCharge = {
            name: offer.name,
            fee: offer.fee.toFixed(2),
            recurrence: offer.recurrence,
            id: offer.id,
            discount: Number(offer.fee).toFixed(2) <= 0
        };

        let discountCharge;
        if (offer.discounts !== undefined) {
            discountCharge = {
                name: offer.discounts.name,
                fee: offer.discounts.amount.value.toFixed(2),
                recurrence: offer.recurrence,
                id: offer.id + "D",
                discount: Number(offer.discounts.amount.value).toFixed(2) <= 0
            };
        }

        return { newCharge, discountCharge };
    }

    calculateCart(newCharge, selectionId, discountCharge) {
        let cart = { ...this.cart };
        let cartElements = JSON.parse(JSON.stringify(cart.monthlyCharges));
        let monthlyCharges = [...cartElements];
        let cartElementsToday = JSON.parse(JSON.stringify(cart.todayCharges));
        let todayCharges = [...cartElementsToday];

        if (newCharge) {
            if (newCharge.recurrence == "Monthly") {
                monthlyCharges.push(newCharge);
                if (discountCharge !== undefined) {
                    monthlyCharges.push(discountCharge);
                }

                cart.monthlyCharges = [...monthlyCharges];
            } else {
                todayCharges.push(newCharge);
                if (discountCharge !== undefined) {
                    todayCharges.push(discountCharge);
                }
                cart.todayCharges = [...todayCharges];
            }
        } else {
            let chargeIndex = cart.monthlyCharges.findIndex((c) => c.id == selectionId);
            if (chargeIndex != -1) {
                cart.monthlyCharges.splice(chargeIndex, 1);
            }
            let discountIndex = cart.monthlyCharges.findIndex((c) => c.id == selectionId + "D");
            if (discountIndex != -1) {
                cart.monthlyCharges.splice(discountIndex, 1);
            }
        }

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
    }

    disableValidations() {
        let addonNotSelectedOptionIndex = this.addons.findIndex((a) => a.optionSelected == false);
        if (addonNotSelectedOptionIndex == -1) {
            this.disableNext = false;
        } else {
            this.disableNext = true;
        }
    }

    handleClick() {
        this.loaderSpinner = true;
        let productTypeId = this.productSelection.productTypeId;
        let salesAgreementId = this.productSelection.salesAgreementId;
        let shoppingCartId = this.productSelection.shoppingCartId;
        let productCandidateId = this.productSelection.productCandidateId;
        let selectedAddons = [];
        let selectedOffers = [];

        let myData = {
            tab: "order",
            path: "orders",
            partnerName: "viasat",
            productTypeId: productTypeId,
            salesAgreementId: salesAgreementId,
            shoppingCartId: shoppingCartId
        };
        console.log("Selected Addons", this.selectedAddons);
        if (this.selectedAddons.length > 0) {
            this.selectedAddons.forEach((a) => {
                let addon = {
                    productTypeId: a,
                    productCandidateId: productCandidateId
                };
                selectedAddons.push(addon);
                if (a === "aa97c809-f847-4953-819d-3c42706f74f2" || a === "9fbdac0d-bc2a-468c-b5ce-52bd3e0bd916") {
                    this.showDisclosures.voice = true;
                } else if (a === "52df7cdd-5678-43f0-89fd-74445d69b9e0") {
                    this.showDisclosures.easyCare = true;
                } else if (a === "49162977-8ebf-460b-8908-368ee1f8673d") {
                    this.showDisclosures.shield = true;
                }
            });
            myData.addOnProductId = selectedAddons;
        }
        if (productTypeId === "147e55f6-8f33-42b0-b868-6750cee05047") {
            this.showDisclosures.voice = true;
            this.voiceSelected = this.voiceAvailable;
        }
        if (this.selectedOffers.length > 0) {
            this.selectedOffers.forEach((o) => {
                let offer = {
                    productTypeId: o,
                    productCandidateId: productCandidateId
                };
                selectedOffers.push(offer);
            });
            myData.closingOffersProductId = selectedOffers;
        }
        console.log("Orders Request: ", myData);
        if (this.voiceSelected) {
            let info = {
                shoppingCartId: this.shoppingCartId,
                productTypeId: this.productSelected,
                productCandidateId: this.productCandidateId,
                cart: this.cart,
                voiceSelected: this.voiceSelected,
                voiceId: this.voiceId,
                selectedAddonsAndOffers: [...this.selectedAddons, ...this.selectedOffers],
                orderRequest: myData,
                candidates: this.candidates,
                showDisclosures: { ...this.showDisclosures }
            };
            let configurationsSelectionEvent = new CustomEvent("next", {
                detail: info
            });
            this.dispatchEvent(configurationsSelectionEvent);

            this.loaderSpinner = false;
        } else {
            let apiResponse;
            callEndpoint({ inputMap: myData })
                .then((response) => {
                    apiResponse = response;
                    const responseParsed = JSON.parse(response);
                    console.log("Orders Response: ", responseParsed);
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
                        this.logError(
                            `${errorMessage}\nAPI Response: ${apiResponse}`,
                            myData,
                            myData.path,
                            "API Error"
                        );
                        if (errorMessage.includes("Portfolio Cardinality") && this.candidates.length === 0) {
                            this.portfolioCardinalityError = true;
                            this.getSelectedCandidatesAndRemove();
                        } else {
                            this.dispatchEvent(event);
                            this.loaderSpinner = false;
                        }
                    } else {
                        let cart = { ...this.cart };
                        cart.todayCharges = [];
                        cart.monthlyCharges = [];
                        let candidates = [];
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
                            if (
                                item.prices !== null &&
                                item.prices.length > 0 &&
                                item.prices[0].recurrence === "Once"
                            ) {
                                cart.todayCharges.push(newCharge);
                            } else {
                                cart.monthlyCharges.push(newCharge);
                            }
                            if (
                                selectedAddons.some((addon) => addon.productTypeId === item.product_type_id) ||
                                selectedOffers.some((offer) => offer.productTypeId === item.product_type_id)
                            ) {
                                candidates.push(item.product_candidate_id);
                            }
                        });
                        cart.hasMonthly = cart.monthlyCharges.length > 0;
                        cart.hasToday = cart.todayCharges.length > 0;
                        cart.monthlyTotal = (0.0).toFixed(2);
                        cart.todayTotal = (0.0).toFixed(2);
                        cart.monthlyCharges.forEach(
                            (charge) =>
                                (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
                        );
                        cart.todayCharges.forEach(
                            (charge) => (cart.todayTotal = (Number(cart.todayTotal) + Number(charge.fee)).toFixed(2))
                        );
                        this.cart = { ...cart };

                        let info = {
                            shoppingCartId: this.shoppingCartId,
                            productTypeId: this.productSelected,
                            productCandidateId: this.productCandidateId,
                            cart: this.cart,
                            voiceSelected: this.voiceSelected,
                            voiceId: this.voiceId,
                            selectedAddonsAndOffers: [...this.selectedAddons, ...this.selectedOffers],
                            orderRequest: myData,
                            candidates: candidates,
                            showDisclosures: { ...this.showDisclosures }
                        };

                        let configurationsSelectionEvent = new CustomEvent("next", {
                            detail: info
                        });
                        this.dispatchEvent(configurationsSelectionEvent);

                        this.loaderSpinner = false;
                    }
                })
                .catch((error) => {
                    console.error(error, "ERROR");
                    const genericErrorMessage =
                        this.labels.The_AddOns_request_could_not_be_made_correctly;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: genericErrorMessage
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                    if (apiResponse) {
                        this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                    } else {
                        const errMsg = error.body?.message || error.message;
                        this.logError(errMsg);
                    }
                });
        }
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

    handleRemoveOrders() {
        this.loaderSpinner = true;
        let myData = {
            partnerName: "viasat",
            path: "removeOrders",
            tab: "remove",
            shoppingCartId: this.productSelection.shoppingCartId,
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
                    this.loaderSpinner = false;
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
                        this.handleClick();
                    } else {
                        this.candidates = [];
                        this.handleConfigurationCallout();
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                   this.labels.The_Offers_request_could_not_be_made_correctly;
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
                this.loaderSpinner = false;
            });
    }

    getSelectedCandidatesAndRemove() {
        this.loaderSpinner = true;
        let productTypeId = this.productSelection.productTypeId;
        let salesAgreementId = this.productSelection.salesAgreementId;
        let shoppingCartId = this.productSelection.shoppingCartId;

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
                    this.loaderSpinner = false;
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${apiResponse}`, myData, myData.path, "API Error");
                } else {
                    let candidates = [];
                    let cartItems = responseParsed.cart_items;
                    cartItems.forEach((item) => {
                        if (
                            this.selectedAddons.some((addon) => addon === item.product_type_id) ||
                            this.selectedOffers.some((offer) => offer === item.product_type_id)
                        ) {
                            candidates.push(item.product_candidate_id);
                        }
                    });
                    this.candidates = candidates;
                    if (this.candidates.length > 0) {
                        this.handleRemoveOrders();
                    } else {
                        this.loaderSpinner = false;
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    this.labels.The_AddOns_request_could_not_be_made_correctly;
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData.path, "API Error");
                } else {
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Configuration",
            component: "Poe_lwcBuyflowViasatConfigurationTab",
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
            tab: "Configuration"
        };
        this.dispatchEvent(event);
    }
}