using MediatR;

namespace CollectionsService.Application.Items.Commands.UpdateItem;

public record UpdateItemCommand(
    int Id,
    string Name,
    string? Description,
    decimal PurchasePrice,
    DateOnly PurchaseDate
) : IRequest<bool>;
