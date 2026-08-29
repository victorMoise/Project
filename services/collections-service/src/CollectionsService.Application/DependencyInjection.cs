using CollectionsService.Application.Common.Behaviors;
using CollectionsService.Application.Items.Commands.CreateItem;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace CollectionsService.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateItemCommand).Assembly));
        services.AddValidatorsFromAssembly(typeof(CreateItemCommand).Assembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        return services;
    }
}