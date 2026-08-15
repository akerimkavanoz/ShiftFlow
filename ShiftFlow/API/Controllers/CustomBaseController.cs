using Microsoft.AspNetCore.Mvc;
using ShiftFlow.Application.Extensions;
using System.Net;

namespace ShiftFlow.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CustomBaseController : ControllerBase
{
    [NonAction]
    protected IActionResult CreateActionResult(ServiceResult result)
    {
        if (result.Status == HttpStatusCode.NoContent)
        {
            return new ObjectResult(null) { StatusCode = (int)result.Status };
        }

        return StatusCode((int)result.Status, result);
    }

    [NonAction]
    protected IActionResult CreateActionResult<T>(ServiceResult<T> result)
    {
        if (result.Status == HttpStatusCode.NoContent)
        {
            return new ObjectResult(null) { StatusCode = (int)result.Status };
        }

        return StatusCode((int)result.Status, result);
    }
}