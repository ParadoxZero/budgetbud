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
    public DateTime timestamp { get; set; }
    public UserActionType type { get; set; }
    public Category? category { get; set; }
    public Expense? expense { get; set; }
    public Recurring? recurring { get; set; }
    public Expense? unplanned { get; set; }
}