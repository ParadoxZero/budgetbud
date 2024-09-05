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

using budgetbud.Exceptions;
using budgetbud.Services;
using Microsoft.AspNetCore.Mvc;

namespace budgetbud.Controllers;
[ApiController]
[Route("api/[controller]")]
public class PingController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public PingController(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    [HttpGet("hello-world")]
    public IActionResult HelloWorld()
    {
        return Ok("Hello World!");
    }

    [HttpGet("user")]
    public IActionResult GetUser()
    {
        try
        {
            string user_id = _identityService.GetUserIdentity();
            dynamic user_data = new
            {
                user_id = user_id,
            };
            return Ok(user_data);
        }
        catch (AuthException e)
        {
            return Unauthorized(e.Message);
        }
    }

    [HttpGet("auth_provider")]
    public IActionResult GetAuthProvider()
    {
        try
        {
            string auth_provider = _identityService.GetAuthProvider();
            dynamic auth_details = new
            {
                provider = auth_provider,
            };
            return Ok(auth_details);
        }
        catch (AuthException e)
        {
            return Unauthorized(e.Message);
        }
    }
}
