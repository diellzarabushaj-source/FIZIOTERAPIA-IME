# Codex start prompt — Fizioterapia ime

Copy this into Codex when opening the repository.

```text
You are working in the GitHub repo `diellzarabushaj-source/FIZIOTERAPIA-IME`.

Goal: validate and fix the production web build for Fizioterapia ime after Phase 17.

Start by reading:
- AGENTS.md
- docs/codex-handoff.md
- docs/production-smoke-test.md
- docs/bug-fix-log.md

Then run:

npm install
npm run build

Fix only build/type/lint errors and route issues needed for production.

Do not change core product rules:
- Brand stays `Fizioterapia ime`.
- Price stays `29.90 EUR / muaj`.
- Billing remains manual/local-bank MVP; do not make Stripe required.
- Patient login stays username + code.
- Patients must not create their own plans.
- AI Movement Check gives feedback only.
- AI does not diagnose or replace the physiotherapist.
- Pain 7/10 or higher means stop and contact physiotherapist.
- Camera video is not stored.
- Do not expose secrets.

Priority P0:
1. Make `npm run build` pass.
2. Ensure latest route files compile:
   - /pilot-launch
   - /patient-handout
   - /pilot-feedback
   - /admin-feedback
   - /pilot-decision
   - /qa-checklist
3. Ensure footer links point to existing routes.
4. Ensure public routes do not return 404 after deploy.
5. Ensure `supabase/pilot-feedback-table.sql` matches fields used by feedback/admin pages.

Priority P1:
1. Check responsive layout for footer, pilot pages, patient handout.
2. Check admin-only route protection.
3. Check pilot feedback form submit flow after SQL execution.
4. Check admin feedback triage update flow.
5. Check pilot decision logic.

After fixing, report:
- build status
- files changed
- route smoke-test results
- remaining blockers
```
