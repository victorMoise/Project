using CollectionsService.Application.Common;
using MediatR;

namespace CollectionsService.Application.Collections.Commands.UpdateCollection;

public class UpdateCollectionHandler(ICollectionRepository repository, ICurrentUserService currentUserService) : IRequestHandler<UpdateCollectionCommand, bool>
{
    public async Task<bool> Handle(UpdateCollectionCommand request, CancellationToken cancellationToken)
    {
        var collection = await repository.GetTrackedByIdAsync(request.Id, currentUserService.OwnerId, cancellationToken);
        if (collection is null)
            return false;

        collection.UpdateName(request.Name);
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }
}
