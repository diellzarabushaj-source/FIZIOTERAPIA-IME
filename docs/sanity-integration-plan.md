# Sanity.io Studio integration plan — Fizioterapia ime

## Current status

Sanity Studio exists as a separate module:

```text
apps/studio
```

The public website has connected blog routes:

```text
/blog
/blog/[slug]
```

The public blog now uses Sanity queries when Sanity env vars are present, with static fallback when they are missing:

```text
lib/sanity/client.ts
lib/sanity/queries.ts
components/PortableContentRenderer.tsx
lib/blog-content.ts
```

This keeps the Vercel web build stable even if Sanity is not configured yet.

## Important rule

Do not make the main Vercel web build depend on Studio build.

Sanity Studio and the Next.js public website stay separate:

```text
apps/studio          = content editing UI
app/blog             = public blog pages
lib/sanity           = read client for public website
```

## What is already connected

- `next-sanity` added to root dependencies.
- `@portabletext/react` added to root dependencies.
- `/blog` uses `getBlogPosts()`.
- `/blog/[slug]` uses `getBlogPostBySlug()`.
- `/blog/[slug]` renders Sanity Portable Text body.
- If Sanity env vars are missing, `/blog` and `/blog/[slug]` fall back to `lib/blog-content.ts`.
- Safety disclaimer remains visible on blog posts.

## Phase 1 — Finish Studio setup

### 1. Create Sanity project

In Sanity dashboard, create a new project:

```text
Project name: Fizioterapia ime Blog
Dataset: production
```

Copy:

```text
projectId
dataset
```

### 2. Add Studio env

Create local file:

```text
apps/studio/.env.local
```

Example:

```bash
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
```

Never commit `.env.local`.

### 3. Run Studio locally

```bash
npm run studio:dev
```

Expected result:

```text
Sanity Studio opens locally.
Schemas visible: Post, Author, Category.
```

## Phase 2 — Add web/Vercel Sanity env vars

Add these in Vercel Project → Settings → Environment Variables:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-07-09
```

These are public read config values.

If reading only published public content, do not use a token in the frontend.

If preview/drafts are needed later, add a server-only token:

```bash
SANITY_API_READ_TOKEN=
```

Do not expose `SANITY_API_READ_TOKEN` in client/mobile.

## Phase 3 — Add first content in Studio

Create these in Studio:

1. Author: `Fizioterapia ime`
2. Category: `Pacientë`
3. Category: `AI & Siguri`
4. Category: `Pilot`
5. First Post with slug:

```text
si-funksionon-plani-digjital-i-fizioterapise
```

For medical/AI posts, set:

```text
safetyReviewed = true
```

## Phase 4 — Deploy and test

Run:

```bash
npm install
npm run check:env
npm run preflight:routes
npm run build
vercel deploy --prod
npm run smoke:production
```

Then open:

```text
/blog
/blog/si-funksionon-plani-digjital-i-fizioterapise
```

## Phase 5 — Preview later

Preview is not required before pilot.

Only add preview later if content editors need draft preview before publish.

Future routes may be:

```text
/api/draft-mode/enable
/api/draft-mode/disable
```

Keep preview token server-side only.

## Content workflow

1. Editor logs into Sanity Studio.
2. Creates Author.
3. Creates Category.
4. Creates Post.
5. Marks `safetyReviewed = true` before publishing medical/AI content.
6. Publishes post.
7. Website shows post at `/blog/[slug]`.

## Safety rules for all blog posts

Every post touching AI, rehab, pain, exercise, diagnosis or therapy must preserve these rules:

- AI gives feedback only.
- AI does not diagnose.
- AI does not replace physiotherapist.
- Pain 7/10 or higher means stop and contact physiotherapist.
- No emergency advice beyond contacting emergency services.
- No claim that the app cures conditions.
- No promise of guaranteed results.

## Acceptance criteria

Sanity integration is complete when:

- `npm run studio:dev` works locally.
- `npm run studio:build` works.
- `/blog` loads posts from Sanity when env vars are set.
- `/blog/[slug]` loads one post from Sanity when env vars are set.
- `/blog` still works with static fallback when env vars are missing.
- Vercel web build passes.
- Studio is still excluded from normal Vercel web build.
- No secret token is exposed in frontend/mobile.
- Safety disclaimer remains visible on blog posts.
