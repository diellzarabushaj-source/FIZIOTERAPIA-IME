# Admin Billing SOP

Status: Draft for clinic use.

## Purpose

This SOP explains how admin manages physiotherapist access and monthly billing.

Current model:

```text
9.90 EUR / month per physiotherapist
```

Payment is manual for now. Later it can be connected to local bank or payment provider.

## Admin access

Only owner/admin should access:

```text
/admin-dashboard
/admin-billing
```

Default owner email:

```text
diellzarabushaj@gmail.com
```

## Billing rule

A physiotherapist can use the dashboard only when subscription is active.

Active physiotherapist can:

- create patients
- create private exercises
- create plans
- add exercises to plans
- view patient progress
- generate reports

Unpaid/blocked physiotherapist cannot:

- create patients
- create exercises
- create plans
- add exercises to plans

## Monthly activation workflow

### Step 1 — Confirm payment

Confirm that payment was received.

Possible payment references:

- bank transfer reference
- cash receipt number
- invoice number
- internal clinic reference

### Step 2 — Open admin billing

Open:

```text
/admin-billing
```

### Step 3 — Find physiotherapist

Find the row by:

- name
- email
- clinic

### Step 4 — Enter invoice reference

Example:

```text
FI-2026-07-001
```

### Step 5 — Activate +1 month

Click:

```text
+ 1 muaj
```

The app creates/updates subscription as active for one month.

### Step 6 — Confirm access

Ask physiotherapist to open:

```text
/physiotherapist-portal
```

They should see:

```text
Qasje aktive
```

## Suspension workflow

Use this if:

- payment expired
- physiotherapist should no longer access dashboard
- account is inactive
- clinic wants to stop access

Steps:

1. Open `/admin-billing`.
2. Find physiotherapist.
3. Click `Blloko`.
4. Confirm physiotherapist cannot create patients/plans.

## Monthly billing checklist

Run this once per month:

- [ ] Open `/admin-billing`.
- [ ] Check active subscriptions.
- [ ] Check expired subscriptions.
- [ ] Contact unpaid physiotherapists.
- [ ] Activate paid physiotherapists.
- [ ] Suspend unpaid physiotherapists if needed.
- [ ] Save invoice references.
- [ ] Review MRR in `/admin-dashboard`.

## Invoice/reference naming

Recommended format:

```text
FI-YYYY-MM-###
```

Example:

```text
FI-2026-07-001
FI-2026-07-002
FI-2026-08-001
```

## Important safety note

Billing status must never affect patient safety data.

If a physiotherapist is blocked:

- old patient data stays in database
- reports stay available to owner/admin
- patients should not be deleted automatically
- clinical safety alerts should remain visible to owner/admin

## Troubleshooting

### Physiotherapist paid but still blocked

Check:

- correct email in `profiles`
- active subscription exists
- current_period_end is in the future
- physiotherapist signed in with the same email

### Physiotherapist signed in with wrong email

Tell them to sign out and sign in with the correct email.

### Payment reference missing

Use temporary reference:

```text
manual-payment-[date]
```

Then update later if needed.

## Future improvement

Later this can be automated with:

- local bank payment confirmation
- Stripe or other provider
- invoice generation
- email payment reminders
- subscription expiration reminders
