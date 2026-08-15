using Microsoft.EntityFrameworkCore;
using ShiftFlow.Application.Extensions.Interfaces.Repositories;
using ShiftFlow.Application.Features.ShiftAssignments.DTOs;
using ShiftFlow.Domain.Entities;
using ShiftFlow.Infrastructure.Data;

namespace ShiftFlow.Infrastructure.Repositories;

public class ShiftAssignmentRepository : GenericRepository<ShiftAssignment>, IShiftAssignmentRepository
{
    public ShiftAssignmentRepository(AppDbContext context) : base(context) { }

    public async Task<IReadOnlyList<ShiftAssignmentDto>> GetActiveAssignmentsAsync()
    {
        return await _context.ShiftAssignments
            .AsNoTracking()
            .Where(x => x.IsActive)
            .Select(x => new ShiftAssignmentDto
            (
                x.Id,
                x.EmployeeId,
                x.ShiftId,
                x.Date,
                x.CreatedAt,
                x.UpdatedAt
            ))
            .ToListAsync();
    }

    public async Task<List<ShiftAssignmentDto>> GetMonthlyAssignmentsByDepartmentAsync(int departmentId, int year, int month)
    {
        return await _context.ShiftAssignments
            .AsNoTracking()
            .Where(x => x.Employee.DepartmentId == departmentId &&
                        x.IsActive &&
                        x.Date.Year == year &&
                        x.Date.Month == month)
            .Select(x => new ShiftAssignmentDto(
                x.Id,
                x.EmployeeId,
                x.ShiftId,
                x.Date,
                x.CreatedAt,
                x.UpdatedAt
            ))
            .ToListAsync();
    }

    public async Task<bool> HasActiveAssignmentsByShiftIdAsync(int shiftId)
    {
        return await _context.ShiftAssignments
            .AsNoTracking()
            .AnyAsync(sa => sa.IsActive && sa.ShiftId == shiftId);
    }

    public async Task<bool> HasAssignmentByEmployeeAndDateAsync(int employeeId, DateOnly date, int? currentAssignmentId = null)
    {
        return await _context.ShiftAssignments
            .AsNoTracking()
            .AnyAsync(sa => sa.IsActive &&
                           sa.EmployeeId == employeeId &&
                           sa.Date == date &&
                           (!currentAssignmentId.HasValue || sa.Id != currentAssignmentId.Value));
    }

    public async Task SoftDeleteByEmployeeIdAsync(int employeeId)
    {
        var assignments = await _context.ShiftAssignments
            .Where(i => i.EmployeeId == employeeId)
            .ToListAsync();

        assignments.ForEach(a => SoftDelete(a));
    }

    public async Task<List<ShiftAssignment>> GetActiveAssignmentsByEmployeeIdsAndDateRangeAsync(List<int> employeeIds, DateOnly startDate, DateOnly endDate)
    {
        return await _context.ShiftAssignments
            .Where(x => x.IsActive &&
                        employeeIds.Contains(x.EmployeeId) &&
                        x.Date >= startDate &&
                        x.Date <= endDate)
            .ToListAsync();
    }
}