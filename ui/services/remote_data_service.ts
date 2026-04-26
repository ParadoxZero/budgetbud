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
  GroupCategoryEditRow,
} from "../datamodel/datamodel";
import { fetchData } from "./network_service";
import { DataService } from "./data_service";

export class RemoteDataService implements DataService {
  BASE_URL: string;

  constructor() {
    this.BASE_URL = "";
  }

  bulkUpdateCategories(
    budget_id: string,
    categories: GroupCategoryEditRow[],
  ): Promise<Budget> {
    const endpoint: string = `${this.BASE_URL}/api/Budget/${budget_id}/bulk_edit_categories`;
    return fetchData(endpoint, {
      method: "POST",
      body: JSON.stringify(categories),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json() as Promise<Budget>);
  }

  deleteBudget(budget_id: string): Promise<void> {
    const endpoint: string = `${this.BASE_URL}/api/Budget/${budget_id}`;
    return fetchData(endpoint, { method: "DELETE" }).then(() => {});
  }

  deleteCategory(_budget_id: string, _categoryId: number): Promise<Budget> {
    const endpoint: string = `${this.BASE_URL}/api/Budget/${_budget_id}/category/${_categoryId}`;
    return fetchData(endpoint, { method: "DELETE" }).then(
      (response) => response.json() as Promise<Budget>,
    );
  }

  createBudget(name: string): Promise<Budget> {
    const endpoint: string = `${this.BASE_URL}/api/Budget`;
    return fetchData(endpoint, {
      method: "POST",
      body: JSON.stringify({ name: name }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json() as Promise<Budget>);
  }

  getBudget(): Promise<Budget[]> {
    const endpoint: string = `${this.BASE_URL}/api/Budget`;
    return fetchData(endpoint, { method: "GET" }).then(
      (response) => response.json() as Promise<Budget[]>,
    );
  }

  getHistory(): Promise<BudgetHistory> {
    throw new Error("Not implemented");
  }

  updateCategory(budger_id: string, category: Category): Promise<Budget> {
    const endpoint: string = `${this.BASE_URL}/api/Budget/${budger_id}/update_category`;
    return fetchData(endpoint, {
      method: "POST",
      body: JSON.stringify(category),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json() as Promise<Budget>);
  }

  createCategories(
    _budget_id: string,
    _categories: Category[],
  ): Promise<Budget> {
    const endpoint: string = `${this.BASE_URL}/api/Budget/${_budget_id}/add_categories`;
    return fetchData(endpoint, {
      method: "POST",
      body: JSON.stringify(_categories),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json() as Promise<Budget>);
  }

  updateExpense(_budget_id: string, expense: Expense): Promise<Budget> {
    const endpoint: string = `${this.BASE_URL}/api/Budget/${_budget_id}/expense`;
    return fetchData(endpoint, {
      method: "POST",
      body: JSON.stringify(expense),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json() as Promise<Budget>);
  }

  editExpense(_budget_id: string, expense: Expense): Promise<Budget> {
    const endpoint: string = `${this.BASE_URL}/api/Budget/${_budget_id}/expense`;
    return fetchData(endpoint, {
      method: "PUT",
      body: JSON.stringify(expense),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json() as Promise<Budget>);
  }

  deleteExpense(
    _budget_id: string,
    category_id: number,
    _expenseId: number,
  ): Promise<Budget> {
    const endpoint: string = `${this.BASE_URL}/api/Budget/${_budget_id}/category/${category_id}/expense/${_expenseId}`;
    return fetch(endpoint, { method: "DELETE" }).then(
      (response) => response.json() as Promise<Budget>,
    );
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
