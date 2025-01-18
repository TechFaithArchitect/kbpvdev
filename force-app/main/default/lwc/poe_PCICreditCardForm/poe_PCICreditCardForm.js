import { LightningElement, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import getCreditCardTypes from "@salesforce/apex/checkoutTabController.getCreditCardTypes";
import getOpportunityProgram from "@salesforce/apex/POECCEncryptionService.getOpportunityProgram";
import encryptAndSaveCreditCardData from "@salesforce/apex/POECCEncryptionService.encryptAndSaveCreditCardData";
import logError from "@salesforce/apex/ErrorLogModel.logError";

export default class Poe_PCICreditCardForm extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference) pageRef;

    recordId;
    firstName;
    lastName;
    zip;
    cvv;
    ccNumber;
    ccName;
    year;
    month;
    type;
    autoPayFirstName;
    autoPayLastName;
    autoPayZip;
    autoPayCvv;
    autoPayCcNumber;
    autoPayCcName;
    autoPayYear;
    autoPayMonth;
    autoPayType;
    autoPay = true;
    opportunityProgram;
    ccTypes = [];
    years = [];
    months = [];
    additionalCard = false;
    noCompleteInformation = true;
    loaderSpinner = false;

    get showAutoPayInfo() {
        return this.opportunityProgram === "DIRECTV";
    }

    get showCardNameField() {
        return (
            this.opportunityProgram === "FRONTIER" ||
            this.opportunityProgram === "DIRECTV" ||
            this.opportunityProgram === "DIRECTV STREAM"
        );
    }

    get showAdditionalCard() {
        return !this.additionalCard && this.showAutoPayInfo && this.autoPay;
    }

    get initialCCTitle() {
        return this.showAdditionalCard ? "Upfront Payment Information" : "Payment Information";
    }

    connectedCallback() {
        this.loaderSpinner = true;
        this.recordId = this.pageRef.state?.c__ContextId;
        let buyflowType = this.pageRef.state?.buyflowType || "other";
        this.initializeDateFields();
        let myData = {
            contextId: this.recordId
        };
        getCreditCardTypes({ myData: myData })
            .then((response) => {
                let initialCC = [];
                let ccs = response.result.Credit_Card_Types__mdt;
                ccs.forEach((cc) => {
                    let credit = {
                        label: cc.Label,
                        value: cc.Label
                    };
                    initialCC.push(credit);
                });
                this.ccTypes = [...initialCC];
                if (buyflowType === "dtvStream") {
                    this.opportunityProgram = "DIRECTV STREAM";
                    this.loaderSpinner = false;
                } else {
                    getOpportunityProgram({ myData: myData })
                        .then((oppResponse) => {
                            this.opportunityProgram = String(oppResponse?.result?.program).toUpperCase();
                            this.loaderSpinner = false;
                        })
                        .catch((error) => {
                            console.error(error, "ERROR");
                            this.loaderSpinner = false;
                            this.handleLogError(error);
                        });
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                this.handleLogError(error);
            });
    }

    initializeDateFields() {
        let year = new Date().getFullYear();
        for (let i = 0; i < 15; i++) {
            let exp = {
                label: year.toString(),
                value: year.toString()
            };
            this.years.push(exp);
            year = year + 1;
        }
        let month = 0;
        for (let i = 0; i < 12; i++) {
            month = month + 1;
            let m = {
                label: month.toString(),
                value: month.toString()
            };
            this.months.push(m);
        }
    }

    handleChange(event) {
        switch (event.target.name) {
            case "ccName":
            case "firstName":
            case "lastName":
            case "type":
            case "month":
            case "year":
            case "zip":
            case "autoPayCcName":
            case "autoPayFirstName":
            case "autoPayLastName":
            case "autoPayType":
            case "autoPayMonth":
            case "autoPayYear":
            case "autoPayZip":
            case "autoPayCvv":
            case "cvv":
            case "autoPayCcNumber":
            case "ccNumber":
                this[event.target.name] = event.target.value !== "" ? event.target.value : undefined;
                break;
            case "additionalCard":
            case "autoPay":
                this[event.target.name] = event.target.checked;
                break;
        }

        this.disableValidations();
    }

    disableValidations() {
        let ccvPattern = /^[0-9]{3,4}$/;
        let ccPattern = /^[0-9]{13,19}$/;

        const nameOnCardValidation = this.showCardNameField
            ? this.showAdditionalCard
                ? !!this.autoPayCcName && !!this.ccName
                : !!this.ccName
            : true;

        const upfrontCardValidation =
            !!this.firstName &&
            !!this.lastName &&
            !!this.type &&
            !!this.month &&
            !!this.year &&
            !!this.cvv &&
            !!this.ccNumber &&
            !!this.zip &&
            !!ccvPattern.test(this.cvv) &&
            !!ccPattern.test(this.ccNumber);

        const additionalCardValidation = this.showAdditionalCard
            ? !!this.autoPayFirstName &&
              !!this.autoPayLastName &&
              !!this.autoPayType &&
              !!this.autoPayMonth &&
              !!this.autoPayYear &&
              !!this.autoPayCvv &&
              !!this.autoPayCcNumber &&
              !!this.autoPayZip &&
              !!ccvPattern.test(this.autoPayCvv) &&
              !!ccPattern.test(this.autoPayCcNumber)
            : true;

        if (upfrontCardValidation && nameOnCardValidation && additionalCardValidation) {
            this.noCompleteInformation = false;
        } else {
            this.noCompleteInformation = true;
        }
    }

    isValidCreditCard(expirationMonth, expirationYear) {
        const expMonth = parseInt(expirationMonth, 10);
        const expYear = parseInt(expirationYear, 10);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            return false;
        }
        return true;
    }

    handleClick() {
        this.loaderSpinner = true;
        let validUpfrontCard = this.isValidCreditCard(this.month, this.year);
        let validAutoPayCard = this.showAdditionalCard
            ? this.isValidCreditCard(this.autoPayMonth, this.autoPayYear)
            : true;

        const validCards = validUpfrontCard && validAutoPayCard;

        if (!validCards) {
            let errorMessage = "Credit Card has expired, enter a valid Credit Card";
            if (!validUpfrontCard) {
                this.month = undefined;
                this.year = undefined;
            }
            if (!validAutoPayCard) {
                this.autoPayMonth = undefined;
                this.autoPayYear = undefined;
            }
            this.loaderSpinner = false;

            const event = new ShowToastEvent({
                title: "Credit Card expired",
                variant: "error",
                mode: "sticky",
                message: errorMessage
            });
            this.disableValidations();
            this.dispatchEvent(event);
        } else {
            let myData = {
                opportunityId: this.recordId,
                creditCardData: {
                    upFront: {
                        ccNumber: this.ccNumber,
                        firstName: this.firstName,
                        lastName: this.lastName,
                        ccMonth: this.month,
                        ccYear: this.year,
                        ccv: this.cvv,
                        cardholderName: this.ccName || "",
                        zipCode: this.zip,
                        type: this.type
                    },
                    hasAutoPay: this.autoPay && this.showAutoPayInfo,
                    useSameCardAsAutoPay: this.autoPay && !this.showAdditionalCard,
                    autoPay: {}
                }
            };

            if (this.showAdditionalCard) {
                myData.creditCardData.autoPay = {
                    ccNumber: this.autoPayCcNumber,
                    firstName: this.autoPayFirstName,
                    lastName: this.autoPayLastName,
                    ccMonth: this.autoPayMonth,
                    ccYear: this.autoPayYear,
                    ccv: this.autoPayCvv,
                    cardholderName: this.autoPayCcName || "",
                    zipCode: this.autoPayZip,
                    type: this.autoPayType
                };
            }
            encryptAndSaveCreditCardData({ myData: myData })
                .then((response) => {
                    console.log("encryptAndSaveCreditCardData success", response);
                    this[NavigationMixin.Navigate]({
                        type: "comm__namedPage",
                        attributes: {
                            name: "SuccessMessage__c"
                        }
                    });
                    this.loaderSpinner = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.handleLogError(error);
                    console.error(error, "ERROR");
                    this.loaderSpinner = false;
                });
        }
    }

    handleLogError(error) {
        let detail = {
            type: "Internal Error",
            provider: this.opportunityProgram,
            tab: "PCI Credit Card Form",
            component: "Poe_PCICreditCardForm",
            error: JSON.stringify(error),
            opportunity: this.recordId
        };
        logError({ error: detail })
            .then(() => {
                console.log("Error logged");
            })
            .catch((err) => {
                console.error(`LOGGING ERROR: ${err.body?.message || err.stack}`);
            });
    }
}