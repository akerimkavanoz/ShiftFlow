using Microsoft.AspNetCore.Mvc;
using ShiftFlow.Application.Extensions;
using ShiftFlow.Application.Features.Departments;
using ShiftFlow.Application.Features.Departments.DTOs;

namespace ShiftFlow.API.Controllers;

public class DepartmentsController(IDepartmentService departmentService) : CustomBaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return CreateActionResult(await departmentService.GetAllDepartmentsAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateDepartmentDto model)
    {
        return CreateActionResult(await departmentService.CreateDepartmentAsync(model));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateDepartmentDto model)
    {
        if (id != model.Id)
        {
            return CreateActionResult(ServiceResult<bool>.Fail("URL'deki ID ile gönderilen veri içerisindeki ID uyuşmuyor.", System.Net.HttpStatusCode.BadRequest));
        }

        return CreateActionResult(await departmentService.UpdateDepartmentAsync(model));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        return CreateActionResult(await departmentService.DeleteDepartmentAsync(id));
    }
}