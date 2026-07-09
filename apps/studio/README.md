# Fizioterapia ime Sanity Studio

This Studio is a separate module for future blog editing.

It is intentionally excluded from the Vercel web build so the main website does not break if Studio dependencies are not installed.

## Setup

Create `apps/studio/.env.local`:

```bash
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
```

## Run locally

From repo root:

```bash
npm run studio:dev
```

Or from this folder:

```bash
npm install
npm run dev
```

## Build Studio

```bash
npm run studio:build
```

## Deploy Studio

```bash
npm run studio:deploy
```

## Current web blog

The web routes `/blog` and `/blog/[slug]` currently use static content from `lib/blog-content.ts`.

After the pilot, the next step is to add a Sanity read client and replace the static content with Sanity queries.
