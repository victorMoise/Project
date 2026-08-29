using CollectionsService.Domain.Entities;

namespace CollectionsService.Application.Items;

public interface IItemRepository
{
    Task AddAsync(Item item, CancellationToken cancellationToken);
    Task<Item?> GetByIdAsync(int id, CancellationToken cancellationToken);
}