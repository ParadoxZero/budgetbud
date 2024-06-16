
export interface User {
    id: number;
    name: string;
    email: string;
    isVerified: boolean;
    isActive: boolean;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    allocation: number;
    isActive: boolean;
    lastUpdated: Date;
    currency: string;
}

export interface CategoryLog {
    id: number;
    timestamp: Date;
    allocation: number;
}

export interface Expense {
    id: number;
    title: string;
    amount: number;
    categoryId: number;
    timestamp: Date;
}

export interface Special {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    month: number;
    year: number;
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
    startDate: Date;
    endDate: Date;
    amount: number;
    category?: number; 
}