# Patient QR API boundary

`/api/patient/access-qr/[code]` generates an SVG QR code for the patient access card.

## Access rule

This endpoint must not be public.

It is part of the internal physiotherapist print/QR workflow and should only be available to signed-in workspace users with one of these roles:

- `physio`
- `owner`
- `admin`

Anonymous users or non-clinical roles should receive `401 unauthorized`.

## Patient flow

Patients should not call the QR API directly.

Patients should receive a printed card or QR from their physiotherapist and use the patient portal/code flow.

## Why this matters

The QR API renders a QR that contains the patient access URL. Even though the patient code is required for login, the QR-generation endpoint is an internal helper for clinical staff and should not be exposed as a public utility.
