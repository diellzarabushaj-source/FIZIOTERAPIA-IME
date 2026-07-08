# FizioPlan Mobile App

Expo React Native patient app for FizioPlan / Fizioterapia Ime.

This folder contains the cleaned mobile prototype imported from the Replit `Patient-Helper` work and adapted as a standalone Expo app inside the main GitHub repository.

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

Use only the Supabase publishable/anon key.

## Clinical safety

The AI flow is only a movement-quality feedback placeholder. It does not replace the physiotherapist.
