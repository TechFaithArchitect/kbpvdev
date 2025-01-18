import { LightningElement, api } from "lwc";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import ToastContainer from "lightning/toastContainer";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import saveConfigurationsDTV from "@salesforce/apex/OrderConfirmationTabController.saveConfigurations";
import saveCart from "@salesforce/apex/OrderConfirmationTabController.saveCart";
import sendElectronicSummary from "@salesforce/apex/OrderConfirmationTabController.sendElectronicSummary";
import saveOpportunityStage from "@salesforce/apex/InfoTabController.saveOpportunityStage";
import setClickerCallCenterTrack from "@salesforce/apex/InfoTabController.setClickerCallCenterTrack";
import setClickerEventTrack from "@salesforce/apex/InfoTabController.setClickerEventTrack";
import setClickerRetailTrack from "@salesforce/apex/InfoTabController.setClickerRetailTrack";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import poe_lwcSelfServiceLoadingModal from "c/poe_lwcSelfServiceLoadingModal";
import poe_lwcSelfServiceDirecTvOrderSummaryModal from "c/poe_lwcSelfServiceDirecTvOrderSummaryModal";
import DTVPaymentErrorTitle from "@salesforce/label/c.DTV_OrderSubmit_Payment_Error_Title";
import DTVPaymentErrorBody from "@salesforce/label/c.DTV_OrderSubmit_Payment_Error_Body";
import paymentErrorCodes from "@salesforce/label/c.Enga_Payment_Error_Codes";

export default class Poe_lwcSelfServiceDirecTvBeamOrderConfirmationTab extends LightningElement {
    @api clientInfo;
    @api orderInfo;
    @api origin;
    @api cartInfo;
    @api recordId;
    @api productSelected;
    @api hardwareSelected;
    @api userId;
    @api stream;
    @api installationInfo;
    @api sfOrderId;
    @api orderItemId;
    @api nffl;
    @api paymentInfo;
    @api returnUrl;
    @api isGuestUrl;
    @api isGuestUser;
    @api logo;
    @api isFSL;
    @api fslWorkOrderId;
    @api fslServiceAppointmentId;

