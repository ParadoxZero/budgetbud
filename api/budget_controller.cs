using budgetbud.Models;
using budgetbud.Services;
using Microsoft.AspNetCore.Mvc;

namespace budgetbud.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetController : ControllerBase
{
    private readonly UserDataService _userDataService;

    public BudgetController(UserDataService userDataService)
    {
        _userDataService = userDataService;
    }

    [HttpGet]
    public async Task<IActionResult> GetBudgets()
    {
        return Ok(await _userDataService.FetchAssociatedBudgets());
    }

    public record CreateBudgetInput(string name);
    [HttpPost]
    public async Task<IActionResult> CreateBudget([FromBody] CreateBudgetInput input)
    {
        return Ok(await _userDataService.CreateBudget(input.name));
    }

    [HttpPost("{budget_id}/categories")]
    public async Task<IActionResult> AddCategoryInput(string budget_id, List<Category> categoryList)
    {
        return Ok(await _userDataService.AddCategoryToBudget(budget_id, categoryList));
    }


    [HttpPost("{budget_id}/expense")]
    public async Task<IActionResult> AddExpenseInput(string budget_id, Expense expense)
    {
        return Ok(await _userDataService.AddExpenseToBudget(budget_id, expense));
    }

}
