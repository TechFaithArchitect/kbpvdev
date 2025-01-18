import { LightningElement, api } from "lwc";

export default class Lwc_ChuzoPersonAccountTabSearchBox extends LightningElement {
    @api placeholder;
    filter;
    timeoutId;

    handleInput(event) {
        this.filter = event.target.value;
        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
            this.sendEvent();
        }, 500);
    }

    sendEvent() {
        const sendValueEvent = new CustomEvent("change", {
            detail: this.filter
        });
        this.dispatchEvent(sendValueEvent);
    }
}