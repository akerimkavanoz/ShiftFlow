using Microsoft.EntityFrameworkCore;
using ShiftFlow.Application.Extensions.Interfaces.Repositories;
using ShiftFlow.Infrastructure.Data;
using ShiftFlow.Infrastructure.Data.Configurations;
using ShiftFlow.Infrastructure.Repositories;

namespace ShiftFlow.Infrastructure.Extensions;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            var connectionStrings = configuration.GetSection(ConnectionStringOptions.Key).Get<ConnectionStringOptions>();
            options.UseSqlServer(connectionStrings!.SqlServer);
        });

        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IDepartmentRepository, DepartmentRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IShiftRepository, ShiftRepository>();
        services.AddScoped<IShiftAssignmentRepository, ShiftAssignmentRepository>();

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}