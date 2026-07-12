# Phase 10E — Clinic launch SOP docs

Status: Implemented in GitHub.

## Goal

Create practical clinic-use documents so Fizioterapia ime can be introduced to real staff, physiotherapists and patients with clear operational rules.

## Folder created

```text
docs/clinic-launch/
```

## Files created

- `docs/clinic-launch/README.md`
- `docs/clinic-launch/01-physiotherapist-onboarding-guide.md`
- `docs/clinic-launch/02-patient-instruction-guide.md`
- `docs/clinic-launch/03-admin-billing-sop.md`
- `docs/clinic-launch/04-ai-safety-sop.md`
- `docs/clinic-launch/05-clinic-launch-checklist.md`
- `docs/clinic-launch/06-support-faq.md`

## What each document covers

### 1. Physiotherapist onboarding guide

Covers:

- sign in
- billing access
- creating patient
- code-only patient access
- QR card
- clinical templates
- plan builder
- exercise library
- progress monitoring
- reports

### 2. Patient instruction guide

Covers:

- patient enters only code
- QR scan
- dashboard use
- exercise completion
- pain score 0–10
- AI Movement Check explanation
- when to contact physiotherapist

### 3. Admin billing SOP

Covers:

- manual billing
- 9.90 EUR/month rule
- subscription activation
- suspension
- monthly billing checklist
- invoice/reference naming

### 4. AI safety SOP

Covers:

- AI is feedback only
- AI does not diagnose
- AI does not prescribe therapy
- pain 7/10 stop rule
- low AI score rule
- red flags
- camera/privacy notes
- incident workflow

### 5. Clinic launch checklist

Covers:

- technical setup
- URLs to test
- admin setup
- physiotherapist setup
- exercise library setup
- patient workflow test
- AI test
- report test
- staff training
- legal/privacy readiness
- go-live decision

### 6. Support FAQ

Covers:

- patient access issues
- QR issues
- physio access issues
- billing questions
- AI questions
- pain score questions
- report questions
- technical escalation
- safety escalation

## Safety rules preserved

- Patient enters only one code.
- QR code can open dashboard directly.
- One patient code belongs to one patient only.
- Patient does not create plan.
- Physiotherapist controls the plan.
- Physiotherapist access requires active 9.90 EUR/month subscription.
- AI does not diagnose.
- AI does not prescribe therapy.
- AI does not replace physiotherapist.
- Pain 7/10 or higher means stop and contact physiotherapist.
- Supabase service-role key is server-only.

## Next step

Phase 10F should focus on:

1. Adding `Printo QR / Kod` button inside `/physiotherapist-portal` patient table.
2. Running Vercel deploy check.
3. Testing code-only login + QR route in production.
4. Creating one real demo patient and testing full clinic workflow.
