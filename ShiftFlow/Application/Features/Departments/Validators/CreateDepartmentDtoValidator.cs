using FluentValidation;
using ShiftFlow.Application.Features.Departments.DTOs;

namespace ShiftFlow.Application.Features.Departments.Validators;

public class CreateDepartmentDtoValidator : AbstractValidator<CreateDepartmentDto>
{
    public CreateDepartmentDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Departman ismi boş geçilemez")
            .MaximumLength(75).WithMessage("Departman ismi en fazla 75 karakter olabilir");
    }
}