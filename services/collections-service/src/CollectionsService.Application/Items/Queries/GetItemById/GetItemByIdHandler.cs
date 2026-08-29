using CollectionsService.Application.Common;
using MediatR;

namespace CollectionsService.Application.Items.Queries.GetItemById;

public class GetItemByIdHandler(IItemRepository repository, ICurrentUserService currentUserService) : IRequestHandler<GetItemByIdQuery, ItemDto?>
{
    public async Task<ItemDto?> Handle(GetItemByIdQuery request, CancellationToken cancellationToken)
    {
        var item = await repository.GetByIdAsync(request.Id, currentUserService.OwnerId, cancellationToken);
        if (item is null)
            return null;

        return new ItemDto(item.Id, item.Name, item.Description, item.PurchasePrice, item.EstimatedValue, item.PurchaseDate);
    }
}
