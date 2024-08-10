using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace budgetbud.Middlewares;

public class RedirectToLoginMiddleware
{
    private readonly RequestDelegate _next;

    private readonly string[] _allowedPaths = new string[] {
        "/login.html",
        "/favicon.ico",
        "/css",
        "/js",
        "/img",
        "/lib",
        "/icons",
        "/assets",
        "vite.svg"
    };

    public RedirectToLoginMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.HasValue && !_allowedPaths.Any(path => context.Request.Path.Value.StartsWith(path)))
        {
            if (!context.Request.Headers.ContainsKey("X-MS-CLIENT-PRINCIPAL"))
            {
                context.Response.Redirect("/login.html");
                return;
            }
        }

        await _next(context);
    }
}
