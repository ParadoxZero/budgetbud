/* 
 * BudgetBud - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2025  Sidhin S Thomas <sidhin.thomas@gmail.com>
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

using budgetbud.Utils;
using System.Security.Claims;

namespace budgetbud.Services;

public class BuiltInIdentityService : IIdentityService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public BuiltInIdentityService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string GetUserIdentity()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated != true)
            throw new UnauthorizedAccessException("User not authenticated");

        // Get stable unique ID (sub or nameidentifier)
        var id = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
              ?? user.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(id))
            throw new UnauthorizedAccessException("No identity claim found");

        var provider = GetAuthProvider().ToLower();
        return HashUtility.HashUserId($"{provider}:{id}");
    }

    public string GetAuthProvider()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated != true)
            throw new UnauthorizedAccessException("User not authenticated");

        // Usually "Google", "GitHub", etc.
        return user.Identity!.AuthenticationType ?? "unknown";
    }
}