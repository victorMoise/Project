# Project

Platformă personală modulară (proiect de învățare: backend, baze de date, Docker, CI/CD, mobil) — fiecare modul funcțional e un microserviciu independent, cu bază de date proprie, expus printr-un API propriu, consumat de un singur client mobil React Native.

## Arhitectură
- Microservicii — fiecare modul = serviciu separat (ASP.NET Core, .NET 10, Clean Architecture), cu Postgres propriu
- CQRS (MediatR), repository pattern, validare cu FluentValidation
- Autentificare centralizată (Keycloak, self-hosted, realm unic `project`)
- Gateway (YARP) — rutare prefixată pe numele fiecărui serviciu
- Client mobil React Native (Expo), consumă toate serviciile prin gateway

## Structură
- `services/collections-service/` — primul modul: tracker de colecții personale (vinuri, LEGO, cărți de joc etc.)
- `services/gateway/` — API gateway (YARP)
- `mobile/` — aplicația React Native (Expo Router), login Keycloak PKCE
- `infra/` — Docker Compose, configurare Keycloak

## Rulare locală
```
./start   # pornește infra (Docker), collections-service, gateway și Expo (mobile/)
./stop    # oprește collections-service și gateway; ./stop --infra oprește și Docker
```
`Ctrl+C` pe `./start` oprește și el collections-service/gateway; infra Docker rămâne pornită.

## Status
🚧 În dezvoltare.
- `collections-service` — CRUD complet pentru `Item` și `Collection`, autentificare JWT (Keycloak), validare, exception handling global, CI (GitHub Actions)
- `gateway` — rutare funcțională către `collections-service`, CI (GitHub Actions)
- `mobile/` — Expo Router, login Keycloak PKCE (`expo-auth-session`), apel autentificat către gateway

Detalii complete de arhitectură și convenții de cod: [CLAUDE.md](CLAUDE.md)
