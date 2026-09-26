# @project/design-tokens

Sursa unică de adevăr pentru toate culorile (și spacing/radius/tipografie/motion) din
`mobile/` și din tema Keycloak (`infra/keycloak-theme/`). Nicio culoare nu apare hardcodată
în afara acestui pachet — vezi `CLAUDE.md` (rădăcină), secțiunea „Reguli de cod".

## Cum funcționează

```
tokens/
  base/            spacing, radius, typography, motion — identice în toate temele
  themes/<id>/     tokens.json (culori, format DTCG $type/$value) + meta.json (id, name, colorScheme, isDefault*)
```

`npm run tokens:build` citește tot de mai sus (Style Dictionary 5) și generează:

- `mobile/src/theme/generated/{themes,tokens}.ts` — obiecte TS tipate
- `mobile/src/theme/generated/default-theme.json` — culorile temei light default, pentru `app.config.ts` (splash/adaptive icon, care nu pot fi schimbate la runtime)
- `infra/keycloak-theme/src/theme/generated/themes.css` — `:root[data-theme="..."]` cu variabile CSS
- `infra/keycloak-theme/src/theme/generated/theme-ids.ts` — id-uri valide + default-uri light/dark

Fișierele generate au un header „GENERATED, do not edit" — se editează doar sursele din `tokens/`.

Build-ul **eșuează intenționat** dacă o temă nu respectă contrastul minim WCAG cerut de fiecare
rol de culoare (`scripts/check-contrast.mjs`), înainte să scrie orice fișier. Mesajul de eroare
spune exact ce pereche de culori și ce raport a obținut.

## Adaugi o temă nouă

1. `cp -r tokens/themes/vitrine tokens/themes/<id-nou>`
2. În `meta.json`: schimbă `id` (trebuie identic cu numele folderului) și `name`; `colorScheme`
   trebuie să fie `"light"` sau `"dark"`. **Nu** seta `isDefaultLight`/`isDefaultDark` decât dacă
   chiar vrei ca tema asta să devină noul default pentru modul respectiv (trebuie să existe
   exact o temă cu fiecare flag — build-ul eșuează dacă sunt 0 sau mai multe).
3. În `tokens.json`: schimbă valorile. **Toate** rolurile din tabelul de mai jos sunt obligatorii.
4. `npm run tokens:build`. Dacă pică pe contrast, ajustează valoarea indicată în eroare.
5. Verifică vizual (Storybook-ul din `infra/keycloak-theme/`, ecranul de alegere a temei din `mobile/`).

Nu e nevoie de nicio altă modificare de cod — temele apar automat oriunde (aplicație, listă de
alegere a temei, pagina de login Keycloak).

## Roluri de culoare (obligatorii în orice temă)

| Rol | Folosire | Cerință de contrast |
|---|---|---|
| `background` | fundalul ecranului/paginii | — |
| `surface` | panouri, input-uri, card | — |
| `surfaceRaised` | elemente peste `surface` (meniuri, sheet-uri) | — |
| `border` | separatoare decorative | — |
| `inputBorder` | conturul input-urilor | ≥ 3:1 pe `surface` și `background` |
| `textPrimary` | text principal | ≥ 4.5:1 pe `surface` și `background` |
| `textSecondary` | text secundar/helper | ≥ 4.5:1 pe `surface` și `background` |
| `accent` | buton primar, linkuri, stare selectată | ≥ 4.5:1 pe `surface` |
| `accentPressed` | `accent` în stare apăsat | textul de pe el (`textOnAccent`) ≥ 4.5:1 |
| `textOnAccent` | text pe fundal `accent`/`accentPressed` | ≥ 4.5:1 pe ambele |
| `focusRing` | inel de focus | ≥ 3:1 pe `background` |
| `danger` | text/icon de eroare | ≥ 4.5:1 pe `surface` și pe `dangerSurface` |
| `dangerSurface` | fundalul alertei de eroare | — (verificat prin `danger`) |
| `success` | confirmări | ≥ 4.5:1 pe `surface` și pe `successSurface` |
| `successSurface` | fundalul confirmării | — (verificat prin `success`) |
| `shadow` | culoarea umbrelor (poate avea alpha, hex pe 8 cifre) | — |
| `overlay` | scrim pentru sheet-uri/modale (poate avea alpha) | — |

## Comenzi

```bash
npm install        # o singură dată
npm run tokens:build
```
