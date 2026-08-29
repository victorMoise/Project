using CollectionsService.Application.Collections;
using CollectionsService.Application.Common;
using FluentValidation;

namespace CollectionsService.Application.Items.Commands.CreateItem;

public class CreateItemCommandValidator : AbstractValidator<CreateItemCommand>
{
    public CreateItemCommandValidator(ICollectionRepository collectionRepository, ICurrentUserService currentUserService)
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.PurchasePrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CollectionId)
            .MustAsync(async (collectionId, cancellationToken) =>
                await collectionRepository.GetByIdAsync(collectionId!.Value, currentUserService.OwnerId, cancellationToken) is not null)
            .When(x => x.CollectionId.HasValue)
            .WithMessage("Collection does not exist or does not belong to you.");
    }
}
