using CollectionsService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CollectionsService.Infrastructure;

public class CollectionsDbContext(DbContextOptions<CollectionsDbContext> options) : DbContext(options)
{
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Collection> Collections => Set<Collection>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Item>()
            .HasOne<Collection>()
            .WithMany()
            .HasForeignKey(item => item.CollectionId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
