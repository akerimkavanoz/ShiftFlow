using FluentValidation;
using ShiftFlow.Application.Features.Employees.DTOs;

namespace ShiftFlow.Application.Features.Employees.Validators;

public class UpdateEmployeeDtoValidator : AbstractValidator<UpdateEmployeeDto>
{
    public UpdateEmployeeDtoValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Geçerli bir personel ID'si belirtilmelidir");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Personel ismi boş geçilemez")
            .MaximumLength(75).WithMessage("Personel ismi en fazla 75 karakter olabilir");

        RuleFor(x => x.Surname)
            .NotEmpty().WithMessage("Personel soy ismi boş geçilemez")
            .MaximumLength(75).WithMessage("Personel soy ismi en fazla 75 karakter olabilir");

        RuleFor(x => x.DepartmentId)
            .GreaterThan(0).WithMessage("Lütfen geçerli bir departman seçiniz");
    }
}