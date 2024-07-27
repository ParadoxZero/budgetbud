import { Category, Expense, Budget, BudgetHistory, Recurring, Unplanned, UserAction, DataModelFactory, UserActionType } from "../datamodel/datamodel";


export interface DataService {
    getBudget(id: string): Promise<Budget[]>;
    createBudget(name: string): Promise<Budget>;
    getHistory(): Promise<BudgetHistory>;
    updateCategory(budget_id: string, category: Category): Promise<Budget>;
    updateExpense(budget_id: string, expense: Expense): Promise<Budget>;
    deleteExpense(budget_id: string, expenseId: number): Promise<Budget>;
    updateRecurring(budget_id: string, recurring: Recurring): Promise<Budget>;
    deleteRecurring(budget_id: string, recurringId: number): Promise<Budget>;
    updateUnplanned(budget_id: string, unplanned: Unplanned): Promise<Budget>;
    deleteUnplanned(budget_id: string, unplannedId: number): Promise<Budget>;
    getUserActions(budget_id: string): Promise<UserAction[]>;
    getHistory(budger_id: string): Promise<BudgetHistory>;
}

export function getDataService(): DataService {
    if (import.meta.env.VITE_USE_LOCAL_DATA_SERVICE === 'true') {
        // Return the local data service implementation
        return new LocalDataService();
    } else {
        // Return the URL service implementation
        return new RemoteDataService();
    }
}
class RemoteDataService implements DataService {
    BASE_URL: string;

    constructor() {
        this.BASE_URL = window.location.hostname;
    }

    createBudget(name: string): Promise<Budget> {
        let endpoint: string = `${this.BASE_URL}/api/Budget`;
        return fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ name: name }),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((response) => response.json() as Promise<Budget>);
    }
    getBudget(): Promise<Budget[]> {
        let endpoint: string = `${this.BASE_URL}/api/Budget`;
        return fetch(endpoint, { method: 'GET' }).then((response) => response.json() as Promise<Budget[]>);
    }

    getHistory(): Promise<BudgetHistory> {
        throw new Error("Not implemented");
    }
    updateCategory(budger_id: string, category: Category): Promise<Budget> {
        let endpoint: string = `${this.BASE_URL}/api/Budget/${budger_id}`;
        return fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(category),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((response) => response.json() as Promise<Budget>);
    }

    updateExpense(_budget_id: string, _expense: Expense): Promise<Budget> {
        throw new Error("Not implemented");
    }

    deleteExpense(_budget_id: string, _expenseId: number): Promise<Budget> {
        throw new Error("Not implemented");
    }

    updateRecurring(_budget_id: string, _recurring: Recurring): Promise<Budget> {
        throw new Error("Not implemented");
    }

    deleteRecurring(_budget_id: string, _recurringId: number): Promise<Budget> {
        throw new Error("Not implemented");
    }

    updateUnplanned(_budget_id: string, _unplanned: Unplanned): Promise<Budget> {
        throw new Error("Not implemented");
    }

    deleteUnplanned(_budget_id: string, _unplannedId: number): Promise<Budget> {
        throw new Error("Not implemented");
    }

    getUserActions(_budget_id: string): Promise<UserAction[]> {
        throw new Error("Not implemented");
    }
}

class LocalDataService implements DataService {
    getBudget(): Promise<Budget[]> {
        return new Promise((resolve) => {
            // Implement the logic to retrieve user data from local storage
            // For example:
            let budgetList: Budget[] = [];
            const userData = localStorage.getItem('userData');
            if (userData) {
                budgetList.push(JSON.parse(userData));
            }
            resolve(budgetList);
        });
    }

    createBudget(name: string): Promise<Budget> {
        return new Promise((resolve) => {
            // Implement the logic to create a new budget in local storage
            // For example:
            const budget = DataModelFactory.createBudget(name);
            localStorage.setItem('userData', JSON.stringify(budget));
            resolve(budget);
        });
    }

    getHistory(): Promise<BudgetHistory> {
        return new Promise((resolve) => {
            // Implement the logic to retrieve user data history from local storage
            // For example:
            const history = localStorage.getItem('userDataHistory`');
            if (history) {
                resolve(JSON.parse(history));
            } else {
                resolve(DataModelFactory.createBudgetHistory());
            }
        });
    }

    updateCategory(_budget_id: string, category: Category): Promise<Budget> {
        return new Promise((resolve, _reject) => {
            // Implement the logic to update a category in local storage
            // For example:
            const user_data: Budget = JSON.parse(localStorage.getItem('userData') ?? "{}");
            if (!user_data.categoryList) {
                user_data.categoryList = [];
            }
            const parsedCategories = user_data.categoryList;
            let found: boolean = false;
            user_data.categoryList = parsedCategories.map((c: Category) => {
                if (c.id === category.id) {
                    found = true;
                    return category;
                }
                return c;
            });
            if (!found) {
                user_data.categoryList.push(category);
            }
            let user_action: UserAction = DataModelFactory.createUserAction();
            user_action.type = UserActionType.updateCategory;
            user_action.payload = category;
            user_data.userActions.push(user_action);

            localStorage.setItem('userData', JSON.stringify(user_data));
            resolve(user_data);
        });
    }

