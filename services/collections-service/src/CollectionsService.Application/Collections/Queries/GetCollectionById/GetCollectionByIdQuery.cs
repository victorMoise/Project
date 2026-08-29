using MediatR;

namespace CollectionsService.Application.Collections.Queries.GetCollectionById;

public record GetCollectionByIdQuery(int Id) : IRequest<CollectionDto?>;
