# Pilot feedback public form boundary

`/pilot-feedback` is intentionally public so invited pilot testers can submit product/workflow feedback.

## Public route rule

The form page may be public, but it must not link to internal owner/operator pages.

Allowed public navigation:

- `/`
- `/support`
- `/faq`

Internal routes such as `/pilot-onboarding`, `/qa-checklist`, `/pilot-readiness`, `/admin-feedback`, and `/pilot-decision` must remain protected.

## Input validation

Public form input must be bounded before saving:

- rating values: integer `1–5`
- respondent name: max 120 characters
- email: max 160 characters and basic email shape
- clinic name: max 160 characters
- open feedback fields: max 1200–1600 characters depending on field
- role: restricted to allowed enum values
- would-use answer: restricted to allowed enum values

## Safety rule

The form is not a medical document. It should remind users not to submit patient-sensitive details, diagnoses, or identifiable health information.
