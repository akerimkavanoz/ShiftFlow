using ShiftFlow.Application.Extensions;
using ShiftFlow.Application.Features.Employees.DTOs;

namespace ShiftFlow.Application.Features.Employees;

public interface IEmployeeService
{
    Task<ServiceResult<List<EmployeeDto>>> GetAllEmployeesAsync();
    Task<ServiceResult<int>> CreateEmployeeAsync(CreateEmployeeDto employee);
    Task<ServiceResult> UpdateEmployeeAsync(UpdateEmployeeDto model);
    Task<ServiceResult> DeleteEmployeeAsync(int id);
    Task<ServiceResult<List<EmployeeDto>>> GetEmployeesByDepartmentAsync(int departmentId);
}
