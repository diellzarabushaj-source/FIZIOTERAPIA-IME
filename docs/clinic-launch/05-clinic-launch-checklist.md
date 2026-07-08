# Clinic Launch Checklist

Status: Draft for clinic use.

## Purpose

This checklist prepares the clinic to launch Fizioterapia ime safely and practically.

## 1. Technical setup

- [ ] Production URL works.
- [ ] Supabase URL is set.
- [ ] Supabase service role key is set only in Vercel server env.
- [ ] Clerk keys are set.
- [ ] ADMIN_EMAIL is set.
- [ ] Resend API key is set if email notifications are needed.
- [ ] Patient code unique index exists in Supabase.
- [ ] Expanded exercise library seed is executed.
- [ ] Demo patient seed is executed if needed.
- [ ] Vercel deployment is READY.

## 2. Required URLs to test

- [ ] `/`
- [ ] `/patient-portal`
- [ ] `/p/[code]`
- [ ] `/patient-access/[code]`
- [ ] `/patient-dashboard`
- [ ] `/ai-check`
- [ ] `/physiotherapist-portal`
- [ ] `/admin-dashboard`
- [ ] `/admin-billing`
- [ ] `/reports/[patientId]`
- [ ] `/privacy`
- [ ] `/terms`
- [ ] `/medical-disclaimer`
- [ ] `/camera-consent`
- [ ] `/data-deletion`
- [ ] `/faq`

## 3. Admin setup

- [ ] Owner signs in with admin email.
- [ ] `/admin-dashboard` opens.
- [ ] `/admin-billing` opens.
- [ ] Admin sees real Supabase data.
- [ ] Admin can activate physiotherapist subscription.
- [ ] Admin can suspend physiotherapist subscription.
- [ ] MRR calculation looks correct.
- [ ] Notification logs are visible.

## 4. Physiotherapist setup

For each physiotherapist:

- [ ] Create or confirm profile.
- [ ] Confirm correct email.
- [ ] Activate subscription.
- [ ] Confirm access active.
- [ ] Explain code-only patient access.
- [ ] Explain QR card.
- [ ] Explain plan templates.
- [ ] Explain pain score rule.
- [ ] Explain AI safety rule.
- [ ] Explain reports.

## 5. Exercise library setup

- [ ] Run expanded exercise library seed.
- [ ] Confirm default exercises exist.
- [ ] Confirm AI-enabled exercises are marked correctly.
- [ ] Confirm private exercise creation works.
- [ ] Confirm normal physio cannot see another physio’s private exercises.

## 6. Patient workflow test

Create one test patient.

- [ ] Physiotherapist creates patient.
- [ ] System generates unique code.
- [ ] System creates plan.
- [ ] System inserts exercises.
- [ ] Open `/patient-access/[code]`.
- [ ] QR appears.
- [ ] Open `/p/[code]`.
- [ ] Patient dashboard opens.
- [ ] Patient completes an exercise.
- [ ] Patient enters pain score under 7.
- [ ] Patient enters pain score 7 or more.
- [ ] Warning appears.
- [ ] Notification is logged/sent if configured.

## 7. AI Movement Check test

- [ ] Patient has AI-enabled exercise.
- [ ] Open `/ai-check?planExerciseId=...`.
- [ ] Camera permission works.
- [ ] AI model loads.
- [ ] Analyze movement works.
- [ ] Save to Supabase works.
- [ ] AI score appears on dashboard.
- [ ] Low AI score notification flow works.

## 8. Report test

- [ ] Open patient report from physiotherapist portal.
- [ ] Check patient data.
- [ ] Check plan data.
- [ ] Check pain logs.
- [ ] Check AI checks.
- [ ] Print/save PDF.

## 9. Staff training

Train staff on:

- patient code-only login
- QR card printing
- subscription status
- creating patient
- selecting plan template
- adding exercises manually
- reading pain alerts
- reading AI alerts
- printing reports
- contacting patient for red flags

## 10. Patient communication

Prepare message template:

```text
Përshëndetje. Ky është kodi juaj personal për Fizioterapia ime: [KODI].
Mund të hyni duke skanuar QR code ose duke shkruar kodin te Patient Portal.
Nëse dhimbja është 7/10 ose më shumë, ndaloni ushtrimin dhe kontaktoni fizioterapeutin.
AI Movement Check është vetëm feedback për lëvizje dhe nuk e zëvendëson fizioterapeutin.
```

## 11. Legal/privacy readiness

- [ ] Privacy page reviewed.
- [ ] Terms page reviewed.
- [ ] Medical disclaimer reviewed.
- [ ] Camera consent page reviewed.
- [ ] Data deletion page reviewed.
- [ ] Clinic decides final legal wording.

## 12. Go-live decision

Go live only when:

- [ ] owner/admin flow works
- [ ] physio flow works
- [ ] patient code-only flow works
- [ ] QR flow works
- [ ] high pain warning works
- [ ] AI route works
- [ ] report works
- [ ] staff knows SOPs
- [ ] no critical production errors in Vercel logs

## First week after launch

Daily checks:

- [ ] high pain alerts
- [ ] low AI alerts
- [ ] failed notifications
- [ ] new patient login issues
- [ ] physiotherapist access issues
- [ ] patient feedback
- [ ] any Vercel runtime errors