    showCollateral;
    signatureName;
    signatureAddress;
    confirmedDate;
    serviceType;
    showSummarySignatureModal = false;
    loaderSpinner;
    orderSuccess;
    orderFailed;
    orderInProgress;
    accountNumber;
    confirmationNumber;
    orderId;
    transactionId;
    noCompleteInfo = true;
    submittedOrderKey;
    summaryOrderInfo;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        DTVPaymentErrorTitle,
        DTVPaymentErrorBody,
        paymentErrorCodes
    };
    showSelfServiceCancelModal = false;
    showModalSendingOrderClosed = false;
    omsOrderId;
    paymentErrorCodes = [];
    showPrevious = false;

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get orderConfirmationCardVerbiage() {
        let title = "",
            subtitle = "";
        if (this.orderSuccess) {
            title = "Your order has been successfully submitted!";
        } else if (this.orderFailed) {
            title = "The order could not be confirmed.";
            subtitle = "Please resend the order.";
        } else if (this.orderInProgress) {
            if (this.isGuestUser) {
                title = "You need to manually check the status using the Refresh button";
            } else {
                title = "Please wait while your order is being processed.";
                subtitle = "This may take a few minutes.";
            }
        }

        return {
            title,
            subtitle
        };
    }

    get refreshButtonLabel() {
        return this.orderFailed ? "Resend" : "Refresh";
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get iconCheckGreen() {
        return chuzoSiteResources + "/images/icon-check.svg";
    }

    get desktopNextBtnClass() {
        return `${this.noCompleteInfo ? "btn-disabled" : ""} btn-rounded btn-center hide-mobile`;
    }

    get mobileNextBtnClass() {
        return `${this.noCompleteInfo ? "btn-disabled" : ""} btn-rounded btn-center`;
    }

    get customerName() {
        return `${this.clientInfo.contactInfo.firstName} ${this.clientInfo.contactInfo.lastName}`;
    }

    get addressText() {
        const { addressLine1, addressLine2, city, state, zipCode } = this.orderInfo.address;
        return `${addressLine1} ${addressLine2 || ""} ${city} ${state}, ${zipCode}`;
    }

    get orderNumber() {
        return this.cartInfo?.orderNumber || this.orderInfo?.beam?.orderNumber;
    }

    get showRefreshButton() {
        return this.isNotGuestUser || this.orderFailed;
    }

    handleViewOrderSummary() {
        poe_lwcSelfServiceDirecTvOrderSummaryModal
            .open({
                stream: this.stream,
                orderInfo: this.summaryOrderInfo,
                origin: this.origin,
                paymentInfo: this.paymentInfo,
                productSelected: this.orderInfo.product.Name,
                hardwareSelected: this.hardwareSelected,
                recordId: this.recordId,
                confirmedDate: this.confirmedDate
                // onclosesummary={hideSummaryModal}
                // onshowsummarysignaturemodal={showSignatureModal}
                // onback={handleBack}
            })
            .then(() => {});
    }

    showSignatureModal(e) {
        this.hideSummaryModal();
        this.showSummarySignatureModal = true;
    }

    hideSignatureModal(e) {
        this.showSummarySignatureModal = false;
    }

    submitOrder() {
        this.loaderSpinner = true;
        let calloutInformation = {
            path: "submitOrder",
            partnerName: "enga",
            dealerCorpId: this.orderInfo.dealerCorpId,
            dealerId: this.orderInfo.dealerId,
            dealerAgentId: this.orderInfo.dealerAgentId,
            dealerLocation: this.orderInfo.dealerLocation,
            uuid: this.orderInfo.uuid,
            sid: this.orderInfo.sid,
            ack: true,
            orderMod: false,
            submitorder: {
                partnerReferenceOrderID: `PV${this.orderNumber}`
            },
            ...this.orderInfo
        };
        console.log("Submit Order Request", calloutInformation);

        callEndpoint({ inputMap: calloutInformation })
            .then((response) => {
                const result = JSON.parse(response);
                console.log("Submit Order Response", result);
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
                    this.orderFailed = true;
                    this.loaderSpinner = false;
                } else {
                    this.orderFailed = false;
                    this.orderInProgress = true;
                    this.submittedOrderKey = result.key;
                    this.loaderSpinner = false;
                    this.checkSubmitOrder();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message:
                        "The request could not be made correctly to the server. Please, validate the information and try again."
                });
                this.dispatchEvent(event);
                this.orderFailed = true;
                this.loaderSpinner = false;
            });
    }

    checkSubmitOrder() {
        const path = "submitOrder";
        const checkOrderCallout = {
            path,
            partnerName: "enga",
            dealerCorpId: this.orderInfo.dealerCorpId,
            dealerId: this.orderInfo.dealerId,
            dealerAgentId: this.orderInfo.dealerAgentId,
            dealerLocation: this.orderInfo.dealerLocation,
            uuid: this.orderInfo.uuid,
            sid: this.orderInfo.sid,
            ack: true,
            orderMod: false,
            callback: {
                key: this.submittedOrderKey
            },
            ...this.orderInfo,
            submitorder: {
                partnerReferenceOrderID: `PV${this.orderNumber}`
            }
        };

        this.showModalSendingOrder(checkOrderCallout);
    }

    getOrdersHandler(isNext = false) {
        this.loaderSpinner = true;
        const path = "orders";
        let getOrderData = {
            path,
            partnerName: "enga",
            systemCode: this.orderInfo.NFFL ? "ENGA-CHUZO-NFF" : "ENGA-CHUZO",
            dealerCorpId: this.orderInfo.dealerCorpId,
            dealerId: this.orderInfo.dealerId,
            dealerAgentId: this.orderInfo.dealerAgentId,
            dealerLocation: this.orderInfo.dealerLocation,
            preBuiltCart: false,
            orderId: Number(this.omsOrderId),
            ...this.orderInfo
        };
        console.log("Get Order Request", getOrderData);
        let apiResponse;

        callEndpoint({ inputMap: getOrderData })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Get Order Response", result);
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
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, getOrderData, path, "API Error");
                } else {
                    this.accountNumber =
                        result.orderIdentifier.billingAccountNumber !== ""
                            ? result.orderIdentifier.billingAccountNumber
                            : result.orderIdentifier.originatorCustomerId;
                    this.orderId = result.orderIdentifier.originatorOrderId;
                    this.confirmationNumber = result.orderIdentifier.billingSystemOrderId;
                    if (isNext) {
                        this.handleNext();
                    }
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
                    this.logError(
                        `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                        getOrderData,
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

    handleRefresh() {
        if (this.orderFailed) {
            this.submitOrder();
        } else {
            this.checkSubmitOrder();
        }
    }

    saveTracker(info) {
        const trackerData = {
            userId: this.userId,
            operation: "setTrack",
            isCount: true,
            action: "Buyflow Completed"
        };

        let setClickerTrack;
        switch (this.origin) {
            case "retail":
                setClickerTrack = setClickerRetailTrack;
                break;
            case "event":
                setClickerTrack = setClickerEventTrack;
                break;
            case "phonesales":
                setClickerTrack = setClickerCallCenterTrack;
                break;
            default:
                this.origin === "maps" ? this.sendElectronicOrderSummary() : undefined;
                const sendCartNextEvent = new CustomEvent("confirmationnext", {
                    detail: info
                });
                this.dispatchEvent(sendCartNextEvent);
                this.loaderSpinner = false;
                return;
        }

        setClickerTrack({ myData: trackerData })
            .then((response) => {
                const sendCartNextEvent = new CustomEvent("confirmationnext", {
                    detail: info
                });

                if (this.origin === "event") {
                    this.sendElectronicOrderSummary();
                }

                this.dispatchEvent(sendCartNextEvent);
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The order could not be activated. Please verify the information"
                });

                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    saveConfigurations(info) {
        let cart = { ...this.cartInfo };
        let configurations = [];
        let todayArray = [];
        let firstArray = [];
        let monthlyArray = [];
        let savingsArray = [];
        if (cart.hasToday) {
            todayArray = JSON.parse(JSON.stringify(cart.todayCharges));
            todayArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: item.fee,
                    type: "Today"
                };
                configurations.push(config);
            });
        }
        if (cart.hasFirstBill) {
            firstArray = JSON.parse(JSON.stringify(cart.firstBillCharges));
            firstArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: item.fee,
                    type: "First Bill"
                };
                configurations.push(config);
            });
        }
        if (cart.hasMonthly) {
            monthlyArray = JSON.parse(JSON.stringify(cart.monthlyCharges));
            monthlyArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: item.fee,
                    type: "Monthly"
                };
                configurations.push(config);
            });
        }
        if (cart.hasSavings) {
            savingsArray = JSON.parse(JSON.stringify(cart.savingCharges));
            savingsArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: "",
                    type: "Promotion"
                };
                configurations.push(config);
            });
        }
        let myData = {
            orderId: this.sfOrderId,
            Configurations: configurations
        };

        saveConfigurationsDTV({ myData })
            .then((response) => {
                console.log(response);
                this.saveTracker(info);
            })
            .catch((error) => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The order configurations could not be saved. Please verify the information"
                });
                console.log(error);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        this.paymentErrorCodes = [...this.labels.paymentErrorCodes.split(",")];
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        let today = new Date();
        let date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        this.confirmedDate = date + " " + time;
        this.signatureName = `${this.clientInfo.contactInfo.firstName} ${this.clientInfo.contactInfo.lastName}`;
        this.signatureAddress = `${this.orderInfo.address.addressLine1} ${this.orderInfo.address.city} ${this.orderInfo.address.state}, ${this.orderInfo.address.zipCode}`;
        this.serviceType = this.orderInfo.productType === "atv" ? "DIRECTV Via Internet" : "DIRECTV";
        this.summaryOrderInfo = {
            customer: {
                firstName: this.clientInfo.contactInfo.firstName,
                lastName: this.clientInfo.contactInfo.lastName,
                phoneNumber: this.clientInfo.contactInfo.phone,
                emailAddress: this.clientInfo.contactInfo.email
            },
            partnerOrderNumber: this.orderNumber,
            account: {
                shippingAddress: {
                    addressLine1: this.orderInfo.address.addressLine1,
                    addressLine2: this.orderInfo.address.addressLine2,
                    city: this.orderInfo.address.city,
                    state: this.orderInfo.address.state,
                    zipCode: this.orderInfo.address.zipCode
                }
            }
        };
        this.submitOrder();
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

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    sendElectronicOrderSummary() {
        let futureDate = this.formattedFutureDate();
        let customerName = this.clientInfo.contactInfo.firstName + " " + this.clientInfo.contactInfo.lastName;
        this.loaderSpinner = true;
        let myData = {
            email: this.clientInfo.contactInfo.email,
            orderDate: this.confirmedDate,
            customerName: customerName,
            phone: this.clientInfo.contactInfo.phone,
            addressLine1: this.orderInfo.address.addressLine1,
            addressLine2: this.orderInfo.address.addressLine2 !== undefined ? this.orderInfo.address.addressLine2 : "",
            city: this.orderInfo.address.city,
            state: this.orderInfo.address.state,
            zipCode: this.orderInfo.address.zipCode,
            productSelected: this.orderInfo.product.Name,
            hardwareSelected: this.hardwareSelected,
            partnerOrderNumber: this.orderNumber,
            accountNumber: this.accountNumber,
            confirmedDate: this.confirmedDate,
            futureDate: futureDate,
            serviceType: this.serviceType
        };
        console.log("Send Electronic Order Summary Request", myData);

        const body = `<html lang="en"> <head> <meta charset="UTF-8" /> <title>Shopping Receipt</title> </head> <body style="font-family: Arial, sans-serif"> <div style=" width: 90%; padding: 20px; margin: 0 auto; background-color: #f8f8f8; border: 1px solid #ccc; " > <div style=" font-size: 1.5rem; text-align: center; margin-bottom: 1rem; background-color: #ff8200; color: white; padding: 10px 0; " > Thank you for shopping with us! </div> <div style=" padding: 1rem; background-color: #f4f6f9; display: grid; grid-template-columns: 1fr; " > <div style="gap: 1rem; padding: 1rem"> <!-- Customer Information box --> <div style="box-sizing: border-box"> <div style=" max-width: 100%; font-size: 1.125rem; text-align: center; margin-bottom: 0.5rem; background-color: #ff8200; color: white; " > Customer Information </div> <div style=" display: grid; grid-template-columns: 1fr; gap: 0.5rem; padding: 0.5rem; " > <table style="border-collapse: collapse; width: 100%"> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Name: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.customerName} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Phone: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.phone} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Address: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.addressLine1} ${myData.addressLine2} ${myData.city} ${myData.state}, ${myData.zipCode} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Email: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.email} </td> </tr> </table> </div> </div> <!-- Service Ordered --> <div style="box-sizing: border-box"> <div style=" font-size: 1.125rem; text-align: center; margin-bottom: 0.5rem; background-color: #ff8200; color: white; " > Services Ordered </div> <div style=" display: grid; grid-template-columns: 1fr; gap: 0.5rem; padding: 0.5rem; " > <table style="border-collapse: collapse; width: 100%"> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Package Option: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.productSelected} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Hardware Option: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.hardwareSelected} </td> </tr> </table> </div> </div> <!-- Order Information box --> <div style="box-sizing: border-box"> <div style=" width: 100%; font-size: 1.125rem; text-align: center; margin-bottom: 0.5rem; background-color: #ff8200; color: white; " > Order Information </div> <div style=" display: grid; grid-template-columns: 1fr; gap: 0.5rem; padding: 0.5rem; align-items: center; " > <table style="border-collapse: collapse; width: 100%"> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Completed On: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.confirmedDate} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Order Number: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.partnerOrderNumber} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Account Number: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.accountNumber} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > DIRECTV customer service support line: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > 844-416-1105 </td> </tr> </table> </div> </div> </div> <p><strong>NOTICE OF RIGHT TO CANCEL</strong></p> <p> You, the buyer, may cancel this transaction at any time prior to midnight of the third business day after the date of this transaction. See the Notice of Cancellation provisions below for an explanation of this right. </p> <p><strong>NOTICE OF CANCELLATION</strong></p> <p> You may CANCEL this transaction, without any Penalty or Obligation, within THREE BUSINESS DAYS from the above date. If you cancel, any property traded in, any payments made by you under the contract or sale, and any negotiable instrument executed by you will be returned within TEN DAYS following receipt by the seller of your cancellation notice, and any security interest arising out of the transaction will be canceled. If you cancel, you must make available to the seller at your residence, in substantially as good condition as when received, any goods delivered to you under this contract or sale, or you may, if you wish, comply with the instructions of the seller regarding the return shipment of the goods at the seller's expense and risk. You may return the equipment by shipment Through an authorized FedEx Office Print & Shop Center. See http://fedex.com or call FedEx: (800) 789-4623 for the nearest location. If you do make the goods available to the seller and the seller does not pick them up within 20 days of the date of your notice of cancellation, you may retain or dispose of the goods without any further obligation. If you fail to make the goods available to the seller, or if you agree to return the goods to the seller and fail to do so, then you remain liable for performance of all obligations under the contract*. To cancel this transaction, mail or deliver a signed and dated copy of this cancellation notice or any other written notice, or send a telegram**, to the DIRECTV Return Address below NOT LATER THAN MIDNIGHT ON ${myData.futureDate} I HEREBY CANCEL THIS TRANSACTION: Customer Signature ______________________ Date: _____________ DIRECTV Return Address: DIRECTV Attn: Retail Services 370 Inverness Drive S., Englewood, CO 80112 *This sentence is inapplicable to customers in Iowa. **CA Residents: Mail your cancellation request to the above address or send your cancellation request via email with subject line "Notice of Cancellation" to g53925@DIRECTV.com. In the email, please include customer name, address, date of transaction and order number (if available). </p> <p><strong>AVISO DE DERECHO A CANCELAR</strong></p> <p> Usted, el comprador, puede cancelar esta transacción en cualquier momento antes de la medianoche del tercer día hábil posterior a la fecha de esta transacción. Consulte las disposiciones de Aviso de cancelación a continuación para obtener una explicación de este derecho. </p> <p><strong>AVISO DE CANCELACIÓN</strong></p> <p> Usted puede CANCELAR esta transacción, sin Penalización u Obligación, dentro de los TRES DÍAS HÁBILES a partir de la fecha anterior. Si cancela, cualquier propiedad negociada, cualquier pago realizado por usted en virtud del contrato o la venta, y cualquier instrumento negociable ejecutado por usted será devuelto dentro de DIEZ DÍAS posteriores a la recepción por parte del vendedor de su aviso de cancelación, y cualquier derecho de garantía que surja de la transacción será cancelado. Si cancela, debe poner a disposición del vendedor en su residencia, sustancialmente en las mismas buenas condiciones que cuando las recibió, cualquier bien que se le entregue en virtud de este contrato o venta, o puede, si lo desea, cumplir con las instrucciones del vendedor. sobre el envío de devolución de la mercancía por cuenta y riesgo del vendedor. Puede devolver el equipo por envío a través de un–Centro de impresión y compras de FedEx Office autorizado. Visite http://fedex.com o llame a FedEx: (800) 789-4623 para conocer la ubicación más cercana. Si pone los bienes a disposición del vendedor y el vendedor no los recoge dentro de los 20 días posteriores a la fecha de su notificación de cancelación, puede retener o disponer de los bienes sin ninguna otra obligación. Si no pone los bienes a disposición del vendedor, o si acepta devolver los bienes al vendedor y no lo hace, seguirá siendo responsable del cumplimiento de todas las obligaciones en virtud del contrato*. Para cancelar esta transacción, envíe por correo o entregue una copia firmada y fechada de este aviso de cancelación o cualquier otro aviso por escrito, o envíe un telegrama**, a la dirección de devolución de DIRECTV que aparece a continuación A MÁS TARDAR A LA MEDIANOCHE DEL ${myData.futureDate} POR MEDIO DE CANCELAR ESTA TRANSACCIÓN: Firma del cliente: ______________________ Fecha: _____________ Dirección de devolución de DIRECTV Attn: Retail Services 370 Inverness Drive S., Englewood, CO 80112 *Esto no se aplica a los clientes de Iowa ** Residentes de CA: envíe su solicitud de cancelación a la dirección anterior o envíe su solicitud de cancelación por correo electrónico con la línea de asunto "Aviso de Cancelación" a g53925@DIRECTV.com. En el correo electrónico, incluya el nombre del cliente, la dirección, la fecha de la transacción y Número de pedido (si está disponible). </p> </div> </div> </body> </html>`;
        myData.body = body;

        sendElectronicSummary({ myData })
            .then((response) => {
                console.log("Send Electronic Order Summary Response", response);
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
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

    handleNext() {
        this.loaderSpinner = true;
        if (this.confirmationNumber) {
            let info = {
                orderNumber: this.confirmationNumber,
                orderId: this.orderId
            };
            this.updateOrder(info);
        } else {
            this.getOrdersHandler(true);
        }
    }

    updateOrder(info) {
        let cart = { ...this.cartInfo };
        let totalFee = Number(cart.firstBillTotal) + Number(cart.monthlyTotal) + Number(cart.todayTotal);
        let myData = {
            orderItemId: this.orderItemId,
            fee: totalFee
        };

        saveCart({ myData })
            .then((response) => {
                console.log(response);
                this.confirmOrder(info);
            })
            .catch((error) => {
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The order could not be activated. Please verify the information"
                });
                console.log(error);
                this.logError(error.body?.message || error.message);
            });
    }

    confirmOrder(info) {
        let installationDate = "";
        let myData = {
            ContextId: this.recordId,
            orderId: this.orderId,
            orderNumber: this.confirmationNumber,
            transactionId: this.transactionId,
            accountNumber: this.accountNumber,
            installationDate: installationDate,
            serviceReference: ""
        };

        saveOpportunityStage({ myData })
            .then((response) => {
                console.log("Save Opportunity Response", response);
                this.saveConfigurations(info);
            })
            .catch((error) => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The order could not be activated. Please verify the information"
                });
                console.log(error);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    saveConfigurations(info) {
        let cart = { ...this.cartInfo };
        let configurations = [];
        let todayArray = [];
        let firstArray = [];
        let monthlyArray = [];
        let savingsArray = [];
        if (cart.hasToday) {
            todayArray = JSON.parse(JSON.stringify(cart.todayCharges));
            todayArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: item.fee,
                    type: "Today"
                };
                configurations.push(config);
            });
        }
        if (cart.hasFirstBill) {
            firstArray = JSON.parse(JSON.stringify(cart.firstBillCharges));
            firstArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: item.fee,
                    type: "First Bill"
                };
                configurations.push(config);
            });
        }
        if (cart.hasMonthly) {
            monthlyArray = JSON.parse(JSON.stringify(cart.monthlyCharges));
            monthlyArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: item.fee,
                    type: "Monthly"
                };
                configurations.push(config);
            });
        }
        if (cart.hasSavings) {
            savingsArray = JSON.parse(JSON.stringify(cart.savingCharges));
            savingsArray.forEach((item) => {
                let config = {
                    name: item.name,
                    fee: "",
                    type: "Promotion"
                };
                configurations.push(config);
            });
        }
        let myData = {
            orderId: this.sfOrderId,
            Configurations: configurations
        };

        saveConfigurationsDTV({ myData })
            .then((response) => {
                console.log("Save Configurations Response", response);
                this.saveTracker(info);
            })
            .catch((error) => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "The order configurations could not be saved. Please verify the information"
                });
                console.log(error);
                this.logError(error.body?.message || error.message);
                this.loaderSpinner = false;
            });
    }

    showModalSendingOrder(checkOrderCallout) {
        poe_lwcSelfServiceLoadingModal
            .open({
                callbackCallout: (modal) => this.sendOrderCallout(modal, checkOrderCallout),
                timeoutMilliseconds: 60000,
                content: {
                    title: "Processing Your Order",
                    description: "Your DIRECTV order will be ready in a few moments.",
                    provider: "directv",
                    iconUrl: `${chuzoSiteResources}/images/icon-send-order.svg`
                }
            })
            .then((result) => {
                if (!result) {
                    this.orderFailed = true;
                    return;
                }

                this.showModalSendingOrderClosed = true;
                this.orderFailed = result.orderFailed || false;
                this.orderInProgress = result.orderInProgress || false;
                this.orderSuccess = result.orderSuccess || false;
                this.noCompleteInfo = result.noCompleteInfo || false;
                if (result.getOrdersHandlerInput) {
                    this.omsOrderId = result.getOrdersHandlerInput;
                    this.getOrdersHandler();
                }
            });
    }

    sendOrderCallout(modal, checkOrderCallout) {
        console.log("Check Submitted Order Request", checkOrderCallout);
        let apiResponse;
        const modalResult = {
            noCompleteInfo: true
        };
        let isRetry = false;
        callEndpoint({ inputMap: checkOrderCallout })
            .then((response) => {
                apiResponse = response;
                const result = JSON.parse(response);
                console.log("Check Submitted Order Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = "";
                    if (
                        result.error.provider?.message?.value?.content?.errors?.length > 0 &&
                        this.paymentErrorCodes.includes(result.error.provider.message.value.content.errors[0].errorCode)
                    ) {
                        this.showPrevious = true;
                        errorMessage = this.labels.DTVPaymentErrorBody;
                    } else {
                        errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                            result.error.hasOwnProperty("provider")
                                ? result.error.provider.message.hasOwnProperty("message")
                                    ? result.error.provider.message.message
                                    : result.error.provider.message.hasOwnProperty("errorDescription")
                                    ? result.error.provider.message.errorDescription
                                    : result.error.provider.message.hasOwnProperty("value")
                                    ? result.error.provider.message.value.content.errors[0].errorText
                                    : result.error.provider.message
                                : result.error.message
                        }.`;
                    }
                    const event = new ShowToastEvent({
                        title: this.showPrevious ? "Payment Method Error" : "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    modalResult.orderFailed = true;
                    this.logError(
                        `${errorMessage}\nAPI Response: ${response}`,
                        checkOrderCallout,
                        checkOrderCallout.path,
                        "API Error"
                    );
                } else {
                    switch (result.status.toUpperCase()) {
                        case "COMPLETE":
                            modalResult.orderInProgress = false;
                            modalResult.orderSuccess = true;
                            modalResult.noCompleteInfo = false;
                            modalResult.getOrdersHandlerInput =
                                result.value.createOrderResponse.data.orderIdentifier.omsOrderId;
                            break;
                        case "FAILURE":
                            console.error(error, "ERROR");
                            const genericErrorMessage = "The order could not be confirmed. Please resend the order";
                            const event = new ShowToastEvent({
                                title: "Error",
                                variant: "error",
                                mode: "sticky",
                                message: genericErrorMessage
                            });
                            modalResult.orderInProgress = true;
                            modalResult.orderFailed = true;
                            this.logError(
                                `${genericErrorMessage}\nAPI Response: ${response}`,
                                checkOrderCallout,
                                checkOrderCallout.path,
                                "API Error"
                            );
                            break;
                        case "IN PROGRESS":
                            if (this.isGuestUser) {
                                isRetry = true;
                                modal.delayCallout();
                            } else {
                                const warningToastEvent = new ShowToastEvent({
                                    title: "Transaction In Progress",
                                    variant: "warning",
                                    mode: "sticky",
                                    message: "Transaction is still in progress, please wait 30 seconds and try again."
                                });
                                this.dispatchEvent(warningToastEvent);
                                modalResult.orderFailed = false;
                                modalResult.orderInProgress = true;
                            }
                            break;
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
                        checkOrderCallout,
                        checkOrderCallout.path,
                        "API Error"
                    );
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
                modalResult.orderFailed = true;
            })
            .finally(() => {
                if (!isRetry) {
                    modal.close(modalResult);
                }
            });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Order Submitted",
            component: "poe_lwcBuyflowDirecTvEngaOrderConfirmationTab",
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
            tab: "Order Submitted"
        };
        this.dispatchEvent(event);
    }
}