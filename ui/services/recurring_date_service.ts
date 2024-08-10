/* 
 * BudgetBug - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2024  Sidhin S Thomas <sidhin.thomas@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * The source is available at: https://github.com/ParadoxZero/budgetbud
 */

import { Recurring, RecurringType } from "../datamodel/datamodel";

export class RecurringCalculatorService {
    public calculateNextDate(recurring: Recurring): Date {
        const next_date = new Date(recurring.lastUpdated);
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
        const date = new Date(Date.now());
        if (date.getDay() < recurring.frequencey_unit) {
            date.setDate(date.getDate() + recurring.frequencey_unit - date.getDay());
            return date;
        } else {
            date.setDate(date.getDate() + 7 - date.getDay() + recurring.frequencey_unit);
            return date;
        }
    }

    private calculateNextDateForMonthly(recurring: Recurring): Date {
        const date = new Date(Date.now());
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
        const date = new Date(Date.now());
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