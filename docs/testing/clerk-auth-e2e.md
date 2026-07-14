# Clerk authenticated E2E

Ky test verifikon rrjedhën reale të autentikimit dhe ridrejtimit sipas rolit:

- `owner` hyn dhe dërgohet te `/admin-dashboard`.
- `physio` hyn dhe dërgohet te `/physiotherapist-portal/overview`.
- pas sign-out, një faqe e mbrojtur e kthen përdoruesin te `/sign-in`.

## Modeli i sigurisë

Workflow-i `.github/workflows/clerk-auth-e2e.yml` ekzekutohet vetëm me `workflow_dispatch`.
Ai nuk ekzekutohet në `pull_request` ose `pull_request_target`, sepse testet e autentikuara kërkojnë Clerk secret key dhe përdorues testues.

Përdor vetëm një Clerk development/test instance dhe llogari të dedikuara për automatizim. Mos përdor llogari personale, pacientë realë ose të dhëna klinike reale.

## Parakushtet

Krijo dy përdorues testues në të njëjtën Clerk instance që përdor deployment-i i testuar:

1. Një përdorues `owner`.
2. Një përdorues `physio`.

Në Supabase, të dy email-et duhet të kenë profile aktive:

- owner: `role = owner`, `status = active`;
- fizioterapist: `role = physio`, `status = active`.

Profilet duhet të lidhen vetëm me test data. Dashboard-i i fizioterapistit mund të jetë bosh; testi verifikon autorizimin, redirect-in dhe shell-in e dashboard-it, jo të dhëna pacientësh.

## GitHub repository secrets

Shto këto secrets te repository settings:

- `E2E_CLERK_PUBLISHABLE_KEY`
- `E2E_CLERK_SECRET_KEY`
- `E2E_CLERK_OWNER_EMAIL`
- `E2E_CLERK_PHYSIO_EMAIL`

Clerk keys duhet t'i përkasin së njëjtës instance si përdoruesit testues dhe deployment-i i testuar.

## Ekzekutimi

1. Hape GitHub Actions.
2. Zgjidh `Clerk Authenticated E2E`.
3. Zgjidh `Run workflow`.
4. Lëre production URL-në e parazgjedhur ose vendos një HTTPS preview/staging URL.
5. Kontrollo raportin `playwright-report-clerk` në artifacts.

## Ekzekutimi lokal

Instalo përkohësisht mjetet e testimit pa ndryshuar lockfile-in:

```bash
npm install --no-save --package-lock=false @playwright/test@1.55.0 @clerk/testing@1.9.2
npx playwright install chromium
```

Pastaj vendos environment variables dhe ekzekuto:

```bash
npm run test:e2e:clerk
```

Mos ruaj Clerk secret key ose email-et testuese në `.env.example`, source code, screenshots apo Playwright artifacts.
