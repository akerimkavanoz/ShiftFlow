using Microsoft.AspNetCore.Mvc;
using ShiftFlow.Application.Extensions;
using ShiftFlow.Application.Features.ShiftAssignments;
using ShiftFlow.Application.Features.ShiftAssignments.DTOs;

namespace ShiftFlow.API.Controllers;

public class ShiftAssignmentsController(IShiftAssignmentService shiftAssignmentService) : CustomBaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return CreateActionResult(await shiftAssignmentService.GetAllShiftAssignmentsAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateShiftAssignmentDto model)
    {
        return CreateActionResult(await shiftAssignmentService.CreateShiftAssignmentAsync(model));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateShiftAssignmentDto model)
    {
        if (id != model.Id)
        {
            return CreateActionResult(ServiceResult<bool>.Fail("URL'deki ID ile gönderilen veri içerisindeki ID uyuşmuyor.", System.Net.HttpStatusCode.BadRequest));
        }

        return CreateActionResult(await shiftAssignmentService.UpdateShiftAssignmentAsync(model));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        return CreateActionResult(await shiftAssignmentService.DeleteShiftAssignmentAsync(id));
    }

    [HttpGet("export-pdf")]
    public async Task<IActionResult> ExportMonthlyReport(
        [FromQuery] int departmentId,
        [FromQuery] int year,
        [FromQuery] int month)
    {
        var result = await shiftAssignmentService.GenerateMonthlyReportPdfAsync(departmentId, year, month);

        if (result.IsFail)
        {
            return CreateActionResult(result);
        }

        var (fileBytes, fileName) = result.Data;

        return File(fileBytes, "application/pdf", fileName);
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkCreate([FromBody] BulkShiftAssignmentDto model)
    {
        return CreateActionResult(await shiftAssignmentService.BulkAssignShiftsAsync(model));
    }
}