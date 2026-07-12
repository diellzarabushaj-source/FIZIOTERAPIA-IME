# Phase 1 — Brand foundation

Status: In progress and connected to code.

## Goal

Create a smooth, premium, Apple-inspired medical brand foundation for Fizioterapia ime.

The brand should feel:

- clean
- calm
- trustworthy
- modern
- medical but friendly
- simple for patients
- professional for physiotherapists

## Core identity

Name:
`Fizioterapia ime`

Tagline:
`Lëviz më mirë, jeto më mirë.`

Clinical promise:
AI supports movement feedback but never replaces the physiotherapist.

## Visual direction

- White and soft background
- Green + teal accents
- Rounded cards
- Gentle shadows
- Glass effect navigation
- Large typography
- Smooth transitions
- Minimal iconography

## Brand colors

- Primary Green: `#34C759`
- Teal: `#30B5A8`
- Dark Teal: `#168F86`
- Background: `#F7FAFC`
- Soft Background: `#F2F7F7`
- Mint: `#EAF8F1`
- Text: `#111111`
- Secondary Text: `#6E6E73`
- Border: `#E6EEF8`
- Warning: `#FF9500`
- Danger: `#FF3B30`

## Typography

Font stack:

`Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`

Rules:

- H1: large, bold, tight spacing
- H2: bold and clear
- Body: readable and calm
- Small text: muted gray
- Buttons: bold and simple

## Logo concept

The current brand mark is a smooth green/teal symbol inspired by:

- movement
- posture
- spine
- recovery
- human body alignment

Implementation:

- `components/BrandMark.tsx`
- `app/brand.css`

## Assets created

- `public/brand-mark.svg`
- `public/app-icon.svg`
- `public/splash.svg`

These SVG assets are used as scalable brand source files for web and handoff. For real App Store / Play Store submission, export PNG versions from Figma:

- `apps/mobile-app/assets/icon.png` — 1024 x 1024
- `apps/mobile-app/assets/splash.png`
- Android adaptive icon foreground/background PNG

## GitHub implementation

Added:

- `components/BrandMark.tsx`
- `app/brand.css`
- imported `brand.css` in `app/layout.tsx`
- connected SVG icons in Next metadata
- homepage uses the reusable BrandMark component
- FAQ page uses the reusable BrandMark component
- legal pages use the reusable BrandMark component
- patient portal uses the reusable BrandMark component
- patient dashboard uses the reusable BrandMark component
- admin dashboard uses the reusable BrandMark component
- admin billing uses the reusable BrandMark component
- admin dashboard pricing copy is aligned to `9.90 EUR / month`

## Figma implementation

Added page:

`01A — Phase 1 Brand Foundation`

It includes:

- logo concept
- color tokens
- typography
- spacing/radius
- shadows
- GitHub mapping

## Next steps in Phase 1

1. Replace remaining old `brand-logo` text blocks in secondary/demo pages with `BrandMark`.
2. Export real PNG app icon 1024 x 1024 from Figma.
3. Export real PNG splash screen from Figma.
4. Prepare Android adaptive icon assets.
5. Add final brand usage rules to README.
