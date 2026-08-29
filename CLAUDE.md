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
- Fiecare proiect (`Application`, `Infrastructure`) expune propriile înregistrări DI printr-un extension method propriu (`AddApplication()`, `AddInfrastructure()`), nu se înregistrează totul direct în `Program.cs`.
- Owner-ul curent (userul autenticat) nu se transmite niciodată ca proprietate în `Command`/`Query`, nici nu se citește din body — se obține prin `ICurrentUserService` (interfața în `Application/Common`, implementarea în `Api/Services`, bazată pe `IHttpContextAccessor`), injectat direct în handler-ul care are nevoie de el. Nu recrea DTO-uri "de request" separate de `Command`-uri doar ca să excluzi un câmp — dacă un câmp nu trebuie să vină de la client, elimină-l din `Command` și obține-l din altă sursă (serviciu, claim), nu duplica tipul.
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

`collections-service`: `CollectionsService.Api` (Controllers, Program.cs), `CollectionsService.Application` (DependencyInjection.cs, `Items/` cu `IItemRepository`, `ItemDto`, `Commands/`, `Queries/`), `CollectionsService.Domain` (`Entities/Item.cs`), `CollectionsService.Infrastructure` (DependencyInjection.cs, `Migrations/`, `Persistence/CollectionsDbContext.cs`, `Persistence/Repositories/`), `tests/` (gol încă).

## Stil de lucru preferat de utilizator

- 5+ ani experiență în programare — nu explica banalități, nu ține de mână la comenzi simple.
- Comenzile de terminal se dau una câte una, nu în blocuri mari.
- Preferă să înțeleagă *de ce*, nu doar *ce* — explicații conceptuale concise sunt binevenite.
- Decizii de arhitectură ferme odată discutate — nu le renegoci fără motiv nou, concret.

## Backlog imediat (ordine recomandată)

1. ~~Validare JWT în `collections-service`~~ — făcut (2026-08-29): `AddJwtBearer`, authority = `http://localhost:8080/realms/project`, `[Authorize]` pe `ItemsController`. Client Keycloak de test: `dev-testing` (client authentication ON, necesită `client_secret`). Audience validation dezactivată temporar — clientul nu are încă un audience mapper configurat.
   - `OwnerId` nu mai există ca proprietate în comenzi/query-uri și nu vine niciodată din request body — se obține exclusiv printr-un `ICurrentUserService` (interfața în `Application/Common`, implementarea `CurrentUserService` în `Api/Services`, bazată pe `IHttpContextAccessor` + claim-ul `sub`), injectat direct în handler-ele care au nevoie de el. Orice comandă/query viitoare care are nevoie de owner-ul curent injectează `ICurrentUserService`, nu primește `OwnerId` ca parametru.
2. CRUD complet pentru `Item` (List/Update/Delete) — `OwnerId` vine corect din token de la început.
3. Entitatea `Collection` (gruparea de itemi).
4. Gateway (YARP) în `services/gateway/`.
5. CI (GitHub Actions) în `.github/workflows/`.
6. `release-please` pentru versionare SemVer.
7. Proiect Xcode inițial (SwiftUI, login AppAuth + Keycloak PKCE, Main Menu, apel către collections-service/Gateway).
8. MinIO pentru poze la itemi (neurgent).

## Bug cunoscut, nerezolvat

`Item.PurchaseDate` (DateTime) mapat pe coloană Postgres `timestamp with time zone`. Dacă JSON-ul de request trimite o dată fără offset (ex. `"2026-01-01"`), `System.Text.Json` produce `DateTime` cu `Kind=Unspecified`, iar Npgsql aruncă `ArgumentException` la insert (acceptă doar `Kind=Utc`). Testat manual cu `"2026-01-01T00:00:00Z"` — funcționează. De rezolvat quando se face CRUD-ul complet (opțiuni: `DateOnly` în loc de `DateTime`, sau forțare explicită la UTC în handler/entitate).
