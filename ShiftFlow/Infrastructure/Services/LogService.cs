using ShiftFlow.Application.Extensions.Interfaces.Repositories;
using ShiftFlow.Application.Extensions.Interfaces.Services;

namespace ShiftFlow.Infrastructure.Services;

public class LogService(IGenericRepository<Domain.Entities.Log> logRepository, IUnitOfWork unitOfWork) : ILogService
{
    public async Task LogAsync(string details, int logDefinitionId)
    {
        var log = new Domain.Entities.Log
        {
            LogDefinitionId = logDefinitionId,
            Details = details,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await logRepository.AddAsync(log);
        await unitOfWork.SaveChangesAsync();
    }
}