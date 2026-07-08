# First pilot launch package — Fizioterapia ime

Use this package to run the first controlled pilot with one physiotherapist and one to three test patients.

## Pilot routes

- `/pilot-launch` — all-in-one launch package
- `/patient-handout` — printable patient handout
- `/pilot-onboarding` — pilot physiotherapist onboarding
- `/qa-checklist` — manual QA checklist
- `/pilot-feedback` — feedback form for pilot physiotherapist
- `/admin-feedback` — admin review and triage
- `/pilot-decision` — go/no-go decision summary

## Scope

Start with:

- 1 physiotherapist
- 1 to 3 patients
- 3 to 7 days
- controlled testing only
- no public launch

## Before sending the invitation

Complete:

1. Vercel deployment is READY.
2. `/qa-checklist` has no P0/P1 blocker.
3. `supabase/seed-demo-patient.sql` has been executed if demo patient is needed.
4. `supabase/pilot-feedback-table.sql` has been executed.
5. Physiotherapist account exists in Clerk.
6. Admin can activate billing from `/admin-billing`.
7. Patient handout is ready.

## Final WhatsApp invite

```text
Përshëndetje,

Po e hapim pilotin e parë të Fizioterapia ime.

Qëllimi është me testu:
- krijimin e pacientit,
- planin e ushtrimeve,
- pain score,
- AI Movement Check,
- raportin PDF.

Ky është testim i kontrolluar 3–7 ditë me 1–3 pacientë, jo lansim publik.

Pas testimit, të lutem plotëso feedback formën që me ditë çka duhet me rregullu para zgjerimit.
```

## Final email invite

```text
Subject: Pilot i parë — Fizioterapia ime

Përshëndetje,

Po e hapim pilotin e parë të Fizioterapia ime, një platformë digjitale për fizioterapeutë dhe pacientë.

Në këtë pilot do të testojmë:
- krijimin e pacientit,
- caktimin e planit të ushtrimeve,
- hyrjen e pacientit me username + kod,
- pain score,
- AI Movement Check si feedback ndihmës,
- raportin PDF për rikontroll/dokumentim.

Ky është pilot i kontrolluar 3–7 ditë me 1–3 pacientë testues. Nuk është lansim publik.

AI Movement Check nuk diagnostikon dhe nuk zëvendëson fizioterapeutin. Plani dhe vendimi klinik mbetet te fizioterapeuti.

Pas testimit, ju lutemi ta plotësoni feedback formën që të kuptojmë çka duhet përmirësuar para zgjerimit.

Me respekt,
Fizioterapia ime
```

## Physiotherapist test instructions

1. Login to `/physiotherapist-portal`.
2. Confirm active access.
3. Create one test patient.
4. Save username + code.
5. Assign 3–5 simple exercises.
6. Give patient `/patient-portal` and `/patient-handout`.
7. Check pain/adherence/AI results daily.
8. Open the report PDF.
9. Submit `/pilot-feedback` after 3–7 days.

## Patient safety instruction

Give the patient `/patient-handout`.

Key patient rule:

If pain is 7/10 or higher, stop the exercise and contact the physiotherapist.

AI Movement Check gives movement feedback only. It is not diagnosis and does not replace the physiotherapist.

## After the pilot

1. Review `/admin-feedback`.
2. Set priority and triage status.
3. Copy action items to `docs/bug-fix-log.md`.
4. Review `/pilot-decision`.
5. Expand only if decision says small pilot expansion.
