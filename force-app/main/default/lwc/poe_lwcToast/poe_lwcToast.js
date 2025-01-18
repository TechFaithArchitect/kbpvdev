import { LightningElement, api } from 'lwc';

const VARIANT_PARAMS_BY_NAME = {
    success: {
        iconName: 'utility:success',
        iconClass: 'slds-icon_container slds-icon-utility-success slds-m-right_small slds-no-flex slds-align-top',
        variant: 'inverse',
        altText: 'Success',
        themeClass: 'slds-notify slds-notify_toast slds-theme_success',
    },
    error: {
        iconName: 'utility:error',
        iconClass: 'slds-icon_container slds-icon-utility-error slds-m-right_small slds-no-flex slds-align-top',
        variant: 'inverse',
        altText: 'Error',
        themeClass: 'slds-notify slds-notify_toast slds-theme_error'
    },
    warning: {
        iconName: 'utility:warning',
        iconClass: 'slds-icon_container slds-icon-utility-warning slds-m-right_small slds-no-flex slds-align-top',
        variant: '',
        altText: 'Warning',
        themeClass: 'slds-notify slds-notify_toast slds-theme_warning'
    },
    info: {
        iconName: 'utility:info',
        iconClass: 'slds-icon_container slds-icon-utility-info slds-m-right_small slds-no-flex slds-align-top',
        variant: 'inverse',
        altText: 'Info',
        themeClass: 'slds-notify slds-notify_toast slds-theme_info'
    }
}
const DEFAULT_DURATION = 3000;
export default class Poe_lwcToast extends LightningElement {
    @api toast;
    show = false;
    variant = 'info'; // 'info', 'error', 'warning' or 'success'.
    title;
    message;
    mode = 'dismissible'; // 'dismissible', 'pester' or 'sticky'.
    duration = DEFAULT_DURATION;
    key;

    get variantParams() {
        if (!VARIANT_PARAMS_BY_NAME[this.variant]) {
            return VARIANT_PARAMS_BY_NAME['info'];
        }

        return VARIANT_PARAMS_BY_NAME[this.variant];
    }

    get closeTime() {
        return [ 'dismissible', 'pester', '', undefined ].includes(this.mode)
            ? this.duration
            : undefined;
    }

    get showClose() {
        return this.mode !== 'pester';
    }

    get toastContainerClass() {
        return this.show 
            ? 'slds-notify_container slds-is-relative slds-transition-show'
            : 'slds-notify_container slds-is-relative slds-transition-hide';
    }

    connectedCallback() {
        this.variant = this.toast.variant || 'info';
        this.title = this.toast.title;
        this.message = this.toast.message;
        this.mode = this.toast.mode || 'dismissible';
        this.duration = this.toast.duration || DEFAULT_DURATION;

        setTimeout(() => {
            this.show = true;
            
            if (!this.closeTime) {
                return;
            }
    
            setTimeout(() => this.hideToast(), this.closeTime);    
        }, 0);
    }

    hideToast() {
        if (!this.show) return;
        this.show = false;
        // Send toastend event after timeout to allow animation to play
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('toastend', {
                detail: {
                    key: this.toast.key
                }
            }));
        }, 250);
    }
}