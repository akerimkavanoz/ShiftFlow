using Microsoft.AspNetCore.Mvc;
using ShiftFlow.Application.Extensions;
using ShiftFlow.Application.Features.Employees;
using ShiftFlow.Application.Features.Employees.DTOs;

namespace ShiftFlow.API.Controllers;

public class EmployeesController(IEmployeeService employeeService) : CustomBaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return CreateActionResult(await employeeService.GetAllEmployeesAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateEmployeeDto model)
    {
        return CreateActionResult(await employeeService.CreateEmployeeAsync(model));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateEmployeeDto model)
    {
        if (id != model.Id)
        {
            return CreateActionResult(ServiceResult<bool>.Fail("URL'deki ID ile gönderilen veri içerisindeki ID uyuşmuyor.", System.Net.HttpStatusCode.BadRequest));
        }

        return CreateActionResult(await employeeService.UpdateEmployeeAsync(model));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        return CreateActionResult(await employeeService.DeleteEmployeeAsync(id));
    }

    [HttpGet("department/{departmentId}")]
    public async Task<IActionResult> GetByDepartment(int departmentId)
    {
        return CreateActionResult(await employeeService.GetEmployeesByDepartmentAsync(departmentId));
    }
}
