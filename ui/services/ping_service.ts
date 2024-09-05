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


const azure_ping_endpoint: string = "/.auth/me";


export async function PingRemote(): Promise<Object> {
    try {
        const response = await fetch(azure_ping_endpoint);
        return JSON.parse(await response.text());
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function GetAuthDetails(): Promise<Object> {
    try {
        const response = await fetch('/ping/auth_provider');
        return JSON.parse(await response.text());
    } catch (error) {
        return Promise.reject(error);
    }
}
