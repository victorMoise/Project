using CollectionsService.Domain.Entities;
using MediatR;

namespace CollectionsService.Application.Items.Commands.CreateItem;

public class CreateItemHandler(IItemRepository repository) : IRequestHandler<CreateItemCommand, int>
{
    public async Task<int> Handle(CreateItemCommand request, CancellationToken cancellationToken)
    {
        var item = new Item(request.Name, request.PurchasePrice, request.PurchaseDate, request.OwnerId, request.Description);
        await repository.AddAsync(item, cancellationToken);
        return item.Id;
    }
}