# Plan de implementare: ecran de login Keycloak custom + sistem de teme interschimbabile

> Destinatar: agentul care implementează. Citește tot documentul înainte de prima modificare.
> Redactat: 2026-09-26. Stare repo la redactare: branch `feature/mobile-expo-scaffold` (PR către `develop` încă nemergiuit).

---

## 0. Obiectiv

1. Pagina de login Keycloak (și restul paginilor de auth: register, reset parolă etc.) capătă un design propriu, fără branding Keycloak/Red Hat.
2. Aplicația are **teme interschimbabile**, alese de user. Tema aleasă în aplicație se aplică **și** paginii de login Keycloak.
3. **Zero culori hardcodate în cod, nicăieri.** Singura sursă de culori e fișierul de tokeni al fiecărei teme. Adăugarea unei teme noi = adăugarea unui fișier JSON + rularea generatorului, fără nicio modificare de cod.

Securitatea fluxului rămâne neschimbată: Authorization Code + PKCE prin browserul sistemului (`expo-auth-session`). **Nu** se activează Direct Access Grants și **nu** se construiește formular de parolă nativ în React Native (decizie luată explicit cu userul).

---

## 1. Reguli ferme (nenegociabile)

| Regulă | Detaliu |
|---|---|
| Zero literali de culoare | Interzis oriunde în afara `packages/design-tokens/tokens/**` și a fișierelor generate din ele: hex (`#fff`, `#E6F4FE`), `rgb()/rgba()/hsl()/hsla()/hwb()/lab()/lch()/oklab()/oklch()/color()`, nume CSS de culori (`red`, `white`, `black` etc.). Excepții permise: `transparent`, `currentColor`, `inherit`. Se aplică în TS/TSX, CSS, `app.json`/`app.config.ts`, SVG-uri inline (folosesc `currentColor`). Singurele excepții sunt asset-urile binare existente (`mobile/assets/*.png`). |
| Doar ultimele versiuni | Fără pachete/API-uri depreciate sau „legacy". Verifică versiunea curentă cu `npm view <pkg> version` înainte de instalare. În `mobile/` instalezi **doar** cu `npx expo install`. Dacă npm raportează un conflict de peer dependencies, investighezi și documentezi cauza în commit (vezi precedentul `react-dom` opțional din `mobile/`), nu îl ascunzi. |
| Expo Go compatibil | `mobile/` trebuie să ruleze în continuare în Expo Go: **niciun** modul nativ care nu e inclus în Expo Go (deci fără Unistyles, react-native-mmkv etc.). |
| Git | Branch `feature/themeable-login` din `develop` (după merge-ul lui `feature/mobile-expo-scaffold`; dacă nu e mergiuit încă, branch din el și rebase ulterior). Conventional Commits. **Fără** trailer `Co-Authored-By: Claude` în commit-uri și **fără** footer „Generated with Claude Code" în PR-uri (preferință explicită a userului). |
| Convenții existente | Respectă `CLAUDE.md` de la rădăcină și `mobile/AGENTS.md` (Expo Router în `src/app/`, rute doar în `src/app/`, kebab-case, alias `@/*`). Comenzile de terminal date userului se dau una câte una. |

---

## 2. Stare curentă (verificată la 2026-09-26)

- Keycloak `quay.io/keycloak/keycloak:26.7`, `start-dev`, în `infra/docker-compose.yml`. Temele NU sunt montate încă (nu există volum pentru `/opt/keycloak/themes` sau `/opt/keycloak/providers`).
- Realm `project`: `loginTheme` nesetat (deci default `keycloak.v2`), `registrationAllowed: true`, `resetPasswordAllowed: true`, `rememberMe: true`, `loginWithEmailAllowed: true`, `verifyEmail: false`, `internationalizationEnabled: false`.
- Client `mobile-app`: public, doar Standard Flow, PKCE `S256`, redirect URIs `mobile://redirect` și `exp://*`.
- **Verificat empiric:** `GET /realms/project/protocol/openid-connect/auth?...&ui_theme=cellar` întoarce **200** și randează direct pagina de login (fără redirect), deci parametrii custom din query sunt vizibili în `window.location.search` la prima randare. `action`-ul formularului este `.../login-actions/authenticate?session_code=...&client_id=...&tab_id=...&client_data=...`, fără parametrii custom, deci paginile ulterioare (ex. re-randarea după o parolă greșită) **îi pierd**. Consecința e în secțiunea 5.3.
- Literali de culoare existenți de eliminat: `mobile/src/screens/home.tsx:65` (`color: 'red'`), `mobile/app.json:15` (`"backgroundColor": "#E6F4FE"`).
- CI existent: doar `collections-service-ci.yml` și `gateway-ci.yml`. Nu există CI pentru `mobile/`.
- Tooling local: Node + npm, Docker, Java 23. **Maven NU e instalat** (necesar pentru Keycloakify, vezi 4.2).
- Gotcha deja documentat în `CLAUDE.md`: pe telefon fizic, issuer-ul Keycloak depinde de hostname-ul folosit (LAN IP vs `localhost`).

