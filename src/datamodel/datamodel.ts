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
    timestamp: Date;
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
    quarterly = 3,
    halfYearly = 4,
    yearly = 5
}
export interface Recurring {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    lastUpdated: Date;
    frequency: RecurringType;
    frequencey_unit: number; // This has different meanings based on the frequency, if monthly, it will be day of month, if weekly, it will be day of week etc.
    startDate: Date;
    endDate: Date;
    amount: number;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    allocation: number;
    isActive: boolean;
    lastUpdated: Date;
    currency: string;
    expenseList: Expense[];
}

export interface CategoryLog {
    id: number;
    timestamp: Date;
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
    timestamp: Date;
    type: UserActionType;
    payload: Category | Expense | Recurring | Unplanned;
}

// TODO: Design Question -
// It will be impossible to delete a non-empty category. User will have to wait till next month when 
// the category is reset. Otherwise explicitly delete the expenses in the category. Or should we allow
// deletion of non-empty categories with a warning?
export interface UserData {
    id: string;
    history_id: string;
    categoryList: Category[];
    recurringList: Recurring[];
    unplannedList: Unplanned[];
    history_unit: TimeUnit;
    userActions: UserAction[];
    last_updated: Date;
    authorized_users: string[];
}

export interface UserDataHistory {
    id: string;
    history: UserData[];
}