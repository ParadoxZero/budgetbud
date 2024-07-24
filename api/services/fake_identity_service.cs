namespace budgetbud.Services;

public class FakeIdentityService : IIdentityService
{
    private readonly IWebHostEnvironment _environment;

    public FakeIdentityService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public string GetUserIdentity()
    {
        if (_environment.IsProduction())
        {
            throw new Exception("FakeIdentityService should not be used in production");
        }
        return "fake_user:123";
    }

}