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
import { store, budgetSlice } from "../store";
import { Budget, DataModelFactory } from "../datamodel/datamodel";

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
