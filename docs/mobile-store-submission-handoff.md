# Mobile store submission handoff — Fizioterapia ime

Route:

- `/mobile-submission`

## App identity

- App name: `Fizioterapia ime`
- iOS bundle ID: `com.fizioterapiaime.patient`
- Android package: `com.fizioterapiaime.patient`
- Version: `1.0.0`
- iOS build number: `1`
- Android version code: `1`

## Commands

Generate assets:

```bash
cd apps/mobile-app
npm install
npm run generate:assets
```

Preview build:

```bash
npm run build:preview
```

iOS production build:

```bash
npm run build:ios
```

Android production build:

```bash
npm run build:android
```

Submit:

```bash
npm run submit:ios
npm run submit:android
```

## Required screenshots

- Login with patient code
- Patient plan overview
- Exercise detail
- AI Movement Check safety screen
- Pain score 0–10
- Progress / saved AI result

## Reviewer note

```text
Fizioterapia ime is a physiotherapy support app for patients who receive an exercise plan from their physiotherapist. The app does not diagnose, prescribe therapy, or replace a licensed physiotherapist. AI Movement Check only gives movement-quality feedback. If pain is 7/10 or higher, the patient is instructed to stop exercising and contact the physiotherapist.
```

## Demo access

Before submission:

- create a production demo patient
- add reviewer username + code
- add at least one AI-enabled exercise
- test login from a real phone
- include reviewer credentials in App Store / Play Store review notes

## Privacy answers

Key answers:

- Camera is used for movement feedback.
- Video is not stored in MVP.
- Patient plan/progress data is stored in Supabase.
- AI check stores score, feedback and alert type.
- The app is not for emergency use.

## Submission blockers

Do not submit if:

- demo login fails
- screenshots are missing
- privacy answers are incomplete
- safety text is unclear
- AI is described as diagnostic
- camera/video storage is unclear
- patient can create their own plan
