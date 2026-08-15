using ShiftFlow.Application.Extensions;
using ShiftFlow.Application.Extensions.Interfaces.Repositories;
using ShiftFlow.Application.Extensions.Interfaces.Services;
using ShiftFlow.Application.Features.Employees.DTOs;
using ShiftFlow.Domain.Constants;
using ShiftFlow.Domain.Entities;

namespace ShiftFlow.Application.Features.Employees;

public class EmployeeService(IEmployeeRepository repository, IDepartmentRepository departmentRepository, IShiftAssignmentRepository shiftAssignmentRepository, IUnitOfWork unitOfWork, ILogService logService) : IEmployeeService
{
    public async Task<ServiceResult<List<EmployeeDto>>> GetAllEmployeesAsync()
    {
        var employees = await repository.GetActiveEmployeesAsync();

        return ServiceResult<List<EmployeeDto>>.Success(employees.ToList());
    }

    public async Task<ServiceResult<int>> CreateEmployeeAsync(CreateEmployeeDto model)
    {
        var department = await departmentRepository.GetActiveByIdAsync(model.DepartmentId);
        if (department is null)
        {
            return ServiceResult<int>.Fail("Seçilen departman bulunamadı.", System.Net.HttpStatusCode.BadRequest);
        }

        var employee = new Employee
        {
            Name = model.Name,
            Surname = model.Surname,
            DepartmentId = model.DepartmentId,
            CreatedAt = DateTime.Now
        };

        await repository.AddAsync(employee);
        await unitOfWork.SaveChangesAsync();

        try
        {
            await logService.LogAsync($"{employee.Id} ID'li '{employee.Name}' personeli başarıyla oluşturuldu.", LogDefinitionIds.EmployeeCreated);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult<int>.Success(employee.Id, System.Net.HttpStatusCode.Created);
    }

    public async Task<ServiceResult> UpdateEmployeeAsync(UpdateEmployeeDto model)
    {
        var employee = await repository.GetActiveByIdAsync(model.Id);
        if (employee is null)
        {
            return ServiceResult.Fail("Güncellenecek personel bulunamadı.", System.Net.HttpStatusCode.NotFound);
        }

        var department = await departmentRepository.GetActiveByIdAsync(model.DepartmentId);
        if (department is null)
        {
            return ServiceResult.Fail("Seçilen departman bulunamadı.", System.Net.HttpStatusCode.BadRequest);
        }

        string oldFullName = $"{employee.Name} {employee.Surname}";
        int oldDeptId = employee.DepartmentId;

        employee.Name = model.Name;
        employee.Surname = model.Surname;
        employee.DepartmentId = model.DepartmentId;
        employee.UpdatedAt = DateTime.Now;

        await unitOfWork.SaveChangesAsync();

        try
        {
            string newFullName = $"{model.Name} {model.Surname}";

            string nameLog = oldFullName != newFullName
                ? $"Ad Soyad: '{oldFullName}' -> '{newFullName}'"
                : "";

            string deptLog = oldDeptId != model.DepartmentId
                ? $"Departman ID: {oldDeptId} -> {model.DepartmentId}"
                : "";

            string changeDetails = string.Join(", ", new[] { nameLog, deptLog }.Where(s => !string.IsNullOrEmpty(s)));

            string logMessage = $"{model.Id} ID'li personel bilgileri güncellendi. " +
                (!string.IsNullOrEmpty(changeDetails) ? $"Değişiklikler -> {changeDetails}" : "Herhangi bir değişiklik yapılmadı.");

            await logService.LogAsync(logMessage, LogDefinitionIds.EmployeeUpdated);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult.Success(System.Net.HttpStatusCode.NoContent);
    }

    public async Task<ServiceResult> DeleteEmployeeAsync(int id)
    {
        var employee = await repository.GetActiveByIdAsync(id);

        if (employee is null)
        {
            return ServiceResult.Fail("Silinecek personel bulunamadı.", System.Net.HttpStatusCode.NotFound);
        }

        await repository.SoftDelete(employee);
        await shiftAssignmentRepository.SoftDeleteByEmployeeIdAsync(id);
        await unitOfWork.SaveChangesAsync();

        try
        {
            await logService.LogAsync($"{id} ID'li '{employee.Name}' personeli silindi.", LogDefinitionIds.EmployeeDeleted);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult.Success(System.Net.HttpStatusCode.NoContent);
    }

    public async Task<ServiceResult<List<EmployeeDto>>> GetEmployeesByDepartmentAsync(int departmentId)
    {
        var employees = await repository.GetActiveEmployeesByDepartmentAsync(departmentId);
        return ServiceResult<List<EmployeeDto>>.Success(employees.ToList());
    }
}
