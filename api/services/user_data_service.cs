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

    public async Task<Budget> AddExpenseToBudget(string name)
    {
        return await _dbService.CreateNewBudgetAsync(name);
    }

    public async Task<Budget> AddExpenseToBudget(string budget_id, Expense expense)
    {
        await _dbService.AddExpenseAsync(budget_id, expense);
        return await _dbService.GetBudgetAsync(budget_id);
    }
}