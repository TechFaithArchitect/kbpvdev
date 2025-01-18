import { LightningElement } from "lwc";
import Id from "@salesforce/user/Id";
import isGuest from "@salesforce/user/isGuest";

export default class AnalyticsSupport extends LightningElement {
    connectedCallback() {
        let payload = {
            detail: {
                user_id: Id,
                user_properties: {
                    user_id: Id,
                    user_type: isGuest ? "Unauthenticated" : "Authenticated"
                }
            }
        };
        document.dispatchEvent(new CustomEvent("analyticsSupport", payload));
    }
}