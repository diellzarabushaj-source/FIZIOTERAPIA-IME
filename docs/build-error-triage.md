# Build error triage — Fizioterapia ime

Use this when Codex, GitHub Actions, local build, or Vercel returns errors.

## First command

```bash
npm run build
```

If it fails, copy the exact output into a GitHub issue using:

- `.github/ISSUE_TEMPLATE/build-blocker.yml`

## Triage order

### 1. TypeScript compile errors

Most likely files after latest phases:

- `app/pilot-launch/page.tsx`
- `app/patient-handout/page.tsx`
- `app/pilot-feedback/page.tsx`
- `app/pilot-feedback/actions.ts`
- `app/admin-feedback/page.tsx`
- `app/admin-feedback/actions.ts`
- `app/pilot-decision/page.tsx`
- `components/SiteFooter.tsx`

Fix only the failing file and preserve product rules.

### 2. Server/client boundary errors

Watch for:

- event handlers in server components
- browser APIs in server components
- `window` or `document` used without client boundary
- server action imported into a client component incorrectly

Fix approach:

- remove browser-only code from server components
- use plain links/buttons where possible
- add `"use client"` only when required
- keep server actions server-only

### 3. Supabase/env errors

Build should not require real Supabase data at compile time.

If build fails because env vars are missing:

- check `lib/supabase-admin.ts`
- check server pages that call Supabase
- use safe fallback UI when admin env vars are missing

Do not put real keys in GitHub.

### 4. Route 404 after deployment

If route files exist but production returns 404:

- Vercel is likely serving an older deployment
- trigger fresh deployment
- verify latest commit SHA in Vercel
- rerun `npm run smoke:production`

### 5. Footer route mismatch

If footer links return 404:

- check `components/SiteFooter.tsx`
- confirm matching `app/<route>/page.tsx` exists
- public footer links should not point to missing routes

## Product rules that must not be changed

- price stays 9.90 EUR/month
- manual/local-bank billing stays MVP
- patient login stays username + code
- patient cannot create own plan
- AI is feedback only
- AI does not diagnose
- AI does not replace physiotherapist
- pain 7/10 means stop and contact physiotherapist
- camera video is not stored
- no secrets in GitHub

## When build passes

Run:

```bash
npm run smoke:production
```

After Vercel deploy is fresh.
