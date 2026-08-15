using Microsoft.EntityFrameworkCore;
using ShiftFlow.Application.Extensions.Interfaces.Repositories;
using ShiftFlow.Application.Features.Employees.DTOs;
using ShiftFlow.Domain.Entities;
using ShiftFlow.Infrastructure.Data;

namespace ShiftFlow.Infrastructure.Repositories;

public class EmployeeRepository : GenericRepository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(AppDbContext context) : base(context) { }

    public async Task<IReadOnlyList<EmployeeDto>> GetActiveEmployeesAsync()
    {
        return await _context.Employees
            .AsNoTracking()
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new EmployeeDto
                (
                    d.Id,
                    d.Name,
                    d.Surname,
                    d.DepartmentId,
                    d.Department.Name
                ))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<EmployeeDto>> GetActiveEmployeesByDepartmentAsync(int departmentId)
    {
        return await _context.Employees
            .AsNoTracking()
            .Where(d => d.IsActive && d.DepartmentId == departmentId)
            .OrderBy(d => d.Name)
            .Select(d => new EmployeeDto
                (
                    d.Id,
                    d.Name,
                    d.Surname,
                    d.DepartmentId,
                    d.Department.Name
                ))
            .ToListAsync();
    }
}
