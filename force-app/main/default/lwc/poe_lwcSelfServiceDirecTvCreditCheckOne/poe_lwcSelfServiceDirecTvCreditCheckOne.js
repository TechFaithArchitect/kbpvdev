import { LightningElement, api } from "lwc";
import { loadStyle } from "lightning/platformResourceLoader";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import ToastContainer from "lightning/toastContainer";
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import saveAccountInformation from "@salesforce/apex/CreditCheckTabController.saveAccountInformation";
import getIPStackSettings from "@salesforce/apex/InfoTabController.getIPStackSettings";
import saveFlagIP from "@salesforce/apex/CreditCheckTabController.saveFlagIP";
import CONSENT_DISCLAIMER from "@salesforce/label/c.Self_Service_Consent_Text";
import DTV_CONSENT_DISCLAIMER from "@salesforce/label/c.DTV_Consent_Text";
import DTV_CONSENT_SHOW from "@salesforce/label/c.DTV_Consent_Show";
import updateConsent from "@salesforce/apex/POE_TermsAndConditionsController.updateCommunicationConsent";

const INTERNAL_ERROR = "Internal Error";
const EMAIL_REGEX = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
const PHONE_REGEX = /^\d{10}$/;

const CONTACT_METHOD_MAP = {
    telephone: "Phone",
    email: "Email"
};
export default class Poe_lwcSelfServiceDirecTvCreditCheckOne extends LightningElement {
    @api recordId;
    @api contactInfo;
    @api addressInfo;
    @api cartInfo;
    @api isGuestUser;
    @api isStream;
    @api orderInfo;
    @api referralCodeData;

    isLoading;
    states = [];
    firstName;
    lastName;
    emailAddress;
    phoneNumber;
    contactMethod;
    accountId;
    contactMethodOptions = [
        {
            label: "Email",
            value: "EMAIL"
        },
        {
            label: "SMS",
            value: "SMS"
        },
        {
            label: "Telephone",
            value: "TELEPHONE"
        }
    ];
    verbiages = {};
    terms;
    smsTermsAgreed = false;
    phoneTermsAgreed = false;
    disclosureAgreement = false;
    optIn = false;
    consentLabel = CONSENT_DISCLAIMER;
    dtvConsentLabel = DTV_CONSENT_DISCLAIMER;
    dtvConsent = false;
    showConsentRadio = DTV_CONSENT_SHOW === "show";

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    get iconBtnBack() {
        return chuzoSiteResources + "/images/icon-back.svg";
    }

    get iconFormUser() {
        return chuzoSiteResources + "/images/icon-user-profile.svg";
    }

    // this should be in the cart component
    get iconProviderLogoDirectv() {
        return chuzoSiteResources + "/images/provider-logo-directv.svg";
    }

    get disableNext() {
        return !(
            (!this.isTelephoneContactMethod || (this.isTelephoneContactMethod && this.phoneTermsAgreed)) &&
            (!this.isSMSContactMethod || (this.isSMSContactMethod && this.smsTermsAgreed)) &&
            !this.disableForm &&
            this.firstName &&
            this.lastName &&
            this.phoneNumber &&
            this.emailAddress &&
            this.contactMethod &&
            EMAIL_REGEX.test(this.emailAddress) &&
            PHONE_REGEX.test(this.phoneNumber)
        );
    }

    get disableForm() {
        return !this.disclosureAgreement && this.isNotGuestUser;
    }

    get nextBtnDesktopClass() {
        return `btn-rounded btn-center hide-mobile ${this.disableNext && "btn-disabled"}`;
    }

    get nextBtnMobileClass() {
        return `btn-rounded btn-center ${this.disableNext && "btn-disabled"}`;
    }

    get isSMSContactMethod() {
        return this.contactMethod === "SMS";
    }

    get isTelephoneContactMethod() {
        return this.contactMethod === "TELEPHONE";
    }

    get agreementVerbiage() {
        return this.isGuestUser
            ? "I have read the above disclosures, and I agree"
            : "I have read the above disclosures to the customer, and the customer agreed";
    }

    connectedCallback() {
        if (this.isGuestUser) {
            const toastContainer = ToastContainer.instance();
            toastContainer.maxShown = 5;
            toastContainer.toastPosition = "top-center";
        }

        loadStyle(this, chuzoSiteResources + "/css/common.css");
        loadStyle(this, chuzoSiteResources + "/css/mobile.css");

        for (let i = 0; i < 24; i++) {
            let value;
            if (i < 12) {
                value = `${i.length == 1 ? "0" + i : i}:00 am to ${(i + 1).length == 1 ? "0" + i + 1 : i + 1}:00 ${
                    i === 11 ? "pm" : "am"
                }`;
            } else if (i == 12) {
                value = `12:00 pm to 01:00 pm`;
            } else {
                let pmValue = i - 12;
                value = `${pmValue.length == 1 ? "0" + pmValue : pmValue}:00 pm to ${
                    (pmValue + 1).length == 1 ? "0" + pmValue + 1 : pmValue + 1
                }:00 pm`;
            }
        }

        this.firstName = this.contactInfo?.firstName;
        this.lastName = this.contactInfo?.lastName;
        this.emailAddress = this.contactInfo?.email;
        this.phoneNumber = this.contactInfo?.phone;
        this.contactMethod = this.contactInfo?.method;

        this.handleCallCms();
        this.saveIP();
    }

