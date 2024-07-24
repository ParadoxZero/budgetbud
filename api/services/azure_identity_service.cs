using System.Diagnostics;
using System.Text.Json;
using budgetbud.Services;

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
        if (_httpContextAccessor.HttpContext != null && _httpContextAccessor.HttpContext!.Request.Headers.TryGetValue("X-MS-CLIENT-PRINCIPAL-ID", out var userId))
        {
            string decoded_userId = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(userId!));
            dynamic claims = JsonSerializer.Deserialize<dynamic>(decoded_userId) ?? throw new Exception("Claims not valid JSON");
            string provider = claims.provider_name;
            switch (provider)
            {
                case "github":
                    return ProcessGithub(claims);
                default:
                    throw new Exception("Provider not supported");
            }
        }

        throw new Exception("X-MS-CLIENT-PRINCIPAL-ID header not found");
    }

    private static string ProcessGithub(dynamic json)
    {
        string? claims = json.user_claims;
        foreach (dynamic claim in claims)
        {
            if (claim.typ == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
            {
                return "github:" + claim.val;
            }
        }
        throw new Exception("Name claim not found");
    }
}