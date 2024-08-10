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

//The data_id would be sharable with another user if for e.g. a family wants to track their expenses together.
// will result in a complex merge resolution. But should be doable.
export interface User {
    email: string;
    isVerified: boolean;
    isActive: boolean;
    data_id: string;
}


export interface Expense {
    id: number;
    title: string;
    amount: number;
    categoryId: number;
    timestamp: number;
}

export interface Unplanned {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
}

export enum RecurringType {
    weekly = 0,
    biweekly = 1,
    monthly = 2,
    quarterly = 3, // unsupported
    halfYearly = 4, // unsupported
    yearly = 5
}
export interface Recurring {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    lastUpdated: number;
    frequency: RecurringType;
    frequencey_unit: number; // This has different meanings based on the frequency, if monthly, it will be day of month, if weekly, it will be day of week etc.
    startDate: number;
    endDate: number;
    amount: number;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    allocation: number;
    isActive: boolean;
    lastUpdated: number;
    currency: string;
    expenseList: Expense[];
}

export interface CategoryLog {
    id: number;
    timestamp: number;
    allocation: number;
}

export interface TimeUnit {
    month: number;
    year: number;
}

export enum UserActionType {
    addCategory = 0,
    deleteCategory = 1,
    updateCategory = 2,
    addExpense = 3,
    deleteExpense = 4,
    updateExpense = 5,
    addRecurring = 6,
    deleteRecurring = 7,
    updateRecurring = 8,
    addUnplanned = 9,
    deleteUnplanned = 10,
    updateUnplanned = 11
}

export interface UserAction {
    timestamp: number;
    type: UserActionType;
    payload: Category | Expense | Recurring | Unplanned | null;
}

// TODO: Design Question -
// It will be impossible to delete a non-empty category. User will have to wait till next month when 
// the category is reset. Otherwise explicitly delete the expenses in the category. Or should we allow
// deletion of non-empty categories with a warning?
export interface Budget {
    id: string;
    name: string;
    history_id: string;
    categoryList: Category[];
    recurringList: Recurring[];
    unplannedList: Unplanned[];
    period: TimeUnit;
    userActions: UserAction[];
    last_updated: number;
    authorized_users: string[];
}

export interface BudgetHistory {
    id: string;
    history: Budget[];
}

export class DataModelFactory {

    static createExpense(lastUsedId: number, categoryId: number, amount: number): Expense {
        const id = lastUsedId + 1;
        return {
            id,
            title: '',
            amount: amount,
            categoryId,
            timestamp: Date.now()
        };
    }

    static createUnplanned(lastUsedId: number): Unplanned {
        const id = lastUsedId + 1;
        return {
            id,
            name: '',
            description: '',
            isActive: false
        };
    }

    static createRecurring(lastUsedId: number): Recurring {
        const id = lastUsedId + 1;
        return {
            id,
            name: '',
            description: '',
            isActive: false,
            lastUpdated: Date.now(),
            frequency: RecurringType.weekly,
            frequencey_unit: 0,
            startDate: Date.now(),
            endDate: Date.now(),
            amount: 0
        };
    }

    static createCategory(lastUsedId: number): Category {
        const id = lastUsedId + 1;
        return {
            id,
            name: '',
            description: '',
            allocation: 0,
            isActive: false,
            lastUpdated: Date.now(),
            currency: '',
            expenseList: []
        };
    }

    static createCategoryLog(lastUsedId: number): CategoryLog {
        const id = lastUsedId + 1;
        return {
            id,
            timestamp: Date.now(),
            allocation: 0
        };
    }

    static createTimeUnit(): TimeUnit {
        return {
            month: 0,
            year: 0
        };
    }

    static createUserAction(): UserAction {
        return {
            timestamp: Date.now(),
            type: UserActionType.addCategory,
            payload: {} as Category | Expense | Recurring | Unplanned
        };
    }

    static createBudget(name: string): Budget {
        return {
            id: Math.random().toString(),
            name,
            history_id: '',
            categoryList: [],
            recurringList: [],
            unplannedList: [],
            period: {
                month: new Date(Date.now()).getMonth(),
                year: new Date(Date.now()).getFullYear()
            },
            userActions: [],
            last_updated: Date.now(),
            authorized_users: []
        };
    }

    static createBudgetHistory(): BudgetHistory {
        return {
            id: Math.random().toString(),
            history: []
        };
    }
}