import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import ToastContainer from "lightning/toastContainer";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import EERO_ID from "@salesforce/label/c.Chuzo_Frontier_Eero_Secure_ID";
import SECURITY_PLUS_ID from "@salesforce/label/c.Chuzo_Frontier_Security_Plus_ID";
import EERO_DISCOUNT_ID from "@salesforce/label/c.Chuzo_Frontier_Eero_Secure_Discount_ID";
import UNBREAKABLE_ID from "@salesforce/label/c.Chuzo_Frontier_Unbreakable_Wi_Fi_ID";
import UNBREAKABLE_ERROR from "@salesforce/label/c.Chuzo_Frontier_Unbreakable_Wi_Fi_Error";
import posIdMessage from "@salesforce/label/c.Frontier_POS_ID_Modal_Message";

export default class Poe_lwcBuyflowFrontierConfigurationsTab extends NavigationMixin(LightningElement) {
    @api productInfo;
    @api recordId;
    @api logo;
    @api addressInfo;
    @api origin;
    @api userId;
    @api quoteId;
    @api cartInfo;
    @api customerInfo;
    @api accountId;
    @api addOnProducts;
    @api frontierSecureProducts;
    @api clientPhone;
    @api voiceProducts;
    @api email;
    @api autoPay;
    @api eBill;
    @api manualCreditCheck;
    @api frontierUserId;
    @api isGuestUser;

