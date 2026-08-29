using CollectionsService.Application.Items;
using CollectionsService.Application.Items.Commands.CreateItem;
using CollectionsService.Application.Items.Commands.DeleteItem;
using CollectionsService.Application.Items.Commands.UpdateItem;
using CollectionsService.Application.Items.Queries.GetItemById;
using CollectionsService.Application.Items.Queries.ListItems;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CollectionsService.Api.Controllers;

[ApiController]
[Route("api/items")]
[Authorize]
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

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ItemDto>>> List([FromQuery] ListItemsQuery query, CancellationToken cancellationToken)
    {
        var items = await mediator.Send(query, cancellationToken);
        return Ok(items);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateItemCommand command, CancellationToken cancellationToken)
    {
        var updated = await mediator.Send(command with { Id = id }, cancellationToken);
        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await mediator.Send(new DeleteItemCommand(id), cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
