# Phase 28 — Final archive, demo handoff, and v1 roadmap

## Goal
Close the feature-building phase for the Fizioterapia ime pilot package and create the final handoff page.

## New route

- `/final-handoff`

## Files added

- `app/final-handoff/page.tsx`
- `docs/final-handoff-and-v1-roadmap.md`
- `docs/phase-28-final-handoff-v1-roadmap.md`

## Files updated

- `components/SiteFooter.tsx`
- `scripts/verify-route-files.mjs`
- `scripts/smoke-test-production.mjs`

## Final handoff includes

- production validation checklist
- pilot handoff links
- mobile handoff links
- locked safety rules
- v1.0 / v1.1 / v1.2 / v2.0 roadmap
- final rule: no new features before pilot

## Feature freeze

After Phase 28, stop adding new features before the first pilot.

Allowed changes only:

- build fixes
- route fixes
- safety fixes
- bug fixes
- pilot feedback fixes

## Final command order

```bash
npm install
npm run preflight:routes
npm run build
vercel deploy --prod
npm run smoke:production
npm run smoke:report
```

## Locked product rules

- 29.90 EUR/month price.
- Manual/local-bank billing MVP.
- Patient login with username + code.
- Patient cannot create own plan.
- AI is feedback only.
- AI does not diagnose.
- AI does not replace physiotherapist.
- Pain 7/10 or higher means stop and contact physiotherapist.
- Camera video is not stored.
- No secrets in GitHub.

## Next workstream

Move into Codex:

1. run build
2. fix exact errors
3. deploy latest commit
4. run production smoke test
5. start first controlled pilot only if `/pilot-readiness` passes
