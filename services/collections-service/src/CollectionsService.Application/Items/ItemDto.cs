namespace CollectionsService.Application.Items;

public record ItemDto(
    int Id,
    string Name,
    string? Description,
    decimal PurchasePrice,
    decimal? EstimatedValue,
    DateOnly PurchaseDate,
    int? CollectionId
);