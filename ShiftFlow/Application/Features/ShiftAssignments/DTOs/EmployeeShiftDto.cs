namespace ShiftFlow.Application.Features.ShiftAssignments.DTOs;

public record EmployeeShiftDto(string EmployeeName, string Department, List<string> Days);