    updateExpense(_budget_id: string, expense: Expense): Promise<Budget> {
        return new Promise((resolve, reject) => {
            // Implement the logic to update an expense in local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedBudget: Budget = JSON.parse(userData);
                const category = parsedBudget.categoryList.find((c: Category) => c.id === expense.categoryId);
                if (category) {
                    let found: boolean = false;
                    const updatedExpenses = category.expenseList.map((e: Expense) => {
                        if (e.id === expense.id) {
                            found = true;
                            return expense;
                        }
                        return e;
                    });
                    if (!found) {
                        updatedExpenses.push(expense);
                    }
                    let user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.updateExpense;
                    user_action.payload = expense;
                    parsedBudget.userActions.push(user_action);

                    parsedBudget.categoryList = parsedBudget.categoryList.map((c: Category) => {
                        if (c.id === expense.categoryId) {
                            c.expenseList = updatedExpenses;
                        }
                        return c;
                    });
                    parsedBudget.last_updated = new Date(Date.now());
                    localStorage.setItem('userData', JSON.stringify(parsedBudget));
                    resolve(parsedBudget);
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    }

    deleteExpense(_budget_id: string, expenseId: number): Promise<Budget> {
        return new Promise((resolve, reject) => {
            // Implement the logic to delete an expense from local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedBudget = JSON.parse(userData);
                const category = parsedBudget.categoryList.find((c: Category) => c.expenseList.some((e: Expense) => e.id === expenseId));
                if (category) {
                    let expense: Expense | null = null;
                    category.expenseList = category.expenseList.filter((e: Expense) => {
                        if (e.id == expenseId) {
                            expense = e;
                            return false;
                        }
                        return true;
                    });
                    let user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.deleteExpense;
                    user_action.payload = expense;
                    parsedBudget.userActions.push(user_action);

                    localStorage.setItem('userData', JSON.stringify(parsedBudget));
                    resolve(parsedBudget);
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    }

    updateRecurring(_budget_id: string, recurring: Recurring): Promise<Budget> {
        return new Promise((resolve, reject) => {
            // Implement the logic to update a recurring expense in local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedBudget = JSON.parse(userData);
                const recurringIndex = parsedBudget.recurringList.findIndex((r: Recurring) => r.id === recurring.id);
                if (recurringIndex !== -1) {
                    parsedBudget.recurringList[recurringIndex] = recurring;
                } else {
                    parsedBudget.recurringList.push(recurring);
                }
                let user_action: UserAction = DataModelFactory.createUserAction();
                user_action.type = UserActionType.updateRecurring;
                user_action.payload = recurring;
                parsedBudget.userActions.push(user_action);

                localStorage.setItem('userData', JSON.stringify(parsedBudget));
                resolve(parsedBudget);
            } else {
                reject();
            }
        });
    }

    deleteRecurring(_budget_id: string, recurringId: number): Promise<Budget> {
        return new Promise((resolve, reject) => {
            // Implement the logic to delete a recurring expense from local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedBudget = JSON.parse(userData);
                let recurring: Recurring | null = null;
                const recurringIndex = parsedBudget.recurringList.findIndex((r: Recurring) => {
                    if (r.id === recurringId) {
                        recurring = r;
                        return true;
                    } return false;
                });
                if (recurringIndex !== -1) {
                    parsedBudget.recurringList.splice(recurringIndex, 1);
                    let user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.deleteRecurring;
                    user_action.payload = recurring;
                    parsedBudget.userActions.push(user_action);

                    localStorage.setItem('userData', JSON.stringify(parsedBudget));
                    resolve(parsedBudget);
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    }

    updateUnplanned(_budget_id: string, unplanned: Unplanned): Promise<Budget> {
        return new Promise((resolve, reject) => {
            // Implement the logic to update an unplanned expense in local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedBudget = JSON.parse(userData);
                const unplannedIndex = parsedBudget.unplannedList.findIndex((u: Unplanned) => u.id === unplanned.id);
                if (unplannedIndex !== -1) {
                    parsedBudget.unplannedList[unplannedIndex] = unplanned;
                    let user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.updateUnplanned;
                    user_action.payload = unplanned;
                    parsedBudget.userActions.push(user_action);

                    localStorage.setItem('userData', JSON.stringify(parsedBudget));
                    resolve(parsedBudget);
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    }

    deleteUnplanned(_budget_id: string, unplannedId: number): Promise<Budget> {
        return new Promise((resolve, reject) => {
            // Implement the logic to delete an unplanned expense from local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedBudget = JSON.parse(userData);
                let unplanned: Unplanned | null = null;
                const unplannedIndex = parsedBudget.unplannedList.findIndex((u: Unplanned) => {
                    if (u.id === unplannedId) {
                        unplanned = u;
                        return true;
                    }
                    return false;
                });
                if (unplannedIndex !== -1) {
                    parsedBudget.unplannedList.splice(unplannedIndex, 1);
                    let user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.deleteUnplanned;
                    user_action.payload = unplanned;
                    parsedBudget.userActions.push(user_action);

                    localStorage.setItem('userData', JSON.stringify(parsedBudget));
                    resolve(parsedBudget);
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    }

    getUserActions(_budget_id: string): Promise<UserAction[]> {
        return new Promise((resolve) => {
            // Implement the logic to retrieve user actions from local storage
            // For example:
            const userActions = localStorage.getItem('userActions');
            if (userActions) {
                resolve(JSON.parse(userActions));
            } else {
                resolve([]);
            }
        });
    }
}