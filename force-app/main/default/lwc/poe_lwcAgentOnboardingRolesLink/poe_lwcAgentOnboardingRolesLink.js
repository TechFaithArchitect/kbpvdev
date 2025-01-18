import { LightningElement } from "lwc";
import chuzoFunctionalRolesURL from "@salesforce/resourceUrl/Chuzo_Functional_Roles";

export default class Poe_lwcAgentOnboardingRolesLink extends LightningElement {
    handleOpenPDF() {
        window.open(chuzoFunctionalRolesURL, "_blank");
    }
}