import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import selfInstallVerbiage from "@salesforce/label/c.spectrumSelfInstallVerbiage";
import selfServiceValidateLeavingMessage from "@salesforce/label/c.Self_Service_Validate_Leaving_Message";
import selfServiceValidateLeavingTitle from "@salesforce/label/c.Self_Service_Validate_Leaving_Title";
import CHARTER from "@salesforce/label/c.charter";
import CUSTOMER_INFORMATION from "@salesforce/label/c.Customer_Information";
import ORDER_REVIEW from "@salesforce/label/c.Order_Review_Tab_Name";
import CUSTOMER_NAME_ADDRESS from "@salesforce/label/c.Spectrum_Customer_Name_Address_Title";
import PRIMARY_PHONE from "@salesforce/label/c.Spectrum_Primary_Phone_Field";
import EMAIL from "@salesforce/label/c.Spectrum_Email_Field";
import SERVICES_ORDERED from "@salesforce/label/c.Spectrum_Services_Ordered_Title";
import PACKAGE_OPTION from "@salesforce/label/c.Spectrum_Package_Option_Field";
import SESSION_ID from "@salesforce/label/c.Spectrum_Session_Id_Field";
import WORK_ORDER_NUMBER from "@salesforce/label/c.Spectrum_Work_Order_Number_Field";
import ACCOUNTNUMBER from "@salesforce/label/c.Spectrum_AccountNumber_Field";
import ALTERNATIVE_INSTALLATION_DATE from "@salesforce/label/c.Spectrum_Alternative_Installation_Date_Field";
import INSTALLATION_OPTION from "@salesforce/label/c.Spectrum_Installation_Option_Field";
import MOBILE_SALE_BUTTON_LABEL from "@salesforce/label/c.Spectrum_Mobile_Sale_Button_Label";
import SPINNER_ALT_TEXT from "@salesforce/label/c.Spinner_Alternative_Text";
import NONE_LOWERCASE from "@salesforce/label/c.none_lowercase";
import ESTIMATED_DELIVERY_DATE from "@salesforce/label/c.Spectrum_Estimated_Delivery_Date_Label";
import INSTALLATION_DATE from "@salesforce/label/c.Spectrum_Installation_Date_Label";
import OPPORTUNITY_OBJ_NAME from "@salesforce/label/c.Opportunity_Object_Name";


export default class Poe_lwcBuyflowSpectrumApiOrderSummaryTab extends NavigationMixin(LightningElement) {
    @api logo;
    @api cartInfo;
    @api recordId;
    @api orderInfo;
    @api hasPhone;
    @api hasMobile;
    @api installationType;
    @api installationInfo;
    @api earliestDate;
    @api selfInstall;
    @api deliveryDate;
    @api alternativeInstallationInfo;
    @api productSelection;
    @api isGuestUser;

    cart;
    loaderSpinner;
    hasInstallation = false;
    hasAlternativeInstallation = false;
    installationLabel;
    installationValue;
    showCollateral = false;
    labels = {
        selfServiceValidateLeavingTitle,
        selfServiceValidateLeavingMessage,
        selfInstallVerbiage,
        CHARTER,
        CUSTOMER_INFORMATION,
        ORDER_REVIEW,
        CUSTOMER_NAME_ADDRESS,
        PRIMARY_PHONE,
        EMAIL,
        SERVICES_ORDERED,
        PACKAGE_OPTION,
        SESSION_ID,
        WORK_ORDER_NUMBER,
        ACCOUNTNUMBER,
        ALTERNATIVE_INSTALLATION_DATE,
        INSTALLATION_OPTION,
        MOBILE_SALE_BUTTON_LABEL,
        SPINNER_ALT_TEXT
    };
    showSelfServiceCancelModal = false;

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        this.cart = { ...this.cartInfo };
        this.installationLabel = this.selfInstall ? ESTIMATED_DELIVERY_DATE : INSTALLATION_DATE;
        this.hasInstallation = Object.keys(this.installationInfo).length > 0 || this.deliveryDate !== NONE_LOWERCASE;
        if (this.hasInstallation) {
            this.installationValue = `${
                this.deliveryDate !== NONE_LOWERCASE ? this.deliveryDate : this.installationInfo.installationDetail.date
            } ${
                this.selfInstall
                    ? ""
                    : `${this.installationInfo.installationDetail.startTime}-${this.installationInfo.installationDetail.endTime}`
            }
            `;
        }
        this.hasAlternativeInstallation = Object.keys(this.alternativeInstallationInfo).length > 0;
    }

    handleCancel() {
        if (this.isGuestUser) {
            this.showSelfServiceCancelModal = true;
        } else {
            this[NavigationMixin.Navigate]({
                type: "standard__recordPage",
                attributes: {
                    recordId: this.recordId,
                    objectApiName: OPPORTUNITY_OBJ_NAME,
                    actionName: "view"
                }
            });
        }
    }
    hideSelfServiceModal() {
        this.showSelfServiceCancelModal = false;
    }

    selfServiceReturnToHomePage() {
        const goBackEvent = new CustomEvent("home", {
            detail: "",
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(goBackEvent);
    }

    handleClick() {
        const sendReviewNextEvent = new CustomEvent("reviewnext");
        this.dispatchEvent(sendReviewNextEvent);
    }

    handleCollateral(event) {
        this.showCollateral = event.detail === "show" ? true : false;
    }
}