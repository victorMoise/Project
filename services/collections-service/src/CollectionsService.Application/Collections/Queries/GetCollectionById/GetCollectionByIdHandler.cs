using CollectionsService.Application.Common;
using MediatR;

namespace CollectionsService.Application.Collections.Queries.GetCollectionById;

public class GetCollectionByIdHandler(ICollectionRepository repository, ICurrentUserService currentUserService) : IRequestHandler<GetCollectionByIdQuery, CollectionDto?>
{
    public async Task<CollectionDto?> Handle(GetCollectionByIdQuery request, CancellationToken cancellationToken)
    {
        var collection = await repository.GetByIdAsync(request.Id, currentUserService.OwnerId, cancellationToken);
        if (collection is null)
            return null;

        return new CollectionDto(collection.Id, collection.Name);
    }
}
