# Codex Setup Guide — Fizioterapia ime

Status: Ready for user setup.

## Goal

Connect Codex with the GitHub repository so Codex can help continue development safely.

Repository:

```text
diellzarabushaj-source/FIZIOTERAPIA-IME
```

Production:

```text
https://fizioterapia-ime.vercel.app
```

## What was prepared

The repository now has:

```text
AGENTS.md
```

This file tells Codex:

- project architecture
- important files
- safety rules
- patient code-only access rules
- AI safety rules
- Supabase rules
- billing rules
- build/test commands
- what to report after each task

## How to connect Codex

### Step 1 — Open Codex

Open:

```text
https://chatgpt.com/codex/
```

### Step 2 — Connect GitHub

In Codex:

1. Choose GitHub connection.
2. Authorize GitHub if asked.
3. Select account/organization:

```text
diellzarabushaj-source
```

4. Select repository:

```text
FIZIOTERAPIA-IME
```

### Step 3 — Give Codex the first task

Use this prompt:

```text
Open repository diellzarabushaj-source/FIZIOTERAPIA-IME.
Read AGENTS.md first.
Then run npm install and npm run build.
Fix only build/type errors.
Do not redesign the product.
Do not change patient code-only access.
Do not change billing price 29.90 EUR/month.
Do not expose secrets.
After finishing, report files changed, build status, routes checked, and remaining blockers.
```

### Step 4 — Review changes

Codex should return:

- files changed
- command output
- build result
- test result
- remaining blockers

Do not accept large unrelated rewrites.

### Step 5 — Merge only after review

Before merging Codex changes:

- check diff
- make sure no secrets are added
- make sure code-only patient access remains
- make sure AI safety text remains
- make sure Supabase service role stays server-only
- make sure Vercel build passes

## Best Codex tasks for this project

Use Codex for:

- fixing build errors
- TypeScript cleanup
- route smoke tests
- adding admin management actions
- improving demo seed
- making mobile screenshots workflow
- small UI fixes
- writing tests

Avoid giving Codex vague tasks like:

```text
Make everything better
```

Better:

```text
Fix only build errors in app/physiotherapist-portal/page.tsx and do not change UI design.
```

## Good next Codex task

```text
Read AGENTS.md. Then create a production smoke test script that checks these routes return 200: /, /patient-portal, /patient-access/ARB-123456, /api/patient/access-qr/ARB-123456, /privacy, /terms, /medical-disclaimer, /camera-consent, /data-deletion, /faq. Do not touch Supabase or auth logic. Run npm run build and report results.
```

## Safety reminder

Never paste these into Codex or GitHub:

- Supabase service role key
- Clerk secret key
- Resend API key
- OpenAI API key
- Vercel tokens

Use environment variables only.
