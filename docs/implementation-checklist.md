# FizioPlan implementation checklist

## 1. Clerk keys + auth

Status: Done for MVP.

- Clerk keys are expected in Vercel.
- Physiotherapist and admin routes are protected.
- Admin email: `diellzarabushaj@gmail.com`.
- Admin dashboard checks the signed-in email before showing owner content.

## 2. Supabase RLS + real data

Status: Foundation applied.

Applied in Supabase project `squgbcmzyaclafnioczq`:

- RLS enabled on core public tables.
- Policies created for:
  - profiles
  - patients
  - exercise_library
  - plans
  - plan_exercises
  - exercise_logs
  - ai_checks
  - physio_messages
  - subscriptions
- Added patient fields:
  - patient_username
  - notes
- Added exercise library fields:
  - is_default
  - owner_physio_id
  - status
- Added indexes for physiotherapist, patient, plan, logs, messages and subscriptions.
- Seeded default owner profile for Dr. Diellza.
- Seeded starter exercise library:
  - Glute bridge
  - Cat cow
  - Piriformis stretch
  - Pelvic tilt

Access model:

- Owner/admin can view and manage platform data.
- Physiotherapist can view and manage only their own patients, plans, exercises, logs and messages.
- Default exercises are visible to physiotherapists.
- Private exercises are visible only to the physiotherapist that created them.
- Patient app will use username + code flow and will be connected in the next implementation step.

## 3. Physio dashboard functional

Next.

Required:

- Read real patients from Supabase.
- Create patient form.
- Generate patient username + code.
- Create plan form.
- Select exercises from default/private library.
- Save plan_exercises.
- Display logs, pain score, AI score and alerts.

## 4. Patient app with Supabase

Required:

- Login with patient_username + patient_code.
- Load patient plan from Supabase.
- Save exercise completion.
- Save pain score.
- Save AI check result.
- Show physiotherapist messages.

## 5. AI Movement Check real

Required:

- MediaPipe Pose Landmarker.
- Per-exercise scoring rules.
- Score 0–100.
- Feedback only, no diagnosis.
- Store score, alert type and feedback.

## 6. Stripe subscriptions

Required:

- Provider plans.
- Checkout.
- Webhooks.
- Subscription status.
- Lock/unlock dashboard.

## 7. Notifications

Required:

- Patient reminders.
- Physio alerts for pain > 7.
- AI score alerts.
- Non-adherence alerts.

## 8. Reports PDF

Required:

- Patient progress PDF.
- Pain trend.
- Exercise adherence.
- AI summary.
- Physiotherapist note.

## 9. Legal pages

Required:

- Privacy Policy.
- Terms of Use.
- Medical disclaimer.
- Camera consent.
- Data deletion request.

## 10. App Store / Play Store

Required:

- App icon.
- Splash screen.
- EAS builds.
- TestFlight.
- Google Play internal testing.
