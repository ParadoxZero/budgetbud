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
using System;

public enum RecurringType
{
    Weekly = 0,
    Biweekly = 1,
    Monthly = 2,
    Quarterly = 3, // unsupported
    HalfYearly = 4, // unsupported
    Yearly = 5
}

public class Recurring
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public bool IsActive { get; set; }
    public long LastUpdated { get; set; }
    public RecurringType Frequency { get; set; }
    public int FrequencyUnit { get; set; } // This has different meanings based on the frequency, if monthly, it will be day of month, if weekly, it will be day of week etc.
    public long StartDate { get; set; }
    public long EndDate { get; set; }
    public decimal Amount { get; set; }
}