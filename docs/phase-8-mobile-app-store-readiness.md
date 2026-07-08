# Phase 8 — Mobile app assets + App Store / Play Store readiness

Status: Implemented in GitHub.

## Goal

Prepare the Expo mobile patient app for App Store / Play Store readiness by adding source assets, an asset generation workflow, Expo config wiring, and a submission checklist.

## Files changed

- `apps/mobile-app/app.json`
- `apps/mobile-app/package.json`
- `apps/mobile-app/README.md`
- `apps/mobile-app/assets/README.md`
- `apps/mobile-app/assets/source/app-icon.svg`
- `apps/mobile-app/assets/source/adaptive-icon-foreground.svg`
- `apps/mobile-app/assets/source/splash.svg`
- `apps/mobile-app/scripts/generate-assets.mjs`
- `apps/mobile-app/submission-checklist.md`

## What changed

### Assets

Added editable SVG source assets for:

- App icon
- Android adaptive icon foreground
- Splash screen

Added generator script:

```bash
npm run generate:assets
```

The script generates:

- `assets/generated/app-icon.png`
- `assets/generated/adaptive-icon-foreground.png`
- `assets/generated/splash.png`

### Expo config

`app.json` now references the generated PNG assets:

- `icon`
- `splash.image`
- `android.adaptiveIcon.foregroundImage`

### Build scripts

Updated build scripts so assets generate before EAS build:

```bash
npm run build:preview
npm run build:ios
npm run build:android
```

### Store checklist

Added `submission-checklist.md` with:

- technical setup
- asset generation steps
- screenshot checklist
- store listing readiness
- reviewer notes
- demo patient requirement
- privacy answers
- build and submit commands

## Important note

GitHub text API can commit the SVG source files and the generation script. The actual generated PNG files must be created locally or in Replit/CI by running:

```bash
cd apps/mobile-app
npm install
npm run generate:assets
```

This is required before EAS mobile builds.

## Rules preserved

- No secret keys were added.
- Supabase service role key is still not used in mobile app.
- Mobile app uses only public/publishable Supabase env variables.
- AI disclaimer remains movement-quality feedback only.
- AI does not diagnose or replace the physiotherapist.

## Next phase

Phase 9 should focus on final real-user QA:

1. Create one production demo patient.
2. Add AI-enabled exercise to that patient.
3. Test patient login on mobile and web.
4. Generate screenshots for App Store / Play Store.
5. Run EAS preview build.
