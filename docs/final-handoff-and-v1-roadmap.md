# Final handoff and v1 roadmap — Fizioterapia ime

Route:

- `/final-handoff`

## Status after Phase 28

Feature-building for the pilot package is frozen.

From this point forward, only these changes should be made before the first pilot:

- build fixes
- route fixes
- safety fixes
- bug fixes
- pilot feedback fixes

No new product features should be added before the first controlled pilot.

## Final command order

```bash
npm run preflight:routes
npm run build
vercel deploy --prod
npm run smoke:production
npm run smoke:report
```

Then manually verify:

- `/pilot-readiness`
- `/pilot-runbook`
- `/pilot-communications`
- `/mobile-submission`
- `/pilot-feedback`
- `/admin-feedback`
- `/pilot-decision`

## Pilot package

Use these pages:

- `/pilot-readiness` — final readiness gate
- `/pilot-runbook` — 7-day operator plan
- `/pilot-communications` — WhatsApp/email scripts
- `/patient-handout` — patient instructions
- `/pilot-feedback` — physiotherapist feedback form
- `/admin-feedback` — feedback review and triage
- `/pilot-decision` — Go/Hold/No-go dashboard

## Mobile package

Use these:

- `/mobile-submission` — App Store / Play Store handoff
- `apps/mobile-app/submission-checklist.md`
- `apps/mobile-app/screenshot-plan.md`
- `apps/mobile-app/assets/README.md`

## v1 roadmap

### v1.0 Pilot

- 1 physiotherapist
- 1–3 patients
- 3–7 days
- manual billing
- feedback triage

### v1.1 Stability

- fix P0/P1 issues
- improve empty states
- tighten mobile responsiveness
- validate reports
- improve admin feedback triage

### v1.2 Clinic rollout

- 2–5 physiotherapists
- refined onboarding
- better notifications
- improved admin workflows
- validated patient flow

### v2.0 Scale

Only after real pilot data:

- payments
- richer exercise library
- stronger analytics
- broader mobile release
- clinic multi-user roles

## Locked product rules

- Price remains 29.90 EUR/month.
- Billing remains manual/local-bank MVP.
- Patient login remains username + code.
- Patient cannot create own plan.
- AI is feedback only.
- AI does not diagnose.
- AI does not replace physiotherapist.
- Pain 7/10 or higher means stop and contact physiotherapist.
- Camera video is not stored.
- No secrets in GitHub.

## Next action

Move to Codex and run:

```bash
npm install
npm run preflight:routes
npm run build
```

Fix exact build errors only. Then deploy and smoke test production.
