import { LightningElement, api } from "lwc";

export default class Poe_lwcBuyflowDirecTvTermsModalStreamPremiumMock extends LightningElement {
    @api premiumDisclaimers = [
        {
            Id: 1,
            title: "RECOMMENDED: upgrade to Unlimited hours of Cloud DVR recordings for $10/mo. more",
            value: "Upgrade to unlimited hours of cloud DVR recordings for $10/mo. more. Data connection req’d. Recordings expire after 9 months. In a series recording, max 30 episodes stored (oldest deleted first which may be in less than 9 months). Restrictions apply."
        },
        {
            Id: 2,
            title: "3 mos. of EPIX",
            value: "MUST READ: Subject to Change: By selecting the first 3 months of included EPIX, you agree that EPIX auto-renews after 3 mos, at then the prevailing rate (currently $6.00/mo.) unless you cancel. To cancel this service, call 800.531.5000. New customers only."
        }
    ];

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: "cancel"
        });
        this.dispatchEvent(closeModalEvent);
    }
}