# Local build and Vercel redeploy runbook

Use this before the first pilot and before continuing deeper changes in Codex.

## 1. Pull latest GitHub changes

```bash
git pull origin main
```

If the default branch is `master`, use:

```bash
git pull origin master
```

## 2. Install dependencies

```bash
npm install
```

## 3. Prepare local environment

Copy the example env file:

```bash
cp .env.example .env.local
```

Fill values locally. Never commit `.env.local`.

Required variable groups:

- Clerk
- Supabase
- Resend
- App URL

## 4. Build web app

```bash
npm run build
```

Fix every TypeScript/build error before continuing.

## 5. Deploy to Vercel

If Vercel Git integration is active, pushing to GitHub should trigger deployment automatically.

Manual CLI option:

```bash
vercel deploy --prod
```

Run from the repository root.

## 6. Smoke test production

After Vercel deployment is ready:

```bash
npm run smoke:production
```

For a preview URL:

```bash
SMOKE_BASE_URL="https://your-preview-url.vercel.app" npm run smoke:production
```

## 7. Critical routes that must return 200

- `/`
- `/support`
- `/clinic-use`
- `/launch-checklist`
- `/qa-checklist`
- `/pilot-onboarding`
- `/pilot-launch`
- `/patient-handout`
- `/pilot-feedback`
- `/patient-portal`
- `/privacy`
- `/terms`
- `/medical-disclaimer`
- `/camera-consent`
- `/data-deletion`

## 8. Protected routes expected behavior

These may redirect when not signed in:

- `/physiotherapist-portal`
- `/patient-dashboard`
- `/ai-check`
- `/admin-dashboard`
- `/admin-billing`
- `/admin-feedback`
- `/pilot-decision`

## 9. P0 blockers

Do not start pilot if:

- `npm run build` fails
- `/pilot-launch` returns 404 after deploy
- `/patient-handout` returns 404 after deploy
- `/patient-portal` fails to load
- `/pilot-feedback` cannot submit after SQL setup
- `/admin-feedback` cannot read feedback after SQL setup
- any secret appears in public code or browser output

## 10. Required SQL before pilot feedback

Run in Supabase SQL Editor:

- `supabase/pilot-feedback-table.sql`
- `supabase/seed-demo-patient.sql` if demo patient is needed