---

## 3. Arhitectură (decizii + motivare)

```
packages/design-tokens/            ← SINGURA sursă de culori/tokeni (DTCG JSON)
        │  npm run tokens:build (Style Dictionary 5)
        ├──────────────► mobile/src/theme/generated/themes.ts        (obiecte TS tipate)
        ├──────────────► mobile/src/theme/generated/default-theme.json (citit de app.config.ts)
        ├──────────────► infra/keycloak-theme/src/theme/generated/themes.css (CSS vars per [data-theme])
        └──────────────► infra/keycloak-theme/src/theme/generated/theme-ids.ts (id-uri valide + default-uri)

mobile (Expo)  ── useAuthRequest({ extraParams: { ui_theme } }) ──►  Keycloak /auth
                                                                        │
infra/keycloak-theme (Keycloakify → .jar) ── montat în container ──────┘
   script inline în <head>: ui_theme din URL → sessionStorage → <html data-theme="...">
```

### 3.1 Tokeni: `packages/design-tokens/` cu format DTCG + Style Dictionary

- Format: **W3C Design Tokens (DTCG)** (`$value`, `$type`), standardul actual, suportat nativ de Style Dictionary 5 (verificat: `style-dictionary@5.5.5`).
- De ce un generator și nu import direct între proiecte: `mobile/` și `infra/keycloak-theme/` au lockfile-uri proprii. Workspaces npm la rădăcină ar schimba hoisting-ul pentru Expo, ceea ce e un risc inutil. Fișierele generate se **commit-uiesc**, iar CI verifică că sunt la zi (`tokens:build` + `git diff --exit-code`).
- Tokenii de culoare sunt **per temă**. Spacing, radius, tipografie și motion sunt **globali** (identici în toate temele) în prima versiune. Dacă ulterior o temă trebuie să schimbe și radius/fontul, se mută acel grup în fișierul temei, fără schimbare de arhitectură.

### 3.2 Keycloak: Keycloakify (React + Vite + TS), în `infra/keycloak-theme/`

Alternative evaluate:

| Variantă | Pro | Contra | Verdict |
|---|---|---|---|
| Temă FreeMarker (`.ftl` + CSS) care extinde `keycloak.v2` | Fără build, fără Maven | Markup PatternFly greu de remodelat, template-uri FreeMarker greu de întreținut, fără TS, fără Storybook | Respins |
| **Keycloakify 11** (`keycloakify@11.16.0`, actualizat 2026-09-02) | React + TS (userul are experiență React), control total asupra markup-ului, Storybook pentru fiecare pagină × temă, `doUseDefaultCss={false}` elimină PatternFly complet, jar suportă KC 26 | Necesită **Maven** la build, plus un pas de build care produce un `.jar` | **Ales** |
| „Quick theme" din Admin Console | Zero cod | Doar logo + câteva culori, setate în UI (contrazice regula „totul din tokeni"), fără teme multiple per user | Respins |

