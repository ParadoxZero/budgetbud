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

import { Category, Expense, Budget, BudgetHistory, Recurring, Unplanned, UserAction, DataModelFactory, UserActionType } from "../datamodel/datamodel";
import { fetchData } from "./network_service";


export interface DataService {
    getBudget(): Promise<Budget[]>;
    createBudget(name: string): Promise<Budget>;
    deleteBudget(budget_id: string): Promise<void>;
    getHistory(): Promise<BudgetHistory>;
    createCategories(budget_id: string, categories: Category[]): Promise<Budget>;
    updateCategory(budget_id: string, category: Category): Promise<Budget>;
    deleteCategory(budget_id: string, categoryId: number): Promise<Budget>;
    updateExpense(budget_id: string, expense: Expense): Promise<Budget>;
    deleteExpense(budget_id: string, category_id: number, expenseId: number): Promise<Budget>;
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

export async function RolloverBudget(budget_id: string): Promise<Budget> {
    if (import.meta.env.VITE_USE_LOCAL_DATA_SERVICE === 'true') {
        await new Promise((resolve, _reject) => setTimeout(resolve, 3000));
        return getDataService().createBudget("Rollover Budget");
    }
    const response = await fetchData(`/api/Budget/${budget_id}/rollover/`, { method: "POST" });
    return await response.json();
}

class RemoteDataService implements DataService {
    BASE_URL: string;

    constructor() {
        this.BASE_URL = "";
    }



    deleteBudget(budget_id: string): Promise<void> {
        const endpoint: string = `${this.BASE_URL}/api/Budget/${budget_id}`;
        return fetchData(endpoint, { method: 'DELETE' }).then(() => { });
    }

    deleteCategory(_budget_id: string, _categoryId: number): Promise<Budget> {
        const endpoint: string = `${this.BASE_URL}/api/Budget/${_budget_id}/category/${_categoryId}`;
        return fetchData(endpoint, { method: 'DELETE' }).then((response) => response.json() as Promise<Budget>);
    }

