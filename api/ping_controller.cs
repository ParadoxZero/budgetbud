using budgetbud.Exceptions;
using budgetbud.Services;
using Microsoft.AspNetCore.Mvc;

namespace budgetbud.Controllers;
[ApiController]
[Route("api/[controller]")]
public class PingController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public PingController(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    [HttpGet("hello-world")]
    public IActionResult HelloWorld()
    {
        return Ok("Hello World!");
    }

    [HttpGet("user")]
    public IActionResult GetUser()
    {
        try
        {
            return Ok(_identityService.GetUserIdentity());
        }
        catch (AuthException e)
        {
            return BadRequest(e.Message);
        }
    }
}