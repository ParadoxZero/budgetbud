
namespace budgetbud.Models;
using System;

public enum RecurringType
{
    Weekly = 0,
    Biweekly = 1,
    Monthly = 2,
    Quarterly = 3, // unsupported
    HalfYearly = 4, // unsupported
    Yearly = 5
}

public class Recurring
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public bool IsActive { get; set; }
    public long LastUpdated { get; set; }
    public RecurringType Frequency { get; set; }
    public int FrequencyUnit { get; set; } // This has different meanings based on the frequency, if monthly, it will be day of month, if weekly, it will be day of week etc.
    public long StartDate { get; set; }
    public long EndDate { get; set; }
    public decimal Amount { get; set; }
}