using ShiftFlow.Application.Features.Departments.DTOs;
using ShiftFlow.Domain.Entities;

namespace ShiftFlow.Application.Extensions.Interfaces.Repositories;

public interface IDepartmentRepository : IGenericRepository<Department>
{
    Task<IReadOnlyList<DepartmentDto>> GetActiveDepartmentsAsync();
    Task<bool> IsNameExistsAsync(string name, int? currentDepartmentId = null);
}