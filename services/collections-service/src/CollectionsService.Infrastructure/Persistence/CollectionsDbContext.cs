using CollectionsService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CollectionsService.Infrastructure;

public class CollectionsDbContext(DbContextOptions<CollectionsDbContext> options) : DbContext(options)
{
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Collection> Collections => Set<Collection>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Item>(entity =>
        {
            entity.Property(item => item.Name).HasMaxLength(200);
            entity.Property(item => item.Description).HasMaxLength(1000);

            entity
                .HasOne<Collection>()
                .WithMany()
                .HasForeignKey(item => item.CollectionId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Collection>(entity =>
        {
            entity.Property(collection => collection.Name).HasMaxLength(200);
        });
    }
}
