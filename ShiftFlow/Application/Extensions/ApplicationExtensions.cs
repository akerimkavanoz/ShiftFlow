using FluentValidation;
using ShiftFlow.Application.Extensions.Interfaces.Services;
using ShiftFlow.Application.Features;
using ShiftFlow.Application.Features.Departments;
using ShiftFlow.Application.Features.Employees;
using ShiftFlow.Application.Features.ShiftAssignments;
using ShiftFlow.Application.Features.Shifts;
using ShiftFlow.Infrastructure.Services;

namespace ShiftFlow.Application.Extensions;

public static class ApplicationExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ILogService, LogService>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IShiftService, ShiftService>();
        services.AddScoped<IShiftAssignmentService, ShiftAssignmentService>();
        services.AddScoped<IPdfService, PdfService>();

        services.AddValidatorsFromAssembly(typeof(ApplicationExtensions).Assembly);

        return services;
    }
}