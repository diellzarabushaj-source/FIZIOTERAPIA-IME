# Full audit remediation checklist

## Implemented in code

- AI check thresholds use the centralized, versioned clinical rules.
- Oversized AI feedback is rejected instead of silently truncated.
- Database failures are distinguished from forbidden exercise access.
- AI insert and notification failures use structured PHI-safe logging.
- CI has explicit `check:ci` and production readiness commands.
- Strict CSP violations are sent to a sanitized same-origin collector.
- Authorization and clinical-rule regression tests are present.

## Required production verification

These items cannot be honestly marked complete from repository code alone:

1. Run `npm run check:production` with production environment variables.
2. Run `npm run check:ci` in a runner with Playwright browsers installed.
3. Confirm `/api/readiness` returns HTTP 200 after all Supabase migrations.
4. Review CSP report events in production before enforcing the strict policy.
5. Test Clerk owner, admin and physiotherapist accounts against real Supabase profiles.
6. Verify patient A cannot access patient B data using synthetic staging records.
7. Review Supabase RLS policies directly in the deployed project.
8. Run VoiceOver/Safari and keyboard-only acceptance tests on real devices.
9. Perform a staging backup restore drill.
10. Confirm Vercel production deployment succeeds after account build limits are resolved.

## CSP enforcement gate

Do not remove `unsafe-inline` from the enforced policy until collected reports show that Next.js, Clerk, PostHog and Sentry work under the strict policy. After that, move CSP generation to request middleware with nonces and make the strict policy enforced.
