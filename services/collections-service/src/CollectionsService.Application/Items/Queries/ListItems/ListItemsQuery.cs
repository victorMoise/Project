using MediatR;

namespace CollectionsService.Application.Items.Queries.ListItems;

public record ListItemsQuery(int Limit = 50, int Offset = 0) : IRequest<IReadOnlyList<ItemDto>>;
