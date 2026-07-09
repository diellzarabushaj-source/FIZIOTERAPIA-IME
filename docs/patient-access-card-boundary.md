# Patient access card boundary

`/patient-access/[code]` is an internal print/QR card route for the physiotherapist workspace.

It displays the patient code and QR card so the physiotherapist can print or hand it to the patient.

## Access rule

This route must require a signed-in physiotherapist workspace user.

Anonymous users should not render the card page.

## Patient flow

The patient should not use `/patient-access/[code]` as their app screen.

The patient should:

1. receive a QR card or code from the physiotherapist;
2. scan the QR or open the patient portal;
3. enter the patient code;
4. see only their assigned plan.

## Why this matters

The access card displays the patient code directly. Even though the patient code is required for login, the card itself is an internal clinical workflow page and should not be publicly exposed.
