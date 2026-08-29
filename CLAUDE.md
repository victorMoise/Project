# Project — instrucțiuni pentru Claude Code

Platformă personală modulară (proiect de învățare: backend, baze de date, Docker, CI/CD, iOS). Fiecare modul funcțional e un **microserviciu independent**, cu bază de date proprie, expus printr-un API propriu. Un singur client iOS (SwiftUI) va consuma toate serviciile.

Primul modul, în lucru: tracker de colecții personale (`services/collections-service`) — obiecte colecționate (vinuri, LEGO, cărți de joc etc.) cu preț plătit, valoare estimată.

## Stack și decizii de arhitectură (ferme — nu renegocia fără motiv nou, concret)

| Componentă | Alegere |
|---|---|
| Arhitectură | Microservicii — fiecare modul = serviciu separat, DB proprie (Postgres per serviciu, nu schema comună) |
| Backend | ASP.NET Core, C#, .NET 10 |
| Structură per serviciu | Clean Architecture: `Api` / `Application` / `Domain` / `Infrastructure`, proiecte .NET separate într-o singură soluție (`.slnx`) |
| CQRS | MediatR — fiecare acțiune are `Command`/`Query` + `Handler` propriu, în foldere `Commands/<Nume>/` și `Queries/<Nume>/` |
| Repository pattern | Interfața (`I...Repository`) stă în `Application`; implementarea concretă stă în `Infrastructure/Persistence/Repositories` |
| DB | PostgreSQL 18 (volumele se montează pe `/var/lib/postgresql`, NU pe `/var/lib/postgresql/data`) |
| ORM | EF Core + Npgsql |
| ID-uri entități | INT identity, auto-incrementat de DB — NU Guid generat în cod. `OwnerId` rămâne Guid (reflectă `sub`-ul din JWT Keycloak) |
| Auth | Keycloak (self-hosted, Docker), realm unic `project` pentru toate serviciile |
| Client | iOS nativ, SwiftUI — neînceput |
| IDE backend | VS Code + C# Dev Kit (nu Rider) |
| Orchestrare locală | `docker-compose.yml` clasic în `infra/` (nu .NET Aspire) |
| Gateway | YARP — decis, neînceput (`services/gateway/`) |
| Git hosting + CI/CD | GitHub, repo public (runnere macOS gratuite nelimitat pentru iOS) |
| Testare API | Postman, colecție unică `Project`, foldere per serviciu |

## Reguli de cod (aplică mereu, fără să întrebi)

