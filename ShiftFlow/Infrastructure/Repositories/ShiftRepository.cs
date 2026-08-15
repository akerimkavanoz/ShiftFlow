using Microsoft.EntityFrameworkCore;
using ShiftFlow.Application.Extensions.Interfaces.Repositories;
using ShiftFlow.Application.Features.Shifts.DTOs;
using ShiftFlow.Domain.Entities;
using ShiftFlow.Infrastructure.Data;

namespace ShiftFlow.Infrastructure.Repositories;

public class ShiftRepository : GenericRepository<Shift>, IShiftRepository
{
    public ShiftRepository(AppDbContext context) : base(context) { }

    public async Task<IReadOnlyList<ShiftDto>> GetActiveShiftsAsync()
    {
        return await _context.Shifts
            .AsNoTracking()
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new ShiftDto
                (
                    d.Id,
                    d.Name,
                    d.StartTime,
                    d.EndTime,
                    d.ColorCode
                ))
            .ToListAsync();
    }

    public async Task<bool> IsNameExistsAsync(string name, int? currentShiftId = null)
    {
        var trimmedName = name.Trim();

        return await _context.Shifts
            .AsNoTracking()
            .AnyAsync(s => s.IsActive &&
                           EF.Functions.Collate(s.Name, "Turkish_CI_AS") == EF.Functions.Collate(trimmedName, "Turkish_CI_AS") &&
                           (!currentShiftId.HasValue || s.Id != currentShiftId.Value));
    }
}
