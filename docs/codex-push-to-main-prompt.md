# Codex direct main push prompt — Fizioterapia ime

Use this only if you intentionally want Codex to commit/push directly to `main` instead of creating a pull request.

## Copy this into Codex

```text
Open repository `diellzarabushaj-source/FIZIOTERAPIA-IME` on branch `main`.

Important: I want the final fixed changes committed and pushed to `main` directly, not only shown as a diff and not only as a pull request.

Read first:
- AGENTS.md
- docs/codex-task-03-env-deploy-mobile-e2e.md
- docs/mobile-backend-integration.md
- docs/build-error-triage.md

Run:

npm install
npm run check:env
npm run preflight:routes
npm run build
npm run mobile:typecheck

Fix exact errors only. Do not add new features.

Preserve these locked rules:
- Brand: Fizioterapia ime
- Price: 9.90 EUR/month
- Billing: manual/local-bank MVP
- Patient login: code-only
- Patient does not use Clerk
- Patient cannot create own plan
- AI feedback only
- AI does not diagnose
- AI does not replace physiotherapist
- Pain 7/10 or higher means stop and contact physiotherapist
- Camera video is not stored
- Supabase service-role, Clerk secret, and Resend API key stay server-side only
- No secrets in GitHub, frontend, mobile app, logs or docs

When all checks pass:
1. Commit the changes.
2. Push the commit directly to `main`.
3. Report the commit SHA.
4. Report commands run.
5. Report files changed.
6. Report build/typecheck status.
7. Report any remaining blockers.

If you cannot push to `main` because of permissions or branch protection, tell me exactly what permission/setting blocks it and create a pull request instead.
```

## After Codex pushes to main

Run or ask Codex to run:

```bash
vercel deploy --prod
npm run smoke:production
npm run smoke:mobile-api
```

For real patient API test:

```bash
MOBILE_SMOKE_PATIENT_CODE=REAL-CODE npm run smoke:mobile-api
```

Do not commit real patient codes.

## If Codex says it cannot push

Most likely reasons:

- GitHub write access is missing.
- Main branch is protected.
- Codex was granted read-only access.
- GitHub requires PR review before main merge.
- Build/typecheck failed, so Codex stopped before commit.

In that case, change GitHub/Codex permissions or allow Codex to create a PR.