Jar-ul relevant: `keycloak-theme-for-kc-all-other-versions.jar` (acoperă „Keycloak 11 to 21 and 26 and newer"). Opțional `keycloakVersionTargets` ca să nu se mai genereze jar-ul pentru 22-25.

### 3.3 Aplicația mobilă: ThemeProvider propriu (context React), fără bibliotecă nativă

- `react-native-unistyles` v3 ar fi ideal ca performanță, dar are modul nativ și **nu rulează în Expo Go**, deci e respins.
- Schimbarea temei e un eveniment rar, iar un re-render al arborelui la schimbare e acceptabil. Contextul se împarte ca să nu re-randeze inutil (vezi 6.2).
- **Deviere deliberată** de la skill-ul `expo-design-system`, care recomandă culori semantice de platformă (`Color.ios.label` etc.): aici temele sunt complet custom și alese de user, deci **toate** culorile vin din tokeni. Documentează devierea într-un comentariu scurt în `src/theme/index.ts`.

---

## 4. Etapa A: pachetul de tokeni

### 4.1 Structură

```
packages/design-tokens/
  package.json                 # devDependencies: style-dictionary (ultima versiune); scripts: tokens:build, tokens:check
  README.md                    # cum adaugi o temă (pașii exacți)
  tokens/
    base/
      spacing.json
      radius.json
      typography.json          # font family, dimensiuni, greutăți, line-height
      motion.json
    themes/
      vitrine.json             # fiecare temă: metadata + TOATE rolurile de culoare
      cellar.json
      contrast.json
  config/
    style-dictionary.config.mjs
  scripts/
    check-contrast.mjs         # eșuează build-ul dacă o temă pică WCAG
    build.mjs                  # rulează SD pentru toate temele + contrast check
```

### 4.2 Schema unei teme (roluri semantice, obligatorii în fiecare temă)

Metadata: `id` (kebab-case, stabil, e și valoarea pentru `ui_theme` și `data-theme`), `name` (afișat userului), `colorScheme` (`light` | `dark`), plus opțional `isDefaultLight` / `isDefaultDark` (exact câte o temă pentru fiecare).

| Rol | Folosire |
|---|---|
| `background` | fundalul paginii/ecranului |
| `surface` | panouri, card pe desktop, input-uri |
| `surfaceRaised` | elemente peste `surface` (meniuri, sheet-uri) |
| `border` | separatoare decorative (fără cerință de contrast) |
| `inputBorder` | conturul input-urilor/checkbox-urilor, **≥ 3:1** față de `surface` și `background` (WCAG 1.4.11) |
| `textPrimary` | text principal, **≥ 4.5:1** pe `surface` și `background` |
| `textSecondary` | text secundar/helper, **≥ 4.5:1** pe `surface` și `background` |
| `accent` | buton primar, linkuri, stare selectată, **≥ 4.5:1** pe `surface` (e folosit și ca text de link) |
| `accentPressed` | stare apăsat/hover pentru `accent` |
| `textOnAccent` | textul de pe butonul primar, **≥ 4.5:1** pe `accent` |
| `focusRing` | inel de focus, **≥ 3:1** pe `background` |
| `danger` | text/icon de eroare, **≥ 4.5:1** pe `surface` |
| `dangerSurface` | fundalul alertei de eroare (`danger` trebuie să treacă ≥ 4.5:1 și pe el) |
| `success` / `successSurface` | confirmări (ex. „email trimis" la reset parolă), aceleași cerințe |
| `shadow` | culoarea umbrei, nuanțată după fundal, nu negru pur |
| `overlay` | scrim pentru sheet-uri/modale |

`scripts/check-contrast.mjs` verifică perechile de mai sus pentru **fiecare** temă și oprește build-ul cu mesaj clar (temă, pereche, raport obținut, minimul cerut).

### 4.3 Temele inițiale

Valorile de mai jos apar **exclusiv** în fișierele JSON ale temelor. Contrastele marcate au fost calculate la redactarea planului. Rolurile necalculate (`accentPressed`, `dangerSurface`, `success*`, `surfaceRaised`, `shadow`, `overlay`) le derivă agentul, iar `check-contrast.mjs` trebuie să treacă.

Direcție: aplicația e un tracker de colecții (vinuri, LEGO, cărți de joc), iar temele evocă vitrina și crama de colecționar. S-au evitat deliberat paletele generice interzise de skill-urile de design: hârtie crem + alamă + text espresso, negru + accent neon, gradient mov.

| Rol | `vitrine` (light, default light) | `cellar` (dark, default dark) | `contrast` (light, accesibilitate) |
|---|---|---|---|
| background | `#EEF2F0` | `#111615` | `#FAFAFA` |
| surface | `#FAFCFB` | `#1A201E` | `#FFFFFF` |
| border | `#C9D3CE` | `#34403B` | `#5A5A5A` |
| inputBorder | `#758680` (3.72 / 3.39) | `#6E7D77` (3.83 / 4.23) | `#5A5A5A` (6.90) |
| textPrimary | `#15201B` (16.25) | `#E6ECE9` (13.82) | `#0A0A0A` (19.80) |
| textSecondary | `#4D5C55` (6.85 / 6.24) | `#A2AFA9` (7.28 / 8.04) | `#2E2E2E` (13.58) |
| accent | `#1D6B50` (6.23) | `#D8A23F` (7.22) | `#0033A0` (10.60) |
| textOnAccent | `#F3FAF6` (6.06) | `#1B1405` (7.97) | `#FFFFFF` (10.60) |
| focusRing | `#1D6B50` (5.68) | `#D8A23F` (7.97) | `#0033A0` (10.16) |
| danger | `#A8261C` (6.89) | `#F0A8A2` (8.53) | `#A30000` (8.21) |

Numele și paletele sunt propuneri: userul le poate schimba înainte de etapa A (vezi secțiunea 11). Fiind date, schimbarea lor ulterioară nu atinge codul.

### 4.4 Tipografie și restul tokenilor globali

- Font: **Geist** (sans). Skill-urile de design descurajează Inter ca default și serif fără justificare de brand. În mobil: `@expo-google-fonts/geist` (verificat `0.4.2`, merge în Expo Go prin `useFonts`). În Keycloak: `@fontsource-variable/geist` (verificat `5.3.0`), self-hosted în jar, **fără** Google Fonts CDN la runtime. Dacă userul vrea alt font, se schimbă doar `typography.json` + pachetul de font.
- Scala tipografică: 5-6 trepte numite (`display`, `title`, `body`, `label`, `caption`), line-height 1.4-1.5 pentru body, fără caps-lock pe label-uri.
- Spacing: grilă de 4pt (`xs 4, sm 8, md 16, lg 24, xl 32, xxl 48`), cu trepte adăugate doar dacă se repetă.
- Radius: o singură regulă documentată, de exemplu input și buton `md` (10), card desktop `lg` (16). Fără amestec de colțuri drepte cu pastile.
- Motion: `fast 150` ms (feedback la apăsare, focus), `base 250` ms. Fără alte animații.

### 4.5 Output-uri generate (Style Dictionary)

1. `mobile/src/theme/generated/themes.ts`: `export const themes = { vitrine: {...}, cellar: {...}, contrast: {...} } as const`, plus `ThemeId`, `Theme` și `defaultLightThemeId`/`defaultDarkThemeId`, toate tipate.
2. `mobile/src/theme/generated/tokens.ts`: spacing, radius, typography, motion.
3. `mobile/src/theme/generated/default-theme.json`: culorile temei default light, citite de `app.config.ts` pentru config-ul nativ (splash, adaptive icon).
4. `infra/keycloak-theme/src/theme/generated/themes.css`: `:root[data-theme="vitrine"] { --color-background: ...; ... }` pentru fiecare temă, plus `:root { --space-md: ...; --radius-md: ...; ... }` pentru tokenii globali.
5. `infra/keycloak-theme/src/theme/generated/theme-ids.ts`: lista id-urilor valide, default-urile light/dark și `colorScheme`-ul fiecărei teme (pentru `<meta name="color-scheme">`).

Fiecare fișier generat începe cu un header „GENERATED, do not edit, source: packages/design-tokens".

**Verificare etapa A:** `npm run tokens:build` trece. Modifici temporar `textSecondary` în `vitrine` la o valoare slabă și build-ul trebuie să pice cu mesaj clar, apoi revii. `git diff` arată doar fișierele generate așteptate.

---

## 5. Etapele B + C: tema Keycloak (Keycloakify)

### 5.1 Setup

1. Prerechizit: `brew install maven` (comandă dată userului, **inclusiv pe a doua mașină de lucru**). Documentează prerechizitul în `CLAUDE.md` și în README-ul temei. Runner-ele GitHub Ubuntu au Maven preinstalat, dar verifică asta în primul run CI.
2. Pornește de la starter-ul oficial actual `keycloakify/keycloakify-starter` (React). Copiază conținutul în `infra/keycloak-theme/`, **fără** istoricul git al starter-ului. Scoate ce nu folosim: account theme și email theme, dacă starter-ul le include.
3. `doUseDefaultCss={false}`: elimini complet PatternFly. Tot CSS-ul e al nostru și consumă doar `var(--...)` din `generated/themes.css`.
4. Eject (`npx keycloakify eject-page`) pentru `Template.tsx` și pentru paginile atinse de configurația curentă a realm-ului: `login.ftl`, `register.ftl`, `login-reset-password.ftl`, `login-update-password.ftl`, `info.ftl`, `error.ftl`, `logout-confirm.ftl`, `login-page-expired.ftl`. Paginile neejectate trebuie să arate coerent prin `Template` + CSS pe clasele `kc*`. Verifică în Storybook.
5. `npx keycloakify add-story` pentru fiecare pagină ejectată. Fiecare story trebuie să poată fi vizualizat în **fiecare temă**: un decorator Storybook global setează `data-theme` pe `<html>`, cu un selector de temă în toolbar.

### 5.2 Specificație de design pentru paginile de auth

Design read: pagină de autentificare pentru utilizatorii unei aplicații personale de colecții, limbaj trust-first, liniștit, pe un sistem propriu de tokeni. Dial-uri (skill `design-taste-frontend`): `DESIGN_VARIANCE 4`, `MOTION_INTENSITY 2`, `VISUAL_DENSITY 3`.

Context critic: pagina se deschide aproape mereu **în browserul in-app de pe telefon** (`ASWebAuthenticationSession` / Custom Tabs). Proiectezi **mobile-first**.

Layout:

```
telefon (< 768px): fără card                   desktop (≥ 768px): card pe background
┌───────────────────────────┐                   ┌──────────────────────────────────────┐
│ Project                   │  wordmark          │            ┌──────────────────┐      │
│                           │                    │            │ Project          │      │
│ Sign in                   │  titlu pagină      │            │ Sign in          │      │
│                           │                    │            │ …același form…   │      │
│ Email or username         │  label deasupra    │            └──────────────────┘      │
│ [_______________________] │                    └──────────────────────────────────────┘
│ Password                  │
│ [___________________] (o) │  toggle vizibilitate (icon)
│ [ ] Remember me   Forgot password?
│ [        Sign in        ] │  buton primar, full-width, accent
│ No account? Create one    │  link, accent
└───────────────────────────┘
```

- Conținut aliniat la stânga, lățime maximă ~ 26rem, gutter `md`/`lg`. Card doar pe desktop, unde elevația chiar comunică ierarhia.
- Wordmark-ul e text (Geist, semibold). Se ia din `realm.displayName` (setat la „Project" prin `kcadm`). Nu desena logo SVG.
- Un singur accent, identic pe toată pagina: buton primar, linkuri, checkbox (`accent-color: var(--color-accent)`), focus.
- Label deasupra input-ului, eroarea sub input (`kcContext.messagesPerField`), fără placeholder folosit ca label. Alerta globală (ex. credențiale invalide) apare deasupra formularului, pe `dangerSurface` + `danger`.
- Atribute corecte pentru input-uri: `autocomplete="username"` / `current-password` / `new-password`, `autocapitalize="none"`, `spellcheck="false"`, `inputmode="email"` unde e cazul.
- Stare de submit: butonul devine disabled, iar label-ul trece în „Signing in" cu indicator. Previne dublu submit.
- Focus vizibil: `outline: 2px solid var(--color-focus-ring)` + offset, doar pe `:focus-visible`.
- Motion: doar feedback la apăsare (`scale(0.98)`, `fast`) și tranziția focusului. Totul dezactivat sub `prefers-reduced-motion: reduce`.
- Iconuri: **Phosphor** (`@phosphor-icons/react`, verificat `2.1.10`), o singură familie, `weight` consistent, colorate prin `currentColor`. Fără SVG-uri desenate de mână, fără emoji.
- `<meta name="color-scheme">` și `<meta name="theme-color">` setate din tema activă, prin CSS var citit în scriptul de bootstrap (fără literal).
- Copy: tot textul vine din i18n Keycloak (`msg()` / `useI18n`), nu hardcodat, ca activarea română/engleză ulterior să fie gratuită. Sentence case, fără em-dash-uri, fără caps-lock, fără eyebrow deasupra titlului, fără „→" pe butoane.
- Fără branding Keycloak/Red Hat, inclusiv titlul tab-ului.

### 5.3 Aplicarea temei alese în aplicație (fluxul `ui_theme`)

1. Aplicația trimite tema activă în cererea de autorizare: `useAuthRequest({ ..., extraParams: { ui_theme: themeId } })`. Verifică în tipurile `expo-auth-session` din SDK 57 că `extraParams` există pe `AuthRequestConfig`.
2. În `index.html`-ul Keycloakify, un **script inline blocant în `<head>`** (rulează înainte de primul paint, ca să nu apară flash de temă greșită):
   - citește `ui_theme` din `location.search`;
   - îl validează contra listei din `theme-ids.ts` (inline-uită la build). O valoare necunoscută e ignorată;
   - dacă e valid, îl scrie în `sessionStorage` (cheie `project.theme`);
   - altfel citește `sessionStorage`, care acoperă paginile ulterioare (formularul postează la `login-actions/...` fără parametru, verificat empiric);
   - altfel alege default-ul light/dark după `prefers-color-scheme`;
   - setează `document.documentElement.dataset.theme`.
3. Toate accesările `sessionStorage` sunt în `try/catch`, iar pagina trebuie să arate corect și fără storage.
4. Verifică CSP-ul pe care Keycloak îl trimite pentru paginile de login (Realm settings → Security defenses → Headers). Dacă `script-src` blochează scriptul inline, folosește mecanismul Keycloakify/Keycloak pentru nonce sau mută logica la începutul bundle-ului, cu `visibility: hidden` până la setarea temei. Documentează ce ai ales.

### 5.4 Deploy în Keycloak local

1. `infra/docker-compose.yml`: montează jar-ul read-only, de exemplu `./keycloak-theme/dist_keycloak/keycloak-theme-for-kc-all-other-versions.jar:/opt/keycloak/providers/project-theme.jar:ro`. Verifică dacă `start-dev` preia provider-ul la pornire fără `kc.sh build` explicit (în dev mode ar trebui să facă auto-build). Dacă nu, documentează pasul.
2. Setează tema pe realm prin `kcadm` (loginTheme = numele temei din config-ul Keycloakify) și `displayName` = „Project". Pune comenzile exacte într-un script idempotent `infra/keycloak/configure-realm.sh`, ca a doua mașină să le poată rula. Autentificarea `kcadm` se face cu parola din `infra/.env`, **fără** să afișezi parola.
3. `./start`: build-uiește jar-ul **doar** dacă lipsește sau dacă vreun fișier din `infra/keycloak-theme/src` sau `packages/design-tokens/tokens` e mai nou decât jar-ul (`find -newer`). Dacă jar-ul s-a schimbat și containerul rula, repornește doar containerul `keycloak`. Păstrează stilul și log-urile existente din `./start`.
4. Dev loop pentru design: Storybook (fără Keycloak) și `npx keycloakify start-keycloak` pentru test în Keycloak real cu hot reload.

**Verificare etapele B + C:** Storybook arată fiecare pagină ejectată corect în toate cele 3 teme. `curl` pe URL-ul `/auth` (vezi secțiunea 2) întoarce HTML-ul temei noi, nu `keycloak.v2`. Pe telefon (Expo Go), login-ul, parola greșită, reset-ul și register-ul arată toate tema corectă. Parola greșită re-randează pagina în **aceeași** temă (testează fallback-ul pe sessionStorage).

---

## 6. Etapa D: sistemul de teme în aplicația mobilă

### 6.1 Structură

```
mobile/src/theme/
  generated/            # din design-tokens, nu se editează
  index.ts              # re-export: themes, tokens, tipuri
  theme-provider.tsx    # ThemeProvider + hooks
  use-themed-styles.ts  # helper pentru StyleSheet per temă
mobile/src/components/
  themed-text.tsx       # variante din typography, culori din temă
  button.tsx            # primary / secondary / ghost; pressed, disabled, loading
  text-field.tsx        # (dacă devine necesar în app)
  screen.tsx            # container cu background din temă + safe area
mobile/src/app/(app)/settings/theme.tsx   # ecranul de alegere a temei
mobile/src/screens/theme-picker.tsx
```

### 6.2 ThemeProvider

- Stare: `preference: ThemeId | 'system'` (default `'system'`), plus tema rezolvată (`system` înseamnă default light/dark după `useColorScheme()`).
- Persistență: `@react-native-async-storage/async-storage` (instalat cu `npx expo install`, inclus în Expo Go). **Nu** `expo-secure-store`: preferința nu e un secret. Citirea inițială se integrează cu `SplashScreenController` existent, ca splash-ul să stea până se cunosc **și** sesiunea, **și** tema (fără flash).
- Contexte separate: `ThemeContext` (tokeni, se schimbă rar) și `ThemeActionsContext` (`setPreference`, referință stabilă), ca să nu re-randezi consumatorii care doar setează.
- `useThemedStyles(factory)`: factory definit la nivel de modul, `useMemo(() => StyleSheet.create(factory(theme)), [theme])`. Ecranele nu importă niciodată culori direct, doar prin temă.
- Navigație: `ThemeProvider` din `expo-router/react-navigation` (în SDK 56+ **nu** din `@react-navigation/*`), alimentat din tokeni (`colors.primary = accent`, `background`, `card = surface`, `text = textPrimary`, `border`). Header-ele Stack consumă aceleași valori.
- Status bar: `expo-status-bar` cu `style` derivat din `theme.colorScheme`.
- Fundalul root al sistemului: `expo-system-ui` `setBackgroundColorAsync(theme.background)` la schimbarea temei, ca să nu apară flash alb la tranziții. Verifică întâi că e inclus în Expo Go.
- `app.json` → `app.config.ts`, care importă `src/theme/generated/default-theme.json` pentru `android.adaptiveIcon.backgroundColor` și culorile de splash. Astfel dispare literalul `#E6F4FE`. Config-ul nativ nu poate fi schimbat la runtime, deci folosește tema default light. Documentează asta într-un comentariu de o linie.

### 6.3 Migrare și integrare

- `sign-in.tsx` și `home.tsx` trec pe primitive (`Screen`, `ThemedText`, `Button`). Dispare `color: 'red'`, iar eroarea folosește `danger`.
- Ecran nou „Theme": listă cu opțiunea „System" + toate temele din `themes`, **generată din date**, cu previzualizare mică (swatch-uri din tokenii temei). O temă nouă apare automat, fără cod. Evaluează `@expo/ui` pentru rânduri native de tip Settings (skill `expo-ui`): e acceptabil doar dacă îi poți da culorile din tokeni. Altfel folosește primitive proprii.
- Legătura cu Keycloak: `AuthProvider` citește tema rezolvată și o trimite ca `ui_theme` (secțiunea 5.3). Atenție: `useAuthRequest` regenerează request-ul când se schimbă config-ul, deci include `themeId` în memo-ul de config.
- Link către ecranul de temă din `home.tsx`. Ecranul de temă e accesibil doar autentificat; pe ecranul de sign-in se aplică preferința salvată.

**Verificare etapa D:** `npx tsc --noEmit`, `npx expo lint`, `npx expo-doctor` curate. Pe telefon: schimbi tema, UI-ul se actualizează imediat. Închizi și redeschizi aplicația, tema e păstrată. Sign out, apoi Sign in: pagina Keycloak are aceeași temă. „System" urmează dark/light-ul telefonului.

---

## 7. Etapa E: aplicarea regulii „zero culori" (automat, în CI)

1. **Mobile ESLint** (`mobile/eslint.config.js`, flat config):
   - `eslint-plugin-react-native` (verificat `5.0.0`, peer ESLint ≤ 9; verifică ce versiune de ESLint e instalată în `mobile/`) cu `react-native/no-color-literals: error`;
   - `no-restricted-syntax` pentru orice `Literal`/`TemplateLiteral` care se potrivește cu regex-ul de hex/funcții de culoare/nume de culori CSS, cu `ignores` doar pentru `src/theme/generated/**`.
   - Dacă `eslint-plugin-react-native` nu e compatibil cu ESLint-ul curent, `no-restricted-syntax` rămâne suficient. Documentează decizia.
2. **Keycloak theme**: aceleași reguli ESLint pentru TS/TSX, plus **Stylelint** (verificat `17.15.0`): `color-no-hex: true`, `color-named: "never"`, `function-disallowed-list` cu funcțiile de culoare, `ignoreFiles` pentru `src/theme/generated/**`.
3. **Script repo-wide** `scripts/check-color-literals.sh`: grep pe tot repo-ul tracked (`git ls-files`), excluzând `packages/design-tokens/tokens/**`, fișierele generate, asset-urile binare și `node_modules`. Eșuează cu lista fișier:linie.
4. **CI** (după convenția existentă, câte un workflow scopat pe path):
   - `design-tokens-ci.yml`: `tokens:build` + contrast check + `git diff --exit-code` pe fișierele generate + `check-color-literals.sh`;
   - `mobile-ci.yml`: `npm ci`, lint, `tsc --noEmit`, `expo-doctor`;
   - `keycloak-theme-ci.yml`: `npm ci`, lint, stylelint, `build-keycloak-theme`.
   - Declanșare pe PR către `develop` și push pe `develop`, ca workflow-urile existente. Nu devin required checks (convenția curentă).

**Verificare etapa E:** adaugi temporar `color: '#fff'` într-un component: lint și script pică. Adaugi `color: red;` într-un CSS al temei: stylelint pică. Revii la loc.

---

## 8. Etapa F: documentație

- `CLAUDE.md` (rădăcină): regulă fermă nouă în „Reguli de cod" (zero literali de culoare, sursa unică `packages/design-tokens`, cum adaugi o temă), rând nou în tabelul de stack (Keycloakify + Style Dictionary, cu motivarea), structura de foldere actualizată, prerechizitul Maven, backlog actualizat.
- `packages/design-tokens/README.md`: pașii exacți pentru o temă nouă (copiezi un JSON, schimbi `id`/`name`/valori, rulezi `tokens:build`, verifici în Storybook și pe telefon).
- `infra/keycloak-theme/README.md`: dev loop (Storybook, `start-keycloak`), build jar, deploy, `configure-realm.sh`.
- `README.md` (rădăcină): o linie despre teme în secțiunea Status.

---

## 9. Skill-uri de încărcat de agentul care implementează

| Skill | Pentru ce |
|---|---|
| `expo:expo-overview` → `expo:expo-design-system` | structura `src/theme/`, contractul componentelor (variants, sizes, pressed, disabled, loading, accesibilitate), audit de drift, „native slop" |
| `expo:expo-router` | `ThemeProvider` din `expo-router/react-navigation`, ruta de settings, `Stack.Protected` existent |
| `expo:expo-native-ui` | status bar, safe area, detalii de platformă (doar ce nu contrazice regula „totul din tokeni") |
| `expo:expo-ui` | evaluarea `@expo/ui` pentru ecranul de alegere a temei |
| `react-native-best-practices` (sub-skill `svg`) | iconuri cu `currentColor` în mobil, dacă sunt necesare |
| `frontend-design:frontend-design` | proces: plan de tokeni, apoi review contra brief-ului, apoi build și auto-critică cu screenshot-uri |
| `design-taste-frontend` | anti-tells: palete interzise, fără Inter/serif default, fără em-dash-uri, label deasupra input-ului, contrast la formulare și butoane, reduced motion. **Ignoră** default-urile lui de stack (Next.js/Tailwind/Motion): nu se aplică unei teme Keycloakify. Regulile de landing page (hero, bento) nu se aplică unui ecran de auth. |
| `imagegen-frontend-mobile` (opțional) | mockup-uri ale ecranului de login în cele 3 teme, pentru aprobarea userului **înainte** de etapa B, dacă mediul are un tool de generare de imagini |

---

## 10. Capcane cunoscute

- **Issuer LAN IP vs localhost** (vezi `CLAUDE.md`): când testezi pe telefon, `mobile/.env` și `Keycloak:Authority` din `appsettings.Development.json` trebuie pe același host.
- `ui_theme` se pierde după prima pagină Keycloak. Fallback-ul pe `sessionStorage` e obligatoriu, nu opțional.
- Keycloak încarcă provider-ii (jar-urile) la pornire, deci după un build nou al temei e nevoie de restart la container.
- În mobil există un conflict cunoscut de peer dependency pe `react-dom` (opțional, doar web/DOM). Nu îl „repara" schimbând versiunea de React fixată de SDK 57.
- Expo Go: orice pachet nou trebuie să fie în Expo Go. Verifică înainte de instalare.
- Nu folosi `expo-secure-store` pentru preferințe; e rezervat sesiunii de auth.
- Nu hardcoda textul butoanelor în tema Keycloak: folosește `msg()`.

---

## 11. Întrebări deschise pentru user (NU le decide agentul singur)

1. Numele și paletele temelor (`vitrine`, `cellar`, `contrast`) sunt OK sau vrea altele?
2. Înregistrarea e activă în realm, deci tema include pagina de register. Rămâne activă?
3. Limba: rămâne engleza, sau activăm i18n în Keycloak (en + ro) și în aplicație? Tema folosește oricum `msg()`, deci e doar configurare.
4. Instalarea Maven (necesar Keycloakify) pe ambele mașini de lucru e acceptabilă?
5. „Project" e numele afișat (wordmark) sau există un nume real al aplicației?
6. Preferința de temă rămâne doar pe device, sau se sincronizează per user (un viitor serviciu de preferințe)? Planul acoperă doar varianta pe device.

---

## 12. Definition of done

- [ ] `packages/design-tokens` generează toate output-urile. Contrast check trece pentru toate temele.
- [ ] Tema Keycloakify acoperă toate paginile atinse de configurația realm-ului, în toate temele (Storybook + Keycloak real).
- [ ] Tema aleasă în aplicație apare pe pagina Keycloak, inclusiv după o parolă greșită.
- [ ] Aplicația: ThemeProvider, primitive, ecran de alegere a temei, persistență, `app.config.ts` fără literali.
- [ ] `check-color-literals.sh`, ESLint și Stylelint trec, iar un literal introdus intenționat e prins.
- [ ] CI nou (tokens, mobile, keycloak-theme) verde.
- [ ] Testat pe telefon fizic (Expo Go): login, parolă greșită, reset, register, schimbare de temă, repornire aplicație.
- [ ] `CLAUDE.md` și README-urile actualizate.
- [ ] Commit-uri Conventional, fără trailer de atribuire AI. PR către `develop`, fără footer.
