using ShiftFlow.Application.Extensions;
using ShiftFlow.Application.Extensions.Interfaces.Repositories;
using ShiftFlow.Application.Extensions.Interfaces.Services;
using ShiftFlow.Application.Features.Shifts.DTOs;
using ShiftFlow.Domain.Constants;
using ShiftFlow.Domain.Entities;

namespace ShiftFlow.Application.Features.Shifts;

public class ShiftService(IShiftRepository repository, IShiftAssignmentRepository shiftAssignmentRepository, IUnitOfWork unitOfWork, ILogService logService) : IShiftService
{
    public async Task<ServiceResult<List<ShiftDto>>> GetAllShiftsAsync()
    {
        var shifts = await repository.GetActiveShiftsAsync();

        return ServiceResult<List<ShiftDto>>.Success(shifts.ToList());
    }

    public async Task<ServiceResult<int>> CreateShiftAsync(CreateShiftDto model)
    {
        var isNameExists = await repository.IsNameExistsAsync(model.Name);

        if (isNameExists)
        {
            return ServiceResult<int>.Fail($"'{model.Name}' adlı vardiya sistemde zaten kayıtlıdır.", System.Net.HttpStatusCode.BadRequest);
        }

        var shift = new Shift
        {
            Name = model.Name,
            StartTime = model.StartTime,
            EndTime = model.EndTime,
            CreatedAt = DateTime.Now,
            ColorCode = !string.IsNullOrWhiteSpace(model.ColorCode) ? model.ColorCode : null
        };

        await repository.AddAsync(shift);
        await unitOfWork.SaveChangesAsync();

        try
        {
            await logService.LogAsync($"{shift.Id} ID'li '{shift.Name}' adlı vardiya başarıyla oluşturuldu.", LogDefinitionIds.ShiftCreated);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult<int>.Success(shift.Id, System.Net.HttpStatusCode.Created);
    }

    public async Task<ServiceResult> UpdateShiftAsync(UpdateShiftDto model)
    {
        var shift = await repository.GetActiveByIdAsync(model.Id);
        if (shift is null)
        {
            return ServiceResult.Fail("Güncellenecek vardiya bulunamadı.", System.Net.HttpStatusCode.NotFound);
        }

        var isNameExists = await repository.IsNameExistsAsync(model.Name, model.Id);

        if (isNameExists)
        {
            return ServiceResult.Fail($"'{model.Name}' adlı vardiya sistemde zaten kayıtlıdır.", System.Net.HttpStatusCode.BadRequest);
        }

        string oldName = $"{shift.Name}";
        TimeOnly? oldStartTime = shift.StartTime;
        TimeOnly? oldEndTime = shift.EndTime;
        string? oldColorCode = shift.ColorCode;

        shift.Name = model.Name;
        shift.StartTime = model.StartTime;
        shift.EndTime = model.EndTime;
        shift.UpdatedAt = DateTime.Now;
        shift.ColorCode = model.ColorCode;

        await unitOfWork.SaveChangesAsync();

        string nameLog = oldName != model.Name ? $"Ad: '{oldName}' -> '{model.Name}'" : "";

        string FormatTime(TimeOnly? t) => t.HasValue ? t.Value.ToString("HH:mm") : "Yok";

        string oldTimeStr = $"{FormatTime(oldStartTime)} - {FormatTime(oldEndTime)}";
        string newTimeStr = $"{FormatTime(model.StartTime)} - {FormatTime(model.EndTime)}";

        string timeLog = (oldStartTime != model.StartTime || oldEndTime != model.EndTime)
            ? $"Saat: [{oldTimeStr}] -> [{newTimeStr}]"
            : "";

        string colorCodeLog = oldColorCode != model.ColorCode ? $"Renk Kodu: '{oldColorCode}' -> '{model.ColorCode}'" : "";

        string changeDetails = string.Join(", ", new[] { nameLog, timeLog, colorCodeLog }.Where(s => !string.IsNullOrEmpty(s)));
        string logMessage = $"{model.Id} ID'li vardiya bilgileri güncellendi. " +
                             (!string.IsNullOrEmpty(changeDetails) ? $"Değişiklikler -> {changeDetails}" : "Herhangi bir değişiklik yapılmadı.");

        try
        {
            await logService.LogAsync(logMessage, LogDefinitionIds.ShiftUpdated);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult.Success(System.Net.HttpStatusCode.NoContent);
    }

    public async Task<ServiceResult> DeleteShiftAsync(int id)
    {
        var shift = await repository.GetActiveByIdAsync(id);

        if (shift is null)
        {
            return ServiceResult.Fail("Silinecek vardiya bulunamadı.", System.Net.HttpStatusCode.NotFound);
        }

        var hasActiveAssignments = await shiftAssignmentRepository.HasActiveAssignmentsByShiftIdAsync(id);

        if (hasActiveAssignments)
        {
            return ServiceResult.Fail(
                $"'{shift.Name}' vardiyasına atanmış aktif personel kayıtları bulunmaktadır. Lütfen önce bu atamaları kaldırın veya başka bir vardiyaya taşıyın.",
                System.Net.HttpStatusCode.BadRequest
            );
        }

        await repository.SoftDelete(shift);
        await unitOfWork.SaveChangesAsync();

        try
        {
            await logService.LogAsync($"{id} ID'li '{shift.Name}' vardiyası silindi.", LogDefinitionIds.ShiftDeleted);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult.Success(System.Net.HttpStatusCode.NoContent);
    }
}
