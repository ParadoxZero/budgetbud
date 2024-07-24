namespace budgetbud.Models;


public class UserData
{
    public required string id { get; set; }
    public required string history_id { get; set; }
    public required Category[] categoryList { get; set; }
    public required Recurring[] recurringList { get; set; }
    public required Expense[] unplannedList { get; set; }
    public required TimeUnit history_unit { get; set; }
    public required UserAction[] userActions { get; set; }
    public DateTime last_updated { get; set; }
    public required string[] authorized_users { get; set; }
}