    handleBack() {
        const backEvent = new CustomEvent("back");
        this.dispatchEvent(backEvent);
    }

    handleChange(e) {
        if (typeof e.detail.checked === "boolean") {
            this[e.currentTarget.dataset.fieldName] = e.detail.checked;
        } else {
            this[e.currentTarget.dataset.fieldName] = e.detail.value?.trim();
        }

        if (!this.isSMSContactMethod) this.smsTermsAgreed = false;
        if (!this.isTelephoneContactMethod) this.phoneTermsAgreed = false;
    }

    async handleNext() {
        if (this.disableNext) {
            return;
        }

        if (this.isGuestUser) {
            this.isLoading = true;
            await this.saveAccountInfo();
            this.isLoading = false;
        }
        if (this.dtvConsent) {
            this.handleSMSConsent();
        } else {
            this.handleMoveNext();
        }
    }

    handleSMSConsent() {
        this.isLoading = true;
        const path = "updateConsent";
        let myData = {
            path,
            partnerName: this.isStream ? "enga-stream" : "enga",
            systemCode: this.orderInfo.systemCode,
            correlationId: this.orderInfo.correlationId,
            uuid: this.orderInfo.uuid,
            sid: this.orderInfo.sid,
            phonenumber: this.phoneNumber,
            consents: [
                {
                    consentName: "SMSServiceCommunications",
                    transactionType: "YES"
                }
            ]
        };
        console.log("Update Consent Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("Update Consent Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                    this.isLoading = false;
                } else {
                    this.handleUpdateConsent();
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The CMSurl request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                this.isLoading = false;
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            });
    }

    handleUpdateConsent() {
        updateConsent({ opportunityId: this.recordId })
            .then((response) => {
                this.handleMoveNext();
                this.isLoading = false;
            })
            .catch((error) => {
                console.error("ERROR", error);
            });
    }

    handleMoveNext() {
        const nextEvent = new CustomEvent("next", {
            detail: {
                accountId: this.accountId,
                customer: {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    email: this.emailAddress,
                    phone: this.phoneNumber,
                    method: this.contactMethod
                },
                verbiages: this.verbiages,
                terms: this.terms
            }
        });
        this.dispatchEvent(nextEvent);
    }

    handleConsent(event) {
        if (event.target.name === "optIn") {
            this.optIn = event.target.checked;
        } else {
            this.dtvConsent = event.target.checked;
        }
    }

    saveAccountInfo() {
        const contactMethod = CONTACT_METHOD_MAP[this.contactMethod.toLowerCase()]
            ? CONTACT_METHOD_MAP[this.contactMethod.toLowerCase()]
            : this.contactMethod;
        const data = {
            accName: this.firstName + " " + this.lastName,
            ContextId: this.recordId,
            recordTypeName: "Person Account",
            consent: this.optIn,
            preferredContactMethod: contactMethod,
            creditCheck: {
                customerDetails: {
                    contactInformation: {
                        firstName: this.firstName,
                        middleName: this.middleName == null || this.middleName == undefined ? "" : this.middleName,
                        lastName: this.lastName,
                        email: this.emailAddress,
                        contactPhone: this.phoneNumber
                    }
                },
                accountDetails: {
                    billingCreditCheckAddress: {
                        billingAddress: this.addressInfo.address,
                        billingAptNumber: this.addressInfo.apt,
                        billingCity: this.addressInfo.city,
                        billingState: this.addressInfo.state,
                        billingStateName: this.addressInfo.stateName,
                        billingZip: this.addressInfo.zip
                    },
                    shippingServiceAddresss: {
                        shippingAddress: this.addressInfo.address,
                        shippingAptNumber: this.addressInfo.apt,
                        shippingCity: this.addressInfo.city,
                        shippingZip: this.addressInfo.zip,
                        shippingState: this.addressInfo.state,
                        shippingStateName: this.addressInfo.stateName
                    }
                }
            }
        };

        console.log("Save Account Information Request", data);
        return saveAccountInformation({ myData: data })
            .then((response) => {
                console.log("Save Account Information Response", response);
                if (
                    response.result.hasOwnProperty("result") &&
                    response.result.result.hasOwnProperty("errors") &&
                    response.result.result.errors.hasOwnProperty("DRSaveClientContact") &&
                    response.result.result.errors.DRSaveClientContact.hasOwnProperty("0:0")
                ) {
                    const event = new ShowToastEvent({
                        title: "Error",
                        mode: "sticky",
                        variant: "error",
                        message: "The Phone or Address information is already associated with another customer"
                    });
                    this.dispatchEvent(event);
                } else {
                    this.accountId = response.result.Account.Id;
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
            });
    }

    logError(errorMessage, type = INTERNAL_ERROR) {
        const error = {
            type,
            tab: "Customer Information 1",
            component: "poe_lwcSelfServiceDirecTvCreditCheckOne",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }

    saveIP() {
        if (this.isGuestUser) {
            return;
        }

        let myData = {};
        getIPStackSettings()
            .then((response) => {
                const Http = new XMLHttpRequest();
                let url = response.result.URL__c ? response.result.URL__c : "https://api.ipstack.com/";
                url = url + "check?access_key=" + response.result.Password__c;
                Http.open("GET", url);
                Http.send();
                Http.onreadystatechange = (e) => {
                    if (Http.readyState == 4 && Http.status == 200) {
                        let data = JSON.parse(Http.responseText);
                        this.clientIp = data.ip;
                        myData = {
                            ContextId: this.recordId,
                            IP: this.clientIp
                        };
                        saveFlagIP({ myData: myData })
                            .then((response) => {
                                console.log("IP Saved");
                            })
                            .catch((error) => {
                                console.error(error, "ERROR");
                                this.logError(error.body?.message || error.message);
                            });
                    }
                };
            })
            .catch((error) => {
                console.error(error, "ERROR");
                this.logError(error.body?.message || error.message);
            });
    }

    handleCallCms() {
        this.isLoading = true;
        let contentDetails = [];
        let content = [
            "CREDIT_CHECK_DISCLOSURE",
            "contactInformation",
            "smsPreference",
            "TNC_AUTOPAY",
            "TNC_PAPERLESS_BILLING",
            "directvPolicy",
            "INSTALLATION_DISCLOSURE",
            "PAYMENT_DISCLOSURE",
            "TNC_RESIDENTIAL_AGREEMENT",
            "TNC_EQUIPMENT_LEASE_AGREEMENT",
            "TNC_DIRECTV_PRIVACYPOLICY",
            "TNC_NOTICE_CANCEL_AGREEMENT",
            "TNC_NOTICE_CANCEL_DISCLOSURE"
        ];
        content.forEach((item) => {
            let detail = {
                content: item,
                subChannel: this.orderInfo.subChannel,
                stateId: "ALL",
                systemId: "",
                channel: this.orderInfo.channel
            };
            contentDetails.push(detail);
        });
        const path = "cmsUrl";
        let myData = {
            path,
            systemCode: this.isStream ? "ENGA-CHUZO" : this.orderInfo.systemCode,
            partnerName: "enga",
            correlationId: this.orderInfo.correlationId,
            contentDetails
        };
        console.log("CMSurl Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData })
            .then((response) => {
                apiResponse = response;
                let result = JSON.parse(response);
                console.log("CMSurl Response", result);
                if (result.hasOwnProperty("error")) {
                    let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                        result.error.hasOwnProperty("provider")
                            ? result.error.provider.message.hasOwnProperty("message")
                                ? result.error.provider.message.message
                                : result.error.provider.message.hasOwnProperty("errorDescription")
                                ? result.error.provider.message.errorDescription
                                : result.error.provider.message.hasOwnProperty("error")
                                ? result.error.provider.message.error.message
                                : result.error.provider.message
                            : result.error.message
                    }.`;
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message: errorMessage
                    });
                    this.dispatchEvent(event);
                    this.logError(`${errorMessage}\nAPI Response: ${response}`, myData, path, "API Error");
                } else {
                    this.verbiages = {
                        creditCheck: result[0].cmsContent.split("<p>")[1].split("</p>")[0],
                        contactInformation: result[1].cmsContent,
                        smsPreference: result[2].cmsContent,
                        autoPay: result[3].cmsContent,
                        paperlessBilling: result[4].cmsContent,
                        directvPolicy: result[5].cmsContent,
                        serviceInstallation: result[6].cmsContent,
                        paymentDisclosure: result[7].cmsContent,
                        cancellationDisclosure: result[11].cmsContent,
                        cancellationAgreement: result[12].cmsContent
                    };
                    this.terms = [
                        {
                            consentLabel: "DIRECTV Residential Customer Agreement",
                            consentText: result[8].cmsContent,
                            checked: false,
                            id: "RES-AGREEMENT"
                        },
                        {
                            consentLabel: "DIRECTV Equipment Lease Agreement",
                            consentText: result[9].cmsContent,
                            checked: false,
                            id: "LEASE-AGREEMENT"
                        },
                        {
                            consentLabel: "DIRECTV Video Apps and Device Privacy Policy",
                            consentText: result[10].cmsContent,
                            checked: false,
                            id: "VIDEO-APPS"
                        }
                    ];
                }
            })
            .catch((error) => {
                console.error(error, "ERROR");
                const genericErrorMessage =
                    "The CMSurl request could not be made correctly to the server. Please, validate the information and try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: genericErrorMessage
                });
                this.dispatchEvent(event);
                if (apiResponse) {
                    this.logError(`${genericErrorMessage}\nAPI Response: ${apiResponse}`, myData, path, "API Error");
                } else {
                    const errorMessage = error.body?.message || error.message;
                    this.logError(errorMessage);
                }
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
}