using ShiftFlow.Application.Extensions;
using ShiftFlow.Application.Features.Departments.DTOs;

namespace ShiftFlow.Application.Features.Departments;

public interface IDepartmentService
{
    Task<ServiceResult<List<DepartmentDto>>> GetAllDepartmentsAsync();
    Task<ServiceResult<int>> CreateDepartmentAsync(CreateDepartmentDto department);
    Task<ServiceResult> UpdateDepartmentAsync(UpdateDepartmentDto model);
    Task<ServiceResult> DeleteDepartmentAsync(int id);
}