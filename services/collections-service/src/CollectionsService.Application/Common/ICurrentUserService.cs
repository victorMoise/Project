namespace CollectionsService.Application.Common;

public interface ICurrentUserService
{
    Guid OwnerId { get; }
}
