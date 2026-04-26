/*
 * BudgetBud - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2026  Sidhin S Thomas <sidhin.thomas@gmail.com>
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

import {
  Category,
  Expense,
  Budget,
  BudgetHistory,
  Recurring,
  Unplanned,
  UserAction,
  DataModelFactory,
  UserActionType,
  GroupCategoryEditRow,
} from "../datamodel/datamodel";
import { DataService } from "./data_service";

export class LocalDataService implements DataService {
  bulkUpdateCategories(
    _budget_id: string,
    _categories: GroupCategoryEditRow[],
  ): Promise<Budget> {
    throw new Error("Bulk update categories not implemented for local data service.");
  }

  deleteBudget(budget_id: string): Promise<void> {
    return new Promise((resolve, _reject) => {
      const userData = localStorage.getItem("userData");
      if (userData) {
        let budget_list: Budget[] = JSON.parse(userData);
        const index = this.find_budget_by_id(budget_id, budget_list);
        if (index === -1) {
          _reject();
        }
        budget_list.splice(index, 1);
        localStorage.setItem("userData", JSON.stringify(budget_list));
        resolve();
      }
    });
  }

  deleteCategory(budget_id: string, categoryId: number): Promise<Budget> {
    return new Promise((resolve, reject) => {
      const userData = localStorage.getItem("userData");
      if (userData) {
        let budget_list: Budget[] = JSON.parse(userData);
        const index = this.find_budget_by_id(budget_id, budget_list);
        if (index === -1) {
          reject();
        }
        let category: Category | null = null;
        budget_list[index].categoryList = budget_list[
          index
        ].categoryList.filter((c: Category) => {
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
          localStorage.setItem("userData", JSON.stringify(budget_list));
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
      let budgetList: Budget[] = [];
      const userData = localStorage.getItem("userData");
      if (userData) {
        budgetList = JSON.parse(userData) ?? [];
      }
      resolve(budgetList);
    });
  }

  createBudget(name: string): Promise<Budget> {
    return new Promise((resolve) => {
      let budget_list: Budget[] = [];
      if (localStorage.getItem("userData")) {
        budget_list = JSON.parse(localStorage.getItem("userData") ?? "[]");
      }
      const budget = DataModelFactory.createBudget(name);
      budget_list.push(budget);
      localStorage.setItem("userData", JSON.stringify(budget_list));
      resolve(budget);
    });
  }

  getHistory(): Promise<BudgetHistory> {
    return new Promise((resolve) => {
      const history = localStorage.getItem("userDataHistory`");
      if (history) {
        resolve(JSON.parse(history));
      } else {
        resolve(DataModelFactory.createBudgetHistory());
      }
    });
  }

  createCategories(
    _budget_id: string,
    categories: Category[],
  ): Promise<Budget> {
    return new Promise((resolve, reject) => {
      const userData = localStorage.getItem("userData");
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
          lastUsedId = budget_list[index].categoryList.reduce(
            (acc: number, c: Category) => (c.id > acc ? c.id : acc),
            0,
          );
        }
        for (const category of categories) {
          category.id = lastUsedId;
          lastUsedId++;
        }

        budget_list[index].categoryList =
          budget_list[index].categoryList.concat(categories);
        for (const category of categories) {
          const user_action: UserAction = DataModelFactory.createUserAction();
          user_action.type = UserActionType.updateCategory;
          user_action.payload = category;
          budget_list[index].userActions.push(user_action);
        }

        budget_list[index].last_updated = Date.now();
        localStorage.setItem("userData", JSON.stringify(budget_list));
        resolve(budget_list[index]);
      }
      reject();
    });
  }

  updateCategory(budget_id: string, category: Category): Promise<Budget> {
    return new Promise((resolve, _reject) => {
      let budget_list: Budget[] = JSON.parse(
        localStorage.getItem("userData") ?? "[]",
      );
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
      localStorage.setItem("userData", JSON.stringify(budget_list));
      resolve(budget_list[index]);
    });
  }

  updateExpense(_budget_id: string, expense: Expense): Promise<Budget> {
    return new Promise((resolve, reject) => {
      const user_data = localStorage.getItem("userData") ?? "[]";
      if (user_data) {
        let budget_list: Budget[] = JSON.parse(user_data);
        const index = this.find_budget_by_id(_budget_id, budget_list);
        if (index === -1) {
          reject();
        }
        const category = budget_list[index].categoryList.find(
          (c: Category) => c.id === expense.categoryId,
        );
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

          budget_list[index].categoryList = budget_list[index].categoryList.map(
            (c: Category) => {
              if (c.id === expense.categoryId) {
                c.expenseList = updatedExpenses;
              }
              return c;
            },
          );
          budget_list[index].last_updated = Date.now();
          localStorage.setItem("userData", JSON.stringify(budget_list));
          resolve(budget_list[index]);
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
  }

  editExpense(_budget_id: string, expense: Expense): Promise<Budget> {
    return new Promise((resolve, reject) => {
      const user_data = localStorage.getItem("userData") ?? "[]";
      if (user_data) {
        let budget_list: Budget[] = JSON.parse(user_data);
        const index = this.find_budget_by_id(_budget_id, budget_list);
        if (index === -1) {
          reject();
          return;
        }
        budget_list[index].categoryList = budget_list[index].categoryList.map(
          (c: Category) => {
            if (c.id === expense.categoryId) {
              c.expenseList = c.expenseList.map((e: Expense) =>
                e.id === expense.id ? expense : e,
              );
            }
            return c;
          },
        );
        budget_list[index].last_updated = Date.now();
        localStorage.setItem("userData", JSON.stringify(budget_list));
        resolve(budget_list[index]);
      } else {
        reject();
      }
    });
  }

  deleteExpense(
    _budget_id: string,
    category_id: number,
    expenseId: number,
  ): Promise<Budget> {
    return new Promise((resolve, reject) => {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const budget_list: Budget[] = JSON.parse(userData);
        const index = this.find_budget_by_id(_budget_id, budget_list);
        if (index !== -1) {
          const category = budget_list[index].categoryList.find(
            (c: Category) => c.id === category_id,
          );
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
            localStorage.setItem("userData", JSON.stringify(budget_list));
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
      const userData = localStorage.getItem("userData");
      if (userData) {
        const budget_list: Budget[] = JSON.parse(userData);
        const index = this.find_budget_by_id(_budget_id, budget_list);
        if (index !== -1) {
          const recurringIndex = budget_list[index].recurringList.findIndex(
            (r: Recurring) => r.id === recurring.id,
          );
          if (recurringIndex !== -1) {
            budget_list[index].recurringList[recurringIndex] = recurring;
          } else {
            budget_list[index].recurringList.push(recurring);
          }
          const user_action: UserAction = DataModelFactory.createUserAction();
          user_action.type = UserActionType.updateRecurring;
          user_action.payload = recurring;
          budget_list[index].userActions.push(user_action);

          localStorage.setItem("userData", JSON.stringify(budget_list));
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
      const userData = localStorage.getItem("userData");
      if (userData) {
        const budget_list: Budget[] = JSON.parse(userData);
        const index = this.find_budget_by_id(_budget_id, budget_list);
        if (index !== -1) {
          const recurringIndex = budget_list[index].recurringList.findIndex(
            (r: Recurring) => r.id === recurringId,
          );
          if (recurringIndex !== -1) {
            const recurring = budget_list[index].recurringList[recurringIndex];
            budget_list[index].recurringList.splice(recurringIndex, 1);
            const user_action: UserAction = DataModelFactory.createUserAction();
            user_action.type = UserActionType.deleteRecurring;
            user_action.payload = recurring;
            budget_list[index].userActions.push(user_action);

            localStorage.setItem("userData", JSON.stringify(budget_list));
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
      const userData = localStorage.getItem("userData");
      if (userData) {
        const budget_list: Budget[] = JSON.parse(userData);
        const index = this.find_budget_by_id(_budget_id, budget_list);
        if (index !== -1) {
          const parsedBudget = budget_list[index];
          const unplannedIndex = parsedBudget.unplannedList.findIndex(
            (u: Unplanned) => u.id === unplanned.id,
          );
          if (unplannedIndex !== -1) {
            parsedBudget.unplannedList[unplannedIndex] = unplanned;
            const user_action: UserAction = DataModelFactory.createUserAction();
            user_action.type = UserActionType.updateUnplanned;
            user_action.payload = unplanned;
            parsedBudget.userActions.push(user_action);

            localStorage.setItem("userData", JSON.stringify(budget_list));
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
      const userData = localStorage.getItem("userData");
      if (userData) {
        const budget_list: Budget[] = JSON.parse(userData);
        const index = this.find_budget_by_id(_budget_id, budget_list);
        if (index !== -1) {
          const parsedBudget = budget_list[index];
          let unplanned: Unplanned | null = null;
          const unplannedIndex = parsedBudget.unplannedList.findIndex(
            (u: Unplanned) => {
              if (u.id === unplannedId) {
                unplanned = u;
                return true;
              }
              return false;
            },
          );
          if (unplannedIndex !== -1) {
            parsedBudget.unplannedList.splice(unplannedIndex, 1);
            const user_action: UserAction = DataModelFactory.createUserAction();
            user_action.type = UserActionType.deleteUnplanned;
            user_action.payload = unplanned;
            parsedBudget.userActions.push(user_action);

            localStorage.setItem("userData", JSON.stringify(budget_list));
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
      const userData = localStorage.getItem("userData");
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
