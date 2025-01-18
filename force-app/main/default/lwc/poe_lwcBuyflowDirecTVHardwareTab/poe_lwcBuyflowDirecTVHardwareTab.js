import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class Poe_lwcBuyflowDirecTVHardwareTab extends NavigationMixin(LightningElement) {
    @api orderInfo;
    @api origin;
    @api userId;
    @api logo;
    @api hardwareSelected;
    @api paymentMethodSelected;
    @api recordId;
    @api cartInfo;
    @api mustPayInFull;
    @api accountId;
    @api order;
    @api returnUrl;
    mustPayInFullModal = false;
    originalCart;
    paymentMethod;
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
    paymentOptions = [
        {
            label: "Pay in Full",
            value: "full"
        },
        {
            label: "Installment",
            value: "installment"
        }
    ];
    payingFull = true;
    hardwareOptionsResponse = {};
    hardwareOptions = [];
    chosenOption;
    warrantyConfirm = false;
    noCompleteInfo = true;
    zeroDevices = false;
    orderId;
    orderItemId;
    phonesalesOrigin = false;
    equipmentTodayId;
    equipmentMonthlyId;

    connectedCallback() {
        if (this.paymentMethodSelected === undefined || this.mustPayInFull) {
            this.paymentMethod = "full";
        } else {
            this.paymentMethod = this.paymentMethodSelected;
        }
        this.phonesalesOrigin = this.origin === "phonesales";
        this.originalCart = { ...this.cartInfo };
        this.cart = { ...this.cartInfo };
        this.payingFull = this.paymentMethod === "full" ? true : false;
        this.loaderSpinner = true;
        this._actionUtil = new OmniscriptActionCommonUtil();
        let orderInfoParsed = JSON.parse(JSON.stringify(this.orderInfo));
        this.orderInfo = orderInfoParsed;
        let myData = {
            tab: "productDetail",
            componentCode: this.orderInfo?.componentCode,
            dealerCode: this.orderInfo?.dealerCode,
            partnerName: this.orderInfo?.partnerName,
            customerType: this.orderInfo?.customerType,
            productType: this.orderInfo?.productType,
            partnerOrderNumber: this.orderInfo?.partnerOrderNumber,
            customer: this.orderInfo?.customer
        };
        console.log("Product detail payload :");
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
                this.productDetailResponse = response.result.IPResult;
                console.log("Response: ");
                console.log(this.productDetailResponse);

                let responseComponentCustomizations = this.productDetailResponse.hasOwnProperty(
                    "componentCustomizations"
                )
                    ? this.productDetailResponse.componentCustomizations
                    : undefined;

                if (responseComponentCustomizations === undefined) {
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: "There was an error processing the request try again"
                    });
                    this.dispatchEvent(event);
                    this.loaderSpinner = false;
                } else {
                    let hardwareOptions = {
                        full: [],
                        installment: []
                    };
                    responseComponentCustomizations.forEach((customization) => {
                        if (customization.customization.properties.subGroupName === "ATVEquipmentPay") {
                            customization.customization.choices.forEach((equipmentCustomization) => {
                                if (equipmentCustomization.choice.properties.choiceCode === "ATV-EQUIPMENT-PAY-TODAY") {
                                    equipmentCustomization.choice.customizations.forEach((fullPriceChoice) => {
                                        this.equipmentTodayId =
                                            fullPriceChoice.customization.properties.customizationCode;
                                        fullPriceChoice.customization.choices.forEach(
                                            (fullPriceChoiceCustomization) => {
                                                let fullPriceProduct = fullPriceChoiceCustomization.choice;
                                                let choiceJson = {
                                                    componentCustomizations: [
                                                        {
                                                            customization: {
                                                                properties: {
                                                                    customizationCode:
                                                                        customization.customization.properties
                                                                            .subGroupName
                                                                },
                                                                choices: [
                                                                    {
                                                                        choice: {
                                                                            properties: {
                                                                                choiceCode:
                                                                                    equipmentCustomization.choice
                                                                                        .properties.choiceCode,
                                                                                usoc: equipmentCustomization.choice
                                                                                    .properties.usoc
                                                                            },
                                                                            customizations: [
                                                                                {
                                                                                    customization: {
                                                                                        properties: {
                                                                                            customizationCode:
                                                                                                fullPriceChoice
                                                                                                    .customization
                                                                                                    .properties
                                                                                                    .customizationCode
                                                                                        },
                                                                                        choices: [
                                                                                            {
                                                                                                choice: {
                                                                                                    properties: {
                                                                                                        choiceCode:
                                                                                                            fullPriceProduct
                                                                                                                .properties
                                                                                                                .choiceCode,
                                                                                                        usoc: fullPriceProduct
                                                                                                            .properties
                                                                                                            .usoc
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                }
                                                                            ]
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    ]
                                                };

                                                fullPriceProduct.choiceJson = choiceJson;
                                                hardwareOptions.full.push(fullPriceProduct);
                                            }
                                        );
                                    });
                                }
                                if (
                                    equipmentCustomization.choice.properties.choiceCode === "ATV-EQUIPMENT-PAY-MONTHLY"
                                ) {
                                    equipmentCustomization.choice.customizations.forEach((installmentPriceChoice) => {
                                        this.equipmentMonthlyId =
                                            installmentPriceChoice.customization.properties.customizationCode;
                                        installmentPriceChoice.customization.choices.forEach(
                                            (installmentPriceChoiceCustomization) => {
                                                let installmentPriceProduct =
                                                    installmentPriceChoiceCustomization.choice;
                                                let choiceJsonInstallment = {
                                                    componentCustomizations: [
                                                        {
                                                            customization: {
                                                                properties: {
                                                                    customizationCode:
                                                                        customization.customization.properties
                                                                            .subGroupName
                                                                },
                                                                choices: [
                                                                    {
                                                                        choice: {
                                                                            properties: {
                                                                                choiceCode:
                                                                                    equipmentCustomization.choice
                                                                                        .properties.choiceCode,
                                                                                usoc: equipmentCustomization.choice
                                                                                    .properties.usoc
                                                                            },
                                                                            customizations: [
                                                                                {
                                                                                    customization: {
                                                                                        properties: {
                                                                                            customizationCode:
                                                                                                installmentPriceChoice
                                                                                                    .customization
                                                                                                    .properties
                                                                                                    .customizationCode
                                                                                        },
                                                                                        choices: [
                                                                                            {
                                                                                                choice: {
                                                                                                    properties: {
                                                                                                        choiceCode:
                                                                                                            installmentPriceProduct
                                                                                                                .properties
                                                                                                                .choiceCode,
                                                                                                        usoc: installmentPriceProduct
                                                                                                            .properties
                                                                                                            .usoc
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                }
                                                                            ]
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    ]
                                                };
                                                installmentPriceProduct.choiceJson = choiceJsonInstallment;
                                                hardwareOptions.installment.push(installmentPriceProduct);
                                            }
                                        );
                                    });
                                }
                            });
                        }
                    });
                    this.hardwareOptionsResponse = hardwareOptions;
                    this.generateHardwareOptions();
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The Product request could not be made correctly to the server. Please, try again."
                });
                this.dispatchEvent(event);
                this.loaderSpinner = false;
            });
    }

    generateHardwareOptions() {
        this.hardwareOptions = [];
        let options = [];
        this.zeroDevices = false;
        if (this.payingFull === true) {
            this.hardwareOptionsResponse.full.forEach((fullPriceOption) => {
                let option = {
                    Id: fullPriceOption.properties?.choiceCode,
                    usoc: fullPriceOption.properties?.usoc,
                    quantity: fullPriceOption.properties?.name,
                    description: fullPriceOption?.longDescription,
                    due: fullPriceOption.fee?.fee,
                    price: `$${fullPriceOption.fee?.fee}`,
                    originalResponse: fullPriceOption,
                    isChecked: false
                };
                options.push(option);
            });
        } else {
            this.hardwareOptionsResponse.installment.forEach((installmentPriceOption) => {
                let option = {
                    Id: installmentPriceOption.properties?.choiceCode,
                    usoc: installmentPriceOption.properties?.usoc,
                    quantity: installmentPriceOption.properties?.name,
                    description: installmentPriceOption?.longDescription,
                    due: installmentPriceOption.fee?.fee,
                    price: `$${installmentPriceOption.fee?.fee}`,
                    originalResponse: installmentPriceOption,
                    isChecked: false
                };
                options.push(option);
            });
        }
        this.hardwareOptions = [...options];
        if (this.mustPayInFull) {
            this.mustPayInFullModal = true;
        }
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
        let chosen = event.target.dataset.id;
        this.zeroDevices = chosen === "ATV-EQUIPMENT-0" ? true : false;
        this.hardwareOptions.forEach((item) => {
            if (item.Id === chosen) {
                this.chosenOption = item;
                item.isChecked = true;
            } else {
                item.isChecked = false;
            }
        });
        let cart = { ...JSON.parse(JSON.stringify(this.originalCart)) };
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

    handleClick() {
        let preQualInfo = [
            {
                customization: {
                    properties: {
                        customizationCode: "ATV-EQUIPMENT-PAY"
                    },
                    choices: [
                        {
                            choice: {
                                properties: {
                                    choiceCode:
                                        this.paymentMethod === "full"
                                            ? "ATV-EQUIPMENT-PAY-TODAY"
                                            : "ATV-EQUIPMENT-PAY-MONTHLY",
                                    usoc:
                                        this.paymentMethod === "full"
                                            ? "ATV-EQUIPMENT-PAY-TODAY"
                                            : "ATV-EQUIPMENT-PAY-MONTHLY"
                                },
                                customizations: [
                                    {
                                        customization: {
                                            properties: {
                                                customizationCode:
                                                    this.paymentMethod === "full"
                                                        ? this.equipmentTodayId
                                                        : this.equipmentMonthlyId
                                            },
                                            choices: [
                                                {
                                                    choice: {
                                                        properties: {
                                                            choiceCode: this.chosenOption.Id,
                                                            usoc: this.chosenOption.Id
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ];
        if (this.paymentMethod !== "full") {
            let info = {
                chosen: this.chosenOption,
                response: this.productDetailResponse,
                name: this.chosenOption.quantity,
                method: this.paymentMethod,
                cartInfo: this.cart,
                preQualRequest: preQualInfo,
                componentCustomizations: this.chosenOption.originalResponse.choiceJson
            };
            const sendCartNextEvent = new CustomEvent("hardwarenext", {
                detail: info
            });
            this.dispatchEvent(sendCartNextEvent);
        } else {
            this.handlePayInFull(preQualInfo);
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

    handlePaymentMethod(event) {
        this.paymentMethod = event.target.value;
        this.payingFull = this.paymentMethod === "full" ? true : false;
        this.noCompleteInfo = true;
        this.hardwareSelected = undefined;
        this.cart = { ...this.originalCart };
        this.generateHardwareOptions();
    }

    warrantyHandler(event) {
        this.warrantyConfirm = event.target.checked;
        this.disableValidations();
    }

    disableValidations() {
        this.noCompleteInfo =
            (!this.zeroDevices && this.chosenOption !== undefined && this.warrantyConfirm) ||
            (this.zeroDevices && this.chosenOption !== undefined)
                ? false
                : true;
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    closeModal() {
        this.mustPayInFullModal = false;
    }

    handlePayInFull(preQualInfo) {
        this.loaderSpinner = true;
        let myData = {
            ContextId: this.recordId,
            partner: "directv"
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_GetSSNFraudRules",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                this.referenceNumber = response.result.IPResult.refNum;
                this.saveOrder(preQualInfo);
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
            });
    }

    saveOrder(preQualInfo) {
        let info = {
            billingAddress: {
                addressLine1: this.orderInfo.address.addressLine1,
                addressLine2:
                    this.orderInfo.address.addressLine2 == undefined ? "" : this.orderInfo.address.addressLine2,
                city: this.orderInfo.address.city,
                state: this.orderInfo.address.state,
                country: "USA",
                zipCode: this.orderInfo.address.zipCode
            },
            orderId: this.order,
            cart: this.cart,
            chosen: this.chosenOption,
            response: this.productDetailResponse,
            name: this.chosenOption.quantity,
            method: this.paymentMethod,
            cartInfo: this.cart,
            preQualRequest: preQualInfo,
            componentCustomizations: this.chosenOption.originalResponse.choiceJson
        };
        console.log(info);
        const sendBackEvent = new CustomEvent("hardwarenext", {
            detail: info
        });
        this.dispatchEvent(sendBackEvent);
        this.loaderSpinner = false;
    }
}