import type { Budget, Category, Expense } from "../../datamodel/datamodel";

export const TEST_BUDGET_ID = "budget-123";
export const TEST_CATEGORY_ID = 1;
export const TEST_EXPENSE_ID = 42;

export function makeBudget(overrides?: Partial<Budget>): Budget {
  return {
    id: TEST_BUDGET_ID,
    name: "Test Budget",
    history_id: "history-123",
    categoryList: [],
    recurringList: [],
    unplannedList: [],
    period: { month: 4, year: 2026 },
    userActions: [],
    last_updated: Date.now(),
    authorized_users: ["test-user"],
    ...overrides,
  } as unknown as Budget;
}

export function makeCategory(overrides?: Partial<Category>): Category {
  return {
    id: TEST_CATEGORY_ID,
    name: "Groceries",
    description: "",
    allocation: 5000,
    isActive: true,
    lastUpdated: Date.now(),
    currency: "INR",
    expenseList: [],
    ...overrides,
  };
}

export function makeExpense(overrides?: Partial<Expense>): Expense {
  return {
    id: TEST_EXPENSE_ID,
    addedBy: "test-user",
    title: "Coffee",
    amount: 120,
    categoryId: TEST_CATEGORY_ID,
    timestamp: Date.now(),
    lastModified: Date.now(),
    ...overrides,
  };
}
