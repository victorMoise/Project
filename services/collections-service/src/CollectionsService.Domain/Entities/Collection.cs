namespace CollectionsService.Domain.Entities;

public class Collection
{
    public int Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public Guid OwnerId { get; private set; }

    private Collection() { }

    public Collection(string name, Guid ownerId)
    {
        EnsureValid(name);

        Name = name;
        OwnerId = ownerId;
    }

    public void UpdateName(string name)
    {
        EnsureValid(name);
        Name = name;
    }

    private static void EnsureValid(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty", nameof(name));
    }
}
