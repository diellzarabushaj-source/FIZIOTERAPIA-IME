# Phase 10E — Code-only patient access + QR

Status: Implemented in GitHub and unique index applied in Supabase.

## Goal

Make patient access as simple as possible:

- Patient enters only one code.
- No username is required from the patient.
- QR code can open the patient dashboard directly.
- One code belongs to one patient only.
- No two different patients can share the same code.

## Files changed

- `lib/supabase-admin.ts`
- `app/patient-portal/actions.ts`
- `app/patient-portal/page.tsx`
- `app/p/[code]/route.ts`
- `app/api/patient/access-qr/[code]/route.ts`
- `app/patient-access/[code]/page.tsx`
- `app/patient-dashboard/actions.ts`
- `app/ai-check/page.tsx`
- `app/api/patient/ai-check/route.ts`
- `app/phase-code-access.css`
- `app/layout.tsx`
- `package.json`
- `supabase/migrations/20260708190000_unique_patient_code_access.sql`

## What changed

### 1. Patient login is code-only

Patient Portal now asks only for:

```text
Kodi i pacientit
```

It no longer asks the patient for username.

### 2. One code = one patient

Updated code generation:

- generated code now uses 6 digits instead of 4
- `createUniquePatientCode()` checks Supabase before accepting a code
- if a generated code already exists, it tries again
- Supabase unique index prevents duplicate patient codes at database level

### 3. Supabase uniqueness protection

Applied in Supabase:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS patients_patient_code_unique_idx
ON public.patients (patient_code)
WHERE patient_code IS NOT NULL AND patient_code <> '';
```

This makes duplicate patient codes impossible.

### 4. QR access

Added direct patient access route:

```text
/p/[code]
```

Example:

```text
/p/ARB-123456
```

When patient scans QR, the route validates the code, sets secure patient cookies, and redirects to:

```text
/patient-dashboard
```

### 5. QR SVG endpoint

Added:

```text
/api/patient/access-qr/[code]
```

This returns an SVG QR code for the patient access link.

### 6. Printable patient access card

Added:

```text
/patient-access/[code]
```

This page displays:

- BrandMark
- QR code
- patient access code
- simple 3-step instruction
- clinical safety note

It can be printed or shared by the physiotherapist.

## Security rules preserved

- Patient still cannot create their own plan.
- Patient still only sees the plan assigned by physiotherapist.
- Patient session uses httpOnly cookies.
- Code is validated server-side with Supabase service role.
- AI remains movement-quality feedback only.
- Pain 7/10 or higher remains stop/contact physiotherapist.
- Plan exercise ownership validation remains active.

## Notes

Internally, `patient_username` can still exist in the database for backward compatibility, but the patient no longer needs to see it or enter it.

## Next step

Update the physiotherapist dashboard UI to show a clear button/card:

```text
Printo QR / Kod
```

beside each patient row, linking to:

```text
/patient-access/[patient_code]
```
