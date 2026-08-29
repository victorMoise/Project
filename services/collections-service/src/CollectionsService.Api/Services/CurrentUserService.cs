using System.Security.Claims;
using CollectionsService.Application.Common;

namespace CollectionsService.Api.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public Guid OwnerId
    {
        get
        {
            var sub = httpContextAccessor.HttpContext?.User.FindFirstValue("sub")
                ?? throw new InvalidOperationException("No authenticated user in the current context.");
            return Guid.Parse(sub);
        }
    }
}
