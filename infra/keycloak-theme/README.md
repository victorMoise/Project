# @project/keycloak-theme

Temă custom de login pentru Keycloak (Keycloakify 11, React + Vite), fără PatternFly
(`doUseDefaultCss={false}` în toate paginile) — toate culorile vin din
`packages/design-tokens` ca variabile CSS (`--color-*`), nicio culoare hardcodată (vezi
`CLAUDE.md`, secțiunea „Reguli de cod").

## Dev loop

```bash
npm install        # o singură dată
npm run dev         # Vite, cu kcContextMock (src/kcContextMock.ts) — orice pagină, fără Keycloak real
npm run storybook   # o poveste per pagină de auth, toate temele
```

`kcContextMock`-ul e activ doar în `import.meta.env.DEV` (nu ajunge în build-ul de producție).
Pentru verificare vizuală rapidă a unei singure pagini fără a porni tot stack-ul Docker,
`npm run dev` e suficient — schimbi pagina/tema direct din mock.

Pentru testare end-to-end (login real, redirect Keycloak, `ui_theme` din query/sessionStorage),
ai nevoie de Keycloak real pornit — vezi „Build + deploy" mai jos.

## Build + deploy

```bash
npm run build-keycloak-theme   # tsc + vite build + keycloakify build (necesită Maven local)
```

Produce `dist_keycloak/keycloak-theme-for-kc-all-other-versions.jar`. `./start` (rădăcina
repo-ului) detectează automat dacă jar-ul e mai vechi decât sursele (`src/`) și rulează acest
build singur, apoi repornește containerul Keycloak ca să încarce noul provider (Keycloak
citește provider-ii doar la pornire) și aplică `infra/keycloak/configure-realm.sh`. Nu e nevoie
de pași manuali în fluxul normal `./start`/`./stop`.

Pentru un build manual (ex. testare izolată):

```bash
npm run build-keycloak-theme
cd ../.. && docker compose -f infra/docker-compose.yml restart keycloak
infra/keycloak/configure-realm.sh
```

Jar-ul e montat în `infra/docker-compose.yml` pe `/opt/keycloak/providers/project-theme.jar`.

## `configure-realm.sh`

Script idempotent (`infra/keycloak/configure-realm.sh`) care setează pe realm-ul `project`:
`loginTheme=project`, `displayName=Project`, `internationalizationEnabled=true`,
`supportedLocales=["en","ro"]`, `defaultLocale=en`. Rulează automat din `./start` după ce
Keycloak e sănătos — se poate rula și manual oricând, e safe de repetat.

## Verificări (înainte de commit)

```bash
npm run typecheck   # tsc --noEmit
npm run stylelint    # color-no-hex, color-named, function-disallowed-list pe src/**/*.css
```

Nu există `npm run lint` (ESLint) pentru acest pachet: `typescript-eslint` și
`@babel/eslint-parser` nu au încă un release care să acopere combinația
`TypeScript 7` / `ESLint 10` folosită aici (peer ranges declarate explicit sub versiunile
curente, verificat pe npm). Regula „zero literali de culoare" pentru TS/TSX e acoperită
în schimb de `scripts/check-color-literals.sh` (rulat din `design-tokens-ci.yml`) — CSS-ul,
unde chiar apar culorile în acest pachet, rămâne acoperit integral de Stylelint.

## Adaugi/modifici o pagină de auth

1. `npx keycloakify eject-page` — listă interactivă (`cli-select`), alege pagina.
2. Scrie componenta în `src/login/pages/<Nume>.tsx`, `doUseDefaultCss={false}`, clase proprii
   în `src/login/login.css` (variabile CSS din tokeni, niciodată culori literale).
3. Adaugă cazul în switch-ul din `src/login/KcPage.tsx` (eject-ul nu face wiring-ul automat
   pentru pagini, doar pentru `Template`/`UserProfileFormFields`).
4. Verifică live: `npm run build-keycloak-theme`, restart container, testează în browser/Playwright.

## Teme noi

Nu se ating fișierele din acest pachet — o temă nouă se adaugă în `packages/design-tokens`
(vezi README-ul acelui pachet) și apare automat aici după `npm run tokens:build`.
