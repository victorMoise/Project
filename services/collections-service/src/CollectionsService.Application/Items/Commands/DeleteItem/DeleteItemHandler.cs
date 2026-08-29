using CollectionsService.Application.Common;
using MediatR;

namespace CollectionsService.Application.Items.Commands.DeleteItem;

public class DeleteItemHandler(IItemRepository repository, ICurrentUserService currentUserService) : IRequestHandler<DeleteItemCommand, bool>
{
    public async Task<bool> Handle(DeleteItemCommand request, CancellationToken cancellationToken)
    {
        var item = await repository.GetTrackedByIdAsync(request.Id, currentUserService.OwnerId, cancellationToken);
        if (item is null)
            return false;

        await repository.DeleteAsync(item, cancellationToken);
        return true;
    }
}
