using FluentValidation;
using ShiftFlow.Application.Features.ShiftAssignments.DTOs;

namespace ShiftFlow.Application.Features.ShiftAssignments.Validators;

public class CreateShiftAssignmentDtoValidator : AbstractValidator<CreateShiftAssignmentDto>
{
    public CreateShiftAssignmentDtoValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Lütfen geçerli bir personel seçiniz");

        RuleFor(x => x.ShiftId)
            .GreaterThan(0).WithMessage("Lütfen geçerli bir vardiya seçiniz");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Vardiya atama tarihi boş geçilemez");
    }
}