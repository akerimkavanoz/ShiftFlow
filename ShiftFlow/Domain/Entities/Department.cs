using ShiftFlow.Domain.Entities.Common;

namespace ShiftFlow.Domain.Entities;

public class Department : BaseEntity, IAuditEntity
{
    public string Name { get; set; } =default!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
