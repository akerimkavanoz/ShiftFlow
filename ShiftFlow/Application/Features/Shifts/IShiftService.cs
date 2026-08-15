using ShiftFlow.Application.Extensions;
using ShiftFlow.Application.Features.Shifts.DTOs;

namespace ShiftFlow.Application.Features;

public interface IShiftService
{
    Task<ServiceResult<List<ShiftDto>>> GetAllShiftsAsync();
    Task<ServiceResult<int>> CreateShiftAsync(CreateShiftDto shift);
    Task<ServiceResult> UpdateShiftAsync(UpdateShiftDto model);
    Task<ServiceResult> DeleteShiftAsync(int id);
}
