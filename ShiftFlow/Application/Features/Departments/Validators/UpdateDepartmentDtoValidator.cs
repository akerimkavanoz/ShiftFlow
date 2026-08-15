using FluentValidation;
using ShiftFlow.Application.Features.Departments.DTOs;

namespace ShiftFlow.Application.Features.Departments.Validators;

public class UpdateDepartmentDtoValidator : AbstractValidator<UpdateDepartmentDto>
{
    public UpdateDepartmentDtoValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Geçerli bir departman ID'si belirtilmelidir");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Departman ismi boş geçilemez")
            .MaximumLength(75).WithMessage("Departman ismi en fazla 75 karakter olabilir");
    }
}