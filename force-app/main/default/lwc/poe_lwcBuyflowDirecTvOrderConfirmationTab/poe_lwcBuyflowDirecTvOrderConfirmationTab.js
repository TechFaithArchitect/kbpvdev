import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
import { NavigationMixin } from "lightning/navigation";

export default class Poe_lwcBuyflowDirecTvOrderConfirmationMock extends NavigationMixin(LightningElement) {
    @api orderInfo;
    @api origin;
    @api cartInfo;
    @api recordId;
    @api productSelected;
    @api hardwareSelected;
    @api paymentInfo;
    @api userId;
    @api stream;
    @api installationInfo;
    @api sfOrderId;
    @api orderItemId;
    @api nffl;
    @api returnUrl;
    showCollateral;
    signatureName;
    signatureAddress;
    confirmedDate;
    serviceType;
    showSummarySignatureModal = false;
    showOrderSummary = false;
    loaderSpinner;
    orderSuccess;
    accountNumber;
    confirmationNumber;
    orderId;
    transactionId;
    noCompleteInfo = true;

    handlePrevious() {
        const sendBackEvent = new CustomEvent("back");
        this.dispatchEvent(sendBackEvent);
    }

    handleViewOrderSummary() {
        this.showOrderSummary = true;
    }

    hideSummaryModal(e) {
        this.showOrderSummary = false;
    }

    showSignatureModal(e) {
        this.hideSummaryModal();
        this.showSummarySignatureModal = true;
    }

    hideSignatureModal(e) {
        this.showSummarySignatureModal = false;
    }

    handleClick() {
        this.loaderSpinner = true;
        let info = {
            orderNumber: this.confirmationNumber,
            orderId: this.orderId
        };
        this.updateOrder(info);
    }

    saveTracker(info) {
        let trackerData = {
            userId: this.userId,
            operation: "setTrack",
            isCount: "true",
            action: "Buyflow Completed"
        };
        if (this.origin === "retail") {
            const options = {};
            const params = {
                input: JSON.stringify(trackerData),
                sClassName: `vlocity_cmt.IntegrationProcedureService`,
                sMethodName: "Clicker_RetailMain",
                options: JSON.stringify(options)
            };
            this._actionUtil
                .executeAction(params, null, this, null, null)
                .then((response) => {
                    this.loaderSpinner = false;
                    const sendCartNextEvent = new CustomEvent("confirmationnext", {
                        detail: info
                    });
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
                    console.log(error);
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "event") {
            const options = {};
            const params = {
                input: JSON.stringify(trackerData),
                sClassName: `vlocity_cmt.IntegrationProcedureService`,
                sMethodName: "Clicker_EventMain",
                options: JSON.stringify(options)
            };
            this._actionUtil
                .executeAction(params, null, this, null, null)
                .then((response) => {
                    this.loaderSpinner = false;
                    const sendCartNextEvent = new CustomEvent("confirmationnext", {
                        detail: info
                    });
                    this.sendElectronicOrderSummary();
                    this.dispatchEvent(sendCartNextEvent);
                    this.loaderSpinner = false;
                })
                .catch((error) => {
                    console.log(error);
                    console.error(error, "ERROR");
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message: "The order could not be activated. Please verify the information"
                    });
                    console.log(error);
                    this.loaderSpinner = false;
                });
        } else if (this.origin === "phonesales") {
            const options = {};
            const params = {
                input: JSON.stringify(trackerData),
                sClassName: `vlocity_cmt.IntegrationProcedureService`,
                sMethodName: "Clicker_CallCenterMain",
                options: JSON.stringify(options)
            };
            this._actionUtil
                .executeAction(params, null, this, null, null)
                .then((response) => {
                    this.loaderSpinner = false;
                    const sendCartNextEvent = new CustomEvent("confirmationnext", {
                        detail: info
                    });
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
                    console.log(error);
                    this.loaderSpinner = false;
                });
        } else {
            this.origin === "maps" ? this.sendElectronicOrderSummary() : undefined;
            this.loaderSpinner = false;
            const sendCartNextEvent = new CustomEvent("confirmationnext", {
                detail: info
            });
            this.dispatchEvent(sendCartNextEvent);
            this.loaderSpinner = false;
        }
    }

