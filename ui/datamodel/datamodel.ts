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
    quarterly = 3, // unsupported
    halfYearly = 4, // unsupported
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
    payload: Category | Expense | Recurring | Unplanned | null;
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

export class DataModelFactory {

    static createExpense(lastUsedId: number, categoryId: number, amount: number): Expense {
        const id = lastUsedId + 1;
        return {
            id,
            title: '',
            amount: amount,
            categoryId,
            timestamp: new Date()
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
            lastUpdated: new Date(),
            frequency: RecurringType.weekly,
            frequencey_unit: 0,
            startDate: new Date(),
            endDate: new Date(),
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
            lastUpdated: new Date(),
            currency: '',
            expenseList: []
        };
    }

    static createCategoryLog(lastUsedId: number): CategoryLog {
        const id = lastUsedId + 1;
        return {
            id,
            timestamp: new Date(),
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
            timestamp: new Date(),
            type: UserActionType.addCategory,
            payload: {} as Category | Expense | Recurring | Unplanned
        };
    }

    static createUserData(): UserData {
        if (import.meta.env.VITE_CREATE_DUMMY_DATA !== 'true') {
            throw new Error('Create User Data function is only available if dummy mode is enabled.');
        }
        return {
            id: Math.random().toString(),
            history_id: '',
            categoryList: [],
            recurringList: [],
            unplannedList: [],
            history_unit: {
                month: new Date(Date.now()).getMonth(),
                year: new Date(Date.now()).getFullYear()
            },
            userActions: [],
            last_updated: new Date(),
            authorized_users: []
        };
    }

    static createUserDataHistory(): UserDataHistory {
        if (import.meta.env.VITE_CREATE_DUMMY_DATA !== 'true') {
            throw new Error('Create User Data function is only available if dummy mode is enabled.');
        }
        return {
            id: Math.random().toString(),
            history: []
        };
    }
}