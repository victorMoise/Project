using CollectionsService.Application.Items;
using CollectionsService.Application.Items.Commands.CreateItem;
using CollectionsService.Application.Items.Queries.GetItemById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CollectionsService.Api.Controllers;

[ApiController]
[Route("api/items")]
public class ItemsController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateItemCommand command, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ItemDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await mediator.Send(new GetItemByIdQuery(id), cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }
}