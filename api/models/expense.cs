namespace budgetbud.Models;

public class Expense
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public decimal Amount { get; set; }
    public int CategoryId { get; set; }
    public long Timestamp { get; set; }
}