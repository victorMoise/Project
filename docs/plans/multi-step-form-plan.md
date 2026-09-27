# Plan de implementare: formulare multi-step reutilizabile (wizard la adăugare, pagină unică la editare)

> Destinatar: agentul care implementează. Citește tot documentul înainte de prima modificare.
> Redactat: 2026-09-27. Stare repo la redactare: `develop` la `c375cae` (PR #25, `feature/mobile-module-structure`, mergiuit).

---

## 0. Obiectiv

1. Formularele de **adăugare** din `mobile/` devin **wizard-uri multi-step**: câte o întrebare/grup mic de câmpuri pe ecran (ex. „How should this collection be called?"), apoi pași cu informații opționale.
2. Utilizatorul vede **mereu** câți pași sunt și la care se află.
3. Experiența are **feedback fizic**: tranziții animate între pași, haptics la avansare/eroare/succes.
4. Un câmp obligatoriu necompletat este **evidențiat clar** (chenar + mesaj + shake + focus), iar wizard-ul nu avansează.
5. Totul e construit ca **componente reutilizabile generice** în `src/components/`: un formular nou = o **configurare** (schemă de validare + listă de pași/câmpuri), fără cod de UI nou.
6. Formularele de **editare** folosesc **aceeași configurare**, dar randată pe **o singură pagină** (toate câmpurile, grupate pe secțiuni). Wizard-ul este **doar** la adăugare.
7. Backend-ul capătă câmpurile care lipsesc ca pașii opționali să aibă ce conține: `Collection.Description` și `EstimatedValue` settabil pe `Item`.

---

## 1. Reguli ferme (nenegociabile)

| Regulă | Detaliu |
|---|---|
| Decizii luate cu userul | (a) Backend-ul se face **primul**. (b) Editarea = pagină unică, wizard **doar** la add. (c) Se folosesc librării mature care au deja funcționalitatea (`react-hook-form`, `zod`, `react-native-reanimated`, `expo-haptics`). **Nu** reimplementa validare/stare de formular/animații de mână. Nu renegocia. |
| `CLAUDE.md` de la rădăcină | Toate „Reguli de cod" se aplică: identificatori și mesaje în engleză, cod self-documenting fără comentarii inutile, CQRS/MediatR, FluentValidation pentru comenzi, `dotnet add package` (nu editezi XML), migrații create manual cu `dotnet ef migrations add` și aplicate automat la pornire (nu rula `dotnet ef database update`). Folosește proactiv skill-urile `dotnet-skills` pentru codul .NET. |
| `mobile/AGENTS.md` | Expo SDK 57: verifică API-urile în documentația versionată (`https://docs.expo.dev/versions/v57.0.0/`), nu din memorie. Instalezi **doar** cu `npx expo install`. Rulezi `npx tsc --noEmit` și `npx expo lint` înainte să declari ceva terminat. |
| Expo Go compatibil | `mobile/` trebuie să ruleze în continuare în Expo Go. Toate dependențele din acest plan sunt incluse în Expo Go sau sunt JS pur. Verifică înainte de instalare. Dacă ceva nu e, te oprești și întrebi userul, nu faci development build. |
| Zero literali de culoare | Orice culoare vine din `useTheme().colors.*` (inclusiv bara de progres, shake, stări de eroare). `scripts/check-color-literals.sh` trebuie să treacă. |
| Structura pe module | Componentele wizard-ului sunt **generice** → `mobile/src/components/form/`. Orice lucru care știe de colecții/itemi (ex. `CollectionPicker`, configurările concrete) rămâne în `mobile/src/modules/collections/`. Wizard-ul nu importă nimic din `modules/`. |
| Git | Două branch-uri separate, fiecare din `develop`: `feature/collection-description-estimated-value` (backend) și, după merge-ul lui, `feature/mobile-form-wizard` (mobil). Conventional Commits. **Fără** trailer `Co-Authored-By` în commit-uri și **fără** footer „Generated with Claude Code" în PR-uri (preferință explicită a userului). Faci push la branch; PR și merge doar dacă userul cere. |
| Comunicare | Userul are 5+ ani experiență. Comenzile de terminal pe care i le dai se dau una câte una. Discuția e în română, codul în engleză. |

---

## 2. Stare curentă (verificată la 2026-09-27)

### Backend (`services/collections-service`)
- `Domain/Entities/Collection.cs`: doar `Id`, `Name`, `OwnerId`. Metoda de modificare e `UpdateName(string name)`. **Nu există `Description`.**
- `Domain/Entities/Item.cs`: `EstimatedValue` (`decimal?`) există ca proprietate și coloană în DB, dar se setează doar prin `UpdateEstimatedValue(decimal)`, care **nu e apelată nicăieri** (verificat cu grep). `CreateItemCommand`/`UpdateItemCommand` **nu** au `EstimatedValue`, deci valoarea nu poate fi setată din API. `ItemDto` o returnează deja.
- `CollectionDto` = `record CollectionDto(int Id, string Name)`.
- `CollectionsDbContext.OnModelCreating`: `Item.Name` 200, `Item.Description` 1000, `Collection.Name` 200.
- Ultima migrare: `20260829194935_AddColumnLengthConstraints`.
- Validatori: `Create/UpdateCollectionCommandValidator` (Name `NotEmpty().MaximumLength(200)`), `Create/UpdateItemCommandValidator` (Name, Description 1000, PurchasePrice ≥ 0, `CollectionId` MustAsync).

### Mobil (`mobile/`)
- Dependențe relevante **lipsă**: `react-native-reanimated`, `react-native-worklets`, `expo-haptics`, `react-hook-form`, `zod`, `@hookform/resolvers`.
- `src/modules/collections/screens/collection-form.tsx`: doar create, un câmp (`name`), validare manuală, `useState`.
- `src/modules/collections/screens/item-form.tsx`: create + edit pe aceeași pagină. Validare manuală în `validate()`, map manual `SERVER_ERROR_FIELD_MAP`, `Alert.alert` pentru erori non-câmp, buton Delete la editare. `ItemForm` face deja gating pe loading/error/not-found înainte de `ItemFormBody` (păstrează acest pattern).
- Rute: `src/app/(app)/collections/new.tsx` (modal), `items/new.tsx` (modal, acceptă `?collectionId=`), `items/[id].tsx` (edit). Titlurile sunt în `src/app/(app)/_layout.tsx`.
- **Nu există ecran de editare pentru colecții**: `useUpdateCollectionMutation` e definit, dar nefolosit. Rămâne out of scope (vezi §9).
- Primitive existente, refolosite: `TextField` (label, `error` → chenar `danger` 2px + mesaj), `DateField`, `Button` (`primary`/`secondary`/`ghost`, `loading`), `Screen`, `ThemedText` (variante `display`/`title`/`body`/`label`/`caption`, `color` = cheie de temă).
- Token-uri: `motion.fast` = 150, `motion.base` = 250. Culori disponibile: `background`, `surface`, `surfaceRaised`, `border`, `inputBorder`, `textPrimary`, `textSecondary`, `accent`, `accentPressed`, `textOnAccent`, `focusRing`, `danger`, `dangerSurface`, `success`, `successSurface`, `shadow`, `overlay`.
- Tipurile TS ale API-ului: `src/modules/collections/api/types.ts`.
- Textele din UI ale aplicației sunt în engleză. Păstrează.

---

## 3. Faza A: backend (`feature/collection-description-estimated-value`)

### A.1 `Collection.Description`
1. **Domain** (`Collection.cs`):
   - Adaugi `public string? Description { get; private set; }`.
   - Constructorul devine `Collection(string name, Guid ownerId, string? description = null)`.
   - Înlocuiești `UpdateName(string name)` cu `UpdateDetails(string name, string? description)`. Actualizează singurul apelant (`UpdateCollectionHandler`).
   - Validarea rămâne în `EnsureValid` (name non-empty). Lungimea e treaba validatorului și a DB-ului, ca la `Item`.
2. **Application**:
   - `CreateCollectionCommand(string Name, string? Description = null)` și `UpdateCollectionCommand(... , string? Description = null)`. Păstrează forma existentă a lui `UpdateCollectionCommand` (verifică cum primește `Id`).
   - Ambii validatori: `RuleFor(x => x.Description).MaximumLength(1000);`.
   - `CollectionDto(int Id, string Name, string? Description)`. Actualizează proiecțiile din `ListCollectionsHandler` și `GetCollectionByIdHandler`.
   - Handler-ele de create/update transmit `Description`.
3. **Infrastructure**: `entity.Property(collection => collection.Description).HasMaxLength(1000);` în `OnModelCreating`.
4. **Migrare**: `dotnet ef migrations add AddCollectionDescription` (din folderul soluției, cu project/startup-project corecte, la fel ca migrațiile anterioare). Verifică în fișierul generat că e **doar** un `AddColumn` nullable `character varying(1000)`.

### A.2 `Item.EstimatedValue` settabil
1. **Domain** (`Item.cs`):
   - Constructorul și `UpdateDetails` primesc `decimal? estimatedValue = null` (ultimul parametru opțional).
   - Validarea `estimatedValue >= 0` (când are valoare) se mută în `EnsureValid`, cu mesajul existent `"Value cannot be negative"`.
   - **Șterge** `UpdateEstimatedValue` (e nefolosită și devine redundantă).
2. **Application**:
   - `CreateItemCommand` și `UpdateItemCommand` capătă `decimal? EstimatedValue = null`.
   - Ambii validatori: `RuleFor(x => x.EstimatedValue).GreaterThanOrEqualTo(0).When(x => x.EstimatedValue.HasValue);`.
   - Handler-ele transmit valoarea. Folosește argumente numite la apelul constructorului / `UpdateDetails`, sunt deja mulți parametri opționali.
   - Semantica PUT rămâne înlocuire completă: `EstimatedValue` omis la update = `null` (șters). Clientul mobil trimite valoarea existentă la editare (vezi Faza D).
3. **Fără migrare** pentru `Item`: coloana există deja.

### A.3 Verificare backend
- `dotnet build` pe soluție, fără warning-uri noi. Hook-ul `slopwatch` rulează automat după fiecare edit; rezolvă ce raportează.
- Dacă stack-ul local e pornit (Docker cu Postgres + Keycloak), pornești serviciul și verifici cu un JWT de la clientul `dev-testing`:
  - `POST /api/collections` cu și fără `description` → 201; `GET` îl returnează.
  - `description` > 1000 caractere → 400 structurat pe câmpul `Description`.
  - `POST /api/items` cu `estimatedValue` → `GET` îl returnează; `estimatedValue: -1` → 400 pe `EstimatedValue`.
  - `PUT /api/items/{id}` fără `estimatedValue` → devine `null`.
  - Dacă stack-ul nu e pornit, spune-i userului exact ce n-ai putut rula. Nu declara testat ce n-ai testat.
- Spune-i userului ce request-uri din colecția Postman `Project` (folderul collections-service) trebuie actualizate cu câmpurile noi. Postman îl întreține el.
- Actualizează `CLAUDE.md` (descrierea entității `Collection` și menționarea `EstimatedValue` settabil).
- Commit-uri, de exemplu: `feat(collections-service): add optional description to collections`, `feat(collections-service): allow setting estimated value on items`.

---

## 4. Faza B: mobil, fundația (`feature/mobile-form-wizard`, din `develop` după merge-ul Fazei A)

### B.1 Dependențe
Instalezi cu `npx expo install` (rezolvă versiunile compatibile cu SDK 57):
- `react-native-reanimated` + `react-native-worklets`. Verifică în docs-ul Reanimated/Expo SDK 57 dacă mai e nevoie de configurare Babel. Cu `babel-preset-expo` de obicei nu mai e; nu adăuga plugin-uri din memorie.
- `expo-haptics`
- `react-hook-form`, `zod`, `@hookform/resolvers`. Verifică explicit că versiunea de `@hookform/resolvers` instalată suportă major-ul de `zod` instalat (`zodResolver` din `@hookform/resolvers/zod`).

Apoi `npx expo-doctor`. Dacă apare un conflict de peer dependencies, investighezi și documentezi cauza în commit, nu îl ascunzi.

### B.2 Tipuri API (`src/modules/collections/api/types.ts`)
- `CollectionDto.description: string | null`
- `CreateCollectionCommand` / `UpdateCollectionCommand`: `description: string | null`
- `CreateItemCommand` (și deci `UpdateItemCommand`): `estimatedValue: number | null`

### B.3 `src/utils/haptics.ts`
Wrapper subțire peste `expo-haptics`, cu intenții semantice, nu cu API-ul brut:
- `haptics.stepForward()`: `selectionAsync`
- `haptics.invalid()`: `notificationAsync(Error)`
- `haptics.success()`: `notificationAsync(Success)`

No-op pe web (`process.env.EXPO_OS === 'web'`). Promisiunile se ignoră explicit cu `void` și nu aruncă niciodată (haptics nu trebuie să poată strica un submit).

### B.4 Ajustări la primitive
- `TextField`:
  - acceptă `ref` (React 19: `ref` ca prop, `Ref<TextInput>`), necesar pentru `setFocus` din react-hook-form;
  - acceptă `optional?: boolean`, care afișează un tag discret „Optional" lângă label.
  - **Convenție:** marcăm câmpurile *opționale*, nu pe cele obligatorii (mai puțin zgomot vizual). Câmpurile obligatorii se evidențiază la eroare.
  - Label-ul accesibil include „optional" când e cazul.
- `DateField`: acceptă `error?: string` (afișat la fel ca în `TextField`), ca să poată fi randat uniform de renderer.
- `src/components/form/use-shake.ts`: hook Reanimated care expune `animatedStyle` + `shake()` (secvență scurtă `translateX`, durată totală ≈ `motion.base`), respectând Reduce Motion (`ReduceMotion.System` sau `useReducedMotion()`; când e activ, **nu** mișcă nimic, eroarea rămâne comunicată prin culoare + text + haptic).

---

## 5. Faza C: componentele generice (`src/components/form/`)

### C.1 API-ul de configurare (`form-config.ts`)
Un formular se descrie complet prin date. Formă orientativă (ajustează tipurile ca să iasă inferență bună, fără `any`):

```ts
type FieldConfig<TValues> =
  | { name: Path<TValues>; kind: 'text' | 'multiline' | 'decimal'; label: string; placeholder?: string; optional?: boolean }
  | { name: Path<TValues>; kind: 'date'; label: string }
  | { name: Path<TValues>; kind: 'custom'; label?: string; optional?: boolean;
      render: (field: { value: unknown; onChange: (value: unknown) => void; error?: string }) => ReactNode };

type StepConfig<TValues> = {
  id: string;
  title: string;          // question shown in the wizard, e.g. "How should this collection be called?"
  sectionTitle: string;   // short heading shown on the single-page edit form, e.g. "Details"
  description?: string;
  optional?: boolean;
  fields: FieldConfig<TValues>[];
};

type FormConfig<TSchema extends ZodType> = {
  schema: TSchema;
  steps: StepConfig<z.input<TSchema>>[];
  submitLabel: string;
};

export function defineForm<TSchema extends ZodType>(config: FormConfig<TSchema>) { return config; }
```

Principii:
- **Schema zod e sursa unică a validării** pe client (required, lungimi, număr ≥ 0). Valorile din formular sunt forma de *input* (`z.input`, ex. prețul ca string din `TextInput`), iar `onSubmit` primește forma *output* transformată de zod (ex. `number`, `null` pentru string gol). Folosește generics-urile `useForm<Input, unknown, Output>` + `zodResolver`, nu conversii manuale în ecrane.
- Limitele (200 / 1000 / ≥ 0) oglindesc exact validatorii FluentValidation din backend.
- `kind: 'custom'` e singurul punct de extensie. Prin el intră componente specifice modulelor (`CollectionPicker`) fără ca `components/form` să le cunoască.
- **Invariant verificat în dev**: fiecare cheie din schemă apare în exact un pas. Un `console.warn` / assert doar în `__DEV__` e suficient.

### C.2 Piese interne
| Fișier | Responsabilitate |
|---|---|
| `use-configured-form.ts` | `useForm` + `zodResolver`, `defaultValues`, mode `onTouched`. Returnează și helper-e: `fieldsOfStep(index)`, `stepOfField(name)`. |
| `field-renderer.tsx` | Mapează `kind` → `TextField` / `TextField multiline` / `TextField keyboardType="decimal-pad"` / `DateField` / `render()`, prin `Controller`. Înfășoară fiecare câmp în `Animated.View` cu `use-shake` și expune un `shake()` per câmp către wizard (registry prin ref/map, nu re-render global). Afișează eroarea din `fieldState.error` și pentru câmpurile `custom`. Șterge eroarea de server a câmpului la editare (comportamentul actual din `item-form`). |
| `step-indicator.tsx` | Bară segmentată, un segment per pas: completat = `accent`, curent = `accent` (umplere animată `withTiming(motion.base)`), viitor = `border`. Sub ea: „Step 2 of 4" (`caption`, `textSecondary`, `fontVariant: ['tabular-nums']`) + tag „Optional" dacă pasul curent e opțional. `accessibilityRole="progressbar"` + `accessibilityValue={{ min: 1, max: n, now: i + 1 }}` + label „Step 2 of 4". |
| `form-footer.tsx` | Rând fix jos, **în afara** `ScrollView`, dar în `KeyboardAvoidingView` (butonul principal nu stă niciodată sub tastatură). Wizard: `Back` (`secondary`, ascuns la pasul 1) + principal: `Next` / `Skip` (pas opțional cu toate câmpurile goale) / `submitLabel` (ultimul pas, cu `loading`). Pagină unică: `submitLabel` + slot `children` pentru acțiuni extra (Delete). |
| `server-errors.ts` | `applyServerErrors(error, setError, fieldNames)`: dacă e `ApiError` cu `problem.errors`, convertește cheile PascalCase → camelCase (`PurchasePrice` → `purchasePrice`), aplică `setError` pentru cheile cunoscute și returnează lista câmpurilor afectate + un mesaj general pentru cheile necunoscute / erorile fără câmp. Înlocuiește `SERVER_ERROR_FIELD_MAP`. |

### C.3 `FormWizard` (adăugare)
Props: `config`, `defaultValues`, `onSubmit: (values: Output) => Promise<unknown>` (ecranul pasează `mutateAsync`), `onSuccess: () => void` (de obicei `router.back()`).

Comportament:
1. **Next**: `await trigger(fieldsOfStep(current))`.
   - **Invalid**: `haptics.invalid()`, `shake()` pe fiecare câmp invalid, `setFocus` pe primul câmp invalid focusabil. Pasul nu se schimbă.
   - **Valid**: `haptics.stepForward()`, pasul avansează.
2. **Tranziție**: conținutul pasului e un `Animated.View` cu `key={step.id}`:
   - înainte: `entering` din dreapta, `exiting` spre stânga (durată `motion.base`);
   - înapoi: direcțiile inversate;
   - Reduce Motion → fade simplu, fără slide;
   - containerul are `overflow: 'hidden'` ca să nu se vadă cele două pași suprapuși în afara zonei.
3. **Focus**: la intrarea într-un pas, primul câmp text primește focus (echivalentul `autoFocus` de acum), fără să redeschidă tastatura dacă pasul nu are câmpuri text.
4. **Submit** (ultimul pas): `handleSubmit`.
   - Butonul e `loading`/disabled cât timp `isSubmitting` (fără submit dublu).
   - **Succes**: `haptics.success()` → `onSuccess()`.
   - **Eroare de validare de la server**: `applyServerErrors` → wizard-ul sare la **cel mai mic** index de pas care conține un câmp cu eroare (animat înapoi), `haptics.invalid()`, shake pe câmpurile respective.
   - **Eroare fără câmp** (rețea, 500): mesaj inline deasupra footer-ului (`danger`, `selectable`), draft păstrat, butonul redevine activ pentru retry. **Nu** `Alert`, **nu** se închide formularul.
5. **Navigare înapoi**:
   - Android hardware back la pasul > 1 → pasul anterior (`BackHandler`, cu cleanup);
   - la pasul 1, sau la dismiss-ul modalului / swipe-down pe iOS, cu `isDirty` și fără submit reușit → confirmare „Discard changes?" (`Alert` nativ cu `Keep editing` / `Discard` destructive; e acțiune consecventă, deci alertă nativă e corectă aici).
   - Implementează cu `usePreventRemove` importat din `expo-router/react-navigation` (în SDK 56+ nu se importă direct din `@react-navigation/*`); verifică în docs-ul SDK 57.
   - Testează empiric pe iOS dacă swipe-down-ul modalului e interceptat. Dacă nu e, raportează-i userului, nu improviza (ex. nu dezactiva gesture-ul fără să-i spui).
6. Layout: `Screen edges={['bottom']}` → `KeyboardAvoidingView` → `StepIndicator` (sus, fix) → `ScrollView` (`keyboardShouldPersistTaps="handled"`, padding/gap din `spacing`) cu titlul pasului (`ThemedText variant="title"`), descrierea (`body`, `textSecondary`) și câmpurile → `FormFooter`. Titlul ecranului rămâne în header-ul Stack.

### C.4 `FormPage` (editare)
Aceleași props + `children` pentru acțiuni extra în footer.
- Randează **toate** pașii ca secțiuni pe o singură pagină: `sectionTitle` ca heading de secțiune (`label`, `textSecondary`), câmpurile dedesubt. Fără indicator de pași, fără animații de tranziție.
- Validarea e pe tot formularul la submit.
  - **Invalid**: haptic + shake + focus pe primul câmp invalid, plus scroll până la el (măsoară poziția câmpului prin `onLayout` și `scrollTo`).
- Erorile de server și erorile fără câmp se tratează identic cu wizard-ul (fără salt de pas, doar scroll la primul câmp).
- Guard-ul „Discard changes?" se aplică și aici.

### C.5 Export
`src/components/form/index.ts` exportă doar API-ul public: `defineForm`, `FormWizard`, `FormPage` și tipurile de config. Piesele interne nu se importă din afară.

---

## 6. Faza D: migrarea formularelor existente

Configurările stau în modulul care le deține (`src/modules/collections/...`), lângă ecranul care le folosește sau într-un fișier dedicat în `screens/`. **Nu** crea subfoldere noi în modul fără să actualizezi convenția din `CLAUDE.md`.

### D.1 Colecție: `collection-form.tsx` (doar add)
- Pas 1 `name`:
  - titlu „How should this collection be called?", `sectionTitle` „Name";
  - câmp `name` (text, placeholder „e.g. Vintage wines"), required, trim, max 200.
- Pas 2 `details`, `optional: true`:
  - titlu „Anything worth noting about it?", `sectionTitle` „Details";
  - câmp `description` (multiline, optional, max 1000; string gol → `null` la output).
- `onSubmit` → `createCollection.mutateAsync(values)`, `onSuccess` → `router.back()`.

### D.2 Item: `item-form.tsx`
Config comună pentru add și edit:
1. `name`: „What did you add?" / „Name": `name` (required, max 200, placeholder „e.g. 1998 Barolo Riserva").
2. `purchase`: „What did you pay for it?" / „Purchase": `purchasePrice` (decimal, required, ≥ 0), `purchaseDate` (date, default azi).
3. `collection`: „Where does it belong?" / „Collection": `collectionId` (`custom`, randează `CollectionPicker`; valoarea `null` = Uncategorized e validă, deci nu e marcat opțional și nu blochează).
4. `details`, `optional: true`: „Anything else?" / „Details": `description` (multiline, max 1000), `estimatedValue` (decimal, optional, ≥ 0; gol → `null`).

Ecrane:
- **Add** (`items/new`): `FormWizard`, `defaultValues` cu `collectionId = initialCollectionId` (din `?collectionId=`), `purchaseDate = new Date()`.
- **Edit** (`items/[id]`): `FormPage`, `defaultValues` din item-ul existent (inclusiv `estimatedValue`), `submitLabel` „Save changes", buton `Delete item` (`ghost`) ca `children`, cu confirmarea existentă.
- Păstrezi gating-ul existent din `ItemForm` (loading / error / not found) și `key={itemId ?? 'new'}`.
- Command-ul trimis la update include mereu `estimatedValue` (semantică PUT, vezi A.2).
- Șterge `validate()`, `SERVER_ERROR_FIELD_MAP`, `useState`-urile per câmp și `Alert.alert('Could not save', ...)`; le înlocuiesc schema zod și componentele generice.

### D.3 Documentație
- `CLAUDE.md`: regulă nouă în „Reguli de cod": *orice formular nou de adăugare se descrie ca config `defineForm` și se randează cu `FormWizard`; editarea folosește aceeași config cu `FormPage`; validarea client stă în schema zod și oglindește validatorul FluentValidation.*
- Backlog: intrare nouă „Formulare multi-step", marcată făcută, cu data.
- Un `README.md` scurt în `src/components/form/` cu un exemplu minimal de config (userul va adăuga formulare noi pe baza lui).

---

## 7. Verificare (înainte de a declara gata)

Automat, toate trebuie să treacă:
- `cd mobile && npx tsc --noEmit`
- `cd mobile && npx expo lint`
- `cd mobile && npx expo-doctor`
- `./scripts/check-color-literals.sh` (de la rădăcină)
- backend: `dotnet build` pe soluția `collections-service`

Manual, pe iOS Simulator; haptics doar pe telefon fizic, vezi gotcha-ul de host LAN din `CLAUDE.md`. Parcurge și raportează explicit ce ai rulat și ce nu:
1. Add colecție: Next cu nume gol → chenar roșu + mesaj + shake + (pe device) haptic, nu avansează. Completezi → pasul 2 cu slide, indicator „Step 2 of 2" + „Optional", buton `Skip`. Submit → modal închis, colecția apare în listă cu descrierea salvată (verifică prin `GET`).
2. Add item din ecranul unei colecții: colecția e preselectată la pasul 3. Back din pasul 3 → pasul 2 cu valorile păstrate, slide invers.
3. Eroare de server: oprește gateway-ul/serviciul, submit → mesaj inline, draft păstrat. Repornești, retry → succes.
4. Eroare de validare de la server pe un câmp dintr-un pas anterior (ex. forțezi temporar o valoare pe care doar serverul o respinge, ori testezi cu `CollectionId` inexistent) → wizard-ul sare la pasul câmpului, cu eroarea afișată.
5. Dismiss al modalului cu date completate → „Discard changes?". Fără date → se închide direct.
6. Edit item: o singură pagină cu secțiuni, `estimatedValue` precompletat, Save → 204, lista reflectă modificarea. Save cu nume gol → scroll + focus pe câmp.
7. Reduce Motion activat (Settings → Accessibility): fără slide/shake, doar fade; erorile rămân vizibile.
8. Text mare (Dynamic Type la maxim): footer-ul și butonul principal rămân accesibile, titlurile se împart pe rânduri.
9. Cel puțin două teme diferite (una light, una dark): bara de progres și stările de eroare folosesc culorile temei.

---

## 8. Livrare

- Faza A: commit-uri pe `feature/collection-description-estimated-value`, push, apoi te oprești și îi spui userului că backend-ul e gata de PR/merge. Faza B–D pornește **după** ce userul confirmă merge-ul în `develop`.
- Fazele B–D: commit-uri logice separate pe `feature/mobile-form-wizard` (dependențe + primitive, componente generice, migrare colecție, migrare item, docs), push.
- Commit-uri Conventional Commits, fără `Co-Authored-By`. PR doar dacă userul cere, fără footer de atribuire.

---

## 9. Out of scope (nu face fără cerere explicită)

- Ecran de editare pentru colecții (nu există azi; config-ul din D.1 îl va putea randa cu `FormPage` când va fi cerut).
- Afișarea `estimatedValue` / `description` în listele existente.
- `react-native-keyboard-controller` sau alt înlocuitor pentru `KeyboardAvoidingView`.
- Persistarea draft-ului între sesiuni (AsyncStorage) și salvarea automată.
- Teste automate UI (folderul `tests/` e încă gol; e o discuție separată).
- Orice modificare la Gateway, Keycloak sau design tokens. Dacă ai nevoie de un token de motion nou, întreabă întâi; `fast`/`base` ar trebui să ajungă.
