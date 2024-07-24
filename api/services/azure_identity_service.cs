using budgetbud.Exceptions;
using Newtonsoft.Json;

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
                default:
                    throw new AuthException("Provider not supported" + claims);
            }
        }

        throw new AuthException("X-MS-CLIENT-PRINCIPAL-ID header not found");
    }

    private static string ProcessGithub(dynamic json)
    {
        dynamic[] claims = json.claims;
        foreach (dynamic claim in claims)
        {
            if (claim.typ == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
            {
                return "github:" + claim.val;
            }
        }
        throw new AuthException("Name claim not found");
    }
}