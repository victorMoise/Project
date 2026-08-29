using CollectionsService.Application.Common;
using MediatR;

namespace CollectionsService.Application.Items.Commands.UpdateItem;

public class UpdateItemHandler(IItemRepository repository, ICurrentUserService currentUserService) : IRequestHandler<UpdateItemCommand, bool>
{
    public async Task<bool> Handle(UpdateItemCommand request, CancellationToken cancellationToken)
    {
        var item = await repository.GetTrackedByIdAsync(request.Id, currentUserService.OwnerId, cancellationToken);
        if (item is null)
            return false;

        item.UpdateDetails(request.Name, request.PurchasePrice, request.PurchaseDate, request.Description, request.CollectionId);
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }
}
