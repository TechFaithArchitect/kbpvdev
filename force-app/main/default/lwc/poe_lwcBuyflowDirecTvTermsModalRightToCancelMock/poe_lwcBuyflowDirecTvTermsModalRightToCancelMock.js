import { LightningElement, api } from "lwc";

export default class Poe_lwcBuyflowDirecTvTermsModalRightToCancelMock extends LightningElement {
    @api subtitle = {
        id: 3,
        value: "You, the buyer, may cancel this transaction at any time prior to midnight of the third business day after the date of this transaction. See the Notice of Cancellation provisions below for an explanation of this right."
    };
    @api rightToCancelDisclaimers = [
        {
            Id: 1,
            title: "NOTICE OF CANCELLATION",
            value: "You may CANCEL this transaction, without any Penalty or Obligation, within THREE BUSINESS DAYS from the above date.  If you cancel, any property traded in, any payments made by you under the contract or sale, and any negotiable instrument executed by you will be returned within TEN DAYS following receipt by the seller of your cancellation notice, and any security interest arising out of the transaction will be cancelled.  If you cancel, you must make available to the seller at your residence, in substantially as good condition as when received, any goods delivered to you under this contract or sale, or you may, if you wish, comply with the instructions of the seller regarding the return shipment of the goods at the seller's expense and risk.  You may return the equipment by shipment through an authorized UPS location.  See the upsstore.com or call 800-789-4623 for the nearest UPS location.  If you do make the goods available to the seller and the seller does not pick them up within 20 days of the date of your notice of cancellation, you may retain or dispose of the goods without any further obligation. If you fail to make the goods available to the seller, or if you agree to return the goods to the seller and fail to do so, then you remain liable for performance of all obligations under the contract*.  To cancel this transaction, mail or deliver a signed and dated copy of this cancellation notice or any other written notice, or send a telegram** to the AT&T Return Address below NOT LATER THAN MIDNIGHT ON 9/15/2022."
        },
        {
            Id: 2,
            title: "AVISO DE CANCELACION",
            value: "Usted puede CANCELAR esta transaccion, sin multa u obligacion alguna, dentro de los TRES DIAS HABILES a partir de la fecha que antecede. Si cancela el servicio, se le devolveran todos los productos que haya entregado, los pagos que haya efectuado en virtud del contacto o venta y cualquier instrumento negociable que haya firmado, dentro de los DIEZ DIAS a partir del momento en que el vendedor haya recibido el aviso de cancelacion. En caso de cancelar el servicio, debera; poner a disposicion del vendedor, en su domicilio y sustancialmente en el mismo estado en el que se recibieron, todos los productos que le fueron entregados en virtud del presente contacto o venta, o podra, si usted asi lo desea, seguir las instrucciones del vendedor con respecto a la devolucion de los productos, que se enviaran por cuenta y riesgo del vendedor. Usted puede devolver el equipo enviandolo a traves de una tienda UPS autorizada. Consulte theupsstore.com o llame al 800.789.4623 para encontrar la tienda UPS mas cercana. SI usted pone los productos a disposicion del vendedor y este no los recoge dentro de los 20 dias de la fecha del aviso de cancelacion, usted podra retener o disponer de los productos sin obligacion alguna. Si no pone los productos a disposicion del vendedor o acepta devolverselos y no lo hace, usted seguira siendo responsable del cumplimiento de todas las obligaciones contractuales. Para cancelar esta transaccion, envie por correo postal o entregue personalmente una copia firmada y fechada del aviso de cancelacion u otro aviso por escrito, o envie un telegrama** a la direccion del vendedor de AT&T NO MÁS TARDE DE LA MEDIANOCHE DEL 9/15/2022."
        }
    ];

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: "cancel"
        });
        this.dispatchEvent(closeModalEvent);
    }
}