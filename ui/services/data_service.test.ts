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


import { afterEach, describe, expect, it, vi } from "vitest";
import { getDataService } from "./data_service";
import { LocalDataService } from "./local_data_service";
import { RemoteDataService } from "./remote_data_service";
import { BufferedDataService } from "./buffered_data_service";
import * as utils from "../utils";
import * as settingsService from "./settings_service";

describe("getDataService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns LocalDataService in demo mode regardless of the sync flag", () => {
    vi.spyOn(utils, "isDemoMode").mockReturnValue(true);
    vi.spyOn(settingsService, "isBackgroundSyncEnabled").mockReturnValue(true);
    expect(getDataService()).toBeInstanceOf(LocalDataService);
  });

  it("returns BufferedDataService when not in demo mode and the flag is on", () => {
    vi.spyOn(utils, "isDemoMode").mockReturnValue(false);
    vi.spyOn(settingsService, "isBackgroundSyncEnabled").mockReturnValue(true);
    expect(getDataService()).toBeInstanceOf(BufferedDataService);
  });

  it("returns RemoteDataService when not in demo mode and the flag is off", () => {
    vi.spyOn(utils, "isDemoMode").mockReturnValue(false);
    vi.spyOn(settingsService, "isBackgroundSyncEnabled").mockReturnValue(false);
    expect(getDataService()).toBeInstanceOf(RemoteDataService);
  });

  it("re-reads the flag on every call", () => {
    vi.spyOn(utils, "isDemoMode").mockReturnValue(false);
    const flagSpy = vi.spyOn(settingsService, "isBackgroundSyncEnabled");
    flagSpy.mockReturnValue(false);
    expect(getDataService()).toBeInstanceOf(RemoteDataService);
    flagSpy.mockReturnValue(true);
    expect(getDataService()).toBeInstanceOf(BufferedDataService);
  });
});
