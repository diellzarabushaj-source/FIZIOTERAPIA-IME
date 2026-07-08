# Fizioterapia ime — App Store / Play Store submission checklist

## 1. Technical setup

- [x] App name: `Fizioterapia ime`
- [x] iOS bundle ID: `com.fizioterapiaime.patient`
- [x] Android package: `com.fizioterapiaime.patient`
- [x] Version: `1.0.0`
- [x] iOS build number: `1`
- [x] Android version code: `1`
- [x] Camera permission text added
- [x] Android camera permission added
- [x] Android notification permission added
- [x] EAS build profiles added
- [x] App icon source added
- [x] Splash source added
- [x] Asset generation script added

## 2. Assets to generate before build

Run:

```bash
cd apps/mobile-app
npm install
npm run generate:assets
```

Expected output:

- [ ] `assets/generated/app-icon.png`
- [ ] `assets/generated/adaptive-icon-foreground.png`
- [ ] `assets/generated/splash.png`

## 3. Store listing

- [x] App name prepared
- [x] Subtitle prepared
- [x] Full description prepared
- [x] Keywords prepared
- [x] Support URL prepared
- [x] Privacy URL prepared
- [x] Terms URL prepared
- [x] Camera consent URL prepared
- [x] Data deletion URL prepared
- [x] Clinical disclaimer prepared

## 4. Store screenshots needed

Required screenshot set:

- [ ] Login with patient code
- [ ] Patient plan overview
- [ ] Exercise detail
- [ ] AI Movement Check safety screen
- [ ] Pain score 0–10
- [ ] Progress / saved AI result

Recommended devices:

- [ ] iPhone 6.7 inch screenshot
- [ ] iPhone 6.5 inch screenshot
- [ ] Android phone screenshot

## 5. Reviewer notes

Use this note for App Store / Play Store review:

```text
Fizioterapia ime is a physiotherapy support app for patients who receive an exercise plan from their physiotherapist. The app does not diagnose, prescribe therapy, or replace a licensed physiotherapist. AI Movement Check only gives movement-quality feedback. If pain is 7/10 or higher, the patient is instructed to stop exercising and contact the physiotherapist.
```

## 6. Demo access

- [ ] Create a demo patient in production
- [ ] Add at least one AI-enabled exercise
- [ ] Add a reviewer username + code
- [ ] Put reviewer credentials in App Store / Play Store review notes

Current placeholder:

```text
Patient demo code: ARB-4821
```

## 7. Privacy answers

Before submission, complete app privacy questions using `app-privacy.md`.

Key points:

- Camera is used for movement feedback.
- Video is not stored in MVP.
- Patient plan/progress data is stored in Supabase.
- AI check stores score, feedback and alert type.
- The app is not for emergency use.

## 8. Build commands

Preview:

```bash
npm run build:preview
```

Production iOS:

```bash
npm run build:ios
```

Production Android:

```bash
npm run build:android
```

Submit:

```bash
npm run submit:ios
npm run submit:android
```
