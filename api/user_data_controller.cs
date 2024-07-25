using budgetbud.Exceptions;
using budgetbud.Services;
using Microsoft.AspNetCore.Mvc;

namespace budgetbud.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserDataController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public UserDataController(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    [HttpGet]
    public IActionResult GetUserData()
    {
        try
        {
            string user_id = _identityService.GetUserIdentity();
            dynamic user_data = new
            {
                user_id = user_id,
            };
            return Ok(user_data);
        }
        catch (AuthException e)
        {
            return BadRequest(e.Message);
        }
    }
}