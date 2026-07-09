# Fizioterapia Ime Design System

Phase 1 centralizes the visual foundation. Phase 2 migrates the public homepage into the premium app-first direction. Phase 3 simplifies the patient login portal for older and non-technical patients.

## Files

- `app/design-system.css` — shared brand tokens, layout helpers, cards, buttons, inputs, badges, alerts, statuses and table primitives.
- `app/layout.tsx` — imports the design system globally after `globals.css`, plus page-specific refresh layers.
- `app/page.tsx` — homepage migrated to a simpler app-first premium story.
- `app/home-refresh.css` — homepage-specific premium layout using the shared tokens.
- `app/patient-portal/page.tsx` — simplified patient code-login flow.
- `app/patient-login-refresh.css` — patient-login-specific mobile-first styling.

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

## Patient portal simplification

The patient login flow now follows one main rule: one screen, one job.

1. The first visual priority is the code input.
2. The title is direct: “Hyr në planin tënd”.
3. The helper copy explains only that the code comes from the physiotherapist.
4. The form uses larger touch targets and a centered uppercase code field.
5. Error states use the shared `.fi-alert danger` style.
6. The preview area shows what the patient will see after login, without adding extra decisions.
7. Safety notes remain visible: no account needed, plan is created by the physiotherapist, pain 7/10+ means stop and contact the therapist.

## Next migration order

1. Physio dashboard: convert stat cards, alert banners and tables to shared primitives.
2. Admin dashboard: convert owner metrics and lists to shared primitives.
3. Mobile app: mirror the same token values in React Native styles.

## Rules

- Do not add new colors unless they become formal tokens.
- Avoid emoji icons in production UI; use text-safe symbols only temporarily.
- Prefer fewer shadows and more whitespace.
- Buttons should have one clear primary action per screen.
- Patient screens must use larger text and fewer choices.
- AI copy must always say feedback only, not diagnosis or therapy decision.
