using ShiftFlow.Domain.Entities.Common;

namespace ShiftFlow.Domain.Entities;

public class LogDefinition : BaseEntity
{
    public string Description { get; set; } = default!; 
}