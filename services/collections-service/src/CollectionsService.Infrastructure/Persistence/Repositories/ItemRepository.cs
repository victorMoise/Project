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

    public async Task<Item?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await dbContext.Items.FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }
}