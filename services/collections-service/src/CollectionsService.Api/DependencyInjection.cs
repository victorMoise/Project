using CollectionsService.Api.ExceptionHandling;
using CollectionsService.Api.Services;
using CollectionsService.Application.Common;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace CollectionsService.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddApi(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers();
        services.AddOpenApi();
        services.AddHealthChecks();

        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        var keycloakAuthority = configuration["Keycloak:Authority"];
        ArgumentException.ThrowIfNullOrEmpty(keycloakAuthority, "Keycloak:Authority");

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = keycloakAuthority;
                options.RequireHttpsMetadata = false;
                options.MapInboundClaims = false;
                // The Keycloak client has no audience mapper configured yet.
                options.TokenValidationParameters.ValidateAudience = false;
            });
        services.AddAuthorization();

        return services;
    }
}
