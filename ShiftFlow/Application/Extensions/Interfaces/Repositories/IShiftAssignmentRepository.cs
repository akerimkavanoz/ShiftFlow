using ShiftFlow.Application.Features.ShiftAssignments.DTOs;
using ShiftFlow.Domain.Entities;

namespace ShiftFlow.Application.Extensions.Interfaces.Repositories;

public interface IShiftAssignmentRepository : IGenericRepository<ShiftAssignment>
{
    Task<IReadOnlyList<ShiftAssignmentDto>> GetActiveAssignmentsAsync();
    Task<List<ShiftAssignmentDto>> GetMonthlyAssignmentsByDepartmentAsync(int departmentId, int year, int month);
    Task<bool> HasActiveAssignmentsByShiftIdAsync(int shiftId);
    Task<bool> HasAssignmentByEmployeeAndDateAsync(int employeeId, DateOnly date, int? currentAssignmentId = null);
    Task SoftDeleteByEmployeeIdAsync(int employeeId);
    Task<List<ShiftAssignment>> GetActiveAssignmentsByEmployeeIdsAndDateRangeAsync(List<int> employeeIds, DateOnly startDate, DateOnly endDate);
}