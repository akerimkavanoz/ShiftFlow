using Microsoft.EntityFrameworkCore;
using ShiftFlow.Application.Extensions.Interfaces.Repositories;
using ShiftFlow.Domain.Entities.Common;
using ShiftFlow.Infrastructure.Data;

public class GenericRepository<T>(AppDbContext context) : IGenericRepository<T> where T : BaseEntity
{
    protected readonly AppDbContext _context = context;
    private readonly DbSet<T> _dbSet = context.Set<T>();

    public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.AsNoTracking().ToListAsync();

    public async Task<T?> GetByIdAsync(int id) => await _dbSet.FindAsync(id);
    public async Task<T?> GetActiveByIdAsync(int id) => await _dbSet.FirstOrDefaultAsync(x => x.Id == id && x.IsActive); 

    public async Task AddAsync(T entity)
    {
        entity.IsActive = true; 
        await _dbSet.AddAsync(entity);
    }

    public async Task AddRangeAsync(IEnumerable<T> entities)
    {
        await _context.Set<T>().AddRangeAsync(entities);
    }

    public Task Update(T entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task SoftDelete(T entity)
    {
        entity.IsActive = false;
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }
}