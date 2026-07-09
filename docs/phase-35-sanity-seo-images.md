# Phase 35 — Sanity SEO and article images

## Goal

Extend the Sanity blog integration with SEO fields and optional article images while preserving the existing live blog behavior.

## Files updated

- `apps/studio/schemaTypes/post.ts`
- `lib/sanity/queries.ts`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/globals.css`

## Sanity schema additions

Post documents now support:

- `mainImage`
- `mainImage.alt`
- `seo.title`
- `seo.description`
- `seo.keywords`
- `seo.image`
- `seo.image.alt`

## Web blog behavior

### `/blog`

- continues to read posts from Sanity
- shows `mainImage` on cards when present
- still works without images

### `/blog/[slug]`

- uses Sanity SEO title when present
- uses Sanity SEO description when present
- uses Sanity SEO keywords when present
- uses SEO image or main image for Open Graph / Twitter preview
- shows hero image when `mainImage` or `seo.image` exists
- still keeps the safety disclaimer visible

## Fallback behavior

If Sanity images or SEO fields are missing, the blog still works using:

- post title
- post description
- default `/app-icon.svg`
- static fallback data if Sanity is unavailable

## Editor instructions in Sanity Studio

For every blog post, fill:

1. Title
2. Slug
3. Description
4. Category
5. Author
6. Published at
7. Reading time
8. Hero text
9. Main image + alt text
10. Body
11. Safety reviewed
12. SEO title
13. SEO description
14. SEO keywords
15. SEO image + alt text

## Safety rule

For medical, exercise, pain, AI, diagnosis, or therapy content:

- keep `safetyReviewed = true` only after manual review
- do not claim diagnosis
- do not claim cure
- do not promise guaranteed results
- keep pain 7/10 stop rule visible

## Verification order

```bash
npm install
npm run preflight:routes
npm run build
vercel deploy --prod
npm run smoke:production
npm run smoke:sanity-blog
```

## Status

Ready for Vercel deployment.
