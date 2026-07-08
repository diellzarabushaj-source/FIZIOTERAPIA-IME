# Phase 10F — Physio QR / code button

Status: Implemented in GitHub.

## Goal

Make it easy for the physiotherapist to give the patient access immediately after creating the patient.

Patient access rule:

```text
Patient enters only one code or scans QR.
```

## Files changed

- `app/physiotherapist-portal/page.tsx`
- `app/phase3.css`
- `docs/phase-10f-physio-qr-code-button.md`

## What changed

### 1. Patient table now shows code-only access

Updated patient table columns:

- Patient
- Unique code
- QR / Code
- Diagnosis
- Plan
- Done
- Pain
- AI
- Report

### 2. Added QR button

Each patient row now has:

```text
Printo QR
```

This opens:

```text
/patient-access/[patient_code]
```

That page shows the QR code and patient access card.

### 3. Added test button

Each patient row now has:

```text
Testo
```

This opens:

```text
/p/[patient_code]
```

That route validates the code and redirects to the patient dashboard.

### 4. Updated copy

Physio dashboard now says:

- patient access is code-only
- patient receives unique code or QR
- one code belongs to one patient
- patient does not need username/password

### 5. Styling

Added `.patient-access-actions` to make the QR/action buttons clean in the patient table.

## Why this matters

The physiotherapist workflow is now simple:

1. Create patient.
2. System generates unique patient code.
3. Click `Printo QR`.
4. Give printed QR/code to patient.
5. Patient scans QR or enters code.
6. Patient opens dashboard.

## Safety preserved

- One code = one patient.
- Code is validated server-side.
- Patient cannot create plan.
- Patient only sees assigned plan.
- Physiotherapist controls the plan.
- Pain 7/10 rule remains visible.
- AI is feedback only.
