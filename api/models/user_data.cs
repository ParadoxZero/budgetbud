using System.Collections.Generic;

namespace budgetbud.Models;
public class UserData
{
    public required string id { get; set; }
    public required List<string> BudgetIds { get; set; }
}
