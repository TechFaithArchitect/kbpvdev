import { LightningElement, wire } from "lwc";
import getActiveNotification from "@salesforce/apex/POE_ChuzoNotificationController.getActiveNotification";

export default class Poe_lwcChuzoNotification extends LightningElement {
    message;
    isShowModal = false;

    @wire(getActiveNotification)
    wiredMessage({ error, data }) {
        if (data) {
            if(data.length > 0){
                this.message = data.join('<br><br>');
                this.isShowModal = true;
            }
        } else if (error) {
            console.log(error);
        }
    }

    hideModal() {
        this.isShowModal = false;
    }
}