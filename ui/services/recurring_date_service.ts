import { Recurring, RecurringType } from "../datamodel/datamodel";

export class RecurringCalculatorService {
    public calculateNextDate(recurring: Recurring): Date {
        let next_date = new Date(recurring.lastUpdated);
        switch (recurring.frequency) {
            case RecurringType.weekly:
                return this.calculateNextDateForWeekly(recurring);
            case RecurringType.monthly:
                return this.calculateNextDateForMonthly(recurring);
            case RecurringType.yearly:
                return this.calculateNextDateForYearly(recurring);
        }
        return next_date;
    }

    private calculateNextDateForWeekly(recurring: Recurring): Date {
        let date = new Date(Date.now());
        if (date.getDay() < recurring.frequencey_unit) {
            date.setDate(date.getDate() + recurring.frequencey_unit - date.getDay());
            return date;
        } else {
            date.setDate(date.getDate() + 7 - date.getDay() + recurring.frequencey_unit);
            return date;
        }
    }

    private calculateNextDateForMonthly(recurring: Recurring): Date {
        let date = new Date(Date.now());
        if (date.getDate() < recurring.frequencey_unit) {
            date.setDate(recurring.frequencey_unit);
            return date;
        } else {
            date.setMonth(date.getMonth() + 1);
            date.setDate(recurring.frequencey_unit);
            return date;
        }
    }

    private calculateNextDateForYearly(recurring: Recurring): Date {
        let date = new Date(Date.now());
        if (date.getMonth() < recurring.frequencey_unit) {
            date.setMonth(recurring.frequencey_unit);
            return date;
        } else {
            date.setFullYear(date.getFullYear() + 1);
            date.setMonth(recurring.frequencey_unit);
            return date;
        }
    }
}