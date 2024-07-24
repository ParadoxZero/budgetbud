using Microsoft.AspNetCore.Mvc;

namespace budgetbud.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserDataController : ControllerBase
{
    [HttpGet("hello-world")]
    public IActionResult Get()
    {
        return Ok("Hello, World!");
    }

    [HttpGet("user-id")]
    public IActionResult GetUserId()
    {
        if (HttpContext.Request.Headers.TryGetValue("X-MS-CLIENT-PRINCIPAL", out var clientPrincipal))
        {
            // Use the clientPrincipal value here
            var decodedClientPrincipal = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(clientPrincipal));
            return Ok(decodedClientPrincipal);
        }
        else
        {
            return BadRequest("X-MS-CLIENT-PRINCIPAL header not found");
        }
    }
}