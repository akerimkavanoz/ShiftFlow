using Microsoft.AspNetCore.Mvc;
using ShiftFlow.Application.Extensions;
using ShiftFlow.Application.Features;
using ShiftFlow.Application.Features.Shifts.DTOs;

namespace ShiftFlow.API.Controllers;

public class ShiftsController(IShiftService shiftService) : CustomBaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return CreateActionResult(await shiftService.GetAllShiftsAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateShiftDto model)
    {
        return CreateActionResult(await shiftService.CreateShiftAsync(model));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateShiftDto model)
    {
        if (id != model.Id)
        {
            return CreateActionResult(ServiceResult<bool>.Fail("URL'deki ID ile gönderilen veri içerisindeki ID uyuşmuyor.", System.Net.HttpStatusCode.BadRequest));
        }

        return CreateActionResult(await shiftService.UpdateShiftAsync(model));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        return CreateActionResult(await shiftService.DeleteShiftAsync(id));
    }
}
