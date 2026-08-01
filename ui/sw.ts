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


/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkOnly } from "workbox-strategies";
import { BackgroundSyncPlugin } from "workbox-background-sync";

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

const SYNC_ID_HEADER = "X-Sync-Id";

const backgroundSyncPlugin = new BackgroundSyncPlugin("expense-sync-queue", {
  maxRetentionTime: 24 * 60,
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      const syncId = entry.request.headers.get(SYNC_ID_HEADER);
      try {
        const response = await fetch(entry.request.clone());
        if (!syncId) {
          continue;
        }
        if (response.ok) {
          await notifyClients({ syncId, status: "success" });
        } else {
          await notifyClients({
            syncId,
            status: "failed",
            error: `Server rejected the request (${response.status})`,
          });
        }
      } catch (error) {
        // Still offline / network failed again: put it back and stop:
        // BackgroundSyncPlugin's queue will be retried on the next sync
        // event. If maxRetentionTime has elapsed, `shiftRequest` throws
        // instead of returning an entry, which is handled below.
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  },
});

async function notifyClients(message: {
  syncId: string;
  status: "success" | "failed";
  error?: string;
}): Promise<void> {
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage(message);
  }
}

function isBufferedExpenseRequest(request: Request): boolean {
  if (!request.headers.has(SYNC_ID_HEADER)) {
    return false;
  }
  const url = new URL(request.url);
  const isAdd =
    request.method === "POST" && /^\/api\/Budget\/[^/]+\/expense$/.test(url.pathname);
  const isDelete =
    request.method === "DELETE" &&
    /^\/api\/Budget\/[^/]+\/category\/[^/]+\/expense\/[^/]+$/.test(url.pathname);
  return isAdd || isDelete;
}

registerRoute(
  ({ request }) => isBufferedExpenseRequest(request),
  new NetworkOnly({ plugins: [backgroundSyncPlugin] }),
  "POST",
);
registerRoute(
  ({ request }) => isBufferedExpenseRequest(request),
  new NetworkOnly({ plugins: [backgroundSyncPlugin] }),
  "DELETE",
);
