using ShiftFlow.Domain.Entities.Common;

namespace ShiftFlow.Domain.Entities;

public class Log : BaseEntity
{
    public int LogDefinitionId { get; set; }
    public LogDefinition LogDefinition { get; set; } = default!;
    public string Details { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}