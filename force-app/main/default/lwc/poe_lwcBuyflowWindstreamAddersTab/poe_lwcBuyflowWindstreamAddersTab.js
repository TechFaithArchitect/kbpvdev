import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import ToastContainer from "lightning/toastContainer";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import kineticSecureCreditOfferName from "@salesforce/label/c.Windstream_KineticSecure_Credit_Offer";
import kineticSecureCreditOfferDisclaimer from "@salesforce/label/c.Windstream_KineticSecure_Credit_Offer_Disclaimer";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import autoPaySurcharge from "@salesforce/label/c.Windstream_KineticSecure_AutoPay_Surcharge";
import Adders_Selection_label from  "@salesforce/label/c.Adders_Selection_label";
import Modem_Selection_labels from  "@salesforce/label/c.Modem_Selection_labels";
import Extenders_Selection_labels from  "@salesforce/label/c.Extenders_Selection_labels";
import Installation_Fees_labels from  "@salesforce/label/c.Installation_Fees_labels";
import AutoPay_labels from  "@salesforce/label/c.AutoPay_labels";
import Paper_Paperless_Billing_labels from  "@salesforce/label/c.Paper_Paperless_Billing_labels";
import Rewards_labels from  "@salesforce/label/c.Rewards_labels"; 
import Phone_Configurations_labels from  "@salesforce/label/c.Phone_Configurations_labels"; 
import Phone_Number_Portability from  "@salesforce/label/c.Phone_Number_Portability"; 
import Others_labels from  "@salesforce/label/c.Others_labels"; 
import T_Chart_labels from  "@salesforce/label/c.T_Chart_labels"; 
import activation_militar_and_fee_labels from  "@salesforce/label/c.activation_militar_and_fee_labels"; 

const INTERNET_ACTIVATION_FEE_ID = "1016";
const MILITARY_ACTIVATION_FEE_ID = "1014";
const AUTOPAY_ENROLLMENT_ID = "1263";
const DECLINED_AUTOPAY_ENROLLMENT_ID = "1283";
const RELATED_CHECKBOX_FIELDS = {
    2343: {
        // KineticSecure 3 Month Credit
        relatedIds: ["1175"], // KineticSecure
        checkedOnChange: true
    },
    2306: {
        // Extender Rental Credit - 1st mo free
        relatedIds: ["1003"], // Extender Rental - Pro Install
        checkedOnChange: true
    },
    1015: {
        // Extender Rental Credit - 24 mos free
        relatedIds: ["1003"], // Extender Rental - Pro Install
        checkedOnChange: true
    },
    1175: {
        // KineticSecure
        relatedIds: ["2343"], // KineticSecure 3 Month Credit
        checkedOnChange: false
    },
    1003: {
        // Extender Rental - Pro Install
        relatedIds: ["2306", "1015"], // Extender Rental Credit - 1st mo free, Extender Rental Credit - 24 mos free
        checkedOnChange: false
    },
    2425: {
        // Extender Rental Fiber - Pro Install
        relatedIds: ["2306", "1015"], // Extender Rental Credit - 1st mo free, Extender Rental Credit - 24 mos free
        checkedOnChange: false
    }
};

