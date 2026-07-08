# Phase 1 — Brand foundation

Status: Started and connected to code.

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

## GitHub implementation

Added:

- `components/BrandMark.tsx`
- `app/brand.css`
- imported `brand.css` in `app/layout.tsx`
- homepage now uses the reusable BrandMark component
- legal pages now use the reusable BrandMark component

## Next steps in Phase 1

1. Add real SVG/logo asset export.
2. Create app icon PNG 1024x1024.
3. Create splash screen asset.
4. Replace all old `brand-logo` text blocks with `BrandMark`.
5. Add brand usage rules to Figma and README.
6. Prepare Android adaptive icon assets.
