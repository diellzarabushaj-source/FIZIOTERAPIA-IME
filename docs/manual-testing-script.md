# Manual testing script — Fizioterapia ime

Use this script before inviting the first real physiotherapist or submitting a demo build for review.

## Test accounts

### Demo patient
- Username: `demo-patient-4821`
- Code: `ARB-4821`

### Admin
Use the configured owner/admin email in Clerk. Do not write secret keys or passwords in this document.

## 1. Public website test

Expected: all public routes load without 404/500.

- `/`
- `/support`
- `/clinic-use`
- `/launch-checklist`
- `/qa-checklist`
- `/faq`
- `/privacy`
- `/terms`
- `/medical-disclaimer`
- `/camera-consent`
- `/data-deletion`

Pass criteria:
- BrandMark is visible.
- Layout is responsive on iPhone width.
- Buttons and navigation do not overflow.
- Safety/disclaimer text is visible where relevant.

## 2. Patient portal test

Route: `/patient-portal`

Steps:
1. Enter demo username.
2. Enter demo code.
3. Submit login.
4. Confirm redirect to `/patient-dashboard`.

Pass criteria:
- Patient dashboard loads.
- Plan title is visible.
- Exercises are listed.
- Pain score component is visible.
- Messages/AI cards do not break layout.

## 3. Exercise completion test

Steps:
1. Open patient dashboard.
2. Mark one exercise as complete.
3. Refresh page.

Pass criteria:
- Completion state is saved or the page remains stable without errors.
- No private data from other patients is shown.

## 4. Pain score test

Steps:
1. Submit a normal pain score.
2. Submit a high pain score test value.

Pass criteria:
- Pain score is saved.
- High pain score keeps the warning behavior.
- App does not diagnose or give emergency treatment instructions.

## 5. AI Movement Check test

Route: `/ai-check`

Steps:
1. Login as demo patient.
2. Open `/ai-check`.
3. Allow camera permission.
4. Confirm Google MediaPipe model status is ready.
5. Run movement analysis.
6. Save result.

Pass criteria:
- Camera starts.
- Model loads.
- Score and feedback appear.
- Save action succeeds or gives a clear error.
- Video is not stored in MVP.
- Disclaimer is visible: AI gives feedback only, no diagnosis.

## 6. Physiotherapist dashboard test

Route: `/physiotherapist-portal`

Steps:
1. Login with a physiotherapist account.
2. Confirm access status.
3. Create a test patient.
4. Assign an exercise.
5. Open the report link.

Pass criteria:
- Patient creation succeeds.
- Username + code are generated.
- Plan and exercises are visible.
- PDF/report route opens.
- Physiotherapist only sees own patients unless admin.

## 7. Admin billing test

Route: `/admin-billing`

Steps:
1. Login as owner/admin.
2. Open admin billing.
3. Activate one physiotherapist for one month.
4. Suspend/block one test physiotherapist.

Pass criteria:
- Price remains 9.90 EUR/month.
- Subscription state updates correctly.
- Non-admin users cannot access admin-only actions.

## 8. Reports test

Route: `/reports/[patientId]`

Steps:
1. Open report from physio dashboard.
2. Use print/download PDF from browser.

Pass criteria:
- Report includes patient details, plan, exercises, pain logs and AI checks.
- Layout is print-ready.
- No unrelated patient data appears.

## 9. Production safety test

Check:
- Vercel deployment is READY.
- Runtime logs show no error/fatal issues.
- Supabase service role key is not exposed to client code.
- Clerk and Resend keys are stored only as env variables.
- No secret keys appear in README, docs, source code or browser output.

## Blockers

Do not invite a real user if any of these happen:

- Vercel build fails.
- Public pages return 404 or 500 after deployment.
- Patient login fails.
- AI check crashes after camera permission.
- Admin billing updates the wrong physiotherapist.
- Private keys are visible in client code or logs.
- One patient can see another patient’s data.

## Sign-off

- Tested by:
- Date:
- Device:
- Browser:
- Result: Pass / Fail
- Notes:
