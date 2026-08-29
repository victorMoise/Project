using MediatR;

namespace CollectionsService.Application.Items.Commands.DeleteItem;

public record DeleteItemCommand(int Id) : IRequest<bool>;
