using ShiftFlow.Application.Features.ShiftAssignments.DTOs;

namespace ShiftFlow.Application.Extensions.Interfaces.Services;

public interface IPdfService
{
    byte[] GenerateMonthlyShiftReport(
        List<EmployeeShiftDto> reportData,
        int year,
        int month,
        string departmentName,
        Dictionary<string, string> shiftDefinitions,
        Dictionary<string, string> shiftColors);
}