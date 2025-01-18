import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import getEarthlinkKeys from "@salesforce/apex/checkoutTabController.getEarthlinkKeys";

import { PIE } from "./getkey";
import { ValidatePANChecksum } from "./encryption";
import { ProtectPANandCVV } from "./encryption";
import { ValidatePANChecksumProd } from "./encryption-prod";
import { ProtectPANandCVVProd } from "./encryption-prod";

import TOAST_GENERIC_ERROR_TITLE from "@salesforce/label/c.Toast_Generic_Error_Title";
import INVALID_CREDIT_CARD_ERROR_MESSAGE from "@salesforce/label/c.Encryption_Invalid_Credit_Card_Error_Message";
import ENCRYPTION_KEY_NOT_LOADED_ERROR_MESSAGE from "@salesforce/label/c.Encryption_Key_Not_Loaded_Error_Message";
import ENCRYPTION_JS_FILE_NOT_LOADED_ERROR_MESSAGE from "@salesforce/label/c.Encryption_JS_File_Not_Loaded_Error_Message";


export default class Poe_lwcBuyflowCrediCardEncrypt extends NavigationMixin(LightningElement) {
    @api cvv;
    @api ccNumber;
    @api program;

    connectedCallback() {
        let url = window.location.href;
        let environment;
        if (url.includes("qa") || url.includes("dev") || url.includes("uat") || url.includes("trainin")) {
            environment = "dev";
        } else {
            environment = "prod";
        }
        let cryptCard;
        let cryptCvv;
        let integrityCheckVal;
        let keyId;
        let phase;
        let pie;
        let myData = {
            env: environment,
            program: this.program
        };
        getEarthlinkKeys({ myData: myData })
            .then((response) => {
                let data = response.result;
                pie = {
                    K: data.hasOwnProperty("K") ? data.K : "undefined",
                    L: data.hasOwnProperty("L") ? Number(data.L) : "undefined",
                    E: data.hasOwnProperty("E") ? Number(data.E) : "undefined",
                    key_id: data.hasOwnProperty("key_id") ? data.key_id : "undefined",
                    phase: data.hasOwnProperty("phase") ? Number(data.phase) : "undefined"
                };

                if (
                    typeof pie.K == "undefined" ||
                    typeof pie.L == "undefined" ||
                    typeof pie.E == "undefined" ||
                    typeof pie.key_id == "undefined" ||
                    typeof pie.phase == "undefined"
                ) {
                    const event = new ShowToastEvent({
                        title: TOAST_GENERIC_ERROR_TITLE,
                        variant: "error",
                        mode: "sticky",
                        message: ENCRYPTION_KEY_NOT_LOADED_ERROR_MESSAGE
                    });
                    this.dispatchEvent(event);
                    const showCollateralEvent = new CustomEvent("error", {
                        detail: ""
                    });
                    this.dispatchEvent(showCollateralEvent);
                    return;
                }
                if (environment === "dev") {
                    if (typeof ValidatePANChecksum != "function" || typeof ProtectPANandCVV != "function") {
                        const event = new ShowToastEvent({
                            title: TOAST_GENERIC_ERROR_TITLE,
                            variant: "error",
                            mode: "sticky",
                            message: ENCRYPTION_JS_FILE_NOT_LOADED_ERROR_MESSAGE
                        });
                        this.dispatchEvent(event);
                        const showCollateralEvent = new CustomEvent("error", {
                            detail: ""
                        });
                        this.dispatchEvent(showCollateralEvent);
                        return;
                    }
                    if (!ValidatePANChecksum(this.ccNumber)) {
                        const event = new ShowToastEvent({
                            title: TOAST_GENERIC_ERROR_TITLE,
                            variant: "error",
                            mode: "sticky",
                            message: INVALID_CREDIT_CARD_ERROR_MESSAGE
                        });
                        this.dispatchEvent(event);
                        const showCollateralEvent = new CustomEvent("error", {
                            detail: ""
                        });
                        this.dispatchEvent(showCollateralEvent);
                        return;
                    }
                } else if (environment === "prod") {
                    if (typeof ValidatePANChecksumProd != "function" || typeof ProtectPANandCVVProd != "function") {
                        const event = new ShowToastEvent({
                            title: TOAST_GENERIC_ERROR_TITLE,
                            variant: "error",
                            mode: "sticky",
                            message: ENCRYPTION_JS_FILE_NOT_LOADED_ERROR_MESSAGE
                        });
                        this.dispatchEvent(event);
                        const showCollateralEvent = new CustomEvent("error", {
                            detail: ""
                        });
                        this.dispatchEvent(showCollateralEvent);
                        return;
                    }
                    if (!ValidatePANChecksumProd(this.ccNumber)) {
                        const event = new ShowToastEvent({
                            title: TOAST_GENERIC_ERROR_TITLE,
                            variant: "error",
                            mode: "sticky",
                            message: INVALID_CREDIT_CARD_ERROR_MESSAGE
                        });
                        this.dispatchEvent(event);
                        const showCollateralEvent = new CustomEvent("error", {
                            detail: ""
                        });
                        this.dispatchEvent(showCollateralEvent);
                        return;
                    }
                }
                let result;
                if (environment === "dev") {
                    result = ProtectPANandCVV(this.ccNumber, this.cvv, this.program === "spectrum", pie);
                } else if (environment === "prod") {
                    result = ProtectPANandCVVProd(this.ccNumber, this.cvv, this.program === "spectrum", pie);
                }

                if (result != null && result != undefined) {
                    cryptCard = result[0];
                    cryptCvv = result[1];
                    if (result.length > 2) {
                        integrityCheckVal = result[2];
                        keyId = pie.key_id;
                        phase = pie.phase;
                        let data = {
                            encCardNumber: cryptCard,
                            encCvv: cryptCvv,
                            phase: phase,
                            keyId: keyId,
                            integrityCheck: integrityCheckVal
                        };

                        const showCollateralEvent = new CustomEvent("encryption", {
                            detail: data
                        });
                        this.dispatchEvent(showCollateralEvent);
                    } else {
                        const event = new ShowToastEvent({
                            title: TOAST_GENERIC_ERROR_TITLE,
                            variant: "error",
                            mode: "sticky",
                            message: INVALID_CREDIT_CARD_ERROR_MESSAGE
                        });
                        this.dispatchEvent(event);
                    }
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                console.log(error);
                if (
                    typeof pie.K == "undefined" ||
                    typeof pie.L == "undefined" ||
                    typeof pie.E == "undefined" ||
                    typeof pie.key_id == "undefined" ||
                    typeof pie.phase == "undefined"
                ) {
                    const event = new ShowToastEvent({
                        title: TOAST_GENERIC_ERROR_TITLE,
                        variant: "error",
                        mode: "sticky",
                        message: ENCRYPTION_KEY_NOT_LOADED_ERROR_MESSAGE
                    });
                    this.dispatchEvent(event);
                    const showCollateralEvent = new CustomEvent("error", {
                        detail: ""
                    });
                    this.dispatchEvent(showCollateralEvent);
                    return;
                }
            });
    }
}