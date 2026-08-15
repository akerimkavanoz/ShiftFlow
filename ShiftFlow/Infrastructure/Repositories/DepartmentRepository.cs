using Microsoft.EntityFrameworkCore;
using ShiftFlow.Application.Extensions.Interfaces.Repositories;
using ShiftFlow.Application.Features.Departments.DTOs;
using ShiftFlow.Domain.Entities;
using ShiftFlow.Infrastructure.Data;

namespace ShiftFlow.Infrastructure.Repositories;

public class DepartmentRepository : GenericRepository<Department>, IDepartmentRepository
{
    public DepartmentRepository(AppDbContext context) : base(context) { }

    public async Task<IReadOnlyList<DepartmentDto>> GetActiveDepartmentsAsync()
    {
        return await _context.Departments
            .AsNoTracking()
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto
                (
                    d.Id,
                    d.Name
                ))
            .ToListAsync();
    }

    public async Task<bool> IsNameExistsAsync(string name, int? currentDepartmentId = null)
    {
        var trimmedName = name.Trim();

        return await _context.Departments
            .AsNoTracking()
            .AnyAsync(d => d.IsActive &&
                           EF.Functions.Collate(d.Name, "Turkish_CI_AS") == EF.Functions.Collate(trimmedName, "Turkish_CI_AS") &&
                           (!currentDepartmentId.HasValue || d.Id != currentDepartmentId.Value));
    }
}