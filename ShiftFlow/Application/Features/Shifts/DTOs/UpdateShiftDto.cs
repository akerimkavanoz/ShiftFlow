namespace ShiftFlow.Application.Features.Shifts.DTOs;

public record UpdateShiftDto(int Id, string Name, TimeOnly? StartTime, TimeOnly? EndTime, string? ColorCode);
