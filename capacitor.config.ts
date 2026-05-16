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

import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.budgetbud.app",
  appName: "BudgetBud",
  // Vite's output directory (same as build.outDir in vite.config.ts)
  webDir: "wwwroot",
  server: {
    // Set this to your production server URL for native builds so the WebView
    // loads from the server and cookie auth works same-origin.
    // Example: url: "https://your-budgetbud-server.com"
    // Leave unset to bundle local assets (requires CORS + JWT auth on the server).
    androidScheme: "https",
  },
  plugins: {
    // @capacitor/preferences backs to iOS Keychain and Android Keystore,
    // giving JWT tokens device-level persistence that survives cookie eviction.
    Preferences: {
      group: "com.budgetbud.app",
    },
  },
};

export default config;
