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
        await _dbService.AddExpenseAsync(budget_id, expense);
        return await _dbService.GetBudgetAsync(budget_id);
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