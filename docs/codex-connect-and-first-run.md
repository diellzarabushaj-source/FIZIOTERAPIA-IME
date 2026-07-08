# Codex connect and first run — Fizioterapia ime

Use this when opening the repo in Codex for the first time.

## Repository

- `diellzarabushaj-source/FIZIOTERAPIA-IME`

## Goal

Connect Codex to GitHub, open the repo, run route preflight/build, and fix exact build errors only.

## Connect steps

1. Open Codex from ChatGPT or the Codex app.
2. Sign in with the same ChatGPT account.
3. Connect GitHub when Codex asks for repository access.
4. Select the GitHub account/organization that contains:
   - `diellzarabushaj-source`
5. Grant access to this repository only if possible:
   - `FIZIOTERAPIA-IME`
6. Open the repository in Codex.
7. Start a new Codex task.

## First Codex prompt

```text
Open repository `diellzarabushaj-source/FIZIOTERAPIA-IME`.

Read these files first:
- AGENTS.md
- docs/final-handoff-and-v1-roadmap.md
- docs/codex-handoff.md
- docs/production-smoke-test.md
- docs/build-error-triage.md

We are in feature freeze after Phase 28.
Do not add new features.
Only fix build, route, safety, or bug issues.

Run:

npm install
npm run preflight:routes
npm run build

If build fails, fix the exact failing files only.
Preserve these product rules:
- Price stays 29.90 EUR/month.
- Billing remains manual/local-bank MVP.
- Patient login stays username + code.
- Patient cannot create their own plan.
- AI is feedback only.
- AI does not diagnose.
- AI does not replace the physiotherapist.
- Pain 7/10 or higher means stop and contact physiotherapist.
- Camera video is not stored.
- Do not expose secrets.

After build passes, report:
- commands run
- files changed
- build status
- remaining blockers
```

## After build passes

Deploy latest commit to Vercel production:

```bash
vercel deploy --prod
```

Then run:

```bash
npm run smoke:production
npm run smoke:report
```

## If Codex asks for permission

Approve safe commands:

- `npm install`
- `npm run preflight:routes`
- `npm run build`
- `npm run smoke:production`
- `npm run smoke:report`

Do not approve commands that print secrets or upload `.env.local`.

## If Codex creates a PR

Review these before merge:

- no new feature scope
- no price change
- no AI diagnosis language
- no camera video storage
- no secrets committed
- route preflight passes
- build passes