export default class Poe_lwcBuyflowWindstreamAddersTab extends NavigationMixin(LightningElement) {
    @api cartInfo;
    @api adders;
    @api recordId;
    @api bundleId;
    @api isBundle;
    @api logo;
    @api disclaimers;
    @api adderSelection;
    @api portability;
    @api hasAutoPay;
    @api isGuestUser;
    @api speed;
    cart;
    showSBS = false;
    rewards = [];
    paperless = [];
    autoPay = [];
    installationAdders = [];
    fees = [];
    phone = [];
    selfRentals = [];
    standardRentals = [];
    others = [];
    extenders = [];
    disableNext = true;
    showExtenders;
    showDisclaimer;
    disclaimer = [];
    modalLabel = "Close";
    portablePhone;
    provider;
    pin;
    account;
    internetActivationFeeChecked;
    militaryActivationFeeChecked;
    showKSCreditOfferId = undefined;
    showKSCreditOfferModal = false;
    kSCreditOfferModalDisclaimer = {
        agreeText: "Accept",
        cancelText: "Decline",
        description: kineticSecureCreditOfferDisclaimer,
        header: kineticSecureCreditOfferName
    };
    showModemSelection = true;
    labels = {
        autoPaySurcharge,
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        Adders_Selection_label,
        Modem_Selection_labels,
        Extenders_Selection_labels,
        Installation_Fees_labels,
        AutoPay_labels,
        Paper_Paperless_Billing_labels,
        Rewards_labels,
        Phone_Configurations_labels,
        Phone_Number_Portability,
        Others_labels,
        T_Chart_labels,
        activation_militar_and_fee_labels
    };
    showSelfServiceCancelModal = false;
    showAutoPaySurchargeDisclaimer = false;
    directoryUnlisted = false;

    get extendersSelectionClass() {
        return this.showModemSelection
            ? "slds-col slds-medium-size_6-of-12 slds-size_12-of-12"
            : "slds-col slds-size_1-of-1";
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
        this.cart = { ...JSON.parse(JSON.stringify(this.cartInfo)) };
        this.directoryUnlisted = this.cartInfo.todayCharges.some((charge) => charge.name === "Directory Listing");
        const hideSelfInstall = this.cartInfo.bundlesCharges.some((charge) => charge.name.includes("Unlimited Phone"));
        let rewards = [];
        let paperless = [];
        let autoPay = [];
        let installationAdders = [];
        let fees = [];
        let phone = [];
        let selfRentals = [];
        let standardRentals = [];
        let others = [];
        let disclaimers = [...JSON.parse(JSON.stringify(this.disclaimers))];
        let adders = { ...JSON.parse(JSON.stringify(this.adders)) };
        let allAdders = [...Object.values(adders).flat(Infinity)];

        if (["2350", "2352", "2353", "2354"].includes(this.bundleId)) {
            this.showModemSelection = false;
            this.disableNext = false;
        }

        allAdders.forEach((adder) => {
            let item = {
                Id: adder.bundleAdderID,
                Name: adder.bundleAdderName,
                PriceType: adder.bundleAdderType,
                Price: Number(adder.bundleAdderPrice).toFixed(2).toString(),
                Family: "Windstream",
                hasDescription: adder.disclaimerDesc !== null ? true : false,
                Description: adder.disclaimerDesc + ".",
                Default: adder.bundleAdderType.toLowerCase().includes("default"),
                isChecked:
                    adder.bundleAdderType.toLowerCase().includes("required") ||
                    adder.bundleAdderType.toLowerCase().includes("default"),
                isDisabled: adder.bundleAdderType.toLowerCase().includes("required"),
                hasDisclaimer:
                    disclaimers.some((e) => e.Name === adder.disclaimerNumber) && adder.disclaimerNumber !== null,
                disclaimerNumber: adder.disclaimerNumber
            };

            if (item.Name === kineticSecureCreditOfferName) {
                this.showKSCreditOfferModal = true;
                this.showKSCreditOfferId = item.Id;
            }

            switch (item.Id) {
                case "1217":
                case "1257":
                    break;
                case "1287":
                    item.type = "self";
                    installationAdders.push(item);
                    break;
                case "1284":
                case "2426":
                    item.type = "self-rentals";
                    selfRentals.push(item);
                    break;
                case "1320":
                    item.type = "self-rentals";
                    item.isDisabled = true;
                    selfRentals.push(item);
                    break;
                case "1321":
                    item.type = "self-rentals";
                    item.isDisabled = true;
                    selfRentals.push(item);
                    break;
                case "1124":
                case "1216":
                    item.type = "install";
                    installationAdders.push(item);
                    break;
                case "1003":
                case "2425":
                    item.type = "install-rentals";
                    standardRentals.push(item);
                    break;
                case "1322":
                    item.type = "install-rentals";
                    item.isDisabled = true;
                    standardRentals.push(item);
                    break;
                case "1323":
                    item.type = "install-rentals";
                    item.isDisabled = true;
                    standardRentals.push(item);
                    break;
                case "2300":
                case "1172":
                case "1016":
                    item.type = "fees";
                    if (item.Id !== "1016") {
                        item.isDisabled = true;
                    }
                    fees.push(item);
                    break;
                case "1263":
                case "1283":
                    item.type = "autoPay";
                    autoPay.push(item);
                    break;
                case "2160":
                case "1194":
                    item.type = "paperless";
                    paperless.push(item);
                    break;
                case "1002":
                case "2342":
                case "2307":
                    item.type = "rewards";
                    rewards.push(item);
                    break;
                case "2340":
                    if (this.speed === "2000") {
                        item.type = "rewards";
                        rewards.push(item);
                    }
                    break;
                case "2339":
                    if (this.speed === "1000") {
                        item.type = "rewards";
                        rewards.push(item);
                    }
                    break;
                case "1896":
                case "1175":
                    item.type = "others";
                    others.push(item);
                    break;
                case "1214":
                    item.type = "phone";
                    if (this.isBundle) {
                        phone.push(item);
                    }
                    break;
                default:
                    item.type = "others";
                    others.push(item);
                    break;
            }
        });

        if (hideSelfInstall) {
            installationAdders = installationAdders.filter((element) => element.type !== "self");
            fees = fees.filter((element) => !element.Name.includes("Self-Install"));
            others = others.filter((element) => !element.Name.includes("Self-Install"));
            selfRentals = [];
        }
        this.selfRentals = [...selfRentals];

        const priorityOrder = ["2425", "1003", "1322", "1323"];

        const sortedStandardRentals = standardRentals.sort((a, b) => {
            const indexA = priorityOrder.indexOf(a.Id);
            const indexB = priorityOrder.indexOf(b.Id);

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }

            if (indexA !== -1) {
                return -1;
            }
            if (indexB !== -1) {
                return 1;
            }

            return 0;
        });

