/*
 * BudgetBud - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2025  Sidhin S Thomas <sidhin.thomas@gmail.com>
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
import { isDemoMode } from "../utils";

//   public record GetUserDetailsResponse(string nickName, string id);

export interface UserDetailsResponse {
  nickName: string;
  id: string;
}

export async function GetUserDetails(): Promise<UserDetailsResponse> {
  if (isDemoMode()) {
    await new Promise((resolve, _reject) => setTimeout(resolve, 2000));
    return { nickName: "Demo User", id: "demo_user_id" };
  }
  const response = await fetchData(`/api/User/details`, { method: "GET" });
  return await response.json();
}

export interface UpdateNicknameRequest {
  nickname: string;
}

export async function UpdateUserNickname(
  nickname: string,
): Promise<void> {
  if (isDemoMode()) {
    await new Promise((resolve, _reject) => setTimeout(resolve, 2000));
    return;
  }
  await fetchData(`/api/User/nickname`, {
    method: "POST",
    body: JSON.stringify({ nickName: nickname }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return;
}