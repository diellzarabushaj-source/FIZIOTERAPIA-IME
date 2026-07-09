# Sanity.io Studio integration plan — Fizioterapia ime

## Current status

Sanity Studio already exists as a separate module:

```text
apps/studio
```

The public website already has safe static blog routes:

```text
/blog
/blog/[slug]
```

The current public blog uses:

```text
lib/blog-content.ts
```

This keeps the Vercel web build stable during pilot-freeze.

## Goal

After pilot-freeze, connect `/blog` and `/blog/[slug]` to Sanity content so articles can be created and edited in Sanity Studio.

## Important rule

Do not make the main Vercel web build depend on Studio build.

Sanity Studio and the Next.js public website should stay separate:

```text
apps/studio          = content editing UI
app/blog             = public blog pages
lib/sanity           = read client for public website
```

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

## Phase 2 — Prepare public web read client

Add Sanity dependencies to the root web app only when ready:

```bash
npm install next-sanity @portabletext/react
```

Create:

```text
lib/sanity/client.ts
lib/sanity/queries.ts
components/PortableContent.tsx
```

Environment variables for Vercel/public web:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-07-09
```

If reading only published public content, do not use a token in the frontend.

If preview/drafts are needed later, add a server-only token:

```bash
SANITY_API_READ_TOKEN=
```

Do not expose `SANITY_API_READ_TOKEN` in client/mobile.

## Phase 3 — Connect `/blog`

Replace the static content source in:

```text
app/blog/page.tsx
```

Current:

```text
import { blogPosts } from "@/lib/blog-content";
```

Future:

```text
import { getBlogPosts } from "@/lib/sanity/queries";
```

The `/blog` page should show:

- title
- description
- category
- author
- published date
- reading time
- link to `/blog/[slug]`

## Phase 4 — Connect `/blog/[slug]`

Replace static post lookup in:

```text
app/blog/[slug]/page.tsx
```

Future behavior:

- fetch post by slug
- return `notFound()` if no post exists
- render Portable Text body
- preserve safety disclaimer block
- preserve AI feedback-only language

## Phase 5 — Add Sanity preview later

Preview is not required before pilot.

Only add preview later if content editors need draft preview before publish.

Future routes may be:

```text
/api/draft-mode/enable
/api/draft-mode/disable
```

Keep preview token server-side only.

## Phase 6 — Deployment

### Studio deploy

```bash
npm run studio:deploy
```

### Public web deploy

```bash
npm run preflight:routes
npm run build
vercel deploy --prod
npm run smoke:production
```

## Phase 7 — Content workflow

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

## Recommended order for this project

Because pilot-freeze is active, use this order:

1. Keep static blog routes active now.
2. Use Sanity Studio only as separate module.
3. Run pilot.
4. After pilot, connect web blog to Sanity queries.
5. Add preview only after public Sanity blog works.
6. Add SEO enhancements after content workflow is stable.

## Acceptance criteria

Sanity integration is complete when:

- `npm run studio:dev` works locally.
- `npm run studio:build` works.
- `/blog` loads posts from Sanity.
- `/blog/[slug]` loads one post from Sanity.
- Vercel web build passes.
- Studio is still excluded from normal Vercel web build.
- No secret token is exposed in frontend/mobile.
- Safety disclaimer remains visible on blog posts.
