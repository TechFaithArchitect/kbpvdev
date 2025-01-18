import { LightningElement } from "lwc";

export default class CharterIntegration extends LightningElement {
    showWebsite = false;
    isLoading = false;
    showSurvey = false;
    websiteLabel = "Show Google";

    urlValue() {
        let myIframe = document.getElementsByName("iFrame");
        let urlString = "https://google.com/";
        let searchUrl = "maps/place/Hikko";
        myIframe.src = urlString + searchUrl;
    }

    renderedCallback() {
        this.urlValue();
    }
}