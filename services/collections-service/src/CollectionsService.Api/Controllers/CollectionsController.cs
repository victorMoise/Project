using CollectionsService.Application.Collections;
using CollectionsService.Application.Collections.Commands.CreateCollection;
using CollectionsService.Application.Collections.Commands.DeleteCollection;
using CollectionsService.Application.Collections.Commands.UpdateCollection;
using CollectionsService.Application.Collections.Queries.GetCollectionById;
using CollectionsService.Application.Collections.Queries.ListCollections;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CollectionsService.Api.Controllers;

[ApiController]
[Route("api/collections")]
[Authorize]
public class CollectionsController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateCollectionCommand command, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CollectionDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var collection = await mediator.Send(new GetCollectionByIdQuery(id), cancellationToken);
        return collection is null ? NotFound() : Ok(collection);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CollectionDto>>> List([FromQuery] ListCollectionsQuery query, CancellationToken cancellationToken)
    {
        var collections = await mediator.Send(query, cancellationToken);
        return Ok(collections);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateCollectionCommand command, CancellationToken cancellationToken)
    {
        var updated = await mediator.Send(command with { Id = id }, cancellationToken);
        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await mediator.Send(new DeleteCollectionCommand(id), cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
