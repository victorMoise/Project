using MediatR;

namespace CollectionsService.Application.Items.Queries.GetItemById;

public class GetItemByIdHandler(IItemRepository repository) : IRequestHandler<GetItemByIdQuery, ItemDto?>
{
    public async Task<ItemDto?> Handle(GetItemByIdQuery request, CancellationToken cancellationToken)
    {
        var item = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (item is null)
            return null;

        return new ItemDto(item.Id, item.Name, item.Description, item.PurchasePrice, item.EstimatedValue, item.PurchaseDate);
    }
}