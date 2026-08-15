namespace ShiftFlow.Application.Features.ShiftAssignments.DTOs;

public record CreateShiftAssignmentDto(int EmployeeId,int ShiftId, DateTime Date);