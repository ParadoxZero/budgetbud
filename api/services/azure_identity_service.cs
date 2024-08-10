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
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace budgetbud.Services;

public class AzureIdentityService : IIdentityService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AzureIdentityService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string GetUserIdentity()
    {
        if (_httpContextAccessor.HttpContext != null && _httpContextAccessor.HttpContext!.Request.Headers.TryGetValue("X-MS-CLIENT-PRINCIPAL", out var userId))
        {
            string decoded_userId = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(userId!));
            dynamic claims = JsonConvert.DeserializeObject(decoded_userId) ?? throw new Exception("Claims not valid JSON");
            string provider = claims.auth_typ;
            switch (provider)
            {
                case "github":
                    return ProcessGithub(claims);
                case "google":
                    return ProcessGoogle(claims);
                default:
                    throw new AuthException("Provider not supported" + claims);
            }
        }

        throw new AuthException("X-MS-CLIENT-PRINCIPAL-ID header not found");
    }

    private static string ProcessGithub(dynamic json)
    {
        JArray claims = json.claims;
        foreach (dynamic claim in claims)
        {
            if (claim.typ == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
            {
                return "github:" + claim.val;
            }
        }
        throw new AuthException("Name claim not found");
    }

    private static string ProcessGoogle(dynamic json)
    {
        JArray claims = json.claims;
        foreach (dynamic claim in claims)
        {
            if (claim.typ == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
            {
                return "google:" + claim.val;
            }
        }
        throw new AuthException("Name claim not found");
    }
}