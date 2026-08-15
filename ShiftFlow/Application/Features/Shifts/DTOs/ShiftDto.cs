namespace ShiftFlow.Application.Features.Shifts.DTOs;

public record ShiftDto(int Id, string Name, TimeOnly? StartTime, TimeOnly? EndTime, string? ColorCode);
