using CollectionsService.Application.Common;
using MediatR;

namespace CollectionsService.Application.Collections.Queries.ListCollections;

public class ListCollectionsHandler(ICollectionRepository repository, ICurrentUserService currentUserService) : IRequestHandler<ListCollectionsQuery, IReadOnlyList<CollectionDto>>
{
    public async Task<IReadOnlyList<CollectionDto>> Handle(ListCollectionsQuery request, CancellationToken cancellationToken)
    {
        var collections = await repository.ListAsync(currentUserService.OwnerId, request.Limit, request.Offset, cancellationToken);

        return collections
            .Select(collection => new CollectionDto(collection.Id, collection.Name))
            .ToList();
    }
}
