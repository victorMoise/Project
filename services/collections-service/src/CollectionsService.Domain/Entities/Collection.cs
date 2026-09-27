namespace CollectionsService.Domain.Entities;

public class Collection
{
    public int Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid OwnerId { get; private set; }

    private Collection() { }

    public Collection(string name, Guid ownerId, string? description = null)
    {
        EnsureValid(name);

        Name = name;
        Description = description;
        OwnerId = ownerId;
    }

    public void UpdateDetails(string name, string? description)
    {
        EnsureValid(name);
        Name = name;
        Description = description;
    }

    private static void EnsureValid(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty", nameof(name));
    }
}
