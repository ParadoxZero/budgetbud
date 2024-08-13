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

using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace budgetbud.Middlewares;

public class RedirectToLoginMiddleware
{
    private readonly RequestDelegate _next;

    private readonly string[] _unauthenticatedPaths = [
        "/login.html",
        "/favicon.ico",
        "/css",
        "/js",
        "/img",
        "/lib",
        "/icons",
        "/assets",
        "vite.svg"
    ];

    private readonly string[] _apiPaths = [
        "/api"
    ];

    public RedirectToLoginMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Headers.ContainsKey("X-MS-CLIENT-PRINCIPAL"))
        {
            if (!context.Request.Path.HasValue || !_unauthenticatedPaths.Any(path => context.Request.Path.Value.StartsWith(path)))
            {
                context.Response.Redirect("/login.html");
                return;
            }
            else if (_apiPaths.Any(path => context.Request.Path.Value.StartsWith(path)))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized");
                return;
            }
        }

        await _next(context);
    }
}
