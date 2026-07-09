# Phase 33 — Sanity production verification

## Goal

Verify that the live Vercel website reads blog content from the connected Sanity project.

## Sanity project

```text
Project ID: a3wcdlcy
Dataset: production
```

## Documents already published

Author:

- `Fizioterapia ime`

Categories:

- `Pacientë`
- `AI & Siguri`
- `Pilot`

Posts:

- `/blog/si-funksionon-plani-digjital-i-fizioterapise`
- `/blog/ai-movement-check-feedback-jo-diagnoze`
- `/blog/pilotimi-i-pare-i-fizioterapia-ime`

## CORS origins added

- `https://fizioterapia-ime.vercel.app`
- `http://localhost:3000`

## Code added

- `app/api/sanity/health/route.ts`
- `scripts/smoke-test-sanity-blog.mjs`

## Code updated

- `lib/sanity/client.ts`
- `scripts/verify-route-files.mjs`
- `package.json`

## New smoke command

```bash
npm run smoke:sanity-blog
```

This checks:

- `/api/sanity/health`
- `/blog`
- `/blog/si-funksionon-plani-digjital-i-fizioterapise`
- safety text remains visible

## Full production verification order

```bash
npm install
npm run check:env
npm run preflight:routes
npm run build
vercel deploy --prod
npm run smoke:production
npm run smoke:sanity-blog
```

## Vercel env vars

Make sure these are present in Vercel:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=a3wcdlcy
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-07-09
```

No Sanity token is required for public published blog content.

## Expected result

`/api/sanity/health` should return:

```text
ok: true
status: ready
postCount: 3 or more
projectId: a3wcdlcy
```

`/blog` should show the three Sanity posts.

`/blog/si-funksionon-plani-digjital-i-fizioterapise` should show article content and safety disclaimer.
