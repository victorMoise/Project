using CollectionsService.Application.Items.Commands.CreateItem;
using Microsoft.Extensions.DependencyInjection;

namespace CollectionsService.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateItemCommand).Assembly));

        return services;
    }
}