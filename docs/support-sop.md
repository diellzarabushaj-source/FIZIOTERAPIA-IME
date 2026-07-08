# Fizioterapia ime — Support SOP

This SOP is for the person supporting patients, physiotherapists, and clinic admin.

## Support principles

1. Keep patient safety first.
2. Never give medical diagnosis through support.
3. Never tell a patient to continue exercise if pain is high.
4. Never request secret keys in chat.
5. Never expose patient data publicly.
6. Escalate clinical questions to the physiotherapist.

## Common patient issues

### Patient cannot login

Checklist:

- Ask patient to confirm username exactly.
- Ask patient to confirm code exactly.
- Check for spaces before/after the code.
- Confirm patient status is active.
- Confirm the code belongs to that patient.

Safe response:

```text
Ju lutem kontrolloni username-in dhe kodin që ju ka dhënë fizioterapeuti. Nëse nuk funksionon, kontaktoni fizioterapeutin që ta verifikojë kodin.
```

### Patient does not see exercises

Checklist:

- Confirm patient has active plan.
- Confirm exercises are assigned to the plan.
- Confirm plan status is active.
- Ask patient to refresh or log in again.

### Camera does not open

Checklist:

- Confirm browser camera permission is allowed.
- Try Safari/Chrome latest version.
- Close other apps using camera.
- Refresh page.
- Use stable light and place phone farther away.

Safe response:

```text
AI Movement Check përdor kamerën vetëm për feedback të lëvizjes. Nëse kamera nuk hapet, lejoni camera permission në browser dhe provoni përsëri.
```

### Patient reports high pain

If pain is 7/10 or more:

```text
Ndalo ushtrimin dhe kontakto fizioterapeutin. Mos vazhdo ushtrimin derisa të marrësh udhëzim profesional.
```

Do not troubleshoot exercise technique when high pain is reported.

## Common physiotherapist issues

### Physiotherapist sees paywall

Checklist:

- Check `/admin-billing`.
- Confirm subscription status is active.
- Confirm current period end is in the future.
- Activate +1 month if payment is confirmed.

### Cannot create patient

Checklist:

- Confirm physiotherapist is signed in.
- Confirm profile exists.
- Confirm subscription is active.
- Confirm Supabase service key exists in Vercel.

### Private exercise not visible

Checklist:

- Confirm exercise was created by that physiotherapist.
- Confirm status is published.
- Owner/default exercises are visible to all; private exercises are visible only to owner physio.

## Admin issues

### Owner cannot access admin billing

Checklist:

- Confirm signed-in email is `diellzarabushaj@gmail.com`.
- Confirm Clerk user uses the correct email.
- Confirm admin route redirects non-owner users.

### Resend notifications not sent

Checklist:

- Confirm `RESEND_API_KEY` exists in Vercel.
- Confirm sender email is configured.
- Check `notification_logs` table.
- Check Vercel runtime logs.

## Escalation rules

Escalate to physiotherapist when:

- pain is high
- symptoms worsen
- patient has numbness/weakness
- patient feels unsafe
- AI score is low repeatedly
- patient is unsure how to perform an exercise

Escalate to technical admin when:

- login repeatedly fails
- dashboard has server error
- Supabase/Vercel keys are missing
- build/deploy fails
- AI model does not load on multiple devices

## What not to say

Avoid:

```text
AI says you are fine.
AI diagnosed your movement.
Continue even if it hurts.
You do not need a physiotherapist.
This app replaces therapy.
```

Use instead:

```text
AI gives movement-quality feedback only. For clinical decisions, follow your physiotherapist.
```
