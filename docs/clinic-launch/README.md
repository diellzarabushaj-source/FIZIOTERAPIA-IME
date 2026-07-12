# Fizioterapia ime — Clinic Launch SOP Pack

Status: Draft for clinic use.

This folder contains practical operating documents for launching and using Fizioterapia ime in a physiotherapy clinic.

## Documents

1. `01-physiotherapist-onboarding-guide.md`
   - How to onboard a physiotherapist.
   - Login, subscription, patient creation, code-only access, QR card, plan templates, reports.

2. `02-patient-instruction-guide.md`
   - Simple instructions for patients.
   - Code-only login, QR code, dashboard, exercises, pain score, AI Movement Check.

3. `03-admin-billing-sop.md`
   - Manual admin billing procedure.
   - 9.90 EUR/month subscription activation/suspension.

4. `04-ai-safety-sop.md`
   - Safety rules for AI Movement Check.
   - AI is movement-quality feedback only, not diagnosis.

5. `05-clinic-launch-checklist.md`
   - Step-by-step clinic launch checklist.
   - Technical, clinical, staff, patient, mobile and QA steps.

6. `06-support-faq.md`
   - Practical FAQ for staff, physiotherapists, patients and admin.

## Non-negotiable rules

- Patient enters only one code.
- QR code can open patient dashboard directly.
- One patient code belongs to one patient only.
- Patient does not create a plan.
- Physiotherapist creates and controls the plan.
- Physiotherapist/admin login uses Clerk.
- Patient login does not use Clerk.
- Physiotherapist access requires active 9.90 EUR/month subscription.
- AI Movement Check does not diagnose.
- AI Movement Check does not prescribe treatment.
- AI Movement Check does not replace the physiotherapist.
- Pain 7/10 or higher means stop and contact the physiotherapist.
- Supabase service-role key must never be used in browser or mobile app.

## Launch owner

Owner/admin email:

```text
diellzarabushaj@gmail.com
```

## Production URLs

```text
Homepage: https://fizioterapia-ime.vercel.app
Patient Portal: https://fizioterapia-ime.vercel.app/patient-portal
Physiotherapist Portal: https://fizioterapia-ime.vercel.app/physiotherapist-portal
Admin Dashboard: https://fizioterapia-ime.vercel.app/admin-dashboard
Admin Billing: https://fizioterapia-ime.vercel.app/admin-billing
```

## Important clinical wording

Use this wording consistently:

```text
AI Movement Check jep vetëm feedback për cilësinë e lëvizjes. Nuk vendos diagnozë, nuk cakton terapi dhe nuk e zëvendëson fizioterapeutin.
```

Use this safety rule consistently:

```text
Nëse dhimbja është 7/10 ose më shumë, ndalo ushtrimin dhe kontakto fizioterapeutin.
```
