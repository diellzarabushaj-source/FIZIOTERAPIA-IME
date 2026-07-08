# Fizioterapia ime — Launch checklist

Use this checklist before giving the app to a real clinic, physiotherapist, or patient.

## 1. Production environment

- [ ] Vercel production deployment is READY.
- [ ] Production domain opens correctly.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set only in Vercel server environment.
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set.
- [ ] `CLERK_SECRET_KEY` is set.
- [ ] `ADMIN_EMAIL=diellzarabushaj@gmail.com` is set if used by deployment.
- [ ] No secret keys are committed to GitHub.

## 2. Supabase database

- [ ] Owner profile exists for `diellzarabushaj@gmail.com`.
- [ ] RLS is enabled on production tables.
- [ ] Default exercise library exists.
- [ ] At least one AI-enabled exercise exists.
- [ ] `subscriptions` table supports 29.90 EUR/month billing.
- [ ] `notification_logs` table exists.
- [ ] Demo patient seed was tested only with non-real data.

## 3. Clerk authentication

- [ ] Owner can sign in.
- [ ] Physiotherapist can sign in.
- [ ] Non-owner cannot access owner/admin-only pages.
- [ ] Patient does not use Clerk signup.
- [ ] Patient uses username + code only.

## 4. Billing

- [ ] Physiotherapist without active subscription sees paywall.
- [ ] Owner can activate +1 month in `/admin-billing`.
- [ ] Active subscription unlocks `/physiotherapist-portal`.
- [ ] Price shown as `29.90 EUR / month`.
- [ ] Manual/local-bank billing text is clear.

## 5. Physiotherapist workflow

- [ ] Create patient.
- [ ] Username + code are generated.
- [ ] Create private exercise.
- [ ] Add exercise to patient plan.
- [ ] Open patient report PDF.
- [ ] Confirm patient is visible only to assigned physiotherapist or owner/admin.

## 6. Patient workflow

- [ ] Patient logs in with username + code.
- [ ] Patient dashboard opens.
- [ ] Active plan is visible.
- [ ] Patient can mark exercise complete.
- [ ] Pain score 0–10 works.
- [ ] Pain 7/10 or higher triggers safety messaging/alert flow.

## 7. AI Movement Check

- [ ] Patient can open `/ai-check` after login.
- [ ] Browser asks for camera permission.
- [ ] Google MediaPipe model loads.
- [ ] Analyze movement button returns score.
- [ ] Score/feedback can be saved to Supabase.
- [ ] Low AI score triggers alert flow.
- [ ] Disclaimer says AI does not diagnose or replace physiotherapist.

## 8. Reports

- [ ] Report opens from physiotherapist dashboard.
- [ ] Report contains patient details, plan, adherence, pain, AI score.
- [ ] Print / Save PDF button works.
- [ ] Report does not expose other patients.

## 9. Legal/support pages

- [ ] Privacy policy exists.
- [ ] Terms exist.
- [ ] Medical disclaimer exists.
- [ ] Camera consent exists.
- [ ] Data deletion page exists.
- [ ] Support page exists.
- [ ] Legal text reviewed before public launch.

## 10. Mobile app

- [ ] `npm run generate:assets` runs successfully.
- [ ] PNG icon/splash assets are generated.
- [ ] Expo preview build works.
- [ ] Demo patient credentials work on mobile.
- [ ] App Store screenshots are captured.
- [ ] Play Store screenshots are captured.
- [ ] Reviewer notes include demo username + code.

## 11. Clinical safety

- [ ] App clearly says AI is movement-quality feedback only.
- [ ] App clearly says it does not diagnose.
- [ ] App clearly says it does not prescribe treatment.
- [ ] App clearly says it does not replace a licensed physiotherapist.
- [ ] Pain 7/10 rule is visible.
- [ ] Emergency symptoms are handled with stop/contact professional wording.

## 12. Go-live decision

Launch only after:

- [ ] A real physiotherapist tested the flow.
- [ ] A real test patient completed one demo plan.
- [ ] Legal/privacy text was reviewed.
- [ ] Camera/AI disclaimer was reviewed.
- [ ] Billing activation was tested.
- [ ] Reports were tested.
