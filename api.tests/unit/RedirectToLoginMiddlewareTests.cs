using budgetbud.Middlewares;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Xunit;

namespace budgetbud.Tests.Unit;

public class RedirectToLoginMiddlewareTests
{
    private static DefaultHttpContext MakeContext(string path, bool isAuthenticated)
    {
        var ctx = new DefaultHttpContext();
        ctx.Request.Path = path;
        if (isAuthenticated)
        {
            var identity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, "test") }, "Test");
            ctx.User = new ClaimsPrincipal(identity);
        }
        ctx.Response.Body = new MemoryStream();
        return ctx;
    }

    [Theory]
    [InlineData("/api/budget")]
    [InlineData("/api/user/details")]
    public async Task Returns401_ForUnauthenticatedApiRequests(string path)
    {
        var middleware = new RedirectToLoginMiddleware(_ => Task.CompletedTask);
        var ctx = MakeContext(path, isAuthenticated: false);

        await middleware.InvokeAsync(ctx);

        Assert.Equal(401, ctx.Response.StatusCode);
    }

    [Fact]
    public async Task Redirects_WhenUnauthenticatedUserHitsAppHtml()
    {
        var middleware = new RedirectToLoginMiddleware(_ => Task.CompletedTask);
        var ctx = MakeContext("/app.html", isAuthenticated: false);

        await middleware.InvokeAsync(ctx);

        Assert.Equal(302, ctx.Response.StatusCode);
    }

    [Fact]
    public async Task Redirects_WhenAuthenticatedUserHitsIndexHtml()
    {
        var middleware = new RedirectToLoginMiddleware(_ => Task.CompletedTask);
        var ctx = MakeContext("/index.html", isAuthenticated: true);

        await middleware.InvokeAsync(ctx);

        Assert.Equal(302, ctx.Response.StatusCode);
    }

    [Fact]
    public async Task PassesThrough_WhenUnauthenticatedUserHitsPublicPath()
    {
        bool nextCalled = false;
        var middleware = new RedirectToLoginMiddleware(_ => { nextCalled = true; return Task.CompletedTask; });
        var ctx = MakeContext("/index.html", isAuthenticated: false);

        await middleware.InvokeAsync(ctx);

        Assert.True(nextCalled);
    }
}
