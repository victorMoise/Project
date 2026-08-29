using CollectionsService.Application.Items;
using CollectionsService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CollectionsService.Infrastructure.Persistence.Repositories;

public class ItemRepository(CollectionsDbContext dbContext) : IItemRepository
{
    public async Task AddAsync(Item item, CancellationToken cancellationToken)
    {
        dbContext.Items.Add(item);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<Item?> GetByIdAsync(int id, Guid ownerId, CancellationToken cancellationToken)
    {
        return await dbContext.Items.FirstOrDefaultAsync(i => i.Id == id && i.OwnerId == ownerId, cancellationToken);
    }

    public async Task<Item?> GetTrackedByIdAsync(int id, Guid ownerId, CancellationToken cancellationToken)
    {
        return await dbContext.Items.AsTracking().FirstOrDefaultAsync(i => i.Id == id && i.OwnerId == ownerId, cancellationToken);
    }

    public async Task<IReadOnlyList<Item>> ListAsync(Guid ownerId, int limit, int offset, CancellationToken cancellationToken)
    {
        return await dbContext.Items
            .Where(i => i.OwnerId == ownerId)
            .OrderByDescending(i => i.Id)
            .Skip(offset)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);

    public async Task DeleteAsync(Item item, CancellationToken cancellationToken)
    {
        dbContext.Items.Remove(item);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
