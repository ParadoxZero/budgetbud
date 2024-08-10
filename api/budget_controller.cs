/* 
 * BudgetBug - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2024  Sidhin S Thomas <sidhin.thomas@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * The source is available at: https://github.com/ParadoxZero/budgetbud
 */

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

    [HttpDelete("{budget_id}")]
    public async Task<IActionResult> DeleteBudget(string budget_id)
    {
        await _userDataService.DeleteBudget(budget_id);
        return Ok();
    }

    [HttpPost("{budget_id}/add_categories")]
    public async Task<IActionResult> AddCategoryInput(string budget_id, List<Category> categoryList)
    {
        return Ok(await _userDataService.AddCategoryToBudget(budget_id, categoryList));
    }

    [HttpPost("{budget_id}/update_category")]
    public async Task<IActionResult> UpdateCategoryInput(string budget_id, Category category)
    {
        return Ok(await _userDataService.UpdateCategory(budget_id, category));
    }

    [HttpDelete("{budget_id}/category/{category_id}")]
    public async Task<IActionResult> DeleteCategory(string budget_id, int category_id)
    {
        return Ok(await _userDataService.DeleteCategory(budget_id, category_id));
    }


    [HttpPost("{budget_id}/expense")]
    public async Task<IActionResult> AddExpenseInput(string budget_id, Expense expense)
    {
        return Ok(await _userDataService.AddExpenseToBudget(budget_id, expense));
    }

    [HttpDelete("{budget_id}/category/{category_id}/expense/{expense_id}")]
    public async Task<IActionResult> DeleteExpense(string budget_id, int category_id, int expense_id)
    {
        return Ok(await _userDataService.DeleteExpense(budget_id, category_id, expense_id));
    }

}
