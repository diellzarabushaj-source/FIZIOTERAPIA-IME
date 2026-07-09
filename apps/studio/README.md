# Fizioterapia ime Sanity Studio

This Studio is a separate module for editing blog content.

It is intentionally excluded from the Vercel web build so the main website does not break if Studio dependencies are not installed.

## Setup

Create `apps/studio/.env.local`:

```bash
SANITY_STUDIO_PROJECT_ID=a3wcdlcy
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

The deploy script uses:

```bash
sanity deploy --yes --url fizioterapia-ime-blog --schema-required
```

Expected Studio URL:

```text
https://fizioterapia-ime-blog.sanity.studio
```

## GitHub Actions deploy

The workflow `.github/workflows/deploy-sanity-studio.yml` deploys this Studio automatically when `apps/studio/**` changes, and can also be run manually from GitHub Actions.

Required secret:

```text
SANITY_AUTH_TOKEN
```

## Current web blog

The web routes `/blog` and `/blog/[slug]` read published posts from Sanity and use static fallback if Sanity is unavailable.
