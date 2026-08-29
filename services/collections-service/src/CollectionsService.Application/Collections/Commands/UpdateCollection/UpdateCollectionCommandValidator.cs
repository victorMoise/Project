using FluentValidation;

namespace CollectionsService.Application.Collections.Commands.UpdateCollection;

public class UpdateCollectionCommandValidator : AbstractValidator<UpdateCollectionCommand>
{
    public UpdateCollectionCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
    }
}
