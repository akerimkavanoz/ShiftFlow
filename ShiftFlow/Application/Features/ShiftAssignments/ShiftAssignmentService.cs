using ShiftFlow.Application.Extensions;
using ShiftFlow.Application.Extensions.Interfaces.Repositories;
using ShiftFlow.Application.Extensions.Interfaces.Services;
using ShiftFlow.Application.Features.ShiftAssignments.DTOs;
using ShiftFlow.Domain.Constants;
using ShiftFlow.Domain.Entities;
using System.Globalization;
using System.Net;

namespace ShiftFlow.Application.Features.ShiftAssignments;

public class ShiftAssignmentService(
    IShiftAssignmentRepository repository,
    IUnitOfWork unitOfWork,
    ILogService logService,
    IDepartmentRepository departmentRepository,
    IEmployeeRepository employeeRepository,
    IShiftRepository shiftRepository,
    IPdfService pdfService) : IShiftAssignmentService
{
    public async Task<ServiceResult<List<ShiftAssignmentDto>>> GetAllShiftAssignmentsAsync()
    {
        var assignments = await repository.GetActiveAssignmentsAsync();

        return ServiceResult<List<ShiftAssignmentDto>>.Success(assignments.ToList());
    }

    public async Task<ServiceResult<int>> CreateShiftAssignmentAsync(CreateShiftAssignmentDto model)
    {
        var employee = await employeeRepository.GetActiveByIdAsync(model.EmployeeId);
        if (employee is null)
        {
            return ServiceResult<int>.Fail("Seçilen personel bulunamadı.", System.Net.HttpStatusCode.BadRequest);
        }

        var shift = await shiftRepository.GetActiveByIdAsync(model.ShiftId);
        if (shift is null)
        {
            return ServiceResult<int>.Fail("Seçilen vardiya bulunamadı.", System.Net.HttpStatusCode.BadRequest);
        }

        var assignmentDate = DateOnly.FromDateTime(model.Date);
        var hasExistingAssignment = await repository.HasAssignmentByEmployeeAndDateAsync(model.EmployeeId, assignmentDate);
        if (hasExistingAssignment)
        {
            return ServiceResult<int>.Fail(
                $"Seçilen personelin bu tarihte ({assignmentDate:dd.MM.yyyy}) zaten bir vardiya ataması bulunmaktadır.",
                System.Net.HttpStatusCode.BadRequest
            );
        }

        var assignment = new ShiftAssignment
        {
            EmployeeId = model.EmployeeId,
            ShiftId = model.ShiftId,
            Date = assignmentDate,
            CreatedAt = DateTime.Now
        };

        await repository.AddAsync(assignment);
        await unitOfWork.SaveChangesAsync();

        try
        {
            await logService.LogAsync(
                $"{assignment.Id} ID'li Vardiya Ataması başarıyla oluşturuldu. (Personel ID: {model.EmployeeId} -> Vardiya ID: {model.ShiftId})",
                LogDefinitionIds.ShiftAssignedCreated
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult<int>.Success(assignment.Id, System.Net.HttpStatusCode.Created);
    }

    public async Task<ServiceResult> UpdateShiftAssignmentAsync(UpdateShiftAssignmentDto model)
    {
        var assignment = await repository.GetActiveByIdAsync(model.Id);
        if (assignment is null)
        {
            return ServiceResult.Fail("Güncellenecek vardiya atama kaydı bulunamadı.", System.Net.HttpStatusCode.NotFound);
        }

        var employee = await employeeRepository.GetActiveByIdAsync(model.EmployeeId);
        if (employee is null)
        {
            return ServiceResult.Fail("Seçilen personel bulunamadı.", System.Net.HttpStatusCode.BadRequest);
        }

        var shift = await shiftRepository.GetActiveByIdAsync(model.ShiftId);
        if (shift is null)
        {
            return ServiceResult.Fail("Seçilen vardiya bulunamadı.", System.Net.HttpStatusCode.BadRequest);
        }

        var assignmentDate = DateOnly.FromDateTime(model.Date);
        var hasExistingAssignment = await repository.HasAssignmentByEmployeeAndDateAsync(model.EmployeeId, assignmentDate, model.Id);
        if (hasExistingAssignment)
        {
            return ServiceResult.Fail(
                $"Seçilen personelin bu tarihte ({assignmentDate:dd.MM.yyyy}) zaten başka bir vardiya ataması bulunmaktadır.",
                System.Net.HttpStatusCode.BadRequest
            );
        }

        int oldShiftId = assignment.ShiftId;
        int oldEmployeeId = assignment.EmployeeId;

        assignment.EmployeeId = model.EmployeeId;
        assignment.ShiftId = model.ShiftId;
        assignment.Date = assignmentDate;
        assignment.UpdatedAt = DateTime.Now;

        await unitOfWork.SaveChangesAsync();

        try
        {
            await logService.LogAsync(
                $"{model.Id} ID'li vardiya ataması güncellendi. " +
                $"Eski Durum: (Personel: {oldEmployeeId}, Vardiya: {oldShiftId}) -> " +
                $"Yeni Durum: (Personel: {model.EmployeeId}, Vardiya: {model.ShiftId})",
                LogDefinitionIds.ShiftAssignedUpdated
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult.Success(System.Net.HttpStatusCode.NoContent);
    }

    public async Task<ServiceResult> DeleteShiftAssignmentAsync(int id)
    {
        var assignment = await repository.GetActiveByIdAsync(id);
        if (assignment is null)
        {
            return ServiceResult.Fail("Silinecek vardiya atama kaydı bulunamadı.", System.Net.HttpStatusCode.NotFound);
        }

        await repository.SoftDelete(assignment);
        await unitOfWork.SaveChangesAsync();

        try
        {
            await logService.LogAsync($"{id} ID'li vardiya atama kaydı silindi.", LogDefinitionIds.ShiftAssignedDeleted);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult.Success(System.Net.HttpStatusCode.NoContent);
    }

    public async Task<ServiceResult<(byte[] FileBytes, string FileName)>> GenerateMonthlyReportPdfAsync(int departmentId, int year, int month)
    {
        var department = await departmentRepository.GetActiveByIdAsync(departmentId);
        if (department == null)
            return ServiceResult<(byte[] FileBytes, string FileName)>.Fail("Departman bulunamadı.");

        var employees = await employeeRepository.GetActiveEmployeesByDepartmentAsync(departmentId);
        if (employees == null || !employees.Any())
            return ServiceResult<(byte[] FileBytes, string FileName)>.Fail("Bu departmanda aktif personel bulunamadı.");

        var assignments = await repository.GetMonthlyAssignmentsByDepartmentAsync(departmentId, year, month) ?? new List<ShiftAssignmentDto>();

        var shifts = await shiftRepository.GetActiveShiftsAsync();
        var shiftDict = shifts.DistinctBy(s => s.Id).ToDictionary(s => s.Id, s => s.Name);

        int daysInMonth = DateTime.DaysInMonth(year, month);

        // Performans için vardiyaları hafızada hızlı aranabilir bir sözlük/lookup yapalım
        var assignmentLookup = assignments
            .Where(a => a.Date.Year == year && a.Date.Month == month)
            .ToLookup(a => a.EmployeeId);


        var reportData = employees
            .Select(emp =>
            {
                string employeeName = $"{emp.Name} {emp.Surname}";
                var days = Enumerable.Repeat("-", daysInMonth).ToList();

                // Bu personelin o ayki vardiyalarını getir (yoksa boş liste döner)
                var empAssignments = assignmentLookup[emp.Id];

                foreach (var assignment in empAssignments)
                {
                    int dayNumber = assignment.Date.Day;

                    if (dayNumber <= daysInMonth)
                    {
                        string shiftName = shiftDict.TryGetValue(assignment.ShiftId, out var name) ? name : "-";
                        days[dayNumber - 1] = shiftName;
                    }
                }

                return new EmployeeShiftDto(employeeName, department.Name, days);
            })
            .OrderBy(x => x.EmployeeName)
            .ToList();

        var shiftDefinitions = shifts
            .GroupBy(s => s.Name)
            .ToDictionary(
                g => g.Key,
                g =>
                {
                    var firstShift = g.First();
                    return $"{firstShift.StartTime:HH:mm} - {firstShift.EndTime:HH:mm}";
                }
            );

        var shiftColors = shifts
            .GroupBy(s => s.Name)
            .ToDictionary(
                g => g.Key,
                g => !string.IsNullOrWhiteSpace(g.First().ColorCode) ? g.First().ColorCode! : "#FFFFFF",
                StringComparer.OrdinalIgnoreCase
        );

        try
        {
            byte[] pdfBytes = pdfService.GenerateMonthlyShiftReport(reportData, year, month, department.Name, shiftDefinitions, shiftColors);

            var tempDate = new DateTime(year, month, 1);
            string monthName = tempDate.ToString("MMMM", new CultureInfo("tr-TR"));
            monthName = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(monthName);

            string safeMonthName = monthName
                .Replace("ı", "i").Replace("İ", "I")
                .Replace("ğ", "g").Replace("Ğ", "G")
                .Replace("ü", "u").Replace("Ü", "U")
                .Replace("ş", "s").Replace("Ş", "S")
                .Replace("ö", "o").Replace("Ö", "O")
                .Replace("ç", "c").Replace("Ç", "C");

            string safeDepartmentName = department.Name
                .Replace("ı", "i").Replace("İ", "I")
                .Replace("ğ", "g").Replace("Ğ", "G")
                .Replace("ü", "u").Replace("Ü", "U")
                .Replace("ş", "s").Replace("Ş", "S")
                .Replace("ö", "o").Replace("Ö", "O")
                .Replace("ç", "c").Replace("Ç", "C")
                .Replace(" ", "_");

            string downloadTimestamp = DateTime.Now.ToString("yyyyMMdd_HHmm"); 
            string fileName = $"{year}_{safeMonthName}_{safeDepartmentName}_Vardiya_Cizelgesi_{downloadTimestamp}.pdf";

            return ServiceResult<(byte[] FileBytes, string FileName)>.Success((pdfBytes, fileName));
        }
        catch (Exception ex)
        {
            return ServiceResult<(byte[] FileBytes, string FileName)>.Fail($"PDF raporu oluşturulurken hata meydana geldi: {ex.Message}");
        }
    }

    public async Task<ServiceResult> BulkAssignShiftsAsync(BulkShiftAssignmentDto dto)
    {
        var shift = await shiftRepository.GetActiveByIdAsync(dto.ShiftId);
        if (shift is null)
        {
            return ServiceResult.Fail("Seçilen vardiya bulunamadı.", HttpStatusCode.BadRequest);
        }

        foreach (var employeeId in dto.EmployeeIds)
        {
            var employee = await employeeRepository.GetActiveByIdAsync(employeeId);
            if (employee is null)
            {
                return ServiceResult.Fail($"{employeeId} ID'li personel bulunamadı.", HttpStatusCode.BadRequest);
            }
        }

        var startDateOnly = DateOnly.FromDateTime(dto.StartDate);
        var endDateOnly = DateOnly.FromDateTime(dto.EndDate);
        var targetDates = new List<DateOnly>();

        for (var date = startDateOnly; date <= endDateOnly; date = date.AddDays(1))
        {
            if (date.DayOfWeek == DayOfWeek.Saturday && !dto.IncludeSaturday)
                continue;

            if (date.DayOfWeek == DayOfWeek.Sunday && !dto.IncludeSunday)
                continue;

            targetDates.Add(date);
        }

        if (!targetDates.Any())
        {
            return ServiceResult.Fail("Seçilen kriterlere ve tarih aralığına uygun gün bulunamadı.", HttpStatusCode.BadRequest);
        }

        var existingAssignments = await repository
            .GetActiveAssignmentsByEmployeeIdsAndDateRangeAsync(dto.EmployeeIds, startDateOnly, endDateOnly);

        var existingAssignmentsDict = existingAssignments
            .ToDictionary(a => (a.EmployeeId, a.Date));

        var newAssignments = new List<ShiftAssignment>();
        int overwrittenCount = 0;
        var now = DateTime.Now;

        foreach (var employeeId in dto.EmployeeIds)
        {
            foreach (var date in targetDates)
            {
                if (existingAssignmentsDict.TryGetValue((employeeId, date), out var existingAssignment))
                {
                    if (dto.OverwriteExisting)
                    {
                        await repository.SoftDelete(existingAssignment);
                        overwrittenCount++;

                        newAssignments.Add(new ShiftAssignment
                        {
                            EmployeeId = employeeId,
                            ShiftId = dto.ShiftId,
                            Date = date,
                            IsActive = true,
                            CreatedAt = now
                        });
                    }
                }
                else
                {
                    newAssignments.Add(new ShiftAssignment
                    {
                        EmployeeId = employeeId,
                        ShiftId = dto.ShiftId,
                        Date = date,
                        IsActive = true,
                        CreatedAt = now
                    });
                }
            }
        }

        if (newAssignments.Any())
        {
            try
            {
                await unitOfWork.BeginTransactionAsync();

                await repository.AddRangeAsync(newAssignments);
                await unitOfWork.SaveChangesAsync();

                await unitOfWork.CommitTransactionAsync();
            }
            catch
            {
                await unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        try
        {
            string employeeIdsText = string.Join(", ", dto.EmployeeIds);

            string logMessage = $"Toplu Vardiya Ataması Gerçekleştirildi. " +
                               $"(Personel ID'leri: [{employeeIdsText}], Vardiya ID: {dto.ShiftId}, " +
                               $"Tarih Aralığı: {startDateOnly:dd.MM.yyyy} - {endDateOnly:dd.MM.yyyy}, " +
                               $"Cumartesi Dahil: {(dto.IncludeSaturday ? "Evet" : "Hayır")}, " +
                               $"Pazar Dahil: {(dto.IncludeSunday ? "Evet" : "Hayır")}, " +
                               $"Üzerine Yazıldı: {(dto.OverwriteExisting ? "Evet" : "Hayır")}, " +
                               $"Yeni Eklenen: {newAssignments.Count - overwrittenCount}, " +
                               $"Değiştirilen/Üzerine Yazılan: {overwrittenCount})";

            await logService.LogAsync(logMessage, LogDefinitionIds.MassShiftAssignedCreated);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Log yazılırken hata oluştu: {ex.Message}");
        }

        return ServiceResult.Success(HttpStatusCode.OK);
    }
}