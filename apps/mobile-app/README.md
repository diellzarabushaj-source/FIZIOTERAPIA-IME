# Fizioterapia ime Mobile App

Expo React Native patient app for Fizioterapia ime.

This folder contains the mobile patient app that shares the same Supabase backend with the web dashboard.

## Included flow

- Patient login with code `ARB-4821`
- 14-day physiotherapy plan overview
- Exercise cards and exercise detail screen
- AI Movement Check preparation screen
- Mock camera analysis with countdown
- AI result with score, feedback and clinical disclaimer
- Pain score 0-10 safety step
- Warning if pain score is 7 or higher
- Supabase save helper for `ai_checks` and `exercise_logs`

## Preview on phone with Expo Go

```bash
cd apps/mobile-app
npm install
npx expo start
```

Then install **Expo Go** on iPhone or Android and scan the QR code.

## Environment variables

Create `.env` from `.env.example`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://squgbcmzyaclafnioczq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_publishable_or_anon_key_here
```

Use only the Supabase publishable/anon key. Never put the Supabase service role key in the mobile app.

## App Store / Play Store preparation

The app is configured for EAS builds:

```bash
npm run build:preview
npm run build:ios
npm run build:android
```

Current app identifiers:

```text
App name: Fizioterapia ime
iOS bundle ID: com.fizioterapiaime.patient
Android package: com.fizioterapiaime.patient
```

Store drafts are included:

- `store-listing.md`
- `app-privacy.md`
- `eas.json`

Before submitting, add real PNG assets:

- App icon 1024 × 1024
- Android adaptive icon
- Splash screen
- iPhone screenshots
- Android screenshots

## Clinical safety

The AI flow is movement-quality feedback only. It does not diagnose, prescribe therapy, or replace the physiotherapist.
