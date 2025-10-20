/* 
 * BudgetBud - Budgeting and Expense Tracker with WebUI and API server
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

using budgetbud.Exceptions;
using budgetbud.Models;
using budgetbud.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace budgetbud.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
  private readonly UserDataService _userDataService;
  private readonly IIdentityService _identityService;

  public UserController(UserDataService userDataService, IIdentityService identityService)
  {
    _userDataService = userDataService;
    _identityService = identityService;
  }

  public record GetUserDetailsResponse(string nickName, string id);
  [HttpGet("details")]
  public async Task<IActionResult> GetUserDetails()
  {
    var userDetails = new GetUserDetailsResponse(
        nickName: await _userDataService.GetUserNickName(),
        id: _identityService.GetUserIdentity()
    );
    return Ok(userDetails);
  }

  public record UpdateNickNameInput(string nickName);
  [HttpPost("nickname")]
  public async Task<IActionResult> UpdateUserNickName([FromBody] UpdateNickNameInput input)
  {
      // Validate the new nickname (e.g., check length, forbidden characters, etc.)
      if (string.IsNullOrWhiteSpace(input.nickName))
      {
          return BadRequest("Invalid nickname.");
      }

      // Update the nickname in the user data service
      await _userDataService.UpdateUserNickName(input.nickName);
      return NoContent();
  }
}