# Project

Platformă personală modulară — fiecare modul e un microserviciu independent, cu bază de date proprie, expus prin API și consumat de o aplicație iOS nativă.

## Arhitectură
- Fiecare modul = un serviciu separat (backend + DB proprie)
- Autentificare centralizată (Keycloak, self-hosted)
- Client iOS nativ (SwiftUI), consumă toate serviciile

## Structură
- `services/` — microserviciile backend (câte un folder per modul)
- `ios/` — aplicația SwiftUI
- `infra/` — Docker Compose, configurare Keycloak, gateway

## Status
🚧 În dezvoltare — primul modul: TBD
