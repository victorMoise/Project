using MediatR;

namespace CollectionsService.Application.Collections.Commands.DeleteCollection;

public record DeleteCollectionCommand(int Id) : IRequest<bool>;
