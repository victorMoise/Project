using CollectionsService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CollectionsService.Infrastructure;

public class CollectionsDbContext(DbContextOptions<CollectionsDbContext> options) : DbContext(options)
{
    public DbSet<Item> Items => Set<Item>();
}
