using FluentValidation;
using ShiftFlow.Application.Features.Shifts.DTOs;

namespace ShiftFlow.Application.Features.Shifts.Validators
{
    public class CreateShiftDtoValidator : AbstractValidator<CreateShiftDto>
    {
        public CreateShiftDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Vardiya adı boş geçilemez")
                .MaximumLength(50).WithMessage("Vardiya adı en fazla 50 karakter olabilir");

            RuleFor(x => x.ColorCode)
                .MaximumLength(10).WithMessage("Renk kodu en fazla 10 karakter olabilir.");

            RuleFor(x => x.EndTime)
                .NotNull().WithMessage("Başlangıç saati girildiğinde bitiş saati de zorunludur.")
                .When(x => x.StartTime.HasValue);

            RuleFor(x => x.StartTime)
                .NotNull().WithMessage("Bitiş saati girildiğinde başlangıç saati de zorunludur.")
                .When(x => x.EndTime.HasValue);

            RuleFor(x => x.EndTime)
                .NotEqual(x => x.StartTime).WithMessage("Vardiya bitiş saati, başlangıç saati ile aynı olamaz.")
                .When(x => x.StartTime.HasValue && x.EndTime.HasValue);
        }
    }
}
