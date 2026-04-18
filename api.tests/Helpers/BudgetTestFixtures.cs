using budgetbud.Models;

namespace budgetbud.Tests.Helpers;

public static class BudgetTestFixtures
{
    public const string TestUserId = "test-user-id";
    public const string OtherUserId = "other-user-id";

    public static Budget MakeBudget(string? id = null, string? userId = null)
    {
        userId ??= TestUserId;
        return new Budget
        {
            id = id ?? Guid.NewGuid().ToString(),
            name = "Test Budget",
            history_id = Guid.NewGuid().ToString(),
            categoryList = new List<Category>(),
            recurringList = new List<Recurring>(),
            unplannedList = new List<Expense>(),
            period = new TimeUnit { Month = 4, Year = 2026 },
            userActions = new List<UserAction>(),
            last_updated = DateTime.UtcNow.Ticks,
            authorized_users = new List<string> { userId },
        };
    }

    public static Category MakeCategory(int id = 1, string name = "Groceries", decimal allocation = 5000)
    {
        return new Category
        {
            Id = id,
            Name = name,
            Description = "",
            Allocation = allocation,
            IsActive = true,
            LastUpdated = DateTime.UtcNow.Ticks,
            Currency = "INR",
            ExpenseList = new List<Expense>(),
        };
    }

    public static Expense MakeExpense(int id = 1, int categoryId = 1, decimal amount = 100, long lastModified = 0)
    {
        return new Expense
        {
            Id = id,
            Title = "Coffee",
            Amount = amount,
            CategoryId = categoryId,
            Timestamp = DateTime.UtcNow.Ticks,
            AddedBy = TestUserId,
            LastModified = lastModified,
        };
    }

    public static UserData MakeUserData(string? userId = null, List<string>? budgetIds = null)
    {
        return new UserData
        {
            id = userId ?? TestUserId,
            NickName = "Test User",
            BudgetIds = budgetIds ?? new List<string>(),
        };
    }

    public static BudgetHistory MakeHistory(string? id = null, Budget[]? history = null)
    {
        return new BudgetHistory
        {
            id = id ?? Guid.NewGuid().ToString(),
            history = history ?? Array.Empty<Budget>(),
        };
    }
}
