using budgetbud.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;

namespace budgetbud.Tests.Helpers;

public class BudgetBudWebAppFactory : WebApplicationFactory<Program>
{
    public Mock<IDbService> DbServiceMock { get; } = new Mock<IDbService>();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        // Provide stub values so Google OAuth options pass validation,
        // and Cosmos config doesn't crash the DI container build.
        builder.ConfigureAppConfiguration((_, cfg) =>
        {
            cfg.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Auth:GoogleClientId"] = "test-client-id",
                ["Auth:GoogleClientSecret"] = "test-client-secret",
                ["CosmosDb:ConnectionString"] = "AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==",
                ["CosmosDb:Database"] = "test",
                ["CosmosDb:Container"] = "test",
            });
        });

        builder.ConfigureServices(services =>
        {
            // Replace DB with mock so tests don't need Cosmos
            services.RemoveAll<IDbService>();
            services.AddSingleton(DbServiceMock.Object);

            // Re-register UserDataService so it picks up the new IDbService
            services.RemoveAll<UserDataService>();
            services.AddSingleton<UserDataService>();

            // Replace real identity with fixed test identity
            services.RemoveAll<IIdentityService>();
            services.AddSingleton<IIdentityService>(new FixedIdentityService(BudgetTestFixtures.TestUserId));

            // Add a scheme that always authenticates; set it as default so [Authorize] is satisfied
            services.AddAuthentication(TestAuthHandler.SchemeName)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                    TestAuthHandler.SchemeName, _ => { });
        });
    }
}
