using Microsoft.EntityFrameworkCore;

namespace CollectionsService.Infrastructure;

public class CollectionsDbContext(DbContextOptions<CollectionsDbContext> options) : DbContext(options)
{
    // DbSets here
}
