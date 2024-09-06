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

using budgetbud.Exceptions;
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
        List<Budget> budgetList = new List<Budget>();
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

    public async Task<Budget> DeleteExpense(string budget_id, int category_id, int expense_id)
    {
        return await _dbService.DeleteExpenseAsync(budget_id, category_id, expense_id);
    }

    public async Task<Budget> RolloverBudget(string budget_id)
    {
        Budget budget = await _dbService.GetBudgetAsync(budget_id);
        BudgetHistory history = await _dbService.GetHistoryAsync(budget.history_id);
        IList<Budget> history_list = new List<Budget>(history.history);
        history_list.Add(budget);
        history.history = history_list.ToArray();
        await _dbService.UpdateHistoryAsync(history);
        budget.categoryList.ForEach((Category c) => { c.ExpenseList.Clear(); });
        if (budget.period.Month == DateTime.Now.Month && budget.period.Year == DateTime.Now.Year)
        {
            throw new InvalidInputException("You cannot rollover right now, please use force api operation if required");
        }
        budget.period = budget.period.Increment();
        await _dbService.UpdateBudgetAsync(budget);
        return budget;
    }
}