    updateOrder(info) {
        let cart = { ...this.cartInfo };
        let totalFee = Number(cart.firstBillTotal) + Number(cart.monthlyTotal) + Number(cart.todayTotal);
        let myData = {
            orderItemId: this.orderItemId,
            fee: totalFee
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_IPSaveCartDTV",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
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
            });
    }

    confirmOrder(info) {
        let installationDate = "";
        if (this.nffl === false) {
            installationDate = this.stream ? "" : this.installationInfo.installationDetail.date;
        }
        let myData = {
            ContextId: this.recordId,
            orderId: this.orderId,
            orderNumber: this.confirmationNumber,
            transactionId: this.transactionId,
            accountNumber: this.accountNumber,
            installationDate: installationDate,
            serviceReference: ""
        };
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_saveOpportunityStage",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
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
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_IPsaveConfigurationsDTV",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
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
                this.loaderSpinner = false;
            });
    }

    connectedCallback() {
        this._actionUtil = new OmniscriptActionCommonUtil();
        this.loaderSpinner = true;
        let today = new Date();
        let date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        this.confirmedDate = date + " " + time;
        this.signatureName = `${this.orderInfo.customer.firstName} ${this.orderInfo.customer.lastName}`;
        this.signatureAddress = `${this.orderInfo.account.shippingAddress.addressLine1} ${this.orderInfo.account.shippingAddress.city} ${this.orderInfo.account.shippingAddress.state}, ${this.orderInfo.account.shippingAddress.zipCode}`;
        this.serviceType = this.orderInfo.productType === "atv" ? "DIRECTV Via Internet" : "DIRECTV";
        let customer = JSON.parse(JSON.stringify(this.orderInfo.customer));
        if (customer.middleName === null) {
            customer.middleName = "";
        }
        let calloutInformation = {
            tab: "order",
            partnerName: "directv",
            componentCode: this.orderInfo.componentCode,
            partnerOrderNumber: this.orderInfo.partnerOrderNumber,
            productType: this.orderInfo.productType,
            dealerCode: this.orderInfo.dealerCode,
            customerType: this.orderInfo.customerType,
            customer: customer,
            account: this.orderInfo.account,
            tcpa: true,
            componentCustomizations: this.orderInfo.componentCustomizations
        };
        if (this.orderInfo.productType === "dtv" && this.nffl === false) {
            calloutInformation.installationDetails = this.installationInfo.installationDetail;
            calloutInformation.installerComment = "";
        }
        console.log(calloutInformation);
        const options = {};
        const params = {
            input: JSON.stringify(calloutInformation),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_ProviderCallouts",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log(response);
                if (
                    response.result.IPResult.hasOwnProperty("confirmationNumber") &&
                    response.result.IPResult.orderedComponents !== null
                ) {
                    this.orderSuccess = true;
                    this.confirmationNumber = response.result.IPResult.confirmationNumber;
                    this.accountNumber = response.result.IPResult.orderedComponents[0].component.billingAccountNumber;
                    this.orderId = response.result.IPResult.orderedComponents[0].component.commonOrderID;
                    this.transactionId = response.result.IPResult.orderedComponents[0].component.globalSessionId;
                    this.noCompleteInfo = false;
                } else {
                    this.orderSuccess = false;
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
                    const event = new ShowToastEvent({
                        title: "Error",
                        variant: "error",
                        mode: "sticky",
                        message:
                            errorMessage !== undefined
                                ? errorMessage
                                : "The order could not be confirmed. Please verify the information"
                    });
                    this.dispatchEvent(event);
                }
                this.loaderSpinner = false;
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.loaderSpinner = false;
                const event = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "Service unreachable. Please try again."
                });
                this.dispatchEvent(event);
            });
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

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }

    sendElectronicOrderSummary() {
        let futureDate = this.formattedFutureDate();
        let customerName = this.orderInfo.customer.firstName + " " + this.orderInfo.customer.lastName;

        this.loaderSpinner = true;
        let myData = {
            email: this.orderInfo.customer.emailAddress,
            orderDate: this.confirmedDate,
            customerName: customerName,
            phone: this.orderInfo.customer.phoneNumber,
            addressLine1: this.orderInfo.account.shippingAddress.addressLine1,
            addressLine2: this.orderInfo.account.shippingAddress.addressLine2,
            city: this.orderInfo.account.shippingAddress.city,
            state: this.orderInfo.account.shippingAddress.state,
            zipCode: this.orderInfo.account.shippingAddress.zipCode,
            productSelected: this.productSelected,
            hardwareSelected: this.hardwareSelected,
            partnerOrderNumber: this.orderInfo.partnerOrderNumber,
            accountNumber: this.accountNumber,
            confirmedDate: this.confirmedDate,
            futureDate: futureDate
        };
        const body = `<html lang="en"> <head> <meta charset="UTF-8" /> <title>Shopping Receipt</title> </head> <body style="font-family: Arial, sans-serif"> <div style=" width: 90%; padding: 20px; margin: 0 auto; background-color: #f8f8f8; border: 1px solid #ccc; " > <div style=" font-size: 1.5rem; text-align: center; margin-bottom: 1rem; background-color: #ff8200; color: white; padding: 10px 0; " > Thank you for shopping with us! </div> <div style=" padding: 1rem; background-color: #f4f6f9; display: grid; grid-template-columns: 1fr; " > <div style="gap: 1rem; padding: 1rem"> <!-- Customer Information box --> <div style="box-sizing: border-box"> <div style=" max-width: 100%; font-size: 1.125rem; text-align: center; margin-bottom: 0.5rem; background-color: #ff8200; color: white; " > Customer Information </div> <div style=" display: grid; grid-template-columns: 1fr; gap: 0.5rem; padding: 0.5rem; " > <table style="border-collapse: collapse; width: 100%"> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Name: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.customerName} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Phone: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.phone} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Address: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.addressLine1} ${myData.addressLine2} ${myData.city} ${myData.state}, ${myData.zipCode} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Email: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.email} </td> </tr> </table> </div> </div> <!-- Service Ordered --> <div style="box-sizing: border-box"> <div style=" font-size: 1.125rem; text-align: center; margin-bottom: 0.5rem; background-color: #ff8200; color: white; " > Services Ordered </div> <div style=" display: grid; grid-template-columns: 1fr; gap: 0.5rem; padding: 0.5rem; " > <table style="border-collapse: collapse; width: 100%"> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Package Option: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.productSelected} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Hardware Option: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.hardwareSelected} </td> </tr> </table> </div> </div> <!-- Order Information box --> <div style="box-sizing: border-box"> <div style=" width: 100%; font-size: 1.125rem; text-align: center; margin-bottom: 0.5rem; background-color: #ff8200; color: white; " > Order Information </div> <div style=" display: grid; grid-template-columns: 1fr; gap: 0.5rem; padding: 0.5rem; align-items: center; " > <table style="border-collapse: collapse; width: 100%"> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Completed On: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.confirmedDate} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Order Number: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.partnerOrderNumber} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > Account Number: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > ${myData.accountNumber} </td> </tr> <tr> <th style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > DIRECTV customer service support line: </th> <td style=" border: 0px solid #ccc; padding: 8px; text-align: left; " > 844-416-1105 </td> </tr> </table> </div> </div> </div> <p><strong>NOTICE OF RIGHT TO CANCEL</strong></p> <p> You, the buyer, may cancel this transaction at any time prior to midnight of the third business day after the date of this transaction. See the Notice of Cancellation provisions below for an explanation of this right. </p> <p><strong>NOTICE OF CANCELLATION</strong></p> <p> You may CANCEL this transaction, without any Penalty or Obligation, within THREE BUSINESS DAYS from the above date. If you cancel, any property traded in, any payments made by you under the contract or sale, and any negotiable instrument executed by you will be returned within TEN DAYS following receipt by the seller of your cancellation notice, and any security interest arising out of the transaction will be canceled. If you cancel, you must make available to the seller at your residence, in substantially as good condition as when received, any goods delivered to you under this contract or sale, or you may, if you wish, comply with the instructions of the seller regarding the return shipment of the goods at the seller's expense and risk. You may return the equipment by shipment Through an authorized FedEx Office Print & Shop Center. See http://fedex.com or call FedEx: (800) 789-4623 for the nearest location. If you do make the goods available to the seller and the seller does not pick them up within 20 days of the date of your notice of cancellation, you may retain or dispose of the goods without any further obligation. If you fail to make the goods available to the seller, or if you agree to return the goods to the seller and fail to do so, then you remain liable for performance of all obligations under the contract*. To cancel this transaction, mail or deliver a signed and dated copy of this cancellation notice or any other written notice, or send a telegram**, to the DIRECTV Return Address below NOT LATER THAN MIDNIGHT ON ${myData.futureDate} I HEREBY CANCEL THIS TRANSACTION: Customer Signature ______________________ Date: _____________ DIRECTV Return Address: DIRECTV Attn: Retail Services 370 Inverness Drive S., Englewood, CO 80112 *This sentence is inapplicable to customers in Iowa. **CA Residents: Mail your cancellation request to the above address or send your cancellation request via email with subject line "Notice of Cancellation" to g53925@DIRECTV.com. In the email, please include customer name, address, date of transaction and order number (if available). </p> <p><strong>AVISO DE DERECHO A CANCELAR</strong></p> <p> Usted, el comprador, puede cancelar esta transacción en cualquier momento antes de la medianoche del tercer día hábil posterior a la fecha de esta transacción. Consulte las disposiciones de Aviso de cancelación a continuación para obtener una explicación de este derecho. </p> <p><strong>AVISO DE CANCELACIÓN</strong></p> <p> Usted puede CANCELAR esta transacción, sin Penalización u Obligación, dentro de los TRES DÍAS HÁBILES a partir de la fecha anterior. Si cancela, cualquier propiedad negociada, cualquier pago realizado por usted en virtud del contrato o la venta, y cualquier instrumento negociable ejecutado por usted será devuelto dentro de DIEZ DÍAS posteriores a la recepción por parte del vendedor de su aviso de cancelación, y cualquier derecho de garantía que surja de la transacción será cancelado. Si cancela, debe poner a disposición del vendedor en su residencia, sustancialmente en las mismas buenas condiciones que cuando las recibió, cualquier bien que se le entregue en virtud de este contrato o venta, o puede, si lo desea, cumplir con las instrucciones del vendedor. sobre el envío de devolución de la mercancía por cuenta y riesgo del vendedor. Puede devolver el equipo por envío a través de un–Centro de impresión y compras de FedEx Office autorizado. Visite http://fedex.com o llame a FedEx: (800) 789-4623 para conocer la ubicación más cercana. Si pone los bienes a disposición del vendedor y el vendedor no los recoge dentro de los 20 días posteriores a la fecha de su notificación de cancelación, puede retener o disponer de los bienes sin ninguna otra obligación. Si no pone los bienes a disposición del vendedor, o si acepta devolver los bienes al vendedor y no lo hace, seguirá siendo responsable del cumplimiento de todas las obligaciones en virtud del contrato*. Para cancelar esta transacción, envíe por correo o entregue una copia firmada y fechada de este aviso de cancelación o cualquier otro aviso por escrito, o envíe un telegrama**, a la dirección de devolución de DIRECTV que aparece a continuación A MÁS TARDAR A LA MEDIANOCHE DEL ${myData.futureDate} POR MEDIO DE CANCELAR ESTA TRANSACCIÓN: Firma del cliente: ______________________ Fecha: _____________ Dirección de devolución de DIRECTV Attn: Retail Services 370 Inverness Drive S., Englewood, CO 80112 *Esto no se aplica a los clientes de Iowa ** Residentes de CA: envíe su solicitud de cancelación a la dirección anterior o envíe su solicitud de cancelación por correo electrónico con la línea de asunto "Aviso de Cancelación" a g53925@DIRECTV.com. En el correo electrónico, incluya el nombre del cliente, la dirección, la fecha de la transacción y Número de pedido (si está disponible). </p> </div> </div> </body> </html>`;
        myData.body = body;
        this.loaderSpinner = true;

        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Buyflow_sendElectronicSummary",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                this.loaderSpinner = false;
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.error(error, "ERROR");
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
}