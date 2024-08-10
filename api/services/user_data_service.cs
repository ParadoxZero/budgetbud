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

using System.Collections.Generic;
using budgetbud.Models;

namespace budgetbud.Services;
public class UserDataService
{
    private readonly DbService _dbService;
    private readonly IIdentityService _identityService;

    public UserDataService(DbService dbService, IIdentityService identityService)
    {
        _dbService = dbService;
        _identityService = identityService;
    }

    public async Task<List<Budget>> FetchAssociatedBudgets()
    {
        string user_id = _identityService.GetUserIdentity();

        List<string> budgets = (await _dbService.GetUserData(user_id)).BudgetIds;
        List<Budget> budgetList = [];
        foreach (string budgetId in budgets)
        {
            budgetList.Add(await _dbService.GetBudgetAsync(budgetId));
        }
        return budgetList;
    }

    public async Task<Budget> CreateBudget(string name)
    {
        var budget = await _dbService.CreateNewBudgetAsync(name);
        var user_data = await _dbService.GetUserData(_identityService.GetUserIdentity());
        user_data.BudgetIds.Add(budget.id);
        await _dbService.UpdateUserData(user_data);
        return budget;
    }

    public async Task<Budget> AddExpenseToBudget(string budget_id, Expense expense)
    {
        return await _dbService.AddExpenseAsync(budget_id, expense);
    }

    public async Task<Budget> AddCategoryToBudget(string budget_id, List<Category> categoryList)
    {
        await _dbService.AddCategoryAsync(budget_id, categoryList);
        return await _dbService.GetBudgetAsync(budget_id);
    }

    public async Task<Budget> UpdateCategory(string budget_id, Category category)
    {
        await _dbService.UpdateCategoryAsync(budget_id, category);
        return await _dbService.GetBudgetAsync(budget_id);
    }

    public async Task DeleteBudget(string budget_id)
    {
        await _dbService.DeleteBudgetAsync(budget_id);
    }

    public async Task<Budget> DeleteCategory(string budget_id, int category_id)
    {
        return await _dbService.DeleteCategoryAsync(budget_id, category_id);
    }

    internal async Task<Budget> DeleteExpense(string budget_id, int category_id, int expense_id)
    {
        return await _dbService.DeleteExpenseAsync(budget_id, category_id, expense_id);
    }
}