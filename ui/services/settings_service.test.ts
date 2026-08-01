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
import {
  isBackgroundSyncEnabled,
  setBackgroundSyncEnabled,
} from "./settings_service";

describe("settings_service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to disabled when nothing is stored", () => {
    expect(isBackgroundSyncEnabled()).toBe(false);
  });

  it("returns true after being enabled", () => {
    setBackgroundSyncEnabled(true);
    expect(isBackgroundSyncEnabled()).toBe(true);
  });

  it("returns false after being enabled then disabled", () => {
    setBackgroundSyncEnabled(true);
    setBackgroundSyncEnabled(false);
    expect(isBackgroundSyncEnabled()).toBe(false);
  });

  it("persists under the documented storage key", () => {
    setBackgroundSyncEnabled(true);
    expect(localStorage.getItem("budgetbud:background_sync_enabled")).toBe(
      "true",
    );
  });
});
