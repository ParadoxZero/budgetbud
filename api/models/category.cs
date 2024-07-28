namespace budgetbud.Models
{
    public class Category
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public decimal Allocation { get; set; }
        public bool IsActive { get; set; }
        public long LastUpdated { get; set; }
        public required string Currency { get; set; }
        public required List<Expense> ExpenseList { get; set; }
    }
}