using ShiftFlow.Domain.Entities.Common;

namespace ShiftFlow.Domain.Entities;

public class Shift : BaseEntity, IAuditEntity
{
    public string Name { get; set; } = default!;
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? ColorCode { get; set; }
}