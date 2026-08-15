using ShiftFlow.Domain.Entities.Common;

namespace ShiftFlow.Domain.Entities;

public class ShiftAssignment : BaseEntity, IAuditEntity
{
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = default!;
    public int ShiftId { get; set; }
    public Shift Shift { get; set; } = default!;
    public DateOnly Date { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}