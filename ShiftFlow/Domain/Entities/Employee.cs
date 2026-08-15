using ShiftFlow.Domain.Entities.Common;

namespace ShiftFlow.Domain.Entities;

public class Employee : BaseEntity, IAuditEntity
{
    public string Name { get; set; } = default!;
    public string Surname { get; set; } = default!;
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
