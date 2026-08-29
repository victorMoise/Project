using CollectionsService.Application.Common;
using CollectionsService.Domain.Entities;
using MediatR;

namespace CollectionsService.Application.Items.Commands.CreateItem;

public class CreateItemHandler(IItemRepository repository, ICurrentUserService currentUserService) : IRequestHandler<CreateItemCommand, int>
{
    public async Task<int> Handle(CreateItemCommand request, CancellationToken cancellationToken)
    {
        var item = new Item(request.Name, request.PurchasePrice, request.PurchaseDate, currentUserService.OwnerId, request.Description, request.CollectionId);
        await repository.AddAsync(item, cancellationToken);
        return item.Id;
    }
}