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


import { beforeEach, describe, expect, it } from "vitest";
import "fake-indexeddb/auto";
import { getCachedBudgetList, setCachedBudgetList } from "./indexeddb_cache";
import { Budget, DataModelFactory } from "../datamodel/datamodel";

describe("indexeddb_cache", () => {
  beforeEach(async () => {
    // fake-indexeddb persists across tests within a run; start each test clean.
    const cleared: Budget[] = [];
    await setCachedBudgetList(cleared);
  });

  it("returns an empty array when nothing meaningful was ever cached", async () => {
    const result = await getCachedBudgetList();
    expect(result).toEqual([]);
  });

  it("round-trips a budget list", async () => {
    const budget = DataModelFactory.createBudget("Groceries");
    await setCachedBudgetList([budget]);
    const result = await getCachedBudgetList();
    expect(result).toEqual([budget]);
  });

  it("overwrites the previous cached list on a second write", async () => {
    const first = DataModelFactory.createBudget("First");
    const second = DataModelFactory.createBudget("Second");
    await setCachedBudgetList([first]);
    await setCachedBudgetList([second]);
    const result = await getCachedBudgetList();
    expect(result).toEqual([second]);
  });
});
