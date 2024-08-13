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

using System;
using budgetbud.Exceptions;
using budgetbud.Models;
using budgetbud.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Caching.Memory;

namespace budgetbud.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SocialController : ControllerBase
{
    private readonly IIdentityService _identityService;
    private readonly IMemoryCache _cache;
    private readonly DbService _dbService;

    private static readonly Random random = new();

    public record CreateShareKey(string shareKey);

    public SocialController(IIdentityService identityService, IMemoryCache cache, DbService dbService)
    {
        _identityService = identityService;
        _cache = cache;
        _dbService = dbService;
    }

    [HttpPost("share/{budget_id}")]
    public async Task<IActionResult> ShareBudget(string budget_id)
    {
        try
        {
            string user_id = _identityService.GetUserIdentity();
            string key = "";
            do
            {
                key = GenerateShareKey(8);
            } while (_cache.TryGetValue(key, out _));
            await _dbService.GetBudgetAsync(budget_id);
            _cache.Set(key, budget_id, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
            });

            return Ok(new CreateShareKey(key));
        }
        catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return NotFound();
        }

    }

    [HttpPost("link/{key}")]
    public async Task<IActionResult> GetSharedBudget(string key)
    {
        if (_cache.TryGetValue(key, out string? budget_id))
        {
            try
            {
                var budget = await _dbService.GetBudgetAsync(budget_id ?? "");
                string user_id = _identityService.GetUserIdentity();
                UserData user_data = await _dbService.GetUserData(user_id);
                budget.authorized_users.Add(user_id);
                user_data.BudgetIds.Add(budget.id);
                await _dbService.UpdateBudgetAsync(budget);
                await _dbService.UpdateUserData(user_data);
                return Ok();
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return NotFound();
            }
        }
        else
        {
            return NotFound();
        }
    }

    private static string GenerateShareKey(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return new string(Enumerable.Repeat(chars, length)
          .Select(s => s[random.Next(s.Length)]).ToArray());
    }


}