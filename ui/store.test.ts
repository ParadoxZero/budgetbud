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


import { describe, expect, it } from "vitest";
import { syncSlice, SyncItem } from "./store";

const makeItem = (overrides: Partial<SyncItem> = {}): SyncItem => ({
  id: "sync-1",
  type: "add",
  description: "Coffee - $4.50",
  budgetId: "budget-1",
  status: "syncing",
  ...overrides,
});

describe("syncSlice", () => {
  it("starts with no items", () => {
    const state = syncSlice.reducer(undefined, { type: "@@INIT" });
    expect(state.items).toEqual([]);
  });

  it("enqueue appends an item", () => {
    const state = syncSlice.reducer(
      { items: [] },
      syncSlice.actions.enqueue(makeItem()),
    );
    expect(state.items).toEqual([makeItem()]);
  });

  it("markFailed flips status and records the error on the matching item", () => {
    const initial = { items: [makeItem(), makeItem({ id: "sync-2" })] };
    const state = syncSlice.reducer(
      initial,
      syncSlice.actions.markFailed({ id: "sync-1", error: "network error" }),
    );
    expect(state.items[0]).toEqual(
      makeItem({ status: "failed", error: "network error" }),
    );
    expect(state.items[1]).toEqual(makeItem({ id: "sync-2" }));
  });

  it("markFailed is a no-op when the id is not found", () => {
    const initial = { items: [makeItem()] };
    const state = syncSlice.reducer(
      initial,
      syncSlice.actions.markFailed({ id: "missing", error: "x" }),
    );
    expect(state.items).toEqual([makeItem()]);
  });

  it("remove drops the matching item and leaves others untouched", () => {
    const initial = { items: [makeItem(), makeItem({ id: "sync-2" })] };
    const state = syncSlice.reducer(
      initial,
      syncSlice.actions.remove({ id: "sync-1" }),
    );
    expect(state.items).toEqual([makeItem({ id: "sync-2" })]);
  });
});
