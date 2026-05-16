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

using budgetbud.Models.Request;
using budgetbud.Models.Response;
using budgetbud.Exceptions;
using budgetbud.Models;
using budgetbud.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace budgetbud.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
  private readonly UserDataService _userDataService;
  private readonly IIdentityService _identityService;
  private readonly IConfiguration _configuration;

  public UserController(UserDataService userDataService, IIdentityService identityService, IConfiguration configuration)
  {
    _userDataService = userDataService;
    _identityService = identityService;
    _configuration = configuration;
  }

  [HttpGet("details")]
  public async Task<IActionResult> GetUserDetails()
  {
    var userDetails = new GetUserDetailsResponse(
        nickName: await _userDataService.GetUserNickName(),
        id: _identityService.GetUserIdentity()
    );
    return Ok(userDetails);
  }

  // Issues a JWT for the current authenticated session.
  // Native (Capacitor) clients store this in the device Keychain/Keystore and
  // attach it as a Bearer token on subsequent launches, surviving cookie eviction.
  [HttpGet("token")]
  [Authorize(AuthenticationSchemes =
      Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults.AuthenticationScheme)]
  public IActionResult GetToken()
  {
      var jwtKey = _configuration.GetValue<string>("Auth:JwtKey");
      if (string.IsNullOrEmpty(jwtKey))
          return StatusCode(503, "JWT not configured");

      var userId = _identityService.GetUserIdentity();
      var expiryDays = _configuration.GetValue<int>("Auth:JwtExpiryDays", 30);

      var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
      var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
      var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId) };

      var token = new JwtSecurityToken(
          issuer: "budgetbud",
          audience: "budgetbud",
          claims: claims,
          expires: DateTime.UtcNow.AddDays(expiryDays),
          signingCredentials: credentials
      );

      return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
  }

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