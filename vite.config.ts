/*
 * BudgetBug - Budgeting and Expense Tracker with WebUI and API server
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

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "BudgetBud - Track your budget seamlessly",
        short_name: "BudgetBud",
        start_url: "/",
        display: "minimal-ui",
        display_override: ["window-controls-overlay"],
        icons: [
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        description:
          "Budgeting and Expense Tracker with ability to share budgets " +
          "with friends and family",
        categories: ["finance", "productivity"],
      },
      workbox: {
        globIgnores: ["*"],
      },
    }),
  ],
  build: {
    outDir: "wwwroot",
    rollupOptions: {
      input: {
        main: "app.html",
        login: "login.html",
        privacy: "privacy.html",
      },
    },
  },
});
