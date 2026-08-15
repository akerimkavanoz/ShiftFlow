namespace ShiftFlow.Application.Extensions.Interfaces.Repositories;

public interface IUnitOfWork : IAsyncDisposable
{
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}