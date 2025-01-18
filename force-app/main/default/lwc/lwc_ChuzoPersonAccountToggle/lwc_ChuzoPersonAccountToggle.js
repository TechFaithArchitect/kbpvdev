import { LightningElement } from "lwc";

export default class Lwc_ChuzoPersonAccountToggle extends LightningElement {
    handleToggle(event) {
        this.dispatchEvent(
            new CustomEvent("togglechange", {
                detail: event.target.checked
            })
        );
    }
}