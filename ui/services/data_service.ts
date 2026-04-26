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
  Budget,
  BudgetHistory,
  Category,
  Expense,
  Recurring,
  Unplanned,
  UserAction,
  GroupCategoryEditRow,
} from "../datamodel/datamodel";
import { fetchData } from "./network_service";
import { isDemoMode } from "../utils";
import { LocalDataService } from "./local_data_service";
import { RemoteDataService } from "./remote_data_service";

export interface DataService {
  getBudget(): Promise<Budget[]>;
  createBudget(name: string): Promise<Budget>;
  deleteBudget(budget_id: string): Promise<void>;
  getHistory(): Promise<BudgetHistory>;
  createCategories(budget_id: string, categories: Category[]): Promise<Budget>;
  updateCategory(budget_id: string, category: Category): Promise<Budget>;
  bulkUpdateCategories(
    budget_id: string,
    categories: GroupCategoryEditRow[],
  ): Promise<Budget>;
  deleteCategory(budget_id: string, categoryId: number): Promise<Budget>;
  updateExpense(budget_id: string, expense: Expense): Promise<Budget>;
  deleteExpense(
    budget_id: string,
    category_id: number,
    expenseId: number,
  ): Promise<Budget>;
  updateRecurring(budget_id: string, recurring: Recurring): Promise<Budget>;
  deleteRecurring(budget_id: string, recurringId: number): Promise<Budget>;
  updateUnplanned(budget_id: string, unplanned: Unplanned): Promise<Budget>;
  deleteUnplanned(budget_id: string, unplannedId: number): Promise<Budget>;
  getUserActions(budget_id: string): Promise<UserAction[]>;
  getHistory(budger_id: string): Promise<BudgetHistory>;
}

export function getDataService(): DataService {
  if (isDemoMode()) {
    return new LocalDataService();
  } else {
    return new RemoteDataService();
  }
}

export async function RolloverBudget(budget_id: string): Promise<Budget> {
  if (isDemoMode()) {
    await new Promise((resolve, _reject) => setTimeout(resolve, 3000));
    return getDataService().createBudget("Rollover Budget");
  }
  const response = await fetchData(`/api/Budget/${budget_id}/rollover/`, {
    method: "POST",
  });
  return await response.json();
}
