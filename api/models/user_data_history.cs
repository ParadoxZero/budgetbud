namespace budgetbud.Models;
public class UserDataHistory
{
    public required string id { get; set; }
    public required UserData[] history { get; set; }
}