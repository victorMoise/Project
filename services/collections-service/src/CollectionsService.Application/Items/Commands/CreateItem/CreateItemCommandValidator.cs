using FluentValidation;

namespace CollectionsService.Application.Items.Commands.CreateItem;

public class CreateItemCommandValidator : AbstractValidator<CreateItemCommand>
{
    public CreateItemCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.PurchasePrice).GreaterThanOrEqualTo(0);
    }
}
