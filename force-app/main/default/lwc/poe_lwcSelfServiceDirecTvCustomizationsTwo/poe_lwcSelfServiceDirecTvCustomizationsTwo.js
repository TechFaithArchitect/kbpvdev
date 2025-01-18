import { LightningElement, api } from "lwc";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import { loadStyle } from "lightning/platformResourceLoader";
import { NavigationMixin } from "lightning/navigation";
import chuzo_modalGeneric from "c/chuzo_modalGeneric";
import ENGA_OFFER_DETAIL_MODAL_BODY_6 from "@salesforce/label/c.Enga_Offer_Detail_Modal_Body_6";
import GetInternationalPackage from "@salesforce/apex/ProductTabController.GetInternationalPackage";

export default class Poe_lwcSelfServiceDirecTvCustomizationsTwo extends NavigationMixin(LightningElement) {
    @api recordId;
    @api logo;
    @api origin;
    @api returnUrl;
    @api products;
    @api stream;
    @api isGuestUser;
    @api providerStyle;
    serviceDirecTVPlanTwoOptionsLangValue;
    serviceDirecTVPlanTwoOptionsLang = [];
    serviceDirecTVPlanTwoOptionsConnectionValue;
    serviceDirecTVPlanTwoOptionsConnection = [];
    internationalAvailable = true;
    showLanguageOptions = false;
    showConnectionOptions = false;
    title;
    disableNext = true;
    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconLangPreference() {
        return chuzoSiteResources + "/images/icon-lang-preference.svg";
    }

    get iconConnectionPreference() {
        return chuzoSiteResources + "/images/icon-connection-preference.svg";
    }

    get nextBtnDesktopClass() {
        return `btn-rounded btn-center hide-mobile ${this.disableNext && "btn-disabled"}`;
    }

    get nextBtnMobileClass() {
        return `btn-rounded btn-center ${this.disableNext && "btn-disabled"}`;
    }

    connectedCallback() {
        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");
        this.title = this.isGuestUser
            ? "Set your language & connection preferences"
            : "Set the language & connection preferences";

        if (this.isGuestUser) {
            this.handleRadioOptions();
        } else {
            this.handleLatinoPackageAvailability();
        }
    }

    changeViewToServiceDirecTVPlanOne() {
        const goBackEvent = new CustomEvent("back", {});
        this.dispatchEvent(goBackEvent);
    }

    handleRadioOptions() {
        let localOptions = [{ label: "Locals", value: "locals" }];
        let languageOptions = [];
        if (this.products.english.length > 0) {
            let englishOption = { label: "English", value: "english" };
            languageOptions.push(englishOption);
        }
        if (this.products.latino.length > 0 && this.internationalAvailable) {
            let latinoOption = { label: "Spanish", value: "spanish" };
            languageOptions.push(latinoOption);
        }
        if (
            this.products.english.some((e) => !e.product.locals) ||
            this.products.latino.some((e) => !e.product.locals)
        ) {
            let noLocalOption = { label: "No locals", value: "noLocals" };
            localOptions.push(noLocalOption);
        }
        this.serviceDirecTVPlanTwoOptionsConnection = [...localOptions];
        this.serviceDirecTVPlanTwoOptionsLang = [...languageOptions];
        this.showConnectionOptions = localOptions.length > 1;
        this.showLanguageOptions = languageOptions.length > 2;
        this.serviceDirecTVPlanTwoOptionsConnectionValue = this.showConnectionOptions
            ? this.serviceDirecTVPlanTwoOptionsConnectionValue
            : localOptions[0].value;
        this.serviceDirecTVPlanTwoOptionsLangValue = this.showLanguageOptions
            ? this.serviceDirecTVPlanTwoOptionsLangValue
            : languageOptions[0].value;
        this.handleDisable();
    }

    handleChange(event) {
        if (event.target.name === "LangPreference") {
            this.serviceDirecTVPlanTwoOptionsLangValue = event.target.value;
        } else {
            this.serviceDirecTVPlanTwoOptionsConnectionValue = event.target.value;
            if (event.target.value === "noLocals") {
                this.displayNoLocalsModal();
            }
        }
        this.handleDisable();
    }

    handleDisable() {
        this.disableNext =
            this.serviceDirecTVPlanTwoOptionsLangValue === undefined ||
            this.serviceDirecTVPlanTwoOptionsConnectionValue === undefined;
    }

    displayNoLocalsModal() {
        chuzo_modalGeneric.open({
            content: {
                title: "DIRECTV Via Satellite Information",
                provider: "directv",
                body: ENGA_OFFER_DETAIL_MODAL_BODY_6,
                agreeLabel: this.isGuestUser ? "Agree disclosure" : "Customer agrees",
                canClose: false
            }
        });
    }

    handleLatinoPackageAvailability() {
        this.loaderSpinner = true;
        GetInternationalPackage()
            .then((response) => {
                console.log("Get international package response", response);
                this.internationalAvailable = response.result.Account.POE_Espanol_Package__c;
                this.loaderSpinner = false;
                this.handleRadioOptions();
            })
            .catch((error) => {
                console.log(error);
                this.loaderSpinner = false;
                this.logError(error.body?.message || error.message);
            });
    }

    handleNext() {
        const nextEvent = new CustomEvent("next", {
            detail: {
                language: this.serviceDirecTVPlanTwoOptionsLangValue,
                locals: this.serviceDirecTVPlanTwoOptionsConnectionValue
            }
        });
        this.dispatchEvent(nextEvent);
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Products",
            component: "poe_lwcSelfServiceDirecTvCustomizationsTwo",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }
}