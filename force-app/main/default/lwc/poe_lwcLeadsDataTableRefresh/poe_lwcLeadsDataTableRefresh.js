import { LightningElement } from "lwc";

export default class Poe_lwcLeadsDataTableRefresh extends LightningElement {
    handleRefresh() {
        window.location.reload();
    }
}