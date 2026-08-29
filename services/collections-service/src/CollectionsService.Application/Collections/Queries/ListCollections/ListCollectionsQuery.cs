using MediatR;

namespace CollectionsService.Application.Collections.Queries.ListCollections;

public record ListCollectionsQuery(int Limit = 50, int Offset = 0) : IRequest<IReadOnlyList<CollectionDto>>;
