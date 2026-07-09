# Fizioterapia Ime Design System

Phase 1 centralizes the visual foundation. Phase 2 starts migrating the public homepage into the premium app-first direction.

## Files

- `app/design-system.css` — shared brand tokens, layout helpers, cards, buttons, inputs, badges, alerts, statuses and table primitives.
- `app/layout.tsx` — imports the design system globally after `globals.css`.
- `app/page.tsx` — homepage migrated to a simpler app-first premium story.
- `app/home-refresh.css` — homepage-specific premium layout using the shared tokens.

## Brand direction

Fizioterapia Ime should feel:

- clean and medical
- calm, trustworthy and premium
- simple enough for older patients
- professional enough for physiotherapists and clinic owners
- app-first, not just clinic-brand-first

## Core tokens

Use these instead of creating new one-off colors:

- Primary teal: `--fi-primary`
- Primary strong: `--fi-primary-strong`
- Secondary green: `--fi-secondary`
- Ink: `--fi-ink`
- Body text: `--fi-muted`
- Border: `--fi-line-soft`
- Surface: `--fi-surface`
- Soft background: `--fi-surface-soft`

## Shared classes

### Layout

- `.fi-container`
- `.fi-container-wide`
- `.fi-section`
- `.fi-grid-2`
- `.fi-grid-3`
- `.fi-grid-4`
- `.fi-stack`
- `.fi-cluster`

### Typography

- `.fi-title-lg`
- `.fi-title-md`
- `.fi-title-sm`
- `.fi-copy`
- `.fi-section-head`

### UI primitives

- `.fi-card`
- `.fi-panel`
- `.fi-glass-card`
- `.fi-stat-card`
- `.fi-button`
- `.fi-button secondary`
- `.fi-input`
- `.fi-textarea`
- `.fi-label`
- `.fi-badge`
- `.fi-alert`
- `.fi-status`
- `.fi-table-wrap`
- `.fi-table`

## Compatibility layer

The design system also improves existing classes such as:

- `.button`
- `.auth-button`
- `.input`
- `.label`
- `.badge`
- `.mini-badge`
- `.role-warning`
- `.generated-box`
- `.clinic-outline-button`
- `.clinic-table-action`

This allows current pages to benefit from the design foundation while future phases migrate markup to explicit `fi-*` classes.

## Homepage premium pass

The homepage now follows a simpler app-first story:

1. Hero explains the product in one message: home rehabilitation guided by the physiotherapist.
2. Primary CTA: start as physiotherapist.
3. Secondary CTA: view patient app.
4. Product visual shows patient app plus a clinical dashboard signal card.
5. Workflow is reduced to three clinical steps.
6. Safety section states that AI gives feedback only and does not make clinical decisions.
7. Pricing remains visible and simple.

## Next migration order

1. Patient portal: simplify login screen and use `fi-panel`, `fi-input`, `fi-button`.
2. Physio dashboard: convert stat cards, alert banners and tables to shared primitives.
3. Admin dashboard: convert owner metrics and lists to shared primitives.
4. Mobile app: mirror the same token values in React Native styles.

## Rules

- Do not add new colors unless they become formal tokens.
- Avoid emoji icons in production UI; use text-safe symbols only temporarily.
- Prefer fewer shadows and more whitespace.
- Buttons should have one clear primary action per screen.
- Patient screens must use larger text and fewer choices.
- AI copy must always say feedback only, not diagnosis or therapy decision.
