using MediatR;

namespace CollectionsService.Application.Collections.Commands.CreateCollection;

public record CreateCollectionCommand(string Name) : IRequest<int>;
