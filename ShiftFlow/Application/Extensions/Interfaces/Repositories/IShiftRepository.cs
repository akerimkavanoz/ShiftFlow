using ShiftFlow.Application.Features.Shifts.DTOs;
using ShiftFlow.Domain.Entities;

namespace ShiftFlow.Application.Extensions.Interfaces.Repositories;

public interface IShiftRepository : IGenericRepository<Shift>
{
    Task<IReadOnlyList<ShiftDto>> GetActiveShiftsAsync();
    Task<bool> IsNameExistsAsync(string name, int? currentShiftId = null);
}
