using budgetbud.Models;

namespace budgetbud.Services;

public interface IDbService
{
    Task<UserData> GetUserData(string user_id);
    Task UpdateUserData(UserData userData);
    Task<Budget> GetBudgetAsync(string budget_id);
    Task<Budget> GetBudgetUnauthorizedAsync(string budget_id);
    Task<BudgetHistory> GetHistoryAsync(string history_id);
    Task<Budget> CreateNewBudgetAsync(string name);
    Task UpdateBudgetAsync(Budget budget);
    Task UpdateHistoryAsync(BudgetHistory history);
    Task<Budget> AddExpenseAsync(string budget_id, Expense expense);
    Task<Budget> UpdateExpenseAsync(string budget_id, Expense expense);
    Task AddCategoryAsync(string budget_id, List<Category> categoryList);
    Task UpdateCategoryAsync(string budget_id, Category category);
    Task<Budget> DeleteCategoryAsync(string budget_id, int category_id);
    Task<Budget> DeleteExpenseAsync(string budget_id, int category_id, int expense_id);
    Task DeleteBudgetAsync(string budget_id);
    int GetNextCategoryId(Budget budget);
    Task<Budget> UpdateUserNickName(Budget budget);
}
