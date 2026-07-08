# Fizioterapia ime — Figma to GitHub handoff

Figma file: https://www.figma.com/design/3o2V4zuS3NhceeH3FLyqRL

GitHub repo: `diellzarabushaj-source/FIZIOTERAPIA-IME`

Production: https://fizioterapia-ime.vercel.app

## Workflow

Figma is the visual source of truth. GitHub is the implementation source of truth.

1. Update the screen in Figma.
2. Find the matching route or component in GitHub.
3. Update code to match Figma.
4. Commit to `main`.
5. Vercel deploys production.
6. Compare live page with Figma and refine.

## Mapping

| Figma page | GitHub implementation |
|---|---|
| 00 Cover | README, marketing copy, app store assets |
| 01 Design System | `app/globals.css`, shared components |
| 02 Components | `components/` |
| 03 Patient Mobile | `apps/mobile-app/App.tsx` |
| 04 Physio Dashboard | `app/physiotherapist-portal/page.tsx` |
| 05 Admin Dashboard | `app/admin-dashboard/page.tsx`, `app/admin-billing/page.tsx` |
| 06 AI System | `app/ai-check/page.tsx`, `app/ai-check/MovementCheckClient.tsx` |
| 07 Reports | `app/reports/[patientId]/page.tsx` |
| 08 Billing | `lib/billing.ts`, `app/admin-billing/page.tsx` |
| 09 Legal | `app/privacy`, `app/terms`, `app/medical-disclaimer`, `app/camera-consent`, `app/data-deletion` |
| 10 App Store | `apps/mobile-app/app.json`, `apps/mobile-app/store-listing.md`, `apps/mobile-app/app-privacy.md` |

## Design tokens

- Green: `#34C759`
- Teal: `#30B5A8`
- Background: `#F7FAFC`
- Soft background: `#F2F7F7`
- White: `#FFFFFF`
- Text: `#111111`
- Secondary text: `#6E6E73`
- Border: `#E6EEF8`
- Warning: `#FF9500`
- Danger: `#FF3B30`
- Card radius: `24px`
- Button radius: `16px`

## Priority

1. Sync web design system in `app/globals.css`.
2. Sync physio and admin dashboard UI.
3. Sync patient mobile app UI in `apps/mobile-app/App.tsx`.
4. Add app icon, splash and screenshots.
5. Prepare App Store and Play Store submission.

## Billing rule

Physiotherapist access costs `29.90 EUR / month`.

MVP uses manual/local-bank payment. Admin activates access in `/admin-billing`.

## Clinical rule

AI Movement Check is movement-quality feedback only. It does not diagnose and does not replace the physiotherapist.