    btn = "";
    cart = {
        hasQuote: true,
        orderNumber: this.quoteId,
        hasTodayCharge: false,
        hasMonthlyCharge: false,
        todayCharges: [],
        monthlyCharges: [],
        todayTotal: (0.0).toFixed(2),
        monthlyTotal: (0.0).toFixed(2)
    };
    showCollateral = false;
    showSBS = false;
    selectedTarget;
    disableNext = true;
    loaderSpinner;
    configurations = [];
    initialResponse = [];
    secureOptions;
    orderResponse;
    voipWanted = false;
    voipOptions = [
        {
            label: "Yes, I want Unlimited Digital Voice",
            value: "yes"
        },
        {
            label: "No, I don't want Unlimited Digital Voice at this time.",
            value: "no"
        }
    ];
    voipOption;
    portableWanted = true;
    disablePortable;
    portableResult;
    portableChecked;
    phoneNumber;
    voicePrice;
    voiceBasePrice;
    voiceDuration;
    voiceHasDiscount;
    voiceDescription;
    freeUDV;
    freeUDVCharge;
    rewardName;
    rewardWanted;
    hasReward;
    hasOffers;
    rewardValue;
    hasYoutube;
    youtubeWanted;
    youtubeName;
    rewardCharge;
    youtubeCharge;
    productName;
    routerOption;
    routerConfigurations;
    routerOptions = [];
    includedRouters = [];
    voipIds = [];
    secureIds = [];
    showModal;
    localFreezeOptions = [];
    localFreezeOption;
    localFreezeOptionsPrices = [];
    listingOptions = [];
    listingOption;
    listingOptionsPrices = [];
    configurationsRequest = [];
    additionalListing;
    internationalConfigurations = [];
    listedId;
    voiceMailConfiguration;
    homeAddon;
    showCreditCheckQuoteAssistanceModal;
    checkForTasks = false;
    pendingTasks = false;
    nextTabPayload = {};
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        posIdMessage,
        EERO_ID,
        EERO_DISCOUNT_ID,
        SECURITY_PLUS_ID
    };
    showSelfServiceCancelModal = false;
    showPosIdModal = false;
    timeZone = {};
    installationOptions = [];
    showIncludedRouters = false;
    showRouters = false;
    eeroConfiguration = [];

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        this.loaderSpinner = true;
        this.checkForTasks = this.manualCreditCheck;
        this.phoneNumber = this.clientPhone;
        const path = "orders";
        let myData = {
            partnerName: "frapi",
            path,
            quoteId: this.quoteId,
            productIds: JSON.parse(JSON.stringify(this.productInfo)),
            userId: this.frontierUserId
        };
        console.log("Orders Payload", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                console.log("Orders Response", response);
                let error =
                    (response.hasOwnProperty("error") &&
                        response.error.hasOwnProperty("provider") &&
                        response.error.provider.hasOwnProperty("message")) ||
                    response.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage =
                        response.hasOwnProperty("error") && !response.error.hasOwnProperty("provider")
                            ? response.error
                            : response.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${res}`, myData, path, "API Error");
                } else {
                    const event = new ShowToastEvent({
                        title: "Success",
                        variant: "success",
                        message:
                            "The order was confirmed by the provider. Please proceed to choose the associated configurations."
                    });
                    this.dispatchEvent(event);
                    this.btn = response.customer.customerTN;
                    this.orderResponse = response;
                    this.productName = response.productSummary.productLineItemSummary[0].name;
                    let mainItemConfigurations = this.orderResponse.items[0].productConfiguration.ChildEntity;
                    this.routerConfigurations = mainItemConfigurations
                        .filter((element) => element.Name === "Add Ons" || element.Name === "Add On Options")[0]
                        .ChildEntity.filter((item) => item.Name === "Routers")[0].ChildEntity;
                    this.eeroConfiguration = mainItemConfigurations
                        .filter((element) => element.Name === "Add Ons" || element.Name === "Add On Options")[0]
                        .ChildEntity.filter(
                            (item) =>
                                item.EntityID === this.labels.EERO_ID || item.EntityID === this.labels.SECURITY_PLUS_ID
                        );
                    let minQ = Number(
                        mainItemConfigurations
                            .filter((element) => element.Name === "Add Ons" || element.Name === "Add On Options")[0]
                            .ChildEntity.filter((item) => item.Name === "Routers")[0].minimumActiveChildEntities
                    );
                    this.handleRouterConfiguration(minQ);
                    this.timeZone = { ...response.customer.serviceability.timeZone };
                    this.configurationsRequest = [...response.items];
                    this.generateInitialCart(response.productSummary.productLineItemSummary);
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
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
                this.loaderSpinner = false;
            });
    }

    handleRouterConfiguration(minQ) {
        let routers = [];
        let includedRouters = [];
        let routersMandatory = [];
        let names = [];
        let i = 1;
        this.routerConfigurations.forEach((e) => {
            let isRepeated = e.Name.includes("Additional") || names.some((item) => e.Name.includes(item));
            let name;
            if (isRepeated) {
                i = i + 1;
                names.forEach((item) => {
                    if (e.Name.includes(item)) {
                        name = item + "s";
                    }
                });
            } else {
                i = 1;
                name = e.Name;
                names.push(name);
            }
            let newConfig = {
                label: i + " " + name + ": $" + (Number(e.Price[0].rateRecurring) * i).toFixed(2).toString(),
                value: e.ID
            };
            if (e.Active) {
                newConfig.label = name;
                includedRouters.push(newConfig);
            } else {
                if (!e.Mandatory) {
                    routers.push(newConfig);
                } else {
                    routersMandatory.push(newConfig);
                }
            }
            e.quantity = i;
        });
        if (minQ <= routersMandatory.length) {
            let noConfig = {
                label: "None",
                value: "none"
            };
            routers.unshift(noConfig);
        }
        this.showIncludedRouters = includedRouters.length > 0;
        this.showRouters = routers.length > 0 && !routers.every((item) => item.value === "none");
        this.routerOptions = [...routers];
        this.includedRouters = [...includedRouters];
    }

    handleRouter(event) {
        let cart = { ...this.cart };
        let cartElements = JSON.parse(JSON.stringify(this.cart.monthlyCharges));
        let monthlyCharges = [...cartElements];
        this.routerOption = event.target.value;
        let valueName = this.routerOptions.filter((e) => e.value === event.target.value)[0].label;
        let name = valueName.split(":")[0];
        let monthlyChargesFiltered = monthlyCharges.filter((e) => !e.hasOwnProperty("type") || e.type !== "router");
        if (event.target.value !== "none") {
            let option = this.routerConfigurations.filter((e) => e.ID === event.target.value)[0];
            let newCharge = {
                name: name,
                fee: (Number(option.Price[0].rateRecurring) * option.quantity).toFixed(2),
                type: "Monthly",
                discount: (Number(option.Price[0].rateRecurring) * option.quantity).toFixed(2) <= 0,
                type: "router"
            };
            monthlyChargesFiltered.push(newCharge);
        }
        cart.monthlyCharges = [...monthlyChargesFiltered];
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        this.cart = { ...cart };
        this.disableValidations();
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

    generateInitialCart(summaryItems) {
        let cart = {};
        let monthlyCharges = [];
        let todayCharges = [];
        summaryItems.forEach((item) => {
            if (item.billOfMaterials.length > 0) {
                item.billOfMaterials.forEach((bill) => {
                    if (!this.autoPay && bill.name == "Auto Pay Discount") {
                        return;
                    }
                    let newCharge = {
                        name: bill.name,
                        fee:
                            bill.rate !== undefined && bill.rate !== "N/A"
                                ? Number(bill.rate).toFixed(2)
                                : (0.0).toFixed(2),
                        type: bill.rateType === "RecurringCharge" ? "Monthly" : "Single",
                        discount: bill.rate !== undefined && bill.rate !== "N/A" ? Number(bill.rate) <= 0 : true
                    };
                    if (newCharge.type === "Monthly") {
                        cart.hasMonthly = true;
                        bill.name === item.name && item.serviceType === "Broadband"
                            ? monthlyCharges.unshift(newCharge)
                            : monthlyCharges.push(newCharge);
                    } else {
                        cart.hasToday = true;
                        bill.name === item.name && item.serviceType === "Broadband"
                            ? todayCharges.unshift(newCharge)
                            : todayCharges.push(newCharge);
                    }
                });
            }
        });
        cart.monthlyCharges = [...monthlyCharges];
        cart.todayCharges = [...todayCharges];
        cart.todayTotal = 0;
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        cart.todayCharges.forEach(
            (charge) => (cart.todayTotal = (Number(cart.todayTotal) + Number(charge.fee)).toFixed(2))
        );
        this.freeUDV = cart.monthlyCharges.some((element) => element.name === "Free UDV");
        let rewards = cart.monthlyCharges.filter((element) => element.name.includes("Reward Card"));
        this.hasReward = rewards.length > 0;
        if (this.hasReward) {
            this.rewardName = rewards[0].name;
            this.rewardWanted = true;
            this.rewardValue = rewards[0].name.substring(0, 3);
            this.rewardCharge = rewards[0];
        }
        let addons = JSON.parse(JSON.stringify(this.addOnProducts)).filter((item) => item.Name.includes("YouTube"));
        if (addons.length > 0) {
            this.hasYoutube = true;
            this.youtubeName = addons[0].Name;
            this.youtubeCharge = {
                name: this.youtubeName,
                fee: (0.0).toFixed(2),
                type: "Monthly",
                discount: true
            };
        }
        this.hasOffers = this.hasYoutube || this.hasReward;
        this.freeUDVCharge = cart.monthlyCharges.filter((element) => element.name === "Free UDV")[0];
        this.voipWanted = this.freeUDV;
        let voiceProduct = [...JSON.parse(JSON.stringify(this.voiceProducts))];
        if (this.voipWanted) {
            this.voipIds.push(voiceProduct[0].Id);
        }
        let voicePromoPrice = Number(voiceProduct[0].AutoPayPrice).toFixed(2);
        this.voiceBasePrice = Number(voiceProduct[0].AutoPayPrice).toFixed(2);
        if (voiceProduct[0].hasOwnProperty("sweeteners") && voiceProduct[0].sweeteners.length > 0 && !this.freeUDV) {
            this.voiceHasDiscount = true;
            this.voiceDuration = 12;
            voicePromoPrice = (
                Number(voicePromoPrice) + Number(voiceProduct[0].sweeteners[0].options[0].amount)
            ).toFixed(2);
        }
        this.voicePrice = this.voipWanted ? "0.00" : voicePromoPrice.toString();
        this.voiceDescription = voiceProduct[0].Description;
        this.voipOption = this.voipWanted ? "yes" : undefined;
        this.cart = { ...cart, orderNumber: this.quoteId, hasQuote: true };
        this.generateSecureOptions();
    }

    handlePortableWanted(event) {
        this.portableWanted = event.target.checked;
        this.disableValidations();
    }

    generateSecureOptions() {
        let secures = [...JSON.parse(JSON.stringify(this.frontierSecureProducts))];
        let securityProducts = [];
        secures.forEach((item) => {
            let securityProduct = {
                Description: item.Description,
                Name: item.Name,
                Id: item.Id,
                isChecked:
                    this.cart.monthlyCharges.some((element) => element.name === item.Name) ||
                    this.cart.todayCharges.some((element) => element.name === item.Name),
                required:
                    this.cart.monthlyCharges.some((element) => element.name === item.Name) ||
                    this.cart.todayCharges.some((element) => element.name === item.Name),
                PromoPrice: this.cart.monthlyCharges.some((element) => element.name === item.Name)
                    ? (0.0).toFixed(2)
                    : item.hasOwnProperty("AutoPayPrice")
                    ? item.AutoPayPrice === "NaN"
                        ? (0.0).toFixed(2)
                        : item.AutoPayPrice
                    : item.AutoPayPrice,
                Price: this.cart.monthlyCharges.some((element) => element.name === item.Name)
                    ? Number(this.cart.monthlyCharges.filter((element) => element.name === item.Name)[0].fee).toFixed(2)
                    : item.hasOwnProperty("Price") &&
                      item.hasOwnProperty("AutoPayPrice") &&
                      item.Price !== item.AutoPayPrice
                    ? item.Price
                    : "",
                hasOriginalPrice:
                    item.hasOwnProperty("Price") &&
                    item.hasOwnProperty("AutoPayPrice") &&
                    item.Price !== item.AutoPayPrice,
                hasFuturePrice: this.cart.monthlyCharges.some((element) => element.name === item.Name)
                    ? false
                    : item.FuturePrice !== "",
                FuturePrice: item.FuturePrice,
                Duration: item.Duration,
                isIncluded: this.cart.monthlyCharges.some((element) => element.name === item.Name)
            };
            securityProducts.push(securityProduct);
        });
        if (this.eeroConfiguration.length > 0) {
            this.eeroConfiguration.forEach((eeroItem) => {
                let price = Number(eeroItem.Price[0].rateRecurring).toFixed(2);
                if (
                    eeroItem.hasOwnProperty("ChildEntity") &&
                    eeroItem.ChildEntity.length > 0 &&
                    eeroItem.ChildEntity.some((e) => e.EntityID === this.labels.EERO_DISCOUNT_ID)
                ) {
                    let discountArray = eeroItem.ChildEntity.filter((e) => e.EntityID === this.labels.EERO_DISCOUNT_ID);
                    let discount = discountArray[0].Price[0].rateRecurring;
                    price = (Number(price) + Number(discount)).toFixed(2);
                }
                let securityProduct = {
                    Description: eeroItem.description,
                    Name: eeroItem.Name,
                    Id: eeroItem.EntityID,
                    isChecked: eeroItem.Active,
                    required: eeroItem.Active,
                    PromoPrice: price,
                    Price: price,
                    hasOriginalPrice: false,
                    hasFuturePrice: false,
                    FuturePrice: price,
                    Duration: "",
                    isIncluded: eeroItem.Active
                };
                securityProducts.push(securityProduct);
            });
        }
        this.secureOptions = [...securityProducts];
        let ids = [];
        this.secureOptions.forEach((item) => {
            if (item.isChecked && !item.required) {
                ids.push(item.Id);
            }
        });
        this.secureIds = [...ids];
        this.disableValidations();
        this.loaderSpinner = false;
    }

    handleReward(event) {
        this.rewardWanted = event.target.checked;
        let cart = { ...this.cart };
        if (!this.rewardWanted) {
            let filteredMonthlyCharges = cart.monthlyCharges.filter((element) => element.name !== this.rewardName);
            cart.monthlyCharges = [...filteredMonthlyCharges];
        } else {
            cart.monthlyCharges.push(this.rewardCharge);
        }
        this.cart = { ...cart };
        this.disableValidations();
    }

    handleYoutube(event) {
        this.youtubeWanted = event.target.checked;
        let cart = { ...this.cart };
        if (!this.youtubeWanted) {
            let filteredMonthlyCharges = cart.monthlyCharges.filter((element) => element.name !== this.youtubeName);
            cart.monthlyCharges = [...filteredMonthlyCharges];
        } else {
            cart.monthlyCharges.push(this.youtubeCharge);
        }
        this.cart = { ...cart };
    }

    handleVoip(event) {
        let ids = [];
        this.voipOption = event.target.value;
        this.voipWanted = event.target.value === "yes";
        let voiceProduct = [...JSON.parse(JSON.stringify(this.voiceProducts))];
        let cart = { ...this.cart };
        if (!this.voipWanted) {
            let filteredMonthly = cart.monthlyCharges.filter(
                (element) =>
                    element.name !== "Free UDV" &&
                    element.name !== "Unlimited Digital Voice" &&
                    element.name !== "Broadband and Voice Bundle Discount"
            );
            cart.monthlyCharges = [...filteredMonthly];
        } else {
            ids.push(voiceProduct[0].Id);
            if (this.freeUDV) {
                cart.monthlyCharges.push(this.freeUDVCharge);
            } else {
                let newCharge = {
                    name: voiceProduct[0].Name,
                    fee: voiceProduct[0].PromoPrice,
                    type: "Monthly",
                    discount:
                        voiceProduct[0].PromoPrice !== undefined && voiceProduct[0].PromoPrice !== "N/A"
                            ? Number(voiceProduct[0].PromoPrice) <= 0
                            : true
                };

                cart.hasMonthly = true;
                cart.monthlyCharges.push(newCharge);
                if (voiceProduct[0].sweeteners.length > 0) {
                    voiceProduct[0].sweeteners.forEach((element) => {
                        let newDiscount = {
                            name: element.options[0].requirements[0].requirement,
                            fee: element.options[0].amount,
                            type: "Monthly",
                            discount:
                                element.options[0].amount !== undefined && element.options[0].amount !== "N/A"
                                    ? Number(element.options[0].amount) <= 0
                                    : true
                        };
                        cart.monthlyCharges.push(newDiscount);
                    });
                }
            }
        }
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        this.voipIds = [...ids];
        this.cart = { ...cart };
        this.disableValidations();
    }

    handleServiceChange(event) {
        let cart = { ...this.cart };
        let ids = [];
        let secureOptions = [...this.secureOptions];
        if (event.target.checked) {
            secureOptions.forEach((item) => {
                if (item.Id === event.target.dataset.id) {
                    item.isChecked = true;
                    let newCharge = {
                        name: item.Name,
                        fee:
                            item.PromoPrice !== undefined && item.PromoPrice !== "N/A"
                                ? Number(item.PromoPrice).toFixed(2)
                                : (0.0).toFixed(2),
                        type: "Monthly",
                        discount:
                            item.PromoPrice !== undefined && item.PromoPrice !== "N/A"
                                ? Number(item.PromoPrice) <= 0
                                : true
                    };
                    if (newCharge.type === "Monthly" || newCharge.type === undefined) {
                        cart.hasMonthly = true;
                        cart.monthlyCharges.push(newCharge);
                    } else {
                        cart.hasToday = true;
                        cart.todayCharges.push(newCharge);
                    }
                }
                if (item.Id === EERO_ID && event.target.dataset.id === SECURITY_PLUS_ID) {
                    item.required = true;
                    item.isChecked = false;
                    let filteredMonthly = cart.monthlyCharges.filter((e) => e.name !== item.Name);
                    cart.monthlyCharges = [...filteredMonthly];
                }
            });
        } else {
            let name;
            let isSecure = event.target.dataset.id === EERO_ID || event.target.dataset.id === SECURITY_PLUS_ID;
            let secureNames = [];
            secureOptions.forEach((item) => {
                if (item.Id === event.target.dataset.id) {
                    item.isChecked = false;
                    name = item.Name;
                }
                if (isSecure && (item.Id === EERO_ID || item.Id === SECURITY_PLUS_ID)) {
                    item.isChecked = false;
                    item.required = false;
                    secureNames.push(item.Name);
                }
            });
            let filteredMonthly = cart.monthlyCharges.filter((e) => e.name !== name && !secureNames.includes(e.name));
            let filteredToday = cart.todayCharges.filter((e) => e.name !== name && !secureNames.includes(e.name));
            cart.monthlyCharges = [...filteredMonthly];
            cart.todayCharges = [...filteredToday];
        }
        this.secureOptions = [...secureOptions];
        cart.todayTotal = 0;
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        cart.todayCharges.forEach(
            (charge) => (cart.todayTotal = (Number(cart.todayTotal) + Number(charge.fee)).toFixed(2))
        );
        this.cart = { ...cart };
        if (
            event.target.dataset.id === this.labels.EERO_ID ||
            event.target.dataset.id === this.labels.SECURITY_PLUS_ID
        ) {
            let items = [...this.configurationsRequest];
            let mainProductConfigs = items.filter((e) => e.name === this.productName)[0].productConfiguration;
            mainProductConfigs.ChildEntity.forEach((item) => {
                if (item.EntityID === "f8f82754-7c27-4dcb-872d-4412c0308aa1") {
                    item.ChildEntity.forEach((e) => {
                        if (e.EntityID === event.target.dataset.id) {
                            e.Active = event.target.checked;
                        }
                    });
                }
            });
            this.configurationsRequest = [...items];
        }
        this.secureOptions.forEach((item) => {
            if (
                item.isChecked &&
                !item.required &&
                item.Id !== this.labels.EERO_ID &&
                item.Id !== this.labels.SECURITY_PLUS_ID
            ) {
                ids.push(item.Id);
            }
        });
        this.secureIds = [...ids];
        this.disableValidations();
    }

    handlePhone(event) {
        this.phoneNumber = event.target.value;
        this.disableValidations();
    }

    handlePortable() {
        this.loaderSpinner = true;
        const path = "numberPortability";
        let myData = {
            partnerName: "frapi",
            path,
            quoteId: this.quoteId,
            phoneNumbers: [{ phoneNumber: this.phoneNumber }],
            userId: this.frontierUserId
        };
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                console.log("Number portability response", response);
                let error =
                    (response.hasOwnProperty("error") &&
                        response.error.hasOwnProperty("provider") &&
                        response.error.provider.hasOwnProperty("message")) ||
                    response.hasOwnProperty("error");
                if (error) {
                    let errorMessage = response.hasOwnProperty("error")
                        ? response.error
                        : response.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${res}`, myData, path, "API Error");
                    this.loaderSpinner = false;
                } else {
                    let phones = response.phoneNumbers;
                    this.portableResult = phones[0].isPortable ? "Result: PORTABLE" : "Result: NOT PORTABLE";
                    this.portableChecked = phones[0].isPortable;
                    this.loaderSpinner = false;
                    this.disableValidations();
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
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
                this.loaderSpinner = false;
            });
    }

    disableValidations() {
        if (
            (this.routerOption !== undefined || !this.showRouters) &&
            this.voipOption !== undefined &&
            ((this.voipWanted &&
                ((this.portableWanted && this.portableResult === "Result: PORTABLE") || !this.portableWanted)) ||
                !this.voipWanted)
        ) {
            this.disableNext = false;
        } else {
            this.disableNext = true;
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

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    hideModal() {
        this.showModal = false;
    }

    handleClick() {
        this.loaderSpinner = true;
        let address = JSON.parse(JSON.stringify(this.addressInfo));
        let addons = JSON.parse(JSON.stringify(this.addOnProducts)).filter((item) => item.Name.includes("YouTube"));
        let addOnIds = [];
        if (this.youtubeWanted) {
            addOnIds.push(addons[0].Id);
        }
        let prodIds = [...this.voipIds, ...this.secureIds, ...addOnIds];
        if (prodIds.includes(UNBREAKABLE_ID) && this.routerOption === "none") {
            const event = new ShowToastEvent({
                title: "Product Selection Required",
                variant: "error",
                mode: "sticky",
                message: UNBREAKABLE_ERROR
            });
            this.dispatchEvent(event);
            this.loaderSpinner = false;
            return;
        }
        if (prodIds.length > 0) {
            const path = "orders";
            let myData = {
                partnerName: "frapi",
                path,
                quoteId: this.quoteId,
                productIds: prodIds,
                userId: this.frontierUserId
            };
            let apiResponse;
            console.log("2nd Orders Request", myData);
            callEndpoint({ inputMap: myData })
                .then((res) => {
                    apiResponse = res;
                    let response = JSON.parse(res);
                    console.log("2nd Orders Response", response);
                    let error =
                        (response.hasOwnProperty("error") &&
                            response.error.hasOwnProperty("provider") &&
                            response.error.provider.hasOwnProperty("message")) ||
                        response.hasOwnProperty("error");
                    if (error) {
                        this.loaderSpinner = false;
                        let errorMessage = response.hasOwnProperty("error")
                            ? response.error.hasOwnProperty("provider")
                                ? response.error.provider.message
                                : response.error
                            : response.error.provider.message;
                        const event = new ShowToastEvent({
                            title: "Error",
                            variant: "error",
                            mode: "sticky",
                            message: errorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(`${errorMessage}\nAPI Response: ${res}`, myData, path, "API Error");
                        this.loaderSpinner = false;
                    } else {
                        let items = response.items;
                        let mainProductConfigs = items.filter((e) => e.name === this.productName)[0]
                            .productConfiguration;
                        let routerIndex;
                        let routerQuantity;
                        mainProductConfigs.ChildEntity.forEach((item) => {
                            if (item.EntityID === "953eb285-4a98-4f04-9b27-11c78d50064b") {
                                item.ChildEntity.forEach((e) => {
                                    if (e.EntityID === "955ecc3c-7b2f-451c-a7cf-feee501af5b2") {
                                        e.Active = this.autoPay;
                                        e.ChildEntity.forEach((o) => {
                                            if (o.EntityID === "8e743c4d-afbe-4c00-9d85-b808a335f428") {
                                                o.Active = this.autoPay;
                                            }
                                        });
                                    } else if (e.Name === "Sweetener Options") {
                                        if (e.hasOwnProperty("ChildEntity") && e.ChildEntity.length > 0) {
                                            e.ChildEntity.forEach((sweetener) => {
                                                if (sweetener.Name === this.rewardName) {
                                                    sweetener.Active = this.rewardWanted;
                                                }
                                            });
                                        }
                                    }
                                });
                            } else if (item.EntityID === "f8f82754-7c27-4dcb-872d-4412c0308aa1") {
                                item.ChildEntity.forEach((e) => {
                                    if (e.EntityID === "73a01509-574d-421a-8694-11503f3db8dc") {
                                        if (this.routerOption !== "none") {
                                            this.routerConfigurations.forEach((child, index) => {
                                                if (child.ID === this.routerOption) {
                                                    let routerOption = this.cart.monthlyCharges.filter(
                                                        (e) => e.type === "router"
                                                    )[0].name;
                                                    routerIndex = Number(index);
                                                    routerQuantity = Number(routerOption.substring(0, 1));
                                                }
                                            });
                                            if (routerQuantity > 1) {
                                                for (let i = routerQuantity - routerIndex; i <= routerIndex; i++) {
                                                    e.ChildEntity[i].Active = true;
                                                }
                                            } else {
                                                e.ChildEntity[routerIndex].Active = true;
                                            }
                                        } else {
                                            e.ChildEntity.forEach((c) => {
                                                if (c.Mandatory == false) {
                                                    c.Active = false;
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                        if (this.youtubeWanted) {
                            items.forEach((e) => {
                                if (e.name === this.youtubeName) {
                                    e.productConfiguration.ChildEntity[0].Active = this.youtubeWanted;
                                    e.productConfiguration.ChildEntity[0].ConfiguredValue.forEach((item) => {
                                        if (item.Name === "Unique User ID (in email form)") {
                                            item.Value[0].Value = this.email;
                                        }
                                    });
                                }
                            });
                        }
                        this.secureOptions.forEach((item) => {
                            if (item.isChecked) {
                                items.forEach((e) => {
                                    if (e.name === item.Name && e.productConfiguration.hasOwnProperty("ChildEntity")) {
                                        e.productConfiguration.ChildEntity.forEach((element) => {
                                            if (
                                                element.Name === "User Billing Address - FRAPI" ||
                                                element.Name === "User Billing Address"
                                            ) {
                                                element.ConfiguredValue.forEach((value) => {
                                                    if (value.Name === "Unique User ID (in email form)") {
                                                        value.Active = true;
                                                        value.Value[0].Value = this.email;
                                                    }
                                                });
                                            } else if (element.Name === "Family Identity Protection Add-on") {
                                                let securityAddon = {
                                                    name: element.Name,
                                                    id: element.ID,
                                                    price: element.Mandatory
                                                        ? (0.0).toFixed(2).toString()
                                                        : Number(element.Price[0].rateRecurring).toFixed(2).toString(),
                                                    required: element.Mandatory,
                                                    isChecked: element.Active
                                                };
                                                securityAddon.label =
                                                    Number(securityAddon.price) > 0
                                                        ? `${securityAddon.name}: $${securityAddon.price}`
                                                        : securityAddon.name;
                                                this.homeAddon = { ...securityAddon };
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        if (this.voipWanted) {
                            let voiceProductConfigs =
                                items.filter((e) => e.name === "Unlimited Digital Voice").length > 0
                                    ? items.filter((e) => e.name === "Unlimited Digital Voice")[0].productConfiguration
                                          .ChildEntity
                                    : [];
                            let ipConfigurations =
                                voiceProductConfigs.filter((e) => e.Name === "IP-Voice-UDV").length > 0
                                    ? voiceProductConfigs.filter((e) => e.Name === "IP-Voice-UDV")[0].ChildEntity
                                    : [];
                            let carrierOptions = [];
                            let carrierPrices = [];
                            let localCarrierConfigurations =
                                ipConfigurations.filter((e) => e.Name === "Local Carrier Freeze Options").length > 0
                                    ? ipConfigurations.filter((e) => e.Name === "Local Carrier Freeze Options")[0]
                                          .ChildEntity
                                    : [];
                            localCarrierConfigurations.forEach((item) => {
                                let newOption = {
                                    label: item.Name,
                                    value: item.ID
                                };
                                let newPrice = {
                                    price: item.hasOwnProperty("Price") ? item.Price[0].rateRecurring : "0",
                                    id: item.ID
                                };
                                carrierOptions.push(newOption);
                                carrierPrices.push(newPrice);
                                if (item.Active) {
                                    this.localFreezeOption = item.ID;
                                }
                            });
                            carrierOptions = carrierOptions.sort((a, b) =>
                                a.label > b.label ? 1 : a.label < b.label ? -1 : 0
                            );
                            this.localFreezeOptions = [...carrierOptions];
                            this.localFreezeOptionsPrices = [...carrierPrices];
                            let charge = carrierPrices.filter((e) => e.id === this.localFreezeOption)[0];
                            let cart = { ...this.cart };
                            if (Number(charge.price > 0)) {
                                let newCharge = {
                                    name: "Local Freeze Option",
                                    fee: Number(charge.price).toFixed(2),
                                    type: "Monthly",
                                    discount: Number(charge.price) <= 0
                                };
                                cart.monthlyCharges.push(newCharge);
                                cart.monthlyCharges.forEach(
                                    (charge) =>
                                        (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(
                                            2
                                        ))
                                );
                                this.cart = { ...cart };
                            }
                            items.forEach((e) => {
                                if (e.name === "Unlimited Digital Voice") {
                                    e.productConfiguration.ChildEntity.forEach((i) => {
                                        if (i.Name === "IP-Voice-UDV") {
                                            i.ChildEntity.forEach((c) => {
                                                if (
                                                    c.Name ===
                                                    "Would you like to keep your current phone number, or get a new phone number?"
                                                ) {
                                                    c.Active = this.portableWanted;
                                                    if (c.Active) {
                                                        c.ConfiguredValue.forEach((item) => {
                                                            if (item.Name === "Zip Code") {
                                                                item.Value[0].Value = address.zipCode;
                                                            } else if (item.Name === "City") {
                                                                item.Value[0].Value = address.city;
                                                            } else if (item.Name === "State") {
                                                                item.Value[0].Value = address.state;
                                                            } else if (item.Name === "Name") {
                                                                item.Value[0].Value = this.customerInfo.accountName;
                                                            } else if (item.Name === "Account Number") {
                                                                item.Value[0].Value = this.phoneNumber;
                                                            } else if (item.Name === "TN") {
                                                                item.Value[0].Value = this.phoneNumber;
                                                            } else if (item.Name === "Address Line 1") {
                                                                item.Value[0].Value = address.addressLine1;
                                                            }
                                                        });
                                                    }
                                                } else if (c.Name === "Directory Listing Options") {
                                                    c.ChildEntity.forEach((option) => {
                                                        if (option.Name === "Mailing Information Options") {
                                                            option.ChildEntity.forEach((child) => {
                                                                if (
                                                                    child.Name ===
                                                                    "Mailing Address - Additional Information"
                                                                ) {
                                                                    child.Active = true;
                                                                    child.ConfiguredValue.forEach((value) => {
                                                                        if (value.Name === "State") {
                                                                            value.Value[0].Value = address.state;
                                                                        } else if (value.Name === "Address") {
                                                                            value.Value[0].Value = address.addressLine1;
                                                                        } else if (value.Name === "Zipcode") {
                                                                            value.Value[0].Value = address.zipCode;
                                                                        } else if (value.Name === "Last Name") {
                                                                            value.Value[0].Value =
                                                                                this.customerInfo.lastName;
                                                                        } else if (value.Name === "First Name") {
                                                                            value.Value[0].Value =
                                                                                this.customerInfo.firstName;
                                                                        } else if (value.Name === "City") {
                                                                            value.Value[0].Value = address.city;
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        } else if (option.Name === "Listing Information Options") {
                                                            let listingOptions = [];
                                                            let listingPrices = [];
                                                            option.ChildEntity.forEach((child) => {
                                                                if (child.Name === "Non-Published Listing") {
                                                                    child.ChildEntity.forEach((subchild) => {
                                                                        if (
                                                                            subchild.Name === "Directory Listing - Main"
                                                                        ) {
                                                                            subchild.ConfiguredValue.forEach((v) => {
                                                                                if (v.Name === "Last Name") {
                                                                                    v.Value[0].Value =
                                                                                        this.customerInfo.lastName;
                                                                                } else if (v.Name === "First Name") {
                                                                                    v.Value[0].Value =
                                                                                        this.customerInfo.firstName;
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                    if (child.Active) {
                                                                        this.listingOption = child.ID;
                                                                    }
                                                                    let nonListing = {
                                                                        label:
                                                                            child.Name +
                                                                            ": $" +
                                                                            Number(child.Price[0].rateRecurring)
                                                                                .toFixed(2)
                                                                                .toString(),
                                                                        value: child.ID
                                                                    };
                                                                    let nonListingprice = {
                                                                        price: child.Price[0].rateRecurring,
                                                                        id: child.ID
                                                                    };
                                                                    listingOptions.push(nonListing);
                                                                    listingPrices.push(nonListingprice);
                                                                } else if (child.Name === "Listed") {
                                                                    child.ChildEntity.forEach((subchild) => {
                                                                        if (
                                                                            subchild.Name === "Directory Listing - Main"
                                                                        ) {
                                                                            subchild.ConfiguredValue.forEach((v) => {
                                                                                if (v.Name === "Last Name") {
                                                                                    v.Value[0].Value =
                                                                                        this.customerInfo.lastName;
                                                                                } else if (v.Name === "First Name") {
                                                                                    v.Value[0].Value =
                                                                                        this.customerInfo.firstName;
                                                                                }
                                                                            });
                                                                        } else if (
                                                                            subchild.Name === "Additional Listing"
                                                                        ) {
                                                                            this.additionalListing = {
                                                                                label: "Additional Listing",
                                                                                price: Number(
                                                                                    subchild.Price[0].rateRecurring
                                                                                )
                                                                                    .toFixed(2)
                                                                                    .toString()
                                                                            };
                                                                        }
                                                                    });
                                                                    this.listedId = child.ID;
                                                                    let listing = {
                                                                        label:
                                                                            child.Name +
                                                                            ": $" +
                                                                            Number(0.0).toFixed(2).toString(),
                                                                        value: child.ID
                                                                    };
                                                                    let listingprice = {
                                                                        price: 0,
                                                                        id: child.ID
                                                                    };
                                                                    listingOptions.push(listing);
                                                                    listingPrices.push(listingprice);
                                                                } else if (child.Name === "Non-Listed") {
                                                                    child.ChildEntity.forEach((subchild) => {
                                                                        if (
                                                                            subchild.Name === "Directory Listing - Main"
                                                                        ) {
                                                                            subchild.ConfiguredValue.forEach((v) => {
                                                                                if (v.Name === "Last Name") {
                                                                                    v.Value[0].Value =
                                                                                        this.customerInfo.lastName;
                                                                                } else if (v.Name === "First Name") {
                                                                                    v.Value[0].Value =
                                                                                        this.customerInfo.firstName;
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                    let nonListing = {
                                                                        label:
                                                                            child.Name +
                                                                            ": $" +
                                                                            Number(child.Price[0].rateRecurring)
                                                                                .toFixed(2)
                                                                                .toString(),
                                                                        value: child.ID
                                                                    };
                                                                    let nonListingprice = {
                                                                        price: child.Price[0].rateRecurring,
                                                                        id: child.ID
                                                                    };
                                                                    listingOptions.push(nonListing);
                                                                    listingPrices.push(nonListingprice);
                                                                }
                                                            });
                                                            listingOptions = listingOptions.sort((a, b) =>
                                                                a.label > b.label ? 1 : a.label < b.label ? -1 : 0
                                                            );
                                                            this.listingOptions = [...listingOptions];
                                                            this.listingOptionsPrices = [...listingPrices];
                                                        }
                                                    });
                                                } else if (c.Name === "International Plan Options") {
                                                    let internationalConfigurations = [];
                                                    c.ChildEntity.forEach((item) => {
                                                        let intItem = {
                                                            name: item.Name,
                                                            required: item.Mandatory,
                                                            isChecked: item.Mandatory ? true : item.Active,
                                                            id: item.ID,
                                                            price: !item.Mandatory
                                                                ? Number(item.Price[0].rateRecurring)
                                                                      .toFixed(2)
                                                                      .toString()
                                                                : (0.0).toFixed(2).toString()
                                                        };
                                                        intItem.label =
                                                            Number(intItem.price) > 0
                                                                ? `${intItem.name} ($${intItem.price})`
                                                                : intItem.name;
                                                        internationalConfigurations.push(intItem);
                                                    });
                                                    internationalConfigurations = internationalConfigurations.sort(
                                                        (a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
                                                    );
                                                    this.internationalConfigurations = [...internationalConfigurations];
                                                } else if (c.Name === "Feature Options") {
                                                    c.ChildEntity.forEach((item) => {
                                                        if (item.Name === "Voicemail - Unified Messaging") {
                                                            let rings = [];
                                                            item.CharacteristicUse[0].ValidValues.forEach((item) => {
                                                                let newRing = {
                                                                    label: item.Value,
                                                                    value: item.ValueID
                                                                };
                                                                rings.push(newRing);
                                                            });
                                                            rings = rings.sort((a, b) =>
                                                                Number(a.label) > Number(b.label)
                                                                    ? 1
                                                                    : Number(a.label) < Number(b.label)
                                                                    ? -1
                                                                    : 0
                                                            );
                                                            let voiceMailItem = {
                                                                ringValues: [...rings],
                                                                price: Number(item.Price[0].rateRecurring)
                                                                    .toFixed(2)
                                                                    .toString(),
                                                                name: "Voicemail - Unified Messaging",
                                                                isChecked: item.Active,
                                                                required: item.Mandatory
                                                            };
                                                            this.voiceMailConfiguration = { ...voiceMailItem };
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        this.configurationsRequest = [...items];
                        if (
                            this.localFreezeOptions.length > 0 ||
                            this.listingOptions.length > 0 ||
                            this.internationalConfigurations.length > 0 ||
                            this.homeAddon !== undefined
                        ) {
                            this.loaderSpinner = false;
                            this.showModal = true;
                        } else {
                            this.handleConfirm();
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
                    if (apiResponse) {
                        this.logError(
                            `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                            myData,
                            path,
                            "API Error"
                        );
                    } else {
                        const errMsg = error.body?.message || error.message;
                        this.logError(errMsg);
                    }
                    this.loaderSpinner = false;
                });
        } else {
            this.handleConfirm();
        }
    }

    handleFreezeSelection(event) {
        this.localFreezeOption = event.detail;
        let charge = this.localFreezeOptionsPrices.filter((e) => e.id === this.localFreezeOption)[0];
        let cart = { ...this.cart };
        let cartFiltered = cart.monthlyCharges.filter((e) => e.name !== "Listing Option");
        if (Number(charge.price > 0)) {
            let newCharge = {
                name: "Local Freeze Option",
                fee: Number(charge.price).toFixed(2),
                type: "Monthly",
                discount: Number(charge.price) <= 0
            };
            cartFiltered.push(newCharge);
            cart.monthlyCharges = [...cartFiltered];
            cart.monthlyTotal = 0;
            cart.monthlyCharges.forEach(
                (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
            );
            this.cart = { ...cart };
        }
        let items = [...this.configurationsRequest];
        items.forEach((e) => {
            if (e.name === "Unlimited Digital Voice") {
                e.productConfiguration.ChildEntity.forEach((i) => {
                    if (i.Name === "IP-Voice-UDV") {
                        i.ChildEntity.forEach((c) => {
                            if (c.Name === "Local Carrier Freeze Options") {
                                c.ChildEntity.forEach((d) => {
                                    if (d.ID === this.localFreezeOption) {
                                        d.Active = true;
                                    } else {
                                        d.Active = false;
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        this.configurationsRequest = [...items];
    }

    handleListingSelection(event) {
        this.listingOption = event.detail;
        let charge = this.listingOptionsPrices.filter((e) => e.id === this.listingOption)[0];
        let cart = { ...this.cart };
        let cartFiltered = cart.monthlyCharges.filter((e) => e.name !== "Listing Information Option");
        if (Number(charge.price > 0)) {
            let newCharge = {
                name: "Listing Information Option",
                fee: Number(charge.price).toFixed(2),
                type: "Monthly",
                discount: Number(charge.price) <= 0
            };
            cartFiltered.push(newCharge);
        }
        cart.monthlyCharges = [...cartFiltered];
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        this.cart = { ...cart };
        let items = [...this.configurationsRequest];
        items.forEach((e) => {
            if (e.name === "Unlimited Digital Voice") {
                e.productConfiguration.ChildEntity.forEach((i) => {
                    if (i.Name === "IP-Voice-UDV") {
                        i.ChildEntity.forEach((c) => {
                            if (c.Name === "Directory Listing Options") {
                                c.ChildEntity.forEach((d) => {
                                    if (d.Name === "Listing Information Options") {
                                        d.ChildEntity.forEach((e) => {
                                            if (e.ID === this.listingOption) {
                                                e.Active = true;
                                            } else {
                                                e.Active = false;
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        this.configurationsRequest = [...items];
    }

    handleAdditionalListingSelection(event) {
        let price = this.additionalListing.price;
        let cart = { ...this.cart };
        let cartFiltered = cart.monthlyCharges.filter((e) => e.name !== "Listing Information Option");
        if (Number(price > 0) && event.detail) {
            let newCharge = {
                name: "Listing Information Option",
                fee: Number(price).toFixed(2),
                type: "Monthly",
                discount: Number(price) <= 0
            };
            cartFiltered.push(newCharge);
        }
        cart.monthlyCharges = [...cartFiltered];
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        this.cart = { ...cart };
        let items = [...this.configurationsRequest];
        items.forEach((e) => {
            if (e.name === "Unlimited Digital Voice") {
                e.productConfiguration.ChildEntity.forEach((i) => {
                    if (i.Name === "IP-Voice-UDV") {
                        i.ChildEntity.forEach((c) => {
                            if (c.Name === "Directory Listing Options") {
                                c.ChildEntity.forEach((d) => {
                                    if (d.Name === "Listing Information Options") {
                                        d.ChildEntity.forEach((e) => {
                                            if (e.Name === "Listed") {
                                                e.Active = true;
                                                e.ChildEntity.forEach((s) => {
                                                    if (s.Name === "Additional Listing") {
                                                        s.Active = event.detail;
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        this.configurationsRequest = [...items];
    }

    handleInternationalSelection(event) {
        let options = JSON.parse(JSON.stringify(event.detail)).options;
        let price = 0;
        let checkedItems = [];
        options.forEach((item) => {
            if (item.isChecked) {
                checkedItems.push(item.id);
                if (Number(item.price > 0)) {
                    price = Number(price) + Number(item.price);
                }
            }
        });
        let cart = { ...this.cart };
        let cartFiltered = cart.monthlyCharges.filter((e) => e.name !== "International Plan Options");
        if (Number(price) > 0) {
            let newCharge = {
                name: "International Plan Options",
                fee: Number(price).toFixed(2),
                type: "Monthly",
                discount: Number(price) <= 0
            };
            cartFiltered.push(newCharge);
        }
        cart.monthlyCharges = [...cartFiltered];
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        this.cart = { ...cart };
        let items = [...this.configurationsRequest];
        items.forEach((e) => {
            if (e.name === "Unlimited Digital Voice") {
                e.productConfiguration.ChildEntity.forEach((i) => {
                    if (i.Name === "IP-Voice-UDV") {
                        i.ChildEntity.forEach((c) => {
                            if (c.Name === "International Plan Options") {
                                c.ChildEntity.forEach((d) => {
                                    if (!d.Mandatory) {
                                        if (checkedItems.includes(d.ID)) {
                                            d.Active = true;
                                        } else {
                                            d.Active = false;
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        this.configurationsRequest = [...items];
    }

    handleMailSelected(event) {
        let selected = event.detail;
        let cart = { ...this.cart };
        let cartFiltered = cart.monthlyCharges.filter((e) => e.name !== "Voicemail - Unified Messaging");
        if (Number(this.voiceMailConfiguration.price) > 0 && selected) {
            let newCharge = {
                name: "Voicemail - Unified Messaging",
                fee: Number(this.voiceMailConfiguration.price).toFixed(2),
                type: "Monthly",
                discount: Number(this.voiceMailConfiguration.price) <= 0
            };
            cartFiltered.push(newCharge);
        }
        cart.monthlyCharges = [...cartFiltered];
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        this.cart = { ...cart };
        let items = [...this.configurationsRequest];
        items.forEach((e) => {
            if (e.name === "Unlimited Digital Voice") {
                e.productConfiguration.ChildEntity.forEach((i) => {
                    if (i.Name === "IP-Voice-UDV") {
                        i.ChildEntity.forEach((c) => {
                            if (c.Name === "Feature Options") {
                                c.ChildEntity.forEach((d) => {
                                    if (!d.Mandatory && d.Name === "Voicemail - Unified Messaging") {
                                        if (selected) {
                                            d.Active = true;
                                        } else {
                                            d.Active = false;
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        this.configurationsRequest = [...items];
    }

    handleRingSelected(event) {
        let items = [...this.configurationsRequest];
        items.forEach((e) => {
            if (e.name === "Unlimited Digital Voice") {
                e.productConfiguration.ChildEntity.forEach((i) => {
                    if (i.Name === "IP-Voice-UDV") {
                        i.ChildEntity.forEach((c) => {
                            if (c.Name === "Feature Options") {
                                c.ChildEntity.forEach((d) => {
                                    if (d.Name === "Voicemail - Unified Messaging") {
                                        d.CharacteristicUse[0].ValidValues.forEach((e) => {
                                            if (e.ValueID === event.detail) {
                                                e.Active = true;
                                            } else {
                                                e.Active = false;
                                            }
                                        });
                                        d.ConfiguredValue.forEach((item) => {
                                            if (item.Name === "Voicemail Email") {
                                                item.Value[0].Value = this.email;
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        this.configurationsRequest = [...items];
    }

    handleHomeAddon(event) {
        let selected = event.detail;
        let cart = { ...this.cart };
        let cartFiltered = cart.monthlyCharges.filter((e) => e.name !== this.homeAddon.name);
        if (Number(this.homeAddon.price) > 0 && selected) {
            let newCharge = {
                name: this.homeAddon.name,
                fee: Number(this.homeAddon.price).toFixed(2),
                type: "Monthly",
                discount: Number(this.homeAddon.price) <= 0
            };
            cartFiltered.push(newCharge);
        }
        cart.monthlyCharges = [...cartFiltered];
        cart.monthlyTotal = 0;
        cart.monthlyCharges.forEach(
            (charge) => (cart.monthlyTotal = (Number(cart.monthlyTotal) + Number(charge.fee)).toFixed(2))
        );
        this.cart = { ...cart };
        let items = [...this.configurationsRequest];
        items.forEach((e) => {
            if (e.name === "HomeShield Elite" && e.productConfiguration.hasOwnProperty("ChildEntity")) {
                e.productConfiguration.ChildEntity.forEach((element) => {
                    if (element.Name === "Family Identity Protection Add-on") {
                        element.Active = selected;
                    }
                });
            }
        });
        this.configurationsRequest = [...items];
    }

    handleConfirmModal(e) {
        this.handleConfirm();
    }

    handleConfirm() {
        this.loaderSpinner = true;
        const path = "getInstallOptions";
        let myData = {
            partnerName: "frapi",
            path,
            quoteId: this.quoteId,
            userId: this.frontierUserId
        };
        console.log("Get Install Options Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((res) => {
                apiResponse = res;
                let response = JSON.parse(res);
                console.log("Get Install Options Response", response);
                let error =
                    (response.hasOwnProperty("error") &&
                        response.error.hasOwnProperty("provider") &&
                        response.error.provider.hasOwnProperty("message")) ||
                    response.hasOwnProperty("error");
                if (error) {
                    this.loaderSpinner = false;
                    let errorMessage = response.hasOwnProperty("error")
                        ? response.error.hasOwnProperty("provider")
                            ? response.error.provider.message
                            : response.error
                        : response.error.provider.message;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${res}`, myData, path, "API Error");
                } else {
                    this.installationOptions = [...response.installationOptions];
                    this.handleConfigureOrders();
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
                    const errMsg = error.body?.message || error.message;
                    this.logError(errMsg);
                }
                this.loaderSpinner = false;
            });
    }

    handleConfigureOrders() {
        if (this.pendingTasks) {
            this.taskHandler("getCurrentTaskIds");
        } else {
            this.loaderSpinner = true;
            this.showModal = false;
            const path = "configureOrders";
            let myData = {
                partnerName: "frapi",
                path,
                quoteId: this.quoteId,
                products: this.configurationsRequest,
                userId: this.frontierUserId
            };
            console.log("Configure Orders Request", myData);
            let apiResponse;
            callEndpoint({ inputMap: myData })
                .then((res) => {
                    apiResponse = res;
                    let response = JSON.parse(res);
                    console.log("Configure Orders Response", response);
                    let error =
                        (response.hasOwnProperty("error") &&
                            response.error.hasOwnProperty("provider") &&
                            response.error.provider.hasOwnProperty("message")) ||
                        response.hasOwnProperty("error");
                    if (error) {
                        this.loaderSpinner = false;
                        let errorMessage = response.hasOwnProperty("error")
                            ? response.error.hasOwnProperty("provider")
                                ? response.error.provider.message
                                : response.error
                            : response.error.provider.message;
                        const event = new ShowToastEvent({
                            title: "Error",
                            variant: "error",
                            mode: "sticky",
                            message: errorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(`${errorMessage}\nAPI Response: ${res}`, myData, path, "API Error");
                    } else {
                        if (response.status.productConfigStatus === "Valid") {
                            let info = {
                                cart: this.cart,
                                quoteNumber: response.quoteNumber,
                                reservedTN: response.customer.customerTN,
                                btn: this.btn,
                                timeZone: this.timeZone,
                                installationOptions: [...this.installationOptions]
                            };
                            if (this.portableResult !== undefined) {
                                info.portable = this.phoneNumber;
                            }
                            this.nextTabPayload = { ...info };
                            if (this.checkForTasks) {
                                this.taskHandler("getCurrentTaskIds");
                            } else {
                                const closeModalEvent = new CustomEvent("configselection", {
                                    detail: this.nextTabPayload
                                });
                                this.dispatchEvent(closeModalEvent);
                                this.loaderSpinner = false;
                            }
                        } else {
                            this.loaderSpinner = false;
                            const genericErrorMessage =
                                "The Product Configurations selected are not valid. Please, Verify the information and try again";
                            const event = new ShowToastEvent({
                                title: "Error",
                                variant: "error",
                                mode: "sticky",
                                message: genericErrorMessage
                            });
                            this.dispatchEvent(event);
                            this.logError(`${genericErrorMessage}\nAPI Response: ${res}`, myData, path, "API Error");
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
                    if (apiResponse) {
                        this.logError(
                            `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                            myData,
                            path,
                            "API Error"
                        );
                    } else {
                        const errMsg = error.body?.message || error.message;
                        this.logError(errMsg);
                    }
                    this.loaderSpinner = false;
                });
        }
    }

    handleShowCCQuoteAssistanceModal() {
        this.showCreditCheckQuoteAssistanceModal = true;
    }

    handleCloseCCQuoteAssistanceModal() {
        this.showCreditCheckQuoteAssistanceModal = false;
    }

    taskHandler(endpoint, taskId) {
        this.loaderSpinner = true;
        let url = window.location.href;
        let isDevEnvironment = false;
        let pendingTasks = false;
        let posIdTasks = [];
        if (url.includes("qa") || url.includes("dev") || url.includes("uat") || url.includes("trainin")) {
            isDevEnvironment = true;
        }
        let payload = {
            partnerName: "frapi",
            path: endpoint,
            quoteId: this.quoteId,
            userId: this.frontierUserId
        };
        if (taskId) {
            payload.taskId = taskId;
        }
        callEndpoint({ inputMap: payload })
            .then((response) => {
                let data = JSON.parse(response);
                console.log(`Task Response ${payload.path}`, data);
                for (const task of data) {
                    if (task?.specName === "posIdHoldTask" && !task.hasOwnProperty("completionDateTime")) {
                        posIdTasks.push(task);
                        pendingTasks = true;
                    }
                }

                if (isDevEnvironment && posIdTasks.length > 0) {
                    for (let pendingTask of posIdTasks) {
                        this.taskHandler("closePosidHoldTask", pendingTask.taskId);
                    }
                } else if (!isDevEnvironment && posIdTasks.length > 0) {
                    this.showPosIdModal = true;
                } else {
                    pendingTasks = false;
                }

                this.checkForTasks = pendingTasks;
                this.pendingTasks = pendingTasks;
                if (!pendingTasks) {
                    const closeModalEvent = new CustomEvent("configselection", {
                        detail: this.nextTabPayload
                    });
                    this.dispatchEvent(closeModalEvent);
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const errMsg = error.body?.message || error.message;
                if (apiResponse) {
                    this.logError(`${errMsg}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    this.logError(errMsg);
                }
                this.loaderSpinner = false;
            });
    }

    hidePosIdModal(event) {
        this.showPosIdModal = false;
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Configurations",
            component: "poe_lwcBuyflowFrontierConfigurationsTab",
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
            tab: "Configurations"
        };
        this.dispatchEvent(event);
    }
}