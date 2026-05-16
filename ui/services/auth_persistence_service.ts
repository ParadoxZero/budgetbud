/*
 * BudgetBud - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2024  Sidhin S Thomas <sidhin.thomas@gmail.com>
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

import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const JWT_KEY = "auth_jwt";

// On native (iOS/Android), Capacitor Preferences backs to the device
// Keychain / Keystore — the JWT survives cookie eviction and app restarts.
// On web, no storage is used because HttpOnly cookies handle auth.

export async function storeJwt(token: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key: JWT_KEY, value: token });
  }
}

export async function getJwt(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;
  const { value } = await Preferences.get({ key: JWT_KEY });
  return value;
}

export async function clearJwt(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.remove({ key: JWT_KEY });
  }
}
