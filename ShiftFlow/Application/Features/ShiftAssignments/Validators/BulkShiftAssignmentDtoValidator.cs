using FluentValidation;
using ShiftFlow.Application.Features.ShiftAssignments.DTOs;

namespace ShiftFlow.Application.Features.ShiftAssignments.Validators;

public class BulkShiftAssignmentDtoValidator : AbstractValidator<BulkShiftAssignmentDto>
{
    public BulkShiftAssignmentDtoValidator()
    {
        RuleFor(x => x.EmployeeIds)
            .NotEmpty().WithMessage("En az bir personel seçilmelidir.")
            .Must(ids => ids != null && ids.All(id => id > 0)).WithMessage("Geçersiz personel ID'si bulundu.");

        RuleFor(x => x.ShiftId)
            .GreaterThan(0).WithMessage("Geçerli bir vardiya seçilmelidir.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Başlangıç tarihi boş olamaz.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("Bitiş tarihi boş olamaz.")
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("Bitiş tarihi başlangıç tarihinden küçük olamaz.");
    }
}