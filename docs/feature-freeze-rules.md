# Feature freeze rules — Fizioterapia ime

Feature freeze is active after Phase 28.

## Allowed before first pilot

Only these changes are allowed:

- build fixes
- route fixes
- safety fixes
- bug fixes
- pilot feedback fixes
- documentation that supports testing or deployment

## Not allowed before first pilot

Do not add:

- new major routes
- new product modules
- new payment provider requirements
- new clinical claims
- AI diagnosis language
- camera video storage
- patient self-plan creation
- public launch claims

## Required checks before merge

```bash
npm run preflight:routes
npm run build
```

After production deployment:

```bash
npm run smoke:production
npm run smoke:report
```

## Locked rules

- Price stays 29.90 EUR/month.
- Billing remains manual/local-bank MVP.
- Patient login remains username + code.
- Patient cannot create own plan.
- AI is feedback only.
- AI does not diagnose.
- AI does not replace physiotherapist.
- Pain 7/10 or higher means stop and contact physiotherapist.
- Camera video is not stored.
- No secrets in GitHub.

## Pilot start condition

Start pilot only if:

- build passes
- production smoke test passes
- `/pilot-readiness` passes manual review
- no P0/P1 issue is open
- Supabase feedback SQL is applied
- demo patient flow works
