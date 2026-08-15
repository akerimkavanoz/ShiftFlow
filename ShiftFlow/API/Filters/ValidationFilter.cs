using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ShiftFlow.Application.Extensions;

namespace ShiftFlow.API.Filters;

public class ValidationFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        foreach (var arg in context.ActionArguments.Values)
        {
            if (arg == null) continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(arg.GetType());
            var validator = context.HttpContext.RequestServices.GetService(validatorType) as IValidator;

            if (validator != null)
            {
                var validationContext = new ValidationContext<object>(arg);
                var result = validator.Validate(validationContext);

                if (!result.IsValid)
                {
                    var errorMessages = result.Errors.Select(e => e.ErrorMessage).ToList();
                    var serviceResult = ServiceResult.Fail(errorMessages, System.Net.HttpStatusCode.BadRequest);

                    context.Result = new BadRequestObjectResult(serviceResult);
                    return; 
                }
            }
        }
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}