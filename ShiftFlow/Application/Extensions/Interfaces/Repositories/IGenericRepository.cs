using ShiftFlow.Domain.Entities.Common;

namespace ShiftFlow.Application.Extensions.Interfaces.Repositories;

public interface IGenericRepository<T> where T : BaseEntity
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(int id);
    Task<T?> GetActiveByIdAsync(int id);
    Task AddAsync(T entity);
    Task AddRangeAsync(IEnumerable<T> entities);
    Task Update(T entity);       
    Task SoftDelete(T entity);  
}