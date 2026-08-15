namespace ShiftFlow.Application.Features.ShiftAssignments.DTOs;

public record BulkShiftAssignmentDto(
    List<int> EmployeeIds,
    int ShiftId,
    DateTime StartDate,
    DateTime EndDate,
    bool IncludeSaturday = false,
    bool IncludeSunday = false,
    bool OverwriteExisting = false
);