    createBudget(name: string): Promise<Budget> {
        const endpoint: string = `${this.BASE_URL}/api/Budget`;
        return fetchData(endpoint, {
            method: 'POST',
            body: JSON.stringify({ name: name }),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((response) => response.json() as Promise<Budget>);
    }

    getBudget(): Promise<Budget[]> {
        const endpoint: string = `${this.BASE_URL}/api/Budget`;
        return fetchData(endpoint, { method: 'GET' }).then((response) => response.json() as Promise<Budget[]>);
    }

    getHistory(): Promise<BudgetHistory> {
        throw new Error("Not implemented");
    }

    updateCategory(budger_id: string, category: Category): Promise<Budget> {
        const endpoint: string = `${this.BASE_URL}/api/Budget/${budger_id}/update_category`;
        return fetchData(endpoint, {
            method: 'POST',
            body: JSON.stringify(category),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((response) => response.json() as Promise<Budget>);
    }

    createCategories(_budget_id: string, _categories: Category[]): Promise<Budget> {
        const endpoint: string = `${this.BASE_URL}/api/Budget/${_budget_id}/add_categories`;
        return fetchData(endpoint, {
            method: 'POST',
            body: JSON.stringify(_categories),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((response) => response.json() as Promise<Budget>);
    }

    updateExpense(_budget_id: string, expense: Expense): Promise<Budget> {
        const endpoint: string = `${this.BASE_URL}/api/Budget/${_budget_id}/expense`;
        return fetchData(endpoint, {
            method: 'POST',
            body: JSON.stringify(expense),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((response) => response.json() as Promise<Budget>);
    }

    deleteExpense(_budget_id: string, category_id: number, _expenseId: number): Promise<Budget> {
        const endpoint: string = `${this.BASE_URL}/api/Budget/${_budget_id}/category/${category_id}/expense/${_expenseId}`;
        return fetch(endpoint, { method: 'DELETE' }).then((response) => response.json() as Promise<Budget>);
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
    deleteBudget(budget_id: string): Promise<void> {
        return new Promise((resolve, _reject) => {
            // Implement the logic to delete a budget from local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                let budget_list: Budget[] = JSON.parse(userData);
                const index = this.find_budget_by_id(budget_id, budget_list);
                if (index === -1) {
                    _reject();
                }
                budget_list.splice(index, 1);
                localStorage.setItem('userData', JSON.stringify(budget_list));
                resolve();
            }
        });
    }
    deleteCategory(budget_id: string, categoryId: number): Promise<Budget> {
        return new Promise((resolve, reject) => {
            // Implement the logic to delete a category from local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                let budget_list: Budget[] = JSON.parse(userData);
                const index = this.find_budget_by_id(budget_id, budget_list);
                if (index === -1) {
                    reject();
                }
                let category: Category | null = null;
                budget_list[index].categoryList = budget_list[index].categoryList.filter((c: Category) => {
                    if (c.id === categoryId) {
                        category = c;
                        return false;
                    }
                    return true;
                });
                if (category) {
                    const user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.deleteCategory;
                    user_action.payload = category;
                    budget_list[index].userActions.push(user_action);

                    budget_list[index].last_updated = Date.now();
                    localStorage.setItem('userData', JSON.stringify(budget_list));
                    resolve(budget_list[index]);
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    }
    find_budget_by_id(budget_id: string, budget_list: Budget[]): number {
        let found: number = -1;
        budget_list.forEach((b: Budget, index: number) => {
            if (b.id === budget_id) {
                found = index;
            }
        });
        return found;
    }

    getBudget(): Promise<Budget[]> {
        return new Promise((resolve) => {
            // Implement the logic to retrieve user data from local storage
            // For example:
            let budgetList: Budget[] = [];
            const userData = localStorage.getItem('userData');
            if (userData) {
                budgetList = JSON.parse(userData) ?? [];
            }
            resolve(budgetList);
        });
    }

    createBudget(name: string): Promise<Budget> {
        return new Promise((resolve) => {
            // Implement the logic to create a new budget in local storage
            // For example:
            let budget_list: Budget[] = [];
            if (localStorage.getItem('userData')) {
                budget_list = JSON.parse(localStorage.getItem('userData') ?? "[]");
            }
            const budget = DataModelFactory.createBudget(name);
            budget_list.push(budget);
            localStorage.setItem('userData', JSON.stringify(budget_list));
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

    createCategories(_budget_id: string, categories: Category[]): Promise<Budget> {
        return new Promise((resolve, reject) => {
            // Implement the logic to create categories in local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                let budget_list = JSON.parse(userData);
                let index = this.find_budget_by_id(_budget_id, budget_list);
                if (index === -1) {
                    reject();
                }
                let lastUsedId: number = 0;
                if (!budget_list[index].categoryList) {
                    budget_list[index].categoryList = [];
                } else {
                    lastUsedId = budget_list[index].categoryList.reduce((acc: number, c: Category) => c.id > acc ? c.id : acc, 0);
                }
                for (const category of categories) {
                    category.id = lastUsedId;
                    lastUsedId++;
                }

                budget_list[index].categoryList = budget_list[index].categoryList.concat(categories);
                for (const category of categories) {
                    const user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.updateCategory;
                    user_action.payload = category;
                    budget_list[index].userActions.push(user_action);
                }

                budget_list[index].last_updated = Date.now();
                localStorage.setItem('userData', JSON.stringify(budget_list));
                resolve(budget_list[index]);
            }
            reject();
        });
    }

    updateCategory(budget_id: string, category: Category): Promise<Budget> {
        return new Promise((resolve, _reject) => {
            // Implement the logic to update a category in local storage
            // For example:
            let budget_list: Budget[] = JSON.parse(localStorage.getItem('userData') ?? "[]");
            let index = this.find_budget_by_id(budget_id, budget_list);
            if (index === -1) {
                return;
            }
            if (!budget_list[index].categoryList) {
                budget_list[index].categoryList = [];
            }
            const parsedCategories = budget_list[index].categoryList;
            let found: boolean = false;
            budget_list[index].categoryList = parsedCategories.map((c: Category) => {
                if (c.id === category.id) {
                    found = true;
                    category.expenseList = c.expenseList;
                    return category;
                }
                return c;
            });
            if (!found) {
                budget_list[index].categoryList.push(category);
            }
            const user_action: UserAction = DataModelFactory.createUserAction();
            user_action.type = UserActionType.updateCategory;
            user_action.payload = category;
            budget_list[index].userActions.push(user_action);
            budget_list[index].last_updated = Date.now();
            localStorage.setItem('userData', JSON.stringify(budget_list));
            resolve(budget_list[index]);
        });
    }

    updateExpense(_budget_id: string, expense: Expense): Promise<Budget> {
        return new Promise((resolve, reject) => {
            // Implement the logic to update an expense in local storage
            // For example:
            const user_data = localStorage.getItem('userData') ?? "[]";
            if (user_data) {
                let budget_list: Budget[] = JSON.parse(user_data);
                const index = this.find_budget_by_id(_budget_id, budget_list);
                if (index === -1) {
                    reject();
                }
                const category = budget_list[index].categoryList.find((c: Category) => c.id === expense.categoryId);
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
                    const user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.updateExpense;
                    user_action.payload = expense;
                    budget_list[index].userActions.push(user_action);

                    budget_list[index].categoryList = budget_list[index].categoryList.map((c: Category) => {
                        if (c.id === expense.categoryId) {
                            c.expenseList = updatedExpenses;
                        }
                        return c;
                    });
                    budget_list[index].last_updated = Date.now();
                    localStorage.setItem('userData', JSON.stringify(budget_list));
                    resolve(budget_list[index]);
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    }

    deleteExpense(_budget_id: string, category_id: number, expenseId: number): Promise<Budget> {
        return new Promise((resolve, reject) => {
            // Implement the logic to delete an expense from local storage
            // For example:
            const userData = localStorage.getItem('userData');
            if (userData) {
                const budget_list: Budget[] = JSON.parse(userData);
                const index = this.find_budget_by_id(_budget_id, budget_list);
                if (index !== -1) {

                    const category = budget_list[index].categoryList.find((c: Category) => c.id === category_id);
                    if (category) {
                        let expense: Expense | null = null;
                        category.expenseList = category.expenseList.filter((e: Expense) => {
                            if (e.id == expenseId) {
                                expense = e;
                                return false;
                            }
                            return true;
                        });
                        const user_action: UserAction = DataModelFactory.createUserAction();
                        user_action.type = UserActionType.deleteExpense;
                        user_action.payload = expense;
                        budget_list[index].userActions.push(user_action);

                        budget_list[index].last_updated = Date.now();
                        localStorage.setItem('userData', JSON.stringify(budget_list));
                        resolve(budget_list[index]);
                    } else {
                        reject();
                    }
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
                const budget_list: Budget[] = JSON.parse(userData);
                const index = this.find_budget_by_id(_budget_id, budget_list);
                if (index !== -1) {
                    const recurringIndex = budget_list[index].recurringList.findIndex((r: Recurring) => r.id === recurring.id);
                    if (recurringIndex !== -1) {
                        budget_list[index].recurringList[recurringIndex] = recurring;
                    } else {
                        budget_list[index].recurringList.push(recurring);
                    }
                    const user_action: UserAction = DataModelFactory.createUserAction();
                    user_action.type = UserActionType.updateRecurring;
                    user_action.payload = recurring;
                    budget_list[index].userActions.push(user_action);

                    localStorage.setItem('userData', JSON.stringify(budget_list));
                    resolve(budget_list[index]);
                } else {
                    reject();
                }
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
                const budget_list: Budget[] = JSON.parse(userData);
                const index = this.find_budget_by_id(_budget_id, budget_list);
                if (index !== -1) {
                    const recurringIndex = budget_list[index].recurringList.findIndex((r: Recurring) => r.id === recurringId);
                    if (recurringIndex !== -1) {
                        const recurring = budget_list[index].recurringList[recurringIndex];
                        budget_list[index].recurringList.splice(recurringIndex, 1);
                        const user_action: UserAction = DataModelFactory.createUserAction();
                        user_action.type = UserActionType.deleteRecurring;
                        user_action.payload = recurring;
                        budget_list[index].userActions.push(user_action);

                        localStorage.setItem('userData', JSON.stringify(budget_list));
                        resolve(budget_list[index]);
                    } else {
                        reject();
                    }
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
                const budget_list: Budget[] = JSON.parse(userData);
                const index = this.find_budget_by_id(_budget_id, budget_list);
                if (index !== -1) {
                    const parsedBudget = budget_list[index];
                    const unplannedIndex = parsedBudget.unplannedList.findIndex((u: Unplanned) => u.id === unplanned.id);
                    if (unplannedIndex !== -1) {
                        parsedBudget.unplannedList[unplannedIndex] = unplanned;
                        const user_action: UserAction = DataModelFactory.createUserAction();
                        user_action.type = UserActionType.updateUnplanned;
                        user_action.payload = unplanned;
                        parsedBudget.userActions.push(user_action);

                        localStorage.setItem('userData', JSON.stringify(budget_list));
                        resolve(parsedBudget);
                    } else {
                        reject();
                    }
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
                const budget_list: Budget[] = JSON.parse(userData);
                const index = this.find_budget_by_id(_budget_id, budget_list);
                if (index !== -1) {
                    const parsedBudget = budget_list[index];
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
                        const user_action: UserAction = DataModelFactory.createUserAction();
                        user_action.type = UserActionType.deleteUnplanned;
                        user_action.payload = unplanned;
                        parsedBudget.userActions.push(user_action);

                        localStorage.setItem('userData', JSON.stringify(budget_list));
                        resolve(parsedBudget);
                    } else {
                        reject();
                    }
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
            const userData = localStorage.getItem('userData');
            if (userData) {
                const budget_list: Budget[] = JSON.parse(userData);
                const index = this.find_budget_by_id(_budget_id, budget_list);
                if (index !== -1) {
                    resolve(budget_list[index].userActions);
                } else {
                    resolve([]);
                }
            } else {
                resolve([]);
            }
        });
    }
}
