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

namespace budgetbud.Models;


public class Budget
{
    public required string id { get; set; }
    public required string name { get; set; }
    public required string history_id { get; set; }
    public required List<Category> categoryList { get; set; }
    public required List<Recurring> recurringList { get; set; }
    public required List<Expense> unplannedList { get; set; }
    public required TimeUnit period { get; set; }
    public required List<UserAction> userActions { get; set; }
    public long last_updated { get; set; }
    public required List<string> authorized_users { get; set; }
}