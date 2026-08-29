using CollectionsService.Domain.Entities;

namespace CollectionsService.Application.Collections;

public interface ICollectionRepository
{
    Task AddAsync(Collection collection, CancellationToken cancellationToken);
    Task<Collection?> GetByIdAsync(int id, Guid ownerId, CancellationToken cancellationToken);
    Task<Collection?> GetTrackedByIdAsync(int id, Guid ownerId, CancellationToken cancellationToken);
    Task<IReadOnlyList<Collection>> ListAsync(Guid ownerId, int limit, int offset, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
    Task DeleteAsync(Collection collection, CancellationToken cancellationToken);
}
