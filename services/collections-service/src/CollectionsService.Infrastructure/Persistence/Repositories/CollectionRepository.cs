using CollectionsService.Application.Collections;
using CollectionsService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CollectionsService.Infrastructure.Persistence.Repositories;

public class CollectionRepository(CollectionsDbContext dbContext) : ICollectionRepository
{
    public async Task AddAsync(Collection collection, CancellationToken cancellationToken)
    {
        dbContext.Collections.Add(collection);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<Collection?> GetByIdAsync(int id, Guid ownerId, CancellationToken cancellationToken)
    {
        return await dbContext.Collections.FirstOrDefaultAsync(c => c.Id == id && c.OwnerId == ownerId, cancellationToken);
    }

    public async Task<Collection?> GetTrackedByIdAsync(int id, Guid ownerId, CancellationToken cancellationToken)
    {
        return await dbContext.Collections.AsTracking().FirstOrDefaultAsync(c => c.Id == id && c.OwnerId == ownerId, cancellationToken);
    }

    public async Task<IReadOnlyList<Collection>> ListAsync(Guid ownerId, int limit, int offset, CancellationToken cancellationToken)
    {
        return await dbContext.Collections
            .Where(c => c.OwnerId == ownerId)
            .OrderByDescending(c => c.Id)
            .Skip(offset)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);

    public async Task DeleteAsync(Collection collection, CancellationToken cancellationToken)
    {
        dbContext.Collections.Remove(collection);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