        this.standardRentals = [...sortedStandardRentals];

        installationAdders.sort((a, b) =>
            Number(a.Price) > Number(b.Price) ? -1 : Number(a.Price) < Number(b.Price) ? 1 : 0
        );
        installationAdders.forEach((item) => {
            if (item.isChecked) {
                this.disableNext = false;
                this.showExtenders = true;
                this.extenders = item.type === "install" ? [...this.standardRentals] : [...this.selfRentals];
                item.isChecked = !this.showModemSelection ? false : item.isChecked;
            }
        });

        this.rewards = [...rewards];
        this.paperless = [...paperless];
        this.autoPay = [...autoPay];
        this.installationAdders = [...installationAdders];
        this.fees = [...fees];
        this.phone = [...phone];
        this.others = [...others];

        if (this.adderSelection !== undefined) {
            let data = { ...JSON.parse(JSON.stringify(this.adderSelection)) };
            this.rewards = [...data.rewards];
            this.installationAdders = [...data.installationAdders];
            this.fees = [...data.fees];
            this.phone = [...data.phone];
            this.extenders = [...data.extenders];
            this.others = [...data.others];
            this.paperless = [...data.paperless];
            this.autoPay = [...data.autoPay];
        }
        this.calculateCart();
    }

    handleChange(event) {
        let type = event.target.dataset.type;
        let adderId = event.target.dataset.id;
        if (RELATED_CHECKBOX_FIELDS[adderId]) {
            this.handleRelatedCheckboxes(adderId, event.target.checked);
        }

        if (type === "install" || type === "self") {
            this.disableNext = false;
            let fees = [...this.fees];
            let extenders = [];
            let installationAdders = [...this.installationAdders];
            installationAdders.forEach((adder) => {
                if (adder.Id === adderId) {
                    adder.isChecked = true;
                } else {
                    adder.isChecked = false;
                }
            });
            extenders = type === "install" ? [...this.standardRentals] : [...this.selfRentals];
            this.extenders = [...extenders];
            this.showExtenders = true;
            this.installationAdders = [...installationAdders];

            fees.forEach((e) => {
                if (e.Id === "2300") {
                    e.isChecked = type === "self";
                } else if (e.Id === "1016") {
                    if (type === "self") {
                        e.isChecked = false;
                    }
                    e.isDisabled = type === "self";
                }
            });
            this.fees = [...fees];
        } else if (type === "install-rentals") {
            let extenders = [...this.extenders];
            if (event.target.checked) {
                switch (adderId) {
                    case "1003":
                    case "2425":
                        extenders.forEach((item) => {
                            if (item.Id === "1003" || item.Id === "2425") {
                                item.isChecked = true;
                            } else if (item.Id === "1322") {
                                item.isDisabled = false;
                            }
                        });
                        break;
                    case "1322":
                        extenders.forEach((item) => {
                            if (item.Id === "1322") {
                                item.isChecked = true;
                            } else if (item.Id === "1323") {
                                item.isDisabled = false;
                            }
                        });
                        break;
                    case "1323":
                        extenders.forEach((item) => {
                            if (item.Id === "1323") {
                                item.isChecked = true;
                            }
                        });
                        break;
                }
            } else {
                switch (adderId) {
                    case "1003":
                    case "2425":
                        extenders.forEach((item) => {
                            if (item.Id === "1322" || item.Id === "1323") {
                                item.isChecked = false;
                                item.isDisabled = true;
                            } else if (item.Id === "1003" || item.Id === "2425") {
                                item.isChecked = false;
                            }
                        });
                        break;
                    case "1322":
                        extenders.forEach((item) => {
                            if (item.Id === "1323") {
                                item.isChecked = false;
                                item.isDisabled = true;
                            } else if (item.Id === "1322") {
                                item.isChecked = false;
                            }
                        });
                        break;
                    case "1323":
                        extenders.forEach((item) => {
                            if (item.Id === "1323") {
                                item.isChecked = false;
                            }
                        });
                        break;
                }
            }
            this.extenders = [...extenders];
        } else if (type === "self-rentals") {
            let extenders = [...this.extenders];
            if (event.target.checked) {
                switch (adderId) {
                    case "1284":
                    case "2426":
                        extenders.forEach((item) => {
                            if (item.Id === "1284" || item.Id === "2426") {
                                item.isChecked = true;
                            } else if (item.Id === "1320") {
                                item.isDisabled = false;
                            }
                        });
                        break;
                    case "1320":
                        extenders.forEach((item) => {
                            if (item.Id === "1320") {
                                item.isChecked = true;
                            } else if (item.Id === "1321") {
                                item.isDisabled = false;
                            }
                        });
                        break;
                    case "1321":
                        extenders.forEach((item) => {
                            if (item.Id === "1321") {
                                item.isChecked = true;
                            }
                        });
                        break;
                }
            } else {
                switch (adderId) {
                    case "1284":
                    case "2426":
                        extenders.forEach((item) => {
                            if (item.Id === "1320" || item.Id === "1321") {
                                item.isChecked = false;
                                item.isDisabled = true;
                            } else if (item.Id === "1284" || item.Id === "2426") {
                                item.isChecked = false;
                            }
                        });
                        break;
                    case "1320":
                        extenders.forEach((item) => {
                            if (item.Id === "1321") {
                                item.isChecked = false;
                                item.isDisabled = true;
                            } else if (item.Id === "1320") {
                                item.isChecked = false;
                            }
                        });
                        break;
                    case "1321":
                        extenders.forEach((item) => {
                            if (item.Id === "1321") {
                                item.isChecked = false;
                            }
                        });
                        break;
                }
            }
            this.extenders = [...extenders];
        } else if (type === "autoPay") {
            let autoPay = [...this.autoPay];
            autoPay.forEach((item) => {
                if (item.Id === adderId) {
                    if (item.Id === AUTOPAY_ENROLLMENT_ID) {
                        this.showAutoPaySurchargeDisclaimer = true;
                    } else item.isChecked = true;
                } else {
                    item.isChecked = false;
                }
            });
            this.autoPay = [...autoPay];
        } else if (type === "paperless") {
            let paperless = [...this.paperless];
            paperless.forEach((item) => {
                if (item.Id === adderId) {
                    item.isChecked = true;
                } else {
                    item.isChecked = false;
                }
            });
            this.paperless = [...paperless];
        } else if (type === "rewards") {
            let rewards = [...this.rewards];
            rewards.forEach((item) => {
                if (item.Id === adderId) {
                    item.isChecked = event.target.checked;
                }
                if ((adderId === "2339" && item.Id === "2342") || (adderId === "2342" && item.Id === "2339")) {
                    item.isDisabled = !item.isDisabled;
                }
            });
            this.rewards = [...rewards];
        } else if (type === "others") {
            if (
                this.hasInternetAndMilitary &&
                (adderId === MILITARY_ACTIVATION_FEE_ID || adderId === INTERNET_ACTIVATION_FEE_ID)
            ) {
                this.militaryActivationFeeChecked = adderId === MILITARY_ACTIVATION_FEE_ID && event.target.checked;
                this.internetActivationFeeChecked = adderId === INTERNET_ACTIVATION_FEE_ID && event.target.checked;
            }
            let others = [...this.others];
            others.forEach((item) => {
                if (item.Id === adderId) {
                    item.isChecked = event.target.checked;
                }
            });
            this.others = [...others];
        } else if (type === "phone") {
            let phone = [...this.phone];
            phone.forEach((item) => {
                if (item.Id === adderId) {
                    item.isChecked = event.target.checked;
                }
            });
            this.phone = [...phone];
        } else if (type === "fees") {
            let fees = [...this.fees];
            fees.forEach((e) => {
                if (e.Id === adderId) {
                    e.isChecked = event.target.checked;
                }
            });
            this.fees = [...fees];
        }
        this.calculateCart();
    }

    handleConfirmAutoPay() {
        this.handleAutoPaySelection(AUTOPAY_ENROLLMENT_ID);
    }
    hideAutoPaySurchargeDisclaimer() {
        this.handleAutoPaySelection(DECLINED_AUTOPAY_ENROLLMENT_ID);
    }

    handleAutoPaySelection(Id) {
        let autoPay = [...this.autoPay];
        autoPay.forEach((item) => {
            if (item.Id === Id) {
                item.isChecked = true;
                this.hasAutoPay = Id === AUTOPAY_ENROLLMENT_ID ? true : false;
            } else {
                item.isChecked = false;
            }
        });
        this.showAutoPaySurchargeDisclaimer = false;
        this.autoPay = [...autoPay];
        this.calculateCart();
    }

    handleRelatedCheckboxes(adderId, targetChecked) {
        const { checkedOnChange, relatedIds } = RELATED_CHECKBOX_FIELDS[adderId];
        relatedIds.forEach((id) => {
            const relatedCheckbox = this.template.querySelector(`[data-id="${id}"]`);
            if (!relatedCheckbox) return;

            const checkRelated = targetChecked && !relatedCheckbox.checked && checkedOnChange;
            const unCheckRelated = !targetChecked && relatedCheckbox.checked && !checkedOnChange;
            if (checkRelated || unCheckRelated) {
                relatedCheckbox.click();
            }
        });
    }

    calculateCart() {
        let cart = { ...this.cart };
        let monthlyAddersArray = [
            ...this.installationAdders,
            ...this.extenders,
            ...this.rewards,
            ...this.autoPay,
            ...this.paperless,
            ...this.others,
            ...this.phone
        ];
        let monthlyCharges = [];
        let todayCharges = [];
        monthlyAddersArray.forEach((item) => {
            if (item.isChecked) {
                let newCharge = {
                    name: item.Name,
                    fee: Number(item.Price).toFixed(2),
                    discount: Number(item.Price) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "product"
                };
                if (item.Id === "2338") {
                    todayCharges.push(newCharge);
                } else {
                    monthlyCharges.push(newCharge);
                }
            }
        });
        this.fees.forEach((item) => {
            if (item.isChecked) {
                let newCharge = {
                    name: item.Name,
                    fee: Number(item.Price).toFixed(2),
                    discount: Number(item.Price) > 0.0 ? false : true,
                    hasDescription: false,
                    description: "",
                    type: "product"
                };
                todayCharges.push(newCharge);
            }
        });
        if (this.directoryUnlisted === true) {
            let newCharge = {
                name: "Directory Listing",
                fee: (5).toFixed(2),
                discount: false,
                hasDescription: false,
                description: "",
                type: "product"
            };
            todayCharges.push(newCharge);
        }
        cart.hasAdders = monthlyCharges.length > 0;
        cart.hasToday = todayCharges.length > 0;
        cart.addersCharges = [...monthlyCharges];
        cart.todayCharges = [...todayCharges];
        cart.addersTotal = 0.0;
        cart.todayTotal = 0.0;
        cart.addersCharges.forEach((item) => {
            cart.addersTotal = Number(Number(cart.addersTotal) + Number(item.fee)).toFixed(2);
        });
        cart.todayCharges.forEach((item) => {
            cart.todayTotal = Number(Number(cart.todayTotal) + Number(item.fee)).toFixed(2);
        });
        this.cart = { ...cart };
    }

    handleDescription(event) {
        event.preventDefault();
        if (this.showDisclaimer) {
            this.showDisclaimer = false;
        } else {
            let disclaimer = [];
            let item = {
                name: event.target.dataset.name,
                number: event.target.dataset.id,
                description: this.disclaimers.filter((item) => item.Name === event.target.dataset.id)[0].Disclaimer__c
            };
            item.description.replace("â", "'");
            disclaimer.push(item);
            this.disclaimer = [...disclaimer];
            this.showDisclaimer = true;
        }
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    checkForInternetAndMilitaryFee(event) {
        if (
            this.hasInternetAndMilitary &&
            this.internetActivationFeeChecked == undefined &&
            this.militaryActivationFeeChecked == undefined
        ) {
            let aux = [...this.others];
            aux.forEach((item) => {
                if (item.Id === MILITARY_ACTIVATION_FEE_ID) {
                    this.militaryActivationFeeChecked = item.isChecked;
                }
                if (item.Id === INTERNET_ACTIVATION_FEE_ID) {
                    this.internetActivationFeeChecked = item.isChecked;
                }
            });
        }
        let adderId = event.target.dataset.id;
        if (
            this.hasInternetAndMilitary &&
            (adderId === MILITARY_ACTIVATION_FEE_ID || adderId === INTERNET_ACTIVATION_FEE_ID)
        ) {
            if (
                (adderId === MILITARY_ACTIVATION_FEE_ID && this.internetActivationFeeChecked) ||
                (adderId === INTERNET_ACTIVATION_FEE_ID && this.militaryActivationFeeChecked)
            ) {
                event.preventDefault();
                const toast = new ShowToastEvent({
                    title: "Notice",
                    variant: "warning",
                    mode: "sticky",
                    message: this.labels.activation_militar_and_fee_labels
                });
                this.dispatchEvent(toast);
            }
        }
    }

    handleClick() {
        this.modalLabel = "Customer Accepts";
        let disclaimer = [];
        let allArrays = [
            ...this.installationAdders,
            ...this.extenders,
            ...this.rewards,
            ...this.autoPay,
            ...this.paperless,
            ...this.others,
            ...this.phone,
            ...this.fees
        ];
        allArrays.forEach((e) => {
            if (e.isChecked && e.disclaimerNumber !== undefined && e.disclaimerNumber !== null) {
                let item = {
                    name: e.Name,
                    number: e.Id,
                    description: this.disclaimers.filter((d) => d.Name === e.disclaimerNumber)[0].Disclaimer__c
                };
                item.description.replace("â", "'");
                disclaimer.push(item);
            }
        });
        if (this.hasAutoPay) {
            let autoPayDisclaimer = {
                name: "AutoPay Surcharge",
                description: this.labels.autoPaySurcharge
            };
            disclaimer.unshift(autoPayDisclaimer);
        }
        if (disclaimer.length > 0) {
            this.disclaimer = [...disclaimer];
        }
        this.handleNext();
    }

    termsHandler(event) {
        this.handleNext();
    }

    handleNext() {
        let info = {
            adderSelection: {
                installationAdders: [...this.installationAdders],
                extenders: [...this.extenders],
                rewards: [...this.rewards],
                autoPay: [...this.autoPay],
                paperless: [...this.paperless],
                others: [...this.others],
                phone: [...this.phone],
                fees: [...this.fees]
            },
            cart: { ...this.cart },
            applicableDisclaimers: this.disclaimer,
            hasAutoPay: this.hasAutoPay,
            portability: this.portability,
            skipInstallation: this.installationAdders.some((i) => i.type === "self" && i.isChecked)
        };
        if (this.portability) {
            let data = {
                PortinPhoneNumber: this.portablePhone,
                CurrentProvider: this.provider,
                CurrentAccount: this.account,
                CurrentPin: this.pin
            };
            info.portabilityData = { ...data };
        }
        const addersEvent = new CustomEvent("adderselection", {
            detail: info
        });
        this.dispatchEvent(addersEvent);
    }

    handlePortability(event) {
        if (event.target.name === "portability") {
            this.portability = event.target.checked;
        } else if (event.target.name === "portablePhone") {
            this.portablePhone =
                event.target.value && event.target.value.trim().length > 0 != ""
                    ? event.target.value.trim()
                    : undefined;
        } else if (event.target.name === "provider") {
            this.provider = event.target.value != "" ? event.target.value : undefined;
        } else if (event.target.name === "account") {
            this.account =
                event.target.value != "" && event.target.value.trim().length > 0
                    ? event.target.value.trim()
                    : undefined;
        } else if (event.target.name === "pin") {
            this.pin =
                event.target.value != "" && event.target.value.trim().length > 0
                    ? event.target.value.trim()
                    : undefined;
        }
        this.phoneValidation();
    }

    handleKSCreditOfferDecline() {
        this.handleKSCreditOfferResult((c) => c && c.checked);
    }

    handleKSCreditOfferAccept() {
        this.handleKSCreditOfferResult((c) => c && !c.checked);
    }

    handleKSCreditOfferResult(clickCheckboxPredicate) {
        const offerCheckbox = this.template.querySelector(`[data-id="${this.showKSCreditOfferId}"]`);

        if (clickCheckboxPredicate(offerCheckbox)) {
            offerCheckbox.click();
        }
        this.showKSCreditOfferModal = false;
    }

    phoneValidation() {
        let phonere = /^\d{10}$/;
        if (
            this.portability &&
            (this.account === undefined ||
                this.pin === undefined ||
                !phonere.test(this.portablePhone) ||
                this.portablePhone === undefined ||
                this.provider === undefined)
        ) {
            this.disableNext = true;
        } else {
            this.disableNext = false;
        }
    }
    get hasInternetAndMilitary() {
        const ids = this.others.map((obj) => obj.Id);
        return ids.includes(MILITARY_ACTIVATION_FEE_ID) && ids.includes(INTERNET_ACTIVATION_FEE_ID);
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

    handleLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "Adders"
        };
        this.dispatchEvent(event);
    }

    sbsHandler() {
        this.showSBS = true;
    }

    hideSBS() {
        this.showSBS = false;
    }
}