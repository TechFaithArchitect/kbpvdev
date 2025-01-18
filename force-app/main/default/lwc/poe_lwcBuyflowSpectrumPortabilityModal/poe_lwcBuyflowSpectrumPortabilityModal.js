import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ToastContainer from "lightning/toastContainer";

export default class Poe_lwcBuyflowSpectrumPortabilityModal extends LightningElement {
    @api modalBody;
    @api modalTitle;
    @api portableAttributes;
    @api isGuestUser;
    attributes = [];
    noInfo = true;
    success = true;

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: ""
        });
        this.dispatchEvent(closeModalEvent);
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }
        this.attributes = this.portableAttributes.map((item) => {
            let auxItem = { ...item };
            auxItem.inputType = item.name === "pin" ? "password" : "text";
            return { ...auxItem };
        });
        this.noInfo =
            this.attributes.length > 0 &&
            this.attributes.some((item) => item.hasOwnProperty("required") && item.required);
        this.success = this.noInfo;
    }

    disableValidation() {
        let numRegex = /^\d+$/;
        let attributes = [...this.attributes];
        attributes.forEach((item) => {
            if (item.name === "pin" && item.value !== null && !numRegex.test(item.value)) {
                this.noInfo = true;
                const toastEvent = new ShowToastEvent({
                    title: "Error",
                    variant: "error",
                    mode: "sticky",
                    message: "PIN must be only numbers. Special characters or letters are not allowed"
                });
                this.dispatchEvent(toastEvent);
                item.value = null;
                this.attributes = [...attributes];
            }
        });
        this.noInfo = this.attributes.some((item) => item.value == null);
    }

    handleChange(event) {
        let numRegex = /^\d+$/;
        this.attributes.forEach((item) => {
            if (item.name === event.target.dataset.id) {
                item.value =
                    event.target.value !== ""
                        ? item.type === "string"
                            ? event.target.value
                            : numRegex.test(event.target.value)
                            ? Number(event.target.value)
                            : "INVALID"
                        : null;
            }
        });
        this.disableValidation();
    }

    handleConfirm() {
        if (!this.success) {
            this.hideModal();
            return;
        }
        let info = {
            attributes: this.attributes
        };
        const confirmModalEvent = new CustomEvent("confirm", {
            detail: info
        });
        this.dispatchEvent(confirmModalEvent);
    }
}