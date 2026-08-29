using CollectionsService.Application.Common;
using CollectionsService.Domain.Entities;
using MediatR;

namespace CollectionsService.Application.Collections.Commands.CreateCollection;

public class CreateCollectionHandler(ICollectionRepository repository, ICurrentUserService currentUserService) : IRequestHandler<CreateCollectionCommand, int>
{
    public async Task<int> Handle(CreateCollectionCommand request, CancellationToken cancellationToken)
    {
        var collection = new Collection(request.Name, currentUserService.OwnerId);
        await repository.AddAsync(collection, cancellationToken);
        return collection.Id;
    }
}
