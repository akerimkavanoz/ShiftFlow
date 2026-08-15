using ShiftFlow.Application.Features.Employees.DTOs;
using ShiftFlow.Domain.Entities;

namespace ShiftFlow.Application.Extensions.Interfaces.Repositories;

public interface IEmployeeRepository : IGenericRepository<Employee>
{
    Task<IReadOnlyList<EmployeeDto>> GetActiveEmployeesAsync();
    Task<IReadOnlyList<EmployeeDto>> GetActiveEmployeesByDepartmentAsync(int departmentId);
}
