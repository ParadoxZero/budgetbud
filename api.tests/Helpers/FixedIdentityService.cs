using budgetbud.Services;

namespace budgetbud.Tests.Helpers;

public class FixedIdentityService : IIdentityService
{
    private readonly string _userId;

    public FixedIdentityService(string userId) => _userId = userId;

    public string GetUserIdentity() => _userId;
    public string GetAuthProvider() => "test";
}
