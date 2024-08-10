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
public enum UserActionType
{
    addCategory = 0,
    deleteCategory = 1,
    updateCategory = 2,
    addExpense = 3,
    deleteExpense = 4,
    updateExpense = 5,
    addRecurring = 6,
    deleteRecurring = 7,
    updateRecurring = 8,
    addUnplanned = 9,
    deleteUnplanned = 10,
    updateUnplanned = 11
}

public class UserAction
{
    public long timestamp { get; set; }
    public UserActionType type { get; set; }
    public Category? category { get; set; }
    public Expense? expense { get; set; }
    public Recurring? recurring { get; set; }
    public Expense? unplanned { get; set; }
    public required string userId { get; set; }
}