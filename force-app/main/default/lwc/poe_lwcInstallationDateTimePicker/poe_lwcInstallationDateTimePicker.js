import { LightningElement, api } from "lwc";

export default class Poe_lwcInstallationDateTimePicker extends LightningElement {
    @api dateTimeLabel;
    @api dateLabel;
    @api timeLabel;
    @api datePlaceholder;
    @api timePlaceholder;
    @api availableDateTimes;
    @api required;
    @api value;
    @api availableDatesOnly;
    @api isGuestUser;

    availableTimesByDate = {};
    timeOptions;
    dateValue;
    timeValue;
    showDatePicker = false;
    datePickerClicked = false;

    get dropdownTriggerClass() {
        return this.showDatePicker
            ? "slds-form-element slds-dropdown-trigger slds-dropdown-trigger_click slds-col slds-is-open"
            : "slds-form-element slds-dropdown-trigger slds-dropdown-trigger_click slds-col";
    }

    get dateValueStr() {
        if (typeof this.dateValue === "string" && this.dateValue) {
            return this.dateValue;
        }

        if (this.dateValue && this.dateValue.dateStr) {
            return this.dateValue.dateStr;
        }

        return "";
    }

    get defaultDateTimeLabel() {
        return this.dateTimeLabel ? this.dateTimeLabel : "Date and Time";
    }

    get defaultDateLabel() {
        return this.dateLabel ? this.dateLabel : "Date";
    }

    get defaultTimeLabel() {
        return this.timeLabel ? this.timeLabel : "Time";
    }

    get defaultDatePlaceholder() {
        return this.datePlaceholder ? this.datePlaceholder : "Select a date...";
    }

    get defaultTimePlaceholder() {
        return this.timePlaceholder ? this.timePlaceholder : "Select a time...";
    }

    get availableDates() {
        return this.availableDatesOnly || Object.keys(this.availableTimesByDate);
    }

    get disableTimeInput() {
        return !this.timeOptions;
    }

    get showTimePicker() {
        return this.availableDateTimes != undefined;
    }

    get isNotGuestUser() {
        return !this.isGuestUser;
    }

    connectedCallback() {
        if (this.availableDateTimes && this.availableDateTimes.length > 0) {
            this.handleAvailableDateTimes();
        }

        if (this.value) {
            this.dateValue = this.value.split(" ")[0];
            this.timeValue = this.value.substring(this.value.indexOf(" ")).trim();
            this.timeOptions = this.availableTimesByDate[this.dateValue];
        }
    }

    handleIconShowDatePicker() {
        this.datePickerClicked = true;
        const inputEl = this.template.querySelector('[data-id="dateinput"]');
        if (inputEl) inputEl.focus();
        this.handleShowDatePicker();
    }

    handleShowDatePicker() {
        this.showDatePicker = true;
    }

    hideDatePicker() {
        this.showDatePicker = false;
    }

    handleInputBlur(e) {
        if (!this.datePickerClicked) {
            this.hideDatePicker();
        }
        this.datePickerClicked = false;
    }

    handleDatePickerMouseDown() {
        this.datePickerClicked = true;
    }

    handleDatePickerClick() {
        const inputEl = this.template.querySelector('[data-id="dateinput"]');
        if (inputEl) inputEl.focus();
    }

    handleDateChange(e) {
        this.dateValue = e.detail;
        this.timeOptions = this.availableTimesByDate[this.dateValueStr];
        if (this.timeOptions && this.timeOptions.length) {
            this.timeValue = this.timeOptions[0]?.value;
        }
        this.hideDatePicker();
        this.dispatchChangeEvent();
    }

    handleTimeChange(e) {
        this.timeValue = e.detail.value;
        this.dispatchChangeEvent();
    }

    dispatchChangeEvent() {
        this.dispatchEvent(
            new CustomEvent("datetimechange", {
                detail: {
                    dateValue: this.dateValueStr,
                    timeValue: this.timeValue
                }
            })
        );
    }

    handleAvailableDateTimes() {
        this.availableDateTimes.forEach((dateTime) => {
            const timeOption = {
                label: dateTime.timeSlot,
                value: dateTime.hasOwnProperty("apiTimeSlot") ? dateTime.apiTimeSlot : dateTime.timeSlot
            };
            if (this.availableTimesByDate[dateTime.date]) {
                this.availableTimesByDate[dateTime.date].push(timeOption);
            } else {
                this.availableTimesByDate[dateTime.date] = [timeOption];
            }
        });
    }
}