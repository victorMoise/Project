using CollectionsService.Domain.Entities;

namespace CollectionsService.Application.Items;

public interface IItemRepository
{
    Task AddAsync(Item item, CancellationToken cancellationToken);
    Task<Item?> GetByIdAsync(int id, Guid ownerId, CancellationToken cancellationToken);
    Task<Item?> GetTrackedByIdAsync(int id, Guid ownerId, CancellationToken cancellationToken);
    Task<IReadOnlyList<Item>> ListAsync(Guid ownerId, int limit, int offset, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
    Task DeleteAsync(Item item, CancellationToken cancellationToken);
}
