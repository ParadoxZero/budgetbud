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

using budgetbud.api.exceptions;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace budgetbud.Middlewares;

public class RedirectToLoginMiddleware
{
    private readonly RequestDelegate _next;

    private readonly string[] _authenticatedPaths = [
        "/app.html",
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
        var urlPath = context.Request.Path.Value ?? string.Empty;
        bool isAuthenticated = context.User?.Identity?.IsAuthenticated ?? false;

        if (!isAuthenticated)
        {
            if (context.Request.Path.HasValue &&
                _apiPaths.Any(
                    path => urlPath.StartsWith(path)
            ))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized");
                return;
            }

            if (context.Request.Path.HasValue && _authenticatedPaths.Any(
                path => urlPath.StartsWith(path))
            )
            {
                context.Response.Redirect("/index.html");
                return;
            }

        }
        else
        {
            if (urlPath == "/" || urlPath.Equals("/index.html", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.Redirect("/app.html");
                return;
            }
        }
        try
        {
            await _next(context);

        }
        catch (CodedException ex)
        {
            context.Response.StatusCode = ex.StatusCode;
            await context.Response.WriteAsJsonAsync(ex);
        }
    }
}
