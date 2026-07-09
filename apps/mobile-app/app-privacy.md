# App privacy answers - draft

These answers are a draft for App Store Connect / Google Play Data Safety. They must be reviewed before final submission.

## Data collected

### Contact info

- Name
- Phone number
- Email address for physiotherapist accounts, when applicable

Purpose: app functionality, account access, physiotherapist-patient communication, support.

### Health and fitness data

- Diagnosis/problem description added by physiotherapist
- Exercise plan
- Exercise completion logs
- Pain score 0-10
- AI Movement Check score and feedback

Purpose: app functionality, rehabilitation follow-up, patient progress, clinical communication.

### User content

- Patient comments
- Physiotherapist messages

Purpose: communication and app functionality.

### Device/camera data

- Camera access for movement check

Purpose: AI Movement Check. Video is used for movement-quality feedback and is not stored as video in the MVP. The app stores only score, feedback, alert type and optional pain score.

## Data linked to user

Yes. Patient exercise logs, pain scores, AI scores and messages are linked to the patient profile/code and physiotherapist account.

## Third parties / processors

- Supabase for database and authentication-related backend storage
- Vercel for web dashboard hosting
- Clerk for physiotherapist/admin web authentication
- Resend for email notifications
- Expo / EAS for mobile build and push notification infrastructure later

## Tracking

No advertising tracking is planned for MVP.

## Data deletion

Users can request deletion via:
https://fizioterapia-ime.vercel.app/data-deletion

## Safety statement

The app does not provide diagnosis or emergency services. AI Movement Check is movement-quality feedback only and does not replace a licensed physiotherapist or healthcare professional.

If pain reaches 7/10 or more, the user is instructed to stop the exercise and contact their physiotherapist before continuing.
