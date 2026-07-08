# FizioPlan implementation checklist

## 1. Clerk keys + auth

Status: Done for MVP.

- Clerk keys are expected in Vercel.
- Physiotherapist and admin routes are protected.
- Admin email: `diellzarabushaj@gmail.com`.
- Admin dashboard checks the signed-in email before showing owner content.

## 2. Supabase RLS + real data

Status: Foundation applied.

- RLS enabled on core public tables.
- Policies created for profiles, patients, exercise_library, plans, plan_exercises, exercise_logs, ai_checks, physio_messages, subscriptions and notifications.
- Added patient fields: patient_username, notes.
- Added exercise library fields: is_default, owner_physio_id, status.
- Added monthly billing fields to subscriptions.
- Seeded default owner profile for Dr. Diellza.
- Seeded starter exercise library: Glute bridge, Cat cow, Piriformis stretch, Pelvic tilt.

## 3. Physio dashboard functional

Status: First real-data version implemented.

- Reads real patients from Supabase.
- Creates patient from dashboard.
- Generates patient username + code.
- Creates active 14-day plan automatically.
- Selects exercises from default/private library.
- Saves plan_exercises.
- Displays logs, pain score, AI score and alerts.
- Adds private/default exercises.
- Links each patient to a printable PDF report.
- Locks access if subscription is not active.

## 4. Patient app with Supabase

Status: First real-data web version implemented.

- Login with patient_username + patient_code.
- Secure patient session using httpOnly cookies.
- Loads patient profile from Supabase.
- Loads active patient plan from Supabase.
- Loads assigned exercises from plan_exercises and exercise_library.
- Saves exercise completion to exercise_logs.
- Saves pain score to exercise_logs.
- Shows physiotherapist messages from physio_messages.
- Shows progress, latest pain and latest AI score.

## 5. AI Movement Check real

Status: First real camera version implemented.

- Added `/ai-check` route.
- Uses MediaPipe Pose Landmarker in the browser.
- Opens live camera with patient permission.
- Detects body landmarks.
- Calculates score 0-100 from visibility, posture stability, symmetry and alignment.
- Creates feedback in Albanian.
- Uses alert types: good, needs_attention, contact_physio.
- Saves score, feedback and alert type to Supabase `ai_checks`.

## 6. Subscriptions & Billing

Status: Manual/local-bank model implemented for MVP.

- Access price: 29.90 EUR per month for each physiotherapist.
- Stripe is not required now.
- Added `/admin-billing` owner page.
- Admin can activate +1 month manually after payment.
- Admin can suspend a subscription.
- Dashboard is locked for unpaid/suspended/expired physiotherapist accounts.
- Owner/admin access remains active.

## 7. Notifications

Status: Resend email alerts implemented.

- Added notification logs in Supabase.
- Added Resend email helper.
- Added clinical email templates.
- Sends email to physiotherapist when patient reports pain 7/10 or higher.
- Sends email to physiotherapist when AI score is below 60%.
- Saves notification status as sent, skipped or failed.

## 8. Reports PDF

Status: First print-ready PDF version implemented.

- Added `/reports/[patientId]` route for physiotherapists/admin.
- Report checks Clerk login and patient ownership.
- Loads patient profile, active plan, assigned exercises, pain logs and AI checks from Supabase.
- Shows adherence percentage, pain average, latest pain, average AI score and clinical summary.
- Shows exercise table, pain history and AI history.
- Adds print CSS and a `Shkarko / Printo PDF` button so the browser can save the report as PDF.
- Linked each patient row in the physio dashboard to its PDF report.

## 9. Legal pages

Status: First legal page drafts implemented.

- `/privacy`
- `/terms`
- `/medical-disclaimer`
- `/camera-consent`
- `/data-deletion`

Important: These are MVP drafts and must be reviewed by a legal/privacy professional before public launch.

## 10. App Store / Play Store

Status: First store-prep version implemented.

- Mobile app renamed to `Fizioterapia ime`.
- iOS bundle ID prepared: `com.fizioterapiaime.patient`.
- Android package prepared: `com.fizioterapiaime.patient`.
- Expo app config prepared for iOS/Android.
- Camera permission text added for AI Movement Check.
- EAS build configuration added in `apps/mobile-app/eas.json`.
- Build scripts added: preview, iOS, Android, submit.
- Store listing draft added in `apps/mobile-app/store-listing.md`.
- App privacy/data safety draft added in `apps/mobile-app/app-privacy.md`.

Still required before real submission:

- App icon 1024 × 1024 PNG.
- Android adaptive icon.
- Splash screen PNG.
- iPhone screenshots.
- Android screenshots.
- Apple Developer account.
- Google Play Developer account.
- Final legal/privacy review.
