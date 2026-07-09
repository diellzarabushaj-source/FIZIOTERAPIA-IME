# Phase 38 — Sanity FAQ + Legal & Safety content

## Goal

Make FAQ, Legal and Safety pages editable from the same Sanity Studio as the blog.

## Architecture decision

Use one Sanity project and one Studio:

```text
Fizioterapia ime Blog / Content Studio
```

Do not create separate Studios for Blog, FAQ, Terms and Safety yet.

Reason:

- one project is easier to manage
- one dataset is easier to query from Next.js
- one Studio is enough for one product/team
- content types can be separated by schema inside the same Studio
- less risk of wrong project IDs, duplicated tokens, and broken builds

Recommended structure:

```text
Post              = blog articles
Author            = blog authors
Category          = blog categories
FAQ Item          = FAQ content
Legal & Safety    = privacy, terms, medical disclaimer, camera consent, data deletion
```

## Sanity schemas added

- `apps/studio/schemaTypes/faqItem.ts`
- `apps/studio/schemaTypes/legalPage.ts`

Updated:

- `apps/studio/schemaTypes/index.ts`

## Website files added

- `lib/faq-content.ts`
- `lib/legal-content.ts`

## Website files updated

- `lib/sanity/queries.ts`
- `app/faq/page.tsx`
- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- `app/medical-disclaimer/page.tsx`
- `app/camera-consent/page.tsx`
- `app/data-deletion/page.tsx`
- `app/api/sanity/health/route.ts`
- `scripts/smoke-test-sanity-blog.mjs`

## Sanity documents seeded and published

FAQ:

```text
10 FAQ items
```

Legal & Safety:

```text
privacy
terms
medical-disclaimer
camera-consent
data-deletion
```

## Website behavior

### `/faq`

Reads FAQ items from Sanity when available.

If Sanity fails or no FAQ items exist, it uses fallback from:

```text
lib/faq-content.ts
```

### Legal & Safety pages

These routes now read from Sanity:

```text
/privacy
/terms
/medical-disclaimer
/camera-consent
/data-deletion
```

If Sanity fails or a page is missing, they use fallback from:

```text
lib/legal-content.ts
```

## Blog image status

Blog image support is already in place:

- `mainImage`
- `mainImage.alt`
- `seo.image`
- `seo.image.alt`

The website will show the image when it is uploaded and selected in Sanity Studio.

Until an image is uploaded, the blog still works without an image.

## Verification

Sanity health now checks:

- blog posts
- FAQ items
- legal/safety pages

Run:

```bash
npm run smoke:sanity-blog
```

This now tests:

- `/api/sanity/health`
- `/blog`
- one blog post
- `/faq`
- `/privacy`
- `/medical-disclaimer`

## Next step

Finish deploying Sanity Studio so the UI appears under:

```text
Sanity → Project → Studios
```

After Studio deploy succeeds, editors can update:

- Blog posts
- FAQ items
- Legal & Safety pages
- Blog images
- SEO fields
