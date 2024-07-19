import { Category, Expense, UserData, UserDataHistory, Recurring, Unplanned, UserAction, DataModelFactory, UserActionType } from "../datamodel/datamodel";


export interface DataService {
    getUserData(): Promise<UserData>;
    getHistory(): Promise<UserDataHistory>;
    updateCategory(category: Category): Promise<boolean>;
    updateExpense(categoryId: number, expense: Expense): Promise<boolean>;
    deleteExpense(expenseId: number): Promise<boolean>;
    updateRecurring(recurring: Recurring): Promise<boolean>;
    deleteRecurring(recurringId: number): Promise<boolean>;
    updateUnplanned(unplanned: Unplanned): Promise<boolean>;
    deleteUnplanned(unplannedId: number): Promise<boolean>;
    getUserActions(): Promise<UserAction[]>;
    getHistory(): Promise<UserDataHistory>;
}

export function getService(isProduction: boolean): DataService {
    if (isProduction) {
        // Return the URL service implementation
        return new RemoteDataService();
    } else {
        // Return the local data service implementation
        return new LocalDataService();
    }
}
class RemoteDataService implements DataService {
    getUserData(): Promise<UserData> {
        throw new Error("Not implemented");
    }

    getHistory(): Promise<UserDataHistory> {
        throw new Error("Not implemented");
    }

    updateCategory(category: Category): Promise<boolean> {
        throw new Error("Not implemented");
    }

    updateExpense(categoryId: number, expense: Expense): Promise<boolean> {
        throw new Error("Not implemented");
    }

    deleteExpense(expenseId: number): Promise<boolean> {
        throw new Error("Not implemented");
    }

    updateRecurring(recurring: Recurring): Promise<boolean> {
        throw new Error("Not implemented");
    }

    deleteRecurring(recurringId: number): Promise<boolean> {
        throw new Error("Not implemented");
    }

    updateUnplanned(unplanned: Unplanned): Promise<boolean> {
        throw new Error("Not implemented");
    }

    deleteUnplanned(unplannedId: number): Promise<boolean> {
        throw new Error("Not implemented");
    }

    getUserActions(): Promise<UserAction[]> {
        throw new Error("Not implemented");
    }
}

class LocalDataService implements DataService {
    getUserData(): Promise<UserData> {
        return new Promise((resolve) => {
            // Implement the logic to retrieve user data from local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                resolve(JSON.parse(userData));
            } else {
                resolve(DataModelFactory.createUserData());
            }
        });
    }

    getHistory(): Promise<UserDataHistory> {
        return new Promise((resolve) => {
            // Implement the logic to retrieve user data history from local storage
            // For example:
            const history = localStorage.getItem('userDataHistory`');
            if (history) {
                resolve(JSON.parse(history));
            } else {
                resolve(DataModelFactory.createUserDataHistory());
            }
        });
    }

    updateCategory(category: Category): Promise<boolean> {
        return new Promise((resolve) => {
            // Implement the logic to update a category in local storage
            // For example:
            const user_data: UserData = JSON.parse(localStorage.getItem('userData') ?? "{}");
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
            resolve(true);
        });
    }

    updateExpense(categoryId: number, expense: Expense): Promise<boolean> {
        return new Promise((resolve) => {
            // Implement the logic to update an expense in local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                const category = parsedUserData.categoryList.find((c: Category) => c.id === categoryId);
                if (category) {
                    let found: boolean = false;
                    const updatedExpenses = category.expenses.map((e: Expense) => {
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
                    parsedUserData.userActions.push(user_action);

                    localStorage.setItem('userData', JSON.stringify(parsedUserData));
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    }

    deleteExpense(expenseId: number): Promise<boolean> {
        return new Promise((resolve) => {
            // Implement the logic to delete an expense from local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                const category = parsedUserData.categoryList.find((c: Category) => c.expenseList.some((e: Expense) => e.id === expenseId));
                if (category) {
                    let expense: Expense | null = null;
                    category.expenses = category.expenses.filter((e: Expense) => {
                        if (e.id == expenseId) {
                            expense = e;
                            return false;
                        }
                        return true;
                    });
                    let user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.deleteExpense;
                    user_action.payload = expense;
                    parsedUserData.userActions.push(user_action);

                    localStorage.setItem('userData', JSON.stringify(parsedUserData));
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    }

    updateRecurring(recurring: Recurring): Promise<boolean> {
        return new Promise((resolve) => {
            // Implement the logic to update a recurring expense in local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                const recurringIndex = parsedUserData.recurringList.findIndex((r: Recurring) => r.id === recurring.id);
                if (recurringIndex !== -1) {
                    parsedUserData.recurringList[recurringIndex] = recurring;
                } else {
                    parsedUserData.recurringList.push(recurring);
                }
                let user_action: UserAction = DataModelFactory.createUserAction();
                user_action.type = UserActionType.updateRecurring;
                user_action.payload = recurring;
                parsedUserData.userActions.push(user_action);

                localStorage.setItem('userData', JSON.stringify(parsedUserData));
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    deleteRecurring(recurringId: number): Promise<boolean> {
        return new Promise((resolve) => {
            // Implement the logic to delete a recurring expense from local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                let recurring: Recurring | null = null;
                const recurringIndex = parsedUserData.recurringList.findIndex((r: Recurring) => {
                    if (r.id === recurringId) {
                        recurring = r;
                        return true;
                    } return false;
                });
                if (recurringIndex !== -1) {
                    parsedUserData.recurringList.splice(recurringIndex, 1);
                    let user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.deleteRecurring;
                    user_action.payload = recurring;
                    parsedUserData.userActions.push(user_action);

                    localStorage.setItem('userData', JSON.stringify(parsedUserData));
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    }

    updateUnplanned(unplanned: Unplanned): Promise<boolean> {
        return new Promise((resolve) => {
            // Implement the logic to update an unplanned expense in local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                const unplannedIndex = parsedUserData.unplannedList.findIndex((u: Unplanned) => u.id === unplanned.id);
                if (unplannedIndex !== -1) {
                    parsedUserData.unplannedList[unplannedIndex] = unplanned;
                    let user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.updateUnplanned;
                    user_action.payload = unplanned;
                    parsedUserData.userActions.push(user_action);

                    localStorage.setItem('userData', JSON.stringify(parsedUserData));
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    }

    deleteUnplanned(unplannedId: number): Promise<boolean> {
        return new Promise((resolve) => {
            // Implement the logic to delete an unplanned expense from local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                let unplanned: Unplanned | null = null;
                const unplannedIndex = parsedUserData.unplannedList.findIndex((u: Unplanned) => {
                    if (u.id === unplannedId) {
                        unplanned = u;
                        return true;
                    }
                    return false;
                });
                if (unplannedIndex !== -1) {
                    parsedUserData.unplannedList.splice(unplannedIndex, 1);
                    let user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.deleteUnplanned;
                    user_action.payload = unplanned;
                    parsedUserData.userActions.push(user_action);

                    localStorage.setItem('userData', JSON.stringify(parsedUserData));
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    }

    getUserActions(): Promise<UserAction[]> {
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