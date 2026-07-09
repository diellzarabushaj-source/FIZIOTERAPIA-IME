# Phase 31 — Blog routes and Sanity Studio module

## Goal

Add `/blog` and `/blog/[slug]` routes without breaking Vercel web build, and add Sanity Studio as a separate module for later content editing.

## Web routes added

- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`

## Blog content module

- `lib/blog-content.ts`

The current web blog uses static content so the public website can build safely without Sanity dependencies.

## Sanity Studio module added

- `apps/studio/package.json`
- `apps/studio/sanity.config.ts`
- `apps/studio/sanity.cli.ts`
- `apps/studio/schemaTypes/index.ts`
- `apps/studio/schemaTypes/post.ts`
- `apps/studio/schemaTypes/author.ts`
- `apps/studio/schemaTypes/category.ts`
- `apps/studio/schemaTypes/blockContent.ts`
- `apps/studio/.env.example`
- `apps/studio/tsconfig.json`
- `apps/studio/README.md`

## Build safety

These were updated so Studio does not break the main Vercel web build:

- `.vercelignore` excludes `apps/studio`
- root `tsconfig.json` excludes `apps/studio`
- root package scripts run Studio only when explicitly called

## Root scripts added

```bash
npm run studio:dev
npm run studio:build
npm run studio:deploy
```

## Route checks updated

- `npm run preflight:routes` now includes `/blog`
- `npm run smoke:production` now includes `/blog` and a sample `/blog/[slug]`
- footer now links to `/blog`

## Next step after pilot

After pilot-freeze, connect the blog routes to Sanity client queries and replace `lib/blog-content.ts` with live Sanity data.

Do not do this before the pilot unless it is explicitly required, because the current static setup is safer for Vercel build stability.
