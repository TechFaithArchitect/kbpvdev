import { LightningElement, api, wire } from "lwc";
import { OmniscriptBaseMixin } from "vlocity_cmt/omniscriptBaseMixin";
import { getNamespaceDotNotation } from "vlocity_cmt/omniscriptInternalUtils";
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";

export default class poeGetClickerLocalizationComponent extends OmniscriptBaseMixin(LightningElement) {
    _actionUtil;

    renderedCallback() {
        this._actionUtil = new OmniscriptActionCommonUtil();
        this.saveInteraction();
    }

    saveInteraction() {
        let myData = {};
        const options = {};
        const params = {
            input: JSON.stringify(myData),
            sClassName: `vlocity_cmt.IntegrationProcedureService`,
            sMethodName: "Clicker_InteractionTracker",
            options: JSON.stringify(options)
        };
        this._actionUtil
            .executeAction(params, null, this, null, null)
            .then((response) => {
                console.log("Interaction Saved");
            })
            .catch((error) => {
                console.error(error, "ERROR");
            });
    }
}