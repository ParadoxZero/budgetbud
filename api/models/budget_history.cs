namespace budgetbud.Models;
public class BudgetHistory
{
    public required string id { get; set; }
    public required Budget[] history { get; set; }
}