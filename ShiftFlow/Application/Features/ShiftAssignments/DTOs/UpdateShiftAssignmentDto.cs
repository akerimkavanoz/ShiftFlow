namespace ShiftFlow.Application.Features.ShiftAssignments.DTOs;

public record UpdateShiftAssignmentDto(int Id, int EmployeeId, int ShiftId, DateTime Date);