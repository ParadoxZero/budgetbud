using budgetbud.Exceptions;
using budgetbud.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos.Serialization.HybridRow.RecordIO;
using Microsoft.Identity.Client;

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
        return Ok(await _userDataService.AddExpenseToBudget(input.name));
    }

}
