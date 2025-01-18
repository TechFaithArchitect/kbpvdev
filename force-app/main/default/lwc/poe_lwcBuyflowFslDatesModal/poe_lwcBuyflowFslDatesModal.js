import LightningModal from 'lightning/modal';
import { api } from 'lwc';
import getWorkOrderIdByServiceAppId from "@salesforce/apex/InfoTabController.getWorkOrderIdByServiceAppId";

export default class Poe_lwcBuyflowFslDatesModal extends LightningModal {
    @api zipCode;
    @api workType;
    @api workTypeName;

    handleFSLDateConfirm(event) {
        const serviceAppointmentId = event.detail.Id;
        const myData = {
            serviceAppointmentId
        };

        getWorkOrderIdByServiceAppId({ myData })
        .then(response => {
            this.close({
                fslWorkOrderId: response.result.workOrderId,
                fslServiceAppointmentId: serviceAppointmentId
            });
        }).catch(err => {
            this.dispatchEvent(new CustomEvent('logerror', {
                detail: {
                    type: "Internal Error",
                    component: "poe_lwcBuyflowFslDatesModal",
                    error: err.body?.message || err.message        
                }
            }));
        });
    }

    handleCancel() {
        this.close();
    }
}