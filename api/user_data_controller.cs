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

    [HttpGet("hello-world")]
    public IActionResult Get()
    {
        return Ok("Hello, World!");
    }

    [HttpGet("user-id")]
    public IActionResult GetUserId()
    {
        try
        {
            return Ok(_identityService.GetUserIdentity());
        }
        catch (Exception e)
        {
            return BadRequest(e.Message + e.StackTrace);
        }
    }
}