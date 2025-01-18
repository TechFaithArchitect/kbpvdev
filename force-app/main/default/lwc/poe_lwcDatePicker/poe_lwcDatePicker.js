import { LightningElement, api } from 'lwc';

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const WEEKDAYS = [
    { label: 'Sunday', shortLabel: 'Sun' },
    { label: 'Monday', shortLabel: 'Mon' },
    { label: 'Tuesday', shortLabel: 'Tue' },
    { label: 'Wednesday', shortLabel: 'Wed' },
    { label: 'Thursday', shortLabel: 'Thu' },
    { label: 'Friday', shortLabel: 'Fri' },
    { label: 'Saturday', shortLabel: 'Sat' },
];

export default class Poe_lwcDatePicker extends LightningElement {
    _availableDates;
    _selectedDate;
    availableDatesSet = new Set();
    weekdays = WEEKDAYS;
    dateRows = [];
    year;
    month;

    @api
    get selectedDate() {
        return this._selectedDate;
    }
    set selectedDate(value) {
        if (!value) {
            this._selectedDate = value;
            return;
        }

        if (typeof value === 'string') {
            const dateStrArr = value.split('-');
            this._selectedDate = {
                year: Number(dateStrArr[0]),
                month: Number(dateStrArr[1]) - 1,
                dayOfMonth: Number(dateStrArr[2])
            };
        } else {
            this._selectedDate = {
                year: Number(value.year),
                month: Number(value.month),
                dayOfMonth: Number(value.dayOfMonth)
            };
        }
    }

    @api 
    get availableDates() {
        return this._availableDates;
    }
    set availableDates(value) {
        this._availableDates = value;

        if (this.hasAvailableDates) {
            this.setAvailableDaysByDate();
        }
    }

    get monthLabel() {
        return MONTHS[this.month];
    }

    get hasAvailableDates() {
        return this.availableDates && this.availableDates.length > 0;
    }

    connectedCallback() {
        if (!this.selectedDate) {
            const today = new Date();
            this.year = today.getFullYear();
            this.month = today.getMonth();
        
            this.selectedDate = {
                year: this.year,
                month: this.month,
                dayOfMonth: today.getDate()
            };
        } else {
            this.year = this.selectedDate.year;
            this.month = this.selectedDate.month;
        }
        
        this.setDates();
    }

    setDates() {
        const dates = [];
        const start = new Date(this.year, this.month, 1).getDay();
        const endDate = new Date(this.year, this.month + 1, 0).getDate();
        const end = new Date(this.year, this.month, endDate).getDay();
        const endDatePrev = new Date(this.year, this.month, 0).getDate();

        for (let i = start; i > 0; i--) {
            const newDate = { 
                year: this.month === 0 ? this.year - 1 : this.year,
                month: this.month === 0 ? 11 : this.month - 1,
                date: endDatePrev - i + 1, 
                className: 'slds-day_adjacent-month', 
            };
            const dateStr = `${newDate.year}-${this.zeroFill(newDate.month + 1)}-${this.zeroFill(newDate.date)}`;
            const isDisabled = this.hasAvailableDates && !this.availableDatesSet.has(dateStr);
            newDate.disabled = isDisabled;
            newDate.className += isDisabled ? ' disabled' : '';
            dates.push(newDate);
        }

        const today = new Date();
        for (let i = 1; i <= endDate; i++) {
            const dateStr = `${this.year}-${this.zeroFill(this.month + 1)}-${this.zeroFill(i)}`;
            const isDisabled = this.hasAvailableDates && !this.availableDatesSet.has(dateStr);
            const isToday = i === today.getDate() &&
                          this.month === today.getMonth() &&
                          this.year === today.getFullYear();

            const isSelected = !isDisabled && i === this.selectedDate.dayOfMonth &&
                             this.month === this.selectedDate.month &&
                             this.year === this.selectedDate.year;

            dates.push({ 
                year: this.year,
                month: this.month,
                date: i, 
                className: `${isToday ? 'slds-is-today' : ''} ${
                            isSelected ? 'slds-is-selected' : ''} ${
                            isDisabled ? 'disabled' : ''}`,
                disabled: isDisabled
            });
        }

        for (let i = end; i < 6; i++) {
            const newDate = { 
                year: this.month === 11 ? this.year + 1 : this.year,
                month: this.month === 11 ? 0 : this.month + 1,
                date: i - end + 1, 
                className: 'slds-day_adjacent-month', 
            };
            const dateStr = `${newDate.year}-${this.zeroFill(newDate.month + 1)}-${this.zeroFill(newDate.date)}`;
            const isDisabled = this.hasAvailableDates && !this.availableDatesSet.has(dateStr);
            newDate.disabled = isDisabled;
            newDate.className += isDisabled ? ' disabled' : '';
            dates.push(newDate);
        }

        this.dateRows = [];
        let currentRow;
        dates.forEach((date, i) => {
            if (i % 7 === 0) {
                currentRow = {
                    dates: [],
                    range: `${i}-${i+7}`
                };
                this.dateRows.push(currentRow);
            }
            currentRow.dates.push(date);
        });
    }

    setAvailableDaysByDate() {
        this.availableDates.forEach(avDate => {
            this.availableDatesSet.add(avDate);
        });
    }

    handleMonthChange(e) {
        const buttonName = e.currentTarget.name;

        if (buttonName === "prev" && this.month === 0) {
            this.year--;
            this.month = 11;
        } else if (buttonName === "next" && this.month === 11) {
            this.year++;
            this.month = 0;
        } else {
            this.month = buttonName === "next" ? this.month + 1 : this.month - 1;
        }

        const date = new Date(this.year, this.month, 1);
        this.year = date.getFullYear();
        this.month = date.getMonth();

        this.setDates();
    }

    handleDateSelect(e) {
        const disabled = String(e.currentTarget.dataset.disabled);
        if (disabled === 'true') return;

        this.year = Number(e.currentTarget.dataset.year);
        this.month = Number(e.currentTarget.dataset.month);
        this.selectedDate = {
            year: this.year,
            month: this.month,
            dayOfMonth: Number(e.currentTarget.dataset.date)
        };
        
        this.setDates();

        const { year, month, dayOfMonth } = this.selectedDate;
        this.dispatchEvent(new CustomEvent('datechange', {
            detail: {
                ...this.selectedDate,
                dateStr: `${year}-${this.zeroFill(month + 1)}-${this.zeroFill(dayOfMonth)}`
            }
        }));
    }

    zeroFill(num) {
        num = String(num);
        while (num.length < 2) num = "0" + num;
        return num;
    }
}