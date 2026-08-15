namespace ShiftFlow.Application.Extensions.Interfaces.Services;

public interface ILogService
{
    Task LogAsync(string details, int logDefinitionId);
}
