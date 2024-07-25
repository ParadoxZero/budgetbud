using System.Collections.Generic;
using budgetbud.Models;

namespace budgetbud.Services;
public class UserDataService
{
    private readonly DbService _dbService;

    public UserDataService(DbService dbService)
    {
        _dbService = dbService;
    }

    public List<Budget> FetchAssociatedBudgets(string userId)
    {
        throw new NotImplementedException();
    }
}