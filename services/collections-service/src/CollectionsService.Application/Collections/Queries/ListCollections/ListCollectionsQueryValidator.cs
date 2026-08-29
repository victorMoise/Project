using FluentValidation;

namespace CollectionsService.Application.Collections.Queries.ListCollections;

public class ListCollectionsQueryValidator : AbstractValidator<ListCollectionsQuery>
{
    public ListCollectionsQueryValidator()
    {
        RuleFor(x => x.Limit).InclusiveBetween(1, 100);
        RuleFor(x => x.Offset).GreaterThanOrEqualTo(0);
    }
}
