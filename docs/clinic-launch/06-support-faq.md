# Support FAQ — Fizioterapia ime

Status: Draft for clinic use.

## General

### What is Fizioterapia ime?

Fizioterapia ime is a physiotherapy support platform where physiotherapists create exercise plans and patients follow them with a simple code or QR access.

### Who creates the plan?

Only the physiotherapist creates and controls the plan.

The patient cannot create or prescribe their own plan.

### Does the patient need an account?

No.

The patient enters only one code or scans a QR code.

### Can two patients have the same code?

No.

One code belongs to one patient only. The database has a unique index for `patient_code`.

## Patient access

### Patient says the code does not work.

Check:

- code is typed correctly
- code is active
- patient status is active
- patient was not archived/deactivated
- code belongs to the right patient

### Patient scanned QR but cannot enter.

Check:

- QR link is correct
- route is `/p/[code]`
- patient code exists
- patient status is active
- browser allows cookies

### Patient forgot the code.

Physiotherapist or admin opens patient row and gives the code again.

Do not give another patient’s code.

### Patient shared code with someone else.

Code should be treated as private access.

If clinic wants stricter security later, implement code reset/regeneration.

## Physiotherapist access

### Physiotherapist cannot create patient.

Check:

- signed in with correct email
- profile exists
- subscription is active
- subscription end date is in the future
- Clerk session is active

### Physiotherapist is unpaid.

Dashboard should block creation actions.

Admin must activate subscription at:

```text
/admin-billing
```

### Physiotherapist cannot see patient.

Normal physiotherapist can see only their assigned patients.

Owner/admin can see broader data.

This protects against IDOR/access mistakes.

## Billing

### What is the price?

```text
29.90 EUR / month per physiotherapist
```

### Is billing automatic?

Not yet.

Current billing is manual through admin.

### How is access activated?

Admin opens `/admin-billing`, enters invoice/reference, and clicks `+ 1 muaj`.

### How is access blocked?

Admin clicks `Blloko` in `/admin-billing`.

## AI Movement Check

### What does AI Movement Check do?

It gives feedback about movement quality.

It can help with visibility, control, symmetry and alignment.

### Does AI diagnose?

No.

AI does not diagnose, prescribe therapy or replace the physiotherapist.

### What does low AI score mean?

It means the movement quality or visibility may need attention.

Patient should slow down, review instructions and contact physiotherapist if unsure.

### What happens if AI score is under 60?

The app stores the AI check and can notify/log an alert for the physiotherapist.

## Pain score

### What if patient reports pain 7/10 or higher?

Patient must stop the exercise and contact the physiotherapist.

The physiotherapist should review the log and decide what to do next.

### Can patient continue if AI score is good but pain is high?

No.

Pain 7/10 or higher is stronger than AI score.

Stop and contact physiotherapist.

## Reports

### Where are reports?

Physiotherapist portal patient table has `PDF` link.

### What does the report include?

- patient data
- plan data
- adherence
- pain logs
- AI checks
- clinical summary

### How to save PDF?

Open report and use browser print/save as PDF.

## Admin

### Who is owner/admin?

Default owner email:

```text
diellzarabushaj@gmail.com
```

### What can admin see?

- physiotherapists
- subscriptions
- patients
- exercises
- plans
- pain alerts
- AI alerts
- notification logs
- MRR estimate

### Can admin manage default exercises?

Default exercise seed exists. Editing actions can be added later.

For now, default exercises can be inserted/updated through Supabase SQL seed.

## Technical

### Which env vars are required?

At minimum:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `ADMIN_EMAIL`

Optional:

- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### Can service role key be used in mobile app?

No.

Never put service role key in browser or mobile app.

### Where are patient sessions stored?

In httpOnly cookies after code validation.

### What route does QR use?

```text
/p/[code]
```

### What route shows printable QR card?

```text
/patient-access/[code]
```

## Support escalation

Escalate to admin/dev if:

- patient code duplicate error appears
- Supabase service key missing
- Clerk login broken
- Vercel deployment failed
- AI route returns server error
- report cannot load
- unauthorized user can see wrong patient data

## Safety escalation

Escalate clinically if:

- pain 7/10 or higher
- repeated low AI score
- dizziness
- numbness
- weakness
- swelling increases
- patient feels unsafe
- patient reports new severe symptoms
