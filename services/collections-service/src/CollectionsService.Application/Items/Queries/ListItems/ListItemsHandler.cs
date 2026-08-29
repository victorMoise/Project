using CollectionsService.Application.Common;
using MediatR;

namespace CollectionsService.Application.Items.Queries.ListItems;

public class ListItemsHandler(IItemRepository repository, ICurrentUserService currentUserService) : IRequestHandler<ListItemsQuery, IReadOnlyList<ItemDto>>
{
    public async Task<IReadOnlyList<ItemDto>> Handle(ListItemsQuery request, CancellationToken cancellationToken)
    {
        var items = await repository.ListAsync(currentUserService.OwnerId, request.Limit, request.Offset, cancellationToken);

        return items
            .Select(item => new ItemDto(item.Id, item.Name, item.Description, item.PurchasePrice, item.EstimatedValue, item.PurchaseDate))
            .ToList();
    }
}
