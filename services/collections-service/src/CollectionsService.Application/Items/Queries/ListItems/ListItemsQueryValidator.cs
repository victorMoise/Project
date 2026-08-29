using FluentValidation;

namespace CollectionsService.Application.Items.Queries.ListItems;

public class ListItemsQueryValidator : AbstractValidator<ListItemsQuery>
{
    public ListItemsQueryValidator()
    {
        RuleFor(x => x.Limit).InclusiveBetween(1, 100);
        RuleFor(x => x.Offset).GreaterThanOrEqualTo(0);
    }
}
