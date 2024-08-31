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

import { fetchData } from "./network_service";

export interface ShareKeyResponse {
    shareKey: string;
}

export async function GetShareKey(budget_id: string): Promise<ShareKeyResponse> {
    if (import.meta.env.VITE_USE_LOCAL_DATA_SERVICE === 'true') {
        await new Promise((resolve, _reject) => setTimeout(resolve, 3000));
        return { shareKey: "2U0T0Y05" };
    }
    const response = await fetchData(`/api/Social/share_code/${budget_id}`, { method: "POST" });
    return await response.json();
}

export async function LinkBudget(share_key: string): Promise<void> {
    if (import.meta.env.VITE_USE_LOCAL_DATA_SERVICE === 'true') {
        await new Promise((resolve, _reject) => setTimeout(resolve, 3000));
        return;
    }
    await fetchData(`/api/Social/link/${share_key}`, { method: "POST" });
    return;
}

