namespace CollectionsService.Domain.Entities;

public class Item
{
    public int Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public decimal PurchasePrice { get; private set; }
    public decimal? EstimatedValue { get; private set; }
    public DateTime PurchaseDate { get; private set; }
    public Guid OwnerId { get; private set; }

    private Item() { }

    public Item(string name, decimal purchasePrice, DateTime purchaseDate, Guid ownerId, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty", nameof(name));
        if (purchasePrice < 0)
            throw new ArgumentException("Price cannot be negative", nameof(purchasePrice));

        Name = name;
        Description = description;
        PurchasePrice = purchasePrice;
        PurchaseDate = purchaseDate;
        OwnerId = ownerId;
    }

    public void UpdateEstimatedValue(decimal newValue)
    {
        if (newValue < 0)
            throw new ArgumentException("Value cannot be negative", nameof(newValue));
        EstimatedValue = newValue;
    }
}