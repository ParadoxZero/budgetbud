import { Category, Expense, Budget, BudgetHistory, Recurring, Unplanned, UserAction, DataModelFactory, UserActionType } from "../datamodel/datamodel";


export interface DataService {
    getBudget(): Promise<Budget>;
    getHistory(): Promise<BudgetHistory>;
    updateCategory(category: Category): Promise<Budget>;
    updateExpense(categoryId: number, expense: Expense): Promise<Budget>;
    deleteExpense(expenseId: number): Promise<Budget>;
    updateRecurring(recurring: Recurring): Promise<Budget>;
    deleteRecurring(recurringId: number): Promise<Budget>;
    updateUnplanned(unplanned: Unplanned): Promise<Budget>;
    deleteUnplanned(unplannedId: number): Promise<Budget>;
    getUserActions(): Promise<UserAction[]>;
    getHistory(): Promise<BudgetHistory>;
}

export function getDataService(): DataService {
    if (import.meta.env.MODE === 'development') {
        // Return the local data service implementation
        return new LocalDataService();
    } else {
        // Return the URL service implementation
        return new LocalDataService();
    }
}
// class RemoteDataService implements DataService {
//     getBudget(): Promise<Budget> {
//         throw new Error("Not implemented");
//     }

//     getHistory(): Promise<BudgetHistory> {
//         throw new Error("Not implemented");
//     }
//     updateCategory(_category: Category): Promise<Budget> {
//         throw new Error("Not implemented");
//     }

//     updateExpense(_categoryId: number, _expense: Expense): Promise<Budget> {
//         throw new Error("Not implemented");
//     }

//     deleteExpense(_expenseId: number): Promise<Budget> {
//         throw new Error("Not implemented");
//     }

//     updateRecurring(_recurring: Recurring): Promise<Budget> {
//         throw new Error("Not implemented");
//     }

//     deleteRecurring(_recurringId: number): Promise<Budget> {
//         throw new Error("Not implemented");
//     }

//     updateUnplanned(_unplanned: Unplanned): Promise<Budget> {
//         throw new Error("Not implemented");
//     }

//     deleteUnplanned(_unplannedId: number): Promise<Budget> {
//         throw new Error("Not implemented");
//     }

//     getUserActions(): Promise<UserAction[]> {
//         throw new Error("Not implemented");
//     }
// }

class LocalDataService implements DataService {
    getBudget(): Promise<Budget> {
        return new Promise((resolve) => {
            // Implement the logic to retrieve user data from local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                resolve(JSON.parse(userData));
            } else {
                resolve(DataModelFactory.createBudget());
            }
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

    updateCategory(category: Category): Promise<Budget> {
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

    updateExpense(categoryId: number, expense: Expense): Promise<Budget> {
        return new Promise((resolve, reject) => {
            // Implement the logic to update an expense in local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsedBudget: Budget = JSON.parse(userData);
                const category = parsedBudget.categoryList.find((c: Category) => c.id === categoryId);
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
                        if (c.id === categoryId) {
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

    deleteExpense(expenseId: number): Promise<Budget> {
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

    updateRecurring(recurring: Recurring): Promise<Budget> {
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

    deleteRecurring(recurringId: number): Promise<Budget> {
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

    updateUnplanned(unplanned: Unplanned): Promise<Budget> {
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

    deleteUnplanned(unplannedId: number): Promise<Budget> {
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