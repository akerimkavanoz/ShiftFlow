using ShiftFlow.Application.Extensions;
using ShiftFlow.Application.Features.ShiftAssignments.DTOs;

namespace ShiftFlow.Application.Features.ShiftAssignments;

public interface IShiftAssignmentService
{
    Task<ServiceResult<List<ShiftAssignmentDto>>> GetAllShiftAssignmentsAsync();
    Task<ServiceResult<int>> CreateShiftAssignmentAsync(CreateShiftAssignmentDto model);
    Task<ServiceResult> UpdateShiftAssignmentAsync(UpdateShiftAssignmentDto model);
    Task<ServiceResult> DeleteShiftAssignmentAsync(int id);
    Task<ServiceResult<(byte[] FileBytes, string FileName)>> GenerateMonthlyReportPdfAsync(int departmentId, int year, int month);
    Task<ServiceResult> BulkAssignShiftsAsync(BulkShiftAssignmentDto dto);
}