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
  GroupCategoryEditRow,
  Recurring,
  Unplanned,
  UserAction,
} from "../datamodel/datamodel";
import { DataService } from "./data_service";
import { RemoteDataService } from "./remote_data_service";
import { getCachedBudgetList, setCachedBudgetList } from "./indexeddb_cache";
import { budgetSlice, store, syncSlice, SyncItem } from "../store";

interface PendingSyncRequest {
  url: string;
  method: string;
  body: string;
}

const pendingSyncRequests = new Map<string, PendingSyncRequest>();

function fireSyncRequest(syncId: string, request: PendingSyncRequest): void {
  fetch(request.url, {
    method: request.method,
    body: request.body,
    headers: {
      "Content-Type": "application/json",
      "X-Sync-Id": syncId,
    },
  }).catch(() => {
    // Intentionally swallowed: offline/failed sends are handled by the
    // service worker's BackgroundSyncPlugin queue + postMessage outcome
    // reporting (see ui/sw.ts), not by this promise.
  });
}

export class BufferedDataService implements DataService {
  private remote = new RemoteDataService();

  async getBudget(): Promise<Budget[]> {
    const selectedIndex = store.getState().budget.selected_budget_index;
    const cached = await getCachedBudgetList();

    const refresh = this.remote.getBudget().then((fresh) => {
      void setCachedBudgetList(fresh);
      store.dispatch(
        budgetSlice.actions.set({
          budget_list: fresh,
          selected_budget_index: selectedIndex,
        }),
      );
      return fresh;
    });

    if (cached) {
      store.dispatch(
        budgetSlice.actions.set({
          budget_list: cached,
          selected_budget_index: selectedIndex,
        }),
      );
      return cached;
    }
    return refresh;
  }

  createBudget(name: string): Promise<Budget> {
    return this.remote.createBudget(name);
  }

  deleteBudget(budget_id: string): Promise<void> {
    return this.remote.deleteBudget(budget_id);
  }

  getHistory(): Promise<BudgetHistory> {
    return this.remote.getHistory();
  }

  createCategories(budget_id: string, categories: Category[]): Promise<Budget> {
    return this.remote.createCategories(budget_id, categories);
  }

  updateCategory(budget_id: string, category: Category): Promise<Budget> {
    return this.remote.updateCategory(budget_id, category);
  }

  bulkUpdateCategories(
    budget_id: string,
    categories: GroupCategoryEditRow[],
  ): Promise<Budget> {
    return this.remote.bulkUpdateCategories(budget_id, categories);
  }

  deleteCategory(budget_id: string, categoryId: number): Promise<Budget> {
    return this.remote.deleteCategory(budget_id, categoryId);
  }

  updateExpense(budget_id: string, expense: Expense): Promise<Budget> {
    const state = store.getState();
    const index = state.budget.budget_list.findIndex(
      (b: Budget) => b.id === budget_id,
    );
    if (index === -1) {
      return this.remote.updateExpense(budget_id, expense);
    }

    const budget: Budget = structuredClone(state.budget.budget_list[index]);
    const category = budget.categoryList.find(
      (c) => c.id === expense.categoryId,
    );
    if (!category) {
      return this.remote.updateExpense(budget_id, expense);
    }

    const optimisticExpense: Expense = { ...expense, id: -Date.now() };
    category.expenseList.push(optimisticExpense);
    category.lastUpdated = Date.now();
    budget.last_updated = Date.now();

    store.dispatch(budgetSlice.actions.updateCurrent(budget));
    const updatedList = [...state.budget.budget_list];
    updatedList[index] = budget;
    void setCachedBudgetList(updatedList);

    const syncId = crypto.randomUUID();
    const syncItem: SyncItem = {
      id: syncId,
      type: "add",
      description: `${optimisticExpense.title || "Expense"} - $${optimisticExpense.amount.toFixed(2)}`,
      budgetId: budget_id,
      status: "syncing",
    };
    store.dispatch(syncSlice.actions.enqueue(syncItem));

    const request: PendingSyncRequest = {
      url: `/api/Budget/${budget_id}/expense`,
      method: "POST",
      body: JSON.stringify(expense),
    };
    pendingSyncRequests.set(syncId, request);
    fireSyncRequest(syncId, request);

    return Promise.resolve(budget);
  }

  editExpense(budget_id: string, expense: Expense): Promise<Budget> {
    return this.remote.editExpense(budget_id, expense);
  }

  deleteExpense(
    budget_id: string,
    category_id: number,
    expenseId: number,
  ): Promise<Budget> {
    const state = store.getState();
    const index = state.budget.budget_list.findIndex(
      (b: Budget) => b.id === budget_id,
    );
    if (index === -1) {
      return this.remote.deleteExpense(budget_id, category_id, expenseId);
    }

    const budget: Budget = structuredClone(state.budget.budget_list[index]);
    const category = budget.categoryList.find((c) => c.id === category_id);
    if (!category) {
      return this.remote.deleteExpense(budget_id, category_id, expenseId);
    }

    const removedExpense = category.expenseList.find(
      (e) => e.id === expenseId,
    );
    category.expenseList = category.expenseList.filter(
      (e) => e.id !== expenseId,
    );
    category.lastUpdated = Date.now();
    budget.last_updated = Date.now();

    store.dispatch(budgetSlice.actions.updateCurrent(budget));
    const updatedList = [...state.budget.budget_list];
    updatedList[index] = budget;
    void setCachedBudgetList(updatedList);

    const syncId = crypto.randomUUID();
    const description = removedExpense
      ? `Delete: ${removedExpense.title || "Expense"} - $${removedExpense.amount.toFixed(2)}`
      : "Delete expense";
    const syncItem: SyncItem = {
      id: syncId,
      type: "delete",
      description,
      budgetId: budget_id,
      status: "syncing",
    };
    store.dispatch(syncSlice.actions.enqueue(syncItem));

    const request: PendingSyncRequest = {
      url: `/api/Budget/${budget_id}/category/${category_id}/expense/${expenseId}`,
      method: "DELETE",
      body: "",
    };
    pendingSyncRequests.set(syncId, request);
    fireSyncRequest(syncId, request);

    return Promise.resolve(budget);
  }

  retry(syncId: string): void {
    const request = pendingSyncRequests.get(syncId);
    if (!request) {
      return;
    }
    store.dispatch(syncSlice.actions.markSyncing({ id: syncId }));
    fireSyncRequest(syncId, request);
  }

  updateRecurring(budget_id: string, recurring: Recurring): Promise<Budget> {
    return this.remote.updateRecurring(budget_id, recurring);
  }

  deleteRecurring(budget_id: string, recurringId: number): Promise<Budget> {
    return this.remote.deleteRecurring(budget_id, recurringId);
  }

  updateUnplanned(budget_id: string, unplanned: Unplanned): Promise<Budget> {
    return this.remote.updateUnplanned(budget_id, unplanned);
  }

  deleteUnplanned(budget_id: string, unplannedId: number): Promise<Budget> {
    return this.remote.deleteUnplanned(budget_id, unplannedId);
  }

  getUserActions(budget_id: string): Promise<UserAction[]> {
    return this.remote.getUserActions(budget_id);
  }
}
