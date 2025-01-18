import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";

export default class CollateralFilesButton extends NavigationMixin(LightningElement) {

    goToFiles(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        const showCollateralEvent = new CustomEvent("showcollateral", {
            detail: 'show'
        });
        this.dispatchEvent(showCollateralEvent);
    }
}