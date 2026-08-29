using CollectionsService.Application.Items;
using CollectionsService.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CollectionsService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<CollectionsDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("CollectionsDb")));

        services.AddScoped<IItemRepository, ItemRepository>();

        return services;
    }
}