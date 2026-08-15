using Microsoft.AspNetCore.Diagnostics;
using ShiftFlow.Application.Extensions;
using System.Net;

namespace ShiftFlow.API.ExceptionHandlers;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Sistemde beklenmedik bir hata oluştu: {Message}", exception.Message);

        var response = ServiceResult.Fail(
            "Sistemde beklenmedik bir hata meydana geldi. Lütfen daha sonra tekrar deneyiniz veya sistem yöneticisi ile iletişime geçiniz.",
            HttpStatusCode.InternalServerError
        );

        httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        httpContext.Response.ContentType = "application/json";

        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

        return true;
    }
}