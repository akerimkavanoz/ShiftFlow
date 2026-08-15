namespace ShiftFlow.Application.Features.ShiftAssignments.DTOs;

public record ShiftAssignmentDto(int Id, int EmployeeId, int ShiftId, DateOnly Date, DateTime CreatedAt, DateTime? UpdatedAt);