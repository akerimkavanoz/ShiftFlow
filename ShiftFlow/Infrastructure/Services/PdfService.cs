using QuestPDF.Fluent;
using ShiftFlow.Application.Extensions.Interfaces.Services;
using ShiftFlow.Application.Features.ShiftAssignments.DTOs;
using ShiftFlow.Infrastructure.Reports;

namespace ShiftFlow.Infrastructure.Services;

public class PdfService : IPdfService
{
    public byte[] GenerateMonthlyShiftReport(
        List<EmployeeShiftDto> reportData,
        int year,
        int month,
        string departmentName,
        Dictionary<string, string> shiftDefinitions,
        Dictionary<string, string> shiftColors)
    {
        var report = new MonthlyShiftReport(reportData, year, month, departmentName, shiftDefinitions, shiftColors);
        return report.GeneratePdf();
    }
}