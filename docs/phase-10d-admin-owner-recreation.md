# Phase 10D — Admin / Owner recreation

Status: Implemented in GitHub.

## Goal

Recreate the hidden owner/admin dashboard so it uses real Supabase data instead of mock arrays and becomes useful for platform control.

## Files changed

- `app/admin-dashboard/page.tsx`
- `app/phase6.css`

## What changed

### 1. Real Supabase data

The admin dashboard now reads real data from:

- `profiles`
- `patients`
- `exercise_library`
- `plans`
- `exercise_logs`
- `ai_checks`
- `notification_logs`
- `subscriptions` through nested profile relationship

### 2. Real owner KPIs

Admin now sees:

- physiotherapist count
- active paid physiotherapists
- unpaid physiotherapists
- patient count
- active patients
- active plans
- clinical alert count
- pain alerts
- low AI score alerts
- estimated MRR from active paid physios

### 3. Real management views

Added/updated sections:

- Owner overview
- Clinical alerts
- Physiotherapist access/subscription table
- Default exercise library table
- Expanded exercise seed reminder
- Clinical program templates overview
- Recent notification logs
- Platform safety rules

### 4. Better UI

Added:

- sticky admin sidebar
- premium admin hero
- revenue orb/card
- real KPI cards
- alert cards
- responsive admin table wrappers
- program template grid
- mobile responsive admin layout

## Safety rules preserved

- Owner access remains restricted to `ADMIN_EMAIL` / `diellzarabushaj@gmail.com`.
- Clerk remains required for owner/admin when configured.
- Patient login remains username + code.
- Supabase service role stays server-side only.
- Billing remains 9.90 EUR/month.
- AI remains movement-quality feedback only.
- Pain 7/10 or higher remains stop/contact physiotherapist.

## Current admin routes

- `/admin-dashboard` — owner control center
- `/admin-billing` — manual subscription activation/suspension

## Next steps

### Phase 10E — Clinic launch SOP docs

Create practical launch docs:

- Physiotherapist onboarding guide
- Patient instruction guide
- Admin billing SOP
- AI safety SOP
- Launch checklist
- Support FAQ

### Optional hardening later

- Add real owner actions for default exercise creation/editing.
- Add profile status suspend/activate action.
- Add patient archive action.
- Add export CSV/PDF for admin usage.
