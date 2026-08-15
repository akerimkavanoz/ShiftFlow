using ShiftFlow.Application.Extensions;
using ShiftFlow.Application.Extensions.Interfaces.Repositories;
using ShiftFlow.Application.Extensions.Interfaces.Services;
using ShiftFlow.Application.Features.Departments.DTOs;
using ShiftFlow.Domain.Constants;
using ShiftFlow.Domain.Entities;
using System.Net;

namespace ShiftFlow.Application.Features.Departments;

public class DepartmentService(IDepartmentRepository repository, IEmployeeRepository employeeRepository, IUnitOfWork unitOfWork, ILogService logService) : IDepartmentService
{
    public async Task<ServiceResult<List<DepartmentDto>>> GetAllDepartmentsAsync()
    {
        var departments = await repository.GetActiveDepartmentsAsync();

        return ServiceResult<List<DepartmentDto>>.Success(departments.ToList());
    }

    public async Task<ServiceResult<int>> CreateDepartmentAsync(CreateDepartmentDto model)
    {
        var isNameExists = await repository.IsNameExistsAsync(model.Name);

        if (isNameExists)
        {
            return ServiceResult<int>.Fail($"'{model.Name}' isimli bir departman sistemde zaten kayıtlıdır.", System.Net.HttpStatusCode.BadRequest);
        }

        var department = new Department
        {
            Name = model.Name,
            CreatedAt = DateTime.Now
        };

        await repository.AddAsync(department);
        await unitOfWork.SaveChangesAsync();

        try
        {
            await logService.LogAsync($"{department.Id} ID'li '{department.Name}' departmanı başarıyla oluşturuldu.", LogDefinitionIds.DepartmentCreated);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult<int>.Success(department.Id, System.Net.HttpStatusCode.Created);
    }

    public async Task<ServiceResult> UpdateDepartmentAsync(UpdateDepartmentDto model)
    {
        var department = await repository.GetActiveByIdAsync(model.Id);
        if (department is null)
        {
            return ServiceResult<bool>.Fail("Güncellenecek departman bulunamadı.", System.Net.HttpStatusCode.NotFound);
        }

        var isNameExists = await repository.IsNameExistsAsync(model.Name, model.Id);

        if (isNameExists)
        {
            return ServiceResult<bool>.Fail($"'{model.Name}' isimli bir departman sistemde zaten kayıtlıdır.", System.Net.HttpStatusCode.BadRequest);
        }

        string oldName = department.Name;

        department.Name = model.Name;
        department.UpdatedAt = DateTime.Now;

        await unitOfWork.SaveChangesAsync();

        try
        {
            await logService.LogAsync($"{model.Id} ID'li departmanın ismi '{oldName}' iken '{model.Name}' olarak güncellenmiştir.", LogDefinitionIds.DepartmentUpdated);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult.Success(HttpStatusCode.NoContent);
    }

    public async Task<ServiceResult> DeleteDepartmentAsync(int id)
    {
        var department = await repository.GetActiveByIdAsync(id);

        if (department is null)
        {
            return ServiceResult<bool>.Fail("Silinecek departman bulunamadı.", System.Net.HttpStatusCode.NotFound);
        }

        var hasActiveEmployees = await employeeRepository.GetActiveEmployeesByDepartmentAsync(id);

        if (hasActiveEmployees.Any())
        {
            return ServiceResult<bool>.Fail(
                $"'{department.Name}' departmanına bağlı aktif personeller bulunmaktadır. Lütfen önce bu personellerin departmanını değiştirin veya silin.",
                System.Net.HttpStatusCode.BadRequest
            );
        }

        await repository.SoftDelete(department);
        await unitOfWork.SaveChangesAsync();

        try
        {
            await logService.LogAsync($"{id} ID'li '{department.Name}' departmanı silindi.", LogDefinitionIds.DepartmentDeleted);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult.Success(HttpStatusCode.NoContent);
    }
}
