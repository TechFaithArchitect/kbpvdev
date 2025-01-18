import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";

export default class Poe_lwcBuyflowDirecTVEngaHardwareTab extends NavigationMixin(LightningElement) {
    @api orderInfo;
    @api origin;
    @api userId;
    @api logo;
    @api recordId;
    @api cartInfo;
    @api accountId;
    @api order;
    @api returnUrl;
    @api verbiages;
    @api clientInfo;
    @api addCartData;
    @api isGuestUser;
    @api treatmentCode;
    isNotGuestUser;
    newAddCartData;
    originalCart;
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
    showCollateral;
    referenceNumber;
    hardwareOptionsResponse = {};
    hardwareOptions = [];
    chosenOption;
    warrantyConfirm = false;
    noCompleteInfo = false;
    zeroDevices = false;
    orderId;
    orderItemId;
    phonesalesOrigin = false;
    equipmentTodayId;
    equipmentMonthlyId;
    protections;
    checkedDealerInventory = false;
    serials = [];
    noValidate = true;
    serialValidationComplete = false;
    deviceSelected = false;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage
    };
    showSelfServiceCancelModal = false;

    connectedCallback() {
        this.isNotGuestUser = !this.isGuestUser;
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        this.phonesalesOrigin = this.origin === "phonesales";
        this.cart = { ...this.cartInfo };
        this.originalCart = { ...this.cart };
        this.loaderSpinner = true;
        const path = "getAddonEquipmentProtectionplanDetails";
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
            sid: this.orderInfo.sid,
            billingSystem: this.orderInfo.billingSystem,
            selectedBaseOfferCode: this.orderInfo.componentCode,
            addOn: {
                offerProductFamily: ["OTT"],
                offerActionType: ["Acquisition"],
                contractIndicator: ["TAZCONTRACT"],
                offerProductTypes: ["video-addon"],
                addOnType: ["Programming-Bolt-on", "Bolt-on", "Standalone", "Subscription"]
            },
            equipment: {
                offerProductFamily: ["OTT"],
                offerActionType: ["Acquisition"],
                offerProductTypes: ["video-device", "fee"],
                contractIndicator: ["TAZCONTRACT"]
            },
            protectionPlan: {
                salesChannel: [this.orderInfo.channel],
                offerProductTypes: ["protection-plan"],
                offerActionType: ["Acquisition"],
                contractIndicator: ["TAZCONTRACT"],
                offerProductFamily: ["OTT"],
                cartContext: {
                    epochOfferCodes: [this.orderInfo.componentCode]
                },
                migrationIndicator: false,
                creditRisk: ""
            },
            channelEligibility: {
                salesChannel: this.orderInfo.channel,
                salesSubChannel: this.orderInfo.subChannel,
                locationID: this.orderInfo.locationId,
                locationTypeID: this.orderInfo.locationTypeId,
                dealerCode: this.orderInfo.channelEligibility.dealerCode,
                directIntegrationPartnerName: "ENGA-CHUZO"
            }
        };
        console.log("Product Detail Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let responseParsed = JSON.parse(response);
                console.log("Product Detail Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = `${responseParsed.message !== undefined ? responseParsed.message + "." : ""} ${
                        responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.offers = responseParsed.addOns;
                    this.hardwareOptionsResponse = responseParsed.equipment.equipment;
                    this.protections = responseParsed.protectionPlan;
                    this.generateHardwareOptions();
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The Product request could not be made correctly to the server. Please, try again.";
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

    generateHardwareOptions() {
        this.hardwareOptions = [];
        this.zeroDevices = false;

        this.hardwareOptionsResponse.forEach((hardwareOption) => {
            let option = {
                Id: hardwareOption.offerCode,
                usoc: hardwareOption.product[0].billingProductCode,
                quantity: hardwareOption.fullDisplayName,
                description: hardwareOption.fullDescription,
                due: Number(
                    Number(hardwareOption.childSkus[0].price.basePrice) -
                        Number(
                            hardwareOption.childSkus[0].price.productBenefitsInfo.benefits.length > 0
                                ? hardwareOption.childSkus[0].price.productBenefitsInfo.benefits[0].benefitFlattOffPrice
                                : 0
                        )
                ).toFixed(2),
                price: `$${Number(
                    Number(hardwareOption.childSkus[0].price.basePrice) -
                        Number(
                            hardwareOption.childSkus[0].price.productBenefitsInfo.benefits.length > 0
                                ? hardwareOption.childSkus[0].price.productBenefitsInfo.benefits[0].benefitFlattOffPrice
                                : 0
                        )
                ).toFixed(2)}`,
                originalResponse: hardwareOption,
                subOptions: hardwareOption.product[0].compatibleDevices[0].products,
                isChecked: false,
                minSelected: Number(hardwareOption.minSelected),
                maxSelected: Number(hardwareOption.maxSelected)
            };

            if (!option.minSelected || !option.maxSelected) {
                return;
            }

            for (let i = option.minSelected; i <= option.maxSelected; i++) {
                this.hardwareOptions.push({
                    ...option,
                    quantity: `${i} ${option.quantity}`,
                    due: (option.due * i - option.due).toFixed(2),
                    price: `$${(option.due * i - option.due).toFixed(2)}`,
                    iterId: `${i}-${option.Id}`,
                    count: i
                });
            }
        });

        this.disableValidations();
    }

    handleCancel() {
        if (this.returnUrl != undefined) {
            window.open(this.returnUrl, "_self");
        } else if (this.isGuestUser) {
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

    handleSerialsArray(index) {
        this.serialValidationComplete = false;
        this.noValidate = true;
        this.serials = [];
        let auxSerials = [];
        for (var i = 0; i <= index; i++) {
            let serial = {
                label: `Serial ${i + 1}`,
                value: "",
                id: i
            };
            auxSerials.push(serial);
        }
        this.serials = [...auxSerials];
        this.disableValidations();
    }

    handleHardwareSelection(event) {
        let chosen = event.target.dataset.id;
        this.zeroDevices = chosen === "ATV-EQUIPMENT-0" ? true : false;
        this.hardwareOptions.forEach((item, index) => {
            if (item.iterId === chosen) {
                this.chosenOption = item;
                item.isChecked = true;
                this.deviceSelected = true;
                this.handleSerialsArray(index);
            } else {
                item.isChecked = false;
            }
        });
        let cart = { ...JSON.parse(JSON.stringify(this.originalCart)) };
        let monthlyCharges = [...cart.monthlyCharges];
        let todayCharges = [...cart.todayCharges];
        let newCharge = {
            name: this.chosenOption.quantity,
            fee: Number(this.chosenOption.due).toFixed(2),
            feeTerm: "Monthly",
            discount: !(Number(this.chosenOption.due) > 0.0),
            hasDescription: false,
            description: "",
            type: "hardware"
        };
        if (newCharge.feeTerm === "Monthly") {
            cart.hasMonthly = true;
            monthlyCharges.push(newCharge);
        } else {
            cart.hasToday = true;
            todayCharges.push(newCharge);
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
        this.disableValidations();
    }

    handleNext() {
        this.loaderSpinner = true;
        this.removeCart();
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

    handlePaymentMethod(event) {
        this.paymentMethod = event.target.value;
        this.payingFull = this.paymentMethod === "full" ? true : false;
        this.noCompleteInfo = true;
        this.hardwareSelected = undefined;
        this.cart = { ...this.originalCart };
        this.generateHardwareOptions();
    }

    disableValidations() {
        this.noCompleteInfo =
            this.chosenOption !== undefined &&
            (!this.checkedDealerInventory || (this.checkedDealerInventory && this.serialValidationComplete))
                ? false
                : true;
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    removeCart() {
        const { firstName, lastName, phone, email, time, method } = this.clientInfo.contactInfo;
        const path = "removeCart";
        const inputMap = {
            ...this.orderInfo,
            path,
            partnerName: "enga-stream",
            systemCode: "ENGA-CHUZO",
            selectedBaseOfferCode: this.orderInfo.componentCode,
            customerPersonalInfo: {
                additionalContactDetails: [],
                primaryContactPhones: [
                    {
                        phoneNumber: phone,
                        contactPhoneType: "CELL_PHONE"
                    }
                ],
                contactNumber: "",
                alternateContactPhoneType: "",
                email: email,
                firstName: firstName,
                lastName: lastName,
                mobileAlertOptIn: true,
                preferredContactTime: time !== "" ? time : undefined,
                contactPhoneType: "CELL_PHONE",
                alternateContactNumber: "6",
                preferredContactMethods: [method !== "" ? method : undefined]
            }
        };
        console.log("Remove Cart Request", inputMap);
        let apiResponse;
        callEndpoint({ inputMap })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
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
                    this.loaderSpinner = false;
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    return this.dispatchEvent(event);
                }

                this.addCart();
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

    addCart() {
        const path = "addCart";
        let addCartData = { ...(this.addCartData?.body ? this.addCartData.body : this.addCartData) };
        let inputMap = {
            ...addCartData,
            path,
            selectedBaseOfferCode: this.orderInfo.componentCode,
            channelEligibility: {
                salesChannel: this.orderInfo.channel,
                salesSubChannel: this.orderInfo.subChannel,
                locationID: this.orderInfo.locationId,
                locationTypeID: this.orderInfo.locationTypeId,
                dealerCode: this.orderInfo.channelEligibility.dealerCode,
                directIntegrationPartnerName: "ENGA-CHUZO"
            }
        };
        // Remove any previously selected hardware items
        inputMap.itemsList = inputMap.itemsList.filter((item) => item.itemType !== "EQUIPMENT");
        inputMap.itemsList.push({
            action: "ADD",
            itemType: "EQUIPMENT",
            offerId: this.chosenOption.Id,
            productGroup: "DTVNOW",
            quantity: this.chosenOption.count
        });
        this.newAddCartData = inputMap;
        console.log("Add Cart Stream Request", inputMap);
        let apiResponse;
        callEndpoint({ inputMap })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Add Cart Stream Response", result);
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
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, inputMap, path, "API Error");
                    this.loaderSpinner = false;
                } else {
                    if (result.content.payload.cartStatus.cartState.toLowerCase() === "complete") {
                        this.handleCartSummary();
                    } else {
                        const genericErrorMessage = "Cart couldn't be validated";
                        const event = new ShowToastEvent({
                            title: "Invalid Cart",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(event);
                        this.logError(`${genericErrorMessage}\nAPI Response: ${response}`, inputMap, path, "API Error");
                        this.loaderSpinner = false;
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
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, inputMap, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                this.loaderSpinner = false;
            });
    }

    handleCartSummary() {
        const path = "cartSummary";
        const inputMap = {
            path,
            partnerName: "enga-stream",
            systemCode: "ENGA-CHUZO",
            ...this.orderInfo
        };
        console.log("Cart Summary Request", inputMap);
        let apiResponse;
        callEndpoint({ inputMap })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Cart Summary Response", result);
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
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, inputMap, path, "API Error");
                    return this.dispatchEvent(event);
                }

                const info = {
                    offers: this.offers,
                    protections: this.protections,
                    cartInfo: this.cart,
                    addCartData: this.newAddCartData,
                    chosen: this.chosenOption,
                    result,
                    dealerInventory: this.checkedDealerInventory,
                    serials: this.serials
                };
                const sendCartNextEvent = new CustomEvent("hardwarenext", {
                    detail: info
                });
                this.dispatchEvent(sendCartNextEvent);
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
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, inputMap, path, "API Error");
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
            tab: "Hardware",
            component: "poe_lwcBuyflowDirecTvEngaHardwareTab",
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

    handleDealerInventory(event) {
        this.serialValidationComplete = false;
        this.noValidate = true;
        let auxSerials = this.serials.map((item) => {
            return { ...item, value: "" };
        });
        this.serials = [...auxSerials];
        this.checkedDealerInventory = event.target.checked;
        this.disableValidations();
    }

    handleSerial(event) {
        if (
            event.target.value !== null &&
            event.target.value !== "" &&
            event.target.value !== undefined &&
            this.serials.some((item) => item.value == event.target.value)
        ) {
            const toastEvent = new ShowToastEvent({
                title: "Duplicate Serial Number",
                variant: "error",
                mode: "sticky",
                message: `The serial number ${event.target.value} has already been entered.`
            });
            this.dispatchEvent(toastEvent);
        } else {
            let auxSerials = this.serials.map((item) => {
                if (item.id == event.target.dataset.id) {
                    let auxItem = { ...item, value: event.target.value };
                    return { ...auxItem };
                } else {
                    return { ...item };
                }
            });
            this.serials = [...auxSerials];
        }
        this.noValidate = this.serials.some(
            (serial) => serial.value === null || serial.value === "" || serial.value === undefined
        );
    }

    validateSerialNumber() {
        this.loaderSpinner = true;
        const path = "validateSerialNumber";
        let myData = {
            path,
            partnerName: this.orderInfo.partnerName,
            systemCode: this.orderInfo.systemCode,
            correlationId: this.orderInfo.correlationId,
            dealerCorpId: this.orderInfo.dealerCorpId,
            dealerId: this.orderInfo.dealerId,
            dealerAgentId: this.orderInfo.dealerAgentId,
            dealerLocation: this.orderInfo.dealerLocation,
            uuid: this.orderInfo.uuid,
            sid: this.orderInfo.sid,
            deviceType: "OSPREY",
            serialNumbers: this.serials.map((item) => item.value),
            dealerCode: this.orderInfo.dealerCode
        };
        console.log("Validate Serial Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let responseParsed = JSON.parse(response);
                console.log("Validate Serial Response", responseParsed);
                let error =
                    (responseParsed.hasOwnProperty("error") &&
                        responseParsed.error.hasOwnProperty("provider") &&
                        responseParsed.error.provider.hasOwnProperty("message")) ||
                    responseParsed.hasOwnProperty("error");
                if (error) {
                    let errorMessage = `${responseParsed.message !== undefined ? responseParsed.message + "." : ""} ${
                        responseParsed.error.hasOwnProperty("provider")
                            ? responseParsed.error.provider.message.hasOwnProperty("message")
                                ? responseParsed.error.provider.message.message
                                : responseParsed.error.provider.message
                            : responseParsed.error.message
                    }`;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.serialValidationComplete =
                        responseParsed.hasOwnProperty("serialNumbers") &&
                        responseParsed.serialNumbers.every((serial) => serial.serNumberExist === "Y");
                    if (this.serialValidationComplete) {
                        const event = new ShowToastEvent({
                            title: "Serial Numbers Validation",
                            variant: "success",
                            message: "Serial numbers entered were validated successfully."
                        });
                        this.dispatchEvent(event);
                        this.noValidate = true;
                    } else {
                        let serials = "";
                        responseParsed.serialNumbers.forEach((item) => {
                            if (item.serNumberExist === "N") {
                                serials = serials.length == 0 ? item.serNumber : serials + ", " + item.serNumber;
                            }
                        });
                        const event = new ShowToastEvent({
                            title: "Serial Numbers Validation",
                            variant: "error",
                            mode: "sticky",
                            message: `Serial Number(s) ${serials} could not be validated, please review the information and try again.`
                        });
                        this.dispatchEvent(event);
                    }
                    this.disableValidations();
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The Product request could not be made correctly to the server. Please, try again.";
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
}