- Toate mesajele din cod (excepții, validări, erori) și toți identificatorii (clase, metode, variabile) — **în engleză**, chiar dacă discuția cu utilizatorul e în română.
- Cod self-documenting, evită comentarii. Adaugă un comentariu DOAR când codul chiar nu poate fi făcut clar prin naming/structură.
- Entități Domain: rich domain model — proprietăți cu setter `private`, constructor cu validare (`ArgumentException` pentru input invalid), constructor privat fără parametri pentru EF Core, fără `Id` setat manual (vine din DB).
- Fiecare proiect (`Application`, `Infrastructure`, `Api`) expune propriile înregistrări DI printr-un extension method propriu (`AddApplication()`, `AddInfrastructure()`, `AddApi()`), nu se înregistrează totul direct în `Program.cs` (care rămâne doar cele 3 apeluri + pipeline HTTP).
- Query-urile de citire nu urmăresc entități (`QueryTrackingBehavior.NoTracking` global, setat în `AddInfrastructure`). Orice comandă viitoare care modifică o entitate existentă (Update) trebuie să o încarce explicit cu `.AsTracking()` sau să apeleze `dbContext.Set<T>().Update(entity)`.
- Versiunile de pachete NuGet sunt centralizate în `Directory.Packages.props` (Central Package Management) — proiectele individuale au `PackageReference` fără `Version`. Pachete noi se adaugă tot prin `dotnet add package` (niciodată XML editat manual), CLI-ul completează automat `Directory.Packages.props`.
- `TargetFramework`/`Nullable`/`ImplicitUsings` stau o singură dată în `Directory.Build.props` (rădăcina soluției), nu duplicate în fiecare `.csproj`. SDK-ul e fixat prin `global.json` (`rollForward: latestFeature`), ca versiunea locală și cea din CI să nu diveargă.
- Owner-ul curent (userul autenticat) nu se transmite niciodată ca proprietate în `Command`/`Query`, nici nu se citește din body — se obține prin `ICurrentUserService` (interfața în `Application/Common`, implementarea în `Api/Services`, bazată pe `IHttpContextAccessor`), injectat direct în handler-ul care are nevoie de el. Nu recrea DTO-uri "de request" separate de `Command`-uri doar ca să excluzi un câmp — dacă un câmp nu trebuie să vină de la client, elimină-l din `Command` și obține-l din altă sursă (serviciu, claim), nu duplica tipul.
- Orice `Command` care are nevoie de validare capătă un `AbstractValidator<T>` (FluentValidation) în același folder, nu validare ad-hoc în controller/handler — rulează automat prin `ValidationBehavior` (MediatR pipeline), înregistrat prin `AddValidatorsFromAssembly`. Excepția `FluentValidation.ValidationException` e tratată special în `GlobalExceptionHandler` → 400 structurat.
- `.editorconfig` (per serviciu, ex. `services/collections-service/.editorconfig`) suprimă global `CA1822` (fals-pozitiv pe `DbSet<T>`) și `CA1067` (fals-pozitiv pe `record`-uri MediatR care implementează `IRequest<T>`). Nu le repara individual cu `#pragma warning`.
- Migrațiile EF Core se creează manual (`dotnet ef migrations add <Nume>`), dar se aplică automat la pornire, doar în Development, prin `db.Database.Migrate()` în `Program.cs`. Nu rula `dotnet ef database update` manual.
- Branch-uri: `main` și `develop` protejate (require PR, block force pushes, restrict deletions). Orice modificare trece prin `feature/<nume-descriptiv>` → PR către `develop` → merge → șterge branch-ul (remote și local).
- Commit-uri: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).

## Structură de foldere

```
Project/
├── services/
│   ├── collections-service/   (Clean Architecture, vezi mai jos)
│   └── gateway/                (gol — YARP neînceput)
├── ios/                        (gol)
└── infra/
    ├── docker-compose.yml
    └── .env                     (gitignored — parole reale)
```

`collections-service`: rădăcina soluției are `global.json`, `Directory.Build.props`, `Directory.Packages.props` (vezi Reguli de cod). `CollectionsService.Api` (Controllers, Program.cs, DependencyInjection.cs cu `AddApi()`, `ExceptionHandling/`, `Services/`), `CollectionsService.Application` (DependencyInjection.cs, `Common/` cu `ICurrentUserService` și `Behaviors/ValidationBehavior`, `Items/` cu `IItemRepository`, `ItemDto`, `Commands/`, `Queries/`), `CollectionsService.Domain` (`Entities/Item.cs`), `CollectionsService.Infrastructure` (DependencyInjection.cs, `Migrations/`, `Persistence/CollectionsDbContext.cs`, `Persistence/Repositories/`), `tests/` (gol încă).

## Stil de lucru preferat de utilizator

- 5+ ani experiență în programare — nu explica banalități, nu ține de mână la comenzi simple.
- Comenzile de terminal se dau una câte una, nu în blocuri mari.
- Preferă să înțeleagă *de ce*, nu doar *ce* — explicații conceptuale concise sunt binevenite.
- Decizii de arhitectură ferme odată discutate — nu le renegoci fără motiv nou, concret.

## Backlog imediat (ordine recomandată)

1. ~~Validare JWT în `collections-service`~~ — făcut (2026-08-29): `AddJwtBearer`, authority = `http://localhost:8080/realms/project`, `[Authorize]` pe `ItemsController`. Client Keycloak de test: `dev-testing` (client authentication ON, necesită `client_secret`). Audience validation dezactivată temporar — clientul nu are încă un audience mapper configurat.
   - `OwnerId` nu mai există ca proprietate în comenzi/query-uri și nu vine niciodată din request body — se obține exclusiv printr-un `ICurrentUserService` (interfața în `Application/Common`, implementarea `CurrentUserService` în `Api/Services`, bazată pe `IHttpContextAccessor` + claim-ul `sub`), injectat direct în handler-ele care au nevoie de el. Orice comandă/query viitoare care are nevoie de owner-ul curent injectează `ICurrentUserService`, nu primește `OwnerId` ca parametru.
2. ~~Exception handling global~~ — făcut (2026-08-29): `GlobalExceptionHandler` (`Api/ExceptionHandling`, implementează `IExceptionHandler`) + `AddProblemDetails()` + `app.UseExceptionHandler()`. Orice excepție necontrolată se loghează complet server-side, dar clientul primește doar un `application/problem+json` generic (500, cu `traceId`), nu stack trace. Nu schimbă formatul răspunsurilor 401/404 (rămân ca înainte) — doar excepțiile necontrolate.
3. ~~Validare prin MediatR pipeline behavior~~ — făcut (2026-08-29): `ValidationBehavior<TRequest,TResponse>` (`Application/Common/Behaviors`) rulează toți validatorii FluentValidation înregistrați pentru o comandă înainte ca handler-ul să fie apelat; dacă eșuează, aruncă `FluentValidation.ValidationException`. `GlobalExceptionHandler` tratează special acest tip de excepție → 400 + `ValidationProblemDetails` cu erori pe câmp, în loc de 500 generic. Fiecare comandă care are nevoie de validare capătă un `<Comanda>Validator : AbstractValidator<Comanda>` lângă ea (ex. `CreateItemCommandValidator`), înregistrat automat prin `AddValidatorsFromAssembly`. Nu înlocuiește validarea din constructorul entității Domain (rămâne ca ultimă linie de apărare), doar prinde erorile mai devreme, cu mesaje structurate.
4. ~~CRUD complet pentru `Item`~~ — făcut (2026-08-29): `List` (`GET /api/items?limit&offset`, paginat, `limit` plafonat 1-100 prin validator), `Update` (`PUT /api/items/{id}`, 204/404), `Delete` (`DELETE /api/items/{id}`, 204/404). Toate query-urile/comenzile filtrează după `OwnerId` din `ICurrentUserService` — inclusiv `GetById`, care înainte era global. Un item al altui user nu există din perspectiva ta (404, nu 403). `IItemRepository` are `GetByIdAsync` (citire, NoTracking implicit) separat de `GetTrackedByIdAsync` (`.AsTracking()` explicit, folosit doar de `Update`/`Delete`, care chiar mută entitatea). `Item` capătă `UpdateDetails(...)` în Domain (validare comună extrasă în `EnsureValid`, refolosită de constructor).
5. Entitatea `Collection` (gruparea de itemi).
6. Gateway (YARP) în `services/gateway/`.
7. ~~CI (GitHub Actions)~~ — făcut (2026-08-29): `.github/workflows/collections-service-ci.yml`, `dotnet restore` + `build` (Release) pe PR către `develop` și pe push pe `develop`, scopat la `services/collections-service/**`. Neobligatoriu încă (nu e status check required în ruleset) — doar semnal vizibil pe PR.
8. `release-please` pentru versionare SemVer — amânat intenționat (2026-08-29): nu are sens până nu există un consumator real de versiuni (Gateway sau clientul iOS care depinde de o versiune anume a API-ului).
9. Proiect Xcode inițial (SwiftUI, login AppAuth + Keycloak PKCE, Main Menu, apel către collections-service/Gateway).
10. MinIO pentru poze la itemi (neurgent).

## Bug rezolvat (istoric)

~~`Item.PurchaseDate` (DateTime) mapat pe coloană Postgres `timestamp with time zone`~~ — rezolvat (2026-08-29): `PurchaseDate` a devenit `DateOnly` (Domain, `CreateItemCommand`, `ItemDto`), mapat de EF Core/Npgsql pe coloană Postgres `date`. Motivul real al bug-ului: `timestamptz` cere `DateTime` cu `Kind=Utc`, dar un JSON de dată fără offset (`"2026-01-01"`) deserializa la `Kind=Unspecified`, respins de Npgsql. `DateOnly` elimină complet problema — nu mai există concept de fus orar/oră pentru o dată de achiziție, care oricum nu avea nevoie de componentă de timp. Migrare EF: `ChangePurchaseDateToDateOnly` (`ALTER COLUMN ... TYPE date`, cast implicit acceptat de Postgres).
