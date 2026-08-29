using MediatR;

namespace CollectionsService.Application.Collections.Commands.UpdateCollection;

public record UpdateCollectionCommand(int Id, string Name) : IRequest<bool>;
