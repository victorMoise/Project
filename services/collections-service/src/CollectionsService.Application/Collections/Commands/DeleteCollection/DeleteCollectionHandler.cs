using CollectionsService.Application.Common;
using MediatR;

namespace CollectionsService.Application.Collections.Commands.DeleteCollection;

public class DeleteCollectionHandler(ICollectionRepository repository, ICurrentUserService currentUserService) : IRequestHandler<DeleteCollectionCommand, bool>
{
    public async Task<bool> Handle(DeleteCollectionCommand request, CancellationToken cancellationToken)
    {
        var collection = await repository.GetTrackedByIdAsync(request.Id, currentUserService.OwnerId, cancellationToken);
        if (collection is null)
            return false;

        await repository.DeleteAsync(collection, cancellationToken);
        return true;
    }
}
