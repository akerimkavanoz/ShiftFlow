namespace ShiftFlow.Application.Features.Shifts.DTOs;

public record CreateShiftDto(string Name, TimeOnly? StartTime, TimeOnly? EndTime, string ColorCode);
