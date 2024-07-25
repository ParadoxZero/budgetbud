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
    public DateTime last_updated { get; set; }
    public required List<string> authorized_users { get; set; }
}