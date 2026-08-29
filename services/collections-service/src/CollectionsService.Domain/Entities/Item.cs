namespace CollectionsService.Domain.Entities;

public class Item
{
    public int Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public decimal PurchasePrice { get; private set; }
    public decimal? EstimatedValue { get; private set; }
    public DateOnly PurchaseDate { get; private set; }
    public Guid OwnerId { get; private set; }
    public int? CollectionId { get; private set; }

    private Item() { }

    public Item(string name, decimal purchasePrice, DateOnly purchaseDate, Guid ownerId, string? description = null, int? collectionId = null)
    {
        EnsureValid(name, purchasePrice);

        Name = name;
        Description = description;
        PurchasePrice = purchasePrice;
        PurchaseDate = purchaseDate;
        OwnerId = ownerId;
        CollectionId = collectionId;
    }

    public void UpdateDetails(string name, decimal purchasePrice, DateOnly purchaseDate, string? description = null, int? collectionId = null)
    {
        EnsureValid(name, purchasePrice);

        Name = name;
        Description = description;
        PurchasePrice = purchasePrice;
        PurchaseDate = purchaseDate;
        CollectionId = collectionId;
    }

    public void UpdateEstimatedValue(decimal newValue)
    {
        if (newValue < 0)
            throw new ArgumentException("Value cannot be negative", nameof(newValue));
        EstimatedValue = newValue;
    }

    private static void EnsureValid(string name, decimal purchasePrice)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty", nameof(name));
        if (purchasePrice < 0)
            throw new ArgumentException("Price cannot be negative", nameof(purchasePrice));
    }
}