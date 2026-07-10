# Fizioterapia Ime — Frontend Page Redesign Plan

## Goal
Create one coherent public website and product experience with consistent navigation, spacing, typography, components, responsive behavior, and clear conversion paths.

## Global design system first

Before polishing individual pages:
- shared public header and footer;
- shared page shell and background rules;
- shared hero, section header, card, CTA, form, FAQ, alert and trust components;
- consistent typography scale, spacing and button hierarchy;
- mobile/tablet breakpoints;
- accessibility: labels, contrast, focus states and keyboard navigation;
- no public marketing chrome inside patient, physiotherapist or admin dashboards.

## Page order

### Phase 1 — Conversion and product understanding
1. Home
2. How it works in the clinic
3. For patients
4. For physiotherapists
5. Pricing
6. Knowledge Center / Blog
7. Blog article

### Phase 2 — Trust and support
8. Support center
9. Contact
10. FAQ
11. About / Why Fizioterapia Ime
12. Clinical safety and AI policy

### Phase 3 — Legal
13. Privacy policy
14. Terms of service
15. Medical disclaimer
16. Cookie policy
17. Data deletion / account removal

### Phase 4 — Authentication and onboarding
18. Sign in
19. Create account
20. Physiotherapist onboarding
21. Patient code entry
22. Empty, loading, error and success states

### Phase 5 — Product surfaces
23. Physiotherapist dashboard
24. Patient dashboard
25. Plan builder
26. Exercise library
27. Reports and PDF views
28. Admin dashboard

## Standard for every public page

Each page must include:
- one clear purpose;
- one primary CTA;
- short patient-friendly or professional copy depending on audience;
- consistent navbar/footer;
- mobile-first layout;
- metadata and canonical URL;
- polished empty/error states;
- links that never lead to dead or internal-only routes;
- no placeholder text or launch-internal terminology.

## First page to implement

### How it works in the clinic

Route: `/how-it-works` or reuse the existing clinic workflow route if already present.

Sections:
1. Hero: from first patient to follow-up.
2. Five-step clinic workflow.
3. What the physiotherapist does vs what the platform automates.
4. Patient invitation by code/QR/link.
5. Exercise selection and approval.
6. Patient completion, pain feedback and alerts.
7. Progress review and plan adjustment.
8. Clinical safety rule: AI suggests, physiotherapist decides.
9. FAQ.
10. CTA: start as physiotherapist.

## Implementation rule

Work one page at a time directly in `main`:
1. inspect current route and dependencies;
2. redesign page without changing backend behavior;
3. verify mobile and desktop;
4. check build and route;
5. only then continue to the next page.
