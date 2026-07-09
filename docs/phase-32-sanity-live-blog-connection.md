# Phase 32 — Sanity live blog connection

## Goal

Connect `/blog` and `/blog/[slug]` to Sanity.io while keeping static fallback so Vercel build does not break if Sanity env vars are missing.

## Files added

- `lib/sanity/client.ts`
- `lib/sanity/queries.ts`
- `components/PortableContentRenderer.tsx`
- `docs/phase-32-sanity-live-blog-connection.md`

## Files updated

- `package.json`
- `.env.example`
- `scripts/check-env-readiness.mjs`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `docs/sanity-integration-plan.md`

## Dependencies added

```json
{
  "next-sanity": "latest",
  "@portabletext/react": "latest"
}
```

## Environment variables

Add to Vercel:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-07-09
```

No token is required for public published content.

If preview/drafts are added later, use a server-only token:

```bash
SANITY_API_READ_TOKEN=
```

Do not expose that token in frontend or mobile.

## Current behavior

### If Sanity env vars are present

- `/blog` fetches posts from Sanity.
- `/blog/[slug]` fetches one post from Sanity.
- Portable Text body is rendered with `PortableContentRenderer`.

### If Sanity env vars are missing

- `/blog` uses static fallback from `lib/blog-content.ts`.
- `/blog/[slug]` uses static fallback from `lib/blog-content.ts`.
- Vercel build still passes.

## Commands

```bash
npm install
npm run check:env
npm run preflight:routes
npm run build
npm run smoke:production
```

## Studio commands

```bash
npm run studio:dev
npm run studio:build
npm run studio:deploy
```

## Safety preserved

Every blog post still shows safety text:

- AI is feedback only.
- AI does not diagnose.
- AI does not replace physiotherapist.
- Pain 7/10 or higher means stop and contact physiotherapist.

## Next step

Create the first real Sanity post in Studio with slug:

```text
si-funksionon-plani-digjital-i-fizioterapise
```

Then deploy and run smoke tests.
