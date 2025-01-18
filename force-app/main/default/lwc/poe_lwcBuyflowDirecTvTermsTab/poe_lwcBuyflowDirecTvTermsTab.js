import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";

export default class Poe_lwcBuyflowDirecTvTermsTab extends NavigationMixin(LightningElement) {
    @api title = "Terms, Conditions, and/or Disclosures";
    @api referenceNumber;
    @api logo;
    @api recordId;
    @api hardwareSelectedRequest;
    @api offersSelected = [];
    @api orderInfo = [];
    @api cartInfo;
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
        savingCharges: []
    };
    terms = [];
    orderQualReq = {};
    todaysCharges = {};
    agreementPrivacyPolicy = false;
    agreementDisclosures = false;
    agreementAutomaticPayments = false;
    agreementNationalOffers = false;
    agreementPremiumOffers = false;
    agreementElectronicDelivery = false;
    agreementRightToCancel = false;
    showNationalOffersTermModal = false;
    showPremiumOffersTermModal = false;
    showRightToCancelTermModal = false;
    showTermsSignatureModal = false;
    showCollateral = false;
    showLoaderSpinner = false;
    showSignatureOption = false;
    showSecureData = false;
    disableSendSecureDataButton = false;
    showSendRiaTcModal = false;
    @api orderType = "NLLS";
    @api termsSignatureText = "By signing you are consenting to the DIRECTV Terms and Conditions.";
    signatureName;
    signatureAddress;
    futureCharges = {};
    futureDate;
    modalHeader = "Notice of Cancellation";
    modalBodyEnglish = `<p><strong>NOTICE OF RIGHT TO CANCEL</strong></p> You, the buyer, may cancel this transaction at any time prior to midnight of the third business day after the date of this transaction. See the Notice of Cancellation provisions below for an explanation of this right. <p><strong>NOTICE OF CANCELLATION</strong></p> You may CANCEL this transaction, without any Penalty or Obligation, within THREE BUSINESS DAYS from the above date. If you cancel, any property traded in, any payments made by you under the contract or sale, and any negotiable instrument executed by you will be returned within TEN DAYS following receipt by the seller of your cancellation notice, and any security interest arising out of the transaction will be cancelled. If you cancel, you must make available to the seller at your residence, in substantially as good condition as when received, any goods delivered to you under this contract or sale, or you may, if you wish, comply with the instructions of the seller regarding the return shipment of the goods at the seller’s expense and risk. You may return the equipment by shipment Through an authorized FedEx Office Print & Shop Center. See https://fedex.com or call FedEx: (800) 789-4623 for the nearest location. If you do make the goods available to the seller and the seller does not pick them up within 20 days of the date of your notice of cancellation, you may retain or dispose of the goods without any further obligation. If you fail to make the goods available to the seller, or if you agree to return the goods to the seller and fail to do so, then you remain liable for performance of all obligations under the contract*. To cancel this transaction, mail or deliver a signed and dated copy of this cancellation notice or any other written notice, or send a telegram** to the DIRECTV Return Address below NOT LATER THAN MIDNIGHT ON `;
    modalBodySpanish = `<p><strong>AVISO DE CANCELACION</strong></p>
    Usted puede CANCELAR esta transacción, sin Penalización u Obligación, dentro de los TRES DÍAS HÁBILES a partir de la fecha anterior. Si cancela, cualquier propiedad negociada, cualquier pago realizado por usted en virtud del contrato o la venta, y cualquier instrumento negociable ejecutado por usted será devuelto dentro de DIEZ DÍAS posteriores a la recepción por parte del vendedor de su aviso de cancelación, y cualquier derecho de garantía que surja de la transacción será cancelada. Si cancela, debe poner a disposición del vendedor en su residencia, sustancialmente en las mismas buenas condiciones que cuando las recibió, cualquier bien que se le entregue en virtud de este contrato o venta, o puede, si lo desea, cumplir con las instrucciones del vendedor.
    sobre el envío de devolución de la mercancía por cuenta y riesgo del vendedor. Puede devolver el equipo por envío a través de un Centro de impresión y compras de FedEx Office autorizado. Visite https://fedex.com  o llame a FedEx: (800) 789-4623 para conocer la ubicación más cercana. Si pone los bienes a disposición del vendedor y el vendedor no los recoge dentro de los 20 días posteriores a la fecha de su notificación de cancelación, puede retener o disponer de los bienes sin ninguna otra obligación. Si no pone los bienes a disposición del vendedor, o si acepta devolver los bienes al vendedor y no lo hace, seguirá siendo responsable del cumplimiento de todas las obligaciones en virtud del contrato*. Para cancelar esta transacción, envíe por correo o entregue una copia firmada y fechada de este aviso de cancelación o cualquier otro aviso por escrito, o envíe un telegrama** a la
    dirección de devolución de DIRECTV a continuación NO MÁS TARDE DE LA MEDIANOCHE DEL `;
    phoneSalesInstructions = "Please read the following Terms and Conditions to The Customer:";
    nonPhoneSalesInstructions = "Please read the following Terms and Conditions:";
    termsAndConditionsInstructions = "";
    phoneSalesCheckboxAgreementMessage = "I have read the above disclosures to the customer, and the customer agreed.";
    nonPhoneSalesCheckboxAgreementMessage = "I have read and agreed to the Terms & Conditions.";
    checkboxAgreementMessage = "";
    modalBody;
    showModal = false;
    signatureProvided = false;
    termsAgreement = false;
    signatureCount = 0;
    showErrorMessage = false;
    errorMessage = "";
    noSignatureAndTerms = false;

    connectedCallback() {
        this.futureDate = this.formattedFutureDate();
        this.modalBody = this.modalBodyEnglish + this.futureDate + "." + this.modalBodySpanish + this.futureDate + ".";
        this.signatureName = `${this.orderInfo.customer.firstName} ${this.orderInfo.customer.lastName}`;
        this.signatureAddress = `${this.orderInfo.account.shippingAddress.addressLine1} ${this.orderInfo.account.shippingAddress.addressLine2} ${this.orderInfo.account.shippingAddress.city} ${this.orderInfo.account.shippingAddress.state}, ${this.orderInfo.account.shippingAddress.zipCode}`;
        let myData = { ...this.orderInfo };
        myData.tab = "orderQual";
        myData.componentCustomizations = [...this.hardwareSelectedRequest, ...this.offersSelected];
        console.log(myData.componentCustomizations);
        this.orderQualReq = myData;
        console.log(this.orderQualReq);
        this.showSignatureOption = this.origin == "maps" || this.origin == "event";
        this.showSignatureOption ? this.noSignatureAndTermsValidation() : undefined;
        if (this.origin == "phonesales") {
            this.termsAndConditionsInstructions = this.phoneSalesInstructions;
            this.checkboxAgreementMessage = this.phoneSalesCheckboxAgreementMessage;
        } else {
            this.termsAndConditionsInstructions = this.nonPhoneSalesInstructions;
            this.checkboxAgreementMessage = this.nonPhoneSalesCheckboxAgreementMessage;
        }
        this.showLoaderSpinner = true;
        this._actionUtil = new OmniscriptActionCommonUtil();
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
                let errorMessage;
                if (
                    response.result.IPResult.hasOwnProperty("result") &&
                    response.result.IPResult.result.hasOwnProperty("error") &&
                    response.result.IPResult.result.error.hasOwnProperty("provider") &&
                    response.result.IPResult.result.error.provider.hasOwnProperty("message")
                ) {
                    errorMessage = response.result.IPResult.result.error.provider.message.message;
                } else if (
                    response.result.IPResult.hasOwnProperty("result") &&
                    response.result.IPResult.result.hasOwnProperty("error") &&
                    response.result.IPResult.result.error.hasOwnProperty("message")
                ) {
                    errorMessage = response.result.IPResult.result.error.message;
                } else if (response.result.IPResult.hasOwnProperty("error")) {
                    errorMessage = response.result.IPResult.error;
                }
                if (errorMessage !== undefined) {
                    this.showSignatureOption = false;
                    this.showErrorMessage = true;
                    this.errorMessage = errorMessage;
                    this.showLoaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                } else {
                    this.terms = response.result.IPResult.components[0].component.terms;
                    this.terms.forEach((e) => {
                        e.value = false;
                        if (e.id === "ATV-Term21" || e.id === "ATV-Term22") {
                            e.isFromRIA = true;
                            this.showSecureData = true;
                        } else {
                            e.isFromRIA = false;
                        }
                    });
                    console.log(this.terms);
                    this.todaysCharges = response.result.IPResult.components[0].component.todaysCharges;
                    let cart = { ...this.cartInfo };
                    let monthlyCharges = [...JSON.parse(JSON.stringify(cart.monthlyCharges))];
                    monthlyCharges.forEach((charge) => {
                        if (charge.name === "Estimated Government Fees & Taxes") {
                            charge.fee = Number(
                                response.result.IPResult.components[0].component.monthlyCharges.dtvGovFeesAmount
                            ).toFixed(2);
                        } else if (charge.name === "Estimated DIRECTV Fees & Surcharges") {
                            charge.fee = Number(
                                response.result.IPResult.components[0].component.monthlyCharges.dtvAttFeesAmount
                            ).toFixed(2);
                        }
                    });
                    cart.monthlyCharges = [...monthlyCharges];
                    cart.monthlyTotal = 0;
                    cart.monthlyCharges.forEach((charge) => {
                        cart.monthlyTotal = Number(cart.monthlyTotal) + Number(charge.fee);
                    });
                    cart.monthlyTotal = Number(cart.monthlyTotal).toFixed(2);
                    this.cart = { ...cart };
                    if (response.result.IPResult.components[0].component.hasOwnProperty("futureBills")) {
                        this.futureCharges = {
                            ...response.result.IPResult.components[0].component.futureBills
                        };
                    }
                    this.showLoaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.showLoaderSpinner = false;
            });
    }

    formattedFutureDate() {
        const today = new Date();
        const future = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
        const month = future.getMonth() + 1;
        const day = future.getDate();
        const year = future.getFullYear();
        const futureDate = `${month}/${day}/${year}`;
        return futureDate;
    }

    signatureConfirmation(e) {
        if (e.detail == "saved") {
            this.signatureProvided = true;
            this.signatureCount = this.signatureCount + 1;
        } else if (this.signatureCount == 0) {
            this.signatureProvided = false;
        }
        this.noSignatureAndTermsValidation();
        this.hideSignatureModal();
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

    handleAgreement() {
        this.termsAgreement = !this.termsAgreement;
        this.showSignatureOption ? this.noSignatureAndTermsValidation() : undefined;
    }

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    hideModal(e) {
        this.showSendRiaTcModal = false;
        this.showSignatureOption ? this.noSignatureAndTermsValidation() : undefined;
    }

    openTermsSignatureModal() {
        this.showTermsSignatureModal = true;
    }

    hideSignatureModal() {
        this.showTermsSignatureModal = false;
    }

    openSendRiaTcModal() {
        this.showSendRiaTcModal = true;
    }

    handleCheckbox(e) {
        const selectedTermIndex = this.terms.findIndex((element) => element.id === e.currentTarget.dataset.id);
        this.terms[selectedTermIndex].value = e.currentTarget.checked;
        this.showSignatureOption ? this.noSignatureAndTermsValidation() : undefined;
    }

    handleClick() {
        if (this.terms.every((element) => element.value === true) && this.terms.length > 0) {
            const event = new ShowToastEvent({
                title: "Success",
                variant: "success",
                message: "Your information has been saved!"
            });
            this.dispatchEvent(event);
            const sendTermsNextEvent = new CustomEvent("termsnext", {
                detail: {
                    orderQualReq: this.orderQualReq,
                    todaysCharges: this.todaysCharges,
                    cart: this.cart,
                    futureCharges: this.futureCharges
                }
            });
            this.dispatchEvent(sendTermsNextEvent);
        } else {
            const event = new ShowToastEvent({
                title: "Error",
                variant: "error",
                mode: "sticky",
                message: "Please check for items not agreed to."
            });
            this.dispatchEvent(event);
        }
    }

    sendRiaTc() {
        let myData = { ...this.orderInfo };
        myData.tab = "sendRIATC";
        this.showLoaderSpinner = true;
        this._actionUtil = new OmniscriptActionCommonUtil();
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_ProviderCallouts",
            options: JSON.stringify(options)
        };
        console.log(myData);
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                if (response.result.IPResult.response.status === "Success") {
                    const event = new ShowToastEvent({
                        title: response.result.IPResult.response.status,
                        variant: "success",
                        message: response.result.IPResult.response.message.replace("<br />", " ")
                    });
                    this.dispatchEvent(event);
                    this.disableSendSecureDataButton = true;
                    this.showSendRiaTcModal = false;
                    this.showLoaderSpinner = false;
                } else {
                    const event = new ShowToastEvent({
                        title: response.result.IPResult.response.status,
                        variant: "warning",
                        mode: "sticky",
                        message: response.result.IPResult.response.message
                    });
                    this.dispatchEvent(event);
                    this.disableSendSecureDataButton = true;
                    this.showSendRiaTcModal = false;
                    this.showLoaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: response.result.IPResult.response.status,
                    variant: "error",
                    mode: "sticky",
                    message: response.result.IPResult.response.message
                });
                this.dispatchEvent(event);
                this.showSendRiaTcModal = false;
                this.showLoaderSpinner = false;
            });
    }

    openModal() {
        this.showModal = true;
    }

    hideModal() {
        this.showModal = false;
    }

    checkRiaTc() {
        let myData = { ...this.orderInfo };
        myData.tab = "checkRIATC";
        this.showLoaderSpinner = true;
        this._actionUtil = new OmniscriptActionCommonUtil();
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_ProviderCallouts",
            options: JSON.stringify(options)
        };
        console.log(myData);
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                if (response.result.IPResult.response.status === "Pending") {
                    const event = new ShowToastEvent({
                        title: response.result.IPResult.response.status,
                        variant: "warning",
                        mode: "sticky",
                        message: response.result.IPResult.response.message
                    });
                    this.dispatchEvent(event);
                    this.showLoaderSpinner = false;
                } else if (response.result.IPResult.response.status === "Complete") {
                    this.terms.forEach((e) => {
                        if (e.id === "ATV-Term21" || e.id === "ATV-Term22") {
                            e.value = true;
                        }
                    });
                    console.log(this.terms);
                    const event = new ShowToastEvent({
                        title: response.result.IPResult.response.status,
                        variant: "success",
                        message: response.result.IPResult.response.message
                    });
                    this.dispatchEvent(event);
                    this.showLoaderSpinner = false;
                } else {
                    const event = new ShowToastEvent({
                        title: response.result.IPResult.response.status,
                        variant: "warning",
                        mode: "sticky",
                        message: response.result.IPResult.response.message
                    });
                    this.dispatchEvent(event);
                    this.showLoaderSpinner = false;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: response.result.IPResult.response.status,
                    variant: "error",
                    mode: "sticky",
                    message: response.result.IPResult.response.message
                });
                this.dispatchEvent(event);
                this.showLoaderSpinner = false;
            });
    }

    get signatureLabel() {
        let label =
            this.signatureProvided && this.signatureCount != 0
                ? "Click here to Update Signature"
                : "Click here to Sign";
        return label;
    }

    noSignatureAndTermsValidation() {
        if (
            this.signatureProvided &&
            this.termsAgreement &&
            this.terms.every((element) => element.value === true) &&
            this.terms.length > 0
        ) {
            this.noSignatureAndTerms = false;
            return;
        } else this.noSignatureAndTerms = true;
        return;
    }
}