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


import { beforeEach, describe, expect, it, vi } from "vitest";
import "fake-indexeddb/auto";
import { BufferedDataService } from "./buffered_data_service";
import { RemoteDataService } from "./remote_data_service";
import { setCachedBudgetList } from "./indexeddb_cache";
import { store, budgetSlice, syncSlice } from "../store";
import { Budget, Category, DataModelFactory } from "../datamodel/datamodel";

function makeBudget(name: string): Budget {
  const budget = DataModelFactory.createBudget(name);
  budget.id = name; // stable id for assertions
  return budget;
}

function clearIndexedDbCache(): Promise<void> {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open("budgetbud", 1);
    openRequest.onupgradeneeded = () => {
      if (!openRequest.result.objectStoreNames.contains("read_cache")) {
        openRequest.result.createObjectStore("read_cache");
      }
    };
    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const tx = db.transaction("read_cache", "readwrite");
      tx.objectStore("read_cache").clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    openRequest.onerror = () => reject(openRequest.error);
  });
}

describe("BufferedDataService.getBudget", () => {
  beforeEach(async () => {
    await clearIndexedDbCache();
    store.dispatch(
      budgetSlice.actions.set({ budget_list: [], selected_budget_index: null }),
    );
  });

  it("resolves with the network result and caches it when there is no cache", async () => {
    const fresh = [makeBudget("fresh")];
    vi.spyOn(RemoteDataService.prototype, "getBudget").mockResolvedValue(fresh);

    const service = new BufferedDataService();
    const result = await service.getBudget();

    expect(result).toEqual(fresh);
    expect(store.getState().budget.budget_list).toEqual(fresh);
  });

  it("resolves immediately from cache, then the store converges to fresh data", async () => {
    const cached = [makeBudget("cached")];
    const fresh = [makeBudget("fresh")];
    await setCachedBudgetList(cached);
    let resolveNetwork: (value: Budget[]) => void = () => {};
    vi.spyOn(RemoteDataService.prototype, "getBudget").mockReturnValue(
      new Promise((resolve) => {
        resolveNetwork = resolve;
      }),
    );

    const service = new BufferedDataService();
    const result = await service.getBudget();

    expect(result).toEqual(cached);
    expect(store.getState().budget.budget_list).toEqual(cached);

    resolveNetwork(fresh);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(store.getState().budget.budget_list).toEqual(fresh);
  });
});

function clearSyncItems(): void {
  for (const item of store.getState().sync.items) {
    store.dispatch(syncSlice.actions.remove({ id: item.id }));
  }
}

function makeBudgetWithCategory(): Budget {
  const budget = makeBudget("budget-1");
  const category: Category = {
    id: 1,
    name: "Groceries",
    description: "",
    allocation: 100,
    isActive: true,
    lastUpdated: Date.now(),
    currency: "USD",
    expenseList: [],
  };
  budget.categoryList = [category];
  return budget;
}

describe("BufferedDataService.updateExpense (optimistic add)", () => {
  beforeEach(() => {
    clearSyncItems();
    store.dispatch(
      budgetSlice.actions.set({
        budget_list: [makeBudgetWithCategory()],
        selected_budget_index: 0,
      }),
    );
  });

  it("appends the expense to Redux optimistically and resolves without waiting on the network", async () => {
    let resolveFetch: (value: Response) => void = () => {};
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }) as Promise<Response>);

    const service = new BufferedDataService();
    const expense = {
      id: 0,
      addedBy: "",
      title: "Coffee",
      amount: 4.5,
      categoryId: 1,
      timestamp: Date.now(),
    };

    const result = await service.updateExpense("budget-1", expense);

    expect(result.categoryList[0].expenseList).toHaveLength(1);
    expect(result.categoryList[0].expenseList[0].title).toBe("Coffee");
    expect(store.getState().budget.budget_list[0].categoryList[0].expenseList).toHaveLength(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe("/api/Budget/budget-1/expense");
    expect((options?.headers as Record<string, string>)["X-Sync-Id"]).toBeDefined();
    expect(store.getState().sync.items).toHaveLength(1);
    expect(store.getState().sync.items[0].status).toBe("syncing");
    expect(store.getState().sync.items[0].type).toBe("add");

    resolveFetch(new Response("{}", { status: 200 }));
  });
});

describe("BufferedDataService.deleteExpense (optimistic delete)", () => {
  beforeEach(() => {
    clearSyncItems();
  });

  it("removes the expense from Redux optimistically and enqueues a sync item", async () => {
    const budget = makeBudgetWithCategory();
    budget.categoryList[0].expenseList = [
      {
        id: 42,
        addedBy: "",
        title: "Coffee",
        amount: 4.5,
        categoryId: 1,
        timestamp: Date.now(),
      },
    ];
    store.dispatch(
      budgetSlice.actions.set({ budget_list: [budget], selected_budget_index: 0 }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));

    const service = new BufferedDataService();
    const result = await service.deleteExpense("budget-1", 1, 42);

    expect(result.categoryList[0].expenseList).toHaveLength(0);
    expect(store.getState().budget.budget_list[0].categoryList[0].expenseList).toHaveLength(0);
    const items = store.getState().sync.items;
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe("delete");
  });
});

describe("BufferedDataService.retry", () => {
  beforeEach(() => {
    clearSyncItems();
  });

  it("re-fires the original request with the same X-Sync-Id and flips status back to syncing", async () => {
    store.dispatch(
      budgetSlice.actions.set({
        budget_list: [makeBudgetWithCategory()],
        selected_budget_index: 0,
      }),
    );
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));

    const service = new BufferedDataService();
    const expense = {
      id: 0,
      addedBy: "",
      title: "Coffee",
      amount: 4.5,
      categoryId: 1,
      timestamp: Date.now(),
    };
    await service.updateExpense("budget-1", expense);
    const syncId = store.getState().sync.items[0].id;
    store.dispatch(syncSlice.actions.markFailed({ id: syncId, error: "offline" }));

    service.retry(syncId);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(store.getState().sync.items.find((i) => i.id === syncId)?.status).toBe(
      "syncing",
    );
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const secondCallHeaders = fetchSpy.mock.calls[1][1]?.headers as Record<string, string>;
    expect(secondCallHeaders["X-Sync-Id"]).toBe(syncId);
  });
});
