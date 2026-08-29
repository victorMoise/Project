using MediatR;

namespace CollectionsService.Application.Items.Queries.GetItemById;

public record GetItemByIdQuery(int Id) : IRequest<ItemDto?>;