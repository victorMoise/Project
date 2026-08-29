using MediatR;

namespace CollectionsService.Application.Items.Commands.CreateItem;

public record CreateItemCommand(
    string Name,
    string? Description,
    decimal PurchasePrice,
    DateOnly PurchaseDate
) : IRequest<int>;