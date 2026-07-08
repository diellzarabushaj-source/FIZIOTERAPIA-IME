# Mobile app assets

This folder contains source assets and generated PNG assets for App Store / Play Store builds.

## Source assets

Located in `assets/source`:

- `app-icon.svg`
- `adaptive-icon-foreground.svg`
- `splash.svg`

These are text-based SVG files and can be edited in Figma, Illustrator, or directly in code.

## Generated assets

The Expo config expects these generated PNG files:

- `assets/generated/app-icon.png` — 1024 × 1024
- `assets/generated/adaptive-icon-foreground.png` — 1024 × 1024
- `assets/generated/splash.png` — 1242 × 2688

Generate them before EAS build:

```bash
cd apps/mobile-app
npm install
npm run generate:assets
```

The build scripts already run asset generation first:

```bash
npm run build:preview
npm run build:ios
npm run build:android
```

## Important

Do not put secret keys in mobile assets or app config. The mobile app may only use public/publishable Supabase keys